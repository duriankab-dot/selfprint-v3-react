/**
 * Vercel API Function: /api/stripe
 *
 * § 31 Monetization — Stripe Integration
 *
 * Routes (via query param ?action=...):
 *   POST /api/stripe?action=create-checkout  → Stripe Checkout session
 *   POST /api/stripe?action=create-portal    → Stripe Billing Portal
 *   GET  /api/stripe?action=subscription     → Current subscription status
 *   POST /api/stripe?action=webhook          → Stripe webhook (update Supabase)
 *
 * Rules:
 * - userId ต้องมาจาก verifyUser() เท่านั้น — ห้าม trust client body
 * - Stripe client สร้างแบบ lazy (ไม่สร้างที่ module scope)
 * - Prices เป็น Stripe Price IDs — ตั้งใน env vars
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { verifyUser, supabaseAdmin } from './_utils/verify-user';

// ── Lazy Stripe client ────────────────────────────────────────────────────────
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

// ── Price ID helpers ──────────────────────────────────────────────────────────
/**
 * Map (tier, billingPeriod) → Stripe Price ID
 * ตั้งค่าใน Vercel env vars:
 *   STRIPE_PRICE_PLUS_MONTHLY   = price_xxxxx
 *   STRIPE_PRICE_PLUS_ANNUAL    = price_xxxxx
 *   STRIPE_PRICE_PRO_MONTHLY    = price_xxxxx
 *   STRIPE_PRICE_PRO_ANNUAL     = price_xxxxx
 *   STRIPE_PRICE_LIFETIME       = price_xxxxx
 */
function getPriceId(tier: string, billingPeriod: string): string {
  const key = (() => {
    if (tier === 'plus' && billingPeriod === 'monthly') return 'STRIPE_PRICE_PLUS_MONTHLY';
    if (tier === 'plus' && billingPeriod === 'annual')  return 'STRIPE_PRICE_PLUS_ANNUAL';
    if (tier === 'pro'  && billingPeriod === 'monthly') return 'STRIPE_PRICE_PRO_MONTHLY';
    if (tier === 'pro'  && billingPeriod === 'annual')  return 'STRIPE_PRICE_PRO_ANNUAL';
    if (tier === 'lifetime')                            return 'STRIPE_PRICE_LIFETIME';
    return null;
  })();

  if (!key) throw new Error(`Unknown tier/billingPeriod: ${tier}/${billingPeriod}`);

  const priceId = process.env[key];
  if (!priceId) throw new Error(`Env var ${key} is not set`);
  return priceId;
}

// ── CORS helper ───────────────────────────────────────────────────────────────
function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query['action'] as string;

  try {
    switch (action) {
      case 'create-checkout':
        return await handleCreateCheckout(req, res);
      case 'create-portal':
        return await handleCreatePortal(req, res);
      case 'subscription':
        return await handleGetSubscription(req, res);
      case 'webhook':
        return await handleWebhook(req, res);
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[api/stripe] ${action} error:`, msg);
    return res.status(500).json({ error: 'Internal server error', message: msg });
  }
}

// ── POST /api/stripe?action=create-checkout ───────────────────────────────────
async function handleCreateCheckout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // Verify user from JWT
  const user = await verifyUser(req.headers['authorization']);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { tier, billingPeriod = 'monthly', returnUrl } = req.body as {
    tier: string;
    billingPeriod?: string;
    returnUrl?: string;
  };

  if (!tier) return res.status(400).json({ error: 'tier is required' });

  const stripe = getStripe();
  const priceId = getPriceId(tier, billingPeriod);

  const origin = returnUrl
    ? new URL(returnUrl).origin
    : (process.env.FRONTEND_URL || 'https://selfprint.app');

  const mode: Stripe.Checkout.SessionCreateParams['mode'] =
    tier === 'lifetime' ? 'payment' : 'subscription';

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email,
    success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    metadata: {
      user_id: user.id,
      tier,
      billing_period: billingPeriod,
    },
    ...(mode === 'subscription'
      ? {
          subscription_data: {
            metadata: { user_id: user.id, tier },
          },
        }
      : {}),
  });

  return res.status(200).json({ sessionId: session.id, url: session.url });
}

// ── POST /api/stripe?action=create-portal ────────────────────────────────────
async function handleCreatePortal(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const user = await verifyUser(req.headers['authorization']);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const stripe = getStripe();
  const origin = process.env.FRONTEND_URL || 'https://selfprint.app';

  // Look up Stripe customer ID from Supabase
  const customerId = await getStripeCustomerId(user.id);
  if (!customerId) {
    return res.status(404).json({ error: 'No Stripe customer found for this user' });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/pricing`,
  });

  return res.status(200).json({ portalUrl: portalSession.url });
}

// ── GET /api/stripe?action=subscription ──────────────────────────────────────
async function handleGetSubscription(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const user = await verifyUser(req.headers['authorization']);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin not configured' });
  }

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('tier, status, expires_at, stripe_customer_id, stripe_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[api/stripe] subscription lookup error:', error.message);
    return res.status(500).json({ error: 'Database error' });
  }

  if (!data) {
    // No record = free tier
    return res.status(200).json({
      tier: 'free',
      status: 'active',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      expiresAt: null,
    });
  }

  return res.status(200).json({
    tier: data.tier,
    status: data.status,
    expiresAt: data.expires_at,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
  });
}

// ── POST /api/stripe?action=webhook ──────────────────────────────────────────
async function handleWebhook(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[api/stripe] STRIPE_WEBHOOK_SECRET not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const stripe = getStripe();
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    // Vercel v58+ doesn't support bodyParser config in vercel.json
    // Use raw body from buffer if available, fallback to stringified JSON
    let rawBody: string | Buffer;
    if ((req as any).rawBody) {
      rawBody = (req as any).rawBody;
    } else if ((req as any)._rawBody) {
      rawBody = (req as any)._rawBody;
    } else {
      // Fallback: reconstruct from parsed body (less secure but functional)
      rawBody = JSON.stringify(req.body);
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook signature error';
    console.error('[api/stripe] Webhook verification failed:', msg);
    return res.status(400).json({ error: `Webhook error: ${msg}` });
  }

  console.log(`[api/stripe] Webhook received: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await onCheckoutComplete(session);
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await onSubscriptionChange(sub);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await onPaymentFailed(invoice);
      break;
    }
    default:
      // Ignore other events
      break;
  }

  return res.status(200).json({ received: true });
}

// ── Webhook handlers ──────────────────────────────────────────────────────────

async function onCheckoutComplete(session: Stripe.Checkout.Session) {
  if (!supabaseAdmin) return;

  const userId = session.metadata?.user_id || session.client_reference_id;
  const tier = session.metadata?.tier;
  if (!userId || !tier) return;

  const isLifetime = tier === 'lifetime';

  await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: userId,
      tier,
      status: 'active',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: isLifetime ? null : (session.subscription as string),
      expires_at: isLifetime ? null : null, // will be set via subscription.updated
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  console.log(`[api/stripe] Upserted subscription: user=${userId} tier=${tier}`);
}

async function onSubscriptionChange(sub: Stripe.Subscription) {
  if (!supabaseAdmin) return;

  const userId = sub.metadata?.user_id;
  if (!userId) return;

  const tier = sub.metadata?.tier || 'free';
  const status = sub.status === 'active' ? 'active' : 'expired';
  const expiresAt = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

  await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: userId,
      tier: sub.status === 'active' ? tier : 'free',
      status,
      stripe_subscription_id: sub.id,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  console.log(`[api/stripe] Subscription ${sub.status}: user=${userId} tier=${tier}`);
}

async function onPaymentFailed(invoice: Stripe.Invoice) {
  if (!supabaseAdmin) return;

  // Mark subscription as pending/expired in our DB
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id;

  if (!customerId) return;

  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (data?.user_id) {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('user_id', data.user_id);

    console.log(`[api/stripe] Payment failed: user=${data.user_id}`);
  }
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function getStripeCustomerId(userId: string): Promise<string | null> {
  if (!supabaseAdmin) return null;

  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();

  return data?.stripe_customer_id ?? null;
}

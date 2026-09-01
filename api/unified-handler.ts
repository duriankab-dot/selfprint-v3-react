/**
 * Unified API Handler
 * Consolidates all API endpoints into a single Serverless Function
 * Routes based on module + action query params
 * @ts-nocheck Supabase types don't match schema—runtime works correctly
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { scheduleNotification } from '../src/services/PushScheduler.js';
import { scheduleDecisionFollowUps } from '../src/services/DecisionFollowUpNotifier.js';
import {
  trackNotificationSent,
  trackNotificationRead,
  trackDecisionOutcome,
} from '../src/services/NotificationAnalytics.js';
import Stripe from 'stripe';
import { verifyUser, getSupabaseAdmin, type VerifiedUser, type Env } from './_utils/verify-user.js';
import { rateLimitMiddleware, tooManyRequestsResponse } from './_utils/rate-limit.js';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// CF-PAGES-MIGRATION-001: anon-key client, used only by handleNotifications/
// handleTwinEvolution/handleSICE below. Previously imported from
// ../src/lib/supabase/client.ts (the shared frontend client, which reads
// import.meta.env / process.env — neither populated in the CF Functions
// runtime; see that file's own fix). Built locally here instead, from the
// real `env` object threaded through from functions/api/[[route]].ts, same
// pattern as getSupabaseAdmin in _utils/verify-user.ts.
let _supabaseAnon: SupabaseClient | null | undefined;
function getAnonSupabase(env: Env): SupabaseClient | null {
  if (_supabaseAnon !== undefined) return _supabaseAnon;
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  _supabaseAnon = url && key ? createClient(url, key) : null;
  return _supabaseAnon;
}

export async function handler(request: Request, env: Env): Promise<Response> {
  try {
    // Rate limiting — apply before any business logic
    const authHeader = request.headers.get('authorization');
    const user = authHeader ? await verifyUser(authHeader, env) : null;
    const rateLimitResult = rateLimitMiddleware(request, user?.id);
    if (!rateLimitResult.ok) {
      return tooManyRequestsResponse(rateLimitResult);
    }

    const url = new URL(request.url);
    const module = url.searchParams.get('module');
    // API504-004: vercel.json's rewrite for /api/profile and /api/blueprint
    // is "/api/profile/:action*" → "...&action=:action*" — when the caller
    // hits the plain path with no extra segment (which PendingOnboardingSaver.tsx
    // does: fetch('/api/profile', ...)), `:action*` substitutes to an empty
    // string, so `action` here is '' (falsy). handleProfile/handleBlueprint
    // never branch on `action` at all, so requiring it was too strict and
    // rejected every real call with "module and action parameters required"
    // (confirmed via live Network tab response body). Default to 'default',
    // matching the same convention already used for the `share` rewrite
    // ("...&module=share&action=default").
    const action = url.searchParams.get('action') || 'default';

    if (!module) {
      return Response.json(
        { success: false, error: 'module parameter required' } as ApiResponse,
        { status: 400 }
      );
    }

    // Build response headers with caching for edge function optimization (P2-HOTFIX)
    const getCacheHeaders = (maxAge: number = 300) => ({
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=3600`,
      'CDN-Cache-Control': `public, max-age=${maxAge}`,
    });

    let response: Response;

    switch (module) {
      case 'notifications':
        response = await handleNotifications(request, action, url, env, user);
        break;
      case 'twin-evolution':
        response = await handleTwinEvolution(request, action, url, env);
        break;
      case 'sice':
        response = await handleSICE(request, action, url, env, user);
        break;
      case 'stripe':
        response = await handleStripe(request, action, user, env);
        break;
      case 'share':
        response = await handleShare(request, url, env);
        break;
      case 'profile':
        response = await handleProfile(request, action, user, env);
        // Cache profile for 5 min to reduce edge requests
        if (response.ok) {
          Object.entries(getCacheHeaders(300)).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }
        break;
      case 'blueprint':
        response = await handleBlueprint(request, action, user, env);
        // Cache blueprint for 5 min to reduce edge requests
        if (response.ok) {
          Object.entries(getCacheHeaders(300)).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }
        break;
      default:
        response = Response.json(
          { success: false, error: `Unknown module: ${module}` } as ApiResponse,
          { status: 400 }
        );
    }

    return response;
  } catch (error) {
    console.error('Error in unified handler:', error);
    return Response.json(
      { success: false, error: String(error) } as ApiResponse,
      { status: 500 }
    );
  }
}

async function handleNotifications(request: Request, action: string, url: URL, env: Env, user: VerifiedUser | null): Promise<Response> {
  const supabase = getAnonSupabase(env);
  if (request.method === 'GET') {
    if (action === 'list') {
      if (!user) {
        return Response.json({ success: false, error: 'Unauthorized' } as ApiResponse, { status: 401 });
      }
      // Use verified JWT user id; reject if URL param disagrees (misconfigured client)
      const requestedUserId = url.searchParams.get('userId');
      if (requestedUserId && requestedUserId !== user.id) {
        return Response.json({ success: false, error: 'Forbidden' } as ApiResponse, { status: 403 });
      }
      const userId = user.id;

      if (!supabase) {
        return Response.json(
          { success: false, error: 'Database not initialized' } as ApiResponse,
          { status: 500 }
        );
      }

      const { data: notifications, error } = await supabase
        .from('notification_queue')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(50);

      if (error) {
        return Response.json({ success: false, error: error.message } as ApiResponse, {
          status: 500,
        });
      }

      const unread = notifications?.filter((n) => !n.readAt)?.length || 0;
      return Response.json({
        success: true,
        data: { notifications: notifications || [], total: notifications?.length || 0, unread },
      } as ApiResponse);
    }
  } else if (request.method === 'POST') {
    const body = await request.json();

    switch (action) {
      case 'schedule': {
        const { userId, twinId, type, title, message, scheduledFor, timezone } = body;
        if (!userId || !type) {
          return Response.json({ success: false, error: 'userId and type required' } as ApiResponse, {
            status: 400,
          });
        }

        const result = await scheduleNotification({
          userId,
          twinId,
          notificationType: type as any,
          title: title || 'Notification',
          message: message || '',
          scheduledFor: scheduledFor || new Date().toISOString(),
          timezone: timezone || 'UTC',
        });

        if (!result.notificationId) {
          return Response.json(
            { success: false, error: 'Failed to schedule' } as ApiResponse,
            { status: 500 }
          );
        }

        await trackNotificationSent(result.notificationId, userId, type);
        return Response.json({
          success: true,
          data: { notificationId: result.notificationId, status: 'scheduled' },
        } as ApiResponse);
      }

      case 'mark-read': {
        const { notificationId, userId } = body;
        if (!notificationId) {
          return Response.json({ success: false, error: 'notificationId required' } as ApiResponse, {
            status: 400,
          });
        }

        if (!supabase) {
          return Response.json(
            { success: false, error: 'Database not initialized' } as ApiResponse,
            { status: 500 }
          );
        }

        const { error } = await supabase
          .from('notification_queue')
          .update({ readAt: new Date().toISOString() })
          .eq('id', notificationId)
          .eq('userId', userId);

        if (error) {
          return Response.json({ success: false, error: error.message } as ApiResponse, {
            status: 500,
          });
        }

        if (userId) {
          await trackNotificationRead(notificationId, userId);
        }

        return Response.json({ success: true, message: 'Marked as read' } as ApiResponse);
      }

      case 'record-outcome': {
        const { decisionId, userId, twinId, decisionText, outcome, followUpDay, notes, timezone } =
          body;

        if (!decisionId || !userId || !['positive', 'neutral', 'negative'].includes(outcome)) {
          return Response.json(
            { success: false, error: 'Invalid parameters' } as ApiResponse,
            { status: 400 }
          );
        }

        if (!supabase) {
          return Response.json(
            { success: false, error: 'Database not initialized' } as ApiResponse,
            { status: 500 }
          );
        }

        const { error: insertError } = await supabase.from('decision_outcomes').insert({
          decision_id: decisionId,
          user_id: userId,
          twin_id: twinId,
          outcome,
          decision_text: decisionText || '',
          follow_up_day: followUpDay,
          notes,
          recorded_at: new Date().toISOString(),
        });

        if (insertError) {
          return Response.json({ success: false, error: insertError.message } as ApiResponse, {
            status: 500,
          });
        }

        if (twinId) {
          await trackDecisionOutcome(
            decisionId,
            userId,
            twinId,
            outcome as any,
            decisionText || '',
            followUpDay,
            notes
          );
        }

        if (!followUpDay) {
          await scheduleDecisionFollowUps(
            decisionId,
            userId,
            twinId || '',
            decisionText || '',
            timezone || 'UTC'
          );
        }

        return Response.json({
          success: true,
          message: `Decision outcome recorded as ${outcome}`,
        } as ApiResponse);
      }

      default:
        return Response.json(
          { success: false, error: `Unknown action: ${action}` } as ApiResponse,
          { status: 400 }
        );
    }
  }

  return Response.json(
    { success: false, error: 'Method not allowed' } as ApiResponse,
    { status: 405 }
  );
}

async function handleTwinEvolution(_request: Request, _action: string, url: URL, env: Env): Promise<Response> {
  const supabase = getAnonSupabase(env);
  if (!supabase) {
    return Response.json(
      { success: false, error: 'Database not initialized' } as ApiResponse,
      { status: 500 }
    );
  }

  if (_request.method === 'GET') {
    const twinId = url.searchParams.get('twinId');
    if (!twinId) {
      return Response.json({ success: false, error: 'twinId required' } as ApiResponse, {
        status: 400,
      });
    }

    const { data, error } = await supabase
      .from('twin_evolution_progress')
      .select('*')
      .eq('twin_id', twinId)
      .single();

    if (error) {
      return Response.json({ success: false, error: error.message } as ApiResponse, {
        status: 500,
      });
    }

    return Response.json({ success: true, data } as ApiResponse);
  }

  return Response.json(
    { success: false, error: 'Method not allowed' } as ApiResponse,
    { status: 405 }
  );
}

async function handleSICE(_request: Request, _action: string, url: URL, env: Env, user: VerifiedUser | null): Promise<Response> {
  const supabase = getAnonSupabase(env);
  if (!supabase) {
    return Response.json(
      { success: false, error: 'Database not initialized' } as ApiResponse,
      { status: 500 }
    );
  }

  if (!user) {
    return Response.json({ success: false, error: 'Unauthorized' } as ApiResponse, { status: 401 });
  }
  // Use verified JWT user id; reject if URL param disagrees (misconfigured client)
  const requestedUserId = url.searchParams.get('userId');
  if (requestedUserId && requestedUserId !== user.id) {
    return Response.json({ success: false, error: 'Forbidden' } as ApiResponse, { status: 403 });
  }
  const userId = user.id;

  if (_action === 'get-patterns') {
    const { data, error } = await supabase
      .from('pattern_analysis')
      .select('*')
      .eq('user_id', userId)
      .limit(50);

    if (error) {
      return Response.json({ success: false, error: error.message } as ApiResponse, {
        status: 500,
      });
    }

    return Response.json({ success: true, data } as ApiResponse);
  }

  return Response.json(
    { success: false, error: 'Unknown action' } as ApiResponse,
    { status: 400 }
  );
}

// ── Stripe helpers ────────────────────────────────────────────────────────────

function getStripe(env: Env): Stripe {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  // CF-PAGES-MIGRATION-001: stripe-node defaults to Node's `http` module,
  // which doesn't exist in the Cloudflare Workers/Pages Functions runtime.
  // The fetch-based client is what Stripe ships specifically for edge
  // runtimes (Workers, Vercel Edge, Deno) — request/response logic is
  // otherwise identical. No-op on Vercel's Node runtime.
  return new Stripe(key, { apiVersion: '2024-06-20', httpClient: Stripe.createFetchHttpClient() });
}

function getPriceId(tier: string, billingPeriod: string, env: Env): string {
  const envKey = (() => {
    if (tier === 'plus' && billingPeriod === 'monthly') return 'STRIPE_PRICE_PLUS_MONTHLY';
    if (tier === 'plus' && billingPeriod === 'annual')  return 'STRIPE_PRICE_PLUS_ANNUAL';
    if (tier === 'pro'  && billingPeriod === 'monthly') return 'STRIPE_PRICE_PRO_MONTHLY';
    if (tier === 'pro'  && billingPeriod === 'annual')  return 'STRIPE_PRICE_PRO_ANNUAL';
    if (tier === 'lifetime')                            return 'STRIPE_PRICE_LIFETIME';
    return null;
  })();
  if (!envKey) throw new Error(`Unknown tier/billingPeriod: ${tier}/${billingPeriod}`);
  const priceId = env[envKey];
  if (!priceId) throw new Error(`Env var ${envKey} is not set`);
  return priceId;
}

async function getStripeCustomerId(userId: string, env: Env): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin(env);
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as any)?.stripe_customer_id ?? null;
}

// ── Stripe webhook handlers ───────────────────────────────────────────────────

async function onCheckoutComplete(session: Stripe.Checkout.Session, env: Env): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin(env);
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
      expires_at: null,
      updated_at: new Date().toISOString(),
    } as any,
    { onConflict: 'user_id' }
  );
  console.log(`[stripe] Upserted subscription: user=${userId} tier=${tier}`);
}

async function onSubscriptionChange(sub: Stripe.Subscription, env: Env): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin(env);
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
    } as any,
    { onConflict: 'user_id' }
  );
  console.log(`[stripe] Subscription ${sub.status}: user=${userId} tier=${tier}`);
}

async function onPaymentFailed(invoice: Stripe.Invoice, env: Env): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin(env);
  if (!supabaseAdmin) return;
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : (invoice.customer as any)?.id;
  if (!customerId) return;
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if ((data as any)?.user_id) {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'expired', updated_at: new Date().toISOString() } as any)
      .eq('user_id', (data as any).user_id);
    console.log(`[stripe] Payment failed: user=${(data as any).user_id}`);
  }
}

// ── handleStripe ─────────────────────────────────────────────────────────────

async function handleStripe(request: Request, action: string, user: VerifiedUser | null, env: Env): Promise<Response> {
  try {
    switch (action) {
      case 'create-checkout': {
        if (request.method !== 'POST') {
          return Response.json({ success: false, error: 'POST only' } as ApiResponse, { status: 405 });
        }
        if (!user) {
          return Response.json({ success: false, error: 'Unauthorized' } as ApiResponse, { status: 401 });
        }
        const body = await request.json() as { tier: string; billingPeriod?: string; returnUrl?: string };
        const { tier, billingPeriod = 'monthly', returnUrl } = body;
        if (!tier) {
          return Response.json({ success: false, error: 'tier is required' } as ApiResponse, { status: 400 });
        }
        const stripe = getStripe(env);
        const priceId = getPriceId(tier, billingPeriod, env);
        const origin = returnUrl
          ? new URL(returnUrl).origin
          : (env.FRONTEND_URL || 'https://selfprint.app');
        const mode: Stripe.Checkout.SessionCreateParams['mode'] =
          tier === 'lifetime' ? 'payment' : 'subscription';
        const session = await stripe.checkout.sessions.create({
          mode,
          line_items: [{ price: priceId, quantity: 1 }],
          client_reference_id: user.id,
          customer_email: user.email,
          success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/pricing`,
          metadata: { user_id: user.id, tier, billing_period: billingPeriod },
          ...(mode === 'subscription'
            ? { subscription_data: { metadata: { user_id: user.id, tier } } }
            : {}),
        });
        return Response.json({ success: true, sessionId: session.id, url: session.url } as ApiResponse);
      }

      case 'create-portal': {
        if (request.method !== 'POST') {
          return Response.json({ success: false, error: 'POST only' } as ApiResponse, { status: 405 });
        }
        if (!user) {
          return Response.json({ success: false, error: 'Unauthorized' } as ApiResponse, { status: 401 });
        }
        const stripe = getStripe(env);
        const origin = env.FRONTEND_URL || 'https://selfprint.app';
        const customerId = await getStripeCustomerId(user.id, env);
        if (!customerId) {
          return Response.json(
            { success: false, error: 'No Stripe customer found for this user' } as ApiResponse,
            { status: 404 }
          );
        }
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${origin}/pricing`,
        });
        return Response.json({ success: true, portalUrl: portalSession.url } as ApiResponse);
      }

      case 'subscription': {
        if (request.method !== 'GET') {
          return Response.json({ success: false, error: 'GET only' } as ApiResponse, { status: 405 });
        }
        if (!user) {
          return Response.json({ success: false, error: 'Unauthorized' } as ApiResponse, { status: 401 });
        }
        const supabaseAdmin = getSupabaseAdmin(env);
        if (!supabaseAdmin) {
          return Response.json({ success: false, error: 'Supabase admin not configured' } as ApiResponse, { status: 500 });
        }
        const { data, error } = await supabaseAdmin
          .from('subscriptions')
          .select('tier, status, expires_at, stripe_customer_id, stripe_subscription_id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) {
          console.error('[stripe] subscription lookup error:', error.message);
          return Response.json({ success: false, error: 'Database error' } as ApiResponse, { status: 500 });
        }
        if (!data) {
          return Response.json({
            success: true,
            tier: 'free',
            status: 'active',
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            expiresAt: null,
          } as ApiResponse);
        }
        return Response.json({
          success: true,
          tier: data.tier,
          status: data.status,
          expiresAt: data.expires_at,
          stripeCustomerId: data.stripe_customer_id,
          stripeSubscriptionId: data.stripe_subscription_id,
        } as ApiResponse);
      }

      case 'webhook': {
        if (request.method !== 'POST') {
          return Response.json({ success: false, error: 'POST only' } as ApiResponse, { status: 405 });
        }
        const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          console.error('[stripe] STRIPE_WEBHOOK_SECRET not set');
          return Response.json({ success: false, error: 'Webhook secret not configured' } as ApiResponse, { status: 500 });
        }
        const stripe = getStripe(env);
        const sig = request.headers.get('stripe-signature') ?? '';
        const rawBody = await request.text();
        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Webhook signature error';
          console.error('[stripe] Webhook verification failed:', msg);
          return Response.json({ success: false, error: `Webhook error: ${msg}` } as ApiResponse, { status: 400 });
        }
        console.log(`[stripe] Webhook received: ${event.type}`);
        switch (event.type) {
          case 'checkout.session.completed':
            await onCheckoutComplete(event.data.object as Stripe.Checkout.Session, env);
            break;
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            await onSubscriptionChange(event.data.object as Stripe.Subscription, env);
            break;
          case 'invoice.payment_failed':
            await onPaymentFailed(event.data.object as Stripe.Invoice, env);
            break;
          default:
            break;
        }
        return Response.json({ success: true, received: true } as ApiResponse);
      }

      default:
        return Response.json({ success: false, error: `Unknown stripe action: ${action}` } as ApiResponse, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[stripe] ${action} error:`, msg);
    return Response.json({ success: false, error: msg } as ApiResponse, { status: 500 });
  }
}

// ── handleShare ───────────────────────────────────────────────────────────────

function generateShareCode(): string {
  const bytes = new Uint8Array(6);
  globalThis.crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('base64url');
}

// CF-PAGES-MIGRATION-001: pre-existing bug found live during production
// verification (not introduced by this migration, but surfaced by it —
// /api/share returned 500 "Database error" for a well-formed code).
// Migration 002_profiles_blueprints.sql explicitly created
// selfprint.users_profiles / selfprint.blueprints (and 004_share_links.sql
// created selfprint.share_links) in a *dedicated* `selfprint` Postgres
// schema, specifically because this Supabase project already has
// unrelated tables named blueprints/users_profiles in `public` belonging
// to a different product. The frontend already does this correctly
// (supabase.schema('selfprint').from(...), see src/pages/TwinChat.tsx /
// CoreAwakening.tsx / WorldContext.tsx) but handleShare / handleProfile /
// handleBlueprint below never did — every query here was silently hitting
// `public.*` instead. Fixed by adding .schema('selfprint') to every
// share_links / users_profiles / blueprints call in this file (9 call
// sites) to match the schema the tables actually live in.
async function handleShare(request: Request, url: URL, env: Env): Promise<Response> {
  const supabaseAdmin = getSupabaseAdmin(env);
  if (!supabaseAdmin) {
    return Response.json({ success: false, error: 'Supabase admin not configured' } as ApiResponse, { status: 500 });
  }

  if (request.method === 'GET') {
    const code = url.searchParams.get('code') ?? '';
    if (!code) {
      return Response.json({ success: false, error: 'code param required' } as ApiResponse, { status: 400 });
    }
    // Validate code format: exactly 8 chars, base64url safe
    if (!/^[A-Za-z0-9_-]{8}$/.test(code)) {
      return Response.json({ success: false, error: 'Invalid share code format' } as ApiResponse, { status: 400 });
    }
    const { data: link, error: linkErr } = await supabaseAdmin
      .schema('selfprint')
      .from('share_links')
      .select('user_id')
      .eq('code', code)
      .maybeSingle();
    if (linkErr) {
      // TEMP-DEBUG-SHARE-001: /api/share kept 500ing "Database error" in
      // production even after confirming selfprint.share_links exists and
      // is exposed. Surfacing the real Postgrest error message/code here
      // (harmless — no user data, just a query-level error) to diagnose
      // without needing CF dashboard log access. Revert once root-caused.
      console.error('[share] linkErr:', linkErr);
      return Response.json(
        { success: false, error: 'Database error', debug: { message: linkErr.message, code: (linkErr as any).code, details: (linkErr as any).details, hint: (linkErr as any).hint } } as ApiResponse,
        { status: 500 }
      );
    }
    if (!link) {
      return Response.json({ success: false, error: 'Share link not found' } as ApiResponse, { status: 404 });
    }
    const { data: blueprint, error: bpErr } = await supabaseAdmin
      .schema('selfprint')
      .from('blueprints')
      .select('accuracy_level, decision_style')
      .eq('user_id', link.user_id)
      .eq('is_latest', true)
      .maybeSingle();
    if (bpErr) {
      console.error('[share] bpErr:', bpErr);
      return Response.json(
        { success: false, error: 'Database error', debug: { message: bpErr.message, code: (bpErr as any).code, details: (bpErr as any).details, hint: (bpErr as any).hint } } as ApiResponse,
        { status: 500 }
      );
    }
    if (!blueprint) {
      return Response.json({ success: false, error: 'Owner has no AI Twin yet' } as ApiResponse, { status: 404 });
    }
    return Response.json({
      success: true,
      found: true,
      accuracyLevel: blueprint.accuracy_level,
      decisionStyle: blueprint.decision_style,
    } as ApiResponse);
  }

  if (request.method === 'POST') {
    const user = await verifyUser(request.headers.get('authorization') ?? undefined, env);
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' } as ApiResponse, { status: 401 });
    }
    // Return existing code if already has one
    const { data: existing, error: existingErr } = await supabaseAdmin
      .schema('selfprint')
      .from('share_links')
      .select('code')
      .eq('user_id', user.id)
      .maybeSingle();
    if (existingErr) {
      return Response.json({ success: false, error: 'Database error' } as ApiResponse, { status: 500 });
    }
    if (existing) {
      return Response.json({ success: true, code: existing.code } as ApiResponse);
    }
    // Insert new code (retry on collision)
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateShareCode();
      const { error: insertErr } = await supabaseAdmin
        .schema('selfprint')
        .from('share_links')
        .insert({ user_id: user.id, code } as any);
      if (!insertErr) {
        return Response.json({ success: true, code } as ApiResponse);
      }
      // 23505 = unique_violation — try again
      if (((insertErr as any)?.code) !== '23505') {
        console.error('[share] insert error:', insertErr);
        return Response.json({ success: false, error: 'Failed to create share link' } as ApiResponse, { status: 500 });
      }
    }
    return Response.json({ success: false, error: 'Could not generate unique code' } as ApiResponse, { status: 500 });
  }

  return Response.json({ success: false, error: 'GET or POST only' } as ApiResponse, { status: 405 });
}

async function handleProfile(request: Request, action: string, user: VerifiedUser | null, env: Env): Promise<Response> {
  try {
    const supabaseAdmin = getSupabaseAdmin(env);
    if (!supabaseAdmin) {
      return Response.json({ success: false, error: 'Supabase unavailable' } as ApiResponse, { status: 500 });
    }
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' } as ApiResponse, { status: 401 });
    }

    if (request.method === 'GET') {
      const { data, error: selectError } = await supabaseAdmin
        .schema('selfprint')
        .from('users_profiles')
        .select()
        .eq('user_id', user.id)
        .maybeSingle();
      if (selectError) {
        console.error('[profile] select error:', selectError);
        return Response.json({ success: false, error: 'DB error' } as ApiResponse, { status: 500 });
      }
      return Response.json({ success: true, profile: data || null } as ApiResponse);
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;

      // ── Input validation ──────────────────────────────────
      const dateOfBirth  = (body.dateOfBirth  as string) || null;
      const timeOfBirth  = (body.timeOfBirth  as string) || null;
      const placeOfBirth = (body.placeOfBirth as string) || null;

      // Validate date format YYYY-MM-DD
      if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        return Response.json({ success: false, error: 'dateOfBirth must be YYYY-MM-DD' } as ApiResponse, { status: 400 });
      }
      // Validate time format HH:MM
      if (timeOfBirth && !/^\d{2}:\d{2}$/.test(timeOfBirth)) {
        return Response.json({ success: false, error: 'timeOfBirth must be HH:MM' } as ApiResponse, { status: 400 });
      }
      // Reject strings with HTML injection patterns
      const INJECTION_RE = /<[^>]*>|javascript:|on\w+\s*=/i;
      if ((placeOfBirth && INJECTION_RE.test(placeOfBirth))) {
        return Response.json({ success: false, error: 'placeOfBirth contains invalid characters' } as ApiResponse, { status: 400 });
      }
      // ─────────────────────────────────────────────────────

      const { data, error: upsertError } = await supabaseAdmin
        .schema('selfprint')
        .from('users_profiles')
        .upsert(
          {
            user_id: user.id,
            date_of_birth: dateOfBirth,
            time_of_birth: timeOfBirth,
            place_of_birth: placeOfBirth,
            initial_mood: (body.initialMood as string) || null,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'user_id' }
        )
        .select()
        .single();
      if (upsertError) {
        // TEMP-DEBUG-PROFILE-001: production QA (2026-08-28) found POST
        // /api/profile 500ing repeatedly during real onboarding, blocking
        // users from ever reaching Core Awakening. Surfacing the real
        // Postgrest error to diagnose without CF dashboard log access —
        // revert once root-caused (see TEMP-DEBUG-SHARE-001 for precedent).
        console.error('[profile] upsert error:', upsertError);
        return Response.json(
          { success: false, error: 'DB error', debug: { message: (upsertError as any).message, code: (upsertError as any).code, details: (upsertError as any).details, hint: (upsertError as any).hint } } as ApiResponse,
          { status: 500 }
        );
      }
      return Response.json({ success: true, profileId: (data as any)?.id, message: 'Profile saved' } as ApiResponse);
    }

    return Response.json({ success: false, error: 'GET or POST only' } as ApiResponse, { status: 405 });
  } catch (error) {
    console.error('[handleProfile] Error:', error);
    return Response.json({ success: false, error: String(error) } as ApiResponse, { status: 500 });
  }
}

async function handleBlueprint(request: Request, action: string, user: VerifiedUser | null, env: Env): Promise<Response> {
  try {
    const supabaseAdmin = getSupabaseAdmin(env);
    if (!supabaseAdmin) {
      return Response.json({ success: false, error: 'Supabase unavailable' } as ApiResponse, { status: 500 });
    }
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' } as ApiResponse, { status: 401 });
    }

    if (request.method === 'GET') {
      const { data, error: selectError } = (await supabaseAdmin
        .schema('selfprint')
        .from('blueprints')
        .select()
        .eq('user_id', user.id)
        .eq('is_latest', true as any)
        .maybeSingle()) as any;
      if (selectError) {
        console.error('[blueprint] select error:', selectError);
        return Response.json({ success: false, error: 'DB error' } as ApiResponse, { status: 500 });
      }
      return Response.json({ success: true, blueprint: data || null } as ApiResponse);
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;
      const accuracyLevel = body.accuracyLevel as number;
      if (typeof accuracyLevel !== 'number' || accuracyLevel < 0 || accuracyLevel > 100) {
        return Response.json({ success: false, error: 'accuracyLevel ต้องเป็น 0-100' } as ApiResponse, { status: 400 });
      }

      // API504-005: decisionStyle was validated against a fixed English enum
      // (analytical/intuitive/collaborative/directive/exploratory), but the
      // app has never produced those values — src/lib/astrology.ts's
      // getLifePathProfile() generates Thai descriptive phrases (e.g.
      // "นักวางกลยุทธ์เชิงวิเคราะห์") used for display everywhere
      // (InitialBlueprint.tsx, FullAnalysis.tsx, Share.tsx). Confirmed live:
      // every real blueprint save 400'd with "decisionStyle must be one
      // of: ...". It's genuinely free text, not an enum — validate it like
      // the other free-text field (placeOfBirth) instead: reasonable length,
      // no HTML/script injection.
      const decisionStyle = body.decisionStyle as string | undefined;
      const INJECTION_RE_DS = /<[^>]*>|javascript:|on\w+\s*=/i;
      if (decisionStyle && (decisionStyle.length > 200 || INJECTION_RE_DS.test(decisionStyle))) {
        return Response.json(
          { success: false, error: 'decisionStyle contains invalid characters or is too long' } as ApiResponse,
          { status: 400 }
        );
      }

      // Validate arrays are arrays (not arbitrary types)
      for (const field of ['strengths', 'insights', 'opportunities', 'blindSpots'] as const) {
        if (body[field] !== undefined && !Array.isArray(body[field])) {
          return Response.json({ success: false, error: `${field} must be an array` } as ApiResponse, { status: 400 });
        }
      }
      // Mark previous blueprints as non-latest
      await supabaseAdmin
        .schema('selfprint')
        .from('blueprints')
        .update({ is_latest: false })
        .eq('user_id', user.id)
        .eq('is_latest', true);
      const { data, error: insertError } = await supabaseAdmin
        .schema('selfprint')
        .from('blueprints')
        .insert({
          user_id: user.id,
          profile_id: (body.profileId as string) || null,
          accuracy_level: accuracyLevel,
          decision_style: (body.decisionStyle as string) || null,
          strengths: (body.strengths as string[]) || [],
          insights: (body.insights as string[]) || [],
          opportunities: (body.opportunities as string[]) || [],
          blind_spots: (body.blindSpots as string[]) || [],
          prototype_core: (body.prototypeCore as string) || null,
          is_latest: true,
          source: (body.source as string) || 'initial',
        })
        .select()
        .single();
      if (insertError) {
        // TEMP-DEBUG-PROFILE-001 (see handleProfile) — same live 500 pattern
        // hit /api/blueprint too, blocking onboarding completion.
        console.error('[blueprint] insert error:', insertError);
        return Response.json(
          { success: false, error: 'DB error', debug: { message: (insertError as any).message, code: (insertError as any).code, details: (insertError as any).details, hint: (insertError as any).hint } } as ApiResponse,
          { status: 500 }
        );
      }
      return Response.json({ success: true, blueprintId: (data as any)?.id, message: 'Blueprint saved' } as ApiResponse);
    }

    return Response.json({ success: false, error: 'GET or POST only' } as ApiResponse, { status: 405 });
  } catch (error) {
    console.error('[handleBlueprint] Error:', error);
    return Response.json({ success: false, error: String(error) } as ApiResponse, { status: 500 });
  }
}

// API504-002 follow-up: `export default handler;` alone (handler defined via
// `export async function handler(request: Request)` above, referenced here
// only by identifier) was NOT enough for Vercel's Node.js runtime
// (/opt/rust/nodejs.js) to detect this as a Web Fetch-style function —
// confirmed live via Vercel Runtime Logs: it invoked handler() with a
// legacy Node `(req, res)` pair instead (req.headers has no `.get()`),
// threw at request.headers.get(), and since a legacy-mode function's
// return value is ignored (must call res.end() instead), nothing was ever
// sent back — every request hit the 10s function timeout → 504.
// Vercel's own runtime warning prescribes the fix directly: real named
// HTTP-method function exports (`export function GET(request) {...}`),
// not a const alias to an existing function. Only GET and POST are used
// anywhere in this file (see the request.method checks throughout).
// CF-PAGES-MIGRATION-001: handler() now takes an explicit `env` (see the
// module-level comment above getAnonSupabase). functions/api/[[route]].ts
// passes the real Cloudflare `context.env`. These two exports are only
// reached via Vercel's own routing (never called from the CF path — the
// Pages Function imports `handler` directly), so they fall back to
// `process.env`, which is what Vercel's Node runtime actually populates.
declare const process: { env: Record<string, string | undefined> } | undefined;

export async function GET(request: Request): Promise<Response> {
  return handler(request, (typeof process !== 'undefined' && process?.env) || {});
}

export async function POST(request: Request): Promise<Response> {
  return handler(request, (typeof process !== 'undefined' && process?.env) || {});
}

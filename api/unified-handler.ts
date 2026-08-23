/**
 * Unified API Handler
 * Consolidates all API endpoints into a single Serverless Function
 * Routes based on module + action query params
 * @ts-nocheck Supabase types don't match schema—runtime works correctly
 */

import { supabase } from '../src/lib/supabase/client.js';
import { scheduleNotification } from '../src/services/PushScheduler.js';
import { scheduleDecisionFollowUps } from '../src/services/DecisionFollowUpNotifier.js';
import {
  trackNotificationSent,
  trackNotificationRead,
  trackDecisionOutcome,
} from '../src/services/NotificationAnalytics.js';
import Stripe from 'stripe';
import { verifyUser, supabaseAdmin, type VerifiedUser } from './_utils/verify-user.js';
import { rateLimitMiddleware, tooManyRequestsResponse } from './_utils/rate-limit.js';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function handler(request: Request): Promise<Response> {
  try {
    // Rate limiting — apply before any business logic
    const authHeader = request.headers.get('authorization');
    const user = authHeader ? await verifyUser(authHeader) : null;
    const rateLimitResult = rateLimitMiddleware(request, user?.id);
    if (!rateLimitResult.ok) {
      return tooManyRequestsResponse(rateLimitResult);
    }

    const url = new URL(request.url);
    const module = url.searchParams.get('module');
    const action = url.searchParams.get('action');

    if (!module || !action) {
      return Response.json(
        { success: false, error: 'module and action parameters required' } as ApiResponse,
        { status: 400 }
      );
    }

    switch (module) {
      case 'notifications':
        return handleNotifications(request, action, url);
      case 'twin-evolution':
        return handleTwinEvolution(request, action, url);
      case 'sice':
        return handleSICE(request, action, url);
      case 'stripe':
        return handleStripe(request, action, user);
      case 'share':
        return handleShare(request, url);
      case 'profile':
        return handleProfile(request, action, user);
      case 'blueprint':
        return handleBlueprint(request, action, user);
      default:
        return Response.json(
          { success: false, error: `Unknown module: ${module}` } as ApiResponse,
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in unified handler:', error);
    return Response.json(
      { success: false, error: String(error) } as ApiResponse,
      { status: 500 }
    );
  }
}

async function handleNotifications(request: Request, action: string, url: URL): Promise<Response> {
  if (request.method === 'GET') {
    if (action === 'list') {
      const userId = url.searchParams.get('userId');
      if (!userId) {
        return Response.json({ success: false, error: 'userId required' } as ApiResponse, {
          status: 400,
        });
      }

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

async function handleTwinEvolution(_request: Request, _action: string, url: URL): Promise<Response> {
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

async function handleSICE(_request: Request, _action: string, url: URL): Promise<Response> {
  if (!supabase) {
    return Response.json(
      { success: false, error: 'Database not initialized' } as ApiResponse,
      { status: 500 }
    );
  }

  const userId = url.searchParams.get('userId');
  if (!userId) {
    return Response.json({ success: false, error: 'userId required' } as ApiResponse, {
      status: 400,
    });
  }

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

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

function getPriceId(tier: string, billingPeriod: string): string {
  const envKey = (() => {
    if (tier === 'plus' && billingPeriod === 'monthly') return 'STRIPE_PRICE_PLUS_MONTHLY';
    if (tier === 'plus' && billingPeriod === 'annual')  return 'STRIPE_PRICE_PLUS_ANNUAL';
    if (tier === 'pro'  && billingPeriod === 'monthly') return 'STRIPE_PRICE_PRO_MONTHLY';
    if (tier === 'pro'  && billingPeriod === 'annual')  return 'STRIPE_PRICE_PRO_ANNUAL';
    if (tier === 'lifetime')                            return 'STRIPE_PRICE_LIFETIME';
    return null;
  })();
  if (!envKey) throw new Error(`Unknown tier/billingPeriod: ${tier}/${billingPeriod}`);
  const priceId = process.env[envKey];
  if (!priceId) throw new Error(`Env var ${envKey} is not set`);
  return priceId;
}

async function getStripeCustomerId(userId: string): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as any)?.stripe_customer_id ?? null;
}

// ── Stripe webhook handlers ───────────────────────────────────────────────────

async function onCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
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

async function onSubscriptionChange(sub: Stripe.Subscription): Promise<void> {
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

async function onPaymentFailed(invoice: Stripe.Invoice): Promise<void> {
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

async function handleStripe(request: Request, action: string, user: VerifiedUser | null): Promise<Response> {
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
        const stripe = getStripe();
        const origin = process.env.FRONTEND_URL || 'https://selfprint.app';
        const customerId = await getStripeCustomerId(user.id);
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
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          console.error('[stripe] STRIPE_WEBHOOK_SECRET not set');
          return Response.json({ success: false, error: 'Webhook secret not configured' } as ApiResponse, { status: 500 });
        }
        const stripe = getStripe();
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
            await onCheckoutComplete(event.data.object as Stripe.Checkout.Session);
            break;
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            await onSubscriptionChange(event.data.object as Stripe.Subscription);
            break;
          case 'invoice.payment_failed':
            await onPaymentFailed(event.data.object as Stripe.Invoice);
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

async function handleShare(request: Request, url: URL): Promise<Response> {
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
      .from('share_links')
      .select('user_id')
      .eq('code', code)
      .maybeSingle();
    if (linkErr) {
      return Response.json({ success: false, error: 'Database error' } as ApiResponse, { status: 500 });
    }
    if (!link) {
      return Response.json({ success: false, error: 'Share link not found' } as ApiResponse, { status: 404 });
    }
    const { data: blueprint, error: bpErr } = await supabaseAdmin
      .from('blueprints')
      .select('accuracy_level, decision_style')
      .eq('user_id', link.user_id)
      .eq('is_latest', true)
      .maybeSingle();
    if (bpErr) {
      return Response.json({ success: false, error: 'Database error' } as ApiResponse, { status: 500 });
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
    const user = await verifyUser(request.headers.get('authorization') ?? undefined);
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' } as ApiResponse, { status: 401 });
    }
    // Return existing code if already has one
    const { data: existing, error: existingErr } = await supabaseAdmin
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

async function handleProfile(request: Request, action: string, user: VerifiedUser | null): Promise<Response> {
  try {
    if (!supabaseAdmin) {
      return Response.json({ success: false, error: 'Supabase unavailable' } as ApiResponse, { status: 500 });
    }
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' } as ApiResponse, { status: 401 });
    }

    if (request.method === 'GET') {
      const { data, error: selectError } = await supabaseAdmin
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
        console.error('[profile] upsert error:', upsertError);
        return Response.json({ success: false, error: 'DB error' } as ApiResponse, { status: 500 });
      }
      return Response.json({ success: true, profileId: (data as any)?.id, message: 'Profile saved' } as ApiResponse);
    }

    return Response.json({ success: false, error: 'GET or POST only' } as ApiResponse, { status: 405 });
  } catch (error) {
    console.error('[handleProfile] Error:', error);
    return Response.json({ success: false, error: String(error) } as ApiResponse, { status: 500 });
  }
}

async function handleBlueprint(request: Request, action: string, user: VerifiedUser | null): Promise<Response> {
  try {
    if (!supabaseAdmin) {
      return Response.json({ success: false, error: 'Supabase unavailable' } as ApiResponse, { status: 500 });
    }
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' } as ApiResponse, { status: 401 });
    }

    if (request.method === 'GET') {
      const { data, error: selectError } = (await supabaseAdmin
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

      // Validate decisionStyle enum
      const VALID_DECISION_STYLES = ['analytical', 'intuitive', 'collaborative', 'directive', 'exploratory'];
      const decisionStyle = body.decisionStyle as string | undefined;
      if (decisionStyle && !VALID_DECISION_STYLES.includes(decisionStyle)) {
        return Response.json(
          { success: false, error: `decisionStyle must be one of: ${VALID_DECISION_STYLES.join(', ')}` } as ApiResponse,
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
        .from('blueprints')
        .update({ is_latest: false })
        .eq('user_id', user.id)
        .eq('is_latest', true);
      const { data, error: insertError } = await supabaseAdmin
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
        console.error('[blueprint] insert error:', insertError);
        return Response.json({ success: false, error: 'DB error' } as ApiResponse, { status: 500 });
      }
      return Response.json({ success: true, blueprintId: (data as any)?.id, message: 'Blueprint saved' } as ApiResponse);
    }

    return Response.json({ success: false, error: 'GET or POST only' } as ApiResponse, { status: 405 });
  } catch (error) {
    console.error('[handleBlueprint] Error:', error);
    return Response.json({ success: false, error: String(error) } as ApiResponse, { status: 500 });
  }
}

export default handler;

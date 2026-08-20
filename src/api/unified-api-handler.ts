/**
 * Unified API Handler
 *
 * Consolidates all API endpoints into a single function
 * Routes based on module + action query params
 * Reduces function count from 12+ to 1 on Serverless Functions
 *
 * Usage: /api/unified?module=notifications&action=schedule
 */

import { supabase } from '../lib/supabase/client';
import { rateLimitMiddleware } from '../middleware/rate-limit-middleware';
import * as InputValidation from '../services/InputValidation';
import { scheduleNotification } from '../services/PushScheduler';
import { scheduleDecisionFollowUps } from '../services/DecisionFollowUpNotifier';
import {
  trackNotificationSent,
  trackNotificationRead,
  trackDecisionOutcome,
} from '../services/NotificationAnalytics';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Main unified API handler
 */
export async function handler(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const module = url.searchParams.get('module');
    const action = url.searchParams.get('action');
    const userId = url.searchParams.get('userId') || 'anonymous';

    if (!module || !action) {
      return Response.json(
        { success: false, error: 'module and action parameters required' } as ApiResponse,
        { status: 400 }
      );
    }

    // Check rate limiting (P3.2 - Security hardening)
    const endpoint = `/api/${module}/${action}`;
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitCheck = await rateLimitMiddleware(userId, endpoint, ipAddress);

    if (!rateLimitCheck.allowed) {
      return Response.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' } as ApiResponse,
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimitCheck.retryAfter || 60) }
        }
      );
    }

    // Route to appropriate handler (12 total endpoints)
    switch (module) {
      case 'notifications':
        return handleNotifications(request, action, url);
      case 'twin-evolution':
        return handleTwinEvolution(request, action, url);
      case 'sice':
        return handleSICE(request, action, url);
      case 'stripe':
        return handleStripe(request, action, url);
      case 'profile':
        return handleProfile(request, action, url);
      case 'blueprint':
        return handleBlueprint(request, action, url);
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

/**
 * Handle notifications module
 */
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

/**
 * Handle twin-evolution module
 */
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

/**
 * Handle SICE module
 */
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

/**
 * Handle stripe module
 */
async function handleStripe(request: Request, action: string, url: URL): Promise<Response> {
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

  if (request.method === 'GET' && action === 'subscription') {
    const { data, error } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (error) {
      return Response.json({ success: false, error: error.message } as ApiResponse, {
        status: 500,
      });
    }

    return Response.json({
      success: true,
      data: { customerId: data?.stripe_customer_id, subscriptionId: data?.stripe_subscription_id },
    } as ApiResponse);
  }

  if (request.method === 'POST' && action === 'create-checkout') {
    const body = await request.json();
    const { priceId, successUrl = '/dashboard', cancelUrl = '/plans' } = body;

    if (!priceId) {
      return Response.json({ success: false, error: 'priceId required' } as ApiResponse, {
        status: 400,
      });
    }

    // Placeholder: actual Stripe integration handled in service
    return Response.json({
      success: true,
      data: {
        checkoutUrl: '/stripe/checkout',
        sessionId: 'session_' + Date.now(),
        successUrl,
        cancelUrl,
      },
    } as ApiResponse);
  }

  return Response.json(
    { success: false, error: 'Unknown action' } as ApiResponse,
    { status: 400 }
  );
}

/**
 * Handle profile module
 */
async function handleProfile(request: Request, _action: string, url: URL): Promise<Response> {
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

  if (request.method === 'GET') {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return Response.json({ success: false, error: error.message } as ApiResponse, {
        status: 500,
      });
    }

    return Response.json({ success: true, data } as ApiResponse);
  }

  if (request.method === 'PUT') {
    const body = await request.json();
    const { displayName, avatar, preferences } = body;

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, avatar_url: avatar, preferences })
      .eq('id', userId);

    if (error) {
      return Response.json({ success: false, error: error.message } as ApiResponse, {
        status: 500,
      });
    }

    return Response.json({ success: true, message: 'Profile updated' } as ApiResponse);
  }

  return Response.json(
    { success: false, error: 'Method not allowed' } as ApiResponse,
    { status: 405 }
  );
}

/**
 * Handle blueprint module
 */
async function handleBlueprint(request: Request, _action: string, url: URL): Promise<Response> {
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

  if (request.method === 'GET') {
    const { data, error } = await supabase
      .from('world_blueprints')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return Response.json({ success: false, error: error.message } as ApiResponse, {
        status: 500,
      });
    }

    return Response.json({ success: true, data } as ApiResponse);
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const { name, description, worldContext } = body;

    const { data, error } = await supabase
      .from('world_blueprints')
      .insert({
        user_id: userId,
        name,
        description,
        world_context: worldContext,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return Response.json({ success: false, error: error.message } as ApiResponse, {
        status: 500,
      });
    }

    return Response.json({
      success: true,
      data,
      message: 'Blueprint created',
    } as ApiResponse);
  }

  return Response.json(
    { success: false, error: 'Method not allowed' } as ApiResponse,
    { status: 405 }
  );
}

// Export for Vercel
export default handler;
export const POST = handler;
export const GET = handler;

/**
 * api/push.ts
 *
 * Master Direction §26-27: Push Infrastructure
 *
 * Vercel Edge Function to manage push subscriptions
 * - POST: subscribe user to push notifications
 * - DELETE: unsubscribe user from push notifications
 *
 * Rules:
 *  - Must extract userId from JWT (Authorization header)
 *  - Upsert into push_subscriptions table
 *  - Return 200 on success, 4xx on client errors, 5xx on server errors
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────

interface SubscribeRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface UnsubscribeRequest {
  endpoint: string;
}

// ─── Handler ──────────────────────────────────────────────────────────────

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST and DELETE
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract user ID from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Try to extract from Supabase session cookie as fallback
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Try to get session from request cookie
      const { data: { user } } = await supabase.auth.getUser(authHeader || '');
      if (!user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return handleRequest(req, res, user.id, supabase);
    }

    // Extract token from Bearer
    const token = authHeader.slice(7);

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    });

    // Get user info from token
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user?.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return handleRequest(req, res, user.id, supabase);
  } catch (error) {
    console.error('[PUSH] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

// ─── Request Handler ──────────────────────────────────────────────────────

async function handleRequest(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  supabase: ReturnType<typeof createClient>
) {
  if (req.method === 'POST') {
    return handleSubscribe(req, res, userId, supabase);
  } else if (req.method === 'DELETE') {
    return handleUnsubscribe(req, res, userId, supabase);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ─── Subscribe Handler ────────────────────────────────────────────────────

async function handleSubscribe(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  supabase: ReturnType<typeof createClient>
) {
  const body = req.body as SubscribeRequest;

  // Validate payload
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (typeof body.endpoint !== 'string') {
    return res.status(400).json({ error: 'Invalid endpoint format' });
  }

  if (!/^https?:\/\//.test(body.endpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint URL' });
  }

  try {
    // Upsert subscription
    const { error: upsertError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint: body.endpoint,
          keys_p256dh: body.keys.p256dh,
          keys_auth: body.keys.auth,
          is_active: true,
        },
        {
          onConflict: 'user_id,endpoint',
        }
      );

    if (upsertError) {
      console.error('[PUSH] Upsert error:', upsertError);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription saved',
    });
  } catch (error) {
    console.error('[PUSH] Subscribe error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to subscribe',
    });
  }
}

// ─── Unsubscribe Handler ──────────────────────────────────────────────────

async function handleUnsubscribe(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  supabase: ReturnType<typeof createClient>
) {
  const body = req.body as UnsubscribeRequest;

  // Validate payload
  if (!body.endpoint || typeof body.endpoint !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid endpoint' });
  }

  try {
    // Soft-delete by marking is_active = false
    const { error: updateError } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .match({ user_id: userId, endpoint: body.endpoint });

    if (updateError) {
      console.error('[PUSH] Unsubscribe error:', updateError);
      return res.status(500).json({ error: 'Failed to unsubscribe' });
    }

    return res.status(200).json({
      success: true,
      message: 'Unsubscribed',
    });
  } catch (error) {
    console.error('[PUSH] Unsubscribe error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to unsubscribe',
    });
  }
}

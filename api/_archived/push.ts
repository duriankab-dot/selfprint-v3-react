/**
 * api/push.ts
 * Master Direction §26-27: Push Infrastructure
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../_utils/database.types.js';

interface SubscribeRequest {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

interface UnsubscribeRequest {
  endpoint: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7);
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: { headers: { authorization: `Bearer ${token}` } },
    });

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

async function handleRequest(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  supabase: SupabaseClient<Database>
) {
  if (req.method === 'POST') {
    return handleSubscribe(req, res, userId, supabase);
  } else if (req.method === 'DELETE') {
    return handleUnsubscribe(req, res, userId, supabase);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleSubscribe(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  supabase: SupabaseClient<Database>
) {
  const body = req.body as SubscribeRequest;

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (typeof body.endpoint !== 'string' || !/^https?:\/\//.test(body.endpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }

  try {
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
        { onConflict: 'user_id,endpoint' }
      );

    if (upsertError) {
      console.error('[PUSH] Upsert error:', upsertError);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    return res.status(200).json({ success: true, message: 'Subscription saved' });
  } catch (error) {
    console.error('[PUSH] Subscribe error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to subscribe',
    });
  }
}

async function handleUnsubscribe(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  supabase: SupabaseClient<Database>
) {
  const body = req.body as UnsubscribeRequest;

  if (!body.endpoint || typeof body.endpoint !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid endpoint' });
  }

  try {
    const { error: updateError } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .match({ user_id: userId, endpoint: body.endpoint });

    if (updateError) {
      console.error('[PUSH] Unsubscribe error:', updateError);
      return res.status(500).json({ error: 'Failed to unsubscribe' });
    }

    return res.status(200).json({ success: true, message: 'Unsubscribed' });
  } catch (error) {
    console.error('[PUSH] Unsubscribe error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to unsubscribe',
    });
  }
}
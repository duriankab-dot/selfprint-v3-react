/**
 * Supabase Edge Function: account-delete
 *
 * PDPA Compliance: ลบข้อมูลทั้งหมดของ user + auth account
 * Auth required — JWT + confirmation token
 *
 * @route POST /functions/v1/account-delete
 * Body: { confirmToken } — ต้องตรงกับ "DELETE_MY_ACCOUNT"
 *
 * Flow:
 * 1. Verify JWT → get userId
 * 2. Verify confirmation token
 * 3. Delete from all tables (cascading via FK + manual)
 * 4. Delete auth.users entry via Admin API
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

const CONFIRM_TOKEN = 'DELETE_MY_ACCOUNT';

// Tables to manually delete from (ordered to avoid FK violations)
const TABLES_TO_DELETE = [
  'daily_briefs',
  'analytics_events',
  'behavioral_patterns',
  'personal_memory',
  'journal_queue',
  'chat_messages',
  'push_subscriptions',
  'passkey_challenges',
  'user_credentials',
  'share_links',
  'subscriptions',
  'blueprints',
  'personal_profiles',
  'profiles',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    return json({ error: 'Supabase not configured' }, 500);
  }

  // Auth: verify JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);
  const token = authHeader.slice(7);

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

  try {
    const body = await req.json() as { confirmToken: string };

    // Confirmation required
    if (body.confirmToken !== CONFIRM_TOKEN) {
      return json({
        error: `ยืนยันการลบบัญชี: ส่ง confirmToken: "${CONFIRM_TOKEN}" เพื่อดำเนินการ`,
      }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const userId = user.id;
    const deleteResults: Record<string, string> = {};

    // 1. Delete from all data tables
    for (const table of TABLES_TO_DELETE) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);
        deleteResults[table] = error ? `error: ${error.message}` : 'deleted';
      } catch (e) {
        deleteResults[table] = `skip: ${e instanceof Error ? e.message : 'unknown'}`;
      }
    }

    // 2. Delete auth_rate_limits by email
    try {
      await supabase
        .from('auth_rate_limits')
        .delete()
        .eq('identifier', user.email || '')
        .eq('identifier_type', 'email');
      deleteResults['auth_rate_limits'] = 'deleted';
    } catch {
      deleteResults['auth_rate_limits'] = 'skip';
    }

    // 3. Delete auth user via Admin API
    const adminRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
        },
      }
    );

    if (!adminRes.ok) {
      const errText = await adminRes.text();
      console.error('[account-delete] Admin API error:', errText);
      // Data already deleted — log but don't fail the response
      deleteResults['auth_user'] = `error: ${adminRes.status} — data deleted, contact support`;
    } else {
      deleteResults['auth_user'] = 'deleted';
    }

    console.log(`[account-delete] User ${userId} fully deleted. Results:`, deleteResults);

    return json({
      success: true,
      message: 'บัญชีและข้อมูลทั้งหมดถูกลบเรียบร้อยแล้ว',
      deleted_user_id: userId,
      tables: deleteResults,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[account-delete]', msg);
    return json({ error: msg }, 500);
  }
});

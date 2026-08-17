/**
 * Supabase Edge Function: data-export
 *
 * PDPA Compliance: Export ข้อมูลทั้งหมดของ user เป็น JSON
 * Auth required — JWT from Supabase Auth
 *
 * @route POST /functions/v1/data-export
 * Body: {} (userId จาก JWT)
 *
 * ส่งออก:
 * - profiles / personal_profiles
 * - blueprints
 * - chat_messages
 * - journal_queue
 * - personal_memory
 * - behavioral_patterns
 * - push_subscriptions (ไม่รวม private keys)
 * - analytics_events
 * - subscriptions (Stripe)
 * - daily_briefs
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

async function safeQuery<T>(
  supabase: ReturnType<typeof createClient>,
  table: string,
  columns: string,
  userId: string
): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) {
      console.warn(`[data-export] Table ${table} error: ${error.message}`);
      return [];
    }
    return (data as T[]) || [];
  } catch {
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return jsonResponse({ error: 'POST only' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    return jsonResponse({ error: 'Supabase not configured' }, 500);
  }

  // Auth: verify JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user) return jsonResponse({ error: 'Invalid or expired token' }, 401);

  const supabase = createClient(supabaseUrl, serviceKey);
  const userId = user.id;

  try {
    // Fetch all data in parallel
    const [
      profiles,
      personalProfiles,
      blueprints,
      chatMessages,
      journalQueue,
      personalMemory,
      behavioralPatterns,
      pushSubscriptions,
      analyticsEvents,
      stripeSubscriptions,
      dailyBriefs,
    ] = await Promise.all([
      // Core profile (no sensitive fields)
      safeQuery(supabase, 'profiles', 'id, email, display_name, avatar_url, bio, created_at, updated_at', userId),
      // Personal profile
      safeQuery(supabase, 'personal_profiles', '*', userId),
      // Blueprints
      safeQuery(supabase, 'blueprints', 'id, content, version, created_at, updated_at', userId),
      // Chat messages
      safeQuery(supabase, 'chat_messages', 'id, role, content, hub, mood, created_at', userId),
      // Journal entries
      safeQuery(supabase, 'journal_queue', 'id, content, mood, hub, synced_at, created_at', userId),
      // Personal memory
      safeQuery(supabase, 'personal_memory', 'id, memory_type, title, content, confidence, tags, created_at, updated_at', userId),
      // Behavioral patterns
      safeQuery(supabase, 'behavioral_patterns', 'id, pattern_name, pattern_type, description, ai_insight, confidence, is_strength, evidence_points, last_detected, created_at', userId),
      // Push subscriptions (exclude private key data)
      safeQuery(supabase, 'push_subscriptions', 'id, endpoint, is_active, created_at', userId),
      // Analytics events
      safeQuery(supabase, 'analytics_events', 'id, event_name, properties, created_at', userId),
      // Stripe subscriptions (no payment method details)
      safeQuery(supabase, 'subscriptions', 'id, plan, status, current_period_start, current_period_end, created_at', userId),
      // Daily briefs
      safeQuery(supabase, 'daily_briefs', 'id, brief_date, brief_text, hub_focus, mood_context, generated_at', userId),
    ]);

    const exportData = {
      export_info: {
        exported_at: new Date().toISOString(),
        user_id: userId,
        email: user.email,
        format_version: '1.0',
        note: 'ข้อมูลส่วนตัวทั้งหมดของคุณจาก Selfprint — สร้างขึ้นตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)',
      },
      account: {
        user_id: userId,
        email: user.email,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
      },
      data: {
        profiles,
        personal_profiles: personalProfiles,
        blueprints,
        chat_messages: chatMessages,
        journal_entries: journalQueue,
        personal_memory: personalMemory,
        behavioral_patterns: behavioralPatterns,
        push_subscriptions: pushSubscriptions,
        analytics_events: analyticsEvents,
        subscriptions: stripeSubscriptions,
        daily_briefs: dailyBriefs,
      },
      summary: {
        total_messages: chatMessages.length,
        total_journal_entries: journalQueue.length,
        total_memories: personalMemory.length,
        total_patterns: behavioralPatterns.length,
        total_events: analyticsEvents.length,
      },
    };

    // Return as downloadable JSON file
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...CORS,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="selfprint-data-${userId.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[data-export]', msg);
    return jsonResponse({ error: msg }, 500);
  }
});

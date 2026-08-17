/**
 * Supabase Edge Function: auth-rate-limit
 *
 * ตรวจสอบ / เพิ่ม / Reset rate limits สำหรับ auth attempts
 * ใช้ auth_rate_limits table (สร้างใน 20260811_auth_rate_limits.sql)
 *
 * @route POST /functions/v1/auth-rate-limit
 * Body: { action, identifier, identifier_type? }
 *
 * Actions:
 *   check     - ตรวจว่า identifier โดน block อยู่ไหม
 *   increment - เพิ่ม attempt count (+ set block ถ้าเกิน threshold)
 *   reset     - Clear attempts (เช่น หลัง login สำเร็จ)
 *
 * Thresholds:
 *   5 attempts  → block 15 minutes
 *   10 attempts → block 1 hour
 *   20 attempts → block 24 hours
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

// Thresholds: attempts → block duration in minutes
const THRESHOLDS: [number, number][] = [
  [20, 60 * 24], // 20 attempts → 24hr block
  [10, 60],      // 10 attempts → 1hr block
  [5, 15],       // 5 attempts → 15min block
];

function getBlockDuration(attempts: number): number | null {
  for (const [threshold, minutes] of THRESHOLDS) {
    if (attempts >= threshold) return minutes;
  }
  return null;
}

interface RateLimitBody {
  action: 'check' | 'increment' | 'reset';
  identifier: string;
  identifier_type?: 'email' | 'ip';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) return json({ error: 'Supabase not configured' }, 500);

  try {
    const body = await req.json() as RateLimitBody;
    if (!body.action) return json({ error: 'action required' }, 400);
    if (!body.identifier) return json({ error: 'identifier required' }, 400);

    const identifierType = body.identifier_type || 'email';
    const supabase = createClient(supabaseUrl, serviceKey);
    const now = new Date();

    // Fetch existing record
    const { data: existing } = await supabase
      .from('auth_rate_limits')
      .select('*')
      .eq('identifier', body.identifier)
      .eq('identifier_type', identifierType)
      .maybeSingle();

    switch (body.action) {
      case 'check': {
        if (!existing) return json({ isBlocked: false, attemptCount: 0 });

        // Check if block has expired
        if (existing.blocked_until) {
          const blockedUntil = new Date(existing.blocked_until);
          if (blockedUntil > now) {
            const remainingMs = blockedUntil.getTime() - now.getTime();
            const remainingMinutes = Math.ceil(remainingMs / 60000);
            return json({
              isBlocked: true,
              blockedUntil: existing.blocked_until,
              remainingMinutes,
              attemptCount: existing.attempt_count,
            });
          }
          // Block expired — clear it
          await supabase
            .from('auth_rate_limits')
            .update({ blocked_until: null, attempt_count: 0 })
            .eq('identifier', body.identifier)
            .eq('identifier_type', identifierType);
          return json({ isBlocked: false, attemptCount: 0 });
        }

        return json({
          isBlocked: false,
          attemptCount: existing.attempt_count,
        });
      }

      case 'increment': {
        const newCount = (existing?.attempt_count || 0) + 1;
        const blockDuration = getBlockDuration(newCount);
        const blockedUntil = blockDuration
          ? new Date(now.getTime() + blockDuration * 60 * 1000).toISOString()
          : null;

        if (existing) {
          await supabase
            .from('auth_rate_limits')
            .update({
              attempt_count: newCount,
              last_attempt_at: now.toISOString(),
              blocked_until: blockedUntil,
            })
            .eq('identifier', body.identifier)
            .eq('identifier_type', identifierType);
        } else {
          await supabase
            .from('auth_rate_limits')
            .insert({
              identifier: body.identifier,
              identifier_type: identifierType,
              attempt_count: newCount,
              first_attempt_at: now.toISOString(),
              last_attempt_at: now.toISOString(),
              blocked_until: blockedUntil,
            });
        }

        const isBlocked = blockedUntil !== null;
        return json({
          success: true,
          attemptCount: newCount,
          isBlocked,
          blockedUntil,
          blockDurationMinutes: blockDuration,
        });
      }

      case 'reset': {
        if (existing) {
          await supabase
            .from('auth_rate_limits')
            .delete()
            .eq('identifier', body.identifier)
            .eq('identifier_type', identifierType);
        }
        return json({ success: true, reset: true });
      }

      default:
        return json({ error: 'Unknown action. Valid: check, increment, reset' }, 400);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[auth-rate-limit]', msg);
    return json({ error: msg }, 500);
  }
});

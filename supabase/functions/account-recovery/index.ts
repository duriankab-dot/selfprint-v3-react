/**
 * Supabase Edge Function: account-recovery
 *
 * กู้คืนบัญชีเมื่อ Passkey หาย — ส่ง Magic Link สำหรับ re-registration
 * ไม่ต้อง Auth (เพราะ user หมดสิทธิ์ login แล้ว)
 *
 * @route POST /functions/v1/account-recovery
 * Body: { email }
 *
 * Flow:
 * 1. Verify email exists in auth.users
 * 2. Rate limit check (prevent abuse)
 * 3. Send magic link via Supabase Admin Auth API
 * 4. Magic link จะ redirect ไปยัง /passkey-register หลัง login สำเร็จ
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

// Simple email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const siteUrl = Deno.env.get('SITE_URL') || 'https://selfprint.one';

  if (!supabaseUrl || !serviceKey) return json({ error: 'Supabase not configured' }, 500);

  try {
    const body = await req.json() as { email: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) return json({ error: 'email required' }, 400);
    if (!isValidEmail(email)) return json({ error: 'Invalid email format' }, 400);

    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Check rate limit for this email (reuse auth-rate-limit logic inline)
    const { data: rateLimit } = await supabase
      .from('auth_rate_limits')
      .select('attempt_count, blocked_until')
      .eq('identifier', email)
      .eq('identifier_type', 'email')
      .maybeSingle();

    if (rateLimit?.blocked_until) {
      const blockedUntil = new Date(rateLimit.blocked_until);
      if (blockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000);
        return json({
          error: `คำขอกู้คืนถูก block ชั่วคราว กรุณารอ ${remainingMinutes} นาทีแล้วลองใหม่`,
        }, 429);
      }
    }

    // 2. Check if user exists via Admin API list (search by email)
    const listRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
      {
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
        },
      }
    );

    // Always return the same message to prevent email enumeration
    // But internally we only send the magic link if user exists
    const userExists = listRes.ok && (await listRes.json().then(d => (d.users?.length || 0) > 0).catch(() => false));

    if (userExists) {
      // 3. Generate magic link → redirect to passkey re-registration page
      const magicLinkRes = await fetch(
        `${supabaseUrl}/auth/v1/admin/users/generate-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
          },
          body: JSON.stringify({
            type: 'magiclink',
            email,
            redirect_to: `${siteUrl}/passkey-register?recovery=true`,
          }),
        }
      );

      if (!magicLinkRes.ok) {
        const errText = await magicLinkRes.text();
        console.error('[account-recovery] Magic link error:', errText);
        // Don't expose internal error to user
      } else {
        console.log(`[account-recovery] Magic link sent to ${email.slice(0, 3)}***`);
      }

      // 4. Increment rate limit for this email (prevent spam)
      const now = new Date().toISOString();
      const currentCount = rateLimit?.attempt_count || 0;
      const newCount = currentCount + 1;
      const blockedUntil = newCount >= 5
        ? new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1hr block after 5 requests
        : null;

      if (rateLimit) {
        await supabase
          .from('auth_rate_limits')
          .update({ attempt_count: newCount, last_attempt_at: now, blocked_until: blockedUntil })
          .eq('identifier', email)
          .eq('identifier_type', 'email');
      } else {
        await supabase
          .from('auth_rate_limits')
          .insert({
            identifier: email,
            identifier_type: 'email',
            attempt_count: newCount,
            first_attempt_at: now,
            last_attempt_at: now,
            blocked_until: blockedUntil,
          });
      }
    }

    // Always return success to prevent email enumeration
    return json({
      success: true,
      message: 'ถ้าอีเมลนี้มีบัญชีอยู่ในระบบ เราได้ส่งลิงก์กู้คืนไปแล้ว กรุณาตรวจสอบอีเมลของคุณ',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[account-recovery]', msg);
    return json({ error: 'Internal server error' }, 500);
  }
});

/**
 * Cloudflare Pages Function: /api/autonomy-log
 * ═══════════════════════════════════════════════════════
 * Autonomy signal logging — stores Twin decision-autonomy data.
 * ═══════════════════════════════════════════════════════
 *
 * AUTONOMY-FIX-001 (3 ก.ย. 2026) — this file had four separate defects and
 * recorded exactly zero rows in production. All four are fixed here:
 *
 *  1. NO AUTH. The header comment claimed "JWT verified via Authorization
 *     header" but there was no verification anywhere in the file. Combined
 *     with `Access-Control-Allow-Origin: *` and a service_role client, any
 *     origin on the internet could write forged behavioural rows against any
 *     user_id, bypassing RLS entirely. Now: verifyUser() + user id taken
 *     from the token only, never from the body.
 *  2. PAYLOAD CONTRACT MISMATCH. The handler required
 *     { userId, twinId, autonomyLevel } but the only caller
 *     (src/features/chat/hooks/useChat.ts:160) sends
 *     { hub, mood, autonomy_level, confidence, hesitation,
 *       response_time_ms, message_length, response_length }.
 *     Every real request therefore returned 400. The client's shape is the
 *     correct one — it matches decision_log exactly (see migration
 *     supabase/migrations/001_decision_log_autonomy_tracking.sql:15-36), so
 *     the handler was aligned to the client rather than the reverse.
 *  3. WRONG TABLE. It wrote to `autonomy_signals`, which is created only by
 *     migrations/autonomy_signals_table.sql — a file in the orphaned
 *     /migrations directory that the Supabase CLI never applies, and which
 *     cannot apply anyway because line 7 references `selfprint.twins`, a
 *     relation no migration creates. decision_log is real and RLS-policied.
 *  4. FALSE SUCCESS. The insert was fire-and-forget with a .catch(), and the
 *     function returned { ok: true, stored: true } no matter what happened.
 *     The insert is now awaited and the response reports the truth.
 *
 * Auth: required — Supabase JWT via Authorization: Bearer <token>
 * Storage: public.decision_log (service_role write, user_id from JWT)
 */

import { createClient } from '@supabase/supabase-js';
import { verifyUser } from '../../api/_utils/verify-user.js';

/** Shape actually sent by src/features/chat/hooks/useChat.ts:166-175. */
interface AutonomySignalPayload {
  hub?: string;
  mood?: string;
  autonomy_level?: number;
  confidence?: number;
  hesitation?: number;
  response_time_ms?: number;
  message_length?: number;
  response_length?: number;
}

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ALLOWED_ORIGINS?: string;
  // ENVTYPE-001: verifyUser() takes Record<string, string | undefined>; without
  // an index signature a closed interface is not assignable to it.
  [key: string]: string | undefined;
}

interface PagesContext {
  request: Request;
  env: Env;
}

/**
 * CORS-ALLOWLIST-001: was `Access-Control-Allow-Origin: '*'`, which is what
 * turned every auth gap in this file into "reachable silently from any page
 * the victim happens to visit". Echo only known origins.
 */
const DEFAULT_ORIGINS = ['https://selfprint.one', 'https://www.selfprint.one'];

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const allowed = (env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? [])
    .concat(DEFAULT_ORIGINS);
  const origin = request.headers.get('Origin') ?? '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  };
  if (origin && (allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

/** decision_log CHECK constraints: 0..100 for autonomy, 0..1 for the ratios. */
function clamp(value: number | undefined | null, min: number, max: number): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.min(max, Math.max(min, value));
}

function toInt(value: number | undefined | null): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.round(value);
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const cors = corsHeaders(request, env);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method !== 'POST') {
    return json({ error: 'POST only' }, 405, cors);
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: 'Supabase not configured' }, 500, cors);
  }

  // AUTONOMY-FIX-001 (1): identity comes from the verified token, full stop.
  const user = await verifyUser(request.headers.get('authorization') ?? undefined, env);
  if (!user) {
    return json({ error: 'Unauthorized' }, 401, cors);
  }

  try {
    const payload = (await request.json()) as AutonomySignalPayload;

    // decision_log.hub is NOT NULL (migration line 18).
    if (!payload.hub) {
      return json({ error: 'hub is required' }, 400, cors);
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // AUTONOMY-FIX-001 (4): awaited, so a failure is a failure.
    const { error } = await supabase.from('decision_log').insert({
      user_id: user.id,
      hub: payload.hub,
      mood: payload.mood ?? null,
      autonomy_level: toInt(clamp(payload.autonomy_level, 0, 100)),
      confidence: clamp(payload.confidence, 0, 1),
      hesitation: clamp(payload.hesitation, 0, 1),
      response_time_ms: toInt(payload.response_time_ms),
      message_length: toInt(payload.message_length) ?? 0,
      response_length: toInt(payload.response_length) ?? 0,
    });

    if (error) {
      // Logged server-side only — never return Postgres internals to the client.
      console.error('[AutonomyLog] decision_log insert failed:', error);
      return json({ ok: false, stored: false }, 500, cors);
    }

    return json({ ok: true, stored: true }, 200, cors);
  } catch (err) {
    console.error('[AutonomyLog] Request processing failed:', err);
    return json({ ok: false, stored: false }, 400, cors);
  }
}

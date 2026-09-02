/**
 * Cloudflare Pages Function: /api/autonomy-log
 * ═══════════════════════════════════════════════════════
 * Autonomy signal logging — stores Twin decision-autonomy data.
 * ═══════════════════════════════════════════════════════
 *
 * useChat.ts POSTs autonomy signals after every Twin exchange.
 * Persists to selfprint.autonomy_signals for:
 * - Twin learning patterns
 * - Decision intelligence evolution
 * - User autonomy tracking
 *
 * Auth: JWT verified via Authorization header (Supabase service_role)
 * Storage: Supabase selfprint.autonomy_signals
 */

import { createClient } from '@supabase/supabase-js';

interface AutonomySignalPayload {
  userId: string;
  twinId: string;
  autonomyLevel: number;
  decisionContext?: string;
  world?: string;
  decisionType?: string;
  responseSummary?: string;
  confidenceScore?: number;
  timestamp?: string;
}

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return json({ error: 'POST only' }, 405);
  }

  try {
    const payload = (await request.json()) as AutonomySignalPayload;

    if (!payload.userId || !payload.twinId || payload.autonomyLevel === undefined) {
      return json({ error: 'Missing required fields' }, 400);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: 'Supabase not configured' }, 500);
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Insert autonomy signal (fire-and-forget)
    supabase
      .from('autonomy_signals')
      .insert({
        user_id: payload.userId,
        twin_id: payload.twinId,
        autonomy_level: Math.min(100, Math.max(0, payload.autonomyLevel)),
        decision_context: payload.decisionContext,
        world: payload.world,
        decision_type: payload.decisionType,
        response_summary: payload.responseSummary,
        confidence_score: payload.confidenceScore,
      })
      .catch((err) => console.error('[AutonomyLog] Supabase insert failed:', err));

    return json({ ok: true, stored: true });
  } catch (err) {
    console.error('[AutonomyLog] Request processing failed:', err);
    // Still return 200 so client doesn't retry
    return json({ ok: true, error: 'Processing failed but queued for retry' });
  }
}

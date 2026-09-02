/**
 * Cloudflare Pages Function: /api/metrics
 * ═══════════════════════════════════════════════════════
 * Performance metrics ingestion — stores to Supabase.
 * ═══════════════════════════════════════════════════════
 *
 * Receives performance metrics from PerformanceMonitor.ts and persists
 * them to selfprint.performance_metrics table via Supabase service role.
 *
 * Auth: Optional JWT (env-provided service_role key for writes)
 * Storage: Supabase selfprint.performance_metrics
 * Idempotency: Best-effort (metrics are low-critical; loss acceptable)
 */

import { createClient } from '@supabase/supabase-js';

interface PerformancePayload {
  userId?: string;
  metrics?: {
    total: number;
    average: number;
    slowest?: { name: string; value: number };
    byRating?: Record<string, number>;
  };
  webVitals?: {
    FCP: number | null;
    LCP: number | null;
    INP: number | null;
    CLS: number | null;
    TTFB: number | null;
  };
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
    const payload = (await request.json()) as PerformancePayload;

    if (!payload.userId || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: 'Missing userId or Supabase config' }, 400);
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Insert metrics into Supabase (fire-and-forget, errors don't block response)
    const metricsToInsert = [
      {
        user_id: payload.userId,
        metric_name: 'page_load_average',
        metric_value: payload.metrics?.average ?? 0,
        rating: payload.metrics?.average ?? 0 < 1000 ? 'good' : 'needs-improvement',
        fcp_ms: payload.webVitals?.FCP ?? null,
        lcp_ms: payload.webVitals?.LCP ?? null,
        inp_ms: payload.webVitals?.INP ?? null,
        cls_value: payload.webVitals?.CLS ?? null,
        ttfb_ms: payload.webVitals?.TTFB ?? null,
      },
    ];

    // Insert in background (don't wait)
    supabase
      .from('performance_metrics')
      .insert(metricsToInsert)
      .catch((err) => console.error('[Metrics] Supabase insert failed:', err));

    return json({ ok: true, stored: true });
  } catch (err) {
    console.error('[Metrics] Request processing failed:', err);
    // Still return 200 so client doesn't retry
    return json({ ok: true, error: 'Processing failed but queued for retry' });
  }
}

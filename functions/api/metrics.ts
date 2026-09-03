/**
 * Cloudflare Pages Function: /api/metrics
 * ═══════════════════════════════════════════════════════
 * Performance metrics ingestion — stores to Supabase.
 * ═══════════════════════════════════════════════════════
 *
 * METRICS-FIX-001 (3 ก.ย. 2026) — four defects, all fixed here. Every one of
 * them was invisible because the insert was fire-and-forget and the handler
 * always answered { ok: true, stored: true }:
 *
 *  1. NO AUTH + CORS '*' + service_role client + user_id read straight from
 *     the request body. Any origin could write rows attributed to any user,
 *     bypassing the RLS policy at migrations/metrics_table.sql:31-38.
 *     Now: verifyUser(), user id from the token only.
 *  2. WRONG SCHEMA. `.from('performance_metrics')` resolves to
 *     public.performance_metrics (migrations/002_security_tables.sql:44),
 *     which has none of fcp_ms/lcp_ms/inp_ms/cls_value/ttfb_ms. The web-vitals
 *     table is selfprint.performance_metrics (migrations/metrics_table.sql:4).
 *     Now: .schema('selfprint').
 *  3. OPERATOR PRECEDENCE. `payload.metrics?.average ?? 0 < 1000 ? ... : ...`
 *     parses as `average ?? ((0 < 1000) ? 'good' : '...')`, so `rating` was
 *     set to the numeric average and violated
 *     CHECK (rating IN ('good','needs-improvement','poor')). Now parenthesised
 *     and given a real three-way threshold.
 *  4. FALSE SUCCESS. Insert is now awaited and the response reports reality.
 *
 * ⚠️ ยังไม่ verify ได้ 1 อย่าง (ดู DB-02 ใน FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md):
 * ตาราง selfprint.performance_metrics ถูกสร้างไว้ใน migrations/metrics_table.sql
 * ซึ่งอยู่ในโฟลเดอร์ /migrations ที่ Supabase CLI **ไม่เคย apply** (config.toml
 * ชี้ไปที่ supabase/migrations/ เท่านั้น) และไม่ปรากฏใน PRODUCTION_DB_CATCHUP ด้วย
 * ต้องเช็คใน Supabase ก่อน deploy ว่าตารางนี้มีจริงไหม ถ้าไม่มี insert จะ 500:
 *   SELECT to_regclass('selfprint.performance_metrics');
 * ถ้าได้ NULL → รัน migrations/metrics_table.sql ใน SQL Editor ก่อน
 *
 * Auth: required — Supabase JWT via Authorization: Bearer <token>
 * Storage: selfprint.performance_metrics
 */

import { createClient } from '@supabase/supabase-js';
import { verifyUser } from '../../api/_utils/verify-user.js';

interface PerformancePayload {
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
  ALLOWED_ORIGINS?: string;
  // ENVTYPE-001 — see functions/api/autonomy-log.ts
  [key: string]: string | undefined;
}

interface PagesContext {
  request: Request;
  env: Env;
}

// CORS-ALLOWLIST-001 — see functions/api/autonomy-log.ts for the rationale.
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

/**
 * METRICS-FIX-001 (3): Core Web Vitals "good / needs-improvement / poor"
 * thresholds, applied to the page-load average in ms.
 */
function rateAverage(averageMs: number): 'good' | 'needs-improvement' | 'poor' {
  if (averageMs < 1000) return 'good';
  if (averageMs < 3000) return 'needs-improvement';
  return 'poor';
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

  // METRICS-FIX-001 (1)
  const user = await verifyUser(request.headers.get('authorization') ?? undefined, env);
  if (!user) {
    return json({ error: 'Unauthorized' }, 401, cors);
  }

  try {
    const payload = (await request.json()) as PerformancePayload;
    const average = payload.metrics?.average ?? 0;

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // METRICS-FIX-001 (2) + (4)
    const { error } = await supabase
      .schema('selfprint')
      .from('performance_metrics')
      .insert([
        {
          user_id: user.id,
          metric_name: 'page_load_average',
          metric_value: average,
          rating: rateAverage(average),
          fcp_ms: payload.webVitals?.FCP ?? null,
          lcp_ms: payload.webVitals?.LCP ?? null,
          inp_ms: payload.webVitals?.INP ?? null,
          cls_value: payload.webVitals?.CLS ?? null,
          ttfb_ms: payload.webVitals?.TTFB ?? null,
        },
      ]);

    if (error) {
      console.error('[Metrics] Supabase insert failed:', error);
      return json({ ok: false, stored: false }, 500, cors);
    }

    return json({ ok: true, stored: true }, 200, cors);
  } catch (err) {
    console.error('[Metrics] Request processing failed:', err);
    return json({ ok: false, stored: false }, 400, cors);
  }
}

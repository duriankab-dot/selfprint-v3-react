/**
 * Cloudflare Pages Function: /api/metrics
 * ═══════════════════════════════════════════════════════
 * Performance metrics stub — fire-and-forget receiver.
 * ═══════════════════════════════════════════════════════
 *
 * PerformanceMonitor.ts POSTs to /api/metrics. No CF Pages Function existed
 * (the Vercel api/metrics.ts was never ported), resulting in a 404 on every
 * performance event. This stub accepts the POST and returns 200 so the
 * frontend doesn't generate errors. No auth required (metrics are
 * fire-and-forget, same as analytics beacons).
 *
 * Future: replace the no-op body with real metric ingestion (e.g. write to a
 * Supabase table or forward to an observability service) once the feature is
 * prioritised. The interface is deliberately minimal so nothing needs to
 * change on the client side.
 */

interface Env {
  // No env vars required for the stub. Extend here when wiring real storage.
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
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return json({ error: 'POST only' }, 405);
  }

  // Consume the body so the connection closes cleanly (avoids RST on some
  // clients) without blocking the response.
  request.body?.cancel().catch(() => {});

  return json({ ok: true });
}

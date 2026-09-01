/**
 * Cloudflare Pages Function: /api/autonomy-log
 * ═══════════════════════════════════════════════════════
 * Autonomy signal logging stub.
 * ═══════════════════════════════════════════════════════
 *
 * useChat.ts POSTs decision-autonomy signals here after every Nova exchange.
 * The original api/autonomy-log.ts (Vercel format) was archived and never
 * ported to CF Pages Functions, resulting in 404s on every chat turn.
 *
 * The call in useChat.ts sits inside a try/catch and fetch() does not throw
 * on 4xx, so the 404 was silently swallowed on the client. This stub
 * eliminates the server-side 404 log noise and is ready for real metric
 * ingestion once the feature is prioritised.
 *
 * Auth: accepted but not enforced (data is non-sensitive operational signal;
 * enforcing auth here would just cause silent failures in the same try/catch).
 *
 * Future: wire to a Supabase table and validate the JWT (via verifyUser from
 * ../../api/_utils/verify-user.js) to record user_id server-side securely.
 */

interface Env {
  // No env vars required for the stub.
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

  // Consume the body so the connection closes cleanly.
  request.body?.cancel().catch(() => {});

  return json({ ok: true });
}

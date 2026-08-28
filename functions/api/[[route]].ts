/**
 * Cloudflare Pages Function: /api/* catch-all
 * ═══════════════════════════════════════════════════════
 * Routes every /api/<module>/<action...> request into
 * api/unified-handler.ts's handler(request) — the same
 * fetch-style handler that already ran on Vercel.
 *
 * CF-PAGES-MIGRATION-001 (unified-handler wiring)
 *
 * On Vercel, vercel.json's `rewrites` table turned a path like
 *   /api/stripe/create-checkout
 * into a request to /api/unified-handler?module=stripe&action=create-checkout
 * BEFORE unified-handler.ts ever saw it. Cloudflare Pages Functions has no
 * equivalent path-to-query rewrite step, so this file reproduces exactly
 * that translation (module/action mapping below mirrors vercel.json 1:1),
 * then calls the same handler() — unified-handler.ts's business logic
 * (Stripe, profile, blueprint, share, notifications, sice, twin-evolution)
 * is untouched.
 *
 * Note: twin.ts and nova.ts are NOT routed here — they have their own
 * dedicated functions (functions/api/twin.ts, functions/api/nova.ts),
 * which Cloudflare Pages matches before this catch-all.
 */

import { handler } from '../../api/unified-handler.js';

interface PagesContext {
  request: Request;
  params: { route?: string[] };
  env: Record<string, string | undefined>;
}

const KNOWN_MODULES = new Set([
  'notifications',
  'twin-evolution',
  'sice',
  'stripe',
  'profile',
  'blueprint',
]);

// Mirrors vercel.json's rewrites table exactly:
//   /api/notifications/:action*  -> module=notifications, action=:action*
//   /api/twin-evolution/:action* -> module=twin-evolution, action=:action*
//   /api/sice/:action*           -> module=sice,           action=:action*
//   /api/stripe/:action*         -> module=stripe,         action=:action*
//   /api/profile/:action*        -> module=profile,        action=:action*
//   /api/blueprint/:action*      -> module=blueprint,      action=:action*
//   /api/share (exact, no :action*) -> module=share, action=default
function toModuleAction(segments: string[]): { module: string; action: string } | null {
  if (segments.length === 0) return null;
  const [module, ...rest] = segments;

  if (module === 'share') {
    // vercel.json only rewrote the exact path "/api/share" (no wildcard).
    if (rest.length > 0) return null;
    return { module: 'share', action: 'default' };
  }

  if (!KNOWN_MODULES.has(module)) return null;
  // unified-handler.ts itself falls back to 'default' when action is empty,
  // so passing '' here (no extra segments) matches the original :action*
  // behavior exactly.
  return { module, action: rest.join('/') };
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, params, env } = context;
  const segments = params.route ?? [];
  const mapped = toModuleAction(segments);

  if (!mapped) {
    return Response.json(
      { success: false, error: `Unknown API route: /api/${segments.join('/')}` },
      { status: 404 }
    );
  }

  const url = new URL(request.url);
  url.pathname = '/api/unified-handler';
  // Preserve the original query string (e.g. /api/share?code=... ,
  // /api/notifications/list?userId=...) and only add module/action on top
  // -- matches Vercel's rewrite behavior, which merges the destination's
  // query params with the original request's rather than replacing them.
  // (Caught this by simulating a real request against the bundled worker:
  // /api/share?code=abcd1234 was reaching handleShare with `code` missing.)
  url.searchParams.set('module', mapped.module);
  if (mapped.action) url.searchParams.set('action', mapped.action);

  // Rebuild the request against the rewritten URL. Reading the body up
  // front (instead of passing request.body through) avoids streaming/
  // duplex quirks across runtimes — request bodies here are small JSON
  // payloads or a Stripe webhook payload, never large uploads.
  const method = request.method;
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const forwarded = new Request(url.toString(), {
    method,
    headers: request.headers,
    body,
  });

  return handler(forwarded, env);
}

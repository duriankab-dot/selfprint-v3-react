/**
 * rate-limit.ts
 * In-memory sliding window rate limiter for Serverless Functions.
 *
 * Limits:
 *   - Per-user (authenticated):  100 req / 60 s  to /api/intelligence
 *   - Per-IP  (all requests):   1000 req / 60 s  globally
 *
 * Usage:
 *   const result = rateLimitMiddleware(request, userId?)
 *   if (!result.ok) return Response.json({ error: result.error }, { status: 429 })
 */

interface WindowEntry {
  count: number
  windowStart: number
}

// In-memory stores — reset on cold start (acceptable for Vercel serverless)
const userWindows  = new Map<string, WindowEntry>()
const ipWindows    = new Map<string, WindowEntry>()

const WINDOW_MS         = 60_000   // 1 minute sliding window
const USER_LIMIT        = 100      // req / min per authenticated user
const IP_LIMIT          = 1_000    // req / min per IP (global guard)

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkWindow(
  store:  Map<string, WindowEntry>,
  key:    string,
  limit:  number
): { ok: boolean; remaining: number; retryAfterMs: number } {
  const now   = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // New window
    store.set(key, { count: 1, windowStart: now })
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 }
  }

  if (entry.count >= limit) {
    const retryAfterMs = WINDOW_MS - (now - entry.windowStart)
    return { ok: false, remaining: 0, retryAfterMs }
  }

  entry.count++
  return { ok: true, remaining: limit - entry.count, retryAfterMs: 0 }
}

export interface RateLimitResult {
  ok:           boolean
  error?:       string
  retryAfterMs?: number
}

/**
 * Call at the top of every unified-handler route.
 * @param request  The incoming Request object
 * @param userId   Authenticated user ID (optional — used for per-user limits)
 */
export function rateLimitMiddleware(
  request: Request,
  userId?: string | null
): RateLimitResult {
  const ip = getClientIp(request)

  // 1. Global per-IP guard
  const ipResult = checkWindow(ipWindows, ip, IP_LIMIT)
  if (!ipResult.ok) {
    return {
      ok:           false,
      error:        'Too many requests from this IP. Please slow down.',
      retryAfterMs: ipResult.retryAfterMs,
    }
  }

  // 2. Per-user guard (only for authenticated requests)
  if (userId) {
    const userResult = checkWindow(userWindows, userId, USER_LIMIT)
    if (!userResult.ok) {
      return {
        ok:           false,
        error:        'Rate limit exceeded. Please wait before sending more requests.',
        retryAfterMs: userResult.retryAfterMs,
      }
    }
  }

  return { ok: true }
}

/**
 * Build a 429 Response with Retry-After header.
 */
export function tooManyRequestsResponse(result: RateLimitResult): Response {
  const retryAfterSec = Math.ceil((result.retryAfterMs ?? WINDOW_MS) / 1000)
  return new Response(
    JSON.stringify({ success: false, error: result.error }),
    {
      status:  429,
      headers: {
        'Content-Type':  'application/json',
        'Retry-After':   String(retryAfterSec),
        'X-RateLimit-Window-Seconds': String(WINDOW_MS / 1000),
      },
    }
  )
}

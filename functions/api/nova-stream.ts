/**
 * Cloudflare Pages Function: /api/nova-stream
 * ═══════════════════════════════════════════════════════
 * NOVA — Streaming Response (SSE)
 * ═══════════════════════════════════════════════════════
 *
 * CF-PAGES-MIGRATION-001: Streaming variant of /api/nova.
 * Same auth gate, same rate limit, same model strategy — only the
 * response format differs (SSE stream vs JSON body).
 *
 * SECURITY CONTRACT: Auth + ownership parity with /api/nova
 * (P0-E3: NORMAL VS STREAMING PARITY). The stream route MUST NOT
 * be reachable without a valid Bearer token derived from the
 * authenticated Supabase session.
 *
 * MODEL STRATEGY: claude-3.5-haiku via OpenRouter (fast + responsive)
 *   Override via NOVA_MODEL_ID env var.
 *
 * Request:
 * { system: string, messages: Message[], temperature?: number, max_tokens?: number }
 *
 * Response: SSE stream (text/event-stream)
 *   data: {"type":"chunk","content":"..."}
 *   data: {"type":"done"}
 *   data: {"type":"error","message":"..."}
 *
 * Rules: lazy client, rate 60 req/min (Nova is lighter), CORS *
 */

import { getOpenRouterStream } from './_utils/ai-provider.js';
import { verifyUser } from '../../api/_utils/verify-user.js';

interface Env {
  OPENROUTER_API_KEY?: string;
  AI_PROVIDER?: string;
  NOVA_MODEL_ID?: string;
  CLAUDE_MODEL_ID?: string;
  NOVA_RATE_LIMIT?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  [key: string]: string | undefined;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const KNOWN_ORIGINS = ['https://selfprint.one', 'https://www.selfprint.one', 'http://localhost:5173', 'http://localhost:3000'];

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && KNOWN_ORIGINS.includes(origin)) {
    return { ...CORS_HEADERS, 'Access-Control-Allow-Origin': origin };
  }
  // Fallback to wildcard for now, but log warning (parity with /api/nova)
  console.warn(`[nova-stream] Unrecognized origin: ${origin}`);
  return { ...CORS_HEADERS, 'Access-Control-Allow-Origin': '*' };
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extraHeaders },
  });
}

// ── Rate limiter (user-based: per-user rate limiting via JWT user ID) ─────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, maxLimit: string | undefined): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  entry.count++;
  const max = parseInt(maxLimit || '60', 10);
  return entry.count <= max;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const origin = request.headers.get('origin') || null;
  const corsHeaders = getCorsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return json({ error: 'POST only' }, 405, corsHeaders);
  }

  // ── Auth gate (P0-E3: parity with /api/nova) ─────────────────────────
  const authHeader = request.headers.get('authorization') ?? undefined;
  if (!authHeader) {
    return json({ error: 'Unauthorized' }, 401, corsHeaders);
  }
  const user = await verifyUser(authHeader, env);
  if (!user) {
    return json({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  // ── Rate limit (user-based, parity with /api/nova and /api/twin) ───────
  if (!checkRateLimit(user.id, env.NOVA_RATE_LIMIT)) {
    return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429, corsHeaders);
  }

  if (!env.OPENROUTER_API_KEY) {
    console.error('[functions/api/nova-stream] OPENROUTER_API_KEY missing');
    return json({ error: 'API key not configured' }, 500, corsHeaders);
  }

  try {
    const body = (await request.json()) as {
      system?: string;
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
      temperature?: number;
      max_tokens?: number;
    };

    const {
      system,
      messages,
      temperature = 0.7,
      max_tokens = 1000,
    } = body;

    if (!messages?.length) {
      return json({ error: 'messages[] is required' }, 400, corsHeaders);
    }

    const model = env.NOVA_MODEL_ID || 'qwen/qwen-plus';

    // ── Stream response (SSE) ────────────────────────────────────────────
    const stream = await getOpenRouterStream(env, {
      model,
      system,
      messages,
      temperature,
      max_tokens,
    });

    // Transform OpenRouter SSE → client-friendly SSE
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = '';

    const transformedStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const payload = line.slice(6);
                if (payload === '[DONE]') {
                  controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
                } else {
                  try {
                    const parsed = JSON.parse(payload);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      controller.enqueue(
                        encoder.encode(`data: {"type":"chunk","content":${JSON.stringify(content)}}\n\n`)
                      );
                    }
                  } catch {
                    // Skip non-JSON SSE lines
                  }
                }
              }
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(
            encoder.encode(`data: {"type":"error","message":${JSON.stringify(msg)}}\n\n`)
          );
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(transformedStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[functions/api/nova-stream] Error:', msg);
    // Propagate OpenRouter rate limit (429) as 429, not 500
    if (msg.includes('429')) {
      return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429, corsHeaders);
    }
    return json({ error: 'Internal server error' }, 500, corsHeaders);
  }
}

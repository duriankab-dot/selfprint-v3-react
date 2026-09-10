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

// ── Rate limiter ──────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxLimit: string | undefined): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  entry.count++;
  const max = parseInt(maxLimit || '60', 10);
  return entry.count <= max;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') {
    return json({ error: 'POST only' }, 405);
  }

  // ── Auth gate (P0-E3: parity with /api/nova) ─────────────────────────
  const authHeader = request.headers.get('authorization') ?? undefined;
  if (!authHeader) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const user = await verifyUser(authHeader, env);
  if (!user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // ── Rate limit ─────────────────────────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';
  if (!checkRateLimit(ip, env.NOVA_RATE_LIMIT)) {
    return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429);
  }

  if (!env.OPENROUTER_API_KEY) {
    console.error('[functions/api/nova-stream] OPENROUTER_API_KEY missing');
    return json({ error: 'API key not configured' }, 500);
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
      return json({ error: 'messages[] is required' }, 400);
    }

    const model = env.NOVA_MODEL_ID || env.CLAUDE_MODEL_ID || 'anthropic/claude-3.5-haiku';

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
    return json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Cloudflare Pages Function: /api/nova
 * ═══════════════════════════════════════════════════════
 * NOVA — Universal Intelligence Guide
 * ═══════════════════════════════════════════════════════
 *
 * Ported from api/nova.ts (Vercel format) — CF-PAGES-MIGRATION-001
 * Business logic (personality, model strategy, params, rate limiting)
 * is UNCHANGED. Only the request/response adapter layer changed:
 *   - VercelRequest/VercelResponse (req, res)  →  Fetch API (Request → Response)
 *   - process.env.X                            →  context.env.X (CF Pages binding)
 *
 * WHO: Nova is a universal guide — not personal to any one user. She is the
 *   initial voice of SELFPRINT: curious, warm, socratic.
 *
 * MODEL STRATEGY: claude-3.5-haiku via OpenRouter (fast + responsive for conversational flow)
 *   Override via NOVA_MODEL_ID env var. (ANTHROPIC_API_KEY → OPENROUTER_API_KEY)
 *
 * PARAMETERS (from NovaAPIService.ts):
 *   temperature: 0.7   — measured, consistent, socratic (not too creative)
 *   max_tokens:  1000  — concise guidance, not essays
 *
 * Request:
 * { system: string, messages: Message[], temperature?: number, max_tokens?: number }
 *
 * Response: { content: string }
 *
 * Rules: lazy client, rate 60 req/min (Nova is lighter), CORS *
 */

import { callOpenRouter } from './_utils/ai-provider.js';
import { verifyUser } from '../../api/_utils/verify-user.js';

interface Env {
  OPENROUTER_API_KEY?: string;
  AI_PROVIDER?: string;
  NOVA_MODEL_ID?: string;
  CLAUDE_MODEL_ID?: string;
  NOVA_RATE_LIMIT?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  // ENVTYPE-001 — see functions/api/autonomy-log.ts
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
  console.warn(`[nova] Unrecognized origin: ${origin}`);
  return { ...CORS_HEADERS, 'Access-Control-Allow-Origin': '*' };
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extraHeaders },
  });
}

// ── Rate limiter — Nova is lightweight, higher cap ────────────────────────────
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
  const origin = request.headers.get('origin') || null;
  const corsHeaders = getCorsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return json({ error: 'POST only' }, 405, corsHeaders);
  }

  // Auth gate — verify Supabase JWT before touching OpenRouter API
  const authHeader = request.headers.get('authorization') ?? undefined;
  if (!authHeader) {
    return json({ error: 'Unauthorized' }, 401, corsHeaders);
  }
  const user = await verifyUser(authHeader, env);
  if (!user) {
    return json({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  // Rate limit (user-based: per-user rate limiting via JWT user ID — matches twin.ts pattern)
  if (!checkRateLimit(user.id, env.NOVA_RATE_LIMIT)) {
    return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429, corsHeaders);
  }

  if (!env.OPENROUTER_API_KEY) {
    console.error('[functions/api/nova] OPENROUTER_API_KEY missing');
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
      temperature = 0.7, // Measured: Nova guides, not improvises
      max_tokens = 1000, // Concise: Nova asks one good question, not a lecture
    } = body;

    if (!messages?.length) {
      return json({ error: 'messages[] is required' }, 400, corsHeaders);
    }

    // Nova uses priority-based model routing (C-06): free/cheap first, quality fallback
    // Env override: NOVA_MODEL_ID → default chain: qwen-plus → deepseek-chat → claude-haiku
    const model = env.NOVA_MODEL_ID || 'qwen/qwen-plus';
    const fallbackChain = ['qwen/qwen-plus', 'deepseek/deepseek-chat', 'anthropic/claude-3.5-haiku'];

    let lastError: Error | null = null;
    let content: string | null = null;

    for (const [i, fallbackModel] of fallbackChain.entries()) {
      try {
        const modelToUse = i === 0 ? model : fallbackModel;
        content = await callOpenRouter(env, {
          system,
          messages,
          temperature,
          max_tokens,
          model: modelToUse,
        });
        if (content) break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[nova] Model ${fallbackModel} failed:`, lastError.message);
        if (lastError.message.includes('429')) {
          return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429);
        }
        if (i === fallbackChain.length - 1) {
          throw lastError;
        }
      }
    }

    if (!content) {
      throw lastError || new Error('All models failed');
    }

    return json({ content });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[functions/api/nova] Error:', msg);
    // Propagate OpenRouter rate limit (429) as 429, not 500
    if (msg.includes('429')) {
      return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429, corsHeaders);
    }
    return json({ error: 'Internal server error' }, 500, corsHeaders);
  }
}

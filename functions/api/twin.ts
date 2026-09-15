/**
 * Cloudflare Pages Function: /api/twin
 * ═══════════════════════════════════════════════════════
 * AI TWIN — Personal Intelligence Mirror
 * ═══════════════════════════════════════════════════════
 *
 * Ported from api/twin.ts (Vercel format) — CF-PAGES-MIGRATION-001
 * Business logic (personality, model strategy, params, rate limiting)
 * is UNCHANGED. Only the request/response adapter layer changed:
 *   - VercelRequest/VercelResponse (req, res)  →  Fetch API (Request → Response)
 *   - process.env.X                            →  context.env.X (CF Pages binding)
 *
 * WHO: The user's personal AI Twin. A behavioral reflection that has studied
 *   their decision patterns, archetype, and memories deeply. NOT a generic
 *   chatbot — responds as someone who knows them intimately.
 *
 * MODEL STRATEGY: claude-3-5-sonnet (deeper reasoning for behavioral insight)
 *   Override via TWIN_MODEL_ID env var.
 *
 * PARAMETERS (from TwinAPIService.ts):
 *   temperature: 0.8   — warmer, personal touch
 *   max_tokens:  1500  — detailed behavioral insight, not one-liners
 *
 * Request:
 * { system: string, messages: Message[], temperature?: number, max_tokens?: number }
 *
 * Response: { content: string }
 *
 * Rules: lazy client, rate 40 req/min (Twin is heavier), CORS *
 */

import { callOpenRouter } from './_utils/ai-provider.js';
import { verifyUser } from '../../api/_utils/verify-user.js';

interface Env {
  OPENROUTER_API_KEY?: string;
  AI_PROVIDER?: string;
  TWIN_MODEL_ID?: string;
  CLAUDE_MODEL_ID?: string;
  TWIN_RATE_LIMIT?: string;
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
  // Fallback to wildcard for now, but log warning
  console.warn(`[twin] Unrecognized origin: ${origin}`);
  return { ...CORS_HEADERS, 'Access-Control-Allow-Origin': '*' };
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extraHeaders },
  });
}

// ── Rate limiter — Twin is expensive, lower cap than Nova ─────────────────────
// Module-scope Map persists for the lifetime of the isolate (same behavior
// as the Vercel lambda-warm-instance assumption in the original file).
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxLimit: string | undefined): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  entry.count++;
  const max = parseInt(maxLimit || '40', 10);
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

  // Auth gate — verify Supabase JWT before touching Anthropic API
  const authHeader = request.headers.get('authorization') ?? undefined;
  if (!authHeader) {
    return json({ error: 'Unauthorized' }, 401, corsHeaders);
  }
  const user = await verifyUser(authHeader, env);
  if (!user) {
    return json({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  // Rate limit (user-based: per-user rate limiting via JWT user ID)
  if (!checkRateLimit(user.id, env.TWIN_RATE_LIMIT)) {
    return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429, corsHeaders);
  }

  if (!env.OPENROUTER_API_KEY) {
    console.error('[functions/api/twin] OPENROUTER_API_KEY missing');
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
      temperature = 0.8, // Warmer: Twin is personal, not clinical
      max_tokens = 1500, // Long-form: behavioral insight needs space
    } = body;

    if (!messages?.length) {
      return json({ error: 'messages[] is required' }, 400, corsHeaders);
    }

    // Twin without a system prompt is just a generic chatbot — reject it.
    // TwinAPIService always sends a system prompt built from the user's profile.
    if (!system?.trim()) {
      return json(
        { error: 'Twin system prompt is required — Twin identity comes from the user profile.' },
        400,
        corsHeaders
      );
    }

    // Twin uses priority-based model routing (C-06): cheap capable models first
    // Env override: TWIN_MODEL_ID → default: deepseek-chat (reasoning) → qwen-plus
    const model = env.TWIN_MODEL_ID || 'deepseek/deepseek-chat';
    const fallbackChain = ['deepseek/deepseek-chat', 'qwen/qwen-plus', 'anthropic/claude-3.5-haiku'];

    let lastError: Error | null = null;
    let content: string | null = null;

    for (const [i, fallbackModel] of fallbackChain.entries()) {
      try {
        const modelToUse = i === 0 ? model : fallbackModel;
        content = await callOpenRouter(env, {
          model: modelToUse,
          temperature,
          max_tokens,
          system,
          messages,
        });
        if (content) break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[twin] Model ${fallbackModel} failed:`, lastError.message);
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
    console.error('[functions/api/twin] Error:', msg);
    // Propagate OpenRouter rate limit (429) as 429, not 500
    if (msg.includes('429')) {
      return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429, corsHeaders);
    }
    return json({ error: 'Internal server error' }, 500, corsHeaders);
  }
}

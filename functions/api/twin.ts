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

import Anthropic from '@anthropic-ai/sdk';
import { verifyUser } from '../../api/_utils/verify-user.js';

interface Env {
  ANTHROPIC_API_KEY?: string;
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

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') {
    return json({ error: 'POST only' }, 405);
  }

  // Auth gate — verify Supabase JWT before touching Anthropic API
  const authHeader = request.headers.get('authorization') ?? undefined;
  if (!authHeader) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const user = await verifyUser(authHeader, env);
  if (!user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // Rate limit
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';
  if (!checkRateLimit(ip, env.TWIN_RATE_LIMIT)) {
    return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429);
  }

  if (!env.ANTHROPIC_API_KEY) {
    console.error('[functions/api/twin] ANTHROPIC_API_KEY missing');
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
      temperature = 0.8, // Warmer: Twin is personal, not clinical
      max_tokens = 1500, // Long-form: behavioral insight needs space
    } = body;

    if (!messages?.length) {
      return json({ error: 'messages[] is required' }, 400);
    }

    // Twin without a system prompt is just a generic chatbot — reject it.
    // TwinAPIService always sends a system prompt built from the user's profile.
    if (!system?.trim()) {
      return json(
        { error: 'Twin system prompt is required — Twin identity comes from the user profile.' },
        400
      );
    }

    // Twin uses Sonnet for deeper reasoning (behavioral pattern analysis)
    // Falls back to haiku only if explicitly overridden via env
    const model = env.TWIN_MODEL_ID || env.CLAUDE_MODEL_ID || 'claude-3-5-sonnet-20241022';

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const claudeRes = await client.messages.create({
      model,
      max_tokens,
      temperature,
      system,
      messages,
    });

    const content = claudeRes.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n');

    return json({ content });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[functions/api/twin] Error:', msg);
    // DEBUGLEAK-001: `msg` is raw Anthropic SDK error text — log only.
    return json({ error: 'Internal server error' }, 500);
  }
}

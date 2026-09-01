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
 * MODEL STRATEGY: claude-3-5-haiku (fast + responsive for conversational flow)
 *   Override via NOVA_MODEL_ID env var.
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

import Anthropic from '@anthropic-ai/sdk';
import { verifyUser } from '../../api/_utils/verify-user.js';

interface Env {
  ANTHROPIC_API_KEY?: string;
  NOVA_MODEL_ID?: string;
  CLAUDE_MODEL_ID?: string;
  NOVA_RATE_LIMIT?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
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
  if (!checkRateLimit(ip, env.NOVA_RATE_LIMIT)) {
    return json({ error: 'RATE_LIMIT', retryAfter: 60 }, 429);
  }

  if (!env.ANTHROPIC_API_KEY) {
    console.error('[functions/api/nova] ANTHROPIC_API_KEY missing');
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
      temperature = 0.7, // Measured: Nova guides, not improvises
      max_tokens = 1000, // Concise: Nova asks one good question, not a lecture
    } = body;

    if (!messages?.length) {
      return json({ error: 'messages[] is required' }, 400);
    }

    // Nova can work without a custom system prompt (she has a default identity).
    // But if one is provided (hub×mood×archetype context), inject it.

    // Nova uses Haiku for speed — conversational cadence matters more than depth.
    const model = env.NOVA_MODEL_ID || env.CLAUDE_MODEL_ID || 'claude-3-5-haiku-20241022';

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const claudeRes = await client.messages.create({
      model,
      max_tokens,
      temperature,
      ...(system?.trim() ? { system } : {}),
      messages,
    });

    const content = claudeRes.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n');

    return json({ content });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[functions/api/nova] Error:', msg);
    return json({ error: 'Internal server error', message: msg }, 500);
  }
}

/**
 * Vercel API Function: /api/nova
 * ═══════════════════════════════════════════════════════
 * NOVA — Universal Intelligence Guide
 * ═══════════════════════════════════════════════════════
 *
 * WHO: Nova is a universal guide — not personal to any one user. She is the
 *   initial voice of SELFPRINT: curious, warm, socratic. She helps the user
 *   discover themselves during onboarding and explore the 12 intelligence hubs.
 *
 * PERSONALITY: Socratic Guide
 *   - Asks the right question, not all the questions
 *   - Meets the user where they are emotionally
 *   - Doesn't assume — discovers through conversation
 *   - Bridges the gap between "ดูดวง" curiosity and behavioral science
 *   - Warm, non-judgmental, exploratory
 *
 * DISTINCT FROM TWIN:
 *   - Nova = universal (same Nova for everyone), guides discovery, shorter responses
 *   - Twin = personal (unique per user), reflects known patterns, long-form insight
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
 * Rules: lazy client, rate 60 req/min (Nova is lighter), CORS *, region hnd1
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

// ── Lazy client ───────────────────────────────────────────────────────────────
function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ── Rate limiter — Nova is lightweight, higher cap ────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  entry.count++;
  // Nova is conversational + fast → higher cap than Twin
  const max = parseInt(process.env.NOVA_RATE_LIMIT || '60', 10);
  return entry.count <= max;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // Rate limit
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'RATE_LIMIT', retryAfter: 60 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[api/nova] ANTHROPIC_API_KEY missing');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const {
      system,
      messages,
      temperature = 0.7,  // Measured: Nova guides, not improvises
      max_tokens = 1000,   // Concise: Nova asks one good question, not a lecture
    } = req.body as {
      system?: string;
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
      temperature?: number;
      max_tokens?: number;
    };

    if (!messages?.length) {
      return res.status(400).json({ error: 'messages[] is required' });
    }

    // Nova can work without a custom system prompt (she has a default identity).
    // But if one is provided (hub×mood×archetype context), inject it.

    // Nova uses Haiku for speed — conversational cadence matters more than depth.
    // If the user has enough context for deeper analysis, they should be talking
    // to their Twin, not Nova.
    const model =
      process.env.NOVA_MODEL_ID ||
      process.env.CLAUDE_MODEL_ID ||
      'claude-3-5-haiku-20241022';

    const client = getClient();
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

    return res.status(200).json({ content });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/nova] Error:', msg);
    return res.status(500).json({ error: 'Internal server error', message: msg });
  }
}

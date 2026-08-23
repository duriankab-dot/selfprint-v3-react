/**
 * Vercel API Function: /api/twin
 * ═══════════════════════════════════════════════════════
 * AI TWIN — Personal Intelligence Mirror
 * ═══════════════════════════════════════════════════════
 *
 * WHO: The user's personal AI Twin. A behavioral reflection that has studied
 *   their decision patterns, archetype, and memories deeply. NOT a generic
 *   chatbot — responds as someone who knows them intimately.
 *
 * PERSONALITY: Seer-Scientist Hybrid
 *   - Behavioral certainty grounded in data (not guessing)
 *   - Surfaces patterns others miss
 *   - Insight feels almost prophetic — because it's pattern recognition
 *   - Never fortune-telling; always behavioral forecasting
 *   - 60% insight-driven, 40% empowering
 *
 * DISTINCT FROM NOVA:
 *   - Twin = personal (knows the user), world-specific expertise, long-form insight
 *   - Nova = universal guide, onboarding, discovery, shorter + exploratory
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
 * Rules: lazy client, rate 40 req/min (Twin is heavier), CORS *, region hnd1
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

// ── Lazy client ───────────────────────────────────────────────────────────────
function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ── Rate limiter — Twin is expensive, lower cap than Nova ─────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  entry.count++;
  // Twin responses are deep → lower cap to protect API costs
  const max = parseInt(process.env.TWIN_RATE_LIMIT || '40', 10);
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
    console.error('[api/twin] ANTHROPIC_API_KEY missing');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const {
      system,
      messages,
      temperature = 0.8,   // Warmer: Twin is personal, not clinical
      max_tokens = 1500,    // Long-form: behavioral insight needs space
    } = req.body as {
      system?: string;
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
      temperature?: number;
      max_tokens?: number;
    };

    if (!messages?.length) {
      return res.status(400).json({ error: 'messages[] is required' });
    }

    // Twin without a system prompt is just a generic chatbot — reject it.
    // TwinAPIService always sends a system prompt built from the user's profile.
    if (!system?.trim()) {
      return res.status(400).json({ error: 'Twin system prompt is required — Twin identity comes from the user profile.' });
    }

    // Twin uses Sonnet for deeper reasoning (behavioral pattern analysis)
    // Falls back to haiku only if explicitly overridden via env
    const model =
      process.env.TWIN_MODEL_ID ||
      process.env.CLAUDE_MODEL_ID ||
      'claude-3-5-sonnet-20241022';

    const client = getClient();
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

    return res.status(200).json({ content });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/twin] Error:', msg);
    return res.status(500).json({ error: 'Internal server error', message: msg });
  }
}

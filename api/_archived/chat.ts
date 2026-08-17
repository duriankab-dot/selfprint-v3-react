/**
 * Vercel API Function: /api/chat
 *
 * Brain Gateway — replaces Cloudflare Worker (selfprint-brain-gateway)
 *
 * Request:
 * {
 *   "messages": [{ "role": "user", "content": "..." }],
 *   "system": "You are Nova...",      ← system prompt for personalization
 *   "model": "claude-3-5-sonnet-20241022",   ← optional
 *   "temperature": 0.7                        ← optional
 * }
 *
 * Response:
 * {
 *   "response": "...",
 *   "metadata": { "inputTokens": N, "outputTokens": N, "processingTimeMs": N }
 * }
 *
 * Rules:
 * - lazy client: never construct Anthropic() at module scope (throws on missing key)
 * - Rate limit: 100 req/min per IP
 * - CORS: * (same policy as all api/*.ts files)
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

// ── Lazy client (ดู comment เดียวกันใน api/intelligence.ts) ──────────────────
function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ── Rate limiter ──────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  entry.count++;
  const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
  return entry.count <= max;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  system?: string;
  model?: string;
  temperature?: number;
  // forwarded context (stored for future analytics, not required by Claude)
  context?: Record<string, unknown>;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id, X-Session-Id');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // Rate limit
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket.remoteAddress
    || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'RATE_LIMIT', retryAfter: 60 });
  }

  // API key guard
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[api/chat] ANTHROPIC_API_KEY is missing');
    return res.status(500).json({ error: 'API key not configured' });
  }

  const startTime = Date.now();

  try {
    const body = req.body as ChatRequestBody;

    if (!body?.messages?.length) {
      return res.status(400).json({ error: 'messages[] is required' });
    }

    const claudeRequest: Parameters<Anthropic['messages']['create']>[0] = {
      model: body.model || process.env.CLAUDE_MODEL_ID || 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      temperature: body.temperature ?? 0.7,
      messages: body.messages,
    };

    // Inject system prompt when provided (Nova personalization)
    if (body.system && body.system.trim().length > 0) {
      claudeRequest.system = body.system;
    }

    const claude = getClient();
    const claudeRes = await claude.messages.create(claudeRequest);

    const processingTimeMs = Date.now() - startTime;
    const text = claudeRes.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n');

    return res.status(200).json({
      response: text,
      metadata: {
        inputTokens: claudeRes.usage.input_tokens,
        outputTokens: claudeRes.usage.output_tokens,
        processingTimeMs,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/chat] Error:', msg);
    return res.status(500).json({ error: 'Internal server error', message: msg });
  }
}

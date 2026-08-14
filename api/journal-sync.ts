/**
 * Vercel API Function: /api/journal-sync
 *
 * § 37 Offline Journal Queue — Sync endpoint
 *
 * Request:
 * {
 *   "queueId": "uuid",
 *   "content": "message text",
 *   "hub": "hub_name",
 *   "mood": "mood_name",
 *   "createdAt": "iso_timestamp"
 * }
 *
 * Process:
 * 1. Verify user from JWT
 * 2. Send to AI (Claude) for response
 * 3. Save both user + AI message to chat_messages
 * 4. Mark queue item as synced
 * 5. Return response + metadata
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { verifyUser, supabaseAdmin } from './_utils/verify-user.js';  // <-- แก้เป็น .js

// ── Lazy client ────────────────────────────────────────────────────────
function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not configured');
  return new Anthropic({ apiKey: key });
}

// ── Types ──────────────────────────────────────────────────────────────
interface JournalSyncRequest {
  queueId: string;
  content: string;
  hub?: string;
  mood?: string;
  createdAt: string;
}

// ── Handler ────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    // Verify user
    const user = await verifyUser(req.headers['authorization']);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const body = req.body as JournalSyncRequest;
    if (!body?.content || !body?.queueId) {
      return res.status(400).json({ error: 'content and queueId required' });
    }

    // Get Twin context for personalization
    const twinContext = await getTwinContext(user.id);
    const systemPrompt = buildSystemPrompt(body.hub, body.mood, twinContext);

    // Call Claude
    const startTime = Date.now();
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL_ID || 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: body.content,
        },
      ],
    });

    const processingTimeMs = Date.now() - startTime;
    const assistantContent = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n');

    // Save messages to Supabase (if service role available)
    if (supabaseAdmin) {
      try {
        // Save user message
        await supabaseAdmin.from('chat_messages').insert({
          user_id: user.id,
          role: 'user',
          content: body.content,
          hub: body.hub,
          mood: body.mood,
          created_at: body.createdAt,
        });

        // Save AI response
        await supabaseAdmin.from('chat_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: assistantContent,
          hub: body.hub,
          mood: body.mood,
          created_at: new Date().toISOString(),
        });

        // Mark queue as synced
        await supabaseAdmin
          .from('journal_queue')
          .update({
            synced_at: new Date().toISOString(),
            sync_error: null,
            sync_attempts: 0,
          })
          .eq('id', body.queueId)
          .eq('user_id', user.id);

        console.log(`[journal-sync] Synced ${body.queueId} for user ${user.id}`);
      } catch (dbErr) {
        console.error('[journal-sync] Database error:', dbErr);
        // Don't fail if DB write fails — return the AI response anyway
      }
    }

    return res.status(200).json({
      success: true,
      response: assistantContent,
      metadata: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        processingTimeMs,
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[journal-sync] Error:', msg);
    return res.status(500).json({ error: 'Internal server error', message: msg });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

interface TwinContext {
  currentHub?: string;
  recentMood?: string;
  archetypeCount?: number;
}

async function getTwinContext(userId: string): Promise<TwinContext> {
  if (!supabaseAdmin) return {};

  try {
    const { data } = await supabaseAdmin
      .from('personal_models')
      .select('context_data')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data?.context_data) return {};

    return {
      currentHub: (data.context_data as any).primaryHub,
      recentMood: (data.context_data as any).lastMood,
      archetypeCount: (data.context_data as any).archetypeCount,
    };
  } catch (err) {
    console.warn('[journal-sync] Failed to get twin context:', err);
    return {};
  }
}

function buildSystemPrompt(
  hub?: string,
  mood?: string,
  context?: TwinContext
): string {
  const basePrompt = `You are Nova, a personal AI Twin that knows and understands the user deeply.

Guidelines:
- Respond with empathy and personal insight
- Reference their current context (${hub || 'General'} hub, ${mood || 'balanced'} mood)
- Keep responses concise (1-3 sentences)
- Offer genuine guidance, not generic advice
- Remember you're conversing with the real person, not an abstraction`;

  if (context?.archetypeCount) {
    return (
      basePrompt +
      `\n\nContext: User has explored ${context.archetypeCount} archetypes. Tailor responses to their evolving self-understanding.`
    );
  }

  return basePrompt;
}
/**
 * NovaAPIService.ts
 * Claude API integration for Nova responses.
 *
 * P0-E: Nova prompt now uses the sophisticated hub×mood×archetype builder
 * (`lib/nova-prompts/getNovaPrompt`) so every Nova call adapts to the user's
 * current context — not just a static phase string.
 *
 * Backward-compatible: `phase` param kept for callers that haven't migrated
 * yet; `context` param is additive and optional.
 */

import { getNovaPrompt, AVAILABLE_HUBS, AVAILABLE_MOODS, AVAILABLE_ARCHETYPES } from '../lib/nova-prompts/getNovaPrompt';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Rich context for Nova prompt composition.
 * All fields optional — safe defaults applied when omitted.
 */
export interface NovaCallContext {
  /** Which of the 12 hubs the user is currently exploring. Default: 'identity'. */
  hub?: string;
  /** User's current emotional/readiness state. Default: 'ready'. */
  mood?: string;
  /** User's primary archetype (from analysis). Default: 'sage'. */
  archetype?: string;
  /** Language for guardrail text. Default: 'en'. */
  language?: 'en' | 'th';
  /** Maturity score 0-100 (how far along the Twin journey). Default: 0 (pre-Twin). */
  maturityScore?: number;
  userProfile?: {
    decisionStyle?: string;
    primaryArchetype?: string;
    secondaryArchetype?: string;
    strengths?: string[];
    blindSpots?: string[];
  };
}

/** Validate + coerce context values to known valid options. */
function resolveContext(ctx?: NovaCallContext): Parameters<typeof getNovaPrompt>[0] {
  const hub = ctx?.hub && AVAILABLE_HUBS.includes(ctx.hub) ? ctx.hub : 'identity';
  const mood = ctx?.mood && AVAILABLE_MOODS.includes(ctx.mood) ? ctx.mood : 'ready';
  const archetype = ctx?.archetype && AVAILABLE_ARCHETYPES.includes(ctx.archetype) ? ctx.archetype : 'sage';
  return {
    hub: hub as Parameters<typeof getNovaPrompt>[0]['hub'],
    mood: mood as Parameters<typeof getNovaPrompt>[0]['mood'],
    archetype,
    language: ctx?.language ?? 'en',
    maturityScore: ctx?.maturityScore ?? 0,
    userProfile: ctx?.userProfile,
  };
}

/**
 * Call Claude API for Nova response.
 *
 * @param messages  Conversation history
 * @param _phase    Kept for backward-compat, no longer used (ignored)
 * @param context   Hub/mood/archetype context for prompt adaptation
 */
export async function callNovaAPI(
  messages: Message[],
  _phase?: string,
  context?: NovaCallContext
): Promise<string> {
  try {
    if (!messages.length) {
      throw new Error('No messages to process');
    }

    // P0-E: sophisticated hub×mood×archetype prompt — replaces static template
    const systemPrompt = getNovaPrompt(resolveContext(context));

    const response = await fetch('/api/nova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content || 'I appreciate you sharing that with me.';
  } catch (err) {
    console.error('Nova API error:', err);
    throw err;
  }
}

/**
 * Stream Nova response (for real-time feedback).
 *
 * @param messages   Conversation history
 * @param _phase     Kept for backward-compat, no longer used
 * @param onChunk    Called with each streamed chunk
 * @param context    Hub/mood/archetype context for prompt adaptation
 */
export async function streamNovaResponse(
  messages: Message[],
  _phase: string,
  onChunk: (chunk: string) => void,
  context?: NovaCallContext
): Promise<void> {
  try {
    const systemPrompt = getNovaPrompt(resolveContext(context));

    const response = await fetch('/api/nova-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6);
          if (content) onChunk(content);
        }
      }
    }
  } catch (err) {
    console.error('Nova stream error:', err);
    throw err;
  }
}

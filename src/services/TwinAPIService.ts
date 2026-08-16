/**
 * TwinAPIService.ts
 * Claude API integration for Twin responses (world-aware)
 */

import { buildTwinSystemPrompt } from '../config/twin-prompts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Call Claude API for Twin response
 */
export async function callTwinAPI(
  messages: Message[],
  twinName: string,
  twinProfile: string,
  worldId?: string
): Promise<string> {
  try {
    if (!messages.length) {
      throw new Error('No messages to process');
    }

    // Build world-aware system prompt
    const systemPrompt = buildTwinSystemPrompt(
      twinName,
      twinProfile,
      worldId,
      undefined, // currentMood
      messages
        .filter(m => m.role === 'user')
        .slice(-3)
        .map(m => m.content)
        .join(' | ')
    );

    // Call Claude API
    const response = await fetch('/api/twin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.8, // Slightly warmer for personal touch
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content || 'I understand. Tell me more.';
  } catch (err) {
    console.error('Twin API error:', err);
    throw err;
  }
}

/**
 * Stream Twin response with world awareness
 */
export async function streamTwinResponse(
  messages: Message[],
  twinName: string,
  twinProfile: string,
  worldId: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const systemPrompt = buildTwinSystemPrompt(
      twinName,
      twinProfile,
      worldId,
      undefined,
      messages
        .filter(m => m.role === 'user')
        .slice(-3)
        .map(m => m.content)
        .join(' | ')
    );

    const response = await fetch('/api/twin-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages,
        temperature: 0.8,
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
    console.error('Twin stream error:', err);
    throw err;
  }
}

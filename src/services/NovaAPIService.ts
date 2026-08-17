/**
 * NovaAPIService.ts
 * Claude API integration for Nova responses
 */

import { NOVA_SYSTEM_PROMPT } from '../config/nova-prompts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Call Claude API for Nova response
 */
export async function callNovaAPI(
  messages: Message[],
  phase?: string
): Promise<string> {
  try {
    if (!messages.length) {
      throw new Error('No messages to process');
    }

    // Format system prompt with context
    const systemPrompt = NOVA_SYSTEM_PROMPT
      .replace('{{ phase }}', phase || 'onboarding')
      .replace('{{ userDataCollected }}', '{}')
      .replace('{{ insightsGenerated }}', '[]');

    // Call Claude API (via backend proxy to avoid CORS)
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
 * Stream Nova response (for real-time feedback)
 */
export async function streamNovaResponse(
  messages: Message[],
  phase: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const systemPrompt = NOVA_SYSTEM_PROMPT
      .replace('{{ phase }}', phase)
      .replace('{{ userDataCollected }}', '{}')
      .replace('{{ insightsGenerated }}', '[]');

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

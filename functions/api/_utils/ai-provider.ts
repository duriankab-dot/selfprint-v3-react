/**
 * Cloudflare Pages Function Utility: ai-provider
 *
 * Thin OpenRouter REST client used by the Pages functions.
 * Replaces the Anthropic SDK (`@anthropic-ai/sdk`) so the worker
 * no longer ships the SDK bundle — a single fetch() against
 * https://openrouter.ai/api/v1/chat/completions.
 *
 * Model slugs must use OpenRouter's `vendor/model-name` format,
 * e.g. `anthropic/claude-3.5-haiku`.
 */

interface CallAIOptions {
  system?: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  temperature: number;
  max_tokens: number;
  model: string;
}

export async function callOpenRouter(
  env: Record<string, string | undefined>,
  opts: CallAIOptions
): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://selfprint.app',
      'X-Title': 'SelfPrint',
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        ...(opts.system?.trim() ? [{ role: 'system', content: opts.system }] : []),
        ...opts.messages,
      ],
      temperature: opts.temperature,
      max_tokens: opts.max_tokens,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[ai-provider] OpenRouter error:', res.status, errorText);
    throw new Error(`OpenRouter API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}
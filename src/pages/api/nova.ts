/**
 * api/nova.ts
 * Backend API for Nova Claude calls
 *
 * NOTE: This assumes Next.js API routes
 * For Vite, use a backend server (Express/FastAPI)
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { system, messages, temperature, max_tokens } = req.body;

    // GUARD: Validate inputs
    if (!system || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    // Get Claude API key from environment
    const apiKey = (globalThis as any).process?.env?.ANTHROPIC_API_KEY || process?.env?.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: max_tokens || 1000,
        system,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return res.status(response.status).json({ error: 'Failed to get response' });
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    res.status(200).json({ content });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

# 🔀 OpenRouter Migration Spec

**Project:** SELFPRINT V3 (selfprint-v3-react)
**Status:** 📋 Plan — not yet implemented
**Date:** 2026-09-04
**Target commit:** after `c2ed654`

---

## 1. Why OpenRouter

| | Anthropic (current) | OpenRouter (target) |
|---|---|---|
| Provider | Single vendor | Aggregator (Anthropic, OpenAI, Google, Meta, Mistral, DeepSeek, ...) |
| Model choice | Claude only | 300+ models, one API |
| Pricing | Per-vendor | Per-model, often cheaper |
| Key | `ANTHROPIC_API_KEY` | `OPENROUTER_API_KEY` |
| API style | Anthropic Messages API | OpenAI-compatible Chat Completions |

**Goal:** Keep the app working while Anthropic tokens are being used up, then flip to OpenRouter with zero code changes (only env vars).

---

## 2. Current AI Surface (what must change)

The client only talks to two Cloudflare Pages Functions. **No client code changes needed.**

| File | Role | Model (default) | Temp | Max tokens |
|---|---|---|---|---|
| [`functions/api/nova.ts`](D:/selfprint-v3-react/functions/api/nova.ts:31) | Nova guide | `claude-3-5-haiku-20241022` | 0.7 | 1000 |
| [`functions/api/twin.ts`](D:/selfprint-v3-react/functions/api/twin.ts:32) | AI Twin | `claude-3-5-sonnet-20241022` | 0.8 | 1500 |

Client callers (unchanged):
- [`src/services/NovaAPIService.ts`](D:/selfprint-v3-react/src/services/NovaAPIService.ts:81) → `POST /api/nova`
- [`src/services/TwinAPIService.ts`](D:/selfprint-v3-react/src/services/TwinAPIService.ts:92) → `POST /api/twin`

The SICE orchestrator (12 engines) is **rule-based** — no AI calls. Not affected.

---

## 3. Design: Dual-Provider with Feature Flag

Use an env flag `AI_PROVIDER` to switch providers without redeploying code.

```
AI_PROVIDER=anthropic   # default — keep using existing Anthropic tokens
AI_PROVIDER=openrouter  # flip to this when tokens run out
```

### 3.1 Env vars (Cloudflare Pages → Settings → Environment Variables)

| Variable | Value | Notes |
|---|---|---|
| `AI_PROVIDER` | `anthropic` \| `openrouter` | Default `anthropic` |
| `ANTHROPIC_API_KEY` | existing | keep until tokens exhausted |
| `OPENROUTER_API_KEY` | `sk-or-...` | new |
| `NOVA_MODEL_ID` | e.g. `anthropic/claude-3.5-haiku` | OpenRouter model slug |
| `TWIN_MODEL_ID` | e.g. `anthropic/claude-3.5-sonnet` | OpenRouter model slug |
| `CLAUDE_MODEL_ID` | fallback | used when NOVA/TWIN not set |

> ⚠️ OpenRouter model IDs use the format `vendor/model` (e.g. `anthropic/claude-3.5-sonnet`, `openai/gpt-4o`, `google/gemini-2.0-flash`). These are **different** from Anthropic's `claude-3-5-sonnet-20241022`.

### 3.2 Model mapping (recommended defaults)

| Role | Anthropic (current) | OpenRouter (recommended) |
|---|---|---|
| Nova (fast, conversational) | `claude-3-5-haiku-20241022` | `anthropic/claude-3.5-haiku` |
| Twin (deep reasoning) | `claude-3-5-sonnet-20241022` | `anthropic/claude-3.5-sonnet` |

Both can be overridden via `NOVA_MODEL_ID` / `TWIN_MODEL_ID`.

---

## 4. Implementation Plan (for later — Code mode)

### Step 1 — Create a shared provider module

New file: `functions/api/_utils/ai-provider.ts`

```ts
// Pseudo-code — single place that decides which provider to call
export async function callAI(env, opts: {
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  temperature: number;
  max_tokens: number;
  model: string;          // resolved model id
}): Promise<string> {
  if (env.AI_PROVIDER === 'openrouter') {
    // OpenRouter: OpenAI-compatible REST call
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        // Optional: 'HTTP-Referer' + 'X-Title' for OpenRouter rankings
      },
      body: JSON.stringify({
        model: opts.model,
        messages: [
          ...(opts.system ? [{ role: 'system', content: opts.system }] : []),
          ...opts.messages,
        ],
        temperature: opts.temperature,
        max_tokens: opts.max_tokens,
      }),
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  // Anthropic (default)
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const claudeRes = await client.messages.create({
    model: opts.model,
    max_tokens: opts.max_tokens,
    temperature: opts.temperature,
    ...(opts.system?.trim() ? { system: opts.system } : {}),
    messages: opts.messages,
  });
  return claudeRes.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
}
```

### Step 2 — Refactor `functions/api/nova.ts`

- Replace the inline `new Anthropic(...)` + `client.messages.create(...)` block with a call to `callAI(env, {...})`.
- Resolve model: `env.NOVA_MODEL_ID || env.CLAUDE_MODEL_ID || 'claude-3-5-haiku-20241022'`.
- Keep auth gate, rate limiting, CORS, error handling **unchanged**.

### Step 3 — Refactor `functions/api/twin.ts`

- Same refactor; model: `env.TWIN_MODEL_ID || env.CLAUDE_MODEL_ID || 'claude-3-5-sonnet-20241022'`.
- Keep the "system prompt required" guard.

### Step 4 — Update `.env.example`

Add:
```env
# AI Provider — anthropic (default) | openrouter
AI_PROVIDER=anthropic
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Step 5 — Update docs

- `docs/DEPLOYMENT.md` — add OpenRouter env vars to the CF Pages section.
- `docs/API.md` — note provider abstraction.

### Step 6 — Verify

```bash
npm run typecheck:functions   # functions compile
npm run build                 # full build
npm test                      # unit tests
```

Manual smoke test:
1. `AI_PROVIDER=anthropic` → Nova + Twin respond (existing tokens).
2. `AI_PROVIDER=openrouter` → Nova + Twin respond via OpenRouter.

---

## 5. Rollback

- Flip `AI_PROVIDER` back to `anthropic` in CF Pages dashboard → instant rollback, no deploy.
- Both keys can coexist; no data migration.

---

## 6. Risks & Notes

| Risk | Mitigation |
|---|---|
| OpenRouter model slug typos | Validate against OpenRouter model list; keep `CLAUDE_MODEL_ID` fallback |
| OpenRouter latency variance | Nova/Twin already tolerate ~100-150ms; monitor |
| Rate limits differ per model | Keep existing per-IP rate limits (60/40 per min) |
| Streaming (if used later) | OpenRouter supports SSE; add later if `streamNovaResponse` needs it |
| `@anthropic-ai/sdk` still in deps | Keep until Anthropic tokens fully consumed; remove in a later cleanup PR |

---

**Status:** 📋 Plan approved — implementation deferred until Anthropic tokens are consumed.
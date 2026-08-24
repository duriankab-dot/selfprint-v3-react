# API Overview

SELFPRINT has two main AI endpoints: **Twin** (personal expert) and **Nova** (universal guide).

---

## Endpoints Summary

| Endpoint | Model | Purpose | Rate Limit |
|----------|-------|---------|-----------|
| `POST /api/twin` | Claude Sonnet | Personal AI expert | 40 req/min |
| `POST /api/nova` | Claude Haiku | Universal guide | 60 req/min |

---

## /api/twin — Personal Expert

**Purpose:** Answer questions with full knowledge of the user's profile.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Why do I keep making the same mistakes?"},
    {"role": "assistant", "content": "..."}
  ],
  "twinName": "Aria",
  "twinProfile": {
    "name": "Jane",
    "primaryArchetype": "visionary",
    "maturityScore": 65,
    "strengths": ["Leadership", "Vision", "Creativity"],
    "blindSpots": ["Follow-through", "Patience"],
    "guidance": ["Trust your instincts", "Complete before starting new"]
  },
  "worldId": "self",
  "recentMemories": [...]
}
```

**Response:**
```json
{
  "text": "Based on your pattern of vision over execution, you're likely frustrated because... I recommend...",
  "metadata": {
    "model": "claude-3-5-sonnet-20241022",
    "usage": {"input_tokens": 1200, "output_tokens": 450}
  }
}
```

**Key:** Includes full `twinProfile` so Twin knows about you.

---

## /api/nova — Universal Guide

**Purpose:** Give advice without knowing user details (universal Socratic guide).

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "How do I make better decisions?"}
  ],
  "worldId": null
}
```

**Response:**
```json
{
  "text": "Decision-making often improves when we clarify our values first. What's most important to you right now?",
  "metadata": {
    "model": "claude-3-5-haiku-20241022",
    "usage": {"input_tokens": 150, "output_tokens": 80}
  }
}
```

**Key:** No user profile — pure guidance.

---

## Key Differences

| Aspect | Twin | Nova |
|--------|------|------|
| **Knows user?** | ✅ Yes (full profile) | ❌ No |
| **Model** | Sonnet (stronger) | Haiku (faster) |
| **Response style** | Personal, referential | Universal, Socratic |
| **Use case** | Life decisions | Learning/exploration |
| **Cost per call** | ~$0.015 | ~$0.002 |

---

## Authentication

All endpoints require Supabase JWT:

```bash
curl -X POST http://localhost:3000/api/twin \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"messages": [...], "twinProfile": {...}}'
```

**Without token:** Returns 401 Unauthorized

---

## Rate Limiting

Responses include rate limit headers:

```
X-RateLimit-Limit: 40
X-RateLimit-Remaining: 37
X-RateLimit-Reset: 2026-08-24T15:35:00Z
```

If exceeded (HTTP 429):
```json
{
  "error": "Too many requests",
  "retryAfter": 35,
  "resetAt": "2026-08-24T15:35:00Z"
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Invalid request format |
| 401 | Missing/invalid auth token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Integration Points

### From Frontend

**TwinChat.tsx:**
```typescript
const response = await callTwinAPI(
  apiMessages,
  twin.name,
  twinProfile,  // ← Full user context
  worldId,
  recentMemories
);
```

**NovaPage.tsx:**
```typescript
const response = await callNovaAPI(
  apiMessages,
  // No profile
);
```

### Supabase Connection

Both endpoints query:
- `user_profiles` (birth data, preferences)
- `personal_memory` (recent memories to inject)
- `twin_world_expertise` (if worldId provided)

---

## Testing Locally

```bash
# Start dev server
npm run dev

# In another terminal, test Twin
curl -X POST http://localhost:3000/api/twin \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "twinProfile": {
      "name": "Test User",
      "primaryArchetype": "visionary",
      "maturityScore": 50,
      "strengths": [],
      "blindSpots": [],
      "guidance": []
    }
  }'
```

---

## Files

- **Implementation:** `src/api/twin.ts`, `src/api/nova.ts`
- **Frontend caller:** `src/services/TwinAPIService.ts`
- **Middleware:** `src/api/middleware/`

---

**Last Updated:** 2026-08-24  
**Status:** Production verified

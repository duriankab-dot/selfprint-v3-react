# API Middleware — Rate Limiting & Validation

## Overview

Two middleware modules protect Selfprint API endpoints:

1. **`rateLimiter.ts`** — Token-bucket rate limiting per user/IP
2. **`validators.ts`** — Schema-based input validation

---

## Rate Limiting

### Configuration

Three tiers for different endpoint cost:

```typescript
CRITICAL: 10 requests/hour (Twin creation, awakening triggers)
STANDARD: 100 requests/hour (Feedback, memory operations)
BASIC:    1000 requests/hour (Reads, non-blocking queries)
```

### Usage

```typescript
import { rateLimiterMiddleware } from './middleware/rateLimiter';

// Apply to Express route
app.post('/api/twin/create', rateLimiterMiddleware('CRITICAL'), createTwinHandler);
app.post('/api/core-awakening', rateLimiterMiddleware('CRITICAL'), awakeningHandler);
app.post('/api/feedback', rateLimiterMiddleware('STANDARD'), feedbackHandler);
```

### Rate Limit Headers

Responses include:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2026-08-20T10:30:00Z
```

When limit exceeded (HTTP 429):

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded for tier: CRITICAL",
  "retryAfter": 35,
  "resetAt": "2026-08-20T10:30:00Z"
}
```

---

## Input Validation

### Validators

Core validators for common data types:

- `string(value, field, { minLength, maxLength, pattern })`
- `uuid(value, field)`
- `email(value, field)`
- `number(value, field, { min, max, integer })`
- `boolean(value, field)`
- `array(value, field, { itemValidator, minItems, maxItems })`
- `enum(value, field, allowedValues)`

### Endpoint Schemas

Pre-defined schemas for 3 critical endpoints:

#### 1. Create Twin

```typescript
POST /api/twin/create
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",  // Required UUID
  "twinName": "Aria",                                  // 2-50 chars
  "birthData": {                                       // Optional
    "date": "1995-03-15",
    "time": "14:30",
    "timezone": "America/New_York"
  },
  "personalityEssence": "..."                          // Optional, max 1000 chars
}
```

#### 2. Submit Feedback

```typescript
POST /api/core-awakening
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",  // Required UUID
  "insightId": "550e8400-e29b-41d4-a716-446655440001", // Required UUID
  "feedbackType": "very_true",                         // Required: very_true|somewhat|not_sure|not_me
  "comment": "This resonates with me deeply"          // Optional, max 500 chars
}
```

#### 3. Send Notification

```typescript
POST /api/notification-endpoints
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",  // Required UUID
  "type": "achievement",                               // Required: achievement|milestone|reminder|insight|prompt
  "title": "Twin Awakening Complete",                 // 1-200 chars
  "message": "Your twin has completed core awakening", // 1-1000 chars
  "priority": "high",                                  // Optional: low|normal|high
  "metadata": { ... }                                  // Optional: any object
}
```

### Usage

```typescript
import { validatorMiddleware, ENDPOINT_SCHEMAS } from './middleware/validators';

// Apply to Express routes
app.post(
  '/api/twin/create',
  validatorMiddleware(ENDPOINT_SCHEMAS.createTwin),
  createTwinHandler
);

app.post(
  '/api/core-awakening',
  validatorMiddleware(ENDPOINT_SCHEMAS.submitFeedback),
  feedbackHandler
);

app.post(
  '/api/notification-endpoints',
  validatorMiddleware(ENDPOINT_SCHEMAS.sendNotification),
  notificationHandler
);

// In handler: use req.validatedBody
async function createTwinHandler(req, res) {
  const { userId, twinName, birthData, personalityEssence } = req.validatedBody;
  // ... handler logic
}
```

### Validation Errors

On validation failure (HTTP 400):

```json
{
  "error": "Validation error",
  "field": "twinName",
  "message": "twinName must be at least 2 characters",
  "code": "MIN_LENGTH"
}
```

Error codes:
- `TYPE_ERROR` — Wrong data type
- `MIN_LENGTH` / `MAX_LENGTH` — String length violation
- `PATTERN_MISMATCH` — Regex pattern mismatch
- `INVALID_UUID` / `INVALID_EMAIL` — Format error
- `OUT_OF_RANGE` — Number outside min/max
- `INVALID_ENUM` — Value not in allowed list
- `REQUIRED` — Missing required field
- `VALIDATION_FAILED` — Custom validation error

---

## Combined Usage

Apply both middlewares in order:

```typescript
app.post(
  '/api/twin/create',
  rateLimiterMiddleware('CRITICAL'),           // Check rate limit first
  validatorMiddleware(ENDPOINT_SCHEMAS.createTwin), // Then validate input
  createTwinHandler                             // Then execute
);
```

Flow:
1. **Rate limit check** → If exceeded, return 429 immediately
2. **Input validation** → If invalid, return 400 with field errors
3. **Handler execution** → If all pass, execute handler with `req.validatedBody`

---

## Testing Rate Limits

```bash
# First request (OK)
curl -X POST http://localhost:3000/api/twin/create \
  -H "Authorization: Bearer token"

# Response includes: X-RateLimit-Remaining: 9

# After 10+ requests (rate limited)
curl -X POST http://localhost:3000/api/twin/create

# Response 429:
# {"error": "Too many requests", "retryAfter": 35}
```

---

## Monitoring & Maintenance

**Cleanup old buckets:**
```typescript
import { cleanupOldBuckets } from './middleware/rateLimiter';

// Run hourly
setInterval(() => cleanupOldBuckets(86400000), 3600000);
```

**Production Notes:**
- Replace in-memory store with Redis for distributed systems
- Add metrics logging for rate limit hits
- Monitor validation error rates
- Adjust tier limits based on usage patterns

---

*Middleware documentation for Selfprint Phase 1*  
*Task #7: Rate Limiting & Input Validation*

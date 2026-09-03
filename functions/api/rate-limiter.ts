/**
 * CF KV Rate Limiter
 * Cloudflare Pages Functions rate limiting using KV storage
 * Scales across all CF edge locations (unlike in-memory Map)
 */

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  requestCount: number;
  lastReset: number;
}

/**
 * Rate Limiter Configuration
 * Different limits for different endpoint tiers
 */
export const RATE_LIMITS = {
  // Tier 1: Critical operations (Twin creation, awakening)
  CRITICAL: {
    requestsPerHour: 10,
    tokensPerRequest: 10,
    maxBurst: 3,
  },

  // Tier 2: Standard operations (feedback, memory)
  STANDARD: {
    requestsPerHour: 100,
    tokensPerRequest: 1,
    maxBurst: 20,
  },

  // Tier 3: Low-cost operations (reads, insights)
  BASIC: {
    requestsPerHour: 1000,
    tokensPerRequest: 0.1,
    maxBurst: 100,
  },
};

/**
 * Get or create rate limit bucket from CF KV
 */
async function getBucket(
  kv: KVNamespace,
  key: string,
  limit: (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS]
): Promise<RateLimitBucket> {
  const stored = await kv.get<RateLimitBucket>(key, 'json');

  if (stored) {
    return stored;
  }

  // New bucket
  const bucket: RateLimitBucket = {
    tokens: limit.maxBurst,
    lastRefill: Date.now(),
    requestCount: 0,
    lastReset: Date.now(),
  };

  // Store in KV with 24-hour TTL (automatic cleanup)
  await kv.put(key, JSON.stringify(bucket), { expirationTtl: 86400 });

  return bucket;
}

/**
 * Refill tokens based on time elapsed
 * Token refill rate: (requestsPerHour / 3600000 ms) = tokens per ms
 */
function refillTokens(
  bucket: RateLimitBucket,
  limit: (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS]
): void {
  const now = Date.now();
  const timeSinceRefill = now - bucket.lastRefill;

  // Tokens refill at rate of requestsPerHour per 3600 seconds
  const refillRate = limit.requestsPerHour / 3600000; // tokens per millisecond
  const tokensToAdd = timeSinceRefill * refillRate;

  bucket.tokens = Math.min(limit.maxBurst, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  // Reset hourly counter
  if (now - bucket.lastReset > 3600000) {
    bucket.requestCount = 0;
    bucket.lastReset = now;
  }
}

/**
 * Check if request is allowed under rate limit
 * Returns { allowed, remaining, resetAt, retryAfter }
 * Must be awaited when using CF KV
 */
export async function checkRateLimitKV(
  kv: KVNamespace,
  userId: string,
  tier: keyof typeof RATE_LIMITS = 'STANDARD'
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}> {
  const limit = RATE_LIMITS[tier];
  const bucket = await getBucket(kv, userId, limit);

  refillTokens(bucket, limit);

  const tokensNeeded = limit.tokensPerRequest;
  const allowed = bucket.tokens >= tokensNeeded;

  if (allowed) {
    bucket.tokens -= tokensNeeded;
    bucket.requestCount += 1;
  }

  // Update bucket in KV
  await kv.put(userId, JSON.stringify(bucket), { expirationTtl: 86400 });

  const resetAt = bucket.lastReset + 3600000; // 1 hour from reset
  const retryAfter = allowed
    ? undefined
    : Math.ceil((tokensNeeded - bucket.tokens) / (limit.requestsPerHour / 3600000));

  return {
    allowed,
    remaining: Math.floor(bucket.tokens * 10) / 10, // Round to 1 decimal
    resetAt,
    retryAfter,
  };
}

/**
 * Express-compatible middleware (for Node.js / Vercel fallback)
 * @deprecated Use checkRateLimitKV for CF Pages Functions
 */
export function checkRateLimitSync(
  userId: string,
  tier: keyof typeof RATE_LIMITS = 'STANDARD'
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  // In-memory fallback (not distributed)
  // For Vercel only; CF Pages must use async checkRateLimitKV
  const now = Date.now();
  const limit = RATE_LIMITS[tier];

  return {
    allowed: true, // Fallback allows (rate limiter not initialized)
    remaining: limit.maxBurst,
    resetAt: now + 3600000,
  };
}

export default { checkRateLimitKV, RATE_LIMITS };

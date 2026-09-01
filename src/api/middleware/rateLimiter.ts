/**
 * API Rate Limiting Middleware
 * Implements token-bucket rate limiting per user/IP
 * Prevents abuse of resource-intensive endpoints
 * @module api/middleware/rateLimiter
 */

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  requestCount: number;
  lastReset: number;
}

// In-memory store: key = userId|IP, value = bucket state
// In production, use Redis for distributed rate limiting
const buckets = new Map<string, RateLimitBucket>();

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
 * Get or create rate limit bucket for user/IP
 */
function getBucket(key: string, limit: typeof RATE_LIMITS[keyof typeof RATE_LIMITS]): RateLimitBucket {
  if (!buckets.has(key)) {
    buckets.set(key, {
      tokens: limit.maxBurst,
      lastRefill: Date.now(),
      requestCount: 0,
      lastReset: Date.now(),
    });
  }
  const bucket = buckets.get(key);
  if (!bucket) throw new Error(`Rate limit bucket not found for key: ${key}`);
  return bucket;
}

/**
 * Refill tokens based on time elapsed
 * Token refill rate: (requestsPerHour / 3600000 ms) = tokens per ms
 */
function refillTokens(
  bucket: RateLimitBucket,
  limit: typeof RATE_LIMITS[keyof typeof RATE_LIMITS]
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
 */
export function checkRateLimit(
  userId: string,
  tier: keyof typeof RATE_LIMITS = 'STANDARD'
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  const limit = RATE_LIMITS[tier];
  const bucket = getBucket(userId, limit);

  refillTokens(bucket, limit);

  const tokensNeeded = limit.tokensPerRequest;
  const allowed = bucket.tokens >= tokensNeeded;

  if (allowed) {
    bucket.tokens -= tokensNeeded;
    bucket.requestCount += 1;
  }

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
 * Express-compatible middleware for rate limiting
 * Use: app.use('/api/twin/create', rateLimiterMiddleware('CRITICAL'))
 */
export function rateLimiterMiddleware(tier: keyof typeof RATE_LIMITS = 'STANDARD') {
  return (req: any, res: any, next: any) => {
    const userId = req.user?.id || req.ip || 'anonymous';
    const result = checkRateLimit(userId, tier);

    // Set rate limit headers
    res.set('X-RateLimit-Limit', String(RATE_LIMITS[tier].requestsPerHour));
    res.set('X-RateLimit-Remaining', String(result.remaining));
    res.set('X-RateLimit-Reset', String(result.resetAt));

    if (!result.allowed) {
      res.set('Retry-After', String(result.retryAfter || 60));
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded for tier: ${tier}`,
        retryAfter: result.retryAfter,
        resetAt: new Date(result.resetAt).toISOString(),
      });
    }

    next();
  };
}

/**
 * Cleanup: Remove old buckets (older than 24 hours) to prevent memory leak
 * Call periodically: setInterval(cleanupOldBuckets, 3600000)
 */
export function cleanupOldBuckets(maxAgeMs: number = 86400000): void {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastReset > maxAgeMs) {
      buckets.delete(key);
    }
  }
}

// Start cleanup interval (every hour)
if (typeof setInterval !== 'undefined') {
  setInterval(() => cleanupOldBuckets(), 3600000);
}

export default rateLimiterMiddleware;

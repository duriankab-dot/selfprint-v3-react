/**
 * rate-limit-middleware.ts
 * Phase G: Rate Limiting Middleware
 */

import * as SecurityService from '../services/SecurityService';
import * as InputValidation from '../services/InputValidation';

export interface RateLimitRequest {
  headers: Record<string, string>;
}

interface RateLimitConfig {
  limitPerMinute: number;
  limitPerHour: number;
}

const DEFAULT_LIMIT: RateLimitConfig = {
  limitPerMinute: 60,
  limitPerHour: 1000,
};

const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  '/api/twin': { limitPerMinute: 30, limitPerHour: 500 },
  '/api/decisions': { limitPerMinute: 20, limitPerHour: 300 },
  '/api/feedback': { limitPerMinute: 10, limitPerHour: 100 },
};

/**
 * Rate limit check middleware
 */
export async function rateLimitMiddleware(
  userId: string,
  endpoint: string,
  ipAddress: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  if (!InputValidation.validateUserId(userId)) {
    return { allowed: false };
  }

  const limit = ENDPOINT_LIMITS[endpoint] || DEFAULT_LIMIT;

  const isAllowed = await SecurityService.checkRateLimit(
    userId,
    endpoint,
    limit.limitPerMinute
  );

  if (!isAllowed) {
    // Log rate limit hit
    await SecurityService.logRateLimitHit(userId, endpoint, ipAddress);

    return {
      allowed: false,
      retryAfter: 60, // Retry after 60 seconds
    };
  }

  return { allowed: true };
}

/**
 * Get rate limit status
 */
export async function getRateLimitStatus(
  userId: string,
  endpoint: string
): Promise<{
  limit: number;
  remaining: number;
  resetAt: string;
}> {
  if (!InputValidation.validateUserId(userId)) {
    throw new Error('Invalid user ID');
  }

  const limit = ENDPOINT_LIMITS[endpoint] || DEFAULT_LIMIT;

  // Calculate reset time (next minute)
  const now = new Date();
  const resetAt = new Date(now.getTime() + (60000 - (now.getTime() % 60000)));

  // In production, would fetch actual count from database
  // This is a simplified version
  return {
    limit: limit.limitPerMinute,
    remaining: limit.limitPerMinute - 1,
    resetAt: resetAt.toISOString(),
  };
}

/**
 * Configure endpoint-specific limit
 */
export function setEndpointLimit(
  endpoint: string,
  limitPerMinute: number,
  limitPerHour: number
): void {
  ENDPOINT_LIMITS[endpoint] = {
    limitPerMinute,
    limitPerHour,
  };
}

/**
 * Get configured limits
 */
export function getConfiguredLimits(): Record<string, RateLimitConfig> {
  return { ...ENDPOINT_LIMITS };
}

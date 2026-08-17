/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP/user
 *
 * Usage:
 *   app.post('/api/chat', rateLimiter('user', 10, 60), handler);
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (replace with Redis in production)
const store: RateLimitStore = {};

/**
 * Rate limiter middleware
 *
 * @param type - 'ip' (per IP address) or 'user' (per authenticated user)
 * @param maxRequests - Maximum requests allowed in the time window
 * @param windowSeconds - Time window in seconds
 */
export function rateLimiter(
  type: 'ip' | 'user' = 'ip',
  maxRequests: number = 100,
  windowSeconds: number = 60
) {
  return (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    const now = Date.now();
    const identifier = type === 'ip' ? getClientIp(req) : req.user?.id || getClientIp(req);
    const key = `${type}:${identifier}`;

    // Initialize or get existing bucket
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowSeconds * 1000,
      };
    }

    const bucket = store[key];

    // Reset if window expired
    if (now >= bucket.resetTime) {
      bucket.count = 0;
      bucket.resetTime = now + windowSeconds * 1000;
    }

    // Increment counter
    bucket.count++;

    // Check limit
    if (bucket.count > maxRequests) {
      const resetIn = Math.ceil((bucket.resetTime - now) / 1000);

      console.warn(`[RATE_LIMIT] ${type} ${identifier}: exceeded ${maxRequests} requests`);

      return res.status(429).json({
        error: 'too_many_requests',
        message: `Rate limit exceeded. Try again in ${resetIn}s.`,
        retryAfter: resetIn,
      });
    }

    // Add headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - bucket.count);
    res.setHeader('X-RateLimit-Reset', bucket.resetTime);

    next();
  };
}

/**
 * Get client IP address from request
 */
function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * Stricter rate limiter for expensive operations
 * (AI calls, payment processing, etc.)
 */
export function strictRateLimiter(
  type: 'ip' | 'user' = 'user',
  maxRequests: number = 10,
  windowSeconds: number = 3600
) {
  return rateLimiter(type, maxRequests, windowSeconds);
}

/**
 * Brute force protection for login attempts
 * Locks account after N failures
 */
const loginAttempts: { [key: string]: { count: number; locked: boolean; resetTime: number } } = {};

export function bruteForceProtection(maxAttempts: number = 5, lockoutSeconds: number = 900) {
  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body?.email || '';
    const now = Date.now();

    if (!email) {
      return next();
    }

    if (!loginAttempts[email]) {
      loginAttempts[email] = {
        count: 0,
        locked: false,
        resetTime: now + lockoutSeconds * 1000,
      };
    }

    const attempt = loginAttempts[email];

    // Reset if window expired
    if (now >= attempt.resetTime) {
      attempt.count = 0;
      attempt.locked = false;
      attempt.resetTime = now + lockoutSeconds * 1000;
    }

    // Check if locked
    if (attempt.locked) {
      const resetIn = Math.ceil((attempt.resetTime - now) / 1000);
      console.warn(`[BRUTE_FORCE] Account locked: ${email}`);

      return res.status(429).json({
        error: 'account_locked',
        message: `Too many login attempts. Try again in ${resetIn}s.`,
        retryAfter: resetIn,
      });
    }

    // Attach failure tracker to response
    res.on('finish', () => {
      // If login failed (assuming 401 or 400 status)
      if (res.statusCode >= 400) {
        attempt.count++;
        if (attempt.count >= maxAttempts) {
          attempt.locked = true;
          console.warn(`[BRUTE_FORCE] Account locked after ${maxAttempts} attempts: ${email}`);
        }
      } else {
        // Reset on success
        attempt.count = 0;
        attempt.locked = false;
      }
    });

    next();
  };
}

/**
 * Clean up old entries (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  let cleaned = 0;

  for (const key in store) {
    if (now > store[key].resetTime) {
      delete store[key];
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[RATE_LIMIT] Cleaned up ${cleaned} expired entries`);
  }
}

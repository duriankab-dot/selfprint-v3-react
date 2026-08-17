/**
 * Security Configuration
 * Applies security middleware stack to Express app
 */

import { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { authMiddleware, requireOwner } from './auth';
import { rateLimiter, strictRateLimiter, bruteForceProtection } from './rate-limit';
import { sanitizeInputs, validateUserId, validateWorldId, validateDecisionData } from './validate';

/**
 * Configure all security middleware
 */
export function configureSecurityMiddleware(app: Express) {
  // Global security headers
  app.use(helmet());

  // Brute force protection on login endpoint
  app.post('/api/auth/login', bruteForceProtection(5, 900));

  // Rate limiting by IP
  app.use('/api/', rateLimiter('ip', 1000, 3600)); // 1000 req/hour per IP

  // Strict rate limiting for expensive operations
  app.post('/api/intelligence', strictRateLimiter('user', 20, 3600)); // 20 req/hour
  app.post('/api/chat', strictRateLimiter('user', 100, 3600)); // 100 req/hour
  app.post('/api/stripe/webhook', rateLimiter('ip', 500, 60)); // 500 req/min for webhook

  // Sanitize all inputs
  app.use(sanitizeInputs);

  // Validation middleware on protected routes
  app.use('/api/users/:userId', validateUserId);
  app.use('/api/worlds/:worldId', validateWorldId);

  console.log('✅ Security middleware configured');
}

/**
 * Apply auth middleware to specific routes
 * Usage: app.post('/api/protected', applyAuth(), handler)
 */
export function applyAuth() {
  return [authMiddleware];
}

/**
 * Apply auth + ownership check
 * Usage: app.put('/api/profiles/:userId', applyOwnershipCheck(), handler)
 */
export function applyOwnershipCheck() {
  return [authMiddleware, requireOwner];
}

/**
 * Security headers
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};

function getAllowedOrigins(): string[] {
  const env = process.env.NODE_ENV || 'development';

  const origins = {
    production: ['https://selfprint.ai', 'https://www.selfprint.ai'],
    staging: ['https://staging.selfprint.ai'],
    development: ['http://localhost:3000', 'http://localhost:5173'],
  };

  return origins[env as keyof typeof origins] || origins.development;
}

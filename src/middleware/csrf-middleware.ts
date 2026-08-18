/**
 * csrf-middleware.ts
 * Phase G: CSRF Protection Middleware
 */

import * as SecurityService from '../services/SecurityService';
import * as InputValidation from '../services/InputValidation';

export interface CSRFMiddlewareRequest {
  method: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface CSRFMiddlewareResponse {
  statusCode: number;
  body: { message: string; eventId?: string };
}

/**
 * CSRF middleware for Express/API routes
 * Usage: Apply to POST, PUT, DELETE requests
 */
export async function csrfMiddleware(
  req: CSRFMiddlewareRequest
): Promise<{ valid: boolean; response?: CSRFMiddlewareResponse }> {
  // Skip CSRF check for GET requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return { valid: true };
  }

  // Check for CSRF token in request
  const token = req.headers['x-csrf-token'] || req.headers['csrf-token'];

  if (!token || typeof token !== 'string') {
    return {
      valid: false,
      response: {
        statusCode: 403,
        body: { message: 'CSRF token missing' },
      },
    };
  }

  // Validate token
  const isValid = await SecurityService.validateCSRFToken(token);

  if (!isValid) {
    return {
      valid: false,
      response: {
        statusCode: 403,
        body: { message: 'Invalid or expired CSRF token' },
      },
    };
  }

  return { valid: true };
}

/**
 * Generate and return CSRF token
 */
export async function generateCSRFTokenEndpoint(userId: string): Promise<{ token: string; expiresAt: string }> {
  if (!InputValidation.validateUserId(userId)) {
    throw new Error('Invalid user ID');
  }

  const { token, expiresAt } = SecurityService.generateCSRFToken();
  await SecurityService.storeCSRFToken(userId, token, expiresAt);

  return { token, expiresAt };
}

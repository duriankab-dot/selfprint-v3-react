/**
 * InputValidation.ts
 * Phase G: Input Validation & XSS Prevention
 */

/**
 * Validate user ID format
 */
export function validateUserId(userId: string): boolean {
  if (!userId || typeof userId !== 'string') return false;
  if (userId.length < 1 || userId.length > 255) return false;
  // Only alphanumeric, hyphens, underscores
  return /^[a-zA-Z0-9\-_]+$/.test(userId);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

/**
 * Sanitize string input (XSS prevention)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .substring(0, 10000); // Max length
}

/**
 * Validate JSON safely
 */
export function validateJSON(input: string): Record<string, unknown> | null {
  try {
    if (typeof input !== 'string') return null;
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed as Record<string, unknown>;
  } catch (err) {
    return null;
  }
}

/**
 * Validate numeric input
 */
export function validateNumber(input: unknown, min = 0, max = 100): number | null {
  const num = Number(input);
  if (Number.isNaN(num)) return null;
  if (num < min || num > max) return null;
  return num;
}

/**
 * Validate array of strings
 */
export function validateStringArray(input: unknown): string[] | null {
  if (!Array.isArray(input)) return null;
  return input.every(item => typeof item === 'string') ? (input as string[]) : null;
}

/**
 * Check for SQL injection patterns
 */
export function checkSQLInjection(input: string): boolean {
  const injectionPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b)/i,
    /(\bDELETE\b)/i,
    /(\bINSERT\b)/i,
    /(\bUPDATE\b)/i,
    /(\bEXECUTE\b)/i,
    /(\b--\b)/,
    /(\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
  ];

  return injectionPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate request origin
 */
export function validateOrigin(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

/**
 * Rate limit key generator
 */
export function getRateLimitKey(userId: string, endpoint: string): string {
  return `rate:${userId}:${endpoint}`;
}

/**
 * Validate timestamp
 */
export function validateTimestamp(timestamp: string): boolean {
  try {
    const date = new Date(timestamp);
    return !Number.isNaN(date.getTime());
  } catch (err) {
    return false;
  }
}

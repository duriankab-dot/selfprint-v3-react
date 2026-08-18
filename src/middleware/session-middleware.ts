/**
 * session-middleware.ts
 * Phase G: Session Management Middleware
 */

import * as SecurityService from '../services/SecurityService';
import * as InputValidation from '../services/InputValidation';

export interface SessionRequest {
  headers: Record<string, string>;
}

/**
 * Session validation middleware
 */
export async function sessionMiddleware(
  req: SessionRequest,
  userId: string
): Promise<{ valid: boolean; message?: string }> {
  if (!InputValidation.validateUserId(userId)) {
    return { valid: false, message: 'Invalid user ID' };
  }

  const isValid = await SecurityService.validateSession(userId);

  if (!isValid) {
    return {
      valid: false,
      message: 'Session expired or invalid. Please log in again.',
    };
  }

  return { valid: true };
}

/**
 * Create new session
 */
export async function createSessionEndpoint(userId: string): Promise<{ success: boolean; message: string }> {
  if (!InputValidation.validateUserId(userId)) {
    throw new Error('Invalid user ID');
  }

  const session = await SecurityService.createSession(userId);

  if (!session) {
    return {
      success: false,
      message: 'Failed to create session',
    };
  }

  return {
    success: true,
    message: 'Session created successfully',
  };
}

/**
 * Logout (invalidate session)
 */
export async function logoutEndpoint(userId: string): Promise<void> {
  if (!InputValidation.validateUserId(userId)) {
    throw new Error('Invalid user ID');
  }

  await SecurityService.invalidateSession(userId);
}

/**
 * Check session status
 */
export async function checkSessionStatus(userId: string): Promise<{ isValid: boolean; message: string }> {
  if (!InputValidation.validateUserId(userId)) {
    return { isValid: false, message: 'Invalid user ID' };
  }

  const isValid = await SecurityService.validateSession(userId);
  return {
    isValid,
    message: isValid ? 'Session is valid' : 'Session expired',
  };
}

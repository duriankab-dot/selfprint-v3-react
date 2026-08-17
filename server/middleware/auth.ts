/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user context
 *
 * Usage:
 *   app.post('/api/protected', authMiddleware, handler);
 */

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Main auth middleware
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'No authentication token provided',
      });
    }

    // Verify token
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({
        error: 'invalid_token',
        message: 'Invalid or expired token',
      });
    }

    // Attach user to request
    req.user = user;

    // Log auth success
    console.log(`[AUTH] User ${user.id} authenticated`);

    next();
  } catch (error) {
    console.error('[AUTH] Error:', error instanceof Error ? error.message : 'Unknown');

    return res.status(401).json({
      error: 'auth_error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Verify JWT token
 * Checks: signature, expiry, claims
 */
async function verifyToken(
  token: string
): Promise<{ id: string; email?: string } | null> {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[AUTH] Supabase not configured');
      return null;
    }

    // Use Supabase to verify the JWT
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.warn('[AUTH] Token verification failed:', error?.message);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error('[AUTH] Verification error:', error instanceof Error ? error.message : 'Unknown');
    return null;
  }
}

/**
 * Middleware: Require specific user (prevent unauthorized access)
 *
 * Usage:
 *   app.get('/api/profiles/:userId', authMiddleware, requireOwner, handler);
 */
export function requireOwner(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const targetUserId = req.params.userId || req.body?.userId;

  if (req.user.id !== targetUserId && !isAdmin(req.user.id)) {
    console.warn(`[AUTH] Access denied: ${req.user.id} ≠ ${targetUserId}`);
    return res.status(403).json({ error: 'forbidden' });
  }

  next();
}

/**
 * Check if user is admin (TODO: implement properly)
 */
function isAdmin(userId: string): boolean {
  const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean);
  return adminIds.includes(userId);
}

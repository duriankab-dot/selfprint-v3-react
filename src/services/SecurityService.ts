/**
 * SecurityService.ts
 * Phase G: Security Services (CSRF, Session, Rate-Limit)
 */

import { supabase } from './supabase-service';

interface CSRFToken {
  token: string;
  expiresAt: string;
}

interface SessionInfo {
  userId: string;
  twinId?: string;
  expiresAt: string;
  createdAt: string;
}

const CSRF_TOKEN_EXPIRY_MS = 3600000; // 1 hour
const SESSION_TIMEOUT_MS = 1800000; // 30 minutes
const MAX_CONCURRENT_SESSIONS = 3;

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): CSRFToken {
  const token = crypto.getRandomValues(new Uint8Array(32));
  const tokenHex = Array.from(token)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const expiresAt = new Date(Date.now() + CSRF_TOKEN_EXPIRY_MS).toISOString();

  return { token: tokenHex, expiresAt };
}

/**
 * Validate CSRF token
 */
export async function validateCSRFToken(token: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data, error } = await supabase
      .from('csrf_tokens')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return false;
    }

    // Token is valid, delete it (one-time use)
    await supabase
      .from('csrf_tokens')
      .delete()
      .eq('id', data.id);

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Store CSRF token
 */
export async function storeCSRFToken(userId: string, token: string, expiresAt: string): Promise<void> {
  if (!supabase) return;

  try {
    await supabase
      .from('csrf_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt,
      });
  } catch (err) {
    // Log error upstream
  }
}

/**
 * Create session
 */
export async function createSession(userId: string): Promise<SessionInfo | null> {
  if (!supabase) return null;

  try {
    // Check concurrent sessions
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString());

    if (sessions && sessions.length >= MAX_CONCURRENT_SESSIONS) {
      // Delete oldest session
      const { data: oldest } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1);

      if (oldest && oldest[0]) {
        await supabase
          .from('sessions')
          .delete()
          .eq('id', oldest[0].id);
      }
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT_MS).toISOString();

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        expires_at: expiresAt,
        created_at: now.toISOString(),
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      userId: data.user_id,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Validate session
 */
export async function validateSession(userId: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    return data && data.length > 0;
  } catch (err) {
    return false;
  }
}

/**
 * Check rate limit
 */
export async function checkRateLimit(userId: string, endpoint: string, limitPerMinute: number = 60): Promise<boolean> {
  if (!supabase) return true;

  try {
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

    const { data, error } = await supabase
      .from('rate_limit_log')
      .select('id')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('created_at', oneMinuteAgo);

    if (error || !data) {
      return true;
    }

    return data.length < limitPerMinute;
  } catch (err) {
    return true;
  }
}

/**
 * Log rate limit hit
 */
export async function logRateLimitHit(userId: string, endpoint: string, ipAddress: string): Promise<void> {
  if (!supabase) return;

  try {
    await supabase
      .from('rate_limit_log')
      .insert({
        user_id: userId,
        endpoint,
        ip_address: ipAddress,
        created_at: new Date().toISOString(),
      });
  } catch (err) {
    // Log error upstream
  }
}

/**
 * Invalidate session
 */
export async function invalidateSession(userId: string): Promise<void> {
  if (!supabase) return;

  try {
    await supabase
      .from('sessions')
      .delete()
      .eq('user_id', userId);
  } catch (err) {
    // Log error upstream
  }
}

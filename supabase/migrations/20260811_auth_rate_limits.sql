/**
 * 20260811_auth_rate_limits.sql
 *
 * Rate limiting table for authentication attempts (§34 backend)
 * Tracks failed passkey/magic-link attempts per identifier (email/IP)
 * Service role only — no user RLS policies (auth middleware enforces this)
 */

CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier       TEXT        NOT NULL,                    -- email or IP address
  identifier_type  VARCHAR(10) NOT NULL CHECK (identifier_type IN ('email', 'ip')),
  attempt_count    INT         NOT NULL DEFAULT 1,
  first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_attempt_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until    TIMESTAMPTZ,                             -- NULL = not blocked
  UNIQUE (identifier, identifier_type)
);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_identifier
  ON public.auth_rate_limits(identifier, identifier_type);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked
  ON public.auth_rate_limits(blocked_until)
  WHERE blocked_until IS NOT NULL;

-- Auto-cleanup: remove entries older than 24h via pg_cron (optional)
-- For now, the edge function handles cleanup on read

-- RLS: disabled — service role only (edge function uses SUPABASE_SERVICE_ROLE_KEY)
ALTER TABLE public.auth_rate_limits DISABLE ROW LEVEL SECURITY;

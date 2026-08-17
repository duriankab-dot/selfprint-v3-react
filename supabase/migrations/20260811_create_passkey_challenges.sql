-- Create passkey_challenges table for challenge verification
-- Stores temporary challenges used during WebAuthn registration and authentication
-- Auto-cleanup via trigger for expired records

CREATE TABLE IF NOT EXISTS public.passkey_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  challenge TEXT NOT NULL UNIQUE,
  challenge_type VARCHAR(50) NOT NULL, -- 'registration' or 'authentication'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_user_id ON public.passkey_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_challenge ON public.passkey_challenges(challenge);
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_expires_at ON public.passkey_challenges(expires_at);

-- Function to cleanup expired challenges (called by trigger or scheduled task)
CREATE OR REPLACE FUNCTION cleanup_expired_passkey_challenges()
RETURNS void AS $$
BEGIN
  DELETE FROM public.passkey_challenges
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup every 5 minutes
-- (Requires pg_cron extension - can be set up in Supabase UI)
-- SELECT cron.schedule('cleanup-passkey-challenges', '*/5 * * * *', 'SELECT cleanup_expired_passkey_challenges()');

-- Enable RLS
ALTER TABLE public.passkey_challenges ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can read/write (for edge functions)
-- Note: Edge functions use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
-- But we set this policy for completeness
CREATE POLICY "Service role manages challenges"
  ON public.passkey_challenges
  FOR ALL
  USING (auth.role() = 'service_role');

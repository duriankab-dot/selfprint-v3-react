-- Create user_credentials table for Passkey storage
-- Tracks WebAuthn credentials registered to users

CREATE TABLE IF NOT EXISTS public.user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL, -- Base64 encoded attestation object or public key
  counter INTEGER NOT NULL DEFAULT 0, -- Counter to detect cloning
  name TEXT NOT NULL DEFAULT 'My Passkey',
  transports TEXT[] DEFAULT '{}'::TEXT[], -- e.g., ['internal', 'nfc', 'usb']
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON public.user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_credential_id ON public.user_credentials(credential_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own credentials
CREATE POLICY "Users can view own credentials"
  ON public.user_credentials
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Policy: Users can only insert their own credentials
CREATE POLICY "Users can insert own credentials"
  ON public.user_credentials
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Policy: Users can only update their own credentials
CREATE POLICY "Users can update own credentials"
  ON public.user_credentials
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Policy: Users can only delete their own credentials
CREATE POLICY "Users can delete own credentials"
  ON public.user_credentials
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_credentials_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_credentials_updated_at ON public.user_credentials;

CREATE TRIGGER update_user_credentials_updated_at
  BEFORE UPDATE ON public.user_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_user_credentials_timestamp();

-- Helper function to get current user ID from JWT
CREATE OR REPLACE FUNCTION current_user_id() RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'sub',
    auth.uid()::TEXT,
    current_setting('request.jwt.claims', true)::json ->> 'sub'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

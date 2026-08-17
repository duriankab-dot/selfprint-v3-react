/**
 * Migration: Share Links
 *
 * Adds persistence for the "share your AI Twin" referral feature
 * (Phase 4 gap fix, 2026-08-08). A share link is a short random code that
 * maps back to a user_id; /api/share resolves it (via the service-role
 * client, so RLS below is intentionally owner-only — the public GET
 * endpoint reads through service role, not anon).
 *
 * Run this in Supabase SQL Editor the same way as 004_profiles_blueprints.sql
 * (same `selfprint` schema, already created by that migration).
 */

CREATE TABLE IF NOT EXISTS selfprint.share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(16) NOT NULL UNIQUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_selfprint_share_links_code ON selfprint.share_links(code);

ALTER TABLE selfprint.share_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own share link" ON selfprint.share_links;
DROP POLICY IF EXISTS "Users can insert own share link" ON selfprint.share_links;

CREATE POLICY "Users can view own share link"
  ON selfprint.share_links FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own share link"
  ON selfprint.share_links FOR INSERT
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT ON selfprint.share_links TO authenticated, service_role;

SELECT 'Migration complete ✅ (share_links)' as status;

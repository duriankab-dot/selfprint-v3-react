/**
 * Migration: User Profiles + Blueprints + Fine-tune Responses
 *
 * Adds persistence for the onboarding flow (Phase 4 gap fix, 2026-08-08).
 * Requires Supabase Auth (magic link) - user_id is auth.uid(), not a
 * free-text string like decision_log.user_id.
 *
 * IMPORTANT: this Supabase project (orxteuufqeohptpbwkqx) already has
 * tables named `blueprints`, `users_profiles`, `finetune_responses` in
 * the `public` schema belonging to a different, unrelated product. To
 * avoid any collision, all SelfPrint tables here live in a dedicated
 * `selfprint` schema instead of `public`.
 *
 * Run this in Supabase SQL Editor:
 * 1. Go to Supabase Dashboard -> SQL Editor
 * 2. Click "New Query"
 * 3. Paste this entire file
 * 4. Click "Run"
 *
 * THEN, one-time only: go to Settings -> API -> "Exposed schemas" and add
 * `selfprint` to the list (alongside `public`). Without this step the
 * PostgREST API (used by supabase-js / the /api/profile /api/blueprint
 * endpoints) cannot see the new schema and every request will fail with
 * "schema must be one of the following: public, graphql_public".
 */

CREATE SCHEMA IF NOT EXISTS selfprint;

GRANT USAGE ON SCHEMA selfprint TO authenticated, anon, service_role;

-- ============================================
-- selfprint.users_profiles
-- ============================================
CREATE TABLE IF NOT EXISTS selfprint.users_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  date_of_birth DATE,
  time_of_birth TIME,
  place_of_birth VARCHAR(255),
  initial_mood VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_selfprint_users_profiles_user_id ON selfprint.users_profiles(user_id);

ALTER TABLE selfprint.users_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON selfprint.users_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON selfprint.users_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON selfprint.users_profiles;

CREATE POLICY "Users can view own profile"
  ON selfprint.users_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON selfprint.users_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON selfprint.users_profiles FOR UPDATE
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON selfprint.users_profiles TO authenticated, service_role;

-- ============================================
-- selfprint.blueprints
-- ============================================
CREATE TABLE IF NOT EXISTS selfprint.blueprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES selfprint.users_profiles(id) ON DELETE CASCADE,

  accuracy_level INTEGER CHECK (accuracy_level >= 0 AND accuracy_level <= 100),
  decision_style VARCHAR(255),
  strengths TEXT[],
  insights TEXT[],
  opportunities TEXT[],
  blind_spots TEXT[],

  version INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT TRUE,
  source VARCHAR(50) DEFAULT 'initial', -- 'initial' | 'refined' | 'exported'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_selfprint_blueprints_user_id ON selfprint.blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_selfprint_blueprints_user_latest ON selfprint.blueprints(user_id, is_latest);

ALTER TABLE selfprint.blueprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own blueprints" ON selfprint.blueprints;
DROP POLICY IF EXISTS "Users can insert own blueprints" ON selfprint.blueprints;

CREATE POLICY "Users can view own blueprints"
  ON selfprint.blueprints FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own blueprints"
  ON selfprint.blueprints FOR INSERT
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT ON selfprint.blueprints TO authenticated, service_role;

-- ============================================
-- selfprint.finetune_responses
-- ============================================
CREATE TABLE IF NOT EXISTS selfprint.finetune_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES selfprint.users_profiles(id) ON DELETE CASCADE,

  answers JSONB NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_selfprint_finetune_responses_user_id ON selfprint.finetune_responses(user_id);

ALTER TABLE selfprint.finetune_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own finetune responses" ON selfprint.finetune_responses;
DROP POLICY IF EXISTS "Users can insert own finetune responses" ON selfprint.finetune_responses;

CREATE POLICY "Users can view own finetune responses"
  ON selfprint.finetune_responses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own finetune responses"
  ON selfprint.finetune_responses FOR INSERT
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT ON selfprint.finetune_responses TO authenticated, service_role;

-- Success message
SELECT 'Migration complete ✅ (schema: selfprint)' as status;

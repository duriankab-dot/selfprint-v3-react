-- Phase A: Onboarding Journey Checkpoints
-- Created: 2026-08-26
-- Purpose: Persist onboarding step progress so users can resume
--          without restarting from step 1 (journeyResume.ts)

BEGIN TRANSACTION;

-- ============================================================================
-- TABLE: onboarding_checkpoints
-- One row per user — upsert on conflict(user_id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS onboarding_checkpoints (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step TEXT      NOT NULL CHECK (
    current_step IN ('welcome', 'birth_info', 'quick_analysis', 'full_journey', 'complete')
  ),
  data       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  saved_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_onboarding_checkpoints_user_id
  ON onboarding_checkpoints(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE onboarding_checkpoints ENABLE ROW LEVEL SECURITY;

-- Users can only read their own checkpoint
CREATE POLICY "users_read_own_checkpoint" ON onboarding_checkpoints
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own checkpoint
CREATE POLICY "users_insert_own_checkpoint" ON onboarding_checkpoints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own checkpoint
CREATE POLICY "users_update_own_checkpoint" ON onboarding_checkpoints
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own checkpoint (clearCheckpoint)
CREATE POLICY "users_delete_own_checkpoint" ON onboarding_checkpoints
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE onboarding_checkpoints IS
  'Persists onboarding step for resume-on-return. One row per user, upserted on each step change.';
COMMENT ON COLUMN onboarding_checkpoints.current_step IS
  'Last completed step: welcome | birth_info | quick_analysis | full_journey | complete';
COMMENT ON COLUMN onboarding_checkpoints.data IS
  'Partial form data to pre-fill on resume (birth date, emotion selection, etc.)';

COMMIT;

SELECT 'Onboarding checkpoints table created ✅' as status;

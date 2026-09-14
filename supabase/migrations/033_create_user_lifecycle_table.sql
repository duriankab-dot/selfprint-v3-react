-- Phase A: Create user_lifecycle table for lifecycle state management
-- P0 FIX: Table was missing — transitionTo() and setTwinCreated() were trying to
-- UPDATE/UPSERT a table that didn't exist, causing 409 Conflict errors
-- Date: 2026-08-25

BEGIN TRANSACTION;

-- ============================================================================
-- Table: user_lifecycle
-- Tracks user journey: ONBOARDING → ANALYSIS → AWAKENING → TWIN_ALIVE → WORLD_ACTIVE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_lifecycle (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('ONBOARDING', 'ANALYSIS', 'AWAKENING', 'TWIN_ALIVE', 'WORLD_ACTIVE')),
  twin_id UUID REFERENCES twins(id) ON DELETE SET NULL,
  twin_created_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  entry_path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_lifecycle_status ON user_lifecycle(status);
CREATE INDEX IF NOT EXISTS idx_user_lifecycle_twin_id ON user_lifecycle(twin_id);
CREATE INDEX IF NOT EXISTS idx_user_lifecycle_created_at ON user_lifecycle(created_at DESC);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================
ALTER TABLE user_lifecycle ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_lifecycle_rls_select ON user_lifecycle;
CREATE POLICY user_lifecycle_rls_select ON user_lifecycle
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_lifecycle_rls_insert ON user_lifecycle;
CREATE POLICY user_lifecycle_rls_insert ON user_lifecycle
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS user_lifecycle_rls_update ON user_lifecycle;
CREATE POLICY user_lifecycle_rls_update ON user_lifecycle
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- Trigger: Auto-update timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_user_lifecycle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_lifecycle_update_timestamp ON user_lifecycle;

CREATE TRIGGER user_lifecycle_update_timestamp
  BEFORE UPDATE ON user_lifecycle
  FOR EACH ROW
  EXECUTE FUNCTION update_user_lifecycle_timestamp();

-- ============================================================================
-- Verification
-- ============================================================================
SELECT 'User Lifecycle table created successfully' as status;

COMMIT;

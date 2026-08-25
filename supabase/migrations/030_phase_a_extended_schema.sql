-- Phase A Extended Schema (Evolution, Notifications, Decision Learning)
-- Consolidated from 006, 007, 20260817 (all rescheduled to run AFTER twins)
-- Date: 2026-08-25

BEGIN TRANSACTION;

-- ============================================================================
-- SECTION 1: Twin Evolution System (from 006_twin_evolution.sql)
-- ============================================================================

CREATE TABLE IF NOT EXISTS twin_evolution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  previous_stage INT NOT NULL CHECK (previous_stage >= 1 AND previous_stage <= 5),
  new_stage INT NOT NULL CHECK (new_stage >= 1 AND new_stage <= 5),
  evolved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metrics_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_evolution CHECK (new_stage > previous_stage)
);

CREATE TABLE IF NOT EXISTS twin_evolution_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  current_stage INT NOT NULL CHECK (current_stage >= 1 AND current_stage <= 5),
  days_since_awakening INT DEFAULT 0,
  message_count INT DEFAULT 0,
  pattern_count INT DEFAULT 0,
  memory_count INT DEFAULT 0,
  feedback_count INT DEFAULT 0,
  progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(twin_id)
);

CREATE INDEX IF NOT EXISTS idx_twin_evolution_user_id ON twin_evolution_history(user_id);
CREATE INDEX IF NOT EXISTS idx_twin_evolution_twin_id ON twin_evolution_history(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_evolution_evolved_at ON twin_evolution_history(evolved_at DESC);
CREATE INDEX IF NOT EXISTS idx_evolution_progress_twin_id ON twin_evolution_progress(twin_id);

ALTER TABLE twin_evolution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_evolution_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY evolution_history_rls ON twin_evolution_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY evolution_history_insert_rls ON twin_evolution_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY evolution_progress_rls ON twin_evolution_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY evolution_progress_update_rls ON twin_evolution_progress
  FOR UPDATE USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION update_evolution_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evolution_progress_update_timestamp
  BEFORE UPDATE ON twin_evolution_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_evolution_progress_timestamp();

COMMENT ON TABLE twin_evolution_history IS 'Immutable log of all Twin evolution events';
COMMENT ON TABLE twin_evolution_progress IS 'Cached current progress towards next stage';

-- ============================================================================
-- SECTION 2: Notifications System (from 007_notifications.sql)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID REFERENCES twins(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  metadata JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID REFERENCES twins(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NOTE: decision_follow_ups and decision_outcomes already created by 020_create_decision_tables.sql
-- Skipping duplicate table definitions

CREATE TABLE IF NOT EXISTS notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('sent', 'delivered', 'read', 'clicked', 'dismissed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_schedule_user ON notification_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_schedule_status ON notification_schedule(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_read ON notification_queue(user_id, read_at);
-- Indexes removed: decision_follow_ups and decision_outcomes already created with different schema in 020
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user ON notification_analytics(user_id);

ALTER TABLE notification_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
-- RLS removed for decision_follow_ups and decision_outcomes (already handled in 020)
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY schedule_rls ON notification_schedule
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY schedule_insert_rls ON notification_schedule
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY queue_rls ON notification_queue
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY queue_update_rls ON notification_queue
  FOR UPDATE USING (user_id = auth.uid());

-- Policies removed: decision_follow_ups and decision_outcomes already handled in 020

CREATE POLICY analytics_rls ON notification_analytics
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 3: Decision Learning (from 20260817_p0_3_decision_learning.sql)
-- ============================================================================

-- Add system_prompt to twins table
ALTER TABLE twins
ADD COLUMN IF NOT EXISTS system_prompt TEXT;

CREATE TABLE IF NOT EXISTS decision_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  world TEXT NOT NULL,
  pattern TEXT NOT NULL,
  success_rate NUMERIC(5,2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  sample_size INTEGER DEFAULT 0 CHECK (sample_size >= 0),
  confidence NUMERIC(5,2) DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  identified_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(twin_id, world)
);

CREATE INDEX IF NOT EXISTS idx_decision_patterns_twin_id ON decision_patterns(twin_id);
CREATE INDEX IF NOT EXISTS idx_decision_patterns_world ON decision_patterns(world);

ALTER TABLE decision_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY decision_patterns_rls ON decision_patterns
  FOR ALL USING (
    twin_id IN (
      SELECT id FROM twins WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE twin_evolution_history IS 'Immutable log of all Twin evolution events';
COMMENT ON TABLE twin_evolution_progress IS 'Cached current progress towards next stage';
COMMENT ON TABLE decision_patterns IS 'Learned decision patterns per Twin/World (P0 #3)';
COMMENT ON COLUMN twins.system_prompt IS 'Twin system prompt with learned decision patterns';

COMMIT;

SELECT 'Phase A Extended Schema complete ✅' as status;

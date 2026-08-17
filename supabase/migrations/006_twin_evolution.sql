-- Twin Evolution System Migration
-- Date: 2026-08-16
-- Manages 5-stage Twin progression with metrics tracking

-- Table: twin_evolution_history
-- Tracks every time a Twin evolves to next stage
CREATE TABLE IF NOT EXISTS twin_evolution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  previous_stage INT NOT NULL CHECK (previous_stage >= 1 AND previous_stage <= 5),
  new_stage INT NOT NULL CHECK (new_stage >= 1 AND new_stage <= 5),
  evolved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metrics_snapshot JSONB NOT NULL DEFAULT '{}', -- { daysSinceAwakening, messageCount, patternCount, memoryCount, feedbackCount }
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_evolution CHECK (new_stage > previous_stage)
);

-- Table: twin_evolution_progress (optional: cached progress data)
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

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_twin_evolution_user_id ON twin_evolution_history(user_id);
CREATE INDEX IF NOT EXISTS idx_twin_evolution_twin_id ON twin_evolution_history(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_evolution_evolved_at ON twin_evolution_history(evolved_at DESC);
CREATE INDEX IF NOT EXISTS idx_evolution_progress_twin_id ON twin_evolution_progress(twin_id);

-- Row Level Security (RLS)
ALTER TABLE twin_evolution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_evolution_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see only their own evolution history
CREATE POLICY evolution_history_rls ON twin_evolution_history
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY evolution_history_insert_rls ON twin_evolution_history
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can see only their own progress
CREATE POLICY evolution_progress_rls ON twin_evolution_progress
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY evolution_progress_update_rls ON twin_evolution_progress
  FOR UPDATE
  USING (user_id = auth.uid());

-- Trigger: Update updated_at timestamp
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

-- Comments for documentation
COMMENT ON TABLE twin_evolution_history IS 'Immutable log of all Twin evolution events';
COMMENT ON TABLE twin_evolution_progress IS 'Cached current progress towards next stage';
COMMENT ON COLUMN twin_evolution_history.metrics_snapshot IS 'Snapshot of metrics at time of evolution';
COMMENT ON COLUMN twin_evolution_progress.current_stage IS '1=Core Formation, 2=Pattern Recognition, 3=Deep Understanding, 4=Wisdom Stage, 5=Full Holographic Form';

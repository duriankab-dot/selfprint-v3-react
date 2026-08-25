-- Phase E: Decision Intelligence Database Schema
-- Created: 2026-08-16
-- NOTE: decision_log already created by 001_decision_log_autonomy_tracking.sql
-- This migration creates supporting tables for decision tracking

-- decision_outcomes: Track follow-up results
CREATE TABLE IF NOT EXISTS decision_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decision_log(id) ON DELETE CASCADE,
  follow_up_day INT NOT NULL,       -- 30, 90, 180, 365
  feedback TEXT,
  impact VARCHAR(20),               -- "positive", "neutral", "negative"
  lessons TEXT,
  twin_confidence FLOAT DEFAULT 50, -- 0-100
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- follow_up_schedule: Manage when to follow up
CREATE TABLE IF NOT EXISTS follow_up_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decision_log(id) ON DELETE CASCADE,
  day30_due TIMESTAMP,
  day90_due TIMESTAMP,
  day180_due TIMESTAMP,
  day365_due TIMESTAMP,
  day30_completed BOOLEAN DEFAULT FALSE,
  day90_completed BOOLEAN DEFAULT FALSE,
  day180_completed BOOLEAN DEFAULT FALSE,
  day365_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- decision_patterns: Store learned patterns
CREATE TABLE IF NOT EXISTS decision_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world VARCHAR(50),
  pattern TEXT,
  success_rate FLOAT DEFAULT 50,    -- 0-100
  sample_size INT DEFAULT 0,
  confidence FLOAT DEFAULT 0,       -- 0-100
  identified_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
-- NOTE: decision_log indexes already created in 001_decision_log_autonomy_tracking.sql
CREATE INDEX IF NOT EXISTS idx_decision_outcomes_decision_id ON decision_outcomes(decision_id);
CREATE INDEX IF NOT EXISTS idx_decision_outcomes_follow_up_day ON decision_outcomes(follow_up_day);
CREATE INDEX IF NOT EXISTS idx_follow_up_schedule_decision_id ON follow_up_schedule(decision_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_schedule_day30 ON follow_up_schedule(day30_due, day30_completed);
CREATE INDEX IF NOT EXISTS idx_follow_up_schedule_day90 ON follow_up_schedule(day90_due, day90_completed);
CREATE INDEX IF NOT EXISTS idx_decision_patterns_twin_world ON decision_patterns(twin_id, world);

-- Row Level Security (RLS)
ALTER TABLE decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
-- NOTE: decision_log RLS policies already created in 001_decision_log_autonomy_tracking.sql
-- These policies would override them if uncommented
-- CREATE POLICY "Users can view own decisions" ON decision_log
--   FOR SELECT USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can insert own decisions" ON decision_log
--   FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- CREATE POLICY "Users can update own decisions" ON decision_log
--   FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own outcomes" ON decision_outcomes
  FOR SELECT USING (
    decision_id IN (
      SELECT id FROM decision_log WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own outcomes" ON decision_outcomes
  FOR INSERT WITH CHECK (
    decision_id IN (
      SELECT id FROM decision_log WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can view own follow-ups" ON follow_up_schedule
  FOR SELECT USING (
    decision_id IN (
      SELECT id FROM decision_log WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own follow-ups" ON follow_up_schedule
  FOR UPDATE USING (
    decision_id IN (
      SELECT id FROM decision_log WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can view own patterns" ON decision_patterns
  FOR SELECT USING (auth.uid() = twin_id);

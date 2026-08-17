/**
 * Migration: Decision Log - Autonomy Tracking (Phase 6)
 *
 * This migration creates/updates the decision_log table to support
 * autonomy tracking with confidence, hesitation, and response time metrics.
 *
 * Run this in Supabase SQL Editor:
 * 1. Go to Supabase Dashboard → SQL Editor
 * 2. Click "New Query"
 * 3. Paste this entire file
 * 4. Click "Run"
 */

-- Create decision_log table if not exists
CREATE TABLE IF NOT EXISTS decision_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  hub VARCHAR NOT NULL,
  mood VARCHAR,

  -- Original fields
  decision_text TEXT,
  context TEXT,

  -- Autonomy Tracking (Phase 6)
  autonomy_level INTEGER CHECK (autonomy_level >= 0 AND autonomy_level <= 100),
  confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  hesitation DECIMAL(3, 2) CHECK (hesitation >= 0 AND hesitation <= 1),
  response_time_ms INTEGER,
  message_length INTEGER DEFAULT 0,
  response_length INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_decision_log_user_id ON decision_log(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_log_hub ON decision_log(hub);
CREATE INDEX IF NOT EXISTS idx_decision_log_mood ON decision_log(mood);
CREATE INDEX IF NOT EXISTS idx_decision_log_created_at ON decision_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decision_log_autonomy ON decision_log(autonomy_level);
CREATE INDEX IF NOT EXISTS idx_decision_log_user_created ON decision_log(user_id, created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE decision_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe way)
DROP POLICY IF EXISTS "Users can view own decision log" ON decision_log;
DROP POLICY IF EXISTS "Users can insert own decision log" ON decision_log;

-- Create RLS policy: Users can only see their own decision log
CREATE POLICY "Users can view own decision log"
  ON decision_log
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own decision log"
  ON decision_log
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Grant permissions
GRANT SELECT, INSERT ON decision_log TO anon, authenticated;

-- Create view for autonomy analytics
CREATE OR REPLACE VIEW autonomy_analytics AS
SELECT
  user_id,
  hub,
  mood,
  COUNT(*) as total_interactions,
  AVG(autonomy_level)::INTEGER as avg_autonomy,
  AVG(confidence)::DECIMAL(3, 2) as avg_confidence,
  AVG(hesitation)::DECIMAL(3, 2) as avg_hesitation,
  AVG(response_time_ms)::INTEGER as avg_response_time_ms,
  MIN(created_at) as first_interaction,
  MAX(created_at) as last_interaction
FROM decision_log
GROUP BY user_id, hub, mood;

-- Grant access to view
GRANT SELECT ON autonomy_analytics TO anon, authenticated;

-- Success message
SELECT 'Migration complete ✅' as status;

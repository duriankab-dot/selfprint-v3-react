-- Phase F: Feedback Loop Database Tables
-- Migration: 001_feedback_tables.sql

-- user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  twin_id TEXT NOT NULL,
  response_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('quality', 'relevance', 'accuracy', 'tone', 'helpfulness')),
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- feedback_sentiment table
CREATE TABLE IF NOT EXISTS feedback_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id TEXT NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  score NUMERIC(3,2) NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  quality_score INTEGER NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
  improvements TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- quality_metrics table
CREATE TABLE IF NOT EXISTS quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id TEXT NOT NULL,
  world TEXT NOT NULL,
  quality_score INTEGER NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
  user_rating INTEGER NOT NULL CHECK (user_rating >= 1 AND user_rating <= 5),
  feedback_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- improvement_actions table
CREATE TABLE IF NOT EXISTS improvement_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL,
  improvement_area TEXT NOT NULL CHECK (improvement_area IN ('response_length', 'accuracy', 'relevance', 'tone', 'specificity', 'depth')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'completed', 'reverted')),
  applied_at TIMESTAMP WITH TIME ZONE,
  metrics_before_change JSONB,
  metrics_after_change JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (feedback_id) REFERENCES user_feedback(id) ON DELETE CASCADE
);

-- twin_prompt_updates table
CREATE TABLE IF NOT EXISTS twin_prompt_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  improvement_area TEXT,
  changes JSONB NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_twin_id ON user_feedback(twin_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_sentiment ON user_feedback(sentiment);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_twin_id ON quality_metrics(twin_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_world ON quality_metrics(world);
CREATE INDEX IF NOT EXISTS idx_improvement_actions_status ON improvement_actions(status);
CREATE INDEX IF NOT EXISTS idx_twin_prompt_updates_twin_id ON twin_prompt_updates(twin_id);

-- Enable RLS if needed
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_prompt_updates ENABLE ROW LEVEL SECURITY;

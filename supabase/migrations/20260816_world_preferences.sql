-- P0 #7.2: World System Foundation
-- Create world_preferences table for tracking user's world focus and progress

CREATE TABLE IF NOT EXISTS public.world_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  engagement_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, world_id),
  CONSTRAINT world_id_valid CHECK (world_id IN (
    'self', 'mind', 'relationship', 'love', 'career', 'wealth',
    'life', 'growth', 'decision', 'purpose', 'wellbeing', 'future'
  ))
);

-- Enable RLS
ALTER TABLE public.world_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users read/write only their own world preferences
CREATE POLICY "Users can read own world preferences"
  ON public.world_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own world preferences"
  ON public.world_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own world preferences"
  ON public.world_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own world preferences"
  ON public.world_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indices for performance
CREATE INDEX idx_world_preferences_user_id
  ON public.world_preferences(user_id);

CREATE INDEX idx_world_preferences_user_favorite
  ON public.world_preferences(user_id, is_favorite)
  WHERE is_favorite = TRUE;

CREATE INDEX idx_world_preferences_last_accessed
  ON public.world_preferences(user_id, last_accessed DESC);

-- Create world_stats table to track world-specific user data
CREATE TABLE IF NOT EXISTS public.world_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,
  visits_count INTEGER DEFAULT 1,
  journal_entries INTEGER DEFAULT 0,
  decisions_made INTEGER DEFAULT 0,
  insights_gained INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_insight_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, world_id),
  CONSTRAINT world_id_valid CHECK (world_id IN (
    'self', 'mind', 'relationship', 'love', 'career', 'wealth',
    'life', 'growth', 'decision', 'purpose', 'wellbeing', 'future'
  ))
);

-- Enable RLS on world_stats
ALTER TABLE public.world_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own world stats"
  ON public.world_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own world stats"
  ON public.world_stats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for world_stats
CREATE INDEX idx_world_stats_user_id
  ON public.world_stats(user_id);

CREATE INDEX idx_world_stats_visits
  ON public.world_stats(user_id, visits_count DESC);

-- Add world_preferences to auth.users user_metadata (via trigger or application layer)
-- This is handled by the application when fetching/updating user

COMMENT ON TABLE public.world_preferences IS 'User preferences for the 12 Worlds (favorite, tracking, engagement)';
COMMENT ON TABLE public.world_stats IS 'Aggregated stats for user activity per World';

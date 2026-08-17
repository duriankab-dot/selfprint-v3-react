-- ============================================================================
-- PHASE 1: Intelligence Core Schema
-- Personal Intelligence Platform - Foundation Tables
-- Date: 2026-08-09
-- ============================================================================

-- 1. PERSONAL PROFILES (extends auth.users)
-- Stores user-specific profile data
CREATE TABLE IF NOT EXISTS public.personal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE,
  mood_state VARCHAR(50),
  hubs_active JSONB DEFAULT '[]'::jsonb, -- Array of active life areas
  last_reflection TIMESTAMP WITH TIME ZONE,
  model_version INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_personal_profiles_user_id ON public.personal_profiles(user_id);

-- ============================================================================
-- 2. PERSONAL MEMORY
-- Stores important moments, small wins, discoveries
CREATE TABLE IF NOT EXISTS public.personal_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type VARCHAR(50) NOT NULL, -- small_win, important_moment, discovery, personal
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  linked_to UUID, -- FK to decision_id or journal_id (flexible)
  confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_personal_memory_user_id ON public.personal_memory(user_id);
CREATE INDEX idx_personal_memory_type ON public.personal_memory(memory_type);
CREATE INDEX idx_personal_memory_created_at ON public.personal_memory(created_at DESC);

-- ============================================================================
-- 3. BEHAVIORAL PATTERNS
-- Finds what's repeating, emerging, or changing
CREATE TABLE IF NOT EXISTS public.behavioral_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_name VARCHAR(255) NOT NULL, -- e.g., "decision_hesitation"
  pattern_type VARCHAR(50) NOT NULL, -- repeating, emerging, changing
  evidence_points JSONB DEFAULT '[]'::jsonb, -- Array of {date, source, sourceId, excerpt, confidence}
  frequency VARCHAR(50), -- "weekly", "every 3 days", "most decisions"
  last_detected TIMESTAMP WITH TIME ZONE,
  confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  description TEXT,
  ai_insight TEXT,
  impact TEXT,
  related_values JSONB DEFAULT '[]'::jsonb, -- Array of value IDs
  related_goals JSONB DEFAULT '[]'::jsonb, -- Array of goal IDs
  is_strength BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_behavioral_patterns_user_id ON public.behavioral_patterns(user_id);
CREATE INDEX idx_behavioral_patterns_type ON public.behavioral_patterns(pattern_type);
CREATE INDEX idx_behavioral_patterns_confidence ON public.behavioral_patterns(confidence DESC);

-- ============================================================================
-- 4. PERSONAL CONTEXT
-- Generic storage for inferred context (values, goals, blind spots, strengths)
CREATE TABLE IF NOT EXISTS public.personal_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type VARCHAR(50) NOT NULL, -- value, goal, blind_spot, strength, emotional_range, decision_style
  title VARCHAR(255) NOT NULL,
  description TEXT,
  inferred_from JSONB DEFAULT '{}'::jsonb, -- {sources: [...], methodology: "..."}
  confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  ai_evidence TEXT, -- Explanation of why AI thinks this
  user_feedback BOOLEAN, -- true=confirmed, false=rejected, null=no feedback
  metadata JSONB DEFAULT '{}'::jsonb, -- Extra context-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_personal_context_user_id ON public.personal_context(user_id);
CREATE INDEX idx_personal_context_type ON public.personal_context(context_type);
CREATE INDEX idx_personal_context_confidence ON public.personal_context(confidence DESC);

-- ============================================================================
-- 5. INSIGHT FEEDBACK
-- Track user feedback on AI insights (calibration data)
CREATE TABLE IF NOT EXISTS public.insight_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_id VARCHAR(255) NOT NULL, -- Reference to AI-generated insight
  feedback_type VARCHAR(50) NOT NULL, -- very_true, somewhat, not_sure, not_me
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX idx_insight_feedback_user_id ON public.insight_feedback(user_id);
CREATE INDEX idx_insight_feedback_feedback_type ON public.insight_feedback(feedback_type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.personal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insight_feedback ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own data

-- personal_profiles
CREATE POLICY "Users see own profiles" ON public.personal_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own profiles" ON public.personal_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profiles" ON public.personal_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own profiles" ON public.personal_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- personal_memory
CREATE POLICY "Users see own memories" ON public.personal_memory
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own memories" ON public.personal_memory
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own memories" ON public.personal_memory
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own memories" ON public.personal_memory
  FOR DELETE USING (auth.uid() = user_id);

-- behavioral_patterns
CREATE POLICY "Users see own patterns" ON public.behavioral_patterns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own patterns" ON public.behavioral_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own patterns" ON public.behavioral_patterns
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own patterns" ON public.behavioral_patterns
  FOR DELETE USING (auth.uid() = user_id);

-- personal_context
CREATE POLICY "Users see own context" ON public.personal_context
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own context" ON public.personal_context
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own context" ON public.personal_context
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own context" ON public.personal_context
  FOR DELETE USING (auth.uid() = user_id);

-- insight_feedback
CREATE POLICY "Users see own feedback" ON public.insight_feedback
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own feedback" ON public.insight_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own feedback" ON public.insight_feedback
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- (Will be populated during tests, not here)

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE public.personal_profiles IS 'User profile extended data - birth date, active hubs, mood state';
COMMENT ON TABLE public.personal_memory IS 'Persistent memories: small wins, important moments, discoveries';
COMMENT ON TABLE public.behavioral_patterns IS 'Detected patterns: repeating, emerging, changing behaviors';
COMMENT ON TABLE public.personal_context IS 'Inferred context: values, goals, blind spots, strengths, emotional range';
COMMENT ON TABLE public.insight_feedback IS 'User feedback on AI insights for model calibration';

COMMENT ON COLUMN public.behavioral_patterns.evidence_points IS 'JSONB array: [{date, source, sourceId, excerpt, confidence}]';
COMMENT ON COLUMN public.insight_feedback.feedback_type IS 'User validation: very_true | somewhat | not_sure | not_me';

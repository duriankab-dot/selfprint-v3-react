-- P0 #7: Twin Learning Profiles
-- Store decision patterns learned from Twin outcomes

CREATE TABLE IF NOT EXISTS public.twin_learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES public.twins(id) ON DELETE CASCADE,
  world TEXT NOT NULL,
  decision_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  pattern_insight TEXT,
  confidence_score INTEGER DEFAULT 50,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(twin_id, world)
);

-- Enable RLS
ALTER TABLE public.twin_learning_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users view own Twin's learning profiles
DROP POLICY IF EXISTS "Users can view own Twin learning profiles" ON public.twin_learning_profiles;
CREATE POLICY "Users can view own Twin learning profiles"
  ON public.twin_learning_profiles
  FOR SELECT
  USING (
    twin_id IN (
      SELECT id FROM public.twins WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Twin service can update learning profiles
DROP POLICY IF EXISTS "Service can update Twin learning profiles" ON public.twin_learning_profiles;
CREATE POLICY "Service can update Twin learning profiles"
  ON public.twin_learning_profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Indices
DROP INDEX IF EXISTS idx_twin_learning_profiles_twin_id;
CREATE INDEX IF NOT EXISTS idx_twin_learning_profiles_twin_id
  ON public.twin_learning_profiles(twin_id);

DROP INDEX IF EXISTS idx_twin_learning_profiles_world;
CREATE INDEX IF NOT EXISTS idx_twin_learning_profiles_world
  ON public.twin_learning_profiles(world);

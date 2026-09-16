-- Migration 039: decision_insights_cache for DecisionInsightService SLA tracking
-- Stores the latest computed insight snapshot + SLA metrics per user so the
-- Decision Dashboard can show freshness/coverage on subsequent visits.
--
-- Idempotent — safe to run at any time / via `supabase db push`.

CREATE TABLE IF NOT EXISTS public.decision_insights_cache (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decision_count INTEGER NOT NULL DEFAULT 0,
  coverage INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
  insights JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decision_insights_cache_computed_at
  ON public.decision_insights_cache(computed_at DESC);

ALTER TABLE public.decision_insights_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own insights cache" ON public.decision_insights_cache;
CREATE POLICY "Users can view own insights cache"
  ON public.decision_insights_cache
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own insights cache" ON public.decision_insights_cache;
CREATE POLICY "Users can upsert own insights cache"
  ON public.decision_insights_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own insights cache" ON public.decision_insights_cache;
CREATE POLICY "Users can update own insights cache"
  ON public.decision_insights_cache
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Migration 041: Add twin_recommendation_quality to decision_log
-- Purpose: Separate Twin recommendation quality from decision outcome quality
-- Allows measuring whether Twin's advice was helpful vs whether user made good choice
-- Date: 2026-10-02
-- Batch B: Personal Intelligence Learning Loop

ALTER TABLE public.decision_log 
ADD COLUMN IF NOT EXISTS twin_recommendation_quality FLOAT NULL 
CHECK (twin_recommendation_quality IS NULL OR (twin_recommendation_quality >= 0 AND twin_recommendation_quality <= 1));

COMMENT ON COLUMN public.decision_log.twin_recommendation_quality IS 'Quality score of Twin''s recommendation (0-1). Null if not assessed. Distinct from outcome quality.';

CREATE INDEX IF NOT EXISTS idx_decision_log_rec_quality ON public.decision_log(twin_recommendation_quality) WHERE twin_recommendation_quality IS NOT NULL;

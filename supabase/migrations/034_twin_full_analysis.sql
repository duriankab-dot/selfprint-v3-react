-- TWINKNOWLEDGE-001: persist the complete Full Analysis (WOW #2 output —
-- selfOverview, strengths, blindSpots, behavioralPatterns, trends, journey,
-- focusAreas, guidance, nextSteps) directly onto the Twin's own row at the
-- moment the Twin is born.
--
-- Why: analysisStore.ts (Zustand, no persist middleware) only ever held this
-- in volatile browser memory. It survived exactly as long as the tab did —
-- any reload, new tab, or later session lost it completely, so after the
-- very first session the Twin's real knowledge of the user silently
-- degraded to just primary/secondary archetype + maturity score. TwinChat.tsx
-- had a partial recovery path (rebuilding a rough approximation from
-- awakening_essence.personal_intelligence), but that reconstruction drops
-- behavioralPatterns and trends entirely and re-derives strengths/blindSpots
-- lossily from a smaller summary — not the real thing.
--
-- This column makes the full, original analysis durable: CoreAwakening.tsx
-- passes it into initializeTwin() once, at birth, and every later session
-- reads it straight off the twins row — no reconstruction needed.

ALTER TABLE twins ADD COLUMN IF NOT EXISTS full_analysis JSONB;

COMMENT ON COLUMN twins.full_analysis IS
  'Complete FullAnalysisOutput (src/lib/intelligence/InsightEngine.ts) captured at Twin birth — selfOverview, strengths, blindSpots, behavioralPatterns, trends, journey, focusAreas, guidance, nextSteps. NULL for twins created before TWINKNOWLEDGE-001.';

SELECT 'twins.full_analysis column added ✅' as status;

-- Migration 042: Fix decision_log SELECT RLS to support twin_id-based ownership
-- Date: 2026-10-03
-- Batch D: Fixes runtime blocker C1 — OutcomeRecordPage cannot read decisions
--          created via recordDecision() because only twin_id is populated,
--          not user_id.

DO $guard$ BEGIN
  IF to_regclass('public.decision_log') IS NULL THEN
    RAISE NOTICE '[042][skip] decision_log does not exist';
    RETURN;
  END IF;
END $guard$;

-- Drop the existing restrictive policy that only checked user_id.
-- recordDecision() inserts with twin_id only (no user_id), so the old policy
-- blocked SELECT visibility for all decisions created through the normal flow.
DROP POLICY IF EXISTS "Users can view own decision log" ON decision_log;

-- New policy: allow viewing via EITHER direct user_id OR twin_id ownership.
-- This covers both legacy autonomy-tracking records (with user_id) AND
-- modern Twin-suggested decisions (with twin_id only).
CREATE POLICY "Users can view own decision log"
  ON public.decision_log
  FOR SELECT
  USING (
    user_id = auth.uid()::text
    OR twin_id IN (
      SELECT id FROM twins WHERE user_id = auth.uid()
    )
  );

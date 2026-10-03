-- Batch D — RLS UPDATE Policy for decision_log
-- Apply this SQL via Supabase Dashboard → SQL Editor → New Query
-- Authorizes users to UPDATE their own decisions' twin_recommendation_quality

CREATE POLICY "Users can update own decision recommendation quality"
ON public.decision_log
FOR UPDATE
USING (
  twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
)
WITH CHECK (
  twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
);

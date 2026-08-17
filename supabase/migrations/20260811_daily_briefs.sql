/**
 * 20260811_daily_briefs.sql
 *
 * Cache table for AI-generated daily briefs (§ Master Directive §3.4)
 * One brief per user per day — regenerated if stale or missing
 */

CREATE TABLE IF NOT EXISTS public.daily_briefs (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brief_date   DATE    NOT NULL DEFAULT CURRENT_DATE,
  brief_text   TEXT    NOT NULL,
  hub_focus    TEXT,
  mood_context TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, brief_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_briefs_user_date
  ON public.daily_briefs(user_id, brief_date DESC);

ALTER TABLE public.daily_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own briefs"
  ON public.daily_briefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON public.daily_briefs FOR ALL
  USING (true)
  WITH CHECK (true);

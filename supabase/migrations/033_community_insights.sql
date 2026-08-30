-- Phase B.1: Community Insight Feed
-- "กระทู้แบ่งปันประสบการณ์" — user-authored excerpts shared publicly.
--
-- Privacy design decision (data minimization, per SELFPRINT senior-dev rules):
-- We do NOT auto-share raw Blueprint/SICE data (blind_spots, decision_style,
-- etc). A community insight is a short, user-WRITTEN excerpt the user chooses
-- to publish — never an automatic dump of their private analysis. This keeps
-- sensitive psychological profiling data out of the public feed by default.

CREATE TABLE IF NOT EXISTS public.community_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 10 AND 500),
  world TEXT, -- optional tag: one of the 12 world ids, nullable
  display_name TEXT NOT NULL DEFAULT 'Anonymous Twin', -- user-chosen, never auto-filled from real name

  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_insights_feed
  ON public.community_insights(created_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_community_insights_user_id
  ON public.community_insights(user_id);

ALTER TABLE public.community_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read published insights"
  ON public.community_insights FOR SELECT
  TO authenticated
  USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "Users can post their own insights"
  ON public.community_insights FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own insights"
  ON public.community_insights FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.community_insights TO authenticated;

-- ============================================
-- public.community_insight_likes
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_insight_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID NOT NULL REFERENCES public.community_insights(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (insight_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_insight_likes_insight_id
  ON public.community_insight_likes(insight_id);

ALTER TABLE public.community_insight_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read likes"
  ON public.community_insight_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like as themselves"
  ON public.community_insight_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike their own like"
  ON public.community_insight_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.community_insight_likes TO authenticated;

SELECT 'Migration complete ✅ (community_insights + community_insight_likes)' as status;

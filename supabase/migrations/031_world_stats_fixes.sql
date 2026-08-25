/**
 * Migration: Fix world_stats — missing last_accessed column + missing INSERT policy
 *
 * WORLDSTATS-001: found live via console errors on every /worlds/:worldId visit.
 *
 * Root cause #1: 20260816_world_preferences.sql created public.world_stats
 * WITHOUT a `last_accessed` column, but src/context/WorldContext.tsx's
 * recordWorldVisit()/recordJournalEntry()/recordDecision() all upsert a
 * `last_accessed` field on every call — PostgREST rejects the whole upsert
 * with PGRST204 "Could not find the 'last_accessed' column of 'world_stats'
 * in the schema cache".
 *
 * Root cause #2: the same migration only added SELECT and UPDATE RLS
 * policies for world_stats (unlike world_preferences, which correctly has
 * INSERT too). upsert() needs INSERT permission for a user's first-ever
 * visit to a given world (no existing (user_id, world_id) row to update) —
 * without it, every first-visit upsert is blocked by RLS regardless of the
 * column fix above.
 *
 * Run this in Supabase SQL Editor (same steps as 004/005/006):
 * 1. Go to Supabase Dashboard -> SQL Editor
 * 2. Click "New Query"
 * 3. Paste this entire file
 * 4. Click "Run"
 */

ALTER TABLE public.world_stats
  ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'world_stats'
      AND policyname = 'Users can insert own world stats'
  ) THEN
    CREATE POLICY "Users can insert own world stats"
      ON public.world_stats
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Force PostgREST to pick up the new column immediately instead of waiting
-- for its next periodic schema-cache refresh.
NOTIFY pgrst, 'reload schema';

SELECT 'Migration complete ✅ (public.world_stats.last_accessed + INSERT policy added)' as status;

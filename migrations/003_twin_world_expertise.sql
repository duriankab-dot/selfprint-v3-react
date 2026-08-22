-- P0-D: Twin World Expertise tracking
-- Migration: 003_twin_world_expertise.sql
--
-- WorldExpertiseService.ts, WorldRoutingService.ts, and twin_world_expertise
-- queries throughout the codebase have referenced this table since Phase D,
-- but no CREATE TABLE for it existed anywhere in the repo (schema or
-- migrations) — every read/write against it would fail silently in
-- production (caught by try/catch, logged, falls back to defaults).
--
-- Run this against your Supabase instance before P0-D's expertise tracking
-- (TwinChat.tsx calling recordWorldInteraction) will actually persist data.

CREATE TABLE IF NOT EXISTS twin_world_expertise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  world TEXT NOT NULL,
  interaction_count INTEGER NOT NULL DEFAULT 0,
  expertise_score INTEGER NOT NULL DEFAULT 50 CHECK (expertise_score >= 0 AND expertise_score <= 100),
  confidence INTEGER NOT NULL DEFAULT 40 CHECK (confidence >= 0 AND confidence <= 100),
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(twin_id, world)
);

CREATE INDEX IF NOT EXISTS idx_twin_world_expertise_twin_id ON twin_world_expertise(twin_id);

ALTER TABLE twin_world_expertise ENABLE ROW LEVEL SECURITY;

-- Same ownership pattern as twin_sice_scores (supabase-schema.sql) — access
-- via the owning Twin's user_id, not a direct user_id column on this table.
CREATE POLICY "World expertise access" ON twin_world_expertise
  FOR ALL
  USING (
    twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
  );

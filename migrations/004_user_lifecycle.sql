-- CRITICAL FIX: user_lifecycle table never existed anywhere in the repo
-- Migration: 004_user_lifecycle.sql
--
-- src/store/lifecycleStore.ts (the P0-A/P0-B lifecycle state machine —
-- ONBOARDING -> ANALYSIS -> AWAKENING -> TWIN_ALIVE -> WORLD_ACTIVE) reads
-- and writes a `user_lifecycle` table on every transition, on Twin creation,
-- and on every activity ping. No CREATE TABLE for it existed in
-- src/services/supabase-schema.sql, migrations/, or supabase/migrations/ —
-- confirmed by grepping the entire repo for "CREATE TABLE.*user_lifecycle".
--
-- Found 2026-08-22 while verifying migration 003 could run: the production
-- SQL Editor returned "relation twins does not exist" and a full table list
-- confirmed twins, twin_memories, decisions, twin_sice_scores,
-- awakening_essence, personal_contexts, decision_patterns, AND
-- user_lifecycle are all absent from production. This means the P0-A/P0-B
-- lifecycle machine (previously traced and reported as verified) has never
-- actually persisted a single record in production — every call has been
-- failing silently or being caught and logged.
--
-- Run this AFTER src/services/supabase-schema.sql (needs twins to exist for
-- the twin_id foreign key) and before re-testing P0-A/P0-B in production.

CREATE TABLE IF NOT EXISTS user_lifecycle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ONBOARDING'
    CHECK (status IN ('ONBOARDING', 'ANALYSIS', 'AWAKENING', 'TWIN_ALIVE', 'WORLD_ACTIVE')),
  twin_id UUID REFERENCES twins(id) ON DELETE SET NULL,
  twin_created_at TIMESTAMP WITH TIME ZONE,
  resumed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_lifecycle_user_id ON user_lifecycle(user_id);

ALTER TABLE user_lifecycle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User lifecycle access" ON user_lifecycle
  FOR ALL
  USING (user_id = auth.uid());

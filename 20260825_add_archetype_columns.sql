-- Migration: Add archetype columns to world_preferences
-- Date: 2026-08-25
-- Purpose: Persist primary and secondary archetypes per world per user (Phase A.1)

ALTER TABLE public.world_preferences
ADD COLUMN IF NOT EXISTS primary_archetype text,
ADD COLUMN IF NOT EXISTS secondary_archetype text;

-- Add comments for documentation
COMMENT ON COLUMN public.world_preferences.primary_archetype IS 'Primary archetype derived from birthDate numerology (e.g., "sage", "creator", "hero")';
COMMENT ON COLUMN public.world_preferences.secondary_archetype IS 'Secondary archetype for diversity/complexity (Phase A.3)';

-- Ensure consistency: NOT NULL with default empty string for now
-- (Phase A.3 will compute secondary when available)
ALTER TABLE public.world_preferences
ALTER COLUMN primary_archetype SET DEFAULT '',
ALTER COLUMN secondary_archetype SET DEFAULT '';

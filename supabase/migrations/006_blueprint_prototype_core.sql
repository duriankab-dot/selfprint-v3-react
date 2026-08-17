/**
 * Migration: Add Prototype Core to blueprints
 *
 * "Prototype Core" is derived deterministically from the person's Life
 * Path Number (see src/lib/astrology.ts getPrototypeCore) — one of 12
 * base archetypes (Hero, Lover, Jester, Everyman, Explorer, Caregiver,
 * Sage, Ruler, Innocent, Magician, Creator, Outlaw). Stored alongside the
 * rest of the blueprint so it persists and shows up in Dashboard/Export.
 *
 * Run this in Supabase SQL Editor (same steps as 004/005):
 * 1. Go to Supabase Dashboard -> SQL Editor
 * 2. Click "New Query"
 * 3. Paste this entire file
 * 4. Click "Run"
 *
 * No new exposed-schema step needed — `selfprint` is already exposed.
 */

ALTER TABLE selfprint.blueprints
  ADD COLUMN IF NOT EXISTS prototype_core VARCHAR(50);

SELECT 'Migration complete ✅ (selfprint.blueprints.prototype_core added)' as status;

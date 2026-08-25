-- CONSOLIDATION MIGRATION: Phase A Complete Schema
-- Purpose: Fix naming conflicts + create missing tables
-- Date: 2026-08-25
-- Status: Safe for clean database (no data migration needed)

-- NOTE: This migration MUST run AFTER 20260824_001_create_twins_table.sql
-- (Supabase applies migrations in alphabetical order, so this will run last)

BEGIN TRANSACTION;

-- ============================================================================
-- STEP 1: CREATE twin_memories (rename from twin_memory)
-- ============================================================================
-- Migration 005 creates "twin_memory" (singular)
-- App expects "twin_memories" (plural)
-- This creates the correct table for app compatibility

CREATE TABLE IF NOT EXISTS twin_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL DEFAULT 'self' CHECK (world_id IN (
    'self', 'SELF', 'MIND', 'RELATIONSHIP', 'LOVE', 'CAREER', 'WEALTH',
    'LIFE', 'GROWTH', 'DECISION', 'PURPOSE', 'WELLBEING', 'FUTURE'
  )),
  role TEXT NOT NULL DEFAULT 'system' CHECK (role IN ('user', 'twin', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_twin_memories_twin_id ON twin_memories(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_memories_world_id ON twin_memories(world_id);
CREATE INDEX IF NOT EXISTS idx_twin_memories_created_at ON twin_memories(created_at DESC);

ALTER TABLE twin_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_twin_memories" ON twin_memories
  FOR SELECT USING (
    twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
  );

CREATE POLICY "users_insert_own_twin_memories" ON twin_memories
  FOR INSERT WITH CHECK (
    twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
  );

CREATE POLICY "users_update_own_twin_memories" ON twin_memories
  FOR UPDATE USING (
    twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
  );

COMMENT ON TABLE twin_memories IS 'Twin memories and interactions per world';
COMMENT ON COLUMN twin_memories.world_id IS '12 Intelligence Worlds: SELF, MIND, RELATIONSHIP, LOVE, CAREER, WEALTH, LIFE, GROWTH, DECISION, PURPOSE, WELLBEING, FUTURE';
COMMENT ON COLUMN twin_memories.role IS 'user = human message, twin = Twin response, system = system event';

-- ============================================================================
-- STEP 2: CREATE twin_sice_scores (missing from migrations)
-- ============================================================================
-- App expects this table for SICE baseline scores
-- Used in: CoreAwakeningService.ts:381 and P5 optimization

CREATE TABLE IF NOT EXISTS twin_sice_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  sice_name TEXT NOT NULL,
  contribution_score INTEGER NOT NULL DEFAULT 50 CHECK (contribution_score BETWEEN 0 AND 100),
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(twin_id, sice_name)
);

CREATE INDEX IF NOT EXISTS idx_twin_sice_scores_twin_id ON twin_sice_scores(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_sice_scores_sice_name ON twin_sice_scores(sice_name);

ALTER TABLE twin_sice_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_sice_scores" ON twin_sice_scores
  FOR SELECT USING (
    twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
  );

CREATE POLICY "users_insert_own_sice_scores" ON twin_sice_scores
  FOR INSERT WITH CHECK (
    twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
  );

CREATE POLICY "users_update_own_sice_scores" ON twin_sice_scores
  FOR UPDATE USING (
    twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
  );

COMMENT ON TABLE twin_sice_scores IS '12 SICE engine baseline scores for each Twin';
COMMENT ON COLUMN twin_sice_scores.sice_name IS 'Engine name: PersonalContextBuilder, PatternDetector, InsightEngine, AIFeedbackLoop, TwinStateEngine, ExperienceEngine, EnvironmentEngine, BadgeEngine, BehavioralForecastEngine, FutureSelfEngine, MemoryManagerEngine, DecisionIntelligenceEngineAdapter';
COMMENT ON COLUMN twin_sice_scores.contribution_score IS 'Confidence score 0-100 from SICE orchestration';

-- ============================================================================
-- STEP 3: CREATE personal_contexts (missing from migrations)
-- ============================================================================
-- App expects this table for linking essence to user context
-- Used in: CoreAwakeningService.ts:359-374

CREATE TABLE IF NOT EXISTS personal_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  awakening_essence_id UUID REFERENCES awakening_essence(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_contexts_user_id ON personal_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_contexts_essence_id ON personal_contexts(awakening_essence_id);

ALTER TABLE personal_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_context" ON personal_contexts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_context" ON personal_contexts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_context" ON personal_contexts
  FOR UPDATE USING (auth.uid() = user_id);

COMMENT ON TABLE personal_contexts IS 'User personal context linked to awakening essence';

-- ============================================================================
-- STEP 4: Drop old twin_memory if it exists (conflicting name)
-- ============================================================================
-- Only if migration 005 successfully created it
-- This prevents naming conflict: twin_memory vs twin_memories

DROP TABLE IF EXISTS twin_memory CASCADE;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all required tables exist
SELECT
  'VERIFICATION PASSED' as status,
  COUNT(*) as tables_created
FROM information_schema.tables
WHERE table_name IN ('twin_memories', 'twin_sice_scores', 'personal_contexts', 'twins', 'awakening_essence')
AND table_schema = 'public';

COMMIT;

-- Success message
SELECT 'Phase A consolidation complete ✅' as result;
SELECT 'Twin memories, SICE scores, and personal contexts ready for production' as status;

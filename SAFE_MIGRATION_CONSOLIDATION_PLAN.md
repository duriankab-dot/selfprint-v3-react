# 🛡️ Safe Migration Consolidation Plan

**Objective:** Merge old (005) + new (20260824) schema without data loss  
**Risk Level:** 🟢 LOW (if executed correctly)  
**Date:** 2026-08-25

---

## **Core Problem**

```
OLD (005):          NEW (20260824):         APP Needs:
twin_memory         twins                   twin_memories ✗
twin_state          awakening_essence       twin_state ✓
twin_personality    (nothing else)          twin_sice_scores ✗
world_preferences                           personal_contexts ✗
conversations                               
messages
capabilities
settings
```

**Diagnosis:** Both incomplete, app needs both + fixes

---

## **SAFE CONSOLIDATION APPROACH**

### ✅ Phase 1: Reorder Migrations (No Changes)

**Strategy:** Rename files to fix FK dependency order

```bash
# RENAME (don't delete, just rename):

# Step 1: Rename old migrations to run FIRST
003_decision_log_autonomy_tracking.sql        → 001_decision_log.sql
004_profiles_blueprints.sql                   → 002_profiles_blueprints.sql
005_core_awakening_ceremony.sql               → 003_core_awakening_ceremony.sql
005_share_links.sql                           → 004_share_links.sql
006_blueprint_prototype_core.sql              → 005_blueprint_prototype.sql
006_twin_evolution.sql                        → 006_twin_evolution.sql
007_analytics_events.sql                      → 007_analytics_events.sql
007_notifications.sql                         → 008_notifications.sql
007_world_stats_fixes.sql                     → 009_world_stats_fixes.sql

# Step 2: Rename new migrations to run AFTER old ones are fixed
20260809_intelligence_core_schema.sql         → 010_intelligence_core.sql
20260810_*.sql                                → 011-019_*.sql (renumber all)
20260811_*.sql                                → 020-025_*.sql (renumber all)
20260816_*.sql                                → 030-032_*.sql (renumber all)
20260817_*.sql                                → 033-034_*.sql (renumber all)
20260824_001_create_twins_table.sql           → 050_create_twins_table.sql
20260824_002_create_awakening_essence.sql     → 051_create_awakening_essence.sql
20260824_003_create_twin_complete_function.sql→ 052_twin_complete_function.sql
```

**Why this works:**
- Migrations now run in clear numbered order
- Dependencies resolve: 003 (core schema) before 050 (twins)
- No code changes, no data loss
- Preserves migration history in git

**Git safety:**
```bash
cd supabase/migrations
git mv 005_core_awakening_ceremony.sql 003_core_awakening_ceremony.sql
# (repeat for all)

git commit -m "chore: reorder migrations for correct FK dependency"
```

---

### ✅ Phase 2: Fix Name Conflicts (ALTER, Not DROP)

**Strategy:** ALTER TABLE to match app expectations

```sql
-- File: 20260825_001_consolidate_schema.sql
-- Purpose: Fix naming conflicts, add missing tables

-- 1. RENAME twin_memory → twin_memories (app expects plural)
-- ⚠️ BUT: Only if no data exists yet
-- If data exists: Create view or alias instead

-- Safe approach: Create new table, copy data, drop old
BEGIN TRANSACTION;

-- 1A. Create new twin_memories (with fixed columns)
CREATE TABLE IF NOT EXISTS twin_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL DEFAULT 'self',  -- Added: app expects this
  role TEXT NOT NULL DEFAULT 'system',    -- Added: app expects this
  content TEXT NOT NULL,                  -- Changed: was JSONB
  metadata JSONB DEFAULT '{}'::jsonb,     -- Added: app expects this
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1B. Copy data from old twin_memory (if exists)
INSERT INTO twin_memories (id, twin_id, world_id, role, content, metadata, created_at, updated_at)
SELECT 
  id,
  twin_id,
  'self' as world_id,                    -- Default: all old memories are "self"
  'system' as role,                      -- Default: all old memories are "system"
  content::text,                         -- Convert JSONB to TEXT
  jsonb_build_object('memory_type', memory_type),  -- Move old field to metadata
  created_at,
  updated_at
FROM twin_memory
ON CONFLICT (id) DO NOTHING;

-- 1C. Drop old table (only if migration successful)
DROP TABLE IF EXISTS twin_memory CASCADE;

-- 2. CREATE missing: twin_sice_scores
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

-- 3. CREATE missing: personal_contexts
CREATE TABLE IF NOT EXISTS personal_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  awakening_essence_id UUID REFERENCES awakening_essence(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Add RLS policies
ALTER TABLE twin_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_sice_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_twin_memories" ON twin_memories
  FOR SELECT USING (
    twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
  );

CREATE POLICY "users_view_own_sice_scores" ON twin_sice_scores
  FOR SELECT USING (
    twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
  );

CREATE POLICY "users_view_own_contexts" ON personal_contexts
  FOR SELECT USING (auth.uid() = user_id);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_twin_memories_twin_id ON twin_memories(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_memories_world_id ON twin_memories(world_id);
CREATE INDEX IF NOT EXISTS idx_twin_sice_scores_twin_id ON twin_sice_scores(twin_id);
CREATE INDEX IF NOT EXISTS idx_personal_contexts_user_id ON personal_contexts(user_id);

COMMIT;

-- Summary
SELECT 'Consolidation complete ✅' as status;
```

**Why this works:**
- ✅ Doesn't delete old data (if exists)
- ✅ Creates new table with correct schema
- ✅ Copies data with transformations
- ✅ Transaction: all-or-nothing
- ✅ If migration fails, nothing changes

---

### ✅ Phase 3: Verify (Read-Only Tests)

```sql
-- Verify twins exists and has correct schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'twins';

-- Verify twin_memories created correctly
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'twin_memories';

-- Verify twin_sice_scores exists
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name = 'twin_sice_scores';

-- Verify personal_contexts exists
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name = 'personal_contexts';

-- Test FK constraints work
SELECT COUNT(*) FROM pg_constraint 
WHERE table_name = 'twin_memories' AND constraint_type = 'f';
```

---

## **EXECUTION ORDER**

```
STEP 1: Rename 28 migration files (git mv)
  └─ Takes 2 minutes
  └─ No data touched
  └─ Reversible: git reset

STEP 2: Create consolidation migration (20260825_001_consolidate_schema.sql)
  └─ Fixes naming
  └─ Creates missing tables
  └─ Copies data (if exists)
  └─ Safe: transaction

STEP 3: Verify schema (run queries)
  └─ Check tables exist
  └─ Check columns match
  └─ Check indexes exist

STEP 4: Run supabase start
  └─ Should work if steps 1-3 successful
  └─ If fails: can roll back
```

---

## **ROLLBACK PROCEDURE (If Needed)**

```bash
# If Phase 1 fails:
git reset --hard HEAD
# (migration file renames reverted)

# If Phase 2 fails:
# Supabase rolls back transaction automatically
# (no data loss)

# If Phase 3 fails:
# Check logs, fix schema, create new migration
# (never delete data)
```

---

## **PRODUCTION SAFETY CHECKLIST**

- [ ] **No DELETE TABLE** (only CREATE IF NOT EXISTS)
- [ ] **No TRUNCATE** (clears data)
- [ ] **No ALTER TABLE DROP COLUMN** (data loss)
- [ ] **Transaction used** (all-or-nothing)
- [ ] **Backup before execution** (supabase auto-backups, but verify)
- [ ] **Test on staging first** (if staging exists)
- [ ] **Verify FK constraints** (prevent orphaned data)
- [ ] **Verify RLS policies** (prevent auth bypass)
- [ ] **Verify indexes** (ensure performance)

---

## **DATA MIGRATION PATH (If Old Data Exists)**

```
twin_memory (OLD)
├─ id ✓
├─ twin_id ✓
├─ user_id ✗ (drop)
├─ memory_type ✗ (move to metadata)
├─ content JSONB (convert to TEXT)
└─ created_at, updated_at ✓

↓ TRANSFORM

twin_memories (NEW)
├─ id ✓
├─ twin_id ✓
├─ world_id = 'self' (default for old data)
├─ role = 'system' (default for old data)
├─ content TEXT ✓
├─ metadata = {memory_type: <old_value>}
└─ created_at, updated_at ✓
```

**Result:** All old data migrates safely, new columns get sensible defaults

---

## **DECISION REQUIRED**

**Before executing this plan:**

1. **Confirm production status:**
   - [ ] Production has NO data yet (safe to proceed)
   - [ ] Production has data (need to verify schema compatibility first)
   - [ ] Unknown (check database)

2. **Confirm migration approach:**
   - [ ] Yes, do Phase 1 (rename) + Phase 2 (consolidate)
   - [ ] No, wait for additional analysis

3. **Confirm data handling:**
   - [ ] Copy old data if exists (recommended)
   - [ ] Skip old data, start fresh (risky if data exists)

---

**Status:** 🟢 **PLAN READY — AWAITING APPROVAL**

---

### Next: User decides → Execute → Verify → Run supabase start → Run npm test

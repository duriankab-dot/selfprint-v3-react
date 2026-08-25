# 🔴 APPLICATION vs SCHEMA MISMATCH REPORT

**Status:** CRITICAL - App cannot run  
**Date:** 2026-08-25

---

## **FINDING 1: Missing Tables**

### App Expects (from code)
```
✗ twin_memories (plural)
✗ twin_sice_scores
✗ awakening_essence (FOUND)
✗ personal_contexts
```

### Migrations Create
```
✓ awakening_essence (20260824_002)
✗ twin_memories — NOT CREATED
✗ twin_sice_scores — NOT CREATED
✗ personal_contexts — NOT CREATED
```

**Severity:** 🔴 **BLOCKING**

---

## **FINDING 2: Name Mismatch**

### Migration 005 creates:
```sql
CREATE TABLE IF NOT EXISTS twin_memory (
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  ...
)
```

### App code uses (CoreAwakeningService.ts:384):
```typescript
supabase.from('twin_memories').insert({
  twin_id: newTwin.id,
  world_id: 'self',
  role: 'system',
  content: memoryContent,
  metadata: {...},
})
```

**Problem:** 
- Migration: `twin_memory` (singular, 3 syllables)
- App: `twin_memories` (plural, 4 syllables)
- **MISMATCH**

---

## **FINDING 3: Table Requirements from App**

### From CoreAwakeningService.ts (P5 work)

**Line 381:** `twin_sice_scores` table needed
```typescript
supabase.from('twin_sice_scores').insert(baselineScores)

// baselineScores structure:
[
  {
    twin_id: UUID,
    sice_name: string (engine name),
    contribution_score: number (0-100),
    last_active: timestamp,
    updated_at: timestamp,
    created_at: timestamp
  },
  ... (12 rows)
]
```

**Line 384:** `twin_memories` table needed
```typescript
supabase.from('twin_memories').insert({
  twin_id: newTwin.id,
  world_id: 'self',
  role: 'system',
  content: memoryContent,
  metadata: {
    eventType: 'awakening',
    timestamp: new Date().toISOString(),
    grounded: Boolean(groundedInsight),
  },
})
```

### From other files

**src/lib/memory/loadRecentMemories.ts:**
```typescript
.from('twin_memories')  // Uses plural
```

**src/api/sice/process.ts:**
```typescript
await supabase.from('twin_memories').insert({...})
```

**src/api/twin/create.ts:**
```typescript
await supabase.from('twin_memories').insert({...})
```

---

## **FINDING 4: Migration 005 Schema vs App Needs**

### Migration 005 creates `twin_memory` with:
```sql
CREATE TABLE IF NOT EXISTS twin_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### App needs `twin_memories` with (inferred):
```sql
-- Expected schema (based on P5 usage):
CREATE TABLE twin_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,  -- 'self', 'MIND', 'RELATIONSHIP', etc.
  role TEXT NOT NULL,      -- 'system', 'user', 'twin'
  content TEXT NOT NULL,   -- Memory text content
  metadata JSONB DEFAULT '{}'::jsonb,  -- Additional metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Schema Differences:**
| Field | 005 twin_memory | App twin_memories |
|-------|-----------------|-------------------|
| id | ✓ | ✓ |
| twin_id | ✓ | ✓ |
| user_id | ✓ | ✗ (not used) |
| world_id | ✗ | ✓ (REQUIRED) |
| role | ✗ | ✓ (REQUIRED) |
| memory_type | ✓ | ✗ (not used) |
| content | ✓ JSONB | Changed to TEXT |
| metadata | ✗ | ✓ (REQUIRED) |

---

## **FINDING 5: Missing Table - twin_sice_scores**

### App expects (CoreAwakeningService.ts:365-373):
```typescript
const baselineScores = REAL_SICE_ENGINE_NAMES.map((engineName) => ({
  twin_id: newTwin.id,
  sice_name: engineName,
  contribution_score: Math.max(0, Math.min(100, confidenceByEngine.get(engineName) ?? 50)),
  last_active: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

supabase.from('twin_sice_scores').insert(baselineScores);
```

### Expected schema:
```sql
CREATE TABLE twin_sice_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  sice_name TEXT NOT NULL,
  contribution_score INTEGER NOT NULL CHECK (contribution_score BETWEEN 0 AND 100),
  last_active TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(twin_id, sice_name)
);
```

### Migration status:
```
❌ NO MIGRATION CREATES twin_sice_scores
```

---

## **FINDING 6: Missing Table - personal_contexts**

### App expects (CoreAwakeningService.ts:359-374):
```typescript
const { data: personalContext } = await supabase
  .from('personal_contexts')
  .select('id')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (personalContext) {
  return await supabase
    .from('personal_contexts')
    .update({
      awakening_essence_id: essence.id,
    })
    .eq('id', personalContext.id);
}
```

### Expected schema:
```sql
CREATE TABLE personal_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  awakening_essence_id UUID REFERENCES awakening_essence(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Migration status:
```
❌ NO MIGRATION CREATES personal_contexts
```

---

## **SUMMARY: Schema Gap Analysis**

| Table | Migration Creates | App Uses | Schema Match |
|-------|------------------|----------|--------------|
| twins | 20260824_001 | ✓ | ✓ |
| awakening_essence | 20260824_002 | ✓ | ✓ |
| twin_memory | 005 | ✗ (uses twin_memories) | ❌ NAME MISMATCH |
| twin_memories | NONE | ✓ REQUIRED | ❌ MISSING |
| twin_sice_scores | NONE | ✓ REQUIRED | ❌ MISSING |
| personal_contexts | NONE | ✓ REQUIRED | ❌ MISSING |
| twin_state | 005 | ✓ (core-awakening.ts) | ✓ |

---

## **ROOT CAUSE**

```
Timeline:
1. Migration 005 created "twin_memory" table (singular)
2. Later, P5 work created app code expecting "twin_memories" (plural)
3. P5 work also created tables twin_sice_scores and personal_contexts
4. BUT: No migrations create these 3 required tables
5. Result: App cannot run — tables don't exist

Blame: Migrations incomplete for Phase A app needs
```

---

## **REPAIR REQUIREMENTS**

**Option A: Rename & Fix**
```
1. Rename 005_core_awakening_ceremony.sql → 001_core_schema.sql
   (so it runs before 20260824)
2. Alter migration 005: twin_memory → twin_memories
3. Create migration for: twin_sice_scores
4. Create migration for: personal_contexts
5. Create migration for: Others (if app uses them)
```

**Option B: Create Repair Migration**
```
1. Keep all migrations as-is (preserve history)
2. Create: 20260825_repair_phase_a_schema.sql
3. Create missing tables with correct names
4. Drop conflicting old tables (if exists)
5. Create aliases for backward compat (if needed)
```

**Option C: Create New Complete Schema**
```
1. Create: 20260825_phase_a_complete_schema.sql
2. Include all tables Phase A needs
3. Drop old incomplete schema
4. Migrate data (if exists)
```

---

## **DECISION NEEDED**

**Cannot proceed with migration repair until:**

1. ✓ Confirm: twin_memories vs twin_memory choice
2. ✓ Confirm: personal_contexts table needed?
3. ✓ Confirm: twin_sice_scores columns correct?
4. ✓ Confirm: Repair option (A/B/C)?
5. ✓ Confirm: Production has no data yet?

**Current Status:** 🛑 **BLOCKED - AWAITING DECISION**

---

**No migrations modified**  
**No tables dropped**  
**No data touched**  
**Analysis only**

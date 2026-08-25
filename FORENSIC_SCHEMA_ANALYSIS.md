# 🔬 Forensic Schema Analysis — Complete Migration Dependency Graph

**Analysis Date:** 2026-08-25  
**Status:** READ-ONLY - No changes made

---

## **FINDING 1: twins table Canonical Definition**

### Source: `20260824_001_create_twins_table.sql`

```sql
CREATE TABLE twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  personality_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

**Characteristics:**
- 1 row per user (UNIQUE user_id)
- Minimal schema: id, user_id, name, personality_type, timestamps
- RLS: 3 policies (SELECT, INSERT, UPDATE)
- Index: idx_twins_user_id

**Issue:** Marked as "CRITICAL FIX: missing foundation" in comment  
**Implication:** twins table was missing and recently added (2026-08-24)

---

## **FINDING 2: 005_core_awakening_ceremony.sql — Core Phase A Schema**

### Dependencies on `twins`

This migration creates **9 dependent tables** that all REFERENCE twins(id):

1. **twin_state**
   ```
   twin_id UUID NOT NULL UNIQUE REFERENCES twins(id)
   ```
   Stores: consciousness state, stage (seed/awakening/growing/advanced/complete), level

2. **twin_personality**
   ```
   twin_id UUID NOT NULL UNIQUE REFERENCES twins(id)
   ```
   Stores: personality, communication style, tone, expertise areas

3. **world_preferences**
   ```
   twin_id UUID NOT NULL REFERENCES twins(id)
   world_name ENUM (SELF, MIND, RELATIONSHIP, ..., FUTURE - 12 worlds)
   expertise_level (1-5)
   ```

4. **twin_memory**
   ```
   twin_id UUID NOT NULL REFERENCES twins(id)
   memory_type TEXT
   content JSONB
   ```

5. **twin_capabilities**
   ```
   twin_id UUID NOT NULL UNIQUE REFERENCES twins(id)
   stage TEXT
   unlocked_features TEXT[]
   locked_features TEXT[]
   ```

6. **conversations**
   ```
   twin_id UUID NOT NULL REFERENCES twins(id)
   world TEXT (ENUM 12 worlds)
   status (active/archived/closed)
   ```

7. **messages**
   ```
   conversation_id UUID NOT NULL REFERENCES conversations(id)
   twin_id UUID NOT NULL REFERENCES twins(id)
   role (user/twin)
   content TEXT
   ```

8. **conversation_settings**
   ```
   conversation_id UUID NOT NULL UNIQUE REFERENCES conversations(id)
   twin_id UUID NOT NULL REFERENCES twins(id)
   tone, response_length, include_follow_up_questions, etc.
   ```

9. **conversation_memory**
   ```
   conversation_id UUID NOT NULL UNIQUE REFERENCES conversations(id)
   twin_id UUID NOT NULL REFERENCES twins(id)
   key_themes TEXT[]
   user_context JSONB
   ```

### Execution Order Problem

```
Supabase applies migrations alphabetically:
└─ "005_core_awakening_ceremony.sql" runs FIRST
   └─ CREATE TABLE twin_state REFERENCES twins(id)
   └─ ERROR: relation "twins" does not exist
   └─ Migration FAILS
   └─ supabase start BLOCKS

(Later in alphabet)
└─ "20260824_001_create_twins_table.sql" runs LATER
   └─ CREATE TABLE twins (...) ← TOO LATE!
```

---

## **FINDING 3: Duplicate Migration Numbers**

### Version Conflicts

| Version | File 1 | File 2 | Status |
|---------|--------|--------|--------|
| 005 | core_awakening_ceremony.sql | share_links.sql | ⚠️ CONFLICT |
| 006 | blueprint_prototype_core.sql | twin_evolution.sql | ⚠️ CONFLICT |
| 007 | analytics_events.sql | notifications.sql + world_stats_fixes.sql | ⚠️ TRIPLE CONFLICT |

**How Supabase Handles Conflicts:**
- Sorts alphabetically
- If both "005_X" and "005_Y" exist:
  - "005_X" runs before "005_Y" alphabetically
  - No guarantee of intention

**Implication:** Migration sequence may not match developer intent

---

## **FINDING 4: Duplicate Table Definitions**

### Table: `selfprint`

**File 1:** `004_profiles_blueprints.sql`
```
CREATE TABLE IF NOT EXISTS selfprint (...)
```

**File 2:** `005_share_links.sql`
```
CREATE TABLE IF NOT EXISTS selfprint (...)
```

**Question:** What are the differences?  
**Action:** Need to read both files to compare

### Table: `decision_log`

**File 1:** `003_decision_log_autonomy_tracking.sql`
```
CREATE TABLE decision_log (...)
```

**File 2:** `20260816_create_decision_tables.sql`
```
CREATE TABLE decision_log (...)
```

**Question:** Are they the same schema?  
**Action:** Need to compare definitions

### Table: `decision_outcomes`

**File 1:** `007_notifications.sql`
```
CREATE TABLE decision_outcomes (...)
```

**File 2:** `20260816_create_decision_tables.sql`
```
CREATE TABLE decision_outcomes (...)
```

**Question:** Duplicate? Conflicting schemas?  
**Action:** Need to compare definitions

---

## **FINDING 5: Unclear Schema in 12 Files**

Files that create tables but description says "public":

```
20260809_intelligence_core_schema.sql
20260810_chat_messages.sql
20260810_create_user_credentials.sql
20260810_journal_queue.sql
20260810_push_subscriptions.sql
20260810_subscriptions.sql
20260811_auth_rate_limits.sql
20260811_create_passkey_challenges.sql
20260811_daily_briefs.sql
20260816_world_preferences.sql
20260817_twin_learning_profiles.sql
20260824_002_create_awakening_essence_table.sql
```

**Need to read:** What is the actual schema in these files?

---

## **CRITICAL QUESTION: What is the "Canonical Phase A Schema"?**

### Option A: OLD Migrations (003-007)
- Lines: Twin, world preferences, conversations, messages
- RLS: Comprehensive RLS policies
- Status: Developed early, references twins before twins existed

### Option B: NEW Migrations (20260824)
- Created recently (yesterday)
- Simpler twins table
- Attempts to be "foundation"

### Option C: MIXED (Some old, some new)
- Use old schema for what works
- Use new for what was missing
- Requires careful dependency management

**Deciding Factor:** Which schema does Phase A application code actually use?

Need to grep application code for:
```
- SELECT ... FROM twin_state
- SELECT ... FROM twin_personality
- SELECT ... FROM conversations
- SELECT ... FROM messages
- SELECT ... FROM twins
```

---

## **STATUS: INCOMPLETE ANALYSIS**

### ✅ Verified
- twins table schema (20260824_001)
- 005 migration dependencies (9 tables)
- Execution order problem (FK blocker)
- Duplicate migration numbers (6 files)
- Duplicate table names (3 tables)

### ❓ Still Need to Analyze
- Read 004, 005_share_links, 006, 007, 20260816, 20260817, 20260824_002 in full
- Compare duplicate table schemas
- Grep application code for actual table usage
- Determine which is canonical
- Verify production database doesn't have data

---

## **NEXT ACTION**

**Do NOT fix migrations yet** - Need to:

1. Read all potentially conflicting migration files
2. Compare duplicate schemas
3. Grep application code for actual table usage
4. Determine canonical schema
5. Verify production safety

**Recommendation:** Mark as BLOCKED until schema reconciliation is complete

---

**Analysis Tool:** Python dependency graph script  
**Status:** READ-ONLY, no data modified  
**Safety:** 🟢 No risk to production

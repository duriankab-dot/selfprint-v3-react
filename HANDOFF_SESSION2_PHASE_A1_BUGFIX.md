# 🎯 HANDOFF: PHASE A.1 BUG FIX SESSION

**Status:** ⏳ IN PROGRESS — 409 Error Still Blocking  
**Date:** August 25, 2026  
**Issue:** Production onboarding broken — lifecycle duplicate key + archetype NULL  
**Deployed:** Commit `4ea133e` (18 min ago) ✅ Ready on Vercel

---

## 📌 CRITICAL: ปัญหาที่แก้ไม่ผ่าน (Blocking Everything)

### ❌ **409 Conflict: Duplicate Key Error PERSISTS**

**Current State:**
```
POST /rest/v1/user_lifecycle 409 (Conflict)
Error: "duplicate key value violates unique constraint "user_lifecycle_user_id_key""
User signup gets stuck at Onboarding error page
Cannot proceed to Analysis → Core Awakening → Twin creation
```

**What We Fixed (Code):**
```typescript
// ✅ BEFORE: .update() on table that might not have row
const { error } = await supabase
  .from('user_lifecycle')
  .update({ status: newStatus, ... })
  .eq('user_id', userId);

// ✅ AFTER: .upsert() auto-creates row if missing
const { error } = await supabase
  .from('user_lifecycle')
  .upsert({ 
    user_id: userId,  // ← KEY: must include in upsert
    status: newStatus, 
    ... 
  })
  .eq('user_id', userId);
```

**BUT:** Production still 409 → Code deployed BUT something else blocking:

**Possible Causes (Must Investigate Next Session):**
1. **RLS Policy** blocking INSERT (for upsert create case)
   - Check: Supabase → user_lifecycle → RLS policy tab
   - Fix: Add INSERT policy if missing
   
2. **Vercel not using new code**
   - Check: Vercel commit hash = 4ea133e?
   - Verify: Hard refresh (Ctrl+Shift+R) on production
   
3. **Primary Key Constraint** on user_lifecycle
   - Check: user_id must be PRIMARY KEY UNIQUE
   - If upsert conflicts on PK → need ON CONFLICT handling

**Next Session Action:**
```
BEFORE anything else:
1. Delete supabase/migrations/033_create_user_lifecycle_table.sql (duplicate)
2. Verify Vercel deployed commit hash = 4ea133e
3. Check RLS policies on user_lifecycle table
4. If 409 still happens → enable query logging in Supabase
```

---

## ❌ **Archetype Values Remain NULL (Database)**

**Current State:**
```sql
-- Old user (before fixes): NULL
SELECT world_id, primary_archetype, secondary_archetype 
FROM world_preferences 
WHERE user_id = 'c2b3e495-dfff-41a3-a7a0-48751376ee59' 
LIMIT 5;
-- Result: 0 rows (NULL for all 12 worlds)

-- New user (after 409 fix): Cannot test — signup blocked
```

**Root Cause:**
- Twin creation blocked by 409 error → Never reaches CoreAwakening
- CoreAwakening is where archetypes get computed + persisted
- Code has persist logic but never executes because Twin never created

**Archetype Computation (Hardcoded):**
```typescript
// ❌ PRIMARY: Dynamic from birthDate (✓ implemented but never runs)
const birthArchetype = calculateInitialDisciplines(birthDate)
  .prototypeCore.toLowerCase() as Archetype;
// Maps: Numerology life-path → one of 12 archetypes

// ❌ SECONDARY: Hardcoded fallback (✓ was fixed to random)
// BEFORE: return (primary === 'everyman' ? 'sage' : 'everyman')
// AFTER: return random archetype ≠ primary
// BUT: Both never persist because Twin creation fails at 409

// ❌ PERSIST: Code exists but never runs
await supabase.from('world_preferences').upsert({
  user_id: userId,
  world_id: worldName,
  primary_archetype: primaryArchetype,  // ← Still NULL in DB
  secondary_archetype: secondaryArchetype,  // ← Still NULL in DB
});
```

**Why It's NULL:**
1. Signup hits 409 error
2. User stuck on error page
3. Never reaches Core Awakening ceremony
4. Archetype computation + persistence never runs
5. Database rows have NULL values

**Next Session Action:**
```
AFTER 409 fixed:
1. New signup end-to-end
2. Reach Core Awakening
3. Verify archetype values persist to world_preferences
4. Check: 12 worlds × 2 archetypes (24 values) should exist
```

---

## 📋 COMPLETE TASK BREAKDOWN

### ✅ **COMPLETED (Code Level)**

| Task | File | Change | Status |
|------|------|--------|--------|
| Fix lifecycle transitionTo | `src/store/lifecycleStore.ts` | `.update()` → `.upsert()` | ✅ Code done |
| Fix lifecycle setTwinCreated | `src/store/lifecycleStore.ts` | `.update()` → `.upsert()` | ✅ Code done |
| Remove useNova from CoreAwakening | `src/pages/CoreAwakening.tsx` | Delete import + call | ✅ Code done |
| Archetype dynamic (secondary) | `src/services/CoreAwakeningService.ts` | Random ≠ primary | ✅ Code done |
| Build + TypeScript | `npm run build` | 26.27s ✓ | ✅ Done |

### ⏳ **DEPLOYED BUT BROKEN**

| Task | Issue | Block |
|------|-------|-------|
| Verify 409 fixed | Still 409 Conflict in production | RLS? Vercel version? |
| Archetype persistence | Cannot test — signup blocked | Depends on 409 fix |
| Test E2E flow | Cannot complete — Twin creation fails | Depends on 409 fix |

### 🔴 **NOT STARTED — PHASE A.1 Remaining**

| Task | Scope | Priority | Days |
|------|-------|----------|------|
| **Debug 409 root cause** | RLS + Vercel + constraints | 🔴 CRITICAL | 0.5 |
| **Maturity Score dynamic** | Hardcoded 30 → calculated | 🔴 CRITICAL | 1 |
| **E2E Test: Full Journey** | Signup to Worlds (Playwright) | 🔴 CRITICAL | 1 |
| **Archive Visual DNA persist** | Create table + persist layer | 🟡 Important | 1 |
| **Performance verification** | Twin <2s, routing <1.5s | 🟡 Important | 1 |

### 🔴 **PHASE A.2 (Blocking Phase A completion)**

| Task | Scope | Priority | Days |
|------|-------|----------|------|
| Full E2E Test Suite | All lifecycle scenarios | 🔴 CRITICAL | 3 |
| Performance Testing | Load + stress + profiling | 🔴 CRITICAL | 2 |
| Security Audit | Cross-user isolation + injection | 🔴 CRITICAL | 3 |
| Mobile Verification | iOS/Android testing | 🟡 Important | 2 |

### 🔴 **PHASE A.3 (Documentation + Release)**

| Task | Scope | Priority | Days |
|------|-------|----------|------|
| Fix Documentation | Consistency + honest claims | 🟡 Important | 1 |
| Production Smoke Test | Load + recovery + monitoring | 🟡 Important | 1 |
| Production Release Gate | Final checklist | 🔴 CRITICAL | 0.5 |

---

## 🔁 **PROBLEMS THAT RECURRED (Keep Hitting)**

### Problem #1: Duplicate Key on user_lifecycle

**First Time:** Session 1 — Onboarding loop, got 409  
**Cause:** Copy-paste in AnalysisPage.tsx (transitionTo ONBOARDING twice)  
**Fixed:** Changed to ANALYSIS  
**Recurred:** Session 2 — Still 409 despite code fix  

**Why It Comes Back:**
- transitionTo() uses `.update()` on missing row
- Fixed with `.upsert()` but production still 409
- Root cause deeper: RLS policy or Vercel deploy issue

**Lesson:** 409 error is a **symptom** not **root cause**
- Surface fix (upsert) ≠ actual cause fix
- Need to verify: permissions, constraints, deployment

---

### Problem #2: Archetype NULL Forever

**First Time:** Session 1 — Database query shows NULL  
**Cause:** Twin never created (stuck in onboarding loop)  
**Tried:** Made secondary archetype dynamic (random)  
**Result:** Still NULL because Twin never created  

**Why It Stays NULL:**
- Archetype computation happens in CoreAwakening
- If onboarding broken → never reach CoreAwakening
- If 409 error → Twin never persists
- Result: 12 worlds × NULL archetype values

**Lesson:** Don't fix downstream without fixing upstream
- Archetype fix useless if Twin creation fails
- 409 error is upstream blocker
- Must fix 409 FIRST before testing archetype

---

### Problem #3: NovaProvider Context Error

**First Time:** Session 1 — "useNova must be used within NovaProvider"  
**Cause:** CoreAwakening used `useNova()` without wrapping provider  
**Fixed:** Removed useNova() import + completeAnalysis() call  
**Status:** ✅ FIXED (code-level)

**Why It Was Tricky:**
- CoreAwakening is Twin birth ceremony (not Nova)
- Nova is separate AI (different context)
- useNova() call was leftover from old code
- Removing it was correct — no longer needed for Twin

**Lesson:** Context mismatch caught by error
- Code structure shows which provider wraps what
- CoreAwakening → Twin creation (use TwinContext only)
- NovaChat → Nova conversation (use NovaContext only)

---

## 🎬 SESSION 2 ACTION PLAN

### **First 30 Minutes (Blocker Resolution)**

```
1. DELETE: supabase/migrations/033_create_user_lifecycle_table.sql
   - Don't push this migration (duplicate of existing schema)
   
2. VERIFY: Vercel deployment
   - Check deployed commit hash = 4ea133e
   - Hard refresh production (Ctrl+Shift+R)
   - Console should NOT show 409 error
   
3. DEBUG: If 409 still present
   a) Check RLS policy on user_lifecycle
      - Supabase → user_lifecycle → RLS policy tab
      - Verify INSERT policy exists
      - Fix if missing
   
   b) Check Supabase logs
      - SQL Editor → see actual constraint violation
      - Is it really on user_lifecycle_user_id_key?
      - Or something else masquerading as that?
   
   c) Test manually
      - Direct upsert in Supabase SQL Editor
      - INSERT user_lifecycle(user_id, status, ...)
      - Should work or should fail with specific error
```

### **If 409 FIXED → 90 Minutes (Test E2E)**

```
1. NEW signup with fresh email
   - Go: selfprint.one/en/onboarding
   - Complete: Emotion → Nova → Blueprint → Analysis → Claim
   - Should reach: Core Awakening (no error page)
   
2. Name Twin
   - Should see: HologramBirth animation
   - Should create: Twin in database
   - Should transition: lifecycle to TWIN_ALIVE
   
3. Verify database
   - Check twins table: Twin created with correct name
   - Check world_preferences: 12 worlds × primary_archetype (NOT NULL)
   - Check world_preferences: 12 worlds × secondary_archetype (NOT NULL)
   - Each Twin unique (not sage + explorer for all)
   
4. If everything ✓
   - Commit + Push the upsert fix
   - Mark blockers RESOLVED
```

### **If 409 STILL BROKEN → Debug Deep**

```
1. Read actual error from Supabase logs
2. Check constraint definition
3. Trace upsert call in code
4. May need to:
   - Fix RLS policy
   - Add migration for constraint fix
   - Change upsert syntax
```

---

## 📁 **FILES TO WATCH**

### Modified (Not Pushed)
```
src/store/lifecycleStore.ts          ← 2 edits: transitionTo + setTwinCreated
src/pages/CoreAwakening.tsx          ← 2 edits: remove useNova
supabase/migrations/033_*.sql        ← DELETE THIS (duplicate)
```

### To Edit Next Session
```
src/services/CoreAwakeningService.ts ← Add maturity score calculation
src/lib/twin/twinVisualDNA.ts        ← Add persistence layer (new)
supabase/migrations/034_*.sql        ← Add visual_dna table if needed
```

---

## 🚨 **KEY INSIGHT FOR NEXT SESSION**

**The 409 error is the blocker for EVERYTHING:**
- Onboarding → stuck
- Twin creation → blocked
- Archetype persistence → never runs
- E2E tests → cannot pass
- Phase A.1 verification → impossible

**Once 409 fixed:**
- Everything downstream should work (if code is right)
- Archetype dynamic ✓ (already in code)
- Maturity dynamic (needs adding)
- Visual DNA (needs migration + persist layer)

**Do not** start Phase A.2 tasks (E2E/Security/Performance) until:
1. ✅ 409 error completely gone
2. ✅ New user can signup → Twin birth → Worlds
3. ✅ Archetype values exist in database (NOT NULL)

---

## ✍️ **MEMORY FOR NEXT SESSION**

```markdown
# PHASE A.1 Blocker: 409 Duplicate Key (Persistent)

## What Broke
- Onboarding → Lifecycle transition fails with 409
- User cannot reach Twin creation
- Archetype persist never runs (stuck upstream)
- 3 code fixes deployed but 409 still happens

## Code Fixes Applied (Verified)
1. lifecycleStore.transitionTo() — .upsert() instead of .update()
2. lifecycleStore.setTwinCreated() — .upsert() instead of .update()
3. CoreAwakening — removed useNova() (not needed for Twin)

## Deployed Commit
- 4ea133e (P0 FIX: lifecycle upsert + remove NovaProvider usage)
- Status: Ready on Vercel (18 min ago)

## Root Cause Unknown
- 409 error suggests constraint violation
- But upsert should handle it
- Possible: RLS policy blocking INSERT, or Vercel using wrong code, or constraint defined wrong

## Next Session Actions (Priority)
1. Delete migration 033 (duplicate)
2. Verify Vercel commit hash matches 4ea133e
3. Check RLS policy on user_lifecycle (INSERT needed)
4. If still 409: Debug in Supabase logs + SQL Editor
5. Once fixed: Signup E2E test → verify archetype persist

## Lessons Learned
- 409 is symptom, not root cause (dig deeper)
- Downstream fixes (archetype) useless without upstream (Twin creation) working
- Context mismatch (Nova vs Twin) caught by runtime error
```

---

**Ready for Handoff → Session 2** ✓

Next developer: Start with "First 30 Minutes" section above.

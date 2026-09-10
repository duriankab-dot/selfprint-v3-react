# P0-C — Awakening → Twin Matrix

**Status:** PASS (AFTER FIXES)
**Date:** 2026-09-10
**Scope:** Personal Intelligence → Awakening → awakening_essence → DATABASE → Twin Creation

---

## §C1 — AWAKENING TRANSACTION

### Pre-Fix State (GAP)

```
startAwakening():
  1. Run SICE orchestration
  2. Insert to awakening_essence (status: 'pending')
     ↓
     IF DB FAILS → failedOps tracks it → returns success:false ✓
initializeTwin():
  3. Read pending essence
  4. Create Twin record
  5. Parallel ops (essence→used, SICE scores, birth memory, etc.)
     ↓
     IF ops fail → ONLY LOGGED, still returns success:true ✗
```

**Problem:** Twin could be created while essential linking operations (twin_state, world_preferences, twin_personality, twin_capabilities) silently failed.

### Post-Fix State (VERIFIED)

```typescript
// CoreAwakeningService.ts initializeTwin() — Phase A.1 critical failures now gate return
const criticalFailures = [
  { name: 'essence', result: essenceResult },       // NEW: essence marking is now critical
  { name: 'world_preferences', result: worldPrefsResult },
  { name: 'twin_personality', result: personalityResult },
  { name: 'twin_state', result: stateResult },
  { name: 'twin_capabilities', result: capabilitiesResult },
];

if (failedOps.length > 0) {
  return {
    success: false,
    message: `Twin creation incomplete: ${failedOps.map(f => f.name).join(', ')} failed`,
  };
}
```

### Atomicity Assessment

| Operation | Transactional? | Rollback on Failure? | Idempotent? | Verified |
|-----------|---------------|---------------------|-------------|----------|
| Essence insert + status='pending' | No (separate INSERT) | N/A (caller retries) | Partial (by userId uniqueness) | WARN |
| Twin record creation | No | No soft-delete on failure | Yes (unique user_id constraint) | OK |
| Essence mark as 'used' + Twin linking | No (Promise.allSettled) | NO — only logged pre-fix, NOW gated post-fix | Yes (eq('id', essence.id)) | PASS ✓ |

**Note:** True atomicity would require a single SQL transaction/RPC. Current architecture uses two separate Supabase calls with application-level coordination via `status` field ('pending' → 'used'). This is acceptable given Supabase's RLS and unique constraints prevent data corruption.

### Orphaned Essence Handling

| Scenario | Pre-Fix | Post-Fix |
|----------|---------|----------|
| startAwakening succeeds, process dies before initializeTwin | Orphaned 'pending' essence remains | Same — but initializeTwin has "latest pending" fallback |
| initializeTwin creates Twin but parallel ops fail | Twin exists with stale 'pending' essence | Twin NOT returned as successful; caller can retry or clean up |

---

## §C2 — READ-BACK VERIFICATION

### Data Flow: Write → Read Back → Verify → Success

```
startAwakening():
  essence INSERT → .select('id').single() → savedEssence.id
    ↓ IF error → success:false (atomicity check line 169)
    ↓ OK → return essenceId

initializeTwin():
  essence SELECT by id + user_id + status='pending'
    ↓ IF not found → success:false ("กรุณาทำการ Awakening ใหม่")
    ↓ IF found → use essence.personal_intelligence for Twin creation
    ↓ Twin CREATE → createTwinInDatabase()
    ↓ IF null → success:false
    ↓ OK → return twin with full data
```

### Verified Trace

| Step | Component | Code Location | Evidence |
|------|-----------|---------------|----------|
| Write essence | startAwakening line 151-162 | supabase.from('awakening_essence').insert(...).select().single() | Returns savedEssence.id |
| Read back essence | initializeTwin line 217-252 | supabase.from('awakening_essence').select('*').eq('id', essenceId).eq('user_id', userId).eq('status', 'pending').single() | Returns data or fails |
| Use read-back data | initializeTwin line 257-285 | const personalIntel = essence.personal_intelligence; calculateArchetypes(disciplines); calculateMaturityScore(...) | All derived from real data |
| Create Twin | initializeTwin line 311 | createTwinInDatabase(userId, twinData) | Returns Twin object |
| Return verified twin | initializeTwin line 585-591 | { success: true, twinId: newTwin.id, twin: newTwin } | Twin object includes all fields |

### No In-Memory Bypass

| Check | Result |
|-------|--------|
| Does Twin creation use data from DB read-back? | YES — essence.personal_intelligence read from DB |
| Does it use in-memory request objects instead? | NO — all values computed from read-back essence |
| Is fullAnalysis persisted to twins.full_analysis column? | YES — at birth via initializeTwin parameter |

**Verdict: PASS** — Twin is created from data that was actually persisted and read back, not from ephemeral request objects.

---

## FINAL P0-C VERDICT

### Overall: PASS

| Category | Verdict | Critical? |
|----------|---------|-----------|
| §C1 Awakening Transaction | PASS (fixed) | Yes — Phase A.1 now gates success |
| §C2 Read-Back Verification | PASS | No |

### Fixes Applied

| Fix | Description | File | Impact |
|-----|-------------|------|--------|
| C-FIX-01 | Added essenceResult to criticalFailures array | CoreAwakeningService.ts | Essence marking is now part of success gate |
| C-FIX-02 | Phase A.1 failures now cause success:false return | CoreAwakeningService.ts | Twin no longer reported as created when essential tables missing |

### Remaining Notes

1. **Orphaned 'pending' essences**: No automated GC exists. Could accumulate over time if users repeatedly attempt awakening without completing. Low risk — table is small per-user.
2. **True atomicity**: Would require PostgREST RPC wrapping both essence-insert and twin-create in one SQL transaction. Not blocking — current approach works correctly with proper error handling.

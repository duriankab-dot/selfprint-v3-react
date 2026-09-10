# FAILURE PATH MATRIX — SECOND PASS

**Date:** 2026-09-10 (Updated after Blocker Closure)

---

## Scenario 1: 12/12 SICE Success

| Step | Expected | Actual | Verified |
|------|----------|--------|----------|
| All engines complete | results[].error undefined for all | ✓ | PASS |
| completionStatus | 'COMPLETE' | 'COMPLETE' | PASS |
| successfulEngineCount | 12 | 12 | PASS |
| failedEngineNames | [] | [] | PASS |
| Critical persistence awaited | persistOrchestrationResults awaited | ✓ | PASS |
| persistenceError | null | null | PASS |

## Scenario 2: 1 SICE Failure (e.g., Engine #4 crashes)

| Step | Expected | Actual | Verified |
|------|----------|--------|----------|
| Failed engine returns error | {result: null, error: msg} | ✓ | PASS |
| Synthesis skips failed engine | if (result.error) return | ✓ | PASS |
| completionStatus | 'DEGRADED' | 'DEGRADED' | PASS |
| successfulEngineCount | 11 | 11 | PASS |
| failedEngineNames | ['AIFeedbackLoop'] | ['AIFeedbackLoop'] | PASS |
| startAwakening propagates | Logs DEGRADED + adds to failedOps | ✓ | PASS |
| Twin creation | Fails with specific message | success:false + names | PASS |

## Scenario 3: DB Write Failure (essence persist)

| Step | Expected | Actual | Verified |
|------|----------|--------|----------|
| Supabase INSERT returns error | {error: PostgrestError} | ✓ | PASS |
| SICEBridge reports failure | success:false, error: msg | ✓ (FIXED) | PASS |
| orchestrator awaits persistence | await Promise.allSettled([...]) | ✓ (FIXED) | PASS |
| completionStatus overridden | COMPLETE → DEGRADED on persist fail | ✓ (FIXED) | PASS |
| persistenceError set | non-null string with details | ✓ (FIXED) | PASS |
| Caller knows persistence failed | orchestratorResult.persistenceError !== null | ✓ (FIXED) | PASS |

**Pre-fix:** Caller knew persistence failed → Partial / fire-and-forget design → WARN
**Post-fix:** Caller receives explicit persistenceError field, completionStatus = 'DEGRADED' → PASS

## Scenario 4: Unauthorized User Access

| Endpoint | Request | Response | Status Code | Verified |
|----------|---------|----------|-------------|----------|
| /api/profile GET | No auth header | {error: 'Unauthorized'} | 401 | PASS |
| /api/twin POST | No auth header | {error: 'Unauthorized'} | 401 | PASS |
| /api/twin-stream POST | No auth header | {error: 'Unauthorized'} | 401 | PASS |
| /api/nova POST | No auth header | {error: 'Unauthorized'} | 401 | PASS |
| /api/nova-stream POST | No auth header | {error: 'Unauthorized'} | 401 | PASS |
| /api/sice/get-patterns | Invalid JWT | verifyUser returns null → 401 | 401 | PASS |

## Scenario 5: User A Requests User B Data

| Scenario | Request | Response | Status Code | Verified |
|----------|---------|----------|-------------|----------|
| notifications list | userId=UserB | user.id !== requestedUserId → 403 | 403 | PASS |
| sice get-patterns | userId=UserB | user.id !== requestedUserId → 403 | 403 | PASS |
| twin-evolution | twinId of UserB's twin | .eq('user_id', user.id) filters | 200 only own data | PASS |
| profile GET | Any userId | .eq('user_id', user.id) | Returns only own | PASS |

## Scenario 6: Twin Streaming Without Valid Auth

| Request | Auth Header | Response | Verified |
|---------|-------------|----------|----------|
| /api/twin-stream | None | 401 Unauthorized | PASS |
| /api/twin-stream | Invalid JWT | 401 Unauthorized | PASS |
| /api/twin-stream | Expired JWT | getUser() fails → null → 401 | PASS |

## Scenario 7: Nova Streaming Without Valid Auth

Same pattern as Scenario 6.

| Request | Auth Header | Response | Verified |
|---------|-------------|----------|----------|
| /api/nova-stream | None | 401 Unauthorized | PASS |
| /api/nova-stream | Invalid JWT | 401 Unauthorized | PASS |

## Scenario 8: Memory Persistence Failure

| Step | Expected | Actual | Verified |
|------|----------|--------|----------|
| personal_memory INSERT fails | IntelligenceError thrown | MEMORY_PERSISTENCE_FAILED code | PASS |
| personal_context INSERT fails | IntelligenceError thrown | CONTEXT_PERSISTENCE_FAILED code | PASS |
| Birth memory insert fails in initializeTwin | Detected in criticalFailures array | Triggers compensatingRollback | PASS |
| UI shows appropriate state | Caller receives error with code | Explicit error propagation | PASS (FIXED) |

**Pre-fix:** Most callers don't check individual memory writes → WARN
**Post-fix:** Memory errors throw typed IntelligenceError with specific codes → callers MUST handle → PASS

## Scenario 9: Duplicate Awakening Request

| Step | Expected | Actual | Verified |
|------|----------|--------|----------|
| First awakening completes | essence status='used', Twin created | ✓ | PASS |
| Second attempt | checkReadyForAwakening finds existing twin | Returns false | PASS |
| Response | "Twin already exists" | ✓ | PASS |

## Scenario 10: Partial SICE Data

| Scenario | Expected | Actual | Verified |
|----------|----------|--------|----------|
| User has no memories | Engines return defaults/fallbacks | ✓ | PASS |
| User has no decisions | DecisionIntelligence returns getDefaultAnalysis() | ✓ | PASS |
| User has partial birth date | isValidBirthDate(false) → confidence capped | ✓ | PASS |
| Multiple engines fail | completionStatus='DEGRADED' or 'FAILED' | ✓ | PASS |
| Critical persistence fails after engine success | completionStatus='DEGRADED' + persistenceError | ✓ (FIXED) | PASS |

---

## BLOCKER-02 Specific: Partial Twin Creation Rollback

| Scenario | Pre-Fix Behavior | Post-Fix Behavior | Verified |
|----------|-----------------|-------------------|----------|
| Essential ops fail after Twin created | Twin orphaned, success:false returned | Twin deleted, essence marked 'failed', retry possible | PASS |
| Birth memory fails | Logged but Twin kept | compensatingRollback deletes Twin | PASS |
| world_preferences fails | Logged but Twin kept | compensatingRollback deletes Twin | PASS |
| twin_state fails | Logged but Twin kept | compensatingRollback deletes Twin | PASS |
| twin_personality fails | Logged but Twin kept | compensatingRollback deletes Twin | PASS |
| twin_capabilities fails | Logged but Twin kept | compensatingRollback deletes Twin | PASS |

---

## Summary

| Scenario | Expected Behavior | Actual Result | Status |
|----------|------------------|---------------|--------|
| 1. 12/12 SICE success | COMPLETE | COMPLETE | PASS |
| 2. 1 SICE failure | DEGRADED + explicit list | DEGRADED + failedEngineNames | PASS |
| 3. DB write failure | Explicit failure/degraded | DEGRADED + persistenceError | PASS ✓ |
| 4. Unauthorized user | 401, no data leakage | 401 on all protected endpoints | PASS |
| 5. User A → User B data | 403 / no data | 403 on ownership mismatch | PASS |
| 6. Twin stream no auth | 401 | 401 on new endpoint | PASS |
| 7. Nova stream no auth | 401 | 401 on new endpoint | PASS |
| 8. Memory persistence failure | Explicit degraded state | Typed IntelligenceError propagated | PASS ✓ |
| 9. Duplicate awakening | Idempotent, no duplicate Twin | checkReadyForAwakening blocks | PASS |
| 10. Partial SICE data | Explicit incomplete state | DEGRADED with counts | PASS |

### BLOCKER-02: Partial Twin Creation

| Aspect | Status |
|--------|--------|
| Compensating rollback implemented | PASS |
| Orphaned Twins cleaned up automatically | PASS |
| Essence preserved for retry | PASS |
| Birth memory now a critical operation | PASS |

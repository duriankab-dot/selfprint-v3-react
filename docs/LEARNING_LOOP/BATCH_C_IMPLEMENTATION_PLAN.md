# Batch C Implementation Plan — Personal Intelligence Learning Loop

**Date:** 2 October 2026  
**Prerequisite:** BATCH_C_REVIEW.md approved (status: READY FOR BATCH C IMPLEMENTATION APPROVAL)  
**Design Principle:** Smallest set of changes that closes verified gaps. No new services. No new UI. No migrations unless absolutely necessary.

---

## TASK LAYERS

| Layer | Purpose | Constraint |
|-------|---------|------------|
| **C0** | Correctness blockers / dead code removal | Must complete before anything else |
| **C1** | Minimum changes required to close remaining functional gaps | Required for production readiness |
| **C2** | Optional improvements only if directly necessary | Nice-to-have, deferable |

---

## C0: CORRECTNESS BLOCKERS

### C0.1: Remove dead NOT_FOUND catch branch in upsertPattern

| Item | Detail |
|------|--------|
| **Verified gap** | `src/lib/intelligence/PatternDetector.ts` lines 387-397 — catch block handling NOT_FOUND code can never trigger because getPattern() uses `.limit(1)` which returns null for empty results, not NOT_FOUND. Only updatePattern() throws NOT_FOUND internally. |
| **User impact** | Zero — dead code cannot execute |
| **Files affected** | `src/lib/intelligence/PatternDetector.ts` (-8 lines) |
| **Minimal change** | Remove the `catch (error)` block at lines 387-397. Keep the try-catch for non-IntelligenceError exceptions (re-thrown as UPSERT_PATTERN_FAILED). Restructure to single try with existence check → delegate, removing unnecessary error type dispatching. |
| **Data risks** | None |
| **Tests required** | TypeScript compiles. Existing tests unchanged. |
| **Acceptance criteria** | upsertPattern has exactly two code paths (exists → updatePattern, not-exists → createPatternRecord) with no unreachable branches |
| **Dependencies** | None |
| **Out of scope** | Refactoring other PatternDetector methods |

---

## C1: MINIMUM CHANGES TO CLOSE REMAINING GAPS

### C1.1: Write twin_recommendation_quality during recordDecision()

| Item | Detail |
|------|--------|
| **Verified gap** | GAP-05 from Batch B verification. Schema migration 041 adds the column. Types/DB mappings correct. But zero code writes to it. Column will stay NULL forever without a writer. |
| **Product impact** | Enables measurement of Twin recommendation quality independent of decision outcome quality. Users and dashboards can assess whether Twin gives good advice regardless of whether user chose well. |
| **Files affected** | `src/services/DecisionService.ts` (+5 lines in recordDecision function), potentially `src/lib/intelligence/DecisionIntelligenceEngine.ts` (read-only access) |
| **Minimal change** | In `recordDecision()` after inserting into DB (line ~89-91), calculate twinRecommendationQuality using heuristic scoring: If Twin recommendation content length > 50 chars → score += 0.3. If decision question includes options → score += 0.2. If context provided → score += 0.1. Base score = 0.2. Result clamped to [0, 1]. This heuristic requires NO additional DB queries and produces reasonable scores for existing data. |
| **Data risks** | None — column is nullable, additive, CHECK constraint already enforced by migration 041 |
| **Backward compatibility** | Fully backward compatible. New column defaults to NULL for pre-migration rows. Writers populate it for post-deploy decisions. |
| **Tests required** | 1. Verify recordDecision with various inputs produces scores in [0, 1] range. 2. Verify short recommendation → lower score. 3. Verify options + context → higher score. |
| **Acceptance criteria** | Every new decision_log row written by recordDecision() includes a non-NULL twin_recommendation_quality value. Pre-existing rows retain NULL. Query via getUserDecisions() returns the populated field. |
| **Dependencies** | Migration 041 must be deployed first (already exists in working tree) |
| **Out of scope** | AI-based quality assessment. Manual rating UI. Historical data population. Integration with dashboard display. |

### C1.2: Clarify signal semantics in DecisionLearningService

| Item | Detail |
|------|--------|
| **Verified gap** | Signal formula `(positiveCount - negativeCount) / total` measures "outcome positivity ratio" but is used as "evidence strength for pattern existence." Conceptually imprecise. Positive career outcomes don't prove the "resilience" pattern more strongly. |
| **Product impact** | Minor conceptual drift. Weighted average protection (GAP-04 fix) bounds the practical impact, but understanding WHY confidence changed would improve debugging and user trust. |
| **Files affected** | `src/services/DecisionLearningService.ts` comment block above `updatePatternsFromOutcome` (~10 lines of docstring) |
| **Minimal change** | Add inline documentation clarifying the signal interpretation: "Signal represents the NET DECISION OUTCOME RATIO for this world. It serves as a weak directional indicator, not strong evidence for any specific pattern. The weighted average formula ensures historical confidence dominates over single-season signals." Also rename local variable `adjustmentReason` to include more descriptive label (e.g., `{ positive: 'net_positive_outcomes', negative: 'net_negative_outcomes' }`) instead of single string. |
| **Data risks** | None — documentation-only change |
| **Tests required** | N/A |
| **Acceptance criteria** | Comments accurately describe what signal means and do not claim it proves pattern existence |
| **Dependencies** | None |
| **Out of scope** | Rewriting signal formula. Adding per-pattern outcome tracking. Changing the mathematical relationship. |

### C1.3: Document AIFeedbackLoop vs DecisionLearningService coordination

| Item | Detail |
|------|--------|
| **Verified gap** | Both AIFeedbackLoop.updatePatternConfidence() and DecisionLearningService.updatePatternsFromOutcome() write to the same table (behavioral_patterns.confidence). They use different adjustment magnitudes (+/-0.15 vs +/-0.01 capped) and different triggers (user insight ratings vs decision outcomes). If both fire within seconds, their adjustments compound. |
| **Product impact** | Low severity. The weighted average (alpha=0.1) dampens rapid oscillations. In practice, AIFeedbackLoop fires during insight analysis (synchronous with chat) and DecisionLearningService fires asynchronously after outcome recording (typically hours/days later). Temporal separation makes collision unlikely. |
| **Files affected** | `src/lib/intelligence/AIFeedbackLoop.ts` (docstring addition), `src/services/DecisionLearningService.ts` (caller context) |
| **Minimal change** | Add a shared docblock at top of both functions documenting that they independently modify the same `behavioral_patterns.confidence` column using separate learning signals. Note that the weighted average formula provides natural damping when both fire in close succession. Recommend monitoring if dual firing becomes observable in production logs. |
| **Data risks** | None — documentation-only change |
| **Tests required** | N/A |
| **Acceptance criteria** | Code comments clearly state the shared-modification contract and damping behavior |
| **Dependencies** | None |
| **Out of scope** | Implementing mutual exclusion. Adding a coordination service. Merging the two learning pathways into one. |

---

## C2: OPTIONAL IMPROVEMENTS

### C2.1: Add world_id index to behavioral_patterns for cross-world scoping

| Item | Detail |
|------|--------|
| **Verified gap** | behavioral_patterns has NO world_id column. All patterns are global per user. World-specific filtering happens at query time (in-memory name matching in DecisionLearningService). As pattern count grows, name matching becomes less reliable. |
| **Product impact** | Medium long-term risk. Current design works for small pattern counts (<50). For users with extensive history, world-specific relevance detection degrades without proper indexing. |
| **Files affected** | `supabase/migrations/` (new migration), `behavioral_patterns` table definition |
| **Minimal change** | Add `world_context TEXT[]` column (array of world slugs the pattern relates to). Populate during SICEBridge pattern creation/update from the world parameter in the bridge call. Add GiST index for array containment queries. |
| **Data risks** | Requires migration (ADD COLUMN). Existing rows get NULL array → matched only by name heuristic. Safe to add. |
| **Backward compatibility** | Fully backward compatible. NULL arrays fall back to name matching (existing behavior). New rows get populated arrays. |
| **Tests required** | DB migration idempotent. Index creation fast on small dataset. Name matching still works for NULL arrays. |
| **Acceptance criteria** | Patterns created in `career` world get `'career'` in `world_context`. Queries filter by `world_context @> ARRAY['career']`. Backward-compatible name matching still finds patterns with NULL arrays. |
| **Dependencies** | Requires migration approval (out of Batch C coding scope per stop conditions) |
| **Out of scope** | Migrating all existing patterns. Replacing name matching entirely with array containment. |

### C2.2: Expose learning audit log for debug observability

| Item | Detail |
|------|--------|
| **Verified gap** | Console logging in DEV mode shows what changed, but production monitoring has no visibility into the learning loop. When a pattern confidence seems wrong, there's no way to trace WHY it changed. |
| **Product impact** | Debugging difficulty. Production incidents involving incorrect confidence values require manual DB inspection. |
| **Files affected** | Potentially a new `learning_audit_log` table (migration) OR simple event aggregation |
| **Minimal change** | Not pursued in C2 — consider Phase D. |
| **Data risks** | Requires schema change |
| **Out of scope** | All of C2 |

---

## DEPENDENCY ORDER

```
C0.1 (dead code removal) → C1.2 (signal docs) → C1.3 (coordination docs)
                                              ↓
                                           C1.1 (recommendation quality writer)
                                                       ↓
                                                 C2.1 (cross-world scoping)
```

C0.1 and C1.2 are independent (different files). C1.1 depends on migration 041 being deployed. C2.1 depends on migration approval.

---

## FILES CHANGED — DOCUMENTATION ONLY

During this review phase, only these files were created/modified:

| File | Action | Lines |
|------|--------|-------|
| `docs/LEARNING_LOOP/BATCH_C_REVIEW.md` | NEW | Comprehensive gap-by-gap verification report |
| `docs/LEARNING_LOOP/BATCH_C_IMPLEMENTATION_PLAN.md` | NEW | This file — task breakdown with dependencies |

No source code files modified. No migrations added. No deployments performed.

---

## FINAL STATUS

This review confirms:

1. ✅ All four Batch B remediated gaps are independently verified as correctly fixed
2. ✅ End-to-end learning loop is genuinely closed (verified through code path tracing, not just assertions)
3. ✅ Remaining gaps documented with appropriate severity classifications
4. ✅ Batch C plan limited to smallest necessary changes (1 critical + 2 minor + 2 optional)
5. ✅ No new services, UI, or migrations proposed for C1 layer
6. ✅ Acceptance test definition provided for E2E validation

**READY FOR BATCH C IMPLEMENTATION APPROVAL**

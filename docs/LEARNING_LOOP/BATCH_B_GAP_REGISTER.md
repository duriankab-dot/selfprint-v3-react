# Batch B Gap Register — Personal Intelligence Learning Loop

**Date:** 2 October 2026 (updated by Batch C implementation)  
**Purpose:** Track all identified gaps from Batch B verification with severity, evidence, and corrective actions  
**Status:** REMEDIATED + IMPLEMENTED (C1.1 BLOCKED per user directive)

---

## GAP STATUS SUMMARY

| Gap | Severity | Remediation Status | Implementation Status | Resolution Date |
|-----|----------|-------------------|----------------------|-----------------|
| GAP-01: New pattern discard | CRITICAL | ✅ FIXED | ✅ VERIFIED via C0.1 race-condition documentation | 2026-10-02 |
| GAP-02: No outcome-pattern correlation | HIGH | ✅ FIXED | N/A (fixed in remediation) | 2026-10-02 |
| GAP-03: Random mixed outcome | MEDIUM | ✅ FIXED (absorbed into GAP-02) | N/A (fixed in remediation) | 2026-10-02 |
| GAP-04: Confidence drift | MEDIUM | ✅ FIXED | N/A (fixed in remediation) | 2026-10-02 |
| GAP-05: Quality column empty / C1.1 writer | LOW/CRITICAL* | ⏸️ BLOCKED | Blocked — no valid evidence source | 2026-10-02 |
| GAP-06: Stale context after outcome | CRITICAL | ✅ FIXED | N/A (fixed in remediation) | 2026-10-02 |

*C1.1 was reclassified from LOW to CRITICAL because blocking recommendation quality measurement prevents the learning loop from having a true "recommendation → outcome" quality distinction. However, it is NOT a blocker for Batch C review authorization — only for production readiness.

---

## RESOLVED GAPS (Detailed)

### GAP-01: FIXED ✅ (Updated by C0.1)

| Field | Value |
|-------|-------|
| **Severity** | CRITICAL |
| **Resolution** | Added public `upsertPattern()` method to PatternDetector. SICEBridge calls upsertPattern instead of updatePattern for new patterns. |
| **C0.1 Update** | Race-condition NOT_FOUND catch block verified as DEFENSIVE (not dead code). Documented concurrent deletion scenario. Behavior unchanged. |
| **Files** | `src/lib/intelligence/PatternDetector.ts` (+upsertPattern method), `src/services/sice/SICEBridge.ts` (line 93 call site) |

### GAP-02: FIXED ✅

| Field | Value |
|-------|-------|
| **Severity** | HIGH |
| **Resolution** | Rewrote `updatePatternsFromOutcome()` with metadata/name relevance filtering. Removed Math.random(). Fully deterministic. |
| **Files** | `src/services/DecisionLearningService.ts` (lines 252–382) |

### GAP-04: FIXED ✅

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **Resolution** | Changed additive adjustment to weighted average (alpha=0.1) with ±0.01 per-call cap. Natural convergence mechanism. |
| **Files** | `src/services/DecisionLearningService.ts` (same function) |

### GAP-06: FIXED ✅

| Field | Value |
|-------|-------|
| **Severity** | CRITICAL |
| **Resolution** | Two-layer mechanism: (A) cache invalidation in recordOutcome(), (B) lazy behavioral_patterns query in ImmersiveTwinChat. Shared QueryClient singleton ensures same cache access. |
| **Files** | `src/services/DecisionService.ts`, `src/pages/ImmersiveTwinChat.tsx`, `src/main.tsx`, `src/lib/react-query.ts`, `src/lib/query-client.ts` |

---

## BLOCKED GAPS (C1.1)

### GAP-05 / C1.1: Recommendation Quality Writer — BLOCKED ⏸️

| Field | Value |
|-------|-------|
| **Severity** | LOW (per original assessment) / CRITICAL (for full semantic separation) |
| **Status** | BLOCKED — no valid evidence source at recordDecision time |
| **Reason** | At decision recording time, Twin's recommendation text exists but there is NO independent way to assess its quality without comparing against best-practice frameworks or collecting post-outcome feedback. Any heuristic based on content length, context presence, or option count would measure input completeness, not recommendation quality. |
| **What is preserved** | Schema (migration 041), TypeScript types, DB mappers — all intact. Column remains NULL until valid writer deployed. |
| **Proposed solution for Batch D** | Add post-outcome feedback field (`decision_outcomes.twin_advice_quality`) asking users to rate advice helpfulness. Map to 0–1 score. Store on linked decision_log row. Measures ADVICE QUALITY, NOT outcome quality. |
| **Blocker for what?** | Does NOT block Batch C Review Authorization (already granted). Blocks complete semantic separation claim for production. |

---

## COORDINATION CONTRACT (New — C1.3)

See `docs/LEARNING_LOOP/LEARNING_SIGNAL_OWNERSHIP.md` for full contract between AIFeedbackLoop and DecisionLearningService. Key points:

| Aspect | AIFeedbackLoop | DecisionLearningService |
|--------|---------------|------------------------|
| Scope | ALL patterns (global) | Relevant patterns only (filtered) |
| Adjustment | ±0.1/+0.15 raw | ±0.01 capped + alpha-blended |
| Timing | Minutes (immediate) | Hours/days/months (delayed) |
| Signal | Insight validation | Outcome results |

Both pathways write to `behavioral_patterns.confidence`. Weighted average damping (alpha=0.1) prevents harmful oscillation when both fire within similar windows.

---

## END-TO-END LOOP STATUS

```
A. Twin provides recommendation ✅
B. User makes/rejects decision ✅
C. Outcome recorded ✅ (invalidates cache — GAP-06)
D. Outcome linked to decision ✅
E. Pattern updated ✅ (only relevant, bounded, deterministic — GAP-02+GAP-04)
F. Memory retrieval ✅
G. Twin receives updated context ✅ (lazy query + cache invalidation — GAP-06)
H. Next recommendation uses updated info ✅
```

**LEARNING LOOP CLOSED.**

Missing piece: twin_recommendation_quality remains NULL until Batch D implements post-outcome advice quality feedback. This does NOT break the learning loop closure but prevents claiming full semantic separation between recommendation quality and outcome quality.

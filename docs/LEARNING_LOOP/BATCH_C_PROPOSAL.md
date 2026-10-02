# Batch C Proposal — Personal Intelligence Learning Loop Closure

**Date:** 2 October 2026  
**Prerequisite:** All CRITICAL/HIGH gaps from BATCH_B_GAP_REGISTER.md must be resolved first  
**Scope Principle:** Minimum viable closure — only connect existing components, no new services, no new UI, no new migrations unless absolutely necessary

---

## PRE-REQUISITE: GAP RESOLUTION (Before Batch C Implementation)

| Gap | Required Action | Estimated Effort |
|-----|----------------|-----------------|
| **GAP-01** (Critical) | Fix SICEBridge else-branch: use INSERT or lib's upsert instead of updatePattern for new patterns | 30 min |
| **GAP-02** (High) | Add world/topic correlation: filter behavioral_patterns by matching decision category before adjusting confidence | 2 hrs |
| **GAP-03** (Medium) | Replace `Math.random()` with deterministic value (0 or small fixed decay) in mixed-outcome case | 10 min |
| **GAP-04** (Medium) | Change additive adjustment to weighted average to prevent runaway confidence drift | 1 hr |
| **GAP-05** (Low) | Write twin_recommendation_quality during recordDecision() using DecisionIntelligenceEngine assessment | 1-2 hrs |
| **GAP-06** (Critical) | Invalidate or refresh personal context cache after outcome recording | 2-3 hrs |

**Total prerequisite effort: ~5.5 hours**

---

## BATCH C TASKS

### C1. Context Cache Invalidator After Outcome

| Field | Value |
|-------|-------|
| **Existing component** | `src/hooks/usePersonalContext.ts` — `useInvalidatePersonalContext()` already exists but unused |
| **Problem** | Updated behavioral_patterns don't reach TwinChat because analysis page cache is stale |
| **Proposed change** | In `DecisionService.recordOutcome()` line 218, after async `updateTwinExpertiseFromDecisions` fires, also fire a cache invalidation. Since this runs in non-React context (async from Promise.then), use QueryClient directly: import queryClient from React Query config, call `queryClient.invalidateQueries({ queryKey: ['personalContext', userId, 'canonical', '*'] })` |
| **New files** | None |
| **Database changes** | None |
| **Dependencies** | Depends on GAP-01 and GAP-02 being resolved (so the updated patterns are actually correct before they're cached) |
| **Regression risks** | Unnecessary refetches if invalidation fires too often. Mitigation: invalidate only after successful outcome recording |
| **Tests** | Unit test: after recordOutcome(), verify next usePersonalContextLib fetch returns fresh data including newly-updated pattern confidence |
| **Rollback** | Remove the two lines added to DecisionService.recordOutcome() |
| **Acceptance** | Record outcome → wait 1 second → check that next ImmersiveTwinChat message reflects updated pattern confidence |

### C2. Lazy Pattern Evaluation in TwinChat Context

| Field | Value |
|-------|-------|
| **Existing component** | `ImmersiveTwinChat.tsx:293-334` (twinContext builder), `usePersonalContext.ts` |
| **Problem** | Even with cache invalidation, there's a window where stale context persists. More fundamentally, the twinContext builder only reads from React state/cache, not live DB |
| **Proposed change** | In twinContext builder, add a direct query for recent behavioral_patterns alongside the cached context. Use `useQuery` with specific key `['patterns', userId, currentWorld]` with `staleTime: 0` (always fresh). Include top 1-2 patterns directly in the twinContext output alongside cached context |
| **New files** | None |
| **Database changes** | None |
| **Dependencies** | None |
| **Regression risks** | Extra query per render. Mitigation: only query when `currentAnalysis` is null OR when `currentAnalysis.lastUpdated > 5 minutes ago` |
| **Tests** | Verify twinContext includes at least one behavioral pattern even when AnalysisPage has not been visited |
| **Rollback** | Remove the direct patterns query from twinContext builder |
| **Acceptance** | Twin receives relevant pattern info in chat even without visiting AnalysisPage first |

### C3. Recommendation Quality Writer

| Field | Value |
|-------|-------|
| **Existing component** | `src/services/DecisionService.ts:recordDecision()`, `src/lib/intelligence/DecisionIntelligenceEngine.ts` |
| **Problem** | `twin_recommendation_quality` column exists but is never populated (GAP-05) |
| **Proposed change** | In `DecisionService.recordDecision()`, before inserting into DB, calculate recommendation quality score from existing DecisionIntelligenceEngine outputs (or heuristic based on confidence of available signals). Insert as `twin_recommendation_quality` in the DB insert. Score range 0-1 |
| **Heuristic scoring** (minimum viable): If DecisionIntelligenceEngine was called during this interaction, use its confidence scores. Otherwise: base score from available context (decision style confidence * 0.5 + world expertise confidence * 0.5). Map to 0-1 range |
| **New files** | None |
| **Database changes** | None (column already created in migration 041) |
| **Dependencies** | None |
| **Regression risks** | None — new optional field |
| **Tests** | Verify recordDecision with various inputs produces reasonable quality scores (0.3-0.9 range for normal cases) |
| **Rollback** | Remove the quality calculation line from recordDecision insert payload |
| **Acceptance** | New decision_log rows have non-NULL twin_recommendation_quality values |

---

## EXPLICITLY OUT OF SCOPE FOR BATCH C

The following were mentioned in the original plan but are NOT included here:

| Item | Reason |
|------|--------|
| New UI/dashboard | Constraint violation — "Do NOT add new user-facing features" |
| Historical Replay | Requires version history infrastructure (out of scope for minimum viable) |
| Cross-world synthesizer | Patterns already global; selective filtering via related_goals can come later |
| MemoryRetriever service | loadRecentMemories enhanced; new service would be over-engineering |
| LearningEngine standalone | The learning loop is closed by C1+C2+C3 integration, not a new engine |
| P0-P3 maturity column | Low priority, can be added via separate migration later |
| BehavioralForecastEngine expansion | Out of scope for minimum viable closure |

---

## RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Cache invalidation breaks React Query stability | Medium | Medium | Use gentle invalidation (invalidate specific keys, not wildcard purge) |
| Lazy pattern query adds render latency | Low | Low | Conditional fetching (only when cache is stale) |
| Heuristic quality score inaccurate | High | Low | Document as approximation; refine in future batch once real feedback data exists |
| Pre-requisite gap fixes reveal more issues | Medium | Medium | Each gap fix isolated; review before proceeding |

---

## TOTAL ESTIMATED EFFORT

| Category | Hours |
|----------|-------|
| Prerequisites (GAP resolution) | 5.5 |
| C1. Context cache invalidator | 2 |
| C2. Lazy pattern evaluation | 2 |
| C3. Recommendation quality writer | 1.5 |
| Testing & verification | 2 |
| **TOTAL** | **~13 hours** |

This is significantly less than the original Week 3 estimate because we reuse all existing components and only make surgical integration changes.

---

## FINAL GATE STATUS

This proposal awaits explicit authorization after:
1. All CRITICAL/HIGH gaps from GAP REGISTER are resolved
2. The 6 documentation deliverables are reviewed and accepted
3. A clear green light to proceed with implementation

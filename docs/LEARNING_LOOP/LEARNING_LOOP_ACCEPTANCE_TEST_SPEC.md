# Learning Loop Acceptance Test Specification

**Date:** 2 October 2026  
**Type:** Specification only. Tests not implemented.  
**Purpose:** Define acceptance test scenarios for the complete learning loop path (A through J) plus C1.1 verification and future feedback linkage.

---

## Architecture Reference

### Data Tables Involved

| Table | Role | Key Columns |
|-------|------|-------------|
| `decision_log` | Records Twin recommendations and user choices | `id`, `twin_id`, `world`, `question`, `options`, `twin_recommendation`, `user_choice`, `context`, `twin_recommendation_quality` |
| `decision_outcomes` | Links outcomes to decisions | `id`, `decision_id` (FK), `follow_up_day`, `feedback`, `impact`, `lessons`, `twin_confidence`, `recorded_at` |
| `follow_up_schedule` | Tracks follow-up checkpoints | `id`, `decision_id` (FK), `day30_due`, `day90_due`, `day180_due`, `day365_due`, `_completed` flags |
| `behavioral_patterns` | User behavioral pattern inventory | `id`, `user_id`, `pattern_name`, `confidence`, `related_values[]`, `related_goals[]`, `updated_at` |
| `insight_feedback` | AIFeedbackLoop validation signals | `id`, `user_id`, `insight_id`, `feedback_type`, `comment`, `created_at` |

### Service Flow

```
ImmersiveTwinChat.handleSaveDecision()
  → DecisionService.recordDecision(twinId, world, question, options, twinRecommendation, userChoice, context?)
    → INSERT decision_log + scheduleFollowUps()
    → Returns Decision (with twinRecommendationQuality: undefined/null)
    
User later records outcome at follow-up checkpoint:
ImmersiveTwinChat.handleRecordOutcome(decisionId, impact, feedback, lessons)
  → DecisionService.recordOutcome(decisionId, feedback, impact, lessons)
    → INSERT decision_outcomes
    → Mark follow_up_schedule._completed = true
    → Fetch decision's twin_id + world from decision_log
    → Async: DecisionLearningService.updateTwinExpertiseFromDecisions(twin_id, world)
      → updatePatternsFromOutcome(twin_id, world)
        → Count positive/negative outcomes in world
        → Filter behavioral_patterns by metadata/name relevance
        → Weighted average + capped adjustment per pattern
    → queryClient.invalidateQueries(predicator: personalContext + twin_id)
    
On next render / API call:
ImmersiveTwinChat._freshPatterns query (staleTime: 0)
  → Fetches behavioral_patterns for user + worldKeyword
  → Passed into twinContext via useMemo(dependency: _freshPatterns)
  → Top pattern selected if confidence > 0.4
  → Injected into buildPrompt → buildTwinSystemPrompt
  → Sent as system prompt to AI API → next response reflects updated intelligence
```

### Query Client Keys

| Format | Example | Purpose |
|--------|---------|---------|
| Legacy | `['personalContext', userId]` | Base personal context query |
| Canonical | `['personalContext', userId, 'canonical', world]` | World-specific canonical context |

Invalidation predicate matches both formats: `key[0] === 'personalContext' && key[1] === twin_id`.

---

## Test Scenarios

### Scenario 1 — Existing Pattern Update (Relevant by Metadata)

#### Fixture
- `user_id`: `"test-user-001"`
- `world`: `"career_development"`
- `twin_id`: `"twin-001"`
- `behavioral_patterns` row: `{ id: "pat-001", user_id: "test-user-001", pattern_name: "Career Resilience", related_values: ["achievement"], related_goals: ["professional_growth"], confidence: 0.6 }`
- `decision_log` row: `{ id: "dec-001", twin_id: "twin-001", world: "career_development", ... }`
- `decision_outcomes`: one record for dec-001 with `impact: "positive"`

#### Preconditions
- One existing behavioral pattern matching world keyword AND explicit metadata correlation
- One decision in career_development with positive outcome
- Cache has existing patterns query result (`['personalContext', 'twin-001']`)

#### Action
Call `DecisionService.recordOutcome("dec-001", "It went well", "positive", "I learned to persist")`

#### Expected DB State
- `decision_outcomes` table has new row: `{ decision_id: "dec-001", feedback: "It went well", impact: "positive", lessons: "I learned to persist", ... }`
- `follow_up_schedule` row for dec-001 has appropriate `_completed` flag set to `true`
- `behavioral_patterns.pat-001.confidence` increases by at most 0.01 (capped) using weighted average formula: `(0.9 × 0.6) + (0.1 × signal)` where signal is outcome ratio
- No other behavioral_pattern rows are modified

#### Expected Cache State
- Queries with `queryKey[0] === 'personalContext' && queryKey[1] === 'twin-001'` are invalidated (marked stale, not removed)

#### Expected Twin Context
- On next ImmersiveTwinChat render, `_freshPatterns` query re-fetches DB (staleTime: 0)
- Updated pattern `Career Resilience` appears with incremented confidence in `candidatePatterns`
- If confidence > 0.4, it becomes `topPattern`

#### Expected Response Behavior
- Next `streamTwinResponse` or `callTwinAPI` includes `[KEY PATTERN] [Behavioral] Career Resilience: <insight>` in system prompt
- AI response references improved confidence level

#### Cleanup
Delete all test fixtures from all four tables.

---

### Scenario 2 — New Pattern Creation (GAP-01 Remediation Verified)

#### Fixture
- `userId`: `"test-user-002"`
- `patternName`: `"Novel Trait"` (does NOT exist in `behavioral_patterns`)
- `evidencePoints`: `[{ source: "explicit_statement", excerpt: "I have never tried this before" }]`

#### Preconditions
- `behavioral_patterns` table empty for this user
- No existing pattern named "Novel Trait"
- SICEBridge calls `upsertPattern(userId, "Novel Trait", evidencePoints)` during insight generation

#### Action
SICEBridge.bridgePatternResults receives SICE detection for a brand-new pattern name

#### Expected DB State
- `getPattern()` returns null (not found)
- Creates analysis via `analyzePatternGroup("Novel Trait", evidencePoints)`
- Inserts new row into `behavioral_patterns`: `{ user_id: "test-user-002", pattern_name: "Novel Trait", confidence: computed_value, ... }`
- No duplicate created even if bridge runs again within same session

#### Expected Cache State
- Not applicable — SICEBridge operates outside React Query cache. Personal context refetch would pick up new pattern on next query.

#### Expected Twin Context
- Next personal context fetch includes the newly created pattern

#### Expected Response Behavior
- AI recognizes the new pattern after first successful persistence

#### Cleanup
Delete the inserted behavioral_pattern row.

---

### Scenario 3 — Irrelevant Pattern Remains Unchanged

#### Fixture
- `user_id`: `"test-user-003"`
- `world`: `"health_wellness"`
- `behavioral_patterns` rows:
  - `{ pattern_name: "Career Ambition", confidence: 0.8, related_values: ["achievement"] }` (no relation to health)
  - `{ pattern_name: "Social Confidence", confidence: 0.6, related_values: ["community"], related_goals: ["relationships"] }` (no relation to health)
  - `{ pattern_name: "Health Consciousness", confidence: 0.5, related_values: ["wellness"], related_goals: ["fitness"] }` (RELEVANT — metadata match)

#### Preconditions
- Three patterns: two irrelevant, one relevant
- Outcome recorded in `health_wellness` world with `impact: "negative"`

#### Action
`DecisionService.recordOutcome()` triggers `updatePatternsFromOutcome()`

#### Expected DB State
- Only `Health Consciousness` pattern is queried for adjustment
- `Career Ambition` and `Social Confidence` appear in `relevanceSkipped[]` list (logged in DEV mode)
- Only `Health Consciousness.confidence` changes; the other two remain exactly at their pre-call values

#### Expected Console Log (DEV)
```
[DecisionLearning] No relevant patterns found for world=health_wellness (...)
```
or
```
[DecisionLearning] Updated 1/1 patterns for health_wellness (negative): +0/-N
```

#### Expected Cache State
- Relevant query keys invalidated as usual

#### Expected Twin Context
- System prompt does NOT include Career Ambition or Social Confidence adjustments

#### Expected Response Behavior
- AI reflects only Health Consciousness change (reduced by ≤0.01 due to negative signal)

#### Cleanup
Remove all test behavioral_patterns rows.

---

### Scenario 4 — Repeated Outcome (Determinism Verification)

#### Fixture
- `world`: `"career_development"`
- Same `positiveCount` / `negativeCount` ratio across two consecutive calls

#### Preconditions
- 5 positive outcomes, 1 negative outcome in `career_development` (signal ≈ 0.67)
- Behavioral pattern with `confidence: 0.5`

#### Action
Call `recordOutcome()` twice back-to-back with identical outcome data

#### Expected DB State
- After first call: confidence moves from 0.5 toward signal (≈0.5 + 0.1 × (newConfidence − 0.5), capped at ±0.01)
- After second call: same computation from new confidence level. Since signal is deterministic (5/6 ratio = 0.833), the **delta** from each call is identical IF the underlying count doesn't change between calls.
- Total delta after 2 calls ≤ 0.02 (max 2 × cap)

#### Expected Consistency
- Running the same aggregation twice produces the same `signal` value
- No Math.random anywhere in `updatePatternsFromOutcome()` — fully deterministic given same input counts

#### Expected Cache State
- Both calls trigger separate invalidations. Second invalidation supersedes first (same predicate).

#### Cleanup
Restore original confidence value.

---

### Scenario 5 — Duplicate Event Idempotency

#### Fixture
- Same `decision_id`, same `impact`, submitted twice concurrently

#### Preconditions
- `decision_outcomes` has NO existing row for `decision_id`

#### Action
Call `recordOutcome(decisionId, ...)`:
1. Thread A inserts row
2. Thread B simultaneously inserts same row

#### Expected DB State
- Either: database UNIQUE constraint on `(decision_id, follow_up_day)` prevents duplicate insert
- Or: Supabase query silently allows duplicate rows (current schema may not enforce uniqueness)
- In either case, `updatePatternsFromOutcome()` should be resilient: it counts all outcomes for the decision regardless of duplicates

#### Expected Behavior
- If unique constraint fires: Thread B error is caught and logged, Thread A proceeds normally
- If no constraint: Both rows inserted. Outcome counting reads both → double-counting. This is a known limitation — not addressed in Batch D planning

#### Cleanup
N/A — depends on whether duplicate occurred.

---

### Scenario 6 — NOT_FOUND Race-Condition Fallback (C0.1 Verified)

#### Fixture
- `userId`: `"test-user-004"`
- `patternName`: "Exists But Deleted"
- Pre-existing pattern in `behavioral_patterns` table

#### Preconditions
- Between `getPattern()` returning the pattern (exists) and `updatePattern()` executing its internal lookup, another process deletes the pattern
- The deleted pattern was detected within last 7 days

#### Action
SICEBridge.bridgePatternResults calls `upsertPattern(userId, patternName, evidencePoints)`

#### Expected DB State
- First `getPattern()` inside `upsertPattern()` finds the pattern (race window not yet closed)
- `updatePattern()` internally calls its own `getPattern()` which returns null (concurrent delete completed)
- `IntelligenceError.code === 'NOT_FOUND'` thrown
- Catch block intercepts ONLY this specific code (wildcard errors propagate)
- Execution falls through to the same path as initial NOT_FOUND: `analyzePatternGroup()` → `createPatternRecord()`
- New row inserted with same `pattern_name` (dedup protection via name-based uniqueness or application logic)

#### Expected Console Log
- No visible error. Silent recovery.

#### Expected Anti-Crash Properties
- Other errors (database connection failure, constraint violation, etc.) are NOT caught by this block
- Those errors throw UPSTREAM with wrapping `UPSERT_PATTERN_FAILED` error

#### Cleanup
Verify only one pattern row exists with current data.

---

### Scenario 7 — Non-NOT_FOUND Error Propagation

#### Fixture
- `patternName`: "Test Pattern"
- Database connection unavailable (simulated by stopping Supabase client)

#### Preconditions
- Supabase connection fails with error code `PGRST_ERR` or generic network error

#### Action
Call `upsertPattern(userId, "Test Pattern", [...])`

#### Expected DB State
- No row inserted
- No partial state left behind

#### Expected Exception
- NOT_FOUND catch block does NOT execute (error code is not `'NOT_FOUND'`)
- Error propagates to caller with wrapping message containing `UPSERT_PATTERN_FAILED`
- Caller (SICEBridge) catches upstream and continues processing other patterns

#### Cleanup
N/A — error aborts the operation entirely.

---

### Scenario 8 — Cache Invalidation (GAP-06 Remediation Verified)

#### Fixture
- `twin_id`: `"twin-005"`
- Two cached queries in React Query:
  - `['personalContext', 'twin-005']` (legacy format)
  - `['personalContext', 'twin-005', 'canonical', 'career_development']` (canonical format)
- Both contain old behavioral_patterns data

#### Preconditions
- Both queries were fetched previously and have data in cache
- Neither has expired TTL (data is fresh from cache perspective)

#### Action
`DecisionService.recordOutcome()` executes cache invalidation:
```typescript
queryClient.invalidateQueries({
  predicate: (q) => {
    const key = q.queryKey as unknown[];
    return (key[0] === 'personalContext' || 
            Array.isArray(key[0]) && key[0][0] === 'personalContext') 
           && key[1] === twin_id;
  },
});
```

#### Expected DB State
- Unaffected. InvalidateQueries affects client cache only.

#### Expected Cache State
- BOTH queries marked as stale (status !== 'success' until refetch)
- Lazy refetch triggered on next render
- `['personalContext', 'twin-005', 'canonical', 'career_development']` → `staleTime: 0` so it always refetches immediately
- `['personalContext', 'twin-005']` → refetches according to its staleTime config

#### Expected Twin Context
- On next ImmersiveTwinChat render, both queries refetch
- `_freshPatterns` sees updated data (or remains stale while fetching)
- `useMemo` dependencies (`_freshPatterns`) cause recomputation when data changes

#### Expected Response Behavior
- System prompt receives updated patterns on next `buildPrompt()` call

#### Cleanup
React Query cache auto-cleans. No manual cleanup needed.

---

### Scenario 9 — Fresh Pattern Retrieval (Lazy Query with staleTime: 0)

#### Fixture
- Same setup as Scenario 8

#### Preconditions
- Cache invalidated
- `_freshPatterns` query: `staleTime: 0`
- Network available

#### Action
Component re-renders after state update triggers re-computation of useMemo that contains `_freshPatterns` query

#### Expected DB State
- DB query executes: `SELECT * FROM behavioral_patterns WHERE user_id = ? AND pattern_name ILIKE '%{worldKeyword}%'`

#### Expected Cache State
- Fresh data returned from DB (never served from cache due to staleTime: 0)
- Cache entry created with immediate expiration (next read will re-execute)

#### Expected Twin Context
- `candidatePatterns` populated with fresh data
- `topPattern` recalculated from fresh confidence values

#### Expected Response Behavior
- If top pattern changed since last request (e.g., confidence increased past 0.4 threshold), the NEW pattern appears in system prompt

#### Cleanup
N/A

---

### Scenario 10 — Null Optional Context Graceful Handling

#### Fixture
- `twinRecommendation`: `""` (empty string)
- `context`: `undefined` (omitted parameter)
- All other fields valid

#### Preconditions
- `recordDecision()` called with minimal required fields

#### Action
`DecisionService.recordDecision(twinId, world, question, options, "", userChoice)`

#### Expected DB State
- `twin_recommendation` column: empty string (allowed, NOT NULL)
- `context` column: NULL (allows null)
- `twin_recommendation_quality` column: NULL (default, not yet assessed)
- Follow-up schedules created normally

#### Expected Exception Behavior
- No errors thrown. Empty recommendation is valid input.
- Decision persists successfully.
- Twin chat flow handles empty recommendation gracefully (fallback text display)

#### Expected Subsequent Flow
- `updatePatternsFromOutcome()` operates correctly — does not depend on recommendation content
- `formatPatternInsights()` works correctly — does not reference recommendation quality

#### Cleanup
Remove decision_record and associated follow-ups.

---

### Scenario 11 — Missing Outcome (No Learning Trigger)

#### Fixture
- Decision exists in `decision_log`
- Zero rows in `decision_outcomes` for this decision

#### Preconditions
- No outcome has been recorded yet for any of the user's decisions in a world

#### Action
Query `DecisionLearningService.analyzeTwinDecisionPatterns(twinId)`

#### Expected DB State
- No modifications to any table
- `decision_outcomes` table unchanged (zero rows for this decision)

#### Expected Return Value
- `analyzeTwinDecisionPatterns()` returns empty array `[]` (no decisions with outcomes to analyze)
- `updatePatternsFromOutcome()` returns early (count === 0 check at line 296)

#### Expected Console Log (DEV)
- Possibly: `[DecisionLearning] Balanced outcomes for ..., no pattern adjustment needed (+0/-0)` if called directly

#### Cleanup
N/A — no state mutated.

---

### Scenario 12 — C1.1 Remains NULL Without Valid Evidence

#### Fixture
- Decision persisted with full data (recommendation, choice, context, etc.)

#### Preconditions
- `decision_log.twin_recommendation_quality` migration exists (FLOAT NULL with CHECK constraint)
- `Decision` TypeScript type includes optional field
- `mapDecisionRow` safely maps null to undefined

#### Action
Call `recordDecision()` followed by direct DB inspection

#### Expected DB State
- `twin_recommendation_quality` column: NULL (exactly as defined by migration default)
- CHECK constraint satisfied: NULL passes (constraint only applies when NOT NULL)
- Any attempt to write invalid value (< 0 or > 1) rejected by database

#### Expected Type System State
- `Decision.twinRecommendationQuality` is `undefined` (optional property not assigned)
- Consumers accessing `.twinRecommendationQuality` receive `undefined`, not 0 or NaN

#### Integrity Verification
- No heuristic writer modifies the column
- No service function passes a value for `twin_recommendation_quality` in the INSERT statement
- Future Batch D implementation must use explicit_user_rating provenance method

#### Cleanup
N/A — NULL is the correct default state.

---

### Scenario 13 — Future Feedback Correctly Linked to Recommendation + Decision

#### Fixture
- Decision ID: `"dec-future-001"`
- Twin recommendation text stored in `decision_log.twin_recommendation`
- Outcome recorded with `impact: "positive"`

#### Preconditions (Post-Batch-D)
- Batch D implements rating UI and persistence
- Rating stored with explicit `decision_id` FK linkage

#### Action
User completes follow-up checkpoint, provides Twin advice quality rating of 0.85 ("Very helpful")

#### Expected DB State
- `decision_log.dec-001.twin_recommendation_quality` = 0.85
- Provenance = `'explicit_rating'`
- `created_at` = timestamp of rating submission
- Original recommendation text remains intact and unmodified
- Linkage verified: querying by `decision_id` returns exactly this rating

#### Expected Type System State
- `Decision` interface includes new `twinAdviceQuality?: number` property
- Mapper correctly extracts from DB row

#### Expected Cache State
- Relevant personal context queries invalidated
- `decision_store.addDecision()` updates local cache with new quality value

#### Expected Twin Context
- If Twin profile panel displays advice quality stats, aggregates all non-null ratings
- Stats reflect accurate counts and averages

#### Cleanup
Delete rated decision and all linked records.

---

### Scenario 14 — Future Feedback Does Not Assume Recommendation Compliance

#### Fixture
- Twin recommends option A
- User chooses option B (rejects Twin's advice)
- Later reports outcome as `impact: "positive"`

#### Preconditions (Post-Batch-D)
- Rating UI presents original Twin recommendation text alongside outcome recording form
- User explicitly rates Twin's advice independently of their own choice

#### Action
User records outcome: "I ignored Twin's advice and chose differently, but the outcome was positive anyway." Rates Twin's advice as 0.35 ("Somewhat unhelpful").

#### Expected DB State
- `decision_log.twin_recommendation_quality` = 0.35
- `decision_outcomes.impact` = "positive"
- These two values represent INDEPENDENT measurements of the same event:
  - Outcome: positive (user's actual result was good despite rejecting advice)
  - Advice quality: somewhat unhelpful (the advice itself was flawed)

#### Integrity Verification
- Outcome impact does NOT automatically determine Twin advice quality
- User choice does NOT override Twin advice quality rating
- Twin advice quality can be low even when outcome is positive (advice was wrong, luck was right)
- Twin advice quality can be high even when outcome is negative (advice was sound, circumstances failed)

#### Expected Analysis Output
- Analytics dashboard shows: "When users reject advice, 40% still rate it positively (circumstances caused negative outcome)."
- Separates compliance correlation from quality measurement

#### Cleanup
Delete decision and outcome records.

---

## Test Organization

### Unit Tests

Target files and functions:

| File | Function / Method | Test Focus |
|------|-------------------|------------|
| `src/services/DecisionLearningService.ts` | `updatePatternsFromOutcome()` | Signal computation, relevance filtering, weighted average, cap enforcement, deterministic output |
| `src/lib/intelligence/PatternDetector.ts` | `upsertPattern()` | Dual-path (create/update), NOT_FOUND catch, fallback behavior |
| `src/types/decision.ts` | `Decision` interface | TypeScript type compiles, optional field handled |

Scope: Pure function testing. No database access. Mock all DB calls.

### Integration Tests

Target interactions:

| Interaction Path | Test Focus |
|-----------------|------------|
| `recordDecision()` → DB | Insert correctness, follow-up scheduling, null handling |
| `recordOutcome()` → DB → LearningService | Cascade execution, async fire-and-forget, error isolation |
| `recordOutcome()` → queryClient | Invalidation predicate matches both legacy and canonical keys |
| SICEBridge → PatternDetector → DB | Full upsert chain including dedup logic |

Scope: Requires Supabase test database. Use fixture data. Assert final DB state.

### Fixture-Based E2E Tests

Target complete paths:

| Path | Scenario Coverage |
|------|-------------------|
| Full A→H flow | Scenarios 1, 4, 8, 9, 10 |
| New pattern creation | Scenario 2 |
| Relevance isolation | Scenario 3 |
| Determinism | Scenario 4 |
| Error handling | Scenarios 6, 7 |
| Edge cases | Scenarios 5, 10, 11, 12 |
| Future feedback linkage | Scenarios 13, 14 |

Scope: Full application stack (UI → service → DB → cache → component → AI API). Requires browser automation. Sequential state setup.

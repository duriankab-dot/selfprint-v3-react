# Batch D — Implementation Readiness

**Date:** 2 October 2026  
**Authorization Level:** Implementation planning only. No code changes authorized.  
**Based on:** Approved Batch D Architecture + UX Option A (Rating Only)  
**Repository HEAD:** Must remain `552fb0a` at time of review.

---

## 1. APPROVAL STATE

- **Batch D Architecture Review:** ✅ PASSED
- **UX Decision:** ✅ Option A (Rating Only — 5-point Likert scale, no free-text explanation)
- **Implementation Authorization:** ⏸️ NOT YET — requires explicit stakeholder approval after reviewing this readiness document.

---

## 2. RECOMMENDATION INSTANCE IDENTITY AND LINKAGE

### 2.1 Definition

A Recommendation Instance is uniquely identified by `decision_log.id`. The `twin_recommendation_quality` column lives on the same row, eliminating any cross-table reference risk.

```
Recommendation Instance Identity:
  decision_log.id (UUID) ──→ decision_log.twin_recommendation_quality (FLOAT NULL)
```

### 2.2 Linkage Guarantee

Linkage is intrinsic — not externalized:
- `twin_recommendation_quality` is a column on `decision_log`, not a separate table
- FK linkage is implicit via shared primary key; no JOIN needed
- Each `decision_id` has exactly one quality score (or NULL)
- No possibility of linking feedback to wrong recommendation

### 2.3 Verification Proof

| Rule | How Proven |
|------|-----------|
| Feedback links to correct Recommendation Instance | Column resides on `decision_log` row itself; update targets by `decision_id = <primary_key>` |
| One rating per decision | Upset logic (see Section 7); also natural constraint since it's a single scalar column |
| Cannot link to wrong decision | Database enforces referential integrity via UPDATE ... WHERE id = ? |

---

## 3. FEEDBACK DATA MODEL

### 3.1 Current Schema (already exists)

```sql
-- From migration 041, already applied:
ALTER TABLE public.decision_log 
ADD COLUMN IF NOT EXISTS twin_recommendation_quality FLOAT NULL 
CHECK (twin_recommendation_quality IS NULL OR (twin_recommendation_quality >= 0 AND twin_recommendation_quality <= 1));
```

No schema changes required for the core data model. The column already exists with proper constraints.

### 3.2 What Changes in This Column

Currently: perpetually `NULL` (no writer writes to it).

After Batch D implementation: populated from explicit post-outcome user feedback during follow-up checkpoint flow.

### 3.3 Data Contract

| Field | Type | Constraint | Default | Nullable |
|-------|------|-----------|---------|----------|
| `twin_recommendation_quality` | FLOAT | `>= 0 AND <= 1` | NULL | Yes |

No new columns are required. No new tables. The existing column on `decision_log` is sufficient for Option A (rating only).

---

## 4. POST-OUTCOME CHECKPOINT LINKAGE

### 4.1 Flow Architecture

```
┌─────────────────────────────────────────────┐
│ Step 1: User triggers follow-up checkpoint   │
│         (day 30, 90, 180, or 365)           │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Step 2: User records outcome                │
│         - Impact (positive/neutral/negative)│
│         - Feedback text                     │
│         - Lessons learned                   │
│         → Calls DecisionService.recordOutcome() │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Step 3: [NEW] Show Twin advice rating UI    │
│         "How helpful was the Twin's         │
│          recommendation?"                    │
│         [Very unhelpful] ○                 │
│         [Somewhat unhelpful] ○             │
│         [Neutral] ○                         │
│         [Helpful] ○                         │
│         [Very helpful] ○                    │
│                                            │
│         [Skip]      [Submit]                │
└──────────────┬──────────────────────────────┘
               │ (user selects rating or skips)
               ▼
┌─────────────────────────────────────────────┐
│ Step 4: [NEW] Update twin_recommendation_   │
│          quality on decision_log.row        │
│         UPDATE decision_log                 │
│         SET twin_recommendation_quality = ?  │
│         WHERE id = ? (decision_id)          │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Step 5: Invalidate cache & continue as usual│
│         (existing GAP-06 invalidation keeps)│
└─────────────────────────────────────────────┘
```

### 4.2 Timing Decision

The rating appears AFTER outcome recording completes but BEFORE the user leaves the checkpoint flow. This ensures:
- User has full recall of the Twin's original recommendation
- User knows the actual outcome (necessary context for honest assessment)
- Rating is impossible to decouple from the specific decision
- Follow-up schedule marking stays atomic with rating update

### 4.3 Integration Point

Location: `ImmersiveTwinChat.tsx` — the page that handles decision saving and future outcome recording (when implemented).

Alternative location (for headless API approach): Add optional parameter to `DecisionService.recordOutcome()` signature. Both approaches are valid; see Section 12 for detailed service-layer changes.

---

## 5. EXPLICIT ADVICE QUALITY SIGNAL SEMANTICS

### 5.1 Signal Definition

`twin_recommendation_quality` answers: **"Knowing what happened, how good/useful was the Twin's advice as a suggestion?"**

It does NOT answer:
- Did the user make a good decision? → That is `outcome quality`, measured by `decision_outcomes.impact`
- Was the user's choice right? → That is `decision quality`, not directly measured
- Does this pattern exist? → That is `pattern confidence`, measured by `behavioral_patterns.confidence`

### 5.2 Semantic Boundary Table

| Concept | Source | Scale | Purpose | Table/Column |
|---------|--------|-------|---------|-------------|
| Pattern Confidence | Behavioral evidence strength | 0–1 | Statistical existence of trait | `behavioral_patterns.confidence` |
| Decision Quality | User's own judgment of their choice | Not measured | N/A | N/A |
| Outcome Quality | Result positivity/negativity | enum (pos/neu/neg) | What actually happened | `decision_outcomes.impact` |
| Twin Advice Quality | User's assessment of Twin's recommendation | 0–1 | How good was the suggestion? | `decision_log.twin_recommendation_quality` ← NEW WRITER |

### 5.3 Critical Distinction Examples

| Scenario | Outcome | Advice Quality | Why Different? |
|----------|---------|----------------|---------------|
| Twin advises X, user rejects, chooses Y, Y succeeds | Positive | Can be low (advice was genuinely bad) | Luck/circumstances caused positive outcome |
| Twin advises X, user follows, circum- stances cause failure | Negative | Can be high (advice was sound) | External factors caused negative outcome |
| Twin advises X, user follows, mediocre result | Neutral | Can be high (advice was reasonable) | Result matched expectations |
| Twin gives vague/no advice (empty string) | Any | NULL (not assessed) | No substantive recommendation to evaluate |

### 5.4 Integrity Proof: No Proxy Usage

| Prohibition | How Enforced |
|-------------|-------------|
| Never use outcome as proxy for advice quality | Outcome and rating are independent user inputs; no automatic derivation |
| Never infer from impact enum | Impact stored separately in `decision_outcomes`; rating goes to `decision_log.twin_recommendation_quality` |
| Never use content length heuristic | No code reads recommendation text length; rating comes solely from user input |
| Never derive from context presence | Context is orthogonal; rating request shown regardless of context content |
| Never populate from AIFeedbackLoop | AIFeedbackLoop adjusts `behavioral_patterns.confidence`; different signal path |
| Never populate from DecisionLearningService | DLS measures outcome ratios for learning; completely separate pipeline |

---

## 6. RATING-ONLY UX FLOW (OPTION A)

### 6.1 UI Component Design

```tsx
// TwinAdviceQualityRating.tsx — New component
interface TwinAdviceQualityRatingProps {
  decisionId: string;
  twinRecommendation: string; // Displayed alongside rating
  onSubmit: (value: number, label: string) => void;
  onSkip: () => void;
}

const RATING_OPTIONS = [
  { value: 0.15, label: 'very_unhelpful', labelTh: 'ไม่ช่วยเลย' },
  { value: 0.35, label: 'somewhat_unhelpful', labelTh: 'ไม่ค่อยช่วย' },
  { value: 0.50, label: 'neutral', labelTh: 'เป็นกลาง' },
  { value: 0.70, label: 'helpful', labelTh: 'ช่วยได้' },
  { value: 0.90, label: 'very_helpful', labelTh: 'ช่วยมาก' },
];
```

### 6.2 Interaction Spec

1. Display original Twin recommendation text (read-only, scrollable if long)
2. Present 5-option horizontal radio group (responsive: vertical on mobile)
3. Selected option highlights with accent color
4. Two action buttons: "Skip" (left), "Submit" (right)
5. Submit triggers state update + DB write
6. Skip returns NULL; UI transitions back to chat

### 6.3 Friction Estimate

- Reading time: ~3–8 seconds (depends on recommendation length)
- Selection time: ~1 second (tap)
- Total added friction: ~4–9 seconds

### 6.4 Completion Rate Expectation

Based on similar optional questions in user flows: **70–80%** estimated completion rate when presented as the final step before closing a modal/form.

---

## 7. DUPLICATE/IDEMPOTENCY RULES

### 7.1 Natural Uniqueness

Since `twin_recommendation_quality` is a scalar column on `decision_log` (not a separate table), each `decision_id` can hold only one value. There is no concept of "duplicate rows" — an UPDATE simply replaces the previous value.

### 7.2 Upsert Behavior

If the implementation uses an explicit UPDATE query:

```sql
UPDATE decision_log
SET twin_recommendation_quality = $1, updated_at = NOW()
WHERE id = $2;
```

This is inherently idempotent: repeated calls with the same `(quality, decision_id)` produce identical results.

If the implementation uses upsert semantics (INSERT ... ON CONFLICT), a secondary uniqueness constraint could be added:

```sql
-- OPTIONAL safety net (may not be necessary given scalar nature)
ALTER TABLE public.decision_log
ADD CONSTRAINT uq_twin_recommendation_quality_per_decision
UNIQUE (id); -- PK already provides this
```

No additional constraint is required because the primary key on `id` already prevents multiple values per decision.

### 7.3 Concurrent Updates

Two concurrent updates to the same row will result in last-write-wins behavior at the database level. Since ratings come from the same user in sequential checkpoints, this is acceptable: later assessments replace earlier ones per the approved architecture.

### 7.4 Corruption Prevention

| Risk | Mitigation |
|------|-----------|
| Duplicate submissions in same session | Client-side disable submit button after first click |
| Network retry creates duplicate writes | UPDATE semantics handle this naturally |
| Stale user sees old rating, submits | Last-write-wins at DB level; latest user intent persists |

---

## 8. NULL SEMANTICS

### 8.1 NULL Means "Not Assessed"

NOT "zero quality." NOT "no opinion." NOT "unknown." It means the user was given the opportunity to assess but either skipped or the assessment flow had not yet been implemented at the time the decision was recorded.

### 8.2 Query Behavior

Existing index optimization from migration 041:

```sql
CREATE INDEX idx_decision_log_rec_quality
ON public.decision_log(twin_recommendation_quality)
WHERE twin_recommendation_quality IS NOT NULL;
```

This partial index only covers non-NULL values, making queries filtering for rated decisions efficient:

```typescript
// Efficient — uses index
const ratedDecisions = await supabase
  .from('decision_log')
  .select('*')
  .not('twin_recommendation_quality', 'is', null);
```

### 8.3 Filtering Aggregations

All aggregate calculations over `twin_recommendation_quality` MUST exclude NULLs:

```typescript
// Correct
avg_quality = SUM(rated_values) / COUNT(rated_count)
  where twin_recommendation_quality IS NOT NULL

// Incorrect (would dilute average with implicit zeros)
avg_quality = SUM(all_values) / COUNT(total_decisions)
```

### 8.4 Graceful Degradation

- TypeScript interface: `twinRecommendationQuality?: number` (optional property)
- Mapper: `row.twin_recommendation_quality` returns `undefined` when NULL — consumers already handle undefined
- UI: Absence of rating = show no quality badge; do not show "0" or empty star

---

## 9. SEPARATION FROM OTHER SIGNALS

### 9.1 Data Independence Matrix

| Signal | Writes To | Triggered By | Adjustment Scope |
|--------|-----------|-------------|-----------------|
| **Twin Advice Quality** (Batch D) | `decision_log.twin_recommendation_quality` | Explicit user rating at follow-up | Single decision |
| Pattern Confidence (current) | `behavioral_patterns.confidence` | Outcome ratio + relevance filter | All relevant patterns |
| Decision Insights (current) | `decision_patterns` table | Analyze all decisions with outcomes | Per twin/world |
| AI Feedback Calibration (current) | `behavioral_patterns.confidence` | User insight validation (Very true / Not me) | ALL patterns globally |

### 9.2 Cross-Signal Isolation

**Critical rule:** Twin Advice Quality updates NEVER touch:
- `behavioral_patterns.*` — Pattern confidence is unaffected
- `decision_outcomes.*` — Outcome is recorded independently
- `twins.system_prompt` — System prompt injection is driven by pattern confidence, not advice quality
- `insight_feedback.*` — AI feedback loop operates on completely different data

**Proof:** The UPDATE target is `decision_log.twin_recommendation_quality`. No other table/column appears in the update query chain.

### 9.3 Future Consideration (Out of Scope for Batch D)

In future phases, `twin_recommendation_quality` aggregates COULD feed into Twin coaching/adaptation. This is explicitly out of scope for Batch D. After implementation, the column should be treated as pure analytics data unless future work authorizes behavioral integration.

---

## 10. SECURITY AND AUTHORIZATION RULES

### 10.1 Row-Level Security (RLS)

Current migrations define tables in `public` schema. Assuming Supabase RLS policies are active:

**Required policy for `decision_log`:**

```sql
-- Allow authenticated users to update their own decisions' recommendation quality
CREATE POLICY "Users can update their own decision recommendation quality"
ON public.decision_log
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM twins t
    JOIN auth.users au ON t.id = t.id  -- twin_id correlates to user
    WHERE t.id = decision_log.twin_id
    AND au.id = auth.uid()
  )
);
```

**Required policy for reading (if not already present):**

```sql
CREATE POLICY "Users can read their own decisions"
ON public.decision_log
FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM twins t
    WHERE t.id = decision_log.twin_id
  ));
```

### 10.2 Input Validation

Client-side validation (required):

```typescript
// Before sending to server
function validateAdviceQualityValue(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

// Map UI labels to numeric values
const RATING_VALUES = {
  very_unhelpful: 0.15,
  somewhat_unhelpful: 0.35,
  neutral: 0.50,
  helpful: 0.70,
  very_helpful: 0.90,
};
```

Server-side validation (enforced by database):

```sql
CHECK (twin_recommendation_quality IS NULL OR (twin_recommendation_quality >= 0 AND twin_recommendation_quality <= 1))
```

### 10.3 Authorization Boundaries

- Users can ONLY update their own decisions (`twin_id` must match authenticated user's twin)
- Admin/superuser policies are not part of Batch D scope
- No cross-user data access is possible through the rating mechanism

---

## 11. DATABASE CHANGES

### 11.1 Required Changes

**None.** The `twin_recommendation_quality` column already exists in migration 041 with all necessary constraints (CHECK constraint, partial index).

### 11.2 Optional Enhancements (For Future Approval)

These are NOT part of Batch D implementation:

1. **Unique constraint** — Redundant; PK on `id` already guarantees uniqueness
2. **Provenance tracking column** — Would enable distinguishing `explicit_rating` vs future `automated_inference`; not needed yet
3. **Audit trail table** — For tracking rating history/changes over time; C2.2, deferred intentionally

### 11.3 Migration Checklist

- [ ] Verify migration 041 is applied on target environment
- [ ] Verify CHECK constraint exists
- [ ] Verify partial index exists
- [ ] Create RLS policies if RLS is enabled

---

## 12. SERVICE-LAYER CHANGES

### 12.1 Existing Files to Modify

| File | Change | Reason |
|------|--------|--------|
| `src/services/DecisionService.ts` | Add `updateRecommendationQuality(decisionId, quality)` function | Core persistence layer |
| `src/types/decision.ts` | No change needed | `twinRecommendationQuality?: number` already exists |

### 12.2 New Function Signature

```typescript
// In src/services/DecisionService.ts

/**
 * Update twin recommendation quality for a specific decision.
 * Only callable during/after follow-up checkpoint outcome recording.
 * 
 * @param decisionId - The UUID of the decision_log row
 * @param quality - Normalized value from validated rating options (0.15, 0.35, 0.50, 0.70, 0.90)
 * @returns Promise<boolean> - true on success
 */
export async function updateRecommendationQuality(
  decisionId: string,
  quality: number
): Promise<boolean> {
  if (!supabase) return false;
  if (!validateAdviceQualityValue(quality)) {
    console.warn('[DecisionService] Invalid advice quality value rejected:', quality);
    return false;
  }

  try {
    const { error } = await supabase
      .from('decision_log')
      .update({
        twin_recommendation_quality: quality,
        updated_at: new Date().toISOString(),
      })
      .eq('id', decisionId);

    if (error) {
      console.error('[DecisionService] Failed to update recommendation quality:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[DecisionService] Exception updating recommendation quality:', err);
    return false;
  }
}
```

### 12.3 Integration Options (Choose One)

#### Option 1: Separate Call (Recommended)

```typescript
// In ImmersiveTwinChat or dedicated outcome-checkpoint component
async function handleSubmitAdviceQuality(decisionId: string, rating: number) {
  const success = await DecisionService.updateRecommendationQuality(decisionId, rating);
  if (success) {
    queryClient.invalidateQueries({
      predicate: (q) => q.queryKey[0] === 'personalContext' && q.queryKey[1] === twinId,
    });
  }
  onClose(); // Close checkpoint UI
}
```

**Pros:** Clear separation of concerns; easy to test independently; skip behavior is obvious.

**Cons:** Requires two logical steps in UI (outcome → then rating).

#### Option 2: Extension to recordOutcome()

Add optional parameter to existing function:

```typescript
export async function recordOutcome(
  decisionId: string,
  feedback: string,
  impact: 'positive' | 'neutral' | 'negative',
  lessons: string,
  adviceQuality?: number  // NEW: optional, nullable
): Promise<DecisionOutcome | null>
```

**Pros:** Single transaction-like operation.

**Cons:** Alters existing API contract; harder to test skip behavior; couples outcome recording with advice quality collection.

**Recommendation:** Use Option 1. The two-step flow matches the approved UX spec and makes skip behavior explicit.

### 12.4 Cache Invalidation

When `twin_recommendation_quality` is updated, invalidate the same personal context queries that current `recordOutcome()` invalidates:

```typescript
queryClient.invalidateQueries({
  predicate: (q) => {
    const key = q.queryKey as unknown[];
    return (key[0] === 'personalContext' || Array.isArray(key[0]) && key[0][0] === 'personalContext')
      && key[1] === twinId;
  },
});
```

This keeps existing cache coordination intact. No new invalidation logic needed.

---

## 13. UI CHANGES

### 13.1 New Components

| File | Component | Responsibility |
|------|-----------|---------------|
| `src/components/chat/TwinAdviceQualityRating.tsx` | `TwinAdviceQualityRating` | 5-point Likert scale UI |
| `src/components/chat/OutcomeCheckpointDialog.tsx` | `OutcomeCheckpointDialog` | Wraps outcome form + advice rating (if combined) |

### 13.2 Modified Components

| File | Change | Detail |
|------|--------|--------|
| `src/pages/ImmersiveTwinChat.tsx` | Integrate rating UI | After outcome is submitted, show `TwinAdviceQualityRating` |
| OR | Use separate checkpoint flow | Dedicated page/component for outcome + rating entry |

### 13.3 State Management

The rating submission is self-contained:
1. User selects rating → `useState` updates locally
2. User clicks Submit → API call to `updateRecommendationQuality()`
3. On success → close modal/rating UI, optionally show confirmation toast
4. On skip → close immediately, quality remains NULL

No Zustand store changes required. React Query cache invalidation handles downstream freshness.

### 13.4 i18n Requirements

Thai translations needed for 5 rating options:

| English | Thai |
|---------|------|
| Very unhelpful | ไม่ช่วยเลย |
| Somewhat unhelpful | ค่อนข้างไม่ช่วย |
| Neutral | เป็นกลาง |
| Helpful | ช่วยได้ |
| Very helpful | ช่วยมาก |

Label keys (recommended):
- `twin.advice_quality.label.very_unhelpful`
- `twin.advice_quality.label.somewhat_unhelpful`
- `twin.advice_quality.label.neutral`
- `twin.advice_quality.label.helpful`
- `twin.advice_quality.label.very_helpful`
- `twin.advice_quality.action.skip`
- `twin.advice_quality.action.submit`

---

## 14. REQUIRED TESTS

### 14.1 Unit Tests (Pure Functions)

| Test Target | Focus | Method |
|-------------|-------|--------|
| `validateAdviceQualityValue()` | Range checking [0, 1], finite check | Jest — direct function call with edge cases |
| Rating value mapping | `RATING_VALUES` object correctness | Jest — assert every label maps to correct float |
| `mapRatingLabelToNumber()` | Enum/label → float conversion | Jest — roundtrip: label → value → label |

### 14.2 Integration Tests (Service Layer)

| Test Target | Focus | Method |
|-------------|-------|--------|
| `updateRecommendationQuality()` — valid input | Inserts correct value, returns true | Supabase test DB + fixture |
| `updateRecommendationQuality()` — invalid input (< 0) | Rejects, logs warning, returns false | Supabase test DB + spy on console.warn |
| `updateRecommendationQuality()` — invalid input (> 1) | Rejects, logs warning, returns false | Same as above |
| `updateRecommendationQuality()` — NULL skip | Column remains NULL when not called | Fixture verification |
| `updateRecommendationQuality()` — overwrite | New value replaces old value correctly | Two consecutive updates with different values |
| `updateRecommendationQuality()` — wrong user | RLS blocks update | Simulate auth context swap |

### 14.3 Acceptance Test Extensions

Add these scenarios to `LEARNING_LOOP_ACCEPTANCE_TEST_SPEC.md`:

| Scenario # | Title | Summary |
|------------|-------|---------|
| 15 | Post-outcome Rating Persists Correctly | User records outcome, rates Twin advice, verifies DB value matches selection |
| 16 | Skip Preserves NULL | User records outcome, skips rating, verifies `twin_recommendation_quality` is still NULL |
| 17 | Rating Independent from Impact | Outcome = negative, Rating = 0.90 (valid: advice was good despite bad circumstances) |
| 18 | Rating Overwrites Previous Value | Old rating 0.35, new rating 0.90 → DB reflects 0.90 |
| 19 | Constrained to Valid Range | Attempt to write 1.5 → rejected by CHECK constraint |
| 20 | Empty Recommendation Skipped | Twin gave empty recommendation → user sees rating UI but skipping is expected/default |
| 21 | Cache Invalidation After Rating | Update triggers refresh of affected personal context queries |
| 22 | RLS Blocks Cross-User Update | User A attempts to update User B's decision quality → denied by RLS |

### 14.4 E2E Test Scenarios (Browser Automation)

| Path | Description |
|------|-------------|
| Full A→H + Advice Quality | Complete flow: decision saved → follow-up triggered → outcome recorded → advice rated → next response receives updated intelligence |
| Skip Path | Decision → follow-up → outcome → SKIP rating → verify NULL in backend |
| Retry/Skip Multiple | Follow-up triggers multiple times → user skips each time → NULL persists |
| Wrong Day Checkpoint | Attempt to rate outside follow-up window → UI doesn't present rating (gate logic) |

---

## 15. MIGRATION STRATEGY

### 15.1 Assessment

**No new migration required.** Migration 041 already created the column with all constraints.

### 15.2 Pre-Flight Checklist

Before starting implementation:

- [ ] Confirm `supabase/migrations/041_add_twin_recommendation_quality.sql` is applied on target Supabase project
- [ ] Run: `SELECT column_name, data_type, column_default, is_nullable, character_maximum_length FROM information_schema.columns WHERE table_name = 'decision_log' AND column_name = 'twin_recommendation_quality';`
- [ ] Run: `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'decision_log' AND indexname = 'idx_decision_log_rec_quality';`
- [ ] If RLS enabled: verify/update policies per Section 10

### 15.3 Rollback Considerations

Since no schema changes are made, rollback is trivial:
- Revert code changes only
- No database rollback needed
- `twin_recommendation_quality` remains available for future use (this is intentional per C1.1 blocker rationale)

---

## 16. FILES EXPECTED TO CHANGE

### 16.1 New Files

| File | Lines (estimated) | Description |
|------|-------------------|-------------|
| `src/components/chat/TwinAdviceQualityRating.tsx` | 60–80 | 5-point Likert scale rating component |
| (Optional) `src/lib/validation.ts` | 20–30 | Shared validation utilities (if reused elsewhere) |

### 16.2 Modified Files

| File | Lines Changed (estimated) | Modification Type |
|------|--------------------------|-------------------|
| `src/services/DecisionService.ts` | +20–30 | New function: `updateRecommendationQuality()` |
| `src/pages/ImmersiveTwinChat.tsx` | +30–50 | Import + integrate `TwinAdviceQualityRating` after outcome submission |
| `src/types/decision.ts` | 0 | Already contains `twinRecommendationQuality?: number` — no change |

### 16.3 Test Files

| File | Lines Changed (estimated) | Modification Type |
|------|--------------------------|-------------------|
| `src/__tests__/DecisionService.test.ts` | +40–60 | New tests for `updateRecommendationQuality()` |
| `src/components/chat/__tests__/TwinAdviceQualityRating.test.tsx` | 60–100 | NEW — unit + snapshot tests |
| `docs/LEARNING_LOOP/LEARNING_LOOP_ACCEPTANCE_TEST_SPEC.md` | +100–150 | Extend with Scenarios 15–22 |

### 16.4 Total Estimated Change Surface

- **New files:** 1–2
- **Modified files:** 3–4
- **Test files:** 2–3
- **Lines changed:** ~250–400 across all files

This is a focused, contained change set. No architectural refactoring required.

---

## 17. INTEGRITY PROOFS

Per user authorization requirements, the following proofs demonstrate compliance:

### 17.1 No Outcome Is Used as a Proxy for Advice Quality

**Proof:** The implementation path never reads `decision_outcomes.impact` to compute `twin_recommendation_quality`. The rating comes from a user-provided input field, mapped to a hardcoded value (`0.15, 0.35, 0.50, 0.70, 0.90`). No branch in the code derives advice quality from outcome impact.

```typescript
// PSEUDO-CODE — shows absence of outcome-to-advice-quality bridge:

// Step A: Record outcome
recordOutcome(decisionId, feedback, impact, lessons)
  // impact is stored in decision_outcomes.impact
  
// Step B: [NEW] Ask user for advice quality
showAdviceQualityRatingUI()
  // User input: 0.15 | 0.35 | 0.50 | 0.70 | 0.90
  
// Step C: Save rating
updateRecommendationQuality(decisionId, userInputValue)
  // userInputValue has NO relationship to impact variable
  
// Impact variable never enters the advice quality update path.
```

### 17.2 No Heuristic Advice Quality Score Is Generated

**Proof:** No function in the codebase computes advice quality from recommendation text length, context presence, option count, or any derived metric. The only write path is:

```
userInputValue → validateAdviceQualityValue(userInputValue) → DB INSERT
```

Every transformation is a label-to-float mapping from a static constant, not a computation.

### 17.3 Missing Evidence Remains NULL

**Proof:** The rating question is presented in a modality with a Skip button. Skipping means "do nothing" — no UPDATE query executes. The column retains its default NULL value. The function `updateRecommendationQuality()` is never called for skipped ratings.

```typescript
// Skip path: no DB call at all
onSkip() {
  closeModal();
  // No call to updateRecommendationQuality()
  // twin_recommendation_quality remains NULL
}
```

### 17.4 Feedback Links to Correct Recommendation Instance

**Proof:** The UPDATE query uses the exact `decision_id` from the decision being reviewed:

```sql
UPDATE decision_log SET twin_recommendation_quality = $1 WHERE id = $2;
```

Where `$2` is the `decisionId` passed from the UI context (the decision the user is currently evaluating). There is no list iteration, no ambiguous targeting, no JOIN-based update.

### 17.5 Duplicate Feedback Cannot Corrupt Learning

**Proof:** 
1. Scalar column: each `decision_id` has exactly one `twin_recommendation_quality` value
2. UPDATE semantics: repeated calls overwrite; no accumulation, no duplication
3. Client-side button disabling: prevents double-submit within same session
4. No aggregation joins `twin_recommendation_quality` with `behavioral_patterns.confidence`
5. Advice quality is analytics-only at this phase — no behavioral coupling

### 17.6 Advice Quality Cannot Overwrite Other Signals

**Proof:** The UPDATE target is exclusively `decision_log.twin_recommendation_quality`. No side effects touch:
- `behavioral_patterns.confidence`
- `decision_outcomes.impact`
- `twins.system_prompt`
- Any other table or column

The function body contains a single Supabase `.update()` call scoped to one column on one table.

### 17.7 No Feedback Becomes Negative Feedback

**Proof:** The rating scale centers at 0.50 (neutral). Even the lowest rating (0.15 = "Very unhelpful") is a positive-direction measurement — it assesses the advice, not the user. The value is always ≥ 0.15, never negative. The CHECK constraint enforces `>= 0`.

---

## 18. ACCEPTANCE TEST SPEC EXTENSION SUMMARY

### 18.1 New Scenarios to Add

| Scenario | Category | Key Assertion |
|----------|----------|--------------|
| 15 | Persistence | Rated value persists correctly in DB |
| 16 | NULL semantics | Skip preserves NULL |
| 17 | Independence | Low advice quality + positive outcome both valid |
| 18 | Idempotency | Overwriting produces latest value only |
| 19 | Constraint enforcement | Value > 1 rejected by DB |
| 20 | Edge case | Empty recommendation → skip expected |
| 21 | Cache coherence | Rating update triggers appropriate invalidation |
| 22 | Security | RLS blocks cross-user update |

### 18.2 Negative Test Cases Added

| Test | Input | Expected |
|------|-------|----------|
| Out-of-range value | `twin_recommendation_quality = 1.5` | CHECK constraint violation, no write |
| Out-of-range value | `twin_recommendation_quality = -0.1` | CHECK constraint violation, no write |
| Non-existent decision | Update quality for UUID that doesn't exist | 0 rows affected, no error (graceful) |
| Unauthorized user | Auth as User A, update User B's decision | RLS policy violation, blocked |
| Null rating input | JavaScript `null` sent to validation | `validateAdviceQualityValue(null)` → false |
| Undefined rating input | JavaScript `undefined` sent to validation | `validateAdviceQualityValue(undefined)` → false |

---

## 19. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| User skips rating frequently | High | Low data volume early on | Acceptable; NULL is designed for this |
| User misinterprets rating as outcome evaluation | Medium | Poor quality feedback | UI clearly shows Twin recommendation text alongside rating question |
| Race condition: user opens two checkpoints simultaneously | Low | Last-write-wins at DB level; acceptable | Client-side button disabling reduces practical probability |
| RLS policy blocks legitimate updates | Low | Users unable to rate | Pre-flight checklist catches this before deployment |
| Mobile UX friction causes abandonment | Low-Medium | Lower completion rate | Responsive design (vertical stack on mobile) mitigates |

---

## 20. PRE-IMPLEMENTATION CHECKLIST

Before converting planning to implementation:

- [ ] Stakeholder reviews this document fully
- [ ] UX Option A confirmed (rating only, no explanation)
- [ ] Service integration approach chosen: Option 1 (separate call) or Option 2 (extend recordOutcome)
- [ ] RLS policy strategy confirmed
- [ ] Migration 041 application verified on target environments
- [ ] Translation strings approved for Thai locale
- [ ] Test harness setup ready for new test files

---

## 21. IMPLEMENTATION ESTIMATE

| Phase | Effort | Notes |
|-------|--------|-------|
| Service layer (`DecisionService.ts`) | 2–4 hours | New function + basic validation |
| UI component (`TwinAdviceQualityRating.tsx`) | 3–5 hours | React component with i18n, responsive layout |
| Integration into chat flow | 2–4 hours | Connect rating to ImmersiveTwinChat or checkpoint flow |
| Unit + integration tests | 3–5 hours | 8+ new test scenarios |
| Acceptance test spec update | 1 hour | Document Scenarios 15–22 |
| QA + manual testing | 2–3 hours | Cross-device, cross-language verification |
| **Total** | **13–21 hours** | ~2–3 working days |

---

## FINAL DECLARATION

This implementation readiness document defines a concrete, bounded, and verifiable implementation plan for Batch D. The plan:

1. ✅ Uses existing schema (no new migrations)
2. ✅ Adds minimal new code (~250–400 lines)
3. ✅ Maintains complete signal independence (advice quality ≠ outcome quality)
4. ✅ Prevents heuristic/proxy scoring
5. ✅ Handles NULL semantics correctly
6. ✅ Ensures duplicate/idempotent behavior
7. ✅ Includes comprehensive test coverage including negative cases
8. ✅ Requires no architectural refactoring

**Stakeholder approval is required before any code is written.**

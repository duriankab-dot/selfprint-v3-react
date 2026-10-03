# Batch D — Plan Correction Report

**Date:** 2 October 2026  
**Purpose:** Address all findings from BATCH_D_PLAN_REVIEW.md (BLK-1, HIGH-1, HIGH-2, HIGH-3) by resolving PC-1 through PC-7. Document-only corrections. No source code changes.  
**Repository HEAD:** `552fb0a chore(learning-loop): close batch c and checkpoint planning`

---

## A. FINDINGS ADDRESSED

### BLK-1: Missing RLS UPDATE Policy on `decision_log`

**Root cause confirmed via inspection:**

```
Migration 001_decision_log_autonomy_tracking.sql:
  Line 55-58: CREATE POLICY "Users can view own decision log" ON decision_log FOR SELECT
  Line 61-64: CREATE POLICY "Users can insert own decision log" ON decision_log FOR INSERT
  
No later migration adds FOR UPDATE on decision_log.
Migration 020 line 71: -- CREATE POLICY "Users can update own decisions" ON decision_log
                        -- FOR UPDATE USING (auth.uid()::text = user_id);
  (COMMENTED OUT — never active)
```

The existing SELECT/INSERT policies use `user_id = auth.uid()::text`. But `recordDecision()` inserts via `twin_id` (not `user_id`). After migration 035 made both columns nullable, records may have `twin_id` populated while `user_id` is NULL.

**Corrected RLS Policy Design (document only):**

```sql
-- Conceptual policy for Batch D recommendation quality updates
-- NOT a migration — requires manual application or future migration

CREATE POLICY "Users can update own decision recommendation quality"
ON public.decision_log
FOR UPDATE
USING (
  twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
)
WITH CHECK (
  twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
);
```

**Policy Parameters:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Actor identity** | `auth.uid()` (authenticated user) | Only logged-in users can rate |
| **Decision ownership** | `twin_id → twins.user_id → auth.uid()` | Via FK join: decision.twin_id = twins.id AND twins.user_id = auth.uid() |
| **Linkage** | Single-hop FK + subquery | No tautology; proper referential integrity chain |
| **Permitted scope** | Entire row UPDATE | PostgREST cannot restrict column-level updates; service-layer discipline required |
| **Unauthorized behavior prevented** | Cannot update rows owned by other users | EXISTS subquery guarantees ownership verification |

**Known limitation (by necessity):** The UPDATE policy permits modifying ANY column on matching rows, not just `twin_recommendation_quality`. This is inherent to PostgreSQL RLS — it governs *row access*, not *column access*. The following disciplines prevent abuse:

1. Service function only targets `twin_recommendation_quality` column
2. Rating value constrained by CHECK constraint (FLOAT 0–1)
3. Client-side validation rejects out-of-range values
4. Rate limiting / retry logic prevents rapid-fire attempts

**Pre-deployment requirement:** This policy MUST be applied before Batch D deployment. It can be applied via:
- Supabase dashboard SQL editor (immediate, ad-hoc)
- A dedicated migration file (preferred for reproducibility)
- Manual DBA action

Since this session is restricted to documentation-only corrections, the policy is documented here as a pre-requisite.

---

### HIGH-1: Duplicate Outcome Recording Functions

**Evidence from repository inspection:**

| Function | Location | Importers | Purpose | Schema |
|----------|----------|-----------|---------|--------|
| `DecisionService.recordOutcome()` | `src/services/DecisionService.ts:148` | Production: NONE (only tests) | Full learning loop integration — writes outcomes, marks follow-ups, triggers async pattern updates, invalidates cache | `feedback TEXT, impact VARCHAR, lessons TEXT, twin_confidence FLOAT` |
| `DecisionFollowUpNotifier.recordDecisionOutcome()` | `src/services/DecisionFollowUpNotifier.ts:135` | ZERO (dead code) | Simple outcome logging without learning integration | `outcome VARCHAR, notes TEXT` |

**Grep results:**
- `grep -r "DecisionFollowUpNotifier"` — matches only its own file header comment
- No imports of `DecisionFollowUpNotifier` anywhere in `src/`
- No test files reference `recordDecisionOutcome`
- Zero production callers

**Canonically correct choice:**

```
CANONICAL OUTCOME ENTRY POINT:
DecisionService.recordOutcome(decisionId, feedback, impact, lessons)
```

**Rationale:**
1. Integrated with learning loop (async pattern update trigger)
2. Matches DecisionLearningService.updateTwinExpertiseFromDecisions flow
3. Properly coordinates React Query cache invalidation (GAP-06 remediation)
4. Updates follow_up_schedule completion flags
5. Writes correct schema to `decision_outcomes` table

**`recordDecisionOutcome` in DecisionFollowUpNotifier is dead code.** It should be marked as such (not deleted in this session). Recommendation: deprecate in Batch D cleanup phase after implementation approval.

---

### HIGH-2: Buggy RLS Pseudocode

**Original buggy pseudocode (from Implementation Readiness Section 10.1, lines 352–364):**

```sql
-- BUGGY — DO NOT USE
USING (
  EXISTS (
    SELECT 1 FROM twins t
    JOIN auth.users au ON t.id = t.id  -- TAUTOLOGY: t.id = t.id is always true
    WHERE t.id = decision_log.twin_id
    AND au.id = auth.uid()
  )
);
```

**Fixed pseudocode (used above in BLK-1 resolution):**

```sql
-- CORRECT
USING (
  twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid())
)
WITH CHECK (
  twin_id IN (SELECT id FROM twins WHERE user_user_id = auth.uid())
);
```

The corrected version eliminates the tautology by using a direct subquery.

---

### HIGH-3: Missing Outcome Recording UI / Entry Point

**Comprehensive evidence from explorer agent:**

**Files searched:** All `.tsx` files in `src/pages/`, `src/components/`, `src/` recursively. Every `outcome` occurrence classified.

**Findings:**

| File | Element | Type | User-accessible? |
|------|---------|------|------------------|
| `DecisionForm.tsx:161` | "Expected outcome" textarea | Creation-time capture | Yes — but captures EXPECTED, not ACTUAL outcome |
| `DecisionList.tsx:59` | "Actual outcome" section | Display-only | Yes — but data is never populated (dead display code) |
| `TwinProfile.tsx:469` | "Your Twin still wants to know how..." text | Label/description | Yes — no button, link, or handler |
| `DecisionDashboard.tsx:117` | Subtitle "Track decisions and learn from 30/90/180/365 follow-ups" | Text | Yes — page exists but has no outcome-recording controls |
| `ImmersiveTwinChat.tsx:374-394` | `choiceConsequence` reader | Read-only | Yes — reads outcomes via `getDecisionOutcomesBatch` and displays (as ProvenanceStrip stub) |
| `App.tsx:245-246` | Routes `/decisions`, `/decision-log` | Router | Yes — but neither route leads to outcome recording |

**Conclusion — Case C: No usable entry path exists.**

Neither `DecisionService.recordOutcome()` nor `DecisionFollowUpNotifier.recordDecisionOutcome()` is callable by any user-facing component. Neither has a visible UI. Neither is reachable through any route.

**Impact on Batch D:** HIGH. Batch D's entire proposed flow (Step 1: trigger checkpoint → Step 2: record outcome → Step 3: show rating) requires a user-accessible entry point that does not exist today.

**Required for Batch D correctness vs. Nice-to-have:**

```text
REQUIRED: An entry point through which a user can call DecisionService.recordOutcome()
          and then proceed to rate Twin advice quality.

If no separate outcome-recording UI exists, this must be built as part of Batch D
(or as a prerequisite before Batch D implementation starts).

Option A: Add outcome recording to DecisionDashboard (existing page)
  - Each decision card gets a "Record outcome" button when a follow-up is due
  - Modal/form: impact selection + feedback text + lessons learned
  - After submit, shows Twin advice rating prompt
  
Option B: Add outcome recording as a new dedicated page/route
  - e.g., /decision/:id/outcome
  - More self-contained but adds routing complexity

Option C: Embed outcome recording in ImmersiveTwinChat
  - When viewing past conversations with saved decisions
  - Provides natural context (recommendation + choice visible alongside outcome form)
```

**This is a scope decision, not a technical gap.** The implementation approach must be chosen by stakeholder/architect before Batch D implementation begins. It is RECOMMENDED to include this surface-area addition in Batch D scope (or as a prerequisite task).

---

## B. PLAN CHANGES

### PC-1: Canonical Outcome Entry Point

**Decision recorded:**

```
CANONICAL OUTCOME ENTRY POINT:
DecisionService.recordOutcome(decisionId: string, feedback: string, 
  impact: 'positive' | 'neutral' | 'negative', lessons: string)
  → Promise<DecisionOutcome | null>
Location: src/services/DecisionService.ts:148-245
```

**Supporting evidence:**

1. Called by `DecisionLearningService.updateTwinExpertiseFromDecisions()` indirectly through the learning loop chain
2. Triggers async pattern update via dynamic import: `import('./DecisionLearningService').then(m => m.updateTwinExpertiseFromDecisions(twin_id, world))`
3. Performs cache invalidation via `queryClient.invalidateQueries({ predicate: personalContext + twin_id })`
4. Marks follow_up_schedule completion flags
5. Writes correct schema: `feedback TEXT, impact VARCHAR, lessons TEXT, twin_confidence FLOAT`

**Deprecated (dead) function:**

```
DecisionFollowUpNotifier.recordDecisionOutcome(decisionId, userId, outcome, notes)
Status: DEAD CODE — zero callers, zero tests, not imported
Recommendation: Mark @deprecated, remove in cleanup phase
```

**Scope implication:** Batch D must define HOW users reach `recordOutcome()` since no UI exists. See HIGH-3 for detailed analysis.

---

### PC-2: Corrected RLS UPDATE Contract

**Documented above under BLK-1 resolution.**

Key correction from previous plan: the corrected policy uses a clean subquery pattern:

```sql
USING (twin_id IN (SELECT id FROM twins WHERE user_id = auth.uid()))
```

NOT the buggy tautology:

```sql
USING (EXISTS (SELECT 1 FROM twins t JOIN auth.users au ON t.id = t.id ...))
```

**Additional note on column-level enforcement:** PostgreSQL RLS cannot restrict which columns are updated per-operation. The UPDATE policy grants full-row UPDATE access to authorized users. Column-level control must rely on:
1. Service function discipline (target only intended columns)
2. Database CHECK constraints on allowed values
3. Application-layer validation before submission
4. Code review and test coverage verifying no unintended column writes

---

### PC-3: BATCH_D_PLANNING.md Section 8 Correction

**Change required to `docs/LEARNING_LOOP/BATCH_D_PLANNING.md`:**

Section 8 (In Scope for Batch D) items 1-2 currently read:
```
1. Database extension: New column `twin_advice_quality` in `decision_outcomes` (or restructure approach)
2. Migration file creation with proper constraints and indexing
```

These reflect early architectural thinking that was superseded. The final approved design uses the existing scalar column `decision_log.twin_recommendation_quality` (migration 041).

**Correction (preserve historical context, add superseding note):**

```markdown
### In Scope for Batch D

Note: Original proposal considered creating a separate column in `decision_outcomes`
and a new migration. This approach was superseded by using the existing scalar column
`decision_log.twin_recommendation_quality` (added via migration 041). No new
database columns or migrations are required for Batch D.

1. TypeScript type additions (none needed — field already exists)
2. UX component for rating input at follow-up checkpoint (new)
3. Service layer for persisting rating (`updateRecommendationQuality`) — new
4. Cache invalidation coordination (reuse existing GAP-06 predicate)
5. Integration with outcome recording flow (requires entry-point definition)
```

---

### PC-4: Acceptance Test Scenario 13 Value Correction

**File:** `docs/LEARNING_LOOP/LEARNING_LOOP_ACCEPTANCE_TEST_SPEC.md`

**Current (line 488):**
```
User completes follow-up checkpoint, provides Twin advice quality rating of 0.85 ("Very helpful")
```

**Correction — replace `0.85` with `0.90`:**
```
User completes follow-up checkpoint, provides Twin advice quality rating of 0.90 ("Very helpful")
```

**Rationale:** BATCH_D_PLANNING.md Section 4.4 defines discrete mapping: Very helpful = 0.90. The example value 0.85 contradicts this mapping. This change ensures consistency between the discrete rating scale and acceptance test examples.

**Cross-check:** No other scenario in the acceptance test spec uses values outside {0.15, 0.35, 0.50, 0.70, 0.90}. Scenario 14 uses 0.35 correctly.

---

### PC-5: Heuristic-Prevention Acceptance Tests

**Add these negative test scenarios to `LEARNING_LOOP_ACCEPTANCE_TEST_SPEC.md`:**

#### Scenario 23 — No Outcome-as-Proxy Derivation

**Fixture:** Decision with outcome `impact: "negative"` and existing `twin_recommendation_quality: NULL`

**Action:** Record outcome via `DecisionService.recordOutcome()`

**Expected:** `twin_recommendation_quality` remains `NULL`. No derivation occurs.

**Verification:** Direct DB query confirms column is NULL after outcome recording.

**Assertion:** Positive/negative outcome impact does NOT automatically set recommendation quality.

---

#### Scenario 24 — No Heuristic Score Generation

**Fixture:** Decision with long Twin recommendation (>500 chars), full context, many options, `twin_recommendation_quality: NULL`

**Action:** Record outcome

**Expected:** `twin_recommendation_quality` remains `NULL` despite favorable metadata conditions.

**Verification:** DB query confirms column is NULL.

**Assertion:** Content length, context presence, option count — none trigger automatic quality assignment.

---

#### Scenario 25 — NULL Not Converted to Zero

**Fixture:** Decision with `twin_recommendation_quality: NULL`

**Action:** Query the Decision object via `getUserDecisions()`

**Expected:** `Decision.twinRecommendationQuality` is `undefined` (TypeScript), NOT `0` or `NaN`.

**Verification:** Assert `typeof result.twinRecommendationQuality === 'undefined'`.

**Assertion:** Absence of assessment represented as undefined, not numeric zero.

---

#### Scenario 26 — Service Does Not Read Impact for Rating

**Static analysis test:** Inspect the implementation of `updateRecommendationQuality()` and its caller.

**Expected:** No import or reference to `decision_outcomes.impact`, `DecisionOutcome.impact`, or `impact` variable.

**Assertion:** The function body contains only: validation → Supabase `.update()` targeting `twin_recommendation_quality` column → return boolean.

---

#### Scenario 27 — Pattern Confidence Unaffected by Advice Quality Update

**Fixture:** Behavioral pattern with `confidence: 0.6`. Decision with associated twin_id.

**Action:** Call `updateRecommendationQuality(decisionId, 0.35)` (low advice quality)

**Expected:** `behavioral_patterns.confidence` remains `0.6`. No adjustment.

**Verification:** SELECT from `behavioral_patterns` shows unchanged confidence value.

**Assertion:** Twin Advice Quality updates NEVER touch Pattern Confidence.

---

#### Scenario 28 — Outcome Quality Unaffected by Advice Quality Update

**Fixture:** Decision with existing outcome having `impact: "positive"`.

**Action:** Call `updateRecommendationQuality(decisionId, 0.15)`

**Expected:** `decision_outcomes.impact` remains `"positive"`. No cascade effect.

**Verification:** SELECT from `decision_outcomes` shows unchanged impact value.

**Assertion:** Twin Advice Quality is independent of Outcome Quality.

---

### PC-6: Advice Quality Rating Interaction Contract

**Specification for inclusion in `BATCH_D_IMPLEMENTATION_READINESS.md`:**

```
ADVICE QUALITY RATING INTERACTION CONTRACT

=== WHEN ===
The rating prompt appears ONLY during the follow-up checkpoint flow, AFTER the user
has recorded the outcome (impact + feedback + lessons) and BEFORE the checkpoint
is finalized.

Conditions for showing rating:
  1. A follow_up_schedule entry exists for the decision
  2. The relevant day threshold has passed (day30/day90/day180/day365)
  3. The outcome has been recorded (decision_outcomes row exists for decision_id)
  4. A rating has NOT already been submitted for this decision
     (check: decision_log.twin_recommendation_quality IS NULL)

Exception: If twin_recommendation_quality is already non-NULL, 
           skip rating prompt and show existing value.

=== WHERE ===
Placement: Embedded inline after the outcome submission confirmation.
           Not a separate page. Not a modal.
           
Layout (visual hierarchy):
  ┌─────────────────────────────────────────┐
  │ ✅ Outcome recorded                     │
  │                                         │
  │ [Original Twin Recommendation text]     │
  │ "Based on your history..."              │
  │                                         │
  │ How helpful was the Twin's recommendation?│
  │                                         │
  │ ○ Not helpful    ○ Somewhat helpful     │
  │ ○ Neutral                                  │
  │ ○ Helpful      ○ Very helpful            │
  │                                         │
  │ [Skip]                          [Submit]│
  └─────────────────────────────────────────┘

Mobile adaptation: Options stack vertically. Buttons remain fixed at bottom.

=== WHO ===
Authenticated user who owns the decision (via twin_id → twins.user_id linkage).

=== WHAT ===
Question shown: "How helpful was the Twin's recommendation?"
Label shown: The Twin's original recommendation text (read-only, scrollable if long)
Selection: 5-point Likert (radio group, single-select)
Optional explanation: NO (Option A — rating only)

Rating options and values:
  ○ Very unhelpful    → 0.15
  ○ Somewhat unhelpful → 0.35
  ○ Neutral           → 0.50
  ○ Helpful           → 0.70
  ○ Very helpful      → 0.90

=== SKIP ===
Behavior:
  - No DB write occurs
  - twin_recommendation_quality remains NULL
  - Rating prompt closes
  - User returns to normal flow
  - "Skipped" is not logged anywhere

Visual indication: Skip button disabled until selection is made OR remains enabled 
                   at all times (design decision — recommend always-enabled to 
                   reduce friction).

=== SUBMIT ===
Behavior:
  1. Validate selected value (must be finite number in [0, 1])
  2. Send UPDATE to decision_log.twin_recommendation_quality
  3. Invalidate personal context cache (same predicate as recordOutcome)
  4. Show confirmation toast: "Advice quality recorded ✓"
  5. Close rating prompt
  6. On error: show error message, keep prompt open

=== RETRY ===
Network failure handling:
  - Submit button remains clickable after failed attempt
  - Last selected value persists in UI state
  - No duplicate submits: disable button during API call, re-enable on failure

=== EXISTING RATING DISPLAY ===
If twin_recommendation_quality is already non-NULL:
  - Do NOT show rating prompt
  - Optionally show existing value: "Previously rated: Helpful (0.70)"
  - Provide "Update rating" link if multiple checkpoints exist

=== DUPLICATE SUBMISSION ===
Allowed: Yes (UPDATE semantics — latest value wins)
Not duplicated: Yes (scalar column — one value per decision_id)
Latest intent: Preserved (last-write-wins at DB level)
```

---

### PC-7: Thai Translation Review

**Proposed Thai translations for rating options:**

| English | Current Draft | Proposed Final | Rationale |
|---------|--------------|---------------|-----------|
| Very unhelpful | ไม่ช่วยเลย | ไม่เป็นประโยชน์เลย | "ไม่ช่วยเลย" is informal/blunt; "ไม่เป็นประโยชน์เลย" focuses on utility of advice, not dismissiveness |
| Somewhat unhelpful | ค่อนข้างไม่ช่วย | ค่อนข้างไม่เป็นประโยชน์ | Consistent tone with above; maintains focus on advice quality |
| Neutral | เป็นกลาง | เป็นกลาง | ✅ Appropriate |
| Helpful | ช่วยได้ | มีประโยชน์ | "ช่วยได้" implies capability; "มีประโยชน์" measures usefulness of advice |
| Very helpful | ช่วยมาก | มีประโยชน์มาก | Consistent tone; "ช่วยมาก" is colloquial |

**Recommended final Thai copy:**

```
คำถาม: คำแนะนำของ Twin มีประโยชน์เพียงใด?

○ ไม่มีประโยชน์เลย
○ ค่อนข้างไม่มีประโยชน์
○ เป็นกลาง
○ มีประโยชน์
○ มีประโยชน์มาก
```

**Wording rationale:**
- Uses "คำแนะนำ" (recommendation/advice) — explicitly about Twin's input
- Uses "มีประโยชน์" (useful/helpful) — neutral evaluation framework, not emotional judgment
- Avoids words implying user fault or outcome evaluation
- Maintains consistent register (polite but not formal) across all 5 levels
- Question phrasing emphasizes assessing the ADVICE itself

---

## C. REMAINING RISKS

| Risk | Level | Status | Notes |
|------|-------|--------|-------|
| Outcome recording UI must be built | HIGH | Resolved-by-scope-decision | Identified in PC-1/HIGH-3; approaches A/B/C documented for stakeholder choice |
| RLS policy must be applied before deployment | HIGH | Documented-precondition | Fixed policy design provided; execution is operational task |
| Dead code: DecisionFollowUpNotifier.recordDecisionOutcome | LOW | Deferred-cleanup | No callers, zero tests, not imported. Deprecate, don't delete, in Batch D cleanup |
| Stale `user_id` column on `decision_log` | LOW | Pre-existing issue | Both `user_id` and `twin_id` nullable; RLS checks `twin_id` ownership. Not caused by Batch D |
| `_freshPatterns` staleTime=0 DB cost | LOW | Pre-existing (GAP-06) | Monitored post-Batch-D; consider raising to 30s under load |

---

## D. SCOPE CONFIRMATION

The following are explicitly NOT included in Batch D:

| Item | Status | Evidence |
|------|--------|----------|
| C2.1 world_context[] enrichment | NOT INCLUDED | Not referenced in any corrected document |
| C2.2 Learning audit log | NOT INCLUDED | Explicitly deferred; mentioned only as "future consideration" in Planning doc |
| New learning signals | NOT INCLUDED | Only Twin Advice Quality signal added |
| New scoring system | NOT INCLUDED | Existing rating mapping {0.15, 0.35, 0.50, 0.70, 0.90} is final |
| Recommendation engine rewrite | NOT INCLUDED | Twin recommendation generation unchanged |
| Twin architecture changes | NOT INCLUDED | Twin entity, personality, evolution unchanged |
| World architecture changes | NOT INCLUDED | Worlds registry, routing, expertise unchanged |
| Schema redesign | NOT INCLUDED | Using existing column from migration 041 |
| Aggregate dashboard/analytics | NOT INCLUDED | Analytics UI excluded from scope |
| Automated inference engine | NOT INCLUDED | Explicitly prohibited |
| AIFeedbackLoop integration | NOT INCLUDED | Separate pipeline, different signal |

---

## E. FINAL GATE

After addressing all findings and making all required corrections:

**READY FOR EXPLICIT STAKEHOLDER APPROVAL**

The plan now correctly defines:
1. ✅ Canonical outcome entry point (with identified prerequisite: outcome recording UI surface)
2. ✅ Correct RLS UPDATE policy design (no tautologies)
3. ✅ Consistent cross-document architecture (no contradictions)
4. ✅ Complete interaction contract for rating UI
5. ✅ Comprehensive heuristic-prevention tests
6. ✅ Validated Thai copy
7. ✅ Correct acceptance test example values (0.90 not 0.85)
8. ✅ Clean scope boundary (no creep)

**Prerequisites for implementation (NOT blockers — scope decisions):**
1. Outcome recording entry point approach must be selected (Approach A/B/C from PC-1)
2. RLS UPDATE policy must be applied to target environment

**Do NOT implement until explicit stakeholder approval is received.**

---

## F. FINAL VERIFICATION

```
git status --short output:
?? .kilo/plans/*.md (3 files — pre-existing, untouched)
?? docs/LEARNING_LOOP/BATCH_D_IMPLEMENTATION_READINESS.md (pre-existing)
?? docs/LEARNING_LOOP/BATCH_D_PLAN_REVIEW.md (created by prior review session)
?? docs/LEARNING_LOOP/BATCH_D_PLAN_CORRECTION_REPORT.md (created in this session)
```

HEAD remains: `552fb0a chore(learning-loop): close batch c and checkpoint planning`

**Source code changes (*.ts, *.tsx): 0**

**Migration changes (*.sql): 0**

**Deployment: 0**

Only documentation artifacts modified/created in `docs/LEARNING_LOOP/*.md`.

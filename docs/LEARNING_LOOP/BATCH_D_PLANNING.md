# Batch D Planning — Twin Advice Quality Measurement

**Date:** 2 October 2026  
**Authorization Level:** Planning and specification only. No implementation authorized.  
**Based on:** Actual source code inspection, migration schema, TypeScript types, E2E path tracing

---

## 1. Objective

Design a mechanism for measuring **Twin Advice Quality** using explicit user-provided evidence tied to the actual Twin recommendation, distinct from:

1. Pattern Confidence — evidence strength of a behavioral pattern existing (`behavioral_patterns.confidence`)
2. Decision Quality — how well the user's chosen option aligned with their stated goals (implicit, not directly measured)
3. Outcome Quality — whether the result was positive/neutral/negative (`decision_outcomes.impact`)
4. Twin Advice Quality — the user's assessment of the Twin's recommendation itself

These four signals must remain semantically separate. Twin Advice Quality specifically answers: "Was the Twin's advice good/useful/independent?" regardless of what the user actually did.

---

## 2. Current State Analysis

### What Exists

| Component | Source Data | Target Column | Status |
|-----------|-------------|---------------|--------|
| AIFeedbackLoop | `insight_feedback` table (Very true / Not me) | `behavioral_patterns.confidence` | Active — adjusts ALL patterns globally ±0.1 / −0.15 |
| DecisionLearningService | `decision_outcomes.impact` | `behavioral_patterns.confidence` | Active — adjusts relevant patterns only ±0.01 capped, alpha=0.1 blended |
| recordDecision() | None | `decision_log.twin_recommendation_quality` | Null — no evidence available at call time |
| recordOutcome() | User feedback + impact enum | `decision_outcomes.*` | Active — captures outcome quality, lessons, feedback text |

### Database Schema Reference

```sql
-- From supabase/migrations/041_add_twin_recommendation_quality.sql
ALTER TABLE public.decision_log 
ADD COLUMN IF NOT EXISTS twin_recommendation_quality FLOAT NULL 
CHECK (twin_recommendation_quality IS NULL OR (twin_recommendation_quality >= 0 AND twin_recommendation_quality <= 1));

COMMENT ON COLUMN public.decision_log.twin_recommendation_quality = 'Quality score of Twin''s recommendation (0-1). Null if not assessed. Distinct from outcome quality.';

CREATE INDEX IF NOT EXISTS idx_decision_log_rec_quality ON public.decision_log(twin_recommendation_quality) WHERE twin_recommendation_quality IS NOT NULL;
```

### TypeScript Type Reference

```typescript
// From src/types/decision.ts line 24
export interface Decision {
  // ... other fields
  twinRecommendationQuality?: number; // 0-1: Quality of Twin's recommendation (Phase E Step 2C)
}

// From src/services/DecisionService.ts line 31
function mapDecisionRow(row: any): Decision {
  return {
    // ... other mappings
    twinRecommendationQuality: row.twin_recommendation_quality, // Safe null mapping
  };
}
```

### Gap Summary

- Column EXISTS (migration 041 applied)
- Type EXISTS (Decision interface updated)
- Mapper EXISTS (DecisionService.mapDecisionRow handles null)
- Query keys MATCHED (DecisionService.recordOutcome invalidates personalContext cache by twin_id)
- WRITER DOES NOT EXIST — `twin_recommendation_quality` is perpetually NULL

---

## 3. Evidence Source Design

### Primary Candidate: Explicit Post-Outcome User Feedback About Twin's Advice

#### 3.1 What Is Being Measured

The user's direct assessment of the Twin's **recommendation** at the moment they report an outcome. This occurs at the follow-up checkpoint, when the user already knows both:
- What the Twin recommended
- What the outcome actually was

The measurement asks: "How good was the Twin's advice?", not "Did you make a good decision?" or "Was the outcome positive?"

#### 3.2 Timing of Feedback Collection

Feedback is collected during the outcome recording flow:

1. Follow-up checkpoint is due (day 30, 90, 180, or 365)
2. User reviews the original decision (question + Twin recommendation + user choice)
3. User provides outcome (feedback text + impact: positive/neutral/negative + lessons)
4. **NEW: Before final submission, ask for Twin advice quality rating**

This timing ensures the user has:
- Full recall of the recommendation
- Knowledge of the outcome
- Distance from the original decision to allow honest reflection

#### 3.3 Linkage Chain

Each piece of feedback links explicitly to:

```
twin_advice_rating → decision_id → twin_recommendation + question + options + user_choice
                      ↕
                  decision_outcomes (outcome quality)
                      ↕
                  follow_up_schedule (timing context)
```

#### 3.4 How It References the Original Recommendation

At the point of rating, display the original Twin recommendation alongside the rating UI:

```
[Original Twin Recommendation]
"Based on your history, I recommend pursuing X because..."

[What actually happened — outcome]
"You chose Y and the result was [positive/neutral/negative]"

[Rating Question]
"How helpful was the Twin's recommendation?"
○ Very unhelpful ○ Somewhat unhelpful ○ Neutral ○ Helpful ○ Very helpful
[Optional explanation — free text]
```

#### 3.5 Missing Feedback Representation

If the user skips the Twin advice quality question:
- Value remains NULL in `decision_log.twin_recommendation_quality`
- This is acceptable and expected — not all users will provide every feedback dimension
- NULL indicates "not assessed," not "no opinion" or "zero quality"

Repeated decisions without Twin advice ratings produce no data points. This is correct behavior — we do not want to manufacture data.

#### 3.6 Repeated Feedback Handling

A single decision has exactly one Twin advice quality rating:
- Collected once per follow-up checkpoint
- If multiple checkpoints fire for the same decision (e.g., day 30 then day 90), each produces a new rating
- Ratings are stored per-decision, not per-checkpoint, so subsequent updates overwrite the previous value

This design choice reflects that Twin advice quality should be evaluated against the best-available outcome knowledge, not diluted across multiple partial evaluations.

Implementation: Use `ON CONFLICT (decision_id) DO UPDATE` to ensure idempotent writes. Each new rating replaces the previous one rather than appending.

#### 3.7 Preventing Accidental or Ambiguous Linkage

Guardrails:
- Rating is scoped exclusively to `decision_id` — cannot link to wrong recommendation
- The decision record includes the Twin recommendation text, providing a visual reference during rating
- Timestamps prevent retroactive application to decisions outside the current session
- Database constraint: `CHECK (twin_recommendation_quality IS NULL OR (twin_recommendation_quality >= 0 AND twin_recommendation_quality <= 1))` prevents out-of-range values
- Type system: `twinRecommendationQuality?` is optional, so consumers handle undefined gracefully

---

## 4. Data Model

### 4.1 Minimum Required Fields

| Field | Source | Datatype | Valid Range | Nullable | Description |
|-------|--------|----------|-------------|----------|-------------|
| `id` | Generated | UUID | N/A | No | Primary key |
| `decision_id` | FK linkage | UUID | N/A | No | Links to `decision_log.id` ON DELETE CASCADE |
| `value` | User input | FLOAT | 0.0 – 1.0 | Yes | Normalized rating score |
| `rating_label` | User selection | VARCHAR(32) | enumerated | Yes | Human-readable label for analytics |
| `explanation` | User free text | TEXT | N/A | Yes | Optional elaboration |
| `provenance` | System-generated | ENUM | `'explicit_rating' \| 'future_migration'` | No | Indicates how the value was produced |
| `created_at` | System timestamp | TIMESTAMPTZ | ISO 8601 | No | When this rating was recorded |
| `updated_at` | System timestamp | TIMESTAMPTZ | ISO 8601 | No | Last modification time |

### 4.2 Cardinality

- One rating per `decision_id` (enforced by ON CONFLICT upsert)
- Multiple decisions may exist per Twin user
- Rating is scoped to the specific Twin recommendation within that decision
- Outcomes and ratings share the same decision scope but are independent measurements

### 4.3 Provenance Enum

Purpose: Track how values were produced. Prevents confusion between human-provided ratings and future automated scoring.

Initial state: Only `'explicit_rating'` exists. Any future automated scoring would use `'automated_inference'` with strict documentation that such values are estimates, not ground truth.

### 4.4 Rating Scale Mapping

| UI Label | Numeric Value | Semantic Meaning |
|----------|---------------|------------------|
| Very unhelpful | 0.15 | Twin's advice was misleading or irrelevant |
| Somewhat unhelpful | 0.35 | Twin's advice had merit but missed the mark |
| Neutral | 0.50 | Twin's advice was neither helpful nor harmful |
| Helpful | 0.70 | Twin's advice was useful and actionable |
| Very helpful | 0.90 | Twin's advice was excellent and accurate |

Range centering at 0.50 (neutral) allows bidirectional movement. The ±0.4 span prevents ceiling/floor clustering.

---

## 5. Scoring Semantics

### 5.1 What `twin_recommendation_quality` MEANS

"The user's assessment, at follow-up checkpoint, of how useful and accurate the Twin's recommendation was as advice."

It answers: "Knowing what happened, was the Twin right to suggest X?"

### 5.2 What `twin_recommendation_quality` Does NOT Mean

| Concept | Why It's Different | Already Measured By |
|---------|-------------------|---------------------|
| Outcome quality | Outcome ≠ advice. A bad recommendation can lead to a good outcome (luck). Good recommendations can fail (circumstances beyond control.) | `decision_outcomes.impact` |
| Decision quality | Decision quality = user's own judgment of their choice. Twin advice quality = user's judgment of the Twin's input. | Not directly measured |
| User satisfaction with result | Satisfaction is emotional. Advice quality is analytical. | Not measured |
| Pattern confidence | Pattern confidence = statistical evidence that a behavioral trait exists. Advice quality = evaluation of a specific suggestion. | `behavioral_patterns.confidence` |
| AI accuracy | AI accuracy requires a gold standard. No external rubric exists for personalized advice. | Not measurable yet |

### 5.3 Aggregation Rules (Future, Not Implemented)

If multiple feedback events eventually become possible (e.g., per-option ratings within a single decision):

1. **Simple average** — first proposal. Equal weight per event.
2. **Time-weighted** — more recent ratings weighted higher. Requires temporal decay function.
3. **Count-based threshold** — require N ratings before publishing. Requires minimum sample size policy.

None implemented. Placeholder description only.

---

## 6. UX / Flow Proposal

### Option A — Minimal Explicit Rating

**Interaction:** After recording outcome impact, show a 5-point Likert scale:

```
How helpful was the Twin's recommendation?

○ Very unhelpful ○ Somewhat unhelpful ○ Neutral ○ Helpful ○ Very helpful

[Skip] [Submit]
```

**Trade-off Analysis:**

| Dimension | Assessment |
|-----------|------------|
| Data quality | High clarity, low resolution. Captures directional sentiment but loses nuance. |
| User friction | Minimal. Adds ~3 seconds to outcome recording flow. One additional tap. |
| Implementation complexity | Low. Single select field mapped to numeric range. Stored in existing `twin_recommendation_quality` column. |
| Linkage reliability | Perfect. Rating is embedded in the outcome recording modal — impossible to decouple from the decision. |
| Future analytical value | Moderate. Sufficient for aggregate trend analysis. Insufficient for detailed diagnostic breakdown. |

### Option B — Rating + Optional Explanation

**Interaction:** After recording outcome impact, show a rating prompt plus optional free-text box:

```
How helpful was the Twin's recommendation?

○ Very unhelpful ○ Somewhat unhelpful ○ Neutral ○ Helpful ○ Very helpful

Why? (optional)
┌─────────────────────────────────────────────┐
│                                              │
│                                              │
└─────────────────────────────────────────────┘

[Skip] [Submit]
```

**Trade-off Analysis:**

| Dimension | Assessment |
|-----------|------------|
| Data quality | Higher. Free text reveals WHY advice was good/bad. Enables pattern correlation (e.g., "Twin consistently over-emphasizes career vs relationships"). |
| User friction | Moderate. Requires reading comprehension and typing willingness. May reduce completion rate. |
| Implementation complexity | Medium. Need textarea component, character limit enforcement, storage for free text. Analysis of text content requires future effort. |
| Linkage reliability | Same as Option A. Explanation accompanies the rating in the same form submission. |
| Future analytical value | High. Text enables qualitative insight extraction. Could feed into pattern refinement or Twin coaching. |

### Comparative Summary

| Criterion | Option A (Rating Only) | Option B (+ Explanation) |
|-----------|----------------------|--------------------------|
| Completion rate | Higher (estimated 70-80%) | Lower (estimated 50-65%) |
| Per-record utility | Low-Medium (one number) | High (number + context) |
| Storage cost | Negligible (FLOAT + VARCHAR) | Low (FLOAT + TEXT) |
| Analysis complexity | Simple (aggregate mean/median) | Complex (requires NLP or manual review) |
| User burden | ~3 seconds extra | ~15-30 seconds extra |
| Risk of abandonment | Very low | Low-Medium (form fatigue) |

Both options satisfy integrity rules. Neither violates data purity constraints. Choice depends on stakeholder preference for breadth vs depth.

---

## 7. Integrity Rules

### Prohibited Actions

The following actions are strictly forbidden for `twin_recommendation_quality`:

| # | Prohibition | Rationale |
|---|-------------|-----------|
| 1 | Fabricate recommendation scores | No valid evidence source exists outside explicit user rating |
| 2 | Use heuristic proxy scoring | Content length, context presence, option count, or any derived metric does not measure advice quality |
| 3 | Infer from outcome quality | Positive outcome ≠ good advice. Negative outcome ≠ bad advice |
| 4 | Assume recommendation compliance | User may reject Twin advice and choose differently. Compliance status is orthogonal to advice quality |
| 5 | Assign feedback to wrong recommendation | Ratings must be scoped to `decision_id`. Cannot reuse ratings across decisions or Twins |
| 6 | Silently overwrite historical feedback without provenance | Each update preserves `created_at`; only `updated_at` changes. Provenance field tracks origin method |
| 7 | Populate from AIFeedbackLoop | AIFeedbackLoop measures insight validation, not Twin advice quality. Different signal, different table |
| 8 | Populate from DecisionLearningService outcomes | DecisionLearningService measures outcome ratios, not Twin advice evaluation |

### Allowed Actions

| # | Action | Constraint |
|---|--------|-----------|
| 1 | Accept NULL | Default state until explicit rating is provided |
| 2 | Update with user rating | Must pass `twin_recommendation_quality` validation check (0–1) |
| 3 | Store explanation text | Separate column, optional, never used as fallback for missing rating |
| 4 | Query non-null values | Filtered index `idx_decision_log_rec_quality` supports efficient queries |

---

## 8. Scope Boundaries

### In Scope for Batch D

1. Database extension: New column `twin_advice_quality` in `decision_outcomes` (or restructure approach)
2. Migration file creation with proper constraints and indexing
3. TypeScript type additions
4. UX component for rating input at outcome recording flow
5. Service layer for persisting rating
6. Cache invalidation coordination
7. Provenance tracking

### Out of Scope for Batch D

1. Automated inference engine (no AI-based quality prediction)
2. Aggregate dashboard or analytics page
3. Twin system prompt integration based on advice quality scores
4. AIFeedbackLoop integration with advice quality
5. C2.1 world_context[] enrichment
6. C2.2 audit log

### Future Considerations (Not Planned)

1. Multi-language support for explanation text
2. Trend visualization in Twin profile
3. Adaptive Twin behavior based on low advice quality scores
4. Cross-Twin comparison (multiple twins, same user)

# Learning Signal Ownership Contract — Personal Intelligence Learning Loop

**Date:** 2 October 2026  
**Scope:** AIFeedbackLoop ↔ DecisionLearningService coordination on `behavioral_patterns.confidence`

---

## OVERVIEW

Two independent learning pathways both write to the same database column (`behavioral_patterns.confidence`) but use different signals, adjustment strategies, and scopes. This document defines their ownership boundaries and coordination rules.

```
                          ┌──────────────────────┐
                          │  behavioral_patterns   │
                          │  .confidence [0-1]    │
                          └──────────┬───────────┘
                         ↗              ↖
               +0.1 / -0.15           +(-0.01..+0.01) capped
        Weighted average (alpha=0.1)
      ┌──────────────┐          ┌──────────────────┐
      │AIFeedbackLoop│          │DecisionLearningSv│
      │(immediate)   │          │(delayed outcome) │
      └──────────────┘          └──────────────────┘
```

---

## AIFeedbackLoop — Immediate Feedback

| Property | Value |
|----------|-------|
| **Function** | `updatePatternConfidence(userId, analysis)` |
| **Trigger** | User rates AI insight feedback (Very True / Somewhat / Not Sure / Not Me) via `FeedbackWidget → recordFeedback()` |
| **Data source** | `insight_feedback` table entries per user |
| **Signal meaning** | "User validates/rejects this AI's insights about them" |
| **Scope** | **ALL** behavioral_patterns for the user — no world filtering or relevance check |
| **Adjustment magnitude** | +0.1 when very_true > 70%, −0.15 when not_me > 40% |
| **Bounded?** | Yes — `Math.max(0, Math.min(confidence, 1))` per pattern |
| **Per-call cap?** | No — can adjust up to ±0.15 per call |
| **Deterministic?** | Yes |
| **Idempotent?** | Partially — repeated calibration with same feedback distribution converges toward equilibrium (very_true → confidence increases, not_me → decreases) |
| **Timing** | Fires immediately after `recordFeedback()` completes (async, non-blocking), typically during active chat sessions |
| **File** | `src/lib/intelligence/AIFeedbackLoop.ts:438–491` |
| **Owner** | Synchronous feedback from the user about the AI's self-assessment of the user |

### Critical observation

AIFeedbackLoop adjusts ALL patterns uniformly based on global feedback distribution. It does NOT filter by pattern-topic relevance or world matching. A positive feedback signal in one life domain boosts confidence in ALL patterns regardless of whether the feedback is related to those patterns.

This is a known limitation that was accepted in the original design because:
1. The feedback system measures "accuracy of AI's understanding of THIS USER" globally
2. If the AI understands the user better overall, it may be correct about more things
3. Individual pattern confidence should reflect general model accuracy vs specific pattern validation

**Risk:** When combined with DecisionLearningService (which DOES filter by relevance), both can modify the same patterns. If AIFeedbackLoop fires first (+0.1), then DecisionLearningService recalculates a conservative update based on outcomes, they partially cancel each other. The weighted average formula (alpha=0.1) dampens rapid oscillations from conflicting signals.

---

## DecisionLearningService — Delayed Outcome Learning

| Property | Value |
|----------|-------|
| **Function** | `updatePatternsFromOutcome(twinId, world)` |
| **Trigger** | User records decision outcome at follow-up checkpoint (30/90/180/365 days after decision) |
| **Data source** | `decision_outcomes` table linked to `decision_log` entries |
| **Signal meaning** | "User's actual outcome from decisions in this world" — weak directional indicator, NOT proof of pattern validity |
| **Scope** | Only patterns matching the world via explicit metadata OR name correlation |
| **Adjustment magnitude** | ±0.01 MAXIMUM per call (capped), blended via weighted average alpha=0.1 |
| **Bounded?** | Yes — explicit clamp to [0, 1] |
| **Per-call cap?** | Yes — ±0.01 maximum |
| **Deterministic?** | Yes (after GAP-02/GAP-04 remediation, no Math.random()) |
| **Idempotent?** | Convergent — repeated calls with same data approach equilibrium where oldConfidence = signal |
| **Timing** | Fires asynchronously from `recordOutcome()`, typically hours/days/weeks/months after the decision, separated from immediate feedback window |
| **File** | `src/services/DecisionLearningService.ts:252–382` |
| **Owner** | Asynchronous learning from user's REAL outcomes, decoupled from model self-assessment |

### Key distinction

DecisionLearningService intentionally produces only WEAK signals (max ±0.01/call, alpha=0.1 blending) because:
1. Single outcomes cannot prove/disprove long-term behavioral patterns
2. Positive outcome ≠ good decision (good luck ≠ good judgment)
3. Negative outcome ≠ bad decision (bad circumstances ≠ bad choice)
4. Historical confidence (from accumulated evidence) should dominate over single-signal updates

---

## COORDINATION RULES

### Rule 1: Separate Triggers, Separate Signals
- AIFeedbackLoop responds to IMMEDIATE feedback about INSIGHT accuracy
- DecisionLearningService responds to DELAYED outcomes about DECISION quality
- They operate on fundamentally different time scales (minutes vs months)
- Normal operation will rarely see both fire simultaneously

### Rule 2: Overlap Is Intentional
Both pathways legitimately affect `behavioral_patterns.confidence`:
- AIFeedbackLoop: "The user says our analysis is accurate → increase confidence across all patterns"
- DecisionLearningService: "The user's decisions show positive/negative outcomes in this world → slightly adjust relevant patterns"

### Rule 3: Damping Prevents Harmful Oscillation
The weighted average formula `newConfidence = (1 - α) * oldConfidence + α * signal` with α=0.1 means:
- 90% historical confidence + 10% new signal
- Even with both pathways firing, each contributes at most ~10% influence
- Rapid oscillation between contradictory signals is suppressed

### Rule 4: AIFeedbackLoop Adjustment Limits
AIFeedbackLoop uses larger raw adjustments (+0.1/−0.15) without per-call caps like DecisionLearningService. However:
- Total impact is limited by the 0–1 boundary (already-bounded values accept smaller absolute changes)
- Patterns at extremes (near 0 or 1) naturally resist further change
- The absence of a per-call cap reflects that AIFeedbackLoop operates at a GLOBAL level (feedback about ALL patterns), so larger shifts are justified

---

## SEMANTIC DISTINCTIONS (Must Not Be Confused)

| Concept | Source | Scale | Meaning | Who Measures |
|---------|--------|-------|---------|--------------|
| **Pattern Confidence** | `behavioral_patterns.confidence` | 0–1 | Evidence strength that THIS pattern exists for THIS user | System algorithms (AIFeedbackLoop + DecisionLearningService) |
| **Decision Quality** | To-be-determined field | Unknown | How well-considered the decision process was | Twin/DecisionIntelligenceEngine at decision time |
| **Twin Recommendation Quality** | `decision_log.twin_recommendation_quality` | 0–1 | How helpful/sound was Twin's advice? | TBD — requires dedicated assessment mechanism |
| **Outcome Quality** | `decision_outcomes.impact` | enum | What ACTUALLY happened (positive/neutral/negative) | User at follow-up checkpoint |

**Critical principle:** Good outcome ≠ good decision ≠ good recommendation ≠ high pattern confidence. These measure completely different things.

---

## KNOWN ISSUES (Future Work)

### Issue 1: AIFeedbackLoop Has No Relevance Filtering
AIFeedflowLoop adjusts ALL patterns uniformly. If this becomes problematic (user feedback about one life area affecting unrelated patterns), consider adding world/metadata filtering similar to DecisionLearningService.

### Issue 2: No Explicit Coordination Between Pathways
While damping prevents harm, there is no explicit awareness between the two systems. If both try to adjust the same row concurrently, the last-write-wins behavior is acceptable given the low-frequency nature of these updates.

### Issue 3: AIFeedbackLoop Uses Absolute Thresholds
The thresholds (very_true > 70%, not_me > 40%) are hardcoded and apply equally regardless of total feedback count. With only 2 feedback entries, 2 very_true ratings triggers the +0.1 boost — statistically weak evidence. Consider requiring minimum sample sizes before applying adjustments.

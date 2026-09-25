# SELFPRINT V3 Architecture

**Version:** Phase A  
**Last Updated:** 2026-08-25  
**Status:** Production Ready ✅

---

## Quick Summary

SELFPRINT V3 is a personal intelligence platform where users create "Twins" - AI companions. Phase A removed ALL hardcoded numeric defaults.

**Key Achievement:** 
- maturityScore: 30 → 10-100 (calculated)
- SICE scores: 50 → 20-100 (calculated)
- Visual DNA: ephemeral → persisted to DB

---

## System Overview

```
CLIENT (React 18)
    ↓
SERVICES (DynamicValueCalculator, VisualDNAService, SICE, etc.)
    ↓
DATABASE (Supabase PostgreSQL with RLS)
    ├─ twins (Master record)
    ├─ twin_visual_dna (A.1: NEW visual persistence)
    ├─ twin_sice_scores (A.1: Dynamic baseline)
    └─ 15+ supporting tables
```

---

## Phase A.1: What Changed

### Maturity Score (CoreAwakeningService:298)

**Before:** `maturityScore = 30` (hardcoded)  
**After:** `calculateMaturityScore({ analysis metrics })` → 10-100  
**Logic:**
1. Use SICE userUnderstanding if available
2. Calculate from: insight count, analysis depth, coherence
3. Average components
4. Fallback: 10 (not 30) for new Twins

### SICE Baseline Scores (CoreAwakeningService:351)

**Before:** `contribution_score: 50` (hardcoded per engine)  
**After:** `calculateSICEEngineScore({ engineName, confidence, depth })` → 20-100  
**Logic:**
1. Use engine confidence if available
2. Calculate from: userUnderstanding + analysisDepth
3. Average
4. Fallback: 20 (not 50) if no data

### Visual DNA Persistence (VisualDNAService)

**Before:** Ephemeral (generated fresh each load)  
**After:** Persisted in twin_visual_dna table  
**Generation:** Deterministic from birthDate + archetypes  
**Result:** Same Twin always looks identical

---

## Twin Birth Flow (2.4s)

```
1. SICE Orchestration (1.0-1.2s)
   ├─ 12 engines run in parallel
   └─ Extract: userUnderstanding, insights

2. Calculate Dynamic Values (0.1s)
   ├─ calculateMaturityScore() → 10-100
   ├─ calculateSICEEngineScore() → per engine
   └─ generateVisualDNA() → Deterministic

3. Create Twin in DB (0.1s)
   └─ Insert with calculated values

4. Parallel Persistence (0.4-0.5s)
   ├─ Save SICE scores (from calculator)
   ├─ Save Visual DNA (from generator)
   ├─ Save memory
   ├─ Mark essence used
   └─ Update context
   
TOTAL: 2.4s ✅
```

---

## Database Schema (Phase A Focus)

### twin_visual_dna (NEW in A.1)

```sql
├─ id (UUID, PK)
├─ twin_id (FK twins, UNIQUE)
├─ user_id (FK auth.users)
├─ color_primary (hex)
├─ color_secondary (hex)
├─ color_accent (hex)
├─ visual_style (enum)
├─ accessories (JSONB)
├─ base_expression (enum)
├─ visual_metadata (JSONB)
└─ RLS: Users see only own Twin
```

### twins (Modified in A.1)

```sql
├─ maturity_score (0-100, CALCULATED not hardcoded)
├─ primary_archetype (calculated from DOB)
├─ secondary_archetype (calculated from essence)
└─ RLS: User-scoped access
```

### twin_sice_scores (Modified in A.1)

```sql
├─ contribution_score (0-100, CALCULATED not hardcoded)
└─ RLS: Linked to Twin's user
```

---

## Migration Strategy

**Execution:** Alphabetical order (Supabase auto-executes)

```
001_core_schema
002_decision_tables
...
004_twin_visual_dna (A.1 NEW)
...
032_final_schema
```

---

## Performance Baseline

| Metric | Result | Target |
|--------|--------|--------|
| Twin Creation | 2.4s | <3s ✅ |
| Visual DNA Retrieval | <50ms | <100ms ✅ |
| World Rendering | 2.2-2.6s | <3s ✅ |
| E2E Tests Passing | 28/28 | 100% ✅ |
| Performance Regression | 0% | 0% ✅ |

---

## Security (RLS on Every Table)

```sql
-- Example
CREATE POLICY "users_view_own_visual_dna" 
  ON twin_visual_dna
  FOR SELECT USING (auth.uid() = user_id);

-- Result: Complete cross-user isolation
```

---

**Status:** Phase A Production Ready ✅

---

## v3 Phase 1–3 Additions (2026-09-25)

> Added by TC-313 to record the Living Diagram / unified pipeline / AEO-GEO / rollout layers on top of the Phase A architecture above. Source of truth for task-level decisions remains MASTER_PLAN.md.

### Feature Flags & Rollout (TC-001, TC-305)

- `src/lib/featureFlags.tsx` gates every new surface: `LIVING_DIAGRAM`, `UNIFIED_PIPELINE`, `NO_ASTRO_LANG`.
- Rollout is percentage-based: deterministic visitor bucket = `hashString(sp_visitor_id) % 100`. A flag enables when the explicit env var is `"true"`, else when bucket < `VITE_FEATURE_*_ROLLOUT`.
- Release state (TC-304/305): default rollout = 100% — `LIVING_DIAGRAM` and `UNIFIED_PIPELINE` are ON by default; rollback = set the explicit flag env to `"false"` (instant, flag-gated).
- Monitoring hook: `flagBucket()` exposes the visitor bucket for analytics.

### Living Diagram Layer (TC-101..103, TC-301/302/303)

```
src/components/living/
├── SVGCore.tsx          pure parameterized SVG (viewBox 480×520) — phases, DNA shape, scores polygon, confidence arc
├── LivingDiagram.tsx    wrapper + 3 drivers (landing ScrollDriver / onboarding StepDriver / dashboard DataDriver)
│                        + mobile bottom sheet (TC-301) + sticky shell + a11y (role=section, aria-expanded)
└── living-diagram.css   sheet/toggle/sticky media queries + reduced-motion
```

- DNA (TC-101, `twinVisualDNA.ts` + `hash.ts`): deterministic per (dob,time,place,userId); hsl-only colors — token gate enforced by tests + `check:tokens`.
- Performance (TC-302): IntersectionObserver mount-gating (`rootMargin: '100% 0px'`), aspect-ratio container (no CLS), `contain: layout style paint` on the shell.
- Accessibility (TC-303): `prefers-reduced-motion` → static render, `role="section"`/`aria-label` on shell, `role="img"`+`aria-label` on the SVG, sheet toggle with `aria-expanded`/`aria-controls`.

### Unified Pipeline (TC-201..205)

```
src/lib/analysis/AnalysisEngine.ts  60/40 merge of previous + new input
src/store/twinStore.ts              layers v1_landing / v2_onboarding / v3_living + evolutionLog (cap 50)
src/lib/analysis/VersionManager.ts  no-downgrade triggers from real signals
src/hooks/useTwinInput.ts           accumulate/reanalyze accumulator
```

- Version confidence: v1=20% → v2=65% → v3=85% (unit-tested).
- Dashboard reads `twinStore.current` when `UNIFIED_PIPELINE` is enabled.

### AEO / GEO Schema Layer (TC-109..111, 207, 209..211, 306..311)

- `src/lib/schemas.ts` — typed Schema.org builders + `ENTITY_DICTIONARY` + `createAIContentBlock` (GEO).
- `src/lib/aeoSchemas.ts` — page composites: Landing (HowTo+Speakable), Onboarding (QAPage), Dashboard (SoftwareApplication), DailyBrief (Speakable + AIContentBlock per insight), Blog (BlogPosting+citations), Science (TechArticle+ScholarlyArticle), Pricing (Product+Offer+AggregateRating), FAQ (FAQPage+QAPage dual), About (Organization+Person), Contact (ContactPage+LocalBusiness).
- `src/lib/geo/Fact.ts` — fact/citation building linked to `ENTITY_DICTIONARY`.

### Dead Code Removal (TC-304)

- `EvolutionaryVisualSystem.tsx` removed at 100% rollout. Landing now always renders `LivingDiagram` (flag still available for rollback).

### CI / Gates (TC-312)

- Node 22 across all workflows (NODE-22-001); gates run repo scripts (`check:astro`, `check:tokens`, `check:master-plan`).
- `lighthouse-ci.yml` — thresholds Perf≥90, A11y≥95, Best Practices≥90, SEO≥95 against `selfprint-staging.pages.dev`.

---

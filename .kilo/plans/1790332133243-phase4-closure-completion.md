# Phase 4+ Plan: Complete Closure Book Domains (A–AE)

**Version:** 4.0 | **Created:** 2026-09-26 | **Status:** PLANNING  
**Baseline:** Phase 0-3 COMPLETE (MASTER_PLAN v3.0)  
**Target:** 100% Closure Book (29/29 domains CLOSED)

---

## 🎯 Objective

Extend MASTER_PLAN with **Phase 4, 5, 6** to achieve **100% Closure Book completion** (29/29 domains CLOSED).

**Current State:** 14/29 CLOSED, 6 PARTIAL, 3 MISSING  
**Target State:** 29/29 CLOSED

---

## 📋 Domain Gap Analysis

| Domain | Status | Gap Summary |
|--------|--------|-------------|
| **G** Twin Birth | ❌ MISSING | Routes `/twin-birth`, `/twin/:id`, `/twin/patterns` + birth flow |
| **Q** Decision | ❌ MISSING | Form, persistence, compare, export, AI insight SLA |
| **R** Worlds | ❌ MISSING | 12 Worlds visual tiles, detail views, E2E |
| **H** Living Twin | ⚠️ PARTIAL | Memory/evolution UI, real-time sync |
| **K** Memory | ⚠️ PARTIAL | Memory UI, insights, retrieval UI |
| **L** Evolution | ⚠️ PARTIAL | Visualization, history timeline, triggers |
| **S** Dashboard | ⚠️ PARTIAL | Decision/World/Memory panels (moved to IntelligenceHub) |
| **U** Auth | ⚠️ PARTIAL | Session persistence for decision/world routes |
| **AE** Testing | ⚠️ PARTIAL | Negative cases, mobile E2E, missing test IDs |

---

## 🗺️ Phase 4+ Roadmap

### Phase 4: Core Missing Domains (P0) — Twin Birth, Decision, Worlds Core
**Duration:** 3-4 sprints | **Priority:** P0

| TC | Domain | Title | Key Deliverables |
|----|--------|-------|------------------|
| TC-401 | G | Twin Birth Routes | `/twin-birth` (core awakening UI), `/twin/:id` (profile + DNA), `/twin/patterns` (behavioral patterns) |
| TC-402 | G | Twin Birth Flow | CoreAwakening → TwinBirth transition, persistence, reload recovery |
| TC-403 | Q | Decision Core | Decision form (context + Twin context), persistence (Supabase), history |
| TC-404 | Q | Decision Intelligence | Compare alternatives, tradeoffs analysis, AI insight SLA |
| TC-405 | Q | Decision Export | CSV/JSON export, shareable links |
| TC-406 | R | Worlds Visual Layer | 12 World tiles (WorldsHub), WorldDetail page with intelligence panels |
| TC-407 | R | World-Twin Integration | World-specific intelligence, Twin relationship, data input per world |
| TC-408 | R | Worlds E2E | E2E tests for all 12 worlds navigation + detail |

**Phase 4 Gate:**
- [ ] Twin Birth routes accessible + functional
- [ ] Decision form → persistence → history working
- [ ] 12 Worlds tiles + detail views navigable
- [ ] All Phase 4 E2E tests PASS

---

### Phase 5: Living Twin Completion (P1) — Memory, Evolution, Dashboard, Auth
**Duration:** 2-3 sprints | **Priority:** P1

| TC | Domain | Title | Key Deliverables |
|----|--------|-------|------------------|
| TC-501 | H | Living Twin Memory UI | Memory panel in LivingTwin, real-time insights display |
| TC-502 | H | Living Twin Evolution UI | Evolution timeline, trigger visualization, version diff |
| TC-503 | K | Memory Insights UI | Memory retrieval UI, relevance scoring, context injection preview |
| TC-504 | L | Evolution Visualization | Timeline component, trigger attribution, version comparison |
| TC-505 | S | Dashboard Panels | Decision/World/Memory panels restored in Dashboard (or IntelligenceHub integration) |
| TC-506 | U | Session Persistence | Decision/World route session restoration, auth state sync |
| TC-507 | AE | Test Infrastructure | Mobile E2E suite, negative test cases, test ID coverage audit |

**Phase 5 Gate:**
- [ ] LivingTwin shows memory + evolution UI
- [ ] Memory insights accessible from Twin UI
- [ ] Evolution timeline + triggers visible
- [ ] Dashboard/IntelligenceHub has all panels
- [ ] Auth persists across decision/world routes
- [ ] Mobile E2E + negative tests PASS

---

### Phase 6: Polish & Final Closure (P2) — Edge Cases, Performance, Final Gates
**Duration:** 1-2 sprints | **Priority:** P2

| TC | Domain | Title | Key Deliverables |
|----|--------|-------|------------------|
| TC-601 | All | Cross-domain Integration Tests | End-to-end flows: Birth → Memory → Evolution → Decision → Worlds |
| TC-602 | All | Negative/Edge Case Coverage | Auth boundaries, empty states, error boundaries, network failures |
| TC-603 | AE | Mobile E2E Full Suite | Touch targets, scroll behavior, PWA offline, viewport handling |
| TC-604 | All | Performance Baselines | LCP < 2.5s all pages, TBT < 150ms, bundle size audit |
| TC-605 | All | Final Security Audit | RLS verification, auth boundaries, secret scanning, rate limits |
| TC-606 | All | Documentation Final Sync | All specs v1.2+, CHANGELOG complete, API docs, DB docs |
| TC-607 | All | Final Closure Gates | All 8 Gates PASS, 29/29 domains CLOSED, sign-off |

**Phase 6 Gate (Final Closure):**
- [ ] All 29 domains CLOSED
- [ ] All 8 Gates PASS
- [ ] Cross-domain E2E PASS
- [ ] Performance targets met
- [ ] Security audit PASS
- [ ] Documentation 100% synced
- [ ] Product Owner sign-off

---

## 🔗 Cross-Phase Dependencies

```
Phase 4 (Twin Birth, Decision, Worlds Core)
    ↓
Phase 5 (Living Twin UI, Memory, Evolution, Dashboard, Auth, Testing)
    ↓
Phase 6 (Integration, Polish, Final Gates)
```

**Critical Path:** Twin Birth (G) → Decision (Q) → Worlds (R) must complete before Living Twin UI (H/K/L) can fully integrate.

---

## 🏗️ Technical Architecture Decisions Needed

### 1. Twin Birth Route Architecture
- **Option A:** New route `/twin-birth` with CoreAwakening integration
- **Option B:** Modal/stepper within Onboarding flow
- **Decision needed:** Route structure, state management, DNA persistence timing

### 2. Decision Domain Data Model
- **Tables needed:** `decisions`, `decision_options`, `decision_outcomes`, `decision_insights`
- **RLS policies:** User isolation + Twin context
- **API endpoints:** POST/GET/PUT `/api/decisions`, `/api/decisions/:id/compare`

### 3. Worlds Visual Architecture
- **Components:** WorldTile, WorldDetail, WorldIntelligencePanel
- **Data:** `constants/worlds.ts` → dynamic intelligence per world
- **Twin Integration:** World-specific Twin context, memory scoping

### 4. Living Twin UI Architecture
- **Components:** MemoryPanel, EvolutionTimeline, InsightCards
- **State:** TwinStore extensions for UI state
- **Real-time:** Supabase Realtime for memory/evolution updates

### 5. Auth Session Persistence
- **Scope:** Decision/World routes require auth state
- **Implementation:** Supabase auth state + custom session storage
- **Recovery:** Automatic redirect + state restoration

---

## 🧪 Validation Strategy Per Phase

### Phase 4 Validation
```bash
# Unit tests
npm test -- src/lib/twinBirth/ src/lib/decision/ src/components/worlds/

# E2E tests
npx playwright test e2e/twin-birth.spec.ts
npx playwright test e2e/decision.spec.ts
npx playwright test e2e/worlds.spec.ts

# Schema validation
npm run check:astro && npm run check:tokens
```

### Phase 5 Validation
```bash
# Living Twin UI tests
npm test -- src/components/living/LivingTwin/
npm test -- src/components/memory/ src/components/evolution/

# Auth persistence tests
npx playwright test e2e/auth-persistence.spec.ts

# Mobile E2E
npx playwright test --project=mobile-chromium
```

### Phase 6 Validation (Final Closure)
```bash
# Full test suite
npm run validate:all
npm run check:astro && npm run check:tokens && npm run check:master-plan

# Cross-domain E2E
npx playwright test e2e/cross-domain.spec.ts

# Performance
npm run lighthouse:ci

# Security
npm audit && npm run security:scan
```

---

## 📋 Gate Definitions for New Phases

### Phase 4 Gate → Phase 5
```
☐ TC-401..408: All tests pass + docs updated
☐ Twin Birth routes functional + E2E PASS
☐ Decision CRUD + compare + export PASS
☐ 12 Worlds tiles + detail + E2E PASS
☐ MASTER_PLAN updated with Phase 4 completion
```

### Phase 5 Gate → Phase 6
```
☐ TC-501..507: All tests pass + docs updated
☐ LivingTwin memory/evolution UI functional
☐ Memory insights UI accessible
☐ Evolution timeline + triggers visible
☐ Dashboard/IntelligenceHub panels complete
☐ Auth persistence across routes verified
☐ Mobile E2E + negative tests PASS
☐ MASTER_PLAN updated with Phase 5 completion
```

### Phase 6 Gate → Production (Final Closure)
```
☐ TC-601..607: All tests pass + docs updated
☐ All 29 domains CLOSED (verified in MASTER CLOSURE BOARD)
☐ Cross-domain E2E PASS
☐ Performance targets met (LCP<2.5s, TBT<150ms)
☐ Security audit PASS
☐ All 8 Gates PASS
☐ 29/29 domains CLOSED in MASTER CLOSURE BOARD
☐ Product Owner sign-off
☐ MASTER_PLAN v4.0 = FINAL
```

---

## 📁 New Directory Structure Additions

```
src/
├── pages/
│   ├── TwinBirthPage.tsx          # TC-401
│   ├── TwinProfileDetailPage.tsx  # TC-401
│   ├── TwinPatternsPage.tsx       # TC-401
│   ├── DecisionPage.tsx           # TC-403
│   ├── DecisionDetailPage.tsx     # TC-404
│   └── WorldDetailPage.tsx        # TC-406 (extend existing)
├── components/
│   ├── twinBirth/
│   │   ├── CoreAwakeningUI.tsx
│   │   ├── TwinBirthFlow.tsx
│   │   └── DNAVisualization.tsx
│   ├── decision/
│   │   ├── DecisionForm.tsx
│   │   ├── DecisionCompare.tsx
│   │   ├── DecisionExport.tsx
│   │   └── DecisionHistory.tsx
│   ├── worlds/
│   │   ├── WorldTile.tsx
│   │   ├── WorldDetailPanel.tsx
│   │   └── WorldIntelligence.tsx
│   ├── livingTwin/
│   │   ├── MemoryPanel.tsx
│   │   ├── EvolutionTimeline.tsx
│   │   └── InsightCards.tsx
│   ├── memory/
│   │   ├── MemoryInsights.tsx
│   │   └── MemoryRetrieval.tsx
│   └── evolution/
│       ├── EvolutionTimeline.tsx
│       └── TriggerVisualization.tsx
├── lib/
│   ├── twinBirth/
│   │   ├── twinBirthFlow.ts
│   │   └── dnaPersistence.ts
│   ├── decision/
│   │   ├── decisionEngine.ts
│   │   ├── compareEngine.ts
│   │   └── exportEngine.ts
│   └── worlds/
│       └── worldIntelligence.ts
└── hooks/
    ├── useTwinBirth.ts
    ├── useDecision.ts
    ├── useWorld.ts
    ├── useMemoryInsights.ts
    └── useEvolution.ts
```

---

## 📝 MASTER_PLAN Updates Required

1. **Version bump:** 3.0 → 4.0 (Phase 4 start)
2. **Add Phase 4, 5, 6 sections** with TC-401..607
3. **Update Phase Gate definitions** for new phases
4. **Update ACTIVE TASK CARDS** with new TCs
5. **Update CURRENT_STATE_SNAPSHOT** with new phase
6. **Update CLOSURE BOARD** in MASTER_PLAN (or reference Closure Book)
6. **Update CURRENT_STATE_SNAPSHOT** with new phase
7. **Add new Gate definitions** for Phase 4, 5, 6
8. **Update CLOSURE BOARD** tracking (29 domains)

---

## ❓ Open Questions for User

### Q1: Phase Scope Confirmation
> Should Phase 4 include **all 3 MISSING domains** (G, Q, R) or split further?
> - **Recommended:** Single Phase 4 for all 3 P0 domains (they're interdependent)

### Q2: Twin Birth UX Architecture
> **Option A:** Dedicated `/twin-birth` route with multi-step flow
> **Option B:** Integrated into Onboarding as final step
> **Option C:** Modal overlay from Dashboard
> **Recommended:** Option A (dedicated route, matches Closure Book spec)

### Q3: Decision Domain Scope
> Should Decision include **AI-powered insight generation** (calling OpenRouter) or just **structured form + manual analysis**?
> - **Recommended:** Hybrid — structured form + optional AI insight (feature-flagged)

### Q4: Worlds Visual Priority
> All 12 Worlds in Phase 4, or **core 6 first** (Identity, Career, Relationships, Health, Wealth, Purpose)?
> - **Recommended:** All 12 in Phase 4 (data exists in `constants/worlds.ts`)

### Q5: Auth Session Persistence Scope
> Should Phase 5 include **full Supabase session persistence** or **custom state restoration**?
> - **Recommended:** Supabase auth state + custom route state (localStorage)

### Q6: Testing Phase Distribution
> Move **AE (Testing)** items across phases or dedicated Testing Phase?
> - **Recommended:** Distribute — Phase 4: unit/E2E for new features, Phase 5: mobile/negative, Phase 6: integration

---

## 📌 Next Steps

1. **User confirms** Phase 4 scope and architecture decisions (Q1-Q6)
2. **Create detailed Task Cards** (TC-401..408) in `.ai/task-cards/`
3. **Update MASTER_PLAN.md** with Phase 4, 5, 6 sections
4. **Create Phase 4 Gate definition** in MASTER_PLAN
5. **Begin implementation** with TC-401 (Twin Birth routes)

---

**Plan File:** `.kilo/plans/1790332133243-phase4-closure-completion.md`
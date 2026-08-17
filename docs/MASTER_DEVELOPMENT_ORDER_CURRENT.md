# SELFPRINT V3 — MASTER DEVELOPMENT ORDER
**Global SEO/GEO & Multi-Language Architecture + Production Completion**

**Date:** 2026-08-17  
**Phase:** 1 Audit → 14-Phase Execution Plan  
**Status:** PENDING (Ready for Phase 2)

---

## 📊 **Executive Summary**

SELFPRINT V3 is **~60% complete** across core features. **6 P0 Blockers** prevent Production Ready status. This document outlines:

1. **Immediate P0 Fixes** (blocking all features)
2. **Global SEO/GEO Architecture** (append to development order)
3. **Multi-Language Support** (i18n + hreflang)
4. **14-Phase Execution Plan** (from MASTER_GAP_MATRIX)

---

## 🔴 **P0 PRODUCTION BLOCKERS** (Must fix before Production)

### P0 #1: Twin Persistence (sessionStorage → Supabase) ⚠️ IN_PROGRESS
**Files:** 
- `src/services/CoreAwakeningService.ts` (partially fixed)
- `src/components/onboarding/AICreationSequence.tsx` (sessionStorage hack at line 83-86)

**Issue:** Twin essence + personal context stored in browser sessionStorage → lost on refresh/tab close

**Blocker Impact:** Core Awakening, Twin System, Personal Intelligence  
**Effort:** 2-3 hours  
**Handoff Doc:** `/docs/P0_1_TWIN_PERSISTENCE_HANDOFF.md`

**Tasks:**
- [ ] Add `awakening_essence` table to Supabase schema
- [ ] Add `personal_contexts` table to Supabase schema
- [ ] Remove sessionStorage hack from AICreationSequence.tsx
- [ ] Link personal context to essence in CoreAwakeningService
- [ ] Write persistence tests
- [ ] Verify build + deploy

**Definition of Done:** Refresh page → Twin essence still accessible ✅

---

### P0 #2: Decision Follow-up Notifications ❌ NOT_STARTED
**File:** `src/services/FollowUpScheduler.ts:137`

**Issue:** 
```typescript
// TODO: Send notification ให้ user
return [];
```
No notifications sent for follow-up decisions (30/90/180/365 day reminders)

**Blocker Impact:** Decision Intelligence feature incomplete, User re-engagement broken  
**Effort:** 1-2 hours  
**Dependencies:** Decision Service (✅ working)

**Tasks:**
- [ ] Implement notification dispatch to NotificationService
- [ ] Test 30/90/180/365 day scheduling
- [ ] Verify push + in-app notifications sent
- [ ] Add E2E test

---

### P0 #3: Decision Learning Loop ❌ NOT_STARTED
**Files:** 
- `src/services/DecisionLearningService.ts:204`
- `src/services/DecisionService.ts:280`

**Issue:** 
- Pattern learning works ✅
- Pattern → Twin system prompt update ❌ (TODO)
- Twin doesn't learn from past decisions

**Blocker Impact:** Personal Intelligence growth blocked, Twin adaptation impossible  
**Effort:** 2-3 hours  
**Dependencies:** DecisionService, PatternDetector, TwinChat

**Tasks:**
- [ ] Implement DecisionLearningService.updateTwinSystemPrompt()
- [ ] Link pattern insights to Twin context
- [ ] Test Twin chat responds differently based on learned patterns
- [ ] Add metrics for pattern confidence

---

### P0 #4: SICE Engine Completeness ❌ 5/12 INCOMPLETE
**Status:** 60% complete (7/12 engines done, 5 incomplete or stub)

**Complete Engines (7/12):**
- ✅ PersonalContextBuilder
- ✅ PatternDetector
- ✅ InsightEngine
- ✅ AIFeedbackLoop
- ✅ MemoryManager
- ✅ BadgeEngine
- ✅ ExperienceEngine

**Incomplete/Stub Engines (5/12):**
- ❌ BehavioralForecastEngine (stub, sends mock data)
- ⚠️ FutureSelfEngine (partial)
- ⚠️ DecisionIntelligenceEngine (blocked by P0 #3)
- ⚠️ TwinStateEngine (partial)
- ⚠️ EnvironmentEngine (sku)

**Blocker Impact:** SICE quality ~40%, Missing 5 intelligence dimensions  
**Effort:** 3-4 weeks  
**Dependencies:** P0 #3 (Decision Learning), World Routing

**Tasks per Engine:**
- [ ] BehavioralForecastEngine: Implement actual forecasting (not mock)
- [ ] FutureSelfEngine: Complete scenario generation
- [ ] DecisionIntelligenceEngine: Add decision impact forecasting
- [ ] TwinStateEngine: Complete state tracking + evolution
- [ ] EnvironmentEngine: Link to experience adaptation

---

### P0 #5: World Context Routing ❌ 50% COMPLETE
**Files:**
- `src/context/WorldContext.tsx`
- `src/services/WorldExpertiseService.ts`

**Issue:** 
- 12 Worlds defined ✅
- 50% integrated (World 1: Self mostly works)
- World-aware Twin context routing incomplete

**Blocker Impact:** 12 Worlds feature unusable, Personal Intelligence not world-specific  
**Effort:** 2-3 weeks  
**Dependencies:** P0 #4 (SICE engines)

**Worlds Status:**
- World 1 (Self): 40% — Core persona analysis
- World 2 (Health): 35% — Health analysis stub
- World 3-12: 20-30% — Stub or missing

**Tasks:**
- [ ] Implement world-specific context switching
- [ ] Build expert prompts for each world (8 worlds)
- [ ] Link SICE engines to world expertise
- [ ] Test world-aware Twin responses
- [ ] UI: World navigation + world-specific dashboard

---

### P0 #6: Documentation Reconciliation ❌ 20% COMPLETE
**Current State:**
- Active docs: ~10 files (current)
- Stale docs: 266 files in `/docs/OLD/` (outdated, confusing)
- Source of truth: SELFPRINT_PROJECT_CODEX.md (exists?)

**Missing Documentation:**
- API_ARCHITECTURE.md (12 APIs locked structure)
- EDGE_ARCHITECTURE.md (Supabase Edge Functions)
- SYSTEM_ARCHITECTURE.md (Frontend ↔ API ↔ Edge ↔ DB flow)
- SICE_ARCHITECTURE.md (12 engines)
- PROJECT_STATUS.md (current state)
- PRODUCTION_CHECKLIST.md (release gate)

**Blocker Impact:** Developer onboarding impossible, Code consistency at risk  
**Effort:** 1 week  
**No Technical Dependency** (documentation only)

**Tasks:**
- [ ] Archive `/docs/OLD/` → `/docs/archive/` (or delete old docs)
- [ ] Create API_ARCHITECTURE.md (12 APIs, flow, RLS)
- [ ] Create EDGE_ARCHITECTURE.md (edge functions, serverless)
- [ ] Create SYSTEM_ARCHITECTURE.md (full diagram)
- [ ] Create SICE_ARCHITECTURE.md (12 engines, diagram)
- [ ] Update PROJECT_STATUS.md from GAP_MATRIX
- [ ] Create PRODUCTION_CHECKLIST.md (release gate)
- [ ] Link all docs from root README

---

## 🌍 **NEW: Global SEO/GEO & Multi-Language Architecture**

### Why Essential for Production
- **SEO:** Selfprint must rank for Thai + English markets
- **Market Expansion:** Support multiple languages from Day 1
- **Competitive:** Astrovera supports Thai natively → Selfprint must match
- **Monetization:** Multi-currency support unlocks regional pricing

### SEO/GEO Strategy

#### 1. Domain Structure
```
selfprint.com/          → Detect locale → redirect
selfprint.com/en/       → English (US/UK/AU/SG)
selfprint.com/th/       → Thai (TH primary market)
selfprint.co.th/        → Thai-specific domain (optional)
```

#### 2. Hreflang Tags
Every page must declare all language variants:
```html
<link rel="alternate" hreflang="en" href="https://selfprint.com/en/page" />
<link rel="alternate" hreflang="th" href="https://selfprint.com/th/page" />
<link rel="alternate" hreflang="x-default" href="https://selfprint.com/page" />
```

#### 3. i18n Architecture
- **Library:** next-intl or i18next (recommend next-intl for Next.js)
- **Storage:** Translations in `/locales/` (JSON or YAML)
- **Database:** User locale preference in user_profiles.preferred_language
- **Default:** Auto-detect from Accept-Language header, allow override

#### 4. Content Localization
Not just translation — **localization** (adapting to culture):

| Element | EN-US | TH |
|---------|-------|-----|
| Personality System | Western archetypes | Thai wisdom traditions |
| Time Format | MM/DD/YYYY | DD/MM/YYYY |
| Currency | USD | THB (฿) |
| Twin Names | English | Thai-friendly |
| Examples | Western scenarios | Thai life contexts |

#### 5. SEO Keywords by Region

**English Market:**
- "Personal intelligence platform"
- "AI life coach"
- "Decision making app"
- "Self-discovery tool"

**Thai Market (ตัวอย่าง):**
- "แพลตฟอร์มปัญญาส่วนตัว"
- "AI ที่เข้าใจคุณ"
- "เครื่องมือตัดสินใจ"
- "เพื่อนแนะนำชีวิต"

#### 6. Metadata Strategy

**Per-Language SEO:**
- [ ] Title tags (localized)
- [ ] Meta descriptions (localized)
- [ ] OG tags (language-specific images)
- [ ] Schema.org markup (@language attribute)
- [ ] Sitemap (with hreflang references)
- [ ] robots.txt (allow all languages)

### Implementation Roadmap

**Phase SEO-1 (Week 1):**
- [ ] Add next-intl to project
- [ ] Create `/locales/en/` and `/locales/th/` structure
- [ ] Translate core pages (homepage, pricing, docs)
- [ ] Add hreflang tags to all pages
- [ ] Update middleware for locale routing

**Phase SEO-2 (Week 2):**
- [ ] Create Thai-specific content (blog, guides)
- [ ] Add Thai market schema (prices in THB)
- [ ] Create Thai sitemap
- [ ] Submit to Google Search Console (both locales)
- [ ] Implement currency switching (USD ↔ THB)

**Phase SEO-3 (Week 3):**
- [ ] Translate AI prompts + system prompts (for Thai Twin)
- [ ] Localize SICE engines (Thai personality archetypes)
- [ ] Thai email templates
- [ ] Thai push notifications
- [ ] Test on Thai devices + network

**Phase SEO-4 (Week 4):**
- [ ] Monitor search rankings (both locales)
- [ ] A/B test Thai messaging
- [ ] Gather feedback from Thai beta users
- [ ] Iterate content based on engagement

### Files to Create/Modify

- [ ] Create `/locales/en.json` (EN strings)
- [ ] Create `/locales/th.json` (TH strings)
- [ ] Update `next.config.js` (i18n config)
- [ ] Update `middleware.ts` (locale routing)
- [ ] Update `app/layout.tsx` (hreflang setup)
- [ ] Update `app/page.tsx` (language selector)
- [ ] Update `supabase-schema.sql` (add `preferred_language` column)
- [ ] Create `lib/i18n.ts` (i18n helper functions)
- [ ] Create blog posts in Thai + English
- [ ] Update AI system prompts (language-aware)

### Effort Estimate
- **Implementation:** 2-3 weeks
- **Testing:** 1 week
- **Content creation:** 1-2 weeks
- **Total:** 4-5 weeks

---

## 📅 **14-PHASE EXECUTION PLAN**

(From MASTER_GAP_MATRIX lines 440-462)

### Phase 1: Architecture Audit ✅ COMPLETE
- ✅ Reviewed all 12 APIs
- ✅ Identified 6 P0 blockers
- ✅ Created GAP_MATRIX document

### Phase 2: Architecture Lock (Next)
- [ ] Finalize 12 APIs (lock structure)
- [ ] Document API purposes + flow
- [ ] Move SICE orchestration → Edge Functions
- [ ] Approve API changes with team

**Timeline:** 3 days  
**Owner:** Architecture Review

---

### Phase 3: Core Awakening Completion (P0 #1)
- [ ] Remove sessionStorage hack (P0 #1)
- [ ] Implement Twin essence persistence (Supabase)
- [ ] Add transaction safety (atomic Twin creation)
- [ ] State isolation checks

**Timeline:** 1 week  
**Owner:** Backend + Database

---

### Phase 4-6: Close P0 Blockers #2-6
- Phase 4: Decision Follow-ups (P0 #2)
- Phase 5: Decision Learning (P0 #3)
- Phase 6: SICE Engines (P0 #4)

**Timeline:** 4-5 weeks  
**Owner:** AI/ML + Backend

---

### Phase 7: World Routing (P0 #5)
- [ ] Implement 12 Worlds context
- [ ] Build world-specific prompts
- [ ] World-aware Twin personality
- [ ] World-specific UI dashboards

**Timeline:** 2-3 weeks  
**Owner:** Frontend + AI

---

### Phase 8: Documentation (P0 #6)
- [ ] Archive old docs
- [ ] Create system documentation
- [ ] API documentation
- [ ] Developer guides

**Timeline:** 1 week  
**Owner:** Tech Lead + Documentation

---

### Phase 9-10: SEO/GEO & i18n (NEW ADDITIONS)
- Phase 9: i18n infrastructure
- Phase 10: SEO implementation + Thai localization

**Timeline:** 4-5 weeks  
**Owner:** Marketing + Frontend

---

### Phase 11-12: Testing & Optimization
- [ ] Full E2E test coverage
- [ ] Performance optimization
- [ ] Security audit
- [ ] Accessibility review

**Timeline:** 2 weeks  
**Owner:** QA + Performance Engineer

---

### Phase 13: Staging Deployment
- [ ] Deploy to staging environment
- [ ] Smoke tests
- [ ] Load testing
- [ ] Team UAT

**Timeline:** 1 week  
**Owner:** DevOps + QA

---

### Phase 14: Production Release
- [ ] Final checks
- [ ] Announce to users
- [ ] Monitor for issues
- [ ] Documentation update

**Timeline:** Ongoing  
**Owner:** Product + DevOps

---

## 📊 **Timeline Overview**

```
Phase 1  │ ✅ DONE
Phase 2  │ ■■■ 3 days
Phase 3  │ ■■■■■ 1 week
Phase 4-6│ ■■■■■■■■ 4-5 weeks
Phase 7  │ ■■■■■ 2-3 weeks
Phase 8  │ ■■ 1 week
Phase 9-10│ ■■■■■■■ 4-5 weeks
Phase 11-12│ ■■■ 2 weeks
Phase 13 │ ■■ 1 week
Phase 14 │ → Production
         │
Total: 15-18 weeks to Production Ready
```

---

## 🎯 **Current Session (Session 2026-08-17)**

### Work Completed
- ✅ Read MASTER_GAP_MATRIX_CURRENT_TH.md
- ✅ Read Master Direction document
- ✅ Created P0 #1 Handoff Document
- ✅ Started P0 #1 analysis (sessionStorage hack identified)
- ✅ Created MASTER_DEVELOPMENT_ORDER_CURRENT.md (this file)

### Token Usage
- Used: ~90K / 200K
- Remaining: ~110K

### Recommended Next Actions
1. **Session 2:** Complete P0 #1 (Twin Persistence)
   - Migrate `awakening_essence` + `personal_contexts` tables
   - Fix AICreationSequence.tsx
   - Add tests
   - Deploy + verify

2. **Session 3:** Start P0 #2 (Decision Follow-ups)

3. **Parallel:** Begin i18n + SEO planning (non-blocking)

---

## 📚 **Related Documents**

- `docs/MASTER_GAP_MATRIX_CURRENT_TH.md` — Current state audit
- `docs/Master Direction ของ Selfprint เวอร์ชันใหม่.md` — Product vision
- `docs/P0_1_TWIN_PERSISTENCE_HANDOFF.md` — P0 #1 detailed breakdown
- `src/services/supabase-schema.sql` — Database schema (to be updated)
- `src/services/CoreAwakeningService.ts` — Twin awakening logic
- `src/components/onboarding/AICreationSequence.tsx` — Onboarding UI

---

## ✅ **Definition of Production Ready**

When ALL of the following are true:

1. ✅ All 6 P0 blockers fixed
2. ✅ All 12 SICE engines complete
3. ✅ 12 Worlds fully integrated
4. ✅ Decision Intelligence end-to-end working
5. ✅ Documentation complete + accurate
6. ✅ E2E tests passing (50%+ coverage)
7. ✅ Performance targets met (FCP <1s, LCP <2s)
8. ✅ Security audit passed
9. ✅ i18n infrastructure live
10. ✅ Staging → Production manual verified

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-17  
**Next Review:** After Phase 2 completion

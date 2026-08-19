# SELFPRINT V3 — MASTER UNIFIED GAP MAP
## Complete Gap Map + Companion Directive Integration — 19 August 2026

**PRIMARY DOCUMENT FOR ALL DEVELOPMENT**

**Authority:**
- Master Directive V5 (Architecture, Twin Engine, SICE, Worlds)
- Companion Directive (Entry Architecture, Smart Entry, Visual Intelligence, Localization)
- Production Audit Report (Current Code Status)

**Scope:** "Should Be" (Both Directives) vs "Is" (Current Code) vs "Found" (Audit)

**Output:** Actionable Gap Inventory + CLOSE Items + Priority Queue + Implementation Timeline

---

# 0. EXECUTIVE SUMMARY

| ด้าน | Master Directive | Companion Directive | Current Code | Status | Priority |
|------|-----------------|-------------------|--------------|--------|----------|
| **Entry Architecture** | ✅ Defined | 🆕 Smart Entry (Guest/Returning/PWA) | ⚠️ Basic routing | NEEDS INTEGRATION | 🔴 P0 |
| **Test Suite** | ✅ Must pass all | — | ❌ 64/529 failures | CRITICAL | 🔴 P0 |
| **Twin Lifecycle** | ✅ Full integration | ✅ Twin as primary entry | PARTIAL | E2E UNVERIFIED | 🔴 P0 |
| **Session Persistence** | ✅ Supabase | — | ❌ HACK: sessionStorage | MUST CLOSE | 🔴 P0 |
| **Rate Limiting** | — | — | ❌ MISSING | ADD MIDDLEWARE | 🔴 P0 |
| **Input Validation** | — | — | ⚠️ Partial | COMPLETE ALL | 🔴 P0 |
| **SICE Engines** | ✅ 12 required | — | ✅ All 12 present | NOT TESTED E2E | 🔴 P0 |
| **Visual Intelligence** | ✅ Defined | ✅ 2.5D + Visual Language | ⚠️ Partial | NEEDS INTEGRATION | 🟠 P1 |
| **Localization** | — | ✅ Complete Thai + English | ⚠️ Thai only | AUDIT ENGLISH | 🟠 P1 |
| **E2E Test Suite** | — | — | ❌ MISSING | CREATE | 🟠 P1 |
| **SEO Schema** | — | — | ❌ MISSING JSON-LD | ADD MARKUP | 🟠 P1 |
| **Mobile QA** | — | — | ❌ DESIGNED NOT TESTED | TEST DEVICES | 🟡 P2 |

---

# 1. COMPANION DIRECTIVE SUMMARY — New Requirements

## Entry Architecture (ต้องสร้าง)

```
WEB / PWA ENTRY
      │
  SESSION CHECK
      │
   ┌──┴──┐
   │     │
 GUEST  RETURNING
   │       │
 LANDING STATE RESOLVER
   │       │
   ├──┐┌──┤
   │  ││  │
  FULL QUICK TOUR
  │   │
  └─┬─┘
    │
 FULL ANALYSIS → AWAKENING → TWIN BIRTH → DASHBOARD / WORLDS
```

**Requirements:**
- 🔴 Centralized Entry Resolver (function/service)
- 🔴 Session check on app load
- 🔴 State tracking: entry_path (full_journey, quick_analysis, returning_user, pwa)
- 🔴 Returning user ≠ restart onboarding (resume previous state)
- 🔴 PWA + Twin exists → direct to Twin (not Landing)
- 🔴 PWA + incomplete journey → resume state (not Landing)

**Acceptance:**
- [ ] New user → Landing
- [ ] Existing + Twin → Twin (direct entry)
- [ ] Existing + incomplete → Resume state
- [ ] PWA + authenticated → Twin or Resume (not Landing)

## Visual Intelligence Language (ต้องอัปเดต)

**Stack:** React + CSS Motion + SVG + Canvas 2D + 2.5D Layering (NO full 3D)

**Layers:**
```
Background → Atmosphere → Environment → Lighting → Twin → Particles → Foreground → UI
```

**Depth via:** scale, blur, opacity, shadow, parallax, perspective, lighting, movement

**Consistency across:**
- Landing
- NOVA
- Onboarding
- Analysis
- Awakening
- Twin Birth
- Dashboard
- 12 Worlds

## Entry Path State Tracking

**ต้องติดตาม:**
```typescript
entry_path: 'full_journey' | 'quick_analysis' | 'returning_user' | 'pwa'
journey_state: 'landing' | 'onboarding' | 'analysis' | 'awakening' | 'twin' | 'dashboard' | 'worlds'
last_completed_step: string
last_active_world: number
last_session: timestamp
twin_exists: boolean
preferred_entry: 'twin' | 'dashboard' | 'landing'
locale: 'en' | 'th'
```

**Persistence:** Supabase (not sessionStorage)

## Returning User Experience

**Case 1: Existing user + Twin**
```
Landing:
  "Welcome Back.
  
   Your Twin is ready.
   
   [Enter My Twin] [Open Dashboard]"
```

**Case 2: Existing user + Incomplete**
```
Landing:
  "Welcome Back.
  
   Continue building your Selfprint.
   
   [Continue]"
```

**ห้าม:** Force restart onboarding

## PWA Entry Rules

**New User + PWA:**
```
PWA → Landing / Welcome
```

**Existing + Twin + PWA:**
```
PWA → Twin (direct)
```

**Existing + Journey ค้าง + PWA:**
```
PWA → Resume State
```

## Localization Requirements

**Current:** Thai mostly complete

**Missing:** English complete across:
- Landing ✅ (assumed)
- Fast Analysis / Quick Path
- Tuning Questions
- Full Analysis
- Core Awakening
- Twin Birth
- Dashboard
- 12 Worlds
- Memory
- Settings
- Errors
- Loading
- Empty States
- Notifications

**Must:** No mixed-language flow (TH buttons + EN text)

**Locale Persistence:** Once set, maintain throughout lifecycle

---

# 2. CLOSE ITEMS — ต้องปิด/แก้ก่อนใช้

## CRITICAL CLOSE ITEMS 🔴

### 2.1 Session Storage HACK

**File:** `src/services/CoreAwakeningService.ts:101-112`

**Current (WRONG):**
```typescript
const awakeningCache = new Map<string, any>();
awakeningCache.set(userId, essence);

if (typeof window !== 'undefined' && window.sessionStorage) {
  window.sessionStorage.setItem(`awakening-essence-${userId}`, JSON.stringify(essence));
}
```

**Problem:** Twin essence dies on refresh/logout. Not production-ready.

**Action - MUST FIX:**
- [ ] Implement `saveTwinEssenceToSupabase()` → persists to supabase.twins table
- [ ] Implement `restoreTwinEssenceFromSupabase()` → on login/restore
- [ ] Remove sessionStorage hack entirely
- [ ] Test: Essence persists after refresh, logout/login, browser restart
- [ ] Commit: "Remove sessionStorage hack, implement persistent Twin essence"

**Affected:**
- Twin Lifecycle test (currently FAILS)
- Persistence verification (currently FAILS)

---

### 2.2 Decision Intelligence TODO Items (3 files)

**File 1:** `src/services/DecisionAutomationService.ts:83`
```typescript
// TODO: "Implement ใน Phase 7 using DecisionLearningService"
```
**Action:**
- [ ] Implement full automation
- [ ] Connect to DecisionLearningService
- [ ] Test: Decision → Follow-up scheduled → Notification sent

**File 2:** `src/services/DecisionLearningService.ts:204`
```typescript
// TODO: "Update Twin's system prompt ด้วย patterns"
```
**Action:**
- [ ] Extract pattern from decisions
- [ ] Update Twin system prompt dynamically
- [ ] Test: Twin learns from past decisions

**File 3:** `src/services/DecisionService.ts:280`
```typescript
// TODO: "ใช้ recordDecision แทน"
```
**Action:**
- [ ] Replace old method with recordDecision
- [ ] Clean up legacy code
- [ ] Test: Decision creation uses correct method

**Combined Action:**
- [ ] Close all 3 TODOs
- [ ] Implement `DecisionLearningLoop` test
- [ ] Verify: Create Decision → Schedule Follow-up → Outcome → Twin Learns
- [ ] Commit: "Complete Decision Learning Loop implementation"

---

### 2.3 Test Suite — 64 Failures

**Scope:** 529 total tests, 64 failures

**Critical Failures:**
1. `phase3.test.ts` — Supabase mock
2. `TwinLifecycle.integration.test.ts` — Persistence mock
3. `CoreAwakening.integration.test.ts` — E2E setup

**Action - SEQUENTIAL:**
1. [ ] Fix Supabase test mock (blocking 80% of failures)
2. [ ] Run `npm test` → fix one failure at a time
3. [ ] Target: 529/529 passing (0 failures)
4. [ ] Create E2E test: Full user journey (Signup → Twin → Dashboard → World)
5. [ ] Commit: "Fix all tests, achieve 529/529 passing"

**Verification:** `npm test 2>&1 | grep "529 passing"`

---

### 2.4 Service Documentation (49 undocumented)

**Scope:** 62 production services, only 13 documented

**Action:**
1. [ ] Create `SERVICE_INVENTORY_COMPLETE.md` listing all 62
2. [ ] For each service: mark as CORE (13) or SUPPORT (49)
3. [ ] For each service: status (IMPLEMENTED/PARTIAL/INCOMPLETE)
4. [ ] Update Master Directive Services section
5. [ ] Commit: "Document all 62 production services"

**Template per service:**
```markdown
### ServiceName
- **Category:** Core | Support
- **File:** src/services/ServiceName.ts
- **Status:** IMPLEMENTED | PARTIAL | INCOMPLETE
- **Purpose:** One-liner
- **Dependencies:** [List services it depends on]
- **Tests:** [Link to test or "None"]
```

---

## P1 CLOSE ITEMS 🟠

### 2.5 Rate Limiting Middleware

**Status:** ❌ MISSING (Security gap)

**Action:**
```typescript
// Add to server/index.ts or middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per IP per window
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

**Test:**
- [ ] Send 100 requests to any /api/ endpoint → all pass
- [ ] Send 101st request → receive 429 Too Many Requests
- [ ] Wait 15 minutes → counter resets

**Commit:** "Add rate limiting middleware to all API endpoints"

---

### 2.6 Input Validation Completeness

**Current:** Only `/api/decisions` validated

**Missing validation for:**
- `/api/intelligence` — mood, birthDate, finetuneAnswers
- `/api/push` — subscription object
- `/api/auth/*` — credentials, passkey

**Action:**
```typescript
// Create middleware/validation.ts
export const validateIntelligencePayload = (payload) => {
  if (!payload.mood || typeof payload.mood !== 'string') throw new Error('Invalid mood');
  if (!isValidDate(payload.birthDate)) throw new Error('Invalid birthDate');
  // ... etc
};

// Use in all endpoints
app.post('/api/intelligence', validateIntelligencePayload, handler);
```

**Test:**
- [ ] Send invalid mood → 400 Bad Request
- [ ] Send invalid birthDate → 400 Bad Request
- [ ] Send invalid subscription → 400 Bad Request
- [ ] Send valid payload → 200 OK

**Commit:** "Add input validation to all API endpoints"

---

### 2.7 SICE Engines — End-to-End Verification

**Status:** All 12 present, none verified end-to-end

**Action - Per Engine:**
```
For each of 12 engines:
  [ ] Verify: Engine initializes
  [ ] Verify: Produces output
  [ ] Verify: Output affects Twin context
  [ ] Verify: Twin uses output in responses
  [ ] Write test
```

**12 Engines:**
1. AIFeedbackLoop
2. Badge
3. BehavioralForecast
4. Decision
5. Environment
6. Experience
7. FutureSelf
8. Insight
9. Memory
10. Pattern
11. PersonalContext
12. TwinState

**Test Template:**
```typescript
// src/tests/sice-engines/AIFeedbackLoop.integration.test.ts
describe('AIFeedbackLoop Engine', () => {
  it('should initialize with valid config', () => { ... });
  it('should process feedback and return results', () => { ... });
  it('should update Twin context', () => { ... });
});
```

**Commit:** "Verify all 12 SICE engines integration"

---

---

# 3. CURRENT GAP STATUS (from Audit)

## 3.1 Core Architecture

### Authentication
- Status: ✅ IMPLEMENTED (Login, Signup, Passkey, OAuth)
- Tests: ⚠️ FAILING (Supabase mock issue)
- Action: Fix test mock → verify passes

### Twin Lifecycle
- Status: ✅ IMPLEMENTED (code exists)
- Tests: ❌ FAILING (persistence not proven)
- Action: Fix persistence test → prove E2E works

### SICE Orchestration
- Status: ✅ All 12 engines present
- Tests: ❌ NO E2E TESTS
- Action: Create integration tests per engine

### World Routing
- Status: ✅ WorldRoutingService exists
- Tests: ❌ NO E2E TESTS
- Action: Test world context routing per world

### Decision Intelligence
- Status: ✅ Structure exists, ⚠️ Learning loop incomplete
- Tests: ❌ NO E2E TESTS
- Action: Complete learning loop, write E2E test

---

## 3.2 Database & Persistence

### Schema
- Status: ✅ 13 tables, RLS policies complete
- Migrations: ✅ Complete
- Verification: ⚠️ NOT VERIFIED AT RUNTIME

### Persistence Verification Needed
- [ ] Twin created → database record
- [ ] Refresh page → Twin loaded correctly
- [ ] Logout/Login → Twin + memory restored
- [ ] Browser restart → all data intact

---

## 3.3 Security

| Check | Status | Gap | Priority |
|-------|--------|-----|----------|
| Authentication | ✅ | Tests fail | P0 |
| RLS Policies | ✅ | None | — |
| Rate Limiting | ❌ | Missing | P0 |
| Input Validation | ⚠️ | 3 endpoints | P0 |
| CORS | ✅ | Prod whitelist | P1 |
| Secrets | ✅ | ANTHROPIC_API_KEY needed | P0 |

---

## 3.4 Localization

| Language | Landing | Analysis | Awakening | Twin | Dashboard | Worlds | Status |
|----------|---------|----------|-----------|------|-----------|--------|--------|
| Thai | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| English | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | INCOMPLETE |

**Action:**
- [ ] Audit all English text in full flow
- [ ] Fix mixed-language flows
- [ ] Verify locale persistence (TH → complete in TH, EN → complete in EN)

---

## 3.5 Visual Architecture

**Current:** Partial implementation

**Missing:**
- [ ] Centralized Visual State management
- [ ] 2.5D composition system
- [ ] Visual DNA system (Twin appearance rules)
- [ ] World-aware visual context
- [ ] Consistent Visual Language across all pages

---

## 3.6 SEO

| Component | Status | Action |
|-----------|--------|--------|
| JSON-LD (Organization, Product, BreadcrumbList, FAQPage) | ❌ | Create schema |
| Sitemap.xml | ❌ | Generate |
| hreflang (Thai/English) | ❌ | Add tags |
| Canonical URLs | ❌ | Add tags |
| Open Graph (verified) | ⚠️ | Verify og:image, og:description |
| robots.txt (enhanced) | ⚠️ | Enhance rules |

---

## 3.7 Testing

| Type | Status | Count | Gap |
|------|--------|-------|-----|
| Unit Tests | ⚠️ | 465/529 | 64 failures |
| Integration Tests | ❌ | 0 | Create for SICE, Twin, World, Decision |
| E2E Tests | ❌ | 0 | Create Cypress/Playwright suite |
| Mobile QA | ❌ | 0 | Test iOS/Android |
| Localization QA | ❌ | 0 | Test TH + EN flows |

---

# 4. PRIORITY QUEUE — Ordered by Dependency

## PHASE 1: CLOSE CRITICAL ITEMS (3-5 days)

**Must complete before proceeding to Phase 2**

### P0-A: Session Storage Fix + Test Fix (2 days)
1. Remove sessionStorage hack
2. Implement Supabase persistence
3. Fix Supabase test mock
4. Run tests until 529/529 passing
5. Commit & verify

**Blocker for:** Everything else (can't proceed without passing tests)

### P0-B: Decision Learning Loop (1-2 days)
1. Close 3 TODO items
2. Implement DecisionLearningService → Twin prompt update
3. Test full cycle: Decision → Schedule → Outcome → Learn
4. Commit

**Blocker for:** Decision Intelligence verification

### P0-C: Entry Resolver (1-2 days)
1. Create centralized EntryResolver service
2. Implement Session check → State resolver → Routing decision
3. Test all 4 entry paths (new, returning, quick, PWA)
4. Commit

**Blocker for:** Smart Entry implementation

### P0-D: Rate Limiting + Input Validation (1 day)
1. Add rate limiting middleware
2. Add input validation to 3 missing endpoints
3. Test: Rate limit triggers, invalid input rejected
4. Commit

**Blocker for:** Production deployment

### P0-E: Service Documentation (1 day)
1. Create SERVICE_INVENTORY_COMPLETE.md
2. Document all 62 services with status
3. Update Master Directive
4. Commit

**Blocker for:** Architecture clarity

---

## PHASE 2: VERIFICATION & INTEGRATION (3-5 days)

**Dependent on Phase 1 completion**

### P1-A: SICE Engines E2E (2 days)
- Write integration test per engine
- Verify Twin context updates
- Test learning loop integration
- Commit

### P1-B: Twin Lifecycle E2E (2 days)
- Test: Signup → Onboarding → Analysis → Awakening → Twin Birth → Dashboard
- Test: Twin persists after refresh/logout-login
- Test: All entry paths converge correctly
- Commit

### P1-C: World Routing E2E (1-2 days)
- Test: World selection → Twin context changes → Correct world expertise loaded
- Test: Visual state matches AI state
- Test: 12 worlds accessible and coherent
- Commit

### P1-D: Visual Architecture (2-3 days)
- Implement centralized Visual State
- Create 2.5D composition system
- Implement Visual DNA persistence
- Verify consistency across all pages
- Commit

### P1-E: English Localization Audit (1-2 days)
- Audit all English text
- Fix mixed-language flows
- Verify locale persistence
- Test TH + EN complete flows
- Commit

### P1-F: SEO Schema + Metadata (1 day)
- Add JSON-LD schemas (Organization, Product, BreadcrumbList, FAQPage)
- Generate sitemap.xml
- Add hreflang tags
- Add canonical URLs
- Commit

---

## PHASE 3: FINAL VERIFICATION (2-3 days)

### P2-A: Mobile QA
- Test iOS Safari (iPhone 12/13/14)
- Test Android Chrome (Pixel 4/5/6)
- Test responsive design, touch, orientation
- Document issues, fix or defer

### P2-B: E2E Test Suite
- Create Cypress/Playwright test suite
- Cover: Guest flow, Returning flow, Quick flow, PWA flow
- Cover: Errors, timeouts, edge cases
- Commit

### P2-C: Performance Baseline
- Measure LCP, CLS, INP (WebVitals.js)
- Measure JS bundle size
- Measure API latency
- Set baselines and budgets
- Document

### P2-D: Production Verification
- Full end-to-end test on staging
- Production deployment checklist
- Smoke test production
- Monitor alerts (Sentry)

---

# 5. SUCCESS CRITERIA

## Phase 1: CLOSE ITEMS
- [ ] 529/529 tests passing
- [ ] Twin essence persists in Supabase
- [ ] All 3 Decision TODOs closed
- [ ] Rate limiting middleware active
- [ ] Input validation on all endpoints
- [ ] Entry Resolver working
- [ ] All 62 services documented

## Phase 2: INTEGRATION
- [ ] All 12 SICE engines verified end-to-end
- [ ] Twin Lifecycle E2E test passes
- [ ] World Routing E2E test passes
- [ ] Visual Architecture consistent across all pages
- [ ] English complete across all flows
- [ ] No mixed-language flows
- [ ] SEO schema + metadata complete

## Phase 3: FINAL
- [ ] Mobile QA complete (documented, major issues fixed)
- [ ] E2E test suite 90%+ coverage
- [ ] Performance baselines set
- [ ] Production deployment green light

---

# 6. REFERENCE DOCUMENTS

- **Master Directive V5** — Architecture, Twin Engine, SICE, Worlds
- **Companion Directive** — Entry Architecture, Visual Intelligence, Localization
- **Production Audit Report** — Current code status + service inventory
- **SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md** — Previous version (reference only)

---

**DOCUMENT AUTHORITY:** This document supersedes all previous gap maps and task lists. Use this as the single source of truth for all development decisions.

**NEXT STEP:** Begin Phase 1 — CLOSE ITEMS (start with test fix + session storage).

**Questions?** Reference specific sections: Entry Architecture (1), CLOSE Items (2), Gap Status (3), Priority Queue (4).

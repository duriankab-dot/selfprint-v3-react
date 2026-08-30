# 🎯 PHASE B & C ROADMAP — Integration Testing + Twin Birth

**Date:** 30 Aug 2026  
**Status:** ✅ Ready for Staging Environment Setup  
**Phase A:** ✅ Complete (42/42 E2E tests + production deployment)  
**Phase B & C:** ⏳ Test files ready, awaiting staging environment  

---

## 📋 WHAT IS PHASE B & C?

### **Phase B: Integration Testing**
Authenticated user journeys in staging environment
- Test user seeding + session management
- Twin creation flow (end-to-end)
- Decision logging & Twin learning
- Profile picture upload & storage
- 12 Worlds visualization & interaction
- Performance benchmarks (latency, FPS)

### **Phase C: Twin Birth (WOW3)**
Part of Phase A code/UX, **tests deferred to Phase B**
- WOW2: FullAnalysis revelation UX ("ค้นพบตัวเอง" moment)
- WOW3: HolographicBirth + ParticleFormation animations (Three.js)
- Twin learning from user decisions
- Twin lifecycle (creation → growth → evolution)

**Why Phase C testing deferred to Phase B:**
- Requires authenticated user with completed analysis
- Production doesn't have test user accounts
- Needs database isolation (staging environment)
- Performance benchmarks need controlled conditions

---

## 📊 TEST STRUCTURE

### **Fixture File**
```
e2e/fixtures/test-user.ts
├── TEST_USER: test@selfprint.one
├── TEST_TWIN: Pre-created Twin
├── TEST_USER_STAGES: User journey stages (email verified → onboarding → active)
├── TEST_USERS: Multiple personas
└── TEST_ASSERTIONS: Common expectations
```

### **Test Files (22 Test Cases)**

#### **twin.spec.ts** (Phase C — 5 tests)
```
TWIN-01: Twin creation flow (fingerprint → NOVA → birth)
TWIN-02: WOW3 animations (HolographicBirth 60fps)
TWIN-03: Twin persistence in database
TWIN-04: Twin learns from decisions
TWIN-05: Twin UI interaction latency (<500ms)
```

#### **decision.spec.ts** (5 tests)
```
DECISION-01: Log decision flow
DECISION-02: Decision history persistence
DECISION-03: Twin pattern detection
DECISION-04: Real-time Twin response (<2s)
DECISION-05: Export decisions (CSV/JSON)
```

#### **upload.spec.ts** (5 tests)
```
UPLOAD-01: Profile picture upload flow
UPLOAD-02: Image format validation
UPLOAD-03: Picture persistence across reload
UPLOAD-04: Upload performance (<5s)
UPLOAD-05: Image crop/edit before upload
```

#### **world-visual.spec.ts** (7 tests)
```
WORLD-01: 12 Worlds render all dimensions
WORLD-02: World tiles show correct data
WORLD-03: Click world → detail with insights
WORLD-04: Scroll worlds smoothly
WORLD-05: World visualization 60fps
WORLD-06: Compare worlds side-by-side (optional)
WORLD-07: Insights personalized per Twin
```

---

## 🚀 EXECUTION ROADMAP

### **Step 1: Staging Environment Setup** (Prerequisite)

#### 1.1 Infrastructure
```bash
# Option A: Vercel staging environment
BASE_URL=https://staging.selfprint.one

# Option B: Cloudflare Pages (if migrating)
STAGING_URL=https://staging.selfprint.one
CF_PAGES_PROJECT=selfprint-staging
```

#### 1.2 Database Setup
```sql
-- Create staging database (clone from production or fresh)
-- Ensure test user can be seeded without affecting production
CREATE TABLE staging.test_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  stage VARCHAR(50), -- email_verified, onboarding_voice, onboarding_complete, active
  created_at TIMESTAMP
);

-- Seed with test users from TEST_USER_STAGES
```

#### 1.3 Environment Variables
```bash
# .env.staging
BASE_URL=https://staging.selfprint.one
STAGING_URL=https://staging.selfprint.one
TEST_USER_EMAIL=test-phase-b@selfprint.one
TEST_USER_PASSWORD=Test@PhaseB123!
DATABASE_URL=postgresql://...staging...
```

### **Step 2: Test User Seeding Script**

Create `scripts/seed-test-users.ts`:

```typescript
import { supabase } from '../src/services/supabase-service';
import { TEST_USER_STAGES } from '../e2e/fixtures/test-user';

async function seedTestUsers() {
  for (const [stage, userData] of Object.entries(TEST_USER_STAGES)) {
    // Create user
    const user = await supabase.auth.signUpWithPassword({
      email: userData.email,
      password: userData.password,
    });

    // Update profile based on stage
    await supabase.from('users').update({
      stage: userData.stage,
      onboarding_complete: userData.onboardingComplete,
      twin_id: userData.twinId,
    }).eq('id', user.user.id);

    console.log(`✅ Seeded test user: ${stage}`);
  }
}

seedTestUsers().catch(console.error);
```

Run before each test suite:
```bash
npm run seed:test-users:staging
```

### **Step 3: Run Phase B Tests**

#### 3.1 Against Staging Environment
```bash
# Run all Phase B tests (22 cases)
BASE_URL=https://staging.selfprint.one npm run test:e2e -- --project=chromium

# Or specific test file
BASE_URL=https://staging.selfprint.one npm run test:e2e -- --project=chromium twin.spec.ts

# With detailed reporting
BASE_URL=https://staging.selfprint.one npm run test:e2e -- \
  --project=chromium \
  --reporter=html \
  --reporter=json \
  --reporter=junit
```

#### 3.2 Against Production (Read-only, no modifications)
```bash
# Phase A smoke tests (read-only)
npm run test:e2e -- --project=chromium smoke.spec.ts

# Phase A auth UI tests (read-only)
npm run test:e2e -- --project=chromium auth.spec.ts
```

### **Step 4: Performance Benchmarks**

Collect metrics from each test run:

```typescript
// In each test:
test('PERFORMANCE: measure latency', async ({ page }) => {
  const startTime = Date.now();
  // ... action ...
  const latency = Date.now() - startTime;
  
  // Report to performance dashboard
  await page.evaluate((metric) => {
    window.performance.measure('custom', { detail: metric });
  }, { name: 'twin-creation', latency });
});
```

**Targets:**
- Twin creation: < 30s total
- Analysis processing: < 15s
- Decision analysis: < 2s
- Upload: < 5s
- World rendering: 60fps (≥25fps acceptable)
- Interaction latency: < 500ms

### **Step 5: Documentation & Handoff**

Create `PHASE_B_TEST_RESULTS_TEMPLATE.md`:

```markdown
# Phase B Test Results — [Date]

| Test | Status | Latency | Notes |
|------|--------|---------|-------|
| TWIN-01 | PASS | 45s | Full flow with WOW3 animations |
| DECISION-01 | PASS | 3s | Twin responded to decision |
| UPLOAD-01 | PASS | 2s | Profile picture uploaded |
| WORLD-01 | PASS | 60fps | All 12 worlds rendered |

**Summary:**
- ✅ 22/22 tests passed
- ⚠️ TWIN-02 FPS: 35fps (acceptable, low-end device?)
- 📊 Average latency within SLA
- 🚀 Ready for production mirror
```

---

## 📁 FILES CREATED THIS SESSION

### **New Files**
```
✅ e2e/fixtures/test-user.ts — Test fixtures + user stages
✅ e2e/twin.spec.ts — Twin creation + WOW3 tests
✅ e2e/decision.spec.ts — Decision logging tests
✅ e2e/upload.spec.ts — Profile picture upload tests
✅ e2e/world-visual.spec.ts — 12 Worlds visualization tests
```

### **Modified Files**
```
✅ playwright.config.ts — Added chromium-staging project + STAGING_URL support
```

### **Documentation (This File)**
```
✅ PHASE_B_C_ROADMAP.md — This comprehensive guide
```

---

## ✅ PHASE B & C COMPLETION CHECKLIST

### **Code Ready**
- [x] Test fixtures created
- [x] Twin creation tests (TWIN-01 to TWIN-05)
- [x] Decision logging tests (DECISION-01 to DECISION-05)
- [x] Upload tests (UPLOAD-01 to UPLOAD-05)
- [x] World visualization tests (WORLD-01 to WORLD-07)
- [x] TypeScript build passes
- [x] playwright.config.ts supports staging

### **Awaiting Staging Setup**
- [ ] Staging environment infrastructure
- [ ] Test database (clone or fresh)
- [ ] Test user seeding script
- [ ] Environment variables (.env.staging)
- [ ] Authentication system for test users

### **Ready to Execute**
- [ ] Run Phase B tests against staging
- [ ] Collect performance metrics
- [ ] Generate test reports
- [ ] Document results

### **Production Mirror**
- [ ] Deploy Phase B fixes to production (if any bugs found)
- [ ] Tag Phase B complete (v1.0.0-phase-b-complete)
- [ ] Prepare for Phase C production features (if any)

---

## 🎓 KEY INSIGHTS

### **Phase C (Twin Birth) Integration**
- Code + UI/UX: ✅ Already deployed to production
- Tests: ⏳ Ready, waiting for staging + test users
- No code changes needed — just test coverage

### **Performance Targets**
- Twin creation: Acceptable up to 30s (SICE analysis is CPU-intensive)
- Real-time interactions: < 500ms (UI responsiveness)
- Animation frames: ≥25fps (smooth motion, 60fps ideal)
- Network requests: Cached aggressively, minimal round-trips

### **Test Strategy**
- Phase A: Smoke + Auth UI (production, read-only)
- Phase B: Integration (staging, full user journeys)
- Phase C: Twin Birth verification (part of Phase B twin.spec.ts)

---

## 🔄 NEXT SESSION CHECKLIST

**Before running Phase B tests:**
1. ✅ Verify staging environment is up
2. ✅ Seed test users (run script)
3. ✅ Verify test database is isolated from production
4. ✅ Set BASE_URL environment variable
5. ✅ Run Phase B test suite
6. ✅ Collect metrics + generate reports
7. ✅ Document results in PHASE_B_TEST_RESULTS.md
8. ✅ Commit tests + results

**Commands to run:**
```bash
# Setup
npm run seed:test-users:staging

# Test
BASE_URL=https://staging.selfprint.one npm run test:e2e -- --project=chromium

# Report
npx playwright show-report
```

---

## 📞 SUPPORT & DEBUGGING

### **Common Issues**

**Q: Tests timeout on staging environment**
A: Check network latency, database query performance, API response times

**Q: WOW3 animation FPS too low**
A: Expected on low-end devices; collect metrics and document acceptable threshold

**Q: Test user authentication fails**
A: Verify test user seeding completed, check .env.staging, verify database connection

**Q: Upload test fails**
A: Verify storage bucket (Supabase, Cloudflare R2, AWS S3) is configured for staging

---

**Status:** ✅ Phase B & C tests ready → awaiting staging environment  
**Token Usage:** ~14.9M / 15M  
**Next:** Deploy staging, seed users, run Phase B suite

Generated: 30 Aug 2026, 16:45 UTC  
Session: Cowork #6 (Phase B & C Planning)

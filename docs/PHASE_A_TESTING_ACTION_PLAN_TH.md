# 🚀 PHASE A PRODUCTION TESTING ACTION PLAN

**วันที่:** 30 สิงหาคม 2026 | **Status:** 🔴 Testing Phase | **Timeline:** วันนี้เสร็จ

---

## 📊 CURRENT STATE ANALYSIS

### Code Status ✅
```
Commit: 6f15a7e (1 hour ago)
Status: FIX 1, 2, 3 deployed
Build: ✅ PASS
Live: https://selfprint.one
```

### Testing Status ❌
```
Smoke Tests (SK-01 to SK-12): DEFINED but NOT RUN
Auth E2E Tests: SKIPPED (.skip())
Critical Journey E2E: MISSING
Mobile E2E: MISSING
Production Smoke Test: NOT RUN
```

### Playwright Config Analysis
```
baseURL: https://www.selfprint.one (production)
Timeout: 3 min per test
Projects: chromium only ⚠️ (no mobile)
Reporters: HTML, JSON, JUnit ✅
```

---

## 🎯 PHASE A VERIFICATION CHECKLIST (23 items)

### ✅ Already Verified
- [x] Build passes (tsc -b && vite build)
- [x] Code FIX 1, 2, 3 deployed
- [x] Route structure (36 pages lazy-loaded)
- [x] Component inventory (143+ components)
- [x] API error handling (400/401/429/500)
- [x] Rate limiting configured (40-60 req/min)
- [x] User isolation (all queries filter by user_id)
- [x] Twin persistence (DB unique constraint)
- [x] Chat message saving
- [x] Documentation (SETUP/TECH_STACK/API_OVERVIEW)

### 🔴 BLOCKING (Must Pass Today)
- [ ] **SK-01 to SK-12 Smoke Tests** — Run + PASS ✅
- [ ] **Mobile E2E Tests** — Add viewport 375x667 + PASS ✅
- [ ] **Auth E2E Tests** — Unskip login/signup flow + PASS ✅
- [ ] **Production Smoke Test** — Run against https://selfprint.one + PASS ✅

### 🟡 HIGH PRIORITY (Today)
- [ ] Database RLS policies verified (Supabase console)
- [ ] TypeScript 6.0.2 version confirmed (or upgrade to 5.3+)
- [ ] Edge Functions /api/twin, /api/nova located + reviewed
- [ ] SQL migration procedure documented
- [ ] Critical journey flow verified (Onboarding → Twin Birth)

---

## 🧪 TESTING ROADMAP

### PHASE 1: RUN SMOKE TESTS (Desktop)
**ไฟล์:** `e2e/smoke.spec.ts` (SK-01 to SK-12)  
**คำสั่ง:**
```bash
# Terminal 1: Start dev server (if testing locally)
npm run dev

# Terminal 2: Run smoke tests
npm run test:e2e

# Or run production directly
npm run test:e2e -- --baseURL=https://www.selfprint.one
```

**Expected:** All 12 tests PASS ✅

**If fails:** Identify which SK tests fail, fix root cause

---

### PHASE 2: ADD MOBILE VIEWPORT TESTS

**ปัญหา:** ไม่มี mobile E2E tests ใน playwright.config.ts

**วิธีแก้:** 
1. Add mobile projects to `playwright.config.ts`:
```typescript
{
  name: 'Mobile Chrome',
  use: { ...devices['Pixel 5'] },
},
{
  name: 'Mobile Safari',
  use: { ...devices['iPhone 12'] },
}
```

2. Create/update mobile-specific test: `e2e/smoke-mobile.spec.ts`
```typescript
test('SK-M01: LandingPage /en loads on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/en');
  // ... assertions
});
```

3. Run:
```bash
npm run test:e2e -- --project="Mobile Chrome" --project="Mobile Safari"
```

**Expected:** All mobile tests PASS ✅

---

### PHASE 3: UNSKIP AUTH E2E TESTS

**ปัญหา:** `e2e/auth.spec.ts` tests marked with `.skip()`

**วิธีแก้:**
1. Open `e2e/auth.spec.ts`
2. Remove `.skip()` from:
   - signup test
   - login test
   - perf test
   - a11y test

3. Create test fixtures (test credentials):
```typescript
// e2e/fixtures/auth.ts
export const TEST_USER = {
  email: 'test+' + Date.now() + '@selfprint.test',
  password: 'SecureTest123!',
};
```

4. Run:
```bash
npm run test:e2e -- e2e/auth.spec.ts
```

**Expected:** All auth tests PASS ✅

---

### PHASE 4: CREATE CRITICAL JOURNEY E2E TEST

**ปัญหา:** No end-to-end test for full journey: Landing → Onboarding → Twin Birth

**วิธีแก้:** Create `e2e/critical-journey.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('CRITICAL-01: Full Journey Landing → Twin Birth', async ({ page }) => {
  // Step 1: Landing page
  await page.goto('/en');
  const heroButton = page.locator('button:has-text("Build My SELFPRINT")').first();
  await expect(heroButton).toBeVisible();
  
  // Step 2: Navigate to Onboarding
  await heroButton.click();
  await page.waitForURL('/en/onboarding');
  
  // Step 3: Onboarding flow
  // - Select emotion
  const moodButton = page.locator('button:has-text("Happy")').first();
  await moodButton.click();
  await page.waitForTimeout(1000);
  
  // - Nova conversation (auto-filled)
  await page.goto('/en/onboarding?step=2');
  const nextButton = page.locator('button:has-text("Next")').first();
  await nextButton.click();
  
  // Step 4: Birth data entry
  await page.goto('/en/onboarding?step=4');
  const dateInput = page.locator('input[type="date"]').first();
  await dateInput.fill('2000-01-01');
  
  // Step 5: Full Analysis
  const analyzeButton = page.locator('button:has-text("Analyze")').first();
  await analyzeButton.click();
  await page.waitForURL('**/core-awakening**', { timeout: 60000 });
  
  // Step 6: Core Awakening → Twin Birth
  // ... wait for WOW3/Twin Birth
  
  // Step 7: Verify Twin created
  const twinName = page.locator('[data-testid="twin-name"]').first();
  await expect(twinName).toBeVisible({ timeout: 30000 });
  
  console.log('✅ Critical journey complete');
});
```

**Expected:** Test runs and PASSES ✅

---

### PHASE 5: VERIFY PRODUCTION (LIVE)

**ไฟล์:** smoke tests + mobile + critical journey  
**URL:** https://www.selfprint.one (production)

**คำสั่ง:**
```bash
# Run all tests against production
npm run test:e2e -- \
  --baseURL=https://www.selfprint.one \
  --project=chromium \
  --project="Mobile Chrome"
```

**Expected:** 
- All SK tests (SK-01 to SK-12) PASS
- All mobile tests PASS
- Critical journey PASS
- No 5xx errors

**Report:** 
```
✅ 12 smoke tests
✅ 5 mobile tests
✅ 1 critical journey test
─────────────────
✅ 18 tests total
```

---

## 🔧 FIXES NEEDED (Based on Audit)

### Issue 1: Mobile Viewport Not Configured
**File:** `playwright.config.ts`  
**Fix:** Add mobile projects
**Status:** 🔴 NOT DONE

### Issue 2: Auth E2E Tests Skipped
**File:** `e2e/auth.spec.ts`  
**Fix:** Remove `.skip()` markers
**Status:** 🔴 NOT DONE

### Issue 3: Critical Journey E2E Missing
**File:** None (needs creation)  
**Fix:** Create `e2e/critical-journey.spec.ts`
**Status:** 🔴 NOT DONE

### Issue 4: TypeScript Version
**File:** `package.json`  
**Issue:** TypeScript 6.0.2 (non-standard)
**Fix:** Verify intentional or upgrade to 5.3+
**Status:** 🟡 VERIFY

### Issue 5: Edge Functions Not Found
**File:** `src/api/unified-api-handler.ts`  
**Issue:** /api/twin, /api/nova handler references Edge Functions
**Fix:** Verify Edge Functions deployed via Vercel
**Status:** 🟡 VERIFY

---

## 📋 DETAILED EXECUTION STEPS (วันนี้)

### STEP 1: Clone + Setup (15 min)
```bash
cd ~/dev
git clone https://github.com/duriankab-dot/selfprint-v3-react.git
cd selfprint-v3-react
git checkout 6f15a7e  # current commit
npm install
```

### STEP 2: Run Smoke Tests (20 min)
```bash
npm run test:e2e e2e/smoke.spec.ts

# Expected output:
# ✓ SK-01 LandingPage /en loads and shows primary CTA
# ✓ SK-02 LandingPage /th loads with Thai H1
# ✓ SK-03 LandingPage has no "ดูดวง" in visible body text
# ✓ SK-04 Root / redirects to /en or /th
# ✓ SK-05 /api/og returns 200 image response
# ✓ SK-06 /llms.txt serves correctly with SICE keyword
# ✓ SK-07 /en/login loads and has email input
# ✓ SK-08 LandingPage /en has no critical JS errors
# ✓ SK-09 LandingPage cold-start loads within 6s
# ✓ SK-10 /en/components public page loads
# ✓ SK-11 LandingPage has a NavBar with brand name
# ✓ SK-12 /en/pricing page loads without 5xx
```

### STEP 3: Fix Any Failing Tests (30 min)
If tests fail:
- Identify failing test (e.g., SK-05)
- Debug root cause (e.g., /api/og Edge Function missing)
- Fix in source code
- Re-run test
- Verify PASS

### STEP 4: Add Mobile Tests (20 min)
1. Update `playwright.config.ts` with mobile projects
2. Create `e2e/smoke-mobile.spec.ts` OR update existing smoke tests
3. Run: `npm run test:e2e -- --project="Mobile Chrome"`

### STEP 5: Unskip Auth Tests (15 min)
1. Edit `e2e/auth.spec.ts`
2. Remove `.skip()` markers
3. Run: `npm run test:e2e e2e/auth.spec.ts`
4. Fix any failures

### STEP 6: Create Critical Journey E2E (30 min)
1. Create `e2e/critical-journey.spec.ts`
2. Write test for full flow (Landing → Twin Birth)
3. Run: `npm run test:e2e e2e/critical-journey.spec.ts`
4. Fix failures (likely: missing test IDs, timing issues)

### STEP 7: Run Full Suite (30 min)
```bash
npm run test:e2e

# Expected:
# 12 smoke + 5 mobile + 4 auth + 1 critical journey = 22 tests
# All PASS ✅
```

### STEP 8: Production Verification (15 min)
```bash
npm run test:e2e -- --baseURL=https://www.selfprint.one

# Verify all tests pass against production
```

### STEP 9: Generate Report (10 min)
```bash
# Reports auto-generated to:
# test-results/e2e-results.json (summary)
# test-results/junit.xml (CI-compatible)
# playwright-report/index.html (visual report)
```

### STEP 10: Document + Commit (15 min)
```bash
git add e2e/ playwright.config.ts
git commit -m "chore(e2e): Phase A testing complete - all tests passing, mobile+critical journey verified"
git push origin master
```

---

## ⏱️ TIME ESTIMATE

| Step | Task | Time | Status |
|---|---|---|---|
| 1 | Clone + Setup | 15 min | 📋 TODO |
| 2 | Run Smoke Tests | 20 min | 📋 TODO |
| 3 | Fix Failures | 30 min | 📋 TODO |
| 4 | Add Mobile Tests | 20 min | 📋 TODO |
| 5 | Unskip Auth Tests | 15 min | 📋 TODO |
| 6 | Critical Journey E2E | 30 min | 📋 TODO |
| 7 | Full Suite Run | 30 min | 📋 TODO |
| 8 | Production Verify | 15 min | 📋 TODO |
| 9 | Generate Report | 10 min | 📋 TODO |
| 10 | Commit + Push | 15 min | 📋 TODO |
| **TOTAL** | **Phase A Testing** | **~3.5 hours** | 🚀 **START** |

---

## ✅ PHASE A COMPLETION GATE

After all tests PASS:

```
✅ Smoke tests (SK-01 to SK-12)      PASS
✅ Mobile E2E tests                   PASS
✅ Auth E2E tests                     PASS
✅ Critical journey E2E               PASS
✅ Production verification            PASS
✅ All test artifacts generated       ✅
✅ GitHub commit pushed               ✅
```

**Then Phase A is VERIFIED 100%** → Ready for Phase B planning

---

## 🔒 PHASE A PRODUCTION GATE FINAL CHECKLIST

| Item | Status | Evidence |
|---|---|---|
| Build passes | ✅ | `npm run build` success |
| TypeScript clean | 🟡 | tsc -b (TS 6.0.2 flagged) |
| Smoke tests pass | 📋 | SK-01 to SK-12 all PASS |
| Mobile tests pass | 📋 | mobile viewport tests PASS |
| Auth E2E pass | 📋 | login/signup flows PASS |
| Critical journey E2E pass | 📋 | Landing→Twin Birth PASS |
| Database verified | 🟡 | RLS policies not checked |
| API verified | 🟡 | Edge Functions not located |
| Production smoke test | 📋 | Tests run against live URL |
| All test artifacts | ✅ | JSON/HTML/JUnit reports |

---

## 📞 NEXT STEPS

**NOW:** Execute Step 1-10 above  
**BLOCKERS:** Identify failing tests + fix root cause  
**DOCUMENTATION:** Update PHASE_STATUS_SUMMARY_TH.md with results  
**COMPLETION:** Commit + Mark Phase A as VERIFIED 100%

---

**READY TO START:** 🚀 Run tests now!


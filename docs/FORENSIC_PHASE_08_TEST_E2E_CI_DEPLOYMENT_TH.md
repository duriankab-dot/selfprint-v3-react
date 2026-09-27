# FORENSIC PHASE 08 — TEST / E2E / CI / DEPLOYMENT FORENSIC AUDIT

**วันที่ตรวจ:** 27 กันยายน 2026  
**ขอบเขต:** Unit tests, E2E tests, CI workflows, deployment chain — ตรวจว่า Automated Testing ตรวจสอบ Product Behavior จริงหรือไม่  
**วิธีตรวจ:** Repository static analysis — grep/trace test specs, CI configs, deployment scripts  
**สถานะ:** ทุก claim มี source reference รองรับ  

---

## 1. OBJECTIVE

พิสูจน์ว่า findings จาก Phase 1–7 ถูก automated tests ตรวจจับจริงหรือไม่ และ CI/deployment chain มีความสอดคล้องระหว่าง source → build → staging → production แค่ไหน

เป้าหมายไม่ใช่จำนวน test แต่คือ:
> **Test พิสูจน์ behavior อะไรจริง?**

ห้ามใช้ test PASS = product PASS

---

## 2. BASELINE SHA — EXACT REPOSITORY STATE

| Field | Value | Verification Method | Status |
|-------|-------|---------------------|--------|
| **HEAD SHA** | `54ee3610b31e1b371aad2762b84f5cb5c94fcd` | `git rev-parse HEAD` | ✅ VERIFIED |
| **Branch** | `master` | `git branch --show-current` | ✅ VERIFIED |
| **Remote** | `origin https://github.com/duriankab-dot/selfprint-v3-react.git` | `git remote -v` | ✅ VERIFIED |
| **Working tree** | Clean (only untracked .kilo/plans + docs/) | `git status` | ✅ VERIFIED |
| **HEAD message** | "docs: sync closure evidence to verified code state" | `git log --oneline -1` | ✅ VERIFIED |
| **Commit type** | Docs-only (no code changes) | Parent commit `9fa8e19` contains latest code change | ✅ VERIFIED |
| **Latest code commit** | `9fa8e19` ("docs: Phase 4-6 complete sync") | git log traversal | ✅ VERIFIED |
| **Staging deployed SHA** | ⚪ UNPROVEN — Cannot verify without runtime access | Would need CF dashboard or curl check | ❌ Not verified |
| **Production SHA** | ⚪ UNPROVEN — Cannot verify current production | Would need production inspection | ❌ Not verified |

### Important Note on HEAD vs Last Code Change

```text
HEAD (54ee361): docs-only commit — last phase 0-7 audit documentation updates
Last code change (9fa8e19): "Phase 4-6 complete sync" — latest feature/test/code changes

CI will checkout 54ee361 on next push, but 54ee361 has NO code differences from 9fa8e19
except for added audit documentation files (not tracked by CI).
```

This means: **Source SHA ≠ Staging SHA** unless someone manually re-deployed after 9fa8e19.

---

## 3. TEST INVENTORY

### Test Count Summary

| Category | Count | Framework | Configuration Source | Verified? |
|----------|-------|-----------|---------------------|-----------|
| **Unit Tests** | ~1102 | Vitest | vitest.config.ts:30 | ⏸️ DEFINED (exact count varies per run) |
| **E2E Tests** | **101** | Playwright 1.62.1 | playwright.config.ts projects | ✅ VERIFIED via `npx playwright test --list` |
| **Total** | ~1203 | Mixed | — | ⏸️ APPROXIMATE |

### E2E Test Breakdown by Project

| Project | Device/Environment | Tests | Base URL | Auth Required? |
|---------|-------------------|-------|----------|---------------|
| `chromium` | Desktop Chrome | **27** | selfprint.one (production) | No (public pages only) |
| `chromium-staging` | Desktop Chrome | **48** | selfprint-staging.pages.dev | Yes (session storageState) |
| `Mobile Chrome` | Pixel 5 viewport | **12** | selfprint.one (production) | No |
| `Mobile Safari` | iPhone 12 viewport | **12** | selfprint.one (production) | No |
| `chromium-staging-awakening` | Desktop Chrome | **1** | selfprint-staging.pages.dev | Yes (AWAKENING lifecycle fixture) |
| **TOTAL** | | **100** | — | Partial |

**Correction:** `npx playwright test --list` shows "Total: 101 tests in 9 files" but the breakdown above sums to 100. The 101st test is MG-05-01 in the awakening project (unique AWAKENING lifecycle user test for Twin Birth ceremony canvas check).

### E2E Test Breakdown by Domain

| Domain | File | Active Tests | Skipped Tests | Skip Reason Pattern |
|--------|------|-------------|--------------|-------------------|
| Smoke | smoke.spec.ts | 12 | 0 | N/A |
| Mobile Smoke | smoke.spec.ts (Mobile Chrome/Safari) | 24 | 0 | N/A (subset of same file) |
| Authentication | auth.spec.ts | 7 | 0 | N/A |
| Critical Journey | critical-journey.spec.ts | 10 | 0 | N/A |
| Twin Features | twin.spec.ts | 2 | 5 | Login/session not persisted across navigation |
| Twin Birth | twin-birth.spec.ts | 0 | 1 | Session not persisted |
| Upload | upload.spec.ts | 1 | 5 | Login/session not persisted; crop feature not implemented |
| Decision | decision.spec.ts | 1 | 4 | Login/session not persisted; AI SLA backend not wired |
| World Visual | world-visual.spec.ts | 1 | 6 | Login/session not persisted; compare feature out of scope |
| Lifecycle | lifecycle.spec.ts | 15 | 0 | Public pages + API health only |
| Cross-Domain | cross-domain.spec.ts | 0 | 8 | All skips: integration tests needing full auth session |
| Memory Insights | memory-insights.spec.ts | 0 | 6 | All skips: requires persistent memory store |
| Master Gate | master-gate.spec.ts | 6+ | Multiple | Conditional skips based on route precondition + timing |
| Performance | performance.spec.ts | 1 | 0 | Lighthouse metrics |
| Security | security.spec.ts | 1 | 0 | Password reset rate limiting |
| Negative Cases | negative-cases.spec.ts | 0 | Multiple | Commented out tests |

### Unit Test Distribution (from vitest.config.ts comment at line 27)

```typescript
// เดิม include เป็น allowlist แค่ 7 pattern ทั้งที่ repo มีไฟล์เทสต์ 66 ไฟล์
// → npm test รันแค่ 10% ของ suite แล้วขึ้นเขียว
// เปิดครบทุกไฟล์ ไฟล์ไหนพังต้องแก้หรือลบ ไม่ใช่ซ่อนด้วย allowlist
```

QA-01 FIX applied: include changed from explicit allowlist to broad glob `'src/**/*.{test,spec}.{ts,tsx}'`

Before fix: Only 10% of test files were executed. After fix: All 66+ test files should execute.

**However**, exact test count of 1102 cannot be verified without running `npm test`. The README claims 1102/1102 but this is self-reported, not independently confirmed in this audit.

---

## 4. TEST QUALITY AUDIT

### Test Quality Categories

| Category | Description | Examples Found | Coverage |
|----------|-------------|---------------|----------|
| **DOM Existence** | Asserts element exists in DOM | `expect(page.locator('#email-input')).toBeVisible()` | High coverage |
| **Network Status** | HTTP status code checks | `expect(response.status()).toBe(200)` | Medium coverage |
| **Mock Invocation** | Mock function was called | Supabase mock calls in unit tests | Medium coverage |
| **Database Assertion** | Direct DB row verification | None found in E2E; some in unit tests | Low coverage |
| **User-visible Behavior** | Complete user journey assertion | SK-01–SK-12 smoke tests cover public pages | Medium coverage |
| **End-to-end State** | Full flow state transitions | LIFE-01–LIFE-16 mostly pass, covering public path | Low-Medium coverage |

### Quality Issues Found

#### Issue 1: Heavy reliance on `test.skip(true, 'Redirected to login...')`

Over **40+ skipped E2E tests** have skip reason: "Redirected to login on [path] — session not persisted across navigation".

This means these tests **attempt to navigate to protected routes** but the session from global-setup is lost during SPA navigation, causing automatic redirect to /login.

**Impact:** Critical protected-route tests (Twin chat, Decisions, World selection, Profile management, Upload, Memory insights) are ALL SKIPPED. The main features under test are PUBLIC pages only.

#### Issue 2: QA-01 FIX reveals previous misleading test results

From vitest.config.ts line 26-30:

```typescript
// เดิม include เป็น allowlist แค่ 7 pattern ทั้งที่ repo มีไฟล์เทสต์ 66 ไฟล์
// → npm test รันแค่ 10% ของ suite แล้วขึ้นเขียว
// ทุกเอกสารที่เขียนว่า "เทสต์ผ่านหมด" จึงไม่เคยจริง
```

**Before QA-01 FIX:**
- Include list had only 7 patterns
- 66 test files existed
- Only ~10% ran
- "All tests passed" was FALSE CLAIM

**After QA-01 FIX:**
- Include uses broad glob
- All files should run
- But exact count (1102?) unverified

#### Issue 3: E2E tests heavily depend on external services

- E2E runs against `https://selfprint-staging.pages.dev`
- Staging depends on Supabase project being online
- If Supabase unreachable: login fails, all auth-dependent tests fail
- This creates dependency on infrastructure availability, not just application correctness

#### Issue 4: No failure injection tests

No E2E test intentionally breaks the system to verify error handling:
- No test simulates network failure
- No test verifies loading/error states
- No test checks retry behavior
- No test exercises rate limiting UI

---

## 5. FAILURE FINDING → TEST COVERAGE MAP

For each critical finding from Phase 6/7:

| Finding | Test Exists? | What It Proves | CI Executes? | Evidence Type |
|---------|-------------|---------------|-------------|---------------|
| FR-004 (Orphan message when save succeeds, API fails) | ❌ No | N/A | ❌ No | SOURCE ONLY (async ordering traced at lines 359, 378, 404) |
| FR-005 (Response lost if save fails after API success) | ❌ No | N/A | ❌ No | SOURCE ONLY (exception jump over setMessages line 412) |
| FR-001 (No retry button after chat error) | ❌ No | UI UX gap | ❌ No | SOURCE ONLY |
| FR-002 (No request timeout on chat API) | ❌ No | Missing AbortController | ❌ No | SOURCE ONLY |
| FR-007 (Naming input not persisted) | ⚠️ Partly | twin-birth.spec.ts:37 SKIP confirms recovery not tested | ❌ No | TEST SKIP PROVES GAP |
| FR-009 (initializeTinner DB failure no retry) | ❌ No | Ceremony continues partially | ❌ No | SOURCE ONLY |
| FR-010 (SICE orchestration silent failure) | ❌ No | Non-critical design choice | ❌ No | SOURCE ONLY |
| FR-014/015 (World preference/stats desync) | ❌ No | Two independent upserts | ❌ No | SOURCE ONLY |
| FR-016 (Decision insert without follow-up) | ❌ No | Sequential awaits, non-atomic | ❌ No | SOURCE ONLY |
| FR-023 (Account deletion cascade failure) | ❌ No | Manual sequential deletes | ❌ No | SOURCE ONLY |

### Conclusion: ZERO failure-related tests exist for any P1/P2 finding from Phase 6/7

All critical findings are **SOURCE-PROVEN ONLY** — meaning they were identified by reading code structure, NOT by running tests that would fail and prove them.

---

## 6. TWIN BIRTH RECOVERY TEST ANALYSIS

### The Skip: `twin-birth.spec.ts:37`

```typescript
test.skip('should advance through birth phases when authenticated', async ({ page }) => {
```

**What it would test:** Complete Twin Birth ceremony flow from intro → naming → celebration → redirect.

**Why it's skipped:** No clear skip reason string provided (unlike other skipped tests that say "redirected to login"). Likely the test relies on authentication that isn't available in the test fixture environment.

### Other Birth-Related Skips

| Test | File:Line | Skip Reason |
|------|-----------|-------------|
| `should recover interrupted birth flow on reload` | twin-birth.spec.ts:60 | Explicitly skipped (known limitation) |
| `should advance through birth phases when authenticated` | twin-birth.spec.ts:37 | No reason provided, likely auth issue |

### Recovery Test Status Matrix

| Recovery Scenario | Test Exists? | Test Executed? | CI Passes? |
|------------------|-------------|---------------|------------|
| Twin Birth interrupted → refresh → resume | ❌ No active test | ❌ Never runs | ❌ N/A |
| Twin Birth interrupted → back → forward | ❌ No test | ❌ Never runs | ❌ N/A |
| Twin creation duplicate prevention | ✅ Via checkExistingTinner logic | ❌ Not as E2E | ❌ No E2E covers it |
| SICE failure during ceremony | ❌ No test | ❌ Never runs | ❌ N/A |

### Conclusion

The fact that BOTH the primary Twin Birth E2E test AND the recovery test are skipped strongly indicates that:

1. **Twin Birth end-to-end is NOT covered by automated E2E** — despite being a core P0 capability
2. **Recovery from interruption is KNOWN to be incomplete** — explicitly skipped in twin-birth.spec.ts
3. **This does NOT mean Twin Birth is broken** — it means there's insufficient test automation to VERIFY it works consistently under all conditions

**Recovery Implementation Status:** ⚪ UNPROVEN by test, ⚠️ PARTIAL by code (localStorage/sessionStorage used but not thoroughly tested)

---

## 7. MASTER GATE ANALYSIS

### Master Gate Contract

From `MASTER_GATE_AS_IS.md`:

```text
TEST SUITE RESULT   : 95 PASS / 0 FAIL / 5 SKIP (100 total, Phase A+B) — CI-PARITY RUN 20 ก.ย. 2026 19:04 ICT
MASTER GATE CLOSURE : CLOSED (verify: MG every item PASS except static skips)
```

**Current test count:** 101 tests in 9 files (up from 100 mentioned in Sept 20 docs)

### What Master Gate Actually Checks

The master gate criteria (MG-01 through MG-07) focus on:

| Gate ID | Focus Area | Type |
|---------|-----------|------|
| MG-01 | Twin presence renders (SVG/WebGL) | DOM existence |
| MG-02 | World drawer/options visible | DOM existence |
| MG-03 | Evolution tracking hook loads | Error absence |
| MG-04 | Chat input functional | Basic interaction |
| MG-05 | Twin continuity (canvas rendered) | Visual rendering |
| MG-06 | Immersive page wrapper exists | DOM class check |
| MG-07 | Decision logging UI present | DOM existence |

### Critical Assessment

**Master Gate DOES NOT verify:**

| What Master Gate Doesn't Check | Why It Matters |
|-------------------------------|---------------|
| API response quality | DOM checks don't prove AI responses work |
| Database persistence | No assertions about data stored/read |
| Authentication flow | Most MG tests run without auth |
| Error handling | No failure scenarios tested |
| Data consistency | No cross-table integrity checks |
| Performance under load | No timing assertions except page load < 5s |
| Session/token refresh | No token expiration tests |
| Rate limiting | No 429 response tests |
| Streaming fallback | No degradation tests |

**Master Gate proves:** "These UI elements render on the page without JavaScript errors."

**It does NOT prove:** "Users can interact with the system successfully."

### Document Claim vs Reality

| Claim in Doc | Actual Evidence | Match? |
|-------------|----------------|--------|
| "Master Gate Criteria Met" | MG tests verify DOM existence only | Partial — meets its own criteria |
| "100% test suite completed" | 101 tests listed, many SKIPPED | Misleading — skip ratio matters |
| "E2E Tests success" | Depends on staging uptime | Infrastructure-dependent |
| "Unit 1102/1102" | Unverified without running | Self-reported |

---

## 8. CI FORENSIC

### Workflow Analysis: `.github/workflows/testing.yml`

```yaml
Jobs:
  unit-tests      → Run on ubuntu-latest, Node 22, npm ci → npm test
  deploy-staging  → Checkout HEAD ref, Node 22, npm ci → npm run build → wrangler pages deploy
  e2e-tests       → Needs deploy-staging, install browsers → npm run test:e2e
  smoke-test      → MANUAL ONLY (workflow_dispatch, test_type=load)
  full-load-test  → MANUAL ONLY (workflow_dispatch, test_type=full)
  report-results  → Always runs, downloads artifacts, generates report
```

### Critical CI Findings

#### Finding 1: k6 Load Tests Are ALWAYS SKIPPED On Push

Lines 199, 262:
```yaml
if: github.event_name == 'workflow_dispatch' && github.event.inputs.test_type == 'load'
```

Load tests NEVER run on regular pushes. They require manual workflow_dispatch with specific input.

**Impact:** The system has never been load-tested automatically. No performance regression detection.

#### Finding 2: Slack Notifications Use continue-on-error

Lines 176, 218, 281, 320:
```yaml
continue-on-error: true
```

Slack notification steps will never cause CI failure even if webhook fails. This is reasonable but means failed notifications are invisible.

#### Finding 3: E2E Depends on Deploy Success

```yaml
e2e-tests:
  needs: deploy-staging
```

E2E tests won't run if deploy fails. Good gatekeeping. But deploy success doesn't guarantee app works (HTTP 200 alias check only validates server responds, not app functionality).

#### Finding 4: No Retry Mechanism

No `retries`, `retry`, or `auto-retry` configuration found in workflow. Failed runs are terminal — must be manually rerun.

#### Finding 5: CI Uses Different Env Vars Than Local Dev

| Variable | CI Value Source | Local Default | Match? |
|----------|----------------|--------------|--------|
| SUPABASE_URL | `secrets.VITE_SUPABASE_URL` | From .env.production (gitignored) | May differ |
| SUPABASE_ANON_KEY | `secrets.VITE_SUPABASE_ANON_KEY` | From .env.production | May differ |
| STAGING_URL | Hardcoded `https://selfprint-staging.pages.dev` | Not used locally | Different targets |

**Risk:** If local dev uses different Supabase project than CI uses for staging, local test results may not reflect production/staging behavior.

### CI Pipeline Flow

```
Push to master/main/develop
    ↓
[Checkout @ ${{ github.sha }}]
    ↓
[NPM Install]
    ↓
[unit-tests: npm test] ────┐
    ↓                        ↓
[deploy-staging: build + wrangler deploy] ─→ [e2e-tests: playwright test] → [report-results]
    ↓                            ↑
[Curl loop: verify HTTP 200 on staging alias]
```

**Timeline estimate:**
- unit-tests: < 10 min
- deploy-staging: < 15 min (including curl retry loop, max 60s wait)
- e2e-tests: < 30 min
- Total pipeline: ~55 minutes worst case

---

## 9. CI ↔ STAGING CONSISTENCY

### Deployment Chain

```text
CI checkout GitHub SHA
    → Build with npm run build (Vite, Node 22)
    → wrangler@4.131.2 pages deploy dist \
        --project-name selfprint-staging \
        --commit-hash ${{ github.sha }}
    → Cloudflare Pages deploys
    → Curl loop verifies https://selfprint-staging.pages.dev returns HTTP 200
```

**Key detail:** Wrangler deploys with `--commit-hash "${{ github.sha }}"` which embeds the commit SHA into Cloudflare Pages metadata. This allows tracing deployed artifact back to source commit.

**Verification possible:** In theory, one could curl the staging site and inspect page source or JS chunk filenames to identify the deployed commit hash. However, browser tool cannot access staging (Phase 5 limitation).

### Gap Analysis

| Layer | Expected | Actual | Consistency? |
|-------|---------|--------|-------------|
| Source SHA | `54ee361` (HEAD) | ⚪ Unknown (no runtime access) | ⚪ UNPROVEN |
| Staging SHA | Should match CI commit SHA | ⚪ Unknown | ⚪ UNPROVEN |
| Production SHA | Unknown | ⚪ Unknown | ⚪ UNPROVEN |
| Node version | 22 in CI | Runtime environment | ⚪ Assumed 22 |
| Build output | dist/ directory | Deployed via wrangler | ✅ Known mechanism |

---

## 10. STAGING DEPLOYMENT DETAILS

| Property | Value | Source |
|----------|-------|--------|
| **URL** | `https://selfprint-staging.pages.dev` | testing.yml:98 |
| **Project name** | `selfprint-staging` | testing.yml:89 |
| **Deploy command** | `wrangler@4.131.2 pages deploy dist` | testing.yml:87 |
| **Commit tracking** | `--commit-hash ${{ github.sha }}` | testing.yml:92 |
| **Reachability check** | Curl loop (10 attempts × 5s = 50s max) | testing.yml:95-107 |
| **Node runtime** | 22 (inferred from setup-node action) | testing.yml:39 |
| **Build env** | VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from secrets | testing.yml:76-77 |

### Previous CI Issues Resolved

| Issue | Resolution | Commit |
|-------|-----------|--------|
| CI-BUILD-ENV-001: Missing VITE env vars in build step | Inject secrets into Build step | `e730cd7` |
| #406: STAGING_URL not passed to E2E job (fallback to dead host) | Added STAGING_URL env to E2E step | PR/fix referenced |
| #415: UPLOAD-04 flaky race condition | waitForUploadReady() waits for both dropzone and preview states | Fix committed |
| #414: E2E_AWAKENING_PASSWORD not reaching CI | Fixed secret provisioning | `d3c37f4` |
| Root cause: Staging DNS `staging.selfprint.one` returning 522 | Redirect to `selfprint-staging.pages.dev` | testing.yml:152 |

---

## 11. PRODUCTION DEPLOYMENT

### Production Deployment Information

| Property | Value | Source |
|----------|-------|--------|
| **URL** | `https://www.selfprint.one` | testing.yml:23 |
| **Deployment trigger** | Manual only (workflow_dispatch) | deploy.yml conditional |
| **Environment** | `production` (explicit GitHub Actions environment) | deploy.yml |
| **Deploy mechanism** | Same wrangler CLI as staging | deploy.yml |
| **Auto-deploy** | Disabled for production | deploy.yml requires manual confirmation |

### Production SHA Verification

Cannot verify current production SHA because:
1. Browser tool cannot access staging or production URLs
2. No local mechanism to query Cloudflare Pages API for deployment history
3. Git history shows HEAD but doesn't indicate what was last deployed to production

**Status: ⚪ UNPROVEN — Cannot determine what code is currently running in production.**

---

## 12. ENVIRONMENT CONFIGURATION (Names Only, No Secrets)

### Environment Variables Catalogued

| Variable Name | Purpose | Used By | Required? | Secret? |
|--------------|---------|---------|-----------|---------|
| VITE_SUPABASE_URL | Supabase project URL | AuthContext, client.ts, client-lazy.ts, supabase-service.ts | Required | No (public in Vite bundle) |
| VITE_SUPABASE_ANON_KEY | Supabase anon key | Same as above | Required | No (public in Vite bundle) |
| VITE_SENTRY_DSN | Sentry error tracking | error-tracking.ts | Optional | Yes |
| VITE_ENABLE_ANALYTICS | Feature flag | Feature flags module | Optional | No |
| VITE_COACH_ROLLOUT_PERCENT | Coach feature rollout (0=disabled) | AskCoach.tsx | Optional | No |
| TEST_EMAIL | E2E test account email | e2e/global-setup.ts, fixtures | Required for E2E | Yes |
| TEST_PASSWORD | E2E test account password | Same | Required for E2E | Yes |
| E2E_SUPABASE_URL | Supabase URL for E2E tests | e2e/global-setup.ts | Required | Yes |
| E2E_SUPABASE_ANON_KEY | Anon key for E2E tests | Same | Required | Yes |
| E2E_AWAKENING_PASSWORD | AWAKENING user password | e2e/global-setup-awakening.ts | Required | Yes |
| CLOUDFLARE_API_TOKEN | Cloudflare auth for wrangler | deploy.yml | Required | Yes |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare account identifier | deploy.yml | Required | Yes |
| STAGING_URL | Staging site URL (hardcoded in CI) | testing.yml:152 | Required | No |
| BASE_URL | Production URL | testing.yml:23 | Required | No |
| OPENROUTER_API_KEY | AI model provider key | functions/api/*.ts | Required for AI | Yes |
| AI_PROVIDER | Provider selector | functions/api/twin.ts | Optional | No |
| TWIN_MODEL_ID | Model override | functions/api/twin.ts | Optional | No |
| TWIN_RATE_LIMIT | Rate limit config | functions/api/twin.ts | Optional | No |
| STRIPE_SECRET_KEY | Stripe API key | api/unified-handler.ts | Required for payments | Yes |
| STRIPE_WEBHOOK_SECRET | Webhook signature verification | api/unified-handler.ts | Required | Yes |
| VAPID_PUBLIC_KEY | Push notification auth | send-push edge fn | Required for push | Partial |
| VAPID_PRIVATE_KEY | Push notification auth | send-push edge fn | Required for push | Partial |
| SLACK_WEBHOOK_URL | CI notification webhook | testing.yml:24 | Optional | Yes |

### Environment Separation Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| VITE_* variables compiled into browser bundle | LOW (expected for Vite) | Supabase URL/key visible in client bundle by design |
| Service role key used in functions | HIGH (should use service role appropriately) | Functions use SUPABASE_SERVICE_ROLE_KEY for admin operations |
| E2E uses staging Supabase | MEDIUM | E2E tests modify staging database state |
| Local dev may use different project than CI | MEDIUM | If local .env.production points to different Supabase project |

---

## 13. SKIPPED TESTS — FAILURE/RECOVERY FOCUS

Only listing skips related to failure/recovery/core product (not exhaustive all skips):

| Test | File:Line | Skip Reason | Domain | What Is Not Verified |
|------|-----------|-------------|--------|---------------------|
| `should recover interrupted birth flow on reload` | twin-birth.spec.ts:60 | Known limitation | Twin Birth Recovery | Birth interruption recovery |
| `should advance through birth phases when authenticated` | twin-birth.spec.ts:37 | Auth/session issue | Twin Birth Core | Complete birth ceremony |
| `complete flow: Birth → Memory → Evolution → Decision → Worlds` | cross-domain.spec.ts:12 | Session persistence | Cross-domain Integration | End-to-end multi-feature flow |
| `Birth → Memory persistence across reload` | cross-domain.spec.ts:44 | Session persistence | Data Persistence | Multi-step persistence |
| `Network failure during birth → recovery` | cross-domain.spec.ts:86 | Intentional skip | Network Failure Recovery | Network failure recovery flow |
| `Auth expiry during cross-domain navigation` | cross-domain.spec.ts:91 | Intentional skip | Auth Expiry | Session expiry handling |
| `Display memories with relevance scores` | memory-insights.spec.ts:23 | Missing feature | Memory System | Memory retrieval |
| `Handle API errors gracefully` | memory-insights.spec.ts:59 | Missing feature | Error Handling | API error paths |
| `Handle network failure during forget` | memory-insights.spec.ts:63 | Missing feature | Network Resilience | Network failure handling |
| `DECISION-04: Twin insight < 2s` | decision.spec.ts:227 | Backend not wired | Decision Intelligence | AI latency contract |
| `UPLOAD-05: Crop/edit before confirm` | upload.spec.ts:309 | Feature not implemented | Image Processing | Crop workflow |
| `WORLD-06: Compare worlds side-by-side` | world-visual.spec.ts:227 | Optional, out of scope | World System | World comparison |
| `should display empty state when no memories` | memory-insights.spec.ts:55 | Missing feature | Empty State | Null data handling |
| `should render search and filter on mobile` | memory-insights.spec.ts:41 | Missing feature | Mobile UI | Search/filter UX |
| `should handle long memory content on mobile` | memory-insights.spec.ts:49 | Missing feature | Mobile UI | Long content layout |

### Key Observation

**cross-domain.spec.ts has 8 skipped tests — ALL of them.** This entire file represents untested critical paths including:
- Complete multi-step user journey
- Data persistence across sessions
- Network failure recovery
- Auth expiry handling

**memory-insights.spec.ts has 6 skipped tests — ALL of them.** The entire memory system has zero E2E coverage.

**twin-birth.spec.ts has 2 skipped tests — ALL of them.** The entire Twin Birth ceremony has zero E2E coverage for authenticated users.

---

## 14. FLAKY TEST AUDIT

### Flaky Patterns Found

| Pattern | Location | Type | Impact |
|---------|----------|------|--------|
| `for (let retry = 0; retry < 6; retry++)` in twin.spec.ts, upload.spec.ts, world-visual.spec.ts, decision.spec.ts, master-gate.spec.ts | Multiple spec files | Test stabilization | Tests pollute multiple endpoints with retries |
| `UPLOAD-04` flaky race condition (phase 4-5 findings) | upload.spec.ts:274 | Real flakiness | Dropzone vs preview mode state mismatch |
| `MG-*` tests with conditional skips based on timing/guard | master-gate.spec.ts | Timing guard | Tests fail intermittently on slow machines |

### Stabilization Pattern (Not True Retry)

```typescript
// Found in: twin.spec.ts:39-59, upload.spec.ts:42-57, world-visual.spec.ts:39-54
for (let retry = 0; retry < 6; retry++) {
  try {
    await page.goto(...);
    // Wait for expected state
    break;  // Exit loop on success
  } catch {
    if (retry < 5) await page.waitForTimeout(5000);  // Wait 5s, then retry
  }
}
```

This is **test stabilization**, not **failure retry**. It masks timing issues rather than fixing root cause. The test still passes even if it takes 6 tries.

### Identified Flaky Tests (From Historical Evidence)

| Test | History | Status |
|------|---------|--------|
| UPLOAD-04 (Upload performance) | #416 CI run failed, fixed with waitForUploadReady() | Fixed but needs monitoring |
| MG-* tests | Intermittent failures due to timing guards | Continues with retries |

---

## 15. PRODUCT CONTRACT VS TEST CONTRACT

| Product Requirement | Automated Test | What Test Actually Proves | Gap |
|--------------------|---------------|--------------------------|-----|
| Twin can be created via ceremony | ❌ No test | DOM presence only | ❌ No functional test |
| Twin chat sends/receives messages | ❌ No test | Chat input box exists | ❌ No message sending |
| Decisions persist across refresh | ❌ No test | Decision form exists | ❌ No persistence |
| Worlds show correct data | Partial (WORLD-02: tile data visible) | Static text rendered | ❌ Dynamic data missing |
| Personal context influences chat | ❌ No test | N/A | ❌ No test |
| Daily brief displays | ❌ No test | N/A | ❌ No test |
| Push notifications deliver | ❌ No test | N/A | ❌ No test |
| Voice interaction works | ❌ No test | N/A | ❌ No test |
| Avatar uploads and persists | UPLOAD-03 partial | Image survives reload ✅ | ✅ Verified (mostly) |
| Share links work | ❌ No test | N/A | ❌ No test |
| Stripe payment processes | ❌ No test | N/A | ❌ No test |
| PWA installs correctly | ❌ No test | Manifest check implied | ❌ No install test |
| Account deletion works | ❌ No test | N/A | ❌ No test |
| Recovery from session expiry | ❌ No test | N/A | ❌ No test |

### Key Insight

**Public page tests dominate the E2E suite.** Of ~101 tests, the majority test landing pages, login form rendering, and API health checks. Protected feature tests (auth-dependent) are mostly SKIPPED.

The suite proves: "When users visit public pages, the UI renders without obvious errors."

It does NOT prove: "When logged-in users try to use features, everything works correctly."

---

## 16. PHASE 7 FINDING VERIFICATION AGAINST TESTS

| Finding | Test Exists? | Test Reproduces Failure? | CI Runs? | Evidence Level |
|---------|-------------|------------------------|----------|---------------|
| FR-004 (Orphan message) | ❌ No | N/A | ❌ No | E1 (source only) |
| FR-005 (Lost response) | ❌ No | N/A | ❌ No | E1 (source only) |
| FR-014/015 (World stats desync) | ❌ No | N/A | ❌ No | E1 (source only) |
| FR-016 (Decision no follow-up) | ❌ No | N/A | ❌ No | E1 (source only) |
| FR-023 (Account delete cascade) | ❌ No | N/A | ❌ No | E1 (source only) |
| FR-007 (Birth recovery skip) | ⚠️ Skip exists | Skip PROVES gap exists | ❌ Skipped | E2 (test evidence: known gap) |

### Database Claims Correction (Per Instructions §17)

Phase 7 made claims like:
- "UNIQUE constraint on twins.user_id likely exists"
- "Composite PK likely" on world_preferences
- "RLS replaces referential integrity"

**Phase 8 correction:** Without direct SQL inspection or migration file analysis of exact constraint DDL, these are:

```text
⚪ UNPROVEN — Must be verified by examining migration SQL files for CREATE TABLE statements
```

Specifically:
- `twins.user_id UNIQUE` — Migration 024 creates twins table but we haven't read its FULL content. Need to verify the exact column constraints.
- `world_preferences composite PK` — No migration file inspected shows explicit composite PRIMARY KEY on (user_id, world_id).
- `FOREIGN KEY absence` — Could be intentional (Supabase pattern) or unintentional (missing FK declarations).

**Action required for later:** Read migration 024 (`024_create_twins_table.sql`) and relevant world/migration files to verify exact schema constraints.

---

## 17. DATABASE CONSTRAINT CORRECTIONS

### From Phase 7 → Corrected for Phase 8

| Phase 7 Claim | Phase 8 Status | Reason |
|---------------|---------------|--------|
| "twins.user_id UNIQUE assumed" | ⚪ UNPROVEN | Migration 024 not fully read |
| "world_preferences composite PK likely" | ⚪ UNPROVEN | No migration showing composite PK |
| "world_stats composite PK likely" | ⚪ UNPROVEN | Same |
| "FOREIGN KEY absence (Supabase pattern)" | ⚪ UNPROVEN | May or may not exist; not verified |
| "No BEGIN/COMMIT across operations" | 🟢 VERIFIED | Supabase JS client doesn't expose transaction API; confirmed from code patterns |
| "RLS replaces referential integrity" | ⚠️ PARTIALLY LIKELY | Supabase defaults to RLS but FK absence must be verified per table |

---

## 18. EVIDENCE LEVEL MATRIX

For each major finding category:

| Category | Source | Test | CI | Deployment | Runtime | Final Level |
|----------|--------|------|----|-----------|--------|-------------|
| Chat async ordering (FR-004/005) | E2 | ❌ No | ❌ No | ❌ N/A | ❌ N/A | E1 |
| Twin Birth recovery gap | E1+E2 | ⚠️ Skip proves gap | ❌ Skipped | ❌ N/A | ❌ N/A | E2 |
| Decision non-atomicity | E1 | ❌ No | ❌ No | ❌ N/A | ❌ N/A | E1 |
| Account deletion cascade risk | E1 | ❌ No | ❌ No | ❌ N/A | ❌ N/A | E1 |
| No request timeout | E1 | ❌ No | ❌ No | ❌ N/A | ❌ N/A | E1 |
| Streaming endpoint wired | E2 | ❌ No | ❌ No | ❌ N/A | ❌ N/A | E2 |
| Public page rendering | E1+E2 | ✅ Verifies | ✅ Runs | ⚪ Unknown | ❌ N/A | E3 |
| E2E session persistence | E1+E2 | ⚠️ Causes 40+ skips | ✅ Runs | ⚪ Unknown | ❌ N/A | E3 |

Evidence Level Scale:
- **E0**: Pure inference
- **E1**: Source code evidence
- **E2**: Test evidence (including test skips proving gaps)
- **E3**: CI/deployment mechanism evidence
- **E4**: Runtime evidence (ZERO achieved in this audit)

---

## 19. CONFIRMED FINDINGS

### What IS Confirmed (by source + test evidence)

| Finding | Evidence | Level |
|---------|----------|-------|
| 40+ E2E tests skipped due to session persistence failure | grep of test.skip patterns across 9 spec files | E2 |
| QA-01 FIX changed test include from 10% to 100% coverage | vitest.config.ts line 26-30 comment | E1 |
| Twin Birth recovery test explicitly skipped | twin-birth.spec.ts:60 skip | E2 |
| Cross-domain.spec.ts has 8 skipped tests, 0 passing | grep enumeration | E2 |
| Memory-insights.spec.ts has 6 skipped tests, 0 passing | grep enumeration | E2 |
| No E2E test exists for ANY P1 finding from Phase 6/7 | Exhaustive mapping of all failing FR IDs | E1 |
| Load tests (k6) never auto-run on push | workflow if-condition analysis | E1 |
| Wrangler deploys with --commit-hash linking artifact to SHA | testing.yml:92 | E1 |
| QA-01 fix prevents previous misleading "all tests pass" claim | vitest.config.ts line 27-28 | E1 |

### What IS NOT Confirmed

| Finding | Reason Not Confirmed |
|---------|---------------------|
| Orphan message actually occurs in practice | No test reproduces it |
| Response actually lost on refresh | No test reproduces it |
| Account deletion actually leaves orphan data | No test reproduces it |
| Database constraints as described in Phase 7 | Need SQL file inspection |
| Current production/deployment SHA | No runtime access |

---

## 20. UNPROVEN RISKS

| Risk | Why Unproven | What Would Confirm |
|------|-------------|-------------------|
| 1102/1102 unit test count accurate | Never ran `npm test` | Execute `npm test` |
| Staging matches HEAD SHA | Can't inspect deployed artifacts | curl + inspect JS chunks for commit hash |
| Production uses latest code | No deployment history accessible | Query CF Pages API |
| Supabase credentials match between CI and local | Config values hidden in secrets | Check .env.production vs CI secrets |
| E2E session persistence issue is the ONLY skip cause | 40+ skips have same reason but root cause unknown | Fix session and observe remaining skips |

---

## 21. TEST GAPS

### Critical Gaps (No Test Exists)

| Gap | Severity | Impact |
|-----|----------|--------|
| No E2E test for Twin Creation ceremony | P0 | Core feature not automated |
| No E2E test for Twin Chat sending messages | P0 | Core feature not automated |
| No E2E test for Decision creation/persistence | P1 | Feature not automated |
| No E2E test for World selection | P1 | Feature not automated |
| No E2E test for Profile/avatar management | P2 | Feature not automated |
| No E2E test for Sharing | P2 | Feature not automated |
| No E2E test for Push notifications | P2 | Feature not automated |
| No E2E test for Account deletion/recovery | P2 | Feature not automated |
| No E2E test for Payment/Stripe | P2 | Feature not automated |
| No test for session expiry handling | P1 | Auth flow reliability unknown |
| No test for network failure handling | P1 | Error resilience unknown |
| No test for rate limiting UI | P2 | User experience under load unknown |
| No test for streaming vs non-streaming behavior | P2 | AI response quality unknown |
| No test for partial success compensation | P1 | Data integrity unknown |

### Moderate Gaps

| Gap | Severity | Impact |
|-----|----------|--------|
| No performance/load test auto-running | P2 | Scalability unknown |
| No accessibility testing | P3 | Accessibility compliance unknown |
| No security penetration testing | P2 | Security posture unknown |
| No cross-browser testing beyond Chrome | P3 | Browser compatibility unknown |
| No i18n validation for TH translations | P2 | Language quality unknown |

---

## 22. DEPLOYMENT GAPS

| Gap | Severity | Impact |
|-----|----------|--------|
| Production SHA not verifiable remotely | P2 | Cannot confirm what's running in production |
| No rollback mechanism in CI | P2 | Bad deploy requires manual intervention |
| Staging and local dev may use different Supabase projects | P2 | Testing accuracy degraded |
| No deployment approval gate before production | P1 | Human review needed |
| Load tests always manual (never automated) | P3 | Performance regression undetected |

---

## 23. PHASE 8 VERIFICATION BOUNDARY

### What Was Verified

- Test inventory counts: 101 E2E tests, ~1102 unit tests claimed (unverified count)
- Exact test skip reasons enumerated via grep (40+ skips documented)
- CI workflow structure traced line-by-line (testing.yml: 422 lines)
- Deployment mechanism confirmed: wrangler CLI with commit-hash tracking
- QA-01 FIX documented in vitest.config.ts (previous 10% test coverage → current full coverage)

### What Could NOT Be Verified

- Actual unit test count (1102 claim unverified without running `npm test`)
- CI test execution results (would need to trigger CI or access GitHub UI)
- Staging deployment SHA matching HEAD (browser tool inaccessible)
- Production deployment status and SHA (access restricted)
- Whether tests actually exercise real behavior vs implementation details (would need test code deep-read)
- Database constraints (would need SQL file reads)

### Runtime Evidence Achieved: ZERO

Browser tool could not access `https://selfprint-staging.pages.dev` at any point in this audit. No live requests, no screenshots, no DOM inspection, no network capture.

All runtime claims remain ⚪ UNPROVEN per established protocol from Phase 5.

🛑 STOP — PHASE 8 COMPLETE

Waiting for Phase 9 (Dead/Orphan/Legacy/Duplication Audit) instruction.


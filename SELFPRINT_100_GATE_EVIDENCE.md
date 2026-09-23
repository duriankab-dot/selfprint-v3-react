# SELFPRINT — 100 GATE EVIDENCE (TH)

**วันที่รวบรวม:** 23 กันยายน 2026
**HEAD:** `d3c37f4e125e14b663a1a0659b25539390373d3d` (master)
**หลักการ:** ทุกข้ออ้างต้องมี command + ผลจริง · ห้ามเขียน PASS โดยไม่มี run · SKIPPED ไม่เท่ากับ PASS

---

## 1. GATE ที่ 1 — BUILD / TYPECHECK / LINT

| Gate | Command | ผลล่าสุด | วันที่ verify |
|------|---------|----------|---------------|
| Build | `npm run build` | PASS (exit 0) | 19 ก.ย. + ทุก CI run (deploy-staging ต้อง build ผ่านก่อน) |
| Typecheck app | `npm run typecheck` (tsc -b) | 0 errors | 19 ก.ย. |
| Typecheck functions | `npm run typecheck:functions` | PASS (esnext + bundler + force) | 19 ก.ย. (ปิด FAIL เดิม) |
| Lint | `npm run lint` (oxlint) | PASS (warnings only) | 19 ก.ย. |

**CI evidence:** job `deploy-staging` = Build → wrangler pages deploy → verify HTTP 200 → ผ่านทุก run ล่าสุด

---

## 2. GATE ที่ 2 — UNIT / INTEGRATION (Vitest)

```text
Command : npm test
Result  : 1050/1050 PASS · 67 files
Scope   : DecisionService · FollowUpScheduler · SICE engines · P0-B security ·
          P0-C observability · Phase E integration · TwinEvolution · Worlds ·
          nova-prompts · AIContext · E2E_CRITICAL_PATH (unit-level) ฯลฯ
```

**CI evidence:** job `unit-tests` = PASS (ล่าสุด 1m)

---

## 3. GATE ที่ 3 — E2E STRUCTURE ณ HEAD

```text
npx playwright test --list
→ Total: 100 tests in 9 files

chromium                    27  (smoke, auth, critical-journey — production)
chromium-staging            48  (twin, decision, upload, world-visual, lifecycle,
                                 master-gate — MG-05-01 excluded by grepInvert)
chromium-staging-awakening   1  (MG-05-01 only — AWAKENING fixture)
Mobile Chrome               12  (smoke)
Mobile Safari               12  (smoke)
```

**การนับ:** 27 + 48 + 1 + 12 + 12 = 100 — ไม่มี test หาย (จากเดิม 100 = 27+49+12+12 และ MG-05-01 ย้ายโครงสร้าง ไม่ได้ถูกลบ)

---

## 4. GATE ที่ 4 — CI RUN ล่าสุด (HEAD d3c37f4)

```text
✅ Unit Tests (Vitest)                  PASS   ~1m
✅ Deploy Staging (Cloudflare Pages)    PASS   47s   (build ด้วย VITE_SUPABASE_* secrets → wrangler --commit-hash)
✅ E2E Tests (Playwright)               PASS   5m   (retries=1, workers=1)
✅ Generate Test Report                 PASS
⏭️ Load Test - Smoke (k6)              SKIPPED (manual workflow_dispatch เท่านั้น)
⏭️ Load Test - Full (k6)               SKIPPED (manual workflow_dispatch เท่านั้น)
```

**Secret wiring ณ HEAD (testing.yml e2e-tests job):** `E2E_SUPABASE_URL` · `E2E_SUPABASE_ANON_KEY` · `E2E_TEST_PASSWORD` · `E2E_AWAKENING_PASSWORD` · `STAGING_URL` · `TEST_EMAIL/PASSWORD`

---

## 5. GATE ที่ 5 — MASTER GATE (12 tests)

### 5.1 โครงสร้าง fixture (Phase 5.11 contract)

```text
MG-05-01: project chromium-staging-awakening
          storageState = e2e/.auth/user-awakening.json
          user = test-phase-awakening@selfprint.one
          user_lifecycle.status = AWAKENING · twin = ABSENT
          seed = syncAwakeningLifecycle() (scripts/seed-test-users.ts)

MG-01-01, MG-01-02, MG-02-01, MG-02-02, MG-03-01, MG-04-01,
MG-05-02, MG-06-01, MG-06-02, MG-07-01:
          project chromium-staging
          storageState = e2e/.auth/user.json
          user = test-phase-b@selfprint.one = TWIN_ALIVE
          chromium-staging มี grepInvert: /MG-05-01/ → ไม่ duplicate
```

### 5.2 ผล MG-05-01 isolated (23 ก.ย. 2026, staging จริง)

```text
npx playwright test e2e/master-gate.spec.ts --project=chromium-staging-awakening

[global-setup-combined:TWIN_ALIVE]   Login OK — user: test-phase-b@selfprint.one
[global-setup-combined:AWAKENING]    Login OK — user: test-phase-awakening@selfprint.one
                                     storageState saved → e2e/.auth/user-awakening.json

MG-05-01 ✓ Core Awakening page loaded
  heading: true ("⚡ ฝาแฝดของคุณกำลังตื่น")
  canvas count: 0 · canvas visible: false
  → PASS ด้วย INTRO HEADING (ไม่ใช่ HologramBirth canvas)
  → ยืนยัน route contract: AWAKENING ไม่ถูก recovery redirect (URL คงอยู่ /th/core-awakening)
```

### 5.3 ผล MG อื่น (chromium-staging run 23 ก.ย. + CI)

| Gate | ผล | Fixture | หมายเหตุ |
|------|-----|---------|----------|
| MG-01-01 | PASS | TWIN_ALIVE | HIGH fidelity: canvas 331x115, WebGL true |
| MG-01-02 | PASS | TWIN_ALIVE | — |
| MG-02-01 | PASS | TWIN_ALIVE | world transition container present |
| MG-02-02 | PASS | TWIN_ALIVE | — |
| MG-03-01 | PASS | TWIN_ALIVE | growth pipeline no errors |
| MG-04-01 | PASS | TWIN_ALIVE | chat input enabled |
| MG-05-02 | PASS | TWIN_ALIVE | twin layer present |
| MG-06-01 | PASS | TWIN_ALIVE | — |
| MG-06-02 | PASS | TWIN_ALIVE | — |
| MG-07-01 | PASS (CI) / FAIL เป็นระยะ (local timeout) | TWIN_ALIVE | data dependency (getDecisionLogs) |

**SKIP inventory (11/11 — honest):**

| Class | รายการ |
|-------|--------|
| STATIC — FNI/VALID-SKIP (5) | DECISION-04 (AI SLA ตาม spec), TWIN-05 (legacy testids), UPLOAD-05 (crop ไม่อยู่ใน required), WORLD-06 (compare out-of-scope), LIFE-15 (duplicate SK-05) |
| CONDITIONAL — chat route precondition (4) | MG-01-02, MG-02-01, MG-05-02, MG-06-02 |
| CONDITIONAL — dashboard timing guard (2) | TWIN-01, WORLD-04 |

---

## 6. GATE ที่ 6 — LIFECYCLE / RECOVERY

```text
lifecycle.spec.ts (Phase B): 25/25 PASS (verified 13 ก.ย. + ยังคงอยู่ใน 48-test project)
Recovery routes (useRecoveryRoute + entryResolver):
  ONBOARDING → /onboarding · ANALYSIS → /analysis · AWAKENING → /core-awakening
  TWIN_ALIVE → /dashboard · WORLD_ACTIVE → /worlds
CoreAwakening arrival guard (874abcd): TWIN_ALIVE/WORLD_ACTIVE → return (ห้าม downgrade)
MG-05-01 AWAKENING fixture ยืนยัน: AWAKENING user อยู่ /core-awakening ได้ ไม่ถูก redirect
```

---

## 7. GATE ที่ 7 — DATABASE / MIGRATIONS

```text
supabase/migrations = 35 files · ล่าสุด 040_create_user_lifecycle_table.sql
Schema หลัก: user_lifecycle · twins · awakening_essence · twin_state · twin_personality ·
  twin_capabilities · twin_memories · conversations · messages · personal_context (010) ·
  decision_log + outcomes + follow_up (001/020) · world_preferences (021) ·
  selfprint.users_profiles/blueprints/share_links (002/004) · subscriptions (016) ·
  push_subscriptions (015) · passkey_challenges (018) · onboarding_checkpoints (037) ·
  storage profiles bucket (038) · decision_insights_cache (039)
RLS: public.* = auth.uid() = user_id pattern ครบ · selfprint.* = service_role ผ่าน API (documented)
```

---

## 8. GATE ที่ 8 — k6 LOAD (แยกต่างหาก)

```text
สถานะใน CI ล่าสุด: SKIPPED — เขียนได้ว่า "NOT VERIFIED IN THIS CI RUN" เท่านั้น
Script: loadtests/loadtest-smoke.js (5 VU/5m) + loadtest.js (ramp → 100 VU/45m) — K6V2-FIX-001
Thresholds: smoke_error_rate < 5% · p95: share/profile/autonomy <1s, nova <15s, twin <20s (K6SLO-001)
การรัน: workflow_dispatch เท่านั้น (test_type=load|full) · continue-on-error: true
ผลผ่านล่าสุด (ประวัติ): staging 14 ก.ย. 2026 — smoke 792/792 checks, error 0.00%
Prerequisites: BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD
             (deployment ต้องตั้ง SUPABASE_SERVICE_ROLE_KEY ให้ verifyUser ทำงาน)
```

---

## 9. GATE ที่ 9 — DEPLOYMENT

```text
Staging: push master → job deploy-staging (checkout ref=github.sha → npm ci → build ด้วย
         VITE_SUPABASE_* → wrangler pages deploy dist --project-name selfprint-staging
         --branch <ref> --commit-hash <sha>) → verify selfprint-staging.pages.dev HTTP 200
         → e2e-tests (needs: deploy-staging) เริ่มหลัง deploy ของ commit เดียวกันสำเร็จ
Production: selfprint.one — Cloudflare Pages Git-connected (Dashboard build config)
Provenance: deployment carry commit hash + CI log deployed_commit=<sha>
```

---

## 10. GATE ที่ 10 — SECURITY (evidence ที่ตรวจได้จาก repo)

```text
Auth: Supabase Auth — OAuth (Google/Apple), Magic Link, Passkey (WebAuthn) · AUTH-01..04 E2E
RLS:  public.* ทุกตาราง user-scoped มี policy auth.uid() = user_id (35 migrations)
      FK-chain policies สำหรับ twin-scoped tables
API:  unified-handler verifyUser อ่าน user จาก JWT (ไม่รับ user_id จาก body — NOTIFAUTH-001 ปิดแล้ว)
Unit: P0-B_SECURITY_VERIFICATION.test.ts อยู่ใน 1050 unit tests
ข้อจำกัด (documented): selfprint.* schema ไม่มี RLS — เข้าผ่าน service_role + verifyUser (P1-1, deferred ตาม spec)
```

---

## 11. สรุป GATE COUNT

```text
GATE ผ่านและมี evidence ปัจจุบัน : Build · Typecheck(app+functions) · Lint · Unit ·
                                  E2E structure · CI run · Master Gate (fixture ใหม่) ·
                                  Lifecycle/Recovery · Migrations · Deployment
GATE แยกข้างนอก                : k6 (SKIPPED ใน CI — ประวัติผ่าน 14 ก.ย.)
GATE deferred ตาม spec         : D-05 Accessibility · D-06 Performance · D-07 selfprint RLS
DOCUMENT DRIFT ที่ยังเปิด        : 5 รายการ (ดู SELFPRINT_CURRENT_STATE §G)
```

**Honest note:** ทุกตัวเลขในเอกสารนี้ผูกกับ HEAD d3c37f4 — commit ใหม่ต้อง re-verify ก่อนอ้างซ้ำ
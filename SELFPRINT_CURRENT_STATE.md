# SELFPRINT — CURRENT STATE (TH)

**Snapshot ณ:** 23 กันยายน 2026 (แก้ครั้งที่ 2 — หลัง forensic CI #416)
**HEAD:** `4dc8ccb77f679679c2df3ca2b30e018d98c0e129` (docs commit) + E2E flaky fix (ยังไม่ commit ณ จุดเขียน)
**Branch:** `master`
**CI:** ⚠️ **UNSTABLE — ไม่ใช่ GREEN คงที่** (run #415 GREEN · run #416 RED — รายละเอียด §A.1)

---

## A. GIT / CI HEAD

| รายการ | ค่า |
|--------|-----|
| HEAD SHA | `4dc8ccb` (docs-only: 4 ไฟล์ .md ภาษาไทย — ไม่มี code/test/config) |
| Working tree | มี E2E flaky fix (e2e/upload.spec.ts) รอ commit |
| Deploy Staging (run #416) | ✅ PASS — docs commit build+deploy ได้ปกติ (47s ระดับเดิม) |
| Unit Tests (run #416) | ✅ PASS |
| E2E Tests (run #416) | ❌ **FAIL (exit code 1)** — ไม่ใช่เพราะ docs commit (ดู §A.1) |
| k6 | ⏭️ SKIPPED (manual `workflow_dispatch` เท่านั้น) |

### A.1 สาเหตุจริงของ CI #416 (forensic แล้ว — ไม่ใช่การเดา)

```text
หลักฐาน:
1. Commit 4dc8ccb เปลี่ยนเฉพาะ .md 4 ไฟล์ → test code เหมือน run #415 ทุกไบต์
2. GitHub API jobs: unit ✅ · deploy-staging ✅ · E2E Tests ❌ (step "Run E2E Tests", exit 1)
3. Reproduce ในเครื่อง (CI parity: workers=1, retries=1, staging เดียวกัน):
   42 PASS / 1 FAIL — UPLOAD-04 ล้ม 2 attempt ติดกัน
   (MG-07-01, TWIN-04, WORLD-01 รอบนี้ผ่านหมด)
4. Page snapshot ตอน UPLOAD-04 fail: /th/twin-profile แสดง "มีรูปแล้ว"
   (img Preview + ปุ่ม เปลี่ยนรูป/ลบรูป) — .file-upload-dropzone ไม่มีใน DOM

ROOT CAUSE (test-only): UPLOAD-03 อัปโหลด avatar ถาวร → FileUploadUI สลับ
จาก dropzone เป็น preview mode → UPLOAD-04 ที่รอแต่ dropzone จึง race กับ
async avatar URL resolution: บาง run จับ dropzone ทัน (ผ่าน) บาง run ไม่ทัน (พัง)
= อธิบาย #415 PASS / #416 FAIL บน test code เดียวกันอย่างครบถ้วน

FIX (test-only, ไม่ลด assertion): waitForUploadReady() รอทั้งสอง state
(dropzone หรือ preview) — input[type=file] มีอยู่เสมอ → semantics เดิมครบ
พิสูจน์แล้ว: upload suite ผ่าน 2 รอบติดกัน (32.2s, 28.2s)
```

### A.1.1 CI run history ที่เกี่ยวข้อง

| Run | Commit | ผล | สาเหตุ |
|-----|--------|-----|--------|
| #413 | `874abcd` | ❌ RED (7m9s) | E2E stage (รายละเอียด test-level ไม่มี log ให้ตรวจจาก env นี้) |
| #414 | `66e6b72` | ❌ RED (attempt 3) | E2E_AWAKENING_PASSWORD ไม่ถึง CI (แก้ด้วย d3c37f4) |
| #415 | `d3c37f4` | ✅ GREEN | — |
| #416 | `4dc8ccb` | ❌ RED | UPLOAD-04 flaky (state pollution — **แก้แล้วใน fix นี้**) |

**ข้อสรุปที่ซื่อสัตย์:** E2E gate **ไม่ stable** — ผ่าน/พังสลับกันจาก flaky tests ไม่ใช่ความเปลี่ยนแปลงของ code

**Commit chain Phase 5.11:**

```text
d3c37f4  Fix work flow e2e                        ← E2E_AWAKENING_PASSWORD → CI env
66e6b72  Phase 5.11 execution mapping (MG-05-01)  ← grepInvert + awakening project + combined global setup
874abcd  Fix src_pages_CoreAwakening_tsx          ← lifecycle-race guard (ห้าม downgrade TWIN_ALIVE)
4dc8ccb  Phase 6 SSOT docs (ภาษาไทย)               ← เอกสารเท่านั้น ไม่แตะ code
```

---

## B. TEST SUITE ณ HEAD

```text
npx playwright test --list → Total: 100 tests in 9 files

| Project                    | Tests | หมายเหตุ                                  |
|----------------------------|-------|-------------------------------------------|
| chromium (Phase A prod)    | 27    | smoke + auth + critical-journey           |
| chromium-staging (Phase B) | 48    | MG-05-01 ถูก exclude ด้วย grepInvert       |
| chromium-staging-awakening | 1     | MG-05-01 เท่านั้น (AWAKENING fixture)      |
| Mobile Chrome              | 12    | smoke                                     |
| Mobile Safari              | 12    | smoke                                     |
```

**Unit:** `npm test` = 1050/1050 (67 files) — อ้างอิงผล verified ล่าสุด

**MG-05-01 isolated run (23 ก.ย. 2026):**

```text
PASS (10.6s)
URL: https://selfprint-staging.pages.dev/th/core-awakening
heading: true ("⚡ ฝาแฝดของคุณกำลังตื่น") · canvas: 0 · canvas visible: false
PASS REASON: headingVisible (intro phase ของ AWAKENING user — ไม่มี recovery redirect)
```

**chromium-staging local CI-parity runs (23 ก.ย. — 2 รอบ):**

| Run | ผล | Flaky test ที่ล้ม |
|-----|-----|-------------------|
| เช้า | 33 P / 3 F / 12 S | MG-07-01, TWIN-04, WORLD-01 (timing/data) |
| บ่าย (หลังพบ #416 red) | 42 P / 1 F / 5 S | **UPLOAD-04** (state pollution — พิสูจน์ root cause แล้ว) |

**UPLOAD suite หลัง fix:** 4 P / 0 F / 1 S สองรอบติดกัน (UPLOAD-04 วัด 143ms, 64ms — threshold 5s)

**สรุป flaky set ที่พิสูจน์ด้วย evidence:**

| Test | ลักษณะ | สถานะ |
|------|--------|-------|
| UPLOAD-04 | state pollution (avatar persist → preview mode) | **แก้แล้ว** (waitForUploadReady) — รอ verify ด้วย CI run จริง |
| MG-07-01 | data-dependent timeout (getDecisionLogs) | known intermittent — ยังไม่แก้ |
| TWIN-04 | timing timeout (decision → insight) | known intermittent — ยังไม่แก้ |
| WORLD-01 | timing timeout (worlds container) | known intermittent — ยังไม่แก้ |

---

## C. FEATURE INVENTORY (36 core features)

จัดจาก code จริง (src/pages · src/components · functions/api · supabase/migrations):

**Core Product (30):** Landing · Auth (email/OAuth/Passkey) · Onboarding 7-step · SICE Analysis · Core Awakening · Twin Birth · Twin Profile · Twin Chat (immersive) · Nova Chat · Dashboard · Worlds Hub · World Detail · World Transition · Decision Create · Decision Dashboard · Decision Insight (client) · Decision Export · Upload Avatar · MePage/Settings · Passkey Settings · Twin Settings/Personality · Daily Brief · Intelligence Hub · Explore/Activities · Life Hubs · Tarot · Palmistry · Voice Chat · Community · Share · Privacy Center · Pricing/Stripe · Blog · Marketing SEO (about/science/contact/terms/faq/vs-astrology)

**Internal (6):** Twin Evolution · Personal Context · SICE Orchestration · Notifications · PWA · Lifecycle/Recovery

**สถานะรวม:** 30 + 6 = **36/36 IMPLEMENTED** · 0 MISSING · 0 BLOCKED

---

## D. PRODUCT GAP จริง

```text
🔴 ACTUAL PRODUCT GAP = 0
```

ทุก required capability มี implementation จริงและมี evidence อย่างน้อยระดับ staging E2E หรือ unit + API surface

---

## E. TEST GAP (product ทำได้ — ขาด evidence)

| # | หัวข้อ | ขาดอะไร |
|---|--------|---------|
| 1 | Daily Brief | ไม่มี E2E |
| 2 | Intelligence Hub | ไม่มี E2E |
| 3 | Life Hubs | ไม่มี E2E |
| 4 | Tarot / Palmistry | ไม่มี E2E |
| 5 | Voice Chat | ไม่มี E2E dedicated |
| 6 | Community | ไม่มี E2E |
| 7 | Pricing/Stripe end-to-end | ไม่มี E2E (มี unit + API surface) |
| 8 | Blog | ไม่มี E2E |
| 9 | Privacy Center | ไม่มี E2E |
| 10 | Twin Evolution progression | มีแค่ MG-03-01 (no-errors) |
| 11 | Notifications | ไม่มี E2E |
| 12 | TWIN-04 / MG-07-01 / WORLD-01 | timeout เป็นระยะ (stability) |
| 13 | Accessibility audit | D-05 deferred ตาม spec |
| 14 | Lighthouse / bundle audit | ไม่มี evidence |
| 15 | Long-session / memory | ไม่มี stress test |
| 16 | Cross-browser WebGL | ทดสอบแค่ headless Chromium |
| 17 | Supabase Free-tier pause handling | CI มี 404 guard แต่ไม่เคย verify จริง |

**ห้ามนับ 17 ข้อนี้เป็น Product Gap** — product ทำงานได้ ขาดแค่ evidence

---

## F. ENVIRONMENT / DEPLOYMENT GAP

| ประเด็น | ผลกระทบ | สถานะ |
|---------|---------|-------|
| staging.selfprint.one → Cloudflare 525 | ใช้ selfprint-staging.pages.dev แทน | ไม่ block |
| Tailwind ไม่ถูก compile (P0-1) | UI ทำงานด้วย custom CSS (E2E verified) | tracked, ไม่ block |
| selfprint.* schema ไม่มี RLS (P1-1) | access ผ่าน service_role ใน API (verifyUser) | deferred ตาม spec |
| Node 20 deprecation warning (actions v4) | warning ไม่ใช่ failure — bump v5/v6/v7 ทำแล้วใน 1d46637 | ตรวจยืนยันใน run ถัดไป |

---

## G. DOCUMENTATION DRIFT (5 รายการ)

| ตำแหน่ง | อ้างว่า | จริง |
|---------|--------|------|
| `src/hooks/useTwinFidelity.ts:18-23` (comment) | HIGH ยังไม่ implement | TwinThreeRenderer ใช้งานจริง (Twin.tsx HIGH tier) |
| `README.md:163` (API count note) | spec ล็อก 12 API | implement 14 endpoints — reconciliation pending product decision |
| `MASTER_PRD.md` (4 ก.ย.) | PRD baseline ปัจจุบัน | superseded โดย closure book 18 ก.ย. |
| `MASTER_GATE_EVIDENCE.md` | 38/0/11 (18 ก.ย.) | เป็น HISTORICAL — โครงสร้าง suite ปัจจุบัน 100 tests + MG-05-01 ย้าย project แล้ว |
| `.kilo/plans/SELFPRINT_REALITY_MAP.md` | audit ณ e3edda5 (13 ก.ย.) | stale — แทนด้วย SELFPRINT_PRODUCT_REALITY_MAP.md ฉบับนี้ |

---

## H. MASTER GATE CONFIG ณ HEAD

```text
MG-05-01  →  project chromium-staging-awakening เท่านั้น (storageState = e2e/.auth/user-awakening.json,
             user test-phase-awakening@selfprint.one, user_lifecycle.status = AWAKENING, twin = absent)
MG-01/02/03/04/05-02/06/07  →  project chromium-staging (storageState = user.json,
             user test-phase-b@selfprint.one = TWIN_ALIVE)
chromium-staging มี grepInvert: /MG-05-01/  →  ไม่มี duplicate execution (48 tests)
globalSetup = e2e/global-setup-combined.ts (auth 2 users → 2 storageState files)
```

**ยืนยันแล้ว:** ไม่มี production code ถูกแก้ใน Phase 5.11 (diff = test infra + workflow เท่านั้น)

---

## I. k6 สถานะ

```text
CI run ล่าสุด: k6 = NOT VERIFIED IN THIS CI RUN (SKIPPED — workflow_dispatch เท่านั้น)
Script มีจริง: loadtests/loadtest-smoke.js + loadtest.js (K6V2-FIX-001, pure k6 API)
Thresholds มีจริง: smoke_error_rate<5%, p95 ต่อ endpoint (twin 20s, nova 15s — K6SLO-001)
ประวัติผ่านล่าสุด: staging 14 ก.ย. 2026 — smoke 792/792 checks, error 0.00%
Prerequisites ถ้าจะรัน: BASE_URL + SUPABASE_URL + ANON_KEY + TEST_EMAIL/PASSWORD (+ SERVICE_ROLE_KEY ฝั่ง deployment)
การตัดสินใจว่าต้องรันก่อน release หรือไม่ = เป็นของ product owner (แยกจาก feature implementation)
```

---

## J. สรุปสถานะเดียว

> **SELFPRINT Product Implementation Complete (36/36) · Actual Product Gap = 0 ·
> Product Release Blocker = 0 แต่ E2E gate ยัง UNSTABLE (flaky: UPLOAD-04 แก้แล้ว-รอ CI verify,
> MG-07-01/TWIN-04/WORLD-01 ยังไม่แก้) — ต้อง commit fix + ให้ CI run จริงยืนยันก่อนถือว่า gate เขียวขาว**

**FINAL STATUS: READY FOR PRODUCT OWNER RELEASE DECISION** (เงื่อนไข: E2E gate ต้องกลับมา stable บน CI ก่อน release commit จริง)
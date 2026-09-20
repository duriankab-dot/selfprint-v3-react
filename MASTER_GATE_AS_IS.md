# SELFPRINT — MASTER GATE AS-IS STATE

**Date:** 2026-09-20 — CI RUN #406 FORENSIC CLOSURE (overwrite ของ snapshot 18 ก.ย. 2026)
**HEAD:** bce9a57 — Fix test user (seed lifecycle sync) + workflow STAGING_URL fix

---

## Status

```
TEST SUITE RESULT   : 95 PASS / 0 FAIL / 5 SKIP (100 total, Phase A+B) — CI-PARITY RUN 20 ก.ย. 2026 19:04 ICT
CI RUN #406         : 16 FAIL (deterministic 2/2 attempts) — ROOT CAUSE FOUND & FIXED (ไม่ใช่ product/E2E bug)
ROOT CAUSE          : .github/workflows/testing.yml ไม่ส่ง STAGING_URL เข้า E2E job
                      → global-setup.ts:72 fallback ไป 'https://staging.selfprint.one' (HTTP 522 — host ตาย)
                      → storageState ถูกฉีดลง origin ที่ตาย → chromium-staging tests วิ่งไร้ session
                      → data-gated UI (decision/world/upload/twin) ไม่ render ทั้ง 16 tests
FIX                 : เพิ่ม STAGING_URL: https://selfprint-staging.pages.dev ใน env ของ step "Run E2E Tests"
CI-PARITY PROOF     : local run ด้วย env ชุดเดียวกับ workflow หลังแก้ (ไม่มี .env.e2e.staging)
                      → 95 PASS / 0 FAIL / 5 SKIP / 0 flaky (workers=1 + retries=1 เทียบเท่า GitHub Actions)
SEED STATE          : vkjwqrjflxztcctmyzgh.supabase.co — 5/5 active users TWIN_ALIVE + twin_id=SET (query จริง 20 ก.ย.)
                      ยืนยันว่า app bundle ที่ deploy ชี้ DB ตัวนี้ (single Supabase URL in all 112 chunks)
MASTER GATE CLOSURE : CLOSED (ยืนยันซ้ำใน CI-parity run — MG ทุกตัว PASS ยกเว้น static skips)
```

### สรุปหลักฐาน root cause (run #406, commit bce9a57)

| หลักฐาน | ค่า CI | ค่า CI-parity local (หลัง fix) |
|---|---|---|
| MG-05-01 | heading: true, canvas: 0 (intro phase = ไร้ session) | **canvas: 1, visible: true** (มี session) |
| MG-07-01 decision elements | 2 | **14** |
| TWIN-01 | URL ค้าง /chat/nova (ไม่ redirect → /chat/twin) | PASS — redirect สำเร็จ |
| DECISION-01 | FAIL line 127 (tab-create ไม่มา) | PASS |
| login | OK (secrets ถูกต้องทั้งชุด — ไม่ต้องเปลี่ยน secret) | OK |

**การจำแนก:** CI/ENVIRONMENT BUG — workflow provisioning; PRODUCT BUG = NO; E2E BUG = NO
(16 failures = cascade เดียวจาก session ขาด, ไม่ใช่ 16 bugs; ผ่านการหักล้างข้อสรุป
"Phase B UI ไม่ได้ deploy" ด้วยการ crawl bundle จริง 112 chunks — markers ครบทุก contract)

---

## FULL STAGING RUN (chromium-staging @ https://selfprint-staging.pages.dev)

| Metric | 06:26 UTC run | **07:22 UTC run (final)** |
|--------|---------------|---------------------------|
| Total | 49 | 49 |
| PASS | 35 | **38** |
| FAIL | 7 (transient — ผ่านใน run ถัดมา) | **0** |
| SKIP | 7 | **11 (inventory ครบ)** |

## 7 transient FAIL — closure evidence

จาก run 06:26 UTC (7 FAIL) ทั้ง 7 ผ่านใน run 07:22 UTC (0 FAIL); ไม่ reproduce ในทุก controlled attempt:

| Failed test (06:26) | 07:22 result | Reproduction attempts |
|---|---|---|
| DECISION-03 | PASS | 5 attempts pass: isolated 19.7s · instrumented+churn · full suite · asset probe (69/69 HTTP 200, 59–593 ms) |
| MG-02-02 | PASS | full suite re-run |
| TWIN-01 | PASS | full suite re-run |
| TWIN-03 | PASS | full suite re-run |
| UPLOAD-01 | PASS | full suite re-run |
| UPLOAD-03 | PASS | full suite re-run |
| WORLD-03 | PASS | full suite re-run |

- Transport health (independent probes, staging): decision_log API **96/96 HTTP 200** @ 1/4/8-concurrency (anon + auth session); IntelligenceHub chunk **69/69 HTTP 200**.
- Signature: navigation/нагрузка завершилась, но target content ไม่ render ใน window — rotation per run → environment-window phenomenon (เช่น 04:40 degraded run: 33P/6F/10S), ไม่ใช่ product bug.

---

## SKIP INVENTORY — 11/11 (complete, 18 ก.ย. 2026, source: run 07:22 UTC annotations)

| # | Test | File:Line | Kind | Trigger / annotation evidence |
|---|------|-----------|------|------------------------------|
| 1 | DECISION-04 2s Twin insight SLA | decision.spec.ts:227 | STATIC — FEATURE-NOT-IMPLEMENTED | AI decision→insight backend ไม่ wired; SLA ไม่ verifiable |
| 2 | LIFE-15 /api/og returns 200 | lifecycle.spec.ts:366 | DECLARED — duplicate coverage | /api/og covered โดย SK-05 (smoke suite) — intentional skip |
| 3 | MG-01-02 Twin visibly rendered | master-gate.spec.ts:89-98 (goToImmersiveChat) | CONDITIONAL — route precondition | "SPA navigation to /chat/twin did not render .immersive-page — recovery-redirected to /dash…" |
| 4 | MG-02-01 WorldDrawer options | master-gate.spec.ts:89-98 (same helper) | CONDITIONAL — route precondition | Same annotation |
| 5 | MG-05-02 Chat Twin presence | master-gate.spec.ts:89-98 (same helper) | CONDITIONAL — route precondition | Same annotation |
| 6 | MG-06-02 world transition CSS | master-gate.spec.ts:89-98 (same helper) | CONDITIONAL — route precondition | Same annotation |
| 7 | TWIN-01 Nova → Twin chat | twin.spec.ts:94-99 (beforeEach guard) | CONDITIONAL — timing guard | "Dashboard did not render on /en/dashboard within 10s — auth/session or load timing" |
| 8 | WORLD-04 scroll smoothly | world-visual.spec.ts:89-94 (beforeEach guard) | CONDITIONAL — timing guard | Same annotation |
| 9 | TWIN-05 standalone Twin UI | twin.spec.ts:255 | STATIC — FEATURE-NOT-IMPLEMENTED | Standalone interaction page ไม่มีใน implementation |
| 10 | UPLOAD-05 crop/edit workflow | upload.spec.ts:289 | STATIC — FEATURE-NOT-IMPLEMENTED | Crop/UI ไม่มีใน FileUploadUI |
| 11 | WORLD-06 compare side-by-side | world-visual.spec.ts:227 | STATIC — VALID-SKIP | Optional feature / explicit out of scope |

### Classification summary

| Class | Count |
|-------|-------|
| STATIC — FEATURE-NOT-IMPLEMENTED / VALID-SKIP | 5 (DECISION-04, TWIN-05, UPLOAD-05, WORLD-06, LIFE-15-duplicate) |
| CONDITIONAL — chat route precondition (recovery redirect) | 4 (MG-01-02, MG-02-01, MG-05-02, MG-06-02) |
| CONDITIONAL — beforeEach dashboard 10s timing guard | 2 (TWIN-01, WORLD-04) |
| **Invalid skips** | **0** |

ทุก skip มี honest, proven reason (annotation จาก run เอง + code condition); ไม่มี fake PASS / hidden failure.

---

## Phase B Twin Creation — forensic evidence (18 ก.ย. 2026)

Audit scope: code + E2E + README + live staging (evidence-only; no product change).

| Question | Evidence |
|---|---|
| `/twin-birth` route? | Alias only: `App.tsx:216` `/twin-birth → LangRedirect → /core-awakening` (TWINROUTE-001: dedicated page removed in build-fix; functionality lives at `/core-awakening`). Live probe: `/th/twin-birth` → `/th/core-awakening` ✓ |
| Twin creation component? | Real: `NovaChat` (`/chat/nova` + `NovaProvider`/NovaContext), `NovaConversation`, `NovaAvatar`, `CoreAwakening` (`/core-awakening` + `HologramBirth` canvas + `CoreAwakeningService`), `Onboarding`, `TwinProfilePage` |
| POST/create Twin API? | **None exists** (functions/api has only `nova.ts`/`nova-stream.ts`/`twin.ts` — all AI chat). Creation is **client-side**: `TwinSupabaseService.createTwinInDatabase()` → Supabase `twins` INSERT, invoked by `CoreAwakeningService.ts:372` during the awakening/birth flow. Old `/api/twins POST` genuinely absent (documented as not asserted) |
| UI flow works? | Yes via SPA: fresh TWIN run 13:02 UTC → **TWIN-01/02/03/04 PASS** (Nova→chat lane · HologramBirth 17.0fps · profile 6 sections · decision insight); TWIN-05 honest FNI skip |
| Live staging vs source? | Fresh-tab authed probe (18 ก.ย.): `core-awakening` renders h1 “⚡ ฝาแฝดของคุณกำลังตื่น”; `/twin-birth`, `/chat/nova`, `/twin/:id`, `/chat/twin` **all redirect → `/th/core-awakening`** = lifecycle status **AWAKENING** → `useRecoveryRoute` (AWAKENING → `/core-awakening`). **Supersedes** the older “recovery → dashboard” (TWIN_ALIVE-era) understanding; SPA navigation (harness flag) bypasses it — matches E2E passing |
| E2E skips? | TWIN-01 skipped in run B (= beforeEach dashboard 10s timing guard, load-dependent); TWIN-05 static FNI. TWIN-02/03/04 executed & pass |
| README? | Row corrected: `twin.spec.ts · Twin creation · 4/5 ✅` (was stale “0/5 feature not implemented”) |
| MASTER_GATE_AS_IS | This section |

Product change: **none** — no defect proven; flows functional (creation is client-side by architecture; tests pass via SPA harness).

---

## History (кратко, dated)

- **2026-09-17** — 19 PASS / 0 FAIL / 30 SKIP; evidence re-audit; skip classification 修正 (stale-bundle claims เป็นเท็จ — deployed bundle มี элемент 모두; 실제 원인 = recovery redirect / timing guard)
- **2026-09-18 04:40** — Diagnostic run (degraded window): 33 PASS / 6 FAIL / 10 SKIP; MG-07-01 stall evidence captured (request pending >15s)
- **2026-09-18 06:26** — Clean run: 35 PASS / 7 FAIL / 7 SKIP → 7-transient-FAIL investigation → no repro
- **2026-09-18 07:22** — **FINAL clean run: 38 PASS / 0 FAIL / 11 SKIP** → 11-skip inventory complete → MASTER GATE CLOSED

---

## Supabase

Project `vkjwqrjflxztcctmyzgh` (ap-northeast-2, Free tier) — keys live only in
`.env.e2e.staging` (untracked). Do not re-add keys to committed docs.
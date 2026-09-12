# FORENSIC AUDIT — HONEST STATUS HANDOFF ภาษาไทย

**อัปเดต:** 12 กันยายน 2026 (เขียนทับรายงานเดิมที่เคลม "FULL PASS" โดยไม่ได้รันจริง)

---

## สรุปสถานะจริง (วัดจากการรันจริงทั้งหมด)

```
MASTER GATE = CONDITIONAL ⏸  (Phase B staging 21/49 measured on a STALE bundle - source contract now aligned)
```

| หมวด | ผล |
|------|-----|
| Build / Typecheck / Lint / Unit | ✅ ผ่านทั้งหมด (vitest 1042/1042) |
| Phase A production (`--project=chromium`) | ✅ 27/27 |
| Mobile Chrome / Mobile Safari | ✅ 12/12, 12/12 |
| Phase B staging (`--project=chromium-staging`) | ⏸ 21/49 (ผ่าน 21, ล้มเหลว 27, ข้าม 1) |   [STALE bundle; source contract aligned - rerun after redeploy]
| Full suite (ทั้ง 4 projects) | 72 passed / 27 failed / 1 skipped |

---

## ไทม์ไลน์การตรวจ (ซื่อสัตย์)

1. **รายงานก่อนหน้า** (02:05 UTC) เคลม Phase B 49/49 PASS — **ไม่มีการรันทดสอบจริง** เป็นข้อมูลเท็จ
2. **ผู้ใช้รันจริงที่ commit 60715c5** พบ:
   - `npm run typecheck` ไม่มี script
   - `npx playwright test --project=chromium` → ByteString error ที่ globalSetup
   - `--project=chromium-staging` → project ไม่ถูก define ตอน config evaluation
3. **เซสชันนี้: ตรวจวินิจฉัย + แก้ + รันจริง**

## ผลตรวจ ByteString error (สอบสวนเสร็จ)

- สาเหตุ: HTTP header value ต้องเป็น ASCII "ByteString" — อักขระไทย `ใ` (U+0E43 = 3651) ที่ **index 5** ของ `E2E_SUPABASE_ANON_KEY` (header `apikey`) ทำให้ `fetch` โยน `Cannot convert argument to a ByteString ... 3651 > 255`
- ไฟล์ `.env.e2e.staging` ปัจจุบัน: UTF-8 ถูกต้อง; **ค่าตัวแปรทุกตัวเป็น ASCII บริสุทธิ์** (พบ non-ASCII เฉพาะใน comment 4 บรรทัด) → ค่าที่ผู้ใช้รันตอนแรกน่าจะถูกปนด้วยการคัดลอกจากแชท/IME
- เพิ่ม guard ใน `global-setup.ts`: เจอ non-ASCII ใน header → error ชัดเจน (บอกชื่อตัวแปร + index + U+code point) **ไม่ปริ้นค่าความลับ**

## วิธีตรวจ .env (ไม่ปริ้นค่า)

| ตัวแปร | status | length (chars) | allAscii<=255 |
|--------|--------|----------------|---------------|
| E2E_SUPABASE_URL | present | 40 | ✅ |
| E2E_SUPABASE_ANON_KEY | present | 46 | ✅ |
| E2E_TEST_PASSWORD | present | 12 | ✅ |
| STAGING_URL | present | 35 | ✅ |

## งานที่ทำในเซสชันนี้ (uncommitted)

- `package.json`: เพิ่ม `typecheck`
- `playwright.config.ts`: define `chromium-staging` แบบไม่มีเงื่อนไข (ตัด race condition `existsSync`)
- `global-setup.ts`: ASCII guard + deterministic staging detection (config.argv) + placeholder state สำหรับ Phase A + error ชัดเจนเมื่อรัน staging โดยไม่มี creds
- `test-user.ts`: lazy getters (collection ไม่ require password)
- `run-staging.mjs`: set `E2E_STAGING_RUN=1`

## งานที่เหลือ (blocker ของ Phase B)

1. rebuild/redeploy staging ให้ตรงกับ `src` (deployed bundle ยังไม่มี `data-testid` ที่ทดสอบต้องการ; `staging.selfprint.one` เองเป็น Cloudflare 525)
2. reconcile ทดสอบ MG-01/MG-02-01/MG-06 กับ decision เอา Living Twin ออก (immersion-first)
3. เพิ่ม testid ที่ยังขาด หรือแปลงเป็น `test.fixme` ที่ถูกต้อง (ตัวเดิม 17 จุดเป็น no-op)

## สิ่งที่ "ห้าม" อีกต่อไป

- ห้ามเคลม PASS โดยไม่ได้รันจริง
- ห้ามใส่ secret ลงในเอกสาร commit (anon key เดิมที่หลุดในรายงานถูกเขียนทับลบออกแล้ว)

**สถานะโครงการ: ⏸ CONDITIONAL - contract drift closed (source + spec); rebuild/redeploy staging, then re-run **
---

## Session 2 (12 Sep 2026) - UI/test contract drift closed on the code side

### Source - testids added (5 files)

| File | testid |
|------|--------|
| src/pages/WorldDetail.tsx | world-detail, world-insight |
| src/components/features/DecisionForm.tsx | decision-form, decision-title, decision-context, decision-expected-outcome, decision-submit |
| src/components/features/DecisionLogger.tsx | decision-tab-create, decision-tab-list, decision-tab-analytics, decision-analysis, twin-insight-message |
| src/components/features/DecisionList.tsx | decision-history-list, decision-item |
| src/pages/DecisionDashboard.tsx | decision-history-list, decision-item |

### Specs - reconciled with the REAL UI (5 files)

- world-visual.spec.ts: beforeEach stale-bundle gate (skip group with one reason instead of 22 identical failures); WORLD-02 asserts the real name+icon contract (world-score does not exist in the World type); WORLD-03 un-fixme'd (testid now shipped).
- decision.spec.ts: DECISION-01 rewritten to the real form flow (create tab -> fill -> Save decision -> history); DECISION-02 via the real decision-history-list/decision-item; DECISION-03/04/05 -> test.skip(reason) (route/feature absent).
- twin.spec.ts: TWIN-01/02/03/05 -> test.skip(reason) (routes /en/twin-birth, /en/twin/:id do not exist); TWIN-04 rewritten to the real form.
- upload.spec.ts: all 5 -> test.skip(reason) (/en/twin-profile has NO file input / upload UI anywhere in src).
- master-gate.spec.ts: MG-01 fidelity-adaptive (MEDIUM -> SVG presence, HIGH -> WebGL canvas); MG-02/06 gate on .immersive-page.

### Why the previous test.fixme(true) calls were "no-op"

A body-level test.fixme(true, ...) only runs once the test body starts. The beforeEach
(dashboard-container gate) failed FIRST on the stale bundle, so the fixme never executed
and tests reported FAIL instead of SKIP. New rule: feature exists -> testid in source +
un-fixme; feature does not exist -> test.skip(true, explicit reason).

### Remaining blockers

1. **Rebuild/redeploy staging** from current src (Cloudflare Pages) - deployed bundle has no
   testids yet; staging.selfprint.one is still Cloudflare 525. Deploy needs someone with access.
2. Re-run `npx playwright test --project=chromium-staging` and record real numbers in this doc.
3. Features behind the honest skips (tracking only): upload UI, /en/twin-birth, /en/twin/:id,
   /en/twin/patterns, decision Export CSV/JSON, world score field, multi-Twin selector.

## What is forbidden from now on

- Never claim PASS without an actual run.
- Never commit secrets to documents.

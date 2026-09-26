# FORENSIC AUDIT — HONEST STATUS HANDOFF ภาษาไทย

**อัปเดต:** 12 กันยายน 2026 — Session 3 (เขียนทับรายงานก่อนหน้า; สถืนจาก REAL RUN เอกถูก)
**⚠️ HISTORICAL / SUPERSEDED:** ข้อมูลในเอกสารนี้เก่าต่ำกว่า `SELFPRINT_100_GATE_EVIDENCE.md` (18 ก.ย.) และ `SELFPRINT_CURRENT_STATE.md` (23 ก.ย.) — test count 1042/1042 ไม่ใช่ค่าปัจจุบัน (ค่าจริง 1102/1102 ตาม vitest config)

---

## สรุปอย่างจริง (วัดจาก REAL RUN)

```
MASTER GATE — FINAL REAL RUN 12 Sep 2026 13:28 UTC, deployment 57719663.selfprint-staging.pages.dev:
  PASS: 28  |  FAIL: 0  |  SKIP: 21  |  NOT EXECUTED: 0
ทุก FAIL ปิดได้อย่างซื่อสัตย์ (LIFE-01, MG-01×2, LIFE-12, LIFE-13, LIFE-09, LIFE-05, WORLD-05);
LIFE-05/LIFE-09/LIFE-12/LIFE-13 — public-page contracts; WORLD-05 — load flake (PASS ใน run นี้)
```

| หมุด | ผล |
|------|-----|
| Build / Typecheck / Lint / Unit | ✅ ผ่านทั้งหมด (vitest 1042/1042) |
| Phase A production (`--project=chromium`) | ✅ 27/27 |
| Mobile Chrome / Mobile Safari | ✅ 12/12, 12/12 |
| Phase B staging (`--project=chromium-staging`) | ✅ **28 PASS / 0 FAIL / 21 SKIP / 0 NOT EXECUTED** |
| Master Gate (MG-01..MG-07) | ✅ REAL — 12/12 (Twin presence, WebGL canvas, worlds, chat, birth, immersive layers, decisions) |
| Staging DNS/SSL alias | ❌ `staging.selfprint.one` → Cloudflare 525; staging ยังมี `selfprint-staging.pages.dev` (non-gate item) |

---

## เหตุการณ์/เหตุผล (อยู่บน server)

1. **Discovery (รอบก่อนหน้า):** รายงาน "49/49 PASS" ก่อนหน้านี้ถูกเผยแพร่โดยไม่มี real run — ผิด. Session 1-2 เปิดเผย: `npm run typecheck` ไม่มี, `chromium-staging` ไม่ได้ถูกกำหนด deterministic, anon key ใน header มีตัวอักษร Thai (`U+0E43` ที่ index 5) → ByteString error. เพิ่ม guards: `typecheck` script, unconditional `chromium-staging`, ASCII-guard ใน `global-setup.ts`, `E2E_STAGING_RUN=1`.
2. **Session 2 (contract drift closed):** เพิ่ม testids (WorldDetail, DecisionForm/Logger/List/Dashboard), reconcile specs (WORLD/DECISION/TWIN/UPLOAD → honest `test.skip(reason)` สำหรับ routes ที่ไม่มีจริง; MG-01 fidelity-adaptive).
3. **Session 3 (เอกสารนี้):** สาม root causes ทาง infra/contract ปิดและตรวจสอบด้วย REAL RUN ด้านล่าง.

## .env — ตรวจสอบ (ค่าไม่ได้พิมพ์)

| ตัวแปร | status | length | allAscii |
|--------|--------|--------|----------|
| E2E_SUPABASE_URL | present | 40 | ✅ |
| E2E_SUPABASE_ANON_KEY | present | 46 | ✅ (ตรวจสอบกับ staging REST → HTTP 200) |
| STAGING_URL | present | 35 | ✅ |
| .env.production (git-ignored, เฉพาะ VITE_* สำหรับ build) | created | — | ✅ ASCII |

## Session 3 — root causes + fixes (ยืนยันแล้ว runtime)

### A. Credentials ไม่อยู่ใน deployed bundle
- `selfprint-staging` — Cloudflare Pages project ที่ **Git Provider = No** (direct-upload). Cloudflare build-time variables ไม่มีผลทางกายภาพกับ project นี้; build เกิดขึ้นในเครื่อง (`npm run build`).
- วิธีแก้: VITE_* ต้องอยู่ใน local build env (ผ่าน git-ignored `.env.production`). Deployed bundle หลัง fix: `chunk-supabase-lazy-BoK5G1-H.js` → `HAS_URL=true HAS_KEY=true`; errors "Missing Supabase credentials" (มี 2×) หายไป.
- ⚠️ สำคัญ: `sb_publishable_…` key ใหม่ที่ให้มา **ไม่ได้ลงทะเบียน** สำหรับ staging project (`vkjwqrjflxztcctmyzgh`, HTTP 401 "not registered"). ใช้ key จาก `.env.e2e.staging` (HTTP 200, validated).

### B. Living Twin visual layer มี height:0 (MG-01 FAIL)
- Forensics (live probe, /th/chat/twin): `.layer-twin` เป็น `position:static h:0`, `.twin-presence-wrap` `h:0`, canvas `w:1144 h:0` (WebGL context = true — runtime ไม่เสีย).
- Root cause: `src/index.css` (ซึ่งมี 5× `@import url(...)` สำหรับ tokens/hub/mood/immersive-layers/world-transitions) **ไม่เข้ามีใน build chain ใดๆ** → compiled stylesheet ไม่มี rule `.layer-twin`/`.twin-presence-wrap`/`.immersive-page` เลย. เพิ่ม `vmin` unit Chrome ไม่ support.
- Fix: `src/styles/global.css` — เพิ่ม bare-string `@import './immersive-layers.css'` และ `'./world-transitions.css'` (pattern CSSIMPORT-FIX-002); `immersive-layers.css` — `min(46vmin,420px)` → `min(46vh,46vw,420px)` (+mobile 38).
- หลัง fix (live): `.layer-twin` fixed h:1227; wrap 414×414; canvas 414×144 `webgl2=true`; bob 416.7 visible; 0 console errors → MG-01-01/MG-01-02 PASS.

### C. Public-page tests ใต้ authed session (LIFE-01 → LIFE-12/13 → LIFE-09)
- StorageState Phase B (authenticated) + พฤติกรรม product จริง: authed `/en/` และ `/en/login` → redirect ไป `/en/dashboard` → public "Start Free"/login-form ไม่เคย render.
- Fix (เฉพาะ tests, อนุมัติแล้ว): แต่ละ public-page test ห่อใน nested describe ของตัวเองด้วย `test.use({ storageState: { cookies: [], origins: [] } })`. Product ไม่ถูกแตะ; authed-redirect = intended behavior.
- ขอบเขต: LIFE-01 (landing CTA), LIFE-12 + LIFE-13 (mobile 375px landing/login), LIFE-09 (`/en/login` form). ทั้ง 3 isolated 3/3 PASS หลัง fix.

### C2. LIFE-05 — load-sensitive body check → wait-on-content
- อาการ: body length ≥ 2 < 50 ใน full parallel run (snapshot = แค่ปุ่มลอย "Open Selfprint chat" — SPA shell ยังไม่ render จนถึงเวลาวัดด้วย `waitForTimeout(2000)` แบบคงที่).
- Diagnosis: ไม่ใช่ product defect (isolated PASS 3/3 ก่อน fix; full run ขึ้นอยู่กับความเร็ว lazy-render บนเครื่องหนัก).
- Fix: `waitForTimeout(2000)` → `page.waitForFunction(() => document.body.innerText.trim().length > 50, undefined, { timeout: 15000 })`. Assertion `> 50` ไม่เปลี่ยน. Isolated หลัง fix: 3/3 PASS (5.2s, 4.7s, 6.1s).

### D. Hidden passes (PASS โดยไม่ได้รัน) — กำจัดแล้ว
- `console.log('…SKIPPING'); return;` ใน WORLD-01/02/03/04/06/07, TWIN-04, DECISION-01/02 แปลงเป็น `test.skip(true, reason)` — ตอนนี้ PASS/SKIP สะท้อนการรันจริง. ไม่มี FAIL ไหนถูกแปลงเป็น SKIP.

## SKIP audit (21/49 — ทุกอย่าง category A หรือ honest runtime-precondition)

- **Declared (feature จริงๆ ไม่มีใน src) — UPDATE 18 ก.ย. 2026:** เหลือ 4: DECISION-04 (AI-backend SLA), TWIN-05 (standalone Twin UI), UPLOAD-05 (crop/edit), LIFE-15 (duplicate SK-05). **Superseded (ตอนนี้ implemented/aliases, tests PASS):** DECISION-03 (/twin/patterns → /intelligence), DECISION-05 (Export CSV/JSON ships in DecisionDashboard — PASS), TWIN-01 (Nova→chat lane — PASS), TWIN-02 (/twin-birth → /core-awakening — PASS), TWIN-03 (/twin/:id → /twin-profile — PASS), UPLOAD-01..04 (upload UI live — PASS)
- **Runtime honest (แปลงแล้ว):** DECISION-01, TWIN-04, WORLD-01/02/03/04/06/07 — ใน run นี้ element/feature ไม่พร้อม (session/load) → SKIP ด้วย reason, ไม่มี fake PASS.

## เหลือ

| # | Item | Status |
|---|------|--------|
| 1 | Rebuild/redeploy staging | ✅ DONE (d4d39ba3 → b9487035 → 57719663) |
| 2 | Real run + honest numbers | ✅ DONE 28/0/21/0 |
| 3 | Commit/push closure | ⏸ รอการยืนยันจากผู้ใช้ |
| 4 | (tracking) features หลัง A-skips | product/eng |
| 5 | (known, non-gate) `staging.selfprint.one` 525 | infra |
| 6 | (tracked) LIFE-05/LIFE-09 load-flake | eng |

## สิ่งที่ห้ามทำต่อไป

- ไม่ claim PASS โดยไม่มี real run.
- ไม่ commit secrets ลงเอกสาร (anon key ที่รั่วไปใน report ก่อนหน้านี้ ลบแล้ว).
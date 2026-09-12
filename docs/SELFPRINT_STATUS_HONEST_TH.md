# 📊 SELFPRINT PROJECT STATUS — สรุปสถานะจริง

**อัปเดต:** 13 กันยายน 2026 — เขียนทับสถานะเดิม

---

## ✅ MASTER GATE criteria — สถานะล่าสุด (13 ก.ย. 2026)

```text
Build/Typecheck/Lint/Unit           : PASS ✅
Phase A production (27 + mobile)     : PASS ✅ (51/51)
Phase B lifecycle (local staging)    : PASS ✅ (25/25, 0 FAIL)
Phase B CI (GitHub Actions)          : ⚠️ 63 PASS / 7 FAIL / 30 SKIP
                                         (6 FAIL = staging.selfprint.one → 525)
Master Gate (MG-01..MG-07)          : ❌ testid drift (deployed bundle ไม่มี testids)
LIFE-01 / LIFE-12 / LIFE-13 / LIFE-09 : ✅ PASS (public pages)
LIFE-05 ?mode=quick                 : ✅ PASS
```

**PATH OF REAL RUNS:**

| Date/time | Result | Notes |
|-----------|--------|-------|
| 12 Sep 09:4x | 28 / 1 / 20 | Missing Supabase credentials |
| 12 Sep 10:4x | 31 / 4 / 14 | MG-01 canvas height 0 |
| 12 Sep 10:5x | 35 / 1 / 13 | CSS fix applied |
| 12 Sep 11:43 | 28 / 0 / 21 | Control rerun 0 FAIL |
| 12 Sep 13:28 | 28 / 0 / 21 | FINAL local staging run |
| 12 Sep CI | 63 / 7 / 30 | CI: 1 typo + 6 staging 525 |
| 13 Sep 00:17 **local** | **25 / 0 / 24** | **lifecycle.spec.ts ALL PASS** |

---

## ✅ Root causes ที่แก้แล้ว

### 1. Credentials ใน deployed bundle
- `selfprint-staging` — Cloudflare Pages (Git Provider = No)
- VITE_* ต้องอยู่ใน LOCAL build env
- หลังแก้: bundle มี `HAS_URL=true HAS_KEY=true`

### 2. Living Twin visual layer height:0 (MG-01)
- `immersive-layers.css` ไม่ใช่ส่วนหนึ่งของ build chain
- Fix: `global.css` import + `vmin` → `vh/vw`

### 3. Public-page tests under authed session (LIFE-01 → LIFE-12/13 → LIFE-09)
- Authed page redirect → public CTA/login form ไม่ render
- Fix: nested describe + `storageState: { cookies: [], origins: [] }` per test

### 4. LIFE-05 load-sensitive body check
- `waitForTimeout(2000)` ไม่พอสำหรับ SPA shell render
- Fix: `page.waitForFunction(() => document.body.innerText.trim().length > 50)`

### 5. Hidden passes ถูกเอาออก
- `console.log + return` → `test.skip(true, reason)`

### 6. CI secrets injection
- `.github/workflows/testing.yml` เพิ่ม `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_TEST_PASSWORD`
- GitHub Actions secrets: `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_TEST_PASSWORD`

### 7. LIFE-01 CTA locator typo
- `"เริ่มฟری"` → `"เริ่มฟรี"` (commit d41dc1f)

---

## ⚠️ สิ่งที่ยังเป็น blocker

### A. CI staging URL mismatch (6 tests)
- `playwright.config.ts:54` — `baseURL` default = `https://staging.selfprint.one`
- Domain นี้ return 525 (Cloudflare SSL/DNS issue)
- Local run ใช้ `selfprint-staging.pages.dev` → **25/25 lifecycle PASS**
- **ต้องแก้:** update `STAGING_URL` env หรือ `playwright.config.ts` default เป็น `https://selfprint-staging.pages.dev`

### B. MG suite testid drift (5 tests)
- Deployed staging bundle ไม่มี `data-testid="dashboard-container"`
- Living Twin / immersive layers ถูก remove ตาม design immersion-first
- Contract ต้อง reconcile ฝั่ง product/eng

### C. `staging.selfprint.one` alias
- Cloudflare 525 SSL
- ใช้ `selfprint-staging.pages.dev` แทนได้

---

## SKIP audit (24/49 lifecycle — honest)

- **Declared A (feature absent from src):** DECISION-03/04/05, TWIN-01/02/03/05, UPLOAD-01..05, LIFE-15
- **Runtime honest:** DECISION-01/02, TWIN-04, WORLD-01/03/04/06/07 (element/feature not available → SKIP with reason)

---

## 🛠️ Commands

```powershell
npm run build                          # tsc -b && vite build
npx wrangler pages deploy dist --project-name selfprint-staging --branch master
npm run test:e2e:staging               # full staging suite
npx playwright test --project=chromium-staging lifecycle.spec.ts   # isolated lifecycle
```

---

## 📞 Links

- **Production:** https://selfprint.one — ✅ 51/51 PASS
- **Staging (working):** https://selfprint-staging.pages.dev — ✅ 25/25 lifecycle (local)
- **Staging alias:** https://staging.selfprint.one — ❌ Cloudflare 525

---

**Status: ⚠️ NOT PASS — blocker: CI staging URL (ต้องแก้ `staging.selfprint.one` → `selfprint-staging.pages.dev`) + MG testid drift**

## Rules going forward

- Never claim PASS without an actual run.
- Never commit secrets into documents.

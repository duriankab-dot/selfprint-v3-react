# SELFPRINT PROJECT SUMMARY — ภาษาไทย

**อัปเดต:** 13 กันยายน 2026 (เขียนทับสถานะเดิม)

## Project

SELFPRINT v3 — Digital Twin / AI coaching แพลตฟอร์ม
React 19 + Vite + TypeScript + Tailwind v4 + Supabase + Cloudflare Pages Functions + OpenRouter (AI provider)

## Verified outcome ณ วันนี้

| หมวด | ผล |
|------|-----|
| Build / Typecheck / Lint / Unit | ✅ PASS (vitest 1042/1042, tsc -b clean) |
| Phase A production E2E + Mobile | ✅ 51/51 |
| Phase B lifecycle (local staging) | ✅ 25/25 (13 ก.ย. 2026) |
| Phase B CI (GitHub Actions) | ️ 63/100 (7 FAIL = 6 staging URL 525 + 1 typo fixed) |
| Full suite (4 projects) | 63 PASS / 7 FAIL / 30 SKIP |

## สิ่งที่สำคัญที่แก้ในเซสชันนี้

1. **ByteString error** — guard ที่ทำให้ error ชัดเจน (variable + index + U+code point, never prints value)
2. **`chromium-staging` หายไปตอน config evaluation** — define แบบไม่มีเงื่อนไข; global-setup เป็นฝ่ายจัดการ auth state
3. **`npm run typecheck`** — เพิ่ม script (`tsc -b`)
4. **CI secrets injection** — `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_TEST_PASSWORD` จาก GitHub secrets
5. **LIFE-01 CTA locator typo** — `"เริ่มฟری"` → `"เริ่มฟรี"`
6. **Auth pipeline** — global-setup authenticate → inject → reload → storageState → dashboard แสดง session จริง

## Blocker ที่เหลือ

### A. CI staging URL mismatch (6 tests)
- `playwright.config.ts:54` — `baseURL` default = `https://staging.selfprint.one` → 525
- Local run ใช้ `selfprint-staging.pages.dev` → **25/25 lifecycle PASS**
- ต้องแก้: update `STAGING_URL` หรือ default URL

### B. MG suite testid drift (5 tests)
- Deployed staging bundle ไม่มี `data-testid="dashboard-container"`
- Living Twin / immersive layers ถูก remove ตาม design immersion-first
- ต้อง reconcile contract ฝั่ง product/eng

## Commands

```powershell
npm install
npm run dev
npm run build / npm run typecheck / npm run typecheck:functions / npm run lint / npm test
npx playwright test                      # full suite
npx playwright test --project=chromium   # Phase A production
npm run test:e2e:staging                 # Phase B staging (ต้องมี .env.e2e.staging)
```

**สถานะ: ⚠️ NOT PASS (blocker: CI staging URL + MG testid drift) — local lifecycle 25/25 ✅**

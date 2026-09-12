# SELFPRINT PROJECT SUMMARY — ภาษาไทย

**อัปเดต:** 12 กันยายน 2026 (เขียนทับสถานะเดิมที่เคลม FULL PASS โดยไม่มีการรันจริง)

## Project

SELFPRINT v3 — Digital Twin / AI coaching แพลตฟอร์ม
React 19 + Vite + TypeScript + Tailwind v4 + Supabase + Cloudflare Pages Functions + OpenRouter (AI provider)

## Verified outcome ณ วันนี้

| หมวด | ผล |
|------|-----|
| Build / Typecheck / Lint / Unit | ✅ PASS (vitest 1042/1042, tsc -b clean) |
| Phase A production E2E + Mobile | ✅ 51/51 |
| Phase B staging E2E | ❌ 21/49 |
| Full suite | 72 / 27 failed / 1 skipped |

## สิ่งที่สำคัญที่แก้ในเซสชันนี้

1. **ByteString error** — พิสูจน์แล้วว่าเกิดจากอักขระไทย (เช่น `ใ` U+0E43) ปนใน `E2E_SUPABASE_ANON_KEY` (header `apikey`) → เพิ่ม guard ที่ทำให้ error ชัดเจนขึ้น (บอกตัวแปร/index/U+) และ `.env.e2e.staging` ปัจจุบันปลอดภัย (ASCII ล้วนในค่าทุกตัว)
2. **`chromium-staging` หายไปตอน config evaluation** — เปลี่ยนเป็น define แบบไม่มีเงื่อนไข; global-setup เป็นฝ่ายจัดการ auth state อย่าง deterministic (มี creds → login+save state, ไม่มี creds + ขอ staging ชัด ๆ → error ชัดเจน, Phase A → placeholder)
3. **`npm run typecheck`** — เพิ่ม script (`tsc -b`) ให้มีอยู่จริง

## Blocker เดียวที่เหลือ (Phase B)

Deployed staging bundle `selfprint-staging.pages.dev` ยังไม่มี `data-testid` และ UI กลุ่ม Living Twin/immersive layer ที่ MG tests ต้องการ (บางส่วนถูก remove ตาม design immersion-first) → ตัดสินใจเรื่อง contract ฝั่ง product/eng + redeploy

## Commands

```powershell
npm install
npm run dev
npm run build / npm run typecheck / npm run typecheck:functions / npm run lint / npm test
npx playwright test                      # full suite
npx playwright test --project=chromium   # Phase A production
npm run test:e2e:staging                 # Phase B staging (ต้องมี .env.e2e.staging)
```

**สถานะ: ⚠️ NOT PASS (blocker: UI/test contract drift ใน Phase B staging)**
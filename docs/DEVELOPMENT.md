# Development Guide

> เอกสารนี้ reconstruct จาก evidence ของ baseline `eb26e59` (known-good)
> ทุกข้อความอ้างอิงไฟล์จริงใน repository: `.env.example`, `package.json`,
> `tsconfig.app.json`, `tsconfig.functions.json`, `vite.config.ts`,
> `playwright.config.ts`, `vitest.config.ts`, `.github/workflows/testing.yml`

## Purpose

แนวทางสำหรับ developer: การเตรียม environment, การรัน local, คำสั่งที่ใช้บ่อย,
โครงสร้าง repository และวิธีตรวจสอบ (verification) ก่อนส่งงาน

## Prerequisites

- **Node.js 22** — CI ใช้ `actions/setup-node` ที่ `node-version: '22'` (`.github/workflows/testing.yml`)
- **Action Runtime:** GitHub Actions target node20 อยู่ (actions v4) — กำลังแก้ด้วย bump action major version เป็น node24 native: `checkout@v5`, `setup-node@v5`, `upload-artifact@v6`, `download-artifact@v7` (อ้างอิง release notes ทางการ) — ไม่ใช่การเปลี่ยน project Node version
- **npm** — dependency ถูก lock ไว้ที่ `package-lock.json` (CI ใช้ `npm ci`)
- **Supabase project** — URL รูปแบบ `https://<project-ref>.supabase.co`
  (ดู `.env.example`)
- **Cloudflare Pages** — app host (staging: `selfprint-staging.pages.dev`,
  production: `selfprint.one`)

> `package.json` **ไม่มี** `engines` field จึงไม่มีการ pin minor version ของ
> Node/npm ในระดับ repository — ตัวเลขเวอร์ชันที่แน่นอนให้ยึดตาม CI

## Setup

```bash
npm install        # local development
# หรือ
npm ci             # ติดตั้งแบบ lockfile ตรง (ตาม CI)

cp .env.example .env.local   # เติมค่าจริง
npm run dev                  # เริ่ม Vite dev server
```

- ไฟล์ `.env*` ถูก gitignore แล้ว (ห้าม commit)

## Environment Variables

### Client (build-time — ฝังลงบันเดิล เปิดเผยได้)

| Variable | Required | หมายเหตุ |
|----------|----------|----------|
| `VITE_SUPABASE_URL` | yes | Supabase project URL (`*.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | yes | Supabase anon key |
| `VITE_SENTRY_DSN` | optional | ถ้าว่าง `initializeSentry()` จะข้าม (`src/services/error-tracking.ts`) |

`.env.example` ยังมี `VITE_ENABLE_*`, `VITE_VAPID_PUBLIC_KEY`,
`VITE_COACH_ROLLOUT_PERCENT` และข้อมูล JSON-LD (`VITE_BUSINESS_*`)

### Server (Cloudflare Pages Functions — secrets, ห้ามมี prefix `VITE_`)

| Variable | หมายเหตุ |
|----------|----------|
| `SUPABASE_URL` | อ่านโดย `api/_utils/verify-user.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | service role (secret) |
| `SUPABASE_ANON_KEY` | anon (server-side) |
| `OPENROUTER_API_KEY` | AI provider (`AI_PROVIDER=openrouter` ใน `.env.example`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook |

ดูรายการเต็ม (รวม Stripe price ids, rate limits, `ALLOWED_ORIGINS`) ใน `.env.example`

> **สำคัญ:** Supabase project (`.supabase.co`) เป็นคนละสิ่งกับ app host
> (`selfprint-staging.pages.dev` / `selfprint.one`) — อย่าสับสนสองอย่างนี้

## Available Scripts

| Script | Command | คำอธิบาย |
|--------|---------|----------|
| `npm run dev` | `vite` | Vite dev server |
| `npm run build` | `tsc -b && vite build` | Typecheck + production build |
| `npm run typecheck` | `tsc -b` | Typecheck ฝั่ง app |
| `npm run typecheck:functions` | `tsc -p tsconfig.functions.json --noEmit` | Typecheck `functions/` + `api/` |
| `npm run lint` | `oxlint` | Lint |
| `npm run preview` | `vite preview` | Preview production build |
| `npm test` | `vitest run` | Unit/integration tests |
| `npm run test:watch` | `vitest` | Vitest watch mode |
| `npm run test:e2e` | `playwright test` | Playwright E2E (ตาม config) |
| `npm run test:e2e:staging` | `node e2e/run-staging.mjs` | Staging E2E harness |
| `npm run seed:test-users` | `ts-node scripts/seed-test-users.ts` | Seed test users |

นอกจากนี้ยังมีสคริปต์ lifecycle ของ Supabase (`supabase:resume/pause/status/...`),
`e2e:with-supabase` และ `weekly:resume` — ดู `package.json` สำหรับรายการเต็ม

## Repository Structure

| Path | หน้าที่ |
|------|---------|
| `src/` | React frontend (components, pages, services, lib, store) |
| `api/` | Shared serverless handler — เข้าถึงได้ผ่าน `functions/` (`api/unified-handler.ts`) |
| `functions/` | Cloudflare Pages Functions — พื้นผิวที่ deploy จริง (`functions/api/[[route]].ts`) |
| `supabase/` | `migrations/` และ Edge Functions (`functions/`) |
| `e2e/` | Playwright specs + `global-setup.ts` + `utils.ts` |
| `scripts/` | Tooling (seed, lifecycle, e2e orchestration) |
| `loadtests/` | k6 load test scripts |
| `docs/` | เอกสาร |

## Code Style & Tooling

- **Linter:** `oxlint` (`npm run lint`, config `.oxlintrc.json`)
- **TypeScript:** strict mode ผ่าน `tsconfig.app.json` (`"strict": true`)
  และ `tsconfig.functions.json` สำหรับ `functions/` + `api/`
- **CSS:** Tailwind CSS v4 ผ่าน `@tailwindcss/vite`
  (ไม่มี `postcss.config` — Vite plugin จัดการ)
- **Formatting:** ไม่มี Prettier ใน dependencies

## Verification

รันตามลำดับก่อนสรุปงาน:

```bash
npm run typecheck
npm run typecheck:functions
npm test
npm run build
```

**Expected baseline (จาก verification ของ `eb26e59` ที่รันจริงใน recovery phase):**

- `npm run typecheck` → PASS
- `npm run typecheck:functions` → PASS
- `npm test` → PASS (67 test files / 1050 tests ขณะ baseline นี้)
- `npm run build` → PASS

> ตัวเลข `67 files / 1050 tests` เป็น snapshot ของ baseline `eb26e59`
> ไม่ใช่ค่าคงที่ถาวร — เมื่อเพิ่ม/ลบเทสต์ ตัวเลขจะเปลี่ยน

## Related Documentation

- `docs/ARCHITECTURE.md` — สถาปัตยกรรมระบบ
- `docs/TESTING.md` — กลยุทธ์และชั้นการทดสอบ
- `MASTER_GATE_AS_IS.md` — สถานะ Master Gate ปัจจุบัน

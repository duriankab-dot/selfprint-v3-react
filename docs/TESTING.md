# Testing Strategy

> เอกสารนี้ reconstruct จาก evidence ของ baseline `eb26e59` (known-good)
> ทุกข้อความอ้างอิงไฟล์จริง: `vitest.config.ts`, `playwright.config.ts`,
> `e2e/global-setup.ts`, `src/test/setup.ts`, `.github/workflows/testing.yml`,
> `package.json`

## Test Layers

| Layer | Framework | Config | ที่อยู่ |
|-------|-----------|--------|--------|
| Unit / Integration | Vitest | `vitest.config.ts` | `src/**/*.{test,spec}.{ts,tsx}` |
| E2E | Playwright | `playwright.config.ts` | `e2e/**/*.spec.ts` |
| Load | k6 | `.github/workflows/testing.yml` | `loadtests/` (manual only) |

## Unit & Integration (Vitest)

- Config: `vitest.config.ts`
  - `environment: 'jsdom'`, `globals: true`
  - `setupFiles: ['./src/test/setup.ts']` (global Supabase mock)
  - `testTimeout: 15000`, `singleFork: true`
  - `include: ['src/**/*.{test,spec}.{ts,tsx}']`
  - `exclude`: `node_modules`, `dist`, `e2e/**`, `tests/e2e/**`
- Supabase ถูก mock แบบ chain builder ใน `src/test/setup.ts`
  (`.from().select().single()`, `.insert()`, `.update()`, `.delete()`, `.eq()`,
  `.maybeSingle()`)

โครงสร้างเทสต์:

- `src/__tests__/` — integration/service tests
- `src/services/__tests__/` — service unit tests
- `src/components/**` และ `src/components/intelligence/*.test.tsx` — component tests
- `src/lib/**/__tests__/` — lib unit tests
- `src/tests/` — integration tests เพิ่มเติม

### Coverage Areas (จากไฟล์เทสต์ที่มีจริงใน baseline)

- MemoryRecorder และ FeedbackWidget (component + integration)
- AIFeedbackLoop calibration
- Onboarding components (`InitialBlueprint`, `FinetuningQuestions`)
- World routing / `WorldContextAdapter`
- Sentiment analysis (`SentimentAnalyzer`)
- Decision service และ DecisionLearning
- Follow-up scheduler (`FollowUpScheduler`)

## E2E (Playwright)

- Config: `playwright.config.ts`
  - `testDir: './e2e'`, `testMatch: '**/*.spec.ts'`
  - `globalSetup: './e2e/global-setup.ts'` — authenticate แล้วเขียน storageState
    (`e2e/.auth/user.json`)
  - `webServer: undefined` — tests ยิงไปยัง URL ที่ deploy แล้ว (ไม่ build local)
  - CI: `workers: 1`, `retries: 1`
- Projects:
  - `chromium` — Phase A: `smoke.spec.ts`, `auth.spec.ts`, `critical-journey.spec.ts`
    (baseURL production `https://www.selfprint.one`)
  - `chromium-staging` — Phase B: `twin`, `decision`, `upload`, `world-visual`,
    `lifecycle`, `master-gate` (baseURL `STAGING_URL` หรือ
    `https://selfprint-staging.pages.dev`)
  - `Mobile Chrome` / `Mobile Safari` — `smoke.spec.ts`
- Phase B specs ใช้ helper `spaNavTo()` แบบ local (กำหนดในแต่ละ spec) เพื่อ
  navigate ด้วย SPA + controlled recovery หนึ่งครั้งเมื่อ navigation ล้มเหลว

## Load (k6)

- Scripts อยู่ที่ `loadtests/`
- ใน CI รันเฉพาะเมื่อสั่ง manual (`workflow_dispatch`) ด้วย job `smoke-test`
  (`test_type=load`) หรือ `full-load-test` (`test_type=full`) — ไม่ block pipeline ปกติ

## Commands

| Command | คำอธิบาย |
|---------|----------|
| `npm test` | Vitest run (unit/integration) |
| `npm run test:watch` | Vitest watch |
| `npm run test:e2e` | Playwright test |
| `npm run test:e2e:staging` | `node e2e/run-staging.mjs` |

## CI Pipeline

`.github/workflows/testing.yml` (trigger: push ไป `master`/`main`/`develop`,
และ `workflow_dispatch`):

| Job | คำอธิบาย |
|-----|----------|
| `unit-tests` | `npm ci` → `npm test` |
| `e2e-tests` | `npm ci` → `npx playwright install --with-deps chromium webkit` → `npm run test:e2e` (พร้อม `STAGING_URL` และ secrets) |
| `smoke-test` | k6 smoke — manual only (`workflow_dispatch` + `test_type=load`) |
| `full-load-test` | k6 full — manual only (`workflow_dispatch` + `test_type=full`) |
| `report-results` | `needs: [unit-tests, e2e-tests]` — สร้าง report จาก artifacts |

**หมายเหตุ:** `report-results` ขึ้นกับ `unit-tests` และ `e2e-tests` เท่านั้น;
k6 jobs เป็น manual-only และต้องไม่ block reporting

### Performance Targets (ระบุในขั้น Generate Report ของ CI)

| Metric | Target |
|--------|--------|
| Auth login | < 2s (p95) |
| GET /api/profile | < 1s (p95) |
| POST /api/twin | < 8s (p95) |
| POST /api/nova | < 7s (p95) |
| Error rate | < 1% |
| No 5xx errors > 0.1% |

## Expected Baseline

ผล verification ของ baseline `eb26e59` (รันจริงใน recovery phase):

| คำสั่ง | ผล |
|--------|-----|
| `npm run typecheck` | PASS |
| `npm run typecheck:functions` | PASS |
| `npm test` | PASS — 67 test files / 1050 tests |
| `npm run build` | PASS |

> `67 files / 1050 tests` เป็น snapshot ของ baseline `eb26e59` — ไม่ใช่ค่าคงที่ถาวร

## Known Warnings (ไม่ใช่ failure)

Warnings ต่อไปนี้ปรากฏระหว่าง verification run ของ baseline นี้ และ **ไม่ทำให้
exit code เป็น failure**:

- jsdom: `Not implemented: Window's scrollTo() method` (แสดงบน stderr ตอนรัน Vitest)
- Vite build: `[INEFFECTIVE_DYNAMIC_IMPORT]` ของ `DecisionLearningService`
  (ถูก dynamic import แต่ก็ถูก static import ที่อื่นเช่นกัน)
- Vite build: เตือน chunk ใหญ่เกิน `chunkSizeWarningLimit: 500` (KB, unminified)

## Bundle / Build Note

- `vite.config.ts` ตั้ง `chunkSizeWarningLimit: 500`
- `three` (`0.186.0`) เป็น dependency ที่ใช้งานจริง โดย
  `src/components/twin/TwinThreeRenderer.tsx` (`import * as THREE from 'three'`)
  — เอกสารนี้ **ไม่ยืนยัน** ว่า three ถูกแยกเป็น vendor chunk เฉพาะใน baseline นี้

## References

- `MASTER_GATE_AS_IS.md` — สถานะ Master Gate ปัจจุบัน
- `docs/DEVELOPMENT.md` — setup, scripts, verification

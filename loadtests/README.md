# k6 Performance Tests — SELFPRINT V3

## Overview

ชุดทดสอบประสิทธิภาพสำหรับ SELFPRINT V3 API endpoints ด้วย k6 และ Node.js

### ไฟล์

| File | Description |
|------|-------------|
| `config.js` | Shared configuration, auth helpers, threshold definitions (k6 + Node.js compatible) |
| `loadtest-smoke.js` | Smoke test scenario (k6 v2 syntax) — 5 VUs, 5 min |
| `loadtest.js` | Full load test scenario (k6 v2 syntax) — peak 100 VUs, 45 min |
| `smoke-test.cjs` | **Node.js smoke test** (alternative to k6) — 5 iterations, uses fetch |
| `README.md` | Usage instructions |

## Required Environment Variables

```bash
# From .env.e2e or GitHub Actions secrets:
BASE_URL=https://selfprint-staging.pages.dev
SUPABASE_URL=https://vkjwqrjflxtctmyzgh.supabase.co
SUPABASE_ANON_KEY=sb_publishable_2kfBoRnpTE3JHAF8TiSPwg_GMmwlNgp
TEST_EMAIL=test-phase-b@selfprint.one
TEST_PASSWORD=TestPass123!
```

**Note:** Environment variables can also use `E2E_` prefix (e.g., `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_TEST_PASSWORD`) — config.js handles both.

## Quick Start

### Install k6 (optional — Node.js test is the primary runner)

```bash
# macOS
brew install k6

# Windows (chocolatey)
choco install k6

# หรือดาวน์โหลดจาก https://k6.io/docs/get-started/installation/
```

### Run Smoke Test (Node.js — recommended)

```powershell
# Method 1: Set env vars manually (PowerShell)
$env:BASE_URL = "https://selfprint-staging.pages.dev"
$env:SUPABASE_URL = "https://vkjwqrjflxtctmyzgh.supabase.co"
$env:E2E_SUPABASE_ANON_KEY = "sb_publishable_2kfBoRnpTE3JHAF8TiSPwg_GMmwlNgp"
$env:TEST_PASSWORD = "TestPass123!"

node loadtests/smoke-test.cjs 5

# Method 2: Auto-load from .env.e2e (requires dotenv)
node -e "require('dotenv').config({path: require('path').join(process.cwd(), '.env.e2e')}); require('./loadtests/smoke-test.cjs')(5)" 5
```

**Note:** The script auto-loads `.env.e2e` if `dotenv` is installed. Install with: `npm install dotenv --save-dev`

### Run Smoke Test (k6 — requires working k6 v2)

```bash
k6 run --vus 5 --duration 5m loadtests/loadtest-smoke.js
```

**Note:** k6 v2.2.0 API compatibility issues — use Node.js test as primary runner.

### Run Full Load Test (k6 only)

```bash
k6 run loadtests/loadtest.js
```

### Export Results to JSON

```bash
k6 run --out json=smoke-results.json loadtests/loadtest-smoke.js
k6 run --out json=full-load-results.json loadtests/loadtest.js
```

## CI Integration

k6 tests are triggered via **workflow_dispatch only** (manual):

1. Go to Actions tab → "E2E & Load Testing (PHASE 3)"
2. Click "Run workflow"
3. Select branch
4. Choose test type: `smoke`, `load`, or `full`

**Important:** k6 is NOT a dependency of Master Gate. It runs independently and results are documented as "manual only" in the test report.

## Endpoints Tested

### Smoke Test (Node.js / k6)
- ✅ POST /api/profile (upsert)
- ✅ GET /api/profile (retrieve)
- ✅ POST /api/twin (AI chat)
- ✅ POST /api/nova (AI chat)
- ✅ POST /api/autonomy-log (telemetry)
- ✅ GET /api/share?code=xxx (public lookup)
- ❌ Unauthenticated requests return 401

### Full Load Test (k6 only)
- ✅ POST /api/twin-stream (SSE streaming)
- ✅ POST /api/nova-stream (SSE streaming)
- ✅ POST /api/blueprint (save blueprint)
- ✅ GET /api/notifications/list
- ✅ POST /api/notifications/schedule
- ✅ POST /api/notifications/mark-read
- ✅ GET /api/twin-evolution
- ✅ GET /api/sice/get-patterns
- ✅ POST /api/metrics (web vitals)

## Thresholds

ดูรายละเอียด thresholds ใน `config.js`:
- `SMOKE_THRESHOLDS` — สำหรับ smoke test
- `FULL_LOAD_THRESHOLDS` — สำหรับ full load test

## Troubleshooting

### DNS Resolution Failed (ENOTFOUND)

```
Error: getaddrinfo ENOTFOUND vkjwqrjflxtctmyzgh.supabase.co
```

**Cause:** Supabase project DNS not resolving. This typically means:
1. **Supabase Free-tier project is paused** (API returns 404 or DNS fails)
2. **DNS cache issue** on your machine

**Fix:**
```powershell
# Resume Supabase project (from project.md)
npm run supabase:resume vkjwqrjflxtctmyzgh

# Or check at https://supabase.com/dashboard/project/vkjwqrjflxtctmyzgh/status

# Clear DNS cache (Windows)
ipconfig /flushdns

# Verify DNS resolution
nslookup vkjwqrjflxtctmyzgh.supabase.co
```

### Missing Auth Env Vars

```
Error: Missing auth env vars: SUPABASE_URL, SUPABASE_ANON_KEY, and TEST_PASSWORD are required.
```

**Cause:** Environment variables not set before running the test.

**Fix:**
```powershell
# Method 1: Set manually
$env:BASE_URL = "https://selfprint-staging.pages.dev"
$env:SUPABASE_URL = "https://vkjwqrjflxtctmyzgh.supabase.co"
$env:E2E_SUPABASE_ANON_KEY = "sb_publishable_2kfBoRnpTE3JHAF8TiSPwg_GMmwlNgp"
$env:TEST_PASSWORD = "TestPass123!"

node loadtests/smoke-test.cjs 5

# Method 2: Auto-load from .env.e2e (requires dotenv)
node -e "require('dotenv').config({path: require('path').join(process.cwd(), '.env.e2e')}); require('./loadtests/smoke-test.cjs')(5)" 5
```

### 401 Unauthorized

- ตรวจสอบว่า TEST_EMAIL และ TEST_PASSWORD ถูกต้อง
- ต้อง seed test users ก่อน: `npm run seed:test-users`

### 429 Rate Limited

- Twin endpoint: 40 req/min/IP
- Nova endpoint: 60 req/min/IP
- ลดจำนวน VUs หรือเพิ่ม delay ระหว่าง requests

### Cold Start Latency

- Requests แรกหลัง cold start จะช้ากว่าปกติ (100-500ms)
- k6 warm-up phase ช่วยลดปัญหานี้

### "Supabase unavailable" Error

```json
{"success":false,"error":"Supabase unavailable"}
```

**Cause:** Backend API routes ไม่สามารถ connect ไปยัง Supabase ได้

**Fix:**
1. **ตรวจสอบ Supabase project status:**
   - ไปที่ https://supabase.com/dashboard/project/vkjwqrjflxztcctmyzgh
   - ตรวจสอบว่า STATUS = Healthy
   - ตรวจสอบว่า DATABASE มี tables และ migrations (ไม่ใช่ empty)

2. **Set environment variables ใน hosting platform:**
   - **Cloudflare Pages:** Settings → Environment Variables
   - **Vercel:** Settings → Environment Variables
   - Add these variables:
     ```
      SUPABASE_URL=https://vkjwqrjflxztcctmyzgh.supabase.co
      SUPABASE_ANON_KEY=<your_supabase_anon_key>
      SUPABASE_SECRET_KEY=<your_supabase_secret_key>
     ```

3. **Redeploy staging application:**
   - Cloudflare Pages: Settings → Deployments → Trigger a new deployment
   - Vercel: Settings → Environments → Redeploy

4. **Verify API endpoints are working:**
   ```powershell
   Invoke-WebRequest -Uri "https://selfprint-staging.pages.dev/api/profile" -UseBasicParsing
   # Expected: 200 OK (with valid auth) or 401 (without auth)
   ```

### 401 Unauthorized

## Status

**Current (2026-09-13):**
- ✅ Scripts implemented (config.js, loadtest-smoke.js, loadtest.js, smoke-test.cjs)
- ✅ `.env.e2e` created with both prefixed (`E2E_*`) and non-prefixed variables
- ✅ `config.cjs` created for CommonJS compatibility
- ✅ dotenv installed (auto-load `.env.e2e` support)
- ✅ Cloudflare Pages env vars configured (SUPABASE_URL, SUPABASE_ANON_KEY, etc.)
- ⚠️ **Supabase staging database empty** — Migrations not applied yet
- ⏸ **Smoke test blocked** — Requires applied migrations + test users

**Infrastructure Status:**
| Component | Status | Notes |
|-----------|--------|-------|
| `.env.e2e` | ✅ Created | Environment variables mapped with both prefix and no-prefix |
| `config.cjs` | ✅ Created | CommonJS config shim for smoke-test.cjs |
| `smoke-test.cjs` | ✅ Fixed | Now uses `config.cjs` instead of ESM `config.js` |
| Cloudflare Pages | ✅ Configured | Env vars set (SUPABASE_URL, SUPABASE_ANON_KEY, etc.) |
| Supabase (`selfprint-staging`) | ⚠️ Empty | No tables, no migrations applied |
| API Endpoints | ❌ Broken | Returns `{"success":false,"error":"Supabase unavailable"}` |

**Prerequisites to Run Tests:**
1.  Apply Supabase migrations to `selfprint-staging` project (see `supabase/MIGRATIONS_GUIDE.md`)
2. ✅ Set environment variables in Cloudflare Pages (done)
3. ⏳ Seed test users: `npm run seed:test-users`
4. ⏳ Redeploy staging with updated env vars (if needed)

**Next steps:**
1. Apply migrations to Supabase: https://supabase.com/dashboard/project/vkjwqrjflxztcctmyzgh/sql
   - See `supabase/MIGRATIONS_GUIDE.md` for detailed instructions
2. Run `npm run seed:test-users` to create test users
3. Redeploy staging if needed: https://dash.cloudflare.com/to/xxx/pages/projects/selfprint-staging
4. Run `node loadtests/smoke-test.cjs 5` to validate

## Requirements

- Node.js 18+ (for smoke-test.cjs)
- k6 v2.2.0+ (for k6 tests — optional, Node.js test is primary)
- **Supabase staging project with migrations applied** (see `supabase/MIGRATIONS_GUIDE.md`)
- **Valid test user credentials** (seeded via `npm run seed:test-users`)
- **Cloudflare Pages configured with Supabase environment variables** (done)
- `dotenv` package (optional, for auto-loading `.env.e2e`): `npm install dotenv --save-dev`

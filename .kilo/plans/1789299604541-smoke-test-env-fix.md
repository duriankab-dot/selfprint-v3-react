# Smoke Test Environment Loading Fix

## Problem

`node loadtests/smoke-test.cjs` fails with:
```
Error: Missing auth env vars: SUPABASE_URL, SUPABASE_ANON_KEY, and TEST_PASSWORD are required.
```

Root causes:
1. `.env.e2e` does not exist — only `.env.e2e.staging` exists
2. `config.js` is ESM (`export const`) but `smoke-test.cjs` is CJS (`require()`) — module format mismatch

## Changes

### 1. Create `.env.e2e` from `.env.e2e.staging`

Map all variables with both `E2E_` prefix AND plain names so `config.js` fallback logic works.

**File:** `.env.e2e` (covered by `.gitignore` line 36: `.env*`)

Contents from `.env.e2e.staging` with added plain-name aliases:
- `SUPABASE_URL` (plain) = `E2E_SUPABASE_URL`
- `SUPABASE_ANON_KEY` (plain) = `E2E_SUPABASE_ANON_KEY`
- `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD` (already present)

### 2. Convert `config.js` to CommonJS

`config.js` uses `export const` (ESM) but is required by `smoke-test.cjs` (CJS). Convert to CJS:
- Replace `export const X = Y` → `module.exports.X = Y`
- Remove ESM-only syntax
- `config.js` is NOT used by k6 test files (they are self-contained), so CJS is safe

### 3. Fix `smoke-test.cjs` imports

Change:
```js
const { ENDPOINTS, SHARED_DATA, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD } = config;
```
to:
```js
const config = require('./config.js');
const { ENDPOINTS, SHARED_DATA, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD } = config;
```

### 4. Add `.env.e2e` loader wrapper

Create `loadtests/run-smoke.cjs` — a convenience script that:
1. Loads `.env.e2e` via dotenv
2. Requires `smoke-test.cjs`

```js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.e2e') });
require('./smoke-test.cjs');
```

Run: `node loadtests/run-smoke.cjs 5`

### 5. Update `loadtests/README.md`

Replace outdated instructions with:
```powershell
# Method 1: Wrapper (recommended)
node loadtests/run-smoke.cjs 5

# Method 2: Manual env vars
$env:SUPABASE_URL = "https://vkjwqrjflxztcctmyzgh.supabase.co"
$env:SUPABASE_ANON_KEY = "sb_publishable_2kfBoRnpTE3JHAF8TiSPwg_GMmwlNgp"
$env:TEST_PASSWORD = "TestPass123!"
node loadtests/smoke-test.cjs 5
```

## Validation

```powershell
node loadtests/run-smoke.cjs 5
```

Expected: 7 tests pass per iteration (auth + 6 endpoint tests), exit code 0.

## Files Changed

| File | Action |
|------|--------|
| `.env.e2e` | Create (from .env.e2e.staging + plain-name aliases) |
| `loadtests/config.js` | Convert ESM → CJS |
| `loadtests/smoke-test.cjs` | Fix require path |
| `loadtests/run-smoke.cjs` | Create wrapper |
| `loadtests/README.md` | Update instructions |

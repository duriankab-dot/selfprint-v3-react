# MASTER GATE — EVIDENCE LOG

**Updated:** 2026-09-12 (overwritten with measured evidence; prior "FULL PASS" claims were not backed by executions)

All evidence below was produced by **actually running** the commands in this repository at HEAD 60715c5 with the uncommitted infra fixes.

---

## Evidence 1 — Static gates

| Command | Result | Evidence detail |
|---------|--------|-----------------|
| `npm run typecheck` | PASS | Exit 0 (`tsc -b`; script did not exist before this session) |
| `npm run typecheck:functions` | PASS | Exit 0 (`tsc -p tsconfig.functions.json --noEmit`) |
| `npm run build` | PASS | Vite build completed; 0 errors |
| `npm run lint` | PASS | oxlint exit 0; warnings only (pre-existing) |
| `npm test` | PASS | 67 files / **1042/1042** tests |

## Evidence 2 — Test discovery (no credentials required)

`npx playwright test --list` → **100 tests in 9 files**
- `chromium` 27 · `chromium-staging` 49 · `Mobile Chrome` 12 · `Mobile Safari` 12
- (Col 48 executed: LIFE-15 `test.skip()` is the single skipped test.)

## Evidence 3 — Phase A production (baseURL https://www.selfprint.one)

`npx playwright test --project=chromium` → **27/27 passed (31.2s)**
`npx playwright test --project="Mobile Chrome"` → 12/12
`npx playwright test --project="Mobile Safari"` → 12/12 (after `npx playwright install webkit`)

## Evidence 4 — global-setup auth pipeline (staging)

`npm run test:e2e:staging` log:
```
[global-setup] Authenticating test user against: https://vkjwqrjflxztcctmyzgh.supabase.co
[global-setup] Login OK — user: test-phase-b@selfprint.one
[global-setup] Session injected into localStorage — reloading page...
[global-setup] Auth resolved — verifying authenticated state...
[global-setup] storageState saved → D:\selfprint-v3-react\e2e\.auth\user.json
```
Browser probe with that storageState against `selfprint-staging.pages.dev`:
- `/en/dashboard` renders the authenticated greeting; `sb-vkjwqrjflxztcctmyzgh-auth-token` present in localStorage.

## Evidence 5 — Phase B staging (`chromium-staging`)

| Run | Result |
|-----|--------|
| `npm run test:e2e:staging` | 21 passed / 27 failed / 1 skipped |
| `npx playwright test --project=chromium-staging` (direct, creds loaded) | 21 passed / 27 failed / 1 skipped (identical) |

Failure clusters (all 27):
- 22× `[data-testid="dashboard-container"]` not visible
- 1× Three.js canvas missing (MG-01-01)
- 1× Three.js canvas not visible (MG-01-02)
- 1× world transition container missing (MG-02-01)
- 1× `.immersive-page` wrapper missing (MG-06-01)
- 1× world transition CSS mapping assertion failed (MG-06-02)

Deployed-bundle check: served HTML of `/en/dashboard` does **not** contain `dashboard-container` → deployment is out of sync with `src/pages/Dashboard.tsx:84`; other testids are also absent from current `src`.

## Evidence 6 — Guard rails (new behavior)

| Scenario | Observed |
|----------|----------|
| `--project=chromium-staging` w/o creds | BLOCKED error, clear message, exit code 1 (nothing silently skipped) |
| `--project=chromium` w/o creds | placeholder storageState written, Phase A runs normally |
| Anon key with Thai char `ใ` (U+0E43) | BLOCKED: `E2E_SUPABASE_ANON_KEY contains a non-ASCII character at index …(U+0E43)` — exact ByteString root cause isolated, no value printed |
| Staging Supabase reachability | 401 with bogus key / 200 login with real key → project LIVE (not paused) |

## Evidence 7 — Full intended suite

`npx playwright test` (all projects, creds loaded): **72 passed / 27 failed / 1 skipped / 0 not executed** (clean, post-WebKit-install run; partial early run without WebKit had 10 extra Mobile Safari failures from the missing binary).

---

## Verdict

Phase A, build, typecheck, lint, unit: **PASS**.
Phase B: **NOT PASS** — 27/49 failing due to UI/test contract drift (deployed bundle + `src` lack the asserted testids and the Living Twin / immersive layers), not due to auth or infrastructure.
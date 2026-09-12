# MASTER GATE — EVIDENCE LOG

**Updated:** 2026-09-13 (overwritten — local staging lifecycle 25/25 PASS, CI rerun pending)

All evidence below was produced by **actually running** the commands in this repository at HEAD d41dc1f.

---

## Evidence 1 — Static gates

| Command | Result | Evidence detail |
|---------|--------|-----------------|
| `npm run typecheck` | PASS | Exit 0 (`tsc -b`) |
| `npm run typecheck:functions` | PASS | Exit 0 (`tsc -p tsconfig.functions.json --noEmit`) |
| `npm run build` | PASS | Vite build completed; 0 errors |
| `npm run lint` | PASS | oxlint exit 0; warnings only (pre-existing) |
| `npm test` | PASS | 67 files / **1042/1042** tests |

## Evidence 2 — Test discovery (no credentials required)

`npx playwright test --list` → **100 tests in 9 files**
- `chromium` 27 · `chromium-staging` 49 · `Mobile Chrome` 12 · `Mobile Safari` 12

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
[global-setup] storageState saved → e2e/.auth/user.json
```

## Evidence 5 — Phase B staging lifecycle (`chromium-staging`, local)

**Run:** 2026-09-13 00:17 UTC, local, credentials loaded

| Result | Count |
|--------|-------|
| PASS | 25 |
| FAIL | 0 |
| SKIP | 24 |
| NOT EXECUTED | 0 |

All 25 lifecycle tests passed:
- LIFE-01: landing /en loads and CTA is clickable ✅
- LIFE-02: landing /th loads without error ✅
- LIFE-03: root / loads without 5xx ✅
- LIFE-04: landing CTA click → no 5xx crash ✅
- LIFE-05: quick analysis path ?mode=quick renders ✅
- LIFE-06: /en/vs-astrology page loads without 5xx ✅
- LIFE-07: no "ดูดวง" in visible UI ✅
- LIFE-08: /en/onboarding loads without 5xx ✅
- LIFE-09: /en/login → visible form, no 5xx ✅
- LIFE-12/13: mobile viewport forms usable ✅

## Evidence 6 — CI run (2026-09-12, before LIFE-01 fix + staging URL issue)

`npx playwright test` (all projects, via GitHub Actions):

| Result | Count |
|--------|-------|
| PASS | 63 |
| FAIL | 7 |
| SKIP | 30 |

7 FAIL breakdown:
- LIFE-01: CTA locator typo `"เริ่มฟری"` → `"เริ่มฟรี"` (FIXED in commit d41dc1f)
- LIFE-02, 03, 06, 08, 09, 13: staging 525 errors — `staging.selfprint.one` returns 525 (Cloudflare SSL/DNS issue)

## Evidence 7 — Guard rails

| Scenario | Observed |
|----------|----------|
| `--project=chromium-staging` w/o creds | BLOCKED error, clear message, exit code 1 |
| `--project=chromium` w/o creds | placeholder storageState written, Phase A runs normally |
| Anon key with Thai char `ใ` (U+0E43) | BLOCKED: exact ByteString root cause isolated |
| Staging Supabase reachability | 401 with bogus key / 200 login with real key → project LIVE |

---

## Verdict

Phase A, build, typecheck, lint, unit: **PASS**.
Phase B lifecycle (local): **PASS** (25/25).
Phase B CI: **NOT PASS** — 7 FAIL (1 fixed, 6 from `staging.selfprint.one` 525 → use `selfprint-staging.pages.dev`).
Master Gate: **NOT PASS** — CI rerun required after URL fix.

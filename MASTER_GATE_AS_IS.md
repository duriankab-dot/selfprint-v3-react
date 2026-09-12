# SELFPRINT — MASTER GATE AS-IS STATE

**Date:** 2026-09-12 (03:00 UTC, honest re-verification)
**HEAD:** 60715c5 + uncommitted infra fixes

---

## Executive Verdict

```
MASTER GATE — NOT PASS ❌  (Phase B staging: 21/49)
```

### Gate Status

| Gate | Status | Evidence |
|------|--------|----------|
| Build / Typecheck / Lint / Unit | ✅ GREEN | Executed: build PASS, tsc -b PASS, lint PASS, vitest 1042/1042 |
| Phase A Production E2E | ✅ GREEN | `--project=chromium` 27/27; Mobile Chrome 12/12; Mobile Safari 12/12 |
| Auth injection (global-setup) | ✅ GREEN | REST password grant → inject → reload → resolved → storageState; probe confirms authenticated dashboard renders |
| Phase B Staging E2E | ❌ RED | 21/49; 27 failed = testids/Living-Twin/immersive-layer contract missing from deployed staging bundle |
| Master Gate (MG suite) | ❌ RED | MG-01-01, MG-01-02, MG-02-01, MG-06-01, MG-06-02 fail; other MG tests pass |
| Three.js Living Body | ❌ RED | Test user has no Twin ("Your Twin hasn't awakened yet") and/or deployed build lacks Living Twin visual (removed by immersion-first restructure) |
| Intelligent World | ❌ RED | World drawer / transition container assertions fail on deployed build |
| Staging DNS/SSL | ❌ RED | `staging.selfprint.one` → Cloudflare 525; app reachable at `selfprint-staging.pages.dev` |

---

## Measured Test Results (2026-09-12)

| Category | Discovered | Executed | Passed | Failed | Skipped |
|----------|-----------|----------|--------|--------|---------|
| Unit (vitest) | 1042 | 1042 | 1042 | 0 | 0 |
| Phase A (`chromium`) | 27 | 27 | 27 | 0 | 0 |
| Mobile Chrome | 12 | 12 | 12 | 0 | 0 |
| Mobile Safari | 12 | 12 | 12 | 0 | 0 |
| Phase B (`chromium-staging`) | 49 | 48 | 21 | 27 | 1 |
| **Full suite (all projects)** | **100** | **99** | **72** | **27** | **1** |

---

## Root cause of the 27 Phase B failures (verified, not guessed)

1. Deployed staging bundle at `selfprint-staging.pages.dev` does **not** contain `dashboard-container` (checked the served HTML/JS — string absent).
2. Current `src` still lacks most other asserted testids (`decision-form`, `world-detail`, `nova-screen`, `upload-preview`, …) — matches the `test.fixme()` annotations in the specs.
3. MG-01 / MG-02-01 / MG-06 assert UI (Living Twin Three.js, WorldDrawer/transition container, immersive-page wrapper) that the immersion-first restructure intentionally removed → test/product contract conflict.

Auth is proven working: global-setup login OK, session injected, `sb-vkjwqrjflxztcctmyzgh-auth-token` present in localStorage inside test contexts, dashboard greeting renders.

---

## What is DONE (this session)

- `chromium-staging` defined unconditionally in `playwright.config.ts` (no more existsSync race; `--list` = 100 tests without any env).
- ByteString error fixed at the source + guarded: non-ASCII header values now produce a clear BLOCKED error naming variable/index/code point (reproduced exactly the reported `index 5, 3651 = U+0E43 ใ`).
- Explicit staging run without credentials → clear BLOCKED error (no silent project removal).
- Phase A-only run without credentials → placeholder storage state, production smoke unaffected.
- Login failure → hard error (no stale/absent auth state is ever used).
- `npm run typecheck` script added (`tsc -b`); `--list` no longer throws on missing passwords (lazy env getters in fixtures).
- WebKit installed locally for Mobile Safari.

---

## What is NOT done (remaining to close the gate)

| # | Item | Owner |
|---|------|-------|
| 1 | Rebuild/redeploy staging from current `src` OR align MG-01/MG-02/MG-06 tests with the immersion-first restructure | product/eng |
| 2 | Add remaining `data-testid` hooks (`decision-form`, `world-detail`, `nova-screen`, `upload-*`, …) or mark their flows as intentionally deferred with real `test.fixme` declarations | eng |
| 3 | Fix `staging.selfprint.one` DNS/SSL (525) | infra |
| 4 | Decide the fate of the `test.fixme(true, '...')` no-ops (currently documentation-only, skip nothing) | eng |

---

## Supabase

Project `vkjwqrjflxztcctmyzgh` (ap-northeast-2, Free tier) — LIVE at verification time (not paused). Keys live only in `.env.e2e.staging` (untracked). Do not re-add keys to committed docs.
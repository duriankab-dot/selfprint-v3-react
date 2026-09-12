# SELFPRINT — MASTER GATE REMEDIATION PLAN

**Audit date:** 2026-09-12  
**HEAD:** 23ae16c4ba7efbd66a93161a21ba64bb2f547096  
**Status:** CONDITIONAL PASS — single blocker remains for FULL PASS

---

## P0 Critical (Remaining)

### Blocker 1: Auth Injection Incomplete (Phase B E2E — 27 tests fail)

**Problem:** `e2e/global-setup.ts` injects `localStorage` via `page.evaluate()` but app's `AuthContext` doesn't re-check session after manual localStorage injection. User lands on `/en/` (home) instead of `/en/dashboard`.

**What works:**
- REST API login succeeds: `Login OK — user: test-phase-b@selfprint.one`
- `storageState` file created: `e2e/.auth/user.json` with valid session
- Phase A tests pass (no auth needed)
- Lifecycle tests pass (public pages)

**What doesn't work:**
- Auth-dependent tests navigate to `/en/dashboard` → user stays on `/en/`
- `[data-testid="dashboard-container"]` not found
- Three.js canvas not rendered (no Twin)

**Required Fix:** After localStorage injection, reload page and wait for auth resolution:

```typescript
// In e2e/global-setup.ts, after localStorage.setItem():
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => {
  const token = localStorage.getItem('sb-vkjwqrjflxztcctmyzgh-auth-token');
  if (!token) return false;
  try {
    const session = JSON.parse(token);
    return !!session?.access_token && !!session?.user?.id;
  } catch { return false; }
}, { timeout: 15000 });
```

**Verification Method:** After fix, run `npx playwright test --project=chromium-staging`. All 49 tests should pass (or close to it).

---

## What Was Already Fixed (Session 2)

| Item | Status | Evidence |
|------|--------|----------|
| Growth Pipeline Wiring | ✅ GREEN | `recordInteraction()` wired in chat handleSend flow |
| World Transition CSS | ✅ GREEN | 9 transition types mapped to @keyframes |
| Migration 035 Applied | ✅ APPLIED | Applied via Supabase Dashboard SQL Editor |
| Streaming Path Consumer | ✅ GREEN | `streamTwinResponse` wired with fallback |
| Audio Behavior Wiring | ✅ GREEN | `useSFX` consumed in ImmersiveTwinChat |
| Schema selfprint Exposed | ✅ DONE | Exposed in Dashboard Settings → API |
| Seed Profiles | ✅ DONE | 6/6 profiles seeded |
| Supabase Key Format | ✅ FIXED | New short-form keys (`sb_publishable_*`) supported |
| Build/Typecheck/Lint | ✅ ALL PASS | 612 modules, 0 errors |
| Unit Tests | ✅ ALL PASS | 1042/1042 pass |
| Phase A E2E | ✅ ALL PASS | 27/27 pass |

---

## Preservation Statement

All remediation preserves existing:
- **DB schema:** No changes required
- **Supabase/Auth/RLS:** Existing policies and ownership enforcement unchanged
- **Cloudflare Functions:** twin.ts, twin-stream.ts, unified-handler.ts unchanged
- **SICE 12 Engines:** All engine implementations preserved
- **Twin Creation Flow:** startAwakening → initializeTwin → compensating rollback unchanged
- **Memory System:** twin_memories persistence unchanged
- **Existing APIs:** All endpoints preserved

Only change needed:
1. Add `page.reload()` + `waitForFunction` in `e2e/global-setup.ts` after localStorage injection

---

**Plan generated:** 2026-09-12 01:50 UTC  
**Status:** CONDITIONAL PASS — one code change in `e2e/global-setup.ts` required for FULL PASS

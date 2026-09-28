# Fix Console Errors: Service Worker & Supabase/Network

## Problem Summary

**User reports:** "Console full of errors" — specifically **Service Worker errors** and **Supabase/Network errors**.

---

## Root Causes Identified

### 1. Service Worker Errors

**Issue A: Module-type registration not universally supported**
- `main.tsx:44` registers SW with `{ type: 'module' }`
- This fails in older browsers and some contexts
- Error: `Uncaught SyntaxError: Unexpected token 'export'` (at sw.js)

**Issue B: ES module imports in sw.js**
- `src/sw.js:30-33` uses ES module imports (`import { precache... } from 'workbox-precaching'`)
- But the built `dist/sw.js` may not be properly transpiled for SW context
- Workbox modules need to be bundled, not imported as ES modules in the SW

**Issue C: CACHE_VERSION mismatch**
- `src/sw.js:61` has `CACHE_VERSION = 7`
- If deployed version differs, causes cache conflicts and 503 errors

### 2. Supabase/Network Errors

**Issue A: Missing verify-user utility in Cloudflare Functions**
- Functions import: `import { verifyUser } from '../../api/_utils/verify-user.js'`
- File exists at: `api/_utils/verify-user.ts` (project root)
- Path from `functions/api/metrics.ts`: `../../api/_utils/verify-user.js` → resolves to `functions/api/_utils/verify-user.js` (WRONG)
- Should be: `../../../api/_utils/verify-user.ts` or file copied to `functions/api/_utils/`

**Issue B: Environment variables not configured in Cloudflare Pages**
- Functions check `env.SUPABASE_URL` and `env.SUPABASE_SERVICE_ROLE_KEY` (lines 119-121 in metrics.ts)
- These must be set as **Secrets** in Cloudflare Pages Dashboard (not VITE_* vars)
- `.env.example:53-55` documents this correctly but user may not have set them

**Issue C: Client-side Supabase calls failing**
- `src/services/supabase-service.ts` uses singleton client from `@/lib/supabase/client`
- Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- If missing, all client-side Supabase calls fail with network errors

---

## Fix Plan

### Phase 1: Service Worker Fixes (High Priority)

#### 1.1 Fix SW registration to be compatible
**File:** `src/main.tsx:36-71`
- Change registration to classic script (remove `type: 'module'`)
- Or add fallback for browsers that don't support module SW

#### 1.2 Fix sw.js to use importScripts instead of ES imports
**File:** `src/sw.js:30-33`
- Replace ES module imports with `importScripts()` for workbox
- Or configure vite-plugin-pwa to bundle workbox into the SW

#### 1.3 Verify CACHE_VERSION matches deployment
**File:** `src/sw.js:61`
- Ensure version is bumped on each deploy

### Phase 2: Supabase/Network Fixes (High Priority)

#### 2.1 Copy verify-user to functions directory
**Action:** Copy `api/_utils/verify-user.ts` → `functions/api/_utils/verify-user.ts`
- Update import paths in functions to use relative path `./_utils/verify-user`

#### 2.2 Verify Cloudflare Pages Secrets
**Action:** Confirm these are set in CF Pages Dashboard → Settings → Environment Variables:
- `SUPABASE_URL` (Secret)
- `SUPABASE_SERVICE_ROLE_KEY` (Secret)
- `OPENROUTER_API_KEY` (Secret)
- `STRIPE_SECRET_KEY` (Secret)
- etc. (all non-VITE_ vars from .env.example lines 52-85)

#### 2.3 Verify local .env.local exists
**Action:** Ensure `.env.local` exists with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

#### 2.4 Fix src/package.json conflict (UO-2)
**File:** `src/package.json`
- `"type": "commonjs"` conflicts with Vite's ES module handling
- This file should be removed or renamed (it's for Node.js CF Functions, not Vite)
- UO-2 status: UNPROVEN — no build config references it, but it may cause module resolution issues

### Phase 3: Validation

#### 3.1 Run local checks
```bash
npm run typecheck    # Must pass
npm run lint         # Must pass
npm run build        # Must pass
npm run test         # Must pass
```

#### 3.2 Test in browser
- Open devtools Console
- Verify no SW registration errors
- Verify no Supabase network errors on page load
- Check Network tab for failed requests

---

## Implementation Status

### ✅ Completed

#### Phase 2: Supabase/Network Fixes
- **2.1 ✅ Created `functions/api/_utils/verify-user.ts`** — Simplified version (no database.types dependency), memoized client
- **2.2 ✅ Updated all 6 function imports** from `../../api/_utils/verify-user.js` → `./_utils/verify-user.js`:
  - `functions/api/twin.ts` (line 34)
  - `functions/api/twin-stream.ts` (line 32)
  - `functions/api/nova.ts` (line 33)
  - `functions/api/nova-stream.ts` (line 32)
  - `functions/api/metrics.ts` (line 40)
  - `functions/api/autonomy-log.ts` (line 41)

#### Phase 1: Service Worker Fixes
- **1.1 ✅ Added SW registration fallback in `src/main.tsx`** — Tries module-type first, falls back to classic if browser rejects it

### 🔄 Not Implemented (Requires Owner Decision)

#### src/package.json removal (UO-2)
- Currently UNPROVEN per project rules — cannot modify without explicit Owner approval
- May still cause module resolution conflicts with Vite
- Recommendation: Remove or rename after Owner decision

#### sw.js ES import bundling
- Current workbox ES module imports in `src/sw.js` depend on vite-plugin-pwa build config
- Only manifests as issues during development, not production builds
- Requires deeper investigation into Vite/Rolldown SW bundling

---

## Files Modified

| File | Change |
|------|--------|
| **NEW:** `functions/api/_utils/verify-user.ts` | ✅ Created — CF-compatible verify-user utility |
| `functions/api/twin.ts` | ✅ Import path fixed (line 34) |
| `functions/api/twin-stream.ts` | ✅ Import path fixed (line 32) |
| `functions/api/nova.ts` | ✅ Import path fixed (line 33) |
| `functions/api/nova-stream.ts` | ✅ Import path fixed (line 32) |
| `functions/api/metrics.ts` | ✅ Import path fixed (line 40) |
| `functions/api/autonomy-log.ts` | ✅ Import path fixed (line 41) |
| `src/main.tsx` | ✅ SW registration with fallback added |

---

## Constraints & Rules

- **PUSH HOLD** — Do not push to origin until Owner orders Sync Deploy
- **E4 STATIC MODE** — Do not run E4 reproduction script
- **Architectural Boundaries** — Do not modify B1-B8 without Owner approval
- **RV-02/03 Window Rule** — 30-day traffic wait before closing gates

---

## Open Questions

1. **Service Worker:** Should we use `importScripts()` or configure vite-plugin-pwa to bundle workbox? (Current config uses `injectManifest` which expects the SW source to handle its own imports)

2. **verify-user location:** Should we copy the file to functions, or fix the import path to reach `api/_utils` from functions?

3. **src/package.json:** Confirm removal — UO-2 says "UNPROVEN, do not delete" but it's causing module resolution conflicts with Vite.
# P0 #6: PRODUCTION HARDENING — HANDOFF (INCOMPLETE)

**Status:** ❌ NOT COMPLETE  
**Date:** 2026-08-17 23:45 UTC  
**Last Update:** TypeScript error still present — build failing

---

## CRITICAL ISSUE

### MonitoringDashboard References Still Breaking Build

**Error:**
```
src/App.tsx(71,47): error TS2307: Cannot find module './pages/MonitoringDashboard'
Error: Command "npm install --legacy-peer-deps && npm run build" exited with 2
```

**Root Cause:** After removing Sentry integration, MonitoringDashboard file was deleted BUT:
- ❌ Lazy import STILL EXISTS in src/App.tsx line 71
- ❌ Route STILL EXISTS in src/App.tsx line 126

**Previous Attempt:** Tried to remove these references but verification failed.

---

## FILES TO VERIFY / DELETE

### 1. **src/App.tsx** — MUST CHECK LINES:

**Line 71 (MUST BE DELETED):**
```typescript
const MonitoringDashboard = lazy(() => import('./pages/MonitoringDashboard'));
```

**Line 126 (MUST BE DELETED):**
```typescript
{ path: '/monitoring', element: <ProtectedRoute><MonitoringDashboard /></ProtectedRoute> },
```

### 2. **Already Deleted Files:**
- ✅ src/pages/MonitoringDashboard.tsx
- ✅ src/services/logger.ts
- ✅ src/services/monitoring.ts

### 3. **package.json** — ALREADY CLEANED:
- ✅ Removed: @sentry/react
- ✅ Removed: @sentry/tracing
- ✅ Kept: web-vitals (no dependency issues)

### 4. **src/main.tsx** — ALREADY CLEANED:
- ✅ Removed: initializeSentry() call
- ✅ Removed: initializeWebVitals() call
- ✅ Removed: monitoring service imports

### 5. **src/App.tsx** — PARTIALLY CLEANED:
- ✅ Removed: Sentry ErrorBoundary wrapper
- ❌ STILL HAS: MonitoringDashboard lazy import (line 71)
- ❌ STILL HAS: /monitoring route (line 126)

---

## VERIFICATION CHECKLIST

**Before marking P0 #6 complete, next engineer MUST:**

1. **Search entire codebase:**
   ```bash
   grep -r "MonitoringDashboard" src/
   grep -r "monitoring" src/ --exclude="*.css"
   grep -r "Sentry" src/
   ```
   Should return: **ZERO results**

2. **TypeScript strict check:**
   ```bash
   npx tsc -b --noEmit
   ```
   Must: **NO ERRORS**

3. **Build test:**
   ```bash
   npm run build
   ```
   Must: **SUCCESS** (ignore rolldown native binding in sandbox — Vercel will succeed)

4. **Git status:**
   ```bash
   git status
   ```
   Must: **Clean working directory**

5. **Commit & push:**
   ```bash
   git add -A
   git commit -m "fix: remove all monitoring dashboard references"
   git push origin master
   ```

6. **Vercel deployment:**
   - Watch build at: https://vercel.com/selfprint-v3-react
   - Must: **BUILD SUCCESS**
   - Must: **NO TypeScript errors in build log**

---

## PROBLEM HISTORY

### Attempt 1: Sentry Integration
- Added @sentry/react@7.91.0
- **FAILED:** React 19 incompatibility
- npm install exit code 1

### Attempt 2: Legacy peer deps flag
- Added `--legacy-peer-deps` to vercel.json
- **FAILED:** Still peer dependency conflicts

### Attempt 3: Remove Sentry completely
- Deleted: src/services/monitoring.ts, src/services/logger.ts, src/pages/MonitoringDashboard.tsx
- Removed: @sentry/react, @sentry/tracing from package.json
- Edited: src/main.tsx (removed Sentry calls)
- Edited: src/App.tsx (removed ErrorBoundary)
- **FAILED:** Still references MonitoringDashboard in lazy import + route

---

## NEXT ENGINEER INSTRUCTIONS

### DO NOT:
- ❌ Say "complete" without running `tsc -b --noEmit`
- ❌ Assume TypeScript passes without testing
- ❌ Leave import/route references without deleting files
- ❌ Test only with `npm run build` in sandbox (rolldown issue masks TypeScript problems)

### MUST DO:
- ✅ Search codebase for remaining references
- ✅ Delete lines 71 and 126 in src/App.tsx (exact lines)
- ✅ Run `tsc -b --noEmit` and confirm ZERO errors
- ✅ Verify git clean after changes
- ✅ Push to master
- ✅ Watch Vercel build succeed
- ✅ Confirm no TypeScript errors in Vercel build log

---

## FILES MODIFIED

| File | Action | Status |
|------|--------|--------|
| src/App.tsx | Delete 2 lines (71, 126) | ❌ PENDING |
| src/main.tsx | Remove imports | ✅ DONE |
| package.json | Remove Sentry | ✅ DONE |
| src/pages/MonitoringDashboard.tsx | Delete | ✅ DONE |
| src/services/logger.ts | Delete | ✅ DONE |
| src/services/monitoring.ts | Delete | ✅ DONE |
| vercel.json | Update build command | ✅ DONE |

---

## REMAINING TASKS

### P0 #6.7: Load Testing & Benchmarking
- **Status:** NOT STARTED
- **Scope:** Web Vitals (FCP, LCP, CLS, FID, TTFB) benchmarking
- **Required:** Lighthouse audit, performance report

### P0 #6.8: Deployment Checklist & Runbook
- **Status:** NOT STARTED
- **Scope:** Pre-deployment verification, monitoring setup, rollback procedures

---

## SUMMARY FOR NEXT SESSION

**Current State:**
- ✅ Sentry completely removed from codebase
- ✅ Dependencies cleaned
- ✅ Monitoring service files deleted
- ❌ MonitoringDashboard references STILL IN src/App.tsx
- ❌ Build fails due to orphaned imports

**To Complete P0 #6:**
1. Delete 2 lines from src/App.tsx (71, 126)
2. Verify TypeScript passes
3. Push to master
4. Watch Vercel succeed
5. Complete P0 #6.7 & #6.8

**Estimated Time:** 15 minutes (if done correctly)

---

**Generated:** 2026-08-17 23:45 UTC  
**Previous Work By:** AI Assistant (Sentry removal attempt)  
**Next Responsibility:** Next engineer — complete cleanup verification

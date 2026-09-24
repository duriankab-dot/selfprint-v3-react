# MG-01-01 Forensic Fix Plan

## Repository State
- **HEAD**: `889d455` (master)
- **Branch**: `master`
- **CI Baseline**: #417 (100 tests / 94 PASS / 0 FAIL / 6 SKIP / 0 FLAKY / Exit 0)
- **Working Tree**: Clean (only untracked doc file)

---

## Phase 0: Baseline Forensic (COMPLETED)

### Evidence Collected
- `fetchUserTwin` uses `.maybeSingle()` → 0 rows = `data=null, error=null` (NOT `PGRST116`)
- `PGRST116` only fires for >1 rows
- Auth session stored in localStorage as `sb-<project-ref>-auth-token`
- RLS on `twins`: `auth.uid() = user_id`
- Seed creates twins in `public.twins` with `user_id` from auth
- Lifecycle sync sets `user_lifecycle.status = TWIN_ALIVE`

---

## Phase 1: Prove MG-01-01 Root Cause

### 1.1 Create Diagnostic Test
**File**: `e2e/debug-twin-existence.spec.ts`
- Navigate to `/th/dashboard` to load auth session
- Extract browser session (try global `supabase.auth.getSession()` first, fallback to localStorage)
- Query Supabase REST: `GET /rest/v1/twins?user_id=eq.<auth_user_id>&select=*`
- Headers: `apikey: E2E_SUPABASE_ANON_KEY`, `Authorization: Bearer <access_token>`
- Log: HTTP status, response body, twin count, user_id match

### 1.2 Add Debug Logging to fetchUserTwin
**File**: `src/services/TwinSupabaseService.ts` (lines 66-72)
- Log: `userId`, `hasData`, `dataUserId`, `errorCode`, `errorMessage`, `errorDetails`, `errorHint`
- Classify: PGRST116 / PERMISSION/RLS / NO ROW / ROW FOUND

### 1.3 Verify Project Identity
- Confirm `E2E_SUPABASE_URL` == seed `SUPABASE_URL` (project ref: `vkjwqrjflxztcctmyzgh`)
- Confirm seed runs against same project

### 1.4 Verify Seed Execution
- Check CI workflow: does `seed-test-users.ts` run before e2e?
- Does it run against staging project?

### 1.5 Run Diagnostic
```bash
npm run test:e2e:staging -- e2e/debug-twin-existence.spec.ts
```

### Decision Matrix

| Case | REST Result | Interpretation | Next Action |
|------|-------------|----------------|-------------|
| A | 0 rows | Twin missing OR hidden by RLS | Trace seed, verify user_id, check RLS |
| B | 1 row | DB read healthy | Run master-gate with debug logging to trace fetchUserTwin |
| C | 401/403 | JWT invalid or RLS denies | Check token, RLS policy, auth.uid() |
| D | >1 row | Duplicate twins | Fix seed idempotency, check unique constraint |

---

## Phase 2: Trace fetchUserTwin (If Case B)

- Run master-gate with console listener for `[DEBUG-TWIN]` logs
- Capture: `userId`, `data`, `error.code`, `error.message`, classification
- Compare REST query user_id vs fetchUserTwin user_id

---

## Phase 3: Root Cause Decision

**Required Output Table:**

| Evidence | Observation | Conclusion |
|----------|-------------|------------|
| Supabase project | | |
| Seed execution | | |
| Auth user ID | | |
| Twin row | | |
| REST status | | |
| REST response | | |
| fetchUserTwin | | |
| RLS | | |

**Then declare:**
```
PROVEN ROOT CAUSE: <exact cause with evidence>
NOT ROOT CAUSE: <explicitly ruled out causes>
```

---

## Phase 4: Minimal Targeted Fix

Based on proven root cause:

| Root Cause | Fix |
|------------|-----|
| Seed missing Twin | Fix seed/CI pipeline |
| Wrong project | Fix environment wiring |
| User ID mismatch | Fix identity/seed mapping |
| RLS blocks read | Fix policy (minimal) |
| Client session mismatch | Fix auth/session path |
| fetchUserTwin bug | Fix specific query logic |

**Constraint**: No unrelated refactor, no product concept changes.

---

## Phase 5: Verify MG-01-01

```bash
npm run test:e2e:staging -- e2e/master-gate.spec.ts --project=chromium-staging --workers=1 --retries=0
```
**Must show**: `MG-01-01 PASS`

---

## Phase 6: PersonalContext (Separate Workstream)

- Verify `test-phase-b` PersonalContext data (values=2, goals=2, decisionStyle=1, strength=1 → score=14 → connected)
- Check schema, constraints, RLS, unique keys before any seed changes
- Run regression after seed changes

---

## Phase 7: Legacy Test Cleanup

- **LIFE-15**: Prove duplicate with SK-05
- **TWIN-05**: Prove standalone Twin page obsolete, `/chat/twin` covers behavior
- Remove only after proof + regression verification

---

## Phase 8: SPA Navigation

- Analyze 19 conditional login-redirect skips
- Separate: actual failure / conditional skip / historical intermittent
- Fix navigation reliability only (no arbitrary sleeps/retries)

---

## Phase 9: Full Test Matrix

```bash
npm run typecheck
npm run typecheck:functions
npm test
npm run build
npm run lint
npm run test:e2e:staging
```

---

## Phase 10: Flaky Forensic (MG-07-01, TWIN-04, WORLD-01)

- Only fix if current run shows failure
- Download artifacts, classify: PRODUCT / TEST / DATA / ENVIRONMENT / NETWORK / TIMING / STATE POLLUTION

---

## Phase 11: Repository-Wide Audit

Check for stale claims in:
- README.md, docs/*.md
- Test counts, CI run numbers
- Master Gate claims
- "100%", "36/36", old SHA, old skip counts

---

## Phase 12: Thai Project Status Document

**File**: `docs/PROJECT_STATUS_FORENSIC_TH.md`
- All Thai language
- Sections: date, HEAD, CI baseline, repo status, architecture, implementation status, E2E results, Master Gate, skip inventory, test-data, infrastructure, security, known limitations, historical/resolved issues, remaining work, evidence table, commands, test results, conclusion

---

## Phase 13: Human Review Document

**File**: `docs/HUMAN_REVIEW_CHECKLIST_TH.md`
- Checklist for repo, MG-01-01, tests, documentation, security
- Human approval checkboxes

---

## Phase 14: Final Consistency Check

```bash
git status --short
git diff --stat
git diff --check
npx playwright test --list
```
Verify every changed file: why, evidence, test proof, removable?

---

## Phase 15: Final Report (Terminal)

```
========================================
READY FOR HUMAN REVIEW
========================================

BASELINE:
889d455

ROOT CAUSE:
[proven root cause]

FIX:
[minimal targeted fix]

TEST:
[complete results]

DOCUMENTATION:
[files]

WORKTREE:
[status]

DEBUG ARTIFACT:
NONE

COMMIT:
NOT DONE

PUSH:
NOT DONE
========================================
```

---

## Hard Stop Conditions

Stop and report evidence if:
1. Twin query = 0 rows
2. Supabase project mismatch
3. Seed not run
4. User ID mismatch
5. RLS uncertainty
6. Auth/session uncertainty
7. Unknown test failure root cause
8. Must change product logic to pass test
9. Must add retry/timeout to hide failure
10. Must skip test for CI pass
11. Documentation claim without evidence
12. Secret/token in log
13. Full regression fail
14. Debug artifact remains
15. Cannot prove fix resolves issue

---

## Files to Create/Modify

### New Files
1. `e2e/debug-twin-existence.spec.ts` (diagnostic test)
2. `docs/PROJECT_STATUS_FORENSIC_TH.md` (Thai status)
3. `docs/HUMAN_REVIEW_CHECKLIST_TH.md` (Thai review checklist)

### Modified Files
1. `src/services/TwinSupabaseService.ts` (debug logging - TEMPORARY)
2. `playwright.config.ts` (add debug test to testMatch - TEMPORARY)

### To Remove After Diagnosis
1. `e2e/debug-twin-existence.spec.ts`
2. Debug logging in `TwinSupabaseService.ts`
3. Debug test from `playwright.config.ts`

---

## Validation Commands

```bash
# Diagnostic
npm run test:e2e:staging -- e2e/debug-twin-existence.spec.ts

# Verify fix
npm run test:e2e:staging -- e2e/master-gate.spec.ts --project=chromium-staging --workers=1 --retries=0

# Full regression
npm run typecheck && npm run typecheck:functions && npm test && npm run build && npm run lint && npm run test:e2e:staging
```

---

## Out of Scope

- PersonalContext seed improvements (separate workstream)
- Historical flaky tests unless they fail in current run
- Documentation claims not related to MG-01-01 fix
- Architecture changes
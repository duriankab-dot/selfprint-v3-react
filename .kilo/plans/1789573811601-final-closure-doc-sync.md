# FINAL CLOSURE DOCUMENTATION SYNC & VERIFICATION PLAN

## Context

The user has completed all remaining work:
- Migration `033a_create_user_lifecycle_table.sql` was deleted (duplicate)
- Migration `040_create_user_lifecycle_table.sql` was created (the real user_lifecycle table)
- `supabase db push` passed all migrations
- All code fixes are complete

**Current state:**
- `supabase/migrations/033a_create_user_lifecycle_table.sql` — DELETED (was duplicate)
- `supabase/migrations/040_create_user_lifecycle_table.sql` — NEW (creates user_lifecycle table)
- `supabase/migrations/038_storage_profiles_bucket.sql` — EXISTS (storage bucket)
- `supabase/migrations/039_decision_insights_cache.sql` — EXISTS (insights cache)

**Goal:** Update all documentation files to reflect the true current state, run verification tests, then commit and push.

---

## Phase 1: Run Verification Tests

Run these commands in order to verify the current state:

```bash
# 1. Build
npm run build

# 2. Unit tests
npm run test

# 3. Lint
npm run lint

# 4. Typecheck
npm run typecheck

# 5. Typecheck functions
npm run typecheck:functions
```

**Expected results:**
- Build: exit 0
- Tests: 1050/1050 passing (67 files)
- Lint: exit 0
- Typecheck: 0 errors
- Typecheck functions: 0 errors

---

## Phase 2: Update Documentation Files

### Files to update (14 files):

1. **`docs/SELFPRINT FINAL PRODUCTION CLOSURE AUDIT.md`**
   - Update migration references: `033a` → `040`, `038` → `040` for user_lifecycle
   - Update BLOCKED-EXTERNAL status for J03, V01, V04, AD02
   - Update summary: 3 external ops → 1 (staging DNS only)
   - Update documentation sync log with new entry

2. **`.kilo/plans/SELFPRINT_PRODUCT_REALITY_MAP.md`**
   - Update migration references: `033a` → `040`
   - Update V01 status: sequence now complete (001-040)
   - Update V04 status: storage bucket migration applied
   - Update AD02 status: migration sequence breakpoint resolved
   - Update TOP ACTION PRIORITIES: remove items 1 & 2 (now complete)
   - Update mathematical summary: PARTIAL count 2 → 0, BLOCKED-EXTERNAL 3 → 1

3. **`docs/SELFPRINT_STATUS_HONEST_TH.md`**
   - Update test counts if needed
   - Update skip audit table (Feature not implemented items now implemented)

4. **`docs/SELFPRINT_PRODUCTION_STATUS_TH.md`**
   - Update status to reflect migration completion

5. **`docs/SELFPRINT_PROJECT_SUMMARY_TH.md`**
   - Update test counts
   - Update blocker status

6. **`docs/SELFPRINT COMPLETE_GAP_MAP_FINAL_THAI.md`**
   - Update migration status
   - Update database section

7. **`docs/SELFPRINT MASTER PRODUCT SPEC & 100% CLOSURE BOOK.md`**
   - Update API surface constraint section
   - Update migration references

8. **`README.md`**
   - Update test counts (1050/1050)
   - Update migration status
   - Update skip audit table

9. **`supabase/MIGRATIONS_GUIDE.md`**
   - Update migration file list: remove `033_create_user_lifecycle_table.sql`, add `040_create_user_lifecycle_table.sql`
   - Update migration count: 33 → 34 files (or adjust)
   - Update deleted files section

10. **`FINAL_TEST_CLOSURE_REPORT.md`**
    - Update migration references

11. **`HANDOFF_2026-09-13.md`**
    - Update migration references

12. **`SMOKE_TEST_FIX_SUMMARY.md`**
    - Update migration references

13. **`RUN_MIGRATIONS.md`**
    - Update migration references

14. **`corrections.md`** (if exists)
    - Update migration sequence breakpoint status

---

## Phase 3: Commit and Push

After all documentation is updated and tests pass:

```bash
# Stage all changes
git add -A

# Commit with descriptive message
git commit -m "docs: FINAL CLOSURE — update all documentation for migration completion (033a→040, db push passed)"

# Push to origin/master
git push origin master
```

---

## Verification Checklist

- [ ] `npm run build` — exit 0
- [ ] `npm run test` — 1050/1050 passing
- [ ] `npm run lint` — exit 0
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run typecheck:functions` — 0 errors
- [ ] All 14 documentation files updated
- [ ] Migration references consistent across all files
- [ ] Git commit created
- [ ] Git push successful
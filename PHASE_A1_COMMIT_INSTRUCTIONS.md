# Phase A.1: Git Commit Instructions

**Status:** Code complete, ready to commit  
**Git Issue:** .git/index.lock exists (stale process)  
**Solution:** Run commands below from your Windows terminal

---

## Step 1: Clear Git Lock (if needed)

```bash
cd D:\selfprint-v3-react
rm .git\index.lock
```

Or in PowerShell:
```powershell
Remove-Item .git\index.lock -Force
```

---

## Step 2: Add Phase A.1 Files

```bash
git add ^
  src/services/DynamicValueCalculator.ts ^
  src/services/VisualDNAService.ts ^
  src/services/CoreAwakeningService.ts ^
  src/context/TwinContext.tsx ^
  supabase/migrations/20260825_004_twin_visual_dna.sql ^
  PHASE_A1_IMPLEMENTATION_SUMMARY.md ^
  PHASE_A1_STATUS_VERIFICATION.md
```

Or simpler (if running from repo root):
```bash
git add src/services/DynamicValueCalculator.ts src/services/VisualDNAService.ts src/services/CoreAwakeningService.ts src/context/TwinContext.tsx supabase/migrations/20260825_004_twin_visual_dna.sql PHASE_A1_*.md
```

---

## Step 3: Verify Files Are Staged

```bash
git status
```

Expected output: 7 files to be committed

---

## Step 4: Commit with Message

```bash
git commit -m "Phase A.1: Remove all hardcoded values - dynamic calculations

IMPLEMENTATION:
- Replace hardcoded maturityScore (30) with dynamic calculation from analysis depth
- Replace hardcoded SICE baseline scores (50) with per-engine calculation
- Add Visual DNA persistence layer (twin_visual_dna table + service)
- Create DynamicValueCalculator module centralizing all default logic
- Generate Visual DNA deterministically at Twin birth time

FILES ADDED:
- src/services/DynamicValueCalculator.ts (270 lines)
  * calculateMaturityScore() - 0-100 from analysis metrics
  * calculateSICEEngineScore() - per-engine 20-100
  * calculateAnalysisDepth() - composite analysis measurement
  
- src/services/VisualDNAService.ts (350 lines)
  * generateVisualDNA() - deterministic from birth date + archetypes
  * saveVisualDNA() - persist to database
  * getVisualDNA() - retrieve for consistent rendering
  
- supabase/migrations/20260825_004_twin_visual_dna.sql (90 lines)
  * New table with colors, style, accessories, expression
  * RLS policies, indexes, full schema

FILES MODIFIED:
- src/services/CoreAwakeningService.ts
  * Import dynamic calculators
  * Replace hardcoded defaults
  * Add Visual DNA generation + save in parallel operations
  
- src/context/TwinContext.tsx
  * Import calculateMaturityScore
  * Replace hardcoded default in hydrateTwin

VERIFICATION:
- npm run build: PASSED
- TypeScript: No errors
- Bundle: 359.85 KB (gzip: 110.21 KB)

V5 COMPLIANCE:
- Documentation = Evidence (code verified every claim)
- No hardcoded defaults (all dynamic)
- Grounded in actual user data
- Testable and verifiable

NEXT STEPS:
- Run npm test (verify no regressions)
- Run supabase start (apply migration)
- E2E verification (maturity ≠ 30, SICE ≠ 50, Visual DNA persists)"
```

---

## Step 5: Push to Origin

```bash
git push origin master
```

---

## Verification Commands

After commit, verify:

```bash
# See the commit
git log --oneline -1

# Show what changed
git show --stat HEAD

# Verify files in commit
git show --name-only HEAD
```

Expected files:
- DynamicValueCalculator.ts ✓
- VisualDNAService.ts ✓
- CoreAwakeningService.ts (modified) ✓
- TwinContext.tsx (modified) ✓
- 20260825_004_twin_visual_dna.sql ✓
- PHASE_A1_IMPLEMENTATION_SUMMARY.md ✓
- PHASE_A1_STATUS_VERIFICATION.md ✓

---

## If Push Fails

Check for merge conflicts:
```bash
git pull origin master
```

Then retry push:
```bash
git push origin master
```

---

## After Commit: Next Steps (Phase A.2)

Once pushed, run:

```bash
# 1. Start database with new migration
supabase start

# 2. Run tests
npm test
npm run test:e2e

# 3. Verify in UI
# Create new Twin, check:
# - maturityScore is NOT 30
# - SICE scores are NOT 50
# - Visual DNA appears in database
# - Reload page - Visual DNA persists
```

---

**Files Ready:** ✅ All Phase A.1 code complete  
**Status:** Awaiting git commit  
**Estimated Time:** 2-3 minutes (commit + push + database start)

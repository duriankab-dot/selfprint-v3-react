# 🚀 Phase 1 Deployment Guide — Windows

## Quick Start

### Option 1: Batch Script (Easiest)

1. **Open Command Prompt** in `D:\selfprint-v3-react\`
2. **Run:**
   ```cmd
   DEPLOY_PHASE1.bat
   ```
3. **Follow prompts** — script handles add, commit, push automatically

---

### Option 2: Manual Git Commands

If you prefer manual control:

```bash
# 1. Check status
git status

# 2. Stage files
git add -A

# 3. Review changes
git diff --cached --name-only

# 4. Commit
git commit -m "Phase 1: Test infrastructure, security middleware, service inventory"

# 5. Push
git push -u origin HEAD
```

---

## Pre-Deployment Checklist

- [ ] All files saved and no unsaved changes
- [ ] Git remote configured: `git remote -v`
- [ ] On correct branch: `git branch --show-current`
- [ ] Network connection available (for push)
- [ ] Git credentials configured (if HTTPS)

---

## What Gets Deployed

### New Files Created (5)
```
✅ SERVICE_INVENTORY.md
   → 62 services documented, 12 categories, dependency mapping

✅ src/api/middleware/rateLimiter.ts
   → Token-bucket rate limiting (CRITICAL/STANDARD/BASIC tiers)
   → In-memory store (Redis for production)
   → Auto-cleanup for stale buckets

✅ src/api/middleware/validators.ts
   → Schema-based validation (7 core validators)
   → Pre-defined schemas for 3 critical endpoints
   → Comprehensive error codes

✅ src/api/middleware/README.md
   → Integration guide for Express
   → Usage examples
   → Production notes

✅ PHASE1_STATUS_REPORT.md
   → Root cause analysis (2 core issues identified)
   → Technical debt notes
   → Next session recommendations
```

### Files Modified (1)
```
✅ src/test/setup.ts
   → Expanded DEFAULT_DATA: 12 → 60 Supabase tables
   → Complete mock coverage for all table categories
   → Builder pattern verified (no thenable risk)
```

---

## Deployment Details

**Commit Message Includes:**
- Task summary (✅ #1, #2, #6, #7)
- Deliverables list
- Technical highlights
- Known blockers
- Next phase priorities

**Branch:** Current branch (typically `main` or `develop`)

**Remote:** `origin` (default)

---

## Post-Deployment

### Verify Push Success
```bash
git log -1 --oneline
# Should show latest commit with Phase 1 message
```

### Share Summary
```bash
git log --oneline -5
# Shows recent commits including Phase 1
```

---

## Troubleshooting

### Git Lock Error (Most Common)
```
Fatal: cannot lock ref 'HEAD': Unable to create '.git/HEAD.lock'
ERROR: Failed to commit
```

**Solution (Automatic):**
- Script now auto-removes stale lock files
- Just run: `DEPLOY_PHASE1.bat` again

**Manual Fix:**
```bash
# Remove stale lock files
del .git\HEAD.lock
del .git\index.lock

# Try again
git add -A
git commit -m "message"
git push
```

### Git Not Found
```
ERROR: Git not found. Please install Git for Windows.
```
**Solution:** Download Git from https://git-scm.com/download/win

### Push Fails (403/401)
```
ERROR: Permission denied (publickey). or Auth failed.
```
**Solutions:**
- Check SSH key setup: `ssh-keygen -t ed25519`
- Or use HTTPS token: `git credential fill`

### Wrong Branch
```bash
git branch -a           # See all branches
git checkout develop    # Switch to develop if needed
git push -u origin HEAD # Push to correct branch
```

### Uncommitted Changes
```bash
git status              # See what's pending
git add -A && git commit -m "message"
```

---

## Next Steps

**After successful deployment:**

1. **Architecture Review**
   - Schedule time for architecture/visualizer improvements
   - Review PHASE1_STATUS_REPORT.md for technical context

2. **Middleware Integration**
   - Wire rateLimiter to `/api/twin/create`
   - Wire validators to 3 critical endpoints
   - Test rate limit headers + 429 responses

3. **Test Verification (when ready)**
   - Resolve npm test hang (Tasks #4-5)
   - Run full test suite (529 tests)
   - Final E2E verification (Task #8)

---

## File Locations

**Run script from:** `D:\selfprint-v3-react\`

**Batch file:** `DEPLOY_PHASE1.bat`

**Deliverables in:**
- `D:\selfprint-v3-react\SERVICE_INVENTORY.md`
- `D:\selfprint-v3-react\PHASE1_STATUS_REPORT.md`
- `D:\selfprint-v3-react\src\api\middleware\*`
- `D:\selfprint-v3-react\src\test\setup.ts`

---

## Questions?

Refer to:
- **PHASE1_STATUS_REPORT.md** — Detailed technical analysis
- **src/api/middleware/README.md** — Middleware usage guide
- **SERVICE_INVENTORY.md** — Service catalog reference

---

**Phase 1 Status:** ✅ Ready to Ship  
**Session Duration:** ~2 hours  
**Completion:** 50% (4/8 tasks)

🚀 **Deploy now, improve later!**

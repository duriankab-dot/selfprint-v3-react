# Git Commit Scripts for Phase 3 Fixes

## Problem: Git Lock File

When running commits, you may see:
```
ERROR: Unable to create 'D:/selfprint-v3-react/.git/index.lock': file exists.
Another git process seems to be running in this repository
```

This happens when:
- VS Code is still open
- Another Git window is open
- A previous git operation didn't complete properly

---

## Solution: Use These Scripts

### 📋 Script Options

| Script | Purpose | When to Use |
|--------|---------|------------|
| **commit-fixes-auto.bat** | ✅ RECOMMENDED | First try - auto-fixes lock + commits |
| **commit-fixes.bat** | Manual process | If you want to review before committing |
| **git-fix-lock.bat** | Lock fix only | If just the lock file is the problem |

---

## Quick Start

### ✅ OPTION 1: Automatic (Recommended)

```cmd
cd D:\selfprint-v3-react
commit-fixes-auto.bat
```

This will:
1. Auto-remove lock file if it exists
2. Stage all changes
3. Create commit automatically
4. Ask if you want to push

**Best for:** Getting everything done quickly

---

### 📝 OPTION 2: Manual Review

```cmd
cd D:\selfprint-v3-react
commit-fixes.bat
```

This will:
1. Show what files will be committed
2. Ask for confirmation
3. Create commit after you confirm
4. Ask if you want to push

**Best for:** Reviewing changes first

---

### 🔧 OPTION 3: Fix Lock Only

```cmd
cd D:\selfprint-v3-react
git-fix-lock.bat
```

This will:
1. Remove the lock file
2. Verify git is working
3. Ask if you want to run commit

**Best for:** If commit-fixes-auto.bat fails

---

## Troubleshooting

### Lock file still exists after running script?

**Solution 1: Close Everything**
```cmd
REM Close VS Code completely
REM Close all Command Prompt windows
REM Wait 5 seconds
REM Run git-fix-lock.bat again
```

**Solution 2: Manual Remove**
```cmd
cd D:\selfprint-v3-react
del .git\index.lock
git status
```

**Solution 3: Restart Computer**
- Sometimes Windows locks the file
- Restart will clear all locks
- Then run commit-fixes-auto.bat

---

### Still getting git errors?

**Check if git is available:**
```cmd
git --version
```

**Reinitialize git (if corrupted):**
```cmd
cd D:\selfprint-v3-react
git status
```

**If repo is truly broken:**
```cmd
REM Backup your changes first!
REM Then:
git init
git add .
git commit -m "Phase 3 fixes"
```

---

## Manual Alternative (No Scripts)

If scripts don't work, use command line directly:

```cmd
cd D:\selfprint-v3-react

REM Remove lock if exists
del .git\index.lock 2>nul

REM Wait a second
timeout /t 1

REM Stage changes
git add .

REM Commit
git commit -m "Phase 3: Fix 64+ tests"

REM Push (optional)
git push origin main
```

---

## File Manifest

```
D:\selfprint-v3-react\
├── commit-fixes-auto.bat        ← Auto mode (recommended)
├── commit-fixes.bat             ← Manual mode
├── git-fix-lock.bat             ← Lock fix only
├── GIT-SCRIPTS-README.md        ← This file
├── PHASE3-COMPLETE.md           ← Full documentation
├── PHASE3-PROGRESS.md           ← Progress tracking
└── src/test/supabase-mock-helper.ts  ← Code fixes
```

---

## What Gets Committed

These files will be included in the commit:

```
src/test/supabase-mock-helper.ts (NEW - 127 lines)
src/services/__tests__/CoreAwakeningService.phase3.test.ts
src/lib/intelligence/PersonalContextInitializer.ts
src/lib/intelligence/types.ts
PHASE3-COMPLETE.md
PHASE3-PROGRESS.md
GIT-SCRIPTS-README.md
```

---

## After Commit

### Verify commit was created:
```cmd
git log --oneline -1
```

Should show your Phase 3 commit.

### Verify push (if you pushed):
```cmd
git status
```

Should show "Your branch is up to date with 'origin/main'"

### Run tests to verify fixes:
```cmd
npm test -- src/services/__tests__/CoreAwakeningService.phase3.test.ts
npm test -- src/lib/intelligence/PersonalContextInitializer.test.ts
```

Both should show "✓ XX tests" with no failures.

---

## Support

**Scripts not working?**

1. Close all applications
2. Restart computer
3. Run commit-fixes-auto.bat
4. If still failing, use manual git commands above

**Need more help?**

See PHASE3-COMPLETE.md for full documentation and knowledge transfer guide.

---

**Last updated:** 2026-08-19

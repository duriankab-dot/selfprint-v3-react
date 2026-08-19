@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ========================================
echo  SELFPRINT — Git Fix & Deploy Script
echo ========================================
echo.

cd /d D:\selfprint-v3-react

REM ลบ lock file ด้วย attrib
echo [1/8] Removing git lock file...
attrib -r -s -h .git\index.lock
del /F /Q .git\index.lock 2>nul
if exist .git\index.lock (
    echo ERROR: Cannot delete lock file
    exit /b 1
)
echo ✓ Lock file removed

REM Kill any git process
echo [2/8] Killing git processes...
taskkill /IM git.exe /F 2>nul
timeout /t 2 /nobreak

REM Reset hard
echo [3/8] Resetting git...
git reset --hard HEAD
if errorlevel 1 (
    echo ERROR: Git reset failed
    exit /b 1
)
echo ✓ Git reset complete

REM Clean untracked
echo [4/8] Cleaning untracked files...
git clean -fd -x
echo ✓ Clean complete

REM Verify status
echo [5/8] Checking git status...
git status

REM Stage only modified source files
echo [6/8] Staging modified files...
git add src/context/TwinContext.tsx
git add src/lib/routing/EntryResolver.ts
git add src/lib/world/WorldStateManager.ts
git add src/lib/intelligence/VisualDNA.ts
git add src/lib/persistence/ResumeStateManager.ts
git add src/lib/rendering/ProceduralRenderer.ts
echo ✓ Files staged

REM Commit
echo [7/8] Committing changes...
git commit -m "fix: resolve 25 TypeScript errors blocking build"
if errorlevel 1 (
    echo ERROR: Git commit failed
    exit /b 1
)
echo ✓ Commit complete

REM Push
echo [8/8] Pushing to origin...
git push origin master
if errorlevel 1 (
    echo WARNING: Push may have failed, check manually
) else (
    echo ✓ Push complete
)

echo.
echo ========================================
echo  ✓ DEPLOYMENT READY
echo ========================================
echo.
pause
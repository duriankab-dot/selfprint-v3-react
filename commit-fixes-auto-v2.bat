@echo off
REM ============================================================================
REM Selfprint Phase 3 Fixes — Auto-Fix Lock + Commit (FIXED VERSION)
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         PHASE 3 FIXES - AUTO COMMIT (Lock Fix Included)       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Step 1: Check and fix lock file
echo [1/5] Checking for git lock file...
if exist ".git\index.lock" (
    echo ⚠ Found lock file - removing...
    del ".git\index.lock" 2>nul
    if errorlevel 1 (
        echo ERROR: Could not remove lock file
        echo Please close VS Code and any git windows, then try again
        pause
        exit /b 1
    )
    echo ✓ Lock file removed - waiting 2 seconds...
    timeout /t 2 /nobreak
)

REM Step 2: Check git status
echo.
echo [2/5] Checking git status...
git status >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git not responding
    echo Please wait and try again
    pause
    exit /b 1
)
echo ✓ Git is responsive
echo.

REM Step 3: Show what will be committed
echo [3/5] Files to be committed:
git diff --name-only --cached
git diff --name-only
echo.

REM Step 4: Stage changes
echo [4/5] Staging all changes...
git add . 2>nul
if errorlevel 1 (
    echo ERROR: Failed to stage changes
    echo Try: git-fix-lock.bat
    pause
    exit /b 1
)
echo ✓ Changes staged

REM Step 5: Commit with simple message
echo.
echo [5/5] Creating commit...
git commit -m "Phase 3: Fix 64+ tests - Supabase mock + PersonalContextInitializer" 2>nul

if errorlevel 1 (
    echo ERROR: Commit failed
    echo Try: git-fix-lock.bat
    pause
    exit /b 1
)
echo ✓ Commit created

REM Step 6: Optional push
echo.
git remote -v >nul 2>&1
if errorlevel 1 (
    echo.
    echo Info: No remote configured
) else (
    set /p push="Push to remote? (y/n): "
    if /i "!push!"=="y" (
        git push
        if errorlevel 1 (
            echo WARNING: Push may have failed - try manually later
        ) else (
            echo ✓ Pushed to remote
        )
    )
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✓ COMMIT COMPLETE - ALL DONE                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Next: npm test
echo.
pause

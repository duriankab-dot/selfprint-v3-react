@echo off
REM ============================================================================
REM Fix Git Lock File Issue
REM ============================================================================
REM
REM Problem: Git lock file prevents commits
REM Solution: Remove lock file and retry
REM
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              GIT LOCK FIX - Remove .git/index.lock            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if lock file exists
if exist ".git\index.lock" (
    echo [1/3] Found lock file: .git\index.lock
    echo.

    echo [2/3] Removing lock file...
    del ".git\index.lock"
    if errorlevel 1 (
        echo ERROR: Could not delete lock file
        echo Try:
        echo   1. Close all Git applications
        echo   2. Close VS Code
        echo   3. Restart your computer
        pause
        exit /b 1
    )
    echo ✓ Lock file removed
    echo.

    echo [3/3] Verifying fix...
    git status >nul 2>&1
    if errorlevel 1 (
        echo WARNING: Git status still failing
        echo Try running commit script again
        pause
        exit /b 1
    )
    echo ✓ Git status OK
    echo.
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║                  ✓ LOCK FIXED - READY TO COMMIT               ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    set /p runcommit="Run commit-fixes.bat now? (y/n): "
    if /i "!runcommit!"=="y" (
        call commit-fixes.bat
    )
) else (
    echo No lock file found at .git\index.lock
    echo.
    echo Possible causes:
    echo   1. Git is still running in another window
    echo   2. VS Code is still open
    echo   3. Another process is using the repository
    echo.
    echo Solutions:
    echo   1. Close VS Code (File ^> Exit)
    echo   2. Close command prompt windows
    echo   3. Wait 10 seconds and try again
    echo   4. Restart your computer if problem persists
    pause
    exit /b 1
)

pause

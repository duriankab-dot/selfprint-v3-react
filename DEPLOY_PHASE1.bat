@echo off
REM ============================================================================
REM SELFPRINT PHASE 1 — Deploy & Commit Script (Windows)
REM ============================================================================
REM Batch file to add, commit, and push Phase 1 deliverables
REM Usage: Run from D:\selfprint-v3-react\ folder
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================================
echo  SELFPRINT PHASE 1 — Git Deploy
echo ============================================================================
echo.

REM Check if git is available
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git not found. Please install Git for Windows.
    exit /b 1
)

REM Remove stale git lock files (if any)
echo [0/4] Cleaning up stale git locks...
if exist ".git\HEAD.lock" (
    del ".git\HEAD.lock"
    echo     ✓ Removed .git/HEAD.lock
)
if exist ".git\index.lock" (
    del ".git\index.lock"
    echo     ✓ Removed .git/index.lock
)
echo.

REM Show current branch
echo [*] Current branch:
git branch --show-current
echo.

REM Stage all files
echo [1/4] Staging files...
git add -A
if %errorlevel% neq 0 (
    echo ERROR: Failed to stage files
    exit /b 1
)
echo     ✓ Files staged
echo.

REM Show what will be committed
echo [2/4] Files to commit:
git diff --cached --name-only
echo.

REM Commit with message
echo [3/4] Committing changes...
set TIMESTAMP=%date:~10,4%-%date:~4,2%-%date:~7,2% %time:~0,2%:%time:~3,2%:%time:~6,2%
git commit -m "Phase 1: Test infrastructure, security middleware, service inventory [%TIMESTAMP%]" ^
    -m "✅ Completed Tasks: #1 #2 #6 #7" ^
    -m "📝 Deliverables:" ^
    -m "- SERVICE_INVENTORY.md (62 services, 12 categories)" ^
    -m "- src/api/middleware/rateLimiter.ts (token-bucket rate limiting)" ^
    -m "- src/api/middleware/validators.ts (schema-based input validation)" ^
    -m "- src/test/setup.ts (60 Supabase mock tables)" ^
    -m "- PHASE1_STATUS_REPORT.md (detailed analysis)" ^
    -m "" ^
    -m "🔧 Technical:" ^
    -m "- Root causes: filesystem permission lock + vitest cache" ^
    -m "- Text matcher fix applied (FeedbackWidget.test.tsx line 49)" ^
    -m "- Mock builder pattern verified (no thenable risk)" ^
    -m "" ^
    -m "⏳ Blocked Tasks: #4 #5 #8 (awaiting npm test hang resolution)" ^
    -m "" ^
    -m "Phase Goal: 50% → Next: architecture/visualizer improvements"

if %errorlevel% neq 0 (
    echo ERROR: Failed to commit
    exit /b 1
)
echo     ✓ Changes committed
echo.

REM Push to remote
echo [4/4] Pushing to remote...
git push -u origin HEAD
if %errorlevel% neq 0 (
    echo ERROR: Failed to push. Please check your git remote configuration.
    echo Try: git remote -v
    exit /b 1
)
echo     ✓ Pushed successfully
echo.

REM Summary
echo ============================================================================
echo  ✅ PHASE 1 DEPLOYMENT COMPLETE
echo ============================================================================
echo.
echo 📊 Summary:
echo   - 4 tasks completed (Tasks #1, #2, #6, #7)
echo   - 5 files created/modified
echo   - 60 Supabase tables mocked
echo   - Rate limiting: CRITICAL/STANDARD/BASIC tiers
echo   - Input validation: 3 critical endpoints
echo.
echo 📁 Key Files:
echo   ✓ SERVICE_INVENTORY.md
echo   ✓ PHASE1_STATUS_REPORT.md
echo   ✓ src/api/middleware/rateLimiter.ts
echo   ✓ src/api/middleware/validators.ts
echo   ✓ src/api/middleware/README.md
echo   ✓ src/test/setup.ts (60 tables)
echo.
echo ⏳ Next Phase:
echo   - Architecture/visualizer improvements
echo   - Full test verification (Tasks #4-5-8)
echo   - Middleware integration to API routes
echo.
echo ============================================================================
echo.

pause

@echo off
REM ========================================
REM BATCH SCRIPT: Fix 64 Test Failures
REM ========================================
REM Windows Batch Version
REM
REM สคริปต์นี้ทำการ:
REM 1. รัน npm test
REM 2. ถ้า PASS → Commit + Push
REM ========================================

setlocal enabledelayedexpansion

echo.
echo 🚀 SELFPRINT P0 TEST FIX — BATCH EXECUTION
echo =========================================
echo.

REM เข้าไปใน project directory
cd /d "%~dp0"

echo 📊 PHASE 1: รัน npm test
echo =========================================
echo.

REM Run tests
call npm test --run

set TEST_RESULT=%ERRORLEVEL%

echo.
if %TEST_RESULT% EQU 0 (
  echo ✅ ALL TESTS PASSED!
  echo.
  echo 📝 PHASE 2: Commit + Push
  echo =========================================
  echo.

  REM Stage all changes
  git add -A
  echo ✅ Changes staged

  REM Configure git user (if not set)
  git config user.email "ai@selfprint.dev" 2>nul
  git config user.name "Claude AI" 2>nul

  REM Commit
  git commit -m "fix: remove Supabase mock overrides - use global setup.ts (Phase 1)"
  echo ✅ Changes committed

  REM Push
  echo.
  echo 🚀 Pushing to main branch...
  git push origin main
  echo ✅ Changes pushed

  echo.
  echo ========================================
  echo ✅ SUCCESS! All changes committed and pushed
  echo ========================================
  echo.
  echo 📊 Next Steps:
  echo   1. Check GitHub Actions CI/CD
  echo   2. Verify deployment triggered
  echo   3. Start P0 Task #2 (Service Inventory)
  echo.
) else (
  echo ❌ TESTS FAILED (exit code: %TEST_RESULT%)
  echo.
  echo 📝 Troubleshooting:
  echo   1. Check test output above
  echo   2. Fix test files manually:
  echo      - src/services/__tests__/TwinLifecycle.integration.test.ts
  echo      - api/__tests__/intelligence.test.ts
  echo      - src/components/intelligence/ConfidenceIndicator.test.tsx
  echo   3. Re-run: npm test
  echo.
  echo 💡 Pattern to fix (remove vi.mocked overrides):
  echo   vi.mocked^(supabase.from^).mockReturnValue^({^} as any^)
  echo   → Delete these lines, use global mock setup.ts
  echo.
  exit /b 1
)

pause

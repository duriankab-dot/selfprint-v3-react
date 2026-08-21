@echo off
REM ═══════════════════════════════════════════════════════════════
REM CLUSTER 1 DIAGNOSTIC: Supabase Mock Chain
REM ═══════════════════════════════════════════════════════════════
REM Run this on your local Windows machine to diagnose FeedbackWidget mock issues
REM ═══════════════════════════════════════════════════════════════

cd /d D:\selfprint-v3-react

echo.
echo ═══════════════════════════════════════════════════════════════
echo STEP 1: npm install (if needed)
echo ═══════════════════════════════════════════════════════════════
echo.
npm install --legacy-peer-deps

echo.
echo ═══════════════════════════════════════════════════════════════
echo STEP 2: Run CLUSTER 1 tests with verbose output
echo ═══════════════════════════════════════════════════════════════
echo.
npm test -- src/components/intelligence/FeedbackWidget.integration.test.tsx --reporter=verbose 2>&1 | tee cluster1-diagnostic.txt

echo.
echo ═══════════════════════════════════════════════════════════════
echo RESULTS
echo ═══════════════════════════════════════════════════════════════
echo Full output saved to: cluster1-diagnostic.txt
echo.
echo Key patterns to look for:
echo   - "select is not a function" = mock chain broken
echo   - "CalibrationFailed" = AIFeedbackLoop supabase call failed
echo   - "✓ should record feedback" = test passed
echo.
pause

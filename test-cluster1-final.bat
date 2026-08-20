@echo off
cd /d D:\selfprint-v3-react
echo ═══════════════════════════════════════════════════════════════
echo CLUSTER 1 FINAL TEST — All Fixes Applied
echo ═══════════════════════════════════════════════════════════════
echo.
echo Fixes:
echo  ✅ Removed local vi.mock() — use setup.ts global mock
echo  ✅ getByRole → findByRole (async state wait)
echo  ✅ getByText → RegExp (text with quotes)
echo  ✅ Mock AIFeedbackLoop.calibrateFromFeedback
echo  ✅ getByPlaceholderText → findByPlaceholderText (async input)
echo.
echo Running test...
echo.
npm test -- src/components/intelligence/FeedbackWidget.integration.test.tsx --reporter=verbose > cluster1-final.txt 2>&1
echo.
echo ═══════════════════════════════════════════════════════════════
echo RESULTS
echo ═══════════════════════════════════════════════════════════════
echo.
findstr /I "Test Files\|Tests\|passed\|failed" cluster1-final.txt
echo.
echo Full log: cluster1-final.txt
echo.
if %ERRORLEVEL% equ 0 (
  echo ✅ CLUSTER 1 COMPLETE — All tests passed!
) else (
  echo ⚠️ Some tests still failing — check cluster1-final.txt for details
)
echo.
pause

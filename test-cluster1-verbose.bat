@echo off
cd /d D:\selfprint-v3-react
echo ═══════════════════════════════════════════════════════════════
echo CLUSTER 1 VALIDATION — FeedbackWidget Integration Test (Verbose)
echo ═══════════════════════════════════════════════════════════════
echo.
echo Running FeedbackWidget.integration.test.tsx with verbose output...
echo.
npm test -- src/components/intelligence/FeedbackWidget.integration.test.tsx --reporter=verbose > cluster1-detailed.txt 2>&1
echo.
echo ═══════════════════════════════════════════════════════════════
echo TEST RESULTS SUMMARY
echo ═══════════════════════════════════════════════════════════════
echo.
findstr /I "Test Files\|Tests\|failed\|passed" cluster1-detailed.txt
echo.
echo Full results saved: cluster1-detailed.txt
echo.
echo ───────────────────────────────────────────────────────────────
echo ERROR DETAILS:
echo ───────────────────────────────────────────────────────────────
findstr /I "FAIL\|Error\|expect\|●" cluster1-detailed.txt
echo.
echo Exit code: %ERRORLEVEL%
echo.
pause

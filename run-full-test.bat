@echo off
cd /d D:\selfprint-v3-react
echo ═══════════════════════════════════════════════════════════════
echo SELFPRINT FULL TEST SUITE — All Clusters
echo ═══════════════════════════════════════════════════════════════
echo.
echo Running full vitest suite...
echo.
npm test > full-suite-latest.txt 2>&1
echo.
echo ═══════════════════════════════════════════════════════════════
echo RESULTS SUMMARY
echo ═══════════════════════════════════════════════════════════════
echo.
findstr /I "Test Files\|Tests\|passed\|failed" full-suite-latest.txt
echo.
echo Full log: full-suite-latest.txt
echo.
pause

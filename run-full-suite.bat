@echo off
cd /d D:\selfprint-v3-react
echo ═══════════════════════════════════════════════════════════════
echo P1 CONDITIONAL STABILIZATION — Full Vitest Suite
echo ═══════════════════════════════════════════════════════════════
echo.
echo Running complete test suite...
echo.
npm test > full-suite-baseline.txt 2>&1
echo.
echo ═══════════════════════════════════════════════════════════════
echo BASELINE REPORT
echo ═══════════════════════════════════════════════════════════════
echo.
echo Test Files:
findstr /I "Test Files" full-suite-baseline.txt
echo.
echo Tests:
findstr /I "Tests " full-suite-baseline.txt
echo.
echo Errors:
findstr /I "Errors " full-suite-baseline.txt
echo.
echo Duration:
findstr /I "Duration" full-suite-baseline.txt
echo.
echo First error (if any):
findstr /I "Error\|FATAL" full-suite-baseline.txt | findstr /v "Expected" | head -5
echo.
echo Full log saved: full-suite-baseline.txt
echo ═══════════════════════════════════════════════════════════════
pause

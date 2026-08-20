@echo off
cd /d D:\selfprint-v3-react
echo Testing P3: QualityMetricsService...
npm test -- src/services/__tests__/QualityMetricsService.test.ts --reporter=verbose > p3-test.txt 2>&1
echo.
echo Test completed. Results:
echo.
findstr /I "Test Files\|Tests\|failed\|passed" p3-test.txt
echo.
echo Full results in p3-test.txt
pause

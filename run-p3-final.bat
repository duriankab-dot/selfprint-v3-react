@echo off
cd /d D:\selfprint-v3-react
echo Testing P3: QualityMetricsService (Fixed)...
npm test -- src/services/__tests__/QualityMetricsService.test.ts --reporter=verbose > p3-final.txt 2>&1
echo.
echo Results:
findstr /I "Test Files\|Tests\|failed\|passed" p3-final.txt
pause

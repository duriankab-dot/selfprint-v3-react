@echo off
cd /d D:\selfprint-v3-react
echo ═══════════════════════════════════════════════════════════════
echo CLUSTER 1 TEST — Clear Cache + Run
echo ═══════════════════════════════════════════════════════════════
echo.
echo Clearing Vitest cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "node_modules\.vitest" rmdir /s /q "node_modules\.vitest"
echo ✅ Cache cleared
echo.
echo Running test fresh...
echo.
npm test -- src/components/intelligence/FeedbackWidget.integration.test.tsx --reporter=verbose > cluster1-clean.txt 2>&1
echo.
echo ═══════════════════════════════════════════════════════════════
echo RESULTS
echo ═══════════════════════════════════════════════════════════════
echo.
findstr /I "Test Files\|Tests\|passed\|failed" cluster1-clean.txt
echo.
echo Full log: cluster1-clean.txt
echo.
pause

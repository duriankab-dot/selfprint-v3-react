@echo off
cd /d D:\selfprint-v3-react
echo ═══════════════════════════════════════════════════════════════
echo CLUSTER 2: DecisionLearningService — Pattern Analysis
echo ═══════════════════════════════════════════════════════════════
echo.
echo Running DecisionLearningService tests...
echo.
npm test -- src/__tests__/DecisionLearningService.test.ts --reporter=verbose > cluster2-results.txt 2>&1
echo.
echo ═══════════════════════════════════════════════════════════════
echo RESULTS SUMMARY
echo ═══════════════════════════════════════════════════════════════
echo.
findstr /I "Test Files\|Tests\|passed\|failed\|should return\|should have" cluster2-results.txt
echo.
echo Full log: cluster2-results.txt
echo.
pause

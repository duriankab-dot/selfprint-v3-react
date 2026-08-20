@echo off
cd /d D:\selfprint-v3-react
echo ═══════════════════════════════════════════════════════════════
echo CLUSTER 1 VALIDATION — Supabase Mock Chain
echo ═══════════════════════════════════════════════════════════════
echo.
echo Testing affected files:
echo  - FeedbackWidget.integration.test.tsx
echo  - FollowUpScheduler.test.ts
echo.
npm test -- src/components/intelligence/FeedbackWidget.integration.test.tsx src/__tests__/FollowUpScheduler.test.ts --reporter=verbose > cluster1-results.txt 2>&1
echo.
echo ═══════════════════════════════════════════════════════════════
echo RESULTS
echo ═══════════════════════════════════════════════════════════════
echo.
echo Test summary:
findstr /I "Test Files\|Tests\|failed\|passed" cluster1-results.txt
echo.
echo Exit code: %ERRORLEVEL%
echo.
echo Full results: cluster1-results.txt
echo ═══════════════════════════════════════════════════════════════
pause

@echo off
cd /d D:\selfprint-v3-react
if exist .git\index.lock del /f .git\index.lock
git add src/context/WorldContext.tsx src/context/AIContext.tsx src/api/sice/process.ts src/api/twin/create.ts src/store/decisionStore.ts
git commit -m "Fix: Implement TODOs - world visits_count, Twin status fetch, SICE history save, real Twin creation, decision store metrics"
git push origin master
pause

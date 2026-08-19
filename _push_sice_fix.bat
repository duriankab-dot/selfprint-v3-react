@echo off
cd /d D:\selfprint-v3-react
if exist .git\index.lock del /f .git\index.lock
git add src/services/sice/engines/PersonalContextBuilder.ts
git commit -m "Fix: SICE #1 PersonalContextBuilder - implement all TODOs (goals, memories, patterns, world areas)"
git push origin master
pause

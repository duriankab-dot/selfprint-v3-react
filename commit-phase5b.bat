@echo off
cd /d D:\selfprint-v3-react
git add api/unified-handler.ts
git commit -m "feat(api): implement real handleProfile and handleBlueprint in unified-handler"
git push
pause

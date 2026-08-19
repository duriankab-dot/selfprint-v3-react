@echo off
cd /d D:\selfprint-v3-react

echo === Removing git index lock if exists ===
if exist .git\index.lock del /f .git\index.lock

echo === Git Status ===
git status --short

echo === Adding files ===
git add package.json package-lock.json .github/workflows/testing.yml

echo === Committing ===
git commit -m "Fix: E2E workflow - add test:e2e script, fix Slack curl empty URL (exit code 3)"

echo === Pushing to GitHub ===
git push origin master

echo.
echo === Done! Check GitHub Actions for the new run ===
pause

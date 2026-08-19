@echo off
cd /d D:\selfprint-v3-react

echo === Removing git index lock if exists ===
if exist .git\index.lock del /f .git\index.lock

echo === Git Status ===
git status --short

echo === Adding testing.yml ===
git add .github/workflows/testing.yml

echo === Committing node-version 18 -> 20 ===
git commit -m "Fix: Upgrade Node.js 18->20 for Playwright compatibility"

echo === Pushing to GitHub ===
git push origin master

echo.
echo === Done! Check GitHub Actions for the new run ===
pause

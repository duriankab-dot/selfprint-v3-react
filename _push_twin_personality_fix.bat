@echo off
echo === Fix git lock + commit + push: TwinPersonalityPage ===
cd /d D:\selfprint-v3-react

:: Remove stale lock if exists
if exist .git\HEAD.lock (
  del /f .git\HEAD.lock
  echo Removed stale HEAD.lock
)

git add src/pages/TwinPersonalityPage.tsx

git commit -m "fix: TwinPersonalityPage uses real PersonalContextBuilder metrics

- Replace hardcoded emotionalState/growthMomentum/selfAwareness/adaptability
  with live data from SICE #1 PersonalContextBuilder.process()
- emotionalState string -> 0-100 score via moodScore map
- growthMomentum -> avg success rate from activePatterns
- selfAwareness -> memory depth (8pts/memory, 30-95)
- adaptability -> world diversity from strengthAreas (15pts/world, 40-95)
- mood -> PersonalityMetrics union mapped from emotionalState string
- Remove TODO comments"

if %ERRORLEVEL% NEQ 0 (
  echo Commit failed!
  pause
  exit /b 1
)

git push origin master
if %ERRORLEVEL% NEQ 0 (
  echo Push failed!
  pause
  exit /b 1
)

echo Done. Check GitHub Actions CI.
pause

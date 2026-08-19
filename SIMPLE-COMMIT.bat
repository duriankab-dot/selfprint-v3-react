@echo off
REM Ultra-simple commit script - no fancy stuff
cd /d "%~dp0"

echo.
echo Removing git lock if exists...
del .git\index.lock 2>nul

echo Waiting 2 seconds...
timeout /t 2 /nobreak

echo.
echo Staging changes...
git add .

echo.
echo Creating commit...
git commit -m "Phase 3: Fix 64+ tests"

echo.
echo Done! Ready for: git push
echo.
pause

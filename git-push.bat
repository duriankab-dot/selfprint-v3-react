@echo off
cd /d D:\selfprint-v3-react

if "%~1"=="" (
  set /p MSG="Commit message: "
) else (
  set MSG=%~1
)

if "%MSG%"=="" (
  echo ERROR: commit message required
  pause
  exit /b 1
)

echo.
echo [1/3] git add -A
git add -A

echo [2/3] git commit
git commit -m "%MSG%"

echo [3/3] git push origin master
git push origin master

echo.
git log --oneline -3
echo.
pause

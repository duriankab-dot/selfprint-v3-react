@echo off
cd /d D:\selfprint-v3-react
git push origin master
if %ERRORLEVEL% NEQ 0 (
  echo Push failed!
  pause
  exit /b 1
)
echo Push OK
pause

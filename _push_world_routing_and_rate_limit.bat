@echo off
echo === Push: WorldRoutingService + Rate Limit ===
cd /d D:\selfprint-v3-react
git push origin master
if %ERRORLEVEL% NEQ 0 (
  echo Push failed! Check git remote / auth.
  pause
  exit /b 1
)
echo Done. Check GitHub Actions CI next.
pause

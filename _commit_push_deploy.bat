@echo off
chcp 65001 >nul
title Selfprint - Commit Push Deploy

echo.
echo =========================================
echo   SELFPRINT - Commit + Push + Deploy
echo =========================================
echo.

:: Move to project root
cd /d "%~dp0"

:: Show current git status
echo [STATUS] Changed files:
git status --short
echo.

:: Prompt for commit message
set /p COMMIT_MSG="Enter commit message (Enter = auto): "

if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=chore: update
)

echo.

:: Remove stale lock file if exists
if exist ".git\index.lock" (
    echo [GIT] Removing stale lock file...
    del /f ".git\index.lock"
)

:: Stage all changes
echo [GIT] Staging all changes...
git add -A
if %ERRORLEVEL% neq 0 (
    echo [ERROR] git add failed.
    pause
    exit /b 1
)

:: Commit
echo [GIT] Committing: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

:: Push
echo.
echo [GIT] Pushing to origin master...
git push origin master
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Push failed.
    pause
    exit /b 1
)
echo [OK] Push successful.

:: Deploy to Vercel
echo.
echo [VERCEL] Deploying to production...
vercel --prod --yes
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Vercel deploy failed.
    echo         Run: npm install -g vercel  then  vercel login
    pause
    exit /b 1
)

echo.
echo =========================================
echo   DONE - Deployed to production!
echo =========================================
echo.
pause

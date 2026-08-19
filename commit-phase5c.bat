@echo off
cd /d D:\selfprint-v3-react
git add src/services/error-tracking.ts src/lib/nova-prompts/getNovaPrompt.ts package.json package-lock.json
git commit -m "feat: implement Sentry error-tracking and fix getNovaPrompt language param"
git push
pause

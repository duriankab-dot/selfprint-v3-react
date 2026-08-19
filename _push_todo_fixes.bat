@echo off
cd /d D:\selfprint-v3-react
if exist .git\index.lock del /f .git\index.lock
git add src/services/SelfPrintOrchestrator.ts src/services/FeedbackService.ts src/services/DecisionAutomationService.ts
git commit -m "Fix: Implement TODOs - refinePatterns, generateComprehensiveAnalysis, analyzeDecisionOutcome, commonImprovementAreas"
git push origin master
pause

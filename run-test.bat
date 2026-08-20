@echo off
cd /d D:\selfprint-v3-react
echo Running full test suite...
npm test > test-results.txt 2>&1
echo.
echo Test completed. Showing results...
echo.
findstr /I "Test Files\|Tests\|failed\|passed" test-results.txt
pause

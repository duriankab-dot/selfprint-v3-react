@echo off
REM ============================================
REM PHASE A FIX: Migration Collision Resolution
REM ============================================

echo Stopping Supabase...
supabase stop

echo.
echo Deleting old conflicting migration files...
del "supabase\migrations\001_create_twins_table.sql" 2>nul
del "supabase\migrations\002_create_awakening_essence_table.sql" 2>nul
del "supabase\migrations\add_awakening_essence_table.sql" 2>nul

echo.
echo Resetting Supabase database...
rmdir /s /q .supabase

echo.
echo Starting Supabase with new migrations...
supabase start

echo.
echo Checking Supabase status...
supabase status

echo.
echo ============================================
echo PHASE A: Running npm test
echo ============================================
echo.
npm test

echo.
echo DONE! If tests pass, PHASE A STEP 4 complete.
pause

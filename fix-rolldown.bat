@echo off
REM ========================================
REM SELFPRINT ROLLDOWN NATIVE BINDING FIX
REM ========================================
REM แก้ native binding issue สำหรับ Rolldown บน Windows
REM ที่เกิดจาก npm optional dependency bug
REM
REM ขั้นตอน:
REM 1. ลบ node_modules (ทำให้เสร็จสมบูรณ์ + clean)
REM 2. ลบ package-lock.json (force rebuild lock file)
REM 3. รัน npm install ใหม่ (ติดตั้ง binding ที่ถูกต้องสำหรับ Windows)
REM 4. ทดสอบ npm run build
REM ========================================

echo.
echo ========================================
echo   SELFPRINT ROLLDOWN NATIVE BINDING FIX
echo ========================================
echo.

cd /d "%~dp0"

echo [STEP 1] ลบ node_modules...
if exist node_modules (
  echo   ➜ ลบ node_modules (กำลังประมวลผล...)
  rmdir /s /q node_modules
  if errorlevel 1 (
    echo   ✗ ไม่สามารถลบ node_modules — ลองปิด VSCode / IDE ก่อน
    pause
    exit /b 1
  )
  echo   ✓ node_modules ลบแล้ว
) else (
  echo   ✓ node_modules ไม่มี
)

echo.
echo [STEP 2] ลบ package-lock.json...
if exist package-lock.json (
  echo   ➜ ลบ package-lock.json
  del package-lock.json
  if errorlevel 1 (
    echo   ✗ ไม่สามารถลบ package-lock.json
    pause
    exit /b 1
  )
  echo   ✓ package-lock.json ลบแล้ว
) else (
  echo   ✓ package-lock.json ไม่มี
)

echo.
echo [STEP 3] รัน npm install ใหม่...
echo   ➜ ติดตั้ง dependencies (โปรดรอ... ~2-5 นาที)
call npm install
if errorlevel 1 (
  echo   ✗ npm install ล้ม
  echo.
  echo   ปัญหาที่อาจเกิด:
  echo   - Node.js / npm ไม่ติดตั้ง ให้ติดตั้ง Node.js LTS
  echo   - npm cache corrupt ให้รัน: npm cache clean --force
  echo   - ปัญหา network ให้ลองใหม่
  pause
  exit /b 1
)
echo   ✓ npm install สำเร็จ

echo.
echo [STEP 4] ทดสอบ npm run build...
echo   ➜ Build project (กำลังประมวลผล...)
call npm run build
if errorlevel 1 (
  echo   ✗ npm run build ล้ม
  echo.
  echo   ปัญหาเพิ่มเติม:
  echo   - TypeScript error ให้ตรวจ tsc -b
  echo   - Build error อื่น ให้ตรวจ console message
  pause
  exit /b 1
)
echo   ✓ npm run build สำเร็จ

echo.
echo ========================================
echo   ✅ ROLLDOWN FIX เสร็จสมบูรณ์
echo ========================================
echo.
echo   ✓ node_modules สะอาดแล้ว
echo   ✓ package-lock.json สร้างใหม่
echo   ✓ Rolldown binding ติดตั้งสำหรับ Windows
echo   ✓ npm run build ผ่านแล้ว
echo.
echo   ตอนนี้ปลอดภัยที่จะ git commit + push แล้ว
echo.
pause

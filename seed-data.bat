@echo off
echo Starting Firebase Emulator Data Seeding...

echo Checking if emulators are running...
curl -s -o nul -w "%%{http_code}" http://localhost:4000 > temp.txt
set /p STATUS=<temp.txt
del temp.txt

if "%STATUS%" == "200" (
  echo Emulators are running.
) else (
  echo Emulators are not running. Please start them with 'firebase emulators:start' first.
  echo Press any key to exit...
  pause > nul
  exit /b 1
)

cd server
echo Running seeding scripts...
node seed-all.js
if %ERRORLEVEL% NEQ 0 (
  echo Seeding failed.
  cd ..
  echo Press any key to exit...
  pause > nul
  exit /b 1
)

echo Verifying seeded data...
node verify-seeding.js
if %ERRORLEVEL% NEQ 0 (
  echo Verification failed.
  cd ..
  echo Press any key to exit...
  pause > nul
  exit /b 1
)

cd ..
echo Seeding and verification completed successfully.
echo Press any key to exit...
pause > nul

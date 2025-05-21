# PowerShell script to start emulators and seed test data
Write-Host "Starting Firebase emulators..." -ForegroundColor Green
Start-Process -FilePath "firebase" -ArgumentList "emulators:start" -NoNewWindow

# Wait for emulators to start
Write-Host "Waiting for emulators to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Run the seeding script
Write-Host "Running data seeding scripts..." -ForegroundColor Green
Set-Location -Path "server"
node seed-all.js
Set-Location -Path ".."

Write-Host "Data seeding complete!" -ForegroundColor Green
Write-Host "Emulators are running. You can now perform testing." -ForegroundColor Green
Write-Host "Press CTRL+C when finished to stop the emulators." -ForegroundColor Red

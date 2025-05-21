# Define emulator ports for clarity
$env:FIRESTORE_EMULATOR_HOST = "::1:8080" # Use IPv6
$env:FIREBASE_AUTH_EMULATOR_HOST = "::1:9099" # Use IPv6
$env:FIREBASE_STORAGE_EMULATOR_HOST = "::1:9199" # Use IPv6

# Define emulator ports for clarity
$env:FIRESTORE_EMULATOR_HOST = "::1:8080" # Use IPv6
$env:FIREBASE_AUTH_EMULATOR_HOST = "::1:9099" # Use IPv6
$env:FIREBASE_STORAGE_EMULATOR_HOST = "::1:9199" # Use IPv6

# First make sure the directory is correct
Push-Location $PSScriptRoot

# Function to check if emulator is running
function Test-EmulatorRunning {
    param (
        [string]$EmulatorHost = "::1", # Renamed parameter to avoid conflict, Use IPv6
        [int]$Port = 4000
    )

    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect($EmulatorHost, $Port) # Use the new parameter name
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Start emulators if they're not running
if (-not (Test-EmulatorRunning -Port 4000)) {
    Write-Host "Starting Firebase emulators..."
    # Use cmd.exe to execute the firebase command
    Start-Process -NoNewWindow cmd -ArgumentList "/c firebase emulators:start" -PassThru

    # Wait for emulators to start (with timeout)
    $timeout = 60 # seconds
    $timer = [System.Diagnostics.Stopwatch]::StartNew()

    while (-not (Test-EmulatorRunning -Port 4000) -and ($timer.Elapsed.TotalSeconds -lt $timeout)) {
        Write-Host "Waiting for emulators to start... ($([math]::Round($timer.Elapsed.TotalSeconds))s)"
        Start-Sleep -Seconds 3
    }

    if ($timer.Elapsed.TotalSeconds -ge $timeout) {
        Write-Error "Timed out waiting for emulators to start!"
        Pop-Location
        exit 1
    }

    # Additional wait to ensure all services are running
    Write-Host "Emulator UI detected. Waiting an additional 10 seconds for all services..."
    Start-Sleep -Seconds 10
}
else {
    Write-Host "Firebase emulators already running."
}

# Test emulator connectivity
Write-Host "Testing emulator connectivity..."
Push-Location server
node test-emulator-connection.js
$testResult = $LASTEXITCODE

if ($testResult -ne 0) {
    Write-Error "Emulator connectivity test failed. Please check emulator status."
    Pop-Location
    Pop-Location
    exit 1
}

# Run the seeding script
Write-Host "Running Firebase seeding script..."
node seed-all.js
$seedResult = $LASTEXITCODE

if ($seedResult -ne 0) {
    Write-Error "Seeding failed. See log for details."
    Pop-Location
    Pop-Location
    exit 1
}

# Return to original directories
Pop-Location
Pop-Location

Write-Host "Seeding process completed successfully."

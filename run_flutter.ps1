Write-Host "===================================================" -ForegroundColor DarkYellow
Write-Host "Launching ShilpSetu AI Flutter Mobile Application" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor DarkYellow

$env:Path = "$env:USERPROFILE\flutter\bin;$env:Path"
Set-Location -Path "$PSScriptRoot\mobile_flutter"

Write-Host "`nSelect target device:" -ForegroundColor Cyan
Write-Host "  1. Chrome Web (Instant Browser Preview)"
Write-Host "  2. Windows Desktop Native"
Write-Host "  3. Connected Android Device / Emulator"

$choice = Read-Host "`nEnter choice [1-3, default 1]"

switch ($choice) {
    "2" {
        Write-Host "Launching on Windows Desktop..." -ForegroundColor Green
        flutter run -d windows
    }
    "3" {
        Write-Host "Launching on Android..." -ForegroundColor Green
        flutter run
    }
    Default {
        Write-Host "Launching on Chrome Web..." -ForegroundColor Green
        flutter run -d chrome
    }
}

# ShilpSetu AI - PowerShell Full Stack Launcher
Write-Host "=======================================================" -ForegroundColor Yellow
Write-Host "  Launching ShilpSetu AI Full Stack Environment" -ForegroundColor Cyan
Write-Host "  Ministry of Social Justice and Empowerment (MoSJE)" -ForegroundColor DarkYellow
Write-Host "=======================================================" -ForegroundColor Yellow

# Start backend in a separate PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-File", (Join-Path $PSScriptRoot "run_backend.ps1")

Start-Sleep -Seconds 2

# Start frontend in a separate PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-File", (Join-Path $PSScriptRoot "run_frontend.ps1")

Write-Host "`nShilpSetu AI services initiated:" -ForegroundColor Green
Write-Host "  Backend API:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "  Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "  Web App UI:   http://localhost:5173`n" -ForegroundColor Cyan

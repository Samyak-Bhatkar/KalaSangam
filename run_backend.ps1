# ShilpSetu AI - Backend Launch Script for PowerShell
Write-Host "=======================================================" -ForegroundColor Yellow
Write-Host "  ShilpSetu AI - FastAPI Backend Server" -ForegroundColor Cyan
Write-Host "  Department of Social Justice and Empowerment (MoSJE)" -ForegroundColor DarkYellow
Write-Host "=======================================================" -ForegroundColor Yellow

$backendDir = Join-Path $PSScriptRoot "backend"
Set-Location $backendDir

# Step 1: Check and free port 8000
Write-Host "`n[1/3] Checking port 8000..." -ForegroundColor Gray
$connections = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $pidToKill = $conn.OwningProcess
        if ($pidToKill -gt 0) {
            Write-Host "  Freeing stale process on port 8000 (PID: $pidToKill)..." -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    }
}

# Step 2: Check dependencies
Write-Host "[2/3] Checking dependencies..." -ForegroundColor Gray
$pythonCheck = python -c "import fastapi, uvicorn" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Installing dependencies from requirements.txt..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Step 3: Launch uvicorn
Write-Host "[3/3] Starting Uvicorn server on http://127.0.0.1:8000 ..." -ForegroundColor Green
Write-Host "  API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "  Health:   http://127.0.0.1:8000/health" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to terminate.`n" -ForegroundColor Gray

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

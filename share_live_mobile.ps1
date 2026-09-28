# ShilpSetu AI - Live Mobile Session Generator (PowerShell)
# Ministry of Social Justice and Empowerment (MoSJE)

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  ShilpSetu AI - Live Mobile Session Generator" -ForegroundColor Yellow
Write-Host "  Ministry of Social Justice and Empowerment (MoSJE)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Backend Check
$backendPort = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if (-not $backendPort) {
    Write-Host "[INFO] Starting FastAPI Backend on port 8000..." -ForegroundColor Green
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$baseDir\backend`" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
    Start-Sleep -Seconds 3
} else {
    Write-Host "[OK] Backend is already running on http://127.0.0.1:8000" -ForegroundColor Green
}

# 2. Frontend Check
$frontendPort = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if (-not $frontendPort) {
    Write-Host "[INFO] Starting Vite Frontend on port 5173..." -ForegroundColor Green
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$baseDir\frontend`" && npm run dev"
    Start-Sleep -Seconds 3
} else {
    Write-Host "[OK] Frontend is already running on http://localhost:5173" -ForegroundColor Green
}

# 3. Start Cloudflare Tunnel
Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Yellow
Write-Host " INSTRUCTIONS FOR YOUR FRIEND:" -ForegroundColor White
Write-Host " 1. Look for the 'https://*.trycloudflare.com' link below." -ForegroundColor White
Write-Host " 2. Copy and send the link to your friend on WhatsApp / Telegram." -ForegroundColor White
Write-Host " 3. Your friend opens the link directly on their mobile phone." -ForegroundColor White
Write-Host " 4. Camera, Voice IVR, Gemini, and Studio Image Processing all work!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Yellow
Write-Host ""

& cloudflared tunnel --url http://localhost:5173

# ShilpSetu AI - Frontend Launch Script for PowerShell
Write-Host "=======================================================" -ForegroundColor Yellow
Write-Host "  ShilpSetu AI - Frontend Web App (Vite React)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Yellow

$frontendDir = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendDir

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting Vite dev server on http://localhost:5173 ..." -ForegroundColor Green
npm run dev

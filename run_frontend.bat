@echo off
title ShilpSetu AI - Frontend Web App (Vite React)

echo =======================================================
echo   ShilpSetu AI - Frontend Web Application
echo   Next-Gen Artisan Business Manager (Vite + React)
echo =======================================================

cd /d "%~dp0\frontend"

if not exist "node_modules\" (
    echo [INFO] Installing frontend dependencies...
    npm install
)

echo [INFO] Starting Vite dev server on http://localhost:5173 ...
echo [INFO] Press Ctrl+C to stop.
echo.

npm run dev
pause

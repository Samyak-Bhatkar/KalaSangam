@echo off
setlocal enabledelayedexpansion
title ShilpSetu AI - Live Mobile Tunnel (Share with Friend)

echo ==============================================================================
echo   ShilpSetu AI - Live Mobile Session Generator
echo   Ministry of Social Justice and Empowerment (MoSJE)
echo ==============================================================================
echo.
echo [1/3] Checking FastAPI Backend on port 8000...
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Starting Backend Server in background window...
    start "ShilpSetu Backend (FastAPI)" cmd /k "cd /d "%~dp0\backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
    timeout /t 3 /nobreak >nul
) else (
    echo [OK] Backend is already running on http://127.0.0.1:8000
)

echo [2/3] Checking Vite Frontend on port 5173...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Starting Frontend Dev Server in background window...
    start "ShilpSetu Frontend (Vite)" cmd /k "cd /d "%~dp0\frontend" && npm run dev"
    timeout /t 3 /nobreak >nul
) else (
    echo [OK] Frontend is already running on http://localhost:5173
)

echo [3/3] Creating secure HTTPS tunnel via Cloudflare...
echo.
echo ==============================================================================
echo  INSTRUCTIONS FOR YOUR FRIEND:
echo  1. Look for the "https://*.trycloudflare.com" URL printed below.
echo  2. Copy and send that HTTPS link to your friend on WhatsApp / Telegram.
echo  3. Your friend can open it directly in their mobile browser (Safari/Chrome).
echo  4. ALL FEATURES WORK ON THEIR PHONE:
echo     - Mobile Camera & Photo Upload (processed with your PC's 16GB RAM)
echo     - Gemini Multimodal Cataloging (uses your local .env API keys)
echo     - Vernacular Voice IVR (uses your local Bhashini credentials)
echo ==============================================================================
echo.

cloudflared tunnel --url http://localhost:5173
pause

@echo off
setlocal enabledelayedexpansion
title ShilpSetu AI - Backend Server (FastAPI)

echo =======================================================
echo   ShilpSetu AI - FastAPI Backend Development Server
echo   Ministry of Social Justice and Empowerment (MoSJE)
echo =======================================================

cd /d "%~dp0\backend"

echo [1/3] Checking if port 8000 is occupied...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo [INFO] Freeing stale process on port 8000 (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] Verifying Python environment...
python -c "import fastapi, uvicorn" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing required dependencies...
    pip install -r requirements.txt
)

echo [3/3] Starting Uvicorn server on http://127.0.0.1:8000 ...
echo [INFO] API Documentation available at: http://127.0.0.1:8000/docs
echo [INFO] Press Ctrl+C to stop.
echo.

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause

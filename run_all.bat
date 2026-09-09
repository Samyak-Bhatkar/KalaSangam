@echo off
title ShilpSetu AI - Full Stack Launcher

echo =======================================================
echo   Launching ShilpSetu AI (Backend + Frontend)
echo   Ministry of Social Justice and Empowerment (MoSJE)
echo =======================================================

echo [1/2] Starting FastAPI Backend in a new window...
start "ShilpSetu Backend (8000)" cmd /k ""%~dp0run_backend.bat""

timeout /t 2 /nobreak >nul

echo [2/2] Starting React Frontend in a new window...
start "ShilpSetu Frontend (5173)" cmd /k ""%~dp0run_frontend.bat""

echo.
echo =======================================================
echo   ShilpSetu AI services launched successfully!
echo   - Backend:  http://127.0.0.1:8000
echo   - API Docs: http://127.0.0.1:8000/docs
echo   - Web App:  http://localhost:5173
echo =======================================================
echo.
timeout /t 4

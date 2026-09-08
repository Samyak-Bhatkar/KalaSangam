@echo off
echo ===================================================
echo Launching ShilpSetu AI Flutter Mobile Application
echo ===================================================
set "PATH=%USERPROFILE%\flutter\bin;%PATH%"
cd /d "%~dp0mobile_flutter"

echo.
echo Select target:
echo 1. Chrome Web (Instant Browser Preview)
echo 2. Windows Desktop Native
echo 3. Android Device / Emulator
echo.
set /p choice="Enter choice (1, 2, or 3) [Default: 1]: "

if "%choice%"=="2" (
    echo Launching on Windows Desktop...
    flutter run -d windows
) else if "%choice%"=="3" (
    echo Launching on Android...
    flutter run
) else (
    echo Launching on Chrome Web...
    flutter run -d chrome
)
pause

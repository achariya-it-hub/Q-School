@echo off
cd /d "%~dp0"
start "Q-School web" cmd /k call start-web.bat
start "Q-School app" cmd /k call start-mobile.bat
echo Started. Web: http://localhost:3100   App: http://localhost:8100
timeout /t 5 >nul

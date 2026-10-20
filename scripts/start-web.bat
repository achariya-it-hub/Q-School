@echo off
title Q-School web (localhost:3100)
cd /d "%~dp0.."
echo Starting Q-School web on http://localhost:3100 ...
where pnpm >nul 2>nul && (set PNPM=pnpm) || (set PNPM=npx -y pnpm@11)
echo [%date% %time%] using %PNPM% > logs\web.log
call %PNPM% --filter @qschool/web dev >> logs\web.log 2>&1
echo Web server stopped. See logs\web.log
pause

@echo off
title Q-School Flutter app (localhost:8100)
cd /d "%~dp0..\apps\flutter"
set FLUTTER=flutter
where flutter >nul 2>nul && goto haveflutter
if exist "E:\Flutter_Sdk_Dir\flutter\bin\flutter.bat" (set FLUTTER="E:\Flutter_Sdk_Dir\flutter\bin\flutter.bat" & goto haveflutter)
if exist "%USERPROFILE%\flutter\bin\flutter.bat" (set FLUTTER="%USERPROFILE%\flutter\bin\flutter.bat" & goto haveflutter)
echo Flutter SDK not found > ..\..\logs\mobile.log
echo Flutter SDK not found. Install Flutter or add it to PATH.
pause
exit /b 1
:haveflutter
echo [%date% %time%] using %FLUTTER% > ..\..\logs\mobile.log
if not exist web (
  echo Creating platform folders: android, ios, web >> ..\..\logs\mobile.log
  call %FLUTTER% create . --org com.qschool --project-name qschool --platforms android,ios,web >> ..\..\logs\mobile.log 2>&1
)
call %FLUTTER% pub get >> ..\..\logs\mobile.log 2>&1
echo Starting Flutter web preview on http://localhost:8100 ...
call %FLUTTER% run -d web-server --web-hostname localhost --web-port 8100 >> ..\..\logs\mobile.log 2>&1
echo Flutter stopped. See logs\mobile.log
pause

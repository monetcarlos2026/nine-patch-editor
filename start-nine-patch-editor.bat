@echo off
setlocal

set "APP_DIR=%~dp0"
if not defined PORT set "PORT=49390"
set "URL=http://127.0.0.1:%PORT%/"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Please install Node.js, then run this file again.
  pause
  exit /b 1
)

netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul
if errorlevel 1 (
  pushd "%APP_DIR%" || exit /b 1
  start "Nine Patch Editor Server" /min cmd /c "node server.js"
  popd
  timeout /t 2 /nobreak >nul
)

start "" "%URL%"

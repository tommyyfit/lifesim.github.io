@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 server.py
  goto :end
)
where python >nul 2>nul
if %errorlevel%==0 (
  python server.py
  goto :end
)
where node >nul 2>nul
if %errorlevel%==0 (
  node server.js
  goto :end
)
echo Python 3 or Node.js was not found.
echo You can still open index.html directly, but Ollama works best through the launcher.
pause
:end

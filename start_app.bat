@echo off
echo ===================================================
echo   Starting AgroConnect Platform (SIH 2026)
echo ===================================================
cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
echo Launching browser at http://127.0.0.1:5173/ ...
start http://127.0.0.1:5173/
call npm run dev -- --host 127.0.0.1 --port 5173

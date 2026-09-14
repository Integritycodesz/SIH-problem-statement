@echo off
echo ===================================================
echo   Starting AgroConnect Platform (SIH 2026)
echo ===================================================

REM 1. Start Python SARIMAX + CV Forecast Microservice
set FORECAST_DIR=%~dp0services\forecast_service
if exist "%FORECAST_DIR%\.venv\Scripts\python.exe" (
    echo Starting Forecast ^& AI Assay Microservice on http://127.0.0.1:8000 ...
    start "AgroConnect Forecast Service (Port 8000)" cmd /c "cd /d \"%FORECAST_DIR%\" && .venv\Scripts\python.exe run_service.py"
) else (
    echo Note: Forecast microservice venv not found. Run start_forecast_service.bat to initialize.
)

REM 2. Start Frontend
cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
echo Launching browser at http://127.0.0.1:5173/ ...
start http://127.0.0.1:5173/
call npm run dev -- --host 127.0.0.1 --port 5173

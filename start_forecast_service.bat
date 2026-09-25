@echo off
echo ====================================================================
echo Starting AgroConnect SARIMAX + Prophet Forecasting Microservice...
echo ====================================================================

if exist "%~dp0backend" (
    cd /d "%~dp0backend"
) else (
    cd /d "%~dp0services\forecast_service"
)
if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found. Creating .venv...
    python -m venv .venv
    call .venv\Scripts\pip install -r requirements.txt
)

echo Microservice active at http://127.0.0.1:8000
echo Documentation available at http://127.0.0.1:8000/docs
.venv\Scripts\python.exe run_service.py
pause

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting AgroConnect Platform (SIH 2026)" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Start Python SARIMAX + CV Forecast Microservice
$ForecastPy = Join-Path $PSScriptRoot "services\forecast_service\.venv\Scripts\python.exe"
$ForecastDir = Join-Path $PSScriptRoot "services\forecast_service"
if (Test-Path $ForecastPy) {
    Write-Host "Starting Forecast & AI Assay Microservice on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
    Start-Process -FilePath $ForecastPy -ArgumentList "run_service.py" -WorkingDirectory $ForecastDir
}

# 2. Start Frontend
$FrontendDir = Join-Path $PSScriptRoot "frontend"
Set-Location $FrontendDir

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Opening browser at http://127.0.0.1:5173/ ..." -ForegroundColor Cyan
Start-Process "http://127.0.0.1:5173/"
npm run dev -- --host 127.0.0.1 --port 5173

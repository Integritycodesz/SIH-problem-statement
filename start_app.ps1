Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting AgroConnect Platform (SIH 2026)" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$FrontendDir = Join-Path $PSScriptRoot "frontend"
Set-Location $FrontendDir

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Opening browser at http://127.0.0.1:5173/ ..." -ForegroundColor Cyan
Start-Process "http://127.0.0.1:5173/"
npm run dev -- --host 127.0.0.1 --port 5173

@echo off
echo ===================================================
echo   AgroConnect - Smart India Hackathon 2026 (PS 26132)
echo   Government of Maharashtra & MSIS AgriTech Platform
echo ===================================================
echo.

echo Starting Backend Server (FastAPI on port 8000)...
start "AgroConnect Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Vite on port 5173)...
start "AgroConnect Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 3 /nobreak >nul

echo Opening browser at http://127.0.0.1:5173 ...
start http://127.0.0.1:5173

echo.
echo AgroConnect is running!
echo - Frontend: http://127.0.0.1:5173
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo.
pause

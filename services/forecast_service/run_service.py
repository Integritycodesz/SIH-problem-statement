import uvicorn
import os
import sys

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "false").lower() in ("true", "1", "yes")
    print(f"Starting AgroConnect Forecasting Microservice on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=reload)

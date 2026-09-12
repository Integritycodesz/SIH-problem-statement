import uvicorn
import os
import sys

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting AgroConnect Forecasting Microservice on http://127.0.0.1:{port}")
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=True)

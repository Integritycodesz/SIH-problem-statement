import sys
import os
from pathlib import Path

# Add project root and services/forecast_service to sys.path so 'app.main' can be resolved
API_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = API_DIR.parent
SERVICE_DIR = PROJECT_ROOT / "services" / "forecast_service"

for p in (str(SERVICE_DIR), str(PROJECT_ROOT), str(API_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

from app.main import app

# Expose app for Vercel Serverless Functions
__all__ = ["app"]

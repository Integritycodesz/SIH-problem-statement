import sys
import os
from pathlib import Path

# Add project root and backend to sys.path so 'app.main' can be resolved
API_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = API_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"

for p in (str(BACKEND_DIR), str(PROJECT_ROOT), str(API_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

from app.main import app

# Expose app for Vercel Serverless Functions
__all__ = ["app"]

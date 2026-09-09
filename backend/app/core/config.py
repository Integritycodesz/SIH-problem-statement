import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel

# Load .env from backend directory
backend_dir = Path(__file__).resolve().parent.parent.parent
env_path = backend_dir / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./agroconnect.db")
# If relative SQLite path, resolve to absolute path within backend directory
if raw_db_url.startswith("sqlite:///./") or raw_db_url == "sqlite:///agroconnect.db":
    db_file = (backend_dir / "agroconnect.db").resolve().as_posix()
    resolved_db_url = f"sqlite:///{db_file}"
else:
    resolved_db_url = raw_db_url

class Settings(BaseModel):
    PROJECT_NAME: str = "AgroConnect API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = resolved_db_url
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", os.getenv("SUPABASE_ANON_KEY", ""))
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()

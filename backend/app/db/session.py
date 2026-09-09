from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

def get_engine_url(raw_url: str) -> str:
    """
    Normalizes PostgreSQL connection strings from Supabase for modern SQLAlchemy + psycopg (v3).
    Automatically maps 'postgres://' and 'postgresql://' to 'postgresql+psycopg://'.
    """
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+"):
        return raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return raw_url

normalized_db_url = get_engine_url(settings.DATABASE_URL)

# Configure connection parameters based on dialect (PostgreSQL Supabase vs SQLite)
if normalized_db_url.startswith("sqlite"):
    engine = create_engine(
        normalized_db_url,
        connect_args={"check_same_thread": False},
        echo=False
    )
else:
    # Supabase PostgreSQL configuration with resilient connection pooling
    engine = create_engine(
        normalized_db_url,
        pool_pre_ping=True,       # Validates connections before using them to prevent stale SSL timeouts
        pool_recycle=300,        # Recycles connections every 5 minutes
        pool_size=10,
        max_overflow=20,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

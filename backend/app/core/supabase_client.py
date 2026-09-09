import logging
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("agroconnect.supabase")

_supabase_client: Optional[Client] = None
_supabase_admin_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """
    Returns the public Supabase Client configured with SUPABASE_URL and SUPABASE_ANON_KEY.
    Returns None with a warning if credentials are not configured in .env.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY or "your-project-id" in settings.SUPABASE_URL:
        logger.info("Supabase client not initialized: SUPABASE_URL / SUPABASE_KEY not set in .env")
        return None

    try:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client successfully initialized.")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None

def get_supabase_admin_client() -> Optional[Client]:
    """
    Returns the Supabase Client with Service Role Key for server-side administrative tasks.
    """
    global _supabase_admin_client
    if _supabase_admin_client is not None:
        return _supabase_admin_client

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    if not settings.SUPABASE_URL or not key or "your-project-id" in settings.SUPABASE_URL:
        logger.info("Supabase admin client not initialized: Credentials not set in .env")
        return None

    try:
        _supabase_admin_client = create_client(settings.SUPABASE_URL, key)
        logger.info("Supabase admin client successfully initialized.")
        return _supabase_admin_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase admin client: {e}")
        return None

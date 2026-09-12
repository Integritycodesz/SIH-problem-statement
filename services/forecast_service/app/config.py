import os
from pydantic import BaseModel

class ServiceSettings(BaseModel):
    app_name: str = "AgroConnect Time-Series Forecasting Service"
    version: str = "1.0.0"
    port: int = 8000
    host: str = "0.0.0.0"
    
    # Supabase Connection
    supabase_url: str = os.getenv("SUPABASE_URL", "https://rzppmfkltvgcejyiwufr.supabase.co")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cHBtZmtsdHZnY2VqeWl3dWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMTI5NDksImV4cCI6MjEwNDU4ODk0OX0.svPL0mG7h6S-WzYvGuJkalhpj-zJzwBPYknXtHCVl8s")
    
    # Government API Endpoints
    agmarknet_api_key: str = os.getenv("AGMARKNET_API_KEY", "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b")
    imd_api_base: str = os.getenv("IMD_API_BASE", "https://api.imd.gov.in/v1")
    dgft_api_base: str = os.getenv("DGFT_API_BASE", "https://dgft.gov.in/api/v1")

    # Crop Spot Price Benchmarks (INR/Quintal) when not explicitly provided
    commodity_spot_benchmarks: dict = {
        "soybean": 4850.0,
        "onion": 1650.0,
        "cotton": 7200.0,
        "wheat": 2275.0,
        "gram": 5450.0,
        "tur": 7000.0,
        "maize": 2090.0,
        "tomato": 1350.0,
        "potato": 1400.0
    }

settings = ServiceSettings()

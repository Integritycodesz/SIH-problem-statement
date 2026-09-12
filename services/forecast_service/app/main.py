from typing import Dict, Any, Optional, List
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import settings
from .data.imd_weather import IMDWeatherService, DistrictWeatherTelemetry
from .data.dgft_policy import DGFTPolicyService, CommodityTradePolicy
from .models.elasticity_engine import ArrivalVolumeElasticityEngine, ArrivalElasticityResult
from .models.sarimax_forecaster import SARIMAXExogenousForecaster, SARIMAXForecastResponse
from .models.prophet_decomposer import ProphetSeasonalDecomposer, ProphetDecompositionResponse

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Institutional-grade Agricultural Time-Series Forecasting Microservice fusing SARIMAX + Facebook Prophet with IMD Weather, Arrival Elasticity (Ed), and DGFT Trade Policies."
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CustomForecastRequest(BaseModel):
    commodity: str
    mandi_name: Optional[str] = "Lasalgaon APMC"
    district: Optional[str] = "Nashik"
    current_spot_price: float
    historical_modal_prices: Optional[List[float]] = None
    historical_arrivals_tonnes: Optional[List[float]] = None
    msp_benchmark_floor: Optional[float] = None

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.app_name,
        "version": settings.version,
        "models_loaded": ["SARIMAX(2,1,1)x(1,1,1)_12", "ProphetAdditiveDecomposition"],
        "exogenous_pipelines": ["IMD_Agromet_API", "Arrival_Elasticity_Ed", "DGFT_Customs_Tariff_Feed"],
        "supabase_connection": settings.supabase_url
    }

@app.get("/api/forecast/commodity/{commodity}", response_model=Dict[str, Any])
def get_commodity_forecast(
    commodity: str,
    mandi: str = Query("Lasalgaon APMC", description="APMC Mandi Name"),
    district: str = Query("Nashik", description="Maharashtra District Name"),
    spot_price: float = Query(2450.0, description="Current spot modal price in INR/Qtl"),
    msp: Optional[float] = Query(None, description="CACP Statutory MSP Floor")
):
    """
    Executes full SARIMAX + Prophet forecasting pipeline with:
    - IMD Rainfall anomalies & temperature deviations
    - Dynamic Arrival Elasticity (Ed)
    - DGFT Import/Export tariffs
    """
    sarimax_res = SARIMAXExogenousForecaster.forecast(
        commodity=commodity,
        mandi_name=mandi,
        district=district,
        current_spot_price=spot_price,
        msp_benchmark_floor=msp
    )

    prophet_res = ProphetSeasonalDecomposer.decompose(
        commodity=commodity,
        current_spot_price=spot_price
    )

    return {
        "status": "SUCCESS",
        "commodity": commodity,
        "sarimax_forecast": sarimax_res,
        "prophet_decomposition": prophet_res
    }

@app.post("/api/forecast/predict", response_model=SARIMAXForecastResponse)
def predict_custom_trajectory(req: CustomForecastRequest):
    """
    Generates a multi-horizon SARIMAX price forecast trajectory for given historical series.
    """
    return SARIMAXExogenousForecaster.forecast(
        commodity=req.commodity,
        mandi_name=req.mandi_name or "Lasalgaon APMC",
        district=req.district or "Nashik",
        current_spot_price=req.current_spot_price,
        historical_modal_prices=req.historical_modal_prices,
        historical_arrivals_tonnes=req.historical_arrivals_tonnes,
        msp_benchmark_floor=req.msp_benchmark_floor
    )

@app.get("/api/elasticity/{commodity}", response_model=ArrivalElasticityResult)
def get_arrival_elasticity(
    commodity: str,
    mandi: str = Query("Lasalgaon APMC"),
    current_arrivals: float = Query(160.0),
    previous_arrivals: float = Query(210.0),
    current_price: float = Query(2450.0),
    previous_price: float = Query(2380.0)
):
    """
    Dynamically recalculates Price-Arrival Cross Elasticity: Ed = (% Delta Q) / (% Delta P)
    """
    return ArrivalVolumeElasticityEngine.calculate_elasticity(
        commodity=commodity,
        mandi_name=mandi,
        current_arrivals=current_arrivals,
        previous_arrivals=previous_arrivals,
        current_price=current_price,
        previous_price=previous_price
    )

@app.get("/api/weather/imd/{district}", response_model=DistrictWeatherTelemetry)
def get_imd_weather(district: str):
    """
    Fetches sub-divisional rainfall anomalies and temperature deviations from IMD weather feed.
    """
    return IMDWeatherService.get_district_weather(district)

@app.get("/api/trade-policy/dgft", response_model=Dict[str, CommodityTradePolicy])
def get_all_dgft_policies():
    """
    Returns latest DGFT import duties on edible oils, export duties, and NAFED buffer targets.
    """
    return DGFTPolicyService.get_all_policies()

from .services.computer_vision import ProduceComputerVisionService
from fastapi import File, UploadFile, Form
import base64

class Base64AssayRequest(BaseModel):
    image_base64: str
    commodity: Optional[str] = "Onion"

@app.post("/api/assay/analyze-image")
async def analyze_produce_image(
    file: Optional[UploadFile] = File(None),
    commodity: Optional[str] = Form("Onion"),
    body: Optional[Base64AssayRequest] = None
):
    """
    Real-time Optical Produce Quality Assay Engine.
    Processes live photo buffers through luminance, chromatic pigmentation,
    morphometric sizing, and blemish necrosis segmentation.
    """
    image_bytes = None
    target_commodity = commodity or "Onion"
    
    if file is not None:
        image_bytes = await file.read()
    elif body is not None and body.image_base64:
        target_commodity = body.commodity or "Onion"
        b64_str = body.image_base64
        if "base64," in b64_str:
            b64_str = b64_str.split("base64,")[1]
        image_bytes = base64.b64decode(b64_str)
    
    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image provided. Please upload an image file or supply base64 payload.")
    
    try:
        return ProduceComputerVisionService.analyze_image(image_bytes, target_commodity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Computer Vision analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)


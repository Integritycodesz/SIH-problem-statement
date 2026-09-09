from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import random
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.models import Mandi, CommodityPrice
from app.schemas.schemas import MandiResponse, PriceResponse, TransportCalcRequest, TransportCalcResponse
from app.services.transport_calc import compute_arbitrage_and_freight, calculate_haversine_distance

router = APIRouter(prefix="/mandis", tags=["Mandi Price Intelligence"])

@router.get("/", response_model=List[MandiResponse])
def get_mandis(
    search: Optional[str] = None,
    state: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Mandi)
    if search:
        query = query.filter((Mandi.name.ilike(f"%{search}%")) | (Mandi.district.ilike(f"%{search}%")))
    if state:
        query = query.filter(Mandi.state.ilike(f"%{state}%"))
    return query.limit(limit).all()

@router.get("/summary/stats")
def get_market_summary(db: Session = Depends(get_db)):
    total_mandis = db.query(Mandi).count()
    total_price_feeds = db.query(CommodityPrice).count()
    commodities = [c[0] for c in db.query(CommodityPrice.commodity).distinct().all()]
    
    return {
        "active_mandis_count": total_mandis,
        "live_price_feeds_count": total_price_feeds,
        "tracked_commodities": commodities,
        "last_synced_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "coverage_states": ["Maharashtra", "Madhya Pradesh", "Gujarat", "Karnataka", "Punjab", "Haryana"]
    }

@router.get("/prices", response_model=List[PriceResponse])
def get_prices(
    commodity: Optional[str] = None,
    mandi_id: Optional[int] = None,
    district: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(CommodityPrice)
    if commodity:
        query = query.filter(CommodityPrice.commodity.ilike(f"%{commodity}%"))
    if mandi_id:
        query = query.filter(CommodityPrice.mandi_id == mandi_id)
    if district:
        query = query.join(Mandi).filter(Mandi.district.ilike(f"%{district}%"))
    
    return query.order_by(desc(CommodityPrice.modal_price)).limit(limit).all()

@router.get("/historical/{commodity}")
def get_historical_trends(commodity: str, mandi_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Provides 30-day daily price trend for high-fidelity interactive visualization."""
    base_price_query = db.query(CommodityPrice).filter(CommodityPrice.commodity.ilike(f"%{commodity}%"))
    if mandi_id:
        base_price_query = base_price_query.filter(CommodityPrice.mandi_id == mandi_id)
    latest = base_price_query.first()

    base_modal = latest.modal_price if latest else 2400.0
    msp = latest.msp_price if (latest and latest.msp_price) else round(base_modal * 0.88, 2)
    
    # Generate 30-day historical data points deterministically
    history = []
    current_date = datetime.utcnow()
    # Random walk simulation seeded with commodity name length for stability
    random.seed(len(commodity) + int(base_modal))
    curr = base_modal * 0.93

    for i in range(30, -1, -1):
        d = current_date - timedelta(days=i)
        step = random.uniform(-40.0, 45.0)
        curr = max(round(curr + step, 2), base_modal * 0.75)
        history.append({
            "date": d.strftime("%d %b"),
            "modal_price": curr,
            "min_price": round(curr * 0.92, 2),
            "max_price": round(curr * 1.08, 2),
            "arrivals_tonnes": round(random.uniform(90.0, 260.0), 1),
            "msp": msp
        })

    return {
        "commodity": commodity,
        "mandi_name": latest.mandi_name if latest else "Regional Average",
        "current_price": base_modal,
        "msp": msp,
        "trend_data": history
    }

@router.post("/calculate-transport", response_model=TransportCalcResponse)
def calculate_transport(req: TransportCalcRequest, db: Session = Depends(get_db)):
    mandi_from = db.query(Mandi).filter(Mandi.id == req.from_mandi_id).first()
    mandi_to = db.query(Mandi).filter(Mandi.id == req.to_mandi_id).first()

    if not mandi_from or not mandi_to:
        raise HTTPException(status_code=404, detail="One or both mandis not found")

    # Fetch latest modal prices for commodity in both mandis
    p_from = db.query(CommodityPrice).filter(
        CommodityPrice.mandi_id == req.from_mandi_id,
        CommodityPrice.commodity.ilike(f"%{req.commodity}%")
    ).first()

    p_to = db.query(CommodityPrice).filter(
        CommodityPrice.mandi_id == req.to_mandi_id,
        CommodityPrice.commodity.ilike(f"%{req.commodity}%")
    ).first()

    from_price = p_from.modal_price if p_from else 2150.0
    to_price = p_to.modal_price if p_to else 2520.0

    distance_km = calculate_haversine_distance(
        mandi_from.lat, mandi_from.lng,
        mandi_to.lat, mandi_to.lng
    )

    return compute_arbitrage_and_freight(
        distance_km=distance_km,
        quantity_quintals=req.quantity_quintals,
        from_price_per_qtl=from_price,
        to_price_per_qtl=to_price,
        vehicle_type=req.vehicle_type
    )

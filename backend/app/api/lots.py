from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.models.models import ProduceLot, User, Mandi
from app.schemas.schemas import ProduceLotCreate, ProduceLotResponse

router = APIRouter(prefix="/lots", tags=["Farmer Produce Lots"])

@router.get("/", response_model=List[ProduceLotResponse])
def get_lots(
    commodity: Optional[str] = None,
    quality_grade: Optional[str] = None,
    district: Optional[str] = None,
    farmer_id: Optional[int] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(ProduceLot)
    if commodity:
        query = query.filter(ProduceLot.commodity.ilike(f"%{commodity}%"))
    if quality_grade:
        query = query.filter(ProduceLot.quality_grade == quality_grade)
    if district:
        query = query.filter(ProduceLot.district.ilike(f"%{district}%"))
    if farmer_id:
        query = query.filter(ProduceLot.farmer_id == farmer_id)
    if status:
        query = query.filter(ProduceLot.status == status)
    else:
        # By default return available or contracted
        pass

    return query.order_by(desc(ProduceLot.created_at)).limit(limit).all()

@router.get("/{lot_id}", response_model=ProduceLotResponse)
def get_lot(lot_id: int, db: Session = Depends(get_db)):
    lot = db.query(ProduceLot).filter(ProduceLot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Produce lot not found")
    return lot

@router.post("/", response_model=ProduceLotResponse)
def create_lot(lot_in: ProduceLotCreate, db: Session = Depends(get_db)):
    farmer = db.query(User).filter(User.id == lot_in.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")

    mandi_name = None
    if lot_in.mandi_id:
        mandi = db.query(Mandi).filter(Mandi.id == lot_in.mandi_id).first()
        if mandi:
            mandi_name = mandi.name

    lot = ProduceLot(
        farmer_id=farmer.id,
        farmer_name=farmer.name,
        farmer_phone=farmer.phone,
        mandi_id=lot_in.mandi_id,
        mandi_name=mandi_name or f"{lot_in.district} APMC",
        district=lot_in.district,
        state=lot_in.state,
        commodity=lot_in.commodity,
        variety=lot_in.variety,
        quantity_quintals=lot_in.quantity_quintals,
        quality_grade=lot_in.quality_grade,
        moisture_percent=lot_in.moisture_percent,
        base_price_per_quintal=lot_in.base_price_per_quintal,
        expected_delivery_days=lot_in.expected_delivery_days,
        description=lot_in.description,
        status="AVAILABLE"
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return lot

@router.patch("/{lot_id}/status")
def update_lot_status(lot_id: int, status: str, db: Session = Depends(get_db)):
    lot = db.query(ProduceLot).filter(ProduceLot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Produce lot not found")
    lot.status = status
    db.commit()
    db.refresh(lot)
    return {"message": "Status updated successfully", "lot_id": lot.id, "status": lot.status}

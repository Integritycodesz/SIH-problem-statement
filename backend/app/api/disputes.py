from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.models.models import Dispute, Contract, User, EscrowPayment
from app.schemas.schemas import DisputeCreate, DisputeResolveRequest, DisputeResponse

router = APIRouter(prefix="/disputes", tags=["3-Tier Dispute Resolution"])

@router.get("/", response_model=List[DisputeResponse])
def get_disputes(
    contract_id: Optional[int] = None,
    tier: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Dispute)
    if contract_id:
        query = query.filter(Dispute.contract_id == contract_id)
    if tier:
        query = query.filter(Dispute.tier == tier)
    if status:
        query = query.filter(Dispute.status == status)

    return query.order_by(desc(Dispute.created_at)).all()

@router.get("/{dispute_id}", response_model=DisputeResponse)
def get_dispute(dispute_id: int, db: Session = Depends(get_db)):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    return dispute

@router.post("/", response_model=DisputeResponse)
def file_dispute(req: DisputeCreate, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == req.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    filer = db.query(User).filter(User.id == req.filed_by_id).first()
    filer_name = filer.name if filer else f"User #{req.filed_by_id}"

    dispute = Dispute(
        contract_id=contract.id,
        filed_by_id=req.filed_by_id,
        filed_by_name=filer_name,
        filed_by_role=req.filed_by_role,
        dispute_type=req.dispute_type,
        tier="TIER_1_PEER",
        status="OPEN",
        complaint_details=req.complaint_details,
        claimed_deduction=req.claimed_deduction,
        evidence_urls=req.evidence_urls or "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=600&auto=format&fit=crop"
    )

    # Flag contract as disputed to temporarily freeze escrow release
    contract.status = "DISPUTED"

    db.add(dispute)
    db.commit()
    db.refresh(dispute)
    return dispute

@router.post("/{dispute_id}/escalate")
def escalate_dispute(dispute_id: int, db: Session = Depends(get_db)):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")

    if dispute.tier == "TIER_1_PEER":
        dispute.tier = "TIER_2_ARBITRATION"
        dispute.status = "UNDER_ARBITRATION"
    elif dispute.tier == "TIER_2_ARBITRATION":
        dispute.tier = "TIER_3_PANEL"
        dispute.status = "UNDER_PANEL_REVIEW"
    
    db.commit()
    db.refresh(dispute)
    return {"message": f"Dispute escalated to {dispute.tier}", "dispute_id": dispute.id, "tier": dispute.tier}

@router.post("/{dispute_id}/resolve", response_model=DisputeResponse)
def resolve_dispute(dispute_id: int, req: DisputeResolveRequest, db: Session = Depends(get_db)):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")

    contract = db.query(Contract).filter(Contract.id == dispute.contract_id).first()
    
    dispute.tier = req.tier
    dispute.status = req.status
    dispute.agreed_adjustment = req.agreed_adjustment
    dispute.arbiter_ruling = req.arbiter_ruling
    dispute.resolved_at = datetime.utcnow()

    # Adjust escrow balance payout accordingly
    if contract and contract.escrow:
        # Subtract agreed deduction from final balance release
        contract.escrow.balance_amount = max(0.0, contract.escrow.balance_amount - req.agreed_adjustment)
        contract.escrow.balance_status = "RELEASED_TO_FARMER"
        contract.status = "COMPLETED"

    db.commit()
    db.refresh(dispute)
    return dispute

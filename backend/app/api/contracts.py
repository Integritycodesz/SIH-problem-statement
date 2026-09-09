from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.models.models import Contract, EscrowPayment
from app.schemas.schemas import ContractResponse, ContractSignRequest, EscrowPaymentResponse
from app.services.escrow_service import (
    sign_contract_by_party,
    fund_advance_escrow,
    dispatch_produce,
    mark_delivered,
    release_final_settlement
)

router = APIRouter(prefix="/contracts", tags=["Digital Contracts & Escrow"])

@router.get("/", response_model=List[ContractResponse])
def get_contracts(
    farmer_id: Optional[int] = None,
    buyer_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Contract)
    if farmer_id:
        query = query.filter(Contract.farmer_id == farmer_id)
    if buyer_id:
        query = query.filter(Contract.buyer_id == buyer_id)
    if status:
        query = query.filter(Contract.status == status)
    
    return query.order_by(desc(Contract.created_at)).all()

@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@router.post("/{contract_id}/sign", response_model=ContractResponse)
def sign_contract(contract_id: int, req: ContractSignRequest, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    return sign_contract_by_party(
        db=db,
        contract=contract,
        user_id=req.user_id,
        signer_role=req.signer_role,
        aadhaar_last_four=req.aadhaar_last_four
    )

@router.post("/{contract_id}/fund-advance", response_model=ContractResponse)
def fund_advance(contract_id: int, db: Session = Depends(get_db)):
    """Locks 50% advance in AgroConnect Escrow (via Razorpay simulation)."""
    try:
        return fund_advance_escrow(db, contract_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{contract_id}/dispatch", response_model=ContractResponse)
def dispatch(contract_id: int, db: Session = Depends(get_db)):
    """Farmer dispatches lot; 50% advance is released into farmer bank account for freight/expenses."""
    try:
        return dispatch_produce(db, contract_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{contract_id}/mark-delivered", response_model=ContractResponse)
def mark_delivery(contract_id: int, db: Session = Depends(get_db)):
    """Produce arrives at APMC hub / Buyer processing center for weighment & quality verification."""
    try:
        return mark_delivered(db, contract_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{contract_id}/release-final", response_model=ContractResponse)
def release_settlement(contract_id: int, db: Session = Depends(get_db)):
    """Buyer verifies quality grade and triggers 100% balance payout from escrow."""
    try:
        return release_final_settlement(db, contract_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

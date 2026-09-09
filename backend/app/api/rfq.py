from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
import uuid

from app.db.session import get_db
from app.models.models import RFQ, RFQMessage, ProduceLot, User, Contract, EscrowPayment
from app.schemas.schemas import RFQCreate, RFQCounterOffer, RFQResponse
from app.services.escrow_service import generate_contract_text

router = APIRouter(prefix="/rfq", tags=["RFQ & Negotiation Engine"])

@router.get("/", response_model=List[RFQResponse])
def get_rfqs(
    buyer_id: Optional[int] = None,
    farmer_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RFQ)
    if buyer_id:
        query = query.filter(RFQ.buyer_id == buyer_id)
    if farmer_id:
        query = query.filter(RFQ.farmer_id == farmer_id)
    if status:
        query = query.filter(RFQ.status == status)
    
    return query.order_by(desc(RFQ.updated_at)).all()

@router.get("/{rfq_id}", response_model=RFQResponse)
def get_rfq(rfq_id: int, db: Session = Depends(get_db)):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    return rfq

@router.post("/", response_model=RFQResponse)
def create_rfq(req: RFQCreate, db: Session = Depends(get_db)):
    lot = db.query(ProduceLot).filter(ProduceLot.id == req.lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Produce lot not found")
    
    buyer = db.query(User).filter(User.id == req.buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")

    rfq = RFQ(
        lot_id=lot.id,
        buyer_id=buyer.id,
        buyer_name=buyer.name,
        buyer_phone=buyer.phone,
        farmer_id=lot.farmer_id,
        farmer_name=lot.farmer_name,
        commodity=lot.commodity,
        quantity_quintals=lot.quantity_quintals,
        initial_offer_price=req.initial_offer_price,
        current_offered_price=req.initial_offer_price,
        last_sender_role="BUYER",
        delivery_timeline_days=req.delivery_timeline_days,
        delivery_address=req.delivery_address,
        status="PENDING"
    )
    db.add(rfq)
    db.commit()
    db.refresh(rfq)

    # Add initial message
    first_msg = RFQMessage(
        rfq_id=rfq.id,
        sender_id=buyer.id,
        sender_name=buyer.name,
        sender_role="BUYER",
        offered_price=req.initial_offer_price,
        message_text=req.first_message or f"Offered ₹{req.initial_offer_price}/qtl for {lot.quantity_quintals} qtls."
    )
    db.add(first_msg)

    # Mark lot as under negotiation
    lot.status = "UNDER_NEGOTIATION"

    db.commit()
    db.refresh(rfq)
    return rfq

@router.post("/{rfq_id}/counter", response_model=RFQResponse)
def counter_offer(rfq_id: int, req: RFQCounterOffer, db: Session = Depends(get_db)):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    if rfq.status in ["ACCEPTED", "CONTRACTED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Cannot counter a finalized RFQ")

    sender = db.query(User).filter(User.id == req.sender_id).first()
    sender_name = sender.name if sender else req.sender_role

    rfq.current_offered_price = req.offered_price
    rfq.last_sender_role = req.sender_role
    rfq.status = "COUNTERED"
    rfq.updated_at = datetime.utcnow()

    msg = RFQMessage(
        rfq_id=rfq.id,
        sender_id=req.sender_id,
        sender_name=sender_name,
        sender_role=req.sender_role,
        offered_price=req.offered_price,
        message_text=req.message_text or f"Counter-offer: ₹{req.offered_price}/qtl."
    )
    db.add(msg)
    db.commit()
    db.refresh(rfq)
    return rfq

@router.post("/{rfq_id}/accept")
def accept_rfq(rfq_id: int, accepted_by_role: str = "FARMER", db: Session = Depends(get_db)):
    """
    Accepting the RFQ immediately produces a binding Digital Contract
    and initiates the Escrow Payment account with 50% advance requirement.
    """
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    rfq.status = "ACCEPTED"
    rfq.updated_at = datetime.utcnow()

    # Calculate contract amounts
    total_val = round(rfq.current_offered_price * rfq.quantity_quintals, 2)
    advance_val = round(total_val * 0.50, 2)
    balance_val = round(total_val - advance_val, 2)
    contract_ref = f"AGC-MH-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    contract = Contract(
        contract_number=contract_ref,
        rfq_id=rfq.id,
        lot_id=rfq.lot_id,
        buyer_id=rfq.buyer_id,
        buyer_name=rfq.buyer_name,
        farmer_id=rfq.farmer_id,
        farmer_name=rfq.farmer_name,
        commodity=rfq.commodity,
        quantity_quintals=rfq.quantity_quintals,
        final_price_per_quintal=rfq.current_offered_price,
        total_amount=total_val,
        advance_amount=advance_val,
        balance_amount=balance_val,
        status="PENDING_SIGNATURES",
        delivery_address=rfq.delivery_address
    )
    contract.legal_terms = generate_contract_text(contract)
    db.add(contract)
    db.commit()
    db.refresh(contract)

    # Create escrow record
    escrow = EscrowPayment(
        contract_id=contract.id,
        total_amount=total_val,
        advance_amount=advance_val,
        advance_status="UNPAID",
        balance_amount=balance_val,
        balance_status="UNPAID",
        payment_gateway_ref=f"RZP_ESCROW_{contract.id}_{int(datetime.utcnow().timestamp())}"
    )
    db.add(escrow)

    # Mark RFQ as contracted
    rfq.status = "CONTRACTED"
    
    # Also update the produce lot status
    lot = db.query(ProduceLot).filter(ProduceLot.id == rfq.lot_id).first()
    if lot:
        lot.status = "CONTRACTED"

    db.commit()
    return {
        "message": "RFQ accepted successfully and digital contract generated",
        "rfq_id": rfq.id,
        "contract_id": contract.id,
        "contract_number": contract.contract_number,
        "total_amount": total_val,
        "advance_amount": advance_val
    }

@router.post("/{rfq_id}/reject")
def reject_rfq(rfq_id: int, reason: str = "Price unacceptable", db: Session = Depends(get_db)):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    rfq.status = "REJECTED"
    rfq.updated_at = datetime.utcnow()

    # Revert lot to AVAILABLE
    lot = db.query(ProduceLot).filter(ProduceLot.id == rfq.lot_id).first()
    if lot and lot.status == "UNDER_NEGOTIATION":
        lot.status = "AVAILABLE"

    db.commit()
    return {"message": "RFQ rejected", "rfq_id": rfq.id, "reason": reason}

import hashlib
import time
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Contract, EscrowPayment, ProduceLot, RFQ

def generate_contract_text(contract: Contract) -> str:
    return f"""AGROCONNECT SMART DIGITAL APMC CONTRACT
Reference: {contract.contract_number}
Date of Execution: {datetime.utcnow().strftime('%d %B %Y')}

1. PARTIES:
   - SELLER (FARMER): {contract.farmer_name} (Verified Aadhaar KYC)
   - BUYER (PROCUREMENT ENTITY): {contract.buyer_name} (Verified GSTIN / Pan KYC)

2. COMMODITY SPECIFICATION & TERMS:
   - Commodity: {contract.commodity}
   - Agreed Quantity: {contract.quantity_quintals} Quintals
   - Agreed Rate: ₹{contract.final_price_per_quintal} / Quintal
   - Total Value: ₹{contract.total_amount:,.2f}
   - Delivery Location: {contract.delivery_address}

3. ESCROW SECURE PAYMENT SCHEDULE (PRD Module 4):
   - Stage 1 Advance: 50% (₹{contract.advance_amount:,.2f}) locked in AgroConnect Escrow prior to dispatch.
   - Stage 2 Final: 50% (₹{contract.balance_amount:,.2f}) released upon electronic Mandi Gate Inspection & Weighment.

4. DISPUTE JURISDICTION:
   - Subject to APMC Maharashtra 3-Tier Arbitration Guidelines.
"""

def sign_contract_by_party(db: Session, contract: Contract, user_id: int, signer_role: str, aadhaar_last_four: str) -> Contract:
    timestamp_str = datetime.utcnow().isoformat()
    sign_payload = f"{contract.id}:{user_id}:{signer_role}:{aadhaar_last_four}:{timestamp_str}"
    sign_hash = "SIG-" + hashlib.sha256(sign_payload.encode('utf-8')).hexdigest()[:16].upper()

    if signer_role.upper() == "FARMER":
        contract.farmer_signed = True
        contract.farmer_signed_at = datetime.utcnow()
        contract.farmer_sign_hash = sign_hash
    elif signer_role.upper() == "BUYER":
        contract.buyer_signed = True
        contract.buyer_signed_at = datetime.utcnow()
        contract.buyer_sign_hash = sign_hash

    # Check if both signed
    if contract.farmer_signed and contract.buyer_signed:
        contract.status = "SIGNED_ESCROW_AWAITING"
    
    db.commit()
    db.refresh(contract)
    return contract

def fund_advance_escrow(db: Session, contract_id: int) -> Contract:
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract or not contract.escrow:
        raise ValueError("Contract or Escrow record not found")

    escrow = contract.escrow
    escrow.advance_status = "HELD_IN_ESCROW"
    escrow.advance_funded_at = datetime.utcnow()
    escrow.payment_gateway_ref = f"RZP_ESCROW_{int(time.time())}"
    contract.status = "ADVANCE_ESCROW_LOCKED"

    db.commit()
    db.refresh(contract)
    return contract

def dispatch_produce(db: Session, contract_id: int) -> Contract:
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract or not contract.escrow:
        raise ValueError("Contract or Escrow record not found")

    # When dispatched, advance is released to farmer for transport/fuel costs
    contract.escrow.advance_status = "RELEASED_TO_FARMER"
    contract.escrow.advance_released_at = datetime.utcnow()
    contract.status = "IN_TRANSIT"

    db.commit()
    db.refresh(contract)
    return contract

def mark_delivered(db: Session, contract_id: int) -> Contract:
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract or not contract.escrow:
        raise ValueError("Contract or Escrow record not found")

    contract.status = "DELIVERED_PENDING_INSPECTION"
    # Buyer funds the balance into escrow awaiting quality check
    contract.escrow.balance_status = "HELD_IN_ESCROW"

    db.commit()
    db.refresh(contract)
    return contract

def release_final_settlement(db: Session, contract_id: int) -> Contract:
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract or not contract.escrow:
        raise ValueError("Contract or Escrow record not found")

    contract.escrow.balance_status = "RELEASED_TO_FARMER"
    contract.escrow.final_settled_at = datetime.utcnow()
    contract.status = "COMPLETED"

    # Also update lot status to DELIVERED
    lot = db.query(ProduceLot).filter(ProduceLot.id == contract.lot_id).first()
    if lot:
        lot.status = "DELIVERED"

    db.commit()
    db.refresh(contract)
    return contract

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

# User Schemas
class UserBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    role: str
    district: str
    state: str = "Maharashtra"
    kyc_verified: bool = True
    rating: float = 4.8

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Mandi & Price Schemas
class MandiBase(BaseModel):
    name: str
    code: str
    district: str
    state: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    is_enam: bool = True
    distance_from_hub_km: float = 45.0

class MandiResponse(MandiBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class PriceResponse(BaseModel):
    id: int
    mandi_id: int
    mandi_name: str
    commodity: str
    variety: str
    min_price: float
    max_price: float
    modal_price: float
    msp_price: Optional[float] = None
    arrivals_tonnes: float
    change_24h: float
    price_date: str
    model_config = ConfigDict(from_attributes=True)

class TransportCalcRequest(BaseModel):
    from_mandi_id: int
    to_mandi_id: int
    commodity: str
    quantity_quintals: float
    vehicle_type: str = "Mini Truck (2.5T)" # Mini Truck (2.5T), Standard Truck (10T), Large Multi-Axle (20T)

class TransportCalcResponse(BaseModel):
    distance_km: float
    freight_cost: float
    cost_per_quintal: float
    estimated_transit_hours: float
    from_price: float
    to_price: float
    price_difference_per_quintal: float
    gross_arbitrage_gain: float
    net_profit_after_freight: float
    viability_status: str # HIGHLY_VIABLE, MARGINAL, NOT_RECOMMENDED


# Produce Lot Schemas
class ProduceLotCreate(BaseModel):
    farmer_id: int
    commodity: str
    variety: str = "Standard Hybrid"
    quantity_quintals: float
    quality_grade: str = "Grade A"
    moisture_percent: float = 11.5
    base_price_per_quintal: float
    mandi_id: Optional[int] = None
    district: str
    state: str = "Maharashtra"
    expected_delivery_days: int = 3
    description: Optional[str] = None

class ProduceLotResponse(BaseModel):
    id: int
    farmer_id: int
    farmer_name: str
    farmer_phone: str
    mandi_id: Optional[int]
    mandi_name: Optional[str]
    district: str
    state: str
    commodity: str
    variety: str
    quantity_quintals: float
    quality_grade: str
    moisture_percent: float
    base_price_per_quintal: float
    expected_delivery_days: int
    description: Optional[str]
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# RFQ Schemas
class RFQCreate(BaseModel):
    lot_id: int
    buyer_id: int
    initial_offer_price: float
    delivery_timeline_days: int = 4
    delivery_address: str = "APMC Processing Hub, Vashi, Navi Mumbai"
    first_message: Optional[str] = "We would like to procure this lot at the stated price."

class RFQCounterOffer(BaseModel):
    sender_id: int
    sender_role: str # BUYER, FARMER
    offered_price: float
    message_text: Optional[str] = None

class RFQMessageResponse(BaseModel):
    id: int
    rfq_id: int
    sender_id: int
    sender_name: str
    sender_role: str
    offered_price: float
    message_text: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RFQResponse(BaseModel):
    id: int
    lot_id: int
    buyer_id: int
    buyer_name: str
    buyer_phone: str
    farmer_id: int
    farmer_name: str
    commodity: str
    quantity_quintals: float
    initial_offer_price: float
    current_offered_price: float
    last_sender_role: str
    delivery_timeline_days: int
    delivery_address: str
    status: str
    created_at: datetime
    updated_at: datetime
    messages: List[RFQMessageResponse] = []
    model_config = ConfigDict(from_attributes=True)


# Contract & Escrow Schemas
class ContractSignRequest(BaseModel):
    user_id: int
    signer_role: str # FARMER, BUYER
    aadhaar_last_four: str = "9821"

class EscrowPaymentResponse(BaseModel):
    id: int
    contract_id: int
    total_amount: float
    advance_amount: float
    advance_status: str
    balance_amount: float
    balance_status: str
    payment_gateway_ref: str
    advance_funded_at: Optional[datetime] = None
    advance_released_at: Optional[datetime] = None
    final_settled_at: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ContractResponse(BaseModel):
    id: int
    contract_number: str
    rfq_id: int
    lot_id: int
    buyer_id: int
    buyer_name: str
    farmer_id: int
    farmer_name: str
    commodity: str
    quantity_quintals: float
    final_price_per_quintal: float
    total_amount: float
    advance_amount: float
    balance_amount: float
    status: str
    farmer_signed: bool
    farmer_signed_at: Optional[datetime]
    farmer_sign_hash: Optional[str]
    buyer_signed: bool
    buyer_signed_at: Optional[datetime]
    buyer_sign_hash: Optional[str]
    delivery_address: str
    legal_terms: Optional[str]
    created_at: datetime
    escrow: Optional[EscrowPaymentResponse] = None
    model_config = ConfigDict(from_attributes=True)


# Dispute Schemas
class DisputeCreate(BaseModel):
    contract_id: int
    filed_by_id: int
    filed_by_role: str # BUYER, FARMER
    dispute_type: str # QUALITY_MISMATCH, WEIGHT_SHORTAGE, DELAYED_DELIVERY, TRANSIT_DAMAGE
    complaint_details: str
    claimed_deduction: float = 0.0
    evidence_urls: Optional[str] = ""

class DisputeResolveRequest(BaseModel):
    tier: str # TIER_1_PEER, TIER_2_ARBITRATION, TIER_3_PANEL
    status: str # RESOLVED, DISMISSED
    agreed_adjustment: float
    arbiter_ruling: str

class DisputeResponse(BaseModel):
    id: int
    contract_id: int
    filed_by_id: int
    filed_by_name: str
    filed_by_role: str
    dispute_type: str
    tier: str
    status: str
    complaint_details: str
    claimed_deduction: float
    agreed_adjustment: float
    arbiter_ruling: Optional[str]
    evidence_urls: str
    created_at: datetime
    resolved_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    role = Column(String(20), nullable=False, default="FARMER") # FARMER, BUYER, OFFICIAL, FPO
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False, default="Maharashtra")
    kyc_verified = Column(Boolean, default=True)
    rating = Column(Float, default=4.8)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lots = relationship("ProduceLot", back_populates="farmer", foreign_keys="ProduceLot.farmer_id")


class Mandi(Base):
    __tablename__ = "mandis"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, index=True)
    code = Column(String(20), unique=True, index=True)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, default="Maharashtra")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    is_enam = Column(Boolean, default=True)
    distance_from_hub_km = Column(Float, default=45.0)

    # Relationships
    prices = relationship("CommodityPrice", back_populates="mandi")


class CommodityPrice(Base):
    __tablename__ = "commodity_prices"

    id = Column(Integer, primary_key=True, index=True)
    mandi_id = Column(Integer, ForeignKey("mandis.id"), nullable=False)
    mandi_name = Column(String(120), nullable=False)
    commodity = Column(String(80), nullable=False, index=True) # Onion, Soybean, Cotton, Tomato, Tur/Arhar, Wheat, Maize
    variety = Column(String(80), default="Standard Hybrid")
    min_price = Column(Float, nullable=False) # per Quintal
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    msp_price = Column(Float, nullable=True)
    arrivals_tonnes = Column(Float, default=120.0)
    change_24h = Column(Float, default=0.0) # Percentage change
    price_date = Column(String(20), nullable=False) # YYYY-MM-DD

    mandi = relationship("Mandi", back_populates="prices")


class ProduceLot(Base):
    __tablename__ = "produce_lots"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_name = Column(String(100), nullable=False)
    farmer_phone = Column(String(20), nullable=False)
    mandi_id = Column(Integer, ForeignKey("mandis.id"), nullable=True)
    mandi_name = Column(String(120), nullable=True)
    district = Column(String(100), nullable=False)
    state = Column(String(100), default="Maharashtra")
    commodity = Column(String(80), nullable=False, index=True)
    variety = Column(String(80), default="Hybrid High Yield")
    quantity_quintals = Column(Float, nullable=False)
    quality_grade = Column(String(10), default="Grade A") # Grade A, Grade B, Grade C
    moisture_percent = Column(Float, default=11.5)
    base_price_per_quintal = Column(Float, nullable=False)
    expected_delivery_days = Column(Integer, default=3)
    description = Column(Text, nullable=True)
    status = Column(String(30), default="AVAILABLE") # AVAILABLE, UNDER_NEGOTIATION, CONTRACTED, DELIVERED
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("User", back_populates="lots", foreign_keys=[farmer_id])
    rfqs = relationship("RFQ", back_populates="lot")


class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("produce_lots.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer_name = Column(String(100), nullable=False)
    buyer_phone = Column(String(20), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_name = Column(String(100), nullable=False)
    commodity = Column(String(80), nullable=False)
    quantity_quintals = Column(Float, nullable=False)
    initial_offer_price = Column(Float, nullable=False)
    current_offered_price = Column(Float, nullable=False)
    last_sender_role = Column(String(20), default="BUYER") # BUYER, FARMER
    delivery_timeline_days = Column(Integer, default=4)
    delivery_address = Column(String(200), default="APMC Processing Hub, Vashi, Navi Mumbai")
    status = Column(String(30), default="PENDING") # PENDING, COUNTERED, ACCEPTED, REJECTED, CONTRACTED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lot = relationship("ProduceLot", back_populates="rfqs")
    messages = relationship("RFQMessage", back_populates="rfq", cascade="all, delete-orphan")


class RFQMessage(Base):
    __tablename__ = "rfq_messages"

    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    sender_id = Column(Integer, nullable=False)
    sender_name = Column(String(100), nullable=False)
    sender_role = Column(String(20), nullable=False) # BUYER, FARMER
    offered_price = Column(Float, nullable=False)
    message_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    rfq = relationship("RFQ", back_populates="messages")


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String(50), unique=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    lot_id = Column(Integer, ForeignKey("produce_lots.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer_name = Column(String(100), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_name = Column(String(100), nullable=False)
    commodity = Column(String(80), nullable=False)
    quantity_quintals = Column(Float, nullable=False)
    final_price_per_quintal = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    advance_amount = Column(Float, nullable=False) # 50%
    balance_amount = Column(Float, nullable=False) # 50%
    status = Column(String(40), default="PENDING_SIGNATURES") 
    # PENDING_SIGNATURES, SIGNED_ESCROW_AWAITING, ADVANCE_ESCROW_LOCKED, IN_TRANSIT, DELIVERED_PENDING_INSPECTION, COMPLETED, DISPUTED
    farmer_signed = Column(Boolean, default=False)
    farmer_signed_at = Column(DateTime, nullable=True)
    farmer_sign_hash = Column(String(100), nullable=True)
    buyer_signed = Column(Boolean, default=False)
    buyer_signed_at = Column(DateTime, nullable=True)
    buyer_sign_hash = Column(String(100), nullable=True)
    delivery_address = Column(String(200), default="APMC Vashi Logistics Park, Navi Mumbai")
    legal_terms = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    escrow = relationship("EscrowPayment", back_populates="contract", uselist=False)
    disputes = relationship("Dispute", back_populates="contract")


class EscrowPayment(Base):
    __tablename__ = "escrow_payments"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), unique=True, nullable=False)
    total_amount = Column(Float, nullable=False)
    advance_amount = Column(Float, nullable=False)
    advance_status = Column(String(30), default="UNPAID") # UNPAID, HELD_IN_ESCROW, RELEASED_TO_FARMER
    balance_amount = Column(Float, nullable=False)
    balance_status = Column(String(30), default="UNPAID") # UNPAID, HELD_IN_ESCROW, RELEASED_TO_FARMER, REFUNDED
    payment_gateway_ref = Column(String(80), default="RZP_MOCK_SECURE_7721")
    advance_funded_at = Column(DateTime, nullable=True)
    advance_released_at = Column(DateTime, nullable=True)
    final_settled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="escrow")


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    filed_by_id = Column(Integer, nullable=False)
    filed_by_name = Column(String(100), nullable=False)
    filed_by_role = Column(String(20), nullable=False) # BUYER, FARMER
    dispute_type = Column(String(40), nullable=False) # QUALITY_MISMATCH, WEIGHT_SHORTAGE, DELAYED_DELIVERY, TRANSIT_DAMAGE
    tier = Column(String(30), default="TIER_1_PEER") # TIER_1_PEER, TIER_2_ARBITRATION, TIER_3_PANEL
    status = Column(String(30), default="OPEN") # OPEN, UNDER_NEGOTIATION, ARBITRATED, RESOLVED, DISMISSED
    complaint_details = Column(Text, nullable=False)
    claimed_deduction = Column(Float, default=0.0)
    agreed_adjustment = Column(Float, default=0.0)
    arbiter_ruling = Column(Text, nullable=True)
    evidence_urls = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    contract = relationship("Contract", back_populates="disputes")

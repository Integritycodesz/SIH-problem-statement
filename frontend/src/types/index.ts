/**
 * AgroConnect - Centralized TypeScript Type Definitions
 * Smart India Hackathon 2026 - Problem Statement ID: 26132
 * Powered exclusively by Supabase (PostgreSQL 15+)
 */

export type UserRole = 'FARMER' | 'BUYER' | 'OFFICIAL' | 'FPO';

export interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  district: string;
  state: string;
  kyc_verified: boolean;
  rating: number;
  created_at: string;
}

export interface Mandi {
  id: number;
  name: string;
  code: string;
  district: string;
  state: string;
  lat?: number;
  lng?: number;
  is_enam: boolean;
  distance_from_hub_km: number;
}

export interface CommodityPrice {
  id: number;
  mandi_id: number;
  mandi_name: string;
  commodity: string;
  variety: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  msp_price?: number;
  arrivals_tonnes: number;
  change_24h: number;
  price_date: string;
}

export interface ProduceLot {
  id: number;
  farmer_id: number;
  farmer_name: string;
  farmer_phone: string;
  mandi_id?: number;
  mandi_name?: string;
  district: string;
  state: string;
  commodity: string;
  variety: string;
  quantity_quintals: number;
  quality_grade: string;
  moisture_percent: number;
  base_price_per_quintal: number;
  expected_delivery_days: number;
  description?: string;
  status: 'AVAILABLE' | 'RFQ_ACTIVE' | 'UNDER_CONTRACT' | 'DELIVERED' | string;
  created_at: string;
}

export interface RFQMessage {
  id: number;
  rfq_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  offered_price: number;
  message_text?: string;
  created_at: string;
}

export interface RFQ {
  id: number;
  lot_id: number;
  buyer_id: number;
  farmer_id: number;
  commodity: string;
  quantity_quintals: number;
  initial_offer_price: number;
  current_offered_price: number;
  status: 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | string;
  delivery_timeline_days: number;
  delivery_address: string;
  created_at: string;
  updated_at: string;
  farmer_name?: string;
  buyer_name?: string;
  messages?: RFQMessage[];
}

export interface EscrowPayment {
  id: number;
  contract_id: number;
  total_amount: number;
  advance_amount: number;
  advance_percent: number;
  balance_amount: number;
  advance_status: 'UNPAID' | 'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED_TO_FARMER' | 'REFUNDED' | string;
  balance_status: 'UNPAID' | 'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED_TO_FARMER' | 'REFUNDED' | string;
  payment_gateway_ref?: string;
  advance_funded_at?: string;
  advance_released_at?: string;
  final_settled_at?: string;
}

export interface Contract {
  id: number;
  rfq_id: number;
  lot_id: number;
  contract_number: string;
  farmer_id: number;
  farmer_name: string;
  buyer_id: number;
  buyer_name: string;
  commodity: string;
  quantity_quintals: number;
  final_price_per_quintal: number;
  total_amount: number;
  advance_amount: number;
  balance_amount: number;
  delivery_address: string;
  farmer_signed: boolean;
  farmer_signed_at?: string;
  farmer_sign_hash?: string;
  buyer_signed: boolean;
  buyer_signed_at?: string;
  buyer_sign_hash?: string;
  status:
    | 'PENDING_SIGNATURES'
    | 'SIGNED_ESCROW_AWAITING'
    | 'ADVANCE_ESCROW_LOCKED'
    | 'IN_TRANSIT'
    | 'DELIVERED_PENDING_INSPECTION'
    | 'COMPLETED'
    | 'DISPUTED'
    | 'CANCELLED'
    | string;
  contract_terms?: string;
  legal_terms?: string;
  created_at: string;
  updated_at: string;
  escrow?: EscrowPayment;
}

export interface Dispute {
  id: number;
  contract_id: number;
  contract_number?: string;
  raised_by_id?: number;
  raised_by_name?: string;
  raised_against_id?: number;
  raised_against_name?: string;
  filed_by_id?: number;
  filed_by_name?: string;
  filed_by_role?: string;
  assigned_official_id?: number;
  assigned_official_name?: string;
  tier: 'TIER_1_PEER' | 'TIER_2_ARBITRATION' | 'TIER_3_PANEL' | 'TIER_2_APMC_ARBITRATION' | 'TIER_3_STATE_BOARD' | string;
  status: 'UNDER_NEGOTIATION' | 'ARBITRATION_PENDING' | 'OPEN' | 'IN_HEARING' | 'RESOLVED' | 'ESCALATED' | string;
  dispute_category?: 'QUALITY_DEFICIENCY' | 'WEIGHT_VARIATION' | 'DELIVERY_DELAY' | 'PAYMENT_DEFAULT' | string;
  dispute_type: string;
  dispute_reason?: string;
  complaint_details?: string;
  claimed_deduction: number;
  agreed_adjustment?: number;
  arbiter_ruling?: string;
  evidence_urls?: string;
  created_at: string;
  resolved_at?: string;
}

export interface TransportCalcResult {
  distance_km: number;
  freight_cost: number;
  cost_per_quintal: number;
  estimated_transit_hours: number;
  from_price: number;
  to_price: number;
  price_difference_per_quintal: number;
  gross_arbitrage_gain: number;
  net_profit_after_freight: number;
  viability_status: 'HIGHLY_VIABLE' | 'MARGINAL' | 'NOT_RECOMMENDED';
}

export interface MarketStats {
  active_mandis_count: number;
  enam_integrated_percentage: number;
  tracked_commodities: string[];
  total_daily_arrivals_tonnes: number;
  state: string;
  last_updated: string;
}

export interface AgriNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'RFQ' | 'ESCROW' | 'PRICE' | 'DISPUTE';
  read: boolean;
  linkTab?: string;
}


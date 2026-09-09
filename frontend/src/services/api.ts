export interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: 'FARMER' | 'BUYER' | 'OFFICIAL' | 'FPO';
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
  status: string;
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
  buyer_name: string;
  buyer_phone: string;
  farmer_id: number;
  farmer_name: string;
  commodity: string;
  quantity_quintals: number;
  initial_offer_price: number;
  current_offered_price: number;
  last_sender_role: string;
  delivery_timeline_days: number;
  delivery_address: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: RFQMessage[];
}

export interface EscrowPayment {
  id: number;
  contract_id: number;
  total_amount: number;
  advance_amount: number;
  advance_status: 'UNPAID' | 'HELD_IN_ESCROW' | 'RELEASED_TO_FARMER';
  balance_amount: number;
  balance_status: 'UNPAID' | 'HELD_IN_ESCROW' | 'RELEASED_TO_FARMER' | 'REFUNDED';
  payment_gateway_ref: string;
  advance_funded_at?: string;
  advance_released_at?: string;
  final_settled_at?: string;
  created_at: string;
}

export interface Contract {
  id: number;
  contract_number: string;
  rfq_id: number;
  lot_id: number;
  buyer_id: number;
  buyer_name: string;
  farmer_id: number;
  farmer_name: string;
  commodity: string;
  quantity_quintals: number;
  final_price_per_quintal: number;
  total_amount: number;
  advance_amount: number;
  balance_amount: number;
  status: string;
  farmer_signed: boolean;
  farmer_signed_at?: string;
  farmer_sign_hash?: string;
  buyer_signed: boolean;
  buyer_signed_at?: string;
  buyer_sign_hash?: string;
  delivery_address: string;
  legal_terms?: string;
  created_at: string;
  escrow?: EscrowPayment;
}

export interface Dispute {
  id: number;
  contract_id: number;
  filed_by_id: number;
  filed_by_name: string;
  filed_by_role: string;
  dispute_type: string;
  tier: 'TIER_1_PEER' | 'TIER_2_ARBITRATION' | 'TIER_3_PANEL';
  status: 'OPEN' | 'UNDER_NEGOTIATION' | 'ARBITRATED' | 'RESOLVED' | 'DISMISSED';
  complaint_details: string;
  claimed_deduction: number;
  agreed_adjustment: number;
  arbiter_ruling?: string;
  evidence_urls: string;
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  // Stats
  async getMarketStats() {
    const res = await fetch(`${API_BASE}/mandis/summary/stats`);
    return res.json();
  },

  // Mandis & Prices
  async getMandis(search?: string, limit = 100): Promise<Mandi[]> {
    const q = new URLSearchParams();
    if (search) q.append('search', search);
    q.append('limit', String(limit));
    const res = await fetch(`${API_BASE}/mandis/?${q.toString()}`);
    return res.json();
  },

  async getPrices(commodity?: string, limit = 100): Promise<CommodityPrice[]> {
    const q = new URLSearchParams();
    if (commodity) q.append('commodity', commodity);
    q.append('limit', String(limit));
    const res = await fetch(`${API_BASE}/mandis/prices?${q.toString()}`);
    return res.json();
  },

  async getHistoricalTrends(commodity: string) {
    const res = await fetch(`${API_BASE}/mandis/historical/${encodeURIComponent(commodity)}`);
    return res.json();
  },

  async calculateTransport(params: {
    from_mandi_id: number;
    to_mandi_id: number;
    commodity: string;
    quantity_quintals: number;
    vehicle_type: string;
  }): Promise<TransportCalcResult> {
    const res = await fetch(`${API_BASE}/mandis/calculate-transport`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  // Users
  async getUsers(role?: string): Promise<User[]> {
    const q = role ? `?role=${role}` : '';
    const res = await fetch(`${API_BASE}/users/${q}`);
    return res.json();
  },

  // Lots
  async getLots(commodity?: string, quality_grade?: string): Promise<ProduceLot[]> {
    const q = new URLSearchParams();
    if (commodity) q.append('commodity', commodity);
    if (quality_grade) q.append('quality_grade', quality_grade);
    const res = await fetch(`${API_BASE}/lots/?${q.toString()}`);
    return res.json();
  },

  async createLot(data: any): Promise<ProduceLot> {
    const res = await fetch(`${API_BASE}/lots/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // RFQ
  async getRFQs(): Promise<RFQ[]> {
    const res = await fetch(`${API_BASE}/rfq/`);
    return res.json();
  },

  async createRFQ(data: {
    lot_id: number;
    buyer_id: number;
    initial_offer_price: number;
    delivery_timeline_days: number;
    delivery_address: string;
    first_message?: string;
  }): Promise<RFQ> {
    const res = await fetch(`${API_BASE}/rfq/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async counterOffer(rfq_id: number, data: {
    sender_id: number;
    sender_role: string;
    offered_price: number;
    message_text?: string;
  }): Promise<RFQ> {
    const res = await fetch(`${API_BASE}/rfq/${rfq_id}/counter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async acceptRFQ(rfq_id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/rfq/${rfq_id}/accept`, {
      method: 'POST',
    });
    return res.json();
  },

  // Contracts & Escrow
  async getContracts(): Promise<Contract[]> {
    const res = await fetch(`${API_BASE}/contracts/`);
    return res.json();
  },

  async signContract(contract_id: number, data: {
    user_id: number;
    signer_role: string;
    aadhaar_last_four: string;
  }): Promise<Contract> {
    const res = await fetch(`${API_BASE}/contracts/${contract_id}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async fundAdvance(contract_id: number): Promise<Contract> {
    const res = await fetch(`${API_BASE}/contracts/${contract_id}/fund-advance`, {
      method: 'POST',
    });
    return res.json();
  },

  async dispatchContract(contract_id: number): Promise<Contract> {
    const res = await fetch(`${API_BASE}/contracts/${contract_id}/dispatch`, {
      method: 'POST',
    });
    return res.json();
  },

  async markDelivered(contract_id: number): Promise<Contract> {
    const res = await fetch(`${API_BASE}/contracts/${contract_id}/mark-delivered`, {
      method: 'POST',
    });
    return res.json();
  },

  async releaseFinalSettlement(contract_id: number): Promise<Contract> {
    const res = await fetch(`${API_BASE}/contracts/${contract_id}/release-final`, {
      method: 'POST',
    });
    return res.json();
  },

  // Disputes
  async getDisputes(): Promise<Dispute[]> {
    const res = await fetch(`${API_BASE}/disputes/`);
    return res.json();
  },

  async fileDispute(data: any): Promise<Dispute> {
    const res = await fetch(`${API_BASE}/disputes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async resolveDispute(dispute_id: number, data: {
    tier: string;
    status: string;
    agreed_adjustment: number;
    arbiter_ruling: string;
  }): Promise<Dispute> {
    const res = await fetch(`${API_BASE}/disputes/${dispute_id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }
};

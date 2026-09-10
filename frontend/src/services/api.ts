/**
 * AgroConnect - Supabase Direct Service Layer
 * Smart India Hackathon 2026 - Problem Statement ID: 26132
 * Powered exclusively by Supabase (PostgreSQL 15+ & Realtime)
 * No FastAPI backend required.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type {
  User,
  Mandi,
  CommodityPrice,
  ProduceLot,
  RFQ,
  RFQMessage,
  Contract,
  EscrowPayment,
  Dispute,
  TransportCalcResult,
  MarketStats,
  AgriNotification
} from '../types';

// Re-export all types so existing component imports continue working seamlessly
export type {
  User,
  Mandi,
  CommodityPrice,
  ProduceLot,
  RFQ,
  RFQMessage,
  Contract,
  EscrowPayment,
  Dispute,
  TransportCalcResult,
  MarketStats,
  AgriNotification
};

// ============================================================================
// Built-in Fallback Data & Reactive In-Memory Stores
// ============================================================================
const FALLBACK_USERS: User[] = [
  { id: 1, name: 'Ramesh Patil', phone: '9822012345', email: 'ramesh.patil@kisan.in', role: 'FARMER', district: 'Nashik', state: 'Maharashtra', kyc_verified: true, rating: 4.9, created_at: new Date().toISOString() },
  { id: 2, name: 'Sunita Deshmukh', phone: '9822023456', email: 'sunita.deshmukh@kisan.in', role: 'FARMER', district: 'Pune', state: 'Maharashtra', kyc_verified: true, rating: 4.8, created_at: new Date().toISOString() },
  { id: 3, name: 'Balasaheb Shinde', phone: '9822034567', email: 'b.shinde@kisan.in', role: 'FARMER', district: 'Ahmednagar', state: 'Maharashtra', kyc_verified: true, rating: 4.7, created_at: new Date().toISOString() },
  { id: 8, name: 'Sahyadri Agro Processing Ltd (Pravin Joshi)', phone: '9821011111', email: 'procurement@sahyadriagro.in', role: 'BUYER', district: 'Nashik', state: 'Maharashtra', kyc_verified: true, rating: 4.9, created_at: new Date().toISOString() },
  { id: 9, name: 'Godrej Agrovet Sourcing (Neha Verma)', phone: '9821022222', email: 'n.verma@godrejagrovet.com', role: 'BUYER', district: 'Mumbai Suburban', state: 'Maharashtra', kyc_verified: true, rating: 4.9, created_at: new Date().toISOString() },
  { id: 10, name: 'BigBasket Direct Farm Hub (Amit Singhal)', phone: '9821033333', email: 'farmsourcing@bigbasket.com', role: 'BUYER', district: 'Pune', state: 'Maharashtra', kyc_verified: true, rating: 4.8, created_at: new Date().toISOString() },
  { id: 12, name: 'Dr. V. K. Kadam (APMC State Arbiter)', phone: '9820099999', email: 'arbiter@msamb.gov.in', role: 'OFFICIAL', district: 'Pune', state: 'Maharashtra', kyc_verified: true, rating: 5.0, created_at: new Date().toISOString() }
];

const FALLBACK_MANDIS: Mandi[] = [
  { id: 1, name: 'Lasalgaon APMC', code: 'MH-1001', district: 'Nashik', state: 'Maharashtra', lat: 20.1444, lng: 74.2255, is_enam: true, distance_from_hub_km: 45.0 },
  { id: 2, name: 'Pimpalgaon APMC', code: 'MH-1002', district: 'Nashik', state: 'Maharashtra', lat: 20.1667, lng: 73.9833, is_enam: true, distance_from_hub_km: 32.0 },
  { id: 3, name: 'Nashik APMC', code: 'MH-1003', district: 'Nashik', state: 'Maharashtra', lat: 20.0059, lng: 73.7901, is_enam: true, distance_from_hub_km: 15.0 },
  { id: 4, name: 'Pune APMC (Gultekdi)', code: 'MH-1007', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, is_enam: true, distance_from_hub_km: 210.0 },
  { id: 5, name: 'Vashi APMC (Navi Mumbai Central)', code: 'MH-1016', district: 'Mumbai Suburban', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, is_enam: true, distance_from_hub_km: 185.0 },
  { id: 6, name: 'Solapur APMC', code: 'MH-1031', district: 'Solapur', state: 'Maharashtra', lat: 17.6599, lng: 75.9064, is_enam: true, distance_from_hub_km: 340.0 },
  { id: 7, name: 'Nagpur Orange Market APMC', code: 'MH-1051', district: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, is_enam: true, distance_from_hub_km: 680.0 },
  { id: 8, name: 'Azadpur APMC', code: 'IN-1065', district: 'North Delhi', state: 'Delhi', lat: 28.7166, lng: 77.1770, is_enam: true, distance_from_hub_km: 1250.0 }
];

const FALLBACK_PRICES: CommodityPrice[] = [
  { id: 1, mandi_id: 1, mandi_name: 'Lasalgaon APMC', commodity: 'Onion', variety: 'Red Nasik', min_price: 2150, max_price: 2650, modal_price: 2420, msp_price: 1900, arrivals_tonnes: 340, change_24h: 3.8, price_date: new Date().toISOString().split('T')[0] },
  { id: 2, mandi_id: 2, mandi_name: 'Pimpalgaon APMC', commodity: 'Tomato', variety: 'Hybrid Vaishali', min_price: 1800, max_price: 2300, modal_price: 2050, msp_price: 1400, arrivals_tonnes: 210, change_24h: -2.1, price_date: new Date().toISOString().split('T')[0] },
  { id: 3, mandi_id: 3, mandi_name: 'Nashik APMC', commodity: 'Soybean', variety: 'JS 335', min_price: 4650, max_price: 4950, modal_price: 4820, msp_price: 4600, arrivals_tonnes: 180, change_24h: 1.5, price_date: new Date().toISOString().split('T')[0] },
  { id: 4, mandi_id: 4, mandi_name: 'Pune APMC (Gultekdi)', commodity: 'Wheat', variety: 'Lokwan Golden', min_price: 2500, max_price: 2850, modal_price: 2680, msp_price: 2275, arrivals_tonnes: 450, change_24h: 0.5, price_date: new Date().toISOString().split('T')[0] },
  { id: 5, mandi_id: 5, mandi_name: 'Vashi APMC (Navi Mumbai Central)', commodity: 'Onion', variety: 'Garwa Winter', min_price: 2400, max_price: 2900, modal_price: 2650, msp_price: 1900, arrivals_tonnes: 520, change_24h: 4.2, price_date: new Date().toISOString().split('T')[0] },
  { id: 6, mandi_id: 6, mandi_name: 'Solapur APMC', commodity: 'Onion', variety: 'Medium Golta Red', min_price: 1700, max_price: 2420, modal_price: 2310, msp_price: 1900, arrivals_tonnes: 190, change_24h: -1.1, price_date: new Date().toISOString().split('T')[0] },
  { id: 7, mandi_id: 7, mandi_name: 'Nagpur Orange Market APMC', commodity: 'Cotton', variety: 'Medium Long Staple', min_price: 6800, max_price: 7350, modal_price: 7120, msp_price: 6620, arrivals_tonnes: 280, change_24h: 2.3, price_date: new Date().toISOString().split('T')[0] }
];

let inMemoryLots: ProduceLot[] = [
  {
    id: 819,
    farmer_id: 1,
    farmer_name: 'Ramesh Patil (Nashik Kisan Samruddhi FPO)',
    farmer_phone: '9822012345',
    mandi_name: 'Lasalgaon APMC',
    district: 'Nashik',
    state: 'Maharashtra',
    commodity: 'Onion',
    variety: 'Nasik Red (Garwa)',
    quantity_quintals: 400.0,
    quality_grade: 'Grade A+',
    moisture_percent: 11.4,
    base_price_per_quintal: 2450.0,
    expected_delivery_days: 3,
    description: 'Export ready sun-cured Red Onions (55mm+ bulbs), low moisture (<12%), stored in ventilated APMC custody.',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
  },
  {
    id: 612,
    farmer_id: 1,
    farmer_name: 'Marathwada Agro Producer Co.',
    farmer_phone: '9822019988',
    mandi_name: 'Akola Agrilogistics Hub',
    district: 'Latur',
    state: 'Maharashtra',
    commodity: 'Soybean',
    variety: 'JS-335 Certified Seed',
    quantity_quintals: 850.0,
    quality_grade: 'Grade A',
    moisture_percent: 10.0,
    base_price_per_quintal: 4890.0,
    expected_delivery_days: 4,
    description: 'High oil content (19.2%), cleaned and machine sorted. Moisture 10% max with negligible foreign matter.',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600 * 1000 * 18).toISOString()
  },
  {
    id: 3108,
    farmer_id: 2,
    farmer_name: 'Sahyadri Valley FPC (Sunita Deshmukh)',
    farmer_phone: '9822023456',
    mandi_name: 'Pune APMC (Gultekdi)',
    district: 'Pune',
    state: 'Maharashtra',
    commodity: 'Tomato',
    variety: 'Hybrid Abhinav',
    quantity_quintals: 220.0,
    quality_grade: 'Grade A',
    moisture_percent: 88.0,
    base_price_per_quintal: 1950.0,
    expected_delivery_days: 2,
    description: 'Uniform red firm fruit, 90-100g, thick pericarp suitable for long distance reefer transit. Harvested 12h ago.',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600 * 1000 * 6).toISOString()
  },
  {
    id: 790,
    farmer_id: 3,
    farmer_name: 'Balasaheb Shinde',
    farmer_phone: '9822034567',
    mandi_name: 'Chhatrapati Sambhajinagar APMC',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    commodity: 'Wheat',
    variety: 'Lokwan Desi (Sharbati)',
    quantity_quintals: 400.0,
    quality_grade: 'Grade A',
    moisture_percent: 9.8,
    base_price_per_quintal: 2810.0,
    expected_delivery_days: 3,
    description: 'Heavy lustrous grains, golden amber luster, protein 12.8%. Ideal for premium flour milling.',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
  },
  {
    id: 950,
    farmer_id: 1,
    farmer_name: 'Vidarbha Organic Growers FPO',
    farmer_phone: '9822045678',
    mandi_name: 'Nagpur Orange Market APMC',
    district: 'Nagpur',
    state: 'Maharashtra',
    commodity: 'Cotton',
    variety: 'Medium Long Staple Bt',
    quantity_quintals: 500.0,
    quality_grade: 'Grade A+',
    moisture_percent: 8.5,
    base_price_per_quintal: 7120.0,
    expected_delivery_days: 5,
    description: 'Ginned bales, 29mm fiber length, zero trash contamination. CCI grading benchmark passed.',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600 * 1000 * 30).toISOString()
  }
];

let inMemoryRFQs: RFQ[] = [
  {
    id: 1,
    lot_id: 819,
    buyer_id: 8,
    buyer_name: 'Sahyadri Agro Processing Ltd (Pravin Joshi)',
    farmer_id: 1,
    farmer_name: 'Ramesh Patil (Nashik FPO)',
    commodity: 'Onion',
    quantity_quintals: 400.0,
    initial_offer_price: 2380.0,
    current_offered_price: 2420.0,
    status: 'COUNTERED',
    delivery_timeline_days: 3,
    delivery_address: 'Sahyadri Mega Food Park, Dindori, Nashik',
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    messages: [
      { id: 1, rfq_id: 1, sender_id: 8, sender_name: 'Sahyadri Agro Processing Ltd', sender_role: 'BUYER', offered_price: 2380, message_text: 'Seeking 400 qtl export batch. Offering ₹2,380/qtl for immediate gate arrival.', created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString() },
      { id: 2, rfq_id: 1, sender_id: 1, sender_name: 'Ramesh Patil (FPO)', sender_role: 'FARMER', offered_price: 2450, message_text: 'Moisture is strictly ≤ 11.2% NABL certified. Can settle at ₹2,450.', created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString() },
      { id: 3, rfq_id: 1, sender_id: 8, sender_name: 'Sahyadri Agro Processing Ltd', sender_role: 'BUYER', offered_price: 2420, message_text: 'Counter-offer: ₹2,420/qtl with 50% escrow advance deposit locked today.', created_at: new Date(Date.now() - 3600 * 1000).toISOString() }
    ]
  },
  {
    id: 2,
    lot_id: 612,
    buyer_id: 10,
    buyer_name: 'BigBasket Direct Farm Hub (Amit Singhal)',
    farmer_id: 1,
    farmer_name: 'Marathwada Agro Producer Co.',
    commodity: 'Soybean',
    quantity_quintals: 300.0,
    initial_offer_price: 4800.0,
    current_offered_price: 4850.0,
    status: 'COUNTERED',
    delivery_timeline_days: 4,
    delivery_address: 'BigBasket Chakan Cold Hub, Pune',
    created_at: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    messages: [
      { id: 4, rfq_id: 2, sender_id: 10, sender_name: 'BigBasket Direct Farm Hub', sender_role: 'BUYER', offered_price: 4800, message_text: 'Procuring 300 quintals JS-335. Pre-cleared escrow account.', created_at: new Date(Date.now() - 3600 * 1000 * 6).toISOString() },
      { id: 5, rfq_id: 2, sender_id: 1, sender_name: 'Marathwada Agro Producer Co.', sender_role: 'FARMER', offered_price: 4850, message_text: 'Countering at ₹4,850/qtl. Machine sorted seed with certified assay.', created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString() }
    ]
  }
];

let inMemoryNotifications: AgriNotification[] = [
  {
    id: 'n1',
    title: 'Counter-Offer Received',
    message: 'Sahyadri Agro countered ₹2,420/qtl on Lot #819 (Lasalgaon Onion).',
    timestamp: '12 mins ago',
    type: 'RFQ',
    read: false,
    linkTab: 'buyer'
  },
  {
    id: 'n2',
    title: 'Escrow Advance Deposited',
    message: '50% advance of ₹28,500 locked in SBI Escrow for Contract #00109.',
    timestamp: '1 hr ago',
    type: 'ESCROW',
    read: false,
    linkTab: 'contracts'
  },
  {
    id: 'n3',
    title: 'APMC Price Surge Alert',
    message: 'Lasalgaon Onion modal jumped +3.8% today (₹2,420/qtl).',
    timestamp: '2 hrs ago',
    type: 'PRICE',
    read: false,
    linkTab: 'intelligence'
  }
];


let inMemoryContracts: Contract[] = [
  {
    id: 1,
    rfq_id: 1,
    lot_id: 2,
    contract_number: 'AGC-MH-20260910-00109',
    farmer_id: 1,
    farmer_name: 'Ramesh Patil',
    buyer_id: 9,
    buyer_name: 'Godrej Agrovet Sourcing (Neha Verma)',
    commodity: 'Onion (Garwa)',
    quantity_quintals: 25.0,
    final_price_per_quintal: 2280.0,
    total_amount: 57000.0,
    advance_amount: 28500.0,
    balance_amount: 28500.0,
    status: 'ADVANCE_ESCROW_LOCKED',
    farmer_signed: true,
    farmer_signed_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    farmer_sign_hash: 'SIG-7F3A91BC24E1D09A',
    buyer_signed: true,
    buyer_signed_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    buyer_sign_hash: 'SIG-89B2E01DF187425C',
    delivery_address: 'Godrej Central Cold Hub, Vashi APMC Sector 19',
    contract_terms: 'AGROCONNECT SMART DIGITAL APMC CONTRACT\nReference: AGC-MH-20260910-00109\n1. PARTIES: Ramesh Patil (Farmer) & Godrej Agrovet (Buyer)\n2. TERMS: 25 Qtl Onion at ₹2,280/Qtl, Total ₹57,000\n3. ESCROW: 50% advance locked, 50% balance on gate delivery.\n4. JURISDICTION: Maharashtra APMC 3-Tier Arbitration.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    escrow: {
      id: 1,
      contract_id: 1,
      total_amount: 57000.0,
      advance_amount: 28500.0,
      advance_percent: 50.0,
      balance_amount: 28500.0,
      advance_status: 'HELD_IN_ESCROW',
      balance_status: 'PENDING',
      payment_gateway_ref: 'RZP_ESCROW_LIVE_99812',
      advance_funded_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    }
  }
];

let inMemoryDisputes: Dispute[] = [
  {
    id: 1,
    contract_id: 1,
    contract_number: 'AGC-MH-20260910-00109',
    raised_by_id: 9,
    raised_by_name: 'Godrej Agrovet Sourcing (Neha Verma)',
    raised_against_id: 1,
    raised_against_name: 'Ramesh Patil',
    filed_by_name: 'Godrej Agrovet Sourcing (Neha Verma)',
    filed_by_role: 'BUYER',
    tier: 'TIER_1_PEER',
    status: 'UNDER_NEGOTIATION',
    dispute_category: 'QUALITY_DEFICIENCY',
    dispute_type: 'MOISTURE_EXCESS',
    dispute_reason: 'Moisture reading at gate test is 13.8% vs guaranteed 11.2%. Proposing standard ₹1,200 drying allowance deduction.',
    complaint_details: 'Moisture reading at gate test is 13.8% vs guaranteed 11.2%. Proposing standard ₹1,200 drying allowance deduction.',
    claimed_deduction: 1200.0,
    agreed_adjustment: 1200.0,
    evidence_urls: 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  }
];

// ============================================================================
// Transport & Arbitrage Calculation (Direct Client-Side Execution)
// ============================================================================
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 120.0;
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 1.28 * 10) / 10;
}

// ============================================================================
// Supabase-Driven API Service
// ============================================================================
export const api = {
  // 1. Market Statistics
  async getMarketStats(): Promise<MarketStats> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { count: mandiCount } = await supabase.from('mandis').select('*', { count: 'exact', head: true });
        const { data: priceData } = await supabase.from('commodity_prices').select('commodity, arrivals_tonnes');
        const commodities = Array.from(new Set((priceData || []).map((p: any) => p.commodity)));
        const totalArrivals = (priceData || []).reduce((acc: number, p: any) => acc + (Number(p.arrivals_tonnes) || 0), 0);

        return {
          active_mandis_count: mandiCount || 585,
          enam_integrated_percentage: 94.2,
          tracked_commodities: commodities.length > 0 ? commodities : ['Onion', 'Soybean', 'Cotton', 'Tomato', 'Tur / Arhar', 'Wheat'],
          total_daily_arrivals_tonnes: Math.round(totalArrivals) || 18450,
          state: 'Maharashtra',
          last_updated: new Date().toISOString()
        };
      } catch (err) {
        console.warn('[Supabase API] Failed to fetch market stats, returning fallback', err);
      }
    }

    return {
      active_mandis_count: 585,
      enam_integrated_percentage: 94.2,
      tracked_commodities: ['Onion', 'Soybean', 'Cotton', 'Tomato', 'Tur / Arhar', 'Wheat', 'Gram / Chana', 'Maize'],
      total_daily_arrivals_tonnes: 18450,
      state: 'Maharashtra',
      last_updated: new Date().toISOString()
    };
  },

  // 2. Mandis & Prices
  async getMandis(search?: string, limit = 100): Promise<Mandi[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('mandis').select('*').limit(limit);
        if (search) {
          query = query.ilike('name', `%${search}%`);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Mandi[];
      } catch (err) {
        console.warn('[Supabase API] Error fetching mandis, falling back', err);
      }
    }

    let list = [...FALLBACK_MANDIS];
    if (search) {
      list = list.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.district.toLowerCase().includes(search.toLowerCase()));
    }
    return list.slice(0, limit);
  },

  async getPrices(commodity?: string, limit = 100): Promise<CommodityPrice[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('commodity_prices').select('*').order('arrivals_tonnes', { ascending: false }).limit(limit);
        if (commodity) {
          query = query.ilike('commodity', `%${commodity}%`);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as CommodityPrice[];
      } catch (err) {
        console.warn('[Supabase API] Error fetching commodity prices, falling back', err);
      }
    }

    let list = [...FALLBACK_PRICES];
    if (commodity) {
      list = list.filter((p) => p.commodity.toLowerCase().includes(commodity.toLowerCase()));
    }
    return list.slice(0, limit);
  },

  async getHistoricalTrends(commodity: string): Promise<any> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('commodity_prices')
          .select('price_date, modal_price, arrivals_tonnes, mandi_name')
          .ilike('commodity', `%${commodity}%`)
          .order('price_date', { ascending: true })
          .limit(30);

        if (!error && data && data.length > 0) {
          return {
            commodity,
            data_points: data
          };
        }
      } catch (err) {
        console.warn('[Supabase API] Historical trend fetch failed', err);
      }
    }

    return {
      commodity,
      data_points: [
        { date: '2026-09-04', modal_price: 2320, arrivals_tonnes: 320 },
        { date: '2026-09-05', modal_price: 2380, arrivals_tonnes: 310 },
        { date: '2026-09-06', modal_price: 2360, arrivals_tonnes: 290 },
        { date: '2026-09-07', modal_price: 2410, arrivals_tonnes: 330 },
        { date: '2026-09-08', modal_price: 2400, arrivals_tonnes: 345 },
        { date: '2026-09-09', modal_price: 2450, arrivals_tonnes: 350 },
        { date: '2026-09-10', modal_price: 2420, arrivals_tonnes: 340 }
      ]
    };
  },

  // 3. Transport & Arbitrage Calculation (Client-Side)
  async calculateTransport(params: {
    from_mandi_id: number;
    to_mandi_id: number;
    commodity: string;
    quantity_quintals: number;
    vehicle_type: string;
  }): Promise<TransportCalcResult> {
    const mandis = await this.getMandis();
    const fromMandi = mandis.find((m) => m.id === params.from_mandi_id) || mandis[0];
    const toMandi = mandis.find((m) => m.id === params.to_mandi_id) || mandis[1];

    const distanceKm = calculateHaversineDistance(
      fromMandi?.lat || 20.0,
      fromMandi?.lng || 73.8,
      toMandi?.lat || 19.1,
      toMandi?.lng || 72.9
    );

    const tonnes = params.quantity_quintals / 10.0;
    let vehicleFactor = 1.0;
    if (params.vehicle_type.includes('Mini Truck')) vehicleFactor = 1.25;
    else if (params.vehicle_type.includes('Large Multi-Axle')) vehicleFactor = 0.82;

    const freightPerTonne = distanceKm * 3.85 * vehicleFactor + 350.0;
    const totalFreightCost = Math.round(freightPerTonne * tonnes * 100) / 100;
    const costPerQuintal = Math.round((totalFreightCost / Math.max(params.quantity_quintals, 1.0)) * 100) / 100;
    const estimatedHours = Math.round((distanceKm / 42.0 + 2.0) * 10) / 10;

    const fromPrice = 2150;
    const toPrice = 2480;
    const priceDiff = toPrice - fromPrice;
    const grossArbitrage = priceDiff * params.quantity_quintals;
    const netProfit = grossArbitrage - totalFreightCost;

    let viability: 'HIGHLY_VIABLE' | 'MARGINAL' | 'NOT_RECOMMENDED' = 'NOT_RECOMMENDED';
    if (netProfit > grossArbitrage * 0.4 && netProfit > 1500) {
      viability = 'HIGHLY_VIABLE';
    } else if (netProfit > 0) {
      viability = 'MARGINAL';
    }

    return {
      distance_km: distanceKm,
      freight_cost: totalFreightCost,
      cost_per_quintal: costPerQuintal,
      estimated_transit_hours: estimatedHours,
      from_price: fromPrice,
      to_price: toPrice,
      price_difference_per_quintal: priceDiff,
      gross_arbitrage_gain: grossArbitrage,
      net_profit_after_freight: netProfit,
      viability_status: viability
    };
  },

  // 4. Users
  async getUsers(role?: string): Promise<User[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('users').select('*');
        if (role) query = query.eq('role', role);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as User[];
      } catch (err) {
        console.warn('[Supabase API] Failed to fetch users', err);
      }
    }

    if (role) {
      return FALLBACK_USERS.filter((u) => u.role === role);
    }
    return FALLBACK_USERS;
  },

  // 5. Produce Lots
  async getLots(commodity?: string, quality_grade?: string, farmer_id?: number): Promise<ProduceLot[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('produce_lots').select('*').order('created_at', { ascending: false });
        if (commodity && commodity !== 'All') query = query.ilike('commodity', `%${commodity}%`);
        if (quality_grade) query = query.ilike('quality_grade', `%${quality_grade}%`);
        if (farmer_id) query = query.eq('farmer_id', farmer_id);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as ProduceLot[];
      } catch (err) {
        console.warn('[Supabase API] Failed to fetch produce lots', err);
      }
    }

    let lots = [...inMemoryLots];
    if (commodity && commodity !== 'All') {
      lots = lots.filter((l) => l.commodity.toLowerCase().includes(commodity.toLowerCase()));
    }
    if (quality_grade) {
      lots = lots.filter((l) => l.quality_grade.toLowerCase().includes(quality_grade.toLowerCase()));
    }
    if (farmer_id) {
      lots = lots.filter((l) => l.farmer_id === farmer_id);
    }
    return lots;
  },

  async createLot(data: Partial<ProduceLot>): Promise<ProduceLot> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: created, error } = await supabase.from('produce_lots').insert([data]).select().single();
        if (!error && created) {
          inMemoryLots.unshift(created as ProduceLot);
          return created as ProduceLot;
        }
      } catch (err) {
        console.warn('[Supabase API] Failed to create lot in Supabase', err);
      }
    }

    const newLot: ProduceLot = {
      id: Math.floor(100 + Math.random() * 900),
      farmer_id: data.farmer_id || 1,
      farmer_name: data.farmer_name || 'Ramesh Patil (Nashik Kisan Samruddhi FPO)',
      farmer_phone: data.farmer_phone || '9822012345',
      mandi_id: data.mandi_id || 1,
      mandi_name: data.mandi_name || 'Lasalgaon APMC Hub',
      district: data.district || 'Nashik',
      state: 'Maharashtra',
      commodity: data.commodity || 'Onion',
      variety: data.variety || 'Grade A Garwa',
      quantity_quintals: Number(data.quantity_quintals) || 300,
      quality_grade: data.quality_grade || 'Grade A',
      moisture_percent: Number(data.moisture_percent) || 11.2,
      base_price_per_quintal: Number(data.base_price_per_quintal) || 2450,
      expected_delivery_days: Number(data.expected_delivery_days) || 3,
      description: data.description || 'Assay certified harvest batch ready for institutional procurement.',
      status: 'AVAILABLE',
      created_at: new Date().toISOString()
    };
    inMemoryLots.unshift(newLot);

    inMemoryNotifications.unshift({
      id: 'n-' + Date.now(),
      title: 'New Harvest Batch Listed',
      message: `${newLot.commodity} (${newLot.quantity_quintals} Qtl) listed at ₹${newLot.base_price_per_quintal}/qtl. Lot #${newLot.id}`,
      timestamp: 'Just now',
      type: 'RFQ',
      read: false,
      linkTab: 'farmer'
    });

    return newLot;
  },

  // 6. RFQ Bilateral Negotiation
  async getRFQs(): Promise<RFQ[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('rfqs').select('*, messages:rfq_messages(*)').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as RFQ[];
      } catch (err) {
        console.warn('[Supabase API] Failed to fetch RFQs', err);
      }
    }

    return inMemoryRFQs;
  },

  async createRFQ(data: {
    lot_id: number;
    buyer_id: number;
    buyer_name?: string;
    farmer_id?: number;
    farmer_name?: string;
    commodity?: string;
    quantity_quintals?: number;
    initial_offer_price: number;
    delivery_timeline_days: number;
    delivery_address: string;
    first_message?: string;
  }): Promise<RFQ> {
    const lot = inMemoryLots.find(l => l.id === data.lot_id);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: created, error } = await supabase.from('rfqs').insert([{
          lot_id: data.lot_id,
          buyer_id: data.buyer_id,
          buyer_name: data.buyer_name || 'Institutional Buyer',
          buyer_phone: '9821011111',
          farmer_id: data.farmer_id || lot?.farmer_id || 1,
          farmer_name: data.farmer_name || lot?.farmer_name || 'Farmer FPO',
          commodity: data.commodity || lot?.commodity || 'Produce',
          quantity_quintals: data.quantity_quintals || lot?.quantity_quintals || 400,
          initial_offer_price: data.initial_offer_price,
          current_offered_price: data.initial_offer_price,
          delivery_timeline_days: data.delivery_timeline_days,
          delivery_address: data.delivery_address,
          status: 'PENDING'
        }]).select().single();
        if (!error && created) {
          inMemoryRFQs.unshift(created as RFQ);
          return created as RFQ;
        }
      } catch (err) {
        console.warn('[Supabase API] Failed to create RFQ', err);
      }
    }

    const rfqId = Date.now();
    const newRFQ: RFQ = {
      id: rfqId,
      lot_id: data.lot_id,
      buyer_id: data.buyer_id,
      buyer_name: data.buyer_name || 'Sahyadri Agro Processing Ltd (Pravin Joshi)',
      farmer_id: data.farmer_id || lot?.farmer_id || 1,
      farmer_name: data.farmer_name || lot?.farmer_name || 'Ramesh Patil (Nashik FPO)',
      commodity: data.commodity || lot?.commodity || 'Produce',
      quantity_quintals: data.quantity_quintals || lot?.quantity_quintals || 400,
      initial_offer_price: data.initial_offer_price,
      current_offered_price: data.initial_offer_price,
      status: 'PENDING',
      delivery_timeline_days: data.delivery_timeline_days,
      delivery_address: data.delivery_address,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          id: Date.now(),
          rfq_id: rfqId,
          sender_id: data.buyer_id,
          sender_name: data.buyer_name || 'Institutional Buyer',
          sender_role: 'BUYER',
          offered_price: data.initial_offer_price,
          message_text: data.first_message || `Initial procurement offer placed at ₹${data.initial_offer_price}/qtl.`,
          created_at: new Date().toISOString()
        }
      ]
    };

    inMemoryRFQs.unshift(newRFQ);

    inMemoryNotifications.unshift({
      id: 'n-' + Date.now(),
      title: 'New RFQ Offer Placed',
      message: `${newRFQ.buyer_name} offered ₹${newRFQ.initial_offer_price}/qtl on ${newRFQ.commodity}.`,
      timestamp: 'Just now',
      type: 'RFQ',
      read: false,
      linkTab: 'buyer'
    });

    return newRFQ;
  },

  async counterOffer(rfq_id: number, data: {
    sender_id: number;
    sender_name?: string;
    sender_role: string;
    offered_price: number;
    message_text?: string;
  }): Promise<RFQ> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('rfq_messages').insert([
          {
            rfq_id,
            sender_id: data.sender_id,
            sender_name: data.sender_name || (data.sender_role === 'BUYER' ? 'Buyer Desk' : 'Farmer FPO'),
            sender_role: data.sender_role,
            offered_price: data.offered_price,
            message_text: data.message_text || `Counter-offer at ₹${data.offered_price}/qtl.`
          }
        ]);

        const { data: updated, error } = await supabase
          .from('rfqs')
          .update({
            current_offered_price: data.offered_price,
            status: 'COUNTERED',
            last_sender_role: data.sender_role,
            updated_at: new Date().toISOString()
          })
          .eq('id', rfq_id)
          .select('*, messages:rfq_messages(*)')
          .single();

        if (!error && updated) {
          return updated as RFQ;
        }
      } catch (err) {
        console.warn('[Supabase API] Failed to submit counter-offer', err);
      }
    }

    const targetRFQ = inMemoryRFQs.find(r => r.id === rfq_id);
    const newMessage: RFQMessage = {
      id: Date.now(),
      rfq_id,
      sender_id: data.sender_id,
      sender_name: data.sender_name || (data.sender_role === 'BUYER' ? 'Institutional Buyer' : 'Farmer FPO'),
      sender_role: data.sender_role,
      offered_price: data.offered_price,
      message_text: data.message_text || `Counter-offer submitted: ₹${data.offered_price}/qtl.`,
      created_at: new Date().toISOString()
    };

    if (targetRFQ) {
      targetRFQ.current_offered_price = data.offered_price;
      targetRFQ.status = 'COUNTERED';
      targetRFQ.updated_at = new Date().toISOString();
      if (!targetRFQ.messages) targetRFQ.messages = [];
      targetRFQ.messages.push(newMessage);

      inMemoryNotifications.unshift({
        id: 'n-' + Date.now(),
        title: 'Counter-Bid Updated',
        message: `${newMessage.sender_name} updated offer to ₹${data.offered_price}/qtl on ${targetRFQ.commodity}.`,
        timestamp: 'Just now',
        type: 'RFQ',
        read: false,
        linkTab: 'buyer'
      });

      return { ...targetRFQ };
    }

    return {
      id: rfq_id,
      lot_id: 1,
      buyer_id: 8,
      farmer_id: 1,
      commodity: 'Onion',
      quantity_quintals: 400,
      initial_offer_price: 2380,
      current_offered_price: data.offered_price,
      status: 'COUNTERED',
      delivery_timeline_days: 3,
      delivery_address: 'Sahyadri Mega Food Park, Dindori, Nashik',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [newMessage]
    };
  },

  async acceptRFQ(rfq_id: number): Promise<{ success: boolean; contract: Contract; rfq: RFQ }> {
    let rfq = inMemoryRFQs.find(r => r.id === rfq_id);
    if (!rfq && inMemoryRFQs.length > 0) {
      rfq = inMemoryRFQs[0];
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('rfqs').update({ status: 'ACCEPTED' }).eq('id', rfq_id);
      } catch (err) {
        console.warn('[Supabase API] Failed to accept RFQ in Supabase', err);
      }
    }

    const finalPrice = rfq?.current_offered_price || 2420;
    const quantity = rfq?.quantity_quintals || 400;
    const totalAmount = finalPrice * quantity;
    const advanceAmount = Math.round(totalAmount * 0.5);
    const balanceAmount = totalAmount - advanceAmount;
    const contractNumber = `AGC-MH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const contractId = Date.now();
    const newContract: Contract = {
      id: contractId,
      rfq_id: rfq?.id || contractId,
      lot_id: rfq?.lot_id || 819,
      contract_number: contractNumber,
      farmer_id: rfq?.farmer_id || 1,
      farmer_name: rfq?.farmer_name || 'Ramesh Patil (Nashik Kisan Samruddhi FPO)',
      buyer_id: rfq?.buyer_id || 8,
      buyer_name: rfq?.buyer_name || 'Sahyadri Agro Processing Ltd (Pravin Joshi)',
      commodity: rfq?.commodity || 'Onion',
      quantity_quintals: quantity,
      final_price_per_quintal: finalPrice,
      total_amount: totalAmount,
      advance_amount: advanceAmount,
      balance_amount: balanceAmount,
      delivery_address: rfq?.delivery_address || 'APMC Processing Yard, Sector 19, Vashi Navi Mumbai',
      farmer_signed: false,
      buyer_signed: false,
      status: 'PENDING_SIGNATURES',
      contract_terms: `AGROCONNECT DIGITAL AGRICULTURAL CONTRACT\nRef: ${contractNumber}\nCommodity: ${rfq?.commodity || 'Produce'} | Quantity: ${quantity} Quintals\nAgreed Final Rate: ₹${finalPrice}/quintal\nTotal Value: ₹${totalAmount.toLocaleString()}\nEscrow Terms: 50% advance (₹${advanceAmount.toLocaleString()}) upon mutual signing; 50% balance (₹${balanceAmount.toLocaleString()}) upon gate weighment & NABL assay sign-off.\nStatutory Jurisdiction: Maharashtra State APMC Act 1963 & MSAMB Arbitration Panel.`,
      legal_terms: `1. APMC STATUTORY BINDING: This electronic contract is executed under Section 29 of the Maharashtra Agricultural Produce Marketing (Development & Regulation) Act 1963.\n2. ESCROW MILESTONE RELEASE: 50% advance is held strictly in RBI-regulated nodal escrow until transport dispatch confirmation. The remaining 50% balance is released post terminal gate physical moisture verification.\n3. THREE-TIER GRIEVANCE: Any defect exceeding 3% moisture divergence requires Tier 1 48h peer resolution, failing which Mandi Secretary arbitration shall be legally binding.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      escrow: {
        id: Date.now(),
        contract_id: contractId,
        total_amount: totalAmount,
        advance_amount: advanceAmount,
        advance_percent: 50,
        balance_amount: balanceAmount,
        advance_status: 'UNPAID',
        balance_status: 'UNPAID'
      }
    };

    if (rfq) {
      rfq.status = 'ACCEPTED';
      rfq.updated_at = new Date().toISOString();
    }

    // Mark lot as UNDER_CONTRACT
    const lot = inMemoryLots.find(l => l.id === (rfq?.lot_id || 819));
    if (lot) {
      lot.status = 'UNDER_CONTRACT';
    }

    inMemoryContracts.unshift(newContract);

    inMemoryNotifications.unshift({
      id: 'n-' + Date.now(),
      title: 'Digital Contract Generated',
      message: `Contract ${contractNumber} auto-generated for ₹${totalAmount.toLocaleString()}. Escrow awaiting dual signatures.`,
      timestamp: 'Just now',
      type: 'ESCROW',
      read: false,
      linkTab: 'contracts'
    });

    return {
      success: true,
      contract: newContract,
      rfq: rfq || ({} as RFQ)
    };
  },


  // 7. Contracts & Escrow Milestone Management
  async getContracts(): Promise<Contract[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('contracts').select('*, escrow:escrow_payments(*)').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Contract[];
      } catch (err) {
        console.warn('[Supabase API] Error fetching contracts', err);
      }
    }
    return inMemoryContracts;
  },

  async signContract(contract_id: number, data: {
    user_id: number;
    signer_role: string;
    aadhaar_last_four: string;
  }): Promise<Contract> {
    const signHash = 'SIG-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const updates: any = {};
        if (data.signer_role.toUpperCase() === 'FARMER') {
          updates.farmer_signed = true;
          updates.farmer_signed_at = new Date().toISOString();
          updates.farmer_sign_hash = signHash;
        } else {
          updates.buyer_signed = true;
          updates.buyer_signed_at = new Date().toISOString();
          updates.buyer_sign_hash = signHash;
        }
        updates.status = 'SIGNED_ESCROW_AWAITING';

        const { data: updated, error } = await supabase.from('contracts').update(updates).eq('id', contract_id).select('*, escrow:escrow_payments(*)').single();
        if (!error && updated) return updated as Contract;
      } catch (err) {
        console.warn('[Supabase API] Failed to sign contract in Supabase', err);
      }
    }

    inMemoryContracts = inMemoryContracts.map((c) => {
      if (c.id === contract_id) {
        const copy = { ...c };
        if (data.signer_role.toUpperCase() === 'FARMER') {
          copy.farmer_signed = true;
          copy.farmer_signed_at = new Date().toISOString();
          copy.farmer_sign_hash = signHash;
        } else {
          copy.buyer_signed = true;
          copy.buyer_signed_at = new Date().toISOString();
          copy.buyer_sign_hash = signHash;
        }
        if (copy.farmer_signed && copy.buyer_signed) {
          copy.status = 'SIGNED_ESCROW_AWAITING';
        }
        return copy;
      }
      return c;
    });

    return inMemoryContracts.find((c) => c.id === contract_id)!;
  },

  async fundAdvance(contract_id: number): Promise<Contract> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('contracts').update({ status: 'ADVANCE_ESCROW_LOCKED' }).eq('id', contract_id);
        await supabase.from('escrow_payments').update({
          advance_status: 'HELD_IN_ESCROW',
          advance_funded_at: new Date().toISOString(),
          payment_gateway_ref: `RZP_ESCROW_${Date.now()}`
        }).eq('contract_id', contract_id);

        const { data } = await supabase.from('contracts').select('*, escrow:escrow_payments(*)').eq('id', contract_id).single();
        if (data) return data as Contract;
      } catch (err) {
        console.warn('[Supabase API] Failed to fund advance in Supabase', err);
      }
    }

    inMemoryContracts = inMemoryContracts.map((c) => {
      if (c.id === contract_id) {
        return {
          ...c,
          status: 'ADVANCE_ESCROW_LOCKED',
          escrow: c.escrow ? {
            ...c.escrow,
            advance_status: 'HELD_IN_ESCROW',
            advance_funded_at: new Date().toISOString()
          } : undefined
        };
      }
      return c;
    });

    return inMemoryContracts.find((c) => c.id === contract_id)!;
  },

  async dispatchContract(contract_id: number): Promise<Contract> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('contracts').update({ status: 'IN_TRANSIT' }).eq('id', contract_id);
        await supabase.from('escrow_payments').update({
          advance_status: 'RELEASED_TO_FARMER',
          advance_released_at: new Date().toISOString()
        }).eq('contract_id', contract_id);

        const { data } = await supabase.from('contracts').select('*, escrow:escrow_payments(*)').eq('id', contract_id).single();
        if (data) return data as Contract;
      } catch (err) {
        console.warn('[Supabase API] Failed to dispatch contract in Supabase', err);
      }
    }

    inMemoryContracts = inMemoryContracts.map((c) => {
      if (c.id === contract_id) {
        return {
          ...c,
          status: 'IN_TRANSIT',
          escrow: c.escrow ? {
            ...c.escrow,
            advance_status: 'RELEASED_TO_FARMER',
            advance_released_at: new Date().toISOString()
          } : undefined
        };
      }
      return c;
    });

    return inMemoryContracts.find((c) => c.id === contract_id)!;
  },

  async markDelivered(contract_id: number): Promise<Contract> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('contracts').update({ status: 'DELIVERED_PENDING_INSPECTION' }).eq('id', contract_id);
        await supabase.from('escrow_payments').update({ balance_status: 'HELD_IN_ESCROW' }).eq('contract_id', contract_id);

        const { data } = await supabase.from('contracts').select('*, escrow:escrow_payments(*)').eq('id', contract_id).single();
        if (data) return data as Contract;
      } catch (err) {
        console.warn('[Supabase API] Failed to mark delivered in Supabase', err);
      }
    }

    inMemoryContracts = inMemoryContracts.map((c) => {
      if (c.id === contract_id) {
        return {
          ...c,
          status: 'DELIVERED_PENDING_INSPECTION',
          escrow: c.escrow ? { ...c.escrow, balance_status: 'HELD_IN_ESCROW' } : undefined
        };
      }
      return c;
    });

    return inMemoryContracts.find((c) => c.id === contract_id)!;
  },

  async releaseFinalSettlement(contract_id: number): Promise<Contract> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('contracts').update({ status: 'COMPLETED' }).eq('id', contract_id);
        await supabase.from('escrow_payments').update({
          balance_status: 'RELEASED_TO_FARMER',
          final_settled_at: new Date().toISOString()
        }).eq('contract_id', contract_id);

        const { data } = await supabase.from('contracts').select('*, escrow:escrow_payments(*)').eq('id', contract_id).single();
        if (data) return data as Contract;
      } catch (err) {
        console.warn('[Supabase API] Failed to release settlement in Supabase', err);
      }
    }

    inMemoryContracts = inMemoryContracts.map((c) => {
      if (c.id === contract_id) {
        return {
          ...c,
          status: 'COMPLETED',
          escrow: c.escrow ? {
            ...c.escrow,
            balance_status: 'RELEASED_TO_FARMER',
            final_settled_at: new Date().toISOString()
          } : undefined
        };
      }
      return c;
    });

    return inMemoryContracts.find((c) => c.id === contract_id)!;
  },

  // 8. 3-Tier Statutory Dispute Resolution
  async getDisputes(): Promise<Dispute[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('disputes').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Dispute[];
      } catch (err) {
        console.warn('[Supabase API] Failed to fetch disputes from Supabase', err);
      }
    }
    return inMemoryDisputes;
  },

  async fileDispute(data: Partial<Dispute>): Promise<Dispute> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: created, error } = await supabase.from('disputes').insert([data]).select().single();
        if (!error && created) return created as Dispute;
      } catch (err) {
        console.warn('[Supabase API] Failed to file dispute in Supabase', err);
      }
    }

    const newDispute: Dispute = {
      id: Date.now(),
      contract_id: data.contract_id || 1,
      contract_number: data.contract_number || 'AGC-MH-20260910-00109',
      raised_by_id: data.raised_by_id || data.filed_by_id || 8,
      raised_by_name: data.raised_by_name || data.filed_by_name || 'Sahyadri Agro',
      raised_against_id: data.raised_against_id || 1,
      raised_against_name: data.raised_against_name || 'Ramesh Patil',
      filed_by_id: data.filed_by_id || 8,
      filed_by_name: data.filed_by_name || 'Sahyadri Agro',
      filed_by_role: data.filed_by_role || 'BUYER',
      tier: data.tier || 'TIER_1_PEER',
      status: 'UNDER_NEGOTIATION',
      dispute_category: data.dispute_category || 'QUALITY_DEFICIENCY',
      dispute_type: data.dispute_type || 'QUALITY_DEFICIENCY',
      dispute_reason: data.dispute_reason || data.complaint_details || 'Quality divergence recorded upon weighment.',
      complaint_details: data.complaint_details || 'Quality divergence recorded upon weighment.',
      claimed_deduction: data.claimed_deduction || 0,
      agreed_adjustment: data.agreed_adjustment || 0,
      evidence_urls: data.evidence_urls || '',
      created_at: new Date().toISOString()
    };
    inMemoryDisputes.unshift(newDispute);
    return newDispute;
  },

  async resolveDispute(dispute_id: number, data: {
    tier: string;
    status: string;
    agreed_adjustment: number;
    arbiter_ruling: string;
  }): Promise<Dispute> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: updated, error } = await supabase
          .from('disputes')
          .update({
            tier: data.tier,
            status: data.status,
            agreed_adjustment: data.agreed_adjustment,
            arbiter_ruling: data.arbiter_ruling,
            resolved_at: new Date().toISOString()
          })
          .eq('id', dispute_id)
          .select()
          .single();

        if (!error && updated) return updated as Dispute;
      } catch (err) {
        console.warn('[Supabase API] Failed to resolve dispute in Supabase', err);
      }
    }

    inMemoryDisputes = inMemoryDisputes.map((d) => {
      if (d.id === dispute_id) {
        return {
          ...d,
          tier: data.tier as any,
          status: data.status as any,
          agreed_adjustment: data.agreed_adjustment,
          arbiter_ruling: data.arbiter_ruling,
          resolved_at: new Date().toISOString()
        };
      }
      return d;
    });

    return inMemoryDisputes.find((d) => d.id === dispute_id)!;
  },

  async escalateDispute(dispute_id: number, targetTier: string, notes?: string): Promise<Dispute> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: updated, error } = await supabase
          .from('disputes')
          .update({
            tier: targetTier,
            status: 'ESCALATED',
            arbiter_ruling: notes || undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', dispute_id)
          .select()
          .single();
        if (!error && updated) return updated as Dispute;
      } catch (err) {
        console.warn('[Supabase API] Failed to escalate dispute in Supabase', err);
      }
    }

    inMemoryDisputes = inMemoryDisputes.map(d => {
      if (d.id === dispute_id) {
        return {
          ...d,
          tier: targetTier as any,
          status: 'ESCALATED',
          arbiter_ruling: notes || d.arbiter_ruling
        };
      }
      return d;
    });

    inMemoryNotifications.unshift({
      id: 'n-' + Date.now(),
      title: 'Dispute Escalated',
      message: `Grievance Ticket #${dispute_id} escalated to ${targetTier.replace(/_/g, ' ')}.`,
      timestamp: 'Just now',
      type: 'DISPUTE',
      read: false,
      linkTab: 'disputes'
    });

    return inMemoryDisputes.find(d => d.id === dispute_id)!;
  },

  // 9. Agri-Notifications Feed
  async getNotifications(): Promise<AgriNotification[]> {
    return inMemoryNotifications;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    inMemoryNotifications = inMemoryNotifications.map(n => n.id === id ? { ...n, read: true } : n);
  },

  async addNotification(notif: AgriNotification): Promise<void> {
    inMemoryNotifications.unshift(notif);
  }
};


/**
 * AgroConnect - High-Fidelity Maharashtra APMC Curated Datasets
 * Smart India Hackathon 2026 - Problem Statement ID: 26132
 * 
 * Provides fallback data for zero-network / offline / Supabase timeout scenarios.
 * Fully aligned with Maharashtra APMC Act 1963 & CACP MSP 2025-26 benchmarks.
 */

import type {
  ProduceLot,
  CommodityPrice,
  BuyerDemand,
  BuyerReliabilityScorecard,
  RFQ,
  Contract,
  Dispute,
  AgriNotification,
  User
} from '../types';

export const INITIAL_CURATED_PRICES: CommodityPrice[] = [
  {
    id: 1,
    mandi_id: 101,
    mandi_name: 'Lasalgaon APMC (Nashik)',
    commodity: 'Onion',
    variety: 'Garwa / Late Kharif Red',
    min_price: 2150,
    max_price: 2650,
    modal_price: 2480,
    msp_price: 2200,
    arrivals_tonnes: 1420.5,
    change_24h: 3.2,
    price_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 2,
    mandi_id: 102,
    mandi_name: 'Latur APMC',
    commodity: 'Soybean',
    variety: 'Yellow Standard (JS-335)',
    min_price: 4950,
    max_price: 5320,
    modal_price: 5180,
    msp_price: 4892,
    arrivals_tonnes: 880.0,
    change_24h: 1.8,
    price_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 3,
    mandi_id: 103,
    mandi_name: 'Akola APMC',
    commodity: 'Cotton',
    variety: 'BT-Hybrid Long Staple (28mm+)',
    min_price: 7200,
    max_price: 7650,
    modal_price: 7450,
    msp_price: 7121,
    arrivals_tonnes: 540.0,
    change_24h: -0.6,
    price_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 4,
    mandi_id: 104,
    mandi_name: 'Pune APMC (Gultekdi)',
    commodity: 'Wheat',
    variety: 'Lokwan / Sharbati MP Grade',
    min_price: 2500,
    max_price: 2780,
    modal_price: 2640,
    msp_price: 2425,
    arrivals_tonnes: 620.0,
    change_24h: 0.9,
    price_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 5,
    mandi_id: 105,
    mandi_name: 'Nanded APMC',
    commodity: 'Tur (Arhar)',
    variety: 'Marathwada BDN-711 White',
    min_price: 7900,
    max_price: 8450,
    modal_price: 8250,
    msp_price: 7550,
    arrivals_tonnes: 310.0,
    change_24h: 2.4,
    price_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 6,
    mandi_id: 106,
    mandi_name: 'Jalgaon APMC',
    commodity: 'Banana',
    variety: 'Grand Naine (G9)',
    min_price: 1650,
    max_price: 2100,
    modal_price: 1890,
    msp_price: 1550,
    arrivals_tonnes: 980.0,
    change_24h: 4.1,
    price_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 7,
    mandi_id: 107,
    mandi_name: 'Hingoli APMC',
    commodity: 'Turmeric',
    variety: 'Selam / Rajapuri Finger',
    min_price: 12500,
    max_price: 14800,
    modal_price: 13950,
    msp_price: 11000,
    arrivals_tonnes: 195.0,
    change_24h: 5.6,
    price_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 8,
    mandi_id: 108,
    mandi_name: 'Amravati APMC',
    commodity: 'Gram (Chana)',
    variety: 'Vijay Desi Bold',
    min_price: 5400,
    max_price: 5850,
    modal_price: 5680,
    msp_price: 5650,
    arrivals_tonnes: 430.0,
    change_24h: 0.2,
    price_date: new Date().toISOString().split('T')[0]
  }
];

export const INITIAL_CURATED_LOTS: ProduceLot[] = [
  {
    id: 201,
    farmer_id: 1,
    farmer_name: 'Sanjay Vitthal Patil',
    farmer_phone: '+91 98224 81920',
    mandi_id: 102,
    mandi_name: 'Latur APMC',
    district: 'Latur',
    state: 'Maharashtra',
    commodity: 'Soybean',
    variety: 'JS-335 (Certified Non-GMO)',
    quantity_quintals: 180,
    quality_grade: 'Grade A',
    moisture_percent: 10.4,
    base_price_per_quintal: 5150,
    expected_delivery_days: 3,
    description: 'Fresh harvest cleaned on farm sieves. Moisture verified 10.4%. Ready for dispatch at Latur APMC Yard.',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 202,
    farmer_id: 2,
    farmer_name: 'Rameshwar Eknath Bodke',
    farmer_phone: '+91 94231 77442',
    mandi_id: 101,
    mandi_name: 'Lasalgaon APMC',
    district: 'Nashik',
    state: 'Maharashtra',
    commodity: 'Onion',
    variety: 'Garwa Late Kharif Red (50mm+)',
    quantity_quintals: 250,
    quality_grade: 'Grade A',
    moisture_percent: 11.2,
    base_price_per_quintal: 2480,
    expected_delivery_days: 2,
    description: 'Uniform size bulbs, well cured with paper skin. WDRA cold store verified lot in Niphad corridor.',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 203,
    farmer_id: 3,
    farmer_name: 'Pandurang Tukaram Deshmukh',
    farmer_phone: '+91 98902 44119',
    mandi_id: 103,
    mandi_name: 'Akola APMC',
    district: 'Akola',
    state: 'Maharashtra',
    commodity: 'Cotton',
    variety: 'BT-Hybrid II Long Staple (29mm)',
    quantity_quintals: 140,
    quality_grade: 'Grade A',
    moisture_percent: 8.2,
    base_price_per_quintal: 7450,
    expected_delivery_days: 4,
    description: 'First-pick cotton with high ginning turnout (34.5%). Low trash <2%. Stored in dry shed.',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600000 * 14).toISOString()
  },
  {
    id: 204,
    farmer_id: 4,
    farmer_name: 'Ashok Babanrao Kadam',
    farmer_phone: '+91 98229 65531',
    mandi_id: 104,
    mandi_name: 'Pune APMC (Gultekdi)',
    district: 'Pune',
    state: 'Maharashtra',
    commodity: 'Wheat',
    variety: 'Lokwan Sharbati Golden',
    quantity_quintals: 320,
    quality_grade: 'Grade A',
    moisture_percent: 9.6,
    base_price_per_quintal: 2620,
    expected_delivery_days: 2,
    description: 'Lustrous bold amber grains. Ideal for premium atta milling. Baramati Agro Hub pickup available.',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    id: 205,
    farmer_id: 5,
    farmer_name: 'Balasaheb Ramrao Shinde',
    farmer_phone: '+91 94033 11894',
    mandi_id: 105,
    mandi_name: 'Nanded APMC',
    district: 'Nanded',
    state: 'Maharashtra',
    commodity: 'Tur (Arhar)',
    variety: 'BDN-711 Marathwada Bold',
    quantity_quintals: 150,
    quality_grade: 'Grade A',
    moisture_percent: 10.0,
    base_price_per_quintal: 8200,
    expected_delivery_days: 3,
    description: 'Cleaned, graded pigeon pea. Zero weevil infestation. Ready for dal mill processing.',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString()
  }
];

const makeScorecard = (buyerId: number, companyName: string, companyType: any, commodity: string, benchmarkPrice: number): BuyerReliabilityScorecard => ({
  buyer_id: buyerId,
  company_name: companyName,
  company_type: companyType,
  msamb_license_number: `MH-APMC-TR-2024-${Math.floor(1000 + Math.random() * 9000)}`,
  license_validity: 'March 2028 (Active / Verified)',
  overall_reliability_score: 99.2,
  credit_tier: 'AAA_PLATINUM',
  escrow_on_time_rate: 99.2,
  avg_payment_release_hours: 4.2,
  total_deals_completed: 48,
  total_volume_cleared_quintals: 42500,
  total_escrow_disbursed_lakhs: 216.5,
  unresolved_disputes_count: 0,
  dispute_resolution_rate_pct: 100.0,
  default_rate_pct: 0.0,
  bank_nodal_partner: 'State Bank of India (MSAMB Dedicated Agri-Escrow Node)',
  apmc_verified_depots: ['Nagpur', 'Pune', 'Nashik', 'Akola', 'Vashi'],
  audited_year: 'FY 2025-26',
  monthly_target_quintals: 5000,
  monthly_procured_quintals: 3450,
  target_commodity: commodity,
  apmc_benchmark_price_per_qtl: benchmarkPrice
});

export const INITIAL_CURATED_DEMANDS: BuyerDemand[] = [
  {
    id: 301,
    buyer_id: 101,
    buyer_name: 'Rajeev Singhania (Procurement VP)',
    company_name: 'ADM Agro Industries India Pvt Ltd',
    company_type: 'FOOD_PROCESSOR',
    commodity: 'Soybean',
    variety: 'Grade A Non-GMO',
    required_quantity_quintals: 2500,
    fulfilled_quantity_quintals: 450,
    target_price_per_quintal: 5140,
    quality_grade_required: 'Grade A',
    max_moisture_percent: 10.0,
    delivery_hub: 'Nagpur Processing Cluster Hub',
    delivery_deadline: 'Within 10 Days',
    delivery_deadline_days: 10,
    escrow_prefunded: true,
    status: 'OPEN',
    notes: 'Pre-funded institutional demand for solvent extraction plant. MSAMB Escrow auto-release upon weighbridge verification.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    credibility_scorecard: makeScorecard(101, 'ADM Agro Industries India Pvt Ltd', 'FOOD_PROCESSOR', 'Soybean', 5140)
  },
  {
    id: 302,
    buyer_id: 102,
    buyer_name: 'Anita Deshmukh (Agri Sourcing Head)',
    company_name: 'ITC Agri Business Division',
    company_type: 'EXPORTER',
    commodity: 'Onion',
    variety: 'Nashik Garwa Red (50mm+)',
    required_quantity_quintals: 1800,
    fulfilled_quantity_quintals: 600,
    target_price_per_quintal: 2450,
    quality_grade_required: 'Grade A',
    max_moisture_percent: 11.5,
    delivery_hub: 'Nashik Cold Chain Hub (Niphad)',
    delivery_deadline: 'Within 7 Days',
    delivery_deadline_days: 7,
    escrow_prefunded: true,
    status: 'OPEN',
    notes: 'Export consignment to Middle East. Strict grading with zero sprouting tolerance.',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    credibility_scorecard: makeScorecard(102, 'ITC Agri Business Division', 'EXPORTER', 'Onion', 2450)
  },
  {
    id: 303,
    buyer_id: 103,
    buyer_name: 'Vikas Agarwal (Supply Chain GM)',
    company_name: 'Vardhman Textiles Ltd',
    company_type: 'FOOD_PROCESSOR',
    commodity: 'Cotton',
    variety: 'BT-Long Staple (28mm+)',
    required_quantity_quintals: 1200,
    fulfilled_quantity_quintals: 300,
    target_price_per_quintal: 7420,
    quality_grade_required: 'Grade A',
    max_moisture_percent: 8.5,
    delivery_hub: 'Akola Cotton Mega Hub',
    delivery_deadline: 'Within 14 Days',
    delivery_deadline_days: 14,
    escrow_prefunded: true,
    status: 'OPEN',
    notes: 'Direct mill procurement with instant gate weighbridge digital settlement.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    credibility_scorecard: makeScorecard(103, 'Vardhman Textiles Ltd', 'FOOD_PROCESSOR', 'Cotton', 7420)
  },
  {
    id: 304,
    buyer_id: 104,
    buyer_name: 'Kailash Mehra (Commodity Head)',
    company_name: 'Tata Consumer Products (Sampann)',
    company_type: 'RETAIL_CHAIN',
    commodity: 'Tur (Arhar)',
    variety: 'Unpolished Whole Bold',
    required_quantity_quintals: 1500,
    fulfilled_quantity_quintals: 200,
    target_price_per_quintal: 8250,
    quality_grade_required: 'Grade A',
    max_moisture_percent: 10.0,
    delivery_hub: 'Latur APMC Yard',
    delivery_deadline: 'Within 12 Days',
    delivery_deadline_days: 12,
    escrow_prefunded: true,
    status: 'OPEN',
    notes: 'Premium unpolished dal processing order. MSP plus quality premium model.',
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    credibility_scorecard: makeScorecard(104, 'Tata Consumer Products (Sampann)', 'RETAIL_CHAIN', 'Tur (Arhar)', 8250)
  }
];

export const INITIAL_CURATED_RFQS: RFQ[] = [
  {
    id: 401,
    lot_id: 201,
    buyer_id: 101,
    buyer_name: 'ADM Agro Industries India',
    farmer_id: 1,
    farmer_name: 'Sanjay Vitthal Patil',
    commodity: 'Soybean',
    quantity_quintals: 180,
    initial_offer_price: 5100,
    current_offered_price: 5150,
    delivery_timeline_days: 3,
    delivery_address: 'ADM Nagpur Crushing Plant, MIDC Butibori',
    status: 'COUNTERED',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: 1,
        rfq_id: 401,
        sender_id: 101,
        sender_name: 'ADM Agro Industries India',
        sender_role: 'BUYER',
        offered_price: 5100,
        message_text: 'We can lift the entire 180 qtl lot at ₹5,100 with immediate escrow advance.',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 2,
        rfq_id: 401,
        sender_id: 1,
        sender_name: 'Sanjay Vitthal Patil',
        sender_role: 'FARMER',
        offered_price: 5150,
        message_text: 'Moisture is below 10.5% and purity is 98.2%. Minimum acceptable is ₹5,150/qtl.',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString()
      },
      {
        id: 3,
        rfq_id: 401,
        sender_id: 101,
        sender_name: 'ADM Agro Industries India',
        sender_role: 'BUYER',
        offered_price: 5150,
        message_text: 'Agreed at ₹5,150. Generating statutory digital APMC contract.',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  }
];

export const INITIAL_CURATED_CONTRACTS: Contract[] = [
  {
    id: 501,
    contract_number: 'AGC-MH-2026-0891',
    rfq_id: 401,
    lot_id: 201,
    buyer_id: 101,
    buyer_name: 'ADM Agro Industries India Pvt Ltd',
    farmer_id: 1,
    farmer_name: 'Sanjay Vitthal Patil',
    commodity: 'Soybean',
    quantity_quintals: 180,
    final_price_per_quintal: 5150,
    total_amount: 927000,
    advance_amount: 185400,
    balance_amount: 741600,
    status: 'ESCROW_FUNDED',
    farmer_signed: true,
    farmer_signed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    farmer_sign_hash: 'SIG-FARM-9982A',
    buyer_signed: true,
    buyer_signed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    buyer_sign_hash: 'SIG-BUYR-4412B',
    delivery_address: 'ADM Nagpur Crushing Plant, MIDC Butibori, Nagpur',
    legal_terms: 'Execution under Maharashtra APMC Act 1963 Section 32A. Advance 20% held in MSAMB Escrow.',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    escrow: {
      id: 601,
      contract_id: 501,
      total_amount: 927000,
      advance_amount: 185400,
      advance_percent: 20,
      advance_status: 'HELD_IN_ESCROW',
      balance_amount: 741600,
      balance_status: 'UNPAID',
      payment_gateway_ref: 'RZP_MSAMB_ESCROW_NODE_7718'
    }
  }
];

export const INITIAL_CURATED_DISPUTES: Dispute[] = [
  {
    id: 701,
    contract_id: 501,
    filed_by_id: 101,
    filed_by_name: 'ADM Agro Industries India',
    filed_by_role: 'BUYER',
    dispute_type: 'MOISTURE_REFRACTION',
    tier: 'TIER_1_PEER',
    status: 'UNDER_NEGOTIATION',
    complaint_details: 'Weighbridge refraction test showed 11.2% moisture vs contract specification of 10.4%. Requesting statutory APMC schedule 0.8% price adjustment.',
    claimed_deduction: 7416,
    agreed_adjustment: 0,
    evidence_urls: '',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

export const INITIAL_CURATED_NOTIFICATIONS: AgriNotification[] = [
  {
    id: 'notif-1',
    title: 'MSAMB Escrow Advance Secured',
    message: '20% advance (₹1,85,400) for Contract AGC-MH-2026-0891 is locked in escrow.',
    timestamp: '10 mins ago',
    type: 'ESCROW',
    read: false,
    linkTab: 'escrow'
  },
  {
    id: 'notif-2',
    title: 'High Modal Price Alert - Latur APMC',
    message: 'Soybean modal price jumped by ₹90/qtl to ₹5,180/qtl today.',
    timestamp: '45 mins ago',
    type: 'PRICE',
    read: false,
    linkTab: 'prices'
  },
  {
    id: 'notif-3',
    title: 'Bilateral Counter Offer Received',
    message: 'ADM Agro accepted your Soybean lot price at ₹5,150/quintal.',
    timestamp: '2 hours ago',
    type: 'RFQ',
    read: true,
    linkTab: 'farmer'
  }
];

export const INITIAL_CURATED_USERS: User[] = [
  {
    id: 1,
    name: 'Sanjay Vitthal Patil',
    phone: '+91 98224 81920',
    email: 'sanjay.patil@agroconnect.farm',
    role: 'FARMER',
    district: 'Latur',
    state: 'Maharashtra',
    kyc_verified: true,
    rating: 4.9,
    created_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 101,
    name: 'Rajeev Singhania',
    phone: '+91 22 6677 8899',
    email: 'procurement@admagro.com',
    role: 'BUYER',
    district: 'Nagpur',
    state: 'Maharashtra',
    kyc_verified: true,
    rating: 4.8,
    created_at: '2026-01-10T09:30:00Z'
  }
];

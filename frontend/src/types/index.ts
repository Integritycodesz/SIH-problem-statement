/**
 * AgroConnect - Centralized TypeScript Type Definitions
 * Smart India Hackathon 2026 - Problem Statement ID: 26132
 * Powered exclusively by Supabase (PostgreSQL 15+)
 */

export type UserRole = 'FARMER' | 'BUYER' | 'OFFICIAL' | 'FPO';

export interface User {
  id: number;
  auth_user_id?: string;
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

export interface AuthSignUpData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  district: string;
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

export interface GovMandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
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
  rfq_id?: number | null;
  lot_id?: number | null;
  demand_id?: number | null;
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
  refraction_schedule?: RefractionSchedule;
  refraction_result?: RefractionCalculationResult;
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

export interface CACPMSPRecord {
  commodity: string;
  variety?: string;
  category: 'Kharif' | 'Rabi' | 'Commercial' | 'Horticulture (MIS)';
  msp_price: number;
  cost_a2_fl: number;
  margin_percent: number;
  crop_year: string;
  statutory_body: string;
  season: string;
  bonus?: number;
  is_statutory: boolean;
  notes?: string;
}

// ==========================================
// STORAGE & POST-HARVEST PRESERVATION
// ==========================================

export interface StorageFacility {
  id: number;
  name: string;
  facility_type: 'COLD_STORAGE' | 'WDRA_GODOWN' | 'APMC_WAREHOUSE' | 'CA_STORE';
  district: string;
  taluka?: string;
  address: string;
  lat?: number;
  lng?: number;
  total_capacity_mt: number;
  available_capacity_mt: number;
  daily_rent_per_quintal: number;
  temperature_celsius?: number;
  humidity_percent?: number;
  is_wdra_accredited: boolean;
  enwr_pledge_eligible: boolean;
  contact_person?: string;
  contact_phone?: string;
  created_at?: string;
}

export interface StorageBooking {
  id: string;
  facility_id: number;
  facility_name: string;
  facility_type: 'COLD_STORAGE' | 'WDRA_GODOWN' | 'APMC_WAREHOUSE' | 'CA_STORE';
  farmer_id?: number;
  farmer_name: string;
  farmer_phone: string;
  commodity: string;
  quantity_quintals: number;
  duration_days: number;
  inward_date: string;
  daily_tariff: number;
  total_rent: number;
  handling_fee: number;
  total_amount: number;
  status: 'CONFIRMED' | 'INWARD_SCHEDULED' | 'OCCUPIED' | 'DISPATCHED';
  qr_code?: string;
  need_transport?: boolean;
  created_at: string;
}

export interface QualityAssay {
  id: number;
  certificate_id: string;
  lot_id?: number | null;
  farmer_id?: number | null;
  commodity: string;
  variety?: string;
  overall_grade: string;
  moisture_percent: number;
  color_uniformity_score: number;
  defect_percentage: number;
  purity_index: number;
  sample_image_url?: string;
  assayed_at: string;
}

export interface CACPMSPBenchmark {
  id: number;
  commodity: string;
  variety?: string;
  crop_year: string;
  season: string;
  msp_price: number;
  cost_a2_fl?: number;
  return_over_cost_pct?: number;
  statutory_body?: string;
  effective_date?: string;
}

// ==========================================
// AI BUYER MATCHMAKING ENGINE
// ==========================================

export interface BuyerMatch {
  buyer_id: number;
  buyer_name: string;
  company_name: string;
  district: string;
  state: string;
  hub_name: string;
  distance_km: number;
  rating: number;
  kyc_verified: boolean;
  escrow_verified: boolean;
  msamb_license?: string;
  standing_bid_price: number;
  price_difference: number; // positive = premium above asking
  commodity_preference: string;
  variety_preference?: string;
  moisture_spec_max: number;
  min_grade: string;
  match_score: number; // 0 - 100%
  match_reasons: string[];
  contact_phone?: string;
  prompt_pitch_text?: string;
}

// ==========================================
// LOGISTICS COORDINATION & GATE PASS
// ==========================================

export type LogisticsStatus = 
  | 'BOOKED' 
  | 'DISPATCHED_FARMGATE' 
  | 'WEIGHBRIDGE_SCANNED' 
  | 'APMC_WEIGHBRIDGE_SCANNED'
  | 'DELIVERED_UNLOADED'
  | 'DELIVERED_ACCEPTED';

export interface LogisticsBooking {
  id: number;
  contract_id?: number | null;
  contract_number?: string | null;
  lot_id?: number | null;
  gate_pass_code: string;
  transporter_name: string;
  transporter_contact?: string | null;
  vehicle_number: string;
  vehicle_type: string;
  driver_name: string;
  driver_phone: string;
  driver_license?: string | null;
  pickup_location: string;
  delivery_location: string;
  distance_km: number;
  estimated_transit_hours: number;
  freight_charge: number;
  gross_weight_quintals?: number | null;
  tare_weight_quintals?: number | null;
  net_weight_quintals: number;
  status: LogisticsStatus;
  dispatched_at?: string | null;
  weighbridge_scanned_at?: string | null;
  delivered_at?: string | null;
  security_hash: string;
  qr_payload_json?: string | null;
  created_at: string;
  farmer_name?: string | null;
  buyer_name?: string | null;
  commodity?: string | null;
}


// ==========================================
// OPTION 1: FPO BATCH POOLING & AGGREGATION
// ==========================================

export interface FPOBatchMember {
  farmer_id: number;
  farmer_name: string;
  farmer_phone: string;
  district: string;
  quantity_quintals: number;
  lot_id?: number;
  grade: string;
  payout_share_percent: number;
  joined_at: string;
}

export interface FPOPooledBatch {
  id: number;
  fpo_name: string;
  fpo_registration_number: string;
  fpo_contact_person: string;
  fpo_contact_phone: string;
  district: string;
  state: string;
  central_hub_location: string;
  commodity: string;
  variety: string;
  quality_grade: string;
  target_volume_quintals: number;
  collected_volume_quintals: number;
  unit_base_price: number;
  status: 'OPEN_FOR_CONTRIBUTIONS' | 'READY_FOR_INSTITUTIONAL_RFQ' | 'UNDER_CONTRACT' | 'DISPATCHED';
  members: FPOBatchMember[];
  created_at: string;
  expected_fulfillment_date: string;
  description: string;
  fpo_certified: boolean;
  assay_certificate_id?: string;
}

// ==========================================
// OPTION 2: KISAN VISION AI QUALITY ASSAY
// ==========================================

export interface AIQualityAssayMetric {
  name: string;
  measured_value: string | number;
  benchmark_range: string;
  status: 'OPTIMAL' | 'PASS' | 'DEFICIENT';
}

export interface AIQualityAssayResult {
  assay_id: string;
  timestamp: string;
  commodity: string;
  sample_name: string;
  predicted_grade: 'Grade A (Export / Modern Retail)' | 'Grade B (Domestic APMC Grade)' | 'Grade C (Industrial / Processing)' | string;
  grade_code: 'A+' | 'A' | 'B' | 'C';
  confidence_score: number; // 0 - 100%
  average_diameter_mm: number;
  uniformity_score: number; // 0 - 100%
  blemish_percentage: number;
  estimated_moisture_percent: number;
  foreign_matter_percent?: number;
  broken_grain_percent?: number;
  apmc_grade_classification?: 'FAQ_GRADE_I' | 'FAQ_GRADE_II' | 'NON_FAQ_SUBSTANDARD';
  sprouting_or_damage_detected: boolean;
  color_pigmentation_score: number; // 0 - 100%
  codex_standards_compliant: boolean;
  suggested_price_multiplier: number; // e.g. 1.08
  metrics: AIQualityAssayMetric[];
  detected_count: number;
  recommendations: string[];
  image_url?: string;
}


// ==========================================
// INSTITUTIONAL BUYER DEMAND & CREDIBILITY
// ==========================================

export interface BuyerReliabilityScorecard {
  buyer_id: number;
  company_name: string;
  company_type: 'OIL_MILL' | 'FOOD_PROCESSOR' | 'EXPORTER' | 'RETAIL_CHAIN' | 'GINNING_MILL' | 'AGRI_CONGLOMERATE';
  msamb_license_number: string;
  license_validity: string;
  overall_reliability_score: number; // e.g. 99.2
  credit_tier: 'AAA_PLATINUM' | 'AA_GOLD' | 'A_VERIFIED';
  escrow_on_time_rate: number; // 99.2%
  avg_payment_release_hours: number; // 4.2 hours
  total_deals_completed: number;
  total_volume_cleared_quintals: number;
  total_escrow_disbursed_lakhs: number;
  unresolved_disputes_count: number; // 0
  dispute_resolution_rate_pct: number; // 100.0%
  default_rate_pct: number; // 0.0%
  bank_nodal_partner: string;
  apmc_verified_depots: string[];
  audited_year: string;
  monthly_target_quintals?: number;
  monthly_procured_quintals?: number;
  target_commodity?: string;
  apmc_benchmark_price_per_qtl?: number;
}

export interface CorporateProcurementKPIs {
  target_quintals: number;
  procured_quintals: number;
  fulfillment_pct: number;
  wap_achieved_per_qtl: number;
  apmc_benchmark_per_qtl: number;
  savings_per_qtl: number;
  total_net_savings_lakhs: number;
  target_commodity: string;
  active_contracts_count: number;
  monthly_target_quintals?: number;
  monthly_procured_quintals?: number;
  target_fulfillment_percent?: number;
  weighted_average_price_inr?: number;
  apmc_benchmark_modal_price_inr?: number;
  direct_procurement_savings_per_qtl?: number;
  total_cost_savings_inr?: number;
  total_cost_savings_lakhs?: number;
  active_tenders_count?: number;
  refraction_deductions_saved_inr?: number;
}

export interface BuyerDemand {
  id: number;
  buyer_id: number;
  buyer_name: string;
  company_name: string;
  company_type: 'OIL_MILL' | 'FOOD_PROCESSOR' | 'EXPORTER' | 'RETAIL_CHAIN' | 'GINNING_MILL' | 'AGRI_CONGLOMERATE';
  commodity: string;
  variety: string;
  required_quantity_quintals: number;
  fulfilled_quantity_quintals: number;
  target_price_per_quintal: number;
  quality_grade_required: string;
  max_moisture_percent: number;
  delivery_hub: string;
  delivery_deadline: string;
  delivery_deadline_days: number;
  escrow_prefunded: boolean;
  status: 'OPEN' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'EXPIRED';
  credibility_scorecard: BuyerReliabilityScorecard;
  notes?: string;
  created_at: string;
  refraction_schedule?: RefractionSchedule;
}

// ==========================================
// STATUTORY QUALITY REFRACTION & DEDUCTION MATRIX
// ==========================================

export interface RefractionSchedule {
  commodity: string;
  base_moisture_pct: number;
  permissible_moisture_pct: number;
  moisture_penalty_rate_pct: number;
  max_tolerable_moisture_pct: number;
  permissible_foreign_matter_pct: number;
  foreign_matter_penalty_mode: 'NET_WEIGHT_DEDUCTION' | 'PRICE_PERCENT_DEDUCTION';
  permissible_damaged_grains_pct: number;
  damaged_penalty_rate_pct: number;
  statutory_rule_ref: string;
}

export interface RefractionInputParams {
  gross_weight_quintals: number;
  base_price_per_quintal: number;
  tested_moisture_pct: number;
  tested_foreign_matter_pct: number;
  tested_damaged_pct: number;
}

export interface RefractionCalculationResult {
  schedule: RefractionSchedule;
  params: RefractionInputParams;
  gross_weight_quintals: number;
  foreign_matter_excess_pct: number;
  foreign_matter_deduction_quintals: number;
  net_weight_quintals: number;
  base_price_per_quintal: number;
  moisture_excess_pct: number;
  moisture_penalty_rate_applied_pct: number;
  moisture_deduction_per_quintal: number;
  damaged_excess_pct: number;
  damaged_penalty_rate_applied_pct: number;
  damaged_deduction_per_quintal: number;
  total_price_deduction_per_quintal: number;
  net_price_per_quintal: number;
  gross_total_amount: number;
  net_total_amount: number;
  total_refraction_discount_amount: number;
  effective_deduction_pct: number;
  acceptance_status: 'FULL_ACCEPTANCE' | 'STANDARD_REFRACTION_APPLIED' | 'HIGH_REFRACTION_WARNING' | 'REJECTION_RISK';
  status_label_en: string;
  status_label_mr: string;
}

// ==========================================
// PHASE 3: MULTI-LOT CONSIGNMENT & TRUCKLOAD OPTIMIZER
// ==========================================

export type CommercialTruckType = 'MINI_TRUCK' | 'MEDIUM_COMMERCIAL' | 'MULTI_AXLE_HEAVY' | 'TRAILER_RIG';

export interface VehicleOption {
  type: CommercialTruckType;
  name_en: string;
  name_mr: string;
  wheels: string;
  capacity_quintals: number;
  capacity_tonnes: number;
  base_rate_per_km: number;
  min_distance_km: number;
  diesel_efficiency_kmpl: number;
  carrier_partner: string;
  driver_contact?: string;
  vehicle_badge: string;
}

export interface PooledLotItem {
  id: string | number;
  farmer_id: number;
  farmer_name: string;
  farmer_phone: string;
  village: string;
  district: string;
  commodity: string;
  variety: string;
  quantity_quintals: number;
  pickup_order: number;
  pickup_status: 'QUEUED' | 'LOADED' | 'DISPATCHED';
  freight_share_inr: number;
  individual_freight_inr: number;
  freight_savings_inr: number;
}

export interface ConsignmentPool {
  id: string;
  pool_code: string;
  demand_id?: number;
  destination_hub: string;
  destination_mill: string;
  commodity: string;
  vehicle: VehicleOption;
  carrier_name: string;
  vehicle_number: string;
  driver_name: string;
  driver_phone: string;
  total_capacity_quintals: number;
  loaded_quantity_quintals: number;
  utilization_percent: number;
  total_distance_km: number;
  total_freight_cost_inr: number;
  pooled_cost_per_quintal: number;
  individual_cost_per_quintal: number;
  total_savings_inr: number;
  status: 'OPEN_FOR_POOLING' | 'OPTIMAL_FULL' | 'DISPATCH_READY' | 'IN_TRANSIT' | 'ARRIVED_MILL_GATE';
  lots: PooledLotItem[];
  created_at: string;
  dispatch_eta: string;
  security_seal_number?: string;
}

// ==========================================
// PHASE 4: DIGITAL GATE PASS & MILL WEIGHBRIDGE
// ==========================================

export type GatePassStatus = 
  | 'GENERATED' 
  | 'AT_MILL_GATE' 
  | 'GROSS_WEIGHED' 
  | 'QUALITY_ASSAYED' 
  | 'TARE_WEIGHED' 
  | 'PAYMENT_TRIGGERED' 
  | 'COMPLETED';

export interface DigitalGatePass {
  id: string;
  pass_number: string;
  contract_id: number;
  contract_number: string;
  truck_number: string;
  driver_name: string;
  driver_phone: string;
  carrier_name: string;
  commodity: string;
  variety: string;
  farmer_id: number;
  farmer_name: string;
  farmer_phone: string;
  buyer_id: number;
  buyer_name: string;
  destination_mill: string;
  destination_district: string;
  estimated_quantity_quintals: number;
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_produce_kg: number;
  net_produce_quintals: number;
  tested_moisture_pct: number;
  tested_foreign_matter_pct: number;
  tested_damaged_pct: number;
  base_price_per_quintal: number;
  refraction_deduction_amount: number;
  net_payable_amount: number;
  escrow_advance_deducted: number;
  final_settlement_released: number;
  gate_in_time?: string;
  gross_weigh_time?: string;
  quality_test_time?: string;
  tare_weigh_time?: string;
  gate_out_time?: string;
  status: GatePassStatus;
  qr_code_token: string;
  security_hash: string;
  weighbridge_operator: string;
  weighbridge_terminal_id: string;
}

// ==========================================
// PHASE 5: PRE-HARVEST FORWARD CONTRACTS
// ==========================================

export type ForwardContractStatus = 'OPEN_FOR_BOOKING' | 'PARTIALLY_BOOKED' | 'FULLY_COMMITTED' | 'HARVEST_ACTIVE' | 'SETTLED';

export interface ForwardContractOffer {
  id: string;
  offer_code: string;
  buyer_id: number;
  buyer_name: string;
  company_name: string;
  commodity: string;
  variety: string;
  season: 'KHARIF_2026' | 'RABI_2026_27';
  target_volume_quintals: number;
  committed_volume_quintals: number;
  pre_harvest_contract_price: number;
  cacp_msp_floor_price: number;
  upside_sharing_percent: number;
  sowing_advance_percent: number;
  sowing_advance_per_quintal: number;
  delivery_window_start: string;
  delivery_window_end: string;
  harvest_district: string;
  mill_delivery_center: string;
  quality_specs_summary: string;
  model_form_type: 'MAHARASHTRA_CONTRACT_FARMING_ACT_FORM_C';
  status: ForwardContractStatus;
  participating_farmers_count: number;
  created_at: string;
  notes?: string;
}

export interface ForwardPricingSimulation {
  forward_contract_price: number;
  msp_floor_price: number;
  simulated_harvest_spot_price: number;
  upside_share_pct: number;
  spot_above_contract: number;
  spot_below_contract: number;
  final_farmer_price_per_qtl: number;
  effective_gain_over_msp_per_qtl: number;
  protection_mechanism: 'CONTRACT_PRICE_GUARANTEE' | 'SPOT_UPSIDE_SHARED' | 'MSP_FLOOR_APPLIED';
  explanation_en: string;
  explanation_mr: string;
}

// ==========================================
// PHASE 6: e-NWR WAREHOUSE PLEDGE FINANCING
// ==========================================

export interface ENWRPledgeLoanApplication {
  id: string;
  enwr_receipt_number: string;
  farmer_id?: string;
  farmer_name: string;
  farmer_phone: string;
  farmer_district: string;
  farmer_bank_account: string;
  farmer_bank_ifsc: string;
  commodity: string;
  variety: string;
  quantity_quintals: number;
  warehouse_id: number | string;
  warehouse_name: string;
  warehouse_district: string;
  modal_price_per_qtl: number;
  gross_valuation: number;
  loan_ltv_percent: number;
  sanctioned_loan_amount: number;
  annual_interest_rate_percent: number;
  tenure_days: number;
  total_interest_cost: number;
  net_disbursed_amount: number;
  lending_partner: string;
  status: 'APPROVED_DISBURSED' | 'ACTIVE_PLEDGE' | 'REDEEMED_SETTLED';
  disbursement_utr: string;
  qr_verification_token: string;
  created_at: string;
}

// ==========================================
// PHASE 7: APMC OFFICIAL e-J-FORM (RULE 24)
// ==========================================

export interface APMCJFormRecord {
  form_j_number: string;
  apmc_market_yard: string;
  contract_id: number;
  contract_number: string;
  sale_date: string;
  farmer_name: string;
  farmer_district: string;
  farmer_bank_account: string;
  farmer_bank_ifsc: string;
  farmer_aadhaar_last_four: string;
  buyer_name: string;
  buyer_license_number: string;
  commodity: string;
  variety: string;
  quality_grade: string;
  gross_weight_quintals: number;
  tare_weight_quintals: number;
  net_weight_quintals: number;
  rate_per_quintal: number;
  msp_benchmark_per_quintal: number;
  gross_sale_value: number;
  market_cess_percent: number;
  market_cess_amount: number;
  weighment_fees: number;
  hamali_and_handling_fees: number;
  total_statutory_deductions: number;
  net_amount_payable: number;
  escrow_settlement_utr: string;
  digital_signature_hash: string;
  created_at: string;
}


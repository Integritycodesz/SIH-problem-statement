-- ====================================================================
-- AgroConnect Database Schema for Supabase (PostgreSQL 15+)
-- Smart India Hackathon 2026 - Problem Statement ID: 26132
-- Strengthening Market Linkages & Price Discovery for Farmers
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'FARMER' CHECK (role IN ('FARMER', 'BUYER', 'OFFICIAL', 'FPO')),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    kyc_verified BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3, 2) DEFAULT 4.8,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. MANDIS TABLE (585+ APMCs)
CREATE TABLE IF NOT EXISTS public.mandis (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    is_enam BOOLEAN DEFAULT TRUE,
    distance_from_hub_km DOUBLE PRECISION DEFAULT 45.0
);

CREATE INDEX IF NOT EXISTS idx_mandis_name ON public.mandis USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_mandis_district ON public.mandis(district);

-- 3. COMMODITY PRICES TABLE
CREATE TABLE IF NOT EXISTS public.commodity_prices (
    id BIGSERIAL PRIMARY KEY,
    mandi_id BIGINT REFERENCES public.mandis(id) ON DELETE CASCADE,
    mandi_name VARCHAR(120) NOT NULL,
    commodity VARCHAR(80) NOT NULL,
    variety VARCHAR(80) DEFAULT 'Standard Hybrid',
    min_price NUMERIC(10, 2) NOT NULL,
    max_price NUMERIC(10, 2) NOT NULL,
    modal_price NUMERIC(10, 2) NOT NULL,
    msp_price NUMERIC(10, 2),
    arrivals_tonnes NUMERIC(10, 2) DEFAULT 120.0,
    change_24h NUMERIC(5, 2) DEFAULT 0.0,
    price_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_prices_commodity ON public.commodity_prices(commodity);
CREATE INDEX IF NOT EXISTS idx_prices_mandi_id ON public.commodity_prices(mandi_id);

-- 4. PRODUCE LOTS TABLE (Farmer Supply Platform)
CREATE TABLE IF NOT EXISTS public.produce_lots (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    farmer_name VARCHAR(100) NOT NULL,
    farmer_phone VARCHAR(20) NOT NULL,
    mandi_id BIGINT REFERENCES public.mandis(id) ON DELETE SET NULL,
    mandi_name VARCHAR(120),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Maharashtra',
    commodity VARCHAR(80) NOT NULL,
    variety VARCHAR(80) DEFAULT 'Standard Hybrid',
    quantity_quintals NUMERIC(10, 2) NOT NULL,
    quality_grade VARCHAR(20) DEFAULT 'Grade A',
    moisture_percent NUMERIC(4, 2) DEFAULT 11.5,
    base_price_per_quintal NUMERIC(10, 2) NOT NULL,
    expected_delivery_days INT DEFAULT 3,
    description TEXT,
    status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'UNDER_NEGOTIATION', 'UNDER_CONTRACT', 'CONTRACTED', 'DELIVERED')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_lots_commodity ON public.produce_lots(commodity);
CREATE INDEX IF NOT EXISTS idx_lots_farmer_id ON public.produce_lots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON public.produce_lots(status);

-- 5. RFQs & NEGOTIATION TABLE
CREATE TABLE IF NOT EXISTS public.rfqs (
    id BIGSERIAL PRIMARY KEY,
    lot_id BIGINT REFERENCES public.produce_lots(id) ON DELETE CASCADE,
    buyer_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    buyer_name VARCHAR(100) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    farmer_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    farmer_name VARCHAR(100) NOT NULL,
    commodity VARCHAR(80) NOT NULL,
    quantity_quintals NUMERIC(10, 2) NOT NULL,
    initial_offer_price NUMERIC(10, 2) NOT NULL,
    current_offered_price NUMERIC(10, 2) NOT NULL,
    last_sender_role VARCHAR(20) DEFAULT 'BUYER',
    delivery_timeline_days INT DEFAULT 4,
    delivery_address TEXT DEFAULT 'APMC Processing Hub, Vashi, Navi Mumbai',
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'CONTRACTED')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. RFQ MESSAGES (Negotiation Chat History)
CREATE TABLE IF NOT EXISTS public.rfq_messages (
    id BIGSERIAL PRIMARY KEY,
    rfq_id BIGINT REFERENCES public.rfqs(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    offered_price NUMERIC(10, 2) NOT NULL,
    message_text TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. CONTRACTS TABLE (Digital APMC Legal Contracts)
CREATE TABLE IF NOT EXISTS public.contracts (
    id BIGSERIAL PRIMARY KEY,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    rfq_id BIGINT REFERENCES public.rfqs(id) ON DELETE SET NULL,
    demand_id BIGINT REFERENCES public.buyer_demands(id) ON DELETE SET NULL,
    lot_id BIGINT REFERENCES public.produce_lots(id) ON DELETE SET NULL,
    buyer_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    buyer_name VARCHAR(100) NOT NULL,
    farmer_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    farmer_name VARCHAR(100) NOT NULL,
    commodity VARCHAR(80) NOT NULL,
    quantity_quintals NUMERIC(10, 2) NOT NULL,
    final_price_per_quintal NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    advance_amount NUMERIC(12, 2) NOT NULL,
    balance_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(40) DEFAULT 'PENDING_SIGNATURES',
    farmer_signed BOOLEAN DEFAULT FALSE,
    farmer_signed_at TIMESTAMPTZ,
    farmer_sign_hash VARCHAR(100),
    buyer_signed BOOLEAN DEFAULT FALSE,
    buyer_signed_at TIMESTAMPTZ,
    buyer_sign_hash VARCHAR(100),
    delivery_address TEXT,
    legal_terms TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 8. ESCROW PAYMENTS TABLE (Milestone Escrow Account)
CREATE TABLE IF NOT EXISTS public.escrow_payments (
    id BIGSERIAL PRIMARY KEY,
    contract_id BIGINT UNIQUE REFERENCES public.contracts(id) ON DELETE CASCADE,
    total_amount NUMERIC(12, 2) NOT NULL,
    advance_amount NUMERIC(12, 2) NOT NULL,
    advance_status VARCHAR(30) DEFAULT 'UNPAID' CHECK (advance_status IN ('UNPAID', 'HELD_IN_ESCROW', 'RELEASED_TO_FARMER')),
    balance_amount NUMERIC(12, 2) NOT NULL,
    balance_status VARCHAR(30) DEFAULT 'UNPAID' CHECK (balance_status IN ('UNPAID', 'HELD_IN_ESCROW', 'RELEASED_TO_FARMER', 'REFUNDED')),
    payment_gateway_ref VARCHAR(80) DEFAULT 'RZP_ESCROW_GATEWAY_NODE',
    advance_funded_at TIMESTAMPTZ,
    advance_released_at TIMESTAMPTZ,
    final_settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. 3-TIER DISPUTES TABLE
CREATE TABLE IF NOT EXISTS public.disputes (
    id BIGSERIAL PRIMARY KEY,
    contract_id BIGINT REFERENCES public.contracts(id) ON DELETE CASCADE,
    filed_by_id BIGINT NOT NULL,
    filed_by_name VARCHAR(100) NOT NULL,
    filed_by_role VARCHAR(20) NOT NULL,
    dispute_type VARCHAR(40) NOT NULL,
    tier VARCHAR(30) DEFAULT 'TIER_1_PEER' CHECK (tier IN ('TIER_1_PEER', 'TIER_2_ARBITRATION', 'TIER_3_PANEL')),
    status VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_NEGOTIATION', 'UNDER_ARBITRATION', 'RESOLVED', 'DISMISSED')),
    complaint_details TEXT NOT NULL,
    claimed_deduction NUMERIC(10, 2) DEFAULT 0.0,
    agreed_adjustment NUMERIC(10, 2) DEFAULT 0.0,
    arbiter_ruling TEXT,
    evidence_urls TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    resolved_at TIMESTAMPTZ
);

-- 10. BUYER SCORECARDS TABLE (MSAMB Credibility Index)
CREATE TABLE IF NOT EXISTS public.buyer_scorecards (
    id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    company_name VARCHAR(120) NOT NULL,
    company_type VARCHAR(40) NOT NULL,
    msamb_license_number VARCHAR(80) NOT NULL UNIQUE,
    license_validity VARCHAR(50) DEFAULT 'March 2028 (Active / Verified)',
    overall_reliability_score NUMERIC(4, 1) DEFAULT 99.2,
    credit_tier VARCHAR(30) DEFAULT 'AAA_PLATINUM',
    escrow_on_time_rate NUMERIC(4, 1) DEFAULT 99.2,
    avg_payment_release_hours NUMERIC(4, 1) DEFAULT 4.2,
    total_deals_completed INT DEFAULT 48,
    total_volume_cleared_quintals NUMERIC(12, 2) DEFAULT 42500.0,
    total_escrow_disbursed_lakhs NUMERIC(10, 2) DEFAULT 216.5,
    unresolved_disputes_count INT DEFAULT 0,
    dispute_resolution_rate_pct NUMERIC(4, 1) DEFAULT 100.0,
    default_rate_pct NUMERIC(4, 1) DEFAULT 0.0,
    bank_nodal_partner VARCHAR(120) DEFAULT 'State Bank of India (MSAMB Dedicated Agri-Escrow Node)',
    apmc_verified_depots TEXT DEFAULT 'Nagpur, Pune, Nashik, Akola, Vashi',
    audited_year VARCHAR(20) DEFAULT 'FY 2025-26',
    monthly_target_quintals NUMERIC(12, 2) DEFAULT 5000.0,
    monthly_procured_quintals NUMERIC(12, 2) DEFAULT 3450.0,
    target_commodity VARCHAR(80) DEFAULT 'Soybean',
    apmc_benchmark_price_per_qtl NUMERIC(10, 2) DEFAULT 5220.0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 11. BUYER DEMANDS TABLE (Reverse RFQs / Institutional Tenders)
CREATE TABLE IF NOT EXISTS public.buyer_demands (
    id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    buyer_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(120) NOT NULL,
    company_type VARCHAR(40) NOT NULL,
    commodity VARCHAR(80) NOT NULL,
    variety VARCHAR(80) DEFAULT 'Grade A Standard',
    required_quantity_quintals NUMERIC(10, 2) NOT NULL,
    fulfilled_quantity_quintals NUMERIC(10, 2) DEFAULT 0.0,
    target_price_per_quintal NUMERIC(10, 2) NOT NULL,
    quality_grade_required VARCHAR(30) DEFAULT 'Grade A',
    max_moisture_percent NUMERIC(4, 2) DEFAULT 10.0,
    delivery_hub VARCHAR(120) NOT NULL,
    delivery_deadline VARCHAR(80) NOT NULL,
    delivery_deadline_days INT DEFAULT 7,
    escrow_prefunded BOOLEAN DEFAULT TRUE,
    status VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIALLY_FULFILLED', 'FULFILLED', 'EXPIRED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_buyer_demands_commodity ON public.buyer_demands(commodity);
CREATE INDEX IF NOT EXISTS idx_buyer_demands_status ON public.buyer_demands(status);

-- 12. NOTIFICATIONS TABLE (Agri-Notification Feed)
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'PRICE',
    read BOOLEAN DEFAULT FALSE,
    link_tab VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 13. STORAGE FACILITIES TABLE (MSWC & WDRA Cold Storages)
CREATE TABLE IF NOT EXISTS public.storage_facilities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    facility_type VARCHAR(40) NOT NULL,
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100),
    address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    total_capacity_mt NUMERIC(10, 2) DEFAULT 5000,
    available_capacity_mt NUMERIC(10, 2) DEFAULT 2500,
    daily_rent_per_quintal NUMERIC(6, 2) DEFAULT 1.50,
    temperature_celsius NUMERIC(5, 2),
    humidity_percent NUMERIC(5, 2),
    is_wdra_accredited BOOLEAN DEFAULT TRUE,
    enwr_pledge_eligible BOOLEAN DEFAULT TRUE,
    contact_person VARCHAR(120),
    contact_phone VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 14. STORAGE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.storage_bookings (
    id VARCHAR(100) PRIMARY KEY,
    facility_id BIGINT REFERENCES public.storage_facilities(id) ON DELETE SET NULL,
    facility_name VARCHAR(150),
    facility_type VARCHAR(40),
    farmer_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(100),
    farmer_phone VARCHAR(30),
    commodity VARCHAR(80),
    quantity_quintals NUMERIC(10, 2),
    duration_days INT,
    inward_date VARCHAR(50),
    daily_tariff NUMERIC(6, 2),
    total_rent NUMERIC(12, 2),
    handling_fee NUMERIC(10, 2),
    total_amount NUMERIC(12, 2),
    status VARCHAR(40) DEFAULT 'CONFIRMED',
    qr_code TEXT,
    need_transport BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 15. FPO POOLS TABLE (Consortium Aggregation)
CREATE TABLE IF NOT EXISTS public.fpo_pools (
    id BIGSERIAL PRIMARY KEY,
    fpo_name VARCHAR(150) NOT NULL,
    fpo_registration_number VARCHAR(100),
    fpo_contact_person VARCHAR(120),
    fpo_contact_phone VARCHAR(30),
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Maharashtra',
    central_hub_location TEXT,
    commodity VARCHAR(80),
    variety VARCHAR(80),
    quality_grade VARCHAR(40),
    target_volume_quintals NUMERIC(12, 2),
    collected_volume_quintals NUMERIC(12, 2) DEFAULT 0,
    unit_base_price NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'OPEN_FOR_CONTRIBUTIONS',
    expected_fulfillment_date VARCHAR(50),
    description TEXT,
    fpo_certified BOOLEAN DEFAULT TRUE,
    assay_certificate_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 16. FPO POOL MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.fpo_pool_members (
    id BIGSERIAL PRIMARY KEY,
    pool_id BIGINT REFERENCES public.fpo_pools(id) ON DELETE CASCADE,
    farmer_id BIGINT,
    farmer_name VARCHAR(100),
    farmer_phone VARCHAR(30),
    district VARCHAR(100),
    quantity_quintals NUMERIC(10, 2),
    lot_id BIGINT,
    grade VARCHAR(40) DEFAULT 'Grade A',
    payout_share_percent NUMERIC(5, 2) DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 17. QUALITY ASSAYS TABLE (Kisan Vision AI)
CREATE TABLE IF NOT EXISTS public.quality_assays (
    id BIGSERIAL PRIMARY KEY,
    certificate_id VARCHAR(100) UNIQUE NOT NULL,
    lot_id BIGINT REFERENCES public.produce_lots(id) ON DELETE SET NULL,
    farmer_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    commodity VARCHAR(80),
    variety VARCHAR(80),
    overall_grade VARCHAR(40),
    moisture_percent NUMERIC(5, 2),
    color_uniformity_score NUMERIC(5, 2),
    defect_percentage NUMERIC(5, 2),
    purity_index NUMERIC(5, 2),
    sample_image_url TEXT,
    assayed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 18. LOGISTICS BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.logistics_bookings (
    id BIGSERIAL PRIMARY KEY,
    contract_id BIGINT REFERENCES public.contracts(id) ON DELETE SET NULL,
    contract_number VARCHAR(80),
    lot_id BIGINT REFERENCES public.produce_lots(id) ON DELETE SET NULL,
    gate_pass_code VARCHAR(80) UNIQUE,
    transporter_name VARCHAR(120),
    transporter_contact VARCHAR(40),
    vehicle_number VARCHAR(40),
    vehicle_type VARCHAR(60),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(40),
    driver_license VARCHAR(60),
    pickup_location TEXT,
    delivery_location TEXT,
    distance_km NUMERIC(8, 2),
    estimated_transit_hours NUMERIC(6, 2),
    freight_charge NUMERIC(10, 2),
    gross_weight_quintals NUMERIC(10, 2),
    tare_weight_quintals NUMERIC(10, 2),
    net_weight_quintals NUMERIC(10, 2),
    status VARCHAR(40) DEFAULT 'BOOKED',
    dispatched_at TIMESTAMPTZ,
    weighbridge_scanned_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    security_hash TEXT,
    qr_payload_json TEXT,
    farmer_name VARCHAR(100),
    buyer_name VARCHAR(100),
    commodity VARCHAR(80),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 19. DIGITAL GATE PASSES TABLE (Weighbridge Verification)
CREATE TABLE IF NOT EXISTS public.digital_gate_passes (
    id VARCHAR(100) PRIMARY KEY,
    pass_number VARCHAR(80) UNIQUE NOT NULL,
    contract_id BIGINT REFERENCES public.contracts(id) ON DELETE SET NULL,
    contract_number VARCHAR(80),
    truck_number VARCHAR(40),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(40),
    carrier_name VARCHAR(120),
    commodity VARCHAR(80),
    variety VARCHAR(80),
    farmer_id BIGINT,
    farmer_name VARCHAR(100),
    farmer_phone VARCHAR(40),
    buyer_id BIGINT,
    buyer_name VARCHAR(100),
    destination_mill TEXT,
    destination_district VARCHAR(100),
    estimated_quantity_quintals NUMERIC(10, 2),
    gross_weight_kg NUMERIC(12, 2),
    tare_weight_kg NUMERIC(12, 2),
    net_produce_kg NUMERIC(12, 2),
    net_produce_quintals NUMERIC(10, 2),
    tested_moisture_pct NUMERIC(5, 2),
    tested_foreign_matter_pct NUMERIC(5, 2),
    tested_damaged_pct NUMERIC(5, 2),
    base_price_per_quintal NUMERIC(10, 2),
    refraction_deduction_amount NUMERIC(10, 2),
    net_payable_amount NUMERIC(12, 2),
    escrow_advance_deducted NUMERIC(12, 2),
    final_settlement_released NUMERIC(12, 2),
    gate_in_time TIMESTAMPTZ,
    gross_weigh_time TIMESTAMPTZ,
    quality_test_time TIMESTAMPTZ,
    tare_weigh_time TIMESTAMPTZ,
    gate_out_time TIMESTAMPTZ,
    status VARCHAR(40) DEFAULT 'ISSUED_IN_TRANSIT',
    qr_code_token TEXT,
    security_hash TEXT,
    weighbridge_operator VARCHAR(100),
    weighbridge_terminal_id VARCHAR(60),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 20. FORWARD CONTRACT OFFERS TABLE (Pre-Harvest Booking)
CREATE TABLE IF NOT EXISTS public.forward_contract_offers (
    id VARCHAR(100) PRIMARY KEY,
    offer_code VARCHAR(80) UNIQUE NOT NULL,
    buyer_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    buyer_name VARCHAR(100),
    company_name VARCHAR(120),
    commodity VARCHAR(80),
    variety VARCHAR(80),
    season VARCHAR(40) DEFAULT 'KHARIF_2026',
    target_volume_quintals NUMERIC(12, 2),
    committed_volume_quintals NUMERIC(12, 2) DEFAULT 0,
    pre_harvest_contract_price NUMERIC(10, 2),
    cacp_msp_floor_price NUMERIC(10, 2),
    upside_sharing_percent NUMERIC(5, 2) DEFAULT 60,
    sowing_advance_percent NUMERIC(5, 2) DEFAULT 20,
    sowing_advance_per_quintal NUMERIC(10, 2),
    delivery_window_start VARCHAR(50),
    delivery_window_end VARCHAR(50),
    harvest_district VARCHAR(100),
    mill_delivery_center TEXT,
    quality_specs_summary TEXT,
    model_form_type VARCHAR(80) DEFAULT 'MAHARASHTRA_CONTRACT_FARMING_ACT_FORM_C',
    status VARCHAR(40) DEFAULT 'OPEN_FOR_BOOKING',
    participating_farmers_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 21. e-NWR PLEDGE LOANS TABLE (Warehouse Financing)
CREATE TABLE IF NOT EXISTS public.enwr_pledge_loans (
    id VARCHAR(100) PRIMARY KEY,
    enwr_receipt_number VARCHAR(80) UNIQUE NOT NULL,
    farmer_id VARCHAR(50),
    farmer_name VARCHAR(100),
    farmer_phone VARCHAR(40),
    farmer_district VARCHAR(100),
    farmer_bank_account VARCHAR(60),
    farmer_bank_ifsc VARCHAR(30),
    commodity VARCHAR(80),
    variety VARCHAR(80),
    quantity_quintals NUMERIC(10, 2),
    warehouse_id VARCHAR(50),
    warehouse_name VARCHAR(150),
    warehouse_district VARCHAR(100),
    modal_price_per_qtl NUMERIC(10, 2),
    gross_valuation NUMERIC(12, 2),
    loan_ltv_percent NUMERIC(5, 2) DEFAULT 75,
    sanctioned_loan_amount NUMERIC(12, 2),
    annual_interest_rate_percent NUMERIC(5, 2) DEFAULT 7.0,
    tenure_days INT DEFAULT 90,
    total_interest_cost NUMERIC(10, 2),
    net_disbursed_amount NUMERIC(12, 2),
    lending_partner VARCHAR(150),
    status VARCHAR(40) DEFAULT 'APPROVED_DISBURSED',
    disbursement_utr VARCHAR(80),
    qr_verification_token TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 22. APMC OFFICIAL e-J-FORMS TABLE (Statutory Mandi Record)
CREATE TABLE IF NOT EXISTS public.apmc_j_forms (
    form_j_number VARCHAR(100) PRIMARY KEY,
    apmc_market_yard VARCHAR(150),
    contract_id BIGINT REFERENCES public.contracts(id) ON DELETE SET NULL,
    contract_number VARCHAR(80),
    sale_date VARCHAR(50),
    farmer_name VARCHAR(100),
    farmer_district VARCHAR(100),
    farmer_bank_account VARCHAR(60),
    farmer_bank_ifsc VARCHAR(30),
    farmer_aadhaar_last_four VARCHAR(10),
    buyer_name VARCHAR(100),
    buyer_license_number VARCHAR(80),
    commodity VARCHAR(80),
    variety VARCHAR(80),
    quality_grade VARCHAR(40),
    gross_weight_quintals NUMERIC(10, 2),
    tare_weight_quintals NUMERIC(10, 2),
    net_weight_quintals NUMERIC(10, 2),
    rate_per_quintal NUMERIC(10, 2),
    msp_benchmark_per_quintal NUMERIC(10, 2),
    gross_sale_value NUMERIC(12, 2),
    market_cess_percent NUMERIC(5, 2),
    market_cess_amount NUMERIC(10, 2),
    weighment_fees NUMERIC(10, 2),
    hamali_and_handling_fees NUMERIC(10, 2),
    total_statutory_deductions NUMERIC(10, 2),
    net_amount_payable NUMERIC(12, 2),
    escrow_settlement_utr VARCHAR(80),
    digital_signature_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodity_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_assays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_gate_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forward_contract_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enwr_pledge_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apmc_j_forms ENABLE ROW LEVEL SECURITY;

-- Permissive policies for read and transactional write
CREATE POLICY "Allow public read on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow full access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read on mandis" ON public.mandis FOR SELECT USING (true);
CREATE POLICY "Allow write on mandis" ON public.mandis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read on commodity prices" ON public.commodity_prices FOR SELECT USING (true);
CREATE POLICY "Allow write on commodity prices" ON public.commodity_prices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read on available produce lots" ON public.produce_lots FOR SELECT USING (true);
CREATE POLICY "Allow write on produce lots" ON public.produce_lots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read on buyer scorecards" ON public.buyer_scorecards FOR SELECT USING (true);
CREATE POLICY "Allow write on buyer scorecards" ON public.buyer_scorecards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read on buyer demands" ON public.buyer_demands FOR SELECT USING (true);
CREATE POLICY "Allow full access to buyer demands" ON public.buyer_demands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to rfqs" ON public.rfqs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to rfq messages" ON public.rfq_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to contracts" ON public.contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to escrow payments" ON public.escrow_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to disputes" ON public.disputes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to storage facilities" ON public.storage_facilities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to storage bookings" ON public.storage_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to fpo pools" ON public.fpo_pools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to fpo pool members" ON public.fpo_pool_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to quality assays" ON public.quality_assays FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to logistics bookings" ON public.logistics_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to digital gate passes" ON public.digital_gate_passes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to forward contract offers" ON public.forward_contract_offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to enwr pledge loans" ON public.enwr_pledge_loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to apmc j forms" ON public.apmc_j_forms FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- ENABLE REALTIME PUBLICATION FOR LIVE FEEDS & RFQ ALERTS
-- ====================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.commodity_prices;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.produce_lots;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rfqs;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rfq_messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contracts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.escrow_payments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.disputes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.buyer_demands;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.storage_bookings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.fpo_pools;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.logistics_bookings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.digital_gate_passes;
  END IF;
END $$;

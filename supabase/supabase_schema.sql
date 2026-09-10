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
    rfq_id BIGINT REFERENCES public.rfqs(id) ON DELETE CASCADE,
    lot_id BIGINT REFERENCES public.produce_lots(id) ON DELETE CASCADE,
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

-- Public read access for market discovery
CREATE POLICY "Allow public read on mandis" ON public.mandis FOR SELECT USING (true);
CREATE POLICY "Allow public read on commodity prices" ON public.commodity_prices FOR SELECT USING (true);
CREATE POLICY "Allow public read on available produce lots" ON public.produce_lots FOR SELECT USING (true);
CREATE POLICY "Allow public read on users" ON public.users FOR SELECT USING (true);

-- Permissive authenticated / service access for transactions
CREATE POLICY "Allow full access to rfqs" ON public.rfqs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to rfq messages" ON public.rfq_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to contracts" ON public.contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to escrow payments" ON public.escrow_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to disputes" ON public.disputes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write on produce lots" ON public.produce_lots FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- ENABLE REALTIME PUBLICATION FOR LIVE FEEDS & RFQ ALERTS
-- ====================================================================

-- Add tables to supabase_realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.commodity_prices;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rfqs;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contracts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.disputes;
  END IF;
END $$;

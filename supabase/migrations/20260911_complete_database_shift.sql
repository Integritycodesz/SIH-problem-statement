-- ====================================================================
-- AgroConnect Migration: Complete Database Shift
-- Smart India Hackathon 2026 - Problem Statement ID: 26132
-- ====================================================================

-- 1. STORAGE FACILITIES & WAREHOUSES TABLE (WDRA & Cold Storages)
CREATE TABLE IF NOT EXISTS public.storage_facilities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    facility_type VARCHAR(40) NOT NULL DEFAULT 'WDRA_GODOWN' CHECK (facility_type IN ('COLD_STORAGE', 'WDRA_GODOWN', 'APMC_WAREHOUSE', 'CA_STORE')),
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100),
    address TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    total_capacity_mt NUMERIC(10, 2) NOT NULL DEFAULT 5000.0,
    available_capacity_mt NUMERIC(10, 2) NOT NULL DEFAULT 2200.0,
    daily_rent_per_quintal NUMERIC(8, 2) NOT NULL DEFAULT 1.50,
    temperature_celsius NUMERIC(5, 2) DEFAULT 4.0,
    humidity_percent NUMERIC(5, 2) DEFAULT 85.0,
    is_wdra_accredited BOOLEAN DEFAULT TRUE,
    enwr_pledge_eligible BOOLEAN DEFAULT TRUE,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(25),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_storage_district ON public.storage_facilities(district);
CREATE INDEX IF NOT EXISTS idx_storage_type ON public.storage_facilities(facility_type);

-- 2. FPO COLLECTIVE POOLS TABLE
CREATE TABLE IF NOT EXISTS public.fpo_pools (
    id BIGSERIAL PRIMARY KEY,
    fpo_name VARCHAR(150) NOT NULL,
    fpo_registration_number VARCHAR(80) NOT NULL,
    fpo_contact_person VARCHAR(100),
    fpo_contact_phone VARCHAR(25),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Maharashtra',
    central_hub_location VARCHAR(150) NOT NULL,
    commodity VARCHAR(80) NOT NULL,
    variety VARCHAR(80) DEFAULT 'Standard Grade A',
    quality_grade VARCHAR(40) DEFAULT 'Grade A',
    target_volume_quintals NUMERIC(10, 2) NOT NULL DEFAULT 500.0,
    collected_volume_quintals NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    unit_base_price NUMERIC(10, 2) NOT NULL DEFAULT 2400.0,
    status VARCHAR(40) DEFAULT 'OPEN_FOR_CONTRIBUTIONS' CHECK (status IN ('OPEN_FOR_CONTRIBUTIONS', 'READY_FOR_INSTITUTIONAL_RFQ', 'CONTRACTED', 'DISPATCHED')),
    expected_fulfillment_date DATE,
    description TEXT,
    fpo_certified BOOLEAN DEFAULT TRUE,
    assay_certificate_id VARCHAR(80),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_fpo_pools_commodity ON public.fpo_pools(commodity);
CREATE INDEX IF NOT EXISTS idx_fpo_pools_district ON public.fpo_pools(district);
CREATE INDEX IF NOT EXISTS idx_fpo_pools_status ON public.fpo_pools(status);

-- 3. FPO POOL MEMBERS (Individual Farmer Contributions)
CREATE TABLE IF NOT EXISTS public.fpo_pool_members (
    id BIGSERIAL PRIMARY KEY,
    pool_id BIGINT NOT NULL REFERENCES public.fpo_pools(id) ON DELETE CASCADE,
    farmer_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(100) NOT NULL,
    farmer_phone VARCHAR(25),
    district VARCHAR(100),
    quantity_quintals NUMERIC(10, 2) NOT NULL,
    lot_id BIGINT REFERENCES public.produce_lots(id) ON DELETE SET NULL,
    grade VARCHAR(40) DEFAULT 'Grade A',
    payout_share_percent NUMERIC(5, 2) DEFAULT 0.0,
    joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_fpo_members_pool ON public.fpo_pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_fpo_members_farmer ON public.fpo_pool_members(farmer_id);

-- 4. QUALITY ASSAYS (Permanent Kisan Vision AI Quality Records)
CREATE TABLE IF NOT EXISTS public.quality_assays (
    id BIGSERIAL PRIMARY KEY,
    certificate_id VARCHAR(80) UNIQUE NOT NULL,
    lot_id BIGINT REFERENCES public.produce_lots(id) ON DELETE SET NULL,
    farmer_id BIGINT REFERENCES public.users(id),
    commodity VARCHAR(80) NOT NULL,
    variety VARCHAR(80),
    overall_grade VARCHAR(20) NOT NULL DEFAULT 'Grade A',
    moisture_percent NUMERIC(5, 2) DEFAULT 11.5,
    color_uniformity_score NUMERIC(5, 2) DEFAULT 94.0,
    defect_percentage NUMERIC(5, 2) DEFAULT 2.8,
    purity_index NUMERIC(5, 2) DEFAULT 98.2,
    sample_image_url TEXT,
    assayed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_assays_cert ON public.quality_assays(certificate_id);
CREATE INDEX IF NOT EXISTS idx_assays_commodity ON public.quality_assays(commodity);

-- 5. CACP STATUTORY MSP BENCHMARKS
CREATE TABLE IF NOT EXISTS public.cacp_msp_benchmarks (
    id BIGSERIAL PRIMARY KEY,
    commodity VARCHAR(80) NOT NULL,
    variety VARCHAR(80),
    crop_year VARCHAR(30) NOT NULL,
    season VARCHAR(30) NOT NULL,
    msp_price NUMERIC(10, 2) NOT NULL,
    cost_a2_fl NUMERIC(10, 2),
    return_over_cost_pct NUMERIC(5, 2),
    statutory_body VARCHAR(150) DEFAULT 'Commission for Agricultural Costs & Prices (CACP)',
    effective_date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_msp_commodity ON public.cacp_msp_benchmarks(commodity);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.storage_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_assays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cacp_msp_benchmarks ENABLE ROW LEVEL SECURITY;

-- Permissive policies for demo & production
DROP POLICY IF EXISTS "Public read storage_facilities" ON public.storage_facilities;
CREATE POLICY "Public read storage_facilities" ON public.storage_facilities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert storage_facilities" ON public.storage_facilities;
CREATE POLICY "Public insert storage_facilities" ON public.storage_facilities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read fpo_pools" ON public.fpo_pools;
CREATE POLICY "Public read fpo_pools" ON public.fpo_pools FOR SELECT USING (true);
DROP POLICY IF EXISTS "Full access fpo_pools" ON public.fpo_pools;
CREATE POLICY "Full access fpo_pools" ON public.fpo_pools FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read fpo_pool_members" ON public.fpo_pool_members;
CREATE POLICY "Public read fpo_pool_members" ON public.fpo_pool_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Full access fpo_pool_members" ON public.fpo_pool_members;
CREATE POLICY "Full access fpo_pool_members" ON public.fpo_pool_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read quality_assays" ON public.quality_assays;
CREATE POLICY "Public read quality_assays" ON public.quality_assays FOR SELECT USING (true);
DROP POLICY IF EXISTS "Full access quality_assays" ON public.quality_assays;
CREATE POLICY "Full access quality_assays" ON public.quality_assays FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read cacp_msp_benchmarks" ON public.cacp_msp_benchmarks;
CREATE POLICY "Public read cacp_msp_benchmarks" ON public.cacp_msp_benchmarks FOR SELECT USING (true);

-- 7. REALTIME REPLICATION
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.fpo_pools;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.fpo_pool_members;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.storage_facilities;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 8. SEED DATA FOR MAHARASHTRA WAREHOUSES & STORAGE HUBS
INSERT INTO public.storage_facilities (name, facility_type, district, taluka, address, lat, lng, total_capacity_mt, available_capacity_mt, daily_rent_per_quintal, temperature_celsius, humidity_percent, is_wdra_accredited, enwr_pledge_eligible, contact_person, contact_phone)
VALUES
('MSWC Central Godown & Cold Chain Hub', 'COLD_STORAGE', 'Nashik', 'Niphad', 'APMC Cold Storage Yard, Lasalgaon Road, Niphad', 20.1481, 73.6650, 4500.0, 1850.0, 1.65, 3.5, 88.0, true, true, 'Sanjay G. Shinde (MSWC Warehouse Manager)', '+91 98221 44556'),
('Dindori Agro-Processing & Cold Preservation Yard', 'COLD_STORAGE', 'Nashik', 'Dindori', 'Sahyadri Agro Park Corridor, Dindori', 20.2012, 73.8341, 6000.0, 2400.0, 1.80, 2.0, 90.0, true, true, 'Pravin Joshi (Cluster Operations)', '+91 98220 77889'),
('Latur Pulse & Oilseed Buffer Warehouse (WDRA)', 'WDRA_GODOWN', 'Latur', 'Latur', 'Plot 44, MIDC Industrial Area, Latur APMC Yard', 18.5185, 76.6946, 8000.0, 3100.0, 1.20, 24.0, 50.0, true, true, 'V. D. Gaikwad (Warehouse Incharge)', '+91 98224 55667'),
('Chhatrapati Sambhajinagar Modern Silo & Grain Terminal', 'WDRA_GODOWN', 'Chhatrapati Sambhajinagar', 'Gangapur', 'Jalna-Aurangabad Road, Shendra Industrial Area', 19.9380, 75.3700, 10000.0, 4800.0, 1.15, 22.0, 55.0, true, true, 'K. B. Patil (Terminal Officer)', '+91 98226 88990'),
('Pune Gultekdi Central Cold Storage', 'COLD_STORAGE', 'Pune', 'Haveli', 'Gate No 4, Market Yard, Gultekdi, Pune', 18.4287, 73.8566, 3500.0, 920.0, 2.10, 4.0, 85.0, true, true, 'R. K. More (Cold Storage Superintendent)', '+91 98220 11223'),
('Jalgaon Cotton & Banana Cold Warehouse', 'COLD_STORAGE', 'Jalgaon', 'Raver', 'NH-53 Agro Logistics Corridor, Raver', 21.0375, 75.5990, 5000.0, 2100.0, 1.50, 6.0, 80.0, true, true, 'A. S. Borade (APMC Storage Hub)', '+91 98222 33445'),
('Amravati Multi-Commodity Agro Warehouse', 'WDRA_GODOWN', 'Amravati', 'Amravati', 'Badnera Road Godown Complex, Amravati', 20.9114, 77.7580, 7500.0, 3600.0, 1.25, 23.0, 52.0, true, true, 'G. H. Deshmukh (Godown Keeper)', '+91 98228 99001')
ON CONFLICT DO NOTHING;

-- 9. SEED CACP STATUTORY MSP BENCHMARKS
INSERT INTO public.cacp_msp_benchmarks (commodity, variety, crop_year, season, msp_price, cost_a2_fl, return_over_cost_pct, statutory_body)
VALUES
('Soybean', 'Yellow (JS-335)', '2024-25', 'Kharif', 4892.00, 3261.00, 50.00, 'Commission for Agricultural Costs & Prices (CACP)'),
('Cotton', 'Medium Staple (LRA-5166)', '2024-25', 'Kharif', 7121.00, 4747.00, 50.00, 'Commission for Agricultural Costs & Prices (CACP)'),
('Wheat', 'FAQ / Lokwan', '2025-26', 'Rabi', 2425.00, 1195.00, 103.00, 'Commission for Agricultural Costs & Prices (CACP)'),
('Paddy', 'Common Grade', '2024-25', 'Kharif', 2300.00, 1533.00, 50.00, 'Commission for Agricultural Costs & Prices (CACP)'),
('Gram', 'Chana Desi', '2024-25', 'Rabi', 5440.00, 3317.00, 64.00, 'Commission for Agricultural Costs & Prices (CACP)'),
('Tur (Arhar)', 'Red Gram', '2024-25', 'Kharif', 7550.00, 4500.00, 68.00, 'Commission for Agricultural Costs & Prices (CACP)'),
('Moong', 'Green Gram', '2024-25', 'Kharif', 8682.00, 5788.00, 50.00, 'Commission for Agricultural Costs & Prices (CACP)'),
('Urad', 'Black Gram', '2024-25', 'Kharif', 7400.00, 4933.00, 50.00, 'Commission for Agricultural Costs & Prices (CACP)'),
('Maize', 'Yellow Corn', '2024-25', 'Kharif', 2225.00, 1483.00, 50.00, 'Commission for Agricultural Costs & Prices (CACP)')
ON CONFLICT DO NOTHING;

-- 10. INITIAL FPO COLLECTIVE POOLS (Mock seed removed - start clean)
-- Pools are now launched dynamically by users/cooperatives.


-- ====================================================================
-- AgroConnect Supabase Migration: Buyer Demands & MSAMB Credibility Scorecards
-- Smart India Hackathon 2026 - Problem Statement ID: 26132
-- ====================================================================

-- 1. BUYER SCORECARDS TABLE (MSAMB Statutory Credibility Index)
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'buyer_scorecards' AND column_name = 'monthly_target_quintals') THEN
    ALTER TABLE public.buyer_scorecards ADD COLUMN monthly_target_quintals NUMERIC(12, 2) DEFAULT 5000.0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'buyer_scorecards' AND column_name = 'monthly_procured_quintals') THEN
    ALTER TABLE public.buyer_scorecards ADD COLUMN monthly_procured_quintals NUMERIC(12, 2) DEFAULT 3450.0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'buyer_scorecards' AND column_name = 'target_commodity') THEN
    ALTER TABLE public.buyer_scorecards ADD COLUMN target_commodity VARCHAR(80) DEFAULT 'Soybean';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'buyer_scorecards' AND column_name = 'apmc_benchmark_price_per_qtl') THEN
    ALTER TABLE public.buyer_scorecards ADD COLUMN apmc_benchmark_price_per_qtl NUMERIC(10, 2) DEFAULT 5220.0;
  END IF;
END $$;

-- 2. BUYER DEMANDS TABLE (Reverse RFQs / Institutional Procurement Tenders)
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

-- 3. ENHANCE CONTRACTS TABLE FOR REVERSE RFQ LINKS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'contracts' AND column_name = 'demand_id'
  ) THEN
    ALTER TABLE public.contracts ADD COLUMN demand_id BIGINT REFERENCES public.buyer_demands(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.buyer_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_demands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on buyer scorecards" ON public.buyer_scorecards;
CREATE POLICY "Allow public read on buyer scorecards" ON public.buyer_scorecards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write on buyer scorecards" ON public.buyer_scorecards;
CREATE POLICY "Allow write on buyer scorecards" ON public.buyer_scorecards FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on buyer demands" ON public.buyer_demands;
CREATE POLICY "Allow public read on buyer demands" ON public.buyer_demands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full access to buyer demands" ON public.buyer_demands;
CREATE POLICY "Allow full access to buyer demands" ON public.buyer_demands FOR ALL USING (true) WITH CHECK (true);

-- 5. REALTIME PUBLICATION
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.buyer_demands;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.buyer_scorecards;
  END IF;
END $$;

-- 6. SEED STATUTORY BUYER USER PROFILES
INSERT INTO public.users (id, name, phone, email, role, district, state, kyc_verified, rating)
VALUES
  (101, 'Nagpur Agro-Processing Oil Mills', '+91-98220-41001', 'procurement@nagpuroilmills.com', 'BUYER', 'Nagpur', 'Maharashtra', true, 4.95),
  (102, 'Adani Wilmar Consumer Hub', '+91-98220-41002', 'sourcing.west@adaniwilmar.in', 'BUYER', 'Pune', 'Maharashtra', true, 4.98),
  (103, 'Haldiram Foods Procurement Desk', '+91-98220-41003', 'agri-procure@haldiram.com', 'BUYER', 'Nagpur', 'Maharashtra', true, 4.94),
  (104, 'ITC Agri-Business Sourcing Cell', '+91-98220-41004', 'procurement.mh@itc.in', 'BUYER', 'Nashik', 'Maharashtra', true, 4.97),
  (105, 'Sahyadri Farmers Producer Co.', '+91-98220-41005', 'exports@sahyadrifarms.com', 'BUYER', 'Nashik', 'Maharashtra', true, 4.96),
  (106, 'Wardha Cotton & Ginning Mills', '+91-98220-41006', 'textiles@wardhagins.co.in', 'BUYER', 'Wardha', 'Maharashtra', true, 4.91)
ON CONFLICT (phone) DO UPDATE 
SET 
  name = EXCLUDED.name, 
  role = EXCLUDED.role, 
  district = EXCLUDED.district, 
  kyc_verified = true;

SELECT setval('public.users_id_seq', GREATEST((SELECT MAX(id) FROM public.users), 200));

-- 7. SEED MSAMB CREDIBILITY SCORECARDS
INSERT INTO public.buyer_scorecards (
  buyer_id, company_name, company_type, msamb_license_number, license_validity,
  overall_reliability_score, credit_tier, escrow_on_time_rate, avg_payment_release_hours,
  total_deals_completed, total_volume_cleared_quintals, total_escrow_disbursed_lakhs,
  unresolved_disputes_count, dispute_resolution_rate_pct, default_rate_pct,
  bank_nodal_partner, apmc_verified_depots, audited_year
) VALUES
  (
    101, 'Nagpur Agro-Processing Oil Mills', 'OIL_MILL', 'MH-NAG-TR-2024-5120', 'March 2028 (Active / Verified)',
    99.2, 'AAA_PLATINUM', 99.2, 4.2,
    52, 48200.0, 245.8,
    0, 100.0, 0.0,
    'State Bank of India (MSAMB Dedicated Agri-Escrow Node)',
    'Nagpur Central APMC, Kalmeshwar Depot, Hingna Processing Plant', 'FY 2025-26'
  ),
  (
    102, 'Adani Wilmar Consumer Hub', 'FOOD_PROCESSOR', 'MH-PUN-TR-2024-8891', 'December 2027 (Active / Verified)',
    99.8, 'AAA_PLATINUM', 99.8, 2.8,
    140, 185000.0, 940.0,
    0, 100.0, 0.0,
    'HDFC Bank Agri Escrow Division',
    'Pune Gultekdi Hub, Vashi Terminal, Daund Logistics Hub', 'FY 2025-26'
  ),
  (
    103, 'Haldiram Foods International', 'FOOD_PROCESSOR', 'MH-NAG-TR-2023-3490', 'October 2028 (Active / Verified)',
    98.9, 'AAA_PLATINUM', 98.9, 5.1,
    78, 62000.0, 310.5,
    0, 100.0, 0.0,
    'Bank of Maharashtra (Statutory Mandi Partner)',
    'Nagpur Food Park, Bhandara Road Depot, Wardha Hub', 'FY 2025-26'
  ),
  (
    104, 'ITC Agri-Business Division', 'AGRI_CONGLOMERATE', 'MH-NSK-TR-2024-1182', 'August 2027 (Active / Verified)',
    99.5, 'AAA_PLATINUM', 99.5, 3.4,
    115, 128000.0, 650.0,
    0, 100.0, 0.0,
    'State Bank of India (e-Choupal Nodal Node)',
    'Nashik APMC, Pimpalgaon Cold Storage Hub, Dindori Logistics Depot', 'FY 2025-26'
  ),
  (
    105, 'Sahyadri Farmers Producer Co. Ltd.', 'EXPORTER', 'MH-NSK-TR-2022-7721', 'June 2029 (Active / Verified)',
    99.1, 'AAA_PLATINUM', 99.1, 4.6,
    95, 84000.0, 420.0,
    0, 100.0, 0.0,
    'ICICI Bank Nodal Escrow Branch',
    'Mohadi Mega Food Park, Lasalgaon Rail Siding, Vashi Export Depot', 'FY 2025-26'
  ),
  (
    106, 'Wardha Cotton & Ginning Consortium', 'GINNING_MILL', 'MH-WRD-TR-2024-6610', 'January 2028 (Active / Verified)',
    97.8, 'AA_GOLD', 97.8, 6.4,
    34, 31000.0, 155.0,
    0, 100.0, 0.0,
    'Punjab National Bank Agri Node',
    'Wardha APMC Yard, Hinganghat Ginning Depot, Arvi Hub', 'FY 2025-26'
  )
ON CONFLICT (msamb_license_number) DO UPDATE
SET
  company_name = EXCLUDED.company_name,
  overall_reliability_score = EXCLUDED.overall_reliability_score,
  escrow_on_time_rate = EXCLUDED.escrow_on_time_rate,
  avg_payment_release_hours = EXCLUDED.avg_payment_release_hours,
  total_deals_completed = EXCLUDED.total_deals_completed,
  total_volume_cleared_quintals = EXCLUDED.total_volume_cleared_quintals;

SELECT setval('public.buyer_scorecards_id_seq', GREATEST((SELECT MAX(id) FROM public.buyer_scorecards), 20));

-- 8. SEED LIVE BUYER PROCUREMENT DEMANDS (Reverse RFQs)
INSERT INTO public.buyer_demands (
  id, buyer_id, buyer_name, company_name, company_type, commodity, variety,
  required_quantity_quintals, fulfilled_quantity_quintals, target_price_per_quintal,
  quality_grade_required, max_moisture_percent, delivery_hub, delivery_deadline,
  delivery_deadline_days, escrow_prefunded, status, notes
) VALUES
  (
    1, 101, 'Procurement Officer (Oilseed Wing)', 'Nagpur Agro-Processing Oil Mills', 'OIL_MILL', 'Soybean', 'JS-335 / Grade A Yellow',
    1000.0, 350.0, 5100.0,
    'Grade A', 9.5, 'Nagpur Central Agro-Processing Hub, Hingna', 'By Sep 25, 2026',
    14, true, 'PARTIALLY_FULFILLED', 'Bulk procurement for solvent extraction plant. 50% milestone escrow advance pre-funded.'
  ),
  (
    2, 102, 'Chief Sourcing Manager', 'Adani Wilmar Consumer Hub', 'FOOD_PROCESSOR', 'Soybean', 'Grade A Processing Standard',
    2500.0, 800.0, 5250.0,
    'Grade A+', 9.0, 'Pune Daund Logistics Terminal', 'By Sep 30, 2026',
    19, true, 'PARTIALLY_FULFILLED', 'High-oil content soybean procurement. Minimum batch size 50 Qtl. Guaranteed weighing slip settlement within 3 hours.'
  ),
  (
    3, 103, 'Sourcing Head (Snacks & F&B)', 'Haldiram Foods International', 'FOOD_PROCESSOR', 'Gram', 'Chana Desi Bold Grade A',
    800.0, 200.0, 6300.0,
    'Grade A', 10.0, 'Nagpur Food Park Hub (Butibori)', 'By Oct 05, 2026',
    24, true, 'PARTIALLY_FULFILLED', 'Procurement for besan and namkeen production line. Premium price for uniform grain size with <1% broken.'
  ),
  (
    4, 104, 'Procurement Coordinator', 'ITC Agri-Business Division', 'AGRI_CONGLOMERATE', 'Wheat', 'Lokwan / Sharbati Premium',
    1500.0, 0.0, 2850.0,
    'Grade A', 10.5, 'Nashik Pimpalgaon Processing Depot', 'By Oct 12, 2026',
    31, true, 'OPEN', 'Aashirvaad premium flour milling procurement. NABL moisture test verified farm gate pickups supported.'
  ),
  (
    5, 105, 'Export Sourcing Desk', 'Sahyadri Farmers Producer Co. Ltd.', 'EXPORTER', 'Onion', 'Garwa (Late Kharif Export Red)',
    1200.0, 450.0, 2600.0,
    'Grade A+', 11.0, 'Mohadi Mega Food Park, Nashik', 'By Sep 28, 2026',
    17, true, 'PARTIALLY_FULFILLED', 'Export consignments to UAE and Europe. Size 45-55mm, zero fungus, cold storage delivery protocol.'
  ),
  (
    6, 106, 'Ginning Mill Manager', 'Wardha Cotton & Ginning Consortium', 'GINNING_MILL', 'Cotton', 'Long Staple 29-31mm',
    1800.0, 600.0, 7800.0,
    'Grade A', 8.5, 'Wardha APMC Yard Processing Unit', 'By Oct 15, 2026',
    34, true, 'PARTIALLY_FULFILLED', 'Direct procurement for spinning mills. Trash < 3%, moisture < 8.5%. Cashless electronic escrow transfer on gin gate entry.'
  )
ON CONFLICT (id) DO UPDATE
SET
  fulfilled_quantity_quintals = EXCLUDED.fulfilled_quantity_quintals,
  target_price_per_quintal = EXCLUDED.target_price_per_quintal,
  status = EXCLUDED.status;

SELECT setval('public.buyer_demands_id_seq', GREATEST((SELECT MAX(id) FROM public.buyer_demands), 20));

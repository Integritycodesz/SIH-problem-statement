-- ====================================================================
-- AgroConnect: Remove Seeded Data & Reset Tables
-- Smart India Hackathon 2026 - Problem Statement ID: 26132
-- ====================================================================
-- This script removes all synthetic commodity prices and all demo/test
-- transactions (Lots, RFQs, Contracts, Escrow, Disputes, Notifications).
-- The 590 APMC Mandis directory is preserved for distance & freight calculation.
-- ====================================================================

-- 1. Remove synthetic commodity prices
TRUNCATE TABLE public.commodity_prices RESTART IDENTITY CASCADE;

-- 2. Remove all test produce lots (cascades to dependent records)
TRUNCATE TABLE public.produce_lots RESTART IDENTITY CASCADE;

-- 3. Remove all RFQs and negotiation messages
TRUNCATE TABLE public.rfqs RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.rfq_messages RESTART IDENTITY CASCADE;

-- 4. Remove all smart contracts and escrow payments
TRUNCATE TABLE public.contracts RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.escrow_payments RESTART IDENTITY CASCADE;

-- 5. Remove all dispute records
TRUNCATE TABLE public.disputes RESTART IDENTITY CASCADE;

-- 6. Remove all notification logs
TRUNCATE TABLE public.notifications RESTART IDENTITY CASCADE;

-- Re-enable RLS delete permissions for commodity_prices if needed
DROP POLICY IF EXISTS "Allow delete on commodity prices" ON public.commodity_prices;
CREATE POLICY "Allow delete on commodity prices" ON public.commodity_prices FOR DELETE USING (true);

-- Verification Query: Check counts
SELECT 'mandis' AS table_name, COUNT(*) AS remaining_count FROM public.mandis
UNION ALL
SELECT 'commodity_prices', COUNT(*) FROM public.commodity_prices
UNION ALL
SELECT 'produce_lots', COUNT(*) FROM public.produce_lots
UNION ALL
SELECT 'rfqs', COUNT(*) FROM public.rfqs
UNION ALL
SELECT 'contracts', COUNT(*) FROM public.contracts
UNION ALL
SELECT 'escrow_payments', COUNT(*) FROM public.escrow_payments
UNION ALL
SELECT 'disputes', COUNT(*) FROM public.disputes
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications;

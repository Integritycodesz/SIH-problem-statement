-- ====================================================================
-- AgroConnect Migration: Remove Initial Pre-Seeded Mock FPO Pools
-- Smart India Hackathon 2026 - Problem Statement ID: 26132
-- ====================================================================

-- 1. Remove mock pool member allocations
DELETE FROM public.fpo_pool_members 
WHERE pool_id IN (101, 102, 103, 104);

-- 2. Remove mock FPO pools
DELETE FROM public.fpo_pools 
WHERE id IN (101, 102, 103, 104) 
   OR fpo_name IN (
     'Sahyadri Farmers Producer Co. Ltd.',
     'Mahagrapes Farmers Producer Consortium',
     'Marathwada Oilseed & Pulse Kisan Producer Federation',
     'Vidarbha White Gold Cotton Producer Co.'
   );

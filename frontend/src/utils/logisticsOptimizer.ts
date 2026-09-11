/**
 * AgroConnect - Multi-Lot Consignment & Truckload Logistics Optimizer
 * Phase 3: Statutory Freight Pooling & Commercial Vehicle Allocation
 * Smart India Hackathon 2026 - Problem Statement ID: 26132
 */

import type { VehicleOption, ConsignmentPool, PooledLotItem } from '../types';

export const STANDARD_COMMERCIAL_VEHICLES: VehicleOption[] = [
  {
    type: 'MINI_TRUCK',
    name_en: 'Mini Commercial (Tata Ace / Bolero Maxi Truck)',
    name_mr: 'छोटा हत्ती / बोलेरो पिकअप (२.५ टन)',
    wheels: '4 Wheels',
    capacity_quintals: 25,
    capacity_tonnes: 2.5,
    base_rate_per_km: 18,
    min_distance_km: 20,
    diesel_efficiency_kmpl: 14.5,
    carrier_partner: 'MSAMB Kisan Vahan Mitra',
    vehicle_badge: 'Small Farmgate Run'
  },
  {
    type: 'MEDIUM_COMMERCIAL',
    name_en: 'Medium Commercial Vehicle (6-Tyre Eicher Pro 3015)',
    name_mr: '६-चाकी मध्यम ट्रक (आयशर ९.० टन)',
    wheels: '6 Wheels',
    capacity_quintals: 90,
    capacity_tonnes: 9.0,
    base_rate_per_km: 32,
    min_distance_km: 40,
    diesel_efficiency_kmpl: 6.8,
    carrier_partner: 'Maharashtra Agri-Logistics Corp (MALC)',
    vehicle_badge: 'FPO Cluster Direct'
  },
  {
    type: 'MULTI_AXLE_HEAVY',
    name_en: 'Heavy Multi-Axle Taurus (10-Tyre Ashok Leyland 2820)',
    name_mr: '१०-चाकी जड मालवाहू टॉरस (२० टन)',
    wheels: '10 Wheels',
    capacity_quintals: 200,
    capacity_tonnes: 20.0,
    base_rate_per_km: 52,
    min_distance_km: 80,
    diesel_efficiency_kmpl: 4.2,
    carrier_partner: 'Sahyadri Cold Chain & Agri-Freight',
    vehicle_badge: 'Highest Sourcing Savings'
  },
  {
    type: 'TRAILER_RIG',
    name_en: 'Heavy Multi-Trailer Carrier (16-Tyre BharatBenz 3528)',
    name_mr: '१६-चाकी भव्य ट्रेलर (३५ टन)',
    wheels: '16 Wheels',
    capacity_quintals: 350,
    capacity_tonnes: 35.0,
    base_rate_per_km: 76,
    min_distance_km: 120,
    diesel_efficiency_kmpl: 3.1,
    carrier_partner: 'VRL Agri-Industrial Logistics',
    vehicle_badge: 'Inter-State Processing Rig'
  }
];

export function getRecommendedVehicle(totalQuintals: number): VehicleOption {
  if (totalQuintals <= 28) {
    return STANDARD_COMMERCIAL_VEHICLES[0];
  } else if (totalQuintals <= 100) {
    return STANDARD_COMMERCIAL_VEHICLES[1];
  } else if (totalQuintals <= 220) {
    return STANDARD_COMMERCIAL_VEHICLES[2];
  } else {
    return STANDARD_COMMERCIAL_VEHICLES[3];
  }
}

export function calculateConsignmentFreight(
  lots: Array<Omit<PooledLotItem, 'freight_share_inr' | 'individual_freight_inr' | 'freight_savings_inr'>>,
  vehicle: VehicleOption,
  distanceKm: number
): {
  totalLoadedQuintals: number;
  utilizationPct: number;
  totalFreightInr: number;
  pooledRatePerQtl: number;
  avgIndividualRatePerQtl: number;
  totalSavingsInr: number;
  dieselSavedLiters: number;
  carbonEmissionReducedKg: number;
  enrichedLots: PooledLotItem[];
} {
  const totalLoadedQuintals = lots.reduce((acc, curr) => acc + curr.quantity_quintals, 0);
  const utilizationPct = Math.min(100, Math.round((totalLoadedQuintals / vehicle.capacity_quintals) * 1000) / 10);
  
  // Total trip freight cost
  const totalFreightInr = Math.round(Math.max(vehicle.base_rate_per_km * distanceKm, vehicle.base_rate_per_km * vehicle.min_distance_km));
  
  // Rate per quintal under pooling
  const pooledRatePerQtl = totalLoadedQuintals > 0 ? Math.round(totalFreightInr / totalLoadedQuintals) : 0;
  
  // Prevailing standalone tractor / individual auto rates per quintal (typically ₹160 - ₹220/Qtl for 20-50km trips)
  const avgIndividualRatePerQtl = Math.round(Math.max(140, distanceKm * 1.85));

  let totalSavingsInr = 0;
  const enrichedLots: PooledLotItem[] = lots.map((lot) => {
    const individualFreight = Math.round(lot.quantity_quintals * avgIndividualRatePerQtl);
    const pooledFreight = Math.round(lot.quantity_quintals * pooledRatePerQtl);
    const savings = Math.max(0, individualFreight - pooledFreight);
    totalSavingsInr += savings;

    return {
      ...lot,
      freight_share_inr: pooledFreight,
      individual_freight_inr: individualFreight,
      freight_savings_inr: savings
    };
  });

  // Environmental impact: 4 separate small diesel vehicles vs 1 heavy truck
  const separateVehicleTrips = Math.max(1, lots.length);
  const estimatedDieselIndividual = separateVehicleTrips * (distanceKm / 8.0);
  const estimatedDieselPooled = distanceKm / vehicle.diesel_efficiency_kmpl;
  const dieselSavedLiters = Math.max(0, Math.round((estimatedDieselIndividual - estimatedDieselPooled) * 10) / 10);
  const carbonEmissionReducedKg = Math.round(dieselSavedLiters * 2.68 * 10) / 10; // 2.68 kg CO2 per liter of diesel

  return {
    totalLoadedQuintals,
    utilizationPct,
    totalFreightInr,
    pooledRatePerQtl,
    avgIndividualRatePerQtl,
    totalSavingsInr,
    dieselSavedLiters,
    carbonEmissionReducedKg,
    enrichedLots
  };
}

export const INITIAL_CONSIGNMENT_POOLS: ConsignmentPool[] = [
  {
    id: 'pool-nag-soy-101',
    pool_code: 'AGC-TRUCK-2026-NAG-101',
    demand_id: 101,
    destination_hub: 'Nagpur Hingna Industrial Area',
    destination_mill: 'Nagpur Oil Mills & Agro Refineries Pvt Ltd',
    commodity: 'Soybean',
    vehicle: STANDARD_COMMERCIAL_VEHICLES[2], // 10-Tyre Taurus
    carrier_name: 'Maharashtra Agri-Logistics Corp (MALC)',
    vehicle_number: 'MH-31-CB-8492',
    driver_name: 'Pandurang Garad',
    driver_phone: '+91 98231 44550',
    total_capacity_quintals: 200,
    loaded_quantity_quintals: 185,
    utilization_percent: 92.5,
    total_distance_km: 145,
    total_freight_cost_inr: 7540,
    pooled_cost_per_quintal: 41,
    individual_cost_per_quintal: 165,
    total_savings_inr: 22940,
    status: 'OPTIMAL_FULL',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    dispatch_eta: 'Today, 04:30 PM (Pickup Route: Wardha -> Hinganghat -> Nagpur)',
    security_seal_number: 'MSAMB-SEAL-88914',
    lots: [
      {
        id: 'lot-p1',
        farmer_id: 1,
        farmer_name: 'Balasaheb Shinde (Kisan FPO)',
        farmer_phone: '+91 98220 12345',
        village: 'Seloo',
        district: 'Wardha',
        commodity: 'Soybean',
        variety: 'JS-335 Grade A',
        quantity_quintals: 80,
        pickup_order: 1,
        pickup_status: 'LOADED',
        freight_share_inr: 3280,
        individual_freight_inr: 13200,
        freight_savings_inr: 9920
      },
      {
        id: 'lot-p2',
        farmer_id: 6,
        farmer_name: 'Gajanan Deshmukh',
        farmer_phone: '+91 94228 77651',
        village: 'Samudrapur',
        district: 'Wardha',
        commodity: 'Soybean',
        variety: 'JS-335 Yellow',
        quantity_quintals: 65,
        pickup_order: 2,
        pickup_status: 'LOADED',
        freight_share_inr: 2665,
        individual_freight_inr: 10725,
        freight_savings_inr: 8060
      },
      {
        id: 'lot-p3',
        farmer_id: 8,
        farmer_name: 'Rameshwar Pawar',
        farmer_phone: '+91 97654 32110',
        village: 'Hinganghat APMC Hub',
        district: 'Wardha',
        commodity: 'Soybean',
        variety: 'JS-9305 Bolt',
        quantity_quintals: 40,
        pickup_order: 3,
        pickup_status: 'QUEUED',
        freight_share_inr: 1640,
        individual_freight_inr: 6600,
        freight_savings_inr: 4960
      }
    ]
  },
  {
    id: 'pool-war-cot-102',
    pool_code: 'AGC-TRUCK-2026-WAR-102',
    demand_id: 104,
    destination_hub: 'Wardha Cotton Industrial Corridor',
    destination_mill: 'Wardha Cotton Ginning & Pressing Co-op',
    commodity: 'Cotton',
    vehicle: STANDARD_COMMERCIAL_VEHICLES[1], // 6-Tyre
    carrier_name: 'Sahyadri Cold Chain & Agri-Freight',
    vehicle_number: 'MH-32-T-6712',
    driver_name: 'Kailas Jadhav',
    driver_phone: '+91 99214 88310',
    total_capacity_quintals: 90,
    loaded_quantity_quintals: 75,
    utilization_percent: 83.3,
    total_distance_km: 85,
    total_freight_cost_inr: 2720,
    pooled_cost_per_quintal: 36,
    individual_cost_per_quintal: 140,
    total_savings_inr: 7800,
    status: 'OPEN_FOR_POOLING',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    dispatch_eta: 'Tomorrow, 08:00 AM (Pickup Route: Arvi -> Deoli -> Wardha)',
    security_seal_number: 'MSAMB-SEAL-77301',
    lots: [
      {
        id: 'lot-p4',
        farmer_id: 1,
        farmer_name: 'Balasaheb Shinde',
        farmer_phone: '+91 98220 12345',
        village: 'Rohana',
        district: 'Wardha',
        commodity: 'Cotton',
        variety: 'Bunny BT Extra Long',
        quantity_quintals: 45,
        pickup_order: 1,
        pickup_status: 'QUEUED',
        freight_share_inr: 1620,
        individual_freight_inr: 6300,
        freight_savings_inr: 4680
      },
      {
        id: 'lot-p5',
        farmer_id: 7,
        farmer_name: 'Vilasrao Kale',
        farmer_phone: '+91 98901 23489',
        village: 'Karanja Ghadge',
        district: 'Wardha',
        commodity: 'Cotton',
        variety: 'Bunny BT Grade A',
        quantity_quintals: 30,
        pickup_order: 2,
        pickup_status: 'QUEUED',
        freight_share_inr: 1080,
        individual_freight_inr: 4200,
        freight_savings_inr: 3120
      }
    ]
  }
];

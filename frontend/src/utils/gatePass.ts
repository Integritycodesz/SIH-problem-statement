/**
 * AgroConnect - Digital Gate Pass & Mill Weighbridge Verification
 * Phase 4: Electronic Mill Entry, Dual-Scale Weighment & Escrow Trigger
 * Smart India Hackathon 2026 - Problem Statement ID: 26132
 */

import type { DigitalGatePass } from '../types';
import { calculateQualityRefraction, getCommodityRefractionSchedule } from './refraction';

export function generateGatePassNumber(millCode: string = 'NAG'): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `MH-GP-2026-${millCode.toUpperCase()}-${randomDigits}`;
}

export function computeWeighbridgeSettlement(
  grossWeightKg: number,
  tareWeightKg: number,
  basePricePerQuintal: number,
  commodity: string,
  moisturePct: number,
  foreignMatterPct: number,
  damagedPct: number,
  escrowAdvanceHeldInr: number = 0
): {
  netProduceKg: number;
  netProduceQuintals: number;
  refractionDeductionInr: number;
  grossAmountInr: number;
  netPayableInr: number;
  finalSettlementReleasedInr: number;
  refractionSummaryEn: string;
  refractionSummaryMr: string;
} {
  const netProduceKg = Math.max(0, grossWeightKg - tareWeightKg);
  const netProduceQuintals = Math.round((netProduceKg / 100) * 100) / 100; // 100 kg = 1 quintal

  const schedule = getCommodityRefractionSchedule(commodity);
  const refractionResult = calculateQualityRefraction(
    {
      gross_weight_quintals: netProduceQuintals,
      base_price_per_quintal: basePricePerQuintal,
      tested_moisture_pct: moisturePct,
      tested_foreign_matter_pct: foreignMatterPct,
      tested_damaged_pct: damagedPct
    },
    schedule
  );

  const grossAmountInr = Math.round(netProduceQuintals * basePricePerQuintal);
  const netPayableInr = refractionResult.net_total_amount;
  const refractionDeductionInr = refractionResult.total_refraction_discount_amount;
  
  // Escrow milestone release: net payable minus already paid 50% advance
  const finalSettlementReleasedInr = Math.max(0, netPayableInr - escrowAdvanceHeldInr);

  return {
    netProduceKg,
    netProduceQuintals,
    refractionDeductionInr,
    grossAmountInr,
    netPayableInr,
    finalSettlementReleasedInr,
    refractionSummaryEn: `${refractionResult.status_label_en} (-₹${refractionDeductionInr.toLocaleString('en-IN')})`,
    refractionSummaryMr: `${refractionResult.status_label_mr} (-₹${refractionDeductionInr.toLocaleString('en-IN')})`
  };
}

export const INITIAL_GATE_PASSES: DigitalGatePass[] = [
  {
    id: 'gp-nag-4089',
    pass_number: 'MH-GP-2026-NAG-4089',
    contract_id: 1,
    contract_number: 'AGC-MH-2026-NAG-0182',
    truck_number: 'MH-31-CB-8492',
    driver_name: 'Pandurang Garad',
    driver_phone: '+91 98231 44550',
    carrier_name: 'Maharashtra Agri-Logistics Corp (MALC)',
    commodity: 'Soybean',
    variety: 'JS-335 Grade A',
    farmer_id: 1,
    farmer_name: 'Balasaheb Shinde (Kisan FPO)',
    farmer_phone: '+91 98220 12345',
    buyer_id: 2,
    buyer_name: 'Nagpur Oil Mills & Agro Refineries Pvt Ltd',
    destination_mill: 'Nagpur Oil Mills Gate 1, Hingna MIDC, Nagpur',
    destination_district: 'Nagpur',
    estimated_quantity_quintals: 150,
    
    gross_weight_kg: 28450,
    tare_weight_kg: 9950,
    net_produce_kg: 18500,
    net_produce_quintals: 185.0,
    
    tested_moisture_pct: 11.2,
    tested_foreign_matter_pct: 0.8,
    tested_damaged_pct: 1.4,
    
    base_price_per_quintal: 5100,
    refraction_deduction_amount: 0,
    net_payable_amount: 943500,
    escrow_advance_deducted: 471750,
    final_settlement_released: 471750,
    
    gate_in_time: '2026-09-11 11:20 AM',
    gross_weigh_time: '2026-09-11 11:32 AM',
    quality_test_time: '2026-09-11 11:45 AM',
    tare_weigh_time: '2026-09-11 12:10 PM',
    gate_out_time: '2026-09-11 12:25 PM',
    
    status: 'PAYMENT_TRIGGERED',
    qr_code_token: 'MSAMB-GP-SEC-HASH-99812-NAGPUR-MILL-VERIFIED',
    security_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    weighbridge_operator: 'Suresh B. Meshram (Lic. #WB-8812)',
    weighbridge_terminal_id: 'WB-SCALE-BAY-02-NAGPUR'
  },
  {
    id: 'gp-war-3021',
    pass_number: 'MH-GP-2026-WAR-3021',
    contract_id: 4,
    contract_number: 'AGC-MH-2026-WAR-0094',
    truck_number: 'MH-32-T-6712',
    driver_name: 'Kailas Jadhav',
    driver_phone: '+91 99214 88310',
    carrier_name: 'Sahyadri Cold Chain & Agri-Freight',
    commodity: 'Cotton',
    variety: 'Bunny BT Extra Long',
    farmer_id: 1,
    farmer_name: 'Balasaheb Shinde',
    farmer_phone: '+91 98220 12345',
    buyer_id: 5,
    buyer_name: 'Wardha Cotton Ginning & Pressing Co-op',
    destination_mill: 'Wardha Ginning Complex Bay 3, MIDC Wardha',
    destination_district: 'Wardha',
    estimated_quantity_quintals: 75,
    
    gross_weight_kg: 17200,
    tare_weight_kg: 9700,
    net_produce_kg: 7500,
    net_produce_quintals: 75.0,
    
    tested_moisture_pct: 8.5,
    tested_foreign_matter_pct: 1.2,
    tested_damaged_pct: 1.0,
    
    base_price_per_quintal: 7200,
    refraction_deduction_amount: 1080,
    net_payable_amount: 538920,
    escrow_advance_deducted: 270000,
    final_settlement_released: 268920,
    
    gate_in_time: '2026-09-11 02:15 PM',
    gross_weigh_time: '2026-09-11 02:28 PM',
    quality_test_time: '2026-09-11 02:40 PM',
    tare_weigh_time: undefined,
    gate_out_time: undefined,
    
    status: 'QUALITY_ASSAYED',
    qr_code_token: 'MSAMB-GP-SEC-HASH-77412-WARDHA-GINNING-VERIFIED',
    security_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    weighbridge_operator: 'Devidas Shingne (Lic. #WB-5541)',
    weighbridge_terminal_id: 'WB-SCALE-BAY-01-WARDHA'
  }
];

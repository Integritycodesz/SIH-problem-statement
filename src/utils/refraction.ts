import type { RefractionSchedule, RefractionInputParams, RefractionCalculationResult } from '../types';

/**
 * Standard Statutory Refraction Schedules under Maharashtra APMC Rules & AGMARK Standards
 */
export const STATUTORY_REFRACTION_SCHEDULES: Record<string, RefractionSchedule> = {
  Soybean: {
    commodity: 'Soybean',
    base_moisture_pct: 10.0,
    permissible_moisture_pct: 12.0,
    moisture_penalty_rate_pct: 0.75, // 0.75% price cut per 1% excess moisture
    max_tolerable_moisture_pct: 14.5,
    permissible_foreign_matter_pct: 1.0,
    foreign_matter_penalty_mode: 'NET_WEIGHT_DEDUCTION',
    permissible_damaged_grains_pct: 2.0,
    damaged_penalty_rate_pct: 0.50, // 0.50% price cut per 1% excess damaged
    statutory_rule_ref: 'MSAMB / Model APMC Act 1963 (Rule 38) & AGMARK Grade Standard'
  },
  Cotton: {
    commodity: 'Cotton',
    base_moisture_pct: 8.0,
    permissible_moisture_pct: 10.0,
    moisture_penalty_rate_pct: 1.0, // 1.0% price cut per 1% excess moisture
    max_tolerable_moisture_pct: 12.5,
    permissible_foreign_matter_pct: 2.0,
    foreign_matter_penalty_mode: 'NET_WEIGHT_DEDUCTION',
    permissible_damaged_grains_pct: 2.5,
    damaged_penalty_rate_pct: 0.75,
    statutory_rule_ref: 'Cotton Corporation of India (CCI) Fair Average Quality (FAQ) Schedule'
  },
  Onion: {
    commodity: 'Onion',
    base_moisture_pct: 10.0,
    permissible_moisture_pct: 12.5,
    moisture_penalty_rate_pct: 0.80,
    max_tolerable_moisture_pct: 15.0,
    permissible_foreign_matter_pct: 1.5,
    foreign_matter_penalty_mode: 'NET_WEIGHT_DEDUCTION',
    permissible_damaged_grains_pct: 3.0,
    damaged_penalty_rate_pct: 0.60,
    statutory_rule_ref: 'APEDA / NAFED Export & Mandi Refraction Schedule'
  },
  Wheat: {
    commodity: 'Wheat',
    base_moisture_pct: 10.0,
    permissible_moisture_pct: 12.0,
    moisture_penalty_rate_pct: 0.70,
    max_tolerable_moisture_pct: 14.0,
    permissible_foreign_matter_pct: 0.75,
    foreign_matter_penalty_mode: 'NET_WEIGHT_DEDUCTION',
    permissible_damaged_grains_pct: 2.0,
    damaged_penalty_rate_pct: 0.50,
    statutory_rule_ref: 'Food Corporation of India (FCI) & CACP Uniform Specification'
  },
  Gram: {
    commodity: 'Gram',
    base_moisture_pct: 9.0,
    permissible_moisture_pct: 11.0,
    moisture_penalty_rate_pct: 0.75,
    max_tolerable_moisture_pct: 13.5,
    permissible_foreign_matter_pct: 1.0,
    foreign_matter_penalty_mode: 'NET_WEIGHT_DEDUCTION',
    permissible_damaged_grains_pct: 2.0,
    damaged_penalty_rate_pct: 0.50,
    statutory_rule_ref: 'NAFED PSS Procurement Refraction Schedule'
  }
};

/**
 * Retrieve statutory refraction schedule for a given commodity, with fallback
 */
export function getCommodityRefractionSchedule(commodityName: string): RefractionSchedule {
  const norm = Object.keys(STATUTORY_REFRACTION_SCHEDULES).find(
    k => commodityName.toLowerCase().includes(k.toLowerCase())
  );
  if (norm) {
    return STATUTORY_REFRACTION_SCHEDULES[norm];
  }

  // Default universal schedule
  return {
    commodity: commodityName || 'General Agri-Commodity',
    base_moisture_pct: 10.0,
    permissible_moisture_pct: 12.0,
    moisture_penalty_rate_pct: 0.75,
    max_tolerable_moisture_pct: 14.0,
    permissible_foreign_matter_pct: 1.0,
    foreign_matter_penalty_mode: 'NET_WEIGHT_DEDUCTION',
    permissible_damaged_grains_pct: 2.0,
    damaged_penalty_rate_pct: 0.50,
    statutory_rule_ref: 'Maharashtra State APMC Uniform Schedule (Rule 38)'
  };
}

/**
 * Core Statutory Quality Refraction Calculation Engine
 */
export function calculateQualityRefraction(
  params: RefractionInputParams,
  customSchedule?: RefractionSchedule
): RefractionCalculationResult {
  const schedule = customSchedule || getCommodityRefractionSchedule('Soybean');
  
  const grossWeight = Math.max(0, Number(params.gross_weight_quintals) || 0);
  const basePrice = Math.max(0, Number(params.base_price_per_quintal) || 0);
  const testedMoisture = Math.max(0, Number(params.tested_moisture_pct) || 0);
  const testedFM = Math.max(0, Number(params.tested_foreign_matter_pct) || 0);
  const testedDamaged = Math.max(0, Number(params.tested_damaged_pct) || 0);

  // 1. Foreign Matter / Dirt net weight deduction
  const fmExcess = Math.max(0, Number((testedFM - schedule.permissible_foreign_matter_pct).toFixed(2)));
  const fmDeductionQuintals = Number(((grossWeight * fmExcess) / 100).toFixed(3));
  const netWeight = Math.max(0, Number((grossWeight - fmDeductionQuintals).toFixed(3)));

  // 2. Moisture price deduction
  const moistureExcess = Math.max(0, Number((testedMoisture - schedule.permissible_moisture_pct).toFixed(2)));
  const moisturePenaltyPct = Number((moistureExcess * schedule.moisture_penalty_rate_pct).toFixed(3));
  const moistureDeductionPerQtl = Number(((basePrice * moisturePenaltyPct) / 100).toFixed(2));

  // 3. Damaged / Shriveled price deduction
  const damagedExcess = Math.max(0, Number((testedDamaged - schedule.permissible_damaged_grains_pct).toFixed(2)));
  const damagedPenaltyPct = Number((damagedExcess * schedule.damaged_penalty_rate_pct).toFixed(3));
  const damagedDeductionPerQtl = Number(((basePrice * damagedPenaltyPct) / 100).toFixed(2));

  // Total price deduction
  const totalPriceDeductionPerQtl = Number((moistureDeductionPerQtl + damagedDeductionPerQtl).toFixed(2));
  const netPricePerQtl = Math.max(0, Number((basePrice - totalPriceDeductionPerQtl).toFixed(2)));

  // Totals
  const grossTotalAmount = Math.round(grossWeight * basePrice);
  const netTotalAmount = Math.round(netWeight * netPricePerQtl);
  const totalRefractionDiscount = Math.max(0, grossTotalAmount - netTotalAmount);
  const effectiveDeductionPct = grossTotalAmount > 0 
    ? Number(((totalRefractionDiscount / grossTotalAmount) * 100).toFixed(2)) 
    : 0;

  // Status classification
  let status: RefractionCalculationResult['acceptance_status'] = 'FULL_ACCEPTANCE';
  let labelEn = 'Optimal Quality (100% Payout - No Deductions)';
  let labelMr = 'सर्वोत्कृष्ट गुणवत्ता (१००% पूर्ण देयक - शून्य वजावट)';

  if (testedMoisture > schedule.max_tolerable_moisture_pct || testedFM > (schedule.permissible_foreign_matter_pct * 3.5)) {
    status = 'REJECTION_RISK';
    labelEn = 'Critical Tolerance Breach: Subject to Mill Gate Rejection';
    labelMr = 'गंभीर अपवर्तन मर्यादा उल्लंघन: मिल गेट नाकारण्याची शक्यता';
  } else if (moistureExcess > 1.8 || fmExcess > 1.5 || damagedExcess > 2.0) {
    status = 'HIGH_REFRACTION_WARNING';
    labelEn = 'Substantial Refraction: Heavy Price/Weight Adjustments';
    labelMr = 'अधिक अपवर्तन कपात: जास्त दर/वजन वजावट लागू';
  } else if (fmExcess > 0 || moistureExcess > 0 || damagedExcess > 0) {
    status = 'STANDARD_REFRACTION_APPLIED';
    labelEn = 'Standard APMC Refraction Applied (Fair Sourcing Terms)';
    labelMr = 'प्रमाणित बाजार समिती अपवर्तन लागू (पारदर्शक दर कपात)';
  }

  return {
    schedule,
    params: {
      gross_weight_quintals: grossWeight,
      base_price_per_quintal: basePrice,
      tested_moisture_pct: testedMoisture,
      tested_foreign_matter_pct: testedFM,
      tested_damaged_pct: testedDamaged
    },
    gross_weight_quintals: grossWeight,
    foreign_matter_excess_pct: fmExcess,
    foreign_matter_deduction_quintals: fmDeductionQuintals,
    net_weight_quintals: netWeight,
    base_price_per_quintal: basePrice,
    moisture_excess_pct: moistureExcess,
    moisture_penalty_rate_applied_pct: moisturePenaltyPct,
    moisture_deduction_per_quintal: moistureDeductionPerQtl,
    damaged_excess_pct: damagedExcess,
    damaged_penalty_rate_applied_pct: damagedPenaltyPct,
    damaged_deduction_per_quintal: damagedDeductionPerQtl,
    total_price_deduction_per_quintal: totalPriceDeductionPerQtl,
    net_price_per_quintal: netPricePerQtl,
    gross_total_amount: grossTotalAmount,
    net_total_amount: netTotalAmount,
    total_refraction_discount_amount: totalRefractionDiscount,
    effective_deduction_pct: effectiveDeductionPct,
    acceptance_status: status,
    status_label_en: labelEn,
    status_label_mr: labelMr
  };
}

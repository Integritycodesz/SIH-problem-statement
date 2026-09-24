/**
 * AgroConnect Agricultural Preservation & Price Forecast Engine
 * Multi-Factor Econometric, Post-Harvest Physical Loss (Driage), and e-NWR Carrying Cost Engine
 * Smart India Hackathon 2026 - Problem Statement ID: 26132
 */

export interface CropPreservationProfile {
  commodity: string;
  category: 'GRAIN' | 'PULSE' | 'OILSEED' | 'HORTICULTURE_PERISHABLE' | 'BULB_SEMI_PERISHABLE' | 'FIBRE';
  recommendedStorageType: 'WDRA_DRY_GODOWN' | 'WDRA_COLD_STORAGE' | 'VENTILATED_ONION_CHAWL' | 'SILO';
  storageRentPerQtlPerDay: number; // in INR
  handlingAndInsurancePerQtl: number; // in INR
  maxSafeHoldingDays: number;
  monthlyDriageRatePct: number; // Moisture shrinkage & respiration loss per 30 days
  monthlyRotRiskPct: number; // Spoilage/rot loss per 30 days in recommended storage
  harvestMonths: number[]; // 1-12 calendar months (1 = Jan, 12 = Dec)
  leanMonths: number[]; // Months of historic supply scarcity / price peaks
  baseAnnualVolatilityPct: number;
  elasticityFactor: number; // Price response to arrival contractions
}

export const CROP_PRESERVATION_DATABASE: Record<string, CropPreservationProfile> = {
  'Soybean': {
    commodity: 'Soybean',
    category: 'OILSEED',
    recommendedStorageType: 'WDRA_DRY_GODOWN',
    storageRentPerQtlPerDay: 0.85,
    handlingAndInsurancePerQtl: 14.0,
    maxSafeHoldingDays: 240,
    monthlyDriageRatePct: 0.45,
    monthlyRotRiskPct: 0.15,
    harvestMonths: [10, 11, 12], // Kharif peak arrivals: Oct-Dec
    leanMonths: [4, 5, 6, 7], // Lean crushing demand peak: Apr-Jul
    baseAnnualVolatilityPct: 18.0,
    elasticityFactor: 0.85
  },
  'Onion': {
    commodity: 'Onion',
    category: 'BULB_SEMI_PERISHABLE',
    recommendedStorageType: 'VENTILATED_ONION_CHAWL',
    storageRentPerQtlPerDay: 1.10,
    handlingAndInsurancePerQtl: 18.0,
    maxSafeHoldingDays: 150,
    monthlyDriageRatePct: 2.8, // Onion sheds significant weight due to respiration
    monthlyRotRiskPct: 2.2, // Spoilage / sprouting risk
    harvestMonths: [11, 12, 1, 3, 4, 5], // Kharif (Nov-Jan), Rabi (Mar-May)
    leanMonths: [8, 9, 10], // Pre-Diwali lean supply peak: Aug-Oct
    baseAnnualVolatilityPct: 45.0,
    elasticityFactor: 1.45
  },
  'Cotton': {
    commodity: 'Cotton',
    category: 'FIBRE',
    recommendedStorageType: 'WDRA_DRY_GODOWN',
    storageRentPerQtlPerDay: 0.95,
    handlingAndInsurancePerQtl: 16.0,
    maxSafeHoldingDays: 300,
    monthlyDriageRatePct: 0.20,
    monthlyRotRiskPct: 0.10,
    harvestMonths: [11, 12, 1, 2],
    leanMonths: [6, 7, 8],
    baseAnnualVolatilityPct: 15.0,
    elasticityFactor: 0.75
  },
  'Wheat': {
    commodity: 'Wheat',
    category: 'GRAIN',
    recommendedStorageType: 'WDRA_DRY_GODOWN',
    storageRentPerQtlPerDay: 0.75,
    handlingAndInsurancePerQtl: 12.0,
    maxSafeHoldingDays: 360,
    monthlyDriageRatePct: 0.30,
    monthlyRotRiskPct: 0.10,
    harvestMonths: [3, 4, 5], // Rabi harvest
    leanMonths: [11, 12, 1], // Winter demand
    baseAnnualVolatilityPct: 12.0,
    elasticityFactor: 0.65
  },
  'Gram': {
    commodity: 'Gram',
    category: 'PULSE',
    recommendedStorageType: 'WDRA_DRY_GODOWN',
    storageRentPerQtlPerDay: 0.80,
    handlingAndInsurancePerQtl: 14.0,
    maxSafeHoldingDays: 270,
    monthlyDriageRatePct: 0.35,
    monthlyRotRiskPct: 0.15,
    harvestMonths: [2, 3, 4],
    leanMonths: [9, 10, 11], // Festive season pulse surge
    baseAnnualVolatilityPct: 20.0,
    elasticityFactor: 0.90
  },
  'Tur': {
    commodity: 'Tur',
    category: 'PULSE',
    recommendedStorageType: 'WDRA_DRY_GODOWN',
    storageRentPerQtlPerDay: 0.85,
    handlingAndInsurancePerQtl: 15.0,
    maxSafeHoldingDays: 270,
    monthlyDriageRatePct: 0.40,
    monthlyRotRiskPct: 0.20,
    harvestMonths: [12, 1, 2],
    leanMonths: [7, 8, 9, 10],
    baseAnnualVolatilityPct: 22.0,
    elasticityFactor: 0.95
  },
  'Maize': {
    commodity: 'Maize',
    category: 'GRAIN',
    recommendedStorageType: 'WDRA_DRY_GODOWN',
    storageRentPerQtlPerDay: 0.75,
    handlingAndInsurancePerQtl: 12.0,
    maxSafeHoldingDays: 180,
    monthlyDriageRatePct: 0.50,
    monthlyRotRiskPct: 0.30,
    harvestMonths: [10, 11, 12],
    leanMonths: [5, 6, 7],
    baseAnnualVolatilityPct: 16.0,
    elasticityFactor: 0.70
  },
  'Tomato': {
    commodity: 'Tomato',
    category: 'HORTICULTURE_PERISHABLE',
    recommendedStorageType: 'WDRA_COLD_STORAGE',
    storageRentPerQtlPerDay: 2.20, // Cold chain power tariff
    handlingAndInsurancePerQtl: 24.0,
    maxSafeHoldingDays: 21,
    monthlyDriageRatePct: 9.0,
    monthlyRotRiskPct: 12.0,
    harvestMonths: [1, 2, 3, 4, 7, 8, 9, 10, 11, 12],
    leanMonths: [5, 6],
    baseAnnualVolatilityPct: 75.0,
    elasticityFactor: 2.10
  },
  'Potato': {
    commodity: 'Potato',
    category: 'HORTICULTURE_PERISHABLE',
    recommendedStorageType: 'WDRA_COLD_STORAGE',
    storageRentPerQtlPerDay: 1.60,
    handlingAndInsurancePerQtl: 20.0,
    maxSafeHoldingDays: 180,
    monthlyDriageRatePct: 1.2,
    monthlyRotRiskPct: 0.8,
    harvestMonths: [1, 2, 3],
    leanMonths: [8, 9, 10, 11],
    baseAnnualVolatilityPct: 35.0,
    elasticityFactor: 1.25
  },
  'Banana': {
    commodity: 'Banana',
    category: 'HORTICULTURE_PERISHABLE',
    recommendedStorageType: 'WDRA_COLD_STORAGE',
    storageRentPerQtlPerDay: 1.95,
    handlingAndInsurancePerQtl: 22.0,
    maxSafeHoldingDays: 28,
    monthlyDriageRatePct: 6.5,
    monthlyRotRiskPct: 8.0,
    harvestMonths: [8, 9, 10, 11, 12],
    leanMonths: [4, 5, 6],
    baseAnnualVolatilityPct: 40.0,
    elasticityFactor: 1.50
  },
  'Orange': {
    commodity: 'Orange',
    category: 'HORTICULTURE_PERISHABLE',
    recommendedStorageType: 'WDRA_COLD_STORAGE',
    storageRentPerQtlPerDay: 1.85,
    handlingAndInsurancePerQtl: 20.0,
    maxSafeHoldingDays: 60,
    monthlyDriageRatePct: 3.2,
    monthlyRotRiskPct: 3.5,
    harvestMonths: [10, 11, 12, 1, 2, 3],
    leanMonths: [6, 7, 8],
    baseAnnualVolatilityPct: 38.0,
    elasticityFactor: 1.35
  },
  'Grapes': {
    commodity: 'Grapes',
    category: 'HORTICULTURE_PERISHABLE',
    recommendedStorageType: 'WDRA_COLD_STORAGE',
    storageRentPerQtlPerDay: 2.40,
    handlingAndInsurancePerQtl: 26.0,
    maxSafeHoldingDays: 45,
    monthlyDriageRatePct: 4.5,
    monthlyRotRiskPct: 5.0,
    harvestMonths: [1, 2, 3, 4],
    leanMonths: [7, 8, 9],
    baseAnnualVolatilityPct: 50.0,
    elasticityFactor: 1.65
  },
  'Pomegranate': {
    commodity: 'Pomegranate',
    category: 'HORTICULTURE_PERISHABLE',
    recommendedStorageType: 'WDRA_COLD_STORAGE',
    storageRentPerQtlPerDay: 2.10,
    handlingAndInsurancePerQtl: 24.0,
    maxSafeHoldingDays: 90,
    monthlyDriageRatePct: 2.5,
    monthlyRotRiskPct: 2.0,
    harvestMonths: [7, 8, 9, 12, 1, 2],
    leanMonths: [4, 5],
    baseAnnualVolatilityPct: 42.0,
    elasticityFactor: 1.40
  },
  'Garlic': {
    commodity: 'Garlic',
    category: 'BULB_SEMI_PERISHABLE',
    recommendedStorageType: 'WDRA_COLD_STORAGE',
    storageRentPerQtlPerDay: 1.70,
    handlingAndInsurancePerQtl: 18.0,
    maxSafeHoldingDays: 210,
    monthlyDriageRatePct: 1.8,
    monthlyRotRiskPct: 1.2,
    harvestMonths: [2, 3, 4],
    leanMonths: [10, 11, 12],
    baseAnnualVolatilityPct: 55.0,
    elasticityFactor: 1.55
  }
};

export interface ScenarioPriceProjection {
  scenario: 'BEARISH' | 'BASE_EXPECTED' | 'BULLISH';
  projectedPricePerQtl: number;
  grossAppreciationPct: number;
  netAlphaPerQtl: number;
  totalLotAlphaInr: number;
  confidenceScorePct: number;
  primaryMarketDriverEn: string;
  primaryMarketDriverMr: string;
}

export interface HoldVsSellAnalysis {
  commodity: string;
  profile: CropPreservationProfile;
  holdDays: number;
  initialQuantityQuintals: number;
  currentSpotPricePerQtl: number;
  mspBenchmarkFloor: number;
  
  // Physical Preservation Metrics
  driageLossQuintals: number;
  driageLossPct: number;
  rotLossQuintals: number;
  effectiveMarketableWeightQuintals: number;
  storageHealthRating: 'OPTIMAL' | 'MODERATE_RISK' | 'EXCEEDED_SHELF_LIFE';

  // Cost of Carry
  storageRentTotalInr: number;
  handlingInsuranceTotalInr: number;
  pledgeLoanInterestInr: number; // At 7% p.a. e-NWR rate
  totalCarryingCostPerQtl: number;
  totalCarryingCostLotInr: number;

  // Immediate Sale Reference
  immediateNetTakeHomePerQtl: number;
  immediateTotalCashInr: number;

  // Multi-Scenario Fan Chart
  scenarios: {
    bearish: ScenarioPriceProjection;
    base: ScenarioPriceProjection;
    bullish: ScenarioPriceProjection;
  };

  // e-NWR Liquidity Anchor
  enwrEligibleLoanAmountInr: number; // 70% LTV of Spot Value
  enwrMonthlyInterestInr: number;

  // Core Recommendation
  strategicAction: 'STRONG_HOLD_WDRA' | 'HOLD_WITH_ENWR_PLEDGE' | 'STAGGERED_SELL' | 'SELL_NOW_SPOT';
  recommendationBadgeColor: string;
  recommendationHeadlineEn: string;
  recommendationHeadlineMr: string;
  justificationEn: string;
  justificationMr: string;
}

/**
 * Computes an industry-grade Hold vs Sell forecast by fusing:
 * 1. Physical driage & perishability shrinkage
 * 2. Cropping season harmonics (Current month vs harvest arrival peaks)
 * 3. Carrying costs (WDRA rent, insurance, handling, loan subvention interest)
 * 4. Statutory MSP price floor cushion
 */
export function calculateAgriculturalHoldVsSellForecast(params: {
  commodity: string;
  holdDays: number;
  initialQuantityQuintals: number;
  currentSpotPricePerQtl: number;
  mspBenchmarkFloor?: number;
  transportFreightPerQtl?: number;
  simulatedMonth?: number; // 1-12, defaults to current calendar month
}): HoldVsSellAnalysis {
  const cleanComm = Object.keys(CROP_PRESERVATION_DATABASE).find(k => 
    params.commodity.toLowerCase().includes(k.toLowerCase())
  ) || 'Soybean';

  const profile = CROP_PRESERVATION_DATABASE[cleanComm];
  const holdDays = Math.max(5, Math.min(params.holdDays, 180));
  const qty = Math.max(1, params.initialQuantityQuintals);
  const spotRate = Math.max(500, params.currentSpotPricePerQtl);
  const msp = params.mspBenchmarkFloor || spotRate;
  const transportCost = params.transportFreightPerQtl || 65;
  const currentMonth = params.simulatedMonth || (new Date().getMonth() + 1);

  // 1. Physical Preservation & Driage Computation
  const daysFraction = holdDays / 30.0;
  const driagePct = Number((profile.monthlyDriageRatePct * daysFraction).toFixed(2));
  const rotPct = Number((profile.monthlyRotRiskPct * daysFraction).toFixed(2));
  const totalPhysicalLossPct = driagePct + rotPct;
  const driageLossQtl = Number(((driagePct / 100) * qty).toFixed(2));
  const rotLossQtl = Number(((rotPct / 100) * qty).toFixed(2));
  const effectiveMarketableWeight = Math.max(0, Number((qty * (1 - totalPhysicalLossPct / 100)).toFixed(2)));

  let storageHealthRating: 'OPTIMAL' | 'MODERATE_RISK' | 'EXCEEDED_SHELF_LIFE' = 'OPTIMAL';
  if (holdDays > profile.maxSafeHoldingDays) {
    storageHealthRating = 'EXCEEDED_SHELF_LIFE';
  } else if (holdDays > profile.maxSafeHoldingDays * 0.7) {
    storageHealthRating = 'MODERATE_RISK';
  }

  // 2. Comprehensive Cost of Carry
  const rentPerQtl = profile.storageRentPerQtlPerDay * holdDays;
  const handlingPerQtl = profile.handlingAndInsurancePerQtl;
  
  // Opportunity Cost: e-NWR pledge loan at 7.0% p.a.
  const enwrEligibleLoanPerQtl = spotRate * 0.70;
  const enwrEligibleTotalLoan = Math.round(enwrEligibleLoanPerQtl * qty);
  const loanInterestPerQtl = Number(((enwrEligibleLoanPerQtl * 0.07 * holdDays) / 365).toFixed(2));
  const enwrMonthlyInterestInr = Math.round((enwrEligibleTotalLoan * 0.07 * 30) / 365);

  const totalCarryingCostPerQtl = Number((rentPerQtl + handlingPerQtl + loanInterestPerQtl).toFixed(2));
  const totalCarryingCostLotInr = Math.round(totalCarryingCostPerQtl * qty);

  // 3. Immediate Sale Take-Home (Today)
  const immediateNetTakeHomePerQtl = Math.max(0, spotRate - transportCost);
  const immediateTotalCashInr = Math.round(immediateNetTakeHomePerQtl * qty);

  // 4. Seasonal Cycle Momentum & Elasticity Factor
  const isHarvestMonth = profile.harvestMonths.includes(currentMonth);
  const isLeanMonth = profile.leanMonths.includes(currentMonth);
  
  // Future target month after holding
  const targetMonth = ((currentMonth - 1 + Math.round(holdDays / 30)) % 12) + 1;
  const targetIsLean = profile.leanMonths.includes(targetMonth);

  // Structural Seasonal Delta
  let seasonalBaseShift = 0.0;
  if (isHarvestMonth && targetIsLean) {
    // Transitioning from harvest flood to lean peak gives maximal seasonal alpha
    seasonalBaseShift = 0.18 + (holdDays / 90) * 0.12; // +18% to +30%
  } else if (isHarvestMonth && !targetIsLean) {
    // Still in post-harvest phase
    seasonalBaseShift = 0.06 + (holdDays / 90) * 0.08; // +6% to +14%
  } else if (isLeanMonth) {
    // Already in lean peak; prices may plateau or drop as new crop approaches
    seasonalBaseShift = -0.04 - (holdDays / 90) * 0.08;
  } else {
    // Normal steady progression
    seasonalBaseShift = 0.08 + (holdDays / 90) * 0.07;
  }

  // Perishable penalty if holding exceeds safe thresholds
  if (profile.category === 'HORTICULTURE_PERISHABLE') {
    seasonalBaseShift = -0.25; // Severe decay penalty
  }

  // 5. Multi-Scenario Price Projections (Fan Chart)
  const buildScenario = (
    scenario: 'BEARISH' | 'BASE_EXPECTED' | 'BULLISH',
    multiplier: number,
    driverEn: string,
    driverMr: string
  ): ScenarioPriceProjection => {
    const projectedRawPrice = Math.round(spotRate * (1 + seasonalBaseShift * multiplier));
    // Asymmetric downside cushion: price cannot realistically drop below 90% of CACP MSP for supported crops
    const projectedPricePerQtl = Math.max(
      profile.category === 'GRAIN' || profile.category === 'OILSEED' || profile.category === 'PULSE'
        ? Math.round(msp * 0.92)
        : Math.round(spotRate * 0.70),
      projectedRawPrice
    );

    const grossAppreciationPct = Number((((projectedPricePerQtl - spotRate) / spotRate) * 100).toFixed(1));
    
    // Future Revenue considering physical shrinkage (effective weight)
    const effectiveFutureGrossLot = effectiveMarketableWeight * projectedPricePerQtl;
    const futureNetTakeHomeLot = effectiveFutureGrossLot - (effectiveMarketableWeight * transportCost) - totalCarryingCostLotInr;
    const futureNetTakeHomePerQtl = Number((futureNetTakeHomeLot / qty).toFixed(2));
    
    const netAlphaPerQtl = Number((futureNetTakeHomePerQtl - immediateNetTakeHomePerQtl).toFixed(2));
    const totalLotAlphaInr = Math.round(futureNetTakeHomeLot - immediateTotalCashInr);

    let confidenceScorePct = 82;
    if (scenario === 'BASE_EXPECTED') confidenceScorePct = 88;
    else if (scenario === 'BEARISH') confidenceScorePct = 76;
    else confidenceScorePct = 71;

    return {
      scenario,
      projectedPricePerQtl,
      grossAppreciationPct,
      netAlphaPerQtl,
      totalLotAlphaInr,
      confidenceScorePct,
      primaryMarketDriverEn: driverEn,
      primaryMarketDriverMr: driverMr
    };
  };

  const bearish = buildScenario(
    'BEARISH',
    0.45,
    'Subdued consumer absorption; bumper arrivals from neighboring states.',
    'शेजारील राज्यांतून बंपर आवक व किरकोळ बाजारात संथ मागणीचा दबाव.'
  );

  const base = buildScenario(
    'BASE_EXPECTED',
    1.00,
    'Normalized post-harvest exhaustion with steady processor crushing demand.',
    'बाजारपेठेतील हंगामी आवक घट आणि प्रक्रिया उद्योगांकडून संतुलित उचल.'
  );

  const bullish = buildScenario(
    'BULLISH',
    1.55,
    'Tight terminal mandi arrivals with heightened institutional export tenders.',
    'टर्मिनल बाजारात आवक तीव्र घट व संस्थात्मक निर्यातदारांकडून आक्रमक खरेदी.'
  );

  // 6. Final Strategic Action Synthesis
  let strategicAction: 'STRONG_HOLD_WDRA' | 'HOLD_WITH_ENWR_PLEDGE' | 'STAGGERED_SELL' | 'SELL_NOW_SPOT' = 'STAGGERED_SELL';
  let badgeColor = '#0284c7';
  let headlineEn = '';
  let headlineMr = '';
  let justificationEn = '';
  let justificationMr = '';

  if (storageHealthRating === 'EXCEEDED_SHELF_LIFE' || profile.category === 'HORTICULTURE_PERISHABLE' || base.netAlphaPerQtl < -50) {
    strategicAction = 'SELL_NOW_SPOT';
    badgeColor = '#dc2626';
    headlineEn = `SELL TODAY IN APMC SPOT — High Spoilage / Driage Depreciation Risk`;
    headlineMr = `आजच बाजार समितीत विका — साठवणूक नुकसान व वजनातील घट जास्त`;
    justificationEn = `Physical weight shrinkage (-${totalPhysicalLossPct}%) and storage fees outweigh projected price appreciation. Immediate liquidation eliminates holding risks.`;
    justificationMr = `वजनातील घट (-${totalPhysicalLossPct}%) व गोदाम भाडे भाववाढीपेक्षा जास्त आहे. आजच रोख रक्कम मिळवणे फायदेशीर आहे.`;
  } else if (base.netAlphaPerQtl >= 120 && spotRate >= msp * 0.95) {
    strategicAction = 'STRONG_HOLD_WDRA';
    badgeColor = '#059669';
    headlineEn = `STRONG HOLD IN WDRA DEPOT — Expected Net Surplus of +₹${base.netAlphaPerQtl}/Qtl`;
    headlineMr = `गोदामात शेतमाल राखून ठेवा — प्रति क्विंटल निव्वळ +₹${base.netAlphaPerQtl} अधिक नफ्याचा अंदाज`;
    justificationEn = `Holding into lean demand window generates +₹${base.totalLotAlphaInr.toLocaleString('en-IN')} net surplus on your ${qty} Qtl batch even after deducting driage and carrying fees.`;
    justificationMr = `वजनातील घट व गोदाम खर्च वजा जाताही आपल्या ${qty} क्विंटल शेतमालावर +₹${base.totalLotAlphaInr.toLocaleString('en-IN')} निव्वळ नफा मिळण्याचा ठोस अंदाज आहे.`;
  } else if (base.netAlphaPerQtl > 0 && spotRate < msp) {
    strategicAction = 'HOLD_WITH_ENWR_PLEDGE';
    badgeColor = '#d97706';
    headlineEn = `HOLD WITH e-NWR PLEDGE LOAN — Spot Trading Below CACP Statutory Floor`;
    headlineMr = `गोदाम पावती कर्ज (e-NWR) घेऊन साठवा — बाजारभाव हमीभावापेक्षा कमी आहे`;
    justificationEn = `Current spot is below MSP. Avail ₹${enwrEligibleTotalLoan.toLocaleString('en-IN')} immediate liquidity via 7% e-NWR pledge financing while waiting for NAFED PSS / seasonal recovery.`;
    justificationMr = `सध्याचा भाव हमीभावापेक्षा कमी आहे. ७% सवलतीच्या दराने ₹${enwrEligibleTotalLoan.toLocaleString('en-IN')} कर्ज उचलून तातडीचा खर्च भागवा व नाफेड खरेदीची प्रतीक्षा करा.`;
  } else {
    strategicAction = 'STAGGERED_SELL';
    badgeColor = '#2563eb';
    headlineEn = `STAGGERED SELL (50/50) — Liquidate 50% Today, Hold 50% for Lean Upside`;
    headlineMr = `टप्प्याटप्प्याने विक्री (५०/५०) — ५०% आज विका, ५०% गोदामात साठवा`;
    justificationEn = `Market volatility is balanced. Lock immediate working capital on half your lot through Escrow, while holding the remaining 50% for off-season price expansion.`;
    justificationMr = `बाजार समतोलात आहे. निम्म्या मालाची विक्री करून रोकड तरलता मिळवा आणि ५०% माल भाववाढीसाठी राखून ठेवा.`;
  }

  return {
    commodity: cleanComm,
    profile,
    holdDays,
    initialQuantityQuintals: qty,
    currentSpotPricePerQtl: spotRate,
    mspBenchmarkFloor: msp,
    driageLossQuintals: driageLossQtl,
    driageLossPct: driagePct,
    rotLossQuintals: rotLossQtl,
    effectiveMarketableWeightQuintals: effectiveMarketableWeight,
    storageHealthRating,
    storageRentTotalInr: Math.round(rentPerQtl * qty),
    handlingInsuranceTotalInr: Math.round(handlingPerQtl * qty),
    pledgeLoanInterestInr: Math.round(loanInterestPerQtl * qty),
    totalCarryingCostPerQtl,
    totalCarryingCostLotInr,
    immediateNetTakeHomePerQtl,
    immediateTotalCashInr,
    scenarios: {
      bearish,
      base,
      bullish
    },
    enwrEligibleLoanAmountInr: enwrEligibleTotalLoan,
    enwrMonthlyInterestInr,
    strategicAction,
    recommendationBadgeColor: badgeColor,
    recommendationHeadlineEn: headlineEn,
    recommendationHeadlineMr: headlineMr,
    justificationEn,
    justificationMr
  };
}

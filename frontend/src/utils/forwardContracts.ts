/**
 * AgroConnect - Pre-Harvest Forward Contracts & MSP Corridor
 * Phase 5: Contract Farming Framework, MSP Floor Protection & Upside Sharing
 * Smart India Hackathon 2026 - Problem Statement ID: 26132
 */

import type { ForwardContractOffer, ForwardPricingSimulation } from '../types';

export function simulateForwardContractPayout(
  contractPrice: number,
  mspFloor: number,
  simulatedSpotPrice: number,
  upsideSharePct: number = 50
): ForwardPricingSimulation {
  const spotAboveContract = Math.max(0, simulatedSpotPrice - contractPrice);
  const spotBelowContract = Math.max(0, contractPrice - simulatedSpotPrice);

  let finalFarmerPrice = contractPrice;
  let protectionMechanism: ForwardPricingSimulation['protection_mechanism'] = 'CONTRACT_PRICE_GUARANTEE';
  let explanationEn = '';
  let explanationMr = '';

  if (simulatedSpotPrice > contractPrice) {
    // Mandi spot surged higher than agreed pre-harvest rate -> farmer gets 50% of the upside!
    const farmerBonus = Math.round(spotAboveContract * (upsideSharePct / 100));
    finalFarmerPrice = contractPrice + farmerBonus;
    protectionMechanism = 'SPOT_UPSIDE_SHARED';
    explanationEn = `Mandi spot price surged to ₹${simulatedSpotPrice}/Qtl (+₹${spotAboveContract} above forward agreement). Under statutory Upside Sharing (${upsideSharePct}%), farmer receives contract rate ₹${contractPrice} + ₹${farmerBonus} upside bonus = ₹${finalFarmerPrice}/Qtl!`;
    explanationMr = `बाजार भाव वाढून ₹${simulatedSpotPrice}/क्विं. झाला (+₹${spotAboveContract} करार भावापेक्षा जास्त). नफा वाटणी नियमानुसार (${upsideSharePct}%), शेतकऱ्याला ₹${contractPrice} + ₹${farmerBonus} बोनस = ₹${finalFarmerPrice}/क्विं. असा उच्च परतावा मिळतो!`;
  } else if (simulatedSpotPrice < contractPrice) {
    // Mandi spot crashed below contract price -> Farmer is 100% shielded by pre-harvest fixed guarantee
    finalFarmerPrice = Math.max(contractPrice, mspFloor);
    protectionMechanism = contractPrice >= mspFloor ? 'CONTRACT_PRICE_GUARANTEE' : 'MSP_FLOOR_APPLIED';
    explanationEn = `Mandi spot price crashed to ₹${simulatedSpotPrice}/Qtl (-₹${spotBelowContract} drop). Farmer is 100% PROTECTED from market crash by the legally-binding forward rate of ₹${finalFarmerPrice}/Qtl (shielding farmer by ₹${spotBelowContract}/Qtl)!`;
    explanationMr = `हंगामानंतर बाजार भाव कोसळून ₹${simulatedSpotPrice}/क्विं. झाला (-₹${spotBelowContract} घसरण). तरीही आगाऊ करार हमीमुळे शेतकऱ्याला ₹${finalFarmerPrice}/क्विं. पूर्ण हमीभाव मिळतो (शेतकऱ्याचे ₹${spotBelowContract}/क्विं. चे नुकसान टळले)!`;
  } else {
    finalFarmerPrice = contractPrice;
    protectionMechanism = 'CONTRACT_PRICE_GUARANTEE';
    explanationEn = `Harvest spot matches pre-harvest forward contract rate of ₹${contractPrice}/Qtl. Full contractual payout guaranteed.`;
    explanationMr = `बाजार भाव आणि आगाऊ करार भाव समान ₹${contractPrice}/क्विं. आहेत. पूर्ण कराराची रक्कम देय आहे.`;
  }

  const effectiveGainOverMsp = Math.max(0, finalFarmerPrice - mspFloor);

  return {
    forward_contract_price: contractPrice,
    msp_floor_price: mspFloor,
    simulated_harvest_spot_price: simulatedSpotPrice,
    upside_share_pct: upsideSharePct,
    spot_above_contract: spotAboveContract,
    spot_below_contract: spotBelowContract,
    final_farmer_price_per_qtl: finalFarmerPrice,
    effective_gain_over_msp_per_qtl: effectiveGainOverMsp,
    protection_mechanism: protectionMechanism,
    explanation_en: explanationEn,
    explanation_mr: explanationMr
  };
}

export const INITIAL_FORWARD_CONTRACT_OFFERS: ForwardContractOffer[] = [
  {
    id: 'fwd-adani-soy-2026',
    offer_code: 'AGC-FWD-2026-SOY-01',
    buyer_id: 3,
    buyer_name: 'Adani Wilmar Agri-Processing Hub',
    company_name: 'Adani Wilmar Ltd (Fortune Agro)',
    commodity: 'Soybean',
    variety: 'JS-335 / JS-9305 Processing Grade',
    season: 'KHARIF_2026',
    target_volume_quintals: 3000,
    committed_volume_quintals: 1950,
    pre_harvest_contract_price: 5250, // ₹5,250/Qtl (vs MSP ₹4,892)
    cacp_msp_floor_price: 4892,
    upside_sharing_percent: 50,
    sowing_advance_percent: 20, // 20% sowing advance locked in escrow
    sowing_advance_per_quintal: 1050,
    delivery_window_start: '2026-10-10',
    delivery_window_end: '2026-11-15',
    harvest_district: 'Latur / Nanded / Wardha',
    mill_delivery_center: 'Adani Wilmar Solvent Plant, MIDC Butibori / Wardha',
    quality_specs_summary: 'Moisture ≤ 12.0%, Foreign Matter ≤ 1.0%, Oil Content ≥ 18.5%',
    model_form_type: 'MAHARASHTRA_CONTRACT_FARMING_ACT_FORM_C',
    status: 'OPEN_FOR_BOOKING',
    participating_farmers_count: 24,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    notes: 'Includes 20% immediate seed/fertilizer sowing advance released upon signing via SBI Agri-Escrow.'
  },
  {
    id: 'fwd-sahyadri-onion-2026',
    offer_code: 'AGC-FWD-2026-ONI-02',
    buyer_id: 4,
    buyer_name: 'Sahyadri Farmer Producer Co. Ltd',
    company_name: 'Sahyadri Agro-Processing Hub',
    commodity: 'Onion',
    variety: 'Garwa / Red Export Grade (55mm+)',
    season: 'KHARIF_2026',
    target_volume_quintals: 2500,
    committed_volume_quintals: 1800,
    pre_harvest_contract_price: 2400, // ₹2,400/Qtl floor
    cacp_msp_floor_price: 1850,
    upside_sharing_percent: 50,
    sowing_advance_percent: 25,
    sowing_advance_per_quintal: 600,
    delivery_window_start: '2026-11-01',
    delivery_window_end: '2026-12-15',
    harvest_district: 'Nashik / Ahmednagar / Pune',
    mill_delivery_center: 'Sahyadri Mega Food Park, Mohadi, Nashik',
    quality_specs_summary: 'Uniform size 55-70mm, Moisture < 10%, Zero rot/sprouting',
    model_form_type: 'MAHARASHTRA_CONTRACT_FARMING_ACT_FORM_C',
    status: 'OPEN_FOR_BOOKING',
    participating_farmers_count: 31,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    notes: 'Zero distress sale risk. Sahyadri cold-storage integrated dispatch.'
  },
  {
    id: 'fwd-wardha-cotton-2026',
    offer_code: 'AGC-FWD-2026-COT-03',
    buyer_id: 5,
    buyer_name: 'Wardha Cotton Ginning & Pressing Co-op',
    company_name: 'Vidarbha Co-op Cotton Federation',
    commodity: 'Cotton',
    variety: 'Bunny BT Extra Long Staple (29mm+)',
    season: 'KHARIF_2026',
    target_volume_quintals: 2000,
    committed_volume_quintals: 1400,
    pre_harvest_contract_price: 7400, // ₹7,400/Qtl (vs MSP ₹7,121)
    cacp_msp_floor_price: 7121,
    upside_sharing_percent: 50,
    sowing_advance_percent: 20,
    sowing_advance_per_quintal: 1480,
    delivery_window_start: '2026-11-15',
    delivery_window_end: '2026-12-31',
    harvest_district: 'Wardha / Yavatmal / Amravati',
    mill_delivery_center: 'Wardha Ginning Complex, MIDC Wardha',
    quality_specs_summary: 'Staple length 29-31mm, Trash < 2.0%, Moisture < 9.0%',
    model_form_type: 'MAHARASHTRA_CONTRACT_FARMING_ACT_FORM_C',
    status: 'OPEN_FOR_BOOKING',
    participating_farmers_count: 18,
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    notes: 'Guaranteed textile mill off-take with certified moisture meter calibration.'
  }
];

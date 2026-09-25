from typing import Dict, Any, List, Optional
import numpy as np
from pydantic import BaseModel

class ArrivalElasticityResult(BaseModel):
    commodity: str
    mandi_name: str
    current_arrivals_tonnes: float
    previous_arrivals_tonnes: float
    arrival_change_pct: float
    current_modal_price: float
    previous_modal_price: float
    price_change_pct: float
    elasticity_coefficient_ed: float  # (% Delta Q) / (% Delta P)
    flexibility_coefficient_fp: float  # Price responsiveness to arrival shifts: (% Delta P) / (% Delta Q)
    market_regime: str  # 'SUPPLY_GLUT_BEARISH', 'BOTTLENECK_BULLISH', 'EQUILIBRIUM'
    projected_price_impact_pct: float
    interpretation_en: str
    interpretation_mr: str

# Standard empirical agricultural price elasticity baselines for Indian APMCs
EMPIRICAL_ELASTICITY_BASELINES: Dict[str, float] = {
    "Soybean": -0.82,  # Inelastic processing demand
    "Onion": -1.45,    # High price elasticity due to acute perishable supply swings
    "Cotton": -0.74,   # Textile mill export demand driven
    "Wheat": -0.55,    # Essential staple; inelastic
    "Gram": -0.88,     # Protein pulse; moderate elasticity
    "Tur": -0.92,      # Dal milling staple
    "Maize": -0.68,    # Poultry feed demand
    "Tomato": -2.15    # Extreme volatility
}

class ArrivalVolumeElasticityEngine:
    @staticmethod
    def calculate_elasticity(
        commodity: str,
        mandi_name: str,
        current_arrivals: float,
        previous_arrivals: float,
        current_price: float,
        previous_price: float
    ) -> ArrivalElasticityResult:
        # Calculate percentage changes
        delta_q_pct = ((current_arrivals - previous_arrivals) / max(previous_arrivals, 1.0)) * 100.0
        delta_p_pct = ((current_price - previous_price) / max(previous_price, 1.0)) * 100.0

        # Commodity baseline
        matched_comm = "Soybean"
        for k in EMPIRICAL_ELASTICITY_BASELINES.keys():
            if k.lower() in commodity.lower() or commodity.lower() in k.lower():
                matched_comm = k
                break

        baseline_ed = EMPIRICAL_ELASTICITY_BASELINES.get(matched_comm, -0.85)

        # Compute dynamic elasticity if meaningful price/arrival changes exist
        if abs(delta_p_pct) > 0.5:
            empirical_ed = delta_q_pct / delta_p_pct
            # Blend observed delta with structural empirical baseline (Bayesian shrinkage)
            ed = float(np.clip(0.6 * empirical_ed + 0.4 * baseline_ed, -3.5, -0.2))
        else:
            ed = baseline_ed

        # Price flexibility coefficient (Price impact of supply shift)
        # Flexibility = 1 / Ed
        flexibility = float(-1.0 / abs(ed))

        # Classify market regime
        if delta_q_pct < -15.0:
            regime = "BOTTLENECK_BULLISH"
            impact_pct = abs(delta_q_pct) * abs(flexibility) * 0.45
            desc_en = f"Arrivals plunged {abs(delta_q_pct):.1f}% at {mandi_name}. Terminal supply bottleneck exerts +{impact_pct:.1f}% upward price pressure."
            desc_mr = f"{mandi_name} येथे आवक {abs(delta_q_pct):.1f}% ने घटली आहे. पुरवठा तुटवड्यामुळे भावात +{impact_pct:.1f}% वाढीचा अंदाज आहे."
        elif delta_q_pct > 25.0:
            regime = "SUPPLY_GLUT_BEARISH"
            impact_pct = -(delta_q_pct * abs(flexibility) * 0.35)
            desc_en = f"Harvest influx up +{delta_q_pct:.1f}%. High mandi arrivals exerting short-term downward price drag of {impact_pct:.1f}%."
            desc_mr = f"बाजारात आवक +{delta_q_pct:.1f}% ने वाढली आहे. अतिरिक्त पुरवठ्यामुळे तात्पुरता {impact_pct:.1f}% मंदीचा दबाव राहू शकतो."
        else:
            regime = "EQUILIBRIUM"
            impact_pct = 0.5
            desc_en = f"Arrival volume stable ({delta_q_pct:+.1f}%). Market in balanced absorption equilibrium."
            desc_mr = f"आवक समतोलात आहे ({delta_q_pct:+.1f}%). मागणी आणि पुरवठ्यात समतोल नोंदवला गेला आहे."

        return ArrivalElasticityResult(
            commodity=matched_comm,
            mandi_name=mandi_name,
            current_arrivals_tonnes=current_arrivals,
            previous_arrivals_tonnes=previous_arrivals,
            arrival_change_pct=round(delta_q_pct, 2),
            current_modal_price=current_price,
            previous_modal_price=previous_price,
            price_change_pct=round(delta_p_pct, 2),
            elasticity_coefficient_ed=round(ed, 3),
            flexibility_coefficient_fp=round(flexibility, 3),
            market_regime=regime,
            projected_price_impact_pct=round(impact_pct, 2),
            interpretation_en=desc_en,
            interpretation_mr=desc_mr
        )

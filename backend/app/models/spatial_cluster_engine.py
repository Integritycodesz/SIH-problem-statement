from typing import Dict, Any, List, Optional
import numpy as np
from pydantic import BaseModel

class MandiSpatialNeighbor(BaseModel):
    mandi_name: str
    district: str
    distance_km: float
    weight: float
    recent_price: float

class SpatialClusterResult(BaseModel):
    corridor_name: str
    primary_mandi: str
    primary_district: str
    commodity: str
    cluster_member_count: int
    neighbors: List[MandiSpatialNeighbor]
    cluster_weighted_average_price: float
    spatial_divergence_inr: float
    spatial_divergence_pct: float
    arbitrage_pressure_direction: str  # 'EQUALIZING_UPWARD', 'EQUALIZING_DOWNWARD', 'COUPLED_EQUILIBRIUM'
    spatial_lag_contribution_pct: float
    summary_en: str
    summary_mr: str

# Maharashtra Agricultural Corridors with geo-coordinates and typical price connectivity
MAHARASHTRA_AGRO_CORRIDORS: Dict[str, Dict[str, Any]] = {
    "NASHIK_PUNE_HORTICULTURE": {
        "name": "Nashik-Pune Onion & Vegetable Corridor",
        "primary_crops": ["Onion", "Tomato", "Grapes", "Pomegranate", "Vegetables"],
        "mandis": [
            {"mandi": "Lasalgaon APMC", "district": "Nashik", "lat": 20.14, "lng": 74.23, "base_spread": 0},
            {"mandi": "Pimpalgaon APMC", "district": "Nashik", "lat": 20.17, "lng": 73.98, "base_spread": 35},
            {"mandi": "Yeola APMC", "district": "Nashik", "lat": 20.04, "lng": 74.48, "base_spread": -40},
            {"mandi": "Pune APMC (Gultekdi)", "district": "Pune", "lat": 18.50, "lng": 73.86, "base_spread": 120},
            {"mandi": "Junnar APMC", "district": "Pune", "lat": 19.20, "lng": 73.87, "base_spread": 40},
            {"mandi": "Sangamner APMC", "district": "Ahmednagar", "lat": 19.57, "lng": 74.21, "base_spread": -20},
            {"mandi": "Solapur APMC", "district": "Solapur", "lat": 17.67, "lng": 75.90, "base_spread": -30}
        ]
    },
    "MARATHWADA_OILSEED_PULSE": {
        "name": "Marathwada Oilseed & Pulse Belt",
        "primary_crops": ["Soybean", "Gram", "Tur", "Wheat", "Urad"],
        "mandis": [
            {"mandi": "Latur Pulse & Oilseed APMC", "district": "Latur", "lat": 18.40, "lng": 76.58, "base_spread": 0},
            {"mandi": "Jalna APMC", "district": "Jalna", "lat": 19.84, "lng": 75.88, "base_spread": 20},
            {"mandi": "Nanded APMC", "district": "Nanded", "lat": 19.15, "lng": 77.30, "base_spread": -15},
            {"mandi": "Parbhani APMC", "district": "Parbhani", "lat": 19.26, "lng": 76.77, "base_spread": -25},
            {"mandi": "Ambejogai APMC", "district": "Beed", "lat": 18.73, "lng": 76.38, "base_spread": -35},
            {"mandi": "Chhatrapati Sambhajinagar APMC", "district": "Chhatrapati Sambhajinagar", "lat": 19.88, "lng": 75.34, "base_spread": 30}
        ]
    },
    "VIDARBHA_WHITE_GOLD": {
        "name": "Vidarbha Cotton & Soybean Basin",
        "primary_crops": ["Cotton", "Soybean", "Wheat", "Gram", "Tur"],
        "mandis": [
            {"mandi": "Akola APMC", "district": "Akola", "lat": 20.70, "lng": 77.01, "base_spread": 0},
            {"mandi": "Amravati APMC", "district": "Amravati", "lat": 20.93, "lng": 77.75, "base_spread": 25},
            {"mandi": "Yavatmal APMC", "district": "Yavatmal", "lat": 20.39, "lng": 78.12, "base_spread": -20},
            {"mandi": "Wardha APMC", "district": "Wardha", "lat": 20.74, "lng": 78.60, "base_spread": -10},
            {"mandi": "Nagpur APMC (Kalamna)", "district": "Nagpur", "lat": 21.16, "lng": 79.13, "base_spread": 50},
            {"mandi": "Washim APMC", "district": "Washim", "lat": 20.10, "lng": 77.13, "base_spread": -30}
        ]
    },
    "KHANDESH_AGRO_CORRIDOR": {
        "name": "Khandesh Maize & Commercial Belt",
        "primary_crops": ["Maize", "Cotton", "Banana", "Soybean"],
        "mandis": [
            {"mandi": "Jalgaon APMC", "district": "Jalgaon", "lat": 21.00, "lng": 75.56, "base_spread": 0},
            {"mandi": "Dhule APMC", "district": "Dhule", "lat": 20.90, "lng": 74.77, "base_spread": -15},
            {"mandi": "Nandurbar APMC", "district": "Nandurbar", "lat": 21.37, "lng": 74.24, "base_spread": -35},
            {"mandi": "Chopda APMC", "district": "Jalgaon", "lat": 21.25, "lng": 75.30, "base_spread": 15}
        ]
    }
}

def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Computes great-circle distance between two points in kilometers."""
    r = 6371.0
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lng2 - lng1)
    a = np.sin(dphi / 2.0) ** 2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda / 2.0) ** 2
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))
    return float(r * c)

class SpatialClusterEngine:
    @staticmethod
    def identify_corridor(commodity: str, district: str) -> str:
        """Finds the dominant agricultural corridor for the given crop and district."""
        c_lower = commodity.lower()
        d_lower = district.lower()

        if any(w in c_lower for w in ["onion", "tomato", "grape"]):
            return "NASHIK_PUNE_HORTICULTURE"
        if any(w in c_lower for w in ["cotton"]):
            if any(w in d_lower for w in ["jalgaon", "dhule", "nandurbar"]):
                return "KHANDESH_AGRO_CORRIDOR"
            return "VIDARBHA_WHITE_GOLD"
        if any(w in c_lower for w in ["soybean", "tur", "gram", "chana"]):
            if any(w in d_lower for w in ["akola", "amravati", "yavatmal", "wardha", "nagpur", "washim"]):
                return "VIDARBHA_WHITE_GOLD"
            return "MARATHWADA_OILSEED_PULSE"
        if any(w in c_lower for w in ["maize", "banana"]):
            return "KHANDESH_AGRO_CORRIDOR"
        
        # Default fallback by district
        if any(w in d_lower for w in ["nashik", "pune", "ahmednagar", "solapur"]):
            return "NASHIK_PUNE_HORTICULTURE"
        if any(w in d_lower for w in ["latur", "jalna", "nanded", "beed", "parbhani"]):
            return "MARATHWADA_OILSEED_PULSE"
        return "VIDARBHA_WHITE_GOLD"

    @staticmethod
    def compute_spatial_arbitrage(
        commodity: str,
        mandi_name: str,
        district: str,
        current_spot_price: float
    ) -> SpatialClusterResult:
        corridor_key = SpatialClusterEngine.identify_corridor(commodity, district)
        corridor_data = MAHARASHTRA_AGRO_CORRIDORS.get(corridor_key, MAHARASHTRA_AGRO_CORRIDORS["MARATHWADA_OILSEED_PULSE"])
        mandi_list = corridor_data["mandis"]

        # Find target mandi location or default to first in list
        target_loc = next((m for m in mandi_list if m["mandi"].lower() in mandi_name.lower() or mandi_name.lower() in m["mandi"].lower()), mandi_list[0])
        t_lat, t_lng = target_loc["lat"], target_loc["lng"]

        # Calculate distances and inverse-distance weights (W_ij = 1 / d_ij)
        neighbors: List[MandiSpatialNeighbor] = []
        raw_weights = []

        for m in mandi_list:
            if m["mandi"] == target_loc["mandi"]:
                continue
            dist = max(12.0, haversine_km(t_lat, t_lng, m["lat"], m["lng"]))
            # Estimated neighbor price based on geographic spread offset
            neighbor_price = round(current_spot_price + m["base_spread"], 1)
            weight = 1.0 / (dist ** 1.1)  # Power of 1.1 for standard gravity decay
            raw_weights.append(weight)
            neighbors.append(
                MandiSpatialNeighbor(
                    mandi_name=m["mandi"],
                    district=m["district"],
                    distance_km=round(dist, 1),
                    weight=weight,
                    recent_price=neighbor_price
                )
            )

        # Normalize weights to sum to 1.0
        total_w = sum(raw_weights) if raw_weights else 1.0
        for n in neighbors:
            n.weight = round(n.weight / total_w, 4)

        # Spatial lag: W * y
        cluster_weighted_price = sum(n.weight * n.recent_price for n in neighbors)
        divergence_inr = round(cluster_weighted_price - current_spot_price, 1)
        divergence_pct = round((divergence_inr / current_spot_price) * 100.0, 2)

        # Price equalization direction (Arbitrage Gravity)
        # If neighboring mandis are trading higher by > 2%, truckers divert supply, lifting local price
        if divergence_pct > 1.5:
            direction = "EQUALIZING_UPWARD"
            spatial_lag_contrib_pct = min(divergence_pct * 0.42, 4.5)  # Elastic freight absorption
            desc_en = f"Neighboring APMCs in {corridor_data['name']} trade ₹{divergence_inr:+.0f}/Qtl higher. Trucker arbitrage exerts +{spatial_lag_contrib_pct:.1f}% upward pull on {mandi_name}."
            desc_mr = f"{corridor_data['name']} मधील लगतच्या मंडयांमध्ये दर ₹{divergence_inr:+.0f} जास्त आहेत. वाहतूकदार वळविल्याने {mandi_name} मध्ये भावात +{spatial_lag_contrib_pct:.1f}% वाढीचा जोर राहील."
        elif divergence_pct < -1.5:
            direction = "EQUALIZING_DOWNWARD"
            spatial_lag_contrib_pct = max(divergence_pct * 0.35, -3.8)
            desc_en = f"Regional cluster is trading ₹{abs(divergence_inr):.0f}/Qtl lower. Inflow arbitrage creates {spatial_lag_contrib_pct:.1f}% local downward equalization."
            desc_mr = f"प्रादेशिक बाजार समूहात दर ₹{abs(divergence_inr):.0f} कमी आहेत. त्यामुळे स्थानिक बाजारावर {spatial_lag_contrib_pct:.1f}% मंदीचा ताण संभवतो."
        else:
            direction = "COUPLED_EQUILIBRIUM"
            spatial_lag_contrib_pct = 0.0
            desc_en = f"{mandi_name} is tightly coupled with {corridor_data['name']} baseline (spread < 1.5%). Spatial equilibrium intact."
            desc_mr = f"{mandi_name} प्रादेशिक बाजार समूहाशी पूर्णपणे जोडलेली असून दर समतोलात आहेत."

        return SpatialClusterResult(
            corridor_name=corridor_data["name"],
            primary_mandi=target_loc["mandi"],
            primary_district=target_loc["district"],
            commodity=commodity,
            cluster_member_count=len(neighbors) + 1,
            neighbors=neighbors,
            cluster_weighted_average_price=round(cluster_weighted_price, 1),
            spatial_divergence_inr=divergence_inr,
            spatial_divergence_pct=divergence_pct,
            arbitrage_pressure_direction=direction,
            spatial_lag_contribution_pct=round(spatial_lag_contrib_pct, 2),
            summary_en=desc_en,
            summary_mr=desc_mr
        )

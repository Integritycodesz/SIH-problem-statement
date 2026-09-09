import math
from app.schemas.schemas import TransportCalcResponse

# Standard diesel freight rate per km-tonne across Western & Central India corridors
BASE_RATE_PER_TONNE_KM = 3.85 # INR
BASE_LOADING_UNLOADING = 350.0 # INR flat per tonne

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates approximate distance between two coordinate pairs in km."""
    if not lat1 or not lon1 or not lat2 or not lon2:
        return 120.0 # Default benchmark distance if coordinates missing
    
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    # Road tortuosity multiplier in Indian highway networks (typically 1.25x haversine)
    return round(distance * 1.28, 1)

def compute_arbitrage_and_freight(
    distance_km: float,
    quantity_quintals: float,
    from_price_per_qtl: float,
    to_price_per_qtl: float,
    vehicle_type: str
) -> TransportCalcResponse:
    tonnes = quantity_quintals / 10.0

    # Rate tuning based on capacity efficiencies
    vehicle_factor = 1.0
    if "Mini Truck" in vehicle_type:
        vehicle_factor = 1.25
    elif "Large Multi-Axle" in vehicle_type:
        vehicle_factor = 0.82

    freight_per_tonne = (distance_km * BASE_RATE_PER_TONNE_KM * vehicle_factor) + BASE_LOADING_UNLOADING
    total_freight_cost = freight_per_tonne * tonnes
    cost_per_quintal = total_freight_cost / max(quantity_quintals, 1.0)
    
    # Transit speed estimate: ~40 km/h average commercial truck speed + 2 hrs loading
    estimated_hours = round((distance_km / 42.0) + 2.0, 1)

    price_diff = to_price_per_qtl - from_price_per_qtl
    gross_arbitrage = price_diff * quantity_quintals
    net_profit = gross_arbitrage - total_freight_cost

    if net_profit > (gross_arbitrage * 0.4) and net_profit > 1500:
        viability = "HIGHLY_VIABLE"
    elif net_profit > 0:
        viability = "MARGINAL"
    else:
        viability = "NOT_RECOMMENDED"

    return TransportCalcResponse(
        distance_km=distance_km,
        freight_cost=round(total_freight_cost, 2),
        cost_per_quintal=round(cost_per_quintal, 2),
        estimated_transit_hours=estimated_hours,
        from_price=from_price_per_qtl,
        to_price=to_price_per_qtl,
        price_difference_per_quintal=round(price_diff, 2),
        gross_arbitrage_gain=round(gross_arbitrage, 2),
        net_profit_after_freight=round(net_profit, 2),
        viability_status=viability
    )

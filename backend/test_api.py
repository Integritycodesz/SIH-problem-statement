from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_pipeline():
    # 1. Health & Market Stats
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    stats = client.get("/api/mandis/summary/stats").json()
    assert stats["active_mandis_count"] >= 585
    assert len(stats["tracked_commodities"]) >= 6

    # 2. Transport & Arbitrage Calculation
    mandis = client.get("/api/mandis/?limit=2").json()
    assert len(mandis) >= 2
    m1_id, m2_id = mandis[0]["id"], mandis[1]["id"]

    calc_res = client.post("/api/mandis/calculate-transport", json={
        "from_mandi_id": m1_id,
        "to_mandi_id": m2_id,
        "commodity": "Onion",
        "quantity_quintals": 50,
        "vehicle_type": "Mini Truck (2.5T)"
    })
    assert calc_res.status_code == 200
    assert "freight_cost" in calc_res.json()
    assert "viability_status" in calc_res.json()

    # 3. Farmer creates a new Produce Lot
    new_lot = client.post("/api/lots/", json={
        "farmer_id": 1,
        "commodity": "Soybean",
        "variety": "JS 335 Certified",
        "quantity_quintals": 40.0,
        "quality_grade": "Grade A",
        "moisture_percent": 9.2,
        "base_price_per_quintal": 4850.0,
        "district": "Nashik",
        "expected_delivery_days": 3,
        "description": "Premium seed grade soybean lot"
    }).json()
    assert new_lot["id"] is not None
    lot_id = new_lot["id"]

    # 4. Buyer initiates RFQ
    rfq = client.post("/api/rfq/", json={
        "lot_id": lot_id,
        "buyer_id": 8,
        "initial_offer_price": 4750.0,
        "delivery_timeline_days": 4,
        "delivery_address": "Sahyadri Mega Food Hub, Nashik"
    }).json()
    assert rfq["id"] is not None
    assert rfq["status"] == "PENDING"
    rfq_id = rfq["id"]

    # 5. Farmer counters offer
    countered = client.post(f"/api/rfq/{rfq_id}/counter", json={
        "sender_id": 1,
        "sender_role": "FARMER",
        "offered_price": 4800.0,
        "message_text": "Can finalize at 4800 immediate"
    }).json()
    assert countered["status"] == "COUNTERED"
    assert countered["current_offered_price"] == 4800.0

    # 6. Buyer accepts RFQ -> Digital Contract Generated
    accepted = client.post(f"/api/rfq/{rfq_id}/accept").json()
    contract_id = accepted["contract_id"]
    assert contract_id is not None
    assert accepted["advance_amount"] > 0

    # 7. Both parties sign digitally
    client.post(f"/api/contracts/{contract_id}/sign", json={
        "user_id": 1,
        "signer_role": "FARMER",
        "aadhaar_last_four": "9821"
    })
    signed_contract = client.post(f"/api/contracts/{contract_id}/sign", json={
        "user_id": 8,
        "signer_role": "BUYER",
        "aadhaar_last_four": "4432"
    }).json()
    assert signed_contract["status"] == "SIGNED_ESCROW_AWAITING"
    assert signed_contract["farmer_signed"] is True
    assert signed_contract["buyer_signed"] is True

    # 8. Advance Escrow funded
    funded = client.post(f"/api/contracts/{contract_id}/fund-advance").json()
    assert funded["status"] == "ADVANCE_ESCROW_LOCKED"
    assert funded["escrow"]["advance_status"] == "HELD_IN_ESCROW"

    # 9. Dispatched and Delivered
    dispatched = client.post(f"/api/contracts/{contract_id}/dispatch").json()
    assert dispatched["status"] == "IN_TRANSIT"
    assert dispatched["escrow"]["advance_status"] == "RELEASED_TO_FARMER"

    delivered = client.post(f"/api/contracts/{contract_id}/mark-delivered").json()
    assert delivered["status"] == "DELIVERED_PENDING_INSPECTION"

    # 10. Final settlement released
    completed = client.post(f"/api/contracts/{contract_id}/release-final").json()
    assert completed["status"] == "COMPLETED"
    assert completed["escrow"]["balance_status"] == "RELEASED_TO_FARMER"

    print("ALL 10 API PIPELINE TESTS PASSED!")

if __name__ == "__main__":
    test_full_pipeline()

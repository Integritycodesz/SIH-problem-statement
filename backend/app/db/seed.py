import random
import sys
from datetime import datetime, timedelta

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models.models import (
    User, Mandi, CommodityPrice, ProduceLot, RFQ, RFQMessage, Contract, EscrowPayment, Dispute
)
from app.services.escrow_service import generate_contract_text

# Maharashtra districts and prominent APMCs
MAHARASHTRA_DISTRICTS = [
    ("Nashik", 20.0059, 73.7901, ["Lasalgaon APMC", "Pimpalgaon APMC", "Nashik APMC", "Yeola APMC", "Sinnar APMC", "Malegaon APMC"]),
    ("Pune", 18.5204, 73.8567, ["Pune APMC (Gultekdi)", "Baramati APMC", "Junnar APMC", "Manchar APMC", "Khed APMC", "Shirur APMC"]),
    ("Thane", 19.2183, 72.9781, ["Kalyan APMC", "Murbad APMC", "Ulhasnagar APMC"]),
    ("Mumbai Suburban", 19.0760, 72.8777, ["Vashi APMC (Navi Mumbai Central)", "Dadar Fruit Market"]),
    ("Ahmednagar", 19.0948, 74.7480, ["Rahuri APMC", "Kopargaon APMC", "Sangamner APMC", "Newasa APMC", "Shrirampur APMC", "Ahmednagar APMC"]),
    ("Jalgaon", 21.0077, 75.5626, ["Jalgaon APMC", "Raver APMC", "Chopda APMC", "Bhusawal APMC", "Pachora APMC", "Yawal APMC"]),
    ("Solapur", 17.6599, 75.9064, ["Solapur APMC", "Pandharpur APMC", "Barshi APMC", "Akkalkot APMC", "Karmala APMC", "Mohol APMC"]),
    ("Kolhapur", 16.7050, 74.2433, ["Kolhapur APMC (Shahu Market)", "Gadhinglaj APMC", "Jaysingpur APMC", "Hatkanangle APMC"]),
    ("Aurangabad", 19.8762, 75.3433, ["Chhatrapati Sambhajinagar APMC", "Vaijapur APMC", "Kannad APMC", "Paithan APMC", "Gangapur APMC"]),
    ("Amravati", 20.9320, 77.7523, ["Amravati Cotton Market", "Achalpur APMC", "Morshi APMC", "Warud APMC", "Daryapur APMC"]),
    ("Nagpur", 21.1458, 79.0882, ["Nagpur Orange Market APMC", "Kalmeshwar APMC", "Katol APMC", "Umred APMC", "Saoner APMC"]),
    ("Latur", 18.4088, 76.5604, ["Latur Pulse & Oilseed APMC", "Udgir APMC", "Ausa APMC", "Nilanga APMC", "Ahmedpur APMC"]),
    ("Nanded", 19.1383, 77.3210, ["Nanded APMC", "Degloor APMC", "Loha APMC", "Kinwat APMC", "Hadgaon APMC"]),
    ("Akola", 20.7002, 77.0082, ["Akola Cotton & Pulse APMC", "Murtizapur APMC", "Telhara APMC", "Balapur APMC"]),
    ("Sangli", 16.8524, 74.5815, ["Sangli Turmeric Market APMC", "Tasgaon APMC", "Islampur APMC", "Vita APMC"]),
    ("Satara", 17.6805, 74.0183, ["Satara APMC", "Karad APMC", "Phaltan APMC", "Wai APMC", "Koregaon APMC"]),
    ("Yavatmal", 20.3888, 78.1204, ["Yavatmal APMC", "Wani APMC", "Pusad APMC", "Umarkhed APMC"]),
    ("Wardha", 20.7453, 78.6022, ["Wardha APMC", "Hinganghat APMC", "Arvi APMC", "Pulgaon APMC"]),
    ("Buldhana", 20.5310, 76.1843, ["Malkapur APMC", "Khamgaon APMC", "Chikhli APMC", "Jalgaon Jamod APMC"]),
    ("Osmanabad", 18.1861, 76.0419, ["Dharashiv APMC", "Tuljapur APMC", "Omerga APMC", "Bhum APMC"]),
    ("Beed", 18.9891, 75.7601, ["Beed APMC", "Georai APMC", "Majalgaon APMC", "Parli APMC", "Ambejogai APMC"]),
    ("Parbhani", 19.2686, 76.7708, ["Parbhani APMC", "Gangakhed APMC", "Jintur APMC", "Sailu APMC"]),
    ("Jalna", 19.8347, 75.8816, ["Jalna Seed Market APMC", "Partur APMC", "Ambad APMC", "Bhokardan APMC"]),
    ("Dhule", 20.9042, 74.7749, ["Dhule APMC", "Shirpur APMC", "Dondaicha APMC", "Sakri APMC"]),
    ("Nandurbar", 21.3739, 74.2403, ["Nandurbar Chilli Market APMC", "Shahada APMC", "Navapur APMC"]),
    ("Raigad", 18.5158, 73.1822, ["Panvel APMC", "Karjat APMC", "Pen APMC", "Roha APMC"]),
    ("Ratnagiri", 16.9902, 73.3120, ["Ratnagiri Alphonso Market", "Chiplun APMC", "Khed APMC"]),
    ("Sindhudurg", 16.1189, 73.6933, ["Kudal APMC", "Kankavli APMC", "Sawantwadi APMC"]),
    ("Bhandara", 21.1713, 79.6548, ["Bhandara Rice Market APMC", "Tumsar APMC", "Sakoli APMC"]),
    ("Gondia", 21.4598, 80.1961, ["Gondia Paddy Hub APMC", "Tirora APMC", "Goregaon APMC"]),
    ("Chandrapur", 19.9615, 79.2961, ["Chandrapur APMC", "Warora APMC", "Ballarpur APMC"]),
    ("Gadchiroli", 20.1809, 80.0018, ["Gadchiroli APMC", "Armori APMC", "Chamorshi APMC"]),
    ("Hingoli", 19.7196, 77.1472, ["Hingoli Turmeric APMC", "Basmath APMC", "Kalamnuri APMC"]),
    ("Washim", 20.1118, 77.1352, ["Washim Soybean APMC", "Risod APMC", "Karanja Lad APMC"])
]

# Major National Trading Hubs
NATIONAL_HUBS = [
    ("Azadpur APMC", "North Delhi", "Delhi", 28.7166, 77.1770),
    ("Indore APMC", "Indore", "Madhya Pradesh", 22.7196, 75.8577),
    ("Ujjain APMC", "Ujjain", "Madhya Pradesh", 23.1765, 75.7885),
    ("Unjha APMC (Spices)", "Mehsana", "Gujarat", 23.8039, 72.3917),
    ("Rajkot APMC", "Rajkot", "Gujarat", 22.3039, 70.8022),
    ("Surat APMC", "Surat", "Gujarat", 21.1702, 72.8311),
    ("Hubli APMC", "Dharwad", "Karnataka", 15.3647, 75.1240),
    ("Belgaum APMC", "Belgaum", "Karnataka", 15.8497, 74.4977),
    ("Bhatinda APMC", "Bhatinda", "Punjab", 30.2110, 74.9455),
    ("Khanna APMC (Grain Market)", "Ludhiana", "Punjab", 30.7046, 76.2163),
    ("Karnal APMC", "Karnal", "Haryana", 29.6857, 76.9905),
    ("Kota APMC", "Kota", "Rajasthan", 25.2138, 75.8648),
    ("Warangal APMC", "Warangal", "Telangana", 17.9689, 79.5941),
    ("Guntur Chilli Yard", "Guntur", "Andhra Pradesh", 16.3067, 80.4365)
]

COMMODITIES_SPECS = [
    {"name": "Onion", "base_modal": 2150.0, "msp": 1900.0, "varieties": ["Red Nasik", "Garwa Winter", "Pol White"]},
    {"name": "Soybean", "base_modal": 4750.0, "msp": 4600.0, "varieties": ["JS 335", "MACS 1407", "NRC 37"]},
    {"name": "Cotton", "base_modal": 7250.0, "msp": 7020.0, "varieties": ["Medium Staple (LRA-5166)", "Long Staple (DCH-32)"]},
    {"name": "Tomato", "base_modal": 1850.0, "msp": 1400.0, "varieties": ["Hybrid Vaishali", "Shivam Red", "Abhinav"]},
    {"name": "Tur / Arhar", "base_modal": 8900.0, "msp": 7550.0, "varieties": ["Marathwada White", "BDN-711", "ICP-8863"]},
    {"name": "Wheat", "base_modal": 2580.0, "msp": 2275.0, "varieties": ["Lokwan Golden", "Sharbati Premium", "Kalyan Sona"]},
    {"name": "Gram / Chana", "base_modal": 5600.0, "msp": 5440.0, "varieties": ["Desi Chana", "Kabuli Dollar"]},
    {"name": "Maize", "base_modal": 2180.0, "msp": 2090.0, "varieties": ["Yellow Feed Grade", "Sweet Corn Hybrid"]}
]

def seed_database():
    print("Beginning AgroConnect Database Seeding...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # 1. Seed Users
        users = [
            # Farmers
            User(name="Ramesh Patil", phone="9822012345", email="ramesh.patil@kisan.in", role="FARMER", district="Nashik", state="Maharashtra", kyc_verified=True, rating=4.9),
            User(name="Sunita Deshmukh", phone="9822023456", email="sunita.deshmukh@kisan.in", role="FARMER", district="Pune", state="Maharashtra", kyc_verified=True, rating=4.8),
            User(name="Balasaheb Shinde", phone="9822034567", email="b.shinde@kisan.in", role="FARMER", district="Ahmednagar", state="Maharashtra", kyc_verified=True, rating=4.7),
            User(name="Dnyaneshwar Gaikwad", phone="9822045678", email="d.gaikwad@kisan.in", role="FARMER", district="Latur", state="Maharashtra", kyc_verified=True, rating=4.9),
            User(name="Prakash Jadhav", phone="9822056789", email="p.jadhav@kisan.in", role="FARMER", district="Solapur", state="Maharashtra", kyc_verified=True, rating=4.6),
            User(name="Santosh Borade", phone="9822067890", email="s.borade@kisan.in", role="FARMER", district="Jalgaon", state="Maharashtra", kyc_verified=True, rating=4.8),
            User(name="Ganesh Pawar", phone="9822078901", email="g.pawar@kisan.in", role="FARMER", district="Amravati", state="Maharashtra", kyc_verified=True, rating=4.7),

            # Institutional Buyers
            User(name="Sahyadri Agro Processing Ltd (Pravin Joshi)", phone="9821011111", email="procurement@sahyadriagro.in", role="BUYER", district="Nashik", state="Maharashtra", kyc_verified=True, rating=4.9),
            User(name="Godrej Agrovet Sourcing (Neha Verma)", phone="9821022222", email="n.verma@godrejagrovet.com", role="BUYER", district="Mumbai Suburban", state="Maharashtra", kyc_verified=True, rating=4.9),
            User(name="BigBasket Direct Farm Hub (Amit Singhal)", phone="9821033333", email="farmsourcing@bigbasket.com", role="BUYER", district="Pune", state="Maharashtra", kyc_verified=True, rating=4.8),
            User(name="Reliance Fresh Agro Hub (Vikas Mehta)", phone="9821044444", email="vikas.mehta@ril.com", role="BUYER", district="Mumbai Suburban", state="Maharashtra", kyc_verified=True, rating=4.7),

            # Official / Arbiter
            User(name="Dr. V. K. Kadam (APMC State Arbiter)", phone="9820099999", email="arbiter@msamb.gov.in", role="OFFICIAL", district="Pune", state="Maharashtra", kyc_verified=True, rating=5.0)
        ]
        db.add_all(users)
        db.commit()
        print(f"[OK] Seeded {len(users)} users (Farmers, Institutional Buyers, APMC Arbiter).")

        # 2. Seed 585+ Mandis
        mandis_list = []
        mandi_code_idx = 1000

        # Add explicit named Mandis from Maharashtra
        for district, base_lat, base_lng, apmc_names in MAHARASHTRA_DISTRICTS:
            for apmc in apmc_names:
                mandi_code_idx += 1
                lat = round(base_lat + random.uniform(-0.15, 0.15), 4)
                lng = round(base_lng + random.uniform(-0.15, 0.15), 4)
                mandis_list.append(
                    Mandi(
                        name=apmc,
                        code=f"MH-{mandi_code_idx}",
                        district=district,
                        state="Maharashtra",
                        lat=lat,
                        lng=lng,
                        is_enam=True,
                        distance_from_hub_km=round(random.uniform(25.0, 320.0), 1)
                    )
                )

        # Add national hubs
        for name, district, state, lat, lng in NATIONAL_HUBS:
            mandi_code_idx += 1
            mandis_list.append(
                Mandi(
                    name=name,
                    code=f"IN-{mandi_code_idx}",
                    district=district,
                    state=state,
                    lat=lat,
                    lng=lng,
                    is_enam=True,
                    distance_from_hub_km=round(random.uniform(400.0, 1100.0), 1)
                )
            )

        # Expand remaining up to 590 mandis to meet PRD's 585+ mandate
        sub_districts = ["Taluka Sub-Mandi", "Gramin Market", "Kisan Krishi Kendra", "Krishi Utpanna Bazar"]
        while len(mandis_list) < 590:
            dist_tuple = random.choice(MAHARASHTRA_DISTRICTS)
            district_name, base_lat, base_lng = dist_tuple[0], dist_tuple[1], dist_tuple[2]
            mandi_code_idx += 1
            sub = random.choice(sub_districts)
            mandis_list.append(
                Mandi(
                    name=f"{district_name} {sub} #{mandi_code_idx % 100}",
                    code=f"MH-{mandi_code_idx}",
                    district=district_name,
                    state="Maharashtra",
                    lat=round(base_lat + random.uniform(-0.25, 0.25), 4),
                    lng=round(base_lng + random.uniform(-0.25, 0.25), 4),
                    is_enam=random.random() > 0.15,
                    distance_from_hub_km=round(random.uniform(30.0, 480.0), 1)
                )
            )

        db.add_all(mandis_list)
        db.commit()
        print(f"✓ Seeded {len(mandis_list)} Mandis (meeting and exceeding the 585+ mandis requirement).")

        # 3. Seed Commodity Prices across Mandis
        prices_list = []
        today_str = datetime.utcnow().strftime("%Y-%m-%d")

        # Select a representative set of 60 top mandis for active live price feeds
        active_mandis = mandis_list[:60]
        for mandi in active_mandis:
            # 3 to 6 commodities per active mandi
            assigned_commodities = random.sample(COMMODITIES_SPECS, k=random.randint(4, len(COMMODITIES_SPECS)))
            for c_spec in assigned_commodities:
                variance = random.uniform(-0.12, 0.16)
                modal = round(c_spec["base_modal"] * (1.0 + variance), 1)
                min_p = round(modal * random.uniform(0.88, 0.94), 1)
                max_p = round(modal * random.uniform(1.05, 1.14), 1)
                chg = round(random.uniform(-4.5, 5.5), 1)

                prices_list.append(
                    CommodityPrice(
                        mandi_id=mandi.id,
                        mandi_name=mandi.name,
                        commodity=c_spec["name"],
                        variety=random.choice(c_spec["varieties"]),
                        min_price=min_p,
                        max_price=max_p,
                        modal_price=modal,
                        msp_price=c_spec["msp"],
                        arrivals_tonnes=round(random.uniform(45.0, 320.0), 1),
                        change_24h=chg,
                        price_date=today_str
                    )
                )

        db.add_all(prices_list)
        db.commit()
        print(f"✓ Seeded {len(prices_list)} live commodity price feeds across key APMCs.")

        # 4. Seed Produce Lots for Farmers
        farmers = [u for u in users if u.role == "FARMER"]
        lots_data = [
            (farmers[0], "Onion", "Red Nasik", 45.0, "Grade A", 10.5, 2350.0, "Lasalgaon APMC", "Nashik", "Export quality sun-cured Nashik Red onions with solid dry skin. Ready for dispatch."),
            (farmers[0], "Onion", "Garwa Winter", 25.0, "Grade A", 11.2, 2280.0, "Pimpalgaon APMC", "Nashik", "Uniform medium bulb size (45-55mm). High shelf life, packed in 50kg ventilated mesh bags."),
            (farmers[1], "Tomato", "Hybrid Vaishali", 35.0, "Grade A", 88.0, 1950.0, "Pune APMC (Gultekdi)", "Pune", "Firm red ripe tomatoes, sorted & graded. Direct cold storage staging available."),
            (farmers[2], "Soybean", "JS 335", 60.0, "Grade A", 9.8, 4820.0, "Rahuri APMC", "Ahmednagar", "Certified seed quality, moisture below 10%, clean winnowed with zero foreign matter."),
            (farmers[3], "Tur / Arhar", "Marathwada White", 40.0, "Grade A", 10.1, 9150.0, "Latur Pulse & Oilseed APMC", "Latur", "Prime Marathwada white pulse. Hand-picked grading with high protein content."),
            (farmers[4], "Cotton", "Medium Staple (LRA-5166)", 50.0, "Grade B", 8.2, 7150.0, "Solapur APMC", "Solapur", "Clean ginning quality, no trash contamination. 28mm staple length."),
            (farmers[5], "Wheat", "Lokwan Golden", 80.0, "Grade A", 10.0, 2640.0, "Jalgaon APMC", "Jalgaon", "Golden luster Lokwan grains, 100% sortex cleaned."),
            (farmers[6], "Gram / Chana", "Desi Chana", 30.0, "Grade A", 9.5, 5720.0, "Amravati Cotton Market", "Amravati", "High density Desi Chana, ideal for processing and dal milling.")
        ]

        created_lots = []
        for f, comm, var, qty, grade, moist, price, m_name, dist, desc in lots_data:
            lot = ProduceLot(
                farmer_id=f.id,
                farmer_name=f.name,
                farmer_phone=f.phone,
                mandi_name=m_name,
                district=dist,
                state="Maharashtra",
                commodity=comm,
                variety=var,
                quantity_quintals=qty,
                quality_grade=grade,
                moisture_percent=moist,
                base_price_per_quintal=price,
                expected_delivery_days=3,
                description=desc,
                status="AVAILABLE"
            )
            created_lots.append(lot)

        db.add_all(created_lots)
        db.commit()
        print(f"✓ Seeded {len(created_lots)} active produce lots.")

        # 5. Seed RFQs & Negotiations
        buyers = [u for u in users if u.role == "BUYER"]
        rfq1 = RFQ(
            lot_id=created_lots[0].id,
            buyer_id=buyers[0].id,
            buyer_name=buyers[0].name,
            buyer_phone=buyers[0].phone,
            farmer_id=farmers[0].id,
            farmer_name=farmers[0].name,
            commodity="Onion",
            quantity_quintals=45.0,
            initial_offer_price=2250.0,
            current_offered_price=2300.0,
            last_sender_role="FARMER",
            delivery_timeline_days=3,
            delivery_address="Sahyadri Mega Food Park, Dindori, Nashik",
            status="COUNTERED"
        )
        db.add(rfq1)
        db.commit()
        db.refresh(rfq1)

        msg1 = RFQMessage(
            rfq_id=rfq1.id,
            sender_id=buyers[0].id,
            sender_name=buyers[0].name,
            sender_role="BUYER",
            offered_price=2250.0,
            message_text="Sahyadri Agro interested in your 45 quintals. We offer ₹2,250/qtl with dockside unloading."
        )
        msg2 = RFQMessage(
            rfq_id=rfq1.id,
            sender_id=farmers[0].id,
            sender_name=farmers[0].name,
            sender_role="FARMER",
            offered_price=2300.0,
            message_text="This is Grade A export quality cure. Can do ₹2,300/qtl immediate dispatch."
        )
        db.add_all([msg1, msg2])

        # 6. Seed a Live Completed Contract & Escrow
        # Create an accepted RFQ that transformed into Contract #1
        contract_number = f"AGC-MH-{datetime.utcnow().strftime('%Y%m%d')}-00109"
        c1 = Contract(
            contract_number=contract_number,
            rfq_id=rfq1.id,
            lot_id=created_lots[1].id, # Garwa Winter 25 qtl
            buyer_id=buyers[1].id, # Godrej Agrovet
            buyer_name=buyers[1].name,
            farmer_id=farmers[0].id,
            farmer_name=farmers[0].name,
            commodity="Onion (Garwa)",
            quantity_quintals=25.0,
            final_price_per_quintal=2280.0,
            total_amount=57000.0,
            advance_amount=28500.0,
            balance_amount=28500.0,
            status="ADVANCE_ESCROW_LOCKED",
            farmer_signed=True,
            farmer_signed_at=datetime.utcnow() - timedelta(hours=6),
            farmer_sign_hash="SIG-7F3A91BC24E1D09A",
            buyer_signed=True,
            buyer_signed_at=datetime.utcnow() - timedelta(hours=5),
            buyer_sign_hash="SIG-89B2E01DF187425C",
            delivery_address="Godrej Central Cold Hub, Vashi APMC Sector 19"
        )
        c1.legal_terms = generate_contract_text(c1)
        db.add(c1)
        db.commit()
        db.refresh(c1)

        # Add Escrow Payment record for Contract 1
        esc1 = EscrowPayment(
            contract_id=c1.id,
            total_amount=57000.0,
            advance_amount=28500.0,
            advance_status="HELD_IN_ESCROW",
            balance_amount=28500.0,
            balance_status="UNPAID",
            payment_gateway_ref="RZP_ESCROW_LIVE_99812",
            advance_funded_at=datetime.utcnow() - timedelta(hours=4)
        )
        db.add(esc1)

        # 7. Seed Sample Dispute for Module 5 demonstration
        disp1 = Dispute(
            contract_id=c1.id,
            filed_by_id=buyers[1].id,
            filed_by_name=buyers[1].name,
            filed_by_role="BUYER",
            dispute_type="MOISTURE_EXCESS",
            tier="TIER_1_PEER",
            status="UNDER_NEGOTIATION",
            complaint_details="Moisture reading at gate test is 13.8% vs guaranteed 11.2%. Proposing standard ₹1,200 drying allowance deduction.",
            claimed_deduction=1200.0,
            evidence_urls="https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=600&auto=format&fit=crop"
        )
        db.add(disp1)

        db.commit()
        print("✓ Seeded sample RFQ negotiations, active contract with Escrow lock, and APMC dispute record.")
        print("\nSUCCESS: Database seeding complete with all PRD modules supported!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

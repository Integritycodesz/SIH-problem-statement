# AgroConnect — Market Linkages & Price Discovery Platform
**Smart India Hackathon 2026 — Problem Statement ID: 26132**  
*Organization: Government of Maharashtra & Maharashtra State Innovation Society (MSIS)*

---

## 🌾 Overview
AgroConnect is a market-intelligence and transaction-enablement platform built to eliminate the ₹40,000 Cr annual middleman extraction in Indian agriculture. It aggregates real-time prices across **585+ APMC mandis**, connects farmers and FPOs directly to verified corporate buyers, provides **Bilateral RFQ negotiation**, coordinates **RBI-backed milestone escrow payments**, and provides a **3-tier statutory dispute resolution mechanism**.

---

## 🚀 Quick Start & How to Run

### Method 1: Instant Launch (Windows)
Double-click **`start_app.bat`** in the root directory. It will start both the backend and frontend servers and automatically open the application in your default web browser.

### Method 2: Manual Terminal Launch

#### 1. Backend (FastAPI + SQLAlchemy)
```bash
cd backend
python -m pip install fastapi uvicorn sqlalchemy pydantic python-multipart httpx
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`

#### 2. Frontend (React 18 + TypeScript + Vite)
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
- Live Web Application: `http://127.0.0.1:5173/`

#### 3. Run Automated Tests
```bash
cd backend
python test_api.py
```

---

## 🏛️ Core Modules & Features

1. **Wholesale Produce Marketplace (`Marketplace` Tab)**
   - 4-point multi-attribute filter (Commodity, Quality Grade, Minimum Volume, FPO Region).
   - High-fidelity crop lots with laboratory assay certifications (Grade A+, NABL Certified).
   - **Bilateral RFQ Negotiation Console** with interactive counter-bid calculator, real-time savings telemetry, and 50% escrow advance lock.

2. **Mandi Price Intelligence (`Mandi Prices` Tab)**
   - Live APMC ticker and market metrics across 585+ mandis.
   - APMC Daily Arrivals table with 24h shift percentages and net realization calculation.
   - **Net-in-Hand Transport Calculator** with vehicle selection, GPS convoy freight rates, and direct DBT payout estimates.
   - Daily Mandi Bhav alert subscription on WhatsApp & SMS.

3. **Farmer Produce & Harvest Lots (`Farmer Produce` Tab)**
   - FPO-level inventory aggregation with warehouse capacity visualizers.
   - Active harvest lots with printable QR tags and moisture assay index.
   - Direct Institutional Buyers procurement feed (Reliance Retail Hub, BigBasket B2B, ITC Agri Business).
   - Maharashtra State MSP Floor Guarantee callout.

4. **Smart Contracts & Escrow Milestone Payments (`Escrow & Contracts` Tab)**
   - Auto-generated legal contracts compliant with the APMC Act 1963.
   - Aadhaar OTP & digital cryptographic signature verification.
   - 4-stage escrow milestone progression (50% Advance $\rightarrow$ Transit Dispatch $\rightarrow$ QC Sign-off $\rightarrow$ Balance Release).

5. **3-Tier Dispute Resolution (`Help & Disputes` Tab)**
   - Statutory arbitration hierarchy: Tier 1 Peer Negotiation $\rightarrow$ Tier 2 APMC Mandi Official Arbitration $\rightarrow$ Tier 3 State Marketing Board Panel.
   - Evidence collection & automatic escrow deduction adjustment upon ruling.

---

## 👥 Built-in SIH Demonstration Personas
Click the user profile pill in the top-right corner to toggle personas seamlessly without re-logging:
- **Farmer / FPO Delegate:** Rameshwar Patil (Nashik FPO)
- **Institutional Buyer:** Sahyadri Agro Processing (Pravin Joshi)
- **APMC Arbiter / Official:** Dr. V. K. Kadam (State Agricultural Marketing Board)
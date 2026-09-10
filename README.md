# AgroConnect — Market Linkages & Price Discovery Platform
**Smart India Hackathon 2026 — Problem Statement ID: 26132**  
*Organization: Government of Maharashtra & Maharashtra State Innovation Society (MSIS)*  
*Architecture: Direct Supabase Cloud (PostgreSQL 15+ & Realtime WebSockets)*

---

## 🌾 Overview
AgroConnect is a market-intelligence and transaction-enablement platform built to eliminate the ₹40,000 Cr annual middleman extraction in Indian agriculture. It aggregates real-time prices across **585+ APMC mandis**, connects farmers and FPOs directly to verified corporate buyers, provides **Bilateral RFQ negotiation**, coordinates **RBI-backed milestone escrow payments**, and provides a **3-tier statutory dispute resolution mechanism**.

Powered directly by **Supabase Cloud**, the application operates with sub-second price intelligence, live counter-bid updates, and milestone contract locks without requiring a dedicated middle-tier API server.

---

## 📁 Project Structure

```
SIH-problem-statement/
├── README.md                      # Project documentation and quick-start guide
├── start_app.bat                  # One-click Windows CMD launcher
├── start_app.ps1                  # Modern PowerShell launcher
├── start_app.sh                   # Linux / macOS / Git Bash launcher
│
├── docs/                          # Project documentation & requirements
│   ├── AgroConnect_PRD.docx       # Government Product Requirements Document
│   └── ARCHITECTURE.md            # Complete architecture & workflow specifications
│
├── frontend/                      # Web Application (React 19 + TypeScript + Vite)
│   ├── .env                       # Supabase client environment configuration
│   ├── .env.example               # Template environment configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx                # Main platform shell & tab navigator
│       ├── components/            # Feature modules
│       │   ├── BuyerDiscovery.tsx     # Wholesale produce marketplace & counter-bid console
│       │   ├── MandiIntelligence.tsx  # 585+ APMC prices & net-in-hand transport calculator
│       │   ├── FarmerPortal.tsx       # FPO inventory aggregation & harvest lots
│       │   ├── EscrowContractHub.tsx  # 4-stage milestone escrow & Aadhaar signatures
│       │   ├── DisputePortal.tsx      # 3-tier APMC statutory dispute resolution
│       │   └── Header.tsx             # Personas switcher & notification banner
│       ├── services/
│       │   ├── api.ts                 # Direct Supabase API client & transport calculation
│       │   └── supabase.ts            # Supabase singleton & Realtime WebSocket listeners
│       └── types/
│           └── index.ts               # Centralized TypeScript data models
│
└── supabase/                      # Cloud Database Schema & Migrations
    ├── README.md                  # Supabase deployment instructions
    ├── supabase_schema.sql        # Core DDL schema, extensions & RLS policies
    └── seed.sql                   # 585+ Mandis, prices, and demonstration dataset
```

---

## 🚀 Quick Start & How to Run

### Method 1: Instant Launch (Windows)
Double-click **`start_app.bat`** (or right-click `start_app.ps1` -> Run with PowerShell). It will start the frontend web server and automatically open the application in your browser.

### Method 2: Manual Terminal Launch
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
- Live Web Application: `http://127.0.0.1:5173/`

---

## ⚡ Supabase Setup (Optional for Live Cloud Mode)
By default, the platform includes high-fidelity built-in data so you can test all features instantly offline. To connect to your live Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/supabase_schema.sql` and `supabase/seed.sql` in the **SQL Editor**.
3. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `frontend/.env`.

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

## 👥 Built-in Demonstration Personas
Click the user profile pill in the top-right corner of the application to toggle personas seamlessly without re-logging:
- **Farmer / FPO Delegate:** Rameshwar Patil (Nashik FPO)
- **Institutional Buyer:** Sahyadri Agro Processing (Pravin Joshi)
- **APMC Arbiter / Official:** Dr. V. K. Kadam (State Agricultural Marketing Board)
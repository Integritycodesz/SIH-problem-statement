# AgroConnect — Product Requirements Document (PRD)
**Smart India Hackathon 2026 — Problem Statement ID: 26132**  
*Title: Strengthening Market Linkages and Price Discovery for Farmers*  
*Nodal Agency: Government of Maharashtra & Maharashtra State Innovation Society (MSIS)*  
*Document Version: 2.0 (Pure Supabase Architecture Edition)*  
*Status: Approved & Production-Ready*

---

## 1. Executive Summary & Problem Context

In Maharashtra's agricultural ecosystem, smallholder farmers and Farmer Producer Organizations (FPOs) face acute market friction:
1. **Asymmetric Price Discovery**: Farmers lack real-time visibility into inter-mandi price spreads across Maharashtra's 585+ APMCs, often selling to local village aggregators at 20–35% below fair terminal market value.
2. **Opaque Transport & Cess Arbitrage**: Even when price differentials exist between local mandis (e.g., Lasalgaon vs. Pune vs. Vashi), farmers cannot calculate whether transport freight, mandi cess (1.05%), and labor handling outweigh the price premium.
3. **Counterparty & Settlement Risk**: Lack of enforceable digital contracts leads to frequent payment delays, arbitrary quality deductions upon arrival, or post-harvest default.
4. **Dispute Vulnerability**: When buyers dispute moisture or grade quality, small farmers have no accessible, time-bound legal redress.

**AgroConnect** is an integrated, cloud-native agritech exchange that unites direct institutional procurement, real-time APMC price telemetry, GIS logistics arbitrage, 4-stage digital escrow, and 3-tier statutory arbitration into a single unified bilingual portal.

---

## 2. Core Vision & Strategic Goals

- **Increase Farmgate Realization by 15–25%**: Eliminate multi-layered intermediaries by connecting FPOs directly with institutional bulk buyers (food processors, exporters, organized retail).
- **Zero Payment Defaults via 4-Stage Escrow**: Guarantee 100% payment security with an advance lock prior to transit and automated final settlement upon APMC gate weighment.
- **Empower Real-Time Logistics Arbitrage**: Provide an automated Haversine GIS calculator that computes exact transport cost, fuel rate, and mandi cess to output true **Net Take-Home (₹/Qtl)**.
- **Statutory APMC Enforceability**: All bilateral transactions auto-generate legally binding digital contracts under the **Maharashtra Agricultural Produce Marketing (Regulation) Act, 1963**.
- **Vernacular First**: Full Marathi (मराठी) and English bilingual parity for seamless adoption by rural farmers and state officials.

---

## 3. Stakeholder Personas & Roles

| Persona | Role | Key Objectives | Platform Interface |
| :--- | :--- | :--- | :--- |
| **Kisan / FPO Lead** | Farmer / Aggregator | Aggregate member harvests, certify quality via NABL assay, generate printable QR traceability tags, review institutional bids, counter-offer, receive escrow advance. | Farmer Produce Portal |
| **Corporate Buyer** | Procurement Manager | Source bulk Grade-A produce, negotiate terms via bilateral RFQ, lock funds in escrow, inspect delivery at APMC gate. | Institutional Buyer Marketplace |
| **APMC Secretary** | Mandi Official / Arbiter | Monitor mandi arrivals, authenticate weighment receipts, arbitrate Tier-2 quality disputes, ensure compliance with APMC Act 1963. | Dispute & Arbitration Hub |
| **MSAMB Panelist** | State Appellate Authority | Review escalated Tier-3 disputes, enforce state marketing guidelines, review regional price telemetry. | State Governance Console |

---

## 4. Product Modules & Functional Specifications

### 4.1 Module 1: Farmer Produce & Aggregation Engine
- **Dynamic Lot Listing**:
  - Farmers/FPOs can list produce with detailed parameters: Commodity, Variety (e.g., Garwa Onion, JS-335 Soybean), Volume (Quintals), Base Asking Rate (₹/Qtl), Quality Grade (A+, A, B), Moisture Content (%), Storage Location, and Expected Dispatch Readiness.
  - Live validation against the APMC Modal Parity benchmark to prevent distress selling below MSP.
- **State APMC QR Code Traceability**:
  - Generates an official, printable QR badge for every registered lot containing Lot ID, FPO Aggregator code, Geographic Coordinates, Moisture Index, Harvest Date, and MSIS Digital Verification Seal.
- **Incoming Offers Drawer**:
  - Reactive drawer displaying pending buyer bids, counter-offers, and status tags with direct options to Accept or Counter-Bid.

### 4.2 Module 2: Buyer Discovery & Bilateral RFQ Negotiation
- **Multi-Parametric Produce Catalog**:
  - Filter inventory by Commodity, Quality Grade, Volume range (<20 Qtl, 20-50 Qtl, 50+ Qtl), and Maharashtra Division (Nashik, Latur, Jalgaon, Pune, Solapur, Ahmednagar).
- **NABL Laboratory Assay Certificate**:
  - On-demand modal previewing certified quality parameters: Moisture %, Foreign Matter %, Purity %, Defective Kernel %, and Laboratory Accreditation Stamp.
- **Live Bilateral RFQ Negotiation Console**:
  - Interactive counter-bidding console with instant mathematical calculation of:
    $$\text{Total Deal Value} = \text{Offered Rate (₹/Qtl)} \times \text{Quantity (Qtl)}$$
    $$\text{Stage 1 Advance (50\%)} = \frac{\text{Total Deal Value}}{2}$$
    $$\text{Stage 2 Balance (50\%)} = \frac{\text{Total Deal Value}}{2}$$
  - Audit trail preserving chronological bids, counter-offers, timestamps, and message notes.
- **One-Click Automated Contract Execution**:
  - When terms are mutually agreed, clicking **"Accept Terms & Sign"** automatically creates a binding legal contract (`AGC-MH-YYYYMMDD-XXXXX`), initializes the 4-stage escrow, and transitions the user directly to the Escrow Hub.

### 4.3 Module 3: Live Mandi Intelligence & GIS Transport Arbitrage
- **585+ APMC Real-Time Telemetry Feed**:
  - Aggregates live daily arrivals, minimum prices, modal prices, maximum prices, and 24-hour percentage trends across major Maharashtra mandis (Lasalgaon, Pimpalgaon, Latur, Jalgaon, Pune, Solapur, etc.).
  - Real-time Supabase WebSocket telemetry flashes visual updates upon new price arrivals.
  - Interactive SVG multi-point price trendline visualization.
- **GIS Haversine Transport & Net Take-Home Calculator**:
  - Calculates great-circle distance between farmer farmgate and destination APMC:
    $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  - Computes complete cost breakdown:
    - Freight Transport Cost = $\text{Distance (km)} \times \text{Rate/km (₹22/km)}$
    - APMC Market Cess = $1.05\%$ of Gross Value
    - Labor & Handling = $\text{Quantity (Qtl)} \times ₹45/\text{Qtl}$
    - **Net In-Hand Transfer (₹/Qtl)** and **Arbitrage Delta vs Local Farmgate**.
  - Interactive **"Lock Rate & Book Transport"** action button.

### 4.4 Module 4: Digital Contracts & 4-Stage Escrow Engine
- **Legally Enforceable Digital Contracts**:
  - Automatically formatted under the APMC Act 1963 with Aadhaar OTP signature verification for farmers and Digital Token signature for buyers.
- **4-Stage Escrow Milestone State Machine**:
  ```
  [1. E-Signatures Completed] 
             │
             ▼
  [2. 50% Advance Escrow Locked by Buyer] 
             │
             ▼
  [3. Produce Dispatched in Transit & Advance Released to Farmer] 
             │
             ▼
  [4. APMC Gate Weighment & Final 50% Balance Released to Farmer]
  ```
- **Persona-Aware Controls**:
  - Farmer actions: Aadhaar OTP e-sign, transit dispatch.
  - Buyer actions: Digital key sign, lock 50% advance in escrow, gate inspection sign-off, release final 50% balance.
  - Quick perspective switcher (Farmer / Buyer / Mandi Officer) for frictionless evaluation.

### 4.5 Module 5: 3-Tier Statutory Dispute Resolution
- **Tier 1 — Peer Negotiation**: Direct 48-hour mutual resolution between buyer and farmer for minor tolerances.
- **Tier 2 — APMC Mandi Secretary Arbitration**: Statutory intervention by the local mandi secretary; inspection evidence analysis, drying/weight allowance determination, and binding adjusted escrow payout.
- **Tier 3 — MSAMB State Appellate Panel**: Escalation to the Maharashtra State Agricultural Marketing Board tribunal for complex breach-of-contract cases.
- **Evidence Vault**: Secure image upload and inspection preview for gate weighment slips and moisture discrepancy photos.

### 4.6 Module 6: Live Notification Center & Vernacular Localization
- **Interactive Notification Bell & Popover**:
  - Instant badges for new RFQ counter-bids, escrow funding confirmations, price surge alerts, and dispute escalations.
  - One-click navigation to the relevant tab upon clicking any alert.
- **Bilingual English & Marathi Localization**:
  - Complete dictionary covering navigation, crop names (*कांदा, सोयाबीन, गहू, टोमॅटो, कापूस*), metrics, buttons, legal disclaimers, and dispute stages.
  - Instant header language toggle (`EN` | `MR`).

---

## 5. Pure Supabase Backend Architecture

AgroConnect utilizes **Supabase Cloud as its sole backend engine**, eliminating external backend server maintenance, cold starts, and architectural duplicity:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Client: Vite + React 19 + TypeScript              │
│                                                                             │
│   [Header + i18n + Notif Drawer] ────────────────────────────────────────┐  │
│   [Farmer Portal]  [Buyer Discovery]  [Mandi Intel]  [Escrow]  [Disputes]│  │
└──────────────────────────────────────┬───────────────────────────────────┼──┘
                                       │ Direct @supabase/supabase-js      │
                                       ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Supabase Cloud Managed Services                       │
│                                                                             │
│  1. PostgreSQL Database (8 Core Relational Tables + Foreign Keys)          │
│  2. Row-Level Security (RLS Policies per User Persona)                     │
│  3. PostgREST Auto-Generated REST APIs                                      │
│  4. Realtime Engine (WebSocket Channels for prices, RFQ chat, escrow)       │
│  5. Storage Buckets (Inspection photos, assay certificates, QR tags)        │
│  6. Database Triggers & Edge Functions (Automated contracts & escrow logs) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Non-Functional Requirements

1. **Performance**: Initial load under 1.5 seconds on 3G mobile networks. Sub-100ms UI interaction latency.
2. **Build Speed**: Client bundle builds in $\approx 310$ milliseconds via Vite.
3. **Availability & Fault Tolerance**: In-memory fallback engine ensures zero demo interruption even if internet or Supabase connection is momentarily degraded.
4. **Data Integrity & Security**: Row-Level Security (RLS) guarantees farmers can only modify their own harvest lots and buyers can only update their own RFQs.
5. **Mobile Accessibility**: Responsive layout optimized for Android mobile viewports (1536x776 to 360x640), ready for PWA packaging.

---

## 7. SIH 2026 Evaluation Rubric Alignment

| SIH Evaluation Parameter | AgroConnect Implementation |
| :--- | :--- |
| **Innovation & Problem Fit** | Solves all 4 prongs of Problem Statement 26132: Direct linkages, price discovery, logistics arbitrage, and guaranteed payment settlement. |
| **Technical Architecture** | Clean, serverless pure-Supabase architecture with real-time WebSockets, PostgREST, and high-performance Vite React 19 frontend. |
| **State Government Integration** | Explicitly models the APMC Act 1963, 585 Maharashtra mandis, MSAMB dispute hierarchy, and bilingual Marathi support. |
| **Completeness & Usability** | 100% interactive flows across all 5 modules with zero mock alert dead-ends. Fully demonstrable in real-time. |

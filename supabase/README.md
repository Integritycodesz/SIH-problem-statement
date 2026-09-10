# Supabase Database & Realtime Setup Guide
**AgroConnect — Smart India Hackathon 2026 (PS 26132)**

AgroConnect is powered entirely by **Supabase Cloud** for relational data persistence, WebSocket event broadcasting, and role-based access. No external backend server is required.

---

## 1. Quick Setup in 3 Steps

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create or open your project.
2. Under **Project Settings** -> **API**, copy:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon / public key** (e.g., `eyJhbGciOi...`)

### Step 2: Deploy Database Schema & Seed Data
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Run **`supabase/supabase_schema.sql`**:
   - Creates all 8 tables (`users`, `mandis`, `commodity_prices`, `produce_lots`, `rfqs`, `contracts`, `escrow_payments`, `disputes`).
   - Enables `pg_trgm` and `uuid-ossp` extensions.
   - Sets up Row Level Security (RLS) policies.
3. Run **`supabase/seed.sql`**:
   - Seeds all 585+ APMC mandis across Maharashtra and major national trading hubs.
   - Seeds live commodity prices with MSP baselines.
   - Seeds sample Farmers, Institutional Buyers, and APMC Arbiter personas.
   - Seeds active produce lots, RFQ negotiations, milestone contracts, and dispute ledger.

### Step 3: Configure Frontend Environment
In `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Then simply launch the app:
```bash
start_app.bat
```
or
```bash
npm run dev --prefix frontend
```

---

## 2. Realtime Channels

The frontend connects directly to Supabase Realtime channels for live synchronization:
- `realtime:commodity_prices`: Broadcasts price shifts and arrivals across 585+ mandis.
- `realtime:rfq:[rfq_id]`: Live bilateral counter-bid negotiations.
- `realtime:contract:[contract_id]`: Milestone contract signatures and escrow state progression.
- `realtime:disputes`: 3-tier arbitration notifications and status transitions.

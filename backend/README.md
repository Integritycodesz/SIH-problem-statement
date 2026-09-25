# AgroConnect Forecasting & AI Assay Microservice

Institutional-grade Agricultural Time-Series Forecasting & Quality Assay Microservice built with FastAPI, SARIMAX, Fourier Seasonal Decomposition, Spatial Arbitrage Engine, and Optical Computer Vision.

## Features
- **Bayesian Ensemble Price Forecast:** Combines SARIMAX, Fourier Harmonics, Mandi Spatial Clusters, and NCDEX Derivatives.
- **Optical AI Produce Quality Assay:** Multi-spectral CV analyzing pigmentation, blemish necrosis, and morphometry.
- **Exogenous Integration:** IMD Agromet Weather feeds, DGFT Trade Tariffs, and Agmarknet Telemetry.
- **Supabase Connectivity:** Connects directly with PostgreSQL for real-time telemetry.

## Running Locally

1. Create a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux / macOS:
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the service:
   ```bash
   python run_service.py
   ```
   The service will start on `http://localhost:8000`.
   Interactive Swagger docs are at `http://localhost:8000/docs`.

## Deploying on Render (Standalone Web Service)

1. Push this repository to GitHub (e.g. `agroconnect-backend`).
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Web Service** and connect this repository.
4. Render will auto-detect `render.yaml` or set:
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python run_service.py`
5. Ensure environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `AGMARKNET_API_KEY`) are configured.

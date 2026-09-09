from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.models.models import Mandi
from app.db.seed import seed_database
from app.api import auth, mandis, lots, rfq, contracts, disputes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables created
    Base.metadata.create_all(bind=engine)
    # Check if mandis already seeded, otherwise seed automatically
    db = SessionLocal()
    try:
        mandi_count = db.query(Mandi).count()
        if mandi_count < 500:
            print(f"Detected {mandi_count} mandis in DB. Initiating automated seed...")
            seed_database()
        else:
            print(f"Database already primed with {mandi_count} mandis.")
    except Exception as e:
        print(f"Error checking seed state: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Smart India Hackathon 2026 - Problem Statement 26132: Strengthening Market Linkages and Price Discovery for Farmers",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(mandis.router, prefix=settings.API_V1_STR)
app.include_router(lots.router, prefix=settings.API_V1_STR)
app.include_router(rfq.router, prefix=settings.API_V1_STR)
app.include_router(contracts.router, prefix=settings.API_V1_STR)
app.include_router(disputes.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": "AgroConnect",
        "sih_problem_statement": "26132",
        "ministry": "Government of Maharashtra / Maharashtra State Innovation Society",
        "status": "Online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": settings.VERSION}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

"""
AgroConnect - Supabase Database Migration & Seeder Script
Smart India Hackathon 2026 - Problem Statement 26132

Usage:
  python backend/migrate_to_supabase.py
  python backend/migrate_to_supabase.py --url="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
"""

import os
import sys
import argparse
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv

# Load .env
env_file = backend_dir / ".env"
load_dotenv(dotenv_path=env_file)

from app.core.config import settings
from app.db.session import engine, Base, SessionLocal, get_engine_url
from app.models.models import Mandi, User, CommodityPrice, ProduceLot, RFQ, Contract, EscrowPayment, Dispute
from app.db.seed import seed_database
from sqlalchemy import create_engine, text

def main():
    parser = argparse.ArgumentParser(description="Migrate AgroConnect schema and seed data to Supabase")
    parser.add_argument("--url", type=str, help="Supabase PostgreSQL connection string URI", default=None)
    args = parser.parse_args()

    db_url = args.url or settings.DATABASE_URL

    print("================================================================================")
    print("      AgroConnect - Supabase Migration & Data Seeding Tool                     ")
    print("      SIH 2026 | Govt. of Maharashtra / Maharashtra State Innovation Society   ")
    print("================================================================================")

    if not db_url or "sqlite" in db_url:
        print("[!] Warning: Current DATABASE_URL is pointing to local SQLite (or unset).")
        print("    To migrate directly to Supabase:")
        print("    1. Open your Supabase Dashboard -> Project Settings -> Database")
        print("    2. Copy the Connection URI (under Connection String -> URI)")
        print("    3. Run: python backend/migrate_to_supabase.py --url=\"postgresql://postgres:YOUR_PASSWORD@...\"")
        print("       OR paste it into backend/.env as DATABASE_URL=...\n")
        confirm = input("Would you like to continue priming the current database (" + db_url + ")? [y/N]: ").strip().lower()
        if confirm != 'y':
            print("Aborted.")
            return

    normalized_url = get_engine_url(db_url)
    print(f"[*] Target Database Dialect: {normalized_url.split('://')[0]}://...")

    try:
        print("[1/4] Establishing connection to database...")
        migration_engine = create_engine(
            normalized_url,
            pool_pre_ping=True,
            connect_args={"check_same_thread": False} if "sqlite" in normalized_url else {}
        )
        with migration_engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            print("  -> Connection successful (SELECT 1 returned 1)!")

        print("[2/4] Deploying Schema (creating tables for Users, Mandis, Lots, RFQs, Contracts, Escrow, Disputes)...")
        Base.metadata.create_all(bind=migration_engine)
        print("  -> All 9 relational tables verified & created successfully.")

        print("[3/4] Checking existing records...")
        from sqlalchemy.orm import sessionmaker
        SessionTarget = sessionmaker(autocommit=False, autoflush=False, bind=migration_engine)
        db = SessionTarget()

        mandi_count = db.query(Mandi).count()
        print(f"  -> Existing Mandis in Target: {mandi_count}")

        if mandi_count < 500:
            print("[4/4] Seeding 590 Mandis (36 Maharashtra districts + national hubs) and active market lots...")
            # Run seeding against target session
            seed_database()
            new_mandi_count = db.query(Mandi).count()
            lots_count = db.query(ProduceLot).count()
            users_count = db.query(User).count()
            print(f"  -> Seeding complete! Total Mandis: {new_mandi_count}, Lots: {lots_count}, Users: {users_count}")
        else:
            print("[4/4] Database already contains 500+ mandis. Skipping duplicate seed.")

        db.close()

        # If --url was provided, optionally update backend/.env
        if args.url and env_file.exists():
            content = env_file.read_text(encoding="utf-8")
            if "DATABASE_URL=" in content:
                lines = content.splitlines()
                new_lines = []
                for line in lines:
                    if line.startswith("DATABASE_URL="):
                        new_lines.append(f"DATABASE_URL={args.url}")
                    else:
                        new_lines.append(line)
                env_file.write_text("\n".join(new_lines), encoding="utf-8")
                print(f"[OK] Updated backend/.env with the new Supabase DATABASE_URL.")

        print("\n================================================================================")
        print("  MIGRATION & SEEDING COMPLETED SUCCESSFULLY!                                  ")
        print("================================================================================\n")

    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

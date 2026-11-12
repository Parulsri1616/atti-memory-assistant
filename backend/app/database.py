from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# SQLite connection requires check_same_thread=False for multithreaded FastAPI requests
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db_and_migrate():
    """
    Ensures all database tables exist and applies backward-compatible column migrations
    for SQLite without data loss or dropping tables.
    """
    from sqlalchemy import inspect, text
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        inspector = inspect(engine)
        if "patients" in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns("patients")]
            if "role" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN role VARCHAR(20) DEFAULT 'patient'"))
            if "account_status" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN account_status VARCHAR(20) DEFAULT 'active'"))
            if "associated_patient_id" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN associated_patient_id INTEGER REFERENCES patients(id)"))
            if "age" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN age INTEGER"))
            if "date_of_birth" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN date_of_birth VARCHAR(50)"))
            if "address" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN address VARCHAR(255)"))
            if "emergency_contact_phone" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN emergency_contact_phone VARCHAR(50)"))
            if "emergency_contact_relation" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN emergency_contact_relation VARCHAR(50)"))
            if "blood_group" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN blood_group VARCHAR(20)"))
            if "allergies" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN allergies VARCHAR(255)"))
            if "medical_conditions" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN medical_conditions TEXT"))
            if "care_instructions" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN care_instructions TEXT"))
            conn.commit()

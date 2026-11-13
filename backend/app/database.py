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
            if "preferred_language" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN preferred_language VARCHAR(50) DEFAULT 'English / Hindi'"))
            if "doctor_name" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN doctor_name VARCHAR(100) DEFAULT 'Dr. Arvind Mehra'"))
            if "doctor_phone" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN doctor_phone VARCHAR(50) DEFAULT '+91 98112 34567'"))
            if "doctor_clinic" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN doctor_clinic VARCHAR(150) DEFAULT 'Fortis Hospital, Vasant Kunj'"))
            if "communication_preferences" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN communication_preferences TEXT DEFAULT 'Voice-first, calm tone, clear short sentences'"))
            if "profile_photo_url" not in columns:
                conn.execute(text("ALTER TABLE patients ADD COLUMN profile_photo_url VARCHAR(255)"))

        if "people" in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns("people")]
            if "description" not in columns:
                conn.execute(text("ALTER TABLE people ADD COLUMN description TEXT"))
            if "voice_message_url" not in columns:
                conn.execute(text("ALTER TABLE people ADD COLUMN voice_message_url VARCHAR(255)"))

        if "daily_routines" in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns("daily_routines")]
            if "scheduled_date" not in columns:
                conn.execute(text("ALTER TABLE daily_routines ADD COLUMN scheduled_date VARCHAR(50) DEFAULT 'today'"))
            if "repeat_frequency" not in columns:
                conn.execute(text("ALTER TABLE daily_routines ADD COLUMN repeat_frequency VARCHAR(50) DEFAULT 'Daily'"))
            if "status" not in columns:
                conn.execute(text("ALTER TABLE daily_routines ADD COLUMN status VARCHAR(30) DEFAULT 'scheduled'"))
            if "reminder_minutes_before" not in columns:
                conn.execute(text("ALTER TABLE daily_routines ADD COLUMN reminder_minutes_before INTEGER DEFAULT 15"))
            if "acknowledged_at" not in columns:
                conn.execute(text("ALTER TABLE daily_routines ADD COLUMN acknowledged_at DATETIME"))
            if "completed_at" not in columns:
                conn.execute(text("ALTER TABLE daily_routines ADD COLUMN completed_at DATETIME"))

        if "medications" in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns("medications")]
            if "start_date" not in columns:
                conn.execute(text("ALTER TABLE medications ADD COLUMN start_date VARCHAR(50)"))
            if "end_date" not in columns:
                conn.execute(text("ALTER TABLE medications ADD COLUMN end_date VARCHAR(50)"))
            if "frequency" not in columns:
                conn.execute(text("ALTER TABLE medications ADD COLUMN frequency VARCHAR(50) DEFAULT 'Every day'"))
            if "timing_slot" not in columns:
                conn.execute(text("ALTER TABLE medications ADD COLUMN timing_slot VARCHAR(50) DEFAULT 'Morning'"))
            if "current_stock" not in columns:
                conn.execute(text("ALTER TABLE medications ADD COLUMN current_stock INTEGER DEFAULT 30"))
            if "refill_threshold" not in columns:
                conn.execute(text("ALTER TABLE medications ADD COLUMN refill_threshold INTEGER DEFAULT 5"))
            if "refill_reminder_days" not in columns:
                conn.execute(text("ALTER TABLE medications ADD COLUMN refill_reminder_days INTEGER DEFAULT 5"))
            if "needs_refill" not in columns:
                conn.execute(text("ALTER TABLE medications ADD COLUMN needs_refill BOOLEAN DEFAULT 0"))
            if "last_status" not in columns:
                conn.execute(text("ALTER TABLE medications ADD COLUMN last_status VARCHAR(30) DEFAULT 'pending'"))
            if "last_acknowledged_at" not in columns:
                conn.execute(text("ALTER TABLE medications ADD COLUMN last_acknowledged_at DATETIME"))
            if "last_taken_at" not in columns:
                conn.execute(text("ALTER TABLE medications ADD COLUMN last_taken_at DATETIME"))

        conn.commit()

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float
from .database import Base

class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    relationship = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=True)
    photo_url = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    visit_schedule = Column(String(255), nullable=True)
    keywords = Column(String(255), nullable=True)  # Comma-separated synonyms / nicknames

class DailyRoutine(Base):
    __tablename__ = "daily_routines"

    id = Column(Integer, primary_key=True, index=True)
    time = Column(String(10), nullable=False)  # "08:30" (24h)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="activity")  # meal, medication, activity, appointment
    day_of_week = Column(String(50), default="daily")  # "daily" or comma-separated days
    is_active = Column(Boolean, default=True)

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    dosage = Column(String(50), nullable=True)
    schedule_time = Column(String(50), nullable=False)  # "08:30 AM" or "After breakfast"
    purpose = Column(String(150), nullable=True)
    instructions = Column(Text, nullable=True)
    last_taken_date = Column(String(50), nullable=True)

class PersonalItem(Base):
    __tablename__ = "personal_items"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    keywords = Column(String(255), nullable=True)

class LifeEvent(Base):
    __tablename__ = "life_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    date_or_period = Column(String(100), nullable=True)
    category = Column(String(50), default="memory")  # career, family, travel, childhood
    description = Column(Text, nullable=False)
    keywords = Column(String(255), nullable=True)

class InteractionLog(Base):
    __tablename__ = "interaction_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    client_time = Column(String(50), nullable=True)
    query_text = Column(Text, nullable=False)
    intent = Column(String(50), nullable=False)
    response_text = Column(Text, nullable=False)
    was_fallback = Column(Boolean, default=False)
    retrieved_records_count = Column(Integer, default=0)
    audio_played = Column(Boolean, default=False)

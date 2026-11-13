from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey
from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="patient", nullable=False)  # "patient", "caregiver" / "family"
    account_status = Column(String(20), default="active", nullable=False)
    call_sign = Column(String(50), default="Meera")
    caregiver_name = Column(String(100), default="Ananya Sharma")
    associated_patient_id = Column(Integer, ForeignKey("patients.id", ondelete="SET NULL"), nullable=True)
    age = Column(Integer, nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(50), nullable=True)
    emergency_contact_relation = Column(String(50), nullable=True)
    blood_group = Column(String(20), nullable=True)
    allergies = Column(String(255), nullable=True)
    medical_conditions = Column(Text, nullable=True)
    care_instructions = Column(Text, nullable=True)
    preferred_language = Column(String(50), default="English / Hindi")
    doctor_name = Column(String(100), default="Dr. Arvind Mehra")
    doctor_phone = Column(String(50), default="+91 98112 34567")
    doctor_clinic = Column(String(150), default="Fortis Hospital, Vasant Kunj")
    communication_preferences = Column(Text, default="Voice-first, calm tone, clear short sentences")
    profile_photo_url = Column(String(255), nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    token_jti = Column(String(64), unique=True, index=True, nullable=False)
    token_hash = Column(String(128), index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    replaced_by_jti = Column(String(64), nullable=True)

class AuthToken(Base):
    __tablename__ = "auth_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(128), unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)

class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    relationship = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=True)
    photo_url = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    voice_message_url = Column(String(255), nullable=True)
    visit_schedule = Column(String(255), nullable=True)
    keywords = Column(String(255), nullable=True)  # Comma-separated synonyms / nicknames

class DailyRoutine(Base):
    __tablename__ = "daily_routines"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True, index=True)
    time = Column(String(10), nullable=False)  # "08:30" (24h)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="activity")  # meal, medication, activity, appointment, water, exercise, sleep, visit, custom
    day_of_week = Column(String(50), default="daily")  # "daily" or comma-separated days
    scheduled_date = Column(String(50), default="today")
    repeat_frequency = Column(String(50), default="Daily")  # Daily, Weekdays, Weekends, Once
    status = Column(String(30), default="scheduled")  # scheduled, pending, acknowledged, completed, snoozed, missed, cancelled
    reminder_minutes_before = Column(Integer, default=15)
    acknowledged_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    dosage = Column(String(50), nullable=True)
    schedule_time = Column(String(50), nullable=False)  # "08:30 AM" or "After breakfast"
    purpose = Column(String(150), nullable=True)
    instructions = Column(Text, nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    frequency = Column(String(50), default="Every day")  # Every day, Twice a day, Once a week, etc.
    timing_slot = Column(String(50), default="Morning")  # Morning, Afternoon, Evening, Night
    current_stock = Column(Integer, default=30)
    refill_threshold = Column(Integer, default=5)
    refill_reminder_days = Column(Integer, default=5)
    needs_refill = Column(Boolean, default=False)
    last_status = Column(String(30), default="pending")  # scheduled, pending, acknowledged, completed, snoozed, missed
    last_acknowledged_at = Column(DateTime, nullable=True)
    last_taken_at = Column(DateTime, nullable=True)
    last_taken_date = Column(String(50), nullable=True)

class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_time = Column(String(50), nullable=False)
    scheduled_date = Column(String(50), nullable=False)
    status = Column(String(30), default="scheduled")  # scheduled, pending, acknowledged, completed, snoozed, missed
    acknowledged_at = Column(DateTime, nullable=True)
    taken_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DoctorAppointment(Base):
    __tablename__ = "doctor_appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_name = Column(String(100), nullable=False)
    clinic_or_hospital = Column(String(150), nullable=False)
    appointment_date = Column(String(50), nullable=False)  # "2026-11-20"
    appointment_time = Column(String(50), nullable=False)  # "11:00 AM"
    notes = Column(Text, nullable=True)
    advance_reminder_hours = Column(Integer, default=24)
    follow_up_reminder_date = Column(String(50), nullable=True)
    status = Column(String(30), default="scheduled")  # scheduled, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    routine_id = Column(Integer, ForeignKey("daily_routines.id", ondelete="SET NULL"), nullable=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), default="activity")
    scheduled_time = Column(String(50), nullable=True)
    status = Column(String(30), default="completed")  # scheduled, pending, acknowledged, completed, snoozed, missed
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

class FamiliarPlace(Base):
    __tablename__ = "familiar_places"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    address_or_location = Column(String(255), nullable=False)
    category = Column(String(50), default="frequent")  # home, park, temple, clinic, market, cafe
    description = Column(Text, nullable=True)
    photo_url = Column(String(255), nullable=True)
    is_safe_zone = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class MemoryFact(Base):
    __tablename__ = "memory_facts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)  # habit, detail, faq, name, history
    question_or_topic = Column(String(200), nullable=False)
    answer_or_detail = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SafeZone(Base):
    __tablename__ = "safe_zones"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), default="Home Safe Zone")
    center_latitude = Column(Float, default=28.5355)
    center_longitude = Column(Float, default=77.2100)
    radius_meters = Column(Integer, default=500)
    address = Column(String(255), default="24, Green Park, New Delhi")
    is_active = Column(Boolean, default=True)
    monitoring_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class LocationLog(Base):
    __tablename__ = "location_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    accuracy_meters = Column(Float, default=12.0)
    is_inside_safe_zone = Column(Boolean, default=True)
    status_label = Column(String(50), default="At Home")
    battery_level = Column(Integer, default=85)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class SOSAlert(Base):
    __tablename__ = "sos_alerts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    triggered_at = Column(DateTime, default=datetime.utcnow, index=True)
    status = Column(String(30), default="active")  # active, acknowledged, resolved
    location_address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

class EmergencyQR(Base):
    __tablename__ = "emergency_qrs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    qr_code_hash = Column(String(64), unique=True, nullable=False)
    status = Column(String(20), default="active")  # active, disabled, revoked
    scan_count = Column(Integer, default=0)
    last_scanned_at = Column(DateTime, nullable=True)
    scan_history_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class CareTeamMember(Base):
    __tablename__ = "care_team_members"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    relationship_or_role = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(120), nullable=True)
    permissions = Column(String(50), default="full")  # full, view_only, emergency_only
    is_primary = Column(Boolean, default=False)
    care_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_role = Column(String(20), default="guardian")  # guardian, patient, both
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # medication_due, medication_missed, activity_missed, appointment, refill, sos, safe_zone, qr_scan, general
    is_read = Column(Boolean, default=False)
    related_entity_type = Column(String(50), nullable=True)
    related_entity_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class PersonalItem(Base):
    __tablename__ = "personal_items"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True, index=True)
    item_name = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    keywords = Column(String(255), nullable=True)

class LifeEvent(Base):
    __tablename__ = "life_events"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(150), nullable=False)
    date_or_period = Column(String(100), nullable=True)
    category = Column(String(50), default="memory")  # career, family, travel, childhood
    description = Column(Text, nullable=False)
    keywords = Column(String(255), nullable=True)

class InteractionLog(Base):
    __tablename__ = "interaction_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    client_time = Column(String(50), nullable=True)
    query_text = Column(Text, nullable=False)
    intent = Column(String(50), nullable=False)
    response_text = Column(Text, nullable=False)
    was_fallback = Column(Boolean, default=False)
    retrieved_records_count = Column(Integer, default=0)
    audio_played = Column(Boolean, default=False)

class CaregiverObservation(Base):
    __tablename__ = "caregiver_observations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_by = Column(String(100), nullable=False)
    recorded_by_id = Column(Integer, ForeignKey("patients.id", ondelete="SET NULL"), nullable=True)
    category = Column(String(50), nullable=False)  # sleep, appetite, mood, routine, doctor_note, general
    observation_text = Column(Text, nullable=False)
    severity = Column(String(20), default="normal")  # normal, noteworthy, concerning
    observed_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)



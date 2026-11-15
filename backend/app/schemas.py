from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Authentication Schemas ---
class PatientRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Patient's full name")
    email: str = Field(..., min_length=4, max_length=120, description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password (at least 6 characters)")
    confirm_password: Optional[str] = Field(None, description="Confirmation password")
    call_sign: Optional[str] = Field("Meera", description="Preferred call sign or honorific")
    caregiver_name: Optional[str] = Field("Ananya Sharma", description="Name of family caregiver")

class PatientLoginRequest(BaseModel):
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")

class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = Field(None, description="Optional refresh token string if not provided in cookie")

class DemoLoginRequest(BaseModel):
    role: Optional[str] = Field("patient", description="Demo role: 'patient' or 'family' / 'caregiver'")

# --- Family-Led Patient Onboarding Schemas ---
class OnboardingMedication(BaseModel):
    name: str = Field(..., description="Medication name")
    dosage: Optional[str] = Field("500mg", description="Dosage")
    schedule_time: str = Field(..., description="Schedule time e.g. '08:30 AM (After Breakfast)'")
    timing_slot: Optional[str] = Field("Morning", description="Morning / Afternoon / Evening / Night")
    frequency: Optional[str] = Field("Every day", description="Frequency")
    instructions: Optional[str] = None
    purpose: Optional[str] = None
    current_stock: Optional[int] = 30
    refill_threshold: Optional[int] = 5

class OnboardingAppointment(BaseModel):
    doctor_name: str
    clinic_or_hospital: str
    appointment_date: str
    appointment_time: str
    notes: Optional[str] = None
    advance_reminder_hours: Optional[int] = 24

class OnboardingRoutine(BaseModel):
    time: str = Field(..., description="24-hour time string e.g. '08:00'")
    title: str
    category: Optional[str] = "activity"
    description: Optional[str] = None
    repeat_frequency: Optional[str] = "Daily"

class OnboardingContact(BaseModel):
    name: str
    relationship: str
    phone: Optional[str] = None
    notes: Optional[str] = None

class OnboardingPlace(BaseModel):
    name: str
    address_or_location: str
    category: Optional[str] = "frequent"
    description: Optional[str] = None

class OnboardingMemoryFact(BaseModel):
    category: str = "habit"
    question_or_topic: str
    answer_or_detail: str

class OnboardingLifeEvent(BaseModel):
    title: str
    date_or_period: Optional[str] = None
    category: Optional[str] = "memory"
    description: str

class OnboardingPersonalItem(BaseModel):
    item_name: str
    location: str
    notes: Optional[str] = None
    keywords: Optional[str] = None

class FamilyPatientOnboardingRequest(BaseModel):
    # 1. Family Member (Caregiver) Account
    family_name: str = Field(..., min_length=2, max_length=100)
    family_email: str = Field(..., min_length=4, max_length=120)
    family_password: str = Field(..., min_length=6, max_length=128)
    family_relationship: Optional[str] = Field("Daughter", max_length=50)
    family_phone: Optional[str] = Field(None, max_length=50)

    # 2. Patient Account & Identity
    patient_name: str = Field(..., min_length=2, max_length=100)
    patient_email: str = Field(..., min_length=4, max_length=120)
    patient_password: str = Field(..., min_length=6, max_length=128)
    patient_call_sign: Optional[str] = Field(None, max_length=50)
    patient_age: Optional[int] = Field(None, ge=1, le=130)
    patient_dob: Optional[str] = Field(None, max_length=50)
    patient_address: Optional[str] = Field(None, max_length=255)
    preferred_language: Optional[str] = Field("English / Hindi", max_length=50)

    # 3. Medical & Doctor Information
    blood_group: Optional[str] = Field(None, max_length=20)
    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    care_instructions: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None
    doctor_clinic: Optional[str] = None

    # 4. Emergency & Safe Zone
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    safe_zone_name: Optional[str] = "Home Safe Zone"
    safe_zone_radius: Optional[int] = 500
    safe_zone_address: Optional[str] = None

    # 5. Domain collections
    medications: Optional[List[OnboardingMedication]] = []
    appointments: Optional[List[OnboardingAppointment]] = []
    routines: Optional[List[OnboardingRoutine]] = []
    contacts: Optional[List[OnboardingContact]] = []
    places: Optional[List[OnboardingPlace]] = []
    memory_facts: Optional[List[OnboardingMemoryFact]] = []
    life_events: Optional[List[OnboardingLifeEvent]] = []
    personal_items: Optional[List[OnboardingPersonalItem]] = []


class PatientProfile(BaseModel):
    id: int
    email: str
    name: str
    role: str = "patient"
    account_status: str = "active"
    call_sign: str
    caregiver_name: str
    associated_patient_id: Optional[int] = None
    associated_patient_name: Optional[str] = None
    age: Optional[int] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    care_instructions: Optional[str] = None
    preferred_language: Optional[str] = "English / Hindi"
    doctor_name: Optional[str] = "Dr. Arvind Mehra"
    doctor_phone: Optional[str] = "+91 98112 34567"
    doctor_clinic: Optional[str] = "Fortis Hospital, Vasant Kunj"
    communication_preferences: Optional[str] = "Voice-first, calm tone, clear short sentences"
    profile_photo_url: Optional[str] = None
    is_demo: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PatientProfileUpdate(BaseModel):
    name: Optional[str] = None
    call_sign: Optional[str] = None
    caregiver_name: Optional[str] = None
    age: Optional[int] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    care_instructions: Optional[str] = None
    preferred_language: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None
    doctor_clinic: Optional[str] = None
    communication_preferences: Optional[str] = None
    profile_photo_url: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token: Optional[str] = None  # Backward-compatible alias for access_token
    token_type: str = "Bearer"
    expires_in: int = 900
    patient: PatientProfile

    def __init__(self, **data):
        if "token" not in data and "access_token" in data:
            data["token"] = data["access_token"]
        elif "access_token" not in data and "token" in data:
            data["access_token"] = data["token"]
        super().__init__(**data)

# --- Assistant Chat Schemas ---
class QueryRequest(BaseModel):
    query: str = Field(..., description="The user's voice transcript or text question")
    client_time: Optional[str] = Field(None, description="ISO string or readable client time")
    user_id: Optional[str] = "default"

class QueryResponse(BaseModel):
    answer: str
    intent: str
    is_fallback: bool
    confidence: float
    grounded_context: Optional[str] = None
    sources: List[dict] = []
    spoken_text: str

# --- People Schemas ---
class PersonBase(BaseModel):
    name: str
    relationship: str
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    description: Optional[str] = None
    voice_message_url: Optional[str] = None
    visit_schedule: Optional[str] = None
    keywords: Optional[str] = None

class PersonCreate(PersonBase):
    pass

class PersonUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    description: Optional[str] = None
    voice_message_url: Optional[str] = None
    visit_schedule: Optional[str] = None
    keywords: Optional[str] = None

class PersonOut(PersonBase):
    id: int
    class Config:
        from_attributes = True

# --- Daily Routine / Activity Schemas ---
class RoutineBase(BaseModel):
    time: str
    title: str
    description: Optional[str] = None
    category: str = "activity"
    day_of_week: str = "daily"
    scheduled_date: Optional[str] = "today"
    repeat_frequency: Optional[str] = "Daily"
    status: Optional[str] = "scheduled"
    reminder_minutes_before: Optional[int] = 15
    is_active: bool = True

class RoutineCreate(RoutineBase):
    pass

class RoutineUpdate(BaseModel):
    time: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    day_of_week: Optional[str] = None
    scheduled_date: Optional[str] = None
    repeat_frequency: Optional[str] = None
    status: Optional[str] = None
    reminder_minutes_before: Optional[int] = None
    is_active: Optional[bool] = None

class RoutineStatusUpdate(BaseModel):
    status: str  # scheduled, pending, acknowledged, completed, snoozed, missed, cancelled
    notes: Optional[str] = None

class RoutineOut(RoutineBase):
    id: int
    acknowledged_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ActivityLogOut(BaseModel):
    id: int
    routine_id: Optional[int] = None
    title: str
    category: str
    scheduled_time: Optional[str] = None
    status: str
    timestamp: datetime
    notes: Optional[str] = None
    class Config:
        from_attributes = True

# --- Medication Schemas ---
class MedicationBase(BaseModel):
    name: str
    dosage: Optional[str] = None
    schedule_time: str
    purpose: Optional[str] = None
    instructions: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    frequency: Optional[str] = "Every day"
    timing_slot: Optional[str] = "Morning"
    current_stock: Optional[int] = 30
    refill_threshold: Optional[int] = 5
    refill_reminder_days: Optional[int] = 5
    needs_refill: Optional[bool] = False
    last_status: Optional[str] = "pending"
    last_taken_date: Optional[str] = None

class MedicationCreate(MedicationBase):
    pass

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    schedule_time: Optional[str] = None
    purpose: Optional[str] = None
    instructions: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    frequency: Optional[str] = None
    timing_slot: Optional[str] = None
    current_stock: Optional[int] = None
    refill_threshold: Optional[int] = None
    refill_reminder_days: Optional[int] = None
    needs_refill: Optional[bool] = None
    last_status: Optional[str] = None

class MedicationIntakeRequest(BaseModel):
    status: str  # "acknowledged" | "completed" | "snoozed" | "missed"
    notes: Optional[str] = None

class MedicationLogOut(BaseModel):
    id: int
    medication_id: int
    scheduled_time: str
    scheduled_date: str
    status: str
    acknowledged_at: Optional[datetime] = None
    taken_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class MedicationOut(MedicationBase):
    id: int
    last_acknowledged_at: Optional[datetime] = None
    last_taken_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Doctor Appointment Schemas ---
class DoctorAppointmentBase(BaseModel):
    doctor_name: str
    clinic_or_hospital: str
    appointment_date: str
    appointment_time: str
    notes: Optional[str] = None
    advance_reminder_hours: Optional[int] = 24
    follow_up_reminder_date: Optional[str] = None
    status: Optional[str] = "scheduled"

class DoctorAppointmentCreate(DoctorAppointmentBase):
    pass

class DoctorAppointmentUpdate(BaseModel):
    doctor_name: Optional[str] = None
    clinic_or_hospital: Optional[str] = None
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None
    notes: Optional[str] = None
    advance_reminder_hours: Optional[int] = None
    follow_up_reminder_date: Optional[str] = None
    status: Optional[str] = None

class DoctorAppointmentOut(DoctorAppointmentBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Familiar Places Schemas ---
class FamiliarPlaceBase(BaseModel):
    name: str
    address_or_location: str
    category: Optional[str] = "frequent"
    description: Optional[str] = None
    photo_url: Optional[str] = None
    is_safe_zone: Optional[bool] = False

class FamiliarPlaceCreate(FamiliarPlaceBase):
    pass

class FamiliarPlaceUpdate(BaseModel):
    name: Optional[str] = None
    address_or_location: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    is_safe_zone: Optional[bool] = None

class FamiliarPlaceOut(FamiliarPlaceBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Memory Facts / Forgotten Info Schemas ---
class MemoryFactBase(BaseModel):
    category: str  # habit, detail, faq, name, history
    question_or_topic: str
    answer_or_detail: str
    is_verified: Optional[bool] = True
    notes: Optional[str] = None

class MemoryFactCreate(MemoryFactBase):
    pass

class MemoryFactUpdate(BaseModel):
    category: Optional[str] = None
    question_or_topic: Optional[str] = None
    answer_or_detail: Optional[str] = None
    is_verified: Optional[bool] = None
    notes: Optional[str] = None

class MemoryFactOut(MemoryFactBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Safe Zone Schemas ---
class SafeZoneBase(BaseModel):
    name: str = "Home Safe Zone"
    center_latitude: float = 28.5355
    center_longitude: float = 77.2100
    radius_meters: int = 500
    address: str = "24, Green Park, New Delhi"
    is_active: bool = True
    monitoring_enabled: bool = True

class SafeZoneUpdate(BaseModel):
    name: Optional[str] = None
    center_latitude: Optional[float] = None
    center_longitude: Optional[float] = None
    radius_meters: Optional[int] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None
    monitoring_enabled: Optional[bool] = None

class SafeZoneOut(SafeZoneBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# --- Location Log Schemas ---
class LocationLogCreate(BaseModel):
    latitude: float
    longitude: float
    address: str
    accuracy_meters: Optional[float] = 12.0
    status_label: Optional[str] = "At Home"
    battery_level: Optional[int] = 85

class LocationLogOut(BaseModel):
    id: int
    latitude: float
    longitude: float
    address: str
    accuracy_meters: float
    is_inside_safe_zone: bool
    status_label: str
    battery_level: int
    timestamp: datetime
    class Config:
        from_attributes = True

# --- SOS Alert Schemas ---
class SOSAlertCreate(BaseModel):
    location_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None

class SOSAcknowledgeRequest(BaseModel):
    acknowledged_by: Optional[str] = "Guardian"
    notes: Optional[str] = None

class SOSAlertOut(BaseModel):
    id: int
    triggered_at: datetime
    status: str
    location_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    notes: Optional[str] = None
    class Config:
        from_attributes = True

# --- Emergency QR Schemas ---
class EmergencyQROut(BaseModel):
    id: int
    patient_id: int
    qr_code_hash: str
    status: str
    scan_count: int
    last_scanned_at: Optional[datetime] = None
    scan_history_notes: Optional[str] = None
    qr_url: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class EmergencyQRStatusUpdate(BaseModel):
    status: str  # "active" | "disabled" | "revoked"

# --- Care Team Member Schemas ---
class CareTeamMemberBase(BaseModel):
    name: str
    relationship_or_role: str
    phone: str
    email: Optional[str] = None
    permissions: Optional[str] = "full"  # full, view_only, emergency_only
    is_primary: Optional[bool] = False
    care_notes: Optional[str] = None

class CareTeamMemberCreate(CareTeamMemberBase):
    pass

class CareTeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    relationship_or_role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    permissions: Optional[str] = None
    is_primary: Optional[bool] = None
    care_notes: Optional[str] = None

class CareTeamMemberOut(CareTeamMemberBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationCreate(BaseModel):
    recipient_role: Optional[str] = "guardian"
    title: str
    message: str
    notification_type: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[int] = None

class NotificationOut(BaseModel):
    id: int
    patient_id: int
    recipient_role: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

# --- Personal Items Schemas ---
class PersonalItemBase(BaseModel):
    item_name: str
    location: str
    notes: Optional[str] = None
    keywords: Optional[str] = None

class PersonalItemCreate(PersonalItemBase):
    pass

class PersonalItemOut(PersonalItemBase):
    id: int
    class Config:
        from_attributes = True

# --- Life Events Schemas ---
class LifeEventBase(BaseModel):
    title: str
    date_or_period: Optional[str] = None
    category: str = "memory"
    description: str
    keywords: Optional[str] = None

class LifeEventCreate(LifeEventBase):
    pass

class LifeEventUpdate(BaseModel):
    title: Optional[str] = None
    date_or_period: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None

class LifeEventOut(LifeEventBase):
    id: int
    class Config:
        from_attributes = True

# --- Interaction Log Schemas ---
class InteractionLogOut(BaseModel):
    id: int
    timestamp: datetime
    client_time: Optional[str]
    query_text: str
    intent: str
    response_text: str
    was_fallback: bool
    retrieved_records_count: int
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_queries: int
    fallback_count: int
    fallback_rate_pct: float
    repeated_queries: List[dict]
    active_routines_count: int
    people_count: int
    medications_count: int

# --- Overview Aggregate Schema ---
class OverviewActivitySummary(BaseModel):
    total: int
    completed: int
    pending: int
    missed: int

class OverviewSummary(BaseModel):
    patient: PatientProfile
    safety_status: str  # "Safe & At Home", "Outside Safe Zone", "SOS Alert Active", "Location Unavailable"
    safety_severity: str  # "safe", "warning", "danger", "neutral"
    last_location: Optional[LocationLogOut] = None
    activity_summary: OverviewActivitySummary
    upcoming_medications: List[MedicationOut]
    upcoming_appointments: List[DoctorAppointmentOut]
    refill_reminders: List[MedicationOut]
    recent_sos_alerts: List[SOSAlertOut]
    unread_notifications_count: int
    recent_notifications: List[NotificationOut]
    device_status: dict

# =========================================================================
# SECTION 2: PATIENT INSIGHTS SCHEMAS
# =========================================================================

class CaregiverObservationCreate(BaseModel):
    category: str  # sleep, appetite, mood, routine, doctor_note, general
    observation_text: str
    severity: Optional[str] = "normal"  # normal, noteworthy, concerning
    observed_at: Optional[datetime] = None

class CaregiverObservationOut(BaseModel):
    id: int
    patient_id: int
    recorded_by: str
    recorded_by_id: Optional[int] = None
    category: str
    observation_text: str
    severity: str
    observed_at: datetime
    created_at: datetime
    class Config:
        from_attributes = True

class DailyActivityBreakdown(BaseModel):
    date: str
    day_name: str
    completed: int
    missed: int
    pending: int
    completion_rate: float

class CategoryBreakdown(BaseModel):
    category: str
    completed: int
    missed: int
    total: int
    rate: float

class FrequentlyMissedCategory(BaseModel):
    category: str
    missed_count: int

class ActivityTrendsOut(BaseModel):
    completion_rate: float
    consistency_score: float
    total_scheduled: int
    total_completed: int
    total_missed: int
    daily_breakdown: List[DailyActivityBreakdown]
    category_breakdown: List[CategoryBreakdown]
    frequently_missed: List[FrequentlyMissedCategory]

class MedicationPatternsOut(BaseModel):
    total_doses_scheduled: int
    total_doses_acknowledged: int
    total_doses_taken: int
    intake_adherence_rate: float
    acknowledgement_rate: float
    unacknowledged_alerts_count: int
    recent_intake_history: List[MedicationLogOut]

class RoutineDomainSummary(BaseModel):
    domain: str
    logged_count: int
    pattern_description: str
    consistency_label: str  # Consistent, Variable, Needs Attention

class RoutineInsightsOut(BaseModel):
    sleep_summary: RoutineDomainSummary
    meals_summary: RoutineDomainSummary
    hydration_summary: RoutineDomainSummary
    exercise_summary: RoutineDomainSummary

class PatientInsightsOut(BaseModel):
    timeframe: str  # daily, weekly, monthly
    activity_trends: ActivityTrendsOut
    medication_patterns: MedicationPatternsOut
    routine_insights: RoutineInsightsOut
    observations: List[CaregiverObservationOut]


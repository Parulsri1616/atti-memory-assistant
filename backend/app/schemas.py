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
    is_demo: bool
    created_at: datetime

    class Config:
        from_attributes = True

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
    visit_schedule: Optional[str] = None
    keywords: Optional[str] = None

class PersonCreate(PersonBase):
    pass

class PersonOut(PersonBase):
    id: int
    class Config:
        from_attributes = True

# --- Daily Routine Schemas ---
class RoutineBase(BaseModel):
    time: str
    title: str
    description: Optional[str] = None
    category: str = "activity"
    day_of_week: str = "daily"
    is_active: bool = True

class RoutineCreate(RoutineBase):
    pass

class RoutineOut(RoutineBase):
    id: int
    class Config:
        from_attributes = True

# --- Medication Schemas ---
class MedicationBase(BaseModel):
    name: str
    dosage: Optional[str] = None
    schedule_time: str
    purpose: Optional[str] = None
    instructions: Optional[str] = None
    last_taken_date: Optional[str] = None

class MedicationCreate(MedicationBase):
    pass

class MedicationOut(MedicationBase):
    id: int
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

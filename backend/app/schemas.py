from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

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

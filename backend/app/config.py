import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "ATTI — Dementia Memory Assistant"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # SQLite Database file location
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/atti.db")
    
    # LLM Settings (supports Gemini, OpenAI, or Built-in Offline Mode)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")
    
    # Patient Profile
    DEFAULT_PATIENT_NAME: str = os.getenv("PATIENT_NAME", "Shashi Sharma")
    DEFAULT_PATIENT_CALL_SIGN: str = os.getenv("PATIENT_CALL_SIGN", "Auntie")
    CAREGIVER_NAME: str = os.getenv("CAREGIVER_NAME", "Rahul")
    CAREGIVER_PIN: str = os.getenv("CAREGIVER_PIN", "1234")
    
    # Dementia Response Tone & Safety
    FALLBACK_MESSAGE: str = "I am not sure — would you like me to ask your caregiver?"
    MAX_SENTENCES_PER_RESPONSE: int = 2

settings = Settings()

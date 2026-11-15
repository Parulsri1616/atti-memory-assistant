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
    _database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/atti.db")
    DATABASE_URL: str = (
        _database_url.replace("postgres://", "postgresql://", 1)
        if _database_url.startswith("postgres://")
        else _database_url
    )

    # LLM Settings (supports Gemini, OpenAI, or Built-in Offline Mode)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")

    # Patient Profile
    DEFAULT_PATIENT_NAME: str = os.getenv("PATIENT_NAME", "Meera Sharma")
    DEFAULT_PATIENT_CALL_SIGN: str = os.getenv("PATIENT_CALL_SIGN", "Meera")
    CAREGIVER_NAME: str = os.getenv("CAREGIVER_NAME", "Ananya Sharma")
    CAREGIVER_PIN: str = os.getenv("CAREGIVER_PIN", "1234")
    PUBLIC_APP_URL: str = os.getenv("PUBLIC_APP_URL", "")

    # Dementia Response Tone & Safety
    FALLBACK_MESSAGE: str = "I am not sure — would you like me to ask your daughter Ananya Sharma?"
    MAX_SENTENCES_PER_RESPONSE: int = 2

    # JWT & Session Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "False").lower() in ("true", "1", "t")
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "lax")

settings = Settings()

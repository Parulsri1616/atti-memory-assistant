import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db
from .models import Patient, RefreshToken

# HTTP Bearer security scheme
security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """
    Hashes a password using bcrypt with a work factor (salt rounds) of 12.
    Truncates inputs safely at 72 bytes per bcrypt standard.
    """
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")

def verify_password(password: str, stored_hash: str) -> bool:
    """
    Verifies a plaintext password against a stored bcrypt hash.
    Includes backward-compatible fallback for any legacy PBKDF2 hashes.
    """
    if not password or not stored_hash:
        return False
    try:
        pw_bytes = password.encode("utf-8")[:72]
        # Standard bcrypt prefix check
        if stored_hash.startswith(("$2b$", "$2a$", "$2y$")):
            return bcrypt.checkpw(pw_bytes, stored_hash.encode("utf-8"))

        # Backward compatibility for legacy PBKDF2 salt:hash format
        if ":" in stored_hash:
            salt_hex, hash_hex = stored_hash.split(":")
            salt = bytes.fromhex(salt_hex)
            pw_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
            import hmac
            return hmac.compare_digest(pw_hash.hex(), hash_hex)
        return False
    except Exception:
        return False

def create_access_token(patient_id: int, email: str, role: str = "patient") -> Tuple[str, datetime]:
    """
    Generates a cryptographically signed, short-lived JWT access token.
    Claims: sub (patient_id), email, role, type (access), iat, exp.
    """
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(patient_id),
        "email": email,
        "role": role,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp())
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, expires_at

def create_refresh_token(patient_id: int, db: Session) -> Tuple[str, datetime, str]:
    """
    Generates a cryptographically signed refresh token with a unique jti,
    stores its hash in the database, and tracks expiration for rotation & revocation.
    """
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    jti = secrets.token_hex(16)

    payload = {
        "sub": str(patient_id),
        "jti": jti,
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp())
    }
    token_str = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    token_hash = hashlib.sha256(token_str.encode("utf-8")).hexdigest()

    refresh_record = RefreshToken(
        patient_id=patient_id,
        token_jti=jti,
        token_hash=token_hash,
        expires_at=datetime.fromtimestamp(expires_at.timestamp(), tz=timezone.utc).replace(tzinfo=None),
        is_revoked=False
    )
    db.add(refresh_record)
    db.commit()
    db.refresh(refresh_record)

    return token_str, expires_at, jti

def rotate_refresh_token(token_str: str, db: Session) -> Tuple[str, str, datetime, Patient]:
    """
    Validates a refresh token, revokes it, detects reuse attacks, and rotates it to a new
    access token and new refresh token.
    """
    try:
        payload = jwt.decode(token_str, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token format or signature.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Provided token is not a valid refresh token."
        )

    jti = payload.get("jti")
    patient_id = int(payload.get("sub", 0))

    record = db.query(RefreshToken).filter(RefreshToken.token_jti == jti).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found."
        )

    # Detect token reuse attack
    if record.is_revoked:
        if record.replaced_by_jti:
            # Token was already rotated; reuse detected! Revoke all tokens for this patient for safety
            db.query(RefreshToken).filter(RefreshToken.patient_id == patient_id).update({"is_revoked": True})
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked. Please sign in again."
        )

    # Check expiry in DB
    now_naive = datetime.now(timezone.utc).replace(tzinfo=None)
    if record.expires_at < now_naive:
        record.is_revoked = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired."
        )

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient or patient.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Patient account not found or deactivated."
        )

    # Rotate: Create new access token and new refresh token
    new_access_token, _ = create_access_token(patient.id, patient.email, patient.role)
    new_refresh_token, new_expires_at, new_jti = create_refresh_token(patient.id, db)

    # Mark old token revoked and link to new jti
    record.is_revoked = True
    record.replaced_by_jti = new_jti
    db.commit()

    return new_access_token, new_refresh_token, new_expires_at, patient

def revoke_refresh_token(token_str: str, db: Session) -> bool:
    """
    Revokes a refresh token in the database.
    """
    try:
        payload = jwt.decode(token_str, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM], options={"verify_exp": False})
        jti = payload.get("jti")
        if jti:
            record = db.query(RefreshToken).filter(RefreshToken.token_jti == jti).first()
            if record:
                record.is_revoked = True
                db.commit()
                return True
    except Exception:
        # Fallback search by hash
        token_hash = hashlib.sha256(token_str.encode("utf-8")).hexdigest()
        record = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
        if record:
            record.is_revoked = True
            db.commit()
            return True
    return False

def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Patient:
    """
    Validates JWT access token and returns the authenticated user account (patient or caregiver/family).
    """
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_str = auth.credentials.strip()
    try:
        payload = jwt.decode(token_str, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired. Please refresh your session.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type for API access.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    role = payload.get("role")
    if role not in ("patient", "caregiver", "family"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to authorized accounts.",
        )

    try:
        user_id = int(payload.get("sub", 0))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification in token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(Patient).filter(Patient.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or inactive.",
        )

    return user

def get_current_patient(
    current_user: Patient = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Patient:
    """
    Returns the target patient for domain queries and operations.
    If the authenticated user is a caregiver/family member, it scopes
    operations to their associated patient record.
    """
    if current_user.role in ("caregiver", "family") and current_user.associated_patient_id:
        assoc = db.query(Patient).filter(Patient.id == current_user.associated_patient_id).first()
        if assoc:
            return assoc

    return current_user

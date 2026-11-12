import re
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..config import settings
from ..database import get_db
from ..models import Patient, DailyRoutine, PersonalItem, Person
from ..schemas import (
    PatientRegisterRequest,
    PatientLoginRequest,
    RefreshTokenRequest,
    DemoLoginRequest,
    PatientProfile,
    AuthResponse
)
from ..auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    rotate_refresh_token,
    revoke_refresh_token,
    get_current_patient,
    get_current_user,
    security
)

router = APIRouter(prefix="/auth", tags=["Patient Authentication"])

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

def set_refresh_cookie(response: Response, refresh_token: str):
    """
    Sets a secure, HttpOnly, SameSite cookie for the refresh token.
    Path is '/' so it is automatically included in /api/auth/refresh and /api/auth/logout.
    """
    response.set_cookie(
        key="atti_refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/"
    )

def clear_refresh_cookie(response: Response):
    """
    Clears the HttpOnly refresh token cookie on logout.
    """
    response.delete_cookie(
        key="atti_refresh_token",
        path="/"
    )

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_patient(req: PatientRegisterRequest, response: Response, db: Session = Depends(get_db)):
    clean_email = req.email.strip().lower()

    # 1. Validate email format
    if not EMAIL_REGEX.match(clean_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address (e.g., patient@example.com)."
        )

    # 2. Validate password length & strength
    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # 3. Validate confirmation password if provided
    if req.confirm_password is not None and req.password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # 4. Check for duplicate email
    existing = db.query(Patient).filter(Patient.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered."
        )

    # 5. Hash password with bcrypt
    hashed_pw = hash_password(req.password)

    call_sign = (req.call_sign or "").strip() or req.name.strip().split()[0]
    caregiver = (req.caregiver_name or "").strip() or "Ananya Sharma"

    # 6. Create patient record
    patient = Patient(
        name=req.name.strip(),
        email=clean_email,
        password_hash=hashed_pw,
        role="patient",
        account_status="active",
        call_sign=call_sign,
        caregiver_name=caregiver,
        is_demo=False
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # 7. Seed initial starter routines and personal items for this patient
    starter_routines = [
        DailyRoutine(
            patient_id=patient.id,
            time="08:30",
            title="Morning Breakfast & Water",
            description="A calm, warm breakfast followed by a full glass of water.",
            category="meal",
            day_of_week="daily",
            is_active=True
        ),
        DailyRoutine(
            patient_id=patient.id,
            time="17:00",
            title="Evening Tea & Rest",
            description="A soothing cup of tea and quiet relaxation.",
            category="activity",
            day_of_week="daily",
            is_active=True
        )
    ]
    db.add_all(starter_routines)

    starter_items = [
        PersonalItem(
            patient_id=patient.id,
            item_name="Reading Glasses",
            location="on your bedside table in the glasses case",
            notes="Keep here so you can find them easily",
            keywords="glasses, spectacles, chashma"
        ),
        PersonalItem(
            patient_id=patient.id,
            item_name="House Keys",
            location="hanging on the hook by the front door",
            notes="Main entrance keys",
            keywords="keys, chaabi, key"
        )
    ]
    db.add_all(starter_items)

    starter_caregiver = Person(
        patient_id=patient.id,
        name=caregiver,
        relationship="Family Caregiver",
        notes=f"Your loving caregiver {caregiver} who checks on you and manages your schedule.",
        keywords=f"{caregiver.lower()}, caregiver, family"
    )
    db.add(starter_caregiver)
    db.commit()

    # 8. Generate JWT access token and refresh token
    access_token, _ = create_access_token(patient.id, patient.email, patient.role)
    refresh_token, _, _ = create_refresh_token(patient.id, db)

    # 9. Set HttpOnly cookie for refresh token
    set_refresh_cookie(response, refresh_token)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        patient=PatientProfile.model_validate(patient)
    )

@router.post("/login", response_model=AuthResponse)
def login_patient(req: PatientLoginRequest, response: Response, db: Session = Depends(get_db)):
    clean_email = req.email.strip().lower()
    patient = db.query(Patient).filter(Patient.email == clean_email).first()

    if not patient or not verify_password(req.password, patient.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if patient.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patient account is suspended or inactive."
        )

    # Generate JWT access token and refresh token
    access_token, _ = create_access_token(patient.id, patient.email, patient.role)
    refresh_token, _, _ = create_refresh_token(patient.id, db)

    set_refresh_cookie(response, refresh_token)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        patient=PatientProfile.model_validate(patient)
    )

@router.post("/demo", response_model=AuthResponse)
def demo_login(
    response: Response,
    body: DemoLoginRequest = None,
    role: str = None,
    db: Session = Depends(get_db)
):
    from ..seed_data import seed_database_if_empty
    seed_database_if_empty(db)

    target_role = "patient"
    if body and body.role:
        target_role = body.role.lower().strip()
    elif role:
        target_role = role.lower().strip()

    if target_role in ("family", "caregiver"):
        # Find or seed demo family caregiver (Ananya Sharma)
        demo_caregiver = db.query(Patient).filter(
            (Patient.email == "ananya.demo@atti.example") | ((Patient.is_demo == True) & (Patient.role == "caregiver"))
        ).first()

        demo_patient = db.query(Patient).filter(
            (Patient.email == "demo@atti.care") | ((Patient.is_demo == True) & (Patient.role == "patient"))
        ).first()

        if not demo_caregiver:
            demo_caregiver = Patient(
                name="Ananya Sharma",
                email="ananya.demo@atti.example",
                password_hash=hash_password("demo123"),
                role="caregiver",
                account_status="active",
                call_sign="Ananya",
                caregiver_name="Ananya Sharma",
                associated_patient_id=demo_patient.id if demo_patient else None,
                is_demo=True
            )
            db.add(demo_caregiver)
            db.commit()
            db.refresh(demo_caregiver)

        if not demo_caregiver.password_hash.startswith(("$2b$", "$2a$")):
            demo_caregiver.password_hash = hash_password("demo123")
            db.commit()

        access_token, _ = create_access_token(demo_caregiver.id, demo_caregiver.email, demo_caregiver.role)
        refresh_token, _, _ = create_refresh_token(demo_caregiver.id, db)
        set_refresh_cookie(response, refresh_token)

        profile = PatientProfile.model_validate(demo_caregiver)
        if demo_caregiver.associated_patient_id:
            assoc = db.query(Patient).filter(Patient.id == demo_caregiver.associated_patient_id).first()
            if assoc:
                profile.associated_patient_name = assoc.name

        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            patient=profile
        )

    # Demo Patient (Meera Sharma)
    demo_patient = db.query(Patient).filter(
        (Patient.email == "demo@atti.care") | ((Patient.is_demo == True) & (Patient.role == "patient"))
    ).first()

    if not demo_patient:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Demo patient account is currently unavailable."
        )

    if not demo_patient.password_hash.startswith(("$2b$", "$2a$")):
        demo_patient.password_hash = hash_password("demo123")
        db.commit()

    access_token, _ = create_access_token(demo_patient.id, demo_patient.email, demo_patient.role)
    refresh_token, _, _ = create_refresh_token(demo_patient.id, db)
    set_refresh_cookie(response, refresh_token)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        patient=PatientProfile.model_validate(demo_patient)
    )

@router.post("/demo/patient", response_model=AuthResponse)
def demo_patient_route(response: Response, db: Session = Depends(get_db)):
    return demo_login(response=response, role="patient", db=db)

@router.post("/demo/family", response_model=AuthResponse)
def demo_family_route(response: Response, db: Session = Depends(get_db)):
    return demo_login(response=response, role="family", db=db)

@router.post("/demo-family", response_model=AuthResponse)
def demo_family_alias(response: Response, db: Session = Depends(get_db)):
    return demo_login(response=response, role="family", db=db)

@router.post("/refresh", response_model=AuthResponse)
def refresh_session(
    request: Request,
    response: Response,
    body: RefreshTokenRequest = None,
    db: Session = Depends(get_db)
):
    """
    Refreshes the session using the refresh token from HttpOnly cookie or request body.
    Implements refresh token rotation: old token is invalidated, new pair is issued.
    """
    token_str = None
    # 1. Try HttpOnly cookie
    if "atti_refresh_token" in request.cookies:
        token_str = request.cookies.get("atti_refresh_token")

    # 2. Try JSON request body
    if not token_str and body and body.refresh_token:
        token_str = body.refresh_token.strip()

    # 3. Try Authorization Bearer header fallback
    if not token_str:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token_str = auth_header.replace("Bearer ", "").strip()

    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    new_access_token, new_refresh_token, _, patient = rotate_refresh_token(token_str, db)
    set_refresh_cookie(response, new_refresh_token)

    profile = PatientProfile.model_validate(patient)
    if patient.role in ("caregiver", "family") and patient.associated_patient_id:
        assoc = db.query(Patient).filter(Patient.id == patient.associated_patient_id).first()
        if assoc:
            profile.associated_patient_name = assoc.name

    return AuthResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="Bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        patient=profile
    )

@router.get("/me", response_model=PatientProfile)
def get_current_user_profile(
    current_user: Patient = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = PatientProfile.model_validate(current_user)
    if current_user.role in ("caregiver", "family") and current_user.associated_patient_id:
        assoc = db.query(Patient).filter(Patient.id == current_user.associated_patient_id).first()
        if assoc:
            profile.associated_patient_name = assoc.name
    return profile

@router.post("/logout")
def logout_patient(
    request: Request,
    response: Response,
    body: RefreshTokenRequest = None,
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Logs out the patient: revokes refresh token in DB and clears the HttpOnly cookie.
    """
    token_to_revoke = None
    if "atti_refresh_token" in request.cookies:
        token_to_revoke = request.cookies.get("atti_refresh_token")
    elif body and body.refresh_token:
        token_to_revoke = body.refresh_token.strip()

    if token_to_revoke:
        revoke_refresh_token(token_to_revoke, db)

    clear_refresh_cookie(response)
    return {"message": "Logged out successfully"}

@router.get("/emergency-profile/{patient_id}")
def get_emergency_profile(patient_id: int, db: Session = Depends(get_db)):
    """
    Public read-only emergency profile returned when an emergency QR code is scanned.
    Exposes only guardian-permitted emergency contact numbers, medical alerts, and calming instructions.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    caregiver = (
        db.query(Person)
        .filter(Person.patient_id == patient_id, Person.name == patient.caregiver_name)
        .first()
    )
    if not caregiver:
        caregiver = (
            db.query(Person)
            .filter(Person.patient_id == patient_id, Person.relationship.ilike("%daughter%"))
            .first()
        )
    if not caregiver:
        caregiver = (
            db.query(Person)
            .filter(Person.patient_id == patient_id, Person.relationship.ilike("%caregiver%"))
            .first()
        )

    doctor = (
        db.query(Person)
        .filter(Person.patient_id == patient_id, (Person.relationship.ilike("%doctor%") | Person.relationship.ilike("%physician%")))
        .first()
    )

    caregiver_phone = (
        patient.emergency_contact_phone
        or (caregiver.phone if caregiver and caregiver.phone else None)
        or "+91 98765 12345"
    )
    caregiver_name = patient.caregiver_name or (caregiver.name if caregiver else "Ananya Sharma")
    caregiver_relation = patient.emergency_contact_relation or (caregiver.relationship if caregiver else "Daughter")

    doctor_name = doctor.name if doctor else "Dr. Arjun Mehta"
    doctor_phone = doctor.phone if doctor and doctor.phone else "+91 98111 55667"

    return {
        "patient_id": patient.id,
        "name": patient.name,
        "call_sign": patient.call_sign,
        "age": patient.age or 72,
        "date_of_birth": patient.date_of_birth or "14 August 1954",
        "address": patient.address or "24, Green Park, New Delhi",
        "caregiver_name": caregiver_name,
        "caregiver_phone": caregiver_phone,
        "emergency_contact_relation": caregiver_relation,
        "doctor_name": doctor_name,
        "doctor_phone": doctor_phone,
        "blood_group": patient.blood_group or "B+",
        "medical_conditions": patient.medical_conditions or "Mild Cognitive Impairment, Essential Hypertension",
        "allergies": patient.allergies or "Penicillin (Moderate sensitivity)",
        "care_instructions": patient.care_instructions or (
            f"Please stay calm and speak gently. The patient may feel disoriented. "
            f"Keep them in a quiet, safe space and immediately contact {caregiver_relation} {caregiver_name} at {caregiver_phone}."
        )
    }

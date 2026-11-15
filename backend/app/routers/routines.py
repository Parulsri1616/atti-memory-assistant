from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import DailyRoutine, Medication, Patient, ActivityLog, MedicationLog, Notification, DoctorAppointment
from ..schemas import RoutineCreate, RoutineOut, MedicationCreate, MedicationOut, DoctorAppointmentOut
from ..rag.date_resolver import resolve_datetime
from ..auth import get_current_patient

router = APIRouter(prefix="/routines", tags=["Routines & Medications"])

# --- Patient Appointments ---
@router.get("/appointments", response_model=List[DoctorAppointmentOut])
def get_patient_appointments(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    return (
        db.query(DoctorAppointment)
        .filter(DoctorAppointment.patient_id == current_patient.id)
        .order_by(DoctorAppointment.appointment_date.asc(), DoctorAppointment.appointment_time.asc())
        .all()
    )

# --- Daily Routines ---
@router.get("", response_model=List[RoutineOut])
def get_routines(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    return (
        db.query(DailyRoutine)
        .filter(DailyRoutine.patient_id == current_patient.id)
        .order_by(DailyRoutine.time.asc())
        .all()
    )

@router.post("", response_model=RoutineOut)
def create_routine(
    payload: RoutineCreate,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    routine_dict = payload.model_dump()
    routine_dict["patient_id"] = current_patient.id
    routine = DailyRoutine(**routine_dict)
    db.add(routine)
    db.commit()
    db.refresh(routine)
    return routine

@router.delete("/{routine_id}")
def delete_routine(
    routine_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    r = (
        db.query(DailyRoutine)
        .filter(DailyRoutine.id == routine_id, DailyRoutine.patient_id == current_patient.id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Routine not found")
    db.delete(r)
    db.commit()
    return {"message": "Routine deleted"}

@router.get("/current-banner")
def get_current_banner(
    client_time: Optional[str] = Query(None),
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    time_info = resolve_datetime(client_time)
    current_time_str = time_info["time_str"]

    routines = (
        db.query(DailyRoutine)
        .filter(DailyRoutine.patient_id == current_patient.id, DailyRoutine.is_active == True)
        .order_by(DailyRoutine.time.asc())
        .all()
    )
    if not routines:
        return {"current_activity": None, "next_activity": None, "time_info": time_info}

    # Find the routine immediately past or upcoming
    upcoming = None
    last_passed = None
    for r in routines:
        if r.time >= current_time_str and not upcoming:
            upcoming = r
        elif r.time < current_time_str:
            last_passed = r

    active_item = upcoming if upcoming else (last_passed or routines[0])

    return {
        "time_info": time_info,
        "active_routine": {
            "id": active_item.id,
            "title": active_item.title,
            "time": active_item.time,
            "description": active_item.description,
            "category": active_item.category
        } if active_item else None,
        "upcoming_count": len([r for r in routines if r.time >= current_time_str])
    }

# --- Medications ---
@router.get("/medications", response_model=List[MedicationOut])
def get_medications(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    return (
        db.query(Medication)
        .filter(Medication.patient_id == current_patient.id)
        .all()
    )

@router.post("/medications", response_model=MedicationOut)
def create_medication(
    payload: MedicationCreate,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    med_dict = payload.model_dump()
    med_dict["patient_id"] = current_patient.id
    med = Medication(**med_dict)
    db.add(med)
    db.commit()
    db.refresh(med)
    return med

@router.delete("/medications/{med_id}")
def delete_medication(
    med_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    med = (
        db.query(Medication)
        .filter(Medication.id == med_id, Medication.patient_id == current_patient.id)
        .first()
    )
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    db.delete(med)
    db.commit()
    return {"message": "Medication deleted"}

@router.post("/{routine_id}/toggle-status")
def toggle_routine_status(
    routine_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    r = (
        db.query(DailyRoutine)
        .filter(DailyRoutine.id == routine_id, DailyRoutine.patient_id == current_patient.id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Routine not found")
    new_status = "scheduled" if r.status == "completed" else "completed"
    r.status = new_status
    if new_status == "completed":
        r.completed_at = datetime.utcnow()
    
    # Log to ActivityLog
    act_log = ActivityLog(
        routine_id=r.id,
        patient_id=current_patient.id,
        scheduled_time=r.time,
        status=new_status,
        completed_at=datetime.utcnow() if new_status == "completed" else None,
        created_at=datetime.utcnow()
    )
    db.add(act_log)

    # Notify caregiver on completion
    if new_status == "completed":
        notif = Notification(
            patient_id=current_patient.id,
            recipient_role="guardian",
            title="Activity completed",
            message=f"{current_patient.name} completed '{r.title}', scheduled for {r.time}.",
            notification_type="activity",
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(notif)

    db.commit()
    db.refresh(r)
    return {"id": r.id, "status": r.status}

@router.post("/medications/{med_id}/log-taken")
def log_medication_taken(
    med_id: int,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    med = (
        db.query(Medication)
        .filter(Medication.id == med_id, Medication.patient_id == current_patient.id)
        .first()
    )
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    now_dt = datetime.utcnow()
    med.last_taken_date = datetime.now().strftime("%Y-%m-%d %H:%M")
    med.last_taken_at = now_dt
    med.last_status = "completed"
    
    # Decrement stock count
    if med.current_stock is not None and med.current_stock > 0:
        med.current_stock -= 1
        if med.refill_threshold is not None and med.current_stock <= med.refill_threshold:
            med.needs_refill = True

    # Record MedicationLog
    med_log = MedicationLog(
        medication_id=med.id,
        patient_id=current_patient.id,
        scheduled_time=med.schedule_time or "",
        scheduled_date=datetime.utcnow().strftime("%Y-%m-%d"),
        status="completed",
        taken_at=now_dt,
        created_at=now_dt
    )
    db.add(med_log)

    # Notify caregiver
    notif = Notification(
        patient_id=current_patient.id,
        recipient_role="guardian",
        title="Medication intake confirmed",
        message=f"{current_patient.name} took {med.name} ({med.dosage or 'scheduled dose'}).",
        notification_type="medication",
        is_read=False,
        created_at=now_dt
    )
    db.add(notif)

    db.commit()
    db.refresh(med)
    return {
        "message": f"Logged {med.name} as taken",
        "last_taken": med.last_taken_date,
        "current_stock": med.current_stock,
        "last_status": med.last_status
    }


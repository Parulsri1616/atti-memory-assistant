from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import DailyRoutine, Medication
from ..schemas import RoutineCreate, RoutineOut, MedicationCreate, MedicationOut
from ..rag.date_resolver import resolve_datetime

router = APIRouter(prefix="/routines", tags=["Routines & Medications"])

# --- Daily Routines ---
@router.get("", response_model=List[RoutineOut])
def get_routines(db: Session = Depends(get_db)):
    return db.query(DailyRoutine).order_by(DailyRoutine.time.asc()).all()

@router.post("", response_model=RoutineOut)
def create_routine(payload: RoutineCreate, db: Session = Depends(get_db)):
    routine = DailyRoutine(**payload.model_dump())
    db.add(routine)
    db.commit()
    db.refresh(routine)
    return routine

@router.delete("/{routine_id}")
def delete_routine(routine_id: int, db: Session = Depends(get_db)):
    r = db.query(DailyRoutine).filter(DailyRoutine.id == routine_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Routine not found")
    db.delete(r)
    db.commit()
    return {"message": "Routine deleted"}

@router.get("/current-banner")
def get_current_banner(client_time: Optional[str] = Query(None), db: Session = Depends(get_db)):
    time_info = resolve_datetime(client_time)
    current_time_str = time_info["time_str"]

    routines = db.query(DailyRoutine).filter(DailyRoutine.is_active == True).order_by(DailyRoutine.time.asc()).all()
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
def get_medications(db: Session = Depends(get_db)):
    return db.query(Medication).all()

@router.post("/medications", response_model=MedicationOut)
def create_medication(payload: MedicationCreate, db: Session = Depends(get_db)):
    med = Medication(**payload.model_dump())
    db.add(med)
    db.commit()
    db.refresh(med)
    return med

@router.delete("/medications/{med_id}")
def delete_medication(med_id: int, db: Session = Depends(get_db)):
    med = db.query(Medication).filter(Medication.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    db.delete(med)
    db.commit()
    return {"message": "Medication deleted"}

@router.post("/medications/{med_id}/log-taken")
def log_medication_taken(med_id: int, db: Session = Depends(get_db)):
    med = db.query(Medication).filter(Medication.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    med.last_taken_date = datetime.now().strftime("%Y-%m-%d %H:%M")
    db.commit()
    return {"message": f"Logged {med.name} as taken", "last_taken": med.last_taken_date}

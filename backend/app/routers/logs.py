from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from ..database import get_db
from ..models import InteractionLog, Person, DailyRoutine, Medication, Patient
from ..schemas import InteractionLogOut
from ..auth import get_current_patient

router = APIRouter(prefix="/logs", tags=["Caregiver Logs & Analytics"])

@router.get("", response_model=List[InteractionLogOut])
def get_logs(
    limit: int = 50,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    return (
        db.query(InteractionLog)
        .filter(InteractionLog.patient_id == current_patient.id)
        .order_by(InteractionLog.timestamp.desc())
        .limit(limit)
        .all()
    )

@router.get("/analytics")
def get_analytics(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    pid = current_patient.id
    total = db.query(InteractionLog).filter(InteractionLog.patient_id == pid).count()
    fallbacks = (
        db.query(InteractionLog)
        .filter(InteractionLog.patient_id == pid, InteractionLog.was_fallback == True)
        .count()
    )
    fallback_rate = round((fallbacks / total * 100), 1) if total > 0 else 0.0

    # Repeated queries calculation for patient
    repeated = (
        db.query(InteractionLog.query_text, func.count(InteractionLog.id).label("count"))
        .filter(InteractionLog.patient_id == pid)
        .group_by(InteractionLog.query_text)
        .order_by(func.count(InteractionLog.id).desc())
        .limit(6)
        .all()
    )
    repeated_list = [{"query": r[0], "count": r[1]} for r in repeated if r[1] > 1]

    # Unresolved / fallback queries
    unresolved = (
        db.query(InteractionLog)
        .filter(InteractionLog.patient_id == pid, InteractionLog.was_fallback == True)
        .order_by(InteractionLog.timestamp.desc())
        .limit(5)
        .all()
    )
    unresolved_list = [
        {"id": u.id, "query": u.query_text, "timestamp": u.timestamp.isoformat()}
        for u in unresolved
    ]

    return {
        "total_queries": total,
        "fallback_count": fallbacks,
        "fallback_rate_pct": fallback_rate,
        "grounded_accuracy_pct": round(100.0 - fallback_rate, 1) if total > 0 else 100.0,
        "repeated_queries": repeated_list,
        "unresolved_queries": unresolved_list,
        "counts": {
            "people": db.query(Person).filter(Person.patient_id == pid).count(),
            "routines": db.query(DailyRoutine).filter(DailyRoutine.patient_id == pid).count(),
            "medications": db.query(Medication).filter(Medication.patient_id == pid).count()
        }
    }

@router.delete("/clear")
def clear_logs(
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    db.query(InteractionLog).filter(InteractionLog.patient_id == current_patient.id).delete()
    db.commit()
    return {"message": "All interaction logs cleared"}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from ..database import get_db
from ..models import InteractionLog, Person, DailyRoutine, Medication
from ..schemas import InteractionLogOut

router = APIRouter(prefix="/logs", tags=["Caregiver Logs & Analytics"])

@router.get("", response_model=List[InteractionLogOut])
def get_logs(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(InteractionLog).order_by(InteractionLog.timestamp.desc()).limit(limit).all()

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total = db.query(InteractionLog).count()
    fallbacks = db.query(InteractionLog).filter(InteractionLog.was_fallback == True).count()
    fallback_rate = round((fallbacks / total * 100), 1) if total > 0 else 0.0

    # Repeated queries calculation (detecting short-term memory repetition)
    repeated = (
        db.query(InteractionLog.query_text, func.count(InteractionLog.id).label("count"))
        .group_by(InteractionLog.query_text)
        .order_by(func.count(InteractionLog.id).desc())
        .limit(6)
        .all()
    )
    repeated_list = [{"query": r[0], "count": r[1]} for r in repeated if r[1] > 1]

    # Unresolved / fallback queries that caregiver needs to supply info for
    unresolved = (
        db.query(InteractionLog)
        .filter(InteractionLog.was_fallback == True)
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
            "people": db.query(Person).count(),
            "routines": db.query(DailyRoutine).count(),
            "medications": db.query(Medication).count()
        }
    }

@router.delete("/clear")
def clear_logs(db: Session = Depends(get_db)):
    db.query(InteractionLog).delete()
    db.commit()
    return {"message": "All interaction logs cleared"}

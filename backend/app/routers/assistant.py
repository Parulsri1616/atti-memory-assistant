from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import InteractionLog, Patient
from ..schemas import QueryRequest, QueryResponse
from ..rag.retriever import retrieve_context
from ..rag.generator import generate_llm_response
from ..config import settings
from ..auth import get_current_patient

router = APIRouter(prefix="/assistant", tags=["Assistant"])

@router.post("/query", response_model=QueryResponse)
def query_assistant(
    req: QueryRequest,
    current_patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # 1. Retrieve grounded records & intent for current patient
    intent, sources, time_info = retrieve_context(
        query=req.query,
        db=db,
        client_time_str=req.client_time,
        patient_id=current_patient.id
    )

    # 2. Generate response (grounded with dementia communication principles and patient personalization)
    answer, is_fallback, confidence = generate_llm_response(
        query=req.query,
        intent=intent,
        sources=sources,
        time_info=time_info,
        patient_call_sign=current_patient.call_sign,
        caregiver_name=current_patient.caregiver_name
    )

    # 3. Log interaction to DB for caregiver review
    log_entry = InteractionLog(
        patient_id=current_patient.id,
        timestamp=datetime.utcnow(),
        client_time=time_info.get("date_str", "") + " " + time_info.get("time_spoken", ""),
        query_text=req.query.strip(),
        intent=intent,
        response_text=answer,
        was_fallback=is_fallback,
        retrieved_records_count=len(sources),
        audio_played=False
    )
    db.add(log_entry)
    db.commit()

    return QueryResponse(
        answer=answer,
        spoken_text=answer,
        intent=intent,
        is_fallback=is_fallback,
        confidence=confidence,
        grounded_context=sources[0].get("content") if sources else None,
        sources=sources
    )

import socket

def get_lan_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

@router.get("/prompt-suggestions")
def get_prompt_suggestions():
    return {
        "suggestions": [
            "What do I do today?",
            "Who is Ananya?",
            "Where are my glasses?",
            "Did I take my medicine?",
            "Who is visiting this week?",
            "What day is it today?",
            "Where are my house keys?",
            "Tell me about my teaching days"
        ]
    }

@router.get("/status")
def get_system_status():
    lan_ip = get_lan_ip()
    network_app_url = settings.PUBLIC_APP_URL or f"http://{lan_ip}:5173"
    return {
        "status": "online",
        "patient_name": settings.DEFAULT_PATIENT_NAME,
        "caregiver_name": settings.CAREGIVER_NAME,
        "llm_engine": "Gemini 1.5 Flash (Cloud)" if settings.GEMINI_API_KEY else "Local Grounded Dementia RAG Engine (Zero Hallucination)",
        "offline_ready": True,
        "lan_ip": lan_ip,
        "network_app_url": network_app_url
    }

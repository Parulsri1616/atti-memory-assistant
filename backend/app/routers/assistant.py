from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import InteractionLog
from ..schemas import QueryRequest, QueryResponse
from ..rag.retriever import retrieve_context
from ..rag.generator import generate_llm_response
from ..config import settings

router = APIRouter(prefix="/assistant", tags=["Assistant"])

@router.post("/query", response_model=QueryResponse)
def query_assistant(req: QueryRequest, db: Session = Depends(get_db)):
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # 1. Retrieve grounded records & intent
    intent, sources, time_info = retrieve_context(
        query=req.query,
        db=db,
        client_time_str=req.client_time
    )

    # 2. Generate response (grounded with dementia communication principles)
    answer, is_fallback, confidence = generate_llm_response(
        query=req.query,
        intent=intent,
        sources=sources,
        time_info=time_info
    )

    # 3. Log interaction to DB for caregiver review
    log_entry = InteractionLog(
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

@router.get("/prompt-suggestions")
def get_prompt_suggestions():
    return {
        "suggestions": [
            "What do I do today?",
            "Who is Rahul?",
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
    return {
        "status": "online",
        "patient_name": settings.DEFAULT_PATIENT_NAME,
        "caregiver_name": settings.CAREGIVER_NAME,
        "llm_engine": "Gemini 1.5 Flash (Cloud)" if settings.GEMINI_API_KEY else "Local Grounded Dementia RAG Engine (Zero Hallucination)",
        "offline_ready": True
    }

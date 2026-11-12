import re
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from ..models import Person, DailyRoutine, Medication, PersonalItem, LifeEvent
from .date_resolver import resolve_datetime, detect_time_intent

def classify_intent(query: str) -> str:
    """
    Classifies the natural language query into a specific domain intent.
    Designed to be tolerant of brief, conversational, or repetitive speech.
    """
    q = query.lower().strip()

    # 1. Direct Time/Date
    if any(k in q for k in ["what time", "what day", "what date", "which day", "today's date", "current time", "kitne baje"]):
        return "time_date"

    # 2. Medication / Pills
    if any(k in q for k in ["medicine", "medicines", "medication", "pill", "pills", "tablet", "tablets", "dawae", "dawa", "blood pressure", "dose", "took my"]):
        return "medication_lookup"

    # 3. Personal Items (lost objects)
    if any(k in q for k in ["where are my", "where did i put", "where is my", "where's my", "glasses", "spectacles", "chashma", "keys", "chaabi", "walking stick", "cane", "wallet", "purse", "phone"]):
        return "item_lookup"

    # 4. People & Relationships
    if any(k in q for k in ["who is", "who's", "who are", "visiting", "comes to see", "daughter", "son", "beta", "doctor", "neighbour", "neighbor", "grandchild", "granddaughter", "grandson", "husband", "wife"]):
        return "person_lookup"

    # 5. Routines / Schedule / Next activity
    if any(k in q for k in ["what do i do", "what am i supposed to do", "what should i do", "what is next", "what's next", "afternoon", "evening", "morning", "schedule", "routine", "lunch", "dinner", "breakfast", "walk", "plan"]):
        return "routine_lookup"

    # 6. Life Events / Reminiscence
    if any(k in q for k in ["where did i work", "my job", "my career", "college", "university", "wedding", "married", "marriage", "younger", "past", "remember when", "shimla", "kashmir", "delhi university"]):
        return "event_recall"

    # 7. Conversational / Identity
    if any(k in q for k in ["who are you", "what is your name", "what are you", "hello", "hi atti", "good morning", "help"]):
        return "conversational"

    # Default fallback intent: semantic memory lookup
    return "general_lookup"

def retrieve_context(query: str, db: Session, client_time_str: str = None, patient_id: Optional[int] = None) -> Tuple[str, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Retrieves grounded personal records matching the query and intent, scoped to the patient.
    Returns: (intent, retrieved_sources, time_info)
    """
    intent = classify_intent(query)
    time_info = resolve_datetime(client_time_str)
    sources: List[Dict[str, Any]] = []
    q = query.lower()

    if intent == "time_date":
        direct_ans = detect_time_intent(query, time_info)
        if direct_ans:
            sources.append({
                "type": "time_date",
                "title": "Current Clock",
                "content": direct_ans
            })
        return intent, sources, time_info

    if intent == "medication_lookup":
        meds_q = db.query(Medication)
        if patient_id is not None:
            meds_q = meds_q.filter(Medication.patient_id == patient_id)
        meds = meds_q.all()
        # Rank by match
        for med in meds:
            score = 0
            name_low = med.name.lower()
            purpose_low = (med.purpose or "").lower()
            if name_low in q:
                score += 5
            if any(term in q for term in ["bp", "blood pressure"]) and ("pressure" in purpose_low or "amlodipine" in name_low):
                score += 4
            if any(term in q for term in ["sugar", "diabetes"]) and ("sugar" in purpose_low or "metformin" in name_low):
                score += 4
            if score > 0 or ("medicine" in q or "pill" in q or "tablet" in q or "dawa" in q):
                sources.append({
                    "type": "medication",
                    "title": med.name,
                    "content": f"{med.name} ({med.dosage or ''}): {med.instructions or ''}. Scheduled for {med.schedule_time}.",
                    "score": score + 1
                })
        sources.sort(key=lambda s: s.get("score", 0), reverse=True)

    elif intent == "item_lookup":
        items_q = db.query(PersonalItem)
        if patient_id is not None:
            items_q = items_q.filter(PersonalItem.patient_id == patient_id)
        items = items_q.all()
        for item in items:
            score = 0
            name_low = item.item_name.lower()
            keys_low = (item.keywords or "").lower()
            if name_low in q or any(w in q for w in name_low.split()):
                score += 5
            if any(k in q for k in keys_low.split(",") if k.strip()):
                score += 4
            if score > 0:
                sources.append({
                    "type": "personal_item",
                    "title": item.item_name,
                    "content": f"Your {item.item_name} is kept {item.location}.",
                    "score": score
                })
        sources.sort(key=lambda s: s.get("score", 0), reverse=True)

    elif intent == "person_lookup":
        people_q = db.query(Person)
        if patient_id is not None:
            people_q = people_q.filter(Person.patient_id == patient_id)
        people = people_q.all()
        for p in people:
            score = 0
            name_low = p.name.lower()
            rel_low = p.relationship.lower()
            keys_low = (p.keywords or "").lower()
            if name_low in q:
                score += 5
            if rel_low in q or any(w in q for w in rel_low.split()):
                score += 4
            if any(k.strip() in q for k in keys_low.split(",") if k.strip()):
                score += 3
            if score > 0:
                sources.append({
                    "type": "person",
                    "title": f"{p.name} ({p.relationship})",
                    "content": f"{p.name} is your {p.relationship}. {p.notes or ''} {f'Visit: {p.visit_schedule}.' if p.visit_schedule else ''}".strip(),
                    "phone": p.phone,
                    "photo_url": p.photo_url,
                    "score": score
                })
        sources.sort(key=lambda s: s.get("score", 0), reverse=True)

    elif intent == "routine_lookup":
        routines_q = db.query(DailyRoutine).filter(DailyRoutine.is_active == True)
        if patient_id is not None:
            routines_q = routines_q.filter(DailyRoutine.patient_id == patient_id)
        routines = routines_q.all()
        current_time_str = time_info["time_str"]
        period = time_info["period"]

        # Check if asking specifically about a period
        period_filter = None
        if "afternoon" in q:
            period_filter = ("12:00", "17:00")
        elif "evening" in q:
            period_filter = ("17:00", "21:00")
        elif "morning" in q:
            period_filter = ("05:00", "12:00")
        elif "night" in q:
            period_filter = ("20:00", "23:59")

        for r in routines:
            score = 1
            if period_filter:
                if period_filter[0] <= r.time <= period_filter[1]:
                    score += 5
            else:
                # Find current or upcoming routine
                if r.time >= current_time_str:
                    score += 3
            if any(w in q for w in r.title.lower().split()):
                score += 4

            sources.append({
                "type": "routine",
                "title": r.title,
                "time": r.time,
                "content": f"At {r.time}: {r.title}. {r.description or ''}".strip(),
                "score": score
            })
        sources.sort(key=lambda s: (s.get("score", 0), -abs(int(s.get("time", "12:00").replace(":", "")) - int(current_time_str.replace(":", "")))), reverse=True)

    elif intent == "event_recall":
        events_q = db.query(LifeEvent)
        if patient_id is not None:
            events_q = events_q.filter(LifeEvent.patient_id == patient_id)
        events = events_q.all()
        for ev in events:
            score = 0
            title_low = ev.title.lower()
            desc_low = ev.description.lower()
            keys_low = (ev.keywords or "").lower()
            if any(w in q for w in title_low.split() if len(w) > 3):
                score += 3
            if any(w in q for w in desc_low.split() if len(w) > 4):
                score += 2
            if any(k.strip() in q for k in keys_low.split(",") if k.strip()):
                score += 4
            if score > 0 or len(events) <= 3:
                sources.append({
                    "type": "life_event",
                    "title": ev.title,
                    "content": f"{ev.title} ({ev.date_or_period or ''}): {ev.description}",
                    "score": score
                })
        sources.sort(key=lambda s: s.get("score", 0), reverse=True)

    # If general lookup or empty sources so far, try fallback cross-entity scan
    if not sources and intent not in ["time_date", "conversational"]:
        # Broad scan across people, routines, items, events
        p_q = db.query(Person)
        it_q = db.query(PersonalItem)
        m_q = db.query(Medication)
        if patient_id is not None:
            p_q = p_q.filter(Person.patient_id == patient_id)
            it_q = it_q.filter(PersonalItem.patient_id == patient_id)
            m_q = m_q.filter(Medication.patient_id == patient_id)

        for p in p_q.all():
            if p.name.lower() in q or p.relationship.lower() in q:
                sources.append({"type": "person", "title": p.name, "content": f"{p.name} is your {p.relationship}. {p.notes or ''}"})
        for it in it_q.all():
            if it.item_name.lower() in q:
                sources.append({"type": "personal_item", "title": it.item_name, "content": f"Your {it.item_name} is kept {it.location}."})
        for m in m_q.all():
            if m.name.lower() in q:
                sources.append({"type": "medication", "title": m.name, "content": f"{m.name}: {m.instructions or ''} at {m.schedule_time}."})

    return intent, sources[:3], time_info

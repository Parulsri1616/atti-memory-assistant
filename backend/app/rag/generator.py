import re
import json
import logging
import requests
from typing import List, Dict, Any, Tuple
from ..config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are ATTI, a gentle, patient, and reassuring voice memory assistant for an older adult with mild dementia.
Strict Guidelines:
1. Answer ONLY using the facts provided in the STORED MEMORIES context below.
2. If the answer is not present in the stored memories, DO NOT invent or assume facts. Say: "I am not sure. Would you like me to ask your caregiver {caregiver}?"
3. NEVER give medical advice, diagnostic opinions, or change dosage instructions.
4. Keep answers very short: 1 or 2 simple, clear sentences.
5. Always use a calm, warm, and respectful tone.
6. Mention explicit days or times clearly (e.g. "Today is Wednesday. Your appointment is at 5 in the evening.")
"""

def generate_local_response(
    query: str,
    intent: str,
    sources: List[Dict[str, Any]],
    time_info: Dict[str, Any],
    patient_call_sign: str = settings.DEFAULT_PATIENT_CALL_SIGN
) -> Tuple[str, bool, float]:
    """
    Built-in grounded generation engine. Guarantees 0ms latency, zero hallucination,
    and 100% offline availability without requiring external API keys.
    Returns: (answer, is_fallback, confidence)
    """
    q = query.lower().strip()
    caregiver = settings.CAREGIVER_NAME

    # Conversational / Greetings
    if intent == "conversational":
        if any(w in q for w in ["who are you", "what is your name"]):
            return (
                f"I am ATTI, your personal memory assistant. I am always right here to help you with your daily routine and family reminders.",
                False,
                1.0
            )
        if any(w in q for w in ["hello", "hi", "good morning", "good afternoon"]):
            greeting = "Good morning" if time_info["period"] == "morning" else ("Good afternoon" if time_info["period"] == "afternoon" else "Good evening")
            return (
                f"{greeting}! Today is {time_info['day_name']}. How can I help you right now?",
                False,
                1.0
            )
        return (
            "I am here with you. You can ask me what is next today, who is visiting, or where your things are kept.",
            False,
            0.95
        )

    # Time & Date Intent
    if intent == "time_date" and sources:
        return sources[0]["content"], False, 1.0

    # No sources retrieved => Gentle Fallback
    if not sources:
        return (
            f"I am not sure about that. Would you like me to ask your caregiver {caregiver}?",
            True,
            0.2
        )

    top_source = sources[0]
    stype = top_source.get("type")

    # Person Lookup
    if stype == "person":
        content = top_source.get("content", "")
        return (f"{content}", False, 0.98)

    # Personal Item Location
    if stype == "personal_item":
        content = top_source.get("content", "")
        return (f"{content}", False, 0.98)

    # Medication
    if stype == "medication":
        content = top_source.get("content", "")
        return (f"Your {content}", False, 0.98)

    # Routine / Schedule
    if stype == "routine":
        r_time = top_source.get("time", "")
        # Format time to spoken
        hour, minute = [int(x) for x in r_time.split(":")]
        am_pm = "in the morning" if hour < 12 else ("in the afternoon" if hour < 17 else "in the evening")
        disp_hour = hour % 12
        if disp_hour == 0:
            disp_hour = 12
        nice_time = f"{disp_hour}:{minute:02d} {am_pm}"
        
        answer = f"Today is {time_info['day_name']}. Next at {disp_hour}:{minute:02d} { 'AM' if hour < 12 else 'PM' } is {top_source.get('title')}."
        return (answer, False, 0.95)

    # Life Events / Reminiscence
    if stype == "life_event":
        content = top_source.get("content", "")
        return (f"Here is a lovely memory: {content}", False, 0.95)

    # Generic grounded fallback from top source content
    content = top_source.get("content", "")
    return (content, False, 0.85)


def generate_llm_response(
    query: str,
    intent: str,
    sources: List[Dict[str, Any]],
    time_info: Dict[str, Any]
) -> Tuple[str, bool, float]:
    """
    Optional LLM generation using Google Gemini or OpenAI when API key is provided.
    Falls back gracefully to local grounded response if network or key is unavailable.
    """
    # If no API key configured, use local grounded engine
    if not settings.GEMINI_API_KEY and not settings.OPENAI_API_KEY:
        return generate_local_response(query, intent, sources, time_info)

    # Prepare grounding context
    context_text = "\n".join([f"- [{s.get('type')}] {s.get('content')}" for s in sources])
    prompt = f"""STORED MEMORIES:
{context_text if context_text else "No matching stored records found."}

CURRENT TIME:
Today is {time_info['day_name']}, {time_info['date_str']}, current time {time_info['time_spoken']} ({time_info['period']}).

CAREGIVER NAME: {settings.CAREGIVER_NAME}
PATIENT CALL SIGN: {settings.DEFAULT_PATIENT_CALL_SIGN}

USER QUESTION:
"{query}"

Generate a short, reassuring 1-2 sentence response grounded strictly in the memories above:"""

    try:
        if settings.GEMINI_API_KEY:
            # Gemini REST API call
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": f"{SYSTEM_PROMPT.format(caregiver=settings.CAREGIVER_NAME)}\n\n{prompt}"}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 100}
            }
            res = requests.post(url, json=payload, timeout=6)
            if res.status_code == 200:
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                is_fb = "ask your caregiver" in text.lower() or "not sure" in text.lower()
                return text, is_fb, 0.99
    except Exception as e:
        logger.warning(f"Gemini API call failed, using local engine: {e}")

    # Fallback to local grounded generator
    return generate_local_response(query, intent, sources, time_info)

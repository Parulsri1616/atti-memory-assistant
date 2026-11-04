from datetime import datetime, timedelta
import re
from typing import Dict, Any, Optional

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def resolve_datetime(client_time_str: Optional[str] = None) -> Dict[str, Any]:
    """
    Parses client timestamp or uses current machine time.
    Returns structured representations for natural spoken responses and filtering.
    """
    now = None
    if client_time_str:
        try:
            # Handle ISO formats
            cleaned = client_time_str.replace("Z", "+00:00")
            now = datetime.fromisoformat(cleaned)
        except Exception:
            pass

    if not now:
        now = datetime.now()

    day_name = now.strftime("%A")
    date_str = now.strftime("%B %d, %Y")
    hour = now.hour
    minute = now.minute

    # Determine period of day
    if 5 <= hour < 12:
        period = "morning"
    elif 12 <= hour < 17:
        period = "afternoon"
    elif 17 <= hour < 21:
        period = "evening"
    else:
        period = "night"

    # Human-friendly 12-hour format
    am_pm = "AM" if hour < 12 else "PM"
    display_hour = hour % 12
    if display_hour == 0:
        display_hour = 12
    time_spoken = f"{display_hour}:{minute:02d} {am_pm}"

    return {
        "datetime": now,
        "day_name": day_name,
        "date_str": date_str,
        "time_str": now.strftime("%H:%M"),
        "time_spoken": time_spoken,
        "period": period,
        "natural_intro": f"Today is {day_name}, {date_str}. The time is {time_spoken}."
    }

def detect_time_intent(query: str, current_info: Dict[str, Any]) -> Optional[str]:
    """
    Checks if user is asking for the current day, date, or time.
    """
    q = query.lower()
    
    # Direct time or date questions
    if any(k in q for k in ["what time is it", "what's the time", "tell me the time", "kitne baje", "samay kya"]):
        return f"It is currently {current_info['time_spoken']} in the {current_info['period']}."
    
    if any(k in q for k in ["what day is it", "what day is today", "aaj kaun sa din", "what is today's date", "what is the date", "which year"]):
        return f"Today is {current_info['day_name']}, {current_info['date_str']}."

    return None

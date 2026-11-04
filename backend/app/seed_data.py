from sqlalchemy.orm import Session
from .models import Person, DailyRoutine, Medication, PersonalItem, LifeEvent

def seed_database_if_empty(db: Session):
    # Check if records exist
    if db.query(Person).first():
        return

    # Seed People
    people = [
        Person(
            name="Rahul",
            relationship="Son",
            phone="+91 98765 43210",
            notes="Your loving son. He works as a software engineer in Cyber City, Gurgaon. He calls every evening.",
            visit_schedule="Visits every Sunday at 4:00 PM for tea",
            keywords="son, beta, rahul, engineer, gurgaon"
        ),
        Person(
            name="Pooja",
            relationship="Daughter-in-law",
            phone="+91 98765 43211",
            notes="Rahul's wife. She is very caring and calls you every morning around 10:00 AM.",
            visit_schedule="Comes with Rahul on Sundays",
            keywords="bahu, daughter-in-law, pooja, rahul's wife"
        ),
        Person(
            name="Dr. Kapoor",
            relationship="Family Physician",
            phone="+91 98111 22334",
            notes="Your senior physician at Fortis Clinic. He monitors your blood pressure and health checkups.",
            visit_schedule="Next routine checkup is Thursday at 5:00 PM",
            keywords="doctor, physician, clinic, hospital, kapoor"
        ),
        Person(
            name="Sunita Ji",
            relationship="Next-door Neighbour",
            phone="+91 98222 33445",
            notes="Lives in Flat 302 right across your hall. She is your walking companion in the park.",
            visit_schedule="Meets you at 7:00 AM every morning for the park walk",
            keywords="neighbour, neighbor, sunita, flat 302, park"
        )
    ]
    db.add_all(people)

    # Seed Daily Routines
    routines = [
        DailyRoutine(
            time="07:00",
            title="Morning Park Walk",
            description="A gentle 20-minute walk with your neighbour Sunita Ji in the colony park.",
            category="activity",
            day_of_week="daily",
            is_active=True
        ),
        DailyRoutine(
            time="08:30",
            title="Breakfast & Blood Pressure Tablet",
            description="Warm breakfast followed by your morning Blood Pressure tablet (Amlodipine 5mg) with a glass of water.",
            category="medication",
            day_of_week="daily",
            is_active=True
        ),
        DailyRoutine(
            time="13:00",
            title="Lunch & Afternoon Rest",
            description="Fresh homemade lunch, followed by your quiet afternoon nap in the bedroom.",
            category="meal",
            day_of_week="daily",
            is_active=True
        ),
        DailyRoutine(
            time="17:00",
            title="Evening Tea & Memory Games",
            description="A warm cup of ginger tea and relaxing music or word puzzles.",
            category="activity",
            day_of_week="daily",
            is_active=True
        ),
        DailyRoutine(
            time="20:00",
            title="Dinner & Evening Medicine",
            description="Light dinner with vegetable soup and khichdi, followed by your evening tablet.",
            category="meal",
            day_of_week="daily",
            is_active=True
        )
    ]
    db.add_all(routines)

    # Seed Medications
    meds = [
        Medication(
            name="Amlodipine",
            dosage="5mg",
            schedule_time="08:30 AM (After Breakfast)",
            purpose="For maintaining healthy blood pressure",
            instructions="Take one tablet after your morning breakfast with water."
        ),
        Medication(
            name="Metformin",
            dosage="500mg",
            schedule_time="08:30 PM (After Dinner)",
            purpose="For blood sugar management",
            instructions="Take one tablet right after dinner."
        ),
        Medication(
            name="Calcium & Vitamin D3",
            dosage="500mg",
            schedule_time="09:00 PM (Before Bed)",
            purpose="For strong bones and joint mobility",
            instructions="Take one tablet with warm milk or water before sleep."
        )
    ]
    db.add_all(meds)

    # Seed Personal Items
    items = [
        PersonalItem(
            item_name="Reading Glasses",
            location="on your wooden bedside table inside the blue velvet case",
            notes="Spare pair is in the top drawer of the desk",
            keywords="glasses, spectacles, chashma, reading glasses, eyesight"
        ),
        PersonalItem(
            item_name="House Keys",
            location="hanging on the brass hook next to the main entrance door",
            notes="Attached to a golden peacock keychain",
            keywords="keys, house keys, key, chaabi, keychain"
        ),
        PersonalItem(
            item_name="Walking Stick",
            location="standing next to the shoe rack beside the main entrance",
            notes="Wooden cane with rubber tip",
            keywords="walking stick, stick, cane, lathi"
        ),
        PersonalItem(
            item_name="Mobile Phone",
            location="on the charger dock on the living room side table",
            notes="Keep it charged so Rahul can call",
            keywords="phone, mobile, cell, telephone"
        )
    ]
    db.add_all(items)

    # Seed Life Events / Reminiscence
    events = [
        LifeEvent(
            title="Chemistry Professor at Delhi University",
            date_or_period="1980 – 2012",
            category="career",
            description="You were a respected and beloved Chemistry professor at Miranda House, Delhi University for 32 years, guiding hundreds of students.",
            keywords="career, job, work, teaching, professor, delhi university, miranda house"
        ),
        LifeEvent(
            title="Marriage in Shimla",
            date_or_period="October 1978",
            category="family",
            description="You married Anand Sharma in a peaceful traditional wedding in Shimla, surrounded by apple orchards and loving family.",
            keywords="marriage, wedding, shimla, husband, anand"
        ),
        LifeEvent(
            title="Rahul's Birth",
            date_or_period="1982",
            category="family",
            description="Your son Rahul was born at Safdarjung Hospital, bringing immense joy and laughter into the household.",
            keywords="rahul, birth, son born, childhood"
        ),
        LifeEvent(
            title="Kashmir Houseboat Trip",
            date_or_period="Summer 1990",
            category="travel",
            description="A memorable family holiday spending seven days on a cedar houseboat on Dal Lake in Srinagar, Kashmir.",
            keywords="kashmir, travel, srinagar, vacation, holiday, dal lake"
        )
    ]
    db.add_all(events)

    db.commit()

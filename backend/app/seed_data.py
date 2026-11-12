from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import Patient, Person, DailyRoutine, Medication, PersonalItem, LifeEvent, InteractionLog
from .auth import hash_password

def seed_database_if_empty(db: Session):
    """
    Seeds and maintains comprehensive, repeatable demonstration data for:
    1. Demo Patient: Meera Sharma (Age 72, 24, Green Park, New Delhi)
    2. Demo Family Member: Ananya Sharma (Daughter, ananya.demo@atti.example)
    Zero occurrences of informal/banned words ("Auntie", "Uncle").
    All records use proper names and relationships.
    """
    # 1. Ensure Demo Patient (Meera Sharma) exists with full personal profile
    demo_patient = db.query(Patient).filter(
        (Patient.is_demo == True) & (Patient.role == "patient")
    ).first()
    if not demo_patient:
        demo_patient = db.query(Patient).filter(Patient.email == "demo@atti.care").first()

    if not demo_patient:
        demo_patient = Patient(
            name="Meera Sharma",
            email="demo@atti.care",
            password_hash=hash_password("demo123"),
            role="patient",
            account_status="active",
            call_sign="Meera",
            caregiver_name="Ananya Sharma",
            is_demo=True,
            age=72,
            date_of_birth="14 August 1954",
            address="24, Green Park, New Delhi",
            emergency_contact_phone="+91 98765 12345",
            emergency_contact_relation="Daughter",
            blood_group="B+",
            allergies="Penicillin (Moderate sensitivity)",
            medical_conditions="Mild Cognitive Impairment, Essential Hypertension",
            care_instructions="Please speak gently and calmly. If disoriented, do not challenge memories. Guide to a peaceful area and immediately call daughter Ananya Sharma at +91 98765 12345."
        )
        db.add(demo_patient)
        db.commit()
        db.refresh(demo_patient)
    else:
        # Update existing demo patient to Meera Sharma with complete profile
        demo_patient.name = "Meera Sharma"
        demo_patient.call_sign = "Meera"
        demo_patient.caregiver_name = "Ananya Sharma"
        demo_patient.role = "patient"
        demo_patient.account_status = "active"
        demo_patient.is_demo = True
        demo_patient.age = 72
        demo_patient.date_of_birth = "14 August 1954"
        demo_patient.address = "24, Green Park, New Delhi"
        demo_patient.emergency_contact_phone = "+91 98765 12345"
        demo_patient.emergency_contact_relation = "Daughter"
        demo_patient.blood_group = "B+"
        demo_patient.allergies = "Penicillin (Moderate sensitivity)"
        demo_patient.medical_conditions = "Mild Cognitive Impairment, Essential Hypertension"
        demo_patient.care_instructions = "Please speak gently and calmly. If disoriented, do not challenge memories. Guide to a peaceful area and immediately call daughter Ananya Sharma at +91 98765 12345."
        if not demo_patient.password_hash.startswith(("$2b$", "$2a$")):
            demo_patient.password_hash = hash_password("demo123")
        db.commit()

    # 2. Ensure Demo Family Member / Caregiver (Ananya Sharma) exists and is linked
    demo_caregiver = db.query(Patient).filter(
        (Patient.is_demo == True) & (Patient.role == "caregiver")
    ).first()
    if not demo_caregiver:
        demo_caregiver = db.query(Patient).filter(Patient.email == "ananya.demo@atti.example").first()

    if not demo_caregiver:
        demo_caregiver = Patient(
            name="Ananya Sharma",
            email="ananya.demo@atti.example",
            password_hash=hash_password("demo123"),
            role="caregiver",
            account_status="active",
            call_sign="Ananya",
            caregiver_name="Ananya Sharma",
            associated_patient_id=demo_patient.id,
            is_demo=True
        )
        db.add(demo_caregiver)
        db.commit()
        db.refresh(demo_caregiver)
    else:
        demo_caregiver.name = "Ananya Sharma"
        demo_caregiver.role = "caregiver"
        demo_caregiver.account_status = "active"
        demo_caregiver.call_sign = "Ananya"
        demo_caregiver.caregiver_name = "Ananya Sharma"
        demo_caregiver.associated_patient_id = demo_patient.id
        demo_caregiver.is_demo = True
        if not demo_caregiver.password_hash.startswith(("$2b$", "$2a$")):
            demo_caregiver.password_hash = hash_password("demo123")
        db.commit()

    # Clean up any legacy dummy records mentioning "Auntie", "Uncle", "Rahul", or "Amlodipine"
    db.query(Person).filter(Person.patient_id == demo_patient.id, Person.name == "Rahul").delete()
    db.query(Person).filter(Person.patient_id == demo_patient.id, Person.name == "Pooja").delete()
    db.query(Person).filter(Person.patient_id == demo_patient.id, Person.name == "Dr. Kapoor").delete()
    db.query(Person).filter(Person.patient_id == demo_patient.id, Person.name == "Sunita Ji").delete()
    db.query(Person).filter(Person.patient_id == demo_patient.id, Person.name.ilike("%auntie%")).delete()
    db.query(Person).filter(Person.patient_id == demo_patient.id, Person.name.ilike("%uncle%")).delete()
    db.query(DailyRoutine).filter(DailyRoutine.patient_id == demo_patient.id, DailyRoutine.title.ilike("%Amlodipine%")).delete()
    db.query(Medication).filter(Medication.patient_id == demo_patient.id, Medication.name == "Amlodipine").delete()
    db.query(LifeEvent).filter(LifeEvent.patient_id == demo_patient.id, LifeEvent.title.ilike("%Rahul%")).delete()
    db.query(LifeEvent).filter(LifeEvent.patient_id == demo_patient.id, LifeEvent.description.ilike("%Rahul%")).delete()
    db.query(LifeEvent).filter(LifeEvent.patient_id == demo_patient.id, LifeEvent.title.ilike("%Chemistry Professor%")).delete()
    db.query(LifeEvent).filter(LifeEvent.patient_id == demo_patient.id, LifeEvent.title.ilike("Marriage in Shimla%")).delete()
    db.query(LifeEvent).filter(LifeEvent.patient_id == demo_patient.id, LifeEvent.title.ilike("Kashmir Houseboat%")).delete()
    db.query(InteractionLog).filter(InteractionLog.patient_id == demo_patient.id, InteractionLog.query_text.ilike("%Rahul%")).delete()
    db.query(InteractionLog).filter(InteractionLog.patient_id == demo_patient.id, InteractionLog.response_text.ilike("%Rahul%")).delete()
    db.commit()

    # 3. Seed People for Demo Patient (Meera Sharma)
    existing_people_names = [p.name for p in db.query(Person).filter(Person.patient_id == demo_patient.id).all()]
    people_to_add = []

    if "Ananya Sharma" not in existing_people_names:
        people_to_add.append(
            Person(
                patient_id=demo_patient.id,
                name="Ananya Sharma",
                relationship="Daughter",
                phone="+91 98765 12345",
                notes="Your loving elder daughter and primary caregiver. She lives in Vasant Kunj and manages your health schedule.",
                visit_schedule="Visits every Tuesday and Thursday evening, and spends Sundays with you.",
                keywords="daughter, ananya, beti, caregiver, daughter ananya"
            )
        )
    if "Rajesh Sharma" not in existing_people_names:
        people_to_add.append(
            Person(
                patient_id=demo_patient.id,
                name="Rajesh Sharma",
                relationship="Son",
                phone="+91 98765 23456",
                notes="Your younger son. He works as an architect in Bengaluru and calls you every evening at 7:30 PM.",
                visit_schedule="Visits Delhi once a month for a weekend stay.",
                keywords="son, rajesh, beta, architect, bengaluru"
            )
        )
    if "Dr. Arjun Mehta" not in existing_people_names:
        people_to_add.append(
            Person(
                patient_id=demo_patient.id,
                name="Dr. Arjun Mehta",
                relationship="Doctor",
                phone="+91 98111 55667",
                notes="Your senior consulting physician at Green Park Medical Centre. He monitors your blood pressure and routine wellness.",
                visit_schedule="Next routine consultation is first Friday of next month at 11:00 AM.",
                keywords="doctor, physician, clinic, hospital, arjun, mehta"
            )
        )
    if "Kavita Verma" not in existing_people_names:
        people_to_add.append(
            Person(
                patient_id=demo_patient.id,
                name="Kavita Verma",
                relationship="Friend",
                phone="+91 98222 44556",
                notes="Your lifelong college friend and fellow botany enthusiast. You enjoy reminiscing and sharing garden cuttings.",
                visit_schedule="Calls every Wednesday afternoon at 4:00 PM.",
                keywords="friend, kavita, verma, college friend, botany"
            )
        )
    if "Sunita Kapoor" not in existing_people_names:
        people_to_add.append(
            Person(
                patient_id=demo_patient.id,
                name="Sunita Kapoor",
                relationship="Neighbour",
                phone="+91 98333 77889",
                notes="Lives in Flat 22 right next door. She is your walking companion in the Deer Park.",
                visit_schedule="Meets you at 7:00 AM every morning for the park walk.",
                keywords="neighbour, neighbor, sunita, kapoor, flat 22, park"
            )
        )
    if "Late Anand Sharma" not in existing_people_names:
        people_to_add.append(
            Person(
                patient_id=demo_patient.id,
                name="Late Anand Sharma",
                relationship="Spouse",
                phone="In Loving Memory",
                notes="Your beloved late husband, an accomplished civil engineer. You were happily married for 42 wonderful years.",
                visit_schedule="Memorial portrait in the living room.",
                keywords="husband, spouse, anand, anand sharma, late husband"
            )
        )
    if people_to_add:
        db.add_all(people_to_add)
        db.commit()

    # 4. Seed Daily Routines for Demo Patient
    existing_routines = [r.title for r in db.query(DailyRoutine).filter(DailyRoutine.patient_id == demo_patient.id).all()]
    routines_to_add = []

    demo_routines_spec = [
        ("06:30", "Morning Wake-up & Warm Water", "Gentle wake-up, open the balcony curtains for morning sunlight, and drink a glass of warm water.", "activity"),
        ("07:00", "Deer Park Morning Walk", "A peaceful 25-minute morning stroll with your neighbour Sunita Kapoor in the Green Park Deer Park.", "activity"),
        ("08:30", "Breakfast & Blood Pressure Tablet", "Warm vegetable oats or idli, followed by your morning blood pressure medication (Telmisartan 40mg) with water.", "medication"),
        ("10:30", "Balcony Plant Care & Gardening", "Watering your potted tulsi, ferns, and flowering jasmine on the sunlit front balcony.", "activity"),
        ("13:00", "Nutritious Lunch & Afternoon Rest", "Fresh homemade dal, seasonal vegetables, and roti, followed by a restful 45-minute afternoon nap in your bedroom.", "meal"),
        ("17:00", "Evening Ginger Tea & Relaxing Music", "A soothing warm cup of ginger tea with whole wheat biscuits, listening to instrumental sitar ragas.", "activity"),
        ("20:00", "Light Dinner & Evening Tablets", "Light dinner of khichdi or vegetable soup, followed by your evening multivitamin tablet.", "meal"),
        ("21:30", "Night Bedtime Routine & Rest", "Brushing teeth, dimming bedroom lights, and settling in for a calm, restful night.", "activity")
    ]
    for r_time, r_title, r_desc, r_cat in demo_routines_spec:
        if r_title not in existing_routines:
            routines_to_add.append(
                DailyRoutine(
                    patient_id=demo_patient.id,
                    time=r_time,
                    title=r_title,
                    description=r_desc,
                    category=r_cat,
                    day_of_week="daily",
                    is_active=True
                )
            )
    if routines_to_add:
        db.add_all(routines_to_add)
        db.commit()

    # 5. Seed Medications for Demo Patient
    meds_to_add = []
    demo_meds_spec = [
        ("Telmisartan", "40mg", "08:30 AM (After Breakfast)", "For healthy blood pressure maintenance (Fictional Demo Data)", "Take one tablet after your morning breakfast with a full glass of water. [Demonstration Data Only]", datetime.utcnow().strftime("%Y-%m-%d")),
        ("Metformin", "500mg", "01:30 PM (After Lunch)", "For blood sugar support (Fictional Demo Data)", "Take one tablet with water immediately following lunch. [Demonstration Data Only]", datetime.utcnow().strftime("%Y-%m-%d")),
        ("Calcium & Vitamin D3", "500mg", "08:30 PM (After Dinner)", "For strong bones and joint mobility (Fictional Demo Data)", "Take one tablet with warm water or milk after dinner. [Demonstration Data Only]", None)
    ]
    for m_name, m_dosage, m_sched, m_purp, m_inst, m_last in demo_meds_spec:
        existing_med = db.query(Medication).filter(Medication.patient_id == demo_patient.id, Medication.name == m_name).first()
        if existing_med:
            existing_med.dosage = m_dosage
            existing_med.schedule_time = m_sched
            existing_med.purpose = m_purp
            existing_med.instructions = m_inst
        else:
            meds_to_add.append(
                Medication(
                    patient_id=demo_patient.id,
                    name=m_name,
                    dosage=m_dosage,
                    schedule_time=m_sched,
                    purpose=m_purp,
                    instructions=m_inst,
                    last_taken_date=m_last
                )
            )
    if meds_to_add:
        db.add_all(meds_to_add)
    db.commit()

    # 6. Seed Personal Belongings / Items for Demo Patient
    existing_items = [i.item_name for i in db.query(PersonalItem).filter(PersonalItem.patient_id == demo_patient.id).all()]
    items_to_add = []
    demo_items_spec = [
        ("Reading Glasses", "on the wooden bedside table inside the burgundy case", "Spare pair is in the top drawer of the reading desk", "glasses, spectacles, chashma, reading glasses, eyesight"),
        ("House Keys", "hanging on the brass peacock hook beside the main entrance door", "Main entrance keys attached to a peacock keychain", "keys, house keys, key, chaabi, entrance"),
        ("Medicines Box", "inside the upper kitchen cabinet marked with a green cross sticker", "Weekly pill organizer is sorted by daughter Ananya", "medicine, medicines, box, pills, tablets, dawa, dawai"),
        ("Walking Stick", "resting by the umbrella stand near the front hallway shoe cabinet", "Polished wooden cane with a secure rubber grip", "walking stick, stick, cane, lathi, walking"),
        ("Mobile Phone", "on the bedside charging stand next to the reading lamp", "Keep it charged so daughter Ananya and son Rajesh can reach you", "phone, mobile, cell, telephone, smartphone"),
        ("Wallet & Identity Card", "in the small zipped compartment of your beige handbag on the hall console", "Contains emergency contact card and senior citizen ID", "wallet, purse, money, id, identity, card, bag, handbag")
    ]
    for i_name, i_loc, i_notes, i_keys in demo_items_spec:
        if i_name not in existing_items:
            items_to_add.append(
                PersonalItem(
                    patient_id=demo_patient.id,
                    item_name=i_name,
                    location=i_loc,
                    notes=i_notes,
                    keywords=i_keys
                )
            )
    if items_to_add:
        db.add_all(items_to_add)
        db.commit()

    # 7. Seed Life Memories / Events for Demo Patient
    existing_events = [e.title for e in db.query(LifeEvent).filter(LifeEvent.patient_id == demo_patient.id).all()]
    events_to_add = []
    demo_events_spec = [
        ("Head of Botany Department at Miranda House", "1976 – 2014", "career", "You dedicated 38 fulfilling years as a professor and head of botany at Miranda House, Delhi University, inspiring thousands of young women in science.", "career, job, botany, professor, miranda house, delhi university, teaching, work"),
        ("Wedding in Shimla Hills", "May 1978", "family", "You married Anand Sharma in a peaceful traditional wedding in Shimla, surrounded by fragrant pine woods and loving family.", "marriage, wedding, shimla, husband, anand, anand sharma"),
        ("Birth of Daughter Ananya", "1980", "family", "Your daughter Ananya was born in Delhi, bringing immense warmth, curious questions, and joy into the household.", "ananya, daughter, birth, child, beti"),
        ("Birth of Son Rajesh", "1984", "family", "Your son Rajesh was born on a refreshing monsoon morning, completing your happy family of four.", "rajesh, son, birth, beta, monsoon"),
        ("Botanical Field Research in Valley of Flowers", "July 1995", "travel", "A memorable expedition to the Valley of Flowers in Uttarakhand documenting Himalayan alpine flora with university colleagues.", "valley of flowers, travel, trip, himalayas, uttarakhand, flowers, expedition")
    ]
    for e_title, e_date, e_cat, e_desc, e_keys in demo_events_spec:
        if e_title not in existing_events:
            events_to_add.append(
                LifeEvent(
                    patient_id=demo_patient.id,
                    title=e_title,
                    date_or_period=e_date,
                    category=e_cat,
                    description=e_desc,
                    keywords=e_keys
                )
            )
    if events_to_add:
        db.add_all(events_to_add)
        db.commit()

    # 8. Seed Realistic Interaction Logs for Caregiver Dashboard Analytics
    if db.query(InteractionLog).filter(InteractionLog.patient_id == demo_patient.id).count() < 5:
        now = datetime.utcnow()
        sample_logs = [
            InteractionLog(
                patient_id=demo_patient.id,
                timestamp=now - timedelta(hours=2),
                client_time="Thursday 08:35 AM",
                query_text="Where are my reading glasses?",
                intent="item_lookup",
                response_text="Your Reading Glasses are kept on the wooden bedside table inside the burgundy case.",
                was_fallback=False,
                retrieved_records_count=1,
                audio_played=True
            ),
            InteractionLog(
                patient_id=demo_patient.id,
                timestamp=now - timedelta(hours=3),
                client_time="Thursday 07:30 AM",
                query_text="Who is Ananya?",
                intent="person_lookup",
                response_text="Ananya Sharma is your daughter. She lives in Vasant Kunj and manages your health schedule.",
                was_fallback=False,
                retrieved_records_count=1,
                audio_played=True
            ),
            InteractionLog(
                patient_id=demo_patient.id,
                timestamp=now - timedelta(hours=5),
                client_time="Thursday 06:45 AM",
                query_text="What do I do today?",
                intent="routine_lookup",
                response_text="Next at 7:00 AM is Deer Park Morning Walk with your neighbour Sunita Kapoor.",
                was_fallback=False,
                retrieved_records_count=2,
                audio_played=True
            ),
            InteractionLog(
                patient_id=demo_patient.id,
                timestamp=now - timedelta(hours=14),
                client_time="Wednesday 08:30 PM",
                query_text="Where are my reading glasses?",
                intent="item_lookup",
                response_text="Your Reading Glasses are kept on the wooden bedside table inside the burgundy case.",
                was_fallback=False,
                retrieved_records_count=1,
                audio_played=True
            ),
            InteractionLog(
                patient_id=demo_patient.id,
                timestamp=now - timedelta(hours=16),
                client_time="Wednesday 06:30 PM",
                query_text="Did I take my medicine?",
                intent="medication_lookup",
                response_text="Your Telmisartan was marked as taken today after breakfast.",
                was_fallback=False,
                retrieved_records_count=1,
                audio_played=False
            ),
            InteractionLog(
                patient_id=demo_patient.id,
                timestamp=now - timedelta(hours=20),
                client_time="Wednesday 02:30 PM",
                query_text="Where are my reading glasses?",
                intent="item_lookup",
                response_text="Your Reading Glasses are kept on the wooden bedside table inside the burgundy case.",
                was_fallback=False,
                retrieved_records_count=1,
                audio_played=True
            ),
            InteractionLog(
                patient_id=demo_patient.id,
                timestamp=now - timedelta(hours=24),
                client_time="Wednesday 10:30 AM",
                query_text="Who is visiting this week?",
                intent="person_lookup",
                response_text="Your daughter Ananya visits every Tuesday and Thursday evening, and spends Sundays with you.",
                was_fallback=False,
                retrieved_records_count=1,
                audio_played=True
            )
        ]
        db.add_all(sample_logs)
        db.commit()

import {
  Medication,
  DoctorAppointment,
  DailyRoutine,
  PatientProfile,
  OverviewSummary,
  LocationLog,
  SOSAlert,
  NotificationItem,
  CareProtocolItem,
  HandoverNoteItem,
  CareObservationItem,
  WellbeingPatternItem
} from '../types';

export const DEMO_PATIENT: PatientProfile = {
  id: 1,
  name: 'Meera Sharma',
  email: 'demo@atti.care',
  role: 'patient',
  account_status: 'active',
  call_sign: 'Meera',
  caregiver_name: 'Ananya Sharma',
  is_demo: true,
  age: 72,
  date_of_birth: '14 August 1954',
  address: '24, Green Park, New Delhi',
  phone: '+91 98110 24567',
  emergency_contact_phone: '+91 98765 12345',
  emergency_contact_relation: 'Daughter',
  blood_group: 'B+',
  allergies: 'Penicillin (Moderate sensitivity)',
  medical_conditions: 'Mild Cognitive Impairment, Essential Hypertension',
  care_instructions: 'Please speak gently and calmly. If disoriented, do not challenge memories. Guide to a peaceful area and immediately call daughter Ananya Sharma at +91 98765 12345.',
  preferred_language: 'Hindi & English',
  doctor_name: 'Dr. Arvind Mehra',
  doctor_phone: '+91 98112 34567',
  doctor_clinic: 'Fortis Hospital, Vasant Kunj',
  communication_preferences: 'Gentle, calm reminders',
  created_at: '2026-11-12T08:58:20.192348'
};

export const DEMO_MEDICATIONS: Medication[] = [
  {
    id: 1,
    name: 'Telmisartan',
    dosage: '40 mg',
    schedule_time: '8:30 AM',
    purpose: 'Blood pressure maintenance',
    instructions: 'Take one tablet after morning breakfast with a full glass of water.',
    start_date: '2026-01-01',
    end_date: undefined,
    frequency: 'Every day',
    timing_slot: 'After breakfast',
    current_stock: 24,
    refill_threshold: 5,
    refill_reminder_days: 5,
    needs_refill: false,
    last_status: 'acknowledged'
  },
  {
    id: 2,
    name: 'Metformin',
    dosage: '500 mg',
    schedule_time: '1:30 PM',
    purpose: 'Blood sugar control',
    instructions: 'Take one tablet with water immediately after lunch.',
    start_date: '2026-01-01',
    end_date: undefined,
    frequency: 'Every day',
    timing_slot: 'After lunch',
    current_stock: 4,
    refill_threshold: 5,
    refill_reminder_days: 5,
    needs_refill: true,
    last_status: 'completed',
    last_taken_date: new Date().toISOString().split('T')[0]
  },
  {
    id: 3,
    name: 'Calcium & Vitamin D3',
    dosage: '500 mg',
    schedule_time: '8:30 PM',
    purpose: 'Bone strength & joint mobility',
    instructions: 'Take one tablet with warm water or milk after dinner.',
    start_date: '2026-01-01',
    end_date: undefined,
    frequency: 'Every day',
    timing_slot: 'After dinner',
    current_stock: 18,
    refill_threshold: 5,
    refill_reminder_days: 5,
    needs_refill: false,
    last_status: 'pending'
  }
];

export const DEMO_APPOINTMENTS: DoctorAppointment[] = [
  {
    id: 1,
    doctor_name: 'Dr. Arvind Mehra',
    clinic_or_hospital: 'Fortis Hospital, Vasant Kunj',
    appointment_date: 'Fri, 20 Nov, 2026',
    appointment_time: '11:00 AM',
    specialty: 'Geriatrician',
    notes: 'Routine geriatric consultation & blood work',
    preparation_note: 'Carry the last 3 months of sugar readings.',
    advance_reminder_hours: 24,
    status: 'scheduled',
    created_at: '2026-11-13T10:42:54.448958',
    doctor_phone: '+91 98110 24890',
    clinic_phone: '+91 11 4277 6222',
    consultation_detail: {
      id: 1,
      doctor_name: 'Dr. Arvind Mehra',
      specialty: 'Geriatrician',
      clinic_or_hospital: 'Fortis Hospital, Vasant Kunj',
      appointment_date: 'Fri, 20 Nov, 2026',
      appointment_time: '11:00 AM',
      status: 'scheduled',
      reason_for_visit: 'Routine geriatric review, HbA1c evaluation & hypertension maintenance.',
      preparation_note: 'Carry the last 3 months of sugar readings.',
      location_address: 'OPD Block B, 2nd Floor, Room 204, Fortis Hospital, Vasant Kunj, New Delhi',
      doctor_phone: '+91 98110 24890',
      clinic_phone: '+91 11 4277 6222'
    }
  },
  {
    id: 2,
    doctor_name: 'Dr. Shweta Rastogi',
    clinic_or_hospital: 'Max Healthcare, Saket',
    appointment_date: 'Sat, 5 Dec, 2026',
    appointment_time: '3:30 PM',
    specialty: 'Ophthalmologist',
    notes: 'Annual ophthalmology & retina check-up',
    preparation_note: 'Fasting for 2 hours required. Bring current spectacles.',
    advance_reminder_hours: 48,
    status: 'scheduled',
    created_at: '2026-11-13T10:42:54.448962',
    doctor_phone: '+91 98230 41520',
    clinic_phone: '+91 11 2651 5050',
    consultation_detail: {
      id: 2,
      doctor_name: 'Dr. Shweta Rastogi',
      specialty: 'Ophthalmologist',
      clinic_or_hospital: 'Max Healthcare, Saket',
      appointment_date: 'Sat, 5 Dec, 2026',
      appointment_time: '3:30 PM',
      status: 'scheduled',
      reason_for_visit: 'Comprehensive annual eye examination & dilated fundus retina screening.',
      preparation_note: 'Fasting for 2 hours required. Bring current spectacles.',
      location_address: 'Eye Care Suite 102, Max Super Speciality Hospital, 1, Press Enclave Road, Saket, New Delhi',
      doctor_phone: '+91 98230 41520',
      clinic_phone: '+91 11 2651 5050'
    }
  },
  {
    id: 3,
    doctor_name: 'Dr. Ramesh Nair',
    clinic_or_hospital: 'AIIMS, New Delhi',
    appointment_date: 'Wed, 16 Dec, 2026',
    appointment_time: '10:00 AM',
    specialty: 'Cardiologist',
    notes: 'Cardio evaluation & ECG review',
    preparation_note: 'Carry latest echocardiogram and lipid profile reports.',
    advance_reminder_hours: 24,
    status: 'scheduled',
    created_at: '2026-11-13T12:00:00.000000',
    doctor_phone: '+91 11 2658 8500',
    clinic_phone: '+91 11 2659 3201',
    consultation_detail: {
      id: 3,
      doctor_name: 'Dr. Ramesh Nair',
      specialty: 'Cardiologist',
      clinic_or_hospital: 'AIIMS, New Delhi',
      appointment_date: 'Wed, 16 Dec, 2026',
      appointment_time: '10:00 AM',
      status: 'scheduled',
      reason_for_visit: 'Routine cardiovascular evaluation, resting 12-lead ECG & blood pressure assessment.',
      preparation_note: 'Carry latest echocardiogram and lipid profile reports.',
      location_address: 'Cardiology OPD, 3rd Floor, Cardiothoracic Centre, AIIMS, Ansari Nagar East, New Delhi',
      doctor_phone: '+91 11 2658 8500',
      clinic_phone: '+91 11 2659 3201'
    }
  },
  {
    id: 4,
    doctor_name: 'Dr. Priya Kapoor',
    clinic_or_hospital: 'Home visit',
    appointment_date: 'Thu, 29 Oct, 2026',
    appointment_time: '4:00 PM',
    specialty: 'Physiotherapist',
    notes: 'Knee mobility session',
    preparation_note: 'Continue daily stretching exercises.',
    advance_reminder_hours: 24,
    status: 'completed',
    created_at: '2026-10-28T10:00:00.000000',
    doctor_phone: '+91 99104 77312',
    clinic_phone: '+91 99104 77312',
    consultation_detail: {
      id: 4,
      doctor_name: 'Dr. Priya Kapoor',
      specialty: 'Physiotherapist',
      clinic_or_hospital: 'Home visit (Green Park Residence)',
      appointment_date: 'Thu, 29 Oct, 2026',
      appointment_time: '4:00 PM',
      status: 'completed',
      reason_for_visit: 'Knee mobility & strengthening session for mild bilateral osteoarthritis.',
      clinical_summary: 'Patient demonstrated good compliance with morning exercises. Active knee flexion improved from 95° to 110°. Mild quadriceps fatigue noted after 15 minutes of gait training.',
      diagnosis: 'Bilateral mild knee osteoarthritis (Kellgren-Lawrence Grade 1); Quadriceps femoris weakness.',
      rx_number: 'PHY-HOME-2026-1029',
      prescribed_medications: [
        {
          name: 'Hot Fomentation Pack',
          dosage: '10-15 minutes',
          timing: 'Before morning exercises',
          frequency: 'Twice daily',
          duration: 'Ongoing',
          instructions: 'Apply warm fomentation over both knees before beginning stretching.'
        },
        {
          name: 'Topical Fast Relief Gel (Diclofenac 1.16%)',
          dosage: 'Thin layer',
          timing: 'As needed',
          frequency: 'Up to twice daily',
          duration: '14 days',
          instructions: 'Gentle local application if mild stiffness persists after walking.'
        }
      ],
      doctor_advice: [
        'Perform static quadriceps sets: 10 repetitions, hold 5 seconds each, 3 times daily.',
        'Avoid deep squatting, sitting on low stools, or cross-legged floor postures.',
        'Always wear supportive orthotic shoes during outdoor morning walks in Deer Park.',
        'Continue 20-minute flat-surface walking accompanied by family caregiver.'
      ],
      vitals_recorded: {
        bp: '124 / 78 mmHg',
        pulse: '70 bpm',
        weight: '64.0 kg'
      },
      lab_tests: [
        { name: 'Knee Range of Motion Assessment', result: 'Flexion 110° bilateral (Improved)', status: 'normal' },
        { name: 'Timed Up & Go (TUG) Test', result: '11.8 seconds (Stable elder benchmark)', status: 'normal' }
      ],
      follow_up_date: 'Thu, 15 Nov, 2026 (Follow-up home visit)',
      doctor_phone: '+91 99104 77312',
      clinic_phone: '+91 99104 77312',
      location_address: 'Home Visit: 24, Green Park, New Delhi'
    }
  },
  {
    id: 5,
    doctor_name: 'Dr. Arvind Mehra',
    clinic_or_hospital: 'Fortis Hospital, Vasant Kunj',
    appointment_date: 'Sun, 18 Oct, 2026',
    appointment_time: '11:30 AM',
    specialty: 'Geriatrician',
    notes: 'Monthly geriatric review',
    preparation_note: 'HbA1c 7.1%. Dose unchanged.',
    advance_reminder_hours: 24,
    status: 'completed',
    created_at: '2026-10-17T11:00:00.000000',
    doctor_phone: '+91 98110 24890',
    clinic_phone: '+91 11 4277 6222',
    consultation_detail: {
      id: 5,
      doctor_name: 'Dr. Arvind Mehra',
      specialty: 'Geriatrician',
      clinic_or_hospital: 'Fortis Hospital, Vasant Kunj',
      appointment_date: 'Sun, 18 Oct, 2026',
      appointment_time: '11:30 AM',
      status: 'completed',
      reason_for_visit: 'Comprehensive monthly geriatric review, glycemic control, and blood pressure monitoring.',
      clinical_summary: 'Patient is pleasant, well-oriented, and maintaining active daily routines. Blood pressure is well within therapeutic targets. HbA1c is stable at 7.1%. No orthostatic dizziness reported. Medication doses remain unchanged.',
      diagnosis: 'Type 2 Diabetes Mellitus (well-controlled); Essential Hypertension (stage 1, well-managed); Age-related osteopenia.',
      rx_number: 'RX-DEL-2026-1018-842',
      prescribed_medications: [
        {
          name: 'Telmisartan 40 mg',
          dosage: '1 tablet (40 mg)',
          timing: '8:30 AM · After breakfast',
          frequency: 'Every day',
          duration: '30 days (Refill monthly)',
          instructions: 'Take one tablet with a full glass of water immediately after morning breakfast.'
        },
        {
          name: 'Metformin 500 mg',
          dosage: '1 tablet (500 mg)',
          timing: '1:30 PM · After lunch',
          frequency: 'Every day',
          duration: '30 days (Refill monthly)',
          instructions: 'Take one tablet with water immediately after lunch to prevent gastric upset.'
        },
        {
          name: 'Calcium & Vitamin D3 (500mg / 400 IU)',
          dosage: '1 tablet',
          timing: '8:30 PM · After dinner',
          frequency: 'Every day',
          duration: '30 days (Refill monthly)',
          instructions: 'Take one tablet with lukewarm water or milk after dinner.'
        }
      ],
      doctor_advice: [
        'Maintain strict low-sodium diet (<2g table salt per day). Avoid pickles and papad.',
        'Continue 25-minute gentle morning walk in Deer Park with caregiver accompaniment.',
        'Drink 6 to 8 glasses of lukewarm water daily before 6:00 PM to prevent nighttime frequency.',
        'Maintain regular sleep schedule: lights dimmed by 6:30 PM to ease evening sundowning.'
      ],
      vitals_recorded: {
        bp: '128 / 82 mmHg',
        pulse: '72 bpm',
        weight: '64.2 kg',
        blood_sugar: '118 mg/dL',
        hba1c: '7.1%'
      },
      lab_tests: [
        { name: 'Glycated Hemoglobin (HbA1c)', result: '7.1% (Target < 7.5% for age)', status: 'normal' },
        { name: 'Fasting Blood Glucose', result: '108 mg/dL (In target)', status: 'normal' },
        { name: 'Serum Creatinine & eGFR', result: '0.92 mg/dL (Normal renal clearance)', status: 'normal' },
        { name: 'Lipid Profile (Total Cholesterol)', result: '174 mg/dL (Well controlled)', status: 'normal' }
      ],
      follow_up_date: 'Fri, 20 Nov, 2026 · 11:00 AM (Next quarterly review)',
      doctor_phone: '+91 98110 24890',
      clinic_phone: '+91 11 4277 6222',
      location_address: 'OPD Block B, 2nd Floor, Room 204, Fortis Hospital, Vasant Kunj, New Delhi'
    }
  },
  {
    id: 6,
    doctor_name: 'Dr. Shweta Rastogi',
    clinic_or_hospital: 'Max Healthcare, Saket',
    appointment_date: 'Thu, 4 Dec, 2025',
    appointment_time: '3:00 PM',
    specialty: 'Ophthalmologist',
    notes: 'Annual eye check-up',
    preparation_note: 'Prescribed lubricating drops. Next follow-up in 12 months.',
    advance_reminder_hours: 24,
    status: 'completed',
    created_at: '2025-12-03T15:00:00.000000',
    doctor_phone: '+91 98230 41520',
    clinic_phone: '+91 11 2651 5050',
    consultation_detail: {
      id: 6,
      doctor_name: 'Dr. Shweta Rastogi',
      specialty: 'Ophthalmologist',
      clinic_or_hospital: 'Max Healthcare, Saket',
      appointment_date: 'Thu, 4 Dec, 2025',
      appointment_time: '3:00 PM',
      status: 'completed',
      reason_for_visit: 'Annual comprehensive eye examination, slit-lamp biomicroscopy & diabetic retinopathy screening.',
      clinical_summary: 'Bilateral anterior segments normal. Mild tear film breakup indicating dry eye syndrome. Both lenses show mild early nuclear sclerosis consistent with age. Dilated fundus examination reveals clear optic discs, normal maculae, and NO signs of diabetic or hypertensive retinopathy.',
      diagnosis: 'Age-related Dry Eye Syndrome (Keratoconjunctivitis sicca); Presbyopia; Early Nuclear Sclerosis.',
      rx_number: 'OPH-MAX-2025-1204',
      prescribed_medications: [
        {
          name: 'Refresh Tears Eye Drops (Carboxymethylcellulose 0.5%)',
          dosage: '1 drop each eye',
          timing: '9:00 AM, 2:00 PM, 7:00 PM',
          frequency: '3 times daily',
          duration: '90 days',
          instructions: 'Instill one drop into each eye. Keep bottle tip sterile and replace after 30 days of opening.'
        }
      ],
      doctor_advice: [
        'Wear UV-protective sunglasses when going outdoors into bright sunlight.',
        'Blink consciously when reading or looking at phone/screens.',
        'Current reading spectacles power verified (+2.25 D OD, +2.50 D OS). No change required.',
        'Schedule next annual dilated retina screening in 12 months.'
      ],
      vitals_recorded: {
        bp: '126 / 80 mmHg',
        pulse: '74 bpm',
        weight: '64.5 kg'
      },
      lab_tests: [
        { name: 'Intraocular Pressure (IOP)', result: 'OD: 14 mmHg, OS: 15 mmHg (Normal)', status: 'normal' },
        { name: 'Visual Acuity (with correction)', result: 'OD: 6/9, OS: 6/9, Near: N6 (Good)', status: 'normal' },
        { name: 'Dilated Fundus Retina Check', result: 'No diabetic or hypertensive retinopathy', status: 'normal' }
      ],
      follow_up_date: 'Sat, 5 Dec, 2026 · 3:30 PM (Annual eye screening)',
      doctor_phone: '+91 98230 41520',
      clinic_phone: '+91 11 2651 5050',
      location_address: 'Eye Care Suite 102, Max Super Speciality Hospital, Saket, New Delhi'
    }
  }
];

export const DEMO_CARE_PROTOCOLS: CareProtocolItem[] = [
  {
    id: 1,
    title: 'Evening Sundowning & Memory Agitation Protocol',
    category: 'calming',
    category_label: 'Calming & Memory',
    priority: 'Critical',
    priority_badge: 'High Priority',
    description: 'Step-by-step calming procedure when Meera experiences disorientation, restlessness, or agitation around sunset.',
    steps: [
      'Dim overhead ceiling lighting at 6:30 PM; turn on warm bedside and floor ambient lamps.',
      'Play soft instrumental flute (Bansuri) or morning ragas at low background volume in the living room.',
      'Offer a warm cup of water with a pinch of crushed cardamom or soothing warm chamomile tea.',
      'Do not debate, correct, or argue about dates or misplaced items; gently validate her feelings with reassuring phrases ("You are safe at home with Ananya").',
      'Accompany her to sit in the balcony for fresh evening air or flip through familiar family photo albums.'
    ],
    avoid_triggers: 'Sudden loud television noises, arguing about misplaced items, rushing her while dressing or having dinner.',
    last_reviewed: 'Reviewed with Dr. Arvind Mehra on 18 Oct 2026'
  },
  {
    id: 2,
    title: 'Low-Sodium & Diabetic Meal Guidelines',
    category: 'diet',
    category_label: 'Diet & Nutrition',
    priority: 'Strict Medical',
    priority_badge: 'Strict Medical',
    description: 'Mandatory nutritional guidelines for maintaining blood pressure <130/80 and blood glucose within target.',
    steps: [
      'Total dietary sodium limited to <2.0 grams per day (no extra salt sprinkled at the table).',
      'Completely avoid refined sugar, sweets, packaged juices, and high-glycemic fruits like mango/chikoo.',
      'Serve lukewarm water only; strictly no chilled drinks after meals.',
      'Dinner must be served before 8:00 PM (soft oats, moong dal khichdi, or steamed idli with vegetable stew).',
      'Ensure a minimum fluid intake of 6 to 8 glasses of water evenly distributed before 6:00 PM.'
    ],
    avoid_triggers: 'Deep-fried snacks, pickles (achaar), papad, caffeinated beverages after 4:00 PM.',
    last_reviewed: 'Reviewed with Dietitian on 20 Oct 2026'
  },
  {
    id: 3,
    title: 'Mobility, Bathroom & Fall Prevention Protocol',
    category: 'mobility',
    category_label: 'Mobility & Safety',
    priority: 'High Priority',
    priority_badge: 'Critical Safety',
    description: 'Essential fall-prevention measures for indoor walking, transfers, and bathroom safety.',
    steps: [
      '4-prong walker must be placed within arm reach of the bed every night.',
      'Non-slip silicone grip socks or orthotic indoor footwear must be worn at all times indoors.',
      'Hallway and bathroom nightlights must remain switched ON 24/7.',
      'Attendant must assist during sit-to-stand transfers from low armchairs and bed.',
      'Bathroom grab rails must be held during bathing; bath stool must be dry before sitting.'
    ],
    avoid_triggers: 'Wet tiled floors, loose rugs/mats, rushing to answer the telephone or doorbell.',
    last_reviewed: 'Reviewed with Dr. Priya Kapoor (Physio) on 29 Oct 2026'
  },
  {
    id: 4,
    title: 'Emergency High BP & Hypoglycemia Response',
    category: 'emergency',
    category_label: 'Emergency Action',
    priority: 'Urgent',
    priority_badge: 'Life Safety',
    description: 'Immediate first-response actions for sudden blood pressure spikes or blood sugar drops.',
    steps: [
      'If Systolic BP > 160 or severe headache occurs: Seat Meera upright, loosen collar, keep room quiet. Re-check BP in 5 minutes.',
      'If BP remains > 160: Immediately call Dr. Arvind Mehra (+91 98110 24890) or Fortis Emergency (1066).',
      'If shaky, sweaty, or confused (Hypoglycemia < 70 mg/dL): Immediately give 1 Glucovita candy or 1/2 glass apple juice kept in Bedside Drawer 2.',
      'Emergency Medical Kit Location: Hallway linen closet top shelf (contains backup Omron BP monitor, Accu-Chek glucometer, and sterile gauze).'
    ],
    avoid_triggers: 'Allowing patient to walk during dizziness or giving water while lying flat.',
    last_reviewed: 'Updated 1 Nov 2026'
  },
  {
    id: 5,
    title: 'Daily Skin, Eye & Denture Care Protocol',
    category: 'hygiene',
    category_label: 'Hygiene & Comfort',
    priority: 'Daily Essential',
    priority_badge: 'Daily Essential',
    description: 'Routine personal care guidelines to prevent dry skin breakdowns, eye irritation, and oral discomfort.',
    steps: [
      'Morning bath water temperature must be tested lukewarm (not hot) on caregiver wrist.',
      'Apply moisturizing ceramide lotion immediately on elbows, lower legs, and heels post-bath.',
      'Administer Refresh Tears lubricating eye drops: 1 drop in each eye at 9:00 AM and 4:00 PM.',
      'Nightly denture soak in effervescent cleansing solution in bathroom glass container.',
      'Inspect skin on heels and tailbone twice weekly for any redness or pressure spots.'
    ],
    avoid_triggers: 'Harsh alkaline bath soaps, scalding hot water, sleeping with dentures on.',
    last_reviewed: 'Updated 5 Nov 2026'
  }
];

export const DEMO_HANDOVER_NOTES: HandoverNoteItem[] = [
  {
    id: 1,
    author_name: 'Ananya Sharma',
    author_role: 'Daughter / Primary Guardian',
    timestamp: 'Today, 8:45 AM',
    category: 'Diet & Medication',
    content: 'Gave breakfast (warm vegetable oats) and Telmisartan 40 mg at 8:30 AM. Mom ate with good appetite. Sitting in balcony now enjoying the morning sunlight.',
    vitals_recorded: 'BP: 124/80 mmHg • Pulse: 72 bpm',
    mood: 'Cheerful & calm'
  },
  {
    id: 2,
    author_name: 'Sunita Verma',
    author_role: 'Visiting Home Nurse',
    timestamp: 'Yesterday, 8:30 PM',
    category: 'Evening Rest & Mood',
    content: 'Dimmed lights at 6:30 PM and put on classical flute music. Mom was calm with zero sundowning agitation. Took Calcium tablet after dinner. In bed by 9:00 PM.',
    vitals_recorded: 'BP: 126/82 mmHg • Sugar: 122 mg/dL',
    mood: 'Peaceful'
  },
  {
    id: 3,
    author_name: 'Rohan Sharma',
    author_role: 'Son',
    timestamp: 'Yesterday, 4:15 PM',
    category: 'Mobility & Exercise',
    content: 'Accompanied mom for a gentle 20-minute walk in Deer Park. Used the 4-prong walker throughout. She felt refreshed and enjoyed seeing the peacocks. Knee pain was minimal.',
    mood: 'Energetic'
  }
];

export const DEMO_ACTIVITIES: DailyRoutine[] = [
  {
    id: 1,
    time: '6:30 AM',
    title: 'Morning Wake-up & Warm Water',
    description: 'Gentle wake-up, open the balcony curtains and have a glass of warm water.',
    category: 'activity',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'completed',
    is_active: true
  },
  {
    id: 2,
    time: '7:00 AM',
    title: 'Deer Park Morning Walk',
    description: 'A peaceful 25-minute walk in Deer Park, accompanied by a caregiver.',
    category: 'activity',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'missed',
    is_active: true
  },
  {
    id: 3,
    time: '8:30 AM',
    title: 'Breakfast & Blood Pressure Tablet',
    description: 'Warm vegetable oats or idli, followed by Telmisartan 40 mg.',
    category: 'medication',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'completed',
    is_active: true
  },
  {
    id: 4,
    time: '10:30 AM',
    title: 'Balcony Plant Care & Sunlight',
    description: 'Watering the potted tulsi and 15 minutes of morning sunlight.',
    category: 'activity',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'missed',
    is_active: true
  },
  {
    id: 5,
    time: '1:00 PM',
    title: 'Nutritious Lunch & Afternoon Rest',
    description: 'Fresh homemade dal, seasonal vegetables, and roti, followed by a restful 45-minute afternoon nap.',
    category: 'meal',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'missed',
    is_active: true
  },
  {
    id: 6,
    time: '5:00 PM',
    title: 'Evening Ginger Tea & Relaxing Music',
    description: 'A soothing warm cup of ginger tea with whole wheat biscuits, listening to instrumental sitar ragas.',
    category: 'activity',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'missed',
    is_active: true
  },
  {
    id: 7,
    time: '8:00 PM',
    title: 'Light Dinner & Evening Tablets',
    description: 'Light dinner of khichdi or vegetable soup, followed by your evening Calcium & Vitamin D3 tablet.',
    category: 'meal',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'upcoming',
    is_active: true
  },
  {
    id: 8,
    time: '9:30 PM',
    title: 'Night Bedtime Routine & Calm Sleep',
    description: 'Brushing teeth, dimming bedroom lights, and settling in for a calm, restful night.',
    category: 'activity',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'upcoming',
    is_active: true
  }
];

export const DEMO_LOCATION: LocationLog = {
  id: 1,
  latitude: 28.5355,
  longitude: 77.2100,
  address: '24, Green Park, New Delhi',
  accuracy_meters: 10,
  is_inside_safe_zone: true,
  status_label: 'At Home',
  battery_level: 88,
  timestamp: '2026-11-14T10:42:54'
};

export const DEMO_SOS_ALERTS: SOSAlert[] = [
  {
    id: 1,
    triggered_at: '2026-11-14T07:34:00',
    status: 'active',
    location_address: 'Near Green Park Metro Station, New Delhi',
    latitude: 28.5589,
    longitude: 77.2045,
    device_type: 'SOS pendant',
    notes: 'Triggered from portable SOS pendant button'
  },
  {
    id: 2,
    triggered_at: '2026-11-14T07:12:00',
    status: 'active',
    location_address: 'Deer Park walking path, Hauz Khas',
    latitude: 28.5520,
    longitude: 77.1950,
    device_type: 'SOS pendant',
    notes: 'Triggered from portable SOS pendant button'
  },
  {
    id: 3,
    triggered_at: '2026-11-14T05:50:00',
    status: 'active',
    location_address: 'Living room, 24 Green Park',
    latitude: 28.5355,
    longitude: 77.2100,
    device_type: 'Voice assistant',
    notes: 'Triggered via smart voice assistant'
  }
];

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: 'Incomplete activity',
    message: "Meera has not completed 'Light Dinner & Evening Tablets', scheduled for 20:00.",
    is_read: false,
    severity: 'info',
    type: 'activity',
    notification_type: 'activity',
    created_at: '2026-11-14T20:15:00'
  },
  {
    id: 2,
    title: 'Incomplete activity',
    message: "Meera has not completed 'Evening Ginger Tea & Relaxing Music', scheduled for 17:00.",
    is_read: false,
    severity: 'info',
    type: 'activity',
    notification_type: 'activity',
    created_at: '2026-11-14T17:15:00'
  },
  {
    id: 3,
    title: 'Incomplete activity',
    message: "Meera has not completed 'Nutritious Lunch & Afternoon Rest', scheduled for 13:00.",
    is_read: false,
    severity: 'info',
    type: 'activity',
    notification_type: 'activity',
    created_at: '2026-11-14T13:15:00'
  },
  {
    id: 4,
    title: 'Appointment scheduled',
    message: 'Cardiology follow-up with Dr. Ramesh Nair at AIIMS, New Delhi on 10 Dec 2026 at 10:30 AM.',
    is_read: false,
    severity: 'info',
    type: 'appointment',
    notification_type: 'appointment',
    created_at: '2026-11-14T07:34:00'
  },
  {
    id: 5,
    title: 'Medication refill needed',
    message: 'Metformin stock is low — 4 tablets remaining (4 days). Please refill soon.',
    is_read: false,
    severity: 'warning',
    type: 'refill',
    notification_type: 'refill',
    created_at: '2026-11-14T07:34:00'
  },
  {
    id: 6,
    title: 'Emergency SOS triggered',
    message: 'Meera pressed the SOS pendant near Green Park Metro Station, New Delhi.',
    is_read: true,
    severity: 'emergency',
    type: 'sos',
    notification_type: 'sos',
    created_at: '2026-11-14T07:34:00'
  }
];

export function buildDemoOverview(
  patient: PatientProfile = DEMO_PATIENT,
  medications: Medication[] = DEMO_MEDICATIONS,
  appointments: DoctorAppointment[] = DEMO_APPOINTMENTS,
  activities: DailyRoutine[] = DEMO_ACTIVITIES,
  sosAlerts: SOSAlert[] = [],
  lastLocation: LocationLog = DEMO_LOCATION,
  notifications: NotificationItem[] = DEMO_NOTIFICATIONS
): OverviewSummary {
  const hasActiveSos = sosAlerts.some(a => a.status === 'active');
  const refillReminders = medications.filter(
    m => m.needs_refill || (m.current_stock !== undefined && m.refill_threshold !== undefined && m.current_stock <= m.refill_threshold)
  );

  const completedActs = activities.filter(a => a.status === 'completed').length;
  const missedActs = activities.filter(a => a.status === 'missed').length;
  const totalActs = activities.length || 8;
  const pendingActs = Math.max(0, totalActs - completedActs - missedActs);

  return {
    patient,
    safety_status: hasActiveSos ? 'SOS Alert Active' : (lastLocation?.is_inside_safe_zone ? 'Safe & At Home' : 'Outside Safe Zone'),
    safety_severity: hasActiveSos ? 'danger' : (lastLocation?.is_inside_safe_zone ? 'safe' : 'warning'),
    last_location: lastLocation,
    activity_summary: {
      total: totalActs,
      completed: completedActs,
      pending: pendingActs,
      missed: missedActs
    },
    upcoming_medications: medications.slice(0, 6),
    upcoming_appointments: appointments.slice(0, 5),
    refill_reminders: refillReminders,
    recent_sos_alerts: sosAlerts.slice(0, 5),
    unread_notifications_count: notifications.filter(n => !n.is_read).length,
    recent_notifications: notifications.slice(0, 6),
    device_status: {
      location_permission: 'granted',
      notification_permission: 'granted',
      last_device_activity: new Date().toISOString(),
      battery_level: lastLocation?.battery_level || 88,
      connectivity: 'online'
    }
  };
}

export const DEMO_WELLBEING_PATTERNS: WellbeingPatternItem[] = [
  {
    id: 'sundowning',
    title: 'Evening Sundowning & Twilight Calm',
    domain: 'Emotional & Mood',
    status: 'improving',
    status_label: '85% Improvement',
    trend_summary: 'Agitation between 6:00 PM – 8:00 PM reduced to zero episodes this week.',
    observation_detail: 'Warm cardamom water, ambient lamp lighting at 6:30 PM, and soothing Bansuri flute music successfully stabilized twilight anxiety.',
    key_metric: '0 episodes',
    metric_change: '↓ from 3/wk',
    recommendation: 'Maintain current 6:30 PM dimming protocol without delay.',
    timeframe: 'Last 7 Days'
  },
  {
    id: 'sleep',
    title: 'Sleep Architecture & Night Awakening',
    domain: 'Sleep & Rest',
    status: 'stable',
    status_label: 'Optimal & Continuous',
    trend_summary: 'Consistently sleeps 7.6 hours uninterrupted from 10:15 PM to 6:30 AM.',
    observation_detail: 'Continuous hallway nightlight eliminated midnight disorientation. Zero wandering or out-of-bed confusion events recorded.',
    key_metric: '7.6 hrs/night',
    metric_change: '92% continuous',
    recommendation: 'Continue avoiding caffeinated tea or fluids past 4:30 PM.',
    timeframe: 'Last 14 Days'
  },
  {
    id: 'vitals',
    title: 'Blood Pressure & Glycemic Balance',
    domain: 'Physiological Vitals',
    status: 'optimal',
    status_label: 'Within Target',
    trend_summary: '7-day rolling average: 124/80 mmHg. Fasting blood sugar at 108 mg/dL.',
    observation_detail: 'Strict low-sodium home preparation (<2g salt/day) and post-breakfast Telmisartan 40mg have maintained perfect vascular stability.',
    key_metric: '124/80 mmHg',
    metric_change: 'Target <130/80',
    recommendation: 'Present 30-day vitals log to Dr. Arvind Mehra on Nov 20 visit.',
    timeframe: 'Last 30 Days'
  },
  {
    id: 'hydration',
    title: 'Hydration & Fluid Regularity',
    domain: 'Nutrition & Diet',
    status: 'stable',
    status_label: 'Consistent Intake',
    trend_summary: 'Average fluid intake: 7.2 glasses/day evenly spaced before 6:00 PM.',
    observation_detail: 'Accepts lukewarm water readily when offered with a slice of lemon or tulsi leaf. Early evening fluid taper prevents nocturia.',
    key_metric: '7.2 glasses/day',
    metric_change: 'Goal: 7-8 glasses',
    recommendation: 'Offer hydration prompts after morning and afternoon walks.',
    timeframe: 'Last 7 Days'
  },
  {
    id: 'mobility',
    title: 'Physical Mobility & Gait Balance',
    domain: 'Mobility & Fall Safety',
    status: 'stable',
    status_label: 'Active & Steady',
    trend_summary: 'Maintained 22 minutes of daily gentle stroll in Green Park Deer Park.',
    observation_detail: '4-prong walker utilized confidently. Physiotherapy knee strengthening with Dr. Priya Kapoor reduced morning stiffness significantly.',
    key_metric: '22 mins daily',
    metric_change: '0 fall risks',
    recommendation: 'Ensure supportive orthotic grip shoes are worn indoors at all times.',
    timeframe: 'Last 14 Days'
  },
  {
    id: 'voice_engagement',
    title: 'ATTI Voice Companion Engagement',
    domain: 'Cognitive & Social',
    status: 'improving',
    status_label: 'High Engagement',
    trend_summary: '14 daily spontaneous voice conversations with ATTI companion.',
    observation_detail: 'Frequently inquires about daily schedule, asks to hear favorite bhajan lyrics, and listens to family memory stories with visible delight.',
    key_metric: '14 chats/day',
    metric_change: '100% grounded',
    recommendation: 'Upload more vintage photographs of Delhi University and garden trips.',
    timeframe: 'Last 7 Days'
  }
];

export const DEMO_CARE_OBSERVATIONS: CareObservationItem[] = [
  {
    id: 1,
    timestamp: 'Today, 10:15 AM',
    author_name: 'Ananya Sharma',
    author_role: 'Daughter / Primary Guardian',
    domain: 'Mood & Demeanor',
    observation: 'Mom was in high spirits while tending to the balcony tulsi plant. She sang along to a classic Mohammed Rafi melody and identified all family members in the photo album with clear recall.',
    severity: 'positive',
    action_taken: 'Engaged in 15 minutes of conversation about childhood stories.'
  },
  {
    id: 2,
    timestamp: 'Yesterday, 7:15 PM',
    author_name: 'Sunita Verma',
    author_role: 'Visiting Home Nurse',
    domain: 'Sleep & Rest',
    observation: 'Evening twilight transition was completely calm. Ambient amber lamps turned on at 6:30 PM with flute ragas. Drank warm cardamom water. Zero restlessness or agitation observed.',
    severity: 'positive',
    action_taken: 'Followed Calming Protocol Step 1-3.'
  },
  {
    id: 3,
    timestamp: '13 Nov, 4:30 PM',
    author_name: 'Dr. Priya Kapoor',
    author_role: 'Physiotherapist',
    domain: 'Physical Mobility',
    observation: 'Completed 30 minutes of knee mobilization and quad strengthening exercises. Meera achieved 15 sit-to-stand chair repetitions with minimal support. Gait posture is upright and steady.',
    severity: 'stable',
    action_taken: 'Recommended continuing daily 10-minute home stretching routine.'
  },
  {
    id: 4,
    timestamp: '12 Nov, 1:45 PM',
    author_name: 'Rohan Sharma',
    author_role: 'Son',
    domain: 'Nutrition & Hydration',
    observation: 'Finished full lunch (moong dal khichdi and steamed bottle gourd) with good appetite. Consumed 2 full glasses of lukewarm water without reminder.',
    severity: 'stable',
    action_taken: 'Checked post-lunch blood sugar: 138 mg/dL (normal).'
  },
  {
    id: 5,
    timestamp: '10 Nov, 9:20 PM',
    author_name: 'Ananya Sharma',
    author_role: 'Daughter / Primary Guardian',
    domain: 'Vitals & General',
    observation: 'Evening BP check recorded 122/78 mmHg, pulse 74 bpm. Mom mentioned slight eye dryness; administered Refresh Tears eye drops as prescribed by Dr. Shweta Rastogi.',
    severity: 'stable',
    action_taken: 'Noted eye drops given in evening medication log.'
  }
];

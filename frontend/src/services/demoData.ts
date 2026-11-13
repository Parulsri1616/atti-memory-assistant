import {
  Medication,
  DoctorAppointment,
  DailyRoutine,
  PatientProfile,
  OverviewSummary,
  LocationLog,
  SOSAlert,
  NotificationItem
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
    name: 'Metformin',
    dosage: '500mg',
    schedule_time: '01:30 PM (After Lunch)',
    purpose: 'For blood sugar support (Fictional Demo Data)',
    instructions: 'Take one tablet with water immediately following lunch. [Demonstration Data Only]',
    start_date: '2026-01-01',
    end_date: undefined,
    frequency: 'Every day',
    timing_slot: 'Afternoon',
    current_stock: 4,
    refill_threshold: 5,
    refill_reminder_days: 5,
    needs_refill: true,
    last_status: 'completed',
    last_taken_date: new Date().toISOString().split('T')[0],
    last_taken_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    last_acknowledged_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 2,
    name: 'Telmisartan',
    dosage: '40mg',
    schedule_time: '08:30 AM (After Breakfast)',
    purpose: 'For healthy blood pressure maintenance (Fictional Demo Data)',
    instructions: 'Take one tablet after your morning breakfast with a full glass of water. [Demonstration Data Only]',
    start_date: '2026-01-01',
    end_date: undefined,
    frequency: 'Every day',
    timing_slot: 'Morning',
    current_stock: 24,
    refill_threshold: 5,
    refill_reminder_days: 5,
    needs_refill: false,
    last_status: 'pending'
  },
  {
    id: 3,
    name: 'Calcium & Vitamin D3',
    dosage: '500mg',
    schedule_time: '08:30 PM (After Dinner)',
    purpose: 'For strong bones and joint mobility (Fictional Demo Data)',
    instructions: 'Take one tablet with warm water or milk after dinner. [Demonstration Data Only]',
    start_date: '2026-01-01',
    end_date: undefined,
    frequency: 'Every day',
    timing_slot: 'Night',
    current_stock: 18,
    refill_threshold: 5,
    refill_reminder_days: 5,
    needs_refill: false,
    last_status: 'pending'
  },
  {
    id: 4,
    name: 'Donepezil',
    dosage: '5mg',
    schedule_time: '10:00 PM (Bedtime)',
    purpose: 'For memory support and cognitive health',
    instructions: 'Take one tablet with a sip of water before sleeping. [Demonstration Data Only]',
    start_date: '2026-02-01',
    end_date: undefined,
    frequency: 'Every day',
    timing_slot: 'Night',
    current_stock: 14,
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
    appointment_date: '2026-11-20',
    appointment_time: '11:00 AM',
    notes: 'Routine Geriatric Consultation & Blood Pressure Review. Carry latest blood test reports.',
    advance_reminder_hours: 24,
    status: 'scheduled',
    created_at: '2026-11-13T10:42:54.448958'
  },
  {
    id: 2,
    doctor_name: 'Dr. Shweta Rastogi',
    clinic_or_hospital: 'Max Healthcare, Saket',
    appointment_date: '2026-12-05',
    appointment_time: '03:30 PM',
    notes: 'Annual ophthalmology and retina eye checkup. Fasting for 2 hours required.',
    advance_reminder_hours: 48,
    status: 'scheduled',
    created_at: '2026-11-13T10:42:54.448962'
  },
  {
    id: 3,
    doctor_name: 'Dr. Rajesh Kapoor',
    clinic_or_hospital: 'AIIMS Ansari Nagar',
    appointment_date: '2026-12-18',
    appointment_time: '10:30 AM',
    notes: 'Comprehensive memory assessment and cognitive follow-up review.',
    advance_reminder_hours: 24,
    status: 'scheduled',
    created_at: '2026-11-13T12:00:00.000000'
  }
];

export const DEMO_ACTIVITIES: DailyRoutine[] = [
  {
    id: 1,
    time: '06:30',
    title: 'Morning Wake-up & Warm Water',
    description: 'Gentle wake-up, open the balcony curtains for morning sunlight, and drink a glass of warm water.',
    category: 'activity',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'completed',
    is_active: true,
    completed_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 2,
    time: '07:00',
    title: 'Deer Park Morning Walk',
    description: 'A peaceful 25-minute morning stroll with your neighbour Sunita Kapoor in the Green Park Deer Park.',
    category: 'activity',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'completed',
    is_active: true,
    completed_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 3,
    time: '08:30',
    title: 'Breakfast & Blood Pressure Tablet',
    description: 'Warm vegetable oats or idli, followed by your morning blood pressure medication (Telmisartan 40mg) with water.',
    category: 'medication',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'pending',
    is_active: true
  },
  {
    id: 4,
    time: '10:30',
    title: 'Balcony Plant Care & Gardening',
    description: 'Watering your potted tulsi, ferns, and flowering jasmine on the sunlit front balcony.',
    category: 'activity',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'pending',
    is_active: true
  },
  {
    id: 5,
    time: '13:00',
    title: 'Nutritious Lunch & Afternoon Rest',
    description: 'Fresh homemade dal, seasonal vegetables, and roti, followed by a restful 45-minute afternoon nap in your bedroom.',
    category: 'meal',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'pending',
    is_active: true
  },
  {
    id: 6,
    time: '17:00',
    title: 'Evening Ginger Tea & Relaxing Music',
    description: 'A soothing warm cup of ginger tea with whole wheat biscuits, listening to instrumental sitar ragas.',
    category: 'activity',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'pending',
    is_active: true
  },
  {
    id: 7,
    time: '20:00',
    title: 'Light Dinner & Evening Tablets',
    description: 'Light dinner of khichdi or vegetable soup, followed by your evening Calcium & Vitamin D3 tablet.',
    category: 'meal',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'scheduled',
    is_active: true
  },
  {
    id: 8,
    time: '21:30',
    title: 'Night Bedtime Routine & Rest',
    description: 'Brushing teeth, dimming bedroom lights, and settling in for a calm, restful night.',
    category: 'activity',
    day_of_week: 'daily',
    scheduled_date: 'today',
    repeat_frequency: 'Daily',
    status: 'scheduled',
    is_active: true
  }
];

export const DEMO_LOCATION: LocationLog = {
  id: 1,
  latitude: 28.5594,
  longitude: 77.2023,
  address: '24, Green Park, New Delhi',
  accuracy_meters: 10,
  is_inside_safe_zone: true,
  status_label: 'At Home',
  battery_level: 88,
  timestamp: new Date().toISOString()
};

export function buildDemoOverview(
  patient: PatientProfile = DEMO_PATIENT,
  medications: Medication[] = DEMO_MEDICATIONS,
  appointments: DoctorAppointment[] = DEMO_APPOINTMENTS,
  activities: DailyRoutine[] = DEMO_ACTIVITIES,
  sosAlerts: SOSAlert[] = [],
  lastLocation: LocationLog = DEMO_LOCATION,
  notifications: NotificationItem[] = []
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

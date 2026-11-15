export interface PatientProfile {
  id: number;
  email: string;
  name: string;
  role?: string;
  account_status?: string;
  call_sign: string;
  caregiver_name: string;
  is_demo: boolean;
  created_at: string;
  associated_patient_id?: number;
  associated_patient_name?: string;
  age?: number;
  date_of_birth?: string;
  address?: string;
  phone?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  blood_group?: string;
  allergies?: string;
  medical_conditions?: string;
  care_instructions?: string;
  preferred_language?: string;
  doctor_name?: string;
  doctor_phone?: string;
  doctor_clinic?: string;
  communication_preferences?: string;
  profile_photo_url?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token?: string;
  token_type: string;
  expires_in?: number;
  expires_at?: string;
  patient: PatientProfile;
}

export interface OnboardingMedicationItem {
  name: string;
  dosage?: string;
  schedule_time: string;
  timing_slot?: string;
  frequency?: string;
  instructions?: string;
  purpose?: string;
  current_stock?: number;
  refill_threshold?: number;
}

export interface OnboardingAppointmentItem {
  doctor_name: string;
  clinic_or_hospital: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
  advance_reminder_hours?: number;
}

export interface OnboardingRoutineItem {
  time: string;
  title: string;
  category?: string;
  description?: string;
  repeat_frequency?: string;
}

export interface OnboardingContactItem {
  name: string;
  relationship: string;
  phone?: string;
  notes?: string;
}

export interface OnboardingPlaceItem {
  name: string;
  address_or_location: string;
  category?: string;
  description?: string;
}

export interface OnboardingMemoryFactItem {
  category: string;
  question_or_topic: string;
  answer_or_detail: string;
}

export interface OnboardingLifeEventItem {
  title: string;
  date_or_period?: string;
  category?: string;
  description: string;
}

export interface OnboardingPersonalItemDef {
  item_name: string;
  location: string;
  notes?: string;
  keywords?: string;
}

export interface FamilyPatientOnboardingPayload {
  family_name: string;
  family_email: string;
  family_password: string;
  family_relationship?: string;
  family_phone?: string;

  patient_name: string;
  patient_email: string;
  patient_password: string;
  patient_call_sign?: string;
  patient_age?: number;
  patient_dob?: string;
  patient_address?: string;
  preferred_language?: string;

  blood_group?: string;
  medical_conditions?: string;
  allergies?: string;
  care_instructions?: string;
  doctor_name?: string;
  doctor_phone?: string;
  doctor_clinic?: string;

  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  safe_zone_name?: string;
  safe_zone_radius?: number;
  safe_zone_address?: string;

  medications?: OnboardingMedicationItem[];
  appointments?: OnboardingAppointmentItem[];
  routines?: OnboardingRoutineItem[];
  contacts?: OnboardingContactItem[];
  places?: OnboardingPlaceItem[];
  memory_facts?: OnboardingMemoryFactItem[];
  life_events?: OnboardingLifeEventItem[];
  personal_items?: OnboardingPersonalItemDef[];
}

export interface Person {
  id: number;
  name: string;
  relationship: string;
  phone?: string;
  photo_url?: string;
  notes?: string;
  description?: string;
  voice_message_url?: string;
  visit_schedule?: string;
  keywords?: string;
}

export interface DailyRoutine {
  id: number;
  time: string;
  title: string;
  description?: string;
  category: string;
  day_of_week: string;
  scheduled_date?: string;
  repeat_frequency?: string;
  status?: 'scheduled' | 'pending' | 'acknowledged' | 'completed' | 'snoozed' | 'missed' | 'cancelled' | 'upcoming';
  reminder_minutes_before?: number;
  acknowledged_at?: string;
  completed_at?: string;
  is_active: boolean;
}

export interface Medication {
  id: number;
  name: string;
  dosage?: string;
  schedule_time: string;
  purpose?: string;
  instructions?: string;
  start_date?: string;
  end_date?: string;
  frequency?: string;
  timing_slot?: string;
  current_stock?: number;
  refill_threshold?: number;
  refill_reminder_days?: number;
  needs_refill?: boolean;
  last_status?: 'scheduled' | 'pending' | 'acknowledged' | 'completed' | 'snoozed' | 'missed';
  last_acknowledged_at?: string;
  last_taken_at?: string;
  last_taken_date?: string;
}

export interface MedicationLog {
  id: number;
  medication_id: number;
  scheduled_time: string;
  scheduled_date: string;
  status: string;
  acknowledged_at?: string;
  taken_at?: string;
  notes?: string;
  created_at: string;
}

export interface DoctorAppointment {
  id: number;
  doctor_name: string;
  clinic_or_hospital: string;
  appointment_date: string;
  appointment_time: string;
  specialty?: string;
  notes?: string;
  preparation_note?: string;
  advance_reminder_hours?: number;
  follow_up_reminder_date?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  doctor_phone?: string;
  clinic_phone?: string;
  consultation_detail?: ConsultationDetail;
}

export interface PrescribedMedicine {
  name: string;
  dosage: string;
  timing: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ConsultationDetail {
  id: number;
  doctor_name: string;
  specialty: string;
  clinic_or_hospital: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason_for_visit: string;
  preparation_note?: string;
  clinical_summary?: string;
  diagnosis?: string;
  rx_number?: string;
  prescribed_medications?: PrescribedMedicine[];
  doctor_advice?: string[];
  vitals_recorded?: {
    bp?: string;
    pulse?: string;
    weight?: string;
    blood_sugar?: string;
    hba1c?: string;
  };
  lab_tests?: Array<{
    name: string;
    result: string;
    status: 'normal' | 'attention' | 'pending';
  }>;
  follow_up_date?: string;
  doctor_phone?: string;
  clinic_phone?: string;
  location_address?: string;
}

export interface CareProtocolItem {
  id: number;
  title: string;
  category: 'calming' | 'diet' | 'mobility' | 'emergency' | 'hygiene';
  category_label: string;
  priority: 'Critical' | 'Strict Medical' | 'High Priority' | 'Urgent' | 'Daily Essential';
  priority_badge: string;
  description: string;
  steps: string[];
  avoid_triggers?: string;
  last_reviewed?: string;
}

export interface HandoverNoteItem {
  id: number;
  author_name: string;
  author_role: string;
  timestamp: string;
  category: string;
  content: string;
  vitals_recorded?: string;
  mood?: string;
}

export interface CareObservationItem {
  id: number;
  timestamp: string;
  author_name: string;
  author_role: string;
  domain: 'Mood & Demeanor' | 'Sleep & Rest' | 'Physical Mobility' | 'Memory & Speech' | 'Nutrition & Hydration' | 'Vitals & General';
  observation: string;
  severity: 'positive' | 'stable' | 'monitor';
  action_taken?: string;
}

export interface WellbeingPatternItem {
  id: string;
  title: string;
  domain: string;
  status: 'improving' | 'stable' | 'optimal' | 'attention';
  status_label: string;
  trend_summary: string;
  observation_detail: string;
  key_metric: string;
  metric_change: string;
  recommendation: string;
  timeframe: string;
}

export interface FamiliarPlace {
  id: number;
  name: string;
  address_or_location: string;
  category?: string;
  description?: string;
  photo_url?: string;
  is_safe_zone?: boolean;
  created_at: string;
}

export interface MemoryFact {
  id: number;
  category: string;
  question_or_topic: string;
  answer_or_detail: string;
  is_verified: boolean;
  notes?: string;
  created_at: string;
}

export interface SafeZone {
  id: number;
  name: string;
  center_latitude: number;
  center_longitude: number;
  radius_meters: number;
  address: string;
  is_active: boolean;
  monitoring_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationLog {
  id: number;
  latitude: number;
  longitude: number;
  address: string;
  accuracy_meters: number;
  is_inside_safe_zone: boolean;
  status_label: string;
  battery_level: number;
  timestamp: string;
}

export interface SOSAlert {
  id: number;
  triggered_at: string;
  status: 'active' | 'acknowledged' | 'resolved';
  location_address?: string;
  latitude?: number;
  longitude?: number;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  notes?: string;
  device_type?: string;
}

export interface EmergencyQR {
  id: number;
  patient_id: number;
  qr_code_hash: string;
  status: 'active' | 'disabled' | 'revoked';
  scan_count: number;
  last_scanned_at?: string;
  scan_history_notes?: string;
  qr_url: string;
  created_at: string;
  updated_at: string;
}

export interface CareTeamMember {
  id: number;
  name: string;
  relationship_or_role: string;
  phone: string;
  email?: string;
  permissions: 'full' | 'view_only' | 'emergency_only';
  is_primary: boolean;
  care_notes?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  patient_id?: number;
  recipient_role?: string;
  title: string;
  message: string;
  notification_type?: string;
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: number;
  severity?: 'info' | 'warning' | 'emergency';
  type?: string;
  created_at: string;
}

export interface OverviewActivitySummary {
  total: number;
  completed: number;
  pending: number;
  missed: number;
}

export interface OverviewSummary {
  patient: PatientProfile;
  safety_status: string;
  safety_severity: 'safe' | 'warning' | 'danger' | 'neutral';
  last_location?: LocationLog;
  activity_summary: OverviewActivitySummary;
  upcoming_medications: Medication[];
  upcoming_appointments: DoctorAppointment[];
  refill_reminders: Medication[];
  recent_sos_alerts: SOSAlert[];
  unread_notifications_count: number;
  recent_notifications: NotificationItem[];
  device_status: {
    location_permission: string;
    notification_permission: string;
    last_device_activity: string;
    battery_level: number;
    connectivity: string;
  };
}

export interface PersonalItem {
  id: number;
  item_name: string;
  location: string;
  notes?: string;
  keywords?: string;
}

export interface LifeEvent {
  id: number;
  title: string;
  date_or_period?: string;
  category: string;
  description: string;
  keywords?: string;
}

export interface InteractionLog {
  id: number;
  timestamp: string;
  client_time?: string;
  query_text: string;
  intent: string;
  response_text: string;
  was_fallback: boolean;
  retrieved_records_count: number;
}

export interface QueryResponse {
  answer: string;
  intent: string;
  is_fallback: boolean;
  confidence: number;
  grounded_context?: string;
  sources: Array<{
    type: string;
    title: string;
    content: string;
  }>;
  spoken_text: string;
}

export interface AnalyticsData {
  total_queries: number;
  fallback_count: number;
  fallback_rate_pct: number;
  grounded_accuracy_pct: number;
  repeated_queries: Array<{ query: string; count: number }>;
  unresolved_queries: Array<{ id: number; query: string; timestamp: string }>;
  counts: {
    people: number;
    routines: number;
    medications: number;
  };
}

export interface EmergencyProfile {
  patient_id: number;
  name: string;
  call_sign: string;
  age?: number;
  date_of_birth?: string;
  address?: string;
  caregiver_name: string;
  caregiver_phone: string;
  emergency_contact_relation?: string;
  doctor_name: string;
  doctor_phone: string;
  blood_group?: string;
  medical_conditions: string;
  allergies: string;
  care_instructions: string;
}

export interface SystemStatus {
  status: string;
  patient_name: string;
  caregiver_name: string;
  llm_engine: string;
  offline_ready: boolean;
  lan_ip?: string;
  network_app_url?: string;
}

// =========================================================================
// SECTION 2: PATIENT INSIGHTS TYPES
// =========================================================================

export interface CaregiverObservation {
  id: number;
  patient_id: number;
  recorded_by: string;
  recorded_by_id?: number;
  category: 'sleep' | 'appetite' | 'mood' | 'routine' | 'doctor_note' | 'general' | string;
  observation_text: string;
  severity: 'normal' | 'noteworthy' | 'concerning' | string;
  observed_at: string;
  created_at: string;
}

export interface DailyActivityBreakdown {
  date: string;
  day_name: string;
  completed: number;
  missed: number;
  pending: number;
  completion_rate: number;
}

export interface CategoryBreakdown {
  category: string;
  completed: number;
  missed: number;
  total: number;
  rate: number;
}

export interface FrequentlyMissedCategory {
  category: string;
  missed_count: number;
}

export interface ActivityTrends {
  completion_rate: number;
  consistency_score: number;
  total_scheduled: number;
  total_completed: number;
  total_missed: number;
  daily_breakdown: DailyActivityBreakdown[];
  category_breakdown: CategoryBreakdown[];
  frequently_missed: FrequentlyMissedCategory[];
}

export interface MedicationPatterns {
  total_doses_scheduled: number;
  total_doses_acknowledged: number;
  total_doses_taken: number;
  intake_adherence_rate: number;
  acknowledgement_rate: number;
  unacknowledged_alerts_count: number;
  recent_intake_history: MedicationLog[];
}

export interface RoutineDomainSummary {
  domain: string;
  logged_count: number;
  pattern_description: string;
  consistency_label: string;
}

export interface RoutineInsights {
  sleep_summary: RoutineDomainSummary;
  meals_summary: RoutineDomainSummary;
  hydration_summary: RoutineDomainSummary;
  exercise_summary: RoutineDomainSummary;
}

export interface PatientInsightsData {
  timeframe: 'daily' | 'weekly' | 'monthly';
  activity_trends: ActivityTrends;
  medication_patterns: MedicationPatterns;
  routine_insights: RoutineInsights;
  observations: CaregiverObservation[];
}


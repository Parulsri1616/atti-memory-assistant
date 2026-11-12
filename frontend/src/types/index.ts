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
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  blood_group?: string;
  allergies?: string;
  medical_conditions?: string;
  care_instructions?: string;
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

export interface Person {
  id: number;
  name: string;
  relationship: string;
  phone?: string;
  photo_url?: string;
  notes?: string;
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
  is_active: boolean;
}

export interface Medication {
  id: number;
  name: string;
  dosage?: string;
  schedule_time: string;
  purpose?: string;
  instructions?: string;
  last_taken_date?: string;
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

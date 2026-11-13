import {
  Person,
  DailyRoutine,
  Medication,
  PersonalItem,
  LifeEvent,
  InteractionLog,
  QueryResponse,
  AnalyticsData,
  PatientProfile,
  AuthResponse,
  EmergencyProfile,
  SystemStatus,
  DoctorAppointment,
  FamiliarPlace,
  MemoryFact,
  SafeZone,
  LocationLog,
  SOSAlert,
  EmergencyQR,
  CareTeamMember,
  NotificationItem,
  OverviewSummary,
  CaregiverObservation,
  PatientInsightsData
} from '../types';

const API_BASE = '/api';

// Access Token Storage with storage persistence for seamless page reloads
let inMemoryAccessToken: string | null = (typeof window !== 'undefined')
  ? (sessionStorage.getItem('atti_access_token') || localStorage.getItem('atti_access_token'))
  : null;

let activeRefreshPromise: Promise<PatientProfile> | null = null;

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('atti_access_token', token);
      localStorage.setItem('atti_access_token', token);
    } else {
      sessionStorage.removeItem('atti_access_token');
      localStorage.removeItem('atti_access_token');
    }
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const token = inMemoryAccessToken || (typeof window !== 'undefined' ? (sessionStorage.getItem('atti_access_token') || localStorage.getItem('atti_access_token')) : null);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch wrapper that attaches Authorization header, includes credentials for HttpOnly refresh cookies,
 * and transparently retries requests on 401 using the deduplicated refresh token mutex.
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const mergedOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      ...authHeaders(),
      ...(options.headers || {})
    }
  };

  let res = await fetch(url, mergedOptions);

  // If unauthorized and we haven't already retried, attempt silent deduplicated refresh
  if (res.status === 401 && !url.includes('/auth/refresh') && !url.includes('/auth/login') && !url.includes('/auth/demo')) {
    try {
      const refreshedProfile = await api.refreshToken();
      if (refreshedProfile && inMemoryAccessToken) {
        // Retry original request with newly acquired access token
        const retryOptions: RequestInit = {
          ...options,
          credentials: 'include',
          headers: {
            ...authHeaders(),
            ...(options.headers || {})
          }
        };
        res = await fetch(url, retryOptions);
      }
    } catch {
      // Refresh failed; propagate original 401 response
    }
  }

  return res;
}

export const api = {
  // --- Authentication ---
  async demoLogin(role: 'patient' | 'family' = 'patient'): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Demo login failed');
    }
    const data: AuthResponse = await res.json();
    setAccessToken(data.access_token || data.token || null);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid email or password');
    }
    const data: AuthResponse = await res.json();
    setAccessToken(data.access_token || data.token || null);
    return data;
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    confirm_password?: string;
    call_sign?: string;
    caregiver_name?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    const data: AuthResponse = await res.json();
    setAccessToken(data.access_token || data.token || null);
    return data;
  },

  async refreshToken(): Promise<PatientProfile> {
    if (activeRefreshPromise) {
      return activeRefreshPromise;
    }

    activeRefreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          setAccessToken(null);
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Session refresh failed');
        }
        const data: AuthResponse = await res.json();
        setAccessToken(data.access_token || data.token || null);
        return data.patient;
      } finally {
        activeRefreshPromise = null;
      }
    })();

    return activeRefreshPromise;
  },

  async getMe(): Promise<PatientProfile> {
    // If no in-memory access token is set, attempt to restore via HttpOnly refresh cookie first
    if (!inMemoryAccessToken) {
      return await api.refreshToken();
    }
    const res = await fetchWithAuth(`${API_BASE}/auth/me`);
    if (!res.ok) {
      setAccessToken(null);
      throw new Error('Session expired or invalid');
    }
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders()
      });
    } catch {}
    setAccessToken(null);
  },

  // --- Assistant ---
  async askAssistant(query: string, clientTime?: string): Promise<QueryResponse> {
    const res = await fetchWithAuth(`${API_BASE}/assistant/query`, {
      method: 'POST',
      body: JSON.stringify({
        query,
        client_time: clientTime || new Date().toISOString()
      })
    });
    if (!res.ok) {
      throw new Error('Failed to query assistant');
    }
    return res.json();
  },

  async getSuggestions(): Promise<string[]> {
    const res = await fetchWithAuth(`${API_BASE}/assistant/prompt-suggestions`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.suggestions || [];
  },

  async getSystemStatus() {
    const res = await fetch(`${API_BASE}/assistant/status`);
    return res.json();
  },

  // --- Routines & Current Banner ---
  async getCurrentBanner(clientTime?: string) {
    const timeParam = encodeURIComponent(clientTime || new Date().toISOString());
    const res = await fetchWithAuth(`${API_BASE}/routines/current-banner?client_time=${timeParam}`);
    if (!res.ok) return null;
    return res.json();
  },

  async getRoutines(): Promise<DailyRoutine[]> {
    const res = await fetchWithAuth(`${API_BASE}/routines`);
    return res.json();
  },

  async createRoutine(routine: Omit<DailyRoutine, 'id'>): Promise<DailyRoutine> {
    const res = await fetchWithAuth(`${API_BASE}/routines`, {
      method: 'POST',
      body: JSON.stringify(routine)
    });
    return res.json();
  },

  async deleteRoutine(id: number) {
    await fetchWithAuth(`${API_BASE}/routines/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Medications ---
  async getMedications(): Promise<Medication[]> {
    const res = await fetchWithAuth(`${API_BASE}/routines/medications`);
    return res.json();
  },

  async createMedication(med: Omit<Medication, 'id'>): Promise<Medication> {
    const res = await fetchWithAuth(`${API_BASE}/routines/medications`, {
      method: 'POST',
      body: JSON.stringify(med)
    });
    return res.json();
  },

  async deleteMedication(id: number) {
    await fetchWithAuth(`${API_BASE}/routines/medications/${id}`, {
      method: 'DELETE'
    });
  },

  async logMedicationTaken(id: number) {
    const res = await fetchWithAuth(`${API_BASE}/routines/medications/${id}/log-taken`, {
      method: 'POST'
    });
    return res.json();
  },

  // --- People ---
  async getPeople(): Promise<Person[]> {
    const res = await fetchWithAuth(`${API_BASE}/memories/people`);
    return res.json();
  },

  async createPerson(person: Omit<Person, 'id'>): Promise<Person> {
    const res = await fetchWithAuth(`${API_BASE}/memories/people`, {
      method: 'POST',
      body: JSON.stringify(person)
    });
    return res.json();
  },

  async deletePerson(id: number) {
    await fetchWithAuth(`${API_BASE}/memories/people/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Personal Items ---
  async getItems(): Promise<PersonalItem[]> {
    const res = await fetchWithAuth(`${API_BASE}/memories/items`);
    return res.json();
  },

  async createItem(item: Omit<PersonalItem, 'id'>): Promise<PersonalItem> {
    const res = await fetchWithAuth(`${API_BASE}/memories/items`, {
      method: 'POST',
      body: JSON.stringify(item)
    });
    return res.json();
  },

  async deleteItem(id: number) {
    await fetchWithAuth(`${API_BASE}/memories/items/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Life Events ---
  async getEvents(): Promise<LifeEvent[]> {
    const res = await fetchWithAuth(`${API_BASE}/memories/events`);
    return res.json();
  },

  async createEvent(event: Omit<LifeEvent, 'id'>): Promise<LifeEvent> {
    const res = await fetchWithAuth(`${API_BASE}/memories/events`, {
      method: 'POST',
      body: JSON.stringify(event)
    });
    return res.json();
  },

  async deleteEvent(id: number) {
    await fetchWithAuth(`${API_BASE}/memories/events/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Logs & Analytics ---
  async getLogs(): Promise<InteractionLog[]> {
    const res = await fetchWithAuth(`${API_BASE}/logs`);
    return res.json();
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetchWithAuth(`${API_BASE}/logs/analytics`);
    return res.json();
  },

  async clearLogs() {
    await fetchWithAuth(`${API_BASE}/logs/clear`, {
      method: 'DELETE'
    });
  },

  async getEmergencyProfile(patientId: number): Promise<EmergencyProfile> {
    const res = await fetch(`${API_BASE}/auth/emergency-profile/${patientId}`);
    if (!res.ok) {
      throw new Error('Failed to load emergency profile');
    }
    return res.json();
  },

  async getStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE}/assistant/status`);
    if (!res.ok) {
      throw new Error('Failed to load system status');
    }
    return res.json();
  },

  // =========================================================================
  // GUARDIAN DASHBOARD APIs
  // =========================================================================

  // Section 1: Overview
  async getGuardianOverview(): Promise<OverviewSummary> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/overview`);
    if (!res.ok) throw new Error('Failed to load guardian overview');
    return res.json();
  },

  // Section 2: Patient & Care
  async getPatientProfile(): Promise<PatientProfile> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/patient-profile`);
    if (!res.ok) throw new Error('Failed to fetch patient profile');
    return res.json();
  },

  async updatePatientProfile(data: Partial<PatientProfile>): Promise<PatientProfile> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/patient-profile`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update patient profile');
    return res.json();
  },

  // Medications
  async getGuardianMedications(): Promise<Medication[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/medications`);
    if (!res.ok) throw new Error('Failed to load medications');
    return res.json();
  },

  async createGuardianMedication(data: Partial<Medication>): Promise<Medication> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/medications`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create medication');
    return res.json();
  },

  async updateGuardianMedication(id: number, data: Partial<Medication>): Promise<Medication> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update medication');
    return res.json();
  },

  async deleteGuardianMedication(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/medications/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete medication');
  },

  async recordMedicationIntake(id: number, status: string, notes?: string): Promise<any> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/medications/${id}/record-intake`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    });
    if (!res.ok) throw new Error('Failed to record medication status');
    return res.json();
  },

  // Appointments
  async getGuardianAppointments(): Promise<DoctorAppointment[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/appointments`);
    if (!res.ok) throw new Error('Failed to load appointments');
    return res.json();
  },

  async createGuardianAppointment(data: Partial<DoctorAppointment>): Promise<DoctorAppointment> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/appointments`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create appointment');
    return res.json();
  },

  async updateGuardianAppointment(id: number, data: Partial<DoctorAppointment>): Promise<DoctorAppointment> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update appointment');
    return res.json();
  },

  async deleteGuardianAppointment(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/appointments/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete appointment');
  },

  // Activities & Routines
  async getGuardianActivities(): Promise<DailyRoutine[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/activities`);
    if (!res.ok) throw new Error('Failed to load activities');
    return res.json();
  },

  async createGuardianActivity(data: Partial<DailyRoutine>): Promise<DailyRoutine> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/activities`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create activity');
    return res.json();
  },

  async updateGuardianActivity(id: number, data: Partial<DailyRoutine>): Promise<DailyRoutine> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update activity');
    return res.json();
  },

  async deleteGuardianActivity(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/activities/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete activity');
  },

  async updateActivityStatus(id: number, status: string, notes?: string): Promise<any> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/activities/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    });
    if (!res.ok) throw new Error('Failed to update activity status');
    return res.json();
  },

  // Section 3: Memories
  async getGuardianPeople(): Promise<Person[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/people`);
    if (!res.ok) throw new Error('Failed to load people');
    return res.json();
  },

  async createGuardianPerson(data: Partial<Person>): Promise<Person> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/people`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add person');
    return res.json();
  },

  async updateGuardianPerson(id: number, data: Partial<Person>): Promise<Person> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/people/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update person');
    return res.json();
  },

  async deleteGuardianPerson(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/people/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete person');
  },

  async getGuardianEvents(): Promise<LifeEvent[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/events`);
    if (!res.ok) throw new Error('Failed to load life events');
    return res.json();
  },

  async createGuardianEvent(data: Partial<LifeEvent>): Promise<LifeEvent> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/events`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create life event');
    return res.json();
  },

  async updateGuardianEvent(id: number, data: Partial<LifeEvent>): Promise<LifeEvent> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update life event');
    return res.json();
  },

  async deleteGuardianEvent(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/events/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete life event');
  },

  async getGuardianPlaces(): Promise<FamiliarPlace[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/places`);
    if (!res.ok) throw new Error('Failed to load places');
    return res.json();
  },

  async createGuardianPlace(data: Partial<FamiliarPlace>): Promise<FamiliarPlace> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/places`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add familiar place');
    return res.json();
  },

  async updateGuardianPlace(id: number, data: Partial<FamiliarPlace>): Promise<FamiliarPlace> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/places/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update place');
    return res.json();
  },

  async deleteGuardianPlace(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/places/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete place');
  },

  async getGuardianFacts(): Promise<MemoryFact[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/facts`);
    if (!res.ok) throw new Error('Failed to load memory facts');
    return res.json();
  },

  async createGuardianFact(data: Partial<MemoryFact>): Promise<MemoryFact> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/facts`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add memory fact');
    return res.json();
  },

  async updateGuardianFact(id: number, data: Partial<MemoryFact>): Promise<MemoryFact> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/facts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update memory fact');
    return res.json();
  },

  async deleteGuardianFact(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/facts/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete memory fact');
  },

  // Section 4: Safety & Support
  async getSafeZone(): Promise<SafeZone> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/safe-zone`);
    if (!res.ok) throw new Error('Failed to load safe zone');
    return res.json();
  },

  async updateSafeZone(data: Partial<SafeZone>): Promise<SafeZone> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/safe-zone`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update safe zone');
    return res.json();
  },

  async getLocationHistory(limit = 15): Promise<LocationLog[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/locations?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to load location history');
    return res.json();
  },

  async recordLocation(data: Partial<LocationLog>): Promise<LocationLog> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/locations`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record location');
    return res.json();
  },

  async getSOSAlerts(): Promise<SOSAlert[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/sos`);
    if (!res.ok) throw new Error('Failed to load SOS alerts');
    return res.json();
  },

  async triggerSOS(data: { location_address?: string; latitude?: number; longitude?: number; notes?: string }): Promise<SOSAlert> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/sos/trigger`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to trigger SOS');
    return res.json();
  },

  async acknowledgeSOSAlert(id: number, notes?: string): Promise<SOSAlert> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/sos/acknowledge/${id}`, {
      method: 'POST',
      body: JSON.stringify({ acknowledged_by: 'Guardian', notes })
    });
    if (!res.ok) throw new Error('Failed to acknowledge SOS alert');
    return res.json();
  },

  async resolveSOSAlert(id: number): Promise<SOSAlert> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/sos/resolve/${id}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to resolve SOS alert');
    return res.json();
  },

  async getEmergencyQR(): Promise<EmergencyQR> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/qr`);
    if (!res.ok) throw new Error('Failed to load emergency QR');
    return res.json();
  },

  async updateEmergencyQRStatus(status: 'active' | 'disabled' | 'revoked'): Promise<EmergencyQR> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/qr/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update QR status');
    return res.json();
  },

  async regenerateEmergencyQR(): Promise<EmergencyQR> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/qr/regenerate`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to regenerate emergency QR');
    return res.json();
  },

  async getCareTeam(): Promise<CareTeamMember[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/care-team`);
    if (!res.ok) throw new Error('Failed to load care team');
    return res.json();
  },

  async addCareTeamMember(data: Partial<CareTeamMember>): Promise<CareTeamMember> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/care-team`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add care team member');
    return res.json();
  },

  async updateCareTeamMember(id: number, data: Partial<CareTeamMember>): Promise<CareTeamMember> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/care-team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update care team member');
    return res.json();
  },

  async deleteCareTeamMember(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/care-team/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete care team member');
  },

  async getNotifications(limit = 30): Promise<NotificationItem[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/notifications?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to load notifications');
    return res.json();
  },

  async markNotificationRead(id: number): Promise<void> {
    await fetchWithAuth(`${API_BASE}/guardian/notifications/${id}/read`, {
      method: 'POST'
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetchWithAuth(`${API_BASE}/guardian/notifications/read-all`, {
      method: 'POST'
    });
  },

  // Deadline evaluation engine
  async evaluateActivityDeadlines(gracePeriodMinutes = 30): Promise<{ message: string; missed_count: number }> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/activities/evaluate-deadlines?grace_period_minutes=${gracePeriodMinutes}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to evaluate activity deadlines');
    return res.json();
  },

  // SECTION 2: PATIENT INSIGHTS
  async getGuardianInsights(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<PatientInsightsData> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/insights?timeframe=${timeframe}`);
    if (!res.ok) throw new Error('Failed to load patient insights');
    return res.json();
  },

  async getCaregiverObservations(): Promise<CaregiverObservation[]> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/observations`);
    if (!res.ok) throw new Error('Failed to load caregiver observations');
    return res.json();
  },

  async createCaregiverObservation(data: Partial<CaregiverObservation>): Promise<CaregiverObservation> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/observations`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create observation');
    return res.json();
  },

  async deleteCaregiverObservation(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/guardian/observations/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete observation');
  }
};


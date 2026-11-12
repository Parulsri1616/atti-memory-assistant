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
  SystemStatus
} from '../types';

const API_BASE = '/api';

// In-Memory Access Token Storage (Complies with requirement not to store in persistent browser storage)
let inMemoryAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (inMemoryAccessToken) {
    headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
  }
  return headers;
}

/**
 * Fetch wrapper that attaches Authorization header, includes credentials for HttpOnly refresh cookies,
 * and transparently retries requests on 401 using the refresh token.
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

  // If unauthorized and we haven't already retried, attempt silent refresh
  if (res.status === 401 && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
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
  }
};

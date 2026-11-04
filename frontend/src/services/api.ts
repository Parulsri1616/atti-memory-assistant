import {
  Person,
  DailyRoutine,
  Medication,
  PersonalItem,
  LifeEvent,
  InteractionLog,
  QueryResponse,
  AnalyticsData
} from '../types';

const API_BASE = '/api';

export const api = {
  // Assistant
  async askAssistant(query: string, clientTime?: string): Promise<QueryResponse> {
    const res = await fetch(`${API_BASE}/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        client_time: clientTime || new Date().toISOString()
      })
    });
    if (!res.ok) throw new Error('Failed to query assistant');
    return res.json();
  },

  async getSuggestions(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/assistant/prompt-suggestions`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.suggestions || [];
  },

  async getSystemStatus() {
    const res = await fetch(`${API_BASE}/assistant/status`);
    return res.json();
  },

  // Routines & Current Banner
  async getCurrentBanner(clientTime?: string) {
    const timeParam = encodeURIComponent(clientTime || new Date().toISOString());
    const res = await fetch(`${API_BASE}/routines/current-banner?client_time=${timeParam}`);
    return res.json();
  },

  async getRoutines(): Promise<DailyRoutine[]> {
    const res = await fetch(`${API_BASE}/routines`);
    return res.json();
  },

  async createRoutine(routine: Omit<DailyRoutine, 'id'>): Promise<DailyRoutine> {
    const res = await fetch(`${API_BASE}/routines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routine)
    });
    return res.json();
  },

  async deleteRoutine(id: number) {
    await fetch(`${API_BASE}/routines/${id}`, { method: 'DELETE' });
  },

  // Medications
  async getMedications(): Promise<Medication[]> {
    const res = await fetch(`${API_BASE}/routines/medications`);
    return res.json();
  },

  async createMedication(med: Omit<Medication, 'id'>): Promise<Medication> {
    const res = await fetch(`${API_BASE}/routines/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(med)
    });
    return res.json();
  },

  async deleteMedication(id: number) {
    await fetch(`${API_BASE}/routines/medications/${id}`, { method: 'DELETE' });
  },

  async logMedicationTaken(id: number) {
    const res = await fetch(`${API_BASE}/routines/medications/${id}/log-taken`, { method: 'POST' });
    return res.json();
  },

  // People
  async getPeople(): Promise<Person[]> {
    const res = await fetch(`${API_BASE}/memories/people`);
    return res.json();
  },

  async createPerson(person: Omit<Person, 'id'>): Promise<Person> {
    const res = await fetch(`${API_BASE}/memories/people`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person)
    });
    return res.json();
  },

  async deletePerson(id: number) {
    await fetch(`${API_BASE}/memories/people/${id}`, { method: 'DELETE' });
  },

  // Personal Items
  async getItems(): Promise<PersonalItem[]> {
    const res = await fetch(`${API_BASE}/memories/items`);
    return res.json();
  },

  async createItem(item: Omit<PersonalItem, 'id'>): Promise<PersonalItem> {
    const res = await fetch(`${API_BASE}/memories/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return res.json();
  },

  async deleteItem(id: number) {
    await fetch(`${API_BASE}/memories/items/${id}`, { method: 'DELETE' });
  },

  // Life Events
  async getEvents(): Promise<LifeEvent[]> {
    const res = await fetch(`${API_BASE}/memories/events`);
    return res.json();
  },

  async createEvent(event: Omit<LifeEvent, 'id'>): Promise<LifeEvent> {
    const res = await fetch(`${API_BASE}/memories/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    return res.json();
  },

  async deleteEvent(id: number) {
    await fetch(`${API_BASE}/memories/events/${id}`, { method: 'DELETE' });
  },

  // Logs & Analytics
  async getLogs(): Promise<InteractionLog[]> {
    const res = await fetch(`${API_BASE}/logs`);
    return res.json();
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE}/logs/analytics`);
    return res.json();
  },

  async clearLogs() {
    await fetch(`${API_BASE}/logs/clear`, { method: 'DELETE' });
  }
};

import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Pill,
  MapPin,
  BookOpen,
  Activity,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Phone,
  Clock,
  Sparkles,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import {
  Person,
  DailyRoutine,
  Medication,
  PersonalItem,
  LifeEvent,
  InteractionLog,
  AnalyticsData
} from '../types';

interface CaregiverDashboardProps {
  onBackToPatient: () => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({ onBackToPatient }) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'people' | 'routines' | 'meds' | 'items' | 'events'
  >('analytics');

  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [logs, setLogs] = useState<InteractionLog[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [items, setItems] = useState<PersonalItem[]>([]);
  const [events, setEvents] = useState<LifeEvent[]>([]);

  // Form states for creating new records
  const [showAddModal, setShowAddModal] = useState(false);
  const [personForm, setPersonForm] = useState({ name: '', relationship: '', phone: '', notes: '', visit_schedule: '' });
  const [routineForm, setRoutineForm] = useState({ time: '09:00', title: '', description: '', category: 'activity' });
  const [medForm, setMedForm] = useState({ name: '', dosage: '', schedule_time: '', purpose: '', instructions: '' });
  const [itemForm, setItemForm] = useState({ item_name: '', location: '', notes: '' });
  const [eventForm, setEventForm] = useState({ title: '', date_or_period: '', category: 'memory', description: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [anData, logData, pData, rData, mData, iData, eData] = await Promise.all([
        api.getAnalytics(),
        api.getLogs(),
        api.getPeople(),
        api.getRoutines(),
        api.getMedications(),
        api.getItems(),
        api.getEvents()
      ]);
      setAnalytics(anData);
      setLogs(logData);
      setPeople(pData);
      setRoutines(rData);
      setMeds(mData);
      setItems(iData);
      setEvents(eData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for creating records
  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personForm.name || !personForm.relationship) return;
    await api.createPerson({
      ...personForm,
      keywords: `${personForm.name}, ${personForm.relationship}`
    });
    setPersonForm({ name: '', relationship: '', phone: '', notes: '', visit_schedule: '' });
    setShowAddModal(false);
    loadData();
  };

  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineForm.title || !routineForm.time) return;
    await api.createRoutine({
      ...routineForm,
      day_of_week: 'daily',
      is_active: true
    });
    setRoutineForm({ time: '09:00', title: '', description: '', category: 'activity' });
    setShowAddModal(false);
    loadData();
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.name || !medForm.schedule_time) return;
    await api.createMedication(medForm);
    setMedForm({ name: '', dosage: '', schedule_time: '', purpose: '', instructions: '' });
    setShowAddModal(false);
    loadData();
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.item_name || !itemForm.location) return;
    await api.createItem({
      ...itemForm,
      keywords: itemForm.item_name
    });
    setItemForm({ item_name: '', location: '', notes: '' });
    setShowAddModal(false);
    loadData();
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.description) return;
    await api.createEvent(eventForm);
    setEventForm({ title: '', date_or_period: '', category: 'memory', description: '' });
    setShowAddModal(false);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      {/* Top Caregiver Bar */}
      <header className="bg-sky-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToPatient}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-800 hover:bg-sky-700 text-sky-100 font-bold text-sm transition-colors border border-sky-600/40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Patient View</span>
          </button>
          <div className="h-6 w-px bg-sky-700 mx-1 hidden sm:block" />
          <h2 className="text-xl font-bold tracking-tight">Caregiver Portal — ATTI</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-800 hover:bg-sky-700 rounded-xl text-sm font-semibold text-sky-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 overflow-x-auto shadow-xs">
        <div className="flex gap-1 max-w-6xl mx-auto">
          {[
            { id: 'analytics', label: 'Overview & Activity', icon: Activity },
            { id: 'people', label: 'People & Family', icon: Users },
            { id: 'routines', label: 'Daily Routines', icon: Calendar },
            { id: 'meds', label: 'Medications', icon: Pill },
            { id: 'items', label: 'Personal Items', icon: MapPin },
            { id: 'events', label: 'Reminiscence & Life', icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-sky-600 text-sky-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        {/* --- TAB 1: ANALYTICS & LOGS --- */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Queries
                </div>
                <div className="text-3xl font-extrabold text-slate-800 mt-1">
                  {analytics?.total_queries ?? 0}
                </div>
                <div className="text-xs text-slate-500 mt-1">Spoken or typed interactions</div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Grounded Accuracy
                </div>
                <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {analytics?.grounded_accuracy_pct ?? 100}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Answered from verified memory</div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Fallback Requests
                </div>
                <div className="text-3xl font-extrabold text-amber-600 mt-1">
                  {analytics?.fallback_count ?? 0}
                </div>
                <div className="text-xs text-slate-500 mt-1">Missing memory or gentle fallback</div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Memories
                </div>
                <div className="text-3xl font-extrabold text-sky-600 mt-1">
                  {(analytics?.counts?.people || 0) +
                    (analytics?.counts?.routines || 0) +
                    (analytics?.counts?.medications || 0)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Records available to patient</div>
              </div>
            </div>

            {/* Repetitive Questions & Memory Analysis (Crucial for Dementia care) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-slate-800">
                    Repetitive Questions Detected
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  In dementia care, repeated questions within short periods reveal short-term memory lapses. ATTI tracks these without patient frustration.
                </p>

                {analytics?.repeated_queries && analytics.repeated_queries.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {analytics.repeated_queries.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-200/60"
                      >
                        <span className="text-sm font-semibold text-amber-900">
                          "{r.query}"
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 bg-amber-200 text-amber-900 rounded-full">
                          Asked {r.count} times
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic py-4 text-center">
                    No repeated question patterns yet.
                  </div>
                )}
              </div>

              {/* Unresolved Questions */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-sky-500" />
                  <h3 className="text-lg font-bold text-slate-800">
                    Unanswered Questions (Need Facts)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Questions where ATTI gently said "I am not sure" and avoided guessing. Add facts below to empower the assistant.
                </p>

                {analytics?.unresolved_queries && analytics.unresolved_queries.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {analytics.unresolved_queries.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-3 bg-sky-50/60 rounded-xl border border-sky-200/60"
                      >
                        <span className="text-sm font-medium text-slate-700 truncate mr-2">
                          "{u.query}"
                        </span>
                        <span className="text-xs text-slate-400 shrink-0">
                          {new Date(u.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic py-4 text-center">
                    All user questions were successfully grounded in memory!
                  </div>
                )}
              </div>
            </div>

            {/* Recent Interaction Log Table */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Recent Voice & Text Logs</h3>
                <button
                  onClick={async () => {
                    await api.clearLogs();
                    loadData();
                  }}
                  className="text-xs text-slate-400 hover:text-rose-600 font-semibold"
                >
                  Clear Logs
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase">
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Patient Query</th>
                      <th className="py-2.5 px-3">Intent</th>
                      <th className="py-2.5 px-3">Grounded Answer</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">
                          {log.client_time || new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {log.query_text}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-500">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md font-mono">
                            {log.intent}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs sm:text-sm max-w-xs truncate">
                          {log.response_text}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {log.was_fallback ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              Fallback
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              Grounded
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-400">
                          No interactions recorded yet. Try asking a question in Patient Mode!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: PEOPLE & FAMILY --- */}
        {activeTab === 'people' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">People & Relationships</h3>
                <p className="text-sm text-slate-500">
                  Store family members, doctors, and friends so the patient can recall who they are and when they visit.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Person</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 font-extrabold text-lg flex items-center justify-center">
                          {person.name[0]}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900">{person.name}</div>
                          <div className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
                            {person.relationship}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          await api.deletePerson(person.id);
                          loadData();
                        }}
                        className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                      {person.notes || 'No extra notes provided.'}
                    </p>

                    {person.visit_schedule && (
                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Clock className="w-4 h-4 text-sky-500" />
                        <span>Visit: {person.visit_schedule}</span>
                      </div>
                    )}
                  </div>

                  {person.phone && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: DAILY ROUTINES --- */}
        {activeTab === 'routines' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Daily Routines & Schedules</h3>
                <p className="text-sm text-slate-500">
                  Fixed daily structure reduces dementia anxiety by reassuring the patient what happens next.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Routine</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {routines.map((routine) => (
                <div
                  key={routine.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-sky-50 border border-sky-200 text-sky-800 font-extrabold px-3 py-2 rounded-xl text-center shrink-0">
                      <span className="text-base sm:text-lg block">{routine.time}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-bold text-slate-900">
                          {routine.title}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase bg-slate-100 text-slate-600">
                          {routine.category}
                        </span>
                      </div>
                      {routine.description && (
                        <p className="text-sm text-slate-500 mt-1">{routine.description}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await api.deleteRoutine(routine.id);
                      loadData();
                    }}
                    className="text-slate-300 hover:text-rose-600 transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 4: MEDICATIONS --- */}
        {activeTab === 'meds' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Medication Reminders</h3>
                <p className="text-sm text-slate-500">
                  Prescription reminder details. ATTI reassures the patient when asked "Did I take my medicine?".
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medication</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meds.map((med) => (
                <div
                  key={med.id}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                          <Pill className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900">
                            {med.name} {med.dosage && <span className="text-sm font-normal text-slate-500">({med.dosage})</span>}
                          </div>
                          <div className="text-xs font-semibold text-purple-700">
                            {med.schedule_time}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          await api.deleteMedication(med.id);
                          loadData();
                        }}
                        className="text-slate-300 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 text-sm text-slate-600">
                      <p><span className="font-semibold text-slate-700">Purpose:</span> {med.purpose || 'Daily health maintenance'}</p>
                      <p className="mt-1"><span className="font-semibold text-slate-700">How to take:</span> {med.instructions || 'With water'}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {med.last_taken_date ? `Logged taken: ${med.last_taken_date}` : 'Not logged today'}
                    </span>
                    <button
                      onClick={async () => {
                        await api.logMedicationTaken(med.id);
                        loadData();
                      }}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors"
                    >
                      Mark Taken Today
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 5: PERSONAL ITEMS --- */}
        {activeTab === 'items' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Everyday Items & Locations</h3>
                <p className="text-sm text-slate-500">
                  Elderly individuals frequently misplace glasses, keys, or phones. ATTI gives calm, direct locations.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">{it.item_name}</h4>
                      </div>
                      <button
                        onClick={async () => {
                          await api.deleteItem(it.id);
                          loadData();
                        }}
                        className="text-slate-300 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/50">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        Usual Location
                      </div>
                      <div className="text-sm font-semibold text-slate-800 mt-0.5">
                        {it.location}
                      </div>
                    </div>

                    {it.notes && (
                      <p className="text-xs text-slate-500 mt-2 italic">{it.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 6: REMINISCENCE & LIFE STORIES --- */}
        {activeTab === 'events' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Reminiscence Therapy & Life Stories</h3>
                <p className="text-sm text-slate-500">
                  Long-term memories preserve identity and uplift mood. ATTI conversationally shares these memories when asked.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Memory</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{ev.title}</h4>
                          <span className="text-xs font-semibold text-rose-700">
                            {ev.date_or_period || 'Life Milestone'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          await api.deleteEvent(ev.id);
                          loadData();
                        }}
                        className="text-slate-300 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Dynamic Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Add to {activeTab.toUpperCase()}
            </h3>

            {activeTab === 'people' && (
              <form onSubmit={handleAddPerson} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Full Name (e.g. Rahul)"
                  value={personForm.name}
                  onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g. Son, Doctor, Neighbour)"
                  value={personForm.relationship}
                  onChange={(e) => setPersonForm({ ...personForm, relationship: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone Number (optional)"
                  value={personForm.phone}
                  onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="Visit Schedule (e.g. Every Sunday at 4 PM)"
                  value={personForm.visit_schedule}
                  onChange={(e) => setPersonForm({ ...personForm, visit_schedule: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                />
                <textarea
                  placeholder="Personal Notes (where they live, work, loving memories)"
                  value={personForm.notes}
                  onChange={(e) => setPersonForm({ ...personForm, notes: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm h-20"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                  >
                    Save Person
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'routines' && (
              <form onSubmit={handleAddRoutine} className="flex flex-col gap-3">
                <input
                  type="time"
                  value={routineForm.time}
                  onChange={(e) => setRoutineForm({ ...routineForm, time: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Title (e.g. Afternoon Tea & Rest)"
                  value={routineForm.title}
                  onChange={(e) => setRoutineForm({ ...routineForm, title: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                  required
                />
                <textarea
                  placeholder="Description (helpful details for the patient)"
                  value={routineForm.description}
                  onChange={(e) => setRoutineForm({ ...routineForm, description: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm h-20"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                  >
                    Save Routine
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'meds' && (
              <form onSubmit={handleAddMedication} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Medicine Name (e.g. Amlodipine)"
                  value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 5mg)"
                  value={medForm.dosage}
                  onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="Schedule Time (e.g. 08:30 AM After Breakfast)"
                  value={medForm.schedule_time}
                  onChange={(e) => setMedForm({ ...medForm, schedule_time: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Purpose (e.g. For Blood Pressure)"
                  value={medForm.purpose}
                  onChange={(e) => setMedForm({ ...medForm, purpose: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                />
                <textarea
                  placeholder="Instructions (e.g. Take 1 tablet with warm water)"
                  value={medForm.instructions}
                  onChange={(e) => setMedForm({ ...medForm, instructions: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm h-16"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                  >
                    Save Medication
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'items' && (
              <form onSubmit={handleAddItem} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Item Name (e.g. Reading Glasses, Keys)"
                  value={itemForm.item_name}
                  onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Location (e.g. On the bedside table in the blue case)"
                  value={itemForm.location}
                  onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                  required
                />
                <textarea
                  placeholder="Additional notes"
                  value={itemForm.notes}
                  onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm h-16"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                  >
                    Save Item
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'events' && (
              <form onSubmit={handleAddEvent} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Title (e.g. Teaching at Delhi University)"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Period / Year (e.g. 1980 - 2012)"
                  value={eventForm.date_or_period}
                  onChange={(e) => setEventForm({ ...eventForm, date_or_period: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm"
                />
                <textarea
                  placeholder="Story / Memory (written warmly so ATTI can share it)"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="px-3 py-2 border rounded-xl text-sm h-24"
                  required
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                  >
                    Save Memory
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

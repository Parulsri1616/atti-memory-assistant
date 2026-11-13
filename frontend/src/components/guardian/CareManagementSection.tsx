import React, { useState, useEffect } from 'react';
import {
  Pill,
  Calendar,
  Activity,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Save,
  Check,
  X,
  RefreshCw,
  Heart,
  Droplet,
  Coffee,
  Footprints,
  Dumbbell,
  Moon,
  Users,
  CheckCircle2,
  History,
  AlertCircle,
  MapPin
} from 'lucide-react';
import {
  PatientProfile,
  Medication,
  DoctorAppointment,
  DailyRoutine
} from '../../types';
import {
  DEMO_MEDICATIONS,
  DEMO_APPOINTMENTS,
  DEMO_ACTIVITIES
} from '../../services/demoData';

interface CareManagementSectionProps {
  initialSubTab?: string;
  currentSubTab?: 'medications' | 'appointments' | 'activities' | 'refills';
  onSelectSubTab?: (tab: 'medications' | 'appointments' | 'activities' | 'refills') => void;
  patient: PatientProfile;
  medications: Medication[];
  appointments: DoctorAppointment[];
  activities: DailyRoutine[];
  onCreateMedication: (data: Partial<Medication>) => Promise<void>;
  onUpdateMedication: (id: number, data: Partial<Medication>) => Promise<void>;
  onDeleteMedication: (id: number) => Promise<void>;
  onRecordMedIntake: (medId: number, status: string, notes?: string) => Promise<void>;
  onCreateAppointment: (data: Partial<DoctorAppointment>) => Promise<void>;
  onUpdateAppointment: (id: number, data: Partial<DoctorAppointment>) => Promise<void>;
  onDeleteAppointment: (id: number) => Promise<void>;
  onCreateActivity: (data: Partial<DailyRoutine>) => Promise<void>;
  onUpdateActivity: (id: number, data: Partial<DailyRoutine>) => Promise<void>;
  onDeleteActivity: (id: number) => Promise<void>;
  onUpdateActivityStatus: (id: number, status: string, notes?: string) => Promise<void>;
  isDark?: boolean;
}

export const CareManagementSection: React.FC<CareManagementSectionProps> = ({
  initialSubTab = 'medications',
  currentSubTab,
  onSelectSubTab,
  patient,
  medications: rawMedications,
  appointments: rawAppointments,
  activities: rawActivities,
  onCreateMedication,
  onUpdateMedication,
  onDeleteMedication,
  onRecordMedIntake,
  onCreateAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onCreateActivity,
  onUpdateActivity,
  onDeleteActivity,
  onUpdateActivityStatus,
  isDark = true
}) => {
  const isDemo = Boolean(
    patient?.is_demo ||
    patient?.email?.includes('demo') ||
    patient?.id === 1 ||
    (typeof window !== 'undefined' && (localStorage.getItem('atti_is_demo') === 'true' || sessionStorage.getItem('atti_is_demo') === 'true'))
  );

  const medications = (rawMedications && rawMedications.length > 0) ? rawMedications : (isDemo ? DEMO_MEDICATIONS : []);
  const appointments = (rawAppointments && rawAppointments.length > 0) ? rawAppointments : (isDemo ? DEMO_APPOINTMENTS : []);
  const activities = (rawActivities && rawActivities.length > 0) ? rawActivities : (isDemo ? DEMO_ACTIVITIES : []);

  const validCareTabs = ['medications', 'appointments', 'activities', 'refills'];
  const [internalSubTab, setInternalSubTab] = useState<'medications' | 'appointments' | 'activities' | 'refills'>(
    initialSubTab && validCareTabs.includes(initialSubTab) ? (initialSubTab as any) : 'medications'
  );
  const subTab = currentSubTab || internalSubTab;
  const setSubTab = (tab: 'medications' | 'appointments' | 'activities' | 'refills') => {
    setInternalSubTab(tab);
    onSelectSubTab?.(tab);
  };

  useEffect(() => {
    if (initialSubTab && validCareTabs.includes(initialSubTab)) {
      setInternalSubTab(initialSubTab as any);
    } else if (!initialSubTab && !currentSubTab) {
      setInternalSubTab('medications');
    }
  }, [initialSubTab, currentSubTab]);

  // Medication modal state
  const [showMedModal, setShowMedModal] = useState(false);
  const [editingMedId, setEditingMedId] = useState<number | null>(null);
  const [medForm, setMedForm] = useState<Partial<Medication>>({
    name: '',
    dosage: '1 tablet',
    schedule_time: '09:00 AM',
    instructions: 'Take after meals with water',
    purpose: '',
    frequency: 'Every day',
    timing_slot: 'Morning',
    current_stock: 30,
    refill_threshold: 5,
    refill_reminder_days: 5,
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  // Appointment modal state
  const [showApptModal, setShowApptModal] = useState(false);
  const [editingApptId, setEditingApptId] = useState<number | null>(null);
  const [apptForm, setApptForm] = useState<Partial<DoctorAppointment>>({
    doctor_name: '',
    clinic_or_hospital: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '11:00 AM',
    notes: '',
    advance_reminder_hours: 24
  });

  // Activity modal state
  const [showActModal, setShowActModal] = useState(false);
  const [editingActId, setEditingActId] = useState<number | null>(null);
  const [actForm, setActForm] = useState<Partial<DailyRoutine>>({
    time: '10:00',
    title: '',
    description: '',
    category: 'activity',
    repeat_frequency: 'Daily',
    day_of_week: 'daily',
    status: 'scheduled',
    reminder_minutes_before: 15
  });

  // Intake status modal
  const [intakeModalMed, setIntakeModalMed] = useState<Medication | null>(null);
  const [intakeNotes, setIntakeNotes] = useState('');

  // Handle Med Submit
  const handleMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMedId) {
      await onUpdateMedication(editingMedId, medForm);
    } else {
      await onCreateMedication(medForm);
    }
    setShowMedModal(false);
    setEditingMedId(null);
  };

  // Handle Appt Submit
  const handleApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApptId) {
      await onUpdateAppointment(editingApptId, apptForm);
    } else {
      await onCreateAppointment(apptForm);
    }
    setShowApptModal(false);
    setEditingApptId(null);
  };

  // Handle Act Submit
  const handleActSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingActId) {
      await onUpdateActivity(editingActId, actForm);
    } else {
      await onCreateActivity(actForm);
    }
    setShowActModal(false);
    setEditingActId(null);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'meal': return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'water': return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'walk': return <Footprints className="w-4 h-4 text-emerald-500" />;
      case 'exercise': return <Dumbbell className="w-4 h-4 text-indigo-500" />;
      case 'sleep': return <Moon className="w-4 h-4 text-purple-500" />;
      case 'visit': return <Users className="w-4 h-4 text-pink-500" />;
      case 'medication': return <Pill className="w-4 h-4 text-rose-500" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Location / Status Badge matching Patient View container top */}
      <div className={`flex items-center justify-between px-1 text-xs font-semibold ${
        isDark ? 'text-slate-300' : 'text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-[#5E58E7] dark:text-indigo-400 flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <span>Home • Caregiver Ananya Sharma Connected for {patient.name}</span>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
          isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-[#5E58E7] border border-indigo-200/60'
        }`}>
          {subTab === 'medications' && `Medications (${medications.length})`}
          {subTab === 'appointments' && `Doctor Visits (${appointments.length})`}
          {subTab === 'activities' && `Daily Routines (${activities.length})`}
          {subTab === 'refills' && `Refills & Stock (${medications.filter(m => (m.current_stock ?? 30) <= (m.refill_threshold ?? 5)).length} Low)`}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* SUBSECTION A: MEDICATION MANAGEMENT                                       */}
      {/* ========================================================================= */}
      {subTab === 'medications' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Pill className="w-5 h-5 text-indigo-500" />
                Medication Management & Stock Tracking
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Configure schedules, dosage instructions, purchase/refill alerts, and track acknowledged vs confirmed intake.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingMedId(null);
                setMedForm({
                  name: '',
                  dosage: '1 tablet',
                  schedule_time: '09:00 AM',
                  instructions: 'Take after meals with water',
                  purpose: '',
                  frequency: 'Every day',
                  timing_slot: 'Morning',
                  current_stock: 30,
                  refill_threshold: 5,
                  refill_reminder_days: 5,
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: ''
                });
                setShowMedModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Medication
            </button>
          </div>

          {/* Medication Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => {
              const isStockLow = med.current_stock !== undefined && med.refill_threshold !== undefined && med.current_stock <= med.refill_threshold;
              return (
                <div
                  key={med.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isStockLow
                      ? isDark
                        ? 'bg-amber-950/20 border-amber-500/40 text-slate-100'
                        : 'bg-amber-50/80 border-amber-300 text-slate-900 shadow-xs'
                      : isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-100'
                        : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-[#5E58E7]'
                      }`}>
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{med.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDark ? 'bg-slate-800 text-indigo-300' : 'bg-indigo-50 text-[#5E58E7]'
                          }`}>
                            {med.dosage || '1 dose'}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{med.instructions}</p>
                        {med.purpose && (
                          <p className={`text-[11px] mt-0.5 italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Purpose: {med.purpose}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingMedId(med.id);
                          setMedForm(med);
                          setShowMedModal(true);
                        }}
                        className={`p-2 rounded-xl transition-all border cursor-pointer ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                        }`}
                        title="Edit Medication"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMedication(med.id)}
                        className={`p-2 rounded-xl transition-all border cursor-pointer ${
                          isDark ? 'bg-rose-950/40 hover:bg-rose-900 text-rose-300 border-rose-800/40' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                        }`}
                        title="Delete Medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'} flex flex-wrap items-center justify-between text-xs gap-2`}>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <Clock className="w-3.5 h-3.5 text-[#5E58E7]" />
                        {med.schedule_time} ({med.timing_slot || 'Daily'})
                      </span>
                      <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {med.frequency || 'Every day'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isStockLow
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 font-black'
                          : isDark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        Stock: {med.current_stock ?? 30} left {isStockLow && '(Refill Alert!)'}
                      </span>

                      <button
                        onClick={() => {
                          setIntakeModalMed(med);
                          setIntakeNotes('');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                          med.last_status === 'completed'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : med.last_status === 'acknowledged'
                            ? 'bg-sky-600 text-white border-sky-500'
                            : isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {med.last_status === 'completed'
                          ? '✓ Confirmed Taken'
                          : med.last_status === 'acknowledged'
                          ? 'Ack. (Pending Taken)'
                          : 'Update Intake'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {medications.length === 0 && (
            <div className={`p-8 rounded-3xl border text-center ${
              isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
            }`}>
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
              <p className="text-sm font-semibold">No medication reminders configured yet.</p>
              <p className="text-xs mt-1">Configure scheduled medicines, dosages, and refill alerts above.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION B: DOCTOR'S APPOINTMENTS                                       */}
      {/* ========================================================================= */}
      {subTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Calendar className="w-5 h-5 text-sky-500" />
                Doctor's Appointments & Follow-up Reminders
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Schedule clinical visits, consultations, and configure advance reminders (24h/2h prior) for both patient and guardian.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingApptId(null);
                setApptForm({
                  doctor_name: '',
                  clinic_or_hospital: '',
                  appointment_date: new Date().toISOString().split('T')[0],
                  appointment_time: '11:00 AM',
                  notes: '',
                  advance_reminder_hours: 24
                });
                setShowApptModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Schedule Appointment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-50 text-sky-600'
                    }`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{appt.doctor_name}</h4>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{appt.clinic_or_hospital}</p>
                      {appt.notes && <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{appt.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingApptId(appt.id);
                        setApptForm(appt);
                        setShowApptModal(true);
                      }}
                      className={`p-2 rounded-xl transition-all border cursor-pointer ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      }`}
                      title="Edit Appointment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAppointment(appt.id)}
                      className={`p-2 rounded-xl transition-all border cursor-pointer ${
                        isDark ? 'bg-rose-950/40 hover:bg-rose-900 text-rose-300 border-rose-800/40' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                      }`}
                      title="Cancel Appointment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'} flex items-center justify-between text-xs`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#5E58E7] dark:text-indigo-400">{appt.appointment_date}</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>at {appt.appointment_time}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    Reminder {appt.advance_reminder_hours || 24}h prior
                  </span>
                </div>
              </div>
            ))}
          </div>

          {appointments.length === 0 && (
            <div className={`p-8 rounded-3xl border text-center ${
              isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
            }`}>
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-sky-400" />
              <p className="text-sm font-semibold">No appointments scheduled.</p>
              <p className="text-xs mt-1">Schedule clinic visits and consultations with automatic 24h & 2h advance reminders.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION C: DAILY ACTIVITIES & ROUTINES                                  */}
      {/* ========================================================================= */}
      {subTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Activity className="w-5 h-5 text-emerald-500" />
                Daily Activities & Routines Schedule
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Create and manage meals, hydration, walks, sleep, and visits that synchronize with the patient's routine panel.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingActId(null);
                setActForm({
                  time: '10:00',
                  title: '',
                  description: '',
                  category: 'activity',
                  repeat_frequency: 'Daily',
                  day_of_week: 'daily',
                  status: 'scheduled',
                  reminder_minutes_before: 15
                });
                setShowActModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
                  isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-slate-800' : 'bg-slate-100'
                  }`}>
                    {getCategoryIcon(act.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{act.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {act.category}
                      </span>
                    </div>
                    {act.description && <p className={`text-xs mt-0.5 truncate max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{act.description}</p>}
                    <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {act.repeat_frequency || 'Daily'} • Reminder {act.reminder_minutes_before || 15}m prior
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>{act.time}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      act.status === 'completed'
                        ? 'text-emerald-500'
                        : act.status === 'acknowledged'
                        ? 'text-sky-500'
                        : act.status === 'missed'
                        ? 'text-rose-500'
                        : 'text-amber-500'
                    }`}>
                      {act.status || 'scheduled'}
                    </span>
                  </div>

                  {/* Status Toggle Quick Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateActivityStatus(act.id, act.status === 'completed' ? 'scheduled' : 'completed')}
                      className={`p-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                        act.status === 'completed'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : isDark
                            ? 'bg-slate-800 hover:bg-emerald-950 text-slate-300 border-slate-700'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border-slate-300'
                      }`}
                      title={act.status === 'completed' ? 'Mark Scheduled' : 'Mark Completed'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 border-l pl-2 border-slate-300 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setEditingActId(act.id);
                        setActForm(act);
                        setShowActModal(true);
                      }}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title="Edit Activity"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        isDark ? 'bg-rose-950/40 text-rose-300 border-rose-800/40' : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}
                      title="Delete Activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activities.length === 0 && (
            <div className={`p-8 rounded-3xl border text-center ${
              isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
            }`}>
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-400" />
              <p className="text-sm font-semibold">No daily activities scheduled.</p>
              <p className="text-xs mt-1">Add routine meals, walks, hydration, and exercise reminders to guide the patient's day.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION D: STOCK REFILLS & INVENTORY TRACKING                          */}
      {/* ========================================================================= */}
      {subTab === 'refills' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Medication Stock & Refill Tracking
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Monitor pill supplies, set safety refill thresholds, and log restocks to prevent medication gaps.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingMedId(null);
                setMedForm({
                  name: '',
                  dosage: '1 tablet',
                  schedule_time: '09:00 AM',
                  instructions: 'Take after meals with water',
                  purpose: '',
                  frequency: 'Every day',
                  timing_slot: 'Morning',
                  current_stock: 30,
                  refill_threshold: 5,
                  refill_reminder_days: 5,
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: ''
                });
                setShowMedModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Prescription
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tracked Prescriptions</span>
                <Pill className="w-4 h-4 text-indigo-400" />
              </div>
              <p className={`text-2xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{medications.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Active monitoring</p>
            </div>

            <div className={`p-4 rounded-2xl border ${
              medications.filter(m => (m.current_stock ?? 30) <= (m.refill_threshold ?? 5)).length > 0
                ? isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50/80 border-amber-200'
                : isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Low Stock Alerts</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black mt-2 text-amber-500">
                {medications.filter(m => (m.current_stock ?? 30) <= (m.refill_threshold ?? 5)).length}
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">Require pharmacy refill</p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sufficiently Stocked</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className={`text-2xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {medications.filter(m => (m.current_stock ?? 30) > (m.refill_threshold ?? 5)).length}
              </p>
              <p className="text-[11px] text-emerald-500 mt-0.5 font-medium">Safe inventory supply</p>
            </div>
          </div>

          {/* Refill Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => {
              const currentStock = med.current_stock ?? 30;
              const threshold = med.refill_threshold ?? 5;
              const isLow = currentStock <= threshold;
              const percentage = Math.min(100, Math.round((currentStock / Math.max(30, currentStock)) * 100));

              return (
                <div
                  key={med.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isLow
                      ? isDark
                        ? 'bg-amber-950/20 border-amber-500/40 text-slate-100 shadow-md'
                        : 'bg-amber-50/90 border-amber-300 text-slate-900 shadow-sm'
                      : isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-100'
                        : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isLow
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-400/40'
                          : isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-[#5E58E7]'
                      }`}>
                        {isLow ? <AlertTriangle className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{med.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLow
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-400/30'
                              : isDark ? 'bg-slate-800 text-indigo-300' : 'bg-indigo-50 text-[#5E58E7]'
                          }`}>
                            {med.dosage || '1 dose'}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Scheduled: {med.schedule_time} ({med.frequency || 'Daily'})
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                      isLow
                        ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    }`}>
                      {currentStock} units left
                    </span>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Supply Level</span>
                      <span className={isLow ? 'text-rose-500 font-bold' : isDark ? 'text-slate-300' : 'text-slate-700'}>
                        {isLow ? `Refill Alert (≤ ${threshold})` : `${currentStock} available`}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLow ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                        }`}
                        style={{ width: `${Math.max(8, percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Refill Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Alert threshold: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{threshold}</strong> pills
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={async () => {
                          await onUpdateMedication(med.id, { current_stock: currentStock + 10 });
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 text-[#5E58E7] dark:text-indigo-300 active:scale-95 transition-all cursor-pointer"
                        title="Add 10 pills to stock"
                      >
                        +10 Units
                      </button>
                      <button
                        onClick={async () => {
                          await onUpdateMedication(med.id, { current_stock: currentStock + 30 });
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#5E58E7] hover:bg-[#5049D6] text-white active:scale-95 transition-all shadow-xs cursor-pointer"
                        title="Add 30 pills (Full Pack)"
                      >
                        +30 Pack
                      </button>
                      <button
                        onClick={() => {
                          setEditingMedId(med.id);
                          setMedForm({
                            name: med.name,
                            dosage: med.dosage || '',
                            schedule_time: med.schedule_time,
                            instructions: med.instructions || '',
                            purpose: med.purpose || '',
                            frequency: med.frequency || 'Every day',
                            timing_slot: med.timing_slot || 'Morning',
                            current_stock: med.current_stock ?? 30,
                            refill_threshold: med.refill_threshold ?? 5,
                            refill_reminder_days: med.refill_reminder_days ?? 5,
                            start_date: med.start_date || '',
                            end_date: med.end_date || ''
                          });
                          setShowMedModal(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                        title="Edit prescription & thresholds"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {medications.length === 0 && (
            <div className={`p-8 rounded-3xl border text-center ${
              isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
            }`}>
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
              <p className="text-sm font-semibold">No prescriptions registered for stock tracking.</p>
              <p className="text-xs mt-1">Add medications with schedule times and stock counts to track refills.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT MEDICATION                                              */}
      {/* ========================================================================= */}
      {showMedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-500" />
                {editingMedId ? 'Edit Medication Reminder' : 'Add Medication Reminder'}
              </h3>
              <button onClick={() => setShowMedModal(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMedSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={medForm.name || ''}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  placeholder="e.g. Metformin, Donepezil"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medForm.dosage || ''}
                    onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                    placeholder="1 tablet (500mg)"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Schedule Time *</label>
                  <input
                    type="text"
                    required
                    value={medForm.schedule_time || ''}
                    onChange={(e) => setMedForm({ ...medForm, schedule_time: e.target.value })}
                    placeholder="09:00 AM"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Timing Slot</label>
                  <select
                    value={medForm.timing_slot || 'Morning'}
                    onChange={(e) => setMedForm({ ...medForm, timing_slot: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Frequency</label>
                  <select
                    value={medForm.frequency || 'Every day'}
                    onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Every day">Every day</option>
                    <option value="Twice a day">Twice a day</option>
                    <option value="Alternate days">Alternate days</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Instructions</label>
                <input
                  type="text"
                  value={medForm.instructions || ''}
                  onChange={(e) => setMedForm({ ...medForm, instructions: e.target.value })}
                  placeholder="Take after breakfast with full glass of water"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Stock and Refill Thresholds */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/30">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={medForm.current_stock ?? 30}
                    onChange={(e) => setMedForm({ ...medForm, current_stock: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Refill Threshold</label>
                  <input
                    type="number"
                    value={medForm.refill_threshold ?? 5}
                    onChange={(e) => setMedForm({ ...medForm, refill_threshold: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Alert Days Prior</label>
                  <input
                    type="number"
                    value={medForm.refill_reminder_days ?? 5}
                    onChange={(e) => setMedForm({ ...medForm, refill_reminder_days: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMedModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] text-white rounded-xl text-xs font-bold active:scale-95 shadow-md shadow-indigo-500/20"
                >
                  {editingMedId ? 'Save Changes' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INTAKE RECORDING MODAL                                             */}
      {/* ========================================================================= */}
      {intakeModalMed && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 w-full max-w-md shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-500" />
                Record Medication Status
              </h3>
              <button onClick={() => setIntakeModalMed(null)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Separately track reminder notification acknowledgement vs patient confirmed intake for <strong className="text-slate-900 dark:text-white">{intakeModalMed.name}</strong> ({intakeModalMed.dosage}).
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1">Optional Notes / Observation</label>
              <input
                type="text"
                value={intakeNotes}
                onChange={(e) => setIntakeNotes(e.target.value)}
                placeholder="e.g. Patient took medicine with warm milk"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={async () => {
                  await onRecordMedIntake(intakeModalMed.id, 'completed', intakeNotes || 'Confirmed taken by caregiver/patient');
                  setIntakeModalMed(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Medicine Taken (Decrements Stock)
              </button>

              <button
                type="button"
                onClick={async () => {
                  await onRecordMedIntake(intakeModalMed.id, 'acknowledged', intakeNotes || 'Reminder acknowledged by patient');
                  setIntakeModalMed(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Mark Reminder Acknowledged (Pending Intake)
              </button>

              <button
                type="button"
                onClick={async () => {
                  await onRecordMedIntake(intakeModalMed.id, 'missed', intakeNotes || 'Marked missed by guardian');
                  setIntakeModalMed(null);
                }}
                className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
                  isDark ? 'bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900' : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                Mark as Missed Intake
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DOCTOR'S APPOINTMENT                                    */}
      {/* ========================================================================= */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" />
                {editingApptId ? 'Edit Doctor Appointment' : 'Schedule Doctor Appointment'}
              </h3>
              <button onClick={() => setShowApptModal(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={apptForm.doctor_name || ''}
                  onChange={(e) => setApptForm({ ...apptForm, doctor_name: e.target.value })}
                  placeholder="e.g. Dr. Ramesh Nair"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Clinic or Hospital *</label>
                <input
                  type="text"
                  required
                  value={apptForm.clinic_or_hospital || ''}
                  onChange={(e) => setApptForm({ ...apptForm, clinic_or_hospital: e.target.value })}
                  placeholder="e.g. AIIMS New Delhi, Max Healthcare"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={apptForm.appointment_date || ''}
                    onChange={(e) => setApptForm({ ...apptForm, appointment_date: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Time *</label>
                  <input
                    type="text"
                    required
                    value={apptForm.appointment_time || ''}
                    onChange={(e) => setApptForm({ ...apptForm, appointment_time: e.target.value })}
                    placeholder="10:30 AM"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Advance Reminder (Hours Prior)</label>
                <select
                  value={apptForm.advance_reminder_hours || 24}
                  onChange={(e) => setApptForm({ ...apptForm, advance_reminder_hours: parseInt(e.target.value) || 24 })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value={2}>2 Hours Prior</option>
                  <option value={12}>12 Hours Prior</option>
                  <option value={24}>24 Hours Prior (1 Day)</option>
                  <option value={48}>48 Hours Prior (2 Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Appointment Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={apptForm.notes || ''}
                  onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })}
                  placeholder="e.g. Bring previous blood work and MRI scans"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApptModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] text-white rounded-xl text-xs font-bold active:scale-95 shadow-md shadow-indigo-500/20"
                >
                  {editingApptId ? 'Update Appointment' : 'Save Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DAILY ACTIVITY                                          */}
      {/* ========================================================================= */}
      {showActModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                {editingActId ? 'Edit Daily Activity' : 'Add Daily Activity'}
              </h3>
              <button onClick={() => setShowActModal(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleActSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={actForm.title || ''}
                  onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                  placeholder="e.g. Morning Walk, Lunch & Rest, Evening Tea"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={actForm.category || 'activity'}
                    onChange={(e) => setActForm({ ...actForm, category: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="meal">Meal / Nutrition</option>
                    <option value="water">Hydration / Water</option>
                    <option value="walk">Walking</option>
                    <option value="exercise">Exercise / Yoga</option>
                    <option value="sleep">Sleep / Rest</option>
                    <option value="visit">Family Visit</option>
                    <option value="activity">General Activity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Scheduled Time *</label>
                  <input
                    type="text"
                    required
                    value={actForm.time || ''}
                    onChange={(e) => setActForm({ ...actForm, time: e.target.value })}
                    placeholder="07:30"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Repeat Frequency</label>
                  <select
                    value={actForm.repeat_frequency || 'Daily'}
                    onChange={(e) => setActForm({ ...actForm, repeat_frequency: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Specific Day">Specific Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Reminder Prior (Minutes)</label>
                  <input
                    type="number"
                    value={actForm.reminder_minutes_before ?? 15}
                    onChange={(e) => setActForm({ ...actForm, reminder_minutes_before: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description / Care Instructions</label>
                <textarea
                  rows={2}
                  value={actForm.description || ''}
                  onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
                  placeholder="e.g. Gentle 20-minute stroll in the courtyard"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] text-white rounded-xl text-xs font-bold active:scale-95 shadow-md shadow-indigo-500/20"
                >
                  {editingActId ? 'Update Activity' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

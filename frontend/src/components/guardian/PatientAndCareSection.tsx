import React, { useState } from 'react';
import {
  User,
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
  Users
} from 'lucide-react';
import {
  PatientProfile,
  Medication,
  DoctorAppointment,
  DailyRoutine
} from '../../types';

interface PatientAndCareSectionProps {
  initialSubTab?: string;
  patient: PatientProfile;
  medications: Medication[];
  appointments: DoctorAppointment[];
  activities: DailyRoutine[];
  onUpdatePatientProfile: (data: Partial<PatientProfile>) => Promise<void>;
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

export const PatientAndCareSection: React.FC<PatientAndCareSectionProps> = ({
  initialSubTab = 'profile',
  patient,
  medications,
  appointments,
  activities,
  onUpdatePatientProfile,
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
  const [subTab, setSubTab] = useState<'profile' | 'medications' | 'appointments' | 'activities'>(
    (initialSubTab as any) || 'profile'
  );

  // Form states
  const [profileForm, setProfileForm] = useState<Partial<PatientProfile>>({
    name: patient.name,
    call_sign: patient.call_sign,
    age: patient.age || 72,
    date_of_birth: patient.date_of_birth || '',
    address: patient.address || '',
    preferred_language: patient.preferred_language || 'English / Hindi',
    medical_conditions: patient.medical_conditions || '',
    allergies: patient.allergies || '',
    blood_group: patient.blood_group || '',
    emergency_contact_phone: patient.emergency_contact_phone || '',
    emergency_contact_relation: patient.emergency_contact_relation || '',
    doctor_name: patient.doctor_name || '',
    doctor_phone: patient.doctor_phone || '',
    doctor_clinic: patient.doctor_clinic || '',
    communication_preferences: patient.communication_preferences || '',
    care_instructions: patient.care_instructions || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

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
    refill_reminder_days: 5
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

  // Handle Profile Submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await onUpdatePatientProfile(profileForm);
      setProfileSuccessMsg(true);
      setTimeout(() => setProfileSuccessMsg(false), 3000);
    } finally {
      setProfileSaving(false);
    }
  };

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
    switch (cat) {
      case 'meal': return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'water': return <Droplet className="w-4 h-4 text-sky-400" />;
      case 'walk': return <Footprints className="w-4 h-4 text-emerald-400" />;
      case 'exercise': return <Dumbbell className="w-4 h-4 text-indigo-400" />;
      case 'sleep': return <Moon className="w-4 h-4 text-purple-400" />;
      case 'visit': return <Users className="w-4 h-4 text-pink-400" />;
      case 'medication': return <Pill className="w-4 h-4 text-rose-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtab Navigation Pills */}
      <div className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-200/70 border-slate-300/80'
      }`}>
        <button
          onClick={() => setSubTab('profile')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            subTab === 'profile'
              ? isDark
                ? 'bg-[#5E58E7] text-white shadow-xs'
                : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          A. Patient Profile
        </button>

        <button
          onClick={() => setSubTab('medications')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            subTab === 'medications'
              ? isDark
                ? 'bg-[#5E58E7] text-white shadow-xs'
                : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4" />
          B. Medication Management ({medications.length})
        </button>

        <button
          onClick={() => setSubTab('appointments')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            subTab === 'appointments'
              ? isDark
                ? 'bg-[#5E58E7] text-white shadow-xs'
                : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          C. Doctor Appointments ({appointments.length})
        </button>

        <button
          onClick={() => setSubTab('activities')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            subTab === 'activities'
              ? isDark
                ? 'bg-[#5E58E7] text-white shadow-xs'
                : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          D. Daily Activities & Routines ({activities.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBSECTION A: PATIENT PROFILE */}
      {/* ========================================================================= */}
      {subTab === 'profile' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-sky-400" />
                Comprehensive Patient Profile & Care Settings
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Manage personal info, medical background, primary doctor contact, and communication preferences.
              </p>
            </div>
            {profileSuccessMsg && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Changes Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Call Sign / Honorific</label>
                <input
                  type="text"
                  value={profileForm.call_sign || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, call_sign: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age & Date of Birth</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={profileForm.age || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, age: parseInt(e.target.value, 10) || undefined })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    placeholder="Age"
                  />
                  <input
                    type="text"
                    value={profileForm.date_of_birth || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    placeholder="14 Aug 1954"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Home Address</label>
                <input
                  type="text"
                  value={profileForm.address || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Language</label>
                <input
                  type="text"
                  value={profileForm.preferred_language || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, preferred_language: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  placeholder="English / Hindi"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Blood Group</label>
                <input
                  type="text"
                  value={profileForm.blood_group || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  placeholder="B+"
                />
              </div>
            </div>

            {/* Medical conditions and Allergies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Medical Conditions</label>
                <textarea
                  rows={2}
                  value={profileForm.medical_conditions || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, medical_conditions: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Allergies</label>
                <textarea
                  rows={2}
                  value={profileForm.allergies || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Doctor Info & Emergency Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Doctor Name</label>
                <input
                  type="text"
                  value={profileForm.doctor_name || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, doctor_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Doctor Contact Phone</label>
                <input
                  type="text"
                  value={profileForm.doctor_phone || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, doctor_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hospital / Clinic</label>
                <input
                  type="text"
                  value={profileForm.doctor_clinic || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, doctor_clinic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Emergency Contact Phone & Relation</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={profileForm.emergency_contact_phone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    placeholder="+91 98765 12345"
                  />
                  <input
                    type="text"
                    value={profileForm.emergency_contact_relation || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_relation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    placeholder="Daughter"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Communication Preferences</label>
                <input
                  type="text"
                  value={profileForm.communication_preferences || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, communication_preferences: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  placeholder="Voice-first, calm tone, clear short sentences"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Care Instructions & De-escalation Notes</label>
              <textarea
                rows={2}
                value={profileForm.care_instructions || ''}
                onChange={(e) => setProfileForm({ ...profileForm, care_instructions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {profileSaving ? 'Saving...' : 'Save Patient Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION B: MEDICATION MANAGEMENT */}
      {/* ========================================================================= */}
      {subTab === 'medications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-400" />
                Medication Management & Stock Tracking
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure schedules, instructions, stock refill alerts, and track patient intake status.
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
                  refill_reminder_days: 5
                });
                setShowMedModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-950/40"
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
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{med.name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                            {med.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-sky-400 font-medium mt-0.5">{med.schedule_time} • {med.frequency || 'Daily'}</p>
                        {med.purpose && <p className="text-[11px] text-slate-400 mt-1">{med.purpose}</p>}
                        {med.instructions && <p className="text-[11px] text-slate-500 mt-0.5 italic">{med.instructions}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingMedId(med.id);
                          setMedForm({ ...med });
                          setShowMedModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit Medication"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMedication(med.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300"
                        title="Delete Medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stock & Status Strip */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 font-semibold ${isStockLow ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                        Stock: {med.current_stock ?? 30} tabs
                        {isStockLow && <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-md">Refill Soon</span>}
                      </span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-400">
                        Status:{' '}
                        <span className={`font-semibold ${
                          med.last_status === 'completed'
                            ? 'text-emerald-400'
                            : med.last_status === 'acknowledged'
                            ? 'text-sky-400'
                            : med.last_status === 'missed'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}>
                          {med.last_status || 'Pending'}
                        </span>
                      </span>
                    </div>

                    {/* Quick status logger button */}
                    <button
                      onClick={() => {
                        setIntakeModalMed(med);
                        setIntakeNotes('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-[11px] font-semibold border border-slate-700"
                    >
                      Update Intake &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION C: DOCTOR'S APPOINTMENTS */}
      {/* ========================================================================= */}
      {subTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" />
                Doctor's Consultations & Clinic Visits
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Schedule consultations, advance reminders, and track physician reviews for patient care.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingApptId(null);
                setApptForm({
                  doctor_name: patient.doctor_name || 'Dr. Arvind Mehra',
                  clinic_or_hospital: patient.doctor_clinic || 'Fortis Hospital, Vasant Kunj',
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

          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
                <Calendar className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <p className="text-sm">No doctor appointments on record.</p>
              </div>
            ) : (
              appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{appt.doctor_name}</h4>
                      <p className="text-xs text-slate-400">{appt.clinic_or_hospital}</p>
                      {appt.notes && <p className="text-xs text-slate-500 mt-1">{appt.notes}</p>}
                      <p className="text-[11px] text-indigo-400 mt-1">
                        Advance reminder: {appt.advance_reminder_hours || 24}h before
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-sm font-bold text-sky-300 block">{appt.appointment_date}</span>
                      <span className="text-xs text-slate-400">{appt.appointment_time}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingApptId(appt.id);
                          setApptForm({ ...appt });
                          setShowApptModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Edit Appointment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAppointment(appt.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300"
                        title="Cancel Appointment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION D: DAILY ACTIVITIES & ROUTINES */}
      {/* ========================================================================= */}
      {subTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Daily Activities, Routines & Habits
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Support structured daily routine for cognitive comfort: meals, walking, hydration, exercise, and rest.
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/40"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                    {getCategoryIcon(act.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{act.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 uppercase">
                        {act.category}
                      </span>
                    </div>
                    {act.description && <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>}
                    <p className="text-[11px] text-slate-500 mt-1">
                      {act.repeat_frequency || 'Daily'} • Reminder {act.reminder_minutes_before || 15}m prior
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">{act.time}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      act.status === 'completed'
                        ? 'text-emerald-400'
                        : act.status === 'acknowledged'
                        ? 'text-sky-400'
                        : act.status === 'missed'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}>
                      {act.status || 'scheduled'}
                    </span>
                  </div>

                  {/* Status Toggle Quick Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateActivityStatus(act.id, 'completed')}
                      className={`p-1.5 rounded-lg border text-xs font-medium ${
                        act.status === 'completed'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 hover:bg-emerald-950 text-slate-300 border-slate-700'
                      }`}
                      title="Mark Completed"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateActivityStatus(act.id, 'missed')}
                      className={`p-1.5 rounded-lg border text-xs font-medium ${
                        act.status === 'missed'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-slate-800 hover:bg-rose-950 text-slate-300 border-slate-700'
                      }`}
                      title="Mark Missed"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingActId(act.id);
                        setActForm({ ...act });
                        setShowActModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Add / Edit Medication Modal */}
      {showMedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-indigo-400" />
                {editingMedId ? 'Edit Medication' : 'Add Medication Reminder'}
              </h4>
              <button onClick={() => setShowMedModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMedSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Medicine Name</label>
                <input
                  type="text"
                  value={medForm.name || ''}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  placeholder="e.g. Telmisartan or Morning Tablet"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medForm.dosage || ''}
                    onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                    placeholder="1 tablet / 40mg"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={medForm.schedule_time || ''}
                    onChange={(e) => setMedForm({ ...medForm, schedule_time: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Repeat Frequency</label>
                  <select
                    value={medForm.frequency || 'Every day'}
                    onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  >
                    <option value="Every day">Every day</option>
                    <option value="Twice a day">Twice a day</option>
                    <option value="Three times a day">Three times a day</option>
                    <option value="Once a week">Once a week</option>
                    <option value="Alternate days">Alternate days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Timing Slot</label>
                  <select
                    value={medForm.timing_slot || 'Morning'}
                    onChange={(e) => setMedForm({ ...medForm, timing_slot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Stock (Tablets)</label>
                  <input
                    type="number"
                    value={medForm.current_stock ?? 30}
                    onChange={(e) => setMedForm({ ...medForm, current_stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Refill Threshold</label>
                  <input
                    type="number"
                    value={medForm.refill_threshold ?? 5}
                    onChange={(e) => setMedForm({ ...medForm, refill_threshold: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    placeholder="Alert when ≤ 5 left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Instructions</label>
                <input
                  type="text"
                  value={medForm.instructions || ''}
                  onChange={(e) => setMedForm({ ...medForm, instructions: e.target.value })}
                  placeholder="Take with a full glass of water after breakfast"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMedModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  {editingMedId ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intake Status Update Modal */}
      {intakeModalMed && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Record Status: {intakeModalMed.name}</h4>
              <button onClick={() => setIntakeModalMed(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select status. Note: Acknowledging a reminder means the patient saw it, whereas Confirmed Taken decrements current stock.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onRecordMedIntake(intakeModalMed.id, 'acknowledged', intakeNotes);
                  setIntakeModalMed(null);
                }}
                className="w-full p-3 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/50 text-left text-xs font-semibold text-sky-200 flex items-center justify-between"
              >
                <span>Reminder Acknowledged (Not Yet Taken)</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </button>

              <button
                onClick={() => {
                  onRecordMedIntake(intakeModalMed.id, 'completed', intakeNotes);
                  setIntakeModalMed(null);
                }}
                className="w-full p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-left text-xs font-semibold text-emerald-200 flex items-center justify-between"
              >
                <span>Confirmed Taken (Deduct 1 Tablet)</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => {
                  onRecordMedIntake(intakeModalMed.id, 'missed', intakeNotes);
                  setIntakeModalMed(null);
                }}
                className="w-full p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-left text-xs font-semibold text-rose-200 flex items-center justify-between"
              >
                <span>Missed / Skipped (Notify Guardian)</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Optional Notes</label>
              <input
                type="text"
                value={intakeNotes}
                onChange={(e) => setIntakeNotes(e.target.value)}
                placeholder="e.g. taken with breakfast and glass of milk"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Appointment Modal */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                {editingApptId ? 'Edit Doctor Appointment' : 'Schedule Doctor Consultation'}
              </h4>
              <button onClick={() => setShowApptModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApptSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={apptForm.doctor_name || ''}
                  onChange={(e) => setApptForm({ ...apptForm, doctor_name: e.target.value })}
                  placeholder="e.g. Dr. Arvind Mehra"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Clinic / Hospital</label>
                <input
                  type="text"
                  value={apptForm.clinic_or_hospital || ''}
                  onChange={(e) => setApptForm({ ...apptForm, clinic_or_hospital: e.target.value })}
                  placeholder="Fortis Hospital, Vasant Kunj"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={apptForm.appointment_date || ''}
                    onChange={(e) => setApptForm({ ...apptForm, appointment_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={apptForm.appointment_time || ''}
                    onChange={(e) => setApptForm({ ...apptForm, appointment_time: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Advance Reminder (Hours Before)</label>
                <select
                  value={apptForm.advance_reminder_hours || 24}
                  onChange={(e) => setApptForm({ ...apptForm, advance_reminder_hours: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                >
                  <option value={12}>12 Hours Before</option>
                  <option value={24}>24 Hours Before (1 Day)</option>
                  <option value={48}>48 Hours Before (2 Days)</option>
                  <option value={72}>72 Hours Before (3 Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Consultation Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={apptForm.notes || ''}
                  onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })}
                  placeholder="Carry previous test reports and BP log..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApptModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                >
                  {editingApptId ? 'Update Appointment' : 'Schedule Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Daily Activity Modal */}
      {showActModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                {editingActId ? 'Edit Daily Activity' : 'Add Daily Activity / Habit'}
              </h4>
              <button onClick={() => setShowActModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleActSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Title</label>
                <input
                  type="text"
                  value={actForm.title || ''}
                  onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                  placeholder="e.g. Deer Park Morning Walk or Afternoon Rest"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Time (24h)</label>
                  <input
                    type="time"
                    value={actForm.time || '10:00'}
                    onChange={(e) => setActForm({ ...actForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={actForm.category || 'activity'}
                    onChange={(e) => setActForm({ ...actForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  >
                    <option value="activity">General Activity</option>
                    <option value="meal">Meal / Nutrition</option>
                    <option value="water">Drinking Water</option>
                    <option value="walk">Walking</option>
                    <option value="exercise">Exercise / Yoga</option>
                    <option value="sleep">Sleep / Rest</option>
                    <option value="visit">Family Visit</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Repeat Frequency</label>
                  <select
                    value={actForm.repeat_frequency || 'Daily'}
                    onChange={(e) => setActForm({ ...actForm, repeat_frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Once">Once</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reminder (Mins Prior)</label>
                  <input
                    type="number"
                    value={actForm.reminder_minutes_before ?? 15}
                    onChange={(e) => setActForm({ ...actForm, reminder_minutes_before: parseInt(e.target.value, 10) || 15 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Calming Prompt</label>
                <textarea
                  rows={2}
                  value={actForm.description || ''}
                  onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
                  placeholder="Gentle prompt spoken to the patient..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
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

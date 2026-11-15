import React, { useState, useEffect } from 'react';
import {
  Calendar,
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
  Moon,
  Users,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  FileText,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  ClipboardList,
  Flame,
  Activity,
  HeartHandshake,
  MessageSquare,
  Sparkles,
  Stethoscope,
  Info,
  TrendingUp,
  BarChart2,
  Smile,
  Shield,
  Sliders,
  ArrowUpRight,
  Zap,
  Filter,
  CheckSquare,
  PieChart
} from 'lucide-react';
import {
  PatientProfile,
  Medication,
  DoctorAppointment,
  DailyRoutine,
  CareProtocolItem,
  HandoverNoteItem,
  CareObservationItem,
  WellbeingPatternItem,
  ConsultationDetail
} from '../../types';
import {
  DEMO_APPOINTMENTS,
  DEMO_CARE_PROTOCOLS,
  DEMO_HANDOVER_NOTES,
  DEMO_WELLBEING_PATTERNS,
  DEMO_CARE_OBSERVATIONS
} from '../../services/demoData';

export interface PieSliceData {
  label: string;
  value: number; // percentage (0 - 100)
  color: string;
  detail: string;
}

export const DonutPieChart: React.FC<{
  title: string;
  subtitle: string;
  slices: PieSliceData[];
  centerValue: string;
  centerLabel: string;
}> = ({ title, subtitle, slices, centerValue, centerLabel }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const radius = 48;
  const circumference = 2 * Math.PI * radius; // ~301.59
  let accumulated = 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
      <div>
        <h4 className="text-sm font-bold text-slate-900 leading-snug flex items-center justify-between">
          <span>{title}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {slices.reduce((acc, s) => acc + s.value, 0)}% Total
          </span>
        </h4>
        <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 justify-between">
        {/* SVG Donut Chart */}
        <div className="relative shrink-0 w-[130px] h-[130px] flex items-center justify-center">
          <svg width="130" height="130" viewBox="0 0 130 130" className="transform -rotate-90">
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="16"
            />
            {slices.map((slice, i) => {
              const dasharray = `${(slice.value / 100) * circumference} ${circumference}`;
              const dashoffset = -((accumulated / 100) * circumference);
              accumulated += slice.value;
              const isHovered = hoveredIdx === i;

              return (
                <circle
                  key={i}
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={isHovered ? 19 : 16}
                  strokeDasharray={dasharray}
                  strokeDashoffset={dashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-base font-black text-slate-900 tracking-tight leading-none">
              {hoveredIdx !== null ? `${slices[hoveredIdx].value}%` : centerValue}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-none px-1 truncate max-w-[85px]">
              {hoveredIdx !== null ? slices[hoveredIdx].label : centerLabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-1.5 min-w-0">
          {slices.map((slice, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between text-xs p-1.5 rounded-xl transition-all cursor-pointer ${
                  isHovered ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-slate-700 truncate text-[11px] font-medium">
                    {slice.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                    {slice.detail}
                  </span>
                  <span
                    className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${slice.color}15`,
                      color: slice.color
                    }}
                  >
                    {slice.value}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface CareManagementSectionProps {
  initialSubTab?: string;
  currentSubTab?: 'appointments' | 'protocols' | 'insights' | any;
  onSelectSubTab?: (tab: 'appointments' | 'protocols' | 'insights') => void;
  patient: PatientProfile;
  appointments?: DoctorAppointment[];
  onCreateAppointment: (data: Partial<DoctorAppointment>) => Promise<void>;
  onUpdateAppointment: (id: number, data: Partial<DoctorAppointment>) => Promise<void>;
  onDeleteAppointment: (id: number) => Promise<void>;
  // Optional backwards-compatible props
  medications?: Medication[];
  activities?: DailyRoutine[];
  onCreateMedication?: (data: Partial<Medication>) => Promise<void>;
  onUpdateMedication?: (id: number, data: Partial<Medication>) => Promise<void>;
  onDeleteMedication?: (id: number) => Promise<void>;
  onRecordMedIntake?: (medId: number, status: string, notes?: string) => Promise<void>;
  onCreateActivity?: (data: Partial<DailyRoutine>) => Promise<void>;
  onUpdateActivity?: (id: number, data: Partial<DailyRoutine>) => Promise<void>;
  onDeleteActivity?: (id: number) => Promise<void>;
  onUpdateActivityStatus?: (id: number, status: string, notes?: string) => Promise<void>;
  isDark?: boolean;
}

export const CareManagementSection: React.FC<CareManagementSectionProps> = ({
  initialSubTab = 'appointments',
  currentSubTab,
  onSelectSubTab,
  patient,
  appointments: rawAppointments,
  onCreateAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  isDark = false
}) => {
  const isDemo = Boolean(
    patient?.is_demo ||
    patient?.email?.includes('demo') ||
    patient?.id === 1 ||
    (typeof window !== 'undefined' && (localStorage.getItem('atti_is_demo') === 'true' || sessionStorage.getItem('atti_is_demo') === 'true'))
  );

  // Active appointments list
  const appointments: DoctorAppointment[] = (rawAppointments && rawAppointments.length > 0)
    ? rawAppointments
    : (isDemo ? DEMO_APPOINTMENTS : []);

  // Supported subtabs: 'appointments' (Doctor Visits), 'protocols' (Care Protocols & Family Guide), 'insights' (Care Insights)
  const [internalSubTab, setInternalSubTab] = useState<'appointments' | 'protocols' | 'insights'>(() => {
    if (initialSubTab === 'protocols') return 'protocols';
    if (initialSubTab === 'insights') return 'insights';
    return 'appointments';
  });

  const effectiveSubTab: 'appointments' | 'protocols' | 'insights' = (
    currentSubTab === 'insights' || internalSubTab === 'insights'
  ) ? 'insights' : (
    currentSubTab === 'protocols' || internalSubTab === 'protocols'
  ) ? 'protocols' : 'appointments';

  const setSubTab = (tab: 'appointments' | 'protocols' | 'insights') => {
    setInternalSubTab(tab);
    onSelectSubTab?.(tab);
  };

  useEffect(() => {
    if (currentSubTab === 'protocols') {
      setInternalSubTab('protocols');
    } else if (currentSubTab === 'insights') {
      setInternalSubTab('insights');
    } else if (currentSubTab === 'appointments') {
      setInternalSubTab('appointments');
    }
  }, [currentSubTab]);

  // Protocols state
  const [protocols, setProtocols] = useState<CareProtocolItem[]>(() => {
    const saved = localStorage.getItem('atti_care_protocols');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEMO_CARE_PROTOCOLS;
  });

  // Handover notes state
  const [handoverNotes, setHandoverNotes] = useState<HandoverNoteItem[]>(() => {
    const saved = localStorage.getItem('atti_handover_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEMO_HANDOVER_NOTES;
  });

  // Care Insights state
  const [insightTimeframe, setInsightTimeframe] = useState<'7d' | '14d' | '30d'>('7d');
  const [insightDomainFilter, setInsightDomainFilter] = useState<string>('all');
  const [patterns] = useState<WellbeingPatternItem[]>(DEMO_WELLBEING_PATTERNS);

  const [observations, setObservations] = useState<CareObservationItem[]>(() => {
    const saved = localStorage.getItem('atti_care_observations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEMO_CARE_OBSERVATIONS;
  });

  const [showObservationModal, setShowObservationModal] = useState<boolean>(false);
  const [showClinicianSummaryModal, setShowClinicianSummaryModal] = useState<boolean>(false);

  const [observationForm, setObservationForm] = useState<{
    author_name: string;
    author_role: string;
    domain: 'Mood & Demeanor' | 'Sleep & Rest' | 'Physical Mobility' | 'Memory & Speech' | 'Nutrition & Hydration' | 'Vitals & General';
    observation: string;
    severity: 'positive' | 'stable' | 'monitor';
    action_taken: string;
  }>({
    author_name: 'Ananya Sharma',
    author_role: 'Daughter / Primary Guardian',
    domain: 'Mood & Demeanor',
    observation: '',
    severity: 'positive',
    action_taken: ''
  });

  const handleRecordObservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationForm.observation.trim()) return;

    const newObs: CareObservationItem = {
      id: Date.now(),
      timestamp: 'Just now',
      author_name: observationForm.author_name || 'Caregiver',
      author_role: observationForm.author_role || 'Primary Guardian',
      domain: observationForm.domain,
      observation: observationForm.observation.trim(),
      severity: observationForm.severity,
      action_taken: observationForm.action_taken.trim() || undefined
    };

    const updated = [newObs, ...observations];
    setObservations(updated);
    try {
      localStorage.setItem('atti_care_observations', JSON.stringify(updated));
    } catch (err) {
      /* ignore */
    }
    setShowObservationModal(false);
    setObservationForm({
      author_name: 'Ananya Sharma',
      author_role: 'Daughter / Primary Guardian',
      domain: 'Mood & Demeanor',
      observation: '',
      severity: 'positive',
      action_taken: ''
    });
    showToast('Observation recorded for patient wellbeing log!');
  };

  // Protocols category filter
  const [protocolFilter, setProtocolFilter] = useState<string>('all');

  // Modals state
  const [selectedConsultation, setSelectedConsultation] = useState<DoctorAppointment | null>(null);
  const [consultationActiveTab, setConsultationActiveTab] = useState<'summary' | 'prescription' | 'labs' | 'clinic'>('summary');
  const [callDoctorTarget, setCallDoctorTarget] = useState<DoctorAppointment | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showProtocolModal, setShowProtocolModal] = useState<boolean>(false);
  const [showHandoverModal, setShowHandoverModal] = useState<boolean>(false);
  const [toastMessage, setToMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToMessage(msg);
    setTimeout(() => setToMessage(null), 3200);
  };

  // Schedule visit form state
  const [scheduleForm, setScheduleForm] = useState<{
    doctor_name: string;
    specialty: string;
    clinic_or_hospital: string;
    appointment_date: string;
    appointment_time: string;
    notes: string;
    preparation_note: string;
    advance_reminder_hours: number;
    doctor_phone?: string;
  }>({
    doctor_name: '',
    specialty: 'Geriatrician',
    clinic_or_hospital: 'Fortis Hospital, Vasant Kunj',
    appointment_date: '',
    appointment_time: '11:00 AM',
    notes: '',
    preparation_note: '',
    advance_reminder_hours: 24,
    doctor_phone: '+91 98110 24890'
  });

  // New Protocol form state
  const [protocolForm, setProtocolForm] = useState<{
    title: string;
    category: 'calming' | 'diet' | 'mobility' | 'emergency' | 'hygiene';
    category_label: string;
    priority: 'Critical' | 'Strict Medical' | 'High Priority' | 'Urgent' | 'Daily Essential';
    priority_badge: string;
    description: string;
    steps: string;
    avoid_triggers: string;
  }>({
    title: '',
    category: 'calming',
    category_label: 'Calming & Memory',
    priority: 'High Priority',
    priority_badge: 'High Priority',
    description: '',
    steps: '',
    avoid_triggers: ''
  });

  // New Handover Note form state
  const [handoverForm, setHandoverForm] = useState<{
    author_name: string;
    author_role: string;
    category: string;
    content: string;
    vitals_recorded: string;
    mood: string;
  }>({
    author_name: 'Ananya Sharma',
    author_role: 'Daughter / Primary Guardian',
    category: 'Diet & Medication',
    content: '',
    vitals_recorded: '',
    mood: 'Cheerful & calm'
  });

  // Partition appointments into Upcoming and Past
  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const pastAppointments = appointments.filter(a => a.status === 'completed');

  // Handle schedule submit
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.doctor_name || !scheduleForm.appointment_date) {
      alert('Please fill in doctor name and date.');
      return;
    }

    try {
      await onCreateAppointment({
        doctor_name: scheduleForm.doctor_name,
        specialty: scheduleForm.specialty,
        clinic_or_hospital: scheduleForm.clinic_or_hospital,
        appointment_date: scheduleForm.appointment_date,
        appointment_time: scheduleForm.appointment_time,
        notes: scheduleForm.notes,
        preparation_note: scheduleForm.preparation_note,
        advance_reminder_hours: scheduleForm.advance_reminder_hours,
        status: 'scheduled'
      });
      setShowScheduleModal(false);
      showToast('Doctor appointment scheduled successfully.');
    } catch (err: any) {
      alert('Failed to schedule visit: ' + (err.message || err));
    }
  };

  // Handle new protocol submit
  const handleProtocolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolForm.title || !protocolForm.description) {
      alert('Please enter title and description.');
      return;
    }

    const stepsArray = protocolForm.steps
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newProtocol: CareProtocolItem = {
      id: Date.now(),
      title: protocolForm.title,
      category: protocolForm.category,
      category_label: protocolForm.category === 'calming' ? 'Calming & Memory'
        : protocolForm.category === 'diet' ? 'Diet & Nutrition'
        : protocolForm.category === 'mobility' ? 'Mobility & Safety'
        : protocolForm.category === 'emergency' ? 'Emergency Action'
        : 'Hygiene & Comfort',
      priority: protocolForm.priority,
      priority_badge: protocolForm.priority,
      description: protocolForm.description,
      steps: stepsArray.length > 0 ? stepsArray : [protocolForm.description],
      avoid_triggers: protocolForm.avoid_triggers || undefined,
      last_reviewed: 'Created today'
    };

    const updated = [newProtocol, ...protocols];
    setProtocols(updated);
    localStorage.setItem('atti_care_protocols', JSON.stringify(updated));
    setShowProtocolModal(false);
    showToast('New care protocol added to family guide.');
  };

  // Handle new handover submit
  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverForm.content) {
      alert('Please write note content.');
      return;
    }

    const newNote: HandoverNoteItem = {
      id: Date.now(),
      author_name: handoverForm.author_name,
      author_role: handoverForm.author_role,
      timestamp: 'Just now',
      category: handoverForm.category,
      content: handoverForm.content,
      vitals_recorded: handoverForm.vitals_recorded || undefined,
      mood: handoverForm.mood || undefined
    };

    const updated = [newNote, ...handoverNotes];
    setHandoverNotes(updated);
    localStorage.setItem('atti_handover_notes', JSON.stringify(updated));
    setShowHandoverModal(false);
    setHandoverForm({ ...handoverForm, content: '', vitals_recorded: '' });
    showToast('Handover note posted for family & caregivers.');
  };

  // Copy protocol to clipboard
  const handleCopyProtocol = (protocol: CareProtocolItem) => {
    const text = `📋 CARE PROTOCOL: ${protocol.title} (${protocol.category_label})
Priority: ${protocol.priority_badge}
Patient: ${patient.name}

Description:
${protocol.description}

Steps:
${protocol.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

${protocol.avoid_triggers ? `⚠️ Avoid / Triggers:\n${protocol.avoid_triggers}\n` : ''}
Last Reviewed: ${protocol.last_reviewed || 'Recent'}
Logged via Atti Care Platform`;

    navigator.clipboard.writeText(text);
    showToast('Protocol copied to clipboard! Ready to send via WhatsApp or SMS.');
  };

  // Helper to extract doctor initials
  const getInitials = (name: string): string => {
    if (!name) return 'DR';
    const parts = name.replace(/^Dr\.?\s+/i, '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: DOCTOR VISITS & CONSULTATIONS (Matching Reference Images 2 & 3) */}
      {/* ========================================================================= */}
      {effectiveSubTab === 'appointments' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Description with "+ Schedule visit" button (Exact match to Reference Image 2) */}
          <div className="space-y-3">
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Schedule doctor appointments, keep preparation notes and review past consultations.
            </p>

            <div>
              <button
                type="button"
                onClick={() => {
                  setScheduleForm({
                    doctor_name: '',
                    specialty: 'Geriatrician',
                    clinic_or_hospital: 'Fortis Hospital, Vasant Kunj',
                    appointment_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
                    appointment_time: '11:00 AM',
                    notes: '',
                    preparation_note: '',
                    advance_reminder_hours: 24,
                    doctor_phone: '+91 98110 24890'
                  });
                  setShowScheduleModal(true);
                }}
                className="px-4 py-2.5 bg-[#3B36AC] hover:bg-[#322E94] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule visit</span>
              </button>
            </div>
          </div>

          {/* Group 1: Upcoming · {count} (Exact match to Reference Image 2) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Upcoming · {upcomingAppointments.length}
            </h3>

            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No upcoming visits scheduled</p>
                <p className="text-xs text-slate-400 mt-1">Tap "+ Schedule visit" above to add an appointment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appt) => {
                  const initials = getInitials(appt.doctor_name);
                  return (
                    <div
                      key={appt.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all hover:border-slate-300"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Circle Avatar with Initials */}
                        <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                          {initials}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {appt.doctor_name}
                          </h4>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">
                            {appt.specialty || 'Physician'} · {appt.clinic_or_hospital}
                          </p>
                          {appt.notes && (
                            <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                              {appt.notes}
                            </p>
                          )}
                          <p className="text-xs text-slate-600 mt-1 font-normal">
                            {appt.appointment_date} · {appt.appointment_time}
                          </p>

                          {/* Amber Preparation Note Banner (Exact Match to Image 2) */}
                          {appt.preparation_note && (
                            <div className="mt-3 bg-amber-50/90 border border-amber-200/60 rounded-xl px-3.5 py-2">
                              <p className="text-xs font-medium text-amber-900 leading-relaxed">
                                {appt.preparation_note}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons Row */}
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedConsultation(appt);
                                setConsultationActiveTab('summary');
                              }}
                              className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                            >
                              View details
                            </button>
                            <button
                              type="button"
                              onClick={() => setCallDoctorTarget(appt)}
                              className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                            >
                              Call
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 2: Past · {count} (Exact match to Reference Image 3) */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Past · {pastAppointments.length}
            </h3>

            {pastAppointments.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No past visits recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastAppointments.map((appt) => {
                  const initials = getInitials(appt.doctor_name);
                  return (
                    <div
                      key={appt.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all hover:border-slate-300"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Circle Avatar with Initials */}
                        <div className="w-11 h-11 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                          {initials}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {appt.doctor_name}
                          </h4>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">
                            {appt.specialty || 'Consultant'} · {appt.clinic_or_hospital}
                          </p>
                          {appt.notes && (
                            <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                              {appt.notes}
                            </p>
                          )}
                          <p className="text-xs text-slate-600 mt-1 font-normal">
                            {appt.appointment_date} · {appt.appointment_time}
                          </p>

                          {/* Lavender Past Clinical Note Banner (Exact Match to Image 3) */}
                          {appt.preparation_note && (
                            <div className="mt-3 bg-indigo-50/70 border border-indigo-100/60 rounded-xl px-3.5 py-2">
                              <p className="text-xs font-medium text-indigo-900 leading-relaxed">
                                {appt.preparation_note}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons Row */}
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedConsultation(appt);
                                setConsultationActiveTab('prescription');
                              }}
                              className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                            >
                              View details
                            </button>
                            <button
                              type="button"
                              onClick={() => setCallDoctorTarget(appt)}
                              className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                            >
                              Call
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CARE PROTOCOLS & FAMILY GUIDE (The New Unique Category)        */}
      {/* ========================================================================= */}
      {effectiveSubTab === 'protocols' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Subtitle with "+ New Protocol" and "+ Add Handover" buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                Care Protocols & Daily Assistance Guide
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personalized instructions, calming techniques, dietary guidelines, and family care handover notes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHandoverModal(true)}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Handover Note</span>
              </button>
              <button
                type="button"
                onClick={() => setShowProtocolModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Protocol</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: `All Protocols (${protocols.length})` },
              { id: 'calming', label: 'Calming & Memory' },
              { id: 'diet', label: 'Diet & Nutrition' },
              { id: 'mobility', label: 'Mobility & Safety' },
              { id: 'emergency', label: 'Emergency Action' },
              { id: 'hygiene', label: 'Hygiene & Comfort' },
              { id: 'handover', label: `Handover Journal (${handoverNotes.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setProtocolFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  protocolFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* If 'handover' tab selected, show Handover Stream */}
          {protocolFilter === 'handover' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Family Shift Handover Journal</h4>
                <button
                  type="button"
                  onClick={() => setShowHandoverModal(true)}
                  className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Post new note
                </button>
              </div>

              <div className="space-y-3">
                {handoverNotes.map(note => (
                  <div
                    key={note.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          {note.author_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{note.author_name}</p>
                          <p className="text-[10px] text-slate-500">{note.author_role} · {note.timestamp}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {note.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {note.content}
                    </p>

                    {(note.vitals_recorded || note.mood) && (
                      <div className="flex items-center gap-3 pt-1 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                        {note.vitals_recorded && (
                          <span className="flex items-center gap-1 text-slate-700">
                            <Activity className="w-3 h-3 text-rose-500" />
                            {note.vitals_recorded}
                          </span>
                        )}
                        {note.mood && (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            Mood: {note.mood}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Protocols Grid */
            <div className="space-y-4">
              {protocols
                .filter(p => protocolFilter === 'all' || p.category === protocolFilter)
                .map(protocol => {
                  const isEmergency = protocol.category === 'emergency';
                  const isCalming = protocol.category === 'calming';
                  const isDiet = protocol.category === 'diet';
                  const isMobility = protocol.category === 'mobility';

                  const badgeColor = isEmergency
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isCalming
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : isDiet
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isMobility
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <div
                      key={protocol.id}
                      className={`p-5 rounded-2xl bg-white border transition-all shadow-2xs hover:border-slate-300 ${
                        isEmergency ? 'border-rose-200 ring-1 ring-rose-100/50' : 'border-slate-200/90'
                      }`}
                    >
                      {/* Top Row: Title, Category & Priority Badges */}
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-slate-900">
                              {protocol.title}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                              {protocol.category_label}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {protocol.priority_badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {protocol.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyProtocol(protocol)}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                            title="Copy protocol text to share with attendant or family"
                          >
                            <Share2 className="w-3 h-3 text-slate-500" />
                            <span>Copy for Attendant</span>
                          </button>
                        </div>
                      </div>

                      {/* Step-by-step checklist */}
                      <div className="mt-3.5 space-y-1.5 bg-slate-50/70 border border-slate-100 rounded-xl p-3.5">
                        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Protocol Action Steps:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 leading-relaxed font-normal">
                          {protocol.steps.map((step, sIdx) => (
                            <li key={sIdx} className="pl-1">
                              <span className="font-medium text-slate-800">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Avoid triggers / Precautions */}
                      {protocol.avoid_triggers && (
                        <div className="mt-2.5 flex items-start gap-2 text-xs bg-amber-50/70 border border-amber-200/50 rounded-xl p-3 text-amber-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Precautions / Avoid: </span>
                            <span>{protocol.avoid_triggers}</span>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{protocol.last_reviewed}</span>
                        <span className="font-medium text-slate-500">Patient: {patient.name}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Quick Attendant Care Sheet Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#F6F7FE] to-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#3B36AC] shadow-xs border border-indigo-100 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Hiring a visiting nurse or new attendant?</p>
                <p className="text-[11px] text-slate-600">Print or share {patient.name}'s complete care protocol checklist in 1 tap.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const summary = protocols.map((p, i) => `${i + 1}. ${p.title}\n${p.steps.join('\n')}`).join('\n\n');
                navigator.clipboard.writeText(`ATTI ELDER CARE HANDBOOK - ${patient.name}\n\n${summary}`);
                showToast('Complete Care Handbook copied! Ready to paste into WhatsApp.');
              }}
              className="px-3.5 py-2 bg-[#3B36AC] hover:bg-[#322E94] text-white rounded-xl text-xs font-bold shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Copy Full Care Sheet
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: CARE INSIGHTS – PATTERNS, TRENDS & OBSERVATIONS                */}
      {/* ========================================================================= */}
      {effectiveSubTab === 'insights' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                <span>Care Insights – Patterns & Trends</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal mt-0.5">
                Patterns, trends and observations about the patient's wellbeing.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Timeframe selector */}
              <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                {(['7d', '14d', '30d'] as const).map(tf => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setInsightTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      insightTimeframe === tf
                        ? 'bg-white text-violet-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf === '7d' ? '7 Days' : tf === '14d' ? '14 Days' : '30 Days'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowObservationModal(true)}
                className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record Observation</span>
              </button>

              <button
                type="button"
                onClick={() => setShowClinicianSummaryModal(true)}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                title="View structured clinical brief for Dr. Arvind Mehra"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Clinician Brief</span>
              </button>
            </div>
          </div>

          {/* 4 Health & Wellbeing Scorecard Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            {/* Metric 1: Overall Wellbeing Stability */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-white border border-indigo-100 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Wellbeing Stability</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +4%
                </span>
              </div>
              <div className="my-2.5">
                <div className="text-2xl font-black text-slate-900 tracking-tight">94%</div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Overall Stability Index</div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-1.5">
                Peaceful demeanor · Grounded
              </div>
            </div>

            {/* Metric 2: Sundowning Calm */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 via-white to-white border border-amber-100 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Twilight Agitation</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Calm
                </span>
              </div>
              <div className="my-2.5">
                <div className="text-2xl font-black text-slate-900 tracking-tight">0 Events</div>
                <div className="text-[11px] font-semibold text-amber-700 mt-0.5">5 Consecutive Calm Days</div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-1.5">
                6:30 PM dimming protocol active
              </div>
            </div>

            {/* Metric 3: Sleep Architecture */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/60 via-white to-white border border-violet-100 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Sleep Duration</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  Continuous
                </span>
              </div>
              <div className="my-2.5">
                <div className="text-2xl font-black text-slate-900 tracking-tight">7.6 hrs</div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Average Night Rest</div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-1.5">
                Zero night wandering alarms
              </div>
            </div>

            {/* Metric 4: Routine Adherence */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-white border border-emerald-100 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Care Adherence</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  On Track
                </span>
              </div>
              <div className="my-2.5">
                <div className="text-2xl font-black text-slate-900 tracking-tight">96%</div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Routines & Hydration</div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-1.5">
                Telmisartan taken on time daily
              </div>
            </div>
          </div>

          {/* Pie Charts Section: Wellbeing Analytics & Distribution */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <PieChart className="w-4 h-4 text-violet-600" />
                <span>Wellbeing Analytics & Distribution (Last {insightTimeframe === '7d' ? '7' : insightTimeframe === '14d' ? '14' : '30'} Days)</span>
              </h4>
              <span className="text-xs font-semibold text-slate-500">Interactive Breakdown</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pie Chart 1: 24-Hour Routine & Rest Allocation */}
              <DonutPieChart
                title="24-Hour Routine & Rest Balance"
                subtitle="Distribution of daily hours across sleep, meals, strolls & cognitive rest"
                slices={[
                  { label: 'Night Sleep & Rest', value: 32, color: '#5E58E7', detail: '7.6 hrs' },
                  { label: 'Cognitive & Reminiscence', value: 25, color: '#3B82F6', detail: '6.0 hrs' },
                  { label: 'Meals & Hydration', value: 18, color: '#10B981', detail: '4.3 hrs' },
                  { label: 'Deer Park Walking & Mobility', value: 15, color: '#06B6D4', detail: '3.6 hrs' },
                  { label: 'Twilight Dimming Wind-Down', value: 10, color: '#8B5CF6', detail: '2.5 hrs' }
                ]}
                centerValue="24h"
                centerLabel="Daily Balance"
              />

              {/* Pie Chart 2: Twilight Mood & Sundowning Stability */}
              <DonutPieChart
                title="Twilight Mood & Demeanor"
                subtitle="Emotional stability during sunset with 6:30 PM dimming protocol"
                slices={[
                  { label: 'Calm & Peaceful', value: 74, color: '#10B981', detail: '22 days' },
                  { label: 'Cheerful & Reminiscing', value: 18, color: '#5E58E7', detail: '5 days' },
                  { label: 'Mild Restlessness', value: 8, color: '#F59E0B', detail: '3 days' }
                ]}
                centerValue="92%"
                centerLabel="Calm State"
              />

              {/* Pie Chart 3: Care & Medication Adherence */}
              <DonutPieChart
                title="Care & Medication Adherence"
                subtitle="Compliance across prescribed doses, hydration & morning routines"
                slices={[
                  { label: 'Taken Exactly On-Time', value: 88, color: '#5E58E7', detail: 'Daily meds' },
                  { label: 'Taken with Gentle Prompt', value: 8, color: '#10B981', detail: 'Hydration' },
                  { label: 'Rescheduled / Adjusted', value: 4, color: '#F59E0B', detail: 'Shift handoff' }
                ]}
                centerValue="96%"
                centerLabel="Compliance"
              />

              {/* Pie Chart 4: Physiological Vitals Target Attainment */}
              <DonutPieChart
                title="Physiological Vitals Target Attainment"
                subtitle="Readings within Dr. Arvind Mehra's target parameters (<130/80)"
                slices={[
                  { label: 'In Optimal Target Range', value: 80, color: '#10B981', detail: 'Vascular safe' },
                  { label: 'Borderline Normal Range', value: 16, color: '#3B82F6', detail: '130-138 mmHg' },
                  { label: 'Monitored Parameter', value: 4, color: '#F59E0B', detail: 'Transient' }
                ]}
                centerValue="124/80"
                centerLabel="Rolling BP"
              />
            </div>
          </div>

          {/* Domain Consistency Progress Bars (Unified Brand Color) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#5E58E7]" />
                <span>Wellbeing Domain Consistency (Last {insightTimeframe === '7d' ? '7' : insightTimeframe === '14d' ? '14' : '30'} Days)</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">Target: ≥ 90%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {[
                { domain: 'Sleep & Night Rest Rhythm', pct: 95 },
                { domain: 'Medication Timing & Stock', pct: 98 },
                { domain: 'Low-Sodium Dietary Compliance', pct: 92 },
                { domain: 'Daily Hydration (7-8 glasses)', pct: 90 },
                { domain: 'Deer Park Morning Mobility', pct: 94 },
                { domain: 'Memory & Emotional Grounding', pct: 93 }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.domain}</span>
                    <span className="font-bold text-slate-900">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-[#5E58E7]"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Longitudinal Patterns & Observations Grid */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Clinical & Care Observations ({patterns.length} Active Patterns)</span>
              </h4>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {[
                  { id: 'all', label: 'All Patterns' },
                  { id: 'Emotional & Mood', label: 'Mood' },
                  { id: 'Sleep & Rest', label: 'Sleep' },
                  { id: 'Physiological Vitals', label: 'Vitals' },
                  { id: 'Nutrition & Diet', label: 'Nutrition' },
                  { id: 'Mobility & Fall Safety', label: 'Mobility' },
                  { id: 'Cognitive & Social', label: 'Cognitive' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setInsightDomainFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      insightDomainFilter === f.id
                        ? 'bg-violet-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {patterns
                .filter(p => insightDomainFilter === 'all' || p.domain === insightDomainFilter)
                .map((pattern) => (
                  <div
                    key={pattern.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {pattern.domain}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          pattern.status === 'improving'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : pattern.status === 'optimal'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          {pattern.status_label}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-slate-900 leading-snug">
                        {pattern.title}
                      </h5>

                      <div className="p-2.5 rounded-xl bg-violet-50/50 border border-violet-100/70 text-xs text-slate-700 font-medium leading-relaxed">
                        {pattern.trend_summary}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {pattern.observation_detail}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observed Metric</span>
                          <span className="text-base font-black text-slate-900">{pattern.key_metric}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Change</span>
                          <span className="text-xs font-bold text-emerald-700">{pattern.metric_change}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/50 flex items-start gap-2 text-xs text-amber-900">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Recommendation: </span>
                          <span>{pattern.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Caregiver Observations Journal */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Caregiver & Family Observations Journal ({observations.length})</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct observations recorded by family members and nursing attendants.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowObservationModal(true)}
                className="px-3 py-1.5 bg-[#3B36AC] hover:bg-[#322E94] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Observation</span>
              </button>
            </div>

            <div className="space-y-3">
              {observations.map((obs) => {
                const severityBadge = obs.severity === 'positive'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : obs.severity === 'stable'
                  ? 'bg-indigo-50 text-[#3B36AC] border-indigo-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200';

                return (
                  <div
                    key={obs.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">
                          {obs.author_name[0] || 'C'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900">{obs.author_name}</span>
                          <span className="text-[11px] text-slate-400 ml-1.5 font-medium">({obs.author_role})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {obs.domain}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityBadge}`}>
                          {obs.severity === 'positive' ? 'Calming / Positive' : obs.severity === 'stable' ? 'Stable Normal' : 'Needs Monitor'}
                        </span>
                        <span className="text-[11px] text-slate-400">{obs.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal pl-9">
                      "{obs.observation}"
                    </p>

                    {obs.action_taken && (
                      <div className="ml-9 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Action taken: </strong>{obs.action_taken}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CONSULTATION DETAILS & DIGITAL PRESCRIPTION (EVERYTHING SHOWN)   */}
      {/* ========================================================================= */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-[#F6F7FE] via-white to-indigo-50/40 border-b border-slate-200/90 relative">
              <button
                type="button"
                onClick={() => setSelectedConsultation(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3.5 pr-8">
                <div className="w-12 h-12 rounded-2xl bg-[#3B36AC] text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                  {getInitials(selectedConsultation.doctor_name)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedConsultation.doctor_name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedConsultation.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {selectedConsultation.status === 'completed' ? 'Consultation Completed' : 'Upcoming Scheduled'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {selectedConsultation.specialty || 'Specialist'} · {selectedConsultation.clinic_or_hospital}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#3B36AC]" />
                    <span>{selectedConsultation.appointment_date} · {selectedConsultation.appointment_time}</span>
                  </p>
                </div>
              </div>

              {/* Consultation Modal Navigation Tabs */}
              <div className="flex items-center gap-2 mt-5 border-t border-slate-200/70 pt-3 overflow-x-auto scrollbar-none">
                {[
                  { id: 'summary', label: 'Consultation Summary' },
                  { id: 'prescription', label: 'Prescription (Rx)' },
                  { id: 'labs', label: 'Lab Tests & Reports' },
                  { id: 'clinic', label: 'Doctor & Clinic Info' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setConsultationActiveTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      consultationActiveTab === t.id
                        ? 'bg-[#3B36AC] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* TAB 1: SUMMARY */}
              {consultationActiveTab === 'summary' && (
                <div className="space-y-4">
                  {/* Reason & Clinical Notes */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reason for Consultation:</p>
                    <p className="text-xs text-slate-800 leading-relaxed font-normal">
                      {selectedConsultation.consultation_detail?.reason_for_visit || selectedConsultation.notes || 'Routine consultation and comprehensive health review.'}
                    </p>
                  </div>

                  {selectedConsultation.consultation_detail?.diagnosis && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                      <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Clinical Diagnosis:</p>
                      <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                        {selectedConsultation.consultation_detail.diagnosis}
                      </p>
                    </div>
                  )}

                  {selectedConsultation.consultation_detail?.clinical_summary && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                      <p className="text-xs font-bold text-slate-800">Doctor's Examination Findings:</p>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {selectedConsultation.consultation_detail.clinical_summary}
                      </p>
                    </div>
                  )}

                  {/* Recorded Vitals Table */}
                  {selectedConsultation.consultation_detail?.vitals_recorded && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-800">Vitals Recorded During Consult:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {selectedConsultation.consultation_detail.vitals_recorded.bp && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Blood Pressure</span>
                            <span className="text-sm font-black text-slate-900 mt-0.5 block">
                              {selectedConsultation.consultation_detail.vitals_recorded.bp}
                            </span>
                          </div>
                        )}
                        {selectedConsultation.consultation_detail.vitals_recorded.pulse && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Heart Rate</span>
                            <span className="text-sm font-black text-rose-600 mt-0.5 block">
                              {selectedConsultation.consultation_detail.vitals_recorded.pulse}
                            </span>
                          </div>
                        )}
                        {selectedConsultation.consultation_detail.vitals_recorded.weight && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Weight</span>
                            <span className="text-sm font-black text-slate-900 mt-0.5 block">
                              {selectedConsultation.consultation_detail.vitals_recorded.weight}
                            </span>
                          </div>
                        )}
                        {selectedConsultation.consultation_detail.vitals_recorded.blood_sugar && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Blood Sugar</span>
                            <span className="text-sm font-black text-emerald-600 mt-0.5 block">
                              {selectedConsultation.consultation_detail.vitals_recorded.blood_sugar}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preparation Banner for Upcoming or Follow-up for Past */}
                  {selectedConsultation.preparation_note && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
                      <strong>Important Instruction: </strong>{selectedConsultation.preparation_note}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DIGITAL PRESCRIPTION (Rx) */}
              {consultationActiveTab === 'prescription' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {selectedConsultation.consultation_detail?.rx_number || 'Digital Prescription'}
                      </p>
                      <p className="text-[10px] text-slate-400">Date: {selectedConsultation.appointment_date}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified Clinical Rx
                    </span>
                  </div>

                  {/* Prescribed Medicines List */}
                  {selectedConsultation.consultation_detail?.prescribed_medications && selectedConsultation.consultation_detail.prescribed_medications.length > 0 ? (
                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-slate-800">Prescribed Medications:</p>
                      {selectedConsultation.consultation_detail.prescribed_medications.map((med, mIdx) => (
                        <div key={mIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{med.name}</span>
                            <span className="text-[11px] font-semibold text-[#3B36AC]">{med.dosage}</span>
                          </div>
                          <p className="text-xs text-slate-600">{med.timing} · {med.frequency} · Duration: {med.duration}</p>
                          <p className="text-[11px] text-slate-500 italic">Instruction: {med.instructions}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">Routine follow-up consultation</p>
                      <p className="text-[11px] text-slate-400">Ongoing medications maintained without dose alteration.</p>
                    </div>
                  )}

                  {/* Doctor's Advice List */}
                  {selectedConsultation.consultation_detail?.doctor_advice && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-bold text-slate-800">Doctor's Lifestyle & Dietary Advice:</p>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {selectedConsultation.consultation_detail.doctor_advice.map((adv, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LAB TESTS & REPORTS */}
              {consultationActiveTab === 'labs' && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-800">Diagnostic Investigations & Ordered Tests:</p>
                  {selectedConsultation.consultation_detail?.lab_tests && selectedConsultation.consultation_detail.lab_tests.length > 0 ? (
                    <div className="space-y-2">
                      {selectedConsultation.consultation_detail.lab_tests.map((test, tIdx) => (
                        <div key={tIdx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{test.name}</p>
                            <p className="text-xs text-slate-600 font-medium">{test.result}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            Normal
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
                      <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">No additional lab tests ordered</p>
                      <p className="text-[11px] text-slate-400">Previous reports reviewed and found stable.</p>
                    </div>
                  )}

                  {selectedConsultation.consultation_detail?.follow_up_date && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950">Next Follow-Up Recommended:</span>
                      <span className="text-xs font-bold text-[#3B36AC]">
                        {selectedConsultation.consultation_detail.follow_up_date}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CLINIC & CONTACT */}
              {consultationActiveTab === 'clinic' && (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold text-slate-900">Hospital & Clinic Details:</p>
                    <p className="text-slate-700">
                      <strong>Facility: </strong>{selectedConsultation.clinic_or_hospital}
                    </p>
                    <p className="text-slate-700">
                      <strong>Specialty: </strong>{selectedConsultation.specialty || 'General Practice'}
                    </p>
                    {selectedConsultation.consultation_detail?.location_address && (
                      <p className="text-slate-600 flex items-start gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{selectedConsultation.consultation_detail.location_address}</span>
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">Doctor Direct Desk</p>
                      <p className="text-xs text-slate-500">{selectedConsultation.doctor_phone || '+91 98110 24890'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCallDoctorTarget(selectedConsultation)}
                      className="px-3.5 py-2 bg-[#3B36AC] text-white rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      Call Clinic
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/90 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Prescription PDF prepared for download.');
                    window.print();
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Rx</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedConsultation(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK CALL MODAL                                                 */}
      {/* ========================================================================= */}
      {callDoctorTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3B36AC] flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">{callDoctorTarget.doctor_name}</h3>
              <p className="text-xs text-slate-500">{callDoctorTarget.specialty || 'Doctor'} · {callDoctorTarget.clinic_or_hospital}</p>
              <p className="text-lg font-black text-[#3B36AC] pt-1">
                {callDoctorTarget.doctor_phone || '+91 98110 24890'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-[11px] text-slate-500">
              Clinic Desk Hours: Mon - Sat, 9:00 AM - 5:00 PM<br />
              Emergency Helpline: Fortis 1066 / Max 011 4055 4055
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCallDoctorTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <a
                href={`tel:${callDoctorTarget.doctor_phone || '+919811024890'}`}
                className="flex-1 py-2.5 rounded-xl bg-[#3B36AC] hover:bg-[#322E94] text-white text-xs font-bold text-center active:scale-95 transition-all cursor-pointer"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SCHEDULE DOCTOR VISIT MODAL                                      */}
      {/* ========================================================================= */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-scale-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule Doctor Visit</h3>
                <p className="text-xs text-slate-500">Add appointment and preparation instructions for {patient.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arvind Mehra"
                  value={scheduleForm.doctor_name}
                  onChange={e => setScheduleForm({ ...scheduleForm, doctor_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] focus:border-[#3B36AC] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g. Geriatrician"
                    value={scheduleForm.specialty}
                    onChange={e => setScheduleForm({ ...scheduleForm, specialty: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] focus:border-[#3B36AC] outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Clinic / Hospital</label>
                  <input
                    type="text"
                    placeholder="e.g. Fortis Hospital, Vasant Kunj"
                    value={scheduleForm.clinic_or_hospital}
                    onChange={e => setScheduleForm({ ...scheduleForm, clinic_or_hospital: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] focus:border-[#3B36AC] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.appointment_date}
                    onChange={e => setScheduleForm({ ...scheduleForm, appointment_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] focus:border-[#3B36AC] outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:00 AM"
                    value={scheduleForm.appointment_time}
                    onChange={e => setScheduleForm({ ...scheduleForm, appointment_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] focus:border-[#3B36AC] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Consultation Purpose / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Routine geriatric consultation & blood work"
                  value={scheduleForm.notes}
                  onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] focus:border-[#3B36AC] outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Preparation Instructions (Shows in amber banner)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Carry the last 3 months of sugar readings."
                  value={scheduleForm.preparation_note}
                  onChange={e => setScheduleForm({ ...scheduleForm, preparation_note: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] focus:border-[#3B36AC] outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3B36AC] hover:bg-[#322E94] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD CARE PROTOCOL MODAL                                          */}
      {/* ========================================================================= */}
      {showProtocolModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-scale-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Care Protocol</h3>
                <p className="text-xs text-slate-500">Personalized elder care instructions for family and attendants</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProtocolModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProtocolSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Protocol Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evening Sundowning & Memory Agitation Protocol"
                  value={protocolForm.title}
                  onChange={e => setProtocolForm({ ...protocolForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={protocolForm.category}
                    onChange={e => setProtocolForm({ ...protocolForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden bg-white"
                  >
                    <option value="calming">Calming & Memory</option>
                    <option value="diet">Diet & Nutrition</option>
                    <option value="mobility">Mobility & Safety</option>
                    <option value="emergency">Emergency Action</option>
                    <option value="hygiene">Hygiene & Comfort</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={protocolForm.priority}
                    onChange={e => setProtocolForm({ ...protocolForm, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden bg-white"
                  >
                    <option value="High Priority">High Priority</option>
                    <option value="Critical">Critical Safety</option>
                    <option value="Strict Medical">Strict Medical</option>
                    <option value="Urgent">Life Safety</option>
                    <option value="Daily Essential">Daily Essential</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain why this protocol exists and when to trigger it..."
                  value={protocolForm.description}
                  onChange={e => setProtocolForm({ ...protocolForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Action Steps (1 per line)</label>
                <textarea
                  rows={4}
                  placeholder="Step 1: Dim lights at 6:30 PM&#10;Step 2: Play soothing instrumental music&#10;Step 3: Offer warm water with cardamom"
                  value={protocolForm.steps}
                  onChange={e => setProtocolForm({ ...protocolForm, steps: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Triggers to Avoid / Precautions</label>
                <input
                  type="text"
                  placeholder="e.g. Loud television noise, arguing about misplaced items"
                  value={protocolForm.avoid_triggers}
                  onChange={e => setProtocolForm({ ...protocolForm, avoid_triggers: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowProtocolModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Save Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: POST HANDOVER NOTE MODAL                                         */}
      {/* ========================================================================= */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-scale-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Post Handover Note</h3>
                <p className="text-xs text-slate-500">Sync shift status with family and home attendants</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHandoverModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHandoverSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Caregiver Name</label>
                  <input
                    type="text"
                    required
                    value={handoverForm.author_name}
                    onChange={e => setHandoverForm({ ...handoverForm, author_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={handoverForm.category}
                    onChange={e => setHandoverForm({ ...handoverForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] outline-hidden bg-white"
                  >
                    <option value="Diet & Medication">Diet & Medication</option>
                    <option value="Evening Rest & Mood">Evening Rest & Mood</option>
                    <option value="Mobility & Exercise">Mobility & Exercise</option>
                    <option value="Night Sleep & Rest">Night Sleep & Rest</option>
                    <option value="General Observation">General Observation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Handover Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record meal intake, mood, activities, or instructions for the next family member on duty..."
                  value={handoverForm.content}
                  onChange={e => setHandoverForm({ ...handoverForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vitals (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. BP: 124/80 mmHg"
                    value={handoverForm.vitals_recorded}
                    onChange={e => setHandoverForm({ ...handoverForm, vitals_recorded: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Patient Mood</label>
                  <input
                    type="text"
                    placeholder="e.g. Cheerful & calm"
                    value={handoverForm.mood}
                    onChange={e => setHandoverForm({ ...handoverForm, mood: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3B36AC] outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowHandoverModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3B36AC] hover:bg-[#322E94] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Post Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: RECORD PATIENT WELLBEING OBSERVATION MODAL                       */}
      {/* ========================================================================= */}
      {showObservationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-scale-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-violet-50/60 to-white">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                  <span>Record Wellbeing Observation</span>
                </h3>
                <p className="text-xs text-slate-500">Log behavioral patterns, mood trends, or physical notes for {patient.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowObservationModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordObservationSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Caregiver / Observer Name</label>
                  <input
                    type="text"
                    required
                    value={observationForm.author_name}
                    onChange={e => setObservationForm({ ...observationForm, author_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Observer Role</label>
                  <input
                    type="text"
                    value={observationForm.author_role}
                    onChange={e => setObservationForm({ ...observationForm, author_role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-600 outline-hidden"
                    placeholder="e.g. Primary Guardian / Attendant"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Wellbeing Domain</label>
                  <select
                    value={observationForm.domain}
                    onChange={e => setObservationForm({ ...observationForm, domain: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-600 outline-hidden bg-white"
                  >
                    <option value="Mood & Demeanor">Mood & Demeanor</option>
                    <option value="Sleep & Rest">Sleep & Rest</option>
                    <option value="Physical Mobility">Physical Mobility</option>
                    <option value="Memory & Speech">Memory & Speech</option>
                    <option value="Nutrition & Hydration">Nutrition & Hydration</option>
                    <option value="Vitals & General">Vitals & General</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Observation Impact</label>
                  <select
                    value={observationForm.severity}
                    onChange={e => setObservationForm({ ...observationForm, severity: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-600 outline-hidden bg-white"
                  >
                    <option value="positive">Calming / Positive Progress</option>
                    <option value="stable">Stable / Normal Rhythm</option>
                    <option value="monitor">Requires Closer Monitoring</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Clinical or Behavioral Observation *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe patient demeanor, clarity of speech, comfort, appetite, or reaction to routine changes..."
                  value={observationForm.observation}
                  onChange={e => setObservationForm({ ...observationForm, observation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-600 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Action Taken or Protocol Followed</label>
                <input
                  type="text"
                  placeholder="e.g. Played Bansuri raga music, offered cardamom tea, checked BP (124/80)"
                  value={observationForm.action_taken}
                  onChange={e => setObservationForm({ ...observationForm, action_taken: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-600 outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowObservationModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Save Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: CLINICIAN WELLBEING SUMMARY BRIEF (FOR DR. ARVIND MEHRA)         */}
      {/* ========================================================================= */}
      {showClinicianSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-scale-in">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-br from-[#F6F7FE] via-white to-violet-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">30-Day Clinical Wellbeing Brief</h3>
                  <p className="text-xs text-slate-500">Prepared for Dr. Arvind Mehra · Fortis Hospital, Vasant Kunj</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClinicianSummaryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs text-slate-700">
              {/* Patient Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{patient.name} (Age: 72)</p>
                  <p className="text-slate-500 text-[11px]">Primary Guardian: Ananya Sharma · 24, Green Park, New Delhi</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#3B36AC] text-[11px] block">Next Visit: Fri, 20 Nov 2026</span>
                  <span className="text-[10px] text-slate-400">11:00 AM · Geriatric Review</span>
                </div>
              </div>

              {/* Clinical Metrics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BP Rolling Avg</span>
                  <span className="text-sm font-black text-slate-900">124/80 mmHg</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">In Target (&lt;130/80)</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fasting Glycemia</span>
                  <span className="text-sm font-black text-slate-900">108 mg/dL</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Controlled on Metformin</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Twilight Sundowning</span>
                  <span className="text-sm font-black text-slate-900">0 Incidents / 5d</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">85% Reduction</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Night Sleep Quality</span>
                  <span className="text-sm font-black text-slate-900">7.6 hrs/night</span>
                  <span className="text-[10px] text-indigo-600 font-semibold block">Continuous & Calm</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hydration Regularity</span>
                  <span className="text-sm font-black text-slate-900">7.2 glasses/day</span>
                  <span className="text-[10px] text-sky-600 font-semibold block">Lukewarm water</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Physical Mobility</span>
                  <span className="text-sm font-black text-slate-900">22 mins daily</span>
                  <span className="text-[10px] text-teal-600 font-semibold block">Deer Park Walking</span>
                </div>
              </div>

              {/* Clinical Narrative Summary */}
              <div className="space-y-2 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <p className="font-bold text-slate-900 text-xs">Care Team Summary & Observations:</p>
                <p className="text-slate-700 leading-relaxed font-normal">
                  Over the past 30 days, Meera Sharma has exhibited remarkable emotional stability with zero high-anxiety wandering episodes. The instituting of the 6:30 PM dimming protocol (ambient warm lighting + Bansuri flute ragas + warm cardamom water) successfully resolved previously noted sundowning restlessness.
                </p>
                <p className="text-slate-700 leading-relaxed font-normal">
                  Knee stiffness post-wake up has reduced with Dr. Priya Kapoor's quad strengthening sessions. Patient consistently wears supportive orthotic grip shoes indoors and uses the 4-prong walker for corridor transfers.
                </p>
              </div>

              {/* Prescriptions on File */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-white border border-slate-200">
                <p className="font-bold text-slate-900 text-xs">Active Prescriptions (From Dr. Arvind Mehra):</p>
                <div className="space-y-1 text-[11px] text-slate-600">
                  <p>• <strong>Telmisartan 40 mg</strong> — 1 tablet daily at 08:30 AM after breakfast (Blood Pressure)</p>
                  <p>• <strong>Metformin 500 mg</strong> — 1 tablet daily at 01:30 PM with lunch (Glycemic control)</p>
                  <p>• <strong>Calcium & Vitamin D3</strong> — 1 tablet daily at 08:30 PM after dinner (Bone strength)</p>
                  <p>• <strong>Refresh Tears Eye Drops</strong> — 1 drop in both eyes twice daily (Ocular hydration)</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `30-DAY CLINICAL WELLBEING BRIEF - ${patient.name}\nDoctor: Dr. Arvind Mehra (Fortis Hospital)\n\nBP Rolling Avg: 124/80 mmHg\nFasting Glucose: 108 mg/dL\nSundowning: 0 episodes in 5 days (85% reduction)\nSleep: 7.6 hrs/night continuous\nMobility: 22 mins daily walking in Deer Park\nMedication Adherence: 98%\nActive Meds: Telmisartan 40mg, Metformin 500mg, Calcium + Vit D3`;
                    navigator.clipboard.writeText(text);
                    showToast('Clinical brief copied to clipboard!');
                  }}
                  className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Brief</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Report</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowClinicianSummaryModal(false)}
                className="px-4 py-2 bg-[#3B36AC] text-white rounded-xl text-xs font-bold hover:bg-[#322E94] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

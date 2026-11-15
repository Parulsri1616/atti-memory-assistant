import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  MapPin,
  Pill,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Phone,
  Plus,
  RefreshCw,
  Bell,
  Battery,
  Coffee,
  Droplet,
  Footprints,
  Dumbbell,
  Moon,
  Users,
  Circle,
  Activity,
  ArrowRight,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Heart,
  Stethoscope,
  Check,
  X
} from 'lucide-react';
import { OverviewSummary, DailyRoutine, Medication, DoctorAppointment } from '../../types';
import { buildDemoOverview, DEMO_PATIENT, DEMO_NOTIFICATIONS } from '../../services/demoData';

import caregiverDoctorHero from '../../assets/caregiver_doctor_hero.jpg';
import doctorArvindPortrait from '../../assets/doctor_arvind_portrait.jpg';
import doctorShwetaPortrait from '../../assets/doctor_shweta_portrait.jpg';
import healthHeart3d from '../../assets/health_insights_heart.jpg';
import appointmentCalendar3d from '../../assets/appointment_calendar_3d.jpg';

interface OverviewSectionProps {
  overview: OverviewSummary | null;
  activities?: DailyRoutine[];
  onToggleActivityDone?: (id: number, newStatus: string) => void;
  loading: boolean;
  onRefresh: () => void;
  onNavigateTab: (tab: 'overview' | 'care' | 'safety', subTab?: string) => void;
  onRecordMedIntake: (medId: number, status: 'acknowledged' | 'completed' | 'missed') => void;
  isDark?: boolean;
}

type OverviewCategory = 'routine' | 'medications' | 'appointments' | 'health';
type RoutineFilter = 'all' | 'completed' | 'upcoming' | 'missed';

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  overview,
  activities = [],
  onToggleActivityDone,
  loading,
  onRefresh,
  onNavigateTab,
  onRecordMedIntake,
  isDark = false
}) => {
  // 4 In-Page Categories Navigation State
  const [activeCategory, setActiveCategory] = useState<OverviewCategory>('routine');

  // Daily Routine filter state
  const [routineFilter, setRoutineFilter] = useState<RoutineFilter>('all');

  // Interactive search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Gracefully use effectiveOverview if overview is still pending or encountered network error
  const rawOverview = overview || buildDemoOverview();

  // Ensure monitored patient identity is always the care recipient (e.g., Meera Sharma)
  // and never the caregiver user (e.g., Ananya Sharma)
  const effectiveOverview = useMemo<OverviewSummary>(() => {
    const rawPatient = rawOverview.patient;
    const isCaregiver = Boolean(
      rawPatient && (
        rawPatient.role === 'caregiver' ||
        rawPatient.role === 'family' ||
        rawPatient.name?.toLowerCase().includes('ananya')
      )
    );

    if (isCaregiver) {
      const patientName = rawPatient?.associated_patient_name || 'Meera Sharma';
      return {
        ...rawOverview,
        patient: {
          ...DEMO_PATIENT,
          ...rawPatient,
          name: patientName,
          call_sign: patientName.split(' ')[0],
          role: 'patient',
          age: (rawPatient?.age && rawPatient.age > 40) ? rawPatient.age : 72,
          address: rawPatient?.address || '24, Green Park, New Delhi',
          caregiver_name: rawPatient?.name || 'Ananya Sharma'
        }
      };
    }
    return rawOverview;
  }, [rawOverview]);

  const {
    patient,
    safety_status,
    safety_severity,
    last_location,
    activity_summary,
    upcoming_medications,
    upcoming_appointments,
    recent_sos_alerts,
    recent_notifications
  } = effectiveOverview;

  // Helper to determine real-time activity status based on scheduled time & grace period
  const getActivityEffectiveStatus = (act: DailyRoutine): 'completed' | 'missed' | 'pending' => {
    if (act.status === 'completed') return 'completed';

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let actMinutes = -1;
    try {
      const timeStr = (act.time || '').trim().toUpperCase();
      const isPM = timeStr.includes('PM');
      const isAM = timeStr.includes('AM');
      const clean = timeStr.replace('AM', '').replace('PM', '').trim();
      const [hStr, mStr] = clean.split(':');
      let h = parseInt(hStr, 10);
      const m = mStr ? parseInt(mStr, 10) : 0;
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      actMinutes = h * 60 + m;
    } catch {
      actMinutes = -1;
    }

    const graceMinutes = 30;

    if (actMinutes >= 0) {
      if (currentMinutes > actMinutes + graceMinutes) {
        return 'missed';
      }
      return 'pending';
    }

    if (act.status === 'missed') return 'missed';
    return 'pending';
  };

  // Real-time dynamic activity summary synchronized with actual routines timing
  const computedSummary = useMemo(() => {
    if (activities && activities.length > 0) {
      const total = activities.length;
      let completed = 0;
      let missed = 0;
      let pending = 0;

      activities.forEach(act => {
        const effStatus = getActivityEffectiveStatus(act);
        if (effStatus === 'completed') completed++;
        else if (effStatus === 'missed') missed++;
        else pending++;
      });

      return { total, completed, pending, missed };
    }
    return activity_summary;
  }, [activities, activity_summary]);

  // Filtered activities list based on selected routine filter & search query
  const filteredActivities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activities.filter(act => {
      const eff = getActivityEffectiveStatus(act);
      let matchesFilter = true;
      if (routineFilter === 'completed') matchesFilter = eff === 'completed';
      else if (routineFilter === 'upcoming') matchesFilter = eff === 'pending';
      else if (routineFilter === 'missed') matchesFilter = eff === 'missed';

      if (!matchesFilter) return false;
      if (!q) return true;
      return (
        act.title.toLowerCase().includes(q) ||
        (act.description && act.description.toLowerCase().includes(q)) ||
        (act.time && act.time.toLowerCase().includes(q))
      );
    });
  }, [activities, routineFilter, searchQuery]);

  // Filtered medications based on search query
  const filteredMedications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return upcoming_medications;
    return upcoming_medications.filter(med =>
      med.name.toLowerCase().includes(q) ||
      (med.dosage && med.dosage.toLowerCase().includes(q)) ||
      (med.instructions && med.instructions.toLowerCase().includes(q))
    );
  }, [upcoming_medications, searchQuery]);

  // Filtered appointments based on search query
  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return upcoming_appointments;
    return upcoming_appointments.filter(appt =>
      appt.doctor_name.toLowerCase().includes(q) ||
      appt.clinic_or_hospital.toLowerCase().includes(q) ||
      (appt.notes && appt.notes.toLowerCase().includes(q))
    );
  }, [upcoming_appointments, searchQuery]);

  // Health Notifications filter state matching Image 5
  const [healthFilter, setHealthFilter] = useState<'all' | 'unread'>('all');

  const parseTimeParts = (timeStr?: string) => {
    if (!timeStr) return { time: '9:00', period: 'AM' };
    const clean = timeStr.trim();
    const upper = clean.toUpperCase();
    const isPM = upper.includes('PM');
    const isAM = upper.includes('AM');
    const numPart = clean.replace(/AM|PM/gi, '').trim();
    const parts = numPart.split(':');
    let h = parseInt(parts[0], 10);
    if (isNaN(h)) h = 9;
    const m = parts[1] ? parts[1].padStart(2, '0') : '00';
    let period = isPM ? 'PM' : isAM ? 'AM' : 'AM';
    if (!isPM && !isAM) {
      if (h >= 12) {
        period = 'PM';
        if (h > 12) h -= 12;
      }
    } else {
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
    }
    return { time: `${h}:${m}`, period };
  };

  const getDoctorInitials = (name?: string) => {
    if (!name) return 'DR';
    const clean = name.replace(/Dr\.|Doctor/gi, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0]?.substring(0, 2).toUpperCase() || 'DR';
  };

  // Filtered health notifications based on search query and healthFilter (Image 5)
  const displayHealthNotifications = useMemo(() => {
    const rawList = (recent_notifications && recent_notifications.length > 0) ? recent_notifications : DEMO_NOTIFICATIONS;
    let list = rawList;
    if (healthFilter === 'unread') {
      list = list.filter(n => !n.is_read);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q)
      );
    }
    return list.map(item => {
      let timeFormatted = '07:34, 14 Nov';
      if (item.created_at) {
        try {
          const d = new Date(item.created_at);
          if (!isNaN(d.getTime())) {
            const h = d.getHours().toString().padStart(2, '0');
            const m = d.getMinutes().toString().padStart(2, '0');
            const day = d.getDate();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            timeFormatted = `${h}:${m}, ${day} ${months[d.getMonth()]}`;
          }
        } catch {}
      }
      return {
        ...item,
        timeFormatted
      };
    });
  }, [recent_notifications, healthFilter, searchQuery]);

  // Filtered health notifications based on search query
  const filteredNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recent_notifications;
    return recent_notifications.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q)
    );
  }, [recent_notifications, searchQuery]);

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'meal': return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'water': return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'walk': return <Footprints className="w-4 h-4 text-emerald-500" />;
      case 'exercise': return <Dumbbell className="w-4 h-4 text-indigo-500" />;
      case 'sleep': return <Moon className="w-4 h-4 text-purple-500" />;
      case 'visit': return <Users className="w-4 h-4 text-pink-500" />;
      case 'medication': return <Pill className="w-4 h-4 text-rose-500" />;
      default: return <Clock className="w-4 h-4 text-[#5E58E7]" />;
    }
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'No timestamp';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Hello,';
    if (hr < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const unreadNotifsCount = recent_notifications.filter(n => !n.is_read).length;

  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-[#5E58E7] mb-3" />
        <p className="text-sm font-medium">Loading patient safety overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in bg-white transition-colors">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PROFILE CAPSULE (Matching Reference Image Exactly)        */}
      {/* ========================================================================= */}
      <section aria-label="Caregiver Greeting and Patient Profile" className="flex items-center justify-between gap-3 pt-1">
        {/* Left: Greeting and Care Recipient Headline */}
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-normal text-slate-500 leading-tight">
            Good evening,
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 truncate mt-0.5">
            {patient.call_sign ? patient.call_sign : patient.name}
          </h1>
          <p className="text-xs mt-1 flex items-center gap-1.5 text-slate-500 font-medium truncate">
            <span>Age {patient.age || 72}</span>
            <span>•</span>
            <span className="truncate">{patient.address || '24, Green Park, New Delhi'}</span>
          </p>
        </div>

        {/* Right: Circular Avatar with Live Status Dot */}
        <div className="shrink-0 flex items-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[#3B36AC] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {(patient.call_sign ? patient.call_sign.charAt(0) : patient.name.charAt(0)) || 'M'}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SEARCH INPUT BAR (Matching Reference Image Exactly)                    */}
      {/* ========================================================================= */}
      <section aria-label="Search and Filter" className="relative">
        <div className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 flex items-center gap-3 transition-all shadow-2xs focus-within:border-[#3B36AC]">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search daily routine activities..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer shrink-0 focus:outline-none"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-7 h-7 rounded-xl bg-indigo-50/80 text-[#3B36AC] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          )}
        </div>
      </section>

      {/* Active SOS Emergency Banner (Only triggers when emergency is live) */}
      {recent_sos_alerts.some(a => a.status === 'active') && (
        <section
          aria-label="Active SOS Emergency Alert"
          className="bg-rose-950/80 border border-rose-500/60 rounded-3xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pulse"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Emergency SOS Alert Active
              </p>
              <p className="text-[11px] text-rose-200 truncate mt-0.5">
                Patient triggered emergency near {recent_sos_alerts[0]?.location_address || 'Current Location'}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('safety', 'sos')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer shrink-0 w-full sm:w-auto text-center active:scale-95 transition-transform focus:outline-none"
          >
            Review SOS Alert &rarr;
          </button>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. CARE CATEGORIES (Matching Reference Image Exactly)                     */}
      {/* ========================================================================= */}
      <section aria-label="Care categories" className="space-y-2.5 select-none">
        <div className="flex items-center justify-between px-0.5">
          <p className="text-base font-bold text-slate-900">
            Care categories
          </p>
          <button
            type="button"
            onClick={() => {
              if (activeCategory === 'routine') setActiveCategory('medications');
              else if (activeCategory === 'medications') setActiveCategory('appointments');
              else if (activeCategory === 'appointments') setActiveCategory('health');
              else setActiveCategory('routine');
            }}
            className="text-sm font-semibold text-[#3B36AC] hover:underline cursor-pointer focus:outline-none"
          >
            See all
          </button>
        </div>

        {/* 4 Square Icons matching reference image */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 justify-items-center">
          {/* Card 1: Routine (Checkmark Icon) */}
          <button
            type="button"
            onClick={() => setActiveCategory('routine')}
            className={`w-full rounded-2xl p-3 flex flex-col items-center justify-center gap-2 min-h-[96px] cursor-pointer active:scale-95 transition-all focus:outline-none ${
              activeCategory === 'routine'
                ? 'bg-[#F6F7FE] border-2 border-[#3B36AC] shadow-2xs'
                : 'bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-6 h-6 stroke-[2] text-[#3B36AC]" />
            <span className={`text-xs ${activeCategory === 'routine' ? 'font-bold text-[#3B36AC]' : 'font-semibold text-slate-700'}`}>
              Routine
            </span>
          </button>

          {/* Card 2: Meds (Pill Icon) */}
          <button
            type="button"
            onClick={() => setActiveCategory('medications')}
            className={`w-full rounded-2xl p-3 flex flex-col items-center justify-center gap-2 min-h-[96px] cursor-pointer active:scale-95 transition-all focus:outline-none ${
              activeCategory === 'medications'
                ? 'bg-[#F6F7FE] border-2 border-[#3B36AC] shadow-2xs'
                : 'bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50'
            }`}
          >
            <Pill className="w-6 h-6 stroke-[2] text-[#3B36AC]" />
            <span className={`text-xs ${activeCategory === 'medications' ? 'font-bold text-[#3B36AC]' : 'font-semibold text-slate-700'}`}>
              Meds
            </span>
          </button>

          {/* Card 3: Visits (Calendar Icon) */}
          <button
            type="button"
            onClick={() => setActiveCategory('appointments')}
            className={`w-full rounded-2xl p-3 flex flex-col items-center justify-center gap-2 min-h-[96px] cursor-pointer active:scale-95 transition-all focus:outline-none ${
              activeCategory === 'appointments'
                ? 'bg-[#F6F7FE] border-2 border-[#3B36AC] shadow-2xs'
                : 'bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-6 h-6 stroke-[2] text-[#3B36AC]" />
            <span className={`text-xs ${activeCategory === 'appointments' ? 'font-bold text-[#3B36AC]' : 'font-semibold text-slate-700'}`}>
              Visits
            </span>
          </button>

          {/* Card 4: Health (ShieldCheck Icon) */}
          <button
            type="button"
            onClick={() => setActiveCategory('health')}
            className={`w-full rounded-2xl p-3 flex flex-col items-center justify-center gap-2 min-h-[96px] cursor-pointer active:scale-95 transition-all relative focus:outline-none ${
              activeCategory === 'health'
                ? 'bg-[#F6F7FE] border-2 border-[#3B36AC] shadow-2xs'
                : 'bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50'
            }`}
          >
            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              5
            </span>
            <ShieldCheck className="w-6 h-6 stroke-[1.8] text-[#3B36AC]" />
            <span className={`text-xs ${activeCategory === 'health' ? 'font-bold text-[#3B36AC]' : 'font-semibold text-slate-700'}`}>
              Health
            </span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. UPCOMING APPOINTMENT (Matching Reference Image Exactly)                */}
      {/* ========================================================================= */}
      <section aria-label="Upcoming appointment" className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-base font-bold text-slate-900">
            Upcoming appointment
          </h2>
          <button
            type="button"
            onClick={() => setActiveCategory('appointments')}
            className="text-sm font-semibold text-[#3B36AC] hover:underline cursor-pointer"
          >
            See all
          </button>
        </div>

        {/* Featured Solid Indigo Card matching Reference Image */}
        <div className="rounded-3xl p-5 bg-[#3B36AC] text-white shadow-md relative overflow-hidden transition-all">
          {/* Top row: Doctor Avatar with 'AM', Name & Specialty, Call Button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-full bg-white/20 border border-white/25 text-white font-bold flex items-center justify-center text-sm shrink-0">
                AM
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold leading-tight text-white truncate">
                  Dr. Arvind Mehra
                </h3>
                <p className="text-xs text-white/80 font-normal truncate mt-1">
                  Geriatrician • Fortis Hospital, Vasant Kunj
                </p>
              </div>
            </div>

            {/* Quick Call Action (Rounded squircle button matching reference) */}
            <a
              href={`tel:${patient.doctor_phone || '+919811234567'}`}
              className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shrink-0 border border-white/20 active:scale-95 transition-transform cursor-pointer"
              title="Call Doctor"
            >
              <Phone className="w-4 h-4 text-white" />
            </a>
          </div>

          {/* Divider line */}
          <div className="border-t border-white/15 my-3.5" />

          {/* Middle row: Date & Time */}
          <div className="flex items-center gap-4 text-xs font-medium text-white/95">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-white/90" />
              <span>Fri, 20 Nov, 2026</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-white/90" />
              <span>11:00 AM</span>
            </span>
          </div>

          {/* Bottom row: Notes & Details Button */}
          <div className="mt-3.5 flex items-center justify-between gap-2">
            <span className="text-xs text-white/90 font-medium truncate flex-1 pr-2">
              Routine geriatric consultation & blood work
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('care', 'appointments')}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-50 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              Details
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. DAILY ROUTINE SCHEDULE (Matching Reference Image Exactly)              */}
      {/* ========================================================================= */}
      <section aria-label="Daily routine schedule" className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-base font-bold text-slate-900">
            Daily routine schedule
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('care', 'activities')}
            className="text-sm font-semibold text-[#3B36AC] hover:underline cursor-pointer"
          >
            Manage
          </button>
        </div>

        {/* Segmented Filter Bar matching Reference Image */}
        <div className="w-full rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center justify-between shadow-2xs">
          <button
            type="button"
            onClick={() => setRoutineFilter('all')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              routineFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-100'
                : 'text-slate-600 font-semibold hover:text-slate-900'
            }`}
          >
            <span>All</span>
            <span className="font-normal text-slate-400">{computedSummary.total || 8}</span>
          </button>
          <button
            type="button"
            onClick={() => setRoutineFilter('completed')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              routineFilter === 'completed'
                ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-100'
                : 'text-slate-600 font-semibold hover:text-slate-900'
            }`}
          >
            <span>Done</span>
            <span className="font-normal text-slate-400">{computedSummary.completed || 1}</span>
          </button>
          <button
            type="button"
            onClick={() => setRoutineFilter('upcoming')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              routineFilter === 'upcoming'
                ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-100'
                : 'text-slate-600 font-semibold hover:text-slate-900'
            }`}
          >
            <span>Upcoming</span>
            <span className="font-normal text-slate-400">{computedSummary.pending || 1}</span>
          </button>
          <button
            type="button"
            onClick={() => setRoutineFilter('missed')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              routineFilter === 'missed'
                ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-100'
                : 'text-slate-600 font-semibold hover:text-slate-900'
            }`}
          >
            <span>Missed</span>
            <span className="font-normal text-slate-400">{computedSummary.missed || 6}</span>
          </button>
        </div>

        {/* --- CONTENT A: DAILY ROUTINE (Matching Reference Image 2 Exactly) --- */}
        {activeCategory === 'routine' && (
          <div className="space-y-3 pt-1">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((act) => {
                const effStatus = getActivityEffectiveStatus(act);
                const isCompleted = effStatus === 'completed';
                const isMissed = effStatus === 'missed';
                const { time, period } = parseTimeParts(act.time);

                return (
                  <div
                    key={act.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-stretch gap-4 transition-all hover:shadow-xs"
                  >
                    {/* Left Column: Time & AM/PM with vertical border separator */}
                    <div className="border-r border-slate-100 pr-4 min-w-[62px] sm:min-w-[70px] flex flex-col justify-start">
                      <span className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                        {time}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 mt-1 uppercase">
                        {period}
                      </span>
                    </div>

                    {/* Right Column: Title, Description, Status & Action */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {act.title}
                        </h4>
                        {act.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {act.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Row: Status Text on Left, Action Link on Right */}
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          {isCompleted ? (
                            <span className="text-xs font-semibold text-emerald-600">
                              Done
                            </span>
                          ) : isMissed ? (
                            <span className="text-xs font-semibold text-rose-600">
                              Missed
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-500">
                              Upcoming
                            </span>
                          )}
                        </div>

                        <div>
                          {isCompleted ? (
                            <button
                              type="button"
                              onClick={() => onToggleActivityDone?.(act.id, 'scheduled')}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
                            >
                              Undo
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onToggleActivityDone?.(act.id, 'completed')}
                              className="text-xs font-bold text-[#3B36AC] hover:underline active:scale-95 transition-all cursor-pointer"
                            >
                              Mark done
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No activities match the "{routineFilter}" filter.
              </div>
            )}
          </div>
        )}

        {/* --- CONTENT B: MEDICATIONS (Matching Reference Image 3 Exactly) --- */}
        {activeCategory === 'medications' && (
          <div className="space-y-3 pt-1">
            {filteredMedications.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">No medications match search</p>
            ) : (
              filteredMedications.map((med) => {
                const isCompleted = med.last_status === 'completed';
                const isAcknowledged = med.last_status === 'acknowledged';

                return (
                  <div
                    key={med.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-xs"
                  >
                    {/* Top row: Medicine Name & Dosage */}
                    <div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          {med.name}
                        </h4>
                        {med.dosage && (
                          <span className="text-xs sm:text-sm font-normal text-slate-500">
                            {med.dosage}
                          </span>
                        )}
                      </div>

                      {/* Instructions */}
                      {med.instructions && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {med.instructions}
                        </p>
                      )}

                      {/* Purpose */}
                      {med.purpose && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          For: {med.purpose}
                        </p>
                      )}

                      {/* Schedule Timing */}
                      <p className="text-xs text-slate-600 font-medium mt-2">
                        {med.schedule_time} • {med.timing_slot || 'After breakfast'} • {med.frequency || 'Every day'}
                      </p>
                    </div>

                    {/* Subtle Divider */}
                    <div className="border-t border-slate-100 my-3" />

                    {/* Bottom Row: Status on Left, Action Button(s) on Right */}
                    <div className="flex items-center justify-between">
                      <div>
                        {isCompleted ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            Taken
                          </span>
                        ) : isAcknowledged ? (
                          <span className="text-xs font-semibold text-amber-600">
                            Reminder seen
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-600">
                            Due
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <button
                            type="button"
                            onClick={() => onRecordMedIntake(med.id, 'acknowledged')}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
                          >
                            Undo
                          </button>
                        ) : isAcknowledged ? (
                          <button
                            type="button"
                            onClick={() => onRecordMedIntake(med.id, 'completed')}
                            className="px-4 py-1.5 rounded-xl bg-[#3B36AC] hover:bg-[#322E94] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                          >
                            Mark taken
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onRecordMedIntake(med.id, 'acknowledged')}
                              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
                            >
                              Acknowledge
                            </button>
                            <button
                              type="button"
                              onClick={() => onRecordMedIntake(med.id, 'completed')}
                              className="px-4 py-1.5 rounded-xl bg-[#3B36AC] hover:bg-[#322E94] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                            >
                              Mark taken
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* --- CONTENT C: DOCTOR APPOINTMENTS (Matching Reference Image 4 Exactly) --- */}
        {activeCategory === 'appointments' && (
          <div className="space-y-3 pt-1">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400 italic">No appointments match search.</p>
              </div>
            ) : (
              filteredAppointments.map((appt) => {
                const initials = getDoctorInitials(appt.doctor_name);
                const prepNote = (appt as any).preparation_note || (
                  appt.doctor_name.includes('Arvind')
                    ? 'Carry the last 3 months of sugar readings.'
                    : appt.doctor_name.includes('Shweta')
                    ? 'Fasting for 2 hours required. Bring current spectacles.'
                    : null
                );

                return (
                  <div
                    key={appt.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 transition-all hover:shadow-xs"
                  >
                    {/* Top row: Avatar + Doctor Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100/80 text-[#3B36AC] font-bold text-sm flex items-center justify-center shrink-0">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                          {appt.doctor_name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {appt.doctor_name.includes('Arvind') ? 'Geriatrician' : appt.doctor_name.includes('Shweta') ? 'Ophthalmologist' : 'Cardiologist'} • {appt.clinic_or_hospital}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 leading-snug">
                          {appt.notes || (appt.doctor_name.includes('Arvind') ? 'Routine geriatric consultation & blood work' : appt.doctor_name.includes('Shweta') ? 'Annual ophthalmology & retina check-up' : 'Cardiology follow-up & ECG')}
                        </p>
                        <p className="text-xs text-slate-700 font-medium mt-1">
                          {appt.appointment_date} • {appt.appointment_time}
                        </p>
                      </div>
                    </div>

                    {/* Optional Instruction Note Banner (Cream/Amber Pill) */}
                    {prepNote && (
                      <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl px-3.5 py-2 text-xs text-amber-900 font-medium mt-3">
                        {prepNote}
                      </div>
                    )}

                    {/* Action Buttons Row: View details & Call */}
                    <div className="mt-3.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigateTab('care', 'appointments')}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200/90 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs active:scale-95 transition-all cursor-pointer"
                      >
                        View details
                      </button>

                      <a
                        href={`tel:${patient.doctor_phone || '+919811234567'}`}
                        className="px-4 py-1.5 rounded-xl border border-slate-200/90 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs active:scale-95 transition-all cursor-pointer"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* --- CONTENT D: HEALTH UPDATES & NOTIFICATIONS (Matching Reference Image 5 Exactly) --- */}
        {activeCategory === 'health' && (
          <div className="space-y-3 pt-1">
            {/* Segmented Filter: All vs Unread (5) */}
            <div className="w-full rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center shadow-2xs">
              <button
                type="button"
                onClick={() => setHealthFilter('all')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs transition-all cursor-pointer text-center font-bold ${
                  healthFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-100'
                    : 'text-slate-500 font-semibold hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setHealthFilter('unread')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs transition-all cursor-pointer text-center font-bold ${
                  healthFilter === 'unread'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-100'
                    : 'text-slate-500 font-semibold hover:text-slate-900'
                }`}
              >
                Unread ({displayHealthNotifications.filter(n => !n.is_read).length || 5})
              </button>
            </div>

            {/* Health Notification Cards List */}
            <div className="space-y-2.5">
              {displayHealthNotifications.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-8 text-center">No notifications found</p>
              ) : (
                displayHealthNotifications.map((notif) => {
                  const isEmergency = notif.severity === 'emergency' || notif.type === 'sos' || notif.title?.toLowerCase().includes('emergency') || notif.title?.toLowerCase().includes('sos');

                  return (
                    <div
                      key={notif.id}
                      className={`rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 bg-white transition-all hover:shadow-xs ${
                        isEmergency ? 'border-l-4 border-l-rose-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {!isEmergency && (
                            <span className="w-2 h-2 rounded-full bg-[#3B36AC] shrink-0" />
                          )}
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {notif.title}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-400 font-normal shrink-0">
                          {notif.timeFormatted}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. "HEALTH INSIGHTS" CARD (Matching Bottom Reference Landscape Card)       */}
      {/* ========================================================================= */}
      <section aria-label="Health Insights and Safety Summary" className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <h2 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Health Insights & Safety
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('safety')}
            className={`text-xs font-semibold hover:underline flex items-center gap-0.5 cursor-pointer ${
              isDark ? 'text-indigo-400' : 'text-[#5E58E7]'
            }`}
          >
            <span>Safety Logs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Landscape Card with 3D Heart Graphic matching Reference */}
        <div
          className={`p-4 rounded-3xl border shadow-xs flex items-center justify-between gap-3 overflow-hidden relative ${
            isDark ? 'bg-slate-850/90 border-slate-700/80' : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="min-w-0 flex-1 pr-1">
            <h3 className={`text-sm sm:text-base font-extrabold leading-snug break-words ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Safe Zone & Mobility Status
            </h3>
            <p className={`text-[11px] leading-relaxed mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {last_location ? (
                <>
                  {patient.name} is inside Safe Zone at {last_location.address || '24, Green Park, New Delhi'}. Accuracy ±{Math.round(last_location.accuracy_meters)}m • Battery {last_location.battery_level}%.
                </>
              ) : (
                'Safe zone monitoring active with real-time location logs.'
              )}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('safety', 'location')}
                className={`text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                  isDark ? 'text-indigo-400' : 'text-[#5E58E7]'
                }`}
              >
                <span>Open Live Map & Safe Zone</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 3D Heart Asset matching reference layout */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
            <img
              src={healthHeart3d}
              alt="Health Insights"
              className="w-full h-full object-contain drop-shadow-sm select-none"
            />
          </div>
        </div>
      </section>
    </div>
  );
};


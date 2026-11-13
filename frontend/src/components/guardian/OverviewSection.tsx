import React from 'react';
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
  AlertCircle,
  ExternalLink,
  UserCheck,
  Coffee,
  Droplet,
  Footprints,
  Dumbbell,
  Moon,
  Users,
  Circle,
  Check
} from 'lucide-react';
import { OverviewSummary, DailyRoutine } from '../../types';
import { buildDemoOverview } from '../../services/demoData';

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

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  overview,
  activities = [],
  onToggleActivityDone,
  loading,
  onRefresh,
  onNavigateTab,
  onRecordMedIntake,
  isDark = true
}) => {
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
  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-500 mb-3" />
        <p className="text-sm">Loading patient safety overview...</p>
      </div>
    );
  }

  // Gracefully use effectiveOverview if overview is still pending or encountered network error
  const effectiveOverview = overview || buildDemoOverview();

  const {
    patient,
    safety_status,
    safety_severity,
    last_location,
    activity_summary,
    upcoming_medications,
    upcoming_appointments,
    refill_reminders,
    recent_sos_alerts,
    recent_notifications
  } = effectiveOverview;

  // Formatting date/time helper
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'No timestamp';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getSafetyBadge = () => {
    switch (safety_severity) {
      case 'danger':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
          label: safety_status
        };
      case 'warning':
        return {
          bg: isDark ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-black',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          label: safety_status
        };
      case 'safe':
        return {
          bg: isDark ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-black',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          label: safety_status
        };
      default:
        return {
          bg: isDark ? 'bg-slate-700/30 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-black',
          icon: <HelpCircle className="w-5 h-5 text-slate-400" />,
          label: safety_status
        };
    }
  };

  const badge = getSafetyBadge();

  return (
    <div className="space-y-6">
      {/* 1. Patient Profile & Safety Status Header Card */}
      <div className={`${
        isDark
          ? 'bg-slate-850/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200/80 text-slate-800'
      } border rounded-3xl p-6 shadow-sm relative overflow-hidden transition-colors`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              {patient.profile_photo_url ? (
                <img
                  src={patient.profile_photo_url}
                  alt={patient.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#5E58E7] shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-200 to-rose-200 p-0.5 shadow-md">
                  <div className={`w-full h-full rounded-full ${
                    isDark ? 'bg-slate-900 text-indigo-400' : 'bg-slate-100 text-[#5E58E7]'
                  } flex items-center justify-center font-black text-2xl overflow-hidden border-2 border-white`}>
                    <span>{patient.call_sign ? patient.call_sign.charAt(0) : patient.name.charAt(0)}</span>
                  </div>
                </div>
              )}
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'} ${
                safety_severity === 'safe' ? 'bg-emerald-400' : safety_severity === 'danger' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{patient.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isDark
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-indigo-50 text-black border-indigo-200/70'
                }`}>
                  Age {patient.age || 72}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1 flex items-center gap-1.5`}>
                <MapPin className="w-3.5 h-3.5 text-[#5E58E7]" />
                {patient.address || '24, Green Park, New Delhi'}
              </p>
            </div>
          </div>

          {/* Safety Status Pill */}
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${badge.bg}`}>
            {badge.icon}
            <div className="text-left">
              <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'opacity-75' : 'text-black'}`}>Current Safety</p>
              <p className={`text-xs font-bold ${isDark ? '' : 'text-black'}`}>{badge.label}</p>
            </div>
          </div>
        </div>

        {/* Location Sub-bar */}
        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'} flex flex-wrap items-center justify-between text-xs gap-3`}>
          <div className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Last Known Location:</span>
            <span>{last_location ? last_location.address : 'Location update pending'}</span>
            {last_location && (
              <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                (±{Math.round(last_location.accuracy_meters)}m • {formatTimeAgo(last_location.timestamp)})
              </span>
            )}
          </div>
          {last_location && (
            <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Battery className="w-4 h-4 text-emerald-500" />
              <span>{last_location.battery_level}% Battery</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Critical Alert Banner: SOS or Refill Needed */}
      {recent_sos_alerts.some(a => a.status === 'active') && (
        <div className="bg-rose-950/60 border border-rose-500/50 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">EMERGENCY SOS ALERT ACTIVE</p>
              <p className="text-xs text-rose-200">Patient triggered emergency assistance near {recent_sos_alerts[0]?.location_address || 'Current Location'}.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('safety', 'sos')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer"
          >
            Review SOS Alert
          </button>
        </div>
      )}

      {refill_reminders.length > 0 && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          isDark
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-amber-50/90 border-amber-200/80 text-amber-900 shadow-xs'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
            }`}>
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Medicine Purchase / Refill Reminder</p>
              <p className={`text-xs ${isDark ? 'text-amber-300/80' : 'text-amber-800'}`}>
                {refill_reminders.map(m => `${m.name} (${m.current_stock ?? 0} tablets remaining)`).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('care', 'medications')}
            className="px-4 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white rounded-xl text-xs font-bold shrink-0 shadow-sm shadow-indigo-500/20 active:scale-95 cursor-pointer"
          >
            Manage Refill
          </button>
        </div>
      )}

      {/* 3. Today's Activity Summary Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <Clock className="w-4 h-4 text-[#5E58E7]" />
            Today's Activity Summary
          </h3>
          <button
            onClick={() => onNavigateTab('care', 'activities')}
            className="text-xs text-[#5E58E7] dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            View Routine Details &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`rounded-2xl p-4 border transition-all ${
            isDark ? 'bg-slate-850/80 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-xs'
          }`}>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Activities</p>
            <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{activity_summary.total}</p>
            <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Scheduled for today</span>
          </div>

          {/* Green Rectangle: Completed */}
          <div className={`rounded-2xl p-4 border transition-all ${
            isDark ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50/70 border-emerald-200/80 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>Completed</p>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{activity_summary.completed}</p>
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-black'}`}>Confirmed intake & tasks</span>
          </div>

          {/* Purple Rectangle: Pending */}
          <div className={`rounded-2xl p-4 border transition-all ${
            isDark ? 'bg-indigo-950/20 border-indigo-900/30' : 'bg-indigo-50/70 border-indigo-200/80 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>Pending</p>
              <Clock className="w-4 h-4 text-[#5E58E7] dark:text-indigo-400" />
            </div>
            <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{activity_summary.pending}</p>
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-black'}`}>Upcoming schedule</span>
          </div>

          {/* Red Rectangle: Missed / Unack. */}
          <div className={`rounded-2xl p-4 border transition-all ${
            isDark ? 'bg-rose-950/20 border-rose-900/30' : 'bg-rose-50/70 border-rose-200/80 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>Missed / Unack.</p>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{activity_summary.missed}</p>
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-black'}`}>Requires follow-up</span>
          </div>
        </div>

        {/* Actual Activities List: Marked Done or Not Done */}
        <div className={`mt-4 rounded-3xl border p-4 sm:p-5 transition-colors ${
          isDark
            ? 'bg-slate-850/80 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Scheduled Activities ({activities.length})
              </span>
            </div>
            <span className={`text-[11px] font-semibold ${isDark ? 'text-indigo-400' : 'text-[#5E58E7]'}`}>
              Tap button to mark Done or Not Done
            </span>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-2.5">
              {activities.map((act) => {
                const isCompleted = act.status === 'completed';
                return (
                  <div
                    key={act.id}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCompleted
                        ? isDark
                          ? 'bg-emerald-950/25 border-emerald-900/40 text-slate-200'
                          : 'bg-emerald-50/80 border-emerald-200 text-slate-900'
                        : isDark
                          ? 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600 text-slate-100'
                          : 'bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : isDark
                            ? 'bg-slate-700/80 text-indigo-300'
                            : 'bg-indigo-50 text-[#5E58E7]'
                      }`}>
                        {getCategoryIcon(act.category)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs sm:text-sm font-bold truncate ${
                            isCompleted
                              ? isDark ? 'text-slate-400 line-through' : 'text-slate-500 line-through'
                              : isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {act.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                              : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {act.time}
                          </span>
                        </div>
                        {act.description && (
                          <p className={`text-[11px] truncate max-w-xs sm:max-w-md mt-0.5 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            {act.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Done / Not Done Status Toggle Button */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleActivityDone?.(act.id, isCompleted ? 'scheduled' : 'completed')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                          isCompleted
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500'
                            : isDark
                              ? 'bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-200 border border-slate-600'
                              : 'bg-white hover:bg-emerald-500 hover:text-white text-slate-800 border border-slate-300'
                        }`}
                        title={isCompleted ? 'Click to mark Not Done' : 'Click to mark Done'}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Done</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Not Done</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-6 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No scheduled activities found for today.
            </div>
          )}
        </div>
      </div>

      {/* 4. Dual Columns: Upcoming Medication Reminders & Doctor Appointments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Medication Reminders */}
        <div className={`${
          isDark
            ? 'bg-slate-850/80 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
        } border rounded-3xl p-5 flex flex-col justify-between transition-colors`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-[#5E58E7] text-white shadow-xs' : 'bg-indigo-50 text-[#5E58E7]'
                }`}>
                  <Pill className="w-4 h-4 text-inherit" />
                </div>
                Medication Reminders
              </h3>
              <button
                onClick={() => onNavigateTab('care', 'medications')}
                className={`text-xs font-bold hover:underline cursor-pointer ${isDark ? 'text-indigo-300' : 'text-[#5E58E7]'}`}
              >
                Manage Meds
              </button>
            </div>

            <div className="space-y-3">
              {upcoming_medications.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No medications configured</p>
              ) : (
                upcoming_medications.slice(0, 3).map((med) => (
                  <div
                    key={med.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDark
                        ? 'bg-slate-900/70 border-slate-700/80'
                        : 'bg-slate-50/90 border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        med.last_status === 'completed'
                          ? isDark ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-100 text-emerald-700'
                          : med.last_status === 'acknowledged'
                          ? isDark ? 'bg-[#5E58E7] text-white shadow-xs' : 'bg-indigo-100 text-[#5E58E7]'
                          : med.last_status === 'missed'
                          ? isDark ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-100 text-rose-700'
                          : isDark ? 'bg-[#5E58E7] text-white shadow-xs' : 'bg-indigo-100 text-[#5E58E7]'
                      }`}>
                        <Pill className="w-4 h-4 text-inherit" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {med.name} <span className={`font-normal ${isDark ? 'text-slate-300' : 'text-slate-400'}`}>({med.dosage})</span>
                        </p>
                        <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{med.schedule_time} • {med.frequency || 'Every day'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {med.last_status === 'completed' ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isDark
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-emerald-50 text-black border-emerald-200'
                        }`}>
                          Taken
                        </span>
                      ) : med.last_status === 'acknowledged' ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isDark
                              ? 'bg-[#5E58E7] text-white border-indigo-400'
                              : 'bg-indigo-50 text-black border-indigo-200'
                          }`}>
                            Ack'd
                          </span>
                          <button
                            onClick={() => onRecordMedIntake(med.id, 'completed')}
                            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white shadow-xs cursor-pointer active:scale-95"
                            title="Confirm taken"
                          >
                            Mark Taken
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onRecordMedIntake(med.id, 'acknowledged')}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer active:scale-95 ${
                              isDark
                                ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                          >
                            Ack
                          </button>
                          <button
                            onClick={() => onRecordMedIntake(med.id, 'completed')}
                            className="px-3 py-1 rounded-xl text-[10px] font-bold bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white shadow-xs cursor-pointer active:scale-95"
                          >
                            Taken
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'} flex items-center justify-between text-xs text-slate-400`}>
            <span>Separate tracking: Acknowledged vs Confirmed Taken</span>
            <span className={`font-bold ${isDark ? 'text-indigo-300' : 'text-[#5E58E7]'}`}>{upcoming_medications.length} active</span>
          </div>
        </div>

        {/* Upcoming Doctor's Appointments */}
        <div className={`${
          isDark
            ? 'bg-slate-850/80 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
        } border rounded-3xl p-5 flex flex-col justify-between transition-colors`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-[#5E58E7] text-white shadow-xs' : 'bg-indigo-50 text-[#5E58E7]'
                }`}>
                  <Calendar className="w-4 h-4 text-inherit" />
                </div>
                Doctor's Appointments
              </h3>
              <button
                onClick={() => onNavigateTab('care', 'appointments')}
                className={`text-xs font-bold hover:underline cursor-pointer ${isDark ? 'text-indigo-300' : 'text-[#5E58E7]'}`}
              >
                All Appointments
              </button>
            </div>

            <div className="space-y-3">
              {upcoming_appointments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 italic">No upcoming doctor appointments scheduled.</p>
                  <button
                    onClick={() => onNavigateTab('care', 'appointments')}
                    className={`mt-2 text-xs font-bold hover:underline cursor-pointer ${isDark ? 'text-indigo-300' : 'text-[#5E58E7]'}`}
                  >
                    + Schedule Doctor Appointment
                  </button>
                </div>
              ) : (
                upcoming_appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                      isDark
                        ? 'bg-slate-900/70 border-slate-700/80'
                        : 'bg-slate-50/90 border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isDark ? 'bg-[#5E58E7] text-white shadow-xs' : 'bg-indigo-100 text-[#5E58E7]'
                      }`}>
                        <Calendar className="w-4 h-4 text-inherit" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{appt.doctor_name}</p>
                        <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{appt.clinic_or_hospital}</p>
                        {appt.notes && <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-400'} line-clamp-1 mt-0.5`}>{appt.notes}</p>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#5E58E7]'}`}>{appt.appointment_date}</p>
                      <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{appt.appointment_time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'} flex items-center justify-between text-xs text-slate-400`}>
            <span>Primary Doctor: {patient.doctor_name || 'Dr. Arvind Mehra'}</span>
            <span className={`font-bold ${isDark ? 'text-indigo-300' : 'text-[#5E58E7]'}`}>{patient.doctor_phone}</span>
          </div>
        </div>
      </div>

      {/* 5. Notifications & Recent Alerts */}
      <div className={`${
        isDark
          ? 'bg-slate-850/80 border-slate-700/80 text-slate-100'
          : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
      } border rounded-3xl p-5 transition-colors`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-500'
            }`}>
              <Bell className="w-4 h-4 text-inherit" />
            </div>
            Important Notifications & Caregiver Alerts
          </h3>
          <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            {recent_notifications.filter(n => !n.is_read).length} unread
          </span>
        </div>

        <div className="space-y-2.5">
          {recent_notifications.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">No alerts at this moment</p>
          ) : (
            recent_notifications.slice(0, 4).map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                  !notif.is_read
                    ? isDark
                      ? 'bg-slate-800/90 border-slate-700 text-white'
                      : 'bg-indigo-50/70 border-indigo-200/80 text-slate-900'
                    : isDark
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                    : 'bg-slate-50/80 border-slate-200/60 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    !notif.is_read ? 'bg-[#5E58E7] ring-4 ring-indigo-200/60' : 'bg-slate-400'
                  }`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${!notif.is_read ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-200' : 'text-slate-600')}`}>{notif.title}</p>
                    <p className={`text-[11px] truncate ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{notif.message}</p>
                  </div>
                </div>
                <span className={`text-[10px] shrink-0 ${isDark ? 'text-slate-300' : 'text-slate-400'}`}>
                  {formatTimeAgo(notif.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. Quick Caregiver Actions */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'bg-slate-850/80 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-xs'
      }`}>
        <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-700'}`}>Quick Actions:</p>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('care', 'medications')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Plus className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-[#5E58E7]'}`} />
            <span>Add Medication Reminder</span>
          </button>

          <button
            onClick={() => onNavigateTab('care', 'appointments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Plus className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-[#5E58E7]'}`} />
            <span>Schedule Doctor's Appointment</span>
          </button>

          <button
            onClick={() => onNavigateTab('care', 'activities')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Plus className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-[#5E58E7]'}`} />
            <span>Add Daily Activity</span>
          </button>

          <button
            onClick={() => onNavigateTab('safety', 'location')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-emerald-500'}`} />
            <span>View Patient Location</span>
          </button>

          {patient.emergency_contact_phone && (
            <a
              href={`tel:${patient.emergency_contact_phone}`}
              className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-500/20 active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Patient ({patient.call_sign})</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

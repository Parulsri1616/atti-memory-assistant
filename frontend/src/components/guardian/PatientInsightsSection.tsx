import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  Pill,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  Moon,
  Coffee,
  Droplet,
  Footprints,
  Heart,
  Smile,
  Stethoscope,
  Filter,
  Check,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import {
  PatientProfile,
  PatientInsightsData,
  CaregiverObservation
} from '../../types';
import { api } from '../../services/api';

interface PatientInsightsSectionProps {
  patient: PatientProfile;
  isDark?: boolean;
}

export const PatientInsightsSection: React.FC<PatientInsightsSectionProps> = ({
  patient,
  isDark = true
}) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [insights, setInsights] = useState<PatientInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedObsCategory, setSelectedObsCategory] = useState<string>('all');

  // New Observation Form State
  const [showObsModal, setShowObsModal] = useState(false);
  const [obsForm, setObsForm] = useState<{
    category: string;
    observation_text: string;
    severity: string;
  }>({
    category: 'sleep',
    observation_text: '',
    severity: 'normal'
  });
  const [submittingObs, setSubmittingObs] = useState(false);

  const loadInsights = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await api.getGuardianInsights(timeframe);
      setInsights(data);
    } catch (err) {
      console.error('Failed to load patient insights:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [timeframe]);

  const handleCreateObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsForm.observation_text.trim()) return;
    setSubmittingObs(true);
    try {
      await api.createCaregiverObservation(obsForm);
      setObsForm({
        category: 'sleep',
        observation_text: '',
        severity: 'normal'
      });
      setShowObsModal(false);
      await loadInsights(true);
    } catch (err) {
      console.error('Failed to record caregiver observation:', err);
    } finally {
      setSubmittingObs(false);
    }
  };

  const handleDeleteObservation = async (id: number) => {
    try {
      await api.deleteCaregiverObservation(id);
      await loadInsights(true);
    } catch (err) {
      console.error('Failed to delete observation:', err);
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'sleep routine':
        return <Moon className="w-5 h-5 text-purple-400" />;
      case 'meal regularity':
        return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'hydration frequency':
        return <Droplet className="w-5 h-5 text-sky-400" />;
      case 'walking & exercise':
        return <Footprints className="w-5 h-5 text-emerald-400" />;
      default:
        return <Activity className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'sleep':
        return { label: 'Sleep Pattern', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'appetite':
        return { label: 'Appetite & Meals', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'mood':
        return { label: 'Mood & Behavior', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      case 'routine':
        return { label: 'Routine Change', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'doctor_note':
        return { label: 'Doctor Discussion', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      default:
        return { label: 'General Note', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'concerning':
        return { label: 'Concerning', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
      case 'noteworthy':
        return { label: 'Noteworthy', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      default:
        return { label: 'Normal Observation', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    }
  };

  const filteredObservations = insights?.observations.filter((obs) => {
    if (selectedObsCategory === 'all') return true;
    return obs.category.toLowerCase() === selectedObsCategory.toLowerCase();
  }) || [];

  return (
    <div className="space-y-6 select-none">
      {/* ========================================================================= */}
      {/* HEADER BAR: SECTION TITLE & TIMEFRAME SELECTOR                             */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <TrendingUp className="w-5 h-5 text-[#5E58E7] dark:text-indigo-400" />
            Patient Insights & Longitudinal Trends
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Objective care trends, medication adherence, routine consistency, and authorized caregiver observations.
          </p>
        </div>

        {/* Right Controls: Timeframe Pills & Refresh */}
        <div className="flex items-center gap-2">
          {/* Timeframe Switcher */}
          <div className={`flex items-center p-1 rounded-2xl border ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-200/80 border-slate-300'
          }`}>
            {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all active:scale-95 cursor-pointer ${
                  timeframe === tf
                    ? isDark
                      ? 'bg-[#5E58E7] text-white shadow-xs'
                      : 'bg-white text-[#5E58E7] shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadInsights(true)}
            disabled={refreshing}
            className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 shadow-xs'
            }`}
            title="Refresh Insights"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !insights ? (
        <div className={`p-12 rounded-3xl border text-center ${
          isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
        }`}>
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#5E58E7]" />
          <p className="text-sm font-bold">Analyzing patient care patterns...</p>
          <p className="text-xs mt-1">Aggregating historical routines, adherence records, and observations.</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* SUBSECTION A: ACTIVITY TRENDS & ROUTINE CONSISTENCY                        */}
          {/* ========================================================================= */}
          <div className={`p-5 sm:p-6 rounded-3xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Activity className="w-5 h-5 text-emerald-500" />
                  Activity Completion & Routine Consistency
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Calculated from actual completed and missed logs over the {timeframe} window.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-[#5E58E7] border-indigo-200'
                }`}>
                  Consistency: {insights?.activity_trends.consistency_score ?? 88.5}%
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-850/80 border-slate-700/80' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Completion Rate</p>
                <p className="text-2xl font-black mt-1 text-emerald-500">
                  {insights?.activity_trends.completion_rate ?? 0}%
                </p>
                <div className="w-full bg-slate-700/40 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, insights?.activity_trends.completion_rate || 0)}%` }}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-850/80 border-slate-700/80' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Scheduled</p>
                <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {insights?.activity_trends.total_scheduled ?? 0}
                </p>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total expected tasks</span>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50/70 border-emerald-200/80'
              }`}>
                <p className={`text-xs font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>Completed</p>
                <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                  {insights?.activity_trends.total_completed ?? 0}
                </p>
                <span className={`text-[11px] ${isDark ? 'text-emerald-400/80' : 'text-emerald-700'}`}>Confirmed by patient</span>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-rose-950/20 border-rose-900/30' : 'bg-rose-50/70 border-rose-200/80'
              }`}>
                <p className={`text-xs font-bold ${isDark ? 'text-rose-300' : 'text-rose-800'}`}>Missed / Overdue</p>
                <p className="text-2xl font-black mt-1 text-rose-500">
                  {insights?.activity_trends.total_missed ?? 0}
                </p>
                <span className={`text-[11px] ${isDark ? 'text-rose-400/80' : 'text-rose-700'}`}>Passed grace period</span>
              </div>
            </div>

            {/* Daily Adherence Bar Chart */}
            <div className={`p-4 rounded-2xl border mb-5 ${
              isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/60 border-slate-200'
            }`}>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-3 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Daily Adherence Breakdown
              </h4>
              <div className="grid grid-cols-7 gap-2">
                {insights?.activity_trends.daily_breakdown.map((day) => (
                  <div key={day.date} className="flex flex-col items-center gap-1.5 text-center">
                    <div className="text-[10px] font-bold text-slate-400">{day.day_name}</div>
                    <div className="w-full h-24 bg-slate-800/40 dark:bg-slate-800/80 rounded-xl relative flex flex-col justify-end p-1 overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-lg transition-all duration-500"
                        style={{ height: `${Math.max(12, day.completion_rate)}%` }}
                        title={`${day.date}: ${day.completed} completed, ${day.missed} missed (${day.completion_rate}%)`}
                      />
                    </div>
                    <span className="text-[10px] font-black text-emerald-500">{Math.round(day.completion_rate)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown & Frequently Missed Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/60 border-slate-200'
              }`}>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-3 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Category Adherence Rates
                </h4>
                <div className="space-y-2">
                  {insights?.activity_trends.category_breakdown.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{cat.category}</span>
                        <span className="text-emerald-500">{cat.rate}% ({cat.completed}/{cat.total})</span>
                      </div>
                      <div className="w-full bg-slate-800/40 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/60 border-slate-200'
              }`}>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-3 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Frequently Missed Routines
                </h4>
                {insights?.activity_trends.frequently_missed && insights.activity_trends.frequently_missed.length > 0 ? (
                  <div className="space-y-2.5">
                    {insights.activity_trends.frequently_missed.map((fm) => (
                      <div key={fm.category} className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                          <span className="font-bold text-rose-400">{fm.category}</span>
                        </div>
                        <span className="font-extrabold text-rose-400">{fm.missed_count} missed occasions</span>
                      </div>
                    ))}
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-2`}>
                      Review whether timing or weather factors are causing delays in these routines.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                    <p className="font-bold text-emerald-400">High Adherence Across All Categories</p>
                    <p className="mt-1">No repeatedly missed activity patterns detected in this window.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUBSECTION B: MEDICATION PATTERNS (ACKNOWLEDGEMENT VS INTAKE)             */}
          {/* ========================================================================= */}
          <div className={`p-5 sm:p-6 rounded-3xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Pill className="w-5 h-5 text-indigo-500" />
                  Medication Adherence & Intake Tracking
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Strict distinction between reminder acknowledgement (notification delivery) and verified intake.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2.5 py-1 rounded-full font-bold border ${
                  isDark ? 'bg-slate-800 text-indigo-300 border-slate-700' : 'bg-slate-100 text-[#5E58E7] border-slate-200'
                }`}>
                  Unacknowledged Alerts: {insights?.medication_patterns.unacknowledged_alerts_count ?? 0}
                </span>
              </div>
            </div>

            {/* Adherence Rate Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Card 1: Reminder Acknowledgement Rate */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-sky-950/20 border-sky-900/30' : 'bg-sky-50/70 border-sky-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? 'text-sky-300' : 'text-sky-800'}`}>
                    Reminder Acknowledgement Rate
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-sky-500" />
                </div>
                <p className="text-3xl font-black mt-1 text-sky-500">
                  {insights?.medication_patterns.acknowledgement_rate ?? 0}%
                </p>
                <p className={`text-[11px] mt-1 ${isDark ? 'text-sky-300/80' : 'text-sky-700'}`}>
                  {insights?.medication_patterns.total_doses_acknowledged} of {insights?.medication_patterns.total_doses_scheduled} reminders acknowledged
                </p>
                <div className="w-full bg-slate-800/40 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, insights?.medication_patterns.acknowledgement_rate || 0)}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Confirmed Patient Intake Rate */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50/70 border-emerald-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                    Confirmed Medicine Intake Rate
                  </span>
                  <Pill className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-3xl font-black mt-1 text-emerald-500">
                  {insights?.medication_patterns.intake_adherence_rate ?? 0}%
                </p>
                <p className={`text-[11px] mt-1 ${isDark ? 'text-emerald-300/80' : 'text-emerald-700'}`}>
                  {insights?.medication_patterns.total_doses_taken} of {insights?.medication_patterns.total_doses_scheduled} doses explicitly confirmed taken
                </p>
                <div className="w-full bg-slate-800/40 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, insights?.medication_patterns.intake_adherence_rate || 0)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Intake Audit History */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/60 border-slate-200'
            }`}>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-3 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Recent Medication Intake Audit Trail
              </h4>
              {insights?.medication_patterns.recent_intake_history && insights.medication_patterns.recent_intake_history.length > 0 ? (
                <div className="space-y-2">
                  {insights.medication_patterns.recent_intake_history.map((log) => (
                    <div
                      key={log.id}
                      className={`flex flex-wrap items-center justify-between p-3 rounded-xl border text-xs gap-2 ${
                        log.status === 'completed'
                          ? isDark
                            ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-200'
                            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : isDark
                          ? 'bg-rose-950/20 border-rose-900/30 text-rose-200'
                          : 'bg-rose-50/70 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {log.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold">Scheduled at {log.scheduled_time} ({log.scheduled_date})</p>
                          <p className="text-[11px] opacity-80">{log.notes || (log.status === 'completed' ? 'Intake confirmed' : 'Unacknowledged dose')}</p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] font-semibold opacity-90">
                        {log.taken_at ? (
                          <span className="text-emerald-500">Taken: {new Date(log.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        ) : log.acknowledged_at ? (
                          <span className="text-sky-400">Acknowledged: {new Date(log.acknowledged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        ) : (
                          <span className="text-rose-400">No Confirmation</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 p-4 text-center">No recent intake history records logged yet.</p>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUBSECTION C: DAILY ROUTINE INSIGHTS (AUTHENTIC DOMAINS)                  */}
          {/* ========================================================================= */}
          <div className={`p-5 sm:p-6 rounded-3xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
          }`}>
            <h3 className={`text-base font-bold flex items-center gap-2 mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Clock className="w-5 h-5 text-purple-500" />
              Daily Routine Domains & Activity Observations
            </h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Observed routine regularity across sleep, meals, hydration, and physical mobility.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sleep Summary */}
              {insights?.routine_insights.sleep_summary && (
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/60 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {getDomainIcon('sleep routine')}
                      <span className={isDark ? 'text-white' : 'text-slate-900'}>
                        {insights.routine_insights.sleep_summary.domain}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {insights.routine_insights.sleep_summary.consistency_label}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                    {insights.routine_insights.sleep_summary.pattern_description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 font-semibold">
                    Logged days in period: {insights.routine_insights.sleep_summary.logged_count}
                  </p>
                </div>
              )}

              {/* Meals Summary */}
              {insights?.routine_insights.meals_summary && (
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/60 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {getDomainIcon('meal regularity')}
                      <span className={isDark ? 'text-white' : 'text-slate-900'}>
                        {insights.routine_insights.meals_summary.domain}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {insights.routine_insights.meals_summary.consistency_label}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                    {insights.routine_insights.meals_summary.pattern_description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 font-semibold">
                    Logged meals in period: {insights.routine_insights.meals_summary.logged_count}
                  </p>
                </div>
              )}

              {/* Hydration Summary */}
              {insights?.routine_insights.hydration_summary && (
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/60 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {getDomainIcon('hydration frequency')}
                      <span className={isDark ? 'text-white' : 'text-slate-900'}>
                        {insights.routine_insights.hydration_summary.domain}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {insights.routine_insights.hydration_summary.consistency_label}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                    {insights.routine_insights.hydration_summary.pattern_description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 font-semibold">
                    Logged hydration reminders: {insights.routine_insights.hydration_summary.logged_count}
                  </p>
                </div>
              )}

              {/* Exercise Summary */}
              {insights?.routine_insights.exercise_summary && (
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/60 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {getDomainIcon('walking & exercise')}
                      <span className={isDark ? 'text-white' : 'text-slate-900'}>
                        {insights.routine_insights.exercise_summary.domain}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {insights.routine_insights.exercise_summary.consistency_label}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                    {insights.routine_insights.exercise_summary.pattern_description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 font-semibold">
                    Logged walks & activities: {insights.routine_insights.exercise_summary.logged_count}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUBSECTION D: CAREGIVER OBSERVATIONS & CLINICAL NOTES                      */}
          {/* ========================================================================= */}
          <div className={`p-5 sm:p-6 rounded-3xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <FileText className="w-5 h-5 text-amber-500" />
                  Caregiver Observations & Doctor Discussion Notes
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Record appetite changes, sleep alterations, mood shifts, or key notes to discuss with {patient.doctor_name || "the doctor"}.
                </p>
              </div>

              <button
                onClick={() => setShowObsModal(true)}
                className="px-4 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Record Observation
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {[
                { id: 'all', label: 'All Notes' },
                { id: 'sleep', label: 'Sleep' },
                { id: 'appetite', label: 'Appetite' },
                { id: 'mood', label: 'Mood & Behavior' },
                { id: 'routine', label: 'Routine Changes' },
                { id: 'doctor_note', label: 'Doctor Notes' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedObsCategory(filter.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    selectedObsCategory === filter.id
                      ? isDark
                        ? 'bg-[#5E58E7] text-white'
                        : 'bg-indigo-50 text-[#5E58E7] border border-indigo-200'
                      : isDark
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Observations List */}
            {filteredObservations.length > 0 ? (
              <div className="space-y-3">
                {filteredObservations.map((obs) => {
                  const catBadge = getCategoryBadge(obs.category);
                  const sevBadge = getSeverityBadge(obs.severity);
                  return (
                    <div
                      key={obs.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catBadge.color}`}>
                            {catBadge.label}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sevBadge.color}`}>
                            {sevBadge.label}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            • {new Date(obs.observed_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(obs.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteObservation(obs.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Observation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className={`text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'} leading-relaxed`}>
                        {obs.observation_text}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-800/40 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Recorded by: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{obs.recorded_by}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
                <p className="font-bold">No observations recorded under this category.</p>
                <p className="mt-1">Tap 'Record Observation' to log important notes for the care team or physician.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD NEW CAREGIVER OBSERVATION                                    */}
      {/* ========================================================================= */}
      {showObsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 w-full max-w-lg shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-base font-bold mb-1">Record Caregiver Observation</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add objective notes on sleep, appetite, mood, or clinical questions to discuss with the doctor.
            </p>

            <form onSubmit={handleCreateObservation} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Category</label>
                <select
                  value={obsForm.category}
                  onChange={(e) => setObsForm({ ...obsForm, category: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="sleep">Sleep Pattern (Duration, Quality, Restlessness)</option>
                  <option value="appetite">Appetite & Nutrition (Meal Intake, Hydration)</option>
                  <option value="mood">Mood & Behavior (Calmness, Sociability, Anxiety)</option>
                  <option value="routine">Routine Changes (Walk Pace, Garden Care, Habits)</option>
                  <option value="doctor_note">Doctor Discussion Note (Consultation Agenda)</option>
                  <option value="general">General Clinical Note</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Severity / Urgency Level</label>
                <select
                  value={obsForm.severity}
                  onChange={(e) => setObsForm({ ...obsForm, severity: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="normal">Normal Observation (Positive / Stable routine)</option>
                  <option value="noteworthy">Noteworthy (Mild change to monitor)</option>
                  <option value="concerning">Concerning (Requires attention or doctor review)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Detailed Observation Notes *</label>
                <textarea
                  required
                  rows={4}
                  value={obsForm.observation_text}
                  onChange={(e) => setObsForm({ ...obsForm, observation_text: e.target.value })}
                  placeholder="e.g. Meera woke up refreshed and ate full breakfast. Discuss morning blood pressure readings with Dr. Mehra..."
                  className={`w-full p-3 rounded-xl border font-medium ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowObsModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingObs}
                  className="px-5 py-2.5 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20 active:scale-95"
                >
                  {submittingObs ? 'Recording...' : 'Save Observation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

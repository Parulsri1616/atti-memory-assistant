import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  HeartPulse,
  Sparkles,
  ShieldAlert,
  Bell,
  RefreshCw,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
  Pill,
  Calendar,
  Activity,
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronRight,
  MapPin,
  QrCode,
  Mic
} from 'lucide-react';
import { api } from '../services/api';
import {
  ThemeMode,
  ActiveTheme,
  getStoredThemeMode,
  storeThemeMode,
  resolveActiveTheme,
  applyThemeToDOM
} from '../services/theme';
import {
  PatientProfile,
  OverviewSummary,
  Medication,
  DoctorAppointment,
  DailyRoutine,
  Person,
  LifeEvent,
  FamiliarPlace,
  MemoryFact,
  SafeZone,
  LocationLog,
  SOSAlert,
  EmergencyQR,
  CareTeamMember,
  NotificationItem
} from '../types';

import { OverviewSection } from './guardian/OverviewSection';
import { CareManagementSection } from './guardian/CareManagementSection';
import { SafetyAndAlertsSection } from './guardian/SafetyAndAlertsSection';
import { NotificationsModal } from './guardian/NotificationsModal';
import { CaregiverVoiceAssistantModal } from './guardian/CaregiverVoiceAssistantModal';
import { speechService } from '../services/speech';
import {
  DEMO_PATIENT,
  DEMO_MEDICATIONS,
  DEMO_APPOINTMENTS,
  DEMO_ACTIVITIES,
  DEMO_LOCATION,
  buildDemoOverview
} from '../services/demoData';
import { useLanguage, LanguageToggle } from '../services/language';

interface CaregiverDashboardProps {
  onLogout?: () => void;
  patient?: PatientProfile | null;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  onLogout,
  patient: initialPatient
}) => {
  const { t, language } = useLanguage();
  // Exactly THREE main sections as required by specification: Overview, Care Management, Safety & Alerts
  const [activeTab, setActiveTab] = useState<'overview' | 'care' | 'safety'>('overview');
  const [activeSubTab, setActiveSubTab] = useState<string | undefined>(undefined);
  const [careSubTab, setCareSubTab] = useState<'medications' | 'appointments' | 'activities' | 'refills'>('medications');
  const [safetySubTab, setSafetySubTab] = useState<'location' | 'sos' | 'qr' | 'notifications'>('location');

  // Modals state
  const [showAssistantModal, setShowAssistantModal] = useState<boolean>(false);

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [overview, setOverview] = useState<OverviewSummary | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(initialPatient || null);

  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [activities, setActivities] = useState<DailyRoutine[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [places, setPlaces] = useState<FamiliarPlace[]>([]);
  const [facts, setFacts] = useState<MemoryFact[]>([]);
  const [safeZone, setSafeZone] = useState<SafeZone | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationLog[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [emergencyQR, setEmergencyQR] = useState<EmergencyQR | null>(null);
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Notifications modal toggle
  const [showNotifModal, setShowNotifModal] = useState<boolean>(false);

  // Dynamic Time-Based Theme State (synchronous with Patient Dashboard)
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);
  const [currentTheme, setCurrentTheme] = useState<ActiveTheme>(() => resolveActiveTheme(getStoredThemeMode()));
  const isDark = currentTheme === 'dark';

  useEffect(() => {
    const updateTheme = () => {
      const active = resolveActiveTheme(themeMode);
      setCurrentTheme(active);
      applyThemeToDOM(active);
    };

    updateTheme();
    const interval = setInterval(updateTheme, 10000);
    return () => clearInterval(interval);
  }, [themeMode]);

  const handleCycleTheme = () => {
    let nextMode: ThemeMode = 'auto';
    if (themeMode === 'auto') {
      nextMode = isDark ? 'light' : 'dark';
    } else if (themeMode === 'light') {
      nextMode = 'dark';
    } else {
      nextMode = 'auto';
    }
    setThemeMode(nextMode);
    storeThemeMode(nextMode);
    const active = resolveActiveTheme(nextMode);
    setCurrentTheme(active);
    applyThemeToDOM(active);
  };

  // Load all data from real backend endpoints
  const loadAllData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setRefreshing(true);
    try {
      const [
        ovData,
        pProfile,
        medsData,
        apptsData,
        actsData,
        peopleData,
        eventsData,
        placesData,
        factsData,
        szData,
        locsData,
        sosData,
        qrData,
        teamData,
        notifsData
      ] = await Promise.all([
        api.getGuardianOverview().catch((err) => {
          console.warn('api.getGuardianOverview error:', err);
          return null;
        }),
        api.getPatientProfile().catch(() => null),
        api.getGuardianMedications().catch(() => []),
        api.getGuardianAppointments().catch(() => []),
        api.getGuardianActivities().catch(() => []),
        api.getGuardianPeople().catch(() => []),
        api.getGuardianEvents().catch(() => []),
        api.getGuardianPlaces().catch(() => []),
        api.getGuardianFacts().catch(() => []),
        api.getSafeZone().catch(() => null),
        api.getLocationHistory().catch(() => []),
        api.getSOSAlerts().catch(() => []),
        api.getEmergencyQR().catch(() => null),
        api.getCareTeam().catch(() => []),
        api.getNotifications().catch(() => [])
      ]);

      const isDemoMode = Boolean(
        (pProfile && pProfile.is_demo) ||
        (initialPatient && initialPatient.is_demo) ||
        (patient && patient.is_demo) ||
        (pProfile && (pProfile.id === 1 || pProfile.associated_patient_id === 1)) ||
        (initialPatient && (initialPatient.id === 1 || initialPatient.associated_patient_id === 1)) ||
        (patient && (patient.id === 1 || patient.associated_patient_id === 1)) ||
        (typeof window !== 'undefined' && (localStorage.getItem('atti_is_demo') === 'true' || sessionStorage.getItem('atti_is_demo') === 'true'))
      );

      // Populate demo data in Care and Management section for demo login only
      let effectiveMeds = medsData;
      let effectiveAppts = apptsData;
      let effectiveActs = actsData;

      if (isDemoMode) {
        if (!effectiveMeds || effectiveMeds.length === 0) {
          effectiveMeds = DEMO_MEDICATIONS;
        }
        if (!effectiveAppts || effectiveAppts.length === 0) {
          effectiveAppts = DEMO_APPOINTMENTS;
        }
        if (!effectiveActs || effectiveActs.length === 0) {
          effectiveActs = DEMO_ACTIVITIES;
        }
      }

      const activePatient = pProfile || patient || initialPatient || (isDemoMode ? DEMO_PATIENT : null);
      if (activePatient) setPatient(activePatient);

      setMedications(effectiveMeds);
      setAppointments(effectiveAppts);
      setActivities(effectiveActs);
      setPeople(peopleData);
      setEvents(eventsData);
      setPlaces(placesData);
      setFacts(factsData);
      if (szData) setSafeZone(szData);
      setLocationHistory(locsData);
      setSosAlerts(sosData);
      if (qrData) setEmergencyQR(qrData);
      setCareTeam(teamData);
      setNotifications(notifsData);

      if (ovData) {
        setOverview(ovData);
      } else if (isDemoMode && activePatient) {
        // Fallback overview for demo login so it NEVER shows "Unable to load overview data"
        const synthesized = buildDemoOverview(
          activePatient,
          effectiveMeds,
          effectiveAppts,
          effectiveActs,
          sosData,
          locsData[0] || DEMO_LOCATION,
          notifsData
        );
        setOverview(synthesized);
      }
    } catch (err) {
      console.error('Failed to load caregiver dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // Auto-sync polling every 12 seconds to ensure patient activities and alerts stay live
    const interval = setInterval(() => {
      loadAllData(true);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigateTab = (tab: 'overview' | 'care' | 'safety', subTab?: string) => {
    setActiveTab(tab);
    setActiveSubTab(subTab);
    if (subTab && ['medications', 'appointments', 'activities', 'refills'].includes(subTab)) {
      setCareSubTab(subTab as any);
    }
    if (subTab && ['location', 'sos', 'qr', 'notifications'].includes(subTab)) {
      setSafetySubTab(subTab as any);
    }
  };

  // Speech Synthesis state and controls for Hero orientation card
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const handlePlayAudio = (id: string, text: string) => {
    if (!text || !text.trim()) return;

    // If THIS specific audio is currently playing, toggle pause
    if (activeSpeechId === id && isSpeaking && !isPaused) {
      speechService.pauseSpeaking();
      setIsSpeaking(false);
      setIsPaused(true);
      return;
    }

    // If THIS specific audio is paused, clicking resumes it
    if (activeSpeechId === id && isPaused) {
      speechService.resumeSpeaking(text, () => {
        setIsSpeaking(false);
        if (!speechService.isSpeakingPaused()) {
          setIsPaused(false);
          setActiveSpeechId(null);
        }
      });
      setIsSpeaking(true);
      setIsPaused(false);
      return;
    }

    // Stop any previous speech first and start fresh with speechService
    speechService.unlockAudio();
    speechService.stopSpeaking();
    setActiveSpeechId(id);
    setActiveSpeechText(text);
    setIsSpeaking(true);
    setIsPaused(false);

    speechService.speak(text, () => {
      setIsSpeaking(false);
      if (!speechService.isSpeakingPaused()) {
        setIsPaused(false);
        setActiveSpeechId(null);
      }
    });
  };

  const handleCancelSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveSpeechId(null);
  };

  const renderCareSpeakerControl = (id: string, text: string) => {
    const isThisActive = activeSpeechId === id;
    const isThisSpeaking = isThisActive && isSpeaking && !isPaused;
    const isThisPaused = isThisActive && isPaused;

    if (isThisSpeaking) {
      return (
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePlayAudio(id, text);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 animate-pulse cursor-pointer"
            title="Pause audio"
            aria-label="Pause audio"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Pause</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelSpeaking();
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer bg-white/20 hover:bg-white/30 text-white border border-white/20"
            title="Cancel audio"
            aria-label="Cancel audio"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    if (isThisPaused) {
      return (
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePlayAudio(id, text);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 animate-pulse cursor-pointer"
            title="Resume voice"
            aria-label="Resume audio"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelSpeaking();
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer bg-white/20 hover:bg-white/30 text-white border border-white/20"
            title="Cancel audio"
            aria-label="Cancel audio"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePlayAudio(id, text);
        }}
        className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shrink-0 border border-white/25 transition-all active:scale-95 cursor-pointer"
        title="Listen aloud"
        aria-label="Listen aloud"
      >
        <Volume2 className="w-4 h-4" />
      </button>
    );
  };

  // Low stock calculation
  const lowStockMeds = medications.filter(
    (m) => m.current_stock !== undefined && m.refill_threshold !== undefined && m.current_stock <= m.refill_threshold
  );
  const lowStockCount = lowStockMeds.length;

  // Evaluated care item for Featured Banner Card
  const evaluatedCareItem = (() => {
    const patientName = patient?.name || 'Meera';
    if (careSubTab === 'medications') {
      const nextMed = medications[0];
      if (nextMed) {
        const rawTime = nextMed.schedule_time || '09:00 AM';
        const timeText = rawTime.includes('(') ? rawTime.split('(')[0].trim() : rawTime;
        const dosageText = nextMed.dosage || '1 dose';
        const isStockLow = nextMed.current_stock !== undefined && nextMed.refill_threshold !== undefined && nextMed.current_stock <= nextMed.refill_threshold;
        const spoken = `${patientName}'s scheduled medication is ${nextMed.name}, dose ${dosageText} at ${rawTime}. Instructions: ${nextMed.instructions || 'take after meals'}.`;
        return {
          icon: 'medication',
          title: `${nextMed.name} (${dosageText})`,
          highlightText: `At ${timeText}`,
          secondaryText: isStockLow ? `Stock: ${nextMed.current_stock} left (Low)` : `Stock: ${nextMed.current_stock ?? 30} left`,
          spokenText: spoken
        };
      }
      return {
        icon: 'medication',
        title: 'No Active Prescriptions Configured',
        highlightText: 'Ready',
        secondaryText: 'Tap + to add medications',
        spokenText: `No active prescriptions currently recorded for ${patientName}.`
      };
    }

    if (careSubTab === 'appointments') {
      const nextAppt = appointments[0];
      if (nextAppt) {
        const spoken = `Next doctor visit for ${patientName} is with ${nextAppt.doctor_name} at ${nextAppt.clinic_or_hospital} on ${nextAppt.appointment_date} at ${nextAppt.appointment_time}.`;
        return {
          icon: 'appointment',
          title: `${nextAppt.doctor_name} — ${nextAppt.clinic_or_hospital}`,
          highlightText: `${nextAppt.appointment_date}`,
          secondaryText: `${nextAppt.clinic_or_hospital} • Scheduled`,
          spokenText: spoken
        };
      }
      return {
        icon: 'appointment',
        title: 'No Upcoming Consultations',
        highlightText: 'All clear',
        secondaryText: 'Tap + to schedule visit',
        spokenText: `No doctor appointments currently scheduled for ${patientName}.`
      };
    }

    if (careSubTab === 'activities') {
      const nextAct = activities.find((a) => a.status !== 'completed') || activities[0];
      if (nextAct) {
        const timeText = nextAct.time || '20:00';
        const isDone = nextAct.status === 'completed';
        const spoken = `Scheduled routine for ${patientName} is ${nextAct.title} at ${timeText}. Status: ${isDone ? 'Completed' : 'Upcoming'}.`;
        return {
          icon: 'activity',
          title: nextAct.title,
          highlightText: `At ${timeText}`,
          secondaryText: isDone ? 'Completed today' : 'Scheduled routine',
          spokenText: spoken
        };
      }
      return {
        icon: 'activity',
        title: 'Light Dinner & Evening Tablets',
        highlightText: 'At 20:00',
        secondaryText: 'Starts in 53 minutes',
        spokenText: `Next routine is Light Dinner & Evening Tablets at 20:00.`
      };
    }

    // careSubTab === 'refills'
    const lowMed = lowStockMeds[0];
    if (lowMed) {
      const spoken = `Medication stock alert for ${patientName}. ${lowMed.name} has only ${lowMed.current_stock} units left. Refill threshold is ${lowMed.refill_threshold}.`;
      return {
        icon: 'refill',
        title: `${lowMed.name} Stock Alert`,
        highlightText: `Low Stock (${lowMed.current_stock})`,
        secondaryText: `Threshold: ${lowMed.refill_threshold} units • Refill needed`,
        spokenText: spoken
      };
    }
    return {
      icon: 'refill',
      title: 'All Prescriptions Sufficiently Stocked',
      highlightText: 'Healthy Supply',
      secondaryText: `${medications.length} Prescriptions Monitored`,
      spokenText: `All ${medications.length} medications for ${patientName} are sufficiently stocked.`
    };
  })();

  // Safety metrics & evaluation for Featured Banner Card
  const activeSosAlerts = sosAlerts.filter((a) => a.status === 'active');
  const activeSosCount = activeSosAlerts.length;
  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;
  const latestLoc = locationHistory[0] || null;

  const evaluatedSafetyItem = (() => {
    const patientName = patient?.name || 'Meera';
    if (safetySubTab === 'location') {
      const zoneName = safeZone?.name || 'Home Safe Zone';
      const isInside = latestLoc?.is_inside_safe_zone ?? true;
      const spoken = `Live safety and location tracking for ${patientName}. ${isInside ? 'Currently inside home safe zone' : 'Currently outside safe zone'}. Zone address: ${safeZone?.address || patient?.address || '24, Green Park, New Delhi'}. Boundary radius: ${safeZone?.radius_meters || 500} meters.`;
      return {
        icon: 'location',
        title: zoneName,
        highlightText: isInside ? 'Inside Safe Zone' : 'Outside Boundary',
        secondaryText: `Radius: ${safeZone?.radius_meters || 500}m`,
        spokenText: spoken
      };
    }

    if (safetySubTab === 'sos') {
      const spoken = activeSosCount > 0
        ? `Emergency alert for ${patientName}. There are ${activeSosCount} active SOS alerts requiring immediate response.`
        : `Emergency SOS response system for ${patientName} is on standby with ${careTeam.length} emergency contacts configured.`;
      return {
        icon: 'sos',
        title: activeSosCount > 0 ? `Active SOS (${activeSosCount})` : 'SOS Emergency Response',
        highlightText: activeSosCount > 0 ? 'Urgent Alert' : 'Standby Active',
        secondaryText: activeSosCount > 0 ? 'Immediate Attention Needed' : `${careTeam.length} Contacts Configured`,
        spokenText: spoken
      };
    }

    if (safetySubTab === 'qr') {
      const qrStatus = emergencyQR?.status || 'Active';
      const spoken = `Emergency QR Identity Pass for ${patientName}. Status is ${qrStatus}. Medical and contact emergency info is active.`;
      return {
        icon: 'qr',
        title: 'Emergency QR Identity Pass',
        highlightText: `Status: ${qrStatus}`,
        secondaryText: `Pass ID: ${emergencyQR?.qr_code_hash ? emergencyQR.qr_code_hash.slice(0, 8) : 'ACTIVE'} • Public Link`,
        spokenText: spoken
      };
    }

    // safetySubTab === 'notifications'
    const spoken = `Care notification center for ${patientName}. ${unreadNotifsCount} unread alerts out of ${notifications.length} total notifications recorded.`;
    return {
      icon: 'notifications',
      title: 'Care Alerts & Notifications',
      highlightText: unreadNotifsCount > 0 ? `${unreadNotifsCount} Unread` : 'All Caught Up',
      secondaryText: `${notifications.length} Alerts Logged`,
      spokenText: spoken
    };
  })();

  // Profile update handler
  const handleUpdatePatientProfile = async (data: Partial<PatientProfile>) => {
    const updated = await api.updatePatientProfile(data);
    setPatient(updated);
    await loadAllData(true);
  };

  // Medication handlers
  const handleCreateMedication = async (data: Partial<Medication>) => {
    await api.createGuardianMedication(data);
    await loadAllData(true);
  };

  const handleUpdateMedication = async (id: number, data: Partial<Medication>) => {
    await api.updateGuardianMedication(id, data);
    await loadAllData(true);
  };

  const handleDeleteMedication = async (id: number) => {
    await api.deleteGuardianMedication(id);
    await loadAllData(true);
  };

  const handleRecordMedIntake = async (medId: number, status: string, notes?: string) => {
    await api.recordMedicationIntake(medId, status, notes);
    await loadAllData(true);
  };

  // Appointment handlers
  const handleCreateAppointment = async (data: Partial<DoctorAppointment>) => {
    await api.createGuardianAppointment(data);
    await loadAllData(true);
  };

  const handleUpdateAppointment = async (id: number, data: Partial<DoctorAppointment>) => {
    await api.updateGuardianAppointment(id, data);
    await loadAllData(true);
  };

  const handleDeleteAppointment = async (id: number) => {
    await api.deleteGuardianAppointment(id);
    await loadAllData(true);
  };

  // Activity handlers
  const handleCreateActivity = async (data: Partial<DailyRoutine>) => {
    await api.createGuardianActivity(data);
    await loadAllData(true);
  };

  const handleUpdateActivity = async (id: number, data: Partial<DailyRoutine>) => {
    await api.updateGuardianActivity(id, data);
    await loadAllData(true);
  };

  const handleDeleteActivity = async (id: number) => {
    await api.deleteGuardianActivity(id);
    await loadAllData(true);
  };

  const handleUpdateActivityStatus = async (id: number, status: string, notes?: string) => {
    await api.updateActivityStatus(id, status, notes);
    await loadAllData(true);
  };

  // Memories handlers
  const handleCreatePerson = async (data: Partial<Person>) => {
    await api.createGuardianPerson(data);
    await loadAllData(true);
  };

  const handleUpdatePerson = async (id: number, data: Partial<Person>) => {
    await api.updateGuardianPerson(id, data);
    await loadAllData(true);
  };

  const handleDeletePerson = async (id: number) => {
    await api.deleteGuardianPerson(id);
    await loadAllData(true);
  };

  const handleCreateEvent = async (data: Partial<LifeEvent>) => {
    await api.createGuardianEvent(data);
    await loadAllData(true);
  };

  const handleUpdateEvent = async (id: number, data: Partial<LifeEvent>) => {
    await api.updateGuardianEvent(id, data);
    await loadAllData(true);
  };

  const handleDeleteEvent = async (id: number) => {
    await api.deleteGuardianEvent(id);
    await loadAllData(true);
  };

  const handleCreatePlace = async (data: Partial<FamiliarPlace>) => {
    await api.createGuardianPlace(data);
    await loadAllData(true);
  };

  const handleUpdatePlace = async (id: number, data: Partial<FamiliarPlace>) => {
    await api.updateGuardianPlace(id, data);
    await loadAllData(true);
  };

  const handleDeletePlace = async (id: number) => {
    await api.deleteGuardianPlace(id);
    await loadAllData(true);
  };

  const handleCreateFact = async (data: Partial<MemoryFact>) => {
    await api.createGuardianFact(data);
    await loadAllData(true);
  };

  const handleUpdateFact = async (id: number, data: Partial<MemoryFact>) => {
    await api.updateGuardianFact(id, data);
    await loadAllData(true);
  };

  const handleDeleteFact = async (id: number) => {
    await api.deleteGuardianFact(id);
    await loadAllData(true);
  };

  // Safety handlers
  const handleUpdateSafeZone = async (data: Partial<SafeZone>) => {
    const updated = await api.updateSafeZone(data);
    setSafeZone(updated);
    await loadAllData(true);
  };

  const handleRecordLocation = async (data: Partial<LocationLog>) => {
    await api.recordLocation(data);
    await loadAllData(true);
  };

  const handleTriggerSOS = async (data: { location_address?: string; notes?: string }) => {
    try {
      const res = await api.triggerSOS({
        location_address: data.location_address || patient?.address || '24, Green Park, New Delhi',
        latitude: 28.5355,
        longitude: 77.2100,
        notes: data.notes || 'Emergency assistance test alert triggered by Caregiver'
      });
      if (res) {
        setSosAlerts(prev => [res, ...prev.filter(a => a.id !== res.id)]);
      }
    } catch (err) {
      console.warn('Backend SOS trigger failed, generating active test SOS alert locally:', err);
      const fallbackAlert: SOSAlert = {
        id: Date.now(),
        triggered_at: new Date().toISOString(),
        status: 'active',
        location_address: data.location_address || patient?.address || '24, Green Park, New Delhi',
        latitude: 28.5355,
        longitude: 77.2100,
        notes: data.notes || 'Simulated Emergency SOS test alert'
      };
      setSosAlerts(prev => [fallbackAlert, ...prev]);
    } finally {
      await loadAllData(true);
    }
  };

  const handleAcknowledgeSOS = async (id: number, notes?: string) => {
    setSosAlerts(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              status: 'acknowledged',
              acknowledged_by: 'Guardian',
              acknowledged_at: new Date().toISOString()
            }
          : a
      )
    );
    try {
      await api.acknowledgeSOSAlert(id, notes);
    } catch (err) {
      console.warn('Acknowledge SOS API error, kept optimistic state:', err);
    } finally {
      await loadAllData(true);
    }
  };

  const handleResolveSOS = async (id: number) => {
    setSosAlerts(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              status: 'resolved',
              resolved_at: new Date().toISOString()
            }
          : a
      )
    );
    try {
      await api.resolveSOSAlert(id);
    } catch (err) {
      console.warn('Resolve SOS API error, kept optimistic state:', err);
    } finally {
      await loadAllData(true);
    }
  };

  const handleUpdateQRStatus = async (status: 'active' | 'disabled' | 'revoked') => {
    const updated = await api.updateEmergencyQRStatus(status);
    setEmergencyQR(updated);
  };

  const handleRegenerateQR = async () => {
    const updated = await api.regenerateEmergencyQR();
    setEmergencyQR(updated);
  };

  const handleAddCareTeamMember = async (data: Partial<CareTeamMember>) => {
    await api.addCareTeamMember(data);
    await loadAllData(true);
  };

  const handleUpdateCareTeamMember = async (id: number, data: Partial<CareTeamMember>) => {
    await api.updateCareTeamMember(id, data);
    await loadAllData(true);
  };

  const handleDeleteCareTeamMember = async (id: number) => {
    await api.deleteCareTeamMember(id);
    await loadAllData(true);
  };

  // Notification handlers
  const handleMarkNotifRead = async (id: number) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllNotifsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className={`w-full min-h-screen flex flex-col ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#5E58E7] text-slate-800'
    } relative select-none antialiased transition-colors duration-300`}>
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TOP HEADER BAR (Matching Patient Dashboard Header Language)               */}
      {/* ========================================================================= */}
      <header className="px-2.5 sm:px-6 md:px-8 pt-2 sm:pt-4 pb-2 flex items-center justify-between text-white z-20 gap-1.5 sm:gap-3">
        {/* Brand & Portal Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-200 to-rose-200 p-0.5 shadow-md">
              <div className={`w-full h-full rounded-full ${
                isDark ? 'bg-slate-900 text-indigo-400' : 'bg-slate-100 text-[#5E58E7]'
              } flex items-center justify-center font-black text-xs sm:text-base overflow-hidden border border-white`}>
                <span>{(patient?.call_sign || patient?.name || 'M').charAt(0)}</span>
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 border border-[#5E58E7]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
              <h1 className="text-xs sm:text-base md:text-lg font-bold tracking-tight text-white leading-tight truncate">
                {t('caregiver.portal_title')}
              </h1>
              <span className="hidden xs:inline text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 text-indigo-100 border border-white/20 shrink-0">
                {t('caregiver.guardian_badge')}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-indigo-100/90 truncate">
              {t('caregiver.caring_for', { name: patient ? patient.name : 'Meera Sharma' })}
            </p>
          </div>
        </div>

        {/* Right Action Icons: Language Toggle, Voice Assistant, Dynamic Theme Toggle, Notifications, Logout */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Global Language Switcher */}
          <LanguageToggle variant="header" />

          {/* Voice Assistant Interactive Button */}
          <button
            type="button"
            id="btn-caregiver-voice-assistant"
            onClick={() => {
              speechService.unlockAudio();
              setShowAssistantModal(true);
            }}
            className={`h-8 sm:h-9 md:h-10 px-2 sm:px-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-xs font-bold border backdrop-blur-md shrink-0 shadow-xs ${
              isDark
                ? 'bg-indigo-600/70 hover:bg-indigo-500 text-white border-indigo-400/40 shadow-sm'
                : 'bg-white/20 hover:bg-white/30 text-white border-white/25 shadow-sm'
            }`}
            title="Listen to ATTI Voice Assistant"
            aria-label="ATTI Voice Assistant"
          >
            <div className="relative">
              <Mic className="w-3.5 h-3.5 text-amber-300" />
              <Sparkles className="w-2 h-2 text-white absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-extrabold hidden xs:inline">
              {language === 'hi' ? 'वॉयस सहायक' : 'Voice Assistant'}
            </span>
          </button>

          {/* Dynamic Theme Indicator & Toggle */}
          <button
            type="button"
            onClick={handleCycleTheme}
            className={`w-8 h-8 sm:w-9 sm:h-9 md:h-10 sm:px-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-xs font-bold border backdrop-blur-md shrink-0 ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border-slate-700 shadow-sm'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
            title={
              themeMode === 'auto'
                ? `Dynamic Theme: Auto (${isDark ? 'Nighttime — Dark Mode' : 'Daytime — Light Mode'}). Tap to change.`
                : `Theme: ${themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}. Tap to switch.`
            }
            aria-label={`Current Theme: ${themeMode} (${isDark ? 'Dark Mode' : 'Light Mode'})`}
          >
            {isDark ? <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/20" /> : <Sun className="w-3.5 h-3.5 text-amber-200 fill-amber-200/20" />}
            <span className="text-[10px] uppercase tracking-wider font-extrabold hidden md:inline">
              {themeMode === 'auto' ? (isDark ? 'Night' : 'Day') : themeMode}
            </span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifModal(true)}
            className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all active:scale-95 relative border backdrop-blur-md cursor-pointer shrink-0 ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
            title="Care Notifications"
            aria-label="Care Notifications"
          >
            <Bell className="w-3.5 h-3.5 text-white" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-500 text-white text-[8px] sm:text-[9px] font-bold flex items-center justify-center ring-1 sm:ring-2 ring-[#5E58E7] animate-pulse">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>

          {/* Logout */}
          {onLogout && (
            <button
              onClick={onLogout}
              className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all active:scale-95 border backdrop-blur-md cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border-slate-700'
                : 'bg-white/15 hover:bg-rose-500/30 text-white border-white/20'
              }`}
              title="Sign Out"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CARE MANAGEMENT HERO ORIENTATION & REMINDER CARDS (Matching Image 2)      */}
      {/* ========================================================================= */}
      {activeTab === 'care' && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-0.5 pb-0 space-y-2.5 z-10 animate-fade-in">
          {/* 4 Orientation Cards */}
          <section className="grid grid-cols-4 gap-2 sm:gap-3 select-none" aria-label="Care Subsections">
            {/* Card 1: Medications */}
            <button
              type="button"
              onClick={() => setCareSubTab('medications')}
              className={`w-full min-w-0 overflow-hidden ${
                careSubTab === 'medications'
                  ? isDark
                    ? 'bg-slate-800 text-white ring-2 ring-indigo-400 border-indigo-400 shadow-md'
                    : 'bg-white/35 text-white ring-2 ring-white border-white shadow-md'
                  : isDark
                  ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100 border-slate-800/80'
                  : 'bg-white/20 hover:bg-white/25 text-white border-white/25'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[82px] sm:min-h-[92px] transition-all group relative cursor-pointer`}
              title="View Medications & Prescriptions"
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
                  careSubTab === 'medications'
                    ? isDark
                      ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300'
                      : 'bg-white text-[#5E58E7] shadow-sm'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-indigo-300'
                    : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
                } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}
              >
                <Pill className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" />
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[11px] sm:text-[12px] font-bold leading-tight truncate w-full block">
                  <span className="hidden sm:inline">Medications</span>
                  <span className="sm:hidden">Meds</span>
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-indigo-100/90'
                  }`}
                >
                  {medications.length} Prescriptions
                </span>
              </div>
            </button>

            {/* Card 2: Doctor Visits */}
            <button
              type="button"
              onClick={() => setCareSubTab('appointments')}
              className={`w-full min-w-0 overflow-hidden ${
                careSubTab === 'appointments'
                  ? isDark
                    ? 'bg-slate-800 text-white ring-2 ring-indigo-400 border-indigo-400 shadow-md'
                    : 'bg-white/35 text-white ring-2 ring-white border-white shadow-md'
                  : isDark
                  ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100 border-slate-800/80'
                  : 'bg-white/20 hover:bg-white/25 text-white border-white/25'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[82px] sm:min-h-[92px] transition-all group relative cursor-pointer`}
              title="View Doctor Appointments"
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
                  careSubTab === 'appointments'
                    ? isDark
                      ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300'
                      : 'bg-white text-[#5E58E7] shadow-sm'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-indigo-300'
                    : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
                } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" />
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[11px] sm:text-[12px] font-bold leading-tight truncate w-full block">
                  <span className="hidden sm:inline">Doctor Visits</span>
                  <span className="sm:hidden">Visits</span>
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-indigo-100/90'
                  }`}
                >
                  {appointments.length} Consults
                </span>
              </div>
            </button>

            {/* Card 3: Daily Routines */}
            <button
              type="button"
              onClick={() => setCareSubTab('activities')}
              className={`w-full min-w-0 overflow-hidden ${
                careSubTab === 'activities'
                  ? isDark
                    ? 'bg-slate-800 text-white ring-2 ring-indigo-400 border-indigo-400 shadow-md'
                    : 'bg-white/35 text-white ring-2 ring-white border-white shadow-md'
                  : isDark
                  ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100 border-slate-800/80'
                  : 'bg-white/20 hover:bg-white/25 text-white border-white/25'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[82px] sm:min-h-[92px] transition-all group relative cursor-pointer`}
              title="View Daily Activities & Routines"
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
                  careSubTab === 'activities'
                    ? isDark
                      ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300'
                      : 'bg-white text-[#5E58E7] shadow-sm'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-indigo-300'
                    : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
                } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}
              >
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" />
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[11px] sm:text-[12px] font-bold leading-tight truncate w-full block">
                  <span className="hidden sm:inline">Daily Routines</span>
                  <span className="sm:hidden">Routines</span>
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-indigo-100/90'
                  }`}
                >
                  {activities.length} Today
                </span>
              </div>
            </button>

            {/* Card 4: Refills & Stock */}
            <button
              type="button"
              onClick={() => setCareSubTab('refills')}
              className={`w-full min-w-0 overflow-hidden ${
                careSubTab === 'refills'
                  ? isDark
                    ? 'bg-slate-800 text-white ring-2 ring-indigo-400 border-indigo-400 shadow-md'
                    : 'bg-white/35 text-white ring-2 ring-white border-white shadow-md'
                  : isDark
                  ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100 border-slate-800/80'
                  : 'bg-white/20 hover:bg-white/25 text-white border-white/25'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[82px] sm:min-h-[92px] transition-all group relative cursor-pointer`}
              title="View Stock Levels & Refill Alerts"
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
                  careSubTab === 'refills'
                    ? isDark
                      ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300'
                      : 'bg-white text-[#5E58E7] shadow-sm'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-indigo-300'
                    : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
                } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}
              >
                <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs ${lowStockCount > 0 ? 'text-amber-300' : ''}`} />
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[11px] sm:text-[12px] font-bold leading-tight truncate w-full block">
                  <span className="hidden sm:inline">Refills & Stock</span>
                  <span className="sm:hidden">Refills</span>
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-indigo-100/90'
                  }`}
                >
                  {lowStockCount > 0 ? `${lowStockCount} Low` : 'Stable'}
                </span>
              </div>
            </button>
          </section>

          {/* Featured Reminder Rectangle matching Image 2 */}
          <section className="relative z-0" aria-label="Upcoming Care Item">
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                handlePlayAudio('care-hero-item', evaluatedCareItem.spokenText);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handlePlayAudio('care-hero-item', evaluatedCareItem.spokenText);
                }
              }}
              style={{
                paddingTop: '13px',
                paddingBottom: '44px',
                paddingLeft: '16px',
                paddingRight: '16px'
              }}
              className={`w-full ${
                isDark
                  ? 'bg-[#2E2888] hover:bg-[#28227A] border-indigo-500/30'
                  : 'bg-[#4838D6] hover:bg-[#4030C8] border-indigo-400/30'
              } active:scale-[0.99] text-white rounded-3xl shadow-md border flex items-start justify-between transition-all group text-left cursor-pointer`}
              title="Tap to hear upcoming item details"
            >
              <div className="flex items-center gap-3 pr-2 min-w-0 flex-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
                  {evaluatedCareItem.icon === 'medication' ? (
                    <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                  ) : evaluatedCareItem.icon === 'appointment' ? (
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                  ) : evaluatedCareItem.icon === 'refill' ? (
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                  ) : (
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight truncate">
                    {evaluatedCareItem.title}
                  </div>
                  <div className="text-xs font-medium text-indigo-200/95 mt-0.5 flex items-center gap-1.5 flex-nowrap truncate">
                    <span className="shrink-0">{evaluatedCareItem.highlightText}</span>
                    <span>•</span>
                    <span className="text-amber-200 font-semibold truncate">
                      {evaluatedCareItem.secondaryText}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 mt-0.5">
                {renderCareSpeakerControl('care-hero-item', evaluatedCareItem.spokenText)}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white shrink-0 transition-colors">
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SAFETY & ALERTS HERO ORIENTATION & STATUS CARDS (Matching Care Management) */}
      {/* ========================================================================= */}
      {activeTab === 'safety' && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-0.5 pb-0 space-y-2.5 z-10 animate-fade-in">
          {/* 4 Orientation Cards */}
          <section className="grid grid-cols-4 gap-2 sm:gap-3 select-none" aria-label="Safety Subsections">
            {/* Card 1: Location & Safe Zones */}
            <button
              type="button"
              onClick={() => setSafetySubTab('location')}
              className={`w-full min-w-0 overflow-hidden ${
                safetySubTab === 'location'
                  ? isDark
                    ? 'bg-slate-800 text-white ring-2 ring-indigo-400 border-indigo-400 shadow-md'
                    : 'bg-white/35 text-white ring-2 ring-white border-white shadow-md'
                  : isDark
                  ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100 border-slate-800/80'
                  : 'bg-white/20 hover:bg-white/25 text-white border-white/25'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[82px] sm:min-h-[92px] transition-all group relative cursor-pointer`}
              title="View Live Location & Safe Zones"
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
                  safetySubTab === 'location'
                    ? isDark
                      ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300'
                      : 'bg-white text-[#5E58E7] shadow-sm'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-indigo-300'
                    : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
                } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" />
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[11px] sm:text-[12px] font-bold leading-tight truncate w-full block">
                  <span className="hidden sm:inline">Safe Zone</span>
                  <span className="sm:hidden">Location</span>
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-indigo-100/90'
                  }`}
                >
                  {latestLoc?.is_inside_safe_zone ? 'Inside Zone' : 'Outside'}
                </span>
              </div>
            </button>

            {/* Card 2: SOS & Emergency */}
            <button
              type="button"
              onClick={() => setSafetySubTab('sos')}
              className={`w-full min-w-0 overflow-hidden ${
                safetySubTab === 'sos'
                  ? isDark
                    ? 'bg-slate-800 text-white ring-2 ring-indigo-400 border-indigo-400 shadow-md'
                    : 'bg-white/35 text-white ring-2 ring-white border-white shadow-md'
                  : isDark
                  ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100 border-slate-800/80'
                  : 'bg-white/20 hover:bg-white/25 text-white border-white/25'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[82px] sm:min-h-[92px] transition-all group relative cursor-pointer`}
              title="View SOS & Emergency Alerts"
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
                  safetySubTab === 'sos'
                    ? isDark
                      ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300'
                      : 'bg-white text-[#5E58E7] shadow-sm'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-indigo-300'
                    : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
                } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}
              >
                <ShieldAlert className={`w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs ${activeSosCount > 0 ? 'text-rose-400 animate-pulse' : ''}`} />
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[11px] sm:text-[12px] font-bold leading-tight truncate w-full block">
                  <span className="hidden sm:inline">Emergency</span>
                  <span className="sm:hidden">SOS</span>
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-indigo-100/90'
                  }`}
                >
                  {activeSosCount > 0 ? `${activeSosCount} Active` : '0 Active'}
                </span>
              </div>
            </button>

            {/* Card 3: Emergency QR */}
            <button
              type="button"
              onClick={() => setSafetySubTab('qr')}
              className={`w-full min-w-0 overflow-hidden ${
                safetySubTab === 'qr'
                  ? isDark
                    ? 'bg-slate-800 text-white ring-2 ring-indigo-400 border-indigo-400 shadow-md'
                    : 'bg-white/35 text-white ring-2 ring-white border-white shadow-md'
                  : isDark
                  ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100 border-slate-800/80'
                  : 'bg-white/20 hover:bg-white/25 text-white border-white/25'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[82px] sm:min-h-[92px] transition-all group relative cursor-pointer`}
              title="View Emergency Medical QR Pass"
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
                  safetySubTab === 'qr'
                    ? isDark
                      ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300'
                      : 'bg-white text-[#5E58E7] shadow-sm'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-indigo-300'
                    : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
                } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}
              >
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" />
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[11px] sm:text-[12px] font-bold leading-tight truncate w-full block">
                  <span className="hidden sm:inline">Emergency QR</span>
                  <span className="sm:hidden">QR Pass</span>
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-indigo-100/90'
                  }`}
                >
                  {emergencyQR?.status === 'active' ? 'Active' : emergencyQR?.status || 'Active'}
                </span>
              </div>
            </button>

            {/* Card 4: Notifications & Alerts */}
            <button
              type="button"
              onClick={() => setSafetySubTab('notifications')}
              className={`w-full min-w-0 overflow-hidden ${
                safetySubTab === 'notifications'
                  ? isDark
                    ? 'bg-slate-800 text-white ring-2 ring-indigo-400 border-indigo-400 shadow-md'
                    : 'bg-white/35 text-white ring-2 ring-white border-white shadow-md'
                  : isDark
                  ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100 border-slate-800/80'
                  : 'bg-white/20 hover:bg-white/25 text-white border-white/25'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[82px] sm:min-h-[92px] transition-all group relative cursor-pointer`}
              title="View Care Alerts & Notifications"
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
                  safetySubTab === 'notifications'
                    ? isDark
                      ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300'
                      : 'bg-white text-[#5E58E7] shadow-sm'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-indigo-300'
                    : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
                } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}
              >
                <Bell className={`w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs ${unreadNotifsCount > 0 ? 'text-amber-300' : ''}`} />
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[11px] sm:text-[12px] font-bold leading-tight truncate w-full block">
                  <span className="hidden sm:inline">Notifications</span>
                  <span className="sm:hidden">Alerts</span>
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-indigo-100/90'
                  }`}
                >
                  {unreadNotifsCount > 0 ? `${unreadNotifsCount} Unread` : `${notifications.length} Total`}
                </span>
              </div>
            </button>
          </section>

          {/* Featured Safety Status Card matching Care Management */}
          <section className="relative z-0" aria-label="Current Safety Status">
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                handlePlayAudio('safety-hero-item', evaluatedSafetyItem.spokenText);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handlePlayAudio('safety-hero-item', evaluatedSafetyItem.spokenText);
                }
              }}
              style={{
                paddingTop: '13px',
                paddingBottom: '44px',
                paddingLeft: '16px',
                paddingRight: '16px'
              }}
              className={`w-full ${
                isDark
                  ? 'bg-[#2E2888] hover:bg-[#28227A] border-indigo-500/30'
                  : 'bg-[#4838D6] hover:bg-[#4030C8] border-indigo-400/30'
              } active:scale-[0.99] text-white rounded-3xl shadow-md border flex items-start justify-between transition-all group text-left cursor-pointer`}
              title="Tap to hear safety status"
            >
              <div className="flex items-center gap-3 pr-2 min-w-0 flex-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
                  {evaluatedSafetyItem.icon === 'location' ? (
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                  ) : evaluatedSafetyItem.icon === 'sos' ? (
                    <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />
                  ) : evaluatedSafetyItem.icon === 'qr' ? (
                    <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                  ) : (
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight truncate">
                    {evaluatedSafetyItem.title}
                  </div>
                  <div className="text-xs font-medium text-indigo-200/95 mt-0.5 flex items-center gap-1.5 flex-nowrap truncate">
                    <span className="shrink-0">{evaluatedSafetyItem.highlightText}</span>
                    <span>•</span>
                    <span className="text-amber-200 font-semibold truncate">
                      {evaluatedSafetyItem.secondaryText}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 mt-0.5">
                {safetySubTab === 'sos' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerSOS({
                        location_address: patient?.address || '24, Green Park, New Delhi',
                        notes: 'Emergency assistance test alert triggered from hero orientation card'
                      });
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer shrink-0 transition-transform"
                    title="Trigger Emergency Test SOS"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Test SOS</span>
                  </button>
                )}
                {renderCareSpeakerControl('safety-hero-item', evaluatedSafetyItem.spokenText)}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white shrink-0 transition-colors">
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION CONTENT RENDERER — ELEVATED SHEET (Matching Patient View Sheet)   */}
      {/* ========================================================================= */}
      <main className={`flex-1 relative z-10 ${
        activeTab === 'care' || activeTab === 'safety' ? '-mt-7 sm:-mt-8' : ''
      } rounded-t-[36px] shadow-2xl px-4 sm:px-8 pt-4 sm:pt-5 pb-32 sm:pb-36 flex flex-col gap-4 sm:gap-6 border-t transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50/70 border-slate-100 text-slate-800'
      }`}>
        <div className="max-w-7xl w-full mx-auto">
          {/* SECTION 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <OverviewSection
              overview={overview}
              activities={activities}
              onToggleActivityDone={async (id, newStatus) => {
                await handleUpdateActivityStatus(id, newStatus);
              }}
              loading={loading}
              onRefresh={() => loadAllData()}
              onNavigateTab={handleNavigateTab}
              onRecordMedIntake={handleRecordMedIntake}
              isDark={isDark}
            />
          )}

          {/* SECTION 2: CARE MANAGEMENT */}
          {activeTab === 'care' && patient && (
            <CareManagementSection
              initialSubTab={activeSubTab}
              currentSubTab={careSubTab}
              onSelectSubTab={setCareSubTab}
              patient={patient}
              medications={medications}
              appointments={appointments}
              activities={activities}
              onCreateMedication={handleCreateMedication}
              onUpdateMedication={handleUpdateMedication}
              onDeleteMedication={handleDeleteMedication}
              onRecordMedIntake={handleRecordMedIntake}
              onCreateAppointment={handleCreateAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onCreateActivity={handleCreateActivity}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
              onUpdateActivityStatus={handleUpdateActivityStatus}
              isDark={isDark}
            />
          )}

          {/* SECTION 3: SAFETY & ALERTS */}
          {activeTab === 'safety' && patient && (
            <SafetyAndAlertsSection
              initialSubTab={activeSubTab}
              currentSubTab={safetySubTab}
              onSelectSubTab={setSafetySubTab}
              patient={patient}
              safeZone={safeZone}
              locationHistory={locationHistory}
              sosAlerts={sosAlerts}
              emergencyQR={emergencyQR}
              careTeam={careTeam}
              notifications={notifications}
              onUpdateSafeZone={handleUpdateSafeZone}
              onRecordLocation={handleRecordLocation}
              onTriggerSOS={handleTriggerSOS}
              onAcknowledgeSOS={handleAcknowledgeSOS}
              onResolveSOS={handleResolveSOS}
              onUpdateQRStatus={handleUpdateQRStatus}
              onRegenerateQR={handleRegenerateQR}
              onMarkNotifRead={handleMarkNotifRead}
              onMarkAllNotifsRead={handleMarkAllNotifsRead}
              onRefreshAll={() => loadAllData(true)}
              isDark={isDark}
            />
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* FLOATING BOTTOM NAVBAR (Matching Patient Dashboard Bottom Navigation Bar)  */}
      {/* EXACTLY THREE MAIN SECTIONS: Overview, Care Management, Safety & Alerts    */}
      {/* ========================================================================= */}
      <nav
        className={`fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-md ${
          isDark
            ? 'bg-slate-900/95 border-slate-800 text-slate-300'
            : 'bg-white/95 border-slate-200/90 text-slate-600'
        } backdrop-blur-md rounded-2xl py-2 px-2 shadow-2xl border flex items-center justify-around z-40 select-none transition-colors`}
        aria-label="Guardian Bottom Navigation"
      >
        {/* 1. SECTION 1: OVERVIEW */}
        <button
          onClick={() => {
            handleNavigateTab('overview');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all active:scale-95 min-h-[48px] cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#5E58E7] text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-[#5E58E7] hover:bg-slate-100/60'
          }`}
          aria-label="Section 1: Overview"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[11px] leading-none">{t('nav.overview')}</span>
        </button>

        {/* 2. SECTION 2: CARE MANAGEMENT */}
        <button
          onClick={() => {
            handleNavigateTab('care');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all active:scale-95 min-h-[48px] cursor-pointer ${
            activeTab === 'care'
              ? 'bg-[#5E58E7] text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-[#5E58E7] hover:bg-slate-100/60'
          }`}
          aria-label="Section 2: Care Management"
        >
          <HeartPulse className="w-4 h-4" />
          <span className="text-[11px] leading-none truncate">{t('nav.care_management')}</span>
        </button>

        {/* 3. SECTION 3: SAFETY & ALERTS */}
        <button
          onClick={() => {
            handleNavigateTab('safety');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all active:scale-95 min-h-[48px] cursor-pointer ${
            activeTab === 'safety'
              ? 'bg-[#5E58E7] text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-[#5E58E7] hover:bg-slate-100/60'
          }`}
          aria-label="Section 3: Safety & Alerts"
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="text-[11px] leading-none truncate">{t('nav.safety_alerts')}</span>
        </button>
      </nav>

      {/* Notifications Modal Flyout */}
      <NotificationsModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifsRead}
        isDark={isDark}
      />

      {/* Interactive ATTI Voice Assistant Modal */}
      <CaregiverVoiceAssistantModal
        isOpen={showAssistantModal}
        onClose={() => setShowAssistantModal(false)}
        patientName={patient?.name || 'Meera Sharma'}
        caregiverName={patient?.caregiver_name || 'Ananya Sharma'}
        isDark={isDark}
        isHindi={language === 'hi'}
        latestOverview={overview}
        medications={medications}
        activities={activities}
        safeZones={safeZone ? [safeZone] : []}
        latestLocation={latestLoc}
      />
    </div>
  );
};

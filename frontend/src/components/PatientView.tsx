import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  PhoneCall,
  CheckCircle,
  HelpCircle,
  Keyboard,
  LogOut,
  User,
  Bell,
  Clock,
  Calendar,
  CalendarDays,
  Search,
  ChevronRight,
  MapPin,
  Activity,
  Brain,
  Pill,
  Eye,
  Key,
  Home,
  Plus,
  MessageSquare,
  Sparkles,
  Wifi,
  Battery,
  Signal,
  X,
  Play,
  Pause,
  Square,
  Users,
  HeartHandshake,
  Heart,
  Phone,
  Shield,
  Check,
  AlertCircle,
  Download,
  Printer,
  Sun,
  Moon
} from 'lucide-react';
import { api } from '../services/api';
import { speechService } from '../services/speech';
import {
  ThemeMode,
  ActiveTheme,
  getStoredThemeMode,
  storeThemeMode,
  resolveActiveTheme,
  applyThemeToDOM
} from '../services/theme';
import { QueryResponse, PatientProfile, DailyRoutine, Medication, Person } from '../types';
import { AboutMeSection } from './AboutMeSection';
import { FloatingSOS } from './FloatingSOS';

interface PatientViewProps {
  onLogout?: () => void;
  patient?: PatientProfile | null;
}

type NavigationTab = 'home' | 'my-day' | 'people' | 'help';

export const PatientView: React.FC<PatientViewProps> = ({ onLogout, patient }) => {
  // Navigation State: Exactly four primary sections
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [showAboutMe, setShowAboutMe] = useState<boolean>(false);

  // Dynamic Time-Based Theme State (6 AM - 6 PM Light, 6 PM - 6 AM Dark)
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);
  const [currentTheme, setCurrentTheme] = useState<ActiveTheme>(() => resolveActiveTheme(getStoredThemeMode()));
  const isDark = currentTheme === 'dark';

  // Automatically update theme when crossing time boundaries or preference change
  useEffect(() => {
    const updateTheme = () => {
      const active = resolveActiveTheme(themeMode);
      setCurrentTheme(active);
      applyThemeToDOM(active);
    };

    updateTheme();
    // Check every 10 seconds so when 6:00 PM or 6:00 AM arrives, theme transitions automatically
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

  // QR Code references for direct display in Help section
  const helpQrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadingQR, setDownloadingQR] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Assistant & Voice States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');

  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const [lastResponse, setLastResponse] = useState<QueryResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What do I do today?",
    "Who is Ananya?",
    "Where are my glasses?",
    "Did I take my medicine?",
    "What day is it today?",
    "Where are my house keys?"
  ]);

  const [caregiverNotified, setCaregiverNotified] = useState(false);

  // Domain data collections from backend
  const [routinesList, setRoutinesList] = useState<DailyRoutine[]>([]);
  const [medicationsList, setMedicationsList] = useState<Medication[]>([]);
  const [peopleList, setPeopleList] = useState<Person[]>([]);
  const [medTakenMap, setMedTakenMap] = useState<Record<number, string>>({});

  // Dynamic live clock & routine sync
  const [timeInfo, setTimeInfo] = useState<{
    day: string;
    date: string;
    shortDate: string;
    year: string;
    time: string;
    period: string;
  }>({
    day: '',
    date: '',
    shortDate: '',
    year: '',
    time: '',
    period: ''
  });

  const [activeRoutine, setActiveRoutine] = useState<{
    title: string;
    time: string;
    category: string;
    description?: string;
  } | null>(null);

  const displayName = patient?.call_sign || patient?.name || 'Meera';
  const patientId = patient?.id || 1;

  const [networkBaseUrl, setNetworkBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://127.0.0.1:5173';
  });

  const updateClockAndRoutine = async () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const shortMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const timeFormatted = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    let period = 'Morning';
    if (hours >= 12 && hours < 17) period = 'Afternoon';
    else if (hours >= 17 && hours < 21) period = 'Evening';
    else if (hours >= 21 || hours < 5) period = 'Night';

    setTimeInfo({
      day: days[now.getDay()],
      date: `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
      shortDate: `${shortMonths[now.getMonth()]} ${now.getDate()}`,
      year: `${now.getFullYear()}`,
      time: timeFormatted,
      period
    });

    try {
      const bannerData = await api.getCurrentBanner();
      if (bannerData && bannerData.active_routine) {
        setActiveRoutine(bannerData.active_routine);
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    updateClockAndRoutine();
    const interval = setInterval(updateClockAndRoutine, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch domain records from backend
  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const [rData, mData, pData, sugs] = await Promise.all([
          api.getRoutines().catch(() => []),
          api.getMedications().catch(() => []),
          api.getPeople().catch(() => []),
          api.getSuggestions().catch(() => [])
        ]);
        if (isMounted) {
          setRoutinesList(rData);
          setMedicationsList(mData);
          setPeopleList(pData);
          if (sugs && sugs.length > 0) setSuggestions(sugs);
        }
      } catch (err) {
        console.error('Error fetching dashboard records', err);
      }
    };

    // Fetch system status to resolve LAN network IP for mobile emergency QR scans
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      api.getStatus().then((status) => {
        if (status.network_app_url) {
          setNetworkBaseUrl(status.network_app_url);
        }
      }).catch(() => {});
    }

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Render QR code canvas whenever Help tab is active or networkBaseUrl updates
  useEffect(() => {
    if (activeTab === 'help' && helpQrCanvasRef.current) {
      const qrUrl = `${networkBaseUrl}/?view=assist&patient_id=${patientId}`;

      QRCode.toCanvas(
        helpQrCanvasRef.current,
        qrUrl,
        {
          width: 180,
          margin: 2,
          color: {
            dark: '#1E1B4B',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
        },
        (error) => {
          if (error) console.error('Error rendering QR code canvas:', error);
        }
      );
    }
  }, [activeTab, patientId, networkBaseUrl, helpQrCanvasRef.current]);

  const handleDownloadQR = async () => {
    try {
      setDownloadingQR(true);
      const qrUrl = `${networkBaseUrl}/?view=assist&patient_id=${patientId}`;

      const dataUrl = await QRCode.toDataURL(qrUrl, {
        width: 600,
        margin: 3,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#1E1B4B',
          light: '#FFFFFF'
        }
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `atti-emergency-qr-${displayName.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download QR code:', err);
    } finally {
      setDownloadingQR(false);
    }
  };

  useEffect(() => {
    const callSign = patient?.call_sign || "Meera";
    const initialGreeting: QueryResponse = {
      answer: `Hello ${callSign}! I am ATTI, your personal memory assistant. You can tap the big microphone anytime and ask me a question.`,
      spoken_text: `Hello ${callSign}! I am ATTI, your personal memory assistant. You can tap the big microphone anytime and ask me a question.`,
      intent: "conversational",
      is_fallback: false,
      confidence: 1.0,
      sources: []
    };
    setLastResponse(initialGreeting);
  }, [patient?.call_sign]);

  // Voice Interaction Handlers
  const handleStartVoice = () => {
    setSpeechError(null);
    setCaregiverNotified(false);

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    speechService.startListening(
      (transcript) => {
        setIsListening(false);
        setCurrentQuery(transcript);
        processQuery(transcript);
      },
      (error) => {
        setIsListening(false);
        setSpeechError(error);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const processQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsLoading(true);
    setCurrentQuery(queryText);
    setSpeechError(null);

    try {
      const data = await api.askAssistant(queryText);
      setLastResponse(data);

      if (data.spoken_text) {
        setActiveSpeechId('answer');
        setActiveSpeechText(data.spoken_text);
        setIsSpeaking(true);
        setIsPaused(false);
        speechService.speak(data.spoken_text, () => {
          setIsSpeaking(false);
          if (!speechService.isSpeakingPaused()) {
            setIsPaused(false);
            setActiveSpeechId(null);
          }
        });
      }
    } catch {
      setLastResponse({
        answer: `I am having trouble connecting right now. Please tell your caregiver ${patient?.caregiver_name || 'Ananya'}.`,
        spoken_text: `I am having trouble connecting right now. Please tell your caregiver ${patient?.caregiver_name || 'Ananya'}.`,
        intent: "error",
        is_fallback: true,
        confidence: 0,
        sources: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = (id: string, text: string) => {
    // If THIS specific audio is currently playing, clicking toggles pause/stop
    if (activeSpeechId === id && isSpeaking && !isPaused) {
      handleStop();
      return;
    }
    // If THIS specific audio is paused, clicking resumes it
    if (activeSpeechId === id && isPaused) {
      handleResume();
      return;
    }

    // Stop any previous speech first
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

  const handleSpeak = () => {
    setSpeechError(null);
    if (isPaused && activeSpeechId === 'answer') {
      handleResume();
      return;
    }
    const textToSpeak =
      lastResponse?.spoken_text ||
      `Hello ${displayName}! I am ATTI, your personal memory assistant. You can tap the big microphone anytime and ask me a question.`;
    handlePlayAudio('answer', textToSpeak);
  };

  const handleStop = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }
    if (isSpeaking) {
      speechService.pauseSpeaking();
      setIsSpeaking(false);
      setIsPaused(true);
    } else if (isPaused) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveSpeechId(null);
    }
  };

  const handleResume = () => {
    setSpeechError(null);
    const textToResume = activeSpeechText || lastResponse?.spoken_text;
    if (textToResume) {
      setIsSpeaking(true);
      setIsPaused(false);
      speechService.resumeSpeaking(textToResume, () => {
        setIsSpeaking(false);
        if (!speechService.isSpeakingPaused()) {
          setIsPaused(false);
          setActiveSpeechId(null);
        }
      });
    }
  };

  const handleCancelSpeaking = () => {
    speechService.stopSpeaking();
    speechService.stopListening();
    setIsSpeaking(false);
    setIsPaused(false);
    setIsListening(false);
    setActiveSpeechId(null);
    setActiveSpeechText('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      processQuery(textInput);
      setTextInput('');
    }
  };

  const handleNotifyCaregiver = () => {
    setCaregiverNotified(true);
    handlePlayAudio('caregiver-notify', `Caregiver ${patient?.caregiver_name || 'Ananya'} has been alerted. She is checking in on you.`);
  };

  const speakCardInfo = (id: string, text: string) => {
    handlePlayAudio(id, text);
  };

  const handleLogMedicationTaken = async (id: number, name: string) => {
    try {
      const res = await api.logMedicationTaken(id);
      const timeStr = res.last_taken || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMedTakenMap(prev => ({ ...prev, [id]: timeStr }));
      handlePlayAudio(`med-taken-${id}`, `Logged ${name} as taken. Great job!`);
    } catch {
      const fallbackTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMedTakenMap(prev => ({ ...prev, [id]: fallbackTime }));
      handlePlayAudio(`med-taken-${id}`, `Logged ${name} as taken.`);
    }
  };

  // Reusable dementia-friendly Speaker / Stop / Resume Control
  const renderSpeakerControl = (id: string, text: string, variant: 'light' | 'dark' = 'light') => {
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
              handleStop();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 animate-pulse cursor-pointer"
            title="Stop or pause voice"
            aria-label="Stop audio"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelSpeaking();
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
              variant === 'dark'
                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
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
              handleResume();
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
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
              variant === 'dark'
                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
            title="Cancel audio"
            aria-label="Cancel audio"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    // Default idle state: Speaker icon button
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePlayAudio(id, text);
        }}
        className={
          variant === 'dark'
            ? "w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shrink-0 border border-white/25 transition-all active:scale-95 cursor-pointer"
            : "w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-[#5E58E7] flex items-center justify-center shrink-0 shadow-2xs transition-all active:scale-95 cursor-pointer"
        }
        title="Listen aloud"
        aria-label="Listen aloud"
      >
        <Volume2 className="w-4 h-4" />
      </button>
    );
  };


  return (
    <div className={`w-full max-w-md mx-auto min-h-full flex flex-col ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#5E58E7] text-slate-800'
    } relative select-none antialiased transition-colors duration-300`}>
      {/* 1. Slim Clean Top Status Bar (No overlapping fake notches) */}
      <div className={`w-full pt-2.5 px-6 pb-1 flex items-center justify-between ${
        isDark ? 'text-slate-300' : 'text-white/95'
      } text-xs font-semibold select-none z-20`}>
        <span className="tracking-tight font-bold">{timeInfo.time?.split(' ')[0] || '9:41'}</span>
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Top Header (With comfortable breathing room) */}
      <header className="px-5 pt-1.5 pb-4 flex items-center justify-between text-white z-20">
        {/* Left: Avatar & Patient Name (Clicking opens About Me & QR Code) */}
        <button
          onClick={() => setShowAboutMe(true)}
          className="flex items-center gap-3 text-left group transition-all"
          title="View About Me & Emergency QR Code"
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-200 to-rose-200 p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-[#5E58E7] font-black text-lg overflow-hidden border-2 border-white">
                <span className="text-[#5E58E7] font-extrabold">{displayName.charAt(0)}</span>
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#5E58E7]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight group-hover:text-amber-200 transition-colors">
                {displayName}
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 text-indigo-100 border border-white/20">
                ID / QR
              </span>
            </div>
            <span className="text-[11px] font-medium text-indigo-100/90">
              ATTI Companion
            </span>
          </div>
        </button>

        {/* Right: Theme Toggle, Notifications Bell & Logout */}
        <div className="flex items-center gap-2">
          {/* Dynamic Theme Indicator & Toggle */}
          <button
            type="button"
            onClick={handleCycleTheme}
            className={`h-10 px-2.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-xs font-bold border backdrop-blur-md ${
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
            {isDark ? <Moon className="w-4 h-4 text-amber-300 fill-amber-300/20" /> : <Sun className="w-4 h-4 text-amber-200 fill-amber-200/20" />}
            <span className="text-[10px] uppercase tracking-wider font-extrabold hidden sm:inline">
              {themeMode === 'auto' ? (isDark ? 'Night' : 'Day') : themeMode}
            </span>
          </button>

          {/* Notification Icon */}
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (activeRoutine) {
                handlePlayAudio('notif-routine', `Scheduled reminder: ${activeRoutine.title} at ${activeRoutine.time}`);
              }
            }}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-95 relative"
            title="Notifications & Reminders"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-white" />
            {activeRoutine && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-[#5E58E7] animate-pulse" />
            )}
          </button>

          {/* Logout / Switch Session */}
          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-95"
            title="Sign out of ATTI"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {/* Floating Notification Popover Modal */}
      {showNotifications && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setShowNotifications(false)}
          />
          <div className={`absolute top-16 right-4 z-50 w-72 sm:w-80 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} rounded-2xl p-4 shadow-2xl border text-xs animate-in fade-in zoom-in-95 duration-150`}>
            <div className={`flex items-center justify-between font-bold border-b pb-2 mb-2 ${isDark ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-900'}`}>
              <span className="flex items-center gap-1.5 text-[#5E58E7] text-sm">
                <Bell className="w-4 h-4" /> Activity Reminders
              </span>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-6 h-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {activeRoutine ? (
              <div className="flex items-start justify-between gap-2.5 py-1">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#5E58E7] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`font-bold text-sm leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeRoutine.title}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Scheduled for {activeRoutine.time} • {timeInfo.day}</div>
                    {activeRoutine.description && (
                      <div className={`text-[11px] mt-1.5 p-2 rounded-lg border ${isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        {activeRoutine.description}
                      </div>
                    )}
                  </div>
                </div>
                {renderSpeakerControl(
                  'notif-routine',
                  `Scheduled reminder: ${activeRoutine.title} at ${activeRoutine.time}. ${activeRoutine.description || ''}`
                )}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 py-2 text-center">No pending routine alerts. All set for today!</p>
            )}
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* SECTION 1: HOME (Dashboard + Voice Assistant)            */}
      {/* ========================================================= */}
      {activeTab === 'home' && (
        <div className="w-full flex flex-col animate-fade-in">
          {/* 3. Four Orientation Cards */}
          <section className="px-4 mb-3 grid grid-cols-4 gap-2 select-none z-10" aria-label="Orientation Information Cards">
            {/* Card 1: Day & Period */}
            <button
              onClick={() => speakCardInfo('card-day', `Today is ${timeInfo.day || 'Today'}, ${timeInfo.period || 'Morning'}`)}
              className={`w-full min-w-0 overflow-hidden ${
                isDark ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100' : 'bg-white/20 hover:bg-white/25 text-white'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[96px] transition-all group relative ${
                activeSpeechId === 'card-day' && isSpeaking && !isPaused
                  ? 'ring-2 ring-emerald-300 border-emerald-300 bg-white/30'
                  : activeSpeechId === 'card-day' && isPaused
                  ? 'ring-2 ring-amber-300 border-amber-300 bg-white/30'
                  : isDark ? 'border-slate-800/80' : 'border-white/25'
              }`}
              title={
                activeSpeechId === 'card-day' && isSpeaking && !isPaused
                  ? 'Tap to pause or stop'
                  : activeSpeechId === 'card-day' && isPaused
                  ? 'Tap to resume'
                  : 'Tap to listen'
              }
            >
              <div className={`w-9 h-9 rounded-xl ${
                isDark ? 'bg-slate-800 border-slate-700 text-indigo-300' : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
              } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}>
                {activeSpeechId === 'card-day' && isSpeaking && !isPaused ? (
                  <Pause className="w-5 h-5 text-emerald-200 fill-current animate-pulse" />
                ) : activeSpeechId === 'card-day' && isPaused ? (
                  <Play className="w-5 h-5 text-amber-200 fill-current animate-pulse" />
                ) : (
                  <Calendar className="w-5 h-5 drop-shadow-xs" />
                )}
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[12px] font-bold leading-tight truncate w-full block">
                  {activeSpeechId === 'card-day' && isSpeaking && !isPaused
                    ? 'Stop'
                    : activeSpeechId === 'card-day' && isPaused
                    ? 'Resume'
                    : timeInfo.day || 'Day'}
                </span>
                <span className={`text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-indigo-100/90'
                }`}>
                  {activeSpeechId === 'card-day' && (isSpeaking || isPaused)
                    ? 'Tap to toggle'
                    : timeInfo.period || 'Morning'}
                </span>
              </div>
            </button>

            {/* Card 2: Current Date */}
            <button
              onClick={() => speakCardInfo('card-date', `Today's date is ${timeInfo.date}, year ${timeInfo.year || '2026'}`)}
              className={`w-full min-w-0 overflow-hidden ${
                isDark ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100' : 'bg-white/20 hover:bg-white/25 text-white'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[96px] transition-all group relative ${
                activeSpeechId === 'card-date' && isSpeaking && !isPaused
                  ? 'ring-2 ring-emerald-300 border-emerald-300 bg-white/30'
                  : activeSpeechId === 'card-date' && isPaused
                  ? 'ring-2 ring-amber-300 border-amber-300 bg-white/30'
                  : isDark ? 'border-slate-800/80' : 'border-white/25'
              }`}
              title={
                activeSpeechId === 'card-date' && isSpeaking && !isPaused
                  ? 'Tap to pause or stop'
                  : activeSpeechId === 'card-date' && isPaused
                  ? 'Tap to resume'
                  : 'Tap to listen'
              }
            >
              <div className={`w-9 h-9 rounded-xl ${
                isDark ? 'bg-slate-800 border-slate-700 text-indigo-300' : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
              } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}>
                {activeSpeechId === 'card-date' && isSpeaking && !isPaused ? (
                  <Pause className="w-5 h-5 text-emerald-200 fill-current animate-pulse" />
                ) : activeSpeechId === 'card-date' && isPaused ? (
                  <Play className="w-5 h-5 text-amber-200 fill-current animate-pulse" />
                ) : (
                  <CalendarDays className="w-5 h-5 drop-shadow-xs" />
                )}
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[12px] font-bold leading-tight truncate w-full block">
                  {activeSpeechId === 'card-date' && isSpeaking && !isPaused
                    ? 'Stop'
                    : activeSpeechId === 'card-date' && isPaused
                    ? 'Resume'
                    : timeInfo.shortDate || 'Date'}
                </span>
                <span className={`text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-indigo-100/90'
                }`}>
                  {activeSpeechId === 'card-date' && (isSpeaking || isPaused)
                    ? 'Tap to toggle'
                    : timeInfo.year || '2026'}
                </span>
              </div>
            </button>

            {/* Card 3: Live Spoken Time */}
            <button
              onClick={() => speakCardInfo('card-time', `The time right now is ${timeInfo.time}`)}
              className={`w-full min-w-0 overflow-hidden ${
                isDark ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100' : 'bg-white/20 hover:bg-white/25 text-white'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[96px] transition-all group relative ${
                activeSpeechId === 'card-time' && isSpeaking && !isPaused
                  ? 'ring-2 ring-emerald-300 border-emerald-300 bg-white/30'
                  : activeSpeechId === 'card-time' && isPaused
                  ? 'ring-2 ring-amber-300 border-amber-300 bg-white/30'
                  : isDark ? 'border-slate-800/80' : 'border-white/25'
              }`}
              title={
                activeSpeechId === 'card-time' && isSpeaking && !isPaused
                  ? 'Tap to pause or stop'
                  : activeSpeechId === 'card-time' && isPaused
                  ? 'Tap to resume'
                  : 'Tap to listen'
              }
            >
              <div className={`w-9 h-9 rounded-xl ${
                isDark ? 'bg-slate-800 border-slate-700 text-indigo-300' : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
              } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}>
                {activeSpeechId === 'card-time' && isSpeaking && !isPaused ? (
                  <Pause className="w-5 h-5 text-emerald-200 fill-current animate-pulse" />
                ) : activeSpeechId === 'card-time' && isPaused ? (
                  <Play className="w-5 h-5 text-amber-200 fill-current animate-pulse" />
                ) : (
                  <Clock className="w-5 h-5 drop-shadow-xs" />
                )}
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[12px] font-bold leading-tight truncate w-full block">
                  {activeSpeechId === 'card-time' && isSpeaking && !isPaused
                    ? 'Stop'
                    : activeSpeechId === 'card-time' && isPaused
                    ? 'Resume'
                    : timeInfo.time ? timeInfo.time.split(' ')[0] : 'Time'}
                </span>
                <span className={`text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-indigo-100/90'
                }`}>
                  {activeSpeechId === 'card-time' && (isSpeaking || isPaused)
                    ? 'Tap to toggle'
                    : timeInfo.time ? timeInfo.time.split(' ')[1] : 'Clock'}
                </span>
              </div>
            </button>

            {/* Card 4: Routine / Schedule */}
            <button
              onClick={() =>
                speakCardInfo(
                  'card-activity',
                  activeRoutine
                    ? `Next scheduled activity is ${activeRoutine.title} at ${activeRoutine.time}`
                    : `You are all caught up on your routine.`
                )
              }
              className={`w-full min-w-0 overflow-hidden ${
                isDark ? 'bg-slate-900/70 hover:bg-slate-850/90 text-slate-100' : 'bg-white/20 hover:bg-white/25 text-white'
              } active:scale-95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-between text-center border shadow-sm min-h-[96px] transition-all group relative ${
                activeSpeechId === 'card-activity' && isSpeaking && !isPaused
                  ? 'ring-2 ring-emerald-300 border-emerald-300 bg-white/30'
                  : activeSpeechId === 'card-activity' && isPaused
                  ? 'ring-2 ring-amber-300 border-amber-300 bg-white/30'
                  : isDark ? 'border-slate-800/80' : 'border-white/25'
              }`}
              title={
                activeSpeechId === 'card-activity' && isSpeaking && !isPaused
                  ? 'Tap to pause or stop'
                  : activeSpeechId === 'card-activity' && isPaused
                  ? 'Tap to resume'
                  : 'Tap to listen'
              }
            >
              <div className={`w-9 h-9 rounded-xl ${
                isDark ? 'bg-slate-800 border-slate-700 text-indigo-300' : 'bg-gradient-to-br from-white/35 to-white/10 border-white/30 text-white'
              } flex items-center justify-center shadow-inner border group-hover:scale-105 transition-transform shrink-0`}>
                {activeSpeechId === 'card-activity' && isSpeaking && !isPaused ? (
                  <Pause className="w-5 h-5 text-emerald-200 fill-current animate-pulse" />
                ) : activeSpeechId === 'card-activity' && isPaused ? (
                  <Play className="w-5 h-5 text-amber-200 fill-current animate-pulse" />
                ) : (
                  <Activity className="w-5 h-5 drop-shadow-xs" />
                )}
              </div>
              <div className="mt-1 w-full min-w-0 overflow-hidden flex flex-col items-center">
                <span className="text-[12px] font-bold leading-tight truncate w-full block">
                  {activeSpeechId === 'card-activity' && isSpeaking && !isPaused
                    ? 'Stop'
                    : activeSpeechId === 'card-activity' && isPaused
                    ? 'Resume'
                    : activeRoutine ? activeRoutine.time : 'All Set'}
                </span>
                <span className={`text-[10px] font-medium leading-tight truncate w-full block mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-indigo-100/90'
                }`}>
                  {activeSpeechId === 'card-activity' && (isSpeaking || isPaused)
                    ? 'Tap to toggle'
                    : activeRoutine ? (activeRoutine.category ? (activeRoutine.category.charAt(0).toUpperCase() + activeRoutine.category.slice(1)) : 'Activity') : 'Routine'}
                </span>
              </div>
            </button>
          </section>

          {/* 4. Reminder Rectangle */}
          <section className="px-4 relative z-0" aria-label="Upcoming Routine Reminder">
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                const reminderText = activeRoutine
                  ? `Scheduled reminder: ${activeRoutine.title} at ${activeRoutine.time}. ${activeRoutine.description || ''}`
                  : `Next reminder: Evening Tea & Memory Games at 5:00 PM with your family.`;
                speakCardInfo('card-reminder', reminderText);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  const reminderText = activeRoutine
                    ? `Scheduled reminder: ${activeRoutine.title} at ${activeRoutine.time}. ${activeRoutine.description || ''}`
                    : `Next reminder: Evening Tea & Memory Games at 5:00 PM with your family.`;
                  speakCardInfo('card-reminder', reminderText);
                }
              }}
              style={{
                paddingTop: '16px',
                paddingBottom: '38px',
                paddingLeft: '16px',
                paddingRight: '16px'
              }}
              className={`w-full ${
                isDark ? 'bg-[#2E2888] hover:bg-[#28227A] border-indigo-500/30' : 'bg-[#4838D6] hover:bg-[#4030C8] border-indigo-400/30'
              } active:scale-[0.99] text-white rounded-3xl shadow-md border flex items-start justify-between transition-all group text-left cursor-pointer`}
              title="Tap to hear upcoming routine details"
            >
              <div className="flex items-center gap-3.5 pr-2">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight">
                    {activeRoutine ? activeRoutine.title : 'Evening Tea & Memory Games'}
                  </div>
                  <div className="text-xs font-medium text-indigo-200/95 mt-1 flex items-center gap-1.5">
                    <span>{activeRoutine ? `At ${activeRoutine.time}` : 'At 17:00'}</span>
                    <span>•</span>
                    <span className="text-amber-200 font-semibold">Today</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 mt-1">
                {renderSpeakerControl(
                  'card-reminder',
                  activeRoutine
                    ? `Scheduled reminder: ${activeRoutine.title} at ${activeRoutine.time}. ${activeRoutine.description || ''}`
                    : `Next reminder: Evening Tea & Memory Games at 5:00 PM with your family.`,
                  'dark'
                )}
                <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white shrink-0 transition-colors">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </section>

          {/* 5. Main Elevated Container (Microphone & Assistant) */}
          <main className={`-mt-3.5 relative z-10 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
          } rounded-t-[36px] shadow-2xl px-5 pt-6 pb-36 flex flex-col gap-5 border-t transition-colors`}>
            {/* Location & Caregiver Badge */}
            <div className={`flex items-center gap-2 px-1 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <div className="w-6 h-6 rounded-lg bg-[#5E58E7] text-white flex items-center justify-center shadow-2xs shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">
                Home • Caregiver {patient?.caregiver_name || 'Ananya'} Connected
              </span>
            </div>

            {/* Central Voice Query Action Zone */}
            <div className={`${
              isDark
                ? 'bg-slate-800/80 border-slate-700/80'
                : 'bg-gradient-to-b from-slate-50/90 via-white to-slate-50/40 border-slate-200/80'
            } rounded-3xl p-6 sm:p-7 border shadow-sm flex flex-col items-center text-center relative overflow-hidden transition-all`}>
              <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'} mb-2`}>
                {isListening
                  ? 'Listening to your voice...'
                  : isLoading
                  ? 'Finding your answer...'
                  : isSpeaking
                  ? 'Speaking aloud...'
                  : isPaused
                  ? 'Voice paused'
                  : 'Tap & Speak Freely'}
              </div>

              {/* Big Voice Button with Dynamic Stop / Resume States */}
              <div className="relative my-3">
                {isListening && (
                  <div className="absolute -inset-4 rounded-full bg-rose-400/30 animate-ping pointer-events-none" />
                )}
                {isSpeaking && (
                  <div className="absolute -inset-3 rounded-full bg-emerald-400/30 animate-pulse pointer-events-none" />
                )}
                {isPaused && (
                  <div className="absolute -inset-3 rounded-full bg-amber-400/30 animate-pulse pointer-events-none" />
                )}

                <button
                  onClick={() => {
                    if (isListening) {
                      handleStop();
                    } else if (isSpeaking) {
                      handleStop();
                    } else if (isPaused) {
                      handleResume();
                    } else {
                      handleStartVoice();
                    }
                  }}
                  disabled={isLoading}
                  className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 transform active:scale-95 ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-700 text-white ring-8 ring-rose-200 scale-105'
                      : isSpeaking
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-8 ring-emerald-200'
                      : isPaused
                      ? 'bg-amber-500 hover:bg-amber-600 text-white ring-8 ring-amber-200 shadow-amber-200/50'
                      : 'bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white ring-8 ring-indigo-100 shadow-indigo-200/50'
                  }`}
                  aria-label={
                    isListening
                      ? 'Stop listening'
                      : isSpeaking
                      ? 'Stop or pause speaking'
                      : isPaused
                      ? 'Resume speaking'
                      : 'Tap to speak'
                  }
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-11 h-11 mb-1 animate-pulse" />
                      <span className="text-xs font-bold tracking-wider uppercase">STOP</span>
                      <span className="text-[10px] opacity-80 font-medium">Listening</span>
                    </>
                  ) : isSpeaking ? (
                    <>
                      <Pause className="w-11 h-11 mb-1 animate-pulse" />
                      <span className="text-xs font-bold tracking-wider uppercase">STOP</span>
                      <span className="text-[10px] opacity-85 font-medium">Tap to pause</span>
                    </>
                  ) : isPaused ? (
                    <>
                      <Play className="w-11 h-11 mb-1 ml-1" />
                      <span className="text-xs font-bold tracking-wider uppercase">RESUME</span>
                      <span className="text-[10px] opacity-90 font-medium">Tap to play</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-12 h-12 mb-1" />
                      <span className="text-xs font-bold tracking-wider uppercase">Ask ATTI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Contextual Action Bar when Speaking or Paused */}
              {(isSpeaking || isPaused) && (
                <div className="flex items-center justify-center gap-2 mt-2 mb-1">
                  {isSpeaking && (
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs transition-all active:scale-95"
                    >
                      <Pause className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Stop Voice</span>
                    </button>
                  )}
                  {isPaused && (
                    <button
                      onClick={handleResume}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white border border-amber-500 text-xs font-bold shadow-2xs transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume Voice</span>
                    </button>
                  )}
                  <button
                    onClick={handleCancelSpeaking}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                      isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    } text-xs font-semibold transition-all active:scale-95`}
                  >
                    <X className="w-3 h-3" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}

              {/* Instruction text */}
              <p className={`text-sm sm:text-base font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'} mt-2`}>
                {isListening
                  ? 'Speak now: "Who is Ananya?", "Where are my glasses?"'
                  : isSpeaking
                  ? 'ATTI is speaking. Tap the mic or Stop button to pause.'
                  : isPaused
                  ? 'Voice paused. Tap the mic or Resume to continue.'
                  : 'Press the microphone and ask any question.'}
              </p>

              {speechError && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs max-w-md">
                  {speechError}
                </div>
              )}

              {/* Fallback Keyboard Toggle */}
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} w-full flex items-center justify-center`}>
                <button
                  onClick={() => setShowTextInput(!showTextInput)}
                  className={`text-xs font-semibold ${isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-[#5E58E7]'} flex items-center gap-1.5 transition-colors`}
                >
                  <Keyboard className="w-4 h-4" />
                  <span>{showTextInput ? 'Hide typing box' : 'Or type your question'}</span>
                </button>
              </div>

              {showTextInput && (
                <form onSubmit={handleManualSubmit} className="mt-3 w-full flex items-center gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type a question (e.g. Who is Ananya?)..."
                    className={`flex-1 px-3.5 py-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:ring-indigo-400' : 'bg-white border-slate-300 text-slate-900 focus:ring-[#5E58E7]'
                    } text-sm focus:outline-hidden focus:ring-2`}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !textInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#5E58E7] hover:bg-[#524BD6] text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask</span>
                  </button>
                </form>
              )}
            </div>

            {/* Spoken Response Display Card */}
            {lastResponse && (
              <div className={`${
                isDark
                  ? 'bg-slate-800/90 border-slate-700'
                  : 'bg-gradient-to-b from-indigo-50/70 via-white to-slate-50/50 border-indigo-100'
              } rounded-3xl p-5 border shadow-sm flex flex-col gap-3 transition-all animate-fade-in`}>
                {currentQuery && (
                  <div className={`flex items-center gap-2 text-xs font-semibold ${
                    isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-indigo-100/60'
                  } border-b pb-2`}>
                    <span className="w-2 h-2 rounded-full bg-[#5E58E7]" />
                    <span className="truncate">You asked: "{currentQuery}"</span>
                  </div>
                )}

                {/* Assistant's Response */}
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#5E58E7] text-white flex items-center justify-center shrink-0 font-extrabold text-xl shadow-md">
                    A
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-indigo-400' : 'text-[#5E58E7]'}`}>
                        ATTI's Answer
                      </span>
                      {lastResponse.sources && lastResponse.sources.length > 0 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Grounded Memory
                        </span>
                      )}
                    </div>

                    {/* Main Large Answer Typography */}
                    <div className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} leading-snug tracking-tight`}>
                      {lastResponse.answer}
                    </div>
                  </div>
                </div>

                {/* Audio Controls */}
                <div className={`flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t ${
                  isDark ? 'border-slate-700' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    {/* Speak / Listen Again */}
                    <button
                      onClick={handleSpeak}
                      disabled={activeSpeechId === 'answer' && isSpeaking && !isPaused}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-colors border shadow-2xs active:scale-95 ${
                        activeSpeechId === 'answer' && isSpeaking && !isPaused
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : isDark
                          ? 'bg-slate-700 hover:bg-slate-600 text-indigo-300 border-slate-600'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-[#5E58E7] border-indigo-200'
                      }`}
                      title="Speak answer aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{activeSpeechId === 'answer' && isSpeaking && !isPaused ? 'Speaking' : 'Speak'}</span>
                    </button>

                    {/* Stop / Pause */}
                    {isSpeaking && !isPaused && (
                      <button
                        onClick={handleStop}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 font-bold text-xs transition-colors shadow-2xs active:scale-95 animate-pulse"
                        title="Stop or pause voice"
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Stop</span>
                      </button>
                    )}

                    {/* Resume */}
                    {isPaused && (
                      <button
                        onClick={handleResume}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors border border-amber-500 shadow-2xs animate-pulse active:scale-95"
                        title="Resume paused voice"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </button>
                    )}

                    {/* Cancel speaking */}
                    {(isSpeaking || isPaused) && (
                      <button
                        onClick={handleCancelSpeaking}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl ${
                          isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        } font-semibold text-xs transition-colors shadow-2xs active:scale-95`}
                        title="Cancel audio"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>

                  {/* Gentle Fallback: Offer caregiver reassurance */}
                  {lastResponse.is_fallback && (
                    <div className="flex items-center gap-2">
                      {caregiverNotified ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Note sent to {patient?.caregiver_name || 'Ananya'}</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleNotifyCaregiver}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors active:scale-95"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Ask {patient?.caregiver_name || 'Ananya'} For Me</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Frequent Inquiries */}
            <section className="flex flex-col gap-3 mt-1" aria-label="Frequent Questions">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-[#5E58E7]" />
                <span>Frequent Inquiries (Tap to Ask)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => processQuery(suggestions[0] || "What do I do today?")}
                  className={`${
                    isDark
                      ? 'bg-slate-800/80 hover:bg-indigo-950/40 border-slate-700/80'
                      : 'bg-slate-50/90 hover:bg-indigo-50/50 border-slate-200/80'
                  } border rounded-2xl p-4 flex flex-col justify-between text-left active:scale-[0.98] transition-all group min-h-[150px] shadow-2xs`}
                >
                  <div>
                    <div className={`font-extrabold text-sm ${isDark ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-[#5E58E7]'} transition-colors leading-tight`}>
                      {suggestions[0] || "What do I do today?"}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Scheduled daily routine
                    </div>
                  </div>
                  <div className="self-center mt-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-[#5E58E7] flex items-center justify-center text-white shadow-md shadow-indigo-300/40 group-hover:scale-110 transition-transform">
                      <Plus className="w-7 h-7 text-white stroke-[2.5]" />
                    </div>
                  </div>
                </button>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => processQuery(suggestions[1] || "Who is Ananya?")}
                    className={`${
                      isDark
                        ? 'bg-slate-800/80 hover:bg-indigo-950/40 border-slate-700/80'
                        : 'bg-slate-50/90 hover:bg-indigo-50/50 border-slate-200/80'
                    } border rounded-2xl p-3.5 flex items-center justify-between text-left active:scale-[0.98] transition-all group shadow-2xs`}
                  >
                    <div>
                      <div className={`font-extrabold text-xs sm:text-sm ${isDark ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-[#5E58E7]'} transition-colors leading-tight`}>
                        {suggestions[1] || "Who is Ananya?"}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Family & loved ones</div>
                    </div>
                    <div className={`w-8 h-8 rounded-xl ${isDark ? 'bg-slate-700 text-indigo-300' : 'bg-indigo-50 text-[#5E58E7]'} flex items-center justify-center group-hover:bg-[#5E58E7] group-hover:text-white transition-colors shrink-0 ml-2`}>
                      <User className="w-4 h-4" />
                    </div>
                  </button>

                  <button
                    onClick={() => processQuery(suggestions[2] || "Where are my glasses?")}
                    className={`${
                      isDark
                        ? 'bg-slate-800/80 hover:bg-indigo-950/40 border-slate-700/80'
                        : 'bg-slate-50/90 hover:bg-indigo-50/50 border-slate-200/80'
                    } border rounded-2xl p-3.5 flex items-center justify-between text-left active:scale-[0.98] transition-all group shadow-2xs`}
                  >
                    <div>
                      <div className={`font-extrabold text-xs sm:text-sm ${isDark ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-[#5E58E7]'} transition-colors leading-tight`}>
                        {suggestions[2] || "Where are my glasses?"}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Item finder</div>
                    </div>
                    <div className={`w-8 h-8 rounded-xl ${isDark ? 'bg-slate-700 text-indigo-300' : 'bg-indigo-50 text-[#5E58E7]'} flex items-center justify-center group-hover:bg-[#5E58E7] group-hover:text-white transition-colors shrink-0 ml-2`}>
                      <Eye className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: MY DAY (Daily Routine & Schedule)              */}
      {/* ========================================================= */}
      {activeTab === 'my-day' && (
        <div className={`w-full -mt-2 relative z-10 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
        } rounded-t-[36px] shadow-2xl px-5 pt-6 pb-36 flex flex-col gap-5 border-t min-h-[calc(100vh-140px)] animate-fade-in transition-colors`}>
          {/* My Day Header */}
          <div className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} pb-3`}>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
              isDark ? 'bg-indigo-950/80 text-indigo-300' : 'bg-indigo-50 text-[#5E58E7]'
            } text-xs font-bold mb-2`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{timeInfo.day}, {timeInfo.date}</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
              My Day & Schedule
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
              Here is everything planned for your day in chronological order.
            </p>
          </div>

          {/* Daily Routine Chronological Schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Scheduled Activities ({routinesList.length})
              </div>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-indigo-400' : 'text-[#5E58E7]'}`}>
                Tap any card to hear it aloud
              </span>
            </div>

            {routinesList.length > 0 ? (
              <div className="space-y-3">
                {routinesList.map((routine) => {
                  const routineId = `routine-${routine.id}`;
                  const isThisActive = activeSpeechId === routineId;
                  const isThisSpeaking = isThisActive && isSpeaking && !isPaused;
                  const isThisPaused = isThisActive && isPaused;
                  const routineSpeech = `${routine.title} at ${routine.time}. ${routine.description || ''}`;

                  let cardBorderClasses = isDark
                    ? 'bg-slate-800/80 hover:bg-indigo-950/30 border-slate-700/80'
                    : 'bg-slate-50/90 hover:bg-indigo-50/40 border-slate-200/80';
                  if (isThisSpeaking) {
                    cardBorderClasses = isDark
                      ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                      : 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-300 shadow-md';
                  } else if (isThisPaused) {
                    cardBorderClasses = isDark
                      ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50 shadow-md'
                      : 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-300 shadow-md';
                  } else if (routine.title === activeRoutine?.title) {
                    cardBorderClasses = isDark
                      ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/50'
                      : 'bg-gradient-to-r from-indigo-50/80 to-white border-[#5E58E7] ring-2 ring-indigo-200';
                  }

                  return (
                    <div
                      key={routine.id}
                      onClick={() => handlePlayAudio(routineId, routineSpeech)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group shadow-2xs ${cardBorderClasses}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs transition-colors ${
                            isThisSpeaking
                              ? 'bg-emerald-600 text-white animate-pulse'
                              : isThisPaused
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-[#5E58E7] text-white'
                          }`}>
                            {isThisSpeaking ? (
                              <Pause className="w-4 h-4 text-white fill-current" />
                            ) : isThisPaused ? (
                              <Play className="w-4 h-4 text-white fill-current" />
                            ) : (
                              <Clock className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-extrabold text-sm ${isDark ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-[#5E58E7]'} transition-colors`}>
                                {routine.title}
                              </span>
                              {isThisSpeaking && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse">
                                  Speaking Aloud
                                </span>
                              )}
                              {isThisPaused && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                                  Voice Paused
                                </span>
                              )}
                              {!isThisSpeaking && !isThisPaused && routine.title === activeRoutine?.title && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5E58E7] text-white">
                                  Next
                                </span>
                              )}
                            </div>
                            <div className={`text-xs font-semibold ${isDark ? 'text-indigo-400' : 'text-[#5E58E7]'} mt-0.5`}>
                              {routine.time} • {routine.category.toUpperCase()}
                            </div>
                            {routine.description && (
                              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} mt-1 leading-relaxed`}>
                                {routine.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {renderSpeakerControl(routineId, routineSpeech)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`p-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'} rounded-2xl text-center text-xs`}>
                No routine items configured.
              </div>
            )}
          </div>

          {/* Daily Medication Schedules */}
          <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-[#5E58E7]" />
                <span>Daily Medication Schedule</span>
              </div>
            </div>

            {medicationsList.length > 0 ? (
              <div className="space-y-3">
                {medicationsList.map((med) => {
                  const isTaken = !!medTakenMap[med.id];
                  const medId = `med-${med.id}`;
                  const isThisActive = activeSpeechId === medId;
                  const isThisSpeaking = isThisActive && isSpeaking && !isPaused;
                  const isThisPaused = isThisActive && isPaused;
                  const medSpeechText = `Medication: ${med.name}, ${med.dosage || ''}. Scheduled for ${med.schedule_time}. ${med.purpose ? `Purpose: ${med.purpose}. ` : ''}Instructions: ${med.instructions || 'Take with water.'}`;

                  let medBorderClasses = isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-50/90 border-slate-200/80';
                  if (isThisSpeaking) {
                    medBorderClasses = isDark
                      ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                      : 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-300 shadow-md';
                  } else if (isThisPaused) {
                    medBorderClasses = isDark
                      ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50 shadow-md'
                      : 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-300 shadow-md';
                  }

                  return (
                    <div
                      key={med.id}
                      className={`p-4 rounded-2xl border shadow-2xs flex flex-col gap-2.5 transition-all ${medBorderClasses}`}
                    >
                      <div
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => handlePlayAudio(medId, medSpeechText)}
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{med.name}</span>
                            {med.dosage && (
                              <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>({med.dosage})</span>
                            )}
                            {isThisSpeaking && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse">
                                Speaking Aloud
                              </span>
                            )}
                            {isThisPaused && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                                Voice Paused
                              </span>
                            )}
                          </div>
                          <div className={`text-xs font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-700'} mt-0.5`}>
                            {med.schedule_time}
                          </div>
                          {med.purpose && (
                            <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} mt-1`}>
                              {med.purpose}
                            </div>
                          )}
                        </div>

                        {renderSpeakerControl(medId, medSpeechText)}
                      </div>

                      {/* Action: Mark as Taken */}
                      <div className={`pt-2 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200/60'} flex items-center justify-between`}>
                        <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {med.instructions || 'Take with water'}
                        </span>
                        {isTaken ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Taken ({medTakenMap[med.id]})</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleLogMedicationTaken(med.id, med.name)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#5E58E7] hover:bg-[#524BD6] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors active:scale-95 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark as Taken</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`p-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'} rounded-2xl text-center text-xs`}>
                No medications configured.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: PEOPLE I KNOW (Familiar People & Relationships) */}
      {/* ========================================================= */}
      {activeTab === 'people' && (
        <div className={`w-full -mt-2 relative z-10 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
        } rounded-t-[36px] shadow-2xl px-5 pt-6 pb-36 flex flex-col gap-4 border-t min-h-[calc(100vh-140px)] animate-fade-in transition-colors`}>
          {/* People Header */}
          <div className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} pb-3`}>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
              isDark ? 'bg-indigo-950/80 text-indigo-300' : 'bg-indigo-50 text-[#5E58E7]'
            } text-xs font-bold mb-2`}>
              <Users className="w-3.5 h-3.5" />
              <span>Familiar People & Loved Ones</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
              People I Know
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
              Important people in your life who care for you and visit regularly.
            </p>
          </div>

          {/* People Cards Grid */}
          <div className="space-y-3.5">
            {peopleList.length > 0 ? (
              peopleList.map((person) => {
                const personId = `person-${person.id}`;
                const isThisActive = activeSpeechId === personId;
                const isThisSpeaking = isThisActive && isSpeaking && !isPaused;
                const isThisPaused = isThisActive && isPaused;
                const personSpeechText = `${person.name} is your ${person.relationship}. ${person.notes || ''} ${person.visit_schedule ? `Visit schedule: ${person.visit_schedule}.` : ''}`;

                let personBorderClasses = isDark
                  ? 'bg-slate-800/80 border-slate-700/80 hover:border-indigo-500'
                  : 'bg-slate-50/90 border-slate-200/80 hover:border-[#5E58E7]';
                if (isThisSpeaking) {
                  personBorderClasses = isDark
                    ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                    : 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-300 shadow-md';
                } else if (isThisPaused) {
                  personBorderClasses = isDark
                    ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50 shadow-md'
                    : 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-300 shadow-md';
                }

                return (
                  <div
                    key={person.id}
                    className={`p-4 rounded-2xl border shadow-2xs flex flex-col gap-3 group transition-all ${personBorderClasses}`}
                  >
                    <div
                      className="flex items-start justify-between gap-3 cursor-pointer"
                      onClick={() => handlePlayAudio(personId, personSpeechText)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md transition-colors ${
                          isThisSpeaking ? 'bg-emerald-600 animate-pulse' : isThisPaused ? 'bg-amber-500 animate-pulse' : 'bg-gradient-to-tr from-indigo-500 to-[#5E58E7]'
                        }`}>
                          {person.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} leading-tight`}>
                              {person.name}
                            </span>
                            {isThisSpeaking && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse">
                                Speaking Aloud
                              </span>
                            )}
                            {isThisPaused && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                                Voice Paused
                              </span>
                            )}
                          </div>
                          <span className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${
                            isDark ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-100/80 text-[#5E58E7]'
                          }`}>
                            {person.relationship}
                          </span>
                        </div>
                      </div>

                      {/* Quick Audio Readout / Stop / Resume Button */}
                      {renderSpeakerControl(personId, personSpeechText)}
                    </div>

                    {/* Notes & Visit Schedule */}
                    {person.notes && (
                      <p className={`text-xs ${
                        isDark ? 'text-slate-200 bg-slate-900/80 border-slate-700' : 'text-slate-700 bg-white/70 border-slate-100'
                      } leading-relaxed p-2.5 rounded-xl border`}>
                        {person.notes}
                      </p>
                    )}

                    {person.visit_schedule && (
                      <div className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1.5`}>
                        <Clock className="w-3.5 h-3.5 text-[#5E58E7]" />
                        <span>{person.visit_schedule}</span>
                      </div>
                    )}

                    {/* Quick Call Action if Phone Available */}
                    {person.phone && (
                      <div className={`pt-2 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200/60'} flex items-center justify-between`}>
                        <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{person.phone}</span>
                        <a
                          href={`tel:${person.phone.replace(/\s+/g, '')}`}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call {person.name}</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={`p-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'} rounded-2xl text-center text-xs`}>
                No familiar people registered.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: HELP (QR Code Visible First + Contacts Under)  */}
      {/* ========================================================= */}
      {activeTab === 'help' && (
        <div className={`w-full -mt-2 relative z-10 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
        } rounded-t-[36px] shadow-2xl px-5 pt-6 pb-36 flex flex-col gap-5 border-t min-h-[calc(100vh-140px)] animate-fade-in transition-colors`}>
          {/* Help Header */}
          <div className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} pb-3`}>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
              isDark ? 'bg-rose-950/80 text-rose-300' : 'bg-rose-50 text-rose-700'
            } text-xs font-bold mb-2`}>
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Assistance & Emergency Identification</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
              Help & Safety
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
              You are safe at home. If you ever feel confused or need support, your emergency QR code and verified contacts are below.
            </p>
          </div>

          {/* 1. PATIENT QR CODE (VISIBLE FIRST — TOP PRIORITY) */}
          <div className={`${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-gradient-to-b from-indigo-50/80 via-white to-slate-50/60 border-indigo-100'
          } rounded-3xl p-5 border shadow-sm flex flex-col items-center text-center`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5E58E7] text-white text-[11px] font-bold mb-3 shadow-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Patient Emergency Assistance QR Code</span>
            </div>

            {/* Canvas Container */}
            <div className={`p-3 bg-white rounded-2xl shadow-md border-2 ${isDark ? 'border-slate-700' : 'border-indigo-100/90'} mb-2.5`}>
              <canvas ref={helpQrCanvasRef} className="block w-[180px] h-[180px]" />
            </div>

            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-xs mb-3.5`}>
              Unique emergency identification for <strong className={isDark ? 'text-white' : 'text-slate-900'}>{displayName}</strong>.
              Scan with any mobile camera for immediate emergency assistance and verified guardian contacts.
            </p>

            {/* 2. DOWNLOAD PRINTABLE QR CODE BUTTON (IMMEDIATELY BELOW QR CODE) */}
            <button
              onClick={handleDownloadQR}
              disabled={downloadingQR}
              className="w-full sm:w-auto min-w-[240px] px-5 py-3 rounded-2xl bg-gradient-to-r from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white font-bold text-sm shadow-md shadow-indigo-200/50 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>QR Code Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Printable QR Code</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <Printer className="w-3 h-3" />
              High-resolution 600×600 PNG • Suitable for lanyard or wallet card
            </span>
          </div>

          {/* 3. OTHER INFO UNDER QR CODE */}

          {/* Reassuring Caregiver Banner */}
          <div className={`${
            isDark ? 'bg-slate-800/70 border-slate-700 text-slate-300' : 'bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border-indigo-100/80 text-slate-700'
          } p-4 rounded-2xl border flex items-start gap-3 shadow-2xs`}>
            <Sparkles className="w-5 h-5 text-[#5E58E7] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className={`block ${isDark ? 'text-white' : 'text-slate-900'} font-bold mb-0.5`}>Always Remember:</strong>
              Caregiver {patient?.caregiver_name || 'Ananya'} is always connected to your ATTI companion. You are never alone.
            </div>
          </div>

          {/* Primary Caregiver Support Card */}
          <div className={`${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-emerald-50/80 border-emerald-200/90'
          } border rounded-2xl p-4 shadow-2xs flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                  Primary Family Caregiver
                </div>
                <div className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'} mt-0.5`}>
                  {patient?.caregiver_name || 'Ananya Sharma'}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
                  Available on Call • {patient?.emergency_contact_phone || '+91 98765 12345'}
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                {(patient?.caregiver_name || 'Ananya')[0].toUpperCase()}
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-2 pt-1 border-t ${isDark ? 'border-slate-700' : 'border-emerald-200/60'}`}>
              <a
                href={`tel:${(patient?.emergency_contact_phone || '+91 98765 12345').replace(/\s+/g, '')}`}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Call {patient?.caregiver_name || 'Ananya'}</span>
              </a>

              {caregiverNotified ? (
                <div className="py-2.5 px-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-300">
                  <CheckCircle className="w-4 h-4" />
                  <span>{patient?.caregiver_name || 'Ananya'} Notified</span>
                </div>
              ) : (
                <button
                  onClick={handleNotifyCaregiver}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Notify {patient?.caregiver_name || 'Ananya'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Doctor / Physician Card */}
          <div className={`${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-indigo-50/80 border-indigo-200/90'
          } border rounded-2xl p-4 shadow-2xs flex items-center justify-between`}>
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-800'}`}>
                Family Physician
              </div>
              <div className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} mt-0.5`}>Dr. Arjun Mehta</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>+91 98111 55667 • Green Park Clinic</div>
            </div>
            <a
              href="tel:+919811155667"
              className="px-3.5 py-2.5 rounded-xl bg-[#5E58E7] hover:bg-[#524BD6] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors active:scale-95 shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Doctor</span>
            </a>
          </div>

          {/* Medical Conditions & Allergies Card */}
          <div className={`${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-amber-50/70 border-amber-200/80'
          } rounded-2xl p-4 border shadow-2xs`}>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase ${isDark ? 'text-amber-400' : 'text-amber-800'} mb-2`}>
              <AlertCircle className="w-4 h-4" />
              <span>Medical Conditions & Allergies</span>
            </div>
            <div className={`space-y-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <div className="flex items-start gap-2">
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} min-w-[130px]`}>Condition:</span>
                <span>Mild Cognitive Impairment, Essential Hypertension</span>
              </div>
              <div className="flex items-start gap-2">
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} min-w-[130px]`}>Allergies:</span>
                <span className="text-rose-700 dark:text-rose-400 font-semibold">Penicillin (Moderate sensitivity)</span>
              </div>
            </div>
          </div>

          {/* Important Care Instructions Card */}
          <div className={`p-4 ${
            isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50/90 border-slate-200/80 text-slate-700'
          } rounded-2xl border shadow-2xs text-xs space-y-1.5`}>
            <strong className={`block ${isDark ? 'text-white' : 'text-slate-900'} font-bold mb-1`}>Care & Safety Instructions:</strong>
            <p>Please speak calmly and gently. If the patient appears disoriented or lost, keep them in a safe, quiet space and immediately contact Caregiver {patient?.caregiver_name || 'Ananya Sharma'}.</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING VOICE PLAYBACK BAR (Always Accessible when Active) */}
      {/* ========================================================= */}
      {(isSpeaking || isPaused) && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-slate-900/95 backdrop-blur-md rounded-2xl py-2.5 px-3.5 shadow-2xl border border-white/20 flex items-center justify-between z-50 text-white animate-fade-in"
          role="region"
          aria-label="Voice Playback Controls"
        >
          <div className="flex items-center gap-2.5 overflow-hidden mr-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isSpeaking ? 'bg-emerald-500 text-white animate-pulse' : 'bg-amber-500 text-white'
            }`}>
              {isSpeaking ? <Volume2 className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </div>
            <div className="truncate">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span>{isSpeaking ? 'Speaking Aloud' : 'Voice Paused'}</span>
              </div>
              <div className="text-xs font-semibold text-white truncate max-w-[170px]">
                {activeSpeechText || 'Voice Assistance'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isSpeaking ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStop();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                title="Stop or pause voice"
                aria-label="Stop audio"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResume();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
                title="Resume voice"
                aria-label="Resume audio"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelSpeaking();
              }}
              className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title="Cancel audio"
              aria-label="Cancel audio"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. FLOATING BOTTOM NAVIGATION BAR (Exactly 4 Items)       */}
      {/* ========================================================= */}
      <nav
        className={`fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-sm ${
          isDark ? 'bg-slate-900/95 border-slate-800 text-slate-300' : 'bg-white/95 border-slate-200/90 text-slate-600'
        } backdrop-blur-md rounded-2xl py-2 px-2 shadow-2xl border flex items-center justify-around z-40 select-none transition-colors`}
        aria-label="Bottom Navigation"
      >
        {/* 1. HOME */}
        <button
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all active:scale-95 min-h-[48px] cursor-pointer ${
            activeTab === 'home'
              ? 'bg-[#5E58E7] text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-[#5E58E7] hover:bg-slate-100/60'
          }`}
          aria-label="Home section"
        >
          <Home className="w-4 h-4" />
          <span className="text-[11px] leading-none">Home</span>
        </button>

        {/* 2. MY DAY */}
        <button
          onClick={() => {
            setActiveTab('my-day');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all active:scale-95 min-h-[48px] cursor-pointer ${
            activeTab === 'my-day'
              ? 'bg-[#5E58E7] text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-[#5E58E7] hover:bg-slate-100/60'
          }`}
          aria-label="My Day schedule"
        >
          <CalendarDays className="w-4 h-4" />
          <span className="text-[11px] leading-none">My Day</span>
        </button>

        {/* 3. PEOPLE I KNOW */}
        <button
          onClick={() => {
            setActiveTab('people');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all active:scale-95 min-h-[48px] cursor-pointer ${
            activeTab === 'people'
              ? 'bg-[#5E58E7] text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-[#5E58E7] hover:bg-slate-100/60'
          }`}
          aria-label="People I Know section"
        >
          <Users className="w-4 h-4" />
          <span className="text-[11px] leading-none truncate max-w-[80px]">People I Know</span>
        </button>

        {/* 4. HELP */}
        <button
          onClick={() => {
            setActiveTab('help');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all active:scale-95 min-h-[48px] cursor-pointer ${
            activeTab === 'help'
              ? 'bg-[#5E58E7] text-white shadow-sm'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              : 'text-slate-600 hover:text-[#5E58E7] hover:bg-slate-100/60'
          }`}
          aria-label="Help and assistance"
        >
          <HeartHandshake className="w-4 h-4" />
          <span className="text-[11px] leading-none">Help</span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* 6. ABOUT ME MODAL (Detailed Patient Records & QR Feature) */}
      {/* ========================================================= */}
      {showAboutMe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className={`w-full max-w-lg ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-white'} rounded-t-[32px] sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl`}>
            <AboutMeSection
              patient={patient || null}
              onClose={() => setShowAboutMe(false)}
              isModal={true}
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. FLOATING SOS BUTTON & CONFIRMATION POPUP (Press & Hold)*/}
      {/* ========================================================= */}
      <FloatingSOS
        patient={patient || null}
        people={peopleList}
        isDark={isDark}
        onNotifyCaregiver={handleNotifyCaregiver}
      />
    </div>
  );
};

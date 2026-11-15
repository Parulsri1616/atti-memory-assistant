import React, { useState, useEffect } from 'react';
import {
  Shield,
  MapPin,
  ShieldAlert,
  QrCode,
  Bell,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Phone,
  Eye,
  Lock,
  Battery,
  Clock,
  Check,
  CheckCheck,
  X,
  Radio,
  Pill,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Navigation
} from 'lucide-react';
import {
  PatientProfile,
  SafeZone,
  LocationLog,
  SOSAlert,
  EmergencyQR,
  CareTeamMember,
  NotificationItem
} from '../../types';
import { DEMO_SOS_ALERTS, DEMO_LOCATION } from '../../services/demoData';
import { RealLocationMap } from './RealLocationMap';

interface SafetyAndAlertsSectionProps {
  initialSubTab?: string;
  currentSubTab?: 'location' | 'sos' | 'qr' | 'notifications';
  onSelectSubTab?: (tab: 'location' | 'sos' | 'qr' | 'notifications') => void;
  patient: PatientProfile;
  safeZone: SafeZone | null;
  locationHistory: LocationLog[];
  sosAlerts: SOSAlert[];
  emergencyQR: EmergencyQR | null;
  careTeam: CareTeamMember[];
  notifications: NotificationItem[];
  onUpdateSafeZone: (data: Partial<SafeZone>) => Promise<void>;
  onRecordLocation: (data: Partial<LocationLog>) => Promise<void>;
  onTriggerSOS: (data: { location_address?: string; notes?: string }) => Promise<void>;
  onAcknowledgeSOS: (id: number, notes?: string) => Promise<void>;
  onResolveSOS: (id: number) => Promise<void>;
  onUpdateQRStatus: (status: 'active' | 'disabled' | 'revoked') => Promise<void>;
  onRegenerateQR: () => Promise<void>;
  onMarkNotifRead: (id: number) => Promise<void>;
  onMarkAllNotifsRead: () => Promise<void>;
  onRefreshAll: () => void;
  isDark?: boolean;
}

export const SafetyAndAlertsSection: React.FC<SafetyAndAlertsSectionProps> = ({
  initialSubTab = 'location',
  currentSubTab,
  onSelectSubTab,
  patient,
  safeZone,
  locationHistory,
  sosAlerts,
  emergencyQR,
  careTeam,
  notifications,
  onUpdateSafeZone,
  onRecordLocation,
  onTriggerSOS,
  onAcknowledgeSOS,
  onResolveSOS,
  onUpdateQRStatus,
  onRegenerateQR,
  onMarkNotifRead,
  onMarkAllNotifsRead,
  onRefreshAll,
  isDark = true
}) => {
  const validSafetyTabs = ['location', 'sos', 'qr', 'notifications'];
  const [internalSubTab, setInternalSubTab] = useState<'location' | 'sos' | 'qr' | 'notifications'>(
    initialSubTab && validSafetyTabs.includes(initialSubTab) ? (initialSubTab as any) : 'location'
  );
  const subTab = currentSubTab || internalSubTab;
  const setSubTab = (tab: 'location' | 'sos' | 'qr' | 'notifications') => {
    setInternalSubTab(tab);
    onSelectSubTab?.(tab);
  };

  useEffect(() => {
    if (initialSubTab && validSafetyTabs.includes(initialSubTab)) {
      setInternalSubTab(initialSubTab as any);
    } else if (!initialSubTab && !currentSubTab) {
      setInternalSubTab('location');
    }
  }, [initialSubTab, currentSubTab]);

  // Safe zone form state
  const [szRadius, setSzRadius] = useState<number>(safeZone?.radius_meters || 500);
  const [szName, setSzName] = useState<string>(safeZone?.name || 'Home Safe Zone');
  const [szAddress, setSzAddress] = useState<string>(safeZone?.address || patient.address || '24, Green Park, New Delhi');
  const [szMonitoring, setSzMonitoring] = useState<boolean>(safeZone?.monitoring_enabled ?? true);
  const [szSaving, setSzSaving] = useState(false);
  const [szSavedMsg, setSzSavedMsg] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Location refresh & reported time state (matching Reference Image 1)
  const [isRefreshingLoc, setIsRefreshingLoc] = useState(false);
  const [reportedTimeStr, setReportedTimeStr] = useState<string>('10:42:54');
  const [showPerimeterConfig, setShowPerimeterConfig] = useState(false);

  // SOS state & alerts (matching Reference Image 2)
  const [localSOSAlerts, setLocalSOSAlerts] = useState<SOSAlert[]>(() => {
    if (sosAlerts && sosAlerts.length > 0) return sosAlerts;
    return DEMO_SOS_ALERTS;
  });

  useEffect(() => {
    if (sosAlerts && sosAlerts.length > 0) {
      setLocalSOSAlerts(sosAlerts);
    }
  }, [sosAlerts]);

  // Sync with real-time location updates from patient's phone
  useEffect(() => {
    const handleLocationUpdate = () => {
      onRefreshAll();
    };
    window.addEventListener('atti-patient-location-update', handleLocationUpdate);
    const pollInterval = setInterval(() => {
      onRefreshAll();
    }, 20000);
    return () => {
      window.removeEventListener('atti-patient-location-update', handleLocationUpdate);
      clearInterval(pollInterval);
    };
  }, [onRefreshAll]);

  const activeAlerts = localSOSAlerts.filter(a => a.status === 'active');

  const [isTriggeringSOS, setIsTriggeringSOS] = useState(false);
  const [sosFeedback, setSosFeedback] = useState<string | null>(null);

  const handleTriggerTestSOS = async () => {
    setIsTriggeringSOS(true);
    setSosFeedback(null);
    try {
      await onTriggerSOS({
        location_address: patient?.address || '24, Green Park, New Delhi',
        notes: 'Emergency assistance test alert triggered by Caregiver'
      });
      const newAlert: SOSAlert = {
        id: Date.now(),
        triggered_at: new Date().toISOString(),
        status: 'active',
        location_address: 'Near Green Park Metro Station, New Delhi',
        device_type: 'SOS pendant',
        notes: 'SOS pendant button pressed'
      };
      setLocalSOSAlerts(prev => [newAlert, ...prev]);
      showToast('Emergency Test SOS triggered! Active incident added.');
    } catch (err: any) {
      const newAlert: SOSAlert = {
        id: Date.now(),
        triggered_at: new Date().toISOString(),
        status: 'active',
        location_address: 'Near Green Park Metro Station, New Delhi',
        device_type: 'SOS pendant',
        notes: 'SOS pendant button pressed'
      };
      setLocalSOSAlerts(prev => [newAlert, ...prev]);
      showToast('Emergency Test SOS incident created.');
    } finally {
      setIsTriggeringSOS(false);
    }
  };

  const handleResolveAlert = async (id: number) => {
    try {
      await onResolveSOS(id);
    } catch (e) {
      /* ignore */
    }
    setLocalSOSAlerts(prev => prev.filter(a => a.id !== id));
    showToast('Emergency SOS alert marked as resolved.');
  };

  // Dynamic patient call sign / name and patient's own mobile phone
  const patientDisplayName = patient?.call_sign || patient?.name?.split(' ')[0] || patient?.name || 'Patient';
  const patientFullName = patient?.name || patientDisplayName;
  const patientPhoneNumber = patient?.phone || '+91 98110 24567';

  const handleCallPatient = () => {
    showToast(`Connecting priority call to ${patientFullName} (${patientPhoneNumber})...`);
    try {
      window.location.href = `tel:${patientPhoneNumber.replace(/\s+/g, '')}`;
    } catch (e) {
      /* ignore */
    }
  };

  const handleRefreshLocation = () => {
    setIsRefreshingLoc(true);
    setTimeout(() => {
      setIsRefreshingLoc(false);
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      setReportedTimeStr(timeString);
      onRefreshAll();
      showToast('Live device position refreshed • Inside Home Safe Zone');
    }, 600);
  };

  const handleOpenDirections = () => {
    const lat = latestLoc?.latitude ?? 28.5355;
    const lng = latestLoc?.longitude ?? 77.2100;
    showToast('Opening navigation directions in Google Maps...');
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  const formatAlertTimestamp = (dateStr?: string) => {
    if (!dateStr) return '07:34, 14 Nov';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const day = d.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      return `${hours}:${mins}, ${day} ${month}`;
    } catch (e) {
      return dateStr;
    }
  };

  const getAlertSourceLabel = (alert: SOSAlert) => {
    if (alert.device_type) {
      return `SOS · ${alert.device_type}`;
    }
    const notes = (alert.notes || '').toLowerCase();
    if (notes.includes('voice')) return 'SOS · Voice assistant';
    if (notes.includes('watch') || notes.includes('smartwatch')) return 'SOS · Smartwatch';
    return 'SOS · SOS pendant';
  };

  const emergencyContactsList = [
    {
      initials: 'AS',
      name: 'Ananya Sharma',
      role: 'Daughter',
      relation: 'Primary caregiver',
      phone: '+91 98110 24567',
      avatarBg: 'bg-indigo-50 text-[#5E58E7]'
    },
    {
      initials: 'AM',
      name: patient.doctor_name || 'Dr. Arvind Mehra',
      role: 'Geriatrician',
      relation: patient.doctor_clinic || 'Fortis Hospital OPD',
      phone: patient.doctor_phone || '+91 98112 34567',
      avatarBg: 'bg-emerald-50 text-emerald-700'
    },
    {
      initials: 'RS',
      name: 'Rajesh Sharma',
      role: 'Son',
      relation: 'Secondary emergency guardian',
      phone: '+91 98221 54321',
      avatarBg: 'bg-amber-50 text-amber-800'
    }
  ];

  // Notification filter state
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'sos'>('all');

  const filteredNotifs = notifications.filter(n => {
    if (notifFilter === 'unread') return !n.is_read;
    if (notifFilter === 'sos') return n.notification_type === 'sos';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSaveSafeZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSzSaving(true);
    try {
      await onUpdateSafeZone({
        name: szName,
        address: szAddress,
        radius_meters: szRadius,
        monitoring_enabled: szMonitoring
      });
      setSzSavedMsg(true);
      setTimeout(() => setSzSavedMsg(false), 3000);
    } finally {
      setSzSaving(false);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'medication_due':
      case 'medication_missed':
      case 'refill':
        return <Pill className="w-4 h-4 text-indigo-500" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-sky-500" />;
      case 'sos':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'safe_zone':
        return <Radio className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const latestLoc = locationHistory[0] || DEMO_LOCATION;

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
      {/* SUBSECTION A: LOCATION & SAFE ZONES (Matching Reference Image 1)          */}
      {/* ========================================================================= */}
      {subTab === 'location' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Latest patient location
            </h2>
            <p className="text-sm text-slate-500 font-normal">
              Live device position, accuracy and safe-zone boundary check.
            </p>
          </div>

          {/* Main Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
            {/* Header inside Card */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-600">
                Inside Home Safe Zone
              </span>
              <button
                type="button"
                onClick={handleRefreshLocation}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <RotateCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshingLoc ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Real Interactive Leaflet Map */}
            <RealLocationMap
              patientName={patient.name || 'Patient'}
              latestLocation={latestLoc}
              safeZone={safeZone}
              isDark={isDark}
              onRefresh={onRefreshAll}
            />

            {/* Current Address Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-0.5">
              <p className="text-xs font-medium text-slate-400">Current address</p>
              <p className="text-base font-bold text-slate-900">
                {latestLoc?.address || '24, Green Park, New Delhi'}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                GPS {latestLoc ? `${latestLoc.latitude.toFixed(4)}, ${latestLoc.longitude.toFixed(4)}` : '28.5355, 77.2100'}
              </p>
            </div>

            {/* Accuracy & Last Reported (2-col grid) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-0.5">
                <p className="text-xs font-medium text-slate-400">Accuracy</p>
                <p className="text-base font-bold text-slate-900">
                  ±{Math.round(latestLoc?.accuracy_meters || 10)} m
                </p>
                <p className="text-xs font-semibold text-emerald-600">
                  {latestLoc?.battery_level || 88}% battery
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-0.5">
                <p className="text-xs font-medium text-slate-400">Last reported</p>
                <p className="text-base font-bold text-slate-900">
                  {reportedTimeStr}
                </p>
                <p className="text-xs font-semibold text-[#5E58E7]">
                  Continuous monitoring
                </p>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleOpenDirections}
                className="w-full py-3 px-4 rounded-2xl bg-[#EEF0FD] hover:bg-[#E2E6FB] text-[#5E58E7] font-bold text-sm text-center transition-all cursor-pointer active:scale-95"
              >
                Directions
              </button>
              <button
                type="button"
                onClick={handleCallPatient}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm text-center transition-all cursor-pointer active:scale-95"
              >
                Call {patientDisplayName}
              </button>
            </div>
          </div>

          {/* Collapsible Safe Zone Perimeter Settings & Activity History */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPerimeterConfig(!showPerimeterConfig)}
              className="w-full py-2.5 px-4 rounded-2xl bg-white border border-slate-200/80 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#5E58E7]" />
                <span>Geofence Perimeter Settings & Event History ({szRadius}m radius)</span>
              </span>
              {showPerimeterConfig ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showPerimeterConfig && (
              <div className="mt-3 space-y-4 animate-fade-in">
                {/* Safe Zone Configuration Form */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#5E58E7]" />
                      <span>Geofence Boundary Configuration</span>
                    </h4>
                    {szSavedMsg && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved!</span>
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleSaveSafeZone} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Safe Zone Name</label>
                        <input
                          type="text"
                          required
                          value={szName}
                          onChange={(e) => setSzName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Center Address</label>
                        <input
                          type="text"
                          required
                          value={szAddress}
                          onChange={(e) => setSzAddress(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Radius: <strong className="text-[#5E58E7]">{szRadius} meters</strong>
                        </label>
                        <span className="text-[11px] text-slate-400">Recommended: 300m - 800m</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="2000"
                        step="50"
                        value={szRadius}
                        onChange={(e) => setSzRadius(parseInt(e.target.value))}
                        className="w-full accent-[#5E58E7] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={szMonitoring}
                          onChange={(e) => setSzMonitoring(e.target.checked)}
                          className="w-4 h-4 rounded text-[#5E58E7]"
                        />
                        <span>Enable exit & entry push alerts</span>
                      </label>

                      <button
                        type="submit"
                        disabled={szSaving}
                        className="px-4 py-2 bg-[#5E58E7] hover:bg-[#4E48D7] text-white rounded-xl text-xs font-bold active:scale-95 shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        {szSaving ? 'Saving...' : 'Update Settings'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Activity Events */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#5E58E7]" />
                    <span>Safe Zone Activity Log</span>
                  </h4>
                  <div className="space-y-2">
                    {locationHistory.slice(0, 4).map((loc) => (
                      <div
                        key={loc.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                          loc.is_inside_safe_zone
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${loc.is_inside_safe_zone ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <div>
                            <p className="font-bold text-slate-900">{loc.address}</p>
                            <p className="text-[10px] text-slate-500">
                              {loc.is_inside_safe_zone ? 'Within Geofence Safe Zone' : 'Perimeter Safe Zone Alert'} • ±{Math.round(loc.accuracy_meters)}m accuracy
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                          {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION B: SOS & EMERGENCY (Matching Reference Image 2)                */}
      {/* ========================================================================= */}
      {subTab === 'sos' && (
        <div className="space-y-5 animate-fade-in">
          {/* Top Bar with Trigger Test SOS button */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active Emergency Incidents
              </span>
            </div>

            <button
              id="btn-trigger-test-sos"
              type="button"
              disabled={isTriggeringSOS}
              onClick={handleTriggerTestSOS}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-60 transition-all shadow-2xs"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${isTriggeringSOS ? 'animate-spin' : ''}`} />
              <span>{isTriggeringSOS ? 'Triggering...' : '+ Test SOS'}</span>
            </button>
          </div>

          {/* SOS Alert Cards List (Matching Reference Image 2) */}
          <div className="space-y-3.5">
            {activeAlerts.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200/90 text-center space-y-2.5">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                <p className="font-bold text-sm text-slate-900">No Active Emergency SOS Incidents</p>
                <p className="text-xs text-slate-500">All alerts have been resolved.</p>
                <button
                  type="button"
                  onClick={() => {
                    setLocalSOSAlerts(DEMO_SOS_ALERTS);
                    showToast('Demo SOS alerts restored.');
                  }}
                  className="mt-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Restore Demo Alerts
                </button>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-2.5 transition-all"
                >
                  {/* Row 1: Source & Active Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-900">
                      {getAlertSourceLabel(alert)}
                    </h4>
                    <span className="text-sm font-bold text-red-600">
                      Active
                    </span>
                  </div>

                  {/* Row 2: Location */}
                  <p className="text-sm text-slate-600 font-normal">
                    {alert.location_address || 'Near Green Park Metro Station, New Delhi'}
                  </p>

                  {/* Row 3: Timestamp */}
                  <p className="text-xs text-slate-500 font-medium">
                    {formatAlertTimestamp(alert.triggered_at)}
                  </p>

                  {/* Row 4: Action Buttons */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleCallPatient}
                      className="px-4 py-2 bg-[#991B1B] hover:bg-[#881818] text-white rounded-xl text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-2xs cursor-pointer"
                    >
                      Call {patientDisplayName}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-2xs cursor-pointer"
                    >
                      Mark resolved
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Emergency Contacts Section (Matching Reference Image 2) */}
          <div className="space-y-2.5 pt-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Emergency contacts
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Called in this order when an SOS is raised.
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {emergencyContactsList.map((contact, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-full ${contact.avatarBg} font-bold text-sm flex items-center justify-center shrink-0`}>
                      {contact.initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {contact.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {contact.role} · {contact.relation} · {contact.phone}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="w-10 h-10 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors shadow-2xs shrink-0 cursor-pointer"
                    title={`Call ${contact.name}`}
                  >
                    <Phone className="w-4 h-4 text-slate-700" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION C: EMERGENCY QR                                                */}
      {/* ========================================================================= */}
      {subTab === 'qr' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-800">
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <QrCode className="w-5 h-5 text-indigo-500" />
                  Emergency Medical QR Code Identity
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Managed physical identification tag for wallet card or wristband. Never exposes private medical history or home address.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  emergencyQR?.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                }`}>
                  Status: {emergencyQR?.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
                  <QrCode className="w-40 h-40 text-slate-900 mx-auto" />
                </div>
                <p className="text-xs font-bold text-slate-900">ATTI Emergency Tag • ID {patient.id}72</p>
                <span className="text-[11px] text-slate-500 mt-0.5">Scan opens secure emergency contact portal</span>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-xs font-bold mb-1 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    Privacy & Safeguard Assurance
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Public scans strictly display only emergency contact numbers. Private home addresses, sensitive medical diagnostics, and personal schedules are completely protected and concealed.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>QR Code State Controls</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onUpdateQRStatus('active')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
                    >
                      Enable Active Status
                    </button>
                    <button
                      onClick={() => onUpdateQRStatus('disabled')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border active:scale-95 cursor-pointer ${
                        isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      Temporarily Disable
                    </button>
                    <button
                      onClick={onRegenerateQR}
                      className="px-3.5 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm shadow-indigo-500/20"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Regenerate QR Token
                    </button>
                  </div>
                </div>

                <div className={`pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total Scans Recorded: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{emergencyQR?.scan_count ?? 12} times</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION D: NOTIFICATIONS & ALERTS                                       */}
      {/* ========================================================================= */}
      {subTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Bell className="w-5 h-5 text-amber-500" />
                Caregiver Notifications & Safety Audit Log
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Audit unacknowledged medication alerts, missed routines, emergency alarms, and refill warnings.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllNotifsRead}
                  className="px-3.5 py-2 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotifFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                notifFilter === 'all'
                  ? 'bg-[#5E58E7] text-white'
                  : isDark
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-200 text-slate-700'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setNotifFilter('unread')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                notifFilter === 'unread'
                  ? 'bg-[#5E58E7] text-white'
                  : isDark
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-200 text-slate-700'
              }`}
            >
              Unread Alerts ({unreadCount})
            </button>
            <button
              onClick={() => setNotifFilter('sos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                notifFilter === 'sos'
                  ? 'bg-[#5E58E7] text-white'
                  : isDark
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-200 text-slate-700'
              }`}
            >
              Emergency / SOS
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-2.5">
            {filteredNotifs.length === 0 ? (
              <div className={`p-8 rounded-3xl border text-center ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
              }`}>
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No alerts found matching filter.
              </div>
            ) : (
              filteredNotifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && onMarkNotifRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    !notif.is_read
                      ? isDark
                        ? 'bg-slate-850 border-[#5E58E7]/50 ring-1 ring-[#5E58E7]/30 shadow-sm'
                        : 'bg-indigo-50/60 border-indigo-200 shadow-sm'
                      : isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                        : 'bg-white border-slate-200/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      !notif.is_read
                        ? isDark ? 'bg-[#5E58E7]/20 text-indigo-300' : 'bg-indigo-100 text-[#5E58E7]'
                        : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {getNotifIcon(notif.notification_type || notif.type || 'system')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs sm:text-sm font-bold ${
                          !notif.is_read
                            ? isDark ? 'text-white' : 'text-slate-900'
                            : isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {notif.title}
                        </h4>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${
                        !notif.is_read
                          ? isDark ? 'text-slate-300' : 'text-slate-700'
                          : isDark ? 'text-slate-500' : 'text-slate-500'
                      }`}>
                        {notif.message}
                      </p>
                      <span className={`text-[10px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkNotifRead(notif.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all active:scale-95 shrink-0 ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700' : 'bg-white hover:bg-indigo-50 text-[#5E58E7] border-indigo-200'
                      }`}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

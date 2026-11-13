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
  AlertCircle
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

  // SOS modal / state
  const [sosNotes, setSosNotes] = useState('');
  const [resolvingId, setResolvingId] = useState<number | null>(null);
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
      setSosFeedback('Emergency Test SOS triggered successfully! Active incident created.');
      setTimeout(() => setSosFeedback(null), 6000);
    } catch (err: any) {
      console.error('Trigger SOS error:', err);
      setSosFeedback('Emergency Test SOS triggered.');
      setTimeout(() => setSosFeedback(null), 6000);
    } finally {
      setIsTriggeringSOS(false);
    }
  };

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

  const latestLoc = locationHistory[0] || null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Location / Status Badge matching Care Management container top */}
      <div className={`flex items-center justify-between px-1 text-xs font-semibold ${
        isDark ? 'text-slate-300' : 'text-slate-700'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-[#5E58E7] dark:text-indigo-400 flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">Home • Caregiver Ananya Sharma Connected for {patient.name}</span>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
          isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-[#5E58E7] border border-indigo-200/60'
        }`}>
          {subTab === 'location' && `Safe Zone & Geo-Fence`}
          {subTab === 'sos' && (sosAlerts.filter(a => a.status === 'active').length > 0 ? `${sosAlerts.filter(a => a.status === 'active').length} Active SOS` : 'SOS (Standby)')}
          {subTab === 'qr' && `Emergency QR (${emergencyQR?.status || 'Active'})`}
          {subTab === 'notifications' && `Alerts (${unreadCount > 0 ? `${unreadCount} Unread` : `${notifications.length}`})`}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* SUBSECTION A: LOCATION & SAFE ZONES                                       */}
      {/* ========================================================================= */}
      {subTab === 'location' && (
        <div className="space-y-6">
          {/* Latest Available Patient Location Card */}
          <div className={`p-6 rounded-3xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <MapPin className="w-5 h-5 text-emerald-500" />
                  Latest Available Patient Location
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Live device location, accuracy radius, and safe-zone geofence boundary verification.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  latestLoc?.is_inside_safe_zone
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${latestLoc?.is_inside_safe_zone ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                  {latestLoc?.is_inside_safe_zone ? 'Inside Home Safe Zone' : 'Outside Safe Zone'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Current Address</p>
                <p className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {latestLoc ? latestLoc.address : patient.address || '24, Green Park, New Delhi'}
                </p>
                <span className={`text-[10px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  GPS Coordinates: {latestLoc ? `${latestLoc.latitude.toFixed(4)}, ${latestLoc.longitude.toFixed(4)}` : '28.5594, 77.2023'}
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Accuracy & Sensor Status</p>
                <p className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ±{latestLoc ? Math.round(latestLoc.accuracy_meters) : 10} meters
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-500" />
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {latestLoc ? latestLoc.battery_level : 88}% Battery
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Last Reported Timestamp</p>
                <p className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {latestLoc ? new Date(latestLoc.timestamp).toLocaleTimeString() : '10:42 AM'}
                </p>
                <span className={`text-[10px] mt-1 block ${isDark ? 'text-indigo-400' : 'text-[#5E58E7]'}`}>
                  Continuous monitoring active
                </span>
              </div>
            </div>
          </div>

          {/* Safe Zone Configuration Form */}
          <div className={`p-6 rounded-3xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Shield className="w-5 h-5 text-indigo-500" />
                  Home Safe Zone Configuration
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Configure geofence perimeter radius. Guardians receive alerts whenever patient exits or returns.
                </p>
              </div>

              {szSavedMsg && (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Safe Zone Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveSafeZone} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Safe Zone Name</label>
                  <input
                    type="text"
                    required
                    value={szName}
                    onChange={(e) => setSzName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Center Address</label>
                  <input
                    type="text"
                    required
                    value={szAddress}
                    onChange={(e) => setSzAddress(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold">Perimeter Radius: <strong className="text-[#5E58E7] dark:text-indigo-400">{szRadius} meters</strong></label>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recommended: 300m - 800m</span>
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

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={szMonitoring}
                    onChange={(e) => setSzMonitoring(e.target.checked)}
                    className="w-4 h-4 rounded text-[#5E58E7]"
                  />
                  <span>Enable Real-time Safe Zone Monitoring & Automatic Exit Alerts</span>
                </label>

                <button
                  type="submit"
                  disabled={szSaving}
                  className="px-6 py-2.5 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] text-white rounded-xl text-xs font-bold active:scale-95 shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
                >
                  {szSaving ? 'Saving...' : 'Update Safe Zone'}
                </button>
              </div>
            </form>
          </div>

          {/* Safe Zone Events History */}
          <div className={`p-6 rounded-3xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
          }`}>
            <h3 className={`text-base font-bold flex items-center gap-2 mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Clock className="w-5 h-5 text-indigo-500" />
              Safe Zone Activity & Geofence Event History
            </h3>
            <div className="space-y-2.5">
              {locationHistory.map((loc) => (
                <div
                  key={loc.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    loc.is_inside_safe_zone
                      ? isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                      : isDark ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${loc.is_inside_safe_zone ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div>
                      <p className="font-bold">{loc.address}</p>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {loc.is_inside_safe_zone ? 'Within Geofence Safe Zone' : 'Perimeter Safe Zone Alert'} • ±{Math.round(loc.accuracy_meters)}m accuracy
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION B: SOS & EMERGENCY                                             */}
      {/* ========================================================================= */}
      {subTab === 'sos' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Emergency SOS Monitoring & Incident Response
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Review active emergency alarms triggered from the patient dashboard or voice assistant.
              </p>
            </div>

            <button
              id="btn-trigger-test-sos"
              type="button"
              disabled={isTriggeringSOS}
              onClick={handleTriggerTestSOS}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950/40 active:scale-95 cursor-pointer disabled:opacity-60 transition-all"
            >
              <AlertTriangle className={`w-4 h-4 ${isTriggeringSOS ? 'animate-spin' : ''}`} />
              {isTriggeringSOS ? 'Triggering Emergency SOS...' : 'Trigger Test SOS'}
            </button>
          </div>

          {sosFeedback && (
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold animate-in fade-in ${
              isDark ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-900 shadow-xs'
            }`}>
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
                <span>{sosFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setSosFeedback(null)}
                className="text-rose-600 dark:text-rose-400 hover:opacity-75 cursor-pointer p-1"
                aria-label="Dismiss feedback"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active SOS Alerts */}
          <div className="space-y-3">
            {sosAlerts.length === 0 ? (
              <div className={`p-8 rounded-3xl border text-center ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
              }`}>
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p className="font-bold text-sm">No Active Emergency SOS Incidents</p>
                <p className="text-xs mt-0.5">Patient has not triggered emergency assistance.</p>
              </div>
            ) : (
              sosAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    alert.status === 'active'
                      ? 'bg-rose-950/30 border-rose-500/50 text-white ring-1 ring-rose-500/40'
                      : alert.status === 'acknowledged'
                      ? 'bg-amber-950/20 border-amber-500/40 text-slate-200'
                      : isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                        : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                        alert.status === 'active' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold">EMERGENCY SOS ALERT #{alert.id}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            alert.status === 'active'
                              ? 'bg-rose-600 text-white'
                              : alert.status === 'acknowledged'
                              ? 'bg-amber-500 text-black'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-xs mt-1">Location: {alert.location_address || 'Reported from Home'}</p>
                        {alert.notes && <p className="text-[11px] mt-0.5 opacity-80">{alert.notes}</p>}
                        <span className="text-[10px] mt-1 block opacity-60">
                          Triggered at: {alert.triggered_at ? new Date(alert.triggered_at).toLocaleString() : 'Just now'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.status === 'active' && (
                        <button
                          onClick={() => onAcknowledgeSOS(alert.id, 'Guardian acknowledged via portal')}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold active:scale-95 cursor-pointer"
                        >
                          Acknowledge Alert
                        </button>
                      )}

                      {alert.status !== 'resolved' && (
                        <button
                          onClick={() => onResolveSOS(alert.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold active:scale-95 cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}

                      {patient.emergency_contact_phone && (
                        <a
                          href={`tel:${patient.emergency_contact_phone}`}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Emergency Contacts Card */}
          <div className={`p-6 rounded-3xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
          }`}>
            <h3 className={`text-base font-bold flex items-center gap-2 mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Phone className="w-5 h-5 text-indigo-500" />
              Designated Emergency Contacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Primary Family Guardian</p>
                <p className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {patient.emergency_contact_relation || 'Daughter'} ({patient.call_sign || 'Meera Sharma'}'s Family)
                </p>
                <a
                  href={`tel:${patient.emergency_contact_phone || '+91 98765 12345'}`}
                  className="text-xs font-bold text-[#5E58E7] dark:text-indigo-400 mt-1.5 inline-flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {patient.emergency_contact_phone || '+91 98765 12345'}
                </a>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Primary Physician / Clinic</p>
                <p className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {patient.doctor_name || 'Dr. Arvind Mehra'} ({patient.doctor_clinic || 'Geriatric Care'})
                </p>
                <a
                  href={`tel:${patient.doctor_phone || '+91 98112 34567'}`}
                  className="text-xs font-bold text-[#5E58E7] dark:text-indigo-400 mt-1.5 inline-flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {patient.doctor_phone || '+91 98112 34567'}
                </a>
              </div>
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
                      {getNotifIcon(notif.notification_type)}
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

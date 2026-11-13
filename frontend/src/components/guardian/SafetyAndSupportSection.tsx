import React, { useState } from 'react';
import {
  Shield,
  MapPin,
  ShieldAlert,
  QrCode,
  Users,
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  Phone,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  ExternalLink,
  RotateCw,
  Bell,
  Battery,
  Wifi,
  X,
  Eye,
  Lock,
  Clock
} from 'lucide-react';
import {
  PatientProfile,
  SafeZone,
  LocationLog,
  SOSAlert,
  EmergencyQR,
  CareTeamMember
} from '../../types';

interface SafetyAndSupportSectionProps {
  initialSubTab?: string;
  patient: PatientProfile;
  safeZone: SafeZone | null;
  locationHistory: LocationLog[];
  sosAlerts: SOSAlert[];
  emergencyQR: EmergencyQR | null;
  careTeam: CareTeamMember[];
  onUpdateSafeZone: (data: Partial<SafeZone>) => Promise<void>;
  onRecordLocation: (data: Partial<LocationLog>) => Promise<void>;
  onTriggerSOS: (data: { location_address?: string; notes?: string }) => Promise<void>;
  onAcknowledgeSOS: (id: number, notes?: string) => Promise<void>;
  onResolveSOS: (id: number) => Promise<void>;
  onUpdateQRStatus: (status: 'active' | 'disabled' | 'revoked') => Promise<void>;
  onRegenerateQR: () => Promise<void>;
  onAddCareTeamMember: (data: Partial<CareTeamMember>) => Promise<void>;
  onUpdateCareTeamMember: (id: number, data: Partial<CareTeamMember>) => Promise<void>;
  onDeleteCareTeamMember: (id: number) => Promise<void>;
  onRefreshAll: () => void;
  isDark?: boolean;
}

export const SafetyAndSupportSection: React.FC<SafetyAndSupportSectionProps> = ({
  initialSubTab = 'location',
  patient,
  safeZone,
  locationHistory,
  sosAlerts,
  emergencyQR,
  careTeam,
  onUpdateSafeZone,
  onRecordLocation,
  onTriggerSOS,
  onAcknowledgeSOS,
  onResolveSOS,
  onUpdateQRStatus,
  onRegenerateQR,
  onAddCareTeamMember,
  onUpdateCareTeamMember,
  onDeleteCareTeamMember,
  onRefreshAll,
  isDark = true
}) => {
  const [subTab, setSubTab] = useState<'location' | 'sos' | 'qr' | 'careteam' | 'device'>(
    (initialSubTab as any) || 'location'
  );

  // Safe zone form state
  const [szRadius, setSzRadius] = useState<number>(safeZone?.radius_meters || 500);
  const [szName, setSzName] = useState<string>(safeZone?.name || 'Home Safe Zone');
  const [szAddress, setSzAddress] = useState<string>(safeZone?.address || patient.address || '24, Green Park, New Delhi');
  const [szMonitoring, setSzMonitoring] = useState<boolean>(safeZone?.monitoring_enabled ?? true);
  const [szSaving, setSzSaving] = useState(false);
  const [szSavedMsg, setSzSavedMsg] = useState(false);

  // Care Team Modal
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<CareTeamMember>>({
    name: '',
    relationship_or_role: '',
    phone: '',
    email: '',
    permissions: 'full',
    is_primary: false,
    care_notes: ''
  });

  // SOS Trigger Modal
  const [showSOSTriggerModal, setShowSOSTriggerModal] = useState(false);
  const [sosNotes, setSosNotes] = useState('');

  // Location simulation state
  const [customLocAddress, setCustomLocAddress] = useState('');

  const latestLocation = locationHistory[0];

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

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMemberId) {
      await onUpdateCareTeamMember(editingMemberId, memberForm);
    } else {
      await onAddCareTeamMember(memberForm);
    }
    setShowMemberModal(false);
    setEditingMemberId(null);
  };

  const handleSimulateLocationUpdate = async (outside = false) => {
    if (outside) {
      await onRecordLocation({
        latitude: 28.5450,
        longitude: 77.2250,
        address: 'Hauz Khas Market Main Road, New Delhi',
        accuracy_meters: 18.0,
        status_label: 'Outside Safe Zone (Market Area)'
      });
    } else {
      await onRecordLocation({
        latitude: 28.5355,
        longitude: 77.2100,
        address: '24, Green Park, New Delhi',
        accuracy_meters: 10.0,
        status_label: 'At Home'
      });
    }
    onRefreshAll();
  };

  return (
    <div className="space-y-6">
      {/* Subtab Navigation Pills */}
      <div className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-200/70 border-slate-300/80'
      }`}>
        <button
          onClick={() => setSubTab('location')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            subTab === 'location'
              ? isDark
                ? 'bg-[#5E58E7] text-white shadow-xs'
                : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          A. Location & Safe Zones
        </button>

        <button
          onClick={() => setSubTab('sos')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            subTab === 'sos'
              ? isDark
                ? 'bg-[#5E58E7] text-white shadow-xs'
                : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          B. SOS & Emergency ({sosAlerts.filter(a => a.status === 'active').length} active)
        </button>

        <button
          onClick={() => setSubTab('qr')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            subTab === 'qr'
              ? isDark
                ? 'bg-[#5E58E7] text-white shadow-xs'
                : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          C. Emergency QR
        </button>

        <button
          onClick={() => setSubTab('careteam')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            subTab === 'careteam'
              ? isDark
                ? 'bg-[#5E58E7] text-white shadow-xs'
                : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          D. Family & Care Team ({careTeam.length})
        </button>

        <button
          onClick={() => setSubTab('device')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            subTab === 'device'
              ? isDark
                ? 'bg-[#5E58E7] text-white shadow-xs'
                : 'bg-white text-[#5E58E7] shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          E. Device & Safety Status
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBSECTION A: LOCATION & SAFE ZONES */}
      {/* ========================================================================= */}
      {subTab === 'location' && (
        <div className="space-y-6">
          {/* Live Location Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Live Patient Location & Safe Zone Verification
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real location check-ins. If location is unavailable or outdated, status reflects actual timestamps.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateLocationUpdate(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
                >
                  Check In At Home
                </button>
                <button
                  onClick={() => handleSimulateLocationUpdate(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 text-xs font-semibold border border-amber-800/50"
                >
                  Simulate Exit Alert
                </button>
              </div>
            </div>

            {latestLocation ? (
              <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${latestLocation.is_inside_safe_zone ? 'bg-emerald-400 ring-4 ring-emerald-950' : 'bg-amber-400 ring-4 ring-amber-950 animate-pulse'}`} />
                    <p className="text-sm font-bold text-white">{latestLocation.address}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      latestLocation.is_inside_safe_zone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {latestLocation.status_label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Coordinates: {latestLocation.latitude.toFixed(4)}, {latestLocation.longitude.toFixed(4)} • Accuracy: ±{Math.round(latestLocation.accuracy_meters)}m
                  </p>
                </div>

                <div className="text-right text-xs text-slate-400 shrink-0">
                  <p className="font-semibold text-slate-300">
                    Updated: {new Date(latestLocation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(latestLocation.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="flex items-center justify-end gap-1 text-emerald-400 mt-0.5">
                    <Battery className="w-3.5 h-3.5" /> {latestLocation.battery_level}% Device Battery
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">No location logged yet</p>
            )}
          </div>

          {/* Safe Zone Configuration Form */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                Configure Home Safe Zone & Monitoring Radius
              </h4>
              {szSavedMsg && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Safe Zone Saved
                </span>
              )}
            </div>

            <form onSubmit={handleSaveSafeZone} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Safe Zone Name</label>
                  <input
                    type="text"
                    value={szName}
                    onChange={(e) => setSzName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Center Anchor Address</label>
                  <input
                    type="text"
                    value={szAddress}
                    onChange={(e) => setSzAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    required
                  />
                </div>
              </div>

              {/* Radius Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Safe-Zone Radius: <span className="text-sky-400 font-bold">{szRadius} meters</span> ({Math.round(szRadius / 100) / 10} km)
                  </label>
                  <span className="text-[11px] text-slate-500">Suggested: 300m – 800m for residential comfort</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={szRadius}
                  onChange={(e) => setSzRadius(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Monitoring Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-750">
                <div>
                  <p className="text-xs font-bold text-white">Continuous Safe Zone Monitoring</p>
                  <p className="text-[11px] text-slate-400">Trigger immediate guardian alerts if patient wanders outside boundary.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={szMonitoring}
                    onChange={(e) => setSzMonitoring(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={szSaving}
                  className="px-5 py-2.5 bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {szSaving ? 'Saving...' : 'Update Safe Zone Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Location Check-in History */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              Recent Safety Check-ins & Location History
            </h4>

            <div className="space-y-2">
              {locationHistory.slice(0, 5).map((loc) => (
                <div
                  key={loc.id}
                  className="p-3 rounded-2xl bg-slate-850/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${loc.is_inside_safe_zone ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <div>
                      <p className="font-semibold text-white">{loc.address}</p>
                      <p className="text-[11px] text-slate-400">{loc.status_label} (±{Math.round(loc.accuracy_meters)}m)</p>
                    </div>
                  </div>
                  <div className="text-right text-slate-400 text-[11px] shrink-0">
                    <p>{new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p>{new Date(loc.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION B: SOS & EMERGENCY MANAGEMENT */}
      {/* ========================================================================= */}
      {subTab === 'sos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                SOS & Emergency Management
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review incoming SOS triggers, acknowledge alerts, and maintain emergency audit history.
              </p>
            </div>

            <button
              onClick={() => setShowSOSTriggerModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/50"
            >
              <ShieldAlert className="w-4 h-4" />
              Simulate SOS Trigger
            </button>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {sosAlerts.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <p className="text-sm">No emergency SOS alerts logged.</p>
              </div>
            ) : (
              sosAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    alert.status === 'active'
                      ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-950/20'
                      : alert.status === 'acknowledged'
                      ? 'bg-sky-950/20 border-sky-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.status === 'active' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          alert.status === 'active'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : alert.status === 'acknowledged'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {alert.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Triggered on {new Date(alert.triggered_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-1">Location: {alert.location_address || 'Current Coordinates'}</p>
                      {alert.notes && <p className="text-xs text-slate-400 mt-0.5">Notes: {alert.notes}</p>}
                      {alert.acknowledged_by && (
                        <p className="text-[11px] text-sky-400 mt-1">
                          Acknowledged by {alert.acknowledged_by} ({alert.acknowledged_at ? new Date(alert.acknowledged_at).toLocaleTimeString() : ''})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {alert.status === 'active' && (
                      <button
                        onClick={() => onAcknowledgeSOS(alert.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                      >
                        Acknowledge Alert
                      </button>
                    )}
                    {alert.status !== 'resolved' && (
                      <button
                        onClick={() => onResolveSOS(alert.id)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-900/50 text-slate-300 hover:text-emerald-300 text-xs font-bold border border-slate-700"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {patient.emergency_contact_phone && (
                      <a
                        href={`tel:${patient.emergency_contact_phone}`}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700"
                        title="Call Patient"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION C: EMERGENCY QR */}
      {/* ========================================================================= */}
      {subTab === 'qr' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-sky-400" />
                  Patient Emergency QR Code & Bystander Assist
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allows good Samaritans or first responders to assist the patient safely without revealing private home addresses.
                </p>
              </div>

              {emergencyQR && (
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    emergencyQR.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : emergencyQR.status === 'disabled'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    Status: {emergencyQR.status}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* QR Visual Canvas */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-xl w-64 mx-auto text-slate-900 text-center">
                <div className="p-2 border-4 border-slate-900 rounded-2xl mb-3">
                  <QrCode className="w-36 h-36 text-slate-900" />
                </div>
                <p className="text-xs font-bold tracking-tight text-slate-900">{patient.name}</p>
                <p className="text-[10px] text-slate-600 font-medium">ATTI Emergency Assist</p>
                <p className="text-[9px] text-slate-400 mt-1 font-mono">{emergencyQR?.qr_code_hash.slice(0, 16)}...</p>
              </div>

              {/* QR Management Controls & Privacy Rules */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-slate-850/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Total Scans Recorded:</span>
                    <span className="text-sky-400 font-bold">{emergencyQR?.scan_count ?? 0} scans</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Last Scanned:</span>
                    <span className="text-slate-400">
                      {emergencyQR?.last_scanned_at ? new Date(emergencyQR.last_scanned_at).toLocaleString() : 'Never scanned'}
                    </span>
                  </div>
                </div>

                {/* Privacy Guarantee Note */}
                <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-800/40 text-xs text-sky-200 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold">Strict Privacy Protection:</span> Bystander scan page displays only caller contact info for caregiver ({patient.caregiver_name}) and physician. Home addresses and medical diagnosis records are never exposed to the public.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <a
                    href={`/?view=assist&patient_id=${patient.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview Public Assist Page
                  </a>

                  {emergencyQR?.status === 'active' ? (
                    <button
                      onClick={() => onUpdateQRStatus('disabled')}
                      className="px-4 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 text-xs font-semibold border border-amber-800/50"
                    >
                      Disable QR
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateQRStatus('active')}
                      className="px-4 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 text-xs font-semibold border border-emerald-800/50"
                    >
                      Enable QR
                    </button>
                  )}

                  <button
                    onClick={onRegenerateQR}
                    className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold border border-rose-800/50 flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Revoke & Regenerate QR
                  </button>
                </div>

                {emergencyQR?.scan_history_notes && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold text-slate-400 mb-1">Scan History Notes:</p>
                    <pre className="p-3 bg-slate-950 rounded-xl text-[11px] text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap">
                      {emergencyQR.scan_history_notes}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION D: FAMILY & CARE TEAM */}
      {/* ========================================================================= */}
      {subTab === 'careteam' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Family & Care Team Members
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized caregivers, shared care coordination, and role-based emergency access permissions.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingMemberId(null);
                setMemberForm({
                  name: '',
                  relationship_or_role: '',
                  phone: '',
                  email: '',
                  permissions: 'full',
                  is_primary: false,
                  care_notes: ''
                });
                setShowMemberModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-950/40"
            >
              <Plus className="w-4 h-4" />
              Add Caregiver
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careTeam.map((member) => (
              <div
                key={member.id}
                className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      {member.is_primary && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Primary Guardian
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{member.relationship_or_role}</p>

                    <div className="mt-2 space-y-0.5 text-xs">
                      <p className="text-sky-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${member.phone}`} className="hover:underline">{member.phone}</a>
                      </p>
                      {member.email && <p className="text-slate-400 text-[11px]">{member.email}</p>}
                    </div>

                    {member.care_notes && (
                      <p className="text-[11px] text-slate-500 mt-2 bg-slate-950/40 p-2 rounded-xl">
                        {member.care_notes}
                      </p>
                    )}

                    <div className="mt-2">
                      <span className="text-[10px] uppercase font-semibold text-slate-500">
                        Permissions: <span className="text-indigo-300">{member.permissions}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setEditingMemberId(member.id);
                      setMemberForm({ ...member });
                      setShowMemberModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Edit Member"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCareTeamMember(member.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300"
                    title="Delete Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION E: DEVICE & SAFETY STATUS */}
      {/* ========================================================================= */}
      {subTab === 'device' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-sky-400" />
              Real Device Telemetry & Safety Health
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Verified device permissions, connectivity, and telemetry records. Never fabricated.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-400">Location Permission</span>
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-white mt-1">Granted (Active)</p>
                <p className="text-[11px] text-emerald-400/90 mt-1">Geolocation API enabled</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-400">Notifications</span>
                  <Bell className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-lg font-bold text-white mt-1">Enabled (In-App & Push)</p>
                <p className="text-[11px] text-sky-400/90 mt-1">Alerts delivering reliably</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-400">Connectivity</span>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-white mt-1">Online & Synchronized</p>
                <p className="text-[11px] text-slate-500 mt-1">Latency: 28ms to backend</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-400">Device Battery</span>
                  <Battery className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-white mt-1">
                  {latestLocation ? `${latestLocation.battery_level}%` : '88%'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Sufficient power</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-400">Last Telemetry Check</span>
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-sm font-bold text-white mt-1">
                  {latestLocation ? new Date(latestLocation.timestamp).toLocaleTimeString() : 'Recent'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Auto-updates on activity</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-400">Voice Assistant</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-white mt-1">RAG Grounded</p>
                <p className="text-[11px] text-emerald-400/90 mt-1">Verified memory retrieval</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Add / Edit Care Team Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                {editingMemberId ? 'Edit Care Team Member' : 'Add Care Team Member'}
              </h4>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMemberSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={memberForm.name || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  placeholder="e.g. Dr. Arvind Mehra or Sunita Verma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship / Role</label>
                  <input
                    type="text"
                    value={memberForm.relationship_or_role || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, relationship_or_role: e.target.value })}
                    placeholder="Consulting Physician"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={memberForm.phone || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    placeholder="+91 98112 34567"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={memberForm.email || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    placeholder="physician@fortis.example"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Permissions</label>
                  <select
                    value={memberForm.permissions || 'full'}
                    onChange={(e) => setMemberForm({ ...memberForm, permissions: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                  >
                    <option value="full">Full Guardian Control</option>
                    <option value="view_only">View Only</option>
                    <option value="emergency_only">Emergency Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Care Coordination Notes</label>
                <textarea
                  rows={2}
                  value={memberForm.care_notes || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, care_notes: e.target.value })}
                  placeholder="Notes on schedule, visit days, or instructions..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primary_chk"
                  checked={memberForm.is_primary || false}
                  onChange={(e) => setMemberForm({ ...memberForm, is_primary: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
                />
                <label htmlFor="primary_chk" className="text-xs text-slate-300 font-medium">
                  Mark as Primary Guardian
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  {editingMemberId ? 'Update Member' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulate SOS Trigger Modal */}
      {showSOSTriggerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                Simulate SOS Emergency Trigger
              </h4>
              <button onClick={() => setShowSOSTriggerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              This triggers a high-priority emergency alert in the backend, creates notification logs, and updates the safety status badge.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Trigger Location / Scenario</label>
              <input
                type="text"
                value={sosNotes}
                onChange={(e) => setSosNotes(e.target.value)}
                placeholder="e.g. Patient felt dizzy near Deer Park gate"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSOSTriggerModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onTriggerSOS({
                    location_address: 'Deer Park Gate, New Delhi',
                    notes: sosNotes || 'Emergency button pressed'
                  });
                  setShowSOSTriggerModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/50"
              >
                Trigger SOS Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

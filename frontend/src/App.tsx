import React, { useState, useEffect } from 'react';
import { PatientView } from './components/PatientView';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { WelcomeView } from './components/WelcomeView';
import { Smartphone, Monitor, Sparkles, LogOut, ArrowLeftRight } from 'lucide-react';
import { api } from './services/api';
import { PatientProfile } from './types';

import { EmergencyAssistView } from './components/EmergencyAssistView';

export const App: React.FC = () => {
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true); // default to phone bezel view for mobile prototype
  const [caregiverPreviewPatient, setCaregiverPreviewPatient] = useState<boolean>(false);

  // Check if viewing via Emergency QR Scan (?view=assist&patient_id=...)
  const [assistPatientId, setAssistPatientId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'assist') {
        return parseInt(params.get('patient_id') || '1', 10);
      }
    }
    return null;
  });

  // Verify persistent session on application startup
  useEffect(() => {
    let isMounted = true;

    // Attempts session restoration via HttpOnly refresh cookie or active token
    api.getMe()
      .then((profile) => {
        if (isMounted) {
          setPatient(profile);
          setAuthLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPatient(null);
          setAuthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthenticated = (authenticatedPatient: PatientProfile) => {
    setPatient(authenticatedPatient);
    setCaregiverPreviewPatient(false);
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    await api.logout();
    setPatient(null);
    setCaregiverPreviewPatient(false);
    setAuthLoading(false);
  };

  // If scanning emergency QR code, show unauthenticated assistance screen directly
  if (assistPatientId) {
    return (
      <EmergencyAssistView
        patientId={assistPatientId}
        onBackToApp={() => {
          window.history.pushState({}, '', window.location.pathname);
          setAssistPatientId(null);
        }}
      />
    );
  }

  // 1. Initial Authentication Check Loading Screen (Prevents page flashing)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl ring-8 ring-sky-900/50 animate-pulse">
            <Sparkles className="w-10 h-10 animate-calm-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-white mb-1">
          ATTI Memory Assistant
        </h2>
        <p className="text-xs text-sky-400 font-medium">
          Verifying your session & loading memory records...
        </p>
      </div>
    );
  }

  const isCaregiverAccount = patient && (patient.role === 'caregiver' || patient.role === 'family');

  const renderActiveView = () => {
    if (!patient) {
      return <WelcomeView onAuthenticated={handleAuthenticated} />;
    }

    if (isCaregiverAccount && !caregiverPreviewPatient) {
      return (
        <CaregiverDashboard
          patient={patient}
          onLogout={handleLogout}
          onBackToPatient={() => setCaregiverPreviewPatient(true)}
        />
      );
    }

    return (
      <PatientView
        patient={patient}
        onLogout={handleLogout}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center">
      {/* Top Floating Simulator Controls Bar */}
      <div className="w-full bg-slate-950/90 text-slate-300 px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-sky-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ATTI Dementia Assistant</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            {patient
              ? isCaregiverAccount
                ? `Family Member: ${patient.name} (Managing: ${patient.associated_patient_name || 'Meera Sharma'})`
                : `Patient Session: ${patient.call_sign} (${patient.name})`
              : 'Welcome & Authentication'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCaregiverAccount && (
            <button
              onClick={() => setCaregiverPreviewPatient(!caregiverPreviewPatient)}
              className="p-1 rounded-md bg-sky-900/60 hover:bg-sky-800 text-sky-200 transition-colors border border-sky-700/60 flex items-center gap-1.5 px-2.5 text-xs font-semibold"
              title={caregiverPreviewPatient ? 'Return to Caregiver Portal' : 'Preview Patient View'}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{caregiverPreviewPatient ? 'Back to Caregiver Portal' : 'Preview Patient View'}</span>
            </button>
          )}

          {patient && (
            <button
              onClick={handleLogout}
              className="p-1 rounded-md bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-colors border border-rose-800/60 flex items-center gap-1.5 px-2 text-xs font-semibold"
              title="Log out of current account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          {/* Mobile Frame Simulator Switcher */}
          <button
            onClick={() => setDeviceFrame(!deviceFrame)}
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center gap-1.5 px-2 text-xs"
            title={deviceFrame ? 'Switch to Full Screen View' : 'Switch to Mobile Phone Frame'}
          >
            {deviceFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{deviceFrame ? 'Desktop View' : 'Phone Frame'}</span>
          </button>
        </div>
      </div>

      {/* Main View Container */}
      <div className="flex-1 w-full flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
        {deviceFrame && (!isCaregiverAccount || caregiverPreviewPatient) ? (
          /* Realistic Phone Bezel Frame */
          <div className="w-full max-w-md h-[92vh] max-h-[880px] bg-white dark:bg-slate-950 rounded-none sm:rounded-[44px] shadow-2xl border-0 sm:border-[8px] sm:border-slate-800 overflow-hidden flex flex-col relative ring-1 ring-slate-800/20 transition-colors">
            <div className="flex-1 overflow-y-auto w-full">
              {renderActiveView()}
            </div>
          </div>
        ) : (
          /* Full Width Responsive View (Especially great for Caregiver Dashboard & Desktop) */
          <div className="w-full max-w-5xl bg-slate-50 dark:bg-slate-950 min-h-screen rounded-none sm:rounded-3xl shadow-xl overflow-hidden flex flex-col transition-colors">
            {renderActiveView()}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

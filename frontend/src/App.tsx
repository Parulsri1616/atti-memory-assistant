import React, { useState, useEffect } from 'react';
import { PatientView } from './components/PatientView';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { WelcomeView } from './components/WelcomeView';
import attiLogo from './assets/atti-care-logo.png';
import { api } from './services/api';
import { PatientProfile } from './types';

import { EmergencyAssistView } from './components/EmergencyAssistView';

export const App: React.FC = () => {
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true); // default to phone bezel view for mobile prototype

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
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    await api.logout();
    setPatient(null);
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
          <div className="w-24 h-24 rounded-3xl bg-[#002aff] flex items-center justify-center shadow-2xl ring-4 ring-blue-500/30 overflow-hidden animate-pulse">
            <img src={attiLogo} alt="ATTI Family Care" className="w-full h-full object-cover select-none" />
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

    if (isCaregiverAccount) {
      return (
        <CaregiverDashboard
          patient={patient}
          onLogout={handleLogout}
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
      {/* Main View Container */}
      <div className="flex-1 w-full flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
        {deviceFrame && !isCaregiverAccount ? (
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

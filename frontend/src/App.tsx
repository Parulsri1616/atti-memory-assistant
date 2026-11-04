import React, { useState, useEffect } from 'react';
import { PatientView } from './components/PatientView';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { Smartphone, Monitor, ShieldCheck, Heart } from 'lucide-react';
import { api } from './services/api';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'patient' | 'caregiver'>('patient');
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true); // default to mobile view to showcase mobile prototype
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    api.getSystemStatus().then(setSystemStatus).catch(() => {});
  }, []);

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
          <span className="hidden sm:inline text-slate-400">
            Delhi Technical Campus (B.Tech CSE 7th Sem)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="bg-slate-800 p-0.5 rounded-lg flex items-center border border-slate-700">
            <button
              onClick={() => setViewMode('patient')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === 'patient'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Patient View
            </button>
            <button
              onClick={() => setViewMode('caregiver')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'caregiver'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3 h-3 fill-rose-300 text-rose-300" />
              <span>Caregiver Portal</span>
            </button>
          </div>

          {/* Mobile frame vs Full-width switch */}
          {viewMode === 'patient' && (
            <button
              onClick={() => setDeviceFrame(!deviceFrame)}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              title={deviceFrame ? 'Switch to Full Screen View' : 'Switch to Mobile Phone Frame'}
            >
              {deviceFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main View Container */}
      <div className="flex-1 w-full flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
        {viewMode === 'patient' ? (
          deviceFrame ? (
            /* Realistic Phone Bezel Frame */
            <div className="w-full max-w-md h-[92vh] max-h-[880px] bg-white rounded-none sm:rounded-[44px] shadow-2xl border-0 sm:border-[8px] sm:border-slate-800 overflow-hidden flex flex-col relative ring-1 ring-slate-800/20">
              {/* Speaker notch */}
              <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-b-xl z-30" />
              <div className="flex-1 overflow-y-auto w-full">
                <PatientView onOpenCaregiver={() => setViewMode('caregiver')} />
              </div>
            </div>
          ) : (
            /* Full Width View */
            <div className="w-full max-w-4xl bg-slate-50 min-h-screen rounded-none sm:rounded-3xl shadow-xl overflow-hidden flex flex-col">
              <PatientView onOpenCaregiver={() => setViewMode('caregiver')} />
            </div>
          )
        ) : (
          /* Caregiver Portal (Always full spacious layout for dashboard ease) */
          <div className="w-full max-w-6xl bg-white min-h-[92vh] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-800/20">
            <CaregiverDashboard onBackToPatient={() => setViewMode('patient')} />
          </div>
        )}
      </div>
    </div>
  );
};
export default App;

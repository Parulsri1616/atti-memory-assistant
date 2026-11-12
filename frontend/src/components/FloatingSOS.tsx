import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhoneCall, X, AlertCircle, ShieldAlert, Check, Phone } from 'lucide-react';
import { PatientProfile, Person } from '../types';
import { speechService } from '../services/speech';

interface FloatingSOSProps {
  patient: PatientProfile | null;
  people?: Person[];
  isDark?: boolean;
  onNotifyCaregiver?: () => void;
}

const HOLD_DURATION_MS = 2500; // 2.5 seconds required hold duration

export const FloatingSOS: React.FC<FloatingSOSProps> = ({
  patient,
  people = [],
  isDark = false,
  onNotifyCaregiver
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [callingState, setCallingState] = useState<'idle' | 'calling' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const holdStartRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<any>(null);

  // Look up caregiver / guardian contact from patient profile or people list
  const caregiverPerson = people.find(
    (p) =>
      p.name.toLowerCase() === (patient?.caregiver_name || 'ananya sharma').toLowerCase() ||
      p.relationship.toLowerCase().includes('caregiver') ||
      p.relationship.toLowerCase().includes('guardian') ||
      p.relationship.toLowerCase().includes('daughter')
  );

  const guardianName = caregiverPerson?.name || patient?.caregiver_name || 'Ananya Sharma';
  const guardianPhone = caregiverPerson?.phone || patient?.emergency_contact_phone || (patient as any)?.caregiver_phone || '+91 98765 12345';
  const hasValidPhone = Boolean(guardianPhone && guardianPhone.trim().length > 3);

  // Reset states when popup closes
  const handleClose = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    holdStartRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);
    setCallingState('idle');
    setStatusMessage('');
    setIsOpen(false);
  }, []);

  // Cancel hold helper
  const cancelHold = useCallback(() => {
    if (callingState === 'calling') return; // Do not cancel if already triggered
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    holdStartRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);
  }, [callingState]);

  // Execute guardian call upon 2.5s hold completion
  const triggerGuardianCall = useCallback(() => {
    if (callingState === 'calling') return;

    if (!hasValidPhone) {
      setCallingState('error');
      setStatusMessage('Guardian phone number is missing from ATTI records. Please dial 112 for emergency.');
      speechService.speak('Guardian phone number is missing. Please contact emergency services directly.');
      return;
    }

    setCallingState('calling');
    setStatusMessage(`Calling your guardian ${guardianName}...`);

    // Voice announcement for dementia reassurance
    speechService.speak(`Calling your guardian ${guardianName} now. Please stay calm.`);

    // Trigger existing caregiver notification workflow
    if (onNotifyCaregiver) {
      try {
        onNotifyCaregiver();
      } catch (err) {
        console.warn('Failed to dispatch caregiver notification event', err);
      }
    }

    // Trigger phone dialer via hidden anchor after reassurance pause
    setTimeout(() => {
      const cleanNumber = guardianPhone.replace(/\s+/g, '');
      if (typeof window !== 'undefined') {
        try {
          const link = document.createElement('a');
          link.href = `tel:${cleanNumber}`;
          link.rel = 'noopener noreferrer';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch {
          window.location.href = `tel:${cleanNumber}`;
        }
      }
    }, 1800);
  }, [callingState, guardianName, guardianPhone, hasValidPhone, onNotifyCaregiver]);

  // Combined tick loop (RAF + 25ms timer) to track hold progress smoothly
  const startHold = useCallback((e?: React.SyntheticEvent) => {
    if (e && e.cancelable) {
      e.preventDefault();
    }
    if (callingState === 'calling') return;

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    setIsHolding(true);
    setHoldProgress(0);
    holdStartRef.current = performance.now();

    const tick = () => {
      if (!holdStartRef.current) return;
      const elapsed = performance.now() - holdStartRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        holdStartRef.current = null;
        if (holdIntervalRef.current) {
          clearInterval(holdIntervalRef.current);
          holdIntervalRef.current = null;
        }
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        setIsHolding(false);
        triggerGuardianCall();
      }
    };

    holdIntervalRef.current = setInterval(tick, 25);
    animFrameRef.current = requestAnimationFrame(tick);
  }, [callingState, triggerGuardianCall]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Circular progress calculations for SVG ring
  const circleRadius = 52;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - holdProgress);

  return (
    <>
      {/* ========================================================= */}
      {/* 1. FLOATING SOS BUTTON (Right-Hand Side Edge)             */}
      {/* ========================================================= */}
      <aside aria-label="Emergency SOS Quick Action">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed right-3.5 top-[58%] -translate-y-1/2 sm:right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 hover:from-rose-600 hover:to-red-800 text-white shadow-xl shadow-red-500/40 border-2 border-white/90 ring-4 ring-rose-400/30 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 group focus:outline-hidden focus:ring-4 focus:ring-red-300"
          title={`Emergency SOS: Call Guardian ${guardianName}`}
          aria-label="Emergency SOS - Press to open confirmation to call guardian"
        >
          <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform animate-calm-pulse" />
          <span className="text-[11px] sm:text-xs font-black tracking-wider text-white uppercase drop-shadow-sm mt-0.5">
            SOS
          </span>
        </button>
      </aside>

      {/* ========================================================= */}
      {/* 2. SOS CONFIRMATION POPUP MODAL (Press & Hold Flow)       */}
      {/* ========================================================= */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-modal-heading"
          onClick={(e) => {
            if (e.target === e.currentTarget && callingState !== 'calling') {
              handleClose();
            }
          }}
        >
          <div
            className={`w-full max-w-xs rounded-3xl p-6 shadow-2xl border transition-all text-center flex flex-col items-center ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header with Title and Close X */}
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">Emergency Help</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={callingState === 'calling'}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                aria-label="Cancel and close emergency popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Heading */}
            <h2 id="sos-modal-heading" className="text-xl font-black tracking-tight mt-1">
              Need help?
            </h2>

            {/* Supporting Text */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] leading-relaxed">
              Press and hold the button below to call your guardian.
            </p>

            {/* Guardian Contact Information Card */}
            <div
              className={`w-full my-4 p-3 rounded-2xl border text-left text-xs ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Designated Guardian
              </div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5 flex items-center justify-between">
                <span>{guardianName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  Caregiver
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 font-mono text-xs mt-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                <span>{guardianPhone}</span>
              </div>
            </div>

            {/* Calling Status Feedback */}
            {callingState === 'calling' && (
              <div className="w-full p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 mb-3 animate-pulse">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span className="truncate">{statusMessage || `Calling Guardian ${guardianName}...`}</span>
              </div>
            )}

            {callingState === 'error' && (
              <div className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-left text-[11px]">{statusMessage}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* Step 3: PRESS AND HOLD LARGE RED SOS BUTTON (2.5 Seconds) */}
            {/* ========================================================= */}
            <div className="relative my-2 flex items-center justify-center">
              {/* Circular SVG Progress Ring */}
              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 120 120">
                {/* Background Track */}
                <circle
                  cx="60"
                  cy="60"
                  r={circleRadius}
                  stroke={isDark ? '#334155' : '#E2E8F0'}
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress Filling Stroke */}
                <circle
                  cx="60"
                  cy="60"
                  r={circleRadius}
                  stroke="#E11D48"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: circleCircumference,
                    strokeDashoffset: strokeDashoffset,
                    transition: isHolding ? 'stroke-dashoffset 25ms linear' : 'stroke-dashoffset 200ms ease-out'
                  }}
                />
              </svg>

              {/* Central Interactive Button */}
              <button
                type="button"
                id="sos-hold-button"
                data-testid="sos-hold-button"
                onPointerDown={startHold}
                onPointerUp={cancelHold}
                onPointerLeave={cancelHold}
                onPointerCancel={cancelHold}
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                onKeyDown={(e) => {
                  if ((e.key === ' ' || e.key === 'Enter') && !isHolding) {
                    startHold(e);
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    cancelHold();
                  }
                }}
                disabled={callingState === 'calling'}
                className={`absolute w-28 h-28 rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 hover:from-rose-600 hover:to-red-800 active:scale-95 text-white flex flex-col items-center justify-center shadow-xl shadow-red-600/30 transition-transform cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none ${
                  isHolding ? 'scale-95 ring-4 ring-rose-400' : ''
                }`}
                aria-label={`Press and hold for 2.5 seconds to call guardian ${guardianName}`}
              >
                <PhoneCall className={`w-8 h-8 text-white ${isHolding ? 'animate-bounce' : ''}`} />
                <span className="text-xl font-black tracking-widest text-white uppercase drop-shadow-sm">
                  SOS
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-100">
                  {isHolding ? `${Math.round(holdProgress * 100)}%` : 'HOLD'}
                </span>
              </button>
            </div>

            {/* Instruction guidance */}
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-2 font-medium">
              {isHolding ? 'Keep holding...' : 'Press and hold continuously for 2.5 seconds'}
            </p>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleClose}
              disabled={callingState === 'calling'}
              className="mt-4 px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

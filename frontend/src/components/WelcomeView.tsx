import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Heart,
  ChevronRight,
  ArrowLeft,
  Lock,
  Mail,
  UserCheck,
  Shield,
  Clock,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { PatientProfile } from '../types';

interface WelcomeViewProps {
  onAuthenticated: (patient: PatientProfile) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onAuthenticated }) => {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'family' | null>('patient');
  const [patientAuthMode, setPatientAuthMode] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [callSign, setCallSign] = useState('Meera');
  const [caregiverName, setCaregiverName] = useState('Ananya Sharma');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<'patient' | 'family' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetFields = () => {
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
  };

  // One-Tap Demo Login (Independent Patient vs Family Member Flows)
  const handleDemoLogin = async (role: 'patient' | 'family' = 'patient') => {
    setIsLoading(true);
    setLoadingRole(role);
    setErrorMessage(null);
    try {
      const res = await api.demoLogin(role);
      onAuthenticated(res.patient);
    } catch (err: any) {
      setErrorMessage(err.message || `Could not log into demo ${role} account. Please try again.`);
    } finally {
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  // 2. Patient Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.login(trimmedEmail, password);
      onAuthenticated(res.patient);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Patient Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      setErrorMessage('Please enter the patient full name.');
      return;
    }
    if (!trimmedEmail) {
      setErrorMessage('Please enter an email address.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter to confirm.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        confirm_password: confirmPassword,
        call_sign: callSign.trim() || 'Meera',
        caregiver_name: caregiverName.trim() || 'Ananya Sharma'
      });
      onAuthenticated(res.patient);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. This email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-sky-50/80 via-slate-50 to-white text-slate-800 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
      {/* Top Header / App Shell */}
      <div className="w-full max-w-md flex items-center justify-between mb-2">
        {selectedRole === 'family' ? (
          <button
            onClick={() => setSelectedRole('patient')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-700 hover:text-slate-900 shadow-xs border border-slate-200 text-sm font-semibold transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Role Selection</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-sm font-extrabold tracking-tight text-sky-950 uppercase">
              ATTI Care
            </span>
          </div>
        )}
        <span className="text-xs font-semibold px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full border border-sky-200">
          Dementia Companion
        </span>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Soft Glowing Circular Badge */}
        <div className="relative my-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/25 ring-8 ring-sky-100">
            <Sparkles className="w-10 h-10 animate-calm-pulse" />
          </div>
        </div>

        {/* Welcome Headings (Inspired by Sahayika reference) */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center">
          Welcome to ATTI
        </h1>
        <p className="text-sm font-medium text-slate-500 text-center mt-1">
          डिमेंशिया मेमोरी और दैनिक दिनचर्या साथी
        </p>
        <p className="text-xs text-slate-400 text-center mb-6">
          A gentle, voice-guided assistant for loved ones with memory decline
        </p>



        {/* --- TWO DISTINCT DEMO LOGIN OPTIONS (PATIENT & FAMILY MEMBER) --- */}
        <div className="w-full flex flex-col gap-2.5 mb-5">
          <div>
            <div className="text-sm font-bold text-slate-900">
              Demo Access Options · डेमो लॉगिन
            </div>
            <div className="text-xs text-slate-400">
              Select an account to explore ATTI with comprehensive dummy data
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Demo Option 1: Continue as Demo Patient */}
            <button
              id="btn-demo-patient"
              type="button"
              onClick={() => handleDemoLogin('patient')}
              disabled={isLoading}
              className="w-full p-4 rounded-2xl text-left flex items-center justify-between transition-all border bg-white border-sky-500 hover:border-sky-600 hover:shadow-md ring-2 ring-sky-100 active:scale-98 cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 group-hover:bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200/60 transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Continue as Demo Patient</span>
                    <span className="text-xs px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full font-semibold">
                      मरीज़
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {loadingRole === 'patient'
                      ? 'Authenticating Meera Sharma...'
                      : 'Meera Sharma (72 yrs) • Voice assistant & daily routines'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-sky-600 group-hover:translate-x-1 transition-all shrink-0" />
            </button>

            {/* Demo Option 2: Continue as Demo Family Member */}
            <button
              id="btn-demo-family"
              type="button"
              onClick={() => handleDemoLogin('family')}
              disabled={isLoading}
              className="w-full p-4 rounded-2xl text-left flex items-center justify-between transition-all border bg-white border-rose-400 hover:border-rose-500 hover:shadow-md ring-2 ring-rose-100 active:scale-98 cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/60 transition-colors">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Continue as Demo Family Member</span>
                    <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-semibold">
                      परिवार
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {loadingRole === 'family'
                      ? 'Authenticating Ananya Sharma...'
                      : 'Ananya Sharma (Daughter) • Caregiver portal & monitoring'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          </div>
        </div>

        {/* --- DYNAMIC CONTENT BASED ON SELECTED ROLE --- */}
        {selectedRole === 'family' ? (
          /* Family Member Portal Details */
          <div className="w-full bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 flex flex-col items-center text-center animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 border border-rose-200/80 shadow-xs">
              <Heart className="w-7 h-7 fill-rose-200 text-rose-600" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-0.5 rounded-full border border-rose-200 mb-2">
              Caregiver & Family Portal
            </span>

            <h2 className="text-lg font-bold text-slate-900 mb-0.5">
              Family Member Portal
            </h2>
            <p className="text-xs font-semibold text-slate-500 mb-3">
              परिवार और देखभालकर्ता पोर्टल
            </p>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Caregivers and family members can view associated patient profiles, update daily routines and medications, configure emergency contacts, and monitor voice assistant interactions.
            </p>

            {/* Upcoming Features Checklist */}
            <div className="w-full bg-slate-50 rounded-2xl p-3.5 text-left border border-slate-200/70 mb-4 flex flex-col gap-2">
              <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Active Portal Capabilities
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Shield className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Guardian Profile & Emergency QR Code</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Daily Reminders & Medication Scheduling</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>People I Know & Familiar Contacts</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Interaction History & Memory Analytics</span>
              </div>
            </div>

            {/* Demo access for Family Member */}
            <button
              type="button"
              onClick={() => handleDemoLogin('family')}
              disabled={isLoading}
              className="w-full mb-2.5 py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-rose-200" />
              <span>{loadingRole === 'family' ? 'Authenticating Family Member...' : 'Continue as Demo Family Member'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('patient')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-2xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Patient View</span>
            </button>
          </div>
        ) : (
          /* Patient Sign In / Sign Up Form Card */
          <div className="w-full bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 flex flex-col gap-4">
            {/* Error Notice */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {patientAuthMode === 'signin' ? (
              /* SIGN IN FORM (DEFAULT) */
              <>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Sign in with email
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ईमेल और पासवर्ड से साइन इन करें
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email address · ईमेल पता
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com or demo@atti.care"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password · पासवर्ड
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-1 py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:bg-slate-400"
                  >
                    <span>{isLoading ? 'Signing In...' : 'Sign In as Patient'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Under submit button: Don't have an account? Sign Up */}
                <div className="text-center text-xs text-slate-500 mt-1">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setPatientAuthMode('signup');
                      resetFields();
                    }}
                    className="font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all"
                  >
                    Sign Up · नया खाता बनाएं
                  </button>
                </div>

                {/* Demo Quick Shortcuts */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-slate-400 font-medium">or test with demo accounts</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('patient')}
                    disabled={isLoading}
                    className="w-full py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 active:scale-98 text-sky-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-sky-200 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>{loadingRole === 'patient' ? 'Connecting...' : 'Continue as Demo Patient'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('family')}
                    disabled={isLoading}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-rose-200 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-600" />
                    <span>{loadingRole === 'family' ? 'Connecting...' : 'Continue as Demo Family Member'}</span>
                  </button>
                </div>
              </>
            ) : (
              /* SIGN UP FORM (Appears in place of Sign In) */
              <>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Create Patient Account
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    नया मरीज़ खाता बनाएं
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name · पूरा नाम
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Verma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Call Sign · पुकारने का नाम
                      </label>
                      <input
                        type="text"
                        value={callSign}
                        onChange={(e) => setCallSign(e.target.value)}
                        placeholder="e.g. Meera / Dadi"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Caregiver Name · परिजन
                      </label>
                      <input
                        type="text"
                        value={caregiverName}
                        onChange={(e) => setCaregiverName(e.target.value)}
                        placeholder="e.g. Ananya Sharma"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email address · ईमेल पता
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ramesh@example.com"
                        disabled={isLoading}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all disabled:bg-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password · पासवर्ड
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        disabled={isLoading}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all disabled:bg-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password · पासवर्ड की पुष्टि करें
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password to confirm"
                        disabled={isLoading}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all disabled:bg-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-1 py-3 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:bg-slate-400"
                  >
                    <span>{isLoading ? 'Creating Account...' : 'Create Account & Enter'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Under submit button: Already have an account? Sign In */}
                <div className="text-center text-xs text-slate-500 mt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setPatientAuthMode('signin');
                      resetFields();
                    }}
                    className="font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all"
                  >
                    Sign In · साइन इन करें
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

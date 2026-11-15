import React, { useState } from 'react';
import {
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
  AlertCircle,
  UserPlus
} from 'lucide-react';
import attiLogo from '../assets/atti-care-logo.png';
import { api } from '../services/api';
import { PatientProfile } from '../types';
import { useLanguage, LanguageToggle } from '../services/language';
import { FamilyPatientOnboardingView } from './FamilyPatientOnboardingView';

// Custom vector icons crafted in the expressive line-art aesthetic of the ATTI family logo
export const PatientVectorIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Hair bun on side */}
    <circle cx="5" cy="11.5" r="2.2" strokeWidth="1.8" />
    {/* Hair wave over forehead */}
    <path d="M 6.5 10.5 C 7.5 6.5 11 5.5 14 6 C 17 6.5 19 8.5 18.5 12" strokeWidth="1.8" />
    {/* Face contour */}
    <path d="M 7.5 11 C 7.5 15.5 9.5 18.5 12.5 18.5 C 15.5 18.5 17.5 15.5 17.5 11" strokeWidth="1.8" />
    {/* Spectacles / Round Glasses */}
    <circle cx="9.8" cy="12" r="2.2" strokeWidth="1.8" />
    <circle cx="15.2" cy="12" r="2.2" strokeWidth="1.8" />
    <line x1="12" y1="12" x2="13" y2="12" strokeWidth="1.8" />
    {/* Bindi */}
    <circle cx="12.5" cy="8.2" r="0.75" fill="currentColor" stroke="none" />
    {/* Kind Smile */}
    <path d="M 11 15.8 Q 12.5 17.4 14 15.8" strokeWidth="1.8" />
    {/* Saree / Shoulders */}
    <path d="M 5.5 21.5 C 7 19.5 9.5 19 12.5 19 C 15.5 19 18 19.5 19.5 21.5" strokeWidth="1.8" />
    <path d="M 8.5 21.5 L 13.5 19" strokeWidth="1.8" />
  </svg>
);

export const FamilyMemberVectorIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Wavy hair volume */}
    <path d="M 6.5 13.5 C 5 11 5.5 7.5 8 5.5 C 10.5 3.8 14.5 4 17 5.5 C 19.5 7.5 20 11 18.5 13.5" strokeWidth="1.8" />
    <path d="M 5.5 13 C 4.5 14.5 5 17 6.5 17.5" strokeWidth="1.8" />
    {/* Face contour */}
    <path d="M 7.8 10.5 C 7.8 15 9.8 18 12.5 18 C 15.2 18 17.2 15 17.2 10.5" strokeWidth="1.8" />
    {/* Drop Earring */}
    <circle cx="6.5" cy="14" r="1.3" strokeWidth="1.5" />
    {/* Bindi */}
    <circle cx="12.5" cy="8" r="0.75" fill="currentColor" stroke="none" />
    {/* Gentle Eyes */}
    <path d="M 9.5 11 Q 10.5 10.2 11.5 11" strokeWidth="1.6" />
    <path d="M 13.5 11 Q 14.5 10.2 15.5 11" strokeWidth="1.6" />
    {/* Warm Smile */}
    <path d="M 10.5 14.2 Q 12.5 16.2 14.5 14.2" strokeWidth="1.8" />
    {/* Saree / Shoulders */}
    <path d="M 5.5 21.5 C 7 19.2 9.5 18.8 12.5 18.8 C 15.5 18.8 18 19.2 19.5 21.5" strokeWidth="1.8" />
    <path d="M 9 21.5 L 14 18.8" strokeWidth="1.8" />
  </svg>
);

interface WelcomeViewProps {
  onAuthenticated: (patient: PatientProfile) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onAuthenticated }) => {
  const { t, language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'patient' | 'family' | null>('patient');
  const [patientAuthMode, setPatientAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

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
      if (typeof window !== 'undefined') {
        localStorage.setItem('atti_is_demo', 'true');
        sessionStorage.setItem('atti_is_demo', 'true');
      }
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

  if (showOnboarding) {
    return (
      <FamilyPatientOnboardingView
        onCompleted={onAuthenticated}
        onCancel={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
      {/* Top Header / App Shell */}
      <div className="w-full max-w-md flex items-center justify-between gap-2 mb-2">
        {selectedRole === 'family' ? (
          <button
            onClick={() => setSelectedRole('patient')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-xs text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('welcome.role_selection')}</span>
          </button>
        ) : (
          <div />
        )}
        <LanguageToggle />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md flex flex-col items-center">
        {/* ATTI Family Hero Logo Badge */}
        <div className="relative my-4 group">
          <div className="w-24 h-24 rounded-3xl bg-[#002aff] flex items-center justify-center shadow-xl shadow-blue-600/20 ring-4 ring-blue-50 overflow-hidden transition-transform duration-300 hover:scale-105">
            <img
              src={attiLogo}
              alt="ATTI Family Care Logo"
              className="w-full h-full object-cover select-none"
            />
          </div>
        </div>

        {/* Welcome Headings */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center">
          {t('welcome.title')}
        </h1>
        {language === 'hi' && (
          <p className="text-sm font-medium text-slate-600 text-center mt-1">
            {t('welcome.tagline')}
          </p>
        )}
        <p className="text-xs text-slate-400 text-center mb-6 mt-1">
          {t('welcome.subtitle')}
        </p>

        {/* --- TWO DISTINCT DEMO LOGIN OPTIONS (PATIENT & FAMILY MEMBER) --- */}
        <div className="w-full flex flex-col gap-2.5 mb-5">
          <div>
            <div className="text-sm font-bold text-slate-900">
              {t('welcome.demo_options_title')}
            </div>
            <div className="text-xs text-slate-400">
              {t('welcome.demo_options_subtitle')}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Demo Option 1: Continue as Demo Patient */}
            <button
              id="btn-demo-patient"
              type="button"
              onClick={() => handleDemoLogin('patient')}
              disabled={isLoading}
              className="w-full p-4 rounded-2xl text-left flex items-center justify-between transition-all bg-slate-50 hover:bg-slate-100/90 active:scale-[0.99] cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25 group-hover:scale-105 transition-all">
                  <PatientVectorIcon className="w-7 h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-bold text-slate-900">
                    {t('welcome.demo_patient_title')}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {loadingRole === 'patient'
                      ? t('welcome.demo_patient_authenticating')
                      : t('welcome.demo_patient_desc')}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all shrink-0" />
            </button>

            {/* Demo Option 2: Continue as Demo Family Member */}
            <button
              id="btn-demo-family"
              type="button"
              onClick={() => handleDemoLogin('family')}
              disabled={isLoading}
              className="w-full p-4 rounded-2xl text-left flex items-center justify-between transition-all bg-slate-50 hover:bg-slate-100/90 active:scale-[0.99] cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25 group-hover:scale-105 transition-all">
                  <FamilyMemberVectorIcon className="w-7 h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-bold text-slate-900">
                    {t('welcome.demo_family_title')}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {loadingRole === 'family'
                      ? t('welcome.demo_family_authenticating')
                      : t('welcome.demo_family_desc')}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all shrink-0" />
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
              {t('welcome.portal_badge')}
            </span>

            <h2 className="text-lg font-bold text-slate-900 mb-0.5">
              {t('welcome.portal_title')}
            </h2>
            <p className="text-xs font-semibold text-slate-500 mb-3">
              {t('welcome.portal_subtitle')}
            </p>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              {t('welcome.portal_desc')}
            </p>

            {/* Upcoming Features Checklist */}
            <div className="w-full bg-slate-50 rounded-2xl p-3.5 text-left border border-slate-200/70 mb-4 flex flex-col gap-2">
              <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                {t('welcome.capabilities_title')}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Shield className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>{t('welcome.cap_emergency_qr')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>{t('welcome.cap_reminders')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>{t('welcome.cap_people')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{t('welcome.cap_analytics')}</span>
              </div>
            </div>

            {/* Demo access for Family Member */}
            <button
              id="btn-demo-family-member"
              type="button"
              onClick={() => handleDemoLogin('family')}
              disabled={isLoading}
              className="w-full mb-2 py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-rose-200" />
              <span>{loadingRole === 'family' ? t('welcome.demo_family_authenticating') : t('welcome.demo_family_title')}</span>
            </button>

            {/* New Family Member Registration & Patient Onboarding */}
            <button
              id="btn-family-onboarding"
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="w-full mb-2.5 py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-indigo-300" />
              <span>Create Account & Onboard Patient</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('patient')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-2xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('welcome.return_patient_view')}</span>
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
                    {t('welcome.signin_title')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('welcome.signin_subtitle')}
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('welcome.email_label')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="input-patient-email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('welcome.email_placeholder')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('welcome.password_label')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="input-patient-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('welcome.password_placeholder')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    id="btn-patient-signin"
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-1 py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:bg-slate-400 cursor-pointer"
                  >
                    <span>{isLoading ? t('welcome.signin_loading') : t('welcome.signin_btn')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Under submit button: Don't have an account? Create Account */}
                <div className="text-center text-xs text-slate-500 mt-1">
                  {t('welcome.no_account')}{' '}
                  <button
                    id="btn-create-account"
                    type="button"
                    onClick={() => {
                      setShowOnboarding(true);
                      resetFields();
                    }}
                    className="font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all cursor-pointer"
                  >
                    {t('welcome.signup_link')} (Family & Patient Onboarding)
                  </button>
                </div>
              </>
            ) : (
              /* SIGN UP FORM (Appears in place of Sign In) */
              <>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {t('welcome.signup_title')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('welcome.signup_subtitle')}
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('welcome.fullname_label')}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('welcome.fullname_placeholder')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('welcome.callsign_label')}
                      </label>
                      <input
                        type="text"
                        value={callSign}
                        onChange={(e) => setCallSign(e.target.value)}
                        placeholder={t('welcome.callsign_placeholder')}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('welcome.caregiver_label')}
                      </label>
                      <input
                        type="text"
                        value={caregiverName}
                        onChange={(e) => setCaregiverName(e.target.value)}
                        placeholder={t('welcome.caregiver_placeholder')}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('welcome.email_label')}
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
                      {t('welcome.password_label')}
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
                      {t('welcome.confirm_password_label')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('welcome.confirm_password_placeholder')}
                        disabled={isLoading}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all disabled:bg-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-1 py-3 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:bg-slate-400 cursor-pointer"
                  >
                    <span>{isLoading ? t('welcome.signup_loading') : t('welcome.signup_btn')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Under submit button: Already have an account? Sign In */}
                <div className="text-center text-xs text-slate-500 mt-1">
                  {t('welcome.have_account')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setPatientAuthMode('signin');
                      resetFields();
                    }}
                    className="font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all cursor-pointer"
                  >
                    {t('welcome.signin_link')}
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

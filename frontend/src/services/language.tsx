import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Languages } from 'lucide-react';

export type Language = 'en' | 'hi';

const LANGUAGE_STORAGE_KEY = 'atti_language_preference';

export const translations = {
  en: {
    // App general
    'app.name': 'ATTI Care',
    'app.companion': 'Dementia Companion',
    'app.loading_session': 'Verifying your session & loading memory records...',
    'app.memory_assistant': 'ATTI Memory Assistant',

    // Welcome Screen
    'welcome.dementia_companion': 'Dementia Companion',
    'welcome.title': 'Welcome to ATTI',
    'welcome.tagline': 'Dementia memory and daily routine companion',
    'welcome.subtitle': 'A gentle, voice-guided assistant for loved ones with memory decline',

    // Demo Access
    'welcome.demo_options_title': 'Demo Access Options',
    'welcome.demo_options_subtitle': 'Select an account to explore ATTI with comprehensive dummy data',
    'welcome.demo_patient_title': 'Continue as Demo Patient',
    'welcome.demo_patient_badge': 'Patient',
    'welcome.demo_patient_desc': 'Meera Sharma (72 yrs) • Voice assistant & daily routines',
    'welcome.demo_patient_authenticating': 'Authenticating Meera Sharma...',

    'welcome.demo_family_title': 'Continue as Demo Family Member',
    'welcome.demo_family_badge': 'Family',
    'welcome.demo_family_desc': 'Ananya Sharma (Daughter) • Caregiver portal & monitoring',
    'welcome.demo_family_authenticating': 'Authenticating Ananya Sharma...',

    // Family Member Portal Card (Welcome Screen)
    'welcome.portal_badge': 'Caregiver & Family Portal',
    'welcome.portal_title': 'Family Member Portal',
    'welcome.portal_subtitle': 'Caregiver & family coordination',
    'welcome.portal_desc': 'Caregivers and family members can view associated patient profiles, update daily routines and medications, configure emergency contacts, and monitor voice assistant interactions.',
    'welcome.capabilities_title': 'Active Portal Capabilities',
    'welcome.cap_emergency_qr': 'Guardian Profile & Emergency QR Code',
    'welcome.cap_reminders': 'Daily Reminders & Medication Scheduling',
    'welcome.cap_people': 'People I Know & Familiar Contacts',
    'welcome.cap_analytics': 'Interaction History & Memory Analytics',
    'welcome.return_patient_view': 'Return to Patient View',
    'welcome.role_selection': 'Role Selection',

    // Sign In Form
    'welcome.signin_title': 'Sign in with email',
    'welcome.signin_subtitle': 'Enter your credentials to continue',
    'welcome.email_label': 'Email address',
    'welcome.email_placeholder': 'name@example.com or demo@atti.care',
    'welcome.password_label': 'Password',
    'welcome.password_placeholder': '••••••••',
    'welcome.signin_btn': 'Sign In as Patient',
    'welcome.signin_loading': 'Signing In...',
    'welcome.no_account': "Don't have an account?",
    'welcome.signup_link': 'Sign Up',

    // Sign Up Form
    'welcome.signup_title': 'Create Patient Account',
    'welcome.signup_subtitle': 'Register a new profile to get started',
    'welcome.fullname_label': 'Full Name',
    'welcome.fullname_placeholder': 'e.g. Ramesh Verma',
    'welcome.callsign_label': 'Call Sign',
    'welcome.callsign_placeholder': 'e.g. Meera / Dadi',
    'welcome.caregiver_label': 'Caregiver Name',
    'welcome.caregiver_placeholder': 'e.g. Ananya Sharma',
    'welcome.confirm_password_label': 'Confirm Password',
    'welcome.confirm_password_placeholder': 'Re-enter password to confirm',
    'welcome.signup_btn': 'Create Account & Enter',
    'welcome.signup_loading': 'Creating Account...',
    'welcome.have_account': 'Already have an account?',
    'welcome.signin_link': 'Sign In',

    // Caregiver Dashboard Header
    'caregiver.portal_title': 'ATTI Caregiver Portal',
    'caregiver.guardian_badge': 'Guardian',
    'caregiver.caring_for': 'Caring for {name}',
    'caregiver.notifications': 'Care Notifications',
    'caregiver.sign_out': 'Sign Out',
    'caregiver.theme_tooltip': 'Toggle Theme',

    // Navigation Tabs
    'nav.overview': 'Overview',
    'nav.care_management': 'Care Management',
    'nav.safety_alerts': 'Safety & Alerts',

    // Care Subsections
    'care.medications': 'Medications',
    'care.routines': 'Routines',
    'care.appointments': 'Appointments',
    'care.care_plan': 'Care Plan',

    // Safety Subsections
    'safety.sos_logs': 'SOS Logs',
    'safety.safe_zones': 'Safe Zones',
    'safety.live_tracking': 'Live Tracking',
    'safety.emergency_contacts': 'Emergency Contacts',

    // Common
    'common.active': 'Active',
    'common.status': 'Status',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.language': 'Language',
  },
  hi: {
    // App general
    'app.name': 'ATTI केयर',
    'app.companion': 'डिमेंशिया साथी',
    'app.loading_session': 'सत्र सत्यापन और मेमोरी रिकॉर्ड लोड हो रहे हैं...',
    'app.memory_assistant': 'ATTI मेमोरी सहायक',

    // Welcome Screen
    'welcome.dementia_companion': 'डिमेंशिया साथी',
    'welcome.title': 'ATTI में आपका स्वागत है',
    'welcome.tagline': 'डिमेंशिया मेमोरी और दैनिक दिनचर्या साथी',
    'welcome.subtitle': 'याददाश्त में कमी वाले प्रियजनों के लिए एक सौम्य, आवाज़-निर्देशित सहायक',

    // Demo Access
    'welcome.demo_options_title': 'डेमो एक्सेस विकल्प',
    'welcome.demo_options_subtitle': 'डेमो डेटा के साथ ATTI का अनुभव करने के लिए एक खाता चुनें',
    'welcome.demo_patient_title': 'डेमो मरीज़ के रूप में जारी रखें',
    'welcome.demo_patient_badge': 'मरीज़',
    'welcome.demo_patient_desc': 'मीरा शर्मा (72 वर्ष) • आवाज़ सहायक और दैनिक दिनचर्या',
    'welcome.demo_patient_authenticating': 'मीरा शर्मा को प्रमाणित किया जा रहा है...',

    'welcome.demo_family_title': 'डेमो परिवार सदस्य के रूप में जारी रखें',
    'welcome.demo_family_badge': 'परिवार',
    'welcome.demo_family_desc': 'अनन्या शर्मा (पुत्री) • देखभालकर्ता पोर्टल और निगरानी',
    'welcome.demo_family_authenticating': 'अनन्या शर्मा को प्रमाणित किया जा रहा है...',

    // Family Member Portal Card (Welcome Screen)
    'welcome.portal_badge': 'देखभालकर्ता और परिवार पोर्टल',
    'welcome.portal_title': 'परिवार सदस्य पोर्टल',
    'welcome.portal_subtitle': 'देखभालकर्ता और परिवार समन्वय',
    'welcome.portal_desc': 'देखभालकर्ता और परिवार के सदस्य मरीज़ प्रोफ़ाइल देख सकते हैं, दैनिक दिनचर्या और दवाएं अपडेट कर सकते हैं, आपातकालीन संपर्क सेट कर सकते हैं और वॉयस असिस्टेंट की निगरानी कर सकते हैं।',
    'welcome.capabilities_title': 'सक्रिय पोर्टल क्षमताएं',
    'welcome.cap_emergency_qr': 'अभिभावक प्रोफ़ाइल और आपातकालीन क्यूआर कोड',
    'welcome.cap_reminders': 'दैनिक अनुस्मारक और दवा समय-सारणी',
    'welcome.cap_people': 'परिचित लोग और संपर्क',
    'welcome.cap_analytics': 'संवाद इतिहास और मेमोरी विश्लेषण',
    'welcome.return_patient_view': 'मरीज़ दृश्य पर वापस जाएं',
    'welcome.role_selection': 'भूमिका चयन',

    // Sign In Form
    'welcome.signin_title': 'ईमेल से साइन इन करें',
    'welcome.signin_subtitle': 'आगे बढ़ने के लिए अपना विवरण दर्ज करें',
    'welcome.email_label': 'ईमेल पता',
    'welcome.email_placeholder': 'name@example.com या demo@atti.care',
    'welcome.password_label': 'पासवर्ड',
    'welcome.password_placeholder': '••••••••',
    'welcome.signin_btn': 'मरीज़ के रूप में साइन इन करें',
    'welcome.signin_loading': 'साइन इन हो रहा है...',
    'welcome.no_account': 'खाता नहीं है?',
    'welcome.signup_link': 'नया खाता बनाएं',

    // Sign Up Form
    'welcome.signup_title': 'नया मरीज़ खाता बनाएं',
    'welcome.signup_subtitle': 'आरंभ करने के लिए नई प्रोफ़ाइल पंजीकृत करें',
    'welcome.fullname_label': 'पूरा नाम',
    'welcome.fullname_placeholder': 'उदा. रमेश वर्मा',
    'welcome.callsign_label': 'पुकारने का नाम',
    'welcome.callsign_placeholder': 'उदा. मीरा / दादी',
    'welcome.caregiver_label': 'परिजन का नाम',
    'welcome.caregiver_placeholder': 'उदा. अनन्या शर्मा',
    'welcome.confirm_password_label': 'पासवर्ड की पुष्टि करें',
    'welcome.confirm_password_placeholder': 'पुष्टि के लिए पासवर्ड पुनः दर्ज करें',
    'welcome.signup_btn': 'खाता बनाएं और प्रवेश करें',
    'welcome.signup_loading': 'खाता बन रहा है...',
    'welcome.have_account': 'पहले से खाता है?',
    'welcome.signin_link': 'साइन इन करें',

    // Caregiver Dashboard Header
    'caregiver.portal_title': 'ATTI देखभालकर्ता पोर्टल',
    'caregiver.guardian_badge': 'अभिभावक',
    'caregiver.caring_for': '{name} की देखभाल',
    'caregiver.notifications': 'देखभाल सूचनाएं',
    'caregiver.sign_out': 'लॉग आउट',
    'caregiver.theme_tooltip': 'थीम बदलें',

    // Navigation Tabs
    'nav.overview': 'अवलोकन',
    'nav.care_management': 'देखभाल प्रबंधन',
    'nav.safety_alerts': 'सुरक्षा और अलर्ट',

    // Care Subsections
    'care.medications': 'दवाइयाँ',
    'care.routines': 'दिनचर्या',
    'care.appointments': 'मुलाकातें',
    'care.care_plan': 'देखभाल योजना',

    // Safety Subsections
    'safety.sos_logs': 'एसओएस लॉग',
    'safety.safe_zones': 'सुरक्षित क्षेत्र',
    'safety.live_tracking': 'लाइव ट्रैकिंग',
    'safety.emergency_contacts': 'आपातकालीन संपर्क',

    // Common
    'common.active': 'सक्रिय',
    'common.status': 'स्थिति',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.close': 'बंद करें',
    'common.language': 'भाषा',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'hi') {
      return stored;
    }
  } catch {}
  return 'en';
}

export function storeLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {}
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isHindi: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storeLanguage(lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.en;
    let text: string = (langDict as Record<string, string>)[key] || (translations.en as Record<string, string>)[key] || key;

    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
    }

    return text;
  };

  useEffect(() => {
    // Reflect language in HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isHindi: language === 'hi',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback safe dummy context if used outside provider
    const fallbackT = (key: TranslationKey, params?: Record<string, string | number>) => {
      let text: string = (translations.en as Record<string, string>)[key] || key;
      if (params) {
        Object.entries(params).forEach(([pKey, pVal]) => {
          text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
        });
      }
      return text;
    };
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: fallbackT,
      isHindi: false,
    };
  }
  return context;
};

/**
 * Reusable LanguageToggle Component
 * Supports:
 * - 'default': Clean white/slate pill for light background screens (e.g. WelcomeView)
 * - 'header': Translucent glassmorphism pill for dark/indigo caregiver headers
 * - 'compact': Minimal icon + indicator
 */
export const LanguageToggle: React.FC<{
  variant?: 'default' | 'header' | 'compact';
  className?: string;
}> = ({ variant = 'default', className = '' }) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'header') {
    return (
      <div
        className={`flex items-center bg-white/15 dark:bg-slate-800/80 rounded-full p-0.5 border border-white/20 dark:border-slate-700 backdrop-blur-md shrink-0 shadow-xs ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-0.5 text-[11px] font-extrabold rounded-full transition-all active:scale-95 cursor-pointer ${
            language === 'en'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-white/80 hover:text-white'
          }`}
          aria-pressed={language === 'en'}
          title="Switch to English"
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('hi')}
          className={`px-2 py-0.5 text-[11px] font-extrabold rounded-full transition-all active:scale-95 cursor-pointer ${
            language === 'hi'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-white/80 hover:text-white'
          }`}
          aria-pressed={language === 'hi'}
          title="हिंदी में बदलें"
        >
          HI
        </button>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/80 shadow-xs shrink-0 select-none ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <div className="pl-2 pr-1 text-slate-400">
        <Languages className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        id="btn-lang-en"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-150 active:scale-95 cursor-pointer ${
          language === 'en'
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-pressed={language === 'en'}
        title="English"
      >
        English
      </button>
      <button
        type="button"
        id="btn-lang-hi"
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-150 active:scale-95 cursor-pointer ${
          language === 'hi'
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-pressed={language === 'hi'}
        title="हिंदी"
      >
        हिंदी
      </button>
    </div>
  );
};

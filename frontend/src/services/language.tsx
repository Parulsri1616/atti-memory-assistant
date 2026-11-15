import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Languages } from 'lucide-react';

export type Language = 'en' | 'hi';

const LANGUAGE_STORAGE_KEY = 'atti_language_preference';

/**
 * Static key-based translations dictionary for backwards compatibility
 */
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

/**
 * Comprehensive App-Wide Hindi Dictionary for Dynamic Text & Phrase Translation
 * Maps exact English words, sentences, headers, buttons and clauses to Hindi.
 */
export const APP_HINDI_DICTIONARY: Record<string, string> = {
  // Navigation & Core Portal Header
  'ATTI Caregiver Portal': 'ATTI देखभालकर्ता पोर्टल',
  'Caregiver Portal': 'देखभालकर्ता पोर्टल',
  'ATTI Care': 'ATTI केयर',
  'ATTI Companion': 'ATTI साथी',
  'Guardian': 'अभिभावक',
  'Caring for': 'की देखभाल',
  'Caring for Meera Sharma': 'मीरा शर्मा की देखभाल',
  'Caregiver Ananya Sharma · connected for Meera Sharma': 'देखभालकर्ता अनन्या शर्मा · मीरा शर्मा के लिए सक्रिय रूप से जुड़े',
  'Caregiver Ananya Sharma': 'देखभालकर्ता अनन्या शर्मा',
  'Meera Sharma': 'मीरा शर्मा',
  'Ananya Sharma': 'अनन्या शर्मा',
  'Overview': 'अवलोकन',
  'Care Management': 'देखभाल प्रबंधन',
  'Safety & Alerts': 'सुरक्षा और अलर्ट',
  'Safety and alerts': 'सुरक्षा और अलर्ट',
  'Safe Zone': 'सुरक्षित क्षेत्र',
  'Safe Zones': 'सुरक्षित क्षेत्र',
  'Emergency': 'आपातकाल',
  'Medical QR': 'मेडिकल क्यूआर',
  'Emergency QR': 'आपातकालीन क्यूआर',
  'QR Pass': 'क्यूआर पास',
  'Alerts': 'अलर्ट',
  'Sign Out': 'साइन आउट',
  'Sign out of ATTI': 'ATTI से साइन आउट करें',
  'Care Notifications': 'देखभाल सूचनाएं',
  'Toggle Theme': 'थीम बदलें',
  'Listen to ATTI Voice Assistant': 'ATTI वॉयस असिस्टेंट सुनें',
  'Voice Assistant': 'वॉयस असिस्टेंट',
  'Inside Zone': 'क्षेत्र के अंदर',
  'Outside Zone': 'क्षेत्र से बाहर',
  'Outside': 'बाहर',
  'Inside': 'अंदर',
  '0 Active': '0 सक्रिय',
  '1 Active': '1 सक्रिय',
  '2 Active': '2 सक्रिय',
  '3 Active': '3 सक्रिय',
  'Active': 'सक्रिय',
  'Status': 'स्थिति',
  'Unread': 'अपठित',
  'Total': 'कुल',

  // Overview Section
  'Care categories': 'देखभाल श्रेणियां',
  'See all': 'सभी देखें',
  'Search daily routine activities...': 'दैनिक दिनचर्या गतिविधियाँ खोजें...',
  "Today's schedule": 'आज का कार्यक्रम',
  "Today's Schedule": 'आज का कार्यक्रम',
  'Good evening,': 'शुभ संध्या,',
  'Good evening': 'शुभ संध्या',
  'Good Morning': 'सुप्रभात',
  'Good Afternoon': 'नमस्कार',
  'Good Evening': 'शुभ संध्या',
  'Hello,': 'नमस्ते,',
  'Hello': 'नमस्ते',
  'Age': 'आयु',
  'yrs': 'वर्ष',
  'years': 'वर्ष',
  'Daily Routine': 'दैनिक दिनचर्या',
  'Routine': 'दिनचर्या',
  'Routines': 'दिनचर्या',
  'Medications': 'दवाइयाँ',
  'Appointments': 'मुलाकातें',
  'Health Notifications': 'स्वास्थ्य सूचनाएं',
  'Health': 'स्वास्थ्य',
  'All': 'सभी',
  'Completed': 'पूर्ण',
  'Scheduled': 'निर्धारित',
  'Upcoming': 'आगामी',
  'Pending': 'लंबित',
  'Missed': 'छूटा हुआ',
  'Resolved': 'हल किया गया',
  'Acknowledged': 'स्वीकृत',
  'Emergency SOS Alert Active': 'आपातकालीन एसओएस अलर्ट सक्रिय',
  'Review SOS Alert →': 'एसओएस अलर्ट देखें →',
  'Review SOS Alert': 'एसओएस अलर्ट देखें',
  'Safe & At Home': 'सुरक्षित और घर पर',
  'Medications Due': 'देय दवाएं',
  'Refill Needed': 'दवा दोबारा लेने की आवश्यकता',
  'Refill Reminders': 'रिफिल अनुस्मारक',
  'Recent Activity': 'हाल की गतिविधि',
  'Device Status': 'डिवाइस स्थिति',
  'Connectivity': 'कनेक्टिविटी',
  'Online': 'ऑनलाइन',
  'Offline': 'ऑफ़लाइन',
  'Continuous Monitoring': 'निरंतर निगरानी',
  'Continuous monitoring': 'निरंतर निगरानी',
  'Continuous monitoring active': 'निरंतर निगरानी सक्रिय',
  'Activity Reminders': 'गतिविधि अनुस्मारक',
  'No pending routine alerts. All set for today!': 'कोई लंबित दिनचर्या अलर्ट नहीं। आज के लिए सब तैयार है!',
  'Health Insights & Safety': 'स्वास्थ्य विश्लेषण और सुरक्षा',
  'Safety Logs': 'सुरक्षा लॉग',
  'Safe Zone & Mobility Status': 'सुरक्षित क्षेत्र और गतिशीलता स्थिति',
  'Open Live Map & Safe Zone': 'लाइव मैप और सुरक्षित क्षेत्र खोलें',
  'Safe zone monitoring active with real-time location logs.': 'वास्तविक समय स्थान लॉग के साथ सुरक्षित क्षेत्र निगरानी सक्रिय है।',

  // Safety & Alerts Section
  'Latest patient location': 'मरीज़ का नवीनतम स्थान',
  'Live device position, accuracy and safe-zone boundary check.': 'लाइव डिवाइस स्थिति, सटीकता और सुरक्षित क्षेत्र सीमा सत्यापन।',
  'Inside Home Safe Zone': 'घर के सुरक्षित क्षेत्र में',
  'Outside Safe Zone': 'सुरक्षित क्षेत्र से बाहर',
  'Refresh': 'रिफ्रेश करें',
  'Current address': 'वर्तमान पता',
  '24, Green Park, New Delhi': '24, ग्रीन पार्क, नई दिल्ली',
  'Green Park, New Delhi': 'ग्रीन पार्क, नई दिल्ली',
  'GPS Coordinates': 'जीपीएस निर्देशांक',
  'Accuracy': 'सटीकता',
  'Accuracy & Sensor Status': 'सटीकता और सेंसर स्थिति',
  '±10 m': '±10 मीटर',
  '±10 meters': '±10 मीटर',
  '88% battery': '88% बैटरी',
  '88% Battery': '88% बैटरी',
  'Battery Level': 'बैटरी स्तर',
  'battery': 'बैटरी',
  'Battery': 'बैटरी',
  'Last reported': 'अंतिम रिपोर्ट',
  'Last Reported Timestamp': 'अंतिम रिपोर्ट समय',
  'Directions': 'दिशा-निर्देश',
  'Call Meera': 'मीरा को कॉल करें',
  'Call': 'कॉल करें',
  'ACTIVE EMERGENCY INCIDENTS': 'सक्रिय आपातकालीन घटनाएं',
  'Active Emergency Incidents': 'सक्रिय आपातकालीन घटनाएं',
  'Emergency SOS Monitoring & Incident Response': 'आपातकालीन एसओएस निगरानी और त्वरित प्रतिक्रिया',
  'Review active emergency alarms triggered from the patient dashboard or voice assistant.': 'मरीज़ डैशबोर्ड या वॉयस असिस्टेंट से उत्पन्न सक्रिय आपातकालीन अलार्म की समीक्षा करें।',
  'SOS · SOS pendant': 'एसओएस · एसओएस पेंडेंट',
  'SOS · Voice assistant': 'एसओएस · वॉयस असिस्टेंट',
  'SOS · Smartwatch': 'एसओएस · स्मार्टवॉच',
  'SOS pendant': 'एसओएस पेंडेंट',
  'Voice assistant': 'वॉयस असिस्टेंट',
  'Smartwatch': 'स्मार्टवॉच',
  'Mark done': 'पूरा हुआ',
  'Mark Done': 'पूरा हुआ',
  'MARK DONE': 'पूरा हुआ',
  'Mark as done': 'पूरा हुआ',
  'Mark as Done': 'पूरा हुआ',
  'Mark taken': 'ली गई चिह्नित करें',
  'Mark Taken': 'ली गई चिह्नित करें',
  'Mark as taken': 'ली गई चिह्नित करें',
  'Mark as Taken': 'ली गई चिह्नित करें',
  'Undo': 'पूर्ववत करें',
  'UNDO': 'पूर्ववत करें',
  'Due': 'देय',
  'Acknowledge': 'स्वीकार करें',
  'Mark all read': 'सभी पढ़े हुए चिह्नित करें',
  'Mark All Read': 'सभी पढ़े हुए चिह्नित करें',
  'Mark Read': 'पढ़ा हुआ चिह्नित करें',
  'Mark read': 'पढ़ा हुआ चिह्नित करें',
  'Mark resolved': 'हल किया गया चिह्नित करें',
  'Mark Resolved': 'हल किया गया चिह्नित करें',
  'Mark Completed': 'पूर्ण चिह्नित करें',
  'Mark Missed': 'छूटा हुआ चिह्नित करें',
  'View details': 'विवरण देखें',
  'View Details': 'विवरण देखें',
  'Near Green Park Metro Station, New Delhi': 'ग्रीन पार्क मेट्रो स्टेशन के पास, नई दिल्ली',
  'Deer Park walking path, Hauz Khas': 'डियर पार्क वॉकिंग पाथ, हौज खास',
  'Living room, 24 Green Park': 'लिविंग रूम, 24 ग्रीन पार्क',
  'Emergency contacts': 'आपातकालीन संपर्क',
  'Designated Emergency Contacts': 'निर्धारित आपातकालीन संपर्क',
  'Called in this order when an SOS is raised.': 'एसओएस सक्रिय होने पर इस क्रम में कॉल किया जाता है।',
  'Primary Family Guardian': 'मुख्य पारिवारिक अभिभावक',
  'Primary Physician / Clinic': 'मुख्य चिकित्सक / क्लिनिक',
  'Primary caregiver': 'मुख्य देखभालकर्ता',
  'Secondary emergency guardian': 'द्वितीयक आपातकालीन अभिभावक',
  'Secondary caregiver': 'द्वितीयक देखभालकर्ता',
  'Daughter': 'पुत्री',
  'Son': 'पुत्र',
  'Dr. Arvind Mehra': 'डॉ. अरविंद मेहरा',
  'Dr. Shweta Rastogi': 'डॉ. श्वेता रस्तोगी',
  'Dr. Arjun Mehta': 'डॉ. अर्जुन मेहता',
  'Geriatrician': 'वृद्धावस्था विशेषज्ञ',
  'Geriatric Care': 'वृद्धावस्था देखभाल',
  'Ophthalmologist': 'नेत्र विशेषज्ञ',
  'Fortis Hospital OPD': 'फोर्टिस अस्पताल ओपीडी',
  'Fortis Hospital, Vasant Kunj': 'फोर्टिस अस्पताल, वसंत कुंज',
  'Max Healthcare, Saket': 'मैक्स हेल्थकेयर, साकेत',
  'AIIMS, New Delhi': 'एम्स, नई दिल्ली',
  'Rajesh Sharma': 'राजेश शर्मा',
  'Geofence Perimeter Settings & Event History': 'जियोफेंस परिधि सेटिंग्स और घटना इतिहास',
  'Geofence Boundary Configuration': 'जियोफेंस सीमा विन्यास',
  'Home Safe Zone Configuration': 'होम सेफ ज़ोन विन्यास',
  'Safe Zone Name': 'सुरक्षित क्षेत्र का नाम',
  'Center Address': 'केंद्र का पता',
  'Perimeter Radius': 'परिधि त्रिज्या',
  'Radius': 'त्रिज्या',
  'meters': 'मीटर',
  'Recommended: 300m - 800m': 'अनुशंसित: 300मी - 800मी',
  'Enable exit & entry push alerts': 'प्रवेश और निकास पुश अलर्ट सक्षम करें',
  'Enable Real-time Safe Zone Monitoring & Automatic Exit Alerts': 'रीयल-टाइम सेफ ज़ोन निगरानी और स्वचालित निकास अलर्ट सक्षम करें',
  'Update Settings': 'सेटिंग्स अपडेट करें',
  'Update Safe Zone': 'सुरक्षित क्षेत्र अपडेट करें',
  'Safe Zone Activity Log': 'सुरक्षित क्षेत्र गतिविधि लॉग',
  'Safe Zone Activity & Geofence Event History': 'सुरक्षित क्षेत्र गतिविधि और जियोफेंस घटना इतिहास',
  'Within Geofence Safe Zone': 'जियोफेंस सुरक्षित क्षेत्र के भीतर',
  'Perimeter Safe Zone Alert': 'परिधि सुरक्षित क्षेत्र अलर्ट',
  '+ Test SOS': '+ टेस्ट एसओएस',
  'Test SOS': 'टेस्ट एसओएस',
  'Trigger Test SOS': 'टेस्ट एसओएस ट्रिगर करें',
  'Restore Demo Alerts': 'डेमो अलर्ट पुनर्स्थापित करें',
  'No Active Emergency SOS Incidents': 'कोई सक्रिय आपातकालीन एसओएस घटना नहीं',
  'All alerts have been resolved.': 'सभी अलर्ट हल कर दिए गए हैं।',
  'Patient has not triggered emergency assistance.': 'मरीज़ ने कोई आपातकालीन सहायता ट्रिगर नहीं की है।',
  'Acknowledge Alert': 'अलर्ट स्वीकार करें',
  'Emergency Medical QR Code Identity': 'आपातकालीन मेडिकल क्यूआर कोड पहचान',
  'Privacy & Safeguard Assurance': 'गोपनीयता और सुरक्षा आश्वासन',
  'Regenerate QR Token': 'क्यूआर टोकन पुनः बनाएं',
  'Enable Active Status': 'सक्रिय स्थिति सक्षम करें',
  'Temporarily Disable': 'अस्थायी रूप से अक्षम करें',

  // Care Management Section
  'Doctor Visits': 'डॉक्टर परामर्श',
  'Care Protocols': 'देखभाल प्रोटोकॉल',
  'Care Insights': 'देखभाल विश्लेषण',
  'Family Guide': 'पारिवारिक मार्गदर्शिका',
  'Patterns & Trends': 'पैटर्न और रुझान',
  'Consults': 'परामर्श',
  'Protocols': 'प्रोटोकॉल',
  '15 Consults · Rx': '15 परामर्श · Rx',
  'Family Guide · 5 Protocols': 'पारिवारिक मार्गदर्शिका · 5 प्रोटोकॉल',
  'Schedule doctor appointments, keep preparation notes and review past consultations.': 'डॉक्टर से मिलने का समय निर्धारित करें, तैयारी के नोट्स रखें और पिछले परामर्शों की समीक्षा करें।',
  '+ Schedule visit': '+ नया परामर्श जोड़ें',
  'Schedule visit': 'परामर्श जोड़ें',
  'Upcoming Doctor Visits': 'आगामी डॉक्टर परामर्श',
  'Past Doctor Consultations': 'पिछले डॉक्टर परामर्श',
  'Consultation Completed': 'परामर्श संपन्न',
  'Upcoming Scheduled': 'आगामी निर्धारित',
  'Doctor Details': 'डॉक्टर विवरण',
  'Clinic / Hospital': 'क्लिनिक / अस्पताल',
  'Preparation Note': 'तैयारी नोट',
  'View Full Consultation & Digital Rx': 'पूरा परामर्श और डिजिटल पर्ची देखें',
  'Consultation Summary': 'परामर्श सारांश',
  'Prescription (Rx)': 'दवा पर्ची (Rx)',
  'Lab Tests & Reports': 'लैब परीक्षण और रिपोर्ट',
  'Doctor & Clinic Info': 'डॉक्टर और क्लिनिक जानकारी',
  'Reason for Consultation': 'परामर्श का कारण',
  'Reason for Consultation:': 'परामर्श का कारण:',
  'Clinical Diagnosis': 'चिकित्सकीय निदान',
  'Clinical Diagnosis:': 'चिकित्सकीय निदान:',
  "Doctor's Examination Findings": "डॉक्टर की जांच के निष्कर्ष",
  "Doctor's Examination Findings:": "डॉक्टर की जांच के निष्कर्ष:",
  'Vitals Recorded During Consult': 'परामर्श के दौरान दर्ज किए गए वाइटल्स',
  'Vitals Recorded During Consult:': 'परामर्श के दौरान दर्ज किए गए वाइटल्स:',
  'Blood Pressure': 'रक्तचाप',
  'Heart Rate': 'हृदय गति',
  'Weight': 'वजन',
  'Blood Sugar': 'रक्त शर्करा',
  'Doctor & Clinic Details': 'डॉक्टर और क्लिनिक विवरण',
  'Scheduled Time': 'निर्धारित समय',
  'Doctor Phone': 'डॉक्टर का फ़ोन',
  'Clinic Phone': 'क्लिनिक का फ़ोन',

  // Routine & Clinical Guidance Text
  'Take one tablet after morning breakfast with a full glass of water.': 'सुबह के नाश्ते के बाद एक पूरे गिलास पानी के साथ एक गोली लें।',
  'Take one tablet with water immediately after lunch.': 'दोपहर के भोजन के तुरंत बाद पानी के साथ एक गोली लें।',
  'Take one tablet with warm water or milk after dinner.': 'रात के खाने के बाद गुनगुने पानी या दूध के साथ एक गोली लें।',
  'Carry the last 3 months of sugar readings.': 'पिछले 3 महीनों की शुगर रीडिंग साथ लाएं।',
  'Fasting for 2 hours required. Bring current spectacles.': '2 घंटे का उपवास आवश्यक है। वर्तमान चश्मा साथ लाएं।',
  'Routine geriatric consultation & blood work': 'नियमित जराचिकित्सा परामर्श और रक्त परीक्षण',
  'Comprehensive annual eye examination & dilated fundus retina screening.': 'व्यापक वार्षिक नेत्र परीक्षण और रेटिना स्क्रीनिंग।',
  'Routine geriatric review, HbA1c evaluation & hypertension maintenance.': 'नियमित जराचिकित्सा समीक्षा, HbA1c मूल्यांकन और उच्च रक्तचाप प्रबंधन।',
  'Blood pressure maintenance': 'रक्तचाप प्रबंधन',
  'Blood sugar control': 'रक्त शर्करा नियंत्रण',
  'Bone strength & joint mobility': 'हड्डियों की मजबूती और जोड़ों का लचीलापन',
  'Every day': 'प्रतिदिन',
  'After breakfast': 'नाश्ते के बाद',
  'After lunch': 'दोपहर के भोजन के बाद',
  'After dinner': 'रात के खाने के बाद',
  'Before breakfast': 'नाश्ते से पहले',
  'Morning Routine & Hydration': 'सुबह की दिनचर्या और जलयोजन',
  'Breakfast & Morning Medications': 'नाश्ता और सुबह की दवाइयां',
  'Deer Park Stroll & Sunlight Exposure': 'डियर पार्क में सैर और धूप सेवन',
  'Lunch & Post-Meal Rest': 'दोपहर का भोजन और विश्राम',
  'Cognitive Memory Game & Reminiscence': 'याददाश्त का खेल और पुरानी यादें',
  'Evening Tea & Light Walk': 'शाम की चाय और हल्की सैर',
  'Dinner & Night Medication': 'रात का खाना और रात की दवा',
  'Night Sleep & Wind-Down Routine': 'रात की नींद और विश्राम दिनचर्या',

  // Care Insights & Charts
  '24-Hour Routine & Rest Balance': '24-घंटे दिनचर्या और विश्राम संतुलन',
  'Distribution of daily hours across sleep, meals, strolls & cognitive rest': 'नींद, भोजन, टहलने और मानसिक विश्राम के बीच दैनिक घंटों का वितरण',
  'Daily Balance': 'दैनिक संतुलन',
  '24h': '24 घंटे',
  'Night Sleep & Rest': 'रात की नींद और विश्राम',
  'Cognitive & Reminiscence': 'मानसिक गतिविधि और यादें',
  'Meals & Hydration': 'भोजन और जलयोजन',
  'Deer Park Walking & Mobility': 'डियर पार्क में टहलना और गतिशीलता',
  'Twilight Dimming Wind-Down': 'संध्याकालीन विश्राम',
  'Twilight Mood & Demeanor': 'संध्याकालीन मनोदशा और व्यवहार',
  'Emotional stability during sunset with 6:30 PM dimming protocol': 'शाम 6:30 बजे लाइट डिमिंग प्रोटोकॉल के साथ सूर्यास्त के समय भावनात्मक स्थिरता',
  'Calm State': 'शांत स्थिति',
  'Calm & Peaceful': 'शांत और सहज',
  'Cheerful & Reminiscing': 'प्रसन्न और पुरानी बातें याद करते हुए',
  'Mild Restlessness': 'हल्की बेचैनी',
  'Care & Medication Adherence': 'देखभाल और दवा अनुपालन',
  'Compliance across prescribed doses, hydration & morning routines': 'निर्धारित खुराक, पानी पीने और सुबह की दिनचर्या का अनुपालन',
  'Compliance': 'अनुपालन',
  'Taken Exactly On-Time': 'बिल्कुल समय पर ली गई',
  'Taken with Gentle Prompt': 'हल्के से याद दिलाने पर ली गई',
  'Rescheduled / Adjusted': 'समय समायोजित किया गया',
  'Physiological Vitals Target Attainment': 'शारीरिक स्वास्थ्य मापदंड लक्ष्य प्राप्ति',
  "Readings within Dr. Arvind Mehra's target parameters (<130/80)": 'डॉ. अरविंद मेहरा के लक्ष्य मापदंडों (<130/80) के भीतर रीडिंग',
  'Rolling BP': 'औसत रक्तचाप',
  'Optimal Target Range': 'इष्टतम लक्ष्य सीमा',
  'In Optimal Target Range': 'इष्टतम लक्ष्य सीमा में',
  'Borderline Normal Range': 'सीमा रेखा पर सामान्य सीमा',
  'Monitored Parameter': 'निगरानी योग्य मापदंड',
  'Wellbeing Domain Consistency': 'कल्याण क्षेत्र स्थिरता',
  'Target': 'लक्ष्य',
  'Target: ≥ 90%': 'लक्ष्य: ≥ 90%',
  'Sleep & Night Rest Rhythm': 'नींद और रात्रि विश्राम लय',
  'Medication Timing & Stock': 'दवा का समय और स्टॉक',
  'Low-Sodium Dietary Compliance': 'कम नमक वाले आहार का अनुपालन',
  'Daily Hydration': 'दैनिक जलयोजन',
  'Daily Hydration (7-8 glasses)': 'दैनिक जलयोजन (7-8 गिलास)',
  'Deer Park Morning Mobility': 'डियर पार्क सुबह की सैर',
  'Memory & Emotional Grounding': 'याददाश्त और भावनात्मक संतुलन',
  'Clinical & Care Observations': 'चिकित्सकीय और देखभाल अवलोकन',
  'Active Patterns': 'सक्रिय पैटर्न',
  'All Patterns': 'सभी पैटर्न',
  'Emotional & Mood': 'भावना और मनोदशा',
  'Sleep & Rest': 'नींद और विश्राम',
  'Physiological Vitals': 'शारीरिक वाइटल्स',
  'Nutrition & Diet': 'पोषण और आहार',
  'Mobility & Fall Safety': 'गतिशीलता और गिरने से सुरक्षा',
  'Cognitive & Social': 'संज्ञानात्मक और सामाजिक',
  'Observed Metric': 'निरीक्षित मीट्रिक',
  'Change': 'परिवर्तन',
  'Recommendation': 'सुझाव',
  'Recommendation:': 'सुझाव:',
  'Caregiver & Family Observations Journal': 'देखभालकर्ता और पारिवारिक अवलोकन डायरी',
  'Direct observations recorded by family members and nursing attendants.': 'परिवार के सदस्यों और नर्सिंग सहायकों द्वारा दर्ज प्रत्यक्ष अवलोकन।',
  '+ Observation': '+ नया अवलोकन',
  'Action taken': 'की गई कार्रवाई',
  'Action taken:': 'की गई कार्रवाई:',
  'Calming / Positive': 'सकारात्मक / शांत',
  'Stable Normal': 'सामान्य स्थिर',
  'Needs Monitor': 'निगरानी आवश्यक',
  'Care Protocols & Family Support': 'देखभाल प्रोटोकॉल और परिवार सहायता',
  'Handover Notes & Daily Shift Log': 'हैंडओवर नोट्स और दैनिक शिफ्ट लॉग',
  '+ Post Handover Note': '+ हैंडओवर नोट लिखें',
  '+ Add Protocol': '+ नया प्रोटोकॉल जोड़ें',
  'Care Health Stability Index': 'देखभाल स्वास्थ्य स्थिरता सूचकांक',
  '94% Stability Index': '94% स्थिरता सूचकांक',
  'Stability Index': 'स्थिरता सूचकांक',
  'Overall Stability': 'समग्र स्थिरता',

  // Patient View
  'My Day': 'मेरा दिन',
  'Reminders': 'अनुस्मारक',
  'People I Know': 'मेरे परिचित लोग',
  'Family & Friends': 'परिवार और मित्र',
  'Memories': 'यादें',
  'Photos': 'तस्वीरें',
  'Favorite Music': 'पसंदीदा संगीत',
  'Emergency Help': 'आपातकालीन सहायता',
  'I Need Help': 'मुझे सहायता चाहिए',
  'Press for Help': 'मदद के लिए दबाएं',
  'Calling Caregiver': 'देखभालकर्ता को कॉल किया जा रहा है',
  'Speak to ATTI': 'ATTI से बात करें',
  'Listening...': 'सुन रहा हूँ...',
  'Tap to Speak': 'बोलने के लिए दबाएं',
  'Next Activity': 'अगली गतिविधि',
  'Completed Activity': 'पूर्ण गतिविधि',
  'What do I do today?': 'मुझे आज क्या करना है?',
  'Who is Ananya?': 'अनन्या कौन है?',
  'Where are my glasses?': 'मेरा चश्मा कहाँ है?',
  'Did I take my medicine?': 'क्या मैंने अपनी दवा ली?',
  'What day is it today?': 'आज कौन सा दिन है?',
  'Where are my house keys?': 'मेरे घर की चाबियाँ कहाँ हैं?',
  'Tap to listen': 'सुनने के लिए दबाएं',
  'Tap to pause or stop': 'रोकने के लिए दबाएं',
  'Tap to resume': 'जारी रखने के लिए दबाएं',
  'Tap to toggle': 'बदलने के लिए दबाएं',

  // Emergency Assist View & Profile
  'Emergency Assistance Identification': 'आपातकालीन सहायता पहचान',
  'Registered ATTI Dementia Companion Patient': 'पंजीकृत ATTI डिमेंशिया साथी मरीज़',
  'Blood Group': 'रक्त समूह',
  'Allergies': 'एलर्जी',
  'Medical Conditions': 'चिकित्सीय स्थितियां',
  'Care Instructions': 'देखभाल निर्देश',
  'Call Daughter (Ananya)': 'पुत्री को कॉल करें (अनन्या)',
  'Call Doctor (Dr. Arvind)': 'डॉक्टर को कॉल करें (डॉ. अरविंद)',
  'Open in Google Maps': 'गूगल मैप्स में खोलें',
  'Verified Emergency Profile': 'सत्यापित आपातकालीन प्रोफ़ाइल',

  // Common UI words and time labels
  'Today': 'आज',
  'Tomorrow': 'कल',
  'Yesterday': 'कल (बीता हुआ)',
  'Just now': 'अभी-अभी',
  'Save': 'सहेजें',
  'Cancel': 'रद्द करें',
  'Delete': 'हटाएं',
  'Edit': 'संपादित करें',
  'Close': 'बंद करें',
  'Search': 'खोजें',
  'Filter': 'फ़िल्टर',
  'Refresh position': 'स्थिति रिफ्रेश करें',
  'days': 'दिन',
  'hrs': 'घंटे',
  'hours': 'घंटे',
  'min': 'मिनट',
  'minutes': 'मिनट',
  'sec': 'सेकंड',
  'seconds': 'सेकंड',
  'Language': 'भाषा',
  'English': 'English',
  'Hindi': 'हिंदी',
  'Morning': 'सुबह',
  'Afternoon': 'दोपहर',
  'Evening': 'शाम',
  'Night': 'रात',
  'Day': 'दिन',
  'Date': 'तारीख',
  'Year': 'वर्ष',
  'City': 'शहर',
  'Home': 'घर',
  'Where I am': 'मैं कहाँ हूँ',
  'New Delhi': 'नई दिल्ली',
  'India': 'भारत',

  // Months and Days
  'Jan': 'जनवरी',
  'Feb': 'फ़रवरी',
  'Mar': 'मार्च',
  'Apr': 'अप्रैल',
  'May': 'मई',
  'Jun': 'जून',
  'Jul': 'जुलाई',
  'Aug': 'अगस्त',
  'Sep': 'सितंबर',
  'Oct': 'अक्टूबर',
  'Nov': 'नवंबर',
  'Dec': 'दिसंबर',
  'Mon': 'सोमवार',
  'Tue': 'मंगलवार',
  'Wed': 'बुधवार',
  'Thu': 'गुरुवार',
  'Fri': 'शुक्रवार',
  'Sat': 'शनिवार',
  'Sun': 'रविवार',
  'Monday': 'सोमवार',
  'Tuesday': 'मंगलवार',
  'Wednesday': 'बुधवार',
  'Thursday': 'गुरुवार',
  'Friday': 'शुक्रवार',
  'Saturday': 'शनिवार',
  'Sunday': 'रविवार'
};

/**
 * Extensive English-to-Hindi single-word fallback dictionary
 * Used when a tokenized English word remains after phrase matching.
 */
export const WORD_DICTIONARY: Record<string, string> = {
  // Navigation & Sections
  overview: 'अवलोकन',
  care: 'देखभाल',
  management: 'प्रबंधन',
  safety: 'सुरक्षा',
  alerts: 'अलर्ट',
  alert: 'अलर्ट',
  notifications: 'सूचनाएं',
  notification: 'सूचना',
  portal: 'पोर्टल',
  dashboard: 'डैशबोर्ड',
  guardian: 'अभिभावक',
  profile: 'प्रोफ़ाइल',
  account: 'खाता',
  settings: 'सेटिंग्स',
  help: 'सहायता',
  support: 'सहायता',
  home: 'घर',
  memories: 'यादें',
  memory: 'याददाश्त',
  photos: 'तस्वीरें',
  photo: 'तस्वीर',
  people: 'लोग',
  person: 'व्यक्ति',
  family: 'परिवार',
  companion: 'साथी',
  assistant: 'सहायक',

  // Medical & Clinical
  patient: 'मरीज़',
  caregiver: 'देखभालकर्ता',
  doctor: 'डॉक्टर',
  nurse: 'नर्स',
  hospital: 'अस्पताल',
  clinic: 'क्लिनिक',
  consults: 'परामर्श',
  consult: 'परामर्श',
  consultations: 'परामर्श',
  consultation: 'परामर्श',
  appointment: 'मुलाकात',
  appointments: 'मुलाकातें',
  visit: 'मुलाकात',
  visits: 'मुलाकातें',
  protocols: 'प्रोटोकॉल',
  protocol: 'प्रोटोकॉल',
  insights: 'विश्लेषण',
  insight: 'विश्लेषण',
  patterns: 'पैटर्न',
  pattern: 'पैटर्न',
  trends: 'रुझान',
  trend: 'रुझान',
  observations: 'अवलोकन',
  observation: 'अवलोकन',
  medications: 'दवाइयाँ',
  medication: 'दवा',
  medicine: 'दवा',
  medicines: 'दवाएं',
  prescription: 'दवा पर्ची',
  dose: 'खुराक',
  dosage: 'खुराक',
  tablet: 'गोली',
  tablets: 'गोलियां',
  pill: 'गोली',
  pills: 'गोलियां',
  capsule: 'कैप्सूल',
  capsules: 'कैप्सूल',
  vitals: 'वाइटल्स',
  vital: 'वाइटल',
  pressure: 'दबाव',
  blood: 'रक्त',
  sugar: 'शर्करा',
  glucose: 'ग्लूकोज',
  heart: 'हृदय',
  rate: 'गति',
  pulse: 'नाड़ी',
  weight: 'वजन',
  height: 'कद',
  temperature: 'तापमान',
  allergies: 'एलर्जी',
  allergy: 'एलर्जी',
  diagnosis: 'निदान',
  condition: 'स्थिति',
  conditions: 'स्थितियां',
  disease: 'रोग',
  pain: 'दर्द',
  fever: 'बुखार',
  hypertension: 'उच्च रक्तचाप',
  dementia: 'डिमेंशिया',
  cognitive: 'मानसिक',
  mobility: 'गतिशीलता',
  nutrition: 'पोषण',
  diet: 'आहार',
  hydration: 'जलयोजन',
  water: 'पानी',
  food: 'भोजन',
  meal: 'भोजन',
  meals: 'भोजन',
  breakfast: 'नाश्ता',
  lunch: 'दोपहर का भोजन',
  dinner: 'रात का खाना',
  snack: 'नाश्ता',
  tea: 'चाय',
  coffee: 'कॉफ़ी',
  walk: 'सैर',
  walking: 'टहलना',
  stroll: 'सैर',
  sleep: 'नींद',
  sleeping: 'सोना',
  rest: 'विश्राम',
  resting: 'विश्राम',
  adherence: 'अनुपालन',
  compliance: 'अनुपालन',
  refill: 'रिफिल',
  stock: 'स्टॉक',
  emergency: 'आपातकाल',
  incident: 'घटना',
  incidents: 'घटनाएं',
  sos: 'एसओएस',
  safe: 'सुरक्षित',
  danger: 'खतरा',
  warning: 'चेतावनी',
  critical: 'गंभीर',
  urgent: 'अति आवश्यक',
  stable: 'स्थिर',
  normal: 'सामान्य',
  optimal: 'इष्टतम',
  borderline: 'सीमा रेखा',
  high: 'उच्च',
  medium: 'मध्यम',
  low: 'कम',
  active: 'सक्रिय',
  inactive: 'निष्क्रिय',
  resolved: 'हल किया गया',
  acknowledged: 'स्वीकृत',
  unacknowledged: 'अस्वीकृत',
  scheduled: 'निर्धारित',
  completed: 'पूर्ण',
  pending: 'लंबित',
  missed: 'छूटा हुआ',
  upcoming: 'आगामी',
  past: 'पिछला',
  current: 'वर्तमान',
  total: 'कुल',
  count: 'संख्या',
  unread: 'अपठित',
  read: 'पठित',
  index: 'सूचकांक',
  score: 'अंक',
  level: 'स्तर',
  status: 'स्थिति',
  target: 'लक्ष्य',
  range: 'सीमा',

  // Time & Units
  today: 'आज',
  tomorrow: 'कल',
  yesterday: 'बीता कल',
  now: 'अब',
  ago: 'पहले',
  time: 'समय',
  date: 'तारीख',
  day: 'दिन',
  days: 'दिन',
  week: 'सप्ताह',
  weeks: 'सप्ताह',
  month: 'महीना',
  months: 'महीने',
  year: 'वर्ष',
  years: 'वर्ष',
  age: 'आयु',
  hour: 'घंटा',
  hours: 'घंटे',
  hr: 'घं',
  hrs: 'घंटे',
  minute: 'मिनट',
  minutes: 'मिनट',
  min: 'मि',
  mins: 'मिनट',
  second: 'सेकंड',
  seconds: 'सेकंड',
  sec: 'सेकंड',
  secs: 'सेकंड',
  morning: 'सुबह',
  afternoon: 'दोपहर',
  evening: 'शाम',
  night: 'रात',
  daily: 'दैनिक',
  weekly: 'साप्ताहिक',
  monthly: 'मासिक',
  am: 'AM',
  pm: 'PM',

  // Geography & Device
  location: 'स्थान',
  address: 'पता',
  coordinates: 'निर्देशांक',
  latitude: 'अक्षांश',
  longitude: 'देशांतर',
  gps: 'जीपीएस',
  device: 'डिवाइस',
  battery: 'बैटरी',
  sensor: 'सेंसर',
  accuracy: 'सटीकता',
  meters: 'मीटर',
  meter: 'मीटर',
  perimeter: 'परिधि',
  radius: 'त्रिज्या',
  boundary: 'सीमा',
  zone: 'क्षेत्र',
  zones: 'क्षेत्र',
  geofence: 'जियोफेंस',
  directions: 'दिशा-निर्देश',
  map: 'मानचित्र',

  // Common UI Actions & Controls
  view: 'देखें',
  hide: 'छिपाएं',
  show: 'दिखाएं',
  search: 'खोजें',
  filter: 'फ़िल्टर',
  sort: 'क्रमबद्ध करें',
  save: 'सहेजें',
  cancel: 'रद्द करें',
  delete: 'हटाएं',
  remove: 'हटाएं',
  edit: 'संपादित करें',
  update: 'अपडेट करें',
  add: 'जोड़ें',
  create: 'बनाएं',
  new: 'नया',
  close: 'बंद करें',
  open: 'खोलें',
  back: 'वापस',
  next: 'अगला',
  previous: 'पिछला',
  start: 'शुरू करें',
  stop: 'रोकें',
  pause: 'रोकें',
  resume: 'जारी रखें',
  play: 'चलाएं',
  listen: 'सुनें',
  speak: 'बोलें',
  call: 'कॉल करें',
  dial: 'डायल करें',
  send: 'भेजें',
  submit: 'जमा करें',
  confirm: 'पुष्टि करें',
  verify: 'सत्यापित करें',
  refresh: 'रिफ्रेश करें',
  reload: 'पुनः लोड करें',
  sync: 'सिंक करें',
  synced: 'सिंक किया गया',
  connect: 'कनेक्ट करें',
  connected: 'जुड़े हुए',
  disconnect: 'डिस्कनेक्ट करें',
  download: 'डाउनलोड करें',
  print: 'प्रिंट करें',
  share: 'साझा करें',
  copy: 'कॉपी करें',
  clear: 'साफ़ करें',
  reset: 'रीसेट करें',
  test: 'परीक्षण',
  enable: 'सक्षम करें',
  disable: 'अक्षम करें',
  mark: 'चिह्नित करें',
  marked: 'चिह्नित',
  done: 'पूर्ण',
  undo: 'पूर्ववत करें',
  due: 'देय',
  take: 'लें',
  taken: 'ली गई',
  takes: 'लेता है',
  taking: 'ले रहे',

  // People & Relations
  daughter: 'पुत्री',
  son: 'पुत्र',
  mother: 'माता',
  father: 'पिता',
  wife: 'पत्नी',
  husband: 'पति',
  brother: 'भाई',
  sister: 'बहन',
  friend: 'मित्र',
  friends: 'मित्र',
  contact: 'संपर्क',
  contacts: 'संपर्क',
  name: 'नाम',
  fullname: 'पूरा नाम',
  callsign: 'पुकारने का नाम',
  email: 'ईमेल',
  phone: 'फ़ोन',
  password: 'पासवर्ड',

  // Connectors & Common Words
  for: 'के लिए',
  with: 'के साथ',
  without: 'के बिना',
  and: 'और',
  or: 'या',
  in: 'में',
  on: 'पर',
  at: 'पर',
  to: 'को',
  from: 'से',
  by: 'द्वारा',
  of: 'का',
  into: 'में',
  during: 'के दौरान',
  before: 'से पहले',
  after: 'के बाद',
  near: 'के पास',
  inside: 'अंदर',
  outside: 'बाहर',
  all: 'सभी',
  some: 'कुछ',
  any: 'कोई',
  no: 'नहीं',
  not: 'नहीं',
  yes: 'हाँ',
  ok: 'ठीक है',
  please: 'कृपया',
  thanks: 'धन्यवाद',
  thank: 'धन्यवाद',
  welcome: 'स्वागत',
  good: 'शुभ',
  tap: 'दबाएं',
  click: 'क्लिक करें',
  press: 'दबाएं',
  more: 'अधिक',
  less: 'कम',
  details: 'विवरण',
  detail: 'विवरण',
  summary: 'सारांश',
  guide: 'मार्गदर्शिका',
  handbook: 'हैंडबुक',
  notes: 'नोट्स',
  note: 'नोट',
  step: 'कदम',
  steps: 'कदम',
  reason: 'कारण',
  findings: 'निष्कर्ष',
  action: 'कार्रवाई',
  actions: 'कार्रवाइयां',
  carry: 'लाएं',
  bring: 'लाएं',
  required: 'आवश्यक',
  fasting: 'उपवास',
  glasses: 'चश्मा',
  keys: 'चाबियां',
  book: 'पुस्तक',
  music: 'संगीत',
  song: 'गीत',
  songs: 'गीत',
  stories: 'कहानियां',
  story: 'कहानी',
  manage: 'प्रबंधित करें',
  managing: 'प्रबंधन',
  comfort: 'आराम',
  comfortable: 'आरामदायक',
  notice: 'सूचना',
  theme: 'थीम',
  dark: 'डार्क',
  light: 'लाइट',
  mode: 'मोड',
  auto: 'स्वचालित',
  language: 'भाषा',
  english: 'English',
  hindi: 'हिंदी'
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
}

function makeBoundaryRegex(phrase: string): RegExp {
  const p = phrase.trim();
  const escaped = escapeRegex(p);
  const startsWithWord = /^\w/.test(p);
  const endsWithWord = /\w$/.test(p);
  const prefix = startsWithWord ? '\\b' : '';
  const suffix = endsWithWord ? '\\b' : '';
  return new RegExp(`${prefix}${escaped}${suffix}`, 'gi');
}

// Compile phrases sorted by English phrase length descending for case-insensitive replacement with word boundaries
const COMPILED_PHRASES: { regex: RegExp; hi: string }[] = Object.entries(APP_HINDI_DICTIONARY)
  .sort((a, b) => b[0].length - a[0].length)
  .map(([en, hi]) => ({
    regex: makeBoundaryRegex(en),
    hi
  }));

// Lowercase dictionary for rapid direct lookup
const LOWER_APP_HINDI_DICTIONARY: Record<string, string> = Object.entries(APP_HINDI_DICTIONARY).reduce(
  (acc, [k, v]) => {
    acc[k.toLowerCase()] = v;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Translates a single text string from English to Hindi
 * Uses a robust 3-tier pipeline:
 * 1. Direct exact dictionary lookup (fastest, preserves intent)
 * 2. Case-insensitive multi-word phrase replacement (longest phrases first)
 * 3. Word-level token fallback with word boundaries (\b)
 */
export function translateText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  if (!/[a-zA-Z]/.test(text)) return text;

  // Preserve leading and trailing whitespace
  const match = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match) return text;
  const [, leading, trimmed, trailing] = match;

  // Tier 1: Direct exact match
  if (APP_HINDI_DICTIONARY[trimmed]) {
    return leading + APP_HINDI_DICTIONARY[trimmed] + trailing;
  }
  const lowerTrimmed = trimmed.toLowerCase();
  if (LOWER_APP_HINDI_DICTIONARY[lowerTrimmed]) {
    return leading + LOWER_APP_HINDI_DICTIONARY[lowerTrimmed] + trailing;
  }

  // Tier 2: Multi-word phrase replacement (case-insensitive, longest first)
  let result = trimmed;
  for (let i = 0; i < COMPILED_PHRASES.length; i++) {
    const item = COMPILED_PHRASES[i];
    if (item.regex.test(result)) {
      result = result.replace(item.regex, item.hi);
      item.regex.lastIndex = 0;
    }
  }

  // Tier 3: Word-boundary fallback translation for any remaining isolated English words
  result = result.replace(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g, (word) => {
    const lower = word.toLowerCase();
    if (WORD_DICTIONARY[lower]) {
      return WORD_DICTIONARY[lower];
    }
    return word;
  });

  return leading + result + trailing;
}

/**
 * Recursively translates text nodes in a DOM subtree
 */
function translateDOMTree(root: Node): void {
  if (!root) return;

  if (root.nodeType === Node.ELEMENT_NODE) {
    const el = root as Element;
    const tagName = el.tagName ? el.tagName.toLowerCase() : '';

    // Never translate scripts, styles, code blocks or explicitly ignored elements
    if (['script', 'style', 'code', 'noscript'].includes(tagName)) {
      return;
    }
    if (el.hasAttribute('data-no-translate') || el.closest('[data-no-translate]')) {
      return;
    }

    // Translate input placeholders
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      if (el.placeholder && /[a-zA-Z]/.test(el.placeholder)) {
        if ((el as any).__lastHindiPlaceholder !== el.placeholder) {
          (el as any).__origPlaceholder = el.placeholder;
          const trans = translateText(el.placeholder);
          (el as any).__lastHindiPlaceholder = trans;
          el.placeholder = trans;
        }
      }
    }

    // Translate tooltips and titles
    if (el.getAttribute('title') && /[a-zA-Z]/.test(el.getAttribute('title')!)) {
      const currentTitle = el.getAttribute('title')!;
      if ((el as any).__lastHindiTitle !== currentTitle) {
        (el as any).__origTitle = currentTitle;
        const trans = translateText(currentTitle);
        (el as any).__lastHindiTitle = trans;
        el.setAttribute('title', trans);
      }
    }
  }

  if (root.nodeType === Node.TEXT_NODE) {
    const currentText = root.nodeValue;
    if (currentText && /[a-zA-Z]/.test(currentText)) {
      // Ensure we don't re-translate our own Hindi translated output
      if ((root as any).__lastHindi !== currentText) {
        (root as any).__origEnglish = currentText;
        const trans = translateText(currentText);
        (root as any).__lastHindi = trans;
        if (trans !== currentText) {
          root.nodeValue = trans;
        }
      }
    }
    return;
  }

  // Recurse children (including SVG text elements)
  const children = root.childNodes;
  for (let i = 0; i < children.length; i++) {
    translateDOMTree(children[i]);
  }
}

/**
 * Restores original English text on all modified DOM nodes
 */
function restoreEnglishNode(root: Node): void {
  if (!root) return;

  if (root.nodeType === Node.TEXT_NODE) {
    if ((root as any).__origEnglish !== undefined) {
      root.nodeValue = (root as any).__origEnglish;
      (root as any).__lastHindi = undefined;
    }
    return;
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    const el = root as Element;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      if ((el as any).__origPlaceholder !== undefined) {
        el.placeholder = (el as any).__origPlaceholder;
        (el as any).__lastHindiPlaceholder = undefined;
      }
    }
    if ((el as any).__origTitle !== undefined) {
      el.setAttribute('title', (el as any).__origTitle);
      (el as any).__lastHindiTitle = undefined;
    }
  }

  const children = root.childNodes;
  for (let i = 0; i < children.length; i++) {
    restoreEnglishNode(children[i]);
  }
}

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
  t: (keyOrText: string, params?: Record<string, string | number>) => string;
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

  const t = (keyOrText: string, params?: Record<string, string | number>): string => {
    if (language === 'en') {
      let text = (translations.en as Record<string, string>)[keyOrText] || keyOrText;
      if (params) {
        Object.entries(params).forEach(([pKey, pVal]) => {
          text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
        });
      }
      return text;
    }

    // If Hindi
    let text =
      (translations.hi as Record<string, string>)[keyOrText] ||
      APP_HINDI_DICTIONARY[keyOrText] ||
      translateText(keyOrText);

    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
    }

    return text;
  };

  // Global App-Wide Translation Hook & Observer
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;

    if (language === 'hi') {
      // 1. Initial immediate DOM sweep
      translateDOMTree(document.body);

      // 2. Continuous observer for dynamic tabs, modals, and content updates
      let isTranslating = false;
      const observer = new MutationObserver((mutations) => {
        if (isTranslating) return;
        isTranslating = true;
        try {
          for (const mutation of mutations) {
            if (mutation.type === 'childList') {
              for (let i = 0; i < mutation.addedNodes.length; i++) {
                translateDOMTree(mutation.addedNodes[i]);
              }
            } else if (mutation.type === 'characterData') {
              const textNode = mutation.target as Text;
              if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                const currentText = textNode.nodeValue;
                if (currentText && /[a-zA-Z]/.test(currentText)) {
                  if ((textNode as any).__lastHindi !== currentText) {
                    (textNode as any).__origEnglish = currentText;
                    const trans = translateText(currentText);
                    (textNode as any).__lastHindi = trans;
                    if (trans !== currentText) {
                      textNode.nodeValue = trans;
                    }
                  }
                }
              }
            }
          }
        } finally {
          isTranslating = false;
        }
      });

      observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true,
      });

      // 3. Periodic sweep to guarantee async components (e.g. after API load or tab switch) are translated
      const interval = setInterval(() => {
        if (!isTranslating) {
          isTranslating = true;
          try {
            translateDOMTree(document.body);
          } finally {
            isTranslating = false;
          }
        }
      }, 600);

      return () => {
        observer.disconnect();
        clearInterval(interval);
      };
    } else {
      // Restore English when toggled back
      restoreEnglishNode(document.body);
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
    const fallbackT = (keyOrText: string, params?: Record<string, string | number>) => {
      let text = (translations.en as Record<string, string>)[keyOrText] || keyOrText;
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
        data-no-translate="true"
        className={`flex items-center bg-black/25 dark:bg-slate-800/80 rounded-full p-0.5 border border-white/15 backdrop-blur-md shrink-0 shadow-xs ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all active:scale-95 cursor-pointer ${
            language === 'en'
              ? 'bg-white text-[#3B36AC] shadow-xs'
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
          className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all active:scale-95 cursor-pointer ${
            language === 'hi'
              ? 'bg-white text-[#3B36AC] shadow-xs'
              : 'text-white/80 hover:text-white'
          }`}
          aria-pressed={language === 'hi'}
          title="हिंदी में बदलें"
        >
          हि
        </button>
      </div>
    );
  }

  return (
    <div
      data-no-translate="true"
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

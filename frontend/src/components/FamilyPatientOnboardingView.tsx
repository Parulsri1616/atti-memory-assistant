import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Heart,
  Shield,
  Pill,
  Calendar,
  Clock,
  User,
  Users,
  Phone,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  Lock,
  Mail,
  AlertCircle,
  Stethoscope,
  Activity,
  Home,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import {
  PatientProfile,
  FamilyPatientOnboardingPayload,
  OnboardingMedicationItem,
  OnboardingAppointmentItem,
  OnboardingRoutineItem,
  OnboardingContactItem,
  OnboardingPlaceItem,
  OnboardingMemoryFactItem,
  OnboardingPersonalItemDef
} from '../types';
import attiLogo from '../assets/atti-care-logo.png';
import { useLanguage } from '../services/language';

interface FamilyPatientOnboardingViewProps {
  onCompleted: (caregiverProfile: PatientProfile) => void;
  onCancel: () => void;
}

export const FamilyPatientOnboardingView: React.FC<FamilyPatientOnboardingViewProps> = ({
  onCompleted,
  onCancel
}) => {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 6;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Step 1: Family Member Account ---
  const [familyName, setFamilyName] = useState<string>('');
  const [familyEmail, setFamilyEmail] = useState<string>('');
  const [familyPassword, setFamilyPassword] = useState<string>('');
  const [familyConfirmPassword, setFamilyConfirmPassword] = useState<string>('');
  const [familyRelationship, setFamilyRelationship] = useState<string>('Daughter');
  const [familyPhone, setFamilyPhone] = useState<string>('+91 ');

  // --- Step 2: Patient Identity & Credentials ---
  const [patientName, setPatientName] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientPassword, setPatientPassword] = useState<string>('');
  const [patientConfirmPassword, setPatientConfirmPassword] = useState<string>('');
  const [patientCallSign, setPatientCallSign] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('72');
  const [patientDob, setPatientDob] = useState<string>('');
  const [patientAddress, setPatientAddress] = useState<string>('');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('Hindi & English');

  // --- Step 3: Medical & Doctor Information ---
  const [bloodGroup, setBloodGroup] = useState<string>('B+');
  const [medicalConditions, setMedicalConditions] = useState<string>('Mild Cognitive Impairment, Hypertension');
  const [allergies, setAllergies] = useState<string>('None reported');
  const [careInstructions, setCareInstructions] = useState<string>(
    'Please speak gently and calmly. If disoriented, do not challenge memories. Guide to a peaceful area and offer water.'
  );
  const [doctorName, setDoctorName] = useState<string>('Dr. Arvind Mehra');
  const [doctorPhone, setDoctorPhone] = useState<string>('+91 98112 34567');
  const [doctorClinic, setDoctorClinic] = useState<string>('Fortis Hospital, Vasant Kunj');

  // --- Step 4: Medications (Repeatable) ---
  const [medications, setMedications] = useState<OnboardingMedicationItem[]>([
    {
      name: 'Telmisartan',
      dosage: '40mg',
      schedule_time: '08:30 AM (After Breakfast)',
      timing_slot: 'Morning',
      frequency: 'Every day',
      instructions: 'Take one tablet with a full glass of water after morning breakfast.',
      purpose: 'Blood pressure maintenance',
      current_stock: 30,
      refill_threshold: 5
    },
    {
      name: 'Metformin',
      dosage: '500mg',
      schedule_time: '01:30 PM (After Lunch)',
      timing_slot: 'Afternoon',
      frequency: 'Every day',
      instructions: 'Take one tablet immediately after lunch.',
      purpose: 'Blood sugar balance',
      current_stock: 25,
      refill_threshold: 5
    }
  ]);

  // --- Step 4.2: Doctor Appointments ---
  const [appointments, setAppointments] = useState<OnboardingAppointmentItem[]>([
    {
      doctor_name: 'Dr. Arvind Mehra',
      clinic_or_hospital: 'Fortis Hospital, Vasant Kunj',
      appointment_date: '2026-12-10',
      appointment_time: '11:00 AM',
      notes: 'Routine geriatric consultation & blood pressure review.',
      advance_reminder_hours: 24
    }
  ]);

  // --- Step 5: Daily Routines & Activities (Repeatable) ---
  const [routines, setRoutines] = useState<OnboardingRoutineItem[]>([
    {
      time: '07:30',
      title: 'Morning Wake-up & Warm Water',
      category: 'water',
      description: 'Gentle morning stretch and drink a glass of lukewarm water.',
      repeat_frequency: 'Daily'
    },
    {
      time: '08:30',
      title: 'Nutritious Breakfast & Morning Medicine',
      category: 'meal',
      description: 'Warm porridge or idli, followed by morning medication.',
      repeat_frequency: 'Daily'
    },
    {
      time: '10:30',
      title: 'Garden Stroll & Sunlight',
      category: 'exercise',
      description: 'Gentle 15-minute walk in fresh air and mild sunlight.',
      repeat_frequency: 'Daily'
    },
    {
      time: '13:00',
      title: 'Wholesome Lunch & Rest',
      category: 'meal',
      description: 'Fresh lunch followed by a calm afternoon nap.',
      repeat_frequency: 'Daily'
    },
    {
      time: '17:00',
      title: 'Evening Ginger Tea & Relaxing Music',
      category: 'activity',
      description: 'Sip warm tea while listening to peaceful sitar melodies.',
      repeat_frequency: 'Daily'
    },
    {
      time: '20:30',
      title: 'Light Dinner & Family Chat',
      category: 'meal',
      description: 'Light khichdi or soup, followed by gentle conversation.',
      repeat_frequency: 'Daily'
    },
    {
      time: '22:00',
      title: 'Night Bedtime Routine & Calm Sleep',
      category: 'sleep',
      description: 'Brush teeth, dim lights, and settle in for deep rest.',
      repeat_frequency: 'Daily'
    }
  ]);

  // --- Step 6: Safety, Familiar Faces & Memory Anchors ---
  const [safeZoneName, setSafeZoneName] = useState<string>('Home Safe Zone');
  const [safeZoneRadius, setSafeZoneRadius] = useState<number>(500);
  const [safeZoneAddress, setSafeZoneAddress] = useState<string>('');

  const [contacts, setContacts] = useState<OnboardingContactItem[]>([
    {
      name: 'Dr. Arvind Mehra',
      relationship: 'Primary Geriatrician',
      phone: '+91 98112 34567',
      notes: 'Consultant physician for blood pressure and routine reviews.'
    }
  ]);

  const [places, setPlaces] = useState<OnboardingPlaceItem[]>([
    {
      name: 'Neighbourhood Park',
      address_or_location: 'Near Gate 3, Green Park',
      category: 'park',
      description: 'Favorite morning walking spot.'
    }
  ]);

  const [memoryFacts, setMemoryFacts] = useState<OnboardingMemoryFactItem[]>([
    {
      category: 'habit',
      question_or_topic: 'Morning routine preference',
      answer_or_detail: 'Prefers warm water with a drop of lemon before breakfast.'
    }
  ]);

  const [personalItems, setPersonalItems] = useState<OnboardingPersonalItemDef[]>([
    {
      item_name: 'Reading Glasses',
      location: 'on your bedside table in the red spectacle case',
      notes: 'Kept beside your reading lamp',
      keywords: 'glasses, spectacles, chashma'
    },
    {
      item_name: 'House Keys',
      location: 'hanging on the wooden key hook beside the front door',
      notes: 'Main entrance door keys',
      keywords: 'keys, chaabi, key'
    }
  ]);

  // Email format validation helper
  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  // --- Step Navigation Validation ---
  const handleNextStep = () => {
    setErrorMessage(null);

    // Step 1 Validation: Family Member Account
    if (currentStep === 1) {
      if (!familyName.trim()) {
        setErrorMessage('Please enter your full name as the family caregiver.');
        return;
      }
      if (!isValidEmail(familyEmail)) {
        setErrorMessage('Please enter a valid family member email address (e.g. yourname@example.com).');
        return;
      }
      if (familyPassword.length < 6) {
        setErrorMessage('Family member password must be at least 6 characters long.');
        return;
      }
      if (familyPassword !== familyConfirmPassword) {
        setErrorMessage('Family member passwords do not match. Please re-enter to confirm.');
        return;
      }
    }

    // Step 2 Validation: Patient Identity & Credentials
    if (currentStep === 2) {
      if (!patientName.trim()) {
        setErrorMessage('Please enter the patient full name.');
        return;
      }
      if (!isValidEmail(patientEmail)) {
        setErrorMessage('Please enter a valid patient sign-in email address.');
        return;
      }
      if (patientEmail.trim().toLowerCase() === familyEmail.trim().toLowerCase()) {
        setErrorMessage('Family member email and patient email must be distinct accounts so each user can sign in independently.');
        return;
      }
      if (patientPassword.length < 6) {
        setErrorMessage('Patient password must be at least 6 characters long.');
        return;
      }
      if (patientPassword !== patientConfirmPassword) {
        setErrorMessage('Patient passwords do not match. Please re-enter to confirm.');
        return;
      }
      if (!patientAddress.trim()) {
        setErrorMessage('Please enter the patient primary residence address.');
        return;
      }
    }

    // Step 3 Validation: Medical profile
    if (currentStep === 3) {
      if (!doctorName.trim()) {
        setErrorMessage('Please enter the patient doctor or clinic name.');
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  // --- Final Submission ---
  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const payload: FamilyPatientOnboardingPayload = {
        family_name: familyName.trim(),
        family_email: familyEmail.trim().toLowerCase(),
        family_password: familyPassword,
        family_relationship: familyRelationship.trim() || 'Daughter',
        family_phone: familyPhone.trim(),

        patient_name: patientName.trim(),
        patient_email: patientEmail.trim().toLowerCase(),
        patient_password: patientPassword,
        patient_call_sign: patientCallSign.trim() || patientName.trim().split(' ')[0],
        patient_age: patientAge ? parseInt(patientAge, 10) : 72,
        patient_dob: patientDob.trim() || undefined,
        patient_address: patientAddress.trim(),
        preferred_language: preferredLanguage,

        blood_group: bloodGroup,
        medical_conditions: medicalConditions.trim(),
        allergies: allergies.trim(),
        care_instructions: careInstructions.trim(),
        doctor_name: doctorName.trim(),
        doctor_phone: doctorPhone.trim(),
        doctor_clinic: doctorClinic.trim(),

        emergency_contact_phone: familyPhone.trim(),
        emergency_contact_relation: familyRelationship.trim() || 'Daughter',
        safe_zone_name: safeZoneName.trim() || 'Home Safe Zone',
        safe_zone_radius: safeZoneRadius || 500,
        safe_zone_address: safeZoneAddress.trim() || patientAddress.trim(),

        medications: medications.filter(m => m.name.trim().length > 0),
        appointments: appointments.filter(a => a.doctor_name.trim().length > 0),
        routines: routines.filter(r => r.title.trim().length > 0),
        contacts: contacts.filter(c => c.name.trim().length > 0),
        places: places.filter(p => p.name.trim().length > 0),
        memory_facts: memoryFacts.filter(f => f.question_or_topic.trim().length > 0),
        personal_items: personalItems.filter(i => i.item_name.trim().length > 0)
      };

      const res = await api.familyPatientOnboarding(payload);
      onCompleted(res.patient);
    } catch (err: any) {
      setErrorMessage(err.message || 'Onboarding registration failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 animate-in fade-in duration-200">
      {/* Top Header Shell */}
      <div className="w-full max-w-2xl flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={handlePrevStep}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 shadow-xs border border-slate-200 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? 'Back to Sign In' : 'Previous Step'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200/90 flex flex-col">
        {/* Header Branding & Title */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-[#002aff] flex items-center justify-center shadow-md shadow-blue-600/20 ring-2 ring-blue-100 shrink-0">
            <img src={attiLogo} alt="ATTI" className="w-full h-full object-cover select-none" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Family Portal Setup
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
              Family-Led Patient Onboarding
            </h1>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              Set up your loved one's companion and link your real-time caregiver portal
            </p>
          </div>
        </div>

        {/* Clean 6-Segment Stepper */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-1.5 w-full">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  currentStep >= s
                    ? 'bg-[#3B36AC]'
                    : 'bg-slate-200/80'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 mt-2 px-0.5">
            <span className="font-bold text-slate-800">
              Step {currentStep} of 6: {
                currentStep === 1 ? 'Family Account' :
                currentStep === 2 ? 'Patient Access' :
                currentStep === 3 ? 'Medical Details' :
                currentStep === 4 ? 'Medications' :
                currentStep === 5 ? 'Daily Routines' : 'Safety & Alerts'
              }
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {Math.round((currentStep / 6) * 100)}% Complete
            </span>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 mb-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOnboarding}>
          {/* ========================================================================= */}
          {/* STEP 1: FAMILY MEMBER (CAREGIVER) ACCOUNT                                  */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                <Users className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 leading-relaxed">
                  <span className="font-bold">Welcome, Caregiver!</span> You are setting up the primary family manager account.
                  You will use these credentials to log into your Caregiver Portal to view real-time location, daily activity logs, and medications.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Full Name (Family Member / Caregiver) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="family_name"
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra or Ananya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Relationship to Patient <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="family_relationship"
                    value={familyRelationship}
                    onChange={(e) => setFamilyRelationship(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Daughter">Daughter</option>
                    <option value="Son">Son</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Daughter-in-law">Daughter-in-law</option>
                    <option value="Son-in-law">Son-in-law</option>
                    <option value="Primary Caregiver">Primary Caregiver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="family_phone"
                      type="tel"
                      value={familyPhone}
                      onChange={(e) => setFamilyPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Sign-In Email (Caregiver Account) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="family_email"
                    type="email"
                    value={familyEmail}
                    onChange={(e) => setFamilyEmail(e.target.value)}
                    placeholder="caregiver@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Password (At least 6 characters) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="family_password"
                      type="password"
                      value={familyPassword}
                      onChange={(e) => setFamilyPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="family_confirm_password"
                      type="password"
                      value={familyConfirmPassword}
                      onChange={(e) => setFamilyConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PATIENT IDENTITY & SIGN-IN CREDENTIALS                             */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                <Heart className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-900 leading-relaxed">
                  <span className="font-bold">Patient Mobile Access:</span> Establish the patient's identity and their independent sign-in credentials.
                  The patient will use this email and password to log in directly on their own phone or tablet into the voice-assisted Patient View.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="patient_name"
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Meera Sharma or Kailash Malhotra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Call Sign / Honorific Nickname
                  </label>
                  <input
                    id="patient_call_sign"
                    type="text"
                    value={patientCallSign}
                    onChange={(e) => setPatientCallSign(e.target.value)}
                    placeholder="e.g. Meera, Bauji, Amma, Nani"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Age (Years) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="patient_age"
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="72"
                    min="1"
                    max="125"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    id="patient_dob"
                    type="text"
                    value={patientDob}
                    onChange={(e) => setPatientDob(e.target.value)}
                    placeholder="e.g. 14 August 1954"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Language
                  </label>
                  <select
                    id="patient_language"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Hindi & English">Hindi & English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Punjabi & Hindi">Punjabi & Hindi</option>
                    <option value="Bengali & English">Bengali & English</option>
                    <option value="Tamil & English">Tamil & English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Primary Address (Home Safe Zone Anchor) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="patient_home_address"
                    type="text"
                    value={patientAddress}
                    onChange={(e) => {
                      setPatientAddress(e.target.value);
                      if (!safeZoneAddress) setSafeZoneAddress(e.target.value);
                    }}
                    placeholder="e.g. 24, Green Park, New Delhi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  <span>Patient Login Credentials (For Patient's Phone)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Sign-In Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="patient_email"
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="e.g. meera@atti.care or mother@family.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Must be different from your family caregiver email.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Patient Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="patient_password"
                      type="password"
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Patient Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="patient_confirm_password"
                      type="password"
                      value={patientConfirmPassword}
                      onChange={(e) => setPatientConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: MEDICAL PROFILE & DOCTOR INFORMATION                               */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <span className="font-bold">Medical ID & Care Instructions:</span> These details populate the patient's Emergency QR Card,
                  voice assistant answers, and the Family Member Care section.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    id="blood_group"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="B+">B+</option>
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="AB+">AB+</option>
                    <option value="B-">B-</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Known Allergies
                  </label>
                  <input
                    id="patient_allergies"
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts, Dust (or None reported)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Existing Medical Conditions
                </label>
                <input
                  id="patient_medical_conditions"
                  type="text"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Mild Cognitive Impairment, Essential Hypertension, Type 2 Diabetes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gentle Care Instructions / Calming Protocol
                </label>
                <textarea
                  id="care_instructions"
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  rows={2}
                  placeholder="Instructions for helpers or first responders when the patient feels anxious or disoriented"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Primary Doctor Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Doctor's Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="doctor_name"
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="e.g. Dr. Arvind Mehra"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Doctor's Phone
                    </label>
                    <input
                      id="doctor_phone"
                      type="tel"
                      value={doctorPhone}
                      onChange={(e) => setDoctorPhone(e.target.value)}
                      placeholder="+91 98112 34567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Doctor's Clinic or Hospital
                  </label>
                  <input
                    id="doctor_hospital"
                    type="text"
                    value={doctorClinic}
                    onChange={(e) => setDoctorClinic(e.target.value)}
                    placeholder="e.g. Fortis Hospital, Vasant Kunj"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: MEDICATIONS & APPOINTMENTS                                        */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                <Pill className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">Prescriptions & Intake Schedules:</span> Enter medications the patient takes regularly.
                  These populate the Patient My Day timeline and allow you to track confirmed intakes and stock refills in your Caregiver Portal.
                </div>
              </div>

              {/* Repeatable Medication List */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-amber-600" />
                    <span>Medications ({medications.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setMedications([
                        ...medications,
                        {
                          name: '',
                          dosage: '1 tablet',
                          schedule_time: '08:30 PM (After Dinner)',
                          timing_slot: 'Night',
                          frequency: 'Every day',
                          instructions: 'Take with water after dinner.',
                          purpose: 'Daily prescription',
                          current_stock: 30,
                          refill_threshold: 5
                        }
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medication</span>
                  </button>
                </div>

                {medications.map((med, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2.5 relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold uppercase text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
                        Medication #{idx + 1}
                      </span>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setMedications(medications.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                          title="Remove Medication"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Medication Name</label>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].name = e.target.value;
                            setMedications(updated);
                          }}
                          placeholder="e.g. Telmisartan"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Dosage</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].dosage = e.target.value;
                            setMedications(updated);
                          }}
                          placeholder="e.g. 40mg or 1 tablet"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Schedule Time</label>
                        <input
                          type="text"
                          value={med.schedule_time}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].schedule_time = e.target.value;
                            setMedications(updated);
                          }}
                          placeholder="e.g. 08:30 AM (After Breakfast)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Timing Slot</label>
                        <select
                          value={med.timing_slot}
                          onChange={(e) => {
                            const updated = [...medications];
                            updated[idx].timing_slot = e.target.value;
                            setMedications(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                          <option value="Evening">Evening</option>
                          <option value="Night">Night</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Instructions / Note</label>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => {
                          const updated = [...medications];
                          updated[idx].instructions = e.target.value;
                          setMedications(updated);
                        }}
                        placeholder="Take with warm water after food"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Doctor Appointments */}
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Upcoming Doctor Appointment</span>
                  </h3>
                </div>

                {appointments.map((app, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col gap-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Doctor Name</label>
                        <input
                          type="text"
                          value={app.doctor_name}
                          onChange={(e) => {
                            const updated = [...appointments];
                            updated[idx].doctor_name = e.target.value;
                            setAppointments(updated);
                          }}
                          placeholder="Dr. Arvind Mehra"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Clinic / Hospital</label>
                        <input
                          type="text"
                          value={app.clinic_or_hospital}
                          onChange={(e) => {
                            const updated = [...appointments];
                            updated[idx].clinic_or_hospital = e.target.value;
                            setAppointments(updated);
                          }}
                          placeholder="Fortis Hospital, Vasant Kunj"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Date</label>
                        <input
                          type="date"
                          value={app.appointment_date}
                          onChange={(e) => {
                            const updated = [...appointments];
                            updated[idx].appointment_date = e.target.value;
                            setAppointments(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Time</label>
                        <input
                          type="text"
                          value={app.appointment_time}
                          onChange={(e) => {
                            const updated = [...appointments];
                            updated[idx].appointment_time = e.target.value;
                            setAppointments(updated);
                          }}
                          placeholder="11:00 AM"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: DAILY ROUTINES & WELLNESS ACTIVITIES                               */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-900 leading-relaxed">
                  <span className="font-bold">Daily Routine & Timeline:</span> Maintaining regular circadian rhythms for waking, hydration, meals,
                  and restful sleep gives dementia patients immense comfort. These activities appear on the patient's daily home schedule banner.
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>Scheduled Activities ({routines.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setRoutines([
                      ...routines,
                      {
                        time: '16:00',
                        title: 'Afternoon Hydration & Fruit',
                        category: 'water',
                        description: 'Drink fresh coconut water or fruit juice.',
                        repeat_frequency: 'Daily'
                      }
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Activity</span>
                </button>
              </div>

              <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {routines.map((r, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2.5">
                    <div className="w-16 shrink-0">
                      <input
                        type="time"
                        value={r.time}
                        onChange={(e) => {
                          const updated = [...routines];
                          updated[idx].time = e.target.value;
                          setRoutines(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                        required
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={r.title}
                        onChange={(e) => {
                          const updated = [...routines];
                          updated[idx].title = e.target.value;
                          setRoutines(updated);
                        }}
                        placeholder="Activity Title"
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                        required
                      />
                      <input
                        type="text"
                        value={r.description || ''}
                        onChange={(e) => {
                          const updated = [...routines];
                          updated[idx].description = e.target.value;
                          setRoutines(updated);
                        }}
                        placeholder="Brief friendly instructions"
                        className="w-full px-2.5 py-0.5 rounded-lg border-0 text-[11px] text-slate-500 bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      <select
                        value={r.category}
                        onChange={(e) => {
                          const updated = [...routines];
                          updated[idx].category = e.target.value;
                          setRoutines(updated);
                        }}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="meal">Meal</option>
                        <option value="water">Water</option>
                        <option value="activity">Activity</option>
                        <option value="exercise">Exercise</option>
                        <option value="sleep">Sleep</option>
                      </select>

                      {routines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setRoutines(routines.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: SAFETY ZONE, FAMILIAR FACES & MEMORY ANCHORS                       */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <span className="font-bold">Safety & Orientation Anchors:</span> Configure the home safe zone geofence radius,
                  and register essential memory anchors like reading glasses and keys so the voice assistant can answer "Where are my glasses?".
                </div>
              </div>

              {/* Safe Zone Configuration */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2.5">
                <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Home Safe Zone & Geofence</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Safe Zone Name</label>
                    <input
                      type="text"
                      value={safeZoneName}
                      onChange={(e) => setSafeZoneName(e.target.value)}
                      placeholder="Home Safe Zone"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Safe Radius (Meters)</label>
                    <input
                      type="number"
                      value={safeZoneRadius}
                      onChange={(e) => setSafeZoneRadius(parseInt(e.target.value, 10) || 500)}
                      min="100"
                      max="5000"
                      step="50"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Safe Zone Center Address</label>
                  <input
                    type="text"
                    value={safeZoneAddress || patientAddress}
                    onChange={(e) => setSafeZoneAddress(e.target.value)}
                    placeholder="24, Green Park, New Delhi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* Memory Anchors (Lost Items) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Key Personal Items (Answered by Voice AI)</span>
                </div>

                {personalItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => {
                          const updated = [...personalItems];
                          updated[idx].item_name = e.target.value;
                          setPersonalItems(updated);
                        }}
                        placeholder="Item name"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={item.location}
                        onChange={(e) => {
                          const updated = [...personalItems];
                          updated[idx].location = e.target.value;
                          setPersonalItems(updated);
                        }}
                        placeholder="Where it is kept"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Ready to Submit Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white flex items-center justify-between gap-3 shadow-md">
                <div>
                  <div className="font-extrabold text-sm sm:text-base">Setup Ready to Finalize</div>
                  <div className="text-xs text-emerald-100 mt-0.5">
                    Click complete to save records and launch your Caregiver Portal!
                  </div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-white shrink-0" />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              id="btn-onboarding-prev"
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-all cursor-pointer"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            {currentStep < totalSteps ? (
              <button
                id="btn-onboarding-next"
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-onboarding-submit"
                type="submit"
                disabled={isLoading}
                className="px-7 py-3 bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:opacity-95 active:scale-95 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Creating Caregiver & Patient Accounts...' : 'Complete Onboarding & Launch'}</span>
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

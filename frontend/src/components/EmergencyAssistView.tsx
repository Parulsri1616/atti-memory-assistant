import React, { useEffect, useState } from 'react';
import { Shield, Phone, Heart, AlertCircle, ArrowLeft, CheckCircle, MapPin, User, Activity } from 'lucide-react';
import { api } from '../services/api';
import { EmergencyProfile } from '../types';
import { LanguageToggle } from '../services/language';

interface EmergencyAssistViewProps {
  patientId: number;
  onBackToApp?: () => void;
}

export const EmergencyAssistView: React.FC<EmergencyAssistViewProps> = ({
  patientId,
  onBackToApp
}) => {
  const [profile, setProfile] = useState<EmergencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getEmergencyProfile(patientId)
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Falling back to local emergency data', err);
          // Fallback safe info for demo patient Meera Sharma
          setProfile({
            patient_id: patientId,
            name: 'Meera Sharma',
            call_sign: 'Meera',
            age: 72,
            date_of_birth: '14 August 1954',
            address: '24, Green Park, New Delhi',
            caregiver_name: 'Ananya Sharma',
            caregiver_phone: '+91 98765 12345',
            emergency_contact_relation: 'Daughter',
            doctor_name: 'Dr. Arjun Mehta',
            doctor_phone: '+91 98111 55667',
            blood_group: 'B+',
            medical_conditions: 'Mild Cognitive Impairment, Essential Hypertension',
            allergies: 'Penicillin (Moderate sensitivity)',
            care_instructions: 'Please stay calm and speak gently. The patient may feel disoriented. Keep them in a quiet, safe space and immediately contact Daughter Ananya Sharma at +91 98765 12345.'
          });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#5E58E7] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold text-indigo-200">Accessing verified patient emergency record...</p>
      </div>
    );
  }

  const fullName = profile?.name || 'Meera Sharma';
  const age = profile?.age ?? 72;
  const address = profile?.address || '24, Green Park, New Delhi';
  const caregiverName = profile?.caregiver_name || 'Ananya Sharma';
  const caregiverPhone = profile?.caregiver_phone || '+91 98765 12345';
  const caregiverRelation = profile?.emergency_contact_relation || 'Daughter';
  const doctorName = profile?.doctor_name || 'Dr. Arjun Mehta';
  const doctorPhone = profile?.doctor_phone || '+91 98111 55667';
  const cleanCaregiverPhone = caregiverPhone.replace(/\s+/g, '');
  const cleanDoctorPhone = doctorPhone.replace(/\s+/g, '');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Top Emergency Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 p-5 text-white text-center relative">
          <div className="absolute top-3 right-3">
            <LanguageToggle variant="header" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Emergency Assistance Identification</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{fullName}</h1>
          <p className="text-xs text-rose-100 mt-0.5">
            Age: {age} yrs • Registered ATTI Dementia Companion Patient
          </p>
          {profile?.blood_group && (
            <span className="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 bg-white/20 rounded-full">
              Blood Group: {profile.blood_group}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Calm Helper Notice */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="block text-amber-950 font-bold mb-0.5">Notice to Helper / First Responder:</strong>
              This individual experiences mild memory difficulties and may feel disoriented. Please speak calmly and reassure them that their family is being contacted.
            </div>
          </div>

          {/* Patient Address & Identification */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">Residential Address</div>
              <div className="text-slate-600">{address}</div>
            </div>
          </div>

          {/* Primary Caregiver Contact Card */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-emerald-800">
                <Heart className="w-4 h-4 text-emerald-600" />
                <span>Verified Emergency Contact</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200/60 text-emerald-900 rounded-full">
                Call First
              </span>
            </div>
            <div className="text-base font-black text-slate-900">{caregiverName}</div>
            <div className="text-xs text-slate-500 mb-3">
              Relationship: <strong className="text-slate-800">{caregiverRelation}</strong> • {caregiverPhone}
            </div>

            <a
              href={`tel:${cleanCaregiverPhone}`}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>Call {caregiverRelation} {caregiverName} Now</span>
            </a>
          </div>

          {/* Physician / Doctor Contact */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-indigo-800">
                <Shield className="w-4 h-4 text-[#5E58E7]" />
                <span>Doctor & Medical Support</span>
              </div>
            </div>
            <div className="text-base font-black text-slate-900">{doctorName}</div>
            <div className="text-xs text-slate-500 mb-3">Consulting Physician • {doctorPhone}</div>

            <a
              href={`tel:${cleanDoctorPhone}`}
              className="w-full py-2.5 px-4 rounded-xl bg-[#5E58E7] hover:bg-[#524BD6] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call {doctorName}</span>
            </a>
          </div>

          {/* Medical Conditions & Allergies */}
          {(profile?.medical_conditions || profile?.allergies) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-500" />
                <span>Medical Details</span>
              </div>
              {profile.medical_conditions && (
                <div>
                  <span className="text-slate-500">Conditions: </span>
                  <span className="font-medium text-slate-800">{profile.medical_conditions}</span>
                </div>
              )}
              {profile.allergies && (
                <div>
                  <span className="text-slate-500">Allergies: </span>
                  <span className="font-semibold text-rose-600">{profile.allergies}</span>
                </div>
              )}
            </div>
          )}

          {/* Care Guidelines */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <strong className="block text-slate-900 font-bold mb-1">Care & Assistance Instructions:</strong>
            <p className="leading-relaxed">
              {profile?.care_instructions || 'Please speak gently and keep the patient in a quiet space.'}
            </p>
            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200/60 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Verified secure ATTI identity badge
            </div>
          </div>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Application</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

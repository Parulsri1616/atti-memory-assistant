import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  User,
  Heart,
  Phone,
  Shield,
  Pill,
  AlertCircle,
  CheckCircle,
  X,
  Printer,
  Sparkles
} from 'lucide-react';
import { PatientProfile, Person, Medication } from '../types';
import { api } from '../services/api';

interface AboutMeSectionProps {
  patient: PatientProfile | null;
  onClose?: () => void;
  isModal?: boolean;
  isDark?: boolean;
}

export const AboutMeSection: React.FC<AboutMeSectionProps> = ({
  patient,
  onClose,
  isModal = false,
  isDark = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const [networkBaseUrl, setNetworkBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://127.0.0.1:5173';
  });

  const displayName = patient?.call_sign || patient?.name || 'Meera';
  const patientId = patient?.id || 1;

  useEffect(() => {
    // If running on localhost/127.0.0.1, fetch system status to retrieve actual LAN IP / network app URL
    // This guarantees mobile devices on the same Wi-Fi can scan and open the assistance page
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      api.getStatus().then((status) => {
        if (status.network_app_url) {
          setNetworkBaseUrl(status.network_app_url);
        }
      }).catch(() => {});
    }
  }, []);

  // The QR code securely encodes ONLY the unique emergency assistance URL
  // It does NOT encode raw sensitive medical data directly in the matrix
  const qrUrl = `${networkBaseUrl}/?view=assist&patient_id=${patientId}`;

  useEffect(() => {
    let isMounted = true;
    const fetchProfileData = async () => {
      try {
        const [peopleData, medsData] = await Promise.all([
          api.getPeople().catch(() => []),
          api.getMedications().catch(() => [])
        ]);
        if (isMounted) {
          setPeople(peopleData);
          setMedications(medsData);
        }
      } catch (err) {
        console.error('Failed to load profile details', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfileData();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  // Render QR Code to Canvas whenever patient or qrUrl updates
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrUrl,
        {
          width: 220,
          margin: 2,
          color: {
            dark: '#1E1B4B', // Deep indigo contrast
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H' // High redundancy suitable for physical print
        },
        (error) => {
          if (error) console.error('Error generating QR code on canvas:', error);
        }
      );
    }
  }, [qrUrl, canvasRef.current]);

  // Download high-resolution, printable PNG QR Code
  const handleDownloadQR = async () => {
    try {
      setDownloading(true);
      // Generate a 600x600 high-res printable data URL
      const dataUrl = await QRCode.toDataURL(qrUrl, {
        width: 600,
        margin: 3,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#1E1B4B',
          light: '#FFFFFF'
        }
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `atti-emergency-qr-${displayName.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download QR code:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Find caregiver & physician from loaded people records
  const caregiver = people.find(
    (p) =>
      p.name.toLowerCase() === (patient?.caregiver_name || 'ananya sharma').toLowerCase() ||
      p.relationship.toLowerCase().includes('caregiver') ||
      p.relationship.toLowerCase().includes('daughter')
  );

  const physician = people.find(
    (p) =>
      p.relationship.toLowerCase().includes('physician') ||
      p.relationship.toLowerCase().includes('doctor') ||
      p.name.toLowerCase().includes('mehta')
  );

  const caregiverName = caregiver?.name || patient?.caregiver_name || 'Ananya Sharma';
  const caregiverPhone = patient?.emergency_contact_phone || caregiver?.phone || '+91 98765 12345';
  const physicianPhone = physician?.phone || '+91 98111 55667';

  return (
    <div className={`w-full ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'} ${isModal ? 'p-6 sm:p-7' : 'p-5 sm:p-6'} transition-colors`}>
      {/* 1. About Me Heading */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#5E58E7]/10 dark:bg-indigo-950/60 text-[#5E58E7] dark:text-indigo-300 flex items-center justify-center font-bold">
              <User className="w-4 h-4 text-[#5E58E7] dark:text-indigo-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              About Me
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personal Medical Profile & Emergency Assistance Identification
          </p>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Patient QR Code (Top Priority) */}
      <div className={`${
        isDark
          ? 'bg-slate-800/80 border-slate-700 text-slate-100'
          : 'bg-gradient-to-b from-indigo-50/70 via-white to-slate-50/50 border-indigo-100 text-slate-800'
      } rounded-3xl p-5 border shadow-sm flex flex-col items-center text-center mb-6`}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5E58E7] text-white text-[11px] font-bold mb-3 shadow-xs">
          <Shield className="w-3.5 h-3.5" />
          <span>Patient Emergency Assistance QR Code</span>
        </div>

        {/* QR Canvas Container (Always crisp white background for optical contrast) */}
        <div className="p-3.5 bg-white rounded-2xl shadow-md border-2 border-indigo-100/80 mb-2">
          <canvas ref={canvasRef} className="block w-[200px] h-[200px]" />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-300 max-w-xs mb-4">
          Unique assistance QR code for <strong className="text-slate-800 dark:text-white">{displayName}</strong>.
          Scan with any mobile camera to view verified guardian contacts.
        </p>

        {/* 3. Download QR Code Button (Immediately Below QR Code) */}
        <button
          onClick={handleDownloadQR}
          disabled={downloading}
          className="w-full sm:w-auto min-w-[240px] px-5 py-3 rounded-2xl bg-gradient-to-r from-[#5E58E7] to-[#4838D6] hover:from-[#524BD6] hover:to-[#3F2FC2] text-white font-bold text-sm shadow-md shadow-indigo-200/50 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>QR Code Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Printable QR Code</span>
            </>
          )}
        </button>
        <span className="text-[11px] text-slate-400 dark:text-slate-400 mt-2 flex items-center gap-1">
          <Printer className="w-3 h-3" />
          High-resolution 600x600 PNG format • Suitable for lanyard or wallet card
        </span>
        <a
          href={qrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-[11px] font-semibold text-[#5E58E7] dark:text-indigo-300 hover:underline inline-flex items-center gap-1"
        >
          <span>Encoded emergency link:</span>
          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{qrUrl}</span>
        </a>
      </div>

      {/* 4. Patient Information (Below the QR Code & Download Button) */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Saved Patient Information & Medical Records
        </div>

        {/* Basic Personal Details */}
        <div className="bg-slate-50/90 dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#5E58E7] dark:text-indigo-300 mb-2.5">
            <User className="w-4 h-4" />
            <span>Personal Details</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Full Name</span>
              <strong className="text-slate-800 dark:text-white text-sm">{patient?.name || 'Meera Sharma'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Preferred Call Sign</span>
              <strong className="text-slate-800 dark:text-white text-sm">{displayName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Account ID</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono">#ATTI-{patientId.toString().padStart(4, '0')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Language & Voice</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">English (Bilingual Hindi Ready)</span>
            </div>
          </div>
        </div>

        {/* Guardian & Caregiver Contacts */}
        <div className="bg-slate-50/90 dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-700">
              <Heart className="w-4 h-4" />
              <span>Guardian & Family Caregiver</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
              Primary Contact
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {caregiverName}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {caregiver?.relationship || patient?.emergency_contact_relation || 'Daughter & Family Caregiver'}
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {caregiverPhone}
              </div>
            </div>
            <a
              href={`tel:${caregiverPhone.replace(/\s+/g, '')}`}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call {caregiverName}</span>
            </a>
          </div>
        </div>

        {/* Emergency & Medical Contacts */}
        <div className="bg-slate-50/90 dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300">
              <Shield className="w-4 h-4" />
              <span>Emergency & Physician Contact</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-full">
              Medical
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {physician?.name || 'Dr. Arjun Mehta'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {physician?.relationship || 'Family Physician • Green Park Clinic'}
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {physicianPhone}
              </div>
            </div>
            <a
              href={`tel:${physicianPhone.replace(/\s+/g, '')}`}
              className="px-3.5 py-2 rounded-xl bg-[#5E58E7] hover:bg-[#524BD6] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Doctor</span>
            </a>
          </div>
        </div>

        {/* Medical Conditions & Allergies */}
        <div className="bg-amber-50/60 dark:bg-amber-950/40 rounded-2xl p-4 border border-amber-200/70 dark:border-amber-800/60 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-800 dark:text-amber-300 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>Medical Conditions & Allergies</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-900 dark:text-white min-w-[130px]">Condition:</span>
              <span>Mild Cognitive Impairment (Dementia Support), Hypertension</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-900 dark:text-white min-w-[130px]">Known Allergies:</span>
              <span className="text-rose-700 dark:text-rose-400 font-semibold">Penicillin (Moderate reaction)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-900 dark:text-white min-w-[130px]">Blood Group:</span>
              <span>B+ Positive</span>
            </div>
          </div>
        </div>

        {/* Current Medication Information */}
        <div className="bg-slate-50/90 dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#5E58E7] dark:text-indigo-300 mb-2.5">
            <Pill className="w-4 h-4" />
            <span>Active Medications (From Saved Records)</span>
          </div>
          {loading ? (
            <div className="text-xs text-slate-400 py-2">Loading medication records...</div>
          ) : medications.length > 0 ? (
            <div className="space-y-2">
              {medications.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>{' '}
                    <span className="text-slate-500 dark:text-slate-400 font-medium">({m.dosage || 'Standard'})</span>
                    <div className="text-[11px] text-slate-400">{m.schedule_time}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 text-[#5E58E7] dark:text-indigo-300 rounded-md">
                    {m.purpose || 'Prescribed'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Amlodipine (5mg, Morning), Metformin (500mg, Evening)
            </div>
          )}
        </div>

        {/* Important Care Instructions */}
        <div className="bg-indigo-50/50 dark:bg-slate-800/90 rounded-2xl p-4 border border-indigo-200/60 dark:border-slate-700 shadow-2xs mb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-900 dark:text-indigo-200 mb-2">
            <Sparkles className="w-4 h-4 text-[#5E58E7] dark:text-indigo-300" />
            <span>Important Care Instructions</span>
          </div>
          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Please speak calmly, clearly and warmly.</li>
            <li>Respond to patient by preferred name <strong>"{displayName}"</strong>.</li>
            <li>In case of disorientation, guide patient to sit comfortably and immediately call Caregiver {caregiverName}.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

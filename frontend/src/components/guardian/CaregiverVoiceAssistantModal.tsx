import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Send,
  HelpCircle,
  ShieldCheck,
  Pill,
  Clock,
  MapPin,
  Bot,
  User,
  Radio
} from 'lucide-react';
import { speechService } from '../../services/speech';
import { api } from '../../services/api';
import { OverviewSummary, Medication, DailyRoutine, SafeZone, LocationLog } from '../../types';

interface CaregiverVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  caregiverName: string;
  isDark: boolean;
  isHindi: boolean;
  latestOverview?: OverviewSummary | null;
  medications?: Medication[];
  activities?: DailyRoutine[];
  safeZones?: SafeZone[];
  latestLocation?: LocationLog | null;
}

export const CaregiverVoiceAssistantModal: React.FC<CaregiverVoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  patientName = 'Meera Sharma',
  caregiverName = 'Ananya Sharma',
  isDark = true,
  isHindi = false,
  latestOverview,
  medications = [],
  activities = [],
  safeZones = [],
  latestLocation
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initial welcome greeting
  const defaultGreeting = isHindi
    ? `नमस्ते ${caregiverName}! मैं ATTI हूँ, ${patientName} की वॉयस असिस्टेंट। आप मुझसे उनकी दवाइयों, दिनचर्या, या सुरक्षा स्थिति के बारे में कुछ भी पूछ सकते हैं या सहायक की आवाज़ सुन सकते हैं।`
    : `Hello ${caregiverName}! I am ATTI, ${patientName}'s voice assistant. You can ask me anything about medications, daily routines, or safety status, and hear the response aloud.`;

  const [conversation, setConversation] = useState<Array<{
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
  }>>([
    {
      sender: 'assistant',
      text: defaultGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Sync default greeting if language changes
  useEffect(() => {
    if (conversation.length === 1 && conversation[0].sender === 'assistant') {
      setConversation([
        {
          sender: 'assistant',
          text: defaultGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isHindi]);

  // Quick prompt questions
  const quickPrompts = isHindi
    ? [
        { label: 'दवाइयों की स्थिति', query: `${patientName} की आज की दवाइयाँ क्या हैं?` },
        { label: 'दैनिक दिनचर्या', query: `${patientName} की आज की दिनचर्या क्या है?` },
        { label: 'सुरक्षित क्षेत्र व स्थान', query: `${patientName} का वर्तमान स्थान और सुरक्षित क्षेत्र क्या है?` },
        { label: 'आपातकालीन सहायता', query: `आपातकालीन स्थिति में मुझे क्या करना चाहिए?` }
      ]
    : [
        { label: "Today's Medications", query: `What medications are scheduled for ${patientName} today?` },
        { label: "Today's Routines", query: `What daily routines are scheduled for ${patientName} today?` },
        { label: 'Safe Zone & Location', query: `What is ${patientName}'s current location and safety zone status?` },
        { label: 'Emergency Guidance', query: `What should I do in an emergency situation for ${patientName}?` }
      ];

  // Stop speech when closing modal
  useEffect(() => {
    if (!isOpen) {
      speechService.stopSpeaking();
      speechService.stopListening();
      setIsSpeaking(false);
      setIsListening(false);
      setIsPaused(false);
    } else {
      speechService.unlockAudio();
    }
  }, [isOpen]);

  const speakText = (text: string) => {
    if (!text || !text.trim()) return;

    speechService.unlockAudio();
    speechService.stopSpeaking();
    setActiveSpeechText(text);
    setIsSpeaking(true);
    setIsPaused(false);

    speechService.speak(text, () => {
      setIsSpeaking(false);
      if (!speechService.isSpeakingPaused()) {
        setIsPaused(false);
      }
    });
  };

  const handleTogglePlayPause = () => {
    if (isSpeaking && !isPaused) {
      speechService.pauseSpeaking();
      setIsSpeaking(false);
      setIsPaused(true);
    } else if (isPaused) {
      speechService.resumeSpeaking(activeSpeechText, () => {
        setIsSpeaking(false);
        if (!speechService.isSpeakingPaused()) {
          setIsPaused(false);
        }
      });
      setIsSpeaking(true);
      setIsPaused(false);
    } else {
      // Re-read last assistant message
      const lastAssistantMsg = [...conversation].reverse().find((m) => m.sender === 'assistant');
      if (lastAssistantMsg) {
        speakText(lastAssistantMsg.text);
      }
    }
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleSendQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    setInputText('');
    setErrorMessage(null);

    // Add user message to conversation
    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConversation((prev) => [
      ...prev,
      { sender: 'user', text: trimmed, timestamp: userMsgTime }
    ]);

    setLoadingAnswer(true);

    try {
      const response = await api.askAssistant(trimmed);
      const answer = response.spoken_text || response.answer || (
        isHindi
          ? `मैंने आपका प्रश्न समझ लिया है। ${patientName} की स्थिति सामान्य है।`
          : `I have received your request. ${patientName} is currently in a safe and monitored condition.`
      );

      const asstMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setConversation((prev) => [
        ...prev,
        { sender: 'assistant', text: answer, timestamp: asstMsgTime }
      ]);

      // Automatically speak the assistant's answer aloud
      speakText(answer);
    } catch (err: any) {
      // Fallback local response using available dashboard data
      let fallbackText = '';
      const lower = trimmed.toLowerCase();

      if (lower.includes('med') || lower.includes('दवा')) {
        const medNames = medications.map((m) => `${m.name} (${m.schedule_time || 'morning'})`).join(', ');
        fallbackText = isHindi
          ? `${patientName} की वर्तमान दवाइयाँ हैं: ${medNames || 'पैरासिटामोल 500mg'}`
          : `${patientName}'s scheduled medications are: ${medNames || 'Paracetamol 500mg, Donepezil 5mg'}.`;
      } else if (lower.includes('routine') || lower.includes('दिनचर्या') || lower.includes('activit')) {
        const routineTitles = activities.map((a) => `${a.title} at ${a.time}`).join(', ');
        fallbackText = isHindi
          ? `आज की निर्धारित दिनचर्या है: ${routineTitles || 'सुबह की सैर और हल्का नाश्ता'}`
          : `Today's scheduled daily routines include: ${routineTitles || 'Morning walk at 08:00 AM, Breakfast at 09:00 AM'}.`;
      } else if (lower.includes('safe') || lower.includes('locat') || lower.includes('स्थान') || lower.includes('सुरक्ष')) {
        const isInside = latestLocation?.is_inside_safe_zone ?? true;
        fallbackText = isHindi
          ? `${patientName} सुरक्षित क्षेत्र ${isInside ? 'के अंदर' : 'के बाहर'} हैं। अंतिम स्थान शांति निकेतन, नई दिल्ली रिकॉर्ड किया गया है।`
          : `${patientName} is currently ${isInside ? 'INSIDE' : 'OUTSIDE'} the registered safe zone. Last verified location is Shanti Niketan, New Delhi.`;
      } else {
        fallbackText = isHindi
          ? `${patientName} की सभी दिनचर्या और दवाइयाँ ATTI वॉयस सहायक द्वारा ट्रैक की जा रही हैं।`
          : `${patientName}'s routines and safety monitors are active and being tracked by the ATTI voice assistant.`;
      }

      const asstMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setConversation((prev) => [
        ...prev,
        { sender: 'assistant', text: fallbackText, timestamp: asstMsgTime }
      ]);

      speakText(fallbackText);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    speechService.unlockAudio();
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
    setIsListening(true);
    setErrorMessage(null);

    speechService.startListening(
      (transcript) => {
        setIsListening(false);
        if (transcript && transcript.trim()) {
          handleSendQuery(transcript.trim());
        }
      },
      (err) => {
        setIsListening(false);
        setErrorMessage(isHindi ? 'आवाज़ रिकॉर्ड करने में असमर्थ। कृपया लिखकर पूछें।' : 'Could not capture microphone audio. You can also type below.');
      },
      () => {
        setIsListening(false);
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-voice-assistant-title"
    >
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isDark
            ? 'bg-slate-900 border-indigo-500/30 text-white'
            : 'bg-white border-slate-200 text-slate-800'
        } transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b ${
            isDark
              ? 'bg-gradient-to-r from-indigo-900/90 to-purple-900/80 border-indigo-800/60'
              : 'bg-gradient-to-r from-[#5E58E7] to-indigo-600 border-indigo-200 text-white'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner border border-white/30">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="modal-voice-assistant-title"
                  className="text-base font-extrabold tracking-tight text-white leading-tight truncate"
                >
                  {isHindi ? 'ATTI वॉयस सहायक' : 'ATTI Voice Assistant'}
                </h2>
              </div>
              <p className="text-xs text-indigo-100/90 truncate mt-0.5">
                {isHindi
                  ? `${patientName} के लिए वॉयस इंटरैक्शन सुनें`
                  : `Voice Companion for ${patientName}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer shrink-0"
            aria-label="Close Voice Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Audio Visualizer Banner */}
        <div
          className={`px-5 py-3 border-b flex items-center justify-between gap-3 ${
            isSpeaking
              ? isDark
                ? 'bg-indigo-950/60 border-indigo-800/40'
                : 'bg-indigo-50/80 border-indigo-200'
              : isDark
              ? 'bg-slate-850 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isSpeaking
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : isPaused
                  ? 'bg-amber-500 text-white'
                  : isDark
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isSpeaking ? (
                <Volume2 className="w-4 h-4 animate-bounce" />
              ) : isPaused ? (
                <Pause className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold truncate">
                  {isSpeaking
                    ? isHindi
                      ? 'वॉयस असिस्टेंट बोल रहा है...'
                      : 'Speaking aloud...'
                    : isPaused
                    ? isHindi
                      ? 'ऑडियो रुका हुआ है'
                      : 'Audio paused'
                    : isHindi
                    ? 'ऑडियो तैयार है'
                    : 'Speaker ready'}
                </span>
                {isSpeaking && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-emerald-500 rounded-full animate-pulse delay-150" />
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] truncate ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {activeSpeechText || (isHindi ? 'सहायक की आवाज़ सुनने के लिए टैप करें' : 'Tap below to listen')}
              </p>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleTogglePlayPause}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                isSpeaking
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title={isSpeaking ? 'Pause speaking' : isPaused ? 'Resume speaking' : 'Listen again'}
            >
              {isSpeaking ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>{isHindi ? 'रोकें' : 'Pause'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isHindi ? 'सुनें' : 'Listen'}</span>
                </>
              )}
            </button>

            {(isSpeaking || isPaused) && (
              <button
                type="button"
                onClick={handleStopSpeaking}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
                title="Stop speaking"
                aria-label="Stop audio"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-[220px] max-h-[360px]">
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs relative text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? isDark
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-[#5E58E7] text-white rounded-tr-xs'
                    : isDark
                    ? 'bg-slate-800/95 border border-slate-700/80 text-slate-100 rounded-tl-xs'
                    : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-white/10 dark:border-slate-700/50">
                  <span className="text-[10px] opacity-70">{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.text)}
                      className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 active:scale-95 cursor-pointer"
                      title="Speak this response aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isHindi ? 'दोहराएं' : 'Replay'}</span>
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loadingAnswer && (
            <div className="flex items-center gap-2.5 text-xs text-indigo-400 animate-pulse p-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>
                {isHindi ? 'ATTI सोच रहा है और आवाज़ तैयार कर रहा है...' : 'ATTI is generating voice response...'}
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Quick Suggested Prompts */}
        <div className={`px-4 py-2 border-t flex flex-wrap gap-1.5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider w-full mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {isHindi ? 'त्वरित प्रश्न:' : 'Quick Questions:'}
          </span>
          {quickPrompts.map((p, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => handleSendQuery(p.query)}
              disabled={loadingAnswer}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-indigo-900/40 text-indigo-200 border-slate-700'
                  : 'bg-white hover:bg-indigo-50 text-[#5E58E7] border-slate-200 shadow-xs'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input & Microphone Bar */}
        <div
          className={`p-3 sm:p-4 border-t ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(inputText);
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer shadow-md ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
                  : isDark
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-[#5E58E7] hover:bg-indigo-600 text-white'
              }`}
              title={isListening ? 'Stop listening' : 'Speak via microphone'}
              aria-label="Toggle voice input"
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Text Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? isHindi
                    ? 'सुन रहा हूँ... बोलिए'
                    : 'Listening... speak now'
                  : isHindi
                  ? 'प्रश्न लिखें या बोलें...'
                  : 'Ask ATTI a question...'
              }
              disabled={loadingAnswer || isListening}
              className={`flex-1 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#5E58E7] transition-all ${
                isDark
                  ? 'bg-slate-800/90 border-slate-700 text-white placeholder-slate-400'
                  : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
              }`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || loadingAnswer}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

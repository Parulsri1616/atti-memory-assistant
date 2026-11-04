import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  Sparkles,
  PhoneCall,
  CheckCircle,
  HelpCircle,
  Keyboard,
  Heart
} from 'lucide-react';
import { RoutineBanner } from './RoutineBanner';
import { api } from '../services/api';
import { speechService } from '../services/speech';
import { QueryResponse } from '../types';

interface PatientViewProps {
  onOpenCaregiver: () => void;
}

export const PatientView: React.FC<PatientViewProps> = ({ onOpenCaregiver }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [showTextInput, setShowTextInput] = useState<boolean>(false);

  const [lastResponse, setLastResponse] = useState<QueryResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What do I do today?",
    "Who is Rahul?",
    "Where are my glasses?",
    "Did I take my medicine?",
    "What day is it today?",
    "Where are my house keys?"
  ]);

  const [caregiverNotified, setCaregiverNotified] = useState(false);

  useEffect(() => {
    // Load dynamic prompt suggestions from backend
    api.getSuggestions().then((sugs) => {
      if (sugs && sugs.length > 0) {
        setSuggestions(sugs);
      }
    });

    // Initial warm greeting
    const initialGreeting: QueryResponse = {
      answer: "Hello Auntie! I am ATTI, your personal memory assistant. You can tap the big blue microphone anytime and ask me a question.",
      spoken_text: "Hello Auntie! I am ATTI, your personal memory assistant. You can tap the big blue microphone anytime and ask me a question.",
      intent: "conversational",
      is_fallback: false,
      confidence: 1.0,
      sources: []
    };
    setLastResponse(initialGreeting);
  }, []);

  const handleStartVoice = () => {
    setSpeechError(null);
    setCaregiverNotified(false);

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    speechService.startListening(
      (transcript) => {
        setIsListening(false);
        setCurrentQuery(transcript);
        processQuery(transcript);
      },
      (error) => {
        setIsListening(false);
        setSpeechError(error);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const processQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsLoading(true);
    setCurrentQuery(queryText);
    setSpeechError(null);
    setCaregiverNotified(false);

    try {
      const response = await api.askAssistant(queryText);
      setLastResponse(response);

      // Speak aloud immediately using calm TTS
      if (response.spoken_text) {
        setIsSpeaking(true);
        speechService.speak(response.spoken_text, () => {
          setIsSpeaking(false);
        });
      }
    } catch (err: any) {
      setLastResponse({
        answer: "I am having trouble connecting right now. Please tell your caregiver Rahul.",
        spoken_text: "I am having trouble connecting right now. Please tell your caregiver Rahul.",
        intent: "error",
        is_fallback: true,
        confidence: 0,
        sources: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplaySpeech = () => {
    if (lastResponse && lastResponse.spoken_text) {
      setIsSpeaking(true);
      speechService.speak(lastResponse.spoken_text, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleStopSpeech = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      processQuery(textInput);
      setTextInput('');
    }
  };

  const handleNotifyCaregiver = () => {
    setCaregiverNotified(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-black text-xl shadow">
            A
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-sky-950">
              ATTI
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Dementia Memory Companion
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCaregiver}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors shadow-sm"
          title="Caregiver portal for family members"
        >
          <Heart className="w-4 h-4 text-sky-600 fill-sky-200" />
          <span>Caregiver Mode</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 flex flex-col gap-6">
        {/* Orientation & Routine Banner */}
        <RoutineBanner />

        {/* Central Voice Query Action Zone */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col items-center text-center transition-all">
          <div className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
            {isListening
              ? 'Listening to your voice...'
              : isLoading
              ? 'Finding your answer...'
              : isSpeaking
              ? 'Speaking aloud...'
              : 'Tap & Speak Freely'}
          </div>

          {/* Big Voice Button */}
          <div className="relative my-4">
            {isListening && (
              <div className="absolute -inset-4 rounded-full bg-sky-400/30 animate-ping pointer-events-none" />
            )}
            {isSpeaking && (
              <div className="absolute -inset-3 rounded-full bg-emerald-400/30 animate-pulse pointer-events-none" />
            )}

            <button
              onClick={handleStartVoice}
              disabled={isLoading}
              className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 transform active:scale-95 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-8 ring-rose-200 scale-105'
                  : isSpeaking
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-8 ring-emerald-200'
                  : 'bg-gradient-to-b from-sky-500 to-sky-700 hover:from-sky-600 hover:to-sky-800 text-white ring-8 ring-sky-100'
              }`}
              aria-label="Tap to speak"
            >
              {isListening ? (
                <>
                  <MicOff className="w-12 h-12 mb-1 animate-pulse" />
                  <span className="text-xs font-bold tracking-wider uppercase">Listening</span>
                </>
              ) : isSpeaking ? (
                <>
                  <Volume2 className="w-12 h-12 mb-1 animate-calm-pulse" />
                  <span className="text-xs font-bold tracking-wider uppercase">Speaking</span>
                </>
              ) : (
                <>
                  <Mic className="w-12 h-12 mb-1" />
                  <span className="text-xs font-bold tracking-wider uppercase">Ask ATTI</span>
                </>
              )}
            </button>
          </div>

          {/* Instruction text */}
          <p className="text-base sm:text-lg font-medium text-slate-600 mt-2">
            {isListening
              ? 'Speak now: "Who is Rahul?", "Where are my glasses?"'
              : 'Press the microphone and ask any question.'}
          </p>

          {speechError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm max-w-md">
              {speechError}
            </div>
          )}

          {/* Fallback Keyboard Toggle */}
          <div className="mt-4 pt-4 border-t border-slate-100 w-full flex items-center justify-center">
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className="text-xs font-semibold text-slate-500 hover:text-sky-700 flex items-center gap-1.5 transition-colors"
            >
              <Keyboard className="w-4 h-4" />
              <span>{showTextInput ? 'Hide typing box' : 'Or type your question'}</span>
            </button>
          </div>

          {showTextInput && (
            <form onSubmit={handleManualSubmit} className="mt-3 w-full flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g. Who is Rahul? or Where are my keys?"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={isLoading || !textInput.trim()}
                className="px-5 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Ask</span>
              </button>
            </form>
          )}
        </div>

        {/* Spoken Response Card */}
        {lastResponse && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col gap-4">
            {/* User's asked question */}
            {currentQuery && (
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                <div className="p-2 bg-slate-200 rounded-xl shrink-0 mt-0.5">
                  <HelpCircle className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-400">
                    You asked:
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    "{currentQuery}"
                  </div>
                </div>
              </div>
            )}

            {/* Assistant's Response with Large Accessible Typography */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center shrink-0 text-sky-700 font-extrabold text-2xl shadow-sm">
                A
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                    ATTI's Response
                  </span>
                  {lastResponse.sources.length > 0 && (
                    <span className="text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Grounded Memory
                    </span>
                  )}
                </div>

                {/* Main Large Text Answer */}
                <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
                  {lastResponse.answer}
                </div>
              </div>
            </div>

            {/* Audio Controls & Caregiver Connect */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReplaySpeech}
                  disabled={isSpeaking}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-sm transition-colors border border-sky-200 active:scale-95 shadow-sm"
                  title="Repeat the answer aloud"
                >
                  <RotateCcw className="w-4 h-4 text-sky-600" />
                  <span>Listen Again</span>
                </button>

                {isSpeaking && (
                  <button
                    onClick={handleStopSpeech}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                  >
                    <VolumeX className="w-4 h-4 text-slate-500" />
                    <span>Stop Voice</span>
                  </button>
                )}
              </div>

              {/* Gentle Fallback: Offer caregiver reassurance */}
              {lastResponse.is_fallback && (
                <div className="flex items-center gap-2">
                  {caregiverNotified ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                      <CheckCircle className="w-4 h-4" />
                      <span>Note sent to Rahul</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleNotifyCaregiver}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow transition-colors"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Ask Rahul For Me</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Tap Prompt Suggestions (Low cognitive effort) */}
        <div className="bg-white/80 rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Frequent Questions (Tap to Ask)</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => processQuery(sug)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300 border border-slate-200 text-slate-700 font-semibold text-sm sm:text-base transition-all active:scale-95 text-left shadow-xs"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

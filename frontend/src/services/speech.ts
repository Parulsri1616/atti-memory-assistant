// Dementia-friendly speech services (Dual Engine: Server-side TTS + Web Speech API + Web Audio unlock)

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private audioCtx: AudioContext | null = null;
  private watchdogTimer: any = null;

  private fullSpokenText: string = '';
  private lastSpokenText: string = '';
  private lastOnEndCallback?: () => void;
  private isPausedExplicitly: boolean = false;
  private baseOffset: number = 0;
  private charIndex: number = 0;
  private utteranceSeq: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Speech Recognition setup
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
          this.recognition.lang = 'en-IN';
        } catch (e) {
          console.warn('SpeechRecognition init error:', e);
        }
      }

      // 2. Text-to-Speech setup
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
          window.speechSynthesis.onvoiceschanged = () => {
            this.loadVoices();
          };
        }
      }

      // 3. User interaction listener to prime audio context
      this.setupAudioUnlock();
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    try {
      const v = this.synth.getVoices();
      if (v && v.length > 0) {
        this.cachedVoices = v;
      }
    } catch (e) {
      console.warn('Voice loading warning:', e);
    }
  }

  private setupAudioUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.unlockAudio();
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
      window.removeEventListener('keydown', unlock, true);
      window.removeEventListener('pointerdown', unlock, true);
    };

    window.addEventListener('click', unlock, true);
    window.addEventListener('touchstart', unlock, true);
    window.addEventListener('keydown', unlock, true);
    window.addEventListener('pointerdown', unlock, true);
  }

  public unlockAudio(): void {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioCtx) {
          this.audioCtx = new AudioCtx();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
      }
    } catch {}

    if (this.synth) {
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
      } catch {}
    }
  }

  /**
   * Gentle, soothing 2-tone harmonic chime (520Hz & 650Hz) via Web Audio API.
   * Gives instant audible feedback to confirm speakers are active.
   */
  public playChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Tone 1: 520Hz (calm tone, 70ms)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(520, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Tone 2: 650Hz (harmonic confirmation, 70ms)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(650, now + 0.07);
      gain2.gain.setValueAtTime(0.08, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.07);
      osc2.stop(now + 0.16);
    } catch (e) {
      // AudioContext unavailable or blocked; non-fatal
    }
  }

  public isSTTSupported(): boolean {
    return this.recognition !== null;
  }

  public isTTSSupported(): boolean {
    return true; // Supported via Server TTS and/or Web Speech API
  }

  public startListening(
    onResult: (text: string) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. Please use the text input.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.stopSpeaking();

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'Could not understand audio');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      onError(e.message || 'Error starting microphone');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  private getBestVoice(text: string): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    const hasDevanagari = /[\u0900-\u097F]/.test(text);

    if (hasDevanagari) {
      const hindi = voices.find(
        (v) => v.lang.startsWith('hi') || (v.lang.includes('IN') && v.name.includes('Hindi'))
      );
      if (hindi) return hindi;
    }

    const preferred = voices.find(
      (v) =>
        (v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US')) &&
        (v.name.includes('Samantha') ||
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Daniel') ||
          v.name.includes('Karen') ||
          v.name.includes('Rishi'))
    );
    if (preferred) return preferred;

    const samantha = voices.find((v) => v.name === 'Samantha');
    if (samantha) return samantha;

    const localEn = voices.find((v) => v.lang.startsWith('en') && (v as any).localService === true);
    if (localEn) return localEn;

    const anyEn = voices.find((v) => v.lang.startsWith('en'));
    if (anyEn) return anyEn;

    return voices.find((v) => v.default) || voices[0] || null;
  }

  private startWatchdog(): void {
    this.stopWatchdog();
    this.watchdogTimer = setInterval(() => {
      if (this.synth && this.synth.speaking && this.synth.paused) {
        try {
          this.synth.resume();
        } catch {}
      }
    }, 4000);
  }

  private stopWatchdog(): void {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  /**
   * Primary Speak method:
   * 1. Attempts crystal-clear server-side audio playback (WAV) which completely
   *    bypasses Chromium Web Speech API bugs.
   * 2. Automatically falls back to Web Speech API if server TTS is unreachable.
   */
  public speak(text: string, onEnd?: () => void, baseOffset: number = 0) {
    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    this.unlockAudio();
    this.playChime();

    this.isPausedExplicitly = false;
    this.baseOffset = baseOffset;
    if (baseOffset === 0) {
      this.fullSpokenText = text;
      this.charIndex = 0;
    }
    this.lastSpokenText = text;
    this.lastOnEndCallback = onEnd;

    const seq = ++this.utteranceSeq;

    // Stop previous playback
    this.stopSpeaking();

    // 1. Try HTML5 Audio via Server TTS endpoint
    const ttsUrl = `/api/assistant/tts?text=${encodeURIComponent(text.trim())}`;
    const audio = new Audio(ttsUrl);
    audio.volume = 1.0;
    this.currentAudio = audio;

    let hasHandledEnd = false;
    const finish = () => {
      if (hasHandledEnd || this.utteranceSeq !== seq) return;
      hasHandledEnd = true;
      this.currentAudio = null;
      if (this.isPausedExplicitly) return;
      this.charIndex = 0;
      this.baseOffset = 0;
      if (onEnd) onEnd();
    };

    audio.onended = finish;

    audio.onerror = () => {
      // If server audio fails, gracefully fall back to local Web Speech API
      if (this.utteranceSeq !== seq) return;
      this.currentAudio = null;
      this.speakWithWebSpeech(text, onEnd, baseOffset);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy or fetch error: fall back to Web Speech API
        if (this.utteranceSeq !== seq) return;
        this.currentAudio = null;
        this.speakWithWebSpeech(text, onEnd, baseOffset);
      });
    }
  }

  /**
   * Fallback Web Speech API method with Chromium fixes
   */
  private speakWithWebSpeech(text: string, onEnd?: () => void, baseOffset: number = 0) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    const seq = ++this.utteranceSeq;
    this.stopWatchdog();

    try {
      if (this.synth.speaking || this.synth.pending) {
        this.synth.cancel();
      }
      if (this.synth.paused) {
        this.synth.resume();
      }
    } catch {}
    this.currentUtterance = null;

    setTimeout(() => {
      if (!this.synth || this.utteranceSeq !== seq) return;

      try {
        if (this.synth.paused) {
          this.synth.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.92;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const bestVoice = this.getBestVoice(text);
        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang;
        } else {
          utterance.lang = /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-IN';
        }

        utterance.onboundary = (e: any) => {
          if (this.utteranceSeq !== seq) return;
          if (typeof e.charIndex === 'number' && e.charIndex >= 0) {
            this.charIndex = this.baseOffset + e.charIndex;
          }
        };

        utterance.onstart = () => {
          if (this.utteranceSeq !== seq) return;
          this.startWatchdog();
        };

        utterance.onend = () => {
          if (this.utteranceSeq !== seq) return;
          this.stopWatchdog();
          this.currentUtterance = null;
          (window as any).__activeUtterance = null;
          if (this.isPausedExplicitly) return;
          this.charIndex = 0;
          this.baseOffset = 0;
          if (onEnd) onEnd();
        };

        utterance.onerror = (event: any) => {
          if (this.utteranceSeq !== seq) return;
          this.stopWatchdog();
          this.currentUtterance = null;
          (window as any).__activeUtterance = null;

          if (
            this.isPausedExplicitly ||
            (event && (event.error === 'interrupted' || event.error === 'canceled'))
          ) {
            return;
          }

          console.warn('Web Speech API warning:', event?.error);
          this.charIndex = 0;
          this.baseOffset = 0;
          if (onEnd) onEnd();
        };

        this.currentUtterance = utterance;
        (window as any).__activeUtterance = utterance;

        this.synth.speak(utterance);
      } catch (err) {
        console.error('Web Speech speak error:', err);
        if (onEnd) onEnd();
      }
    }, 35);
  }

  public stopSpeaking() {
    this.isPausedExplicitly = false;
    this.charIndex = 0;
    this.baseOffset = 0;
    this.fullSpokenText = '';
    this.utteranceSeq++;
    this.stopWatchdog();

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    this.currentUtterance = null;
    (window as any).__activeUtterance = null;
    if (this.synth) {
      try {
        this.synth.cancel();
        if (this.synth.paused) {
          this.synth.resume();
        }
      } catch {}
    }
  }

  public pauseSpeaking() {
    this.isPausedExplicitly = true;
    this.stopWatchdog();

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch {}
    }

    if (this.synth) {
      try {
        this.synth.pause();
      } catch {}
      try {
        this.synth.cancel();
      } catch {}
      this.currentUtterance = null;
      (window as any).__activeUtterance = null;
    }
  }

  public resumeSpeaking(text?: string, onEnd?: () => void) {
    this.isPausedExplicitly = false;

    if (this.currentAudio && this.currentAudio.paused && !this.currentAudio.ended) {
      this.currentAudio.play().catch(() => {
        this.speak(text || this.fullSpokenText || this.lastSpokenText, onEnd);
      });
      return;
    }

    const originalText = text || this.fullSpokenText || this.lastSpokenText;
    const targetOnEnd = onEnd || this.lastOnEndCallback;

    if (!originalText) return;

    let resumeText = originalText;
    let resumeOffset = 0;
    if (this.charIndex > 0 && this.charIndex < originalText.length) {
      resumeText = originalText.slice(this.charIndex).trim();
      resumeOffset = this.charIndex;
      if (!resumeText) {
        resumeText = originalText;
        resumeOffset = 0;
      }
    }

    this.speak(resumeText, targetOnEnd, resumeOffset);
  }

  public isSpeaking(): boolean {
    const isAudioPlaying =
      this.currentAudio !== null &&
      !this.currentAudio.paused &&
      !this.currentAudio.ended &&
      !this.isPausedExplicitly;
    const isSynthSpeaking =
      this.synth !== null && this.synth.speaking && !this.isPausedExplicitly;
    return isAudioPlaying || isSynthSpeaking;
  }

  public isSpeakingPaused(): boolean {
    return this.isPausedExplicitly;
  }
}

export const speechService = new SpeechService();

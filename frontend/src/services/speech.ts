// Dementia-friendly speech services (Web Speech API)

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Speech Recognition setup
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-IN'; // Indian English tailored for DTC student context
      }

      // Text-to-Speech setup
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  public isSTTSupported(): boolean {
    return this.recognition !== null;
  }

  public isTTSSupported(): boolean {
    return this.synth !== null;
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

    // Stop any ongoing speech playback before listening
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
      this.recognition.stop();
      this.isListening = false;
    }
  }

  private fullSpokenText: string = '';
  private lastSpokenText: string = '';
  private lastOnEndCallback?: () => void;
  private isPausedExplicitly: boolean = false;
  private baseOffset: number = 0;
  private charIndex: number = 0;
  private utteranceSeq: number = 0;

  public speak(text: string, onEnd?: () => void, baseOffset: number = 0) {
    if (!this.synth) return;

    // Reset paused state for fresh or continued speech
    this.isPausedExplicitly = false;
    this.baseOffset = baseOffset;
    if (baseOffset === 0) {
      this.fullSpokenText = text;
      this.charIndex = 0;
    }
    this.lastSpokenText = text;
    this.lastOnEndCallback = onEnd;

    // Tag this utterance with a new sequence number
    const seq = ++this.utteranceSeq;

    // Cancel any previous utterance safely
    try {
      this.synth.cancel();
    } catch {}
    this.currentUtterance = null;

    const utterance = new SpeechSynthesisUtterance(text);
    // Tone guidelines for dementia: calm, slightly slower (0.92x) for clarity
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Pick best available English voice
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US')) &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    // Keep track of spoken boundary position so resume knows where it left off
    utterance.onboundary = (e: any) => {
      if (this.utteranceSeq !== seq) return;
      if (typeof e.charIndex === 'number' && e.charIndex >= 0) {
        this.charIndex = this.baseOffset + e.charIndex;
      }
    };

    utterance.onend = () => {
      if (this.utteranceSeq !== seq) return;
      this.currentUtterance = null;
      // If we paused intentionally, do NOT notify end
      if (this.isPausedExplicitly) return;
      this.charIndex = 0;
      this.baseOffset = 0;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event: any) => {
      if (this.utteranceSeq !== seq) return;
      this.currentUtterance = null;
      // Interrupted or canceled errors happen when stopSpeaking or pause is called intentionally
      if (this.isPausedExplicitly || (event && (event.error === 'interrupted' || event.error === 'canceled'))) {
        return;
      }
      this.charIndex = 0;
      this.baseOffset = 0;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('TTS speak error:', err);
    }
  }

  public stopSpeaking() {
    this.isPausedExplicitly = false;
    this.charIndex = 0;
    this.baseOffset = 0;
    this.fullSpokenText = '';
    this.utteranceSeq++;
    this.currentUtterance = null;
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
  }

  public pauseSpeaking() {
    this.isPausedExplicitly = true;
    if (this.synth) {
      try {
        this.synth.pause();
      } catch {}
      // In Chromium on macOS, synth.pause() can be ignored; cancel ensures immediate silence
      try {
        this.synth.cancel();
      } catch {}
      this.currentUtterance = null;
    }
  }

  public resumeSpeaking(text?: string, onEnd?: () => void) {
    if (!this.synth) return;
    this.isPausedExplicitly = false;
    const originalText = text || this.fullSpokenText || this.lastSpokenText;
    const targetOnEnd = onEnd || this.lastOnEndCallback;

    if (!originalText) return;

    // Slice text from the last spoken word boundary so it resumes right where it stopped
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
    return this.synth ? (this.synth.speaking && !this.isPausedExplicitly) : false;
  }

  public isSpeakingPaused(): boolean {
    return this.isPausedExplicitly;
  }
}

export const speechService = new SpeechService();

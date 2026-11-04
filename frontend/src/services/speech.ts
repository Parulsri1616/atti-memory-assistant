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

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    // Tone guidelines for dementia: calm, slightly slower (0.9x) for clarity
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

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speechService = new SpeechService();

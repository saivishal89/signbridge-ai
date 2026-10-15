import { SupportedLanguage } from '../types/gesture';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  private loadVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public getMatchingVoice(lang: SupportedLanguage, preferredVoiceUri?: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (voices.length === 0) return null;

    if (preferredVoiceUri) {
      const match = voices.find((v) => v.voiceURI === preferredVoiceUri);
      if (match) return match;
    }

    const localePrefix = lang === 'en' ? 'en' : lang === 'hi' ? 'hi' : 'te';
    // First try exact region match like hi-IN, te-IN, en-IN
    const regionalMatch = voices.find(
      (v) => v.lang.toLowerCase().startsWith(`${localePrefix}-in`) || v.lang.toLowerCase() === localePrefix
    );
    if (regionalMatch) return regionalMatch;

    // Secondary prefix match
    const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(localePrefix));
    if (prefixMatch) return prefixMatch;

    // Fallback to default or English
    const englishVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    return englishVoice || voices[0] || null;
  }

  public speak(
    text: string,
    options: {
      lang?: SupportedLanguage;
      rate?: number;
      pitch?: number;
      preferredVoiceUri?: string;
      force?: boolean;
      cooldownMs?: number;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): boolean {
    if (!this.synth || !text || text.trim().length === 0) {
      return false;
    }

    const trimmed = text.trim();
    const now = Date.now();
    const cooldown = options.cooldownMs ?? 1500;

    // Prevent immediate continuous repetitions unless force flag is passed
    if (!options.force) {
      if (trimmed === this.lastSpokenText && now - this.lastSpokenTime < cooldown) {
        return false;
      }
      if (this.isSpeaking && now - this.lastSpokenTime < 500) {
        return false;
      }
    }

    // Cancel current speaking if force or new statement
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(trimmed);
    const lang = options.lang || 'en';
    const voice = this.getMatchingVoice(lang, options.preferredVoiceUri);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
    }

    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    this.isSpeaking = true;
    this.lastSpokenText = trimmed;
    this.lastSpokenTime = now;

    utterance.onend = () => {
      this.isSpeaking = false;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      console.warn('Speech synthesis utterance error:', e);
      options.onError?.(e);
    };

    try {
      this.synth.speak(utterance);
      return true;
    } catch (err) {
      this.isSpeaking = false;
      console.error('Failed to trigger speech synthesis', err);
      return false;
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  public replayLast(options?: Parameters<SpeechService['speak']>[1]): boolean {
    if (!this.lastSpokenText) return false;
    return this.speak(this.lastSpokenText, { ...options, force: true });
  }

  public getLastSpoken(): string {
    return this.lastSpokenText;
  }
}

export const speechService = new SpeechService();

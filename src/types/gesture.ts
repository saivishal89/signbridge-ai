export type SupportedLanguage = 'en' | 'hi' | 'te';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  speechLocale: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English (India)', nativeLabel: 'English', flag: '🇮🇳', speechLocale: 'en-IN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', speechLocale: 'hi-IN' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳', speechLocale: 'te-IN' }
];

export type PretrainedGestureName =
  | 'None'
  | 'Closed_Fist'
  | 'Open_Palm'
  | 'Pointing_Up'
  | 'Thumb_Down'
  | 'Thumb_Up'
  | 'Victory'
  | 'ILoveYou'
  | 'OK_Sign'
  | 'Call_Me'
  | 'Rock_On'
  | 'Three_Fingers'
  | 'Four_Fingers'
  | 'Pinch_Sign';

export interface GesturePhraseMapping {
  category: PretrainedGestureName;
  displayName: string;
  icon: string;
  translations: {
    en: string;
    hi: string;
    te: string;
  };
}

export const DEFAULT_GESTURE_MAPPINGS: GesturePhraseMapping[] = [
  {
    category: 'Open_Palm',
    displayName: 'Open Palm',
    icon: '✋',
    translations: {
      en: 'Hello, how can I help you?',
      hi: 'नमस्ते, मैं आपकी कैसे सहायता कर सकता हूँ?',
      te: 'నమస్కారం, నేను మీకు ఎలా సహాయపడగలను?'
    }
  },
  {
    category: 'Thumb_Up',
    displayName: 'Thumbs Up',
    icon: '👍',
    translations: {
      en: 'Yes, absolutely',
      hi: 'हाँ, बिल्कुल सही',
      te: 'అవును, ఖచ్చితంగా'
    }
  },
  {
    category: 'Thumb_Down',
    displayName: 'Thumbs Down',
    icon: '👎',
    translations: {
      en: 'No, I need assistance',
      hi: 'नहीं, मुझे सहायता चाहिए',
      te: 'లేదు, నాకు సహాయం కావాలి'
    }
  },
  {
    category: 'Victory',
    displayName: 'Victory (V-Sign)',
    icon: '✌️',
    translations: {
      en: 'Peace and good health',
      hi: 'शांति और शुभकामनाएं',
      te: 'శాంతి మరియు శుభాకాంక్షలు'
    }
  },
  {
    category: 'ILoveYou',
    displayName: 'I Love You Sign',
    icon: '🤟',
    translations: {
      en: 'Thank you and respect',
      hi: 'धन्यवाद और सादर प्रणाम',
      te: 'ధన్యవాదాలు మరియు గౌరవం'
    }
  },
  {
    category: 'Pointing_Up',
    displayName: 'Pointing Up',
    icon: '☝️',
    translations: {
      en: 'Please wait a moment',
      hi: 'कृपया एक क्षण प्रतीक्षा करें',
      te: 'దయచేసి ఒక్క క్షణం వేచి ఉండండి'
    }
  },
  {
    category: 'Closed_Fist',
    displayName: 'Closed Fist',
    icon: '✊',
    translations: {
      en: 'Stop / Emergency',
      hi: 'रुकिए / आपातकालीन स्थिति',
      te: 'ఆగండి / అత్యవసరం'
    }
  },
  {
    category: 'OK_Sign',
    displayName: 'OK / Perfect (👌)',
    icon: '👌',
    translations: {
      en: 'Everything is OK and fine.',
      hi: 'सब कुछ ठीक और बढ़िया है।',
      te: 'అంతా సరిగ్గా మరియు బాగుంది.'
    }
  },
  {
    category: 'Call_Me',
    displayName: 'Call Me / Phone (🤙)',
    icon: '🤙',
    translations: {
      en: 'Please call my phone or doctor.',
      hi: 'कृपया मेरे डॉक्टर या परिवार को कॉल करें।',
      te: 'దయచేసి నా డాక్టర్ లేదా కుటుంబానికి కాల్ చేయండి.'
    }
  },
  {
    category: 'Rock_On',
    displayName: 'Rock On / Strong (🤘)',
    icon: '🤘',
    translations: {
      en: 'I am feeling strong and great!',
      hi: 'मैं बहुत अच्छा और मजबूत महसूस कर रहा हूँ!',
      te: 'నేను చాలా బలంగా మరియు బాగున్నాను!'
    }
  },
  {
    category: 'Three_Fingers',
    displayName: 'Water / Three (3️⃣ / W)',
    icon: '3️⃣',
    translations: {
      en: 'I need clean drinking water.',
      hi: 'मुझे पीने का पानी चाहिए।',
      te: 'నాకు త్రాగునీరు కావాలి.'
    }
  },
  {
    category: 'Four_Fingers',
    displayName: 'Wait / Four (4️⃣)',
    icon: '4️⃣',
    translations: {
      en: 'Please give me four minutes.',
      hi: 'कृपया मुझे चार मिनट का समय दें।',
      te: 'దయచేసి నాకు నాలుగు నిమిషాలు ఇవ్వండి.'
    }
  },
  {
    category: 'Pinch_Sign',
    displayName: 'A Little Bit (🤏)',
    icon: '🤏',
    translations: {
      en: 'Just a little bit, please.',
      hi: 'बस थोड़ा सा, कृपया।',
      te: 'కొద్దిగా మాత్రమే, దయచేసి.'
    }
  }
];

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

export interface TrainingSample {
  id: string;
  features: number[]; // 63 normalized relative coords (x,y,z for 21 landmarks)
  timestamp: number;
}

export interface CustomVocabularyEntry {
  id: string;
  name: string;
  description: string;
  translations: {
    en: string;
    hi: string;
    te: string;
  };
  samples: TrainingSample[];
  createdAt: number;
  updatedAt: number;
}

export interface RecognitionResult {
  source: 'pretrained' | 'custom' | 'none';
  label: string;
  translatedText: string;
  confidence: number; // 0 - 1
  isReliable: boolean;
  distanceMetric?: number;
  rawCategory?: string;
  landmarks?: Landmark3D[];
  handedness?: string;
}

export interface SystemStatus {
  cameraReady: boolean;
  modelLoading: boolean;
  modelReady: boolean;
  modelError: string | null;
  cameraError: string | null;
  handDetected: boolean;
  speechReady: boolean;
  activeMode: 'instant' | 'custom';
  fps: number;
}

export interface AppSettings {
  autoSpeak: boolean;
  autoAddToSentence: boolean;
  language: SupportedLanguage;
  speechRate: number;
  speechPitch: number;
  preferredVoice: string;
  kNeighbors: number;
  customThreshold: number; // Max distance to accept
  stabilityFrames: number; // consecutive stable frames
  cooldownMs: number; // speech & auto-add cooldown
  mirroredCamera: boolean;
}

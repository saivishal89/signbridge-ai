import { CustomVocabularyEntry, AppSettings } from '../types/gesture';

const VOCAB_STORAGE_KEY = 'signbridge_custom_vocabulary_v1';
const SETTINGS_STORAGE_KEY = 'signbridge_settings_v1';
const PHRASE_MAPPINGS_KEY = 'signbridge_phrase_mappings_v1';

export const STARTER_CUSTOM_VOCABULARY: CustomVocabularyEntry[] = [
  {
    id: 'vocab-water',
    name: 'Water',
    description: 'W sign or hand tapping chin',
    translations: {
      en: 'I need drinking water, please.',
      hi: 'मुझे पीने का पानी चाहिए, कृपया।',
      te: 'నాకు త్రాగునీరు కావాలి, దయచేసి.'
    },
    samples: [],
    createdAt: Date.now() - 300000,
    updatedAt: Date.now() - 300000
  },
  {
    id: 'vocab-help',
    name: 'Need Help',
    description: 'Closed fist on open palm',
    translations: {
      en: 'I need immediate assistance.',
      hi: 'मुझे तत्काल सहायता की आवश्यकता है।',
      te: 'నాకు తక్షణ సహాయం కావాలి.'
    },
    samples: [],
    createdAt: Date.now() - 250000,
    updatedAt: Date.now() - 250000
  },
  {
    id: 'vocab-medicine',
    name: 'Medicine',
    description: 'Middle finger stirring or pill motion',
    translations: {
      en: 'Please bring my medicine.',
      hi: 'कृपया मेरी दवाई ले आइए।',
      te: 'దయచేసి నా మందులు తీసుకురండి.'
    },
    samples: [],
    createdAt: Date.now() - 200000,
    updatedAt: Date.now() - 200000
  },
  {
    id: 'vocab-food',
    name: 'Food / Hunger',
    description: 'Fingers to mouth eating sign',
    translations: {
      en: 'I am hungry, I need food.',
      hi: 'मुझे भूख लगी है, मुझे भोजन चाहिए।',
      te: 'నాకు ఆకలిగా ఉంది, నాకు ఆహారం కావాలి.'
    },
    samples: [],
    createdAt: Date.now() - 150000,
    updatedAt: Date.now() - 150000
  },
  {
    id: 'vocab-doctor',
    name: 'Doctor / Nurse',
    description: 'Tapping wrist pulse or index touch',
    translations: {
      en: 'Please call a doctor or nurse.',
      hi: 'कृपया डॉक्टर या नर्स को बुलाएं।',
      te: 'దయచేసి డాక్టర్ లేదా నర్స్‌ను పిలవండి.'
    },
    samples: [],
    createdAt: Date.now() - 120000,
    updatedAt: Date.now() - 120000
  },
  {
    id: 'vocab-washroom',
    name: 'Washroom / Toilet',
    description: 'T-sign shaken gently or fist to shoulder',
    translations: {
      en: 'I need to use the washroom.',
      hi: 'मुझे शौचालय जाना है।',
      te: 'నేను వాష్‌రూమ్‌కి వెళ్లాలి.'
    },
    samples: [],
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 100000
  },
  {
    id: 'vocab-pain',
    name: 'Pain / Hurt',
    description: 'Index fingers pointing together shaking',
    translations: {
      en: 'I am experiencing sharp pain.',
      hi: 'मुझे बहुत दर्द हो रहा है।',
      te: 'నాకు తీవ్రమైన నొప్పిగా ఉంది.'
    },
    samples: [],
    createdAt: Date.now() - 80000,
    updatedAt: Date.now() - 80000
  },
  {
    id: 'vocab-emergency',
    name: 'Emergency / Urgent',
    description: 'Waving open fist repeatedly',
    translations: {
      en: 'This is an urgent emergency!',
      hi: 'यह एक बहुत ज़रूरी आपातकालीन स्थिति है!',
      te: 'ఇది చాలా అత్యవసర పరిస్థితి!'
    },
    samples: [],
    createdAt: Date.now() - 60000,
    updatedAt: Date.now() - 60000
  },
  {
    id: 'vocab-family',
    name: 'Family / Home',
    description: 'Fingers curved touching or roof shape',
    translations: {
      en: 'I want to reach my family.',
      hi: 'मुझे अपने परिवार से संपर्क करना है।',
      te: 'నేను నా కుటుంబాన్ని చేరుకోవాలి.'
    },
    samples: [],
    createdAt: Date.now() - 40000,
    updatedAt: Date.now() - 40000
  },
  {
    id: 'vocab-thanks',
    name: 'Thank You',
    description: 'Flat hand moving forward from chin',
    translations: {
      en: 'Thank you very much for your help.',
      hi: 'आपकी सहायता के लिए बहुत-बहुत धन्यवाद।',
      te: 'మీ సహాయానికి చాలా ధన్యవాదాలు.'
    },
    samples: [],
    createdAt: Date.now() - 20000,
    updatedAt: Date.now() - 20000
  }
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  autoSpeak: true,
  autoAddToSentence: false,
  language: 'en',
  speechRate: 1.0,
  speechPitch: 1.0,
  preferredVoice: '',
  kNeighbors: 3,
  customThreshold: 1.5,
  stabilityFrames: 6, // ~200ms of stable gesture
  cooldownMs: 1400, // min delay before repeating same gesture
  mirroredCamera: true
};

export function loadSavedVocabulary(): CustomVocabularyEntry[] {
  try {
    const raw = localStorage.getItem(VOCAB_STORAGE_KEY);
    if (!raw) return STARTER_CUSTOM_VOCABULARY;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return STARTER_CUSTOM_VOCABULARY;
  } catch (err) {
    console.warn('Failed to load custom vocabulary from localStorage', err);
    return STARTER_CUSTOM_VOCABULARY;
  }
}

export function saveVocabulary(entries: CustomVocabularyEntry[]): void {
  try {
    localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save vocabulary to localStorage', err);
  }
}

export function loadSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_APP_SETTINGS;
    return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

export function exportVocabularyToJson(entries: CustomVocabularyEntry[]): string {
  const exportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    generator: 'SignBridge AI Custom Vocabulary Studio',
    entries
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function importVocabularyFromJson(jsonString: string): {
  success: boolean;
  entries?: CustomVocabularyEntry[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    const candidateEntries = Array.isArray(parsed) ? parsed : parsed.entries;

    if (!Array.isArray(candidateEntries)) {
      return { success: false, error: 'Invalid JSON format: missing entries list' };
    }

    const validated: CustomVocabularyEntry[] = candidateEntries.map((e, idx) => ({
      id: typeof e.id === 'string' ? e.id : `imported-${Date.now()}-${idx}`,
      name: typeof e.name === 'string' ? e.name : `Custom Sign ${idx + 1}`,
      description: typeof e.description === 'string' ? e.description : '',
      translations: {
        en: e.translations?.en || e.name || 'Custom gesture',
        hi: e.translations?.hi || '',
        te: e.translations?.te || ''
      },
      samples: Array.isArray(e.samples)
        ? e.samples.filter((s: any) => Array.isArray(s.features) && s.features.length === 63)
        : [],
      createdAt: typeof e.createdAt === 'number' ? e.createdAt : Date.now(),
      updatedAt: typeof e.updatedAt === 'number' ? e.updatedAt : Date.now()
    }));

    return { success: true, entries: validated };
  } catch (err: any) {
    return { success: false, error: err.message || 'JSON parsing failed' };
  }
}

export function clearAllStorage(): void {
  try {
    localStorage.removeItem(VOCAB_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(PHRASE_MAPPINGS_KEY);
  } catch (e) {
    console.error('Failed to clear localStorage', e);
  }
}

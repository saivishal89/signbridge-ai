import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { CameraStudio } from './components/CameraStudio';
import { DualOutputDisplay } from './components/DualOutputDisplay';
import { InstantDemoPanel } from './components/InstantDemoPanel';
import { CustomSignStudio } from './components/CustomSignStudio';
import { SentenceBuilder } from './components/SentenceBuilder';
import { HowItWorksModal } from './components/HowItWorksModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import {
  AppSettings,
  CustomVocabularyEntry,
  DEFAULT_GESTURE_MAPPINGS,
  GesturePhraseMapping,
  Landmark3D,
  PretrainedGestureName,
  RecognitionResult,
  SupportedLanguage,
  SystemStatus
} from './types/gesture';
import {
  loadSavedSettings,
  loadSavedVocabulary,
  saveSettings,
  saveVocabulary,
  STARTER_CUSTOM_VOCABULARY
} from './services/storageService';
import { speechService } from './services/speechService';
import { classifyHandFeatures, extractNormalizedFeatures } from './services/knnClassifier';
import { detectGeometricGesture } from './services/geometricGestureDetector';

export const App: React.FC = () => {
  // App persistent states
  const [settings, setSettings] = useState<AppSettings>(() => loadSavedSettings());
  const [vocabulary, setVocabulary] = useState<CustomVocabularyEntry[]>(() => loadSavedVocabulary());
  const [gestureMappings, setGestureMappings] = useState<GesturePhraseMapping[]>(DEFAULT_GESTURE_MAPPINGS);

  // Active UI views & modals
  const [activeTab, setActiveTab] = useState<'instant' | 'custom'>('instant');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // System & Camera status
  const [status, setStatus] = useState<SystemStatus>({
    cameraReady: false,
    modelLoading: true,
    modelReady: false,
    modelError: null,
    cameraError: null,
    handDetected: false,
    speechReady: speechService.isSupported(),
    activeMode: 'instant',
    fps: 0
  });

  // Real-time tracking data
  const [currentLandmarks, setCurrentLandmarks] = useState<Landmark3D[] | null>(null);
  const [currentPrediction, setCurrentPrediction] = useState<RecognitionResult | null>(null);
  const [lastRecognizedResult, setLastRecognizedResult] = useState<RecognitionResult | null>(null);
  const [sentence, setSentence] = useState<string>('');

  // Temporal smoothing refs
  const predictionHistory = useRef<{ label: string; text: string; source: 'pretrained' | 'custom' | 'none' }[]>([]);
  const lastSpokenGesture = useRef<{ label: string; time: number }>({ label: '', time: 0 });
  const lastSentenceAppended = useRef<string>('');

  // Check speech synthesis support on mount
  useEffect(() => {
    setStatus((prev) => ({ ...prev, speechReady: speechService.isSupported() }));
  }, []);

  // Save settings when modified
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Save vocabulary when modified
  const updateVocabulary = (newVocab: CustomVocabularyEntry[]) => {
    setVocabulary(newVocab);
    saveVocabulary(newVocab);
  };

  // Update status safely
  const handleStatusChange = useCallback((update: Partial<SystemStatus>) => {
    setStatus((prev) => ({ ...prev, ...update }));
  }, []);

  // Update gesture phrase mapping
  const handleUpdateMapping = (
    category: PretrainedGestureName,
    lang: SupportedLanguage,
    newText: string
  ) => {
    const updated = gestureMappings.map((m) => {
      if (m.category === category) {
        return {
          ...m,
          translations: {
            ...m.translations,
            [lang]: newText
          }
        };
      }
      return m;
    });
    setGestureMappings(updated);
  };

  // Process live camera detection frames
  const handleLandmarksDetected = useCallback(
    (landmarks: Landmark3D[] | null, rawResult: any) => {
      setCurrentLandmarks(landmarks);

      if (!landmarks) {
        predictionHistory.current = [];
        setCurrentPrediction(null);
        return;
      }

      let candidatePrediction: RecognitionResult | null = null;

      // MODE 1: INSTANT DEMO MODE
      if (activeTab === 'instant') {
        if (
          rawResult &&
          rawResult.gestures &&
          rawResult.gestures.length > 0 &&
          rawResult.gestures[0].length > 0
        ) {
          const topGesture = rawResult.gestures[0][0];
          const category = topGesture.categoryName as PretrainedGestureName;
          const score = topGesture.score;

          if (category && category !== 'None' && score >= 0.55) {
            const mapping = gestureMappings.find((m) => m.category === category);
            const translatedText = mapping ? mapping.translations[settings.language] : category;

            candidatePrediction = {
              source: 'pretrained',
              label: mapping ? mapping.displayName : category,
              translatedText,
              confidence: score,
              isReliable: score >= 0.65,
              rawCategory: category,
              landmarks
            };
          } else {
            // Check secondary geometric landmark analyzer for extended hand signs (👌, 🤙, 🤘, 3️⃣, 4️⃣, 🤏)
            const geoResult = detectGeometricGesture(landmarks);
            if (geoResult.category && geoResult.confidence >= 0.75) {
              const mapping = gestureMappings.find((m) => m.category === geoResult.category);
              if (mapping) {
                candidatePrediction = {
                  source: 'pretrained',
                  label: mapping.displayName,
                  translatedText: mapping.translations[settings.language],
                  confidence: geoResult.confidence,
                  isReliable: true,
                  rawCategory: geoResult.category,
                  landmarks
                };
              }
            }

            if (!candidatePrediction) {
              // Hand is visible, but gesture is unsupported or uncertain
              candidatePrediction = {
                source: 'none',
                label: 'Sign not recognized',
                translatedText: '',
                confidence: score,
                isReliable: false,
                rawCategory: 'None',
                landmarks
              };
            }
          }
        } else {
          // Check geometric detector if MediaPipe returned empty gesture array
          const geoResult = detectGeometricGesture(landmarks);
          if (geoResult.category && geoResult.confidence >= 0.75) {
            const mapping = gestureMappings.find((m) => m.category === geoResult.category);
            if (mapping) {
              candidatePrediction = {
                source: 'pretrained',
                label: mapping.displayName,
                translatedText: mapping.translations[settings.language],
                confidence: geoResult.confidence,
                isReliable: true,
                rawCategory: geoResult.category,
                landmarks
              };
            }
          }
        }
      }

      // MODE 2: CUSTOM SIGN STUDIO
      else if (activeTab === 'custom') {
        const features = extractNormalizedFeatures(landmarks);
        if (features) {
          const knn = classifyHandFeatures(
            features,
            vocabulary,
            settings.kNeighbors,
            settings.customThreshold
          );

          if (knn.matchedEntry && knn.isReliable) {
            const entry = knn.matchedEntry;
            const translatedText =
              entry.translations[settings.language] || entry.translations.en;

            candidatePrediction = {
              source: 'custom',
              label: entry.name,
              translatedText,
              confidence: knn.confidence,
              isReliable: true,
              distanceMetric: knn.minDistance,
              landmarks
            };
          } else {
            candidatePrediction = {
              source: 'none',
              label: 'Sign not recognized',
              translatedText: '',
              confidence: knn.confidence,
              isReliable: false,
              distanceMetric: knn.minDistance,
              landmarks
            };
          }
        }
      }

      // Apply Temporal Smoothing & Majority Voting for accepted predictions
      if (candidatePrediction && candidatePrediction.isReliable && candidatePrediction.translatedText) {
        predictionHistory.current.push({
          label: candidatePrediction.label,
          text: candidatePrediction.translatedText,
          source: candidatePrediction.source
        });

        // Limit history to window size
        const windowSize = settings.stabilityFrames || 6;
        if (predictionHistory.current.length > windowSize) {
          predictionHistory.current.shift();
        }

        // Count occurrences in history
        const counts: Record<string, number> = {};
        for (const item of predictionHistory.current) {
          counts[item.label] = (counts[item.label] || 0) + 1;
        }

        const majorityThreshold = Math.ceil(windowSize * 0.65);
        let stableLabel = '';
        for (const [lbl, count] of Object.entries(counts)) {
          if (count >= majorityThreshold) {
            stableLabel = lbl;
            break;
          }
        }

        if (stableLabel === candidatePrediction.label) {
          setCurrentPrediction(candidatePrediction);
          setLastRecognizedResult(candidatePrediction); // Permanently retain for text + voice replay!

          const now = Date.now();
          const isSameAsLast = lastSpokenGesture.current.label === stableLabel;
          const timeSinceLast = now - lastSpokenGesture.current.time;

          // Trigger speech if auto-speak is enabled & cooldown passed
          if (!isSameAsLast || timeSinceLast >= settings.cooldownMs) {
            lastSpokenGesture.current = { label: stableLabel, time: now };

            if (settings.autoSpeak) {
              speechService.speak(candidatePrediction.translatedText, {
                lang: settings.language,
                rate: settings.speechRate,
                pitch: settings.speechPitch,
                preferredVoiceUri: settings.preferredVoice,
                cooldownMs: settings.cooldownMs
              });
            }

            // Auto-append to sentence if enabled
            if (settings.autoAddToSentence) {
              if (lastSentenceAppended.current !== candidatePrediction.translatedText) {
                lastSentenceAppended.current = candidatePrediction.translatedText;
                setSentence((prev) => {
                  const separator = prev.trim().length > 0 ? ' ' : '';
                  return prev + separator + candidatePrediction!.translatedText;
                });
              }
            }
          }
        }
      } else {
        // Uncertain or unconfident gesture
        if (candidatePrediction && candidatePrediction.source === 'none') {
          setCurrentPrediction(candidatePrediction);
        }
        if (predictionHistory.current.length > 0) {
          predictionHistory.current.shift();
        }
      }
    },
    [activeTab, gestureMappings, settings, vocabulary]
  );

  // Manual Speak Trigger (Speaks through real device speakers)
  const handleSpeakText = (text: string) => {
    speechService.speak(text, {
      lang: settings.language,
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      preferredVoiceUri: settings.preferredVoice,
      force: true
    });
  };

  // Add text to sentence strip
  const handleAddToSentence = (text: string) => {
    if (!text.trim()) return;
    setSentence((prev) => {
      const separator = prev.trim().length > 0 ? ' ' : '';
      return prev + separator + text.trim();
    });
  };

  return (
    <div className="app-container">
      {/* Top Application Header */}
      <Header
        status={{ ...status, activeMode: activeTab }}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          predictionHistory.current = [];
          setCurrentPrediction(null);
        }}
        language={settings.language}
        onLanguageChange={(lang) => updateSettings({ ...settings, language: lang })}
        autoSpeak={settings.autoSpeak}
        onToggleAutoSpeak={() => updateSettings({ ...settings, autoSpeak: !settings.autoSpeak })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* DUAL OUTPUT SHOWCASE: Both Text Output & Audible Voice Output */}
      <DualOutputDisplay
        currentPrediction={currentPrediction}
        lastRecognizedResult={lastRecognizedResult}
        language={settings.language}
        autoSpeak={settings.autoSpeak}
        handDetected={status.handDetected}
        cameraReady={status.cameraReady}
        onSpeakText={handleSpeakText}
        onAddToSentence={handleAddToSentence}
        onStopSpeech={() => speechService.stop()}
      />

      {/* Main Studio Grid: Camera Viewport on left, Mode Panels on right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1.25fr) minmax(360px, 1.45fr)',
          gap: '1.25rem',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Live Camera & Landmark Overlay */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <CameraStudio
            status={status}
            mirrored={settings.mirroredCamera}
            onToggleMirror={() =>
              updateSettings({ ...settings, mirroredCamera: !settings.mirroredCamera })
            }
            onLandmarksDetected={handleLandmarksDetected}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Right Column: Active Recognition Mode (Instant vs Custom) */}
        <div>
          {activeTab === 'instant' ? (
            <InstantDemoPanel
              currentPrediction={currentPrediction}
              mappings={gestureMappings}
              language={settings.language}
              onUpdateMapping={handleUpdateMapping}
              onSpeakText={handleSpeakText}
              onAddToSentence={handleAddToSentence}
            />
          ) : (
            <CustomSignStudio
              vocabulary={vocabulary}
              currentLandmarks={currentLandmarks}
              currentPrediction={currentPrediction}
              language={settings.language}
              kNeighbors={settings.kNeighbors}
              customThreshold={settings.customThreshold}
              onUpdateKNeighbors={(k) => updateSettings({ ...settings, kNeighbors: k })}
              onUpdateThreshold={(t) => updateSettings({ ...settings, customThreshold: t })}
              onSaveVocabulary={updateVocabulary}
              onSpeakText={handleSpeakText}
              onAddToSentence={handleAddToSentence}
            />
          )}
        </div>
      </div>

      {/* Dedicated Sentence Construction Panel */}
      <SentenceBuilder
        sentence={sentence}
        onUpdateSentence={setSentence}
        onSpeakSentence={(txt) => handleSpeakText(txt)}
        onStopSpeech={() => speechService.stop()}
        autoAdd={settings.autoAddToSentence}
        onToggleAutoAdd={() =>
          updateSettings({ ...settings, autoAddToSentence: !settings.autoAddToSentence })
        }
        language={settings.language}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={updateSettings}
        onResetAllData={() => {
          setVocabulary(STARTER_CUSTOM_VOCABULARY);
          setGestureMappings(DEFAULT_GESTURE_MAPPINGS);
          setLastRecognizedResult(null);
        }}
      />

      {/* How It Works & Pitch Modal */}
      <HowItWorksModal isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />

      {/* First Time Onboarding Modal */}
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
};

export default App;

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Video,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sliders,
  Volume2,
  Sparkles,
  Play,
  RotateCcw,
  Layers,
  Database
} from 'lucide-react';
import {
  CustomVocabularyEntry,
  Landmark3D,
  RecognitionResult,
  SupportedLanguage,
  TrainingSample
} from '../types/gesture';
import { extractNormalizedFeatures } from '../services/knnClassifier';
import {
  exportVocabularyToJson,
  importVocabularyFromJson,
  STARTER_CUSTOM_VOCABULARY
} from '../services/storageService';

interface CustomSignStudioProps {
  vocabulary: CustomVocabularyEntry[];
  currentLandmarks: Landmark3D[] | null;
  currentPrediction: RecognitionResult | null;
  language: SupportedLanguage;
  kNeighbors: number;
  customThreshold: number;
  onUpdateKNeighbors: (k: number) => void;
  onUpdateThreshold: (threshold: number) => void;
  onSaveVocabulary: (entries: CustomVocabularyEntry[]) => void;
  onSpeakText: (text: string) => void;
  onAddToSentence: (text: string) => void;
}

export const CustomSignStudio: React.FC<CustomSignStudioProps> = ({
  vocabulary,
  currentLandmarks,
  currentPrediction,
  language,
  kNeighbors,
  customThreshold,
  onUpdateKNeighbors,
  onUpdateThreshold,
  onSaveVocabulary,
  onSpeakText,
  onAddToSentence
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingEntryId, setRecordingEntryId] = useState<string | null>(null);
  const [recordedFramesCount, setRecordedFramesCount] = useState<number>(0);
  const targetFrames = 25; // 25 frames captured in a burst (~1-1.5 sec)

  // New entry modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newSignName, setNewSignName] = useState<string>('');
  const [newEnglishPhrase, setNewEnglishPhrase] = useState<string>('');
  const [newHindiPhrase, setNewHindiPhrase] = useState<string>('');
  const [newTeluguPhrase, setNewTeluguPhrase] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');

  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active testing prediction
  const activeCustomMatch =
    currentPrediction?.source === 'custom' ? currentPrediction.label : null;

  // Recording loop effect
  useEffect(() => {
    let timer: any;

    if (isRecording && recordingEntryId && currentLandmarks) {
      const features = extractNormalizedFeatures(currentLandmarks);
      if (features) {
        const newSample: TrainingSample = {
          id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          features,
          timestamp: Date.now()
        };

        const updated = vocabulary.map((entry) => {
          if (entry.id === recordingEntryId) {
            return {
              ...entry,
              samples: [...entry.samples, newSample],
              updatedAt: Date.now()
            };
          }
          return entry;
        });

        onSaveVocabulary(updated);
        setRecordedFramesCount((prev) => {
          const nextCount = prev + 1;
          if (nextCount >= targetFrames) {
            setIsRecording(false);
            setRecordingEntryId(null);
          }
          return nextCount;
        });
      }
    }

    return () => clearTimeout(timer);
  }, [isRecording, recordingEntryId, currentLandmarks]);

  const startBurstRecording = (entryId: string) => {
    if (!currentLandmarks) {
      alert('Please place your hand in front of the camera first so landmarks are tracked.');
      return;
    }
    setRecordingEntryId(entryId);
    setRecordedFramesCount(0);
    setIsRecording(true);
  };

  const handleCreateNewSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSignName.trim() || !newEnglishPhrase.trim()) {
      alert('Please provide a sign name and at least an English phrase.');
      return;
    }

    const newEntry: CustomVocabularyEntry = {
      id: `custom-sign-${Date.now()}`,
      name: newSignName.trim(),
      description: newDescription.trim() || 'Custom recorded gesture',
      translations: {
        en: newEnglishPhrase.trim(),
        hi: newHindiPhrase.trim() || newEnglishPhrase.trim(),
        te: newTeluguPhrase.trim() || newEnglishPhrase.trim()
      },
      samples: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onSaveVocabulary([...vocabulary, newEntry]);
    setShowAddModal(false);
    setNewSignName('');
    setNewEnglishPhrase('');
    setNewHindiPhrase('');
    setNewTeluguPhrase('');
    setNewDescription('');
  };

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this custom sign and its recorded samples?')) {
      const filtered = vocabulary.filter((e) => e.id !== entryId);
      onSaveVocabulary(filtered);
    }
  };

  const handleClearSamples = (entryId: string) => {
    const updated = vocabulary.map((e) => (e.id === entryId ? { ...e, samples: [] } : e));
    onSaveVocabulary(updated);
  };

  const handleExportJson = () => {
    const jsonStr = exportVocabularyToJson(vocabulary);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signbridge-vocabulary-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const res = importVocabularyFromJson(content);
        if (res.success && res.entries) {
          onSaveVocabulary(res.entries);
          alert(`Successfully imported ${res.entries.length} custom vocabulary entries!`);
        } else {
          setImportError(res.error || 'Failed to import JSON file');
        }
      } catch (err: any) {
        setImportError(err.message || 'File read error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset custom vocabulary to starter template? (This will clear unsaved samples)')) {
      onSaveVocabulary(STARTER_CUSTOM_VOCABULARY);
    }
  };

  const totalTrainedSigns = vocabulary.filter((v) => v.samples.length >= 3).length;
  const totalSamplesCount = vocabulary.reduce((acc, curr) => acc + curr.samples.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner & Active Custom Prediction Card */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          background: activeCustomMatch
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(15, 23, 42, 0.9))'
            : 'rgba(15, 23, 42, 0.75)',
          border: activeCustomMatch
            ? '1px solid rgba(16, 185, 129, 0.45)'
            : '1px solid rgba(148, 163, 184, 0.15)',
          boxShadow: activeCustomMatch ? '0 0 30px rgba(16, 185, 129, 0.25)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-live" style={{ fontSize: '0.75rem' }}>
              CUSTOM KNN CLASSIFIER
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Normalized Euclidean Metric ({kNeighbors} Neighbors)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Ready Signs: <strong style={{ color: '#10b981' }}>{totalTrainedSigns}</strong> / {vocabulary.length}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Total Samples: <strong style={{ color: '#06b6d4' }}>{totalSamplesCount}</strong>
            </span>
          </div>
        </div>

        {activeCustomMatch && currentPrediction ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                justifyContent: 'space-between',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>
                  Matched Custom Sign: {currentPrediction.label}
                </div>
                <div
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    marginTop: '0.2rem'
                  }}
                >
                  "{currentPrediction.translatedText}"
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Distance Metric: {currentPrediction.distanceMetric?.toFixed(2)} (Threshold: {customThreshold.toFixed(2)})
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => onSpeakText(currentPrediction.translatedText)}
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1rem' }}
                >
                  <Volume2 size={16} />
                  <span>Speak</span>
                </button>
                <button
                  onClick={() => onAddToSentence(currentPrediction.translatedText)}
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 1rem' }}
                >
                  <Plus size={16} />
                  <span>Add to Sentence</span>
                </button>
              </div>
            </div>

            {/* Match Confidence meter */}
            <div
              style={{
                width: '100%',
                height: '6px',
                background: 'rgba(148, 163, 184, 0.15)',
                borderRadius: '3px',
                marginTop: '1rem',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${Math.round(currentPrediction.confidence * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  borderRadius: '3px',
                  transition: 'width 0.2s ease'
                }}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '1rem 0',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '0.9rem'
            }}
          >
            {totalTrainedSigns === 0 ? (
              <p>
                No custom signs have samples yet. Click{' '}
                <strong style={{ color: '#06b6d4' }}>"Record Samples"</strong> on any sign below while holding your hand in front of the camera.
              </p>
            ) : (
              <p>
                Hold a trained custom hand sign steadily to test live KNN recognition and speech output.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recording in Progress Indicator */}
      {isRecording && (
        <div
          className="glass-panel"
          style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              className="animate-ping-slow"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ef4444'
              }}
            />
            <div>
              <strong style={{ color: '#fca5a5', fontSize: '0.92rem' }}>
                Recording Landmark Samples... Hold pose steady!
              </strong>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                Captured: {recordedFramesCount} / {targetFrames} frames
              </div>
            </div>
          </div>

          <div style={{ width: '150px' }}>
            <div
              style={{
                width: '100%',
                height: '8px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${(recordedFramesCount / targetFrames) * 100}%`,
                  height: '100%',
                  background: '#ef4444',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Studio Header & Action Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
            Custom Vocabulary Registry
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Record personal gestures (e.g. Water, Medicine, Help) with 3D landmark feature normalization.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
          >
            <Plus size={16} />
            <span>Add New Sign</span>
          </button>

          <button
            onClick={handleExportJson}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
            title="Download training samples as JSON"
          >
            <Download size={15} />
            <span>Export JSON</span>
          </button>

          <label
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem', cursor: 'pointer' }}
            title="Upload saved vocabulary JSON"
          >
            <Upload size={15} />
            <span>Import JSON</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJson}
              style={{ display: 'none' }}
            />
          </label>

          <button
            onClick={handleResetToDefaults}
            className="btn btn-ghost"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            title="Reset to default starter list"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {importError && (
        <div
          style={{
            padding: '0.65rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '0.5rem',
            color: '#fca5a5',
            fontSize: '0.82rem'
          }}
        >
          {importError}
        </div>
      )}

      {/* KNN Classifier Parameters Tuning Strip */}
      <div
        className="glass-panel"
        style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94a3b8' }}>
          <Sliders size={15} color="#06b6d4" />
          <strong style={{ color: '#f8fafc' }}>KNN Classifier Parameters:</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* K Neighbors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#94a3b8' }}>K Neighbors:</span>
            <select
              value={kNeighbors}
              onChange={(e) => onUpdateKNeighbors(Number(e.target.value))}
              style={{
                background: '#090d16',
                color: '#fff',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '0.35rem',
                padding: '0.2rem 0.5rem',
                fontSize: '0.8rem'
              }}
            >
              <option value={1}>1 (Fastest)</option>
              <option value={3}>3 (Recommended)</option>
              <option value={5}>5 (Robust)</option>
              <option value={7}>7</option>
            </select>
          </div>

          {/* Max Distance Threshold */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#94a3b8' }}>Rejection Distance Threshold:</span>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.1"
              value={customThreshold}
              onChange={(e) => onUpdateThreshold(parseFloat(e.target.value))}
              style={{ width: '100px', cursor: 'pointer' }}
            />
            <span style={{ color: '#06b6d4', fontWeight: 600 }}>{customThreshold.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem'
        }}
      >
        {vocabulary.map((entry) => {
          const sampleCount = entry.samples.length;
          const isTrained = sampleCount >= 3;
          const isMatching = activeCustomMatch === entry.name;
          const currentPhrase = entry.translations[language] || entry.translations.en;

          return (
            <div
              key={entry.id}
              className={`glass-panel ${isMatching ? 'glass-panel-active' : ''}`}
              style={{
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.85rem',
                border: isMatching
                  ? '1px solid #10b981'
                  : '1px solid rgba(148, 163, 184, 0.12)',
                boxShadow: isMatching ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
                      {entry.name}
                    </h4>
                    {entry.description && (
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.15rem 0' }}>
                        {entry.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={`badge ${isTrained ? 'badge-live' : 'badge-warning'}`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {isTrained ? `${sampleCount} Samples (Ready)` : `${sampleCount}/3 (Need Samples)`}
                  </span>
                </div>

                {/* Phrase Output Preview */}
                <div
                  style={{
                    margin: '0.65rem 0',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(148, 163, 184, 0.1)'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
                    Spoken Output ({language}):
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500 }}>
                    "{currentPhrase}"
                  </div>
                </div>
              </div>

              {/* Card Action Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid rgba(148, 163, 184, 0.08)'
                }}
              >
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {/* Record Samples Button */}
                  <button
                    onClick={() => startBurstRecording(entry.id)}
                    disabled={isRecording}
                    className="btn btn-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    title="Hold hand pose and record 25 frames"
                  >
                    <Video size={13} />
                    <span>{sampleCount > 0 ? '+ Record More' : 'Record Samples'}</span>
                  </button>

                  {sampleCount > 0 && (
                    <button
                      onClick={() => handleClearSamples(entry.id)}
                      className="btn btn-ghost"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}
                      title="Clear recorded samples"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => onSpeakText(currentPhrase)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.55rem' }}
                    title="Test Speech"
                  >
                    <Volume2 size={13} />
                  </button>

                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="btn btn-ghost"
                    style={{ padding: '0.35rem 0.55rem', color: '#f43f5e' }}
                    title="Delete Entry"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Custom Sign Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '1.5rem',
              background: '#0f172a',
              border: '1px solid rgba(6, 182, 212, 0.35)'
            }}
          >
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
              Add New Custom Vocabulary Sign
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Define a new sign name and its spoken translations in English, Hindi, and Telugu.
            </p>

            <form onSubmit={handleCreateNewSign} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                  Sign Name / Concept *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Washroom, Medicine, Pain, Family"
                  value={newSignName}
                  onChange={(e) => setNewSignName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: '#090d16',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                  English Spoken Output *
                </label>
                <input
                  type="text"
                  placeholder="e.g. I need to use the washroom."
                  value={newEnglishPhrase}
                  onChange={(e) => setNewEnglishPhrase(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: '#090d16',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                    Hindi Spoken Output (हिन्दी)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. मुझे शौचालय जाना है।"
                    value={newHindiPhrase}
                    onChange={(e) => setNewHindiPhrase(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#090d16',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      borderRadius: '0.5rem',
                      padding: '0.55rem 0.75rem',
                      color: '#fff',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                    Telugu Spoken Output (తెలుగు)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. నేను వాష్‌రూమ్‌కి వెళ్లాలి."
                    value={newTeluguPhrase}
                    onChange={(e) => setNewTeluguPhrase(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#090d16',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      borderRadius: '0.5rem',
                      padding: '0.55rem 0.75rem',
                      color: '#fff',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                  Hand Pose Notes / Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. T-sign or fist with thumb pointing down"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#090d16',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                  Save Sign Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

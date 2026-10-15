import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  PlusCircle,
  Edit2,
  Check,
  RotateCcw,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  GesturePhraseMapping,
  RecognitionResult,
  SupportedLanguage,
  PretrainedGestureName
} from '../types/gesture';

interface InstantDemoPanelProps {
  currentPrediction: RecognitionResult | null;
  mappings: GesturePhraseMapping[];
  language: SupportedLanguage;
  onUpdateMapping: (category: PretrainedGestureName, lang: SupportedLanguage, newText: string) => void;
  onSpeakText: (text: string) => void;
  onAddToSentence: (text: string) => void;
}

export const InstantDemoPanel: React.FC<InstantDemoPanelProps> = ({
  currentPrediction,
  mappings,
  language,
  onUpdateMapping,
  onSpeakText,
  onAddToSentence
}) => {
  const [editingCategory, setEditingCategory] = useState<PretrainedGestureName | null>(null);
  const [editText, setEditText] = useState<string>('');

  const activeCategory =
    currentPrediction?.source === 'pretrained' ? currentPrediction.rawCategory : null;

  const handleStartEdit = (mapping: GesturePhraseMapping) => {
    setEditingCategory(mapping.category);
    setEditText(mapping.translations[language]);
  };

  const handleSaveEdit = (category: PretrainedGestureName) => {
    if (editText.trim()) {
      onUpdateMapping(category, language, editText.trim());
    }
    setEditingCategory(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Real-time Gesture Prediction Showcase Card */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          background: activeCategory
            ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.9))'
            : 'rgba(15, 23, 42, 0.75)',
          border: activeCategory
            ? '1px solid rgba(6, 182, 212, 0.45)'
            : '1px solid rgba(148, 163, 184, 0.15)',
          boxShadow: activeCategory ? '0 0 30px rgba(6, 182, 212, 0.25)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
              LIVE PREDICTION
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Pretrained Gesture Recognizer
            </span>
          </div>

          {currentPrediction && currentPrediction.source === 'pretrained' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Confidence:</span>
              <strong style={{ color: '#06b6d4', fontSize: '0.9rem' }}>
                {Math.round(currentPrediction.confidence * 100)}%
              </strong>
            </div>
          )}
        </div>

        {currentPrediction && currentPrediction.source === 'pretrained' && currentPrediction.translatedText ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    fontSize: '2.5rem',
                    lineHeight: 1,
                    background: 'rgba(6, 182, 212, 0.12)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                  }}
                >
                  {mappings.find((m) => m.category === activeCategory)?.icon || '✋'}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
                    {currentPrediction.label} ({activeCategory})
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
                </div>
              </div>

              {/* Action Buttons for Accepted Output */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => onSpeakText(currentPrediction.translatedText)}
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1rem' }}
                  title="Speak this phrase aloud now"
                >
                  <Volume2 size={16} />
                  <span>Speak</span>
                </button>
                <button
                  onClick={() => onAddToSentence(currentPrediction.translatedText)}
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 1rem' }}
                  title="Add to communication sentence strip"
                >
                  <PlusCircle size={16} />
                  <span>Add to Sentence</span>
                </button>
              </div>
            </div>

            {/* Confidence Progress Bar */}
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
                  background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                  borderRadius: '3px',
                  transition: 'width 0.2s ease'
                }}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '1.25rem 0',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '0.92rem'
            }}
          >
            <p>
              Show a hand gesture to the camera (e.g.{' '}
              <strong style={{ color: '#06b6d4' }}>Open Palm</strong>,{' '}
              <strong style={{ color: '#06b6d4' }}>Thumbs Up</strong>,{' '}
              <strong style={{ color: '#06b6d4' }}>Victory</strong>) to trigger instant translation.
            </p>
          </div>
        )}
      </div>

      {/* Honest Prototype Notice */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.45)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          fontSize: '0.8rem',
          color: '#cbd5e1'
        }}
      >
        <Info size={18} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#f8fafc' }}>Judge & Audience Note:</strong> These 7 gestures are
          pretrained vision categories mapped to communicative phrases to demonstrate real-time AI
          detection and instant speech synthesis. They are demo shortcuts, not official Indian Sign
          Language (ISL) vocabulary. Use the <strong>Custom Sign Studio</strong> tab to train
          personalized signs!
        </div>
      </div>

      {/* Supported Gestures Grid */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem'
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
            Supported Gestures & Phrase Mappings
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Click text to customize phrases
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.85rem'
          }}
        >
          {mappings.map((mapping) => {
            const isCurrentMatch = activeCategory === mapping.category;
            const isEditing = editingCategory === mapping.category;
            const currentPhrase = mapping.translations[language];

            return (
              <div
                key={mapping.category}
                className={`glass-panel ${isCurrentMatch ? 'glass-panel-active' : ''}`}
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  transition: 'all 0.2s ease',
                  transform: isCurrentMatch ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.65rem' }}>{mapping.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#f8fafc' }}>
                        {mapping.displayName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        ID: {mapping.category}
                      </div>
                    </div>
                  </div>

                  {isCurrentMatch && (
                    <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle size={12} /> ACTIVE
                    </span>
                  )}
                </div>

                {/* Phrase Output or Edit Input */}
                <div style={{ margin: '0.25rem 0' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(mapping.category)}
                        autoFocus
                        style={{
                          flex: 1,
                          background: '#090d16',
                          border: '1px solid #06b6d4',
                          color: '#fff',
                          borderRadius: '0.4rem',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.85rem'
                        }}
                      />
                      <button
                        onClick={() => handleSaveEdit(mapping.category)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.65rem' }}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <p
                      onClick={() => handleStartEdit(mapping)}
                      title="Click to edit phrase"
                      style={{
                        fontSize: '0.88rem',
                        color: isCurrentMatch ? '#38bdf8' : '#e2e8f0',
                        cursor: 'pointer',
                        padding: '0.35rem 0.5rem',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '0.4rem',
                        border: '1px dashed rgba(148, 163, 184, 0.2)',
                        margin: 0
                      }}
                    >
                      "{currentPhrase}"
                    </p>
                  )}
                </div>

                {/* Card Quick Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.4rem',
                    borderTop: '1px solid rgba(148, 163, 184, 0.08)'
                  }}
                >
                  <button
                    onClick={() => handleStartEdit(mapping)}
                    className="btn btn-ghost"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    <Edit2 size={12} /> Edit Phrase
                  </button>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => onSpeakText(currentPhrase)}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                      title="Test speech audio"
                    >
                      <Volume2 size={13} />
                    </button>
                    <button
                      onClick={() => onAddToSentence(currentPhrase)}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                      title="Append to sentence"
                    >
                      <PlusCircle size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

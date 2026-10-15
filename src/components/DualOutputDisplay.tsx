import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  PlusCircle,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  Radio,
  FileText
} from 'lucide-react';
import { RecognitionResult, SupportedLanguage, LANGUAGE_OPTIONS } from '../types/gesture';
import { speechService } from '../services/speechService';

interface DualOutputDisplayProps {
  currentPrediction: RecognitionResult | null;
  lastRecognizedResult: RecognitionResult | null;
  language: SupportedLanguage;
  autoSpeak: boolean;
  handDetected: boolean;
  cameraReady: boolean;
  onSpeakText: (text: string) => void;
  onAddToSentence: (text: string) => void;
  onStopSpeech: () => void;
}

export const DualOutputDisplay: React.FC<DualOutputDisplayProps> = ({
  currentPrediction,
  lastRecognizedResult,
  language,
  autoSpeak,
  handDetected,
  cameraReady,
  onSpeakText,
  onAddToSentence,
  onStopSpeech
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isCurrentlySpeaking, setIsCurrentlySpeaking] = useState<boolean>(false);

  // Determine active display result: prefer live stable prediction, otherwise keep last recognized result visible!
  const displayResult = currentPrediction?.translatedText
    ? currentPrediction
    : lastRecognizedResult?.translatedText
    ? lastRecognizedResult
    : null;

  const isLive = currentPrediction?.translatedText !== undefined && currentPrediction.translatedText.length > 0;
  const isUncertain = handDetected && (!currentPrediction || currentPrediction.source === 'none' || !currentPrediction.isReliable);
  const speechSupported = speechService.isSupported();
  const currentLangMeta = LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];

  const handleSpeak = (text: string) => {
    setIsCurrentlySpeaking(true);
    onSpeakText(text);
    setTimeout(() => setIsCurrentlySpeaking(false), 1600);
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
        background: displayResult
          ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(15, 23, 42, 0.9) 60%, rgba(37, 99, 235, 0.1) 100%)'
          : 'rgba(15, 23, 42, 0.75)',
        border: displayResult
          ? '1px solid rgba(6, 182, 212, 0.4)'
          : '1px solid rgba(148, 163, 184, 0.15)',
        boxShadow: displayResult ? '0 10px 30px -10px rgba(6, 182, 212, 0.3)' : 'none',
        position: 'relative'
      }}
    >
      {/* Top Meta Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginBottom: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            className={`badge ${isLive ? 'badge-live' : displayResult ? 'badge-info' : 'badge-neutral'}`}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.65rem' }}
          >
            {isLive ? '● LIVE RECOGNITION' : displayResult ? 'LAST RECOGNIZED SIGN (HELD)' : 'STANDBY'}
          </span>

          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Target: <strong style={{ color: '#f8fafc' }}>{currentLangMeta.label} ({currentLangMeta.nativeLabel})</strong>
          </span>
        </div>

        {/* Real Speech Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {speechSupported ? (
            <span
              className="badge"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '0.72rem'
              }}
            >
              <Volume2 size={12} />
              Audio Output: Ready (Real Hardware Speaker)
            </span>
          ) : (
            <span
              className="badge"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '0.72rem'
              }}
            >
              <AlertTriangle size={12} />
              TTS Audio Unavailable (Text Only Mode)
            </span>
          )}

          {displayResult && (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Match Confidence: <strong style={{ color: '#06b6d4' }}>{Math.round(displayResult.confidence * 100)}%</strong>
            </span>
          )}
        </div>
      </div>

      {/* Main Dual Output Canvas (Text & Speech in High Prominence) */}
      {displayResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 1. TEXT OUTPUT SECTION */}
          <div
            style={{
              background: 'rgba(9, 13, 22, 0.75)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                <FileText size={14} color="#06b6d4" />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#06b6d4',
                    textTransform: 'uppercase'
                  }}
                >
                  Text Output ({displayResult.label}):
                </span>
              </div>
              <h2
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.3,
                  margin: 0
                }}
              >
                "{displayResult.translatedText}"
              </h2>
            </div>

            <button
              onClick={() => handleCopy(displayResult.translatedText)}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              title="Copy translated text"
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          {/* 2. VOICE OUTPUT SECTION */}
          <div
            style={{
              background: 'rgba(9, 13, 22, 0.75)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '0.75rem',
              padding: '0.9rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: isCurrentlySpeaking
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #2563eb, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isCurrentlySpeaking
                    ? '0 0 16px rgba(16, 185, 129, 0.6)'
                    : '0 0 12px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.25s ease'
                }}
              >
                <Volume2 size={22} color="#ffffff" className={isCurrentlySpeaking ? 'animate-bounce' : ''} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#38bdf8',
                      textTransform: 'uppercase'
                    }}
                  >
                    Voice Output (Audible Audio):
                  </span>
                  {autoSpeak && (
                    <span className="badge badge-live" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      Auto-Spoke on Recognition
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                  {isCurrentlySpeaking ? (
                    <span style={{ color: '#34d399', fontWeight: 600 }}>
                      🔊 Speaking aloud through device speaker...
                    </span>
                  ) : (
                    <span>Real audio utterance synthesized via Web Speech API</span>
                  )}
                </div>
              </div>
            </div>

            {/* Voice Control Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => handleSpeak(displayResult.translatedText)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}
                title="Speak this translation through speakers now"
              >
                <Volume2 size={16} />
                <span>Replay Voice</span>
              </button>

              <button
                onClick={onStopSpeech}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                title="Silence active audio playback"
              >
                <VolumeX size={16} />
                <span>Stop</span>
              </button>

              <button
                onClick={() => onAddToSentence(displayResult.translatedText)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.95rem', fontSize: '0.85rem' }}
                title="Append to continuous sentence builder"
              >
                <PlusCircle size={16} />
                <span>Add to Sentence</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Standby / Guidance State */
        <div
          style={{
            padding: '1.5rem 1rem',
            textAlign: 'center',
            background: 'rgba(9, 13, 22, 0.5)',
            borderRadius: '0.75rem',
            border: '1px dashed rgba(148, 163, 184, 0.2)'
          }}
        >
          {isUncertain ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
                <AlertTriangle size={20} />
                <strong style={{ fontSize: '1rem' }}>Sign not recognized</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', maxWidth: '460px', margin: 0 }}>
                Hand is tracked, but the gesture pose is uncertain. Hold your palm or fingers clearly facing the camera in good lighting.
              </p>
            </div>
          ) : cameraReady ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={24} color="#06b6d4" />
              <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>
                Ready for Hand Signs
              </strong>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '440px', margin: 0 }}>
                Perform any supported hand sign (e.g. ✋ Open Palm, 👍 Thumbs Up, ✌️ Victory) in front of the camera. The AI will output both on-screen text and audible speech simultaneously!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <Radio size={24} color="#64748b" />
              <strong style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                Camera Offline
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Click "Start Camera" to begin real-time sign recognition with instant voice output.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

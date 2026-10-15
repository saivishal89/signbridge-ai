import React, { useState, useEffect } from 'react';
import { X, Settings, Volume2, Sliders, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { AppSettings, SupportedLanguage, LANGUAGE_OPTIONS } from '../types/gesture';
import { speechService } from '../services/speechService';
import { clearAllStorage, DEFAULT_APP_SETTINGS } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetAllData
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setLocalSettings(settings);
    setAvailableVoices(speechService.getVoices());
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleVoiceTest = () => {
    speechService.speak('Testing voice settings for SignBridge AI.', {
      lang: localSettings.language,
      rate: localSettings.speechRate,
      pitch: localSettings.speechPitch,
      preferredVoiceUri: localSettings.preferredVoice,
      force: true
    });
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleResetDefaults = () => {
    setLocalSettings(DEFAULT_APP_SETTINGS);
  };

  const handleClearAllStorage = () => {
    if (confirm('Are you sure you want to delete all saved training samples and custom vocabulary from this browser?')) {
      clearAllStorage();
      onResetAllData();
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
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
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          background: '#0d1322',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem', borderRadius: '50%' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Settings size={22} color="#06b6d4" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            App & Recognition Settings
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Audio & Speech Synthesizer Section */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(148, 163, 184, 0.12)'
            }}
          >
            <h4 style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Volume2 size={16} /> Speech Synthesis (Web Speech API)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Language Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  Primary Language:
                </label>
                <select
                  value={localSettings.language}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, language: e.target.value as SupportedLanguage })
                  }
                  style={{
                    width: '100%',
                    background: '#090d16',
                    color: '#fff',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: '0.45rem',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.85rem'
                  }}
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.label} ({l.nativeLabel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  Browser TTS Voice:
                </label>
                <select
                  value={localSettings.preferredVoice}
                  onChange={(e) => setLocalSettings({ ...localSettings, preferredVoice: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#090d16',
                    color: '#fff',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: '0.45rem',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem'
                  }}
                >
                  <option value="">(Default Auto-Matched Regional Voice)</option>
                  {availableVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speech Rate Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  <span>Speech Speed:</span>
                  <strong style={{ color: '#06b6d4' }}>{localSettings.speechRate}x</strong>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.1"
                  value={localSettings.speechRate}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, speechRate: parseFloat(e.target.value) })
                  }
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleVoiceTest}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                >
                  <Volume2 size={13} />
                  <span>Test Voice Audio</span>
                </button>
              </div>
            </div>
          </div>

          {/* Temporal Stability & Filter Tuning */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(148, 163, 184, 0.12)'
            }}
          >
            <h4 style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sliders size={16} /> Recognition Stability & Anti-Spam Filter
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  <span>Stability Confirmation Window (Frames):</span>
                  <strong style={{ color: '#06b6d4' }}>{localSettings.stabilityFrames} frames (~200ms)</strong>
                </div>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={localSettings.stabilityFrames}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, stabilityFrames: parseInt(e.target.value) })
                  }
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Requires the user to hold the hand pose steadily for N consecutive frames before accepting.
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  <span>Speech Cooldown Interval:</span>
                  <strong style={{ color: '#06b6d4' }}>{localSettings.cooldownMs} ms</strong>
                </div>
                <input
                  type="range"
                  min="600"
                  max="3000"
                  step="100"
                  value={localSettings.cooldownMs}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, cooldownMs: parseInt(e.target.value) })
                  }
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Prevents repeating the spoken utterance while the same gesture remains held.
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone / Local Storage */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fca5a5' }}>
                Reset All Local Data
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Wipes recorded samples & restores original defaults.
              </div>
            </div>
            <button
              onClick={handleClearAllStorage}
              className="btn btn-danger"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
            >
              <Trash2 size={13} />
              <span>Wipe Data</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.15)'
          }}
        >
          <button
            onClick={handleResetDefaults}
            className="btn btn-ghost"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <RotateCcw size={13} /> Restore Defaults
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              <CheckCircle2 size={15} /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

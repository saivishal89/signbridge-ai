import React from 'react';
import {
  Hand,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  Camera,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SystemStatus, SupportedLanguage, LANGUAGE_OPTIONS } from '../types/gesture';

interface HeaderProps {
  status: SystemStatus;
  activeTab: 'instant' | 'custom';
  onTabChange: (tab: 'instant' | 'custom') => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  onOpenSettings: () => void;
  onOpenHowItWorks: () => void;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeTab,
  onTabChange,
  language,
  onLanguageChange,
  autoSpeak,
  onToggleAutoSpeak,
  onOpenSettings,
  onOpenHowItWorks,
  onOpenOnboarding
}) => {
  return (
    <header className="glass-panel" style={{ margin: '0 0 1.25rem 0', padding: '0.85rem 1.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {/* Brand & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)'
            }}
          >
            <Hand size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>
                SignBridge <span style={{ color: '#06b6d4' }}>AI</span>
              </h1>
              <span className="badge badge-info" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                Prototype v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Every gesture deserves to be heard.
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '0.25rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(148, 163, 184, 0.15)'
          }}
        >
          <button
            onClick={() => onTabChange('instant')}
            className={`btn ${activeTab === 'instant' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} />
            <span>Instant Demo Mode</span>
          </button>
          <button
            onClick={() => onTabChange('custom')}
            className={`btn ${activeTab === 'custom' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Layers size={16} />
            <span>Custom Sign Studio</span>
          </button>
        </div>

        {/* Global Controls & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                color: '#f8fafc',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.45rem 0.75rem',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
              title="Select speech & translation language"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code} style={{ background: '#0f172a' }}>
                  {lang.flag} {lang.nativeLabel} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Auto Speak Toggle */}
          <button
            onClick={onToggleAutoSpeak}
            className={`btn ${autoSpeak ? 'btn-success' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            title={autoSpeak ? 'Auto-Speech Enabled: Speaks recognized sign aloud' : 'Auto-Speech Disabled: Click speak manually'}
          >
            {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{autoSpeak ? 'Speech ON' : 'Speech Muted'}</span>
          </button>

          {/* Quick Guide / Help */}
          <button
            onClick={onOpenHowItWorks}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            title="Architecture, Presentation Pitch & Pipeline"
          >
            <HelpCircle size={16} />
            <span>How It Works</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.65rem' }}
            title="Tuning & Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* System Status Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginTop: '0.85rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid rgba(148, 163, 184, 0.08)',
          fontSize: '0.78rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Camera Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Camera size={14} color={status.cameraReady ? '#34d399' : '#94a3b8'} />
            <span style={{ color: status.cameraReady ? '#34d399' : '#94a3b8' }}>
              Camera: {status.cameraReady ? 'Active' : status.cameraError ? 'Error' : 'Standby'}
            </span>
          </div>

          {/* MediaPipe Model Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {status.modelReady ? (
              <CheckCircle2 size={14} color="#38bdf8" />
            ) : status.modelLoading ? (
              <span className="animate-pulse-subtle" style={{ color: '#fbbf24' }}>●</span>
            ) : (
              <AlertCircle size={14} color="#f43f5e" />
            )}
            <span style={{ color: status.modelReady ? '#38bdf8' : status.modelLoading ? '#fbbf24' : '#f43f5e' }}>
              MediaPipe AI: {status.modelReady ? 'Ready (Local/GPU)' : status.modelLoading ? 'Initializing Model...' : 'Error Loading'}
            </span>
          </div>

          {/* Hand Landmark Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: status.handDetected ? '#10b981' : '#64748b',
                boxShadow: status.handDetected ? '0 0 8px #10b981' : 'none'
              }}
            />
            <span style={{ color: status.handDetected ? '#34d399' : '#94a3b8' }}>
              Hand: {status.handDetected ? 'Tracking 21 Landmarks' : 'None Detected'}
            </span>
          </div>

          {status.cameraReady && (
            <span style={{ color: '#64748b' }}>
              Processing: <strong style={{ color: '#94a3b8' }}>{status.fps} FPS</strong>
            </span>
          )}
        </div>

        {/* Privacy badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981' }}>
          <ShieldCheck size={14} />
          <span>100% On-Device In-Browser Processing (No Video Leaves Machine)</span>
        </div>
      </div>
    </header>
  );
};

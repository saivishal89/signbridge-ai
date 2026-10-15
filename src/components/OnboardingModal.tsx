import React from 'react';
import { Sparkles, Camera, Hand, Volume2, Layers, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
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
          maxWidth: '580px',
          padding: '2rem',
          background: '#0d1322',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 0 24px rgba(6, 182, 212, 0.5)'
          }}
        >
          <Hand size={30} color="#ffffff" />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
          Welcome to SignBridge AI
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          Real-time on-device sign detection and speech generation designed for accessibility.
        </p>

        {/* 3 Step Quick Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.85rem',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '0.65rem',
              border: '1px solid rgba(148, 163, 184, 0.12)'
            }}
          >
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06b6d4',
                padding: '0.4rem',
                borderRadius: '0.5rem',
                flexShrink: 0
              }}
            >
              <Camera size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#f8fafc' }}>1. Start Live Camera</strong>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                Click "Start Camera" to grant browser permission. All video remains 100% private on your device.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.85rem',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '0.65rem',
              border: '1px solid rgba(148, 163, 184, 0.12)'
            }}
          >
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '0.4rem',
                borderRadius: '0.5rem',
                flexShrink: 0
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#f8fafc' }}>2. Test Instant Hand Gestures</strong>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                Hold up an Open Palm, Thumbs Up, or Victory sign. Watch the AI recognize it and speak the translation aloud!
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.85rem',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '0.65rem',
              border: '1px solid rgba(148, 163, 184, 0.12)'
            }}
          >
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                padding: '0.4rem',
                borderRadius: '0.5rem',
                flexShrink: 0
              }}
            >
              <Layers size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#f8fafc' }}>3. Train Custom Vocabulary</strong>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                Switch to "Custom Sign Studio" to record custom signs like 'Water' or 'Help' with normalized in-browser KNN learning.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
        >
          <CheckCircle2 size={18} />
          <span>Launch SignBridge AI</span>
        </button>
      </div>
    </div>
  );
};

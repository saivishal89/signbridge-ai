import React, { useState } from 'react';
import {
  X,
  Cpu,
  Layers,
  ShieldCheck,
  Mic,
  Activity,
  CheckCircle2,
  Clock,
  Compass,
  FileText
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'pitch' | 'privacy'>('architecture');

  if (!isOpen) return null;

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
          maxWidth: '820px',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '1.75rem',
          background: '#0d1322',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.4rem',
            borderRadius: '50%'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
            SignBridge AI — System Architecture & Pitch
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
            Real-time hand landmark tracking, translation-invariant feature normalization, and on-device speech synthesis.
          </p>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            paddingBottom: '0.75rem'
          }}
        >
          <button
            onClick={() => setActiveTab('architecture')}
            className={`btn ${activeTab === 'architecture' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
          >
            <Cpu size={16} />
            <span>AI Architecture & Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('pitch')}
            className={`btn ${activeTab === 'pitch' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
          >
            <Clock size={16} />
            <span>60-90s Demo Pitch Script</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`btn ${activeTab === 'privacy' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
          >
            <ShieldCheck size={16} />
            <span>Privacy & Roadmap</span>
          </button>
        </div>

        {/* TAB 1: AI ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Step-by-Step Flow */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.85rem'
              }}
            >
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(148, 163, 184, 0.12)'
                }}
              >
                <div style={{ color: '#06b6d4', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  1. Video Ingestion
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  HTML5 MediaDevices captures 720p/1080p webcam feed with requestAnimationFrame loop.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(148, 163, 184, 0.12)'
                }}
              >
                <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  2. 3D Landmark Tracking
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  MediaPipe Tasks Vision extracts 21 precise 3D hand keypoints on-device with GPU/WebGL acceleration.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(148, 163, 184, 0.12)'
                }}
              >
                <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  3. Feature Normalization
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Translates coords relative to wrist (origin) &amp; normalizes by anatomical palm scale (Middle MCP - Wrist).
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(148, 163, 184, 0.12)'
                }}
              >
                <div style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  4. KNN / Vision Classifier
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Dual engine: Pretrained vision recognizer or custom K-Nearest Neighbors classifier with Euclidean distance thresholding.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(148, 163, 184, 0.12)'
                }}
              >
                <div style={{ color: '#ec4899', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  5. Stability Smoothing
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Temporal majority voting over 6 frames + 1.4s cooldown prevents stuttering and machine-gun audio spam.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(148, 163, 184, 0.12)'
                }}
              >
                <div style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  6. Multilingual Speech
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Web Speech API speaks accepted translations instantly in English, Hindi, or Telugu.
                </p>
              </div>
            </div>

            {/* Normalization Math Explanation */}
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '0.75rem',
                padding: '1.15rem'
              }}
            >
              <h4 style={{ fontSize: '0.95rem', color: '#38bdf8', marginBottom: '0.4rem' }}>
                Why Translation & Scale Invariance Matters in Custom Mode
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                If raw pixel coordinates were used, holding your hand 10 cm further from the webcam would break all recognition. 
                SignBridge AI subtracts the wrist keypoint (x0, y0, z0) from all 21 landmarks, then divides each coordinate by the Euclidean distance between the wrist and the middle finger MCP joint (L9). This produces a robust 63-dimensional feature vector invariant to user distance or camera framing.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: 60-90s DEMO PITCH SCRIPT */}
        {activeTab === 'pitch' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}
            >
              <h4 style={{ fontSize: '0.95rem', color: '#34d399', marginBottom: '0.35rem' }}>
                Winning 60–90 Second Codeathon Live Presentation Script
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                Follow this exact sequence in front of the judges for maximum impact:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '0.5rem' }}>
                <strong style={{ color: '#06b6d4' }}>00:00 - 00:15 | The Hook & Problem</strong>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>
                  "Judges, over 70 million deaf individuals worldwide face daily barriers because 99% of hearing society does not understand sign language. Today we present <strong>SignBridge AI</strong>: <em>Every gesture deserves to be heard</em>."
                </p>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '0.5rem' }}>
                <strong style={{ color: '#06b6d4' }}>00:15 - 00:35 | Live Hand Recognition Demo</strong>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>
                  "Watch my camera. When I raise an Open Palm, the system tracks 21 3D landmarks at 30+ FPS, recognizes the gesture on-device, and speaks: <em>[Audio speaks: 'Hello, how can I help you?']</em>. Now when I give a Thumbs Up: <em>[Audio speaks: 'Yes, absolutely']</em>."
                </p>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '0.5rem' }}>
                <strong style={{ color: '#06b6d4' }}>00:35 - 00:55 | Multilingual Sentence Builder</strong>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>
                  "Users can construct full communicative sentences or switch languages to Hindi or Telugu. Notice how our temporal smoothing filter prevents repeated audio stuttering while a pose is held."
                </p>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '0.5rem' }}>
                <strong style={{ color: '#06b6d4' }}>00:55 - 01:20 | The Game Changer: Custom Sign Studio</strong>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>
                  "Pretrained gestures are only a starting point. In our <strong>Custom Sign Studio</strong>, anyone can record samples of personal signs—like 'Water' or 'Medicine'. Our in-browser KNN classifier normalizes wrist and palm dimensions, allowing personalized sign recognition with 100% data privacy."
                </p>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '0.5rem' }}>
                <strong style={{ color: '#06b6d4' }}>01:20 - 01:30 | Technical Honesty & Next Steps</strong>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>
                  "All processing happens client-side without costly server APIs. With a validated ISL dataset and temporal LSTM sequence modeling, SignBridge AI can bridge communication for millions."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRIVACY & ROADMAP */}
        {activeTab === 'privacy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '1.25rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(148, 163, 184, 0.15)'
              }}
            >
              <h4 style={{ fontSize: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> Zero-Knowledge Privacy Architecture
              </h4>
              <ul style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                <li>Webcam video frames never leave your local browser memory.</li>
                <li>No images or video recordings are transmitted to any cloud server or telemetry backend.</li>
                <li>Custom recorded training data is persisted locally in browser localStorage or exported explicitly by you as JSON.</li>
                <li>Zero paid API keys or cloud subscriptions needed.</li>
              </ul>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '1.25rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(148, 163, 184, 0.15)'
              }}
            >
              <h4 style={{ fontSize: '1rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={18} /> Technical Honesty & Production Roadmap
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, marginTop: '0.5rem' }}>
                Sign language is not merely static hand poses; authentic Indian Sign Language (ISL) involves facial expressions, two-handed movement, and temporal motion trajectories.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem' }}>
                  <strong style={{ color: '#fbbf24', fontSize: '0.82rem' }}>Current Prototype (v1.0):</strong>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                    Single-hand static pose recognition, normalized 63D KNN classification, instant speech synthesis, custom vocabulary bursts.
                  </p>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem' }}>
                  <strong style={{ color: '#10b981', fontSize: '0.82rem' }}>Production Vision (v2.0):</strong>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                    Dual-hand + pose + face mesh landmarks, sliding temporal window with BiLSTM/Transformer model trained on validated ISL dictionaries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

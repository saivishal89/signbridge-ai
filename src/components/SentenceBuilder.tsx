import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Plus,
  MessageSquare,
  Sparkles,
  CornerDownLeft
} from 'lucide-react';
import { SupportedLanguage } from '../types/gesture';

interface SentenceBuilderProps {
  sentence: string;
  onUpdateSentence: (newSentence: string) => void;
  onSpeakSentence: (text: string) => void;
  onStopSpeech: () => void;
  autoAdd: boolean;
  onToggleAutoAdd: () => void;
  language: SupportedLanguage;
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({
  sentence,
  onUpdateSentence,
  onSpeakSentence,
  onStopSpeech,
  autoAdd,
  onToggleAutoAdd,
  language
}) => {
  const [manualInput, setManualInput] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleAddManualText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const separator = sentence.trim().length > 0 ? ' ' : '';
    onUpdateSentence(sentence + separator + manualInput.trim());
    setManualInput('');
  };

  const handleUndoLastWord = () => {
    const trimmed = sentence.trim();
    if (!trimmed) return;
    const words = trimmed.split(/\s+/);
    words.pop();
    onUpdateSentence(words.join(' '));
  };

  const handleClearSentence = () => {
    onUpdateSentence('');
  };

  const handleAddPunctuation = (punct: string) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;
    onUpdateSentence(trimmed + punct + ' ');
  };

  const handleCopy = () => {
    if (!sentence.trim()) return;
    navigator.clipboard.writeText(sentence.trim()).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.5rem',
        marginTop: '1.25rem',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Top Header of Sentence Strip */}
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
          <MessageSquare size={18} color="#06b6d4" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
            Communication Sentence Builder
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            ({sentence.trim() ? sentence.trim().split(/\s+/).length : 0} words)
          </span>
        </div>

        {/* Auto-Add Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onToggleAutoAdd}
            className={`btn ${autoAdd ? 'btn-success' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
            title="When active, newly recognized gestures are automatically appended to the sentence without clicking"
          >
            <Sparkles size={13} />
            <span>{autoAdd ? 'Auto-Append: ON' : 'Auto-Append: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Sentence Display Box */}
      <div
        style={{
          background: 'rgba(9, 13, 22, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          minHeight: '85px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sentence.trim() ? 'flex-start' : 'center',
          position: 'relative'
        }}
      >
        {sentence.trim() ? (
          <p
            style={{
              fontSize: '1.35rem',
              fontWeight: 600,
              color: '#f8fafc',
              lineHeight: 1.4,
              margin: 0,
              width: '100%',
              wordBreak: 'break-word'
            }}
          >
            {sentence}
          </p>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.95rem', fontStyle: 'italic', margin: 0 }}>
            Constructed speech will appear here. Perform gestures or type words below to build full sentences.
          </p>
        )}
      </div>

      {/* Control Actions Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginTop: '0.85rem'
        }}
      >
        {/* Speech Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onSpeakSentence(sentence)}
            disabled={!sentence.trim()}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.15rem', fontSize: '0.88rem' }}
          >
            <Volume2 size={16} />
            <span>Speak Sentence</span>
          </button>

          <button
            onClick={onStopSpeech}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.88rem' }}
            title="Stop audio playback"
          >
            <VolumeX size={16} />
            <span>Stop Audio</span>
          </button>

          {/* Quick Punctuation Buttons */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => handleAddPunctuation('.')}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem', fontWeight: 700 }}
              title="Add period"
            >
              .
            </button>
            <button
              onClick={() => handleAddPunctuation('?')}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem', fontWeight: 700 }}
              title="Add question mark"
            >
              ?
            </button>
            <button
              onClick={() => handleAddPunctuation('!')}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem', fontWeight: 700 }}
              title="Add exclamation mark"
            >
              !
            </button>
          </div>
        </div>

        {/* Editing Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleCopy}
            disabled={!sentence.trim()}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
            title="Copy text to clipboard"
          >
            {isCopied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleUndoLastWord}
            disabled={!sentence.trim()}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
            title="Undo last added word"
          >
            <RotateCcw size={15} />
            <span>Undo</span>
          </button>

          <button
            onClick={handleClearSentence}
            disabled={!sentence.trim()}
            className="btn btn-danger"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
            title="Clear all text"
          >
            <Trash2 size={15} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Manual Text Append Form */}
      <form
        onSubmit={handleAddManualText}
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '0.85rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(148, 163, 184, 0.08)'
        }}
      >
        <input
          type="text"
          placeholder="Type any word or phrase manually (works even without camera)..."
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.5rem 0.85rem',
            color: '#f8fafc',
            fontSize: '0.85rem'
          }}
        />
        <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <Plus size={15} />
          <span>Append</span>
        </button>
      </form>
    </div>
  );
};

/**
 * TwinSynthesis.tsx
 *
 * Master Direction §4, §5 — WOW MOMENT
 *
 * Full-screen synthesis animation shown during/after Onboarding.
 * Progresses through 5 processing states:
 *   ANALYZING → SYNTHESIZING → CALIBRATING → AWAKENING → READY
 *
 * Props:
 *   onComplete()  — called when sequence finishes (navigate to /dashboard)
 *   autoProgress  — if true, advances automatically (default true)
 *   durationMs    — ms per state (default 1800)
 *
 * Visual:
 *   - Dark cosmic full-screen overlay
 *   - Central pulsing orb with particle ring
 *   - Data stream text (numbers + symbols) flowing in background
 *   - Current processing state label + description
 *   - Progress dots (one per state)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PROCESSING_STATES } from '@/lib/intelligence/TwinStateEngine';
import type { ProcessingState } from '@/lib/intelligence/TwinStateEngine';
import '../../styles/twin-synthesis.css';

// ============================================================================
// Data stream — fake data scrolling in background (visual only)
// ============================================================================

const DATA_GLYPHS = [
  '01001101', '⟨context⟩', '0.847', 'KNOW', '■□■□', '∅→∞',
  'values[]', '0.923', 'INFER', '01110', 'pattern++',
  'Σ context', '0.761', 'UNKNOWN?', '██░░', 'memory[]',
  'calibrate', '0.988', 'ALIGN', '01010', 'insight{}',
];

const DataStream: React.FC = () => (
  <div className="synthesis__stream" aria-hidden="true">
    {Array.from({ length: 24 }).map((_, i) => (
      <span
        key={i}
        className="synthesis__glyph"
        style={{
          '--delay': `${(i * 0.37) % 4}s`,
          '--col': `${(i * 4.1) % 100}%`,
          '--speed': `${3 + (i % 4)}s`,
        } as React.CSSProperties}
      >
        {DATA_GLYPHS[i % DATA_GLYPHS.length]}
      </span>
    ))}
  </div>
);

// ============================================================================
// Props
// ============================================================================

interface TwinSynthesisProps {
  onComplete: () => void;
  autoProgress?: boolean;
  durationMs?: number;
}

// ============================================================================
// Component
// ============================================================================

const TwinSynthesis: React.FC<TwinSynthesisProps> = ({
  onComplete,
  autoProgress = true,
  durationMs = 1800,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  const totalSteps = PROCESSING_STATES.length;
  const current = PROCESSING_STATES[stepIndex];

  const advance = useCallback(() => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      setDone(true);
    }
  }, [stepIndex, totalSteps]);

  // Auto-progress through states
  useEffect(() => {
    if (!autoProgress || done) return;
    const timer = setTimeout(advance, durationMs);
    return () => clearTimeout(timer);
  }, [autoProgress, advance, durationMs, done]);

  // Orb glow color per state
  const GLOW: Record<ProcessingState, string> = {
    analyzing:          'rgba(99, 102, 241, 0.6)',
    synthesizing:       'rgba(124, 58, 237, 0.65)',
    calibrating:        'rgba(79, 70, 229, 0.7)',
    awakening_process:  'rgba(109, 40, 217, 0.8)',
    ready:              'rgba(139, 92, 246, 0.9)',
  };

  const glow = GLOW[current.state];

  return (
    <div
      className={`synthesis ${done ? 'synthesis--done' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`${current.label}: ${current.description}`}
    >
      {/* Background data stream */}
      <DataStream />

      {/* Central orb */}
      <div className="synthesis__center">
        <div
          className="synthesis__orb-wrap"
          style={{ '--glow': glow } as React.CSSProperties}
        >
          {/* Concentric rings */}
          <div className="synthesis__ring synthesis__ring--3" />
          <div className="synthesis__ring synthesis__ring--2" />
          <div className="synthesis__ring synthesis__ring--1" />

          {/* Orb body */}
          <div className="synthesis__orb">
            {/* Inner neural lines */}
            <div className="synthesis__neural synthesis__neural--h" />
            <div className="synthesis__neural synthesis__neural--v" />
            <div className="synthesis__neural synthesis__neural--d1" />
            <div className="synthesis__neural synthesis__neural--d2" />
          </div>

          {/* Orbiting particles */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="synthesis__particle"
              style={{
                '--angle': `${i * 60}deg`,
                '--radius': `${80 + (i % 3) * 20}px`,
                '--speed': `${4 + i * 0.6}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* State label */}
        <div className="synthesis__state-label" key={current.state}>
          {current.label}
        </div>
        <div className="synthesis__state-desc">
          {current.description}
        </div>

        {/* Progress dots */}
        <div className="synthesis__dots">
          {PROCESSING_STATES.map((s, i) => (
            <div
              key={s.state}
              className={[
                'synthesis__dot',
                i < stepIndex ? 'synthesis__dot--done' : '',
                i === stepIndex ? 'synthesis__dot--active' : '',
              ].join(' ')}
            />
          ))}
        </div>

        {/* CTA when done */}
        {done && (
          <div className="synthesis__ready">
            <div className="synthesis__ready-title">{isTh ? 'Twin ของคุณพร้อมแล้ว' : 'Your Twin is ready'}</div>
            <div className="synthesis__ready-desc">
              {isTh ? 'AI กำลังเรียนรู้และเข้าใจตัวคุณมากขึ้นเรื่อย ๆ' : 'AI keeps learning and understanding you more over time'}
            </div>
            <button
              className="synthesis__ready-btn"
              onClick={onComplete}
              autoFocus
            >
              {isTh ? 'เปิด Dashboard ของฉัน →' : 'Open my Dashboard →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwinSynthesis;

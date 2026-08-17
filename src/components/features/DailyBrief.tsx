/**
 * DailyBrief.tsx
 *
 * Master Direction §25 — Your Daily Brief
 *
 * Renders the brief with:
 *  - Listen button (Web Speech TTS) — §22 Adaptive Voice
 *  - Read mode (cards)
 *  - Data from DailyBriefEngine (real PersonalContext)
 *
 * User Preference: audio requires explicit consent (§24).
 * Reduced-motion safe.
 */

import { useState, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { DailyBriefEngine } from '@/lib/intelligence/DailyBriefEngine';
import { DailyInsightsList } from './DailyInsightsList';
import type { DailyBrief as DailyBriefData, BriefObservation } from '@/lib/intelligence/DailyBriefEngine';

// ============================================================================
// TTS helpers (§22 — Adaptive Voice)
// ============================================================================

function speak(text: string, onEnd?: () => void): SpeechSynthesisUtterance | null {
  if (!('speechSynthesis' in window)) return null;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'th-TH';
  utt.rate = 0.92;
  utt.pitch = 1.0;
  if (onEnd) utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
  return utt;
}

function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ============================================================================
// Category icon
// ============================================================================

const CATEGORY_ICON: Record<string, string> = {
  pattern: '🔄',
  strength: '✨',
  memory: '💎',
  question: '💭',
};

// ============================================================================
// Sub-components
// ============================================================================

interface ObservationCardProps {
  obs: BriefObservation;
  index: number;
  active: boolean;
}

function ObservationCard({ obs, index, active }: ObservationCardProps) {
  return (
    <div
      className={`brief-obs-card brief-obs-card--${obs.category} ${active ? 'brief-obs-card--active' : ''}`}
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <div className="brief-obs-icon">{CATEGORY_ICON[obs.category] ?? '●'}</div>
      <div className="brief-obs-content">
        <p className="brief-obs-headline">{obs.headline}</p>
        <p className="brief-obs-detail">{obs.detail}</p>
        {obs.confidence > 0 && obs.evidenceCount > 0 && (
          <span className="brief-obs-confidence">
            หลักฐาน {obs.evidenceCount} รายการ · ความมั่นใจ {Math.round(obs.confidence * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

const engine = new DailyBriefEngine();

export function DailyBrief() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioConsented, setAudioConsented] = useState(() =>
    localStorage.getItem('sp-audio-consent') === 'true'
  );
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { data: brief, isLoading, error } = useQuery<DailyBriefData>({
    queryKey: ['dailyBrief', userId],
    queryFn: () => engine.buildBrief(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 min — brief doesn't change mid-session
  });

  const handleListen = useCallback(() => {
    if (!brief) return;

    if (!audioConsented) {
      const ok = window.confirm(
        'เปิดเสียง Immersive Experience?\n\nTwin จะอ่าน Brief ให้ฟัง คุณสามารถปิดได้ตลอดเวลา'
      );
      if (!ok) return;
      localStorage.setItem('sp-audio-consent', 'true');
      setAudioConsented(true);
    }

    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      setActiveIdx(null);
      return;
    }

    // Build full script
    const parts = [
      brief.greeting,
      ...brief.observations.map((o, i) => {
        setActiveIdx(i);
        return o.detail;
      }),
      brief.closingPrompt,
    ];

    // Speak sequentially with index tracking
    let current = 0;
    const speakNext = () => {
      if (current >= parts.length) {
        setIsSpeaking(false);
        setActiveIdx(null);
        return;
      }
      const part = parts[current];
      // Update active observation index (skip greeting/closing)
      const obsIdx = current - 1;
      if (obsIdx >= 0 && obsIdx < brief.observations.length) {
        setActiveIdx(obsIdx);
      } else {
        setActiveIdx(null);
      }
      current++;
      uttRef.current = speak(part, speakNext);
    };

    setIsSpeaking(true);
    speakNext();
  }, [brief, isSpeaking, audioConsented]);

  // ── Render ──────────────────────────────────────────────────────────────

  if (!userId) return null;

  if (isLoading) {
    return (
      <div className="daily-brief daily-brief--loading">
        <div className="brief-twin-pulse" />
        <p className="brief-loading-text">Twin กำลังเตรียม Brief ของคุณ...</p>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="daily-brief daily-brief--error">
        <p>ไม่สามารถโหลด Daily Brief ได้ในขณะนี้</p>
      </div>
    );
  }

  const hasTTS = 'speechSynthesis' in window;
  const listenLabel = isSpeaking ? '⏸ หยุดฟัง' : '▶ ฟัง Brief';

  return (
    <section className="daily-brief" aria-label="Daily Brief จาก Twin">
      {/* Header */}
      <div className="brief-header">
        <div className="brief-twin-indicator" data-state={brief.twinState} />
        <div className="brief-header-text">
          <h2 className="brief-title">Daily Brief</h2>
          <p className="brief-duration">~{brief.listenDurationEstimate} วินาที</p>
        </div>
        {hasTTS && (
          <button
            className={`brief-listen-btn ${isSpeaking ? 'brief-listen-btn--active' : ''}`}
            onClick={handleListen}
            aria-label={listenLabel}
          >
            {listenLabel}
          </button>
        )}
      </div>

      {/* Greeting */}
      <p className="brief-greeting">{brief.greeting}</p>

      {/* Observations */}
      <div className="brief-observations">
        {brief.observations.map((obs, i) => (
          <ObservationCard
            key={obs.id}
            obs={obs}
            index={i}
            active={activeIdx === i}
          />
        ))}
      </div>

      {/* Closing prompt */}
      <p className="brief-closing">{brief.closingPrompt}</p>

      {/* Data richness hint */}
      {brief.dataRichness === 'minimal' && (
        <div className="brief-richness-hint">
          💡 Twin ยังรู้จักคุณน้อย — สะท้อนตัวเองเพิ่มเพื่อให้ Brief ลึกขึ้น
        </div>
      )}

      {/* Daily Insights with Feedback Collection — Task 2B */}
      {brief.observations && (
        <div className="brief-insights-section" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '2px solid var(--color-border, #e0e0e0)' }}>
          <DailyInsightsList
            userId={userId || ''}
            insights={brief.observations.map((obs) => ({
              id: obs.id,
              text: obs.detail,
              category: obs.category,
              confidence: 0.7, // Can be passed from observations if available
              evidenceCount: 3, // Can be calculated if available
            }))}
            onFeedbackUpdate={() => {
              // Invalidate accuracy metrics เมื่อ user ให้ feedback
              if (userId) {
                queryClient.invalidateQueries({ queryKey: ['accuracyMetrics', userId] });
              }
            }}
          />
        </div>
      )}
    </section>
  );
}

export default DailyBrief;

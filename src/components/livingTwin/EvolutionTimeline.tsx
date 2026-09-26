/**
 * EvolutionTimeline.tsx — TC-502: Evolution timeline in LivingTwin
 *
 * Shows version progression (v1→v2→v3) with trigger events and confidence.
 * Reads from twinStore.evolutionLog.
 */

import React, { useMemo } from 'react';
import { useTwinStore } from '@/store/twinStore';
import { useLanguage } from '@/context/LanguageContext';

interface EvolutionTimelineProps {
  twinId?: string;
  maxEvents?: number;
}

export const EvolutionTimeline: React.FC<EvolutionTimelineProps> = ({
  twinId: _twinId,
  maxEvents = 10,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const { evolutionLog, current } = useTwinStore();

  // Filter events for this twin (in real app, would scope by twinId)
  const events = useMemo(() => {
    return evolutionLog
      .slice(-maxEvents)
      .reverse(); // Most recent first
  }, [evolutionLog, maxEvents]);

  const versionLabels: Record<number, string> = {
    1: isTh ? 'Landing (DOB + Mood)' : 'Landing (DOB + Mood)',
    2: isTh ? 'Onboarding (Finetune + SICE)' : 'Onboarding (Finetune + SICE)',
    3: isTh ? 'Living (Decisions + Feedback)' : 'Living (Decisions + Feedback)',
  };

  const versionColors = {
    1: 'var(--color-version-1)',
    2: 'var(--color-version-2)',
    3: 'var(--color-version-3)',
  };

  const currentVersion = current?.version ?? 1;
  const currentConfidence = current?.confidence ?? 0.2;

  return (
    <div className="evolution-timeline">
      <div className="evolution-timeline__header">
        <h3>
          <span className="evolution-timeline__icon">📈</span>
          {isTh ? 'เส้นทางวิวัฒนาการ' : 'Evolution Timeline'}
        </h3>
        <div className="evolution-timeline__current">
          <span className="evolution-timeline__version">
            v{currentVersion}
          </span>
          <span className="evolution-timeline__confidence">
            {Math.round(currentConfidence * 100)}% {isTh ? 'มั่นใจ' : 'confidence'}
          </span>
        </div>
      </div>

      {/* Version progress bar */}
      <div className="evolution-timeline__progress">
        {[1, 2, 3].map((v) => (
          <div
            key={v}
            className={`evolution-timeline__stage ${v <= currentVersion ? 'completed' : ''} ${v === currentVersion ? 'current' : ''}`}
            style={{
              '--stage-color': versionColors[v as keyof typeof versionColors],
            } as React.CSSProperties}
          >
            <div className="evolution-timeline__dot" />
            <span className="evolution-timeline__stage-label">{v}</span>
            <span className="evolution-timeline__stage-name">{versionLabels[v]}</span>
          </div>
        ))}
      </div>

      {/* Events */}
      {events.length > 0 ? (
        <div className="evolution-timeline__events" data-testid="evolution-events">
          {events.map((event, idx) => (
            <EvolutionEvent
              key={event.at + idx}
              event={event}
              versionColors={versionColors}
              isTh={isTh}
            />
          ))}
        </div>
      ) : (
        <div className="evolution-timeline__empty">
          {isTh
            ? 'ยังไม่มีเหตุการณ์วิวัฒนาการ — ทำ Onboarding หรือตัดสินใจเพื่อเริ่มต้น'
            : 'No evolution events yet — complete Onboarding or make decisions to start'}
        </div>
      )}
    </div>
  );
};

interface EvolutionEventProps {
  event: { at: string; from: number | null; to: number; reason: string };
  versionColors: Record<number, string>;
  isTh: boolean;
}

function EvolutionEvent({ event, versionColors, isTh }: EvolutionEventProps) {
  const fromLabel = event.from === null
    ? (isTh ? '—' : '—')
    : `v${event.from}`;
  const toLabel = `v${event.to}`;
  const color = versionColors[event.to] || versionColors[1];

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="evolution-timeline__event" style={{ '--event-color': color } as React.CSSProperties}>
      <div className="evolution-timeline__event-dot" />
      <div className="evolution-timeline__event-content">
        <div className="evolution-timeline__event-header">
          <span className="evolution-timeline__version-change">
            {fromLabel} → {toLabel}
          </span>
          <span className="evolution-timeline__event-time">{formatDate(event.at)}</span>
        </div>
        <div className="evolution-timeline__event-reason">{event.reason}</div>
      </div>
    </div>
  );
}

export default EvolutionTimeline;
/**
 * EvolutionVisualization.tsx — TC-504: Evolution visualization component
 *
 * Timeline component showing version progression with trigger attribution
 * and version comparison. Can be standalone or embedded.
 */

import React, { useMemo } from 'react';
import { useTwinStore } from '@/store/twinStore';
import { useLanguage } from '@/context/LanguageContext';

interface EvolutionVisualizationProps {
  twinId?: string;
  showTriggers?: boolean;
  showVersionDiff?: boolean;
  maxEvents?: number;
}

export const EvolutionVisualization: React.FC<EvolutionVisualizationProps> = ({
  twinId: _twinId,
  showTriggers = true,
  showVersionDiff = true,
  maxEvents = 20,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const { evolutionLog, layers, current } = useTwinStore();

  // In real app, would filter by twinId
  const events = useMemo(() => {
    return evolutionLog.slice(-maxEvents).reverse();
  }, [evolutionLog, maxEvents]);

  const currentVersion = current?.version ?? 1;
  const currentConfidence = current?.confidence ?? 0.2;
  const scores = current?.scores ?? [];

  const versionLabels: Record<number, { en: string; th: string }> = {
    1: { en: 'Landing', th: 'Landing (DOB + Mood)' },
    2: { en: 'Onboarding', th: 'Onboarding (Finetune + SICE)' },
    3: { en: 'Living', th: 'Living (Decisions + Feedback)' },
  };

  const versionColors = {
    1: 'var(--color-version-1)',
    2: 'var(--color-version-2)',
    3: 'var(--color-version-3)',
  };

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

  const getTriggerLabel = (reason: string): { label: string; icon: string } => {
    const lower = reason.toLowerCase();
    if (lower.includes('onboard') || lower.includes('finetune')) {
      return { label: isTh ? 'Onboarding เสร็จสิ้น' : 'Onboarding completed', icon: '📝' };
    }
    if (lower.includes('decision') || lower.includes('ตัดสินใจ')) {
      return { label: isTh ? 'มีการตัดสินใจใหม่' : 'New decision recorded', icon: '⚖️' };
    }
    if (lower.includes('sice') || lower.includes('analysis') || lower.includes('วิเคราะห์')) {
      return { label: isTh ? 'SICE Analysis ใหม่' : 'New SICE Analysis', icon: '🔬' };
    }
    if (lower.includes('feedback') || lower.includes('outcome') || lower.includes('ผลลัพธ์')) {
      return { label: isTh ? 'ได้รับ Feedback/Outcome' : 'Feedback/Outcome received', icon: '📊' };
    }
    if (lower.includes('awakening') || lower.includes('ตื่น') || lower.includes('birth')) {
      return { label: isTh ? 'Twin Awakening' : 'Twin Awakening', icon: '⚡' };
    }
    return { label: reason, icon: '🔄' };
  };

  return (
    <div className="evolution-visualization">
      {/* Current Version Summary */}
      <div className="evolution-visualization__summary" style={{
        padding: '16px',
        borderRadius: 12,
        border: '1px solid var(--border-color)',
        background: 'var(--card-bg)',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
              {isTh ? 'เวอร์ชันปัจจุบัน' : 'Current Version'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="evolution-visualization__version-badge" style={{
                padding: '4px 12px',
                borderRadius: 20,
                background: versionColors[currentVersion as keyof typeof versionColors],
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
              }}>
                v{currentVersion} — {versionLabels[currentVersion]?.[isTh ? 'th' : 'en']}
              </span>
              <span style={{ fontSize: 14, opacity: 0.8 }}>
                {Math.round(currentConfidence * 100)}% {isTh ? 'มั่นใจ' : 'confidence'}
              </span>
            </div>
          </div>
          {showVersionDiff && scores.length > 0 && (
            <div style={{ minWidth: 200 }}>
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
                {isTh ? 'คะแนน SICE (12 มิติ)' : 'SICE Scores (12 dims)'}
              </div>
              <div className="evolution-visualization__score-bars" style={{ display: 'flex', gap: 2, height: 32 }}>
                {scores.map((score, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      background: `linear-gradient(to top, ${versionColors[currentVersion as keyof typeof versionColors]} ${score * 100}%, transparent ${score * 100}%)`,
                      borderRadius: '2px 2px 0 0',
                      minHeight: '100%',
                      position: 'relative',
                    }}
                    title={`Dim ${idx + 1}: ${Math.round(score * 100)}%`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="evolution-visualization__timeline">
        {/* Version milestone markers */}
        <div className="evolution-visualization__milestones" style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
          position: 'relative',
        }}>
          {[1, 2, 3].map((v) => (
            <div
              key={v}
              className={`evolution-visualization__milestone ${v <= currentVersion ? 'reached' : ''} ${v === currentVersion ? 'current' : ''}`}
              style={{
                flex: 1,
                textAlign: 'center',
                position: 'relative',
                '--milestone-color': versionColors[v as keyof typeof versionColors],
              } as React.CSSProperties}
            >
              <div className="evolution-visualization__milestone-dot" style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                margin: '0 auto 8px',
                background: v <= currentVersion ? versionColors[v as keyof typeof versionColors] : 'transparent',
                border: v <= currentVersion ? 'none' : '2px solid var(--border-color)',
                boxShadow: v === currentVersion ? `0 0 0 4px ${versionColors[v as keyof typeof versionColors]}33` : 'none',
                transition: 'all 0.3s ease',
              }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: v <= currentVersion ? versionColors[v as keyof typeof versionColors] : 'var(--text-secondary)' }}>
                v{v}
              </div>
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {versionLabels[v]?.[isTh ? 'th' : 'en']}
              </div>
            </div>
          ))}
        </div>

        {/* Events */}
        {events.length > 0 ? (
          <div className="evolution-visualization__events" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {events.map((event, idx) => {
              const trigger = showTriggers ? getTriggerLabel(event.reason) : null;
              const color = versionColors[event.to as keyof typeof versionColors] || versionColors[1];

              return (
                <div
                  key={event.at + idx}
                  className="evolution-visualization__event"
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    position: 'relative',
                    borderLeft: `3px solid ${color}`,
                  }}
                  data-testid={`evolution-event-${idx}`}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: `${color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 16,
                    }}>
                      {trigger?.icon ?? '🔄'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          {trigger?.label ?? event.reason}
                        </span>
                        <span style={{ fontSize: 11, opacity: 0.5 }}>{formatDate(event.at)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12 }}>
                        <span style={{ color: color, fontWeight: 500 }}>
                          {event.from === null ? '—' : `v${event.from}`} → v{event.to}
                        </span>
                        {event.from !== null && (
                          <span style={{ opacity: 0.6 }}>
                            {isTh ? 'อัปเกรดจาก' : 'Upgraded from'} v{event.from}
                          </span>
                        )}
                      </div>
                      {showTriggers && trigger && (
                        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7, fontStyle: 'italic' }}>
                          {isTh ? 'กระตุ้นโดย: ' : 'Triggered by: '}{trigger.label}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="evolution-visualization__empty" style={{
            textAlign: 'center',
            padding: '2rem',
            opacity: 0.5,
          }}>
            {isTh
              ? 'ยังไม่มีเหตุการณ์วิวัฒนาการ — เริ่ม Onboarding หรือทำ Decision'
              : 'No evolution events yet — start Onboarding or make Decisions'}
          </div>
        )}

      {/* Version Diff (v2 vs v3) */}
      {showVersionDiff && layers[2] && layers[3] && (
        <div className="evolution-visualization__diff" style={{ marginTop: 24 }}>
          <h4 style={{ marginBottom: 12 }}>
            {isTh ? '📊 เปรียบเทียบ v2 → v3' : '📊 Compare v2 → v3'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {scores.map((v3Score, idx) => {
              const v2Score = layers[2]?.scores[idx] ?? 0;
              const diff = v3Score - v2Score;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Dim {idx + 1}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border-color)', position: 'relative' }}>
                      <div style={{
                      position: 'absolute',
                      left: `${Math.min(100, Math.max(0, v2Score * 100))}%`,
                      width: `${Math.max(2, Math.abs(diff) * 100)}%`,
                      height: '100%',
                      borderRadius: 3,
                      background: diff >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                      transform: diff < 0 ? 'translateX(-100%)' : 'none',
                    }} />
                    </div>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: diff >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                      minWidth: 40,
                    }}>
                      {diff >= 0 ? '+' : ''}{Math.round(diff * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default EvolutionVisualization;
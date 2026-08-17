/**
 * GrowthSpace.tsx
 *
 * Master Direction §12 — Growth Space
 *
 * Shows the user's personal growth timeline:
 *   PAST ──●────── NOW ──────○── NEXT
 *
 * Four lenses:
 *   - สิ่งที่เติบโต (What's grown)
 *   - สิ่งที่เปลี่ยน (What's changed)
 *   - สิ่งที่ยังติดอยู่ (What's stuck)
 *   - สิ่งที่กำลังเกิดขึ้น (What's emerging)
 *
 * Data: real Supabase via PatternDetector (shared cache key)
 * No mocks, no hardcoding.
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { PatternDetector } from '@/lib/intelligence/PatternDetector';
import type { BehavioralPattern } from '@/lib/intelligence/types';
import '../../styles/growth-space.css';

// ============================================================================
// Helpers
// ============================================================================

interface GrowthLens {
  key: 'growing' | 'changing' | 'stuck' | 'emerging';
  label: string;
  icon: string;
  filter: (p: BehavioralPattern) => boolean;
  emptyLabel: string;
}

const LENSES: GrowthLens[] = [
  {
    key: 'growing',
    label: 'สิ่งที่เติบโต',
    icon: '🌱',
    // Repeating patterns that are linked to strengths = growing
    filter: (p) => p.patternType === 'repeating' && (p.strengths?.length ?? 0) > 0,
    emptyLabel: 'ยังไม่พบสิ่งที่เติบโตชัดเจน — ใช้งานต่อเนื่องเพื่อให้ Twin สังเกตเห็น',
  },
  {
    key: 'changing',
    label: 'สิ่งที่เปลี่ยน',
    icon: '🔄',
    filter: (p) => p.patternType === 'changing',
    emptyLabel: 'ยังไม่พบการเปลี่ยนแปลงที่ชัดเจนในช่วงนี้',
  },
  {
    key: 'emerging',
    label: 'สิ่งที่กำลังเกิดขึ้น',
    icon: '✨',
    filter: (p) => p.patternType === 'emerging',
    emptyLabel: 'ยังไม่พบสัญญาณใหม่ — Twin จะแจ้งเมื่อพบ pattern ที่กำลังก่อตัว',
  },
  {
    key: 'stuck',
    label: 'สิ่งที่ยังติดอยู่',
    icon: '⚓',
    // Repeating patterns with no linked strengths = potential friction area
    filter: (p) => p.patternType === 'repeating' && (p.strengths?.length ?? 0) === 0,
    emptyLabel: 'ไม่พบสิ่งที่ติดขัดในขณะนี้ — ดี!',
  },
];

// ============================================================================
// Skeleton
// ============================================================================

const Skeleton: React.FC = () => (
  <div className="growth__card">
    <div className="growth__skeleton" style={{ width: '40%', marginBottom: 16 }} />
    <div className="growth__timeline">
      <div className="growth__skeleton" style={{ width: '100%', height: 8, borderRadius: 99 }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="growth__lens-card growth__lens-card--loading">
          <div className="growth__skeleton" style={{ width: '60%' }} />
          <div className="growth__skeleton" style={{ width: '80%', marginTop: 6 }} />
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// Timeline visual
// ============================================================================

const Timeline: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="growth__timeline-wrap">
    <div className="growth__timeline-labels">
      <span>PAST</span>
      <span>NOW</span>
      <span>NEXT</span>
    </div>
    <div className="growth__timeline-track">
      <div
        className="growth__timeline-fill"
        style={{ width: `${progress}%` }}
      />
      <div
        className="growth__timeline-dot growth__timeline-dot--now"
        style={{ left: `${progress}%` }}
        title="ตอนนี้"
      />
    </div>
  </div>
);

// ============================================================================
// Main component
// ============================================================================

const GrowthSpace: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';

  const detector = useMemo(() => new PatternDetector(), []);

  // Shared cache key with IntelligencePanel
  const { data: patterns, isLoading } = useQuery({
    queryKey: ['behavioralPatterns', userId],
    queryFn: () => detector.detectPatterns(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  if (!userId) return null;
  if (isLoading) return <Skeleton />;

  const allPatterns = patterns ?? [];

  // Estimate "progress" on growth journey: based on pattern count + types
  const progressScore = Math.min(
    85,
    20 + allPatterns.length * 8 + (allPatterns.filter((p) => (p.strengths?.length ?? 0) > 0).length * 5)
  );

  return (
    <div className="growth__card">
      {/* Header */}
      <div className="growth__header">
        <h2 className="growth__title">🌿 การเติบโตของคุณ</h2>
        <p className="growth__subtitle">
          Twin ติดตามการเปลี่ยนแปลงของคุณตามเวลา
        </p>
      </div>

      {/* Timeline */}
      <Timeline progress={progressScore} />

      {/* 4 lenses grid */}
      <div className="growth__lenses">
        {LENSES.map((lens) => {
          const matched = allPatterns.filter(lens.filter);
          return (
            <div key={lens.key} className={`growth__lens-card growth__lens-card--${lens.key}`}>
              <div className="growth__lens-header">
                <span className="growth__lens-icon" aria-hidden="true">{lens.icon}</span>
                <span className="growth__lens-label">{lens.label}</span>
              </div>
              {matched.length === 0 ? (
                <p className="growth__lens-empty">{lens.emptyLabel}</p>
              ) : (
                <ul className="growth__lens-list">
                  {matched.slice(0, 3).map((p) => (
                    <li key={p.id} className="growth__lens-item">
                      <span className="growth__lens-name">{p.patternName}</span>
                      {p.frequency && (
                        <span className="growth__lens-freq">{p.frequency}</span>
                      )}
                    </li>
                  ))}
                  {matched.length > 3 && (
                    <li className="growth__lens-more">+{matched.length - 3} เพิ่มเติม</li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state when no patterns at all */}
      {allPatterns.length === 0 && (
        <div className="growth__empty">
          <p>
            Twin ยังไม่มีข้อมูลเพียงพอที่จะแสดงเส้นทางการเติบโตของคุณ<br />
            ใช้งานและบันทึกความคิดเพิ่มขึ้นเรื่อย ๆ เพื่อให้ Twin เรียนรู้
          </p>
        </div>
      )}
    </div>
  );
};

export default GrowthSpace;

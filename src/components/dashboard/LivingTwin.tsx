/**
 * LivingTwin.tsx
 *
 * Master Direction §3, §4, §5 — Living AI Twin
 *
 * Replaces the static AITwinSection card with an animated, state-aware Twin.
 *
 * - 6 Twin states: awakening → aware → connected → reflective → insightful → aligned
 * - Cosmic orb with glow, particles, breathing animation
 * - Processing states: ANALYZING / SYNTHESIZING / CALIBRATING / AWAKENING / READY
 * - Progress ladder showing all 6 states
 * - Next milestone guidance
 *
 * Data: useAuth() for userId, real Supabase via PersonalContextBuilder
 * No mocks. No hardcoding.
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PersonalContextBuilder } from '@/lib/intelligence/PersonalContextBuilder';
import { TwinStateEngine } from '@/lib/intelligence/TwinStateEngine';
import type { TwinState } from '@/lib/intelligence/TwinStateEngine';
import '../../styles/living-twin.css';

// ============================================================================
// Particle nodes
// ============================================================================

const Particles: React.FC = () => (
  <>
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="living-twin__particle" />
    ))}
  </>
);

// ============================================================================
// Ladder — all 6 states row
// ============================================================================

const STATE_SHORT: Record<TwinState, string> = {
  awakening:   'AWAKE',
  aware:       'AWARE',
  connected:   'CONNECT',
  reflective:  'REFLECT',
  insightful:  'INSIGHT',
  aligned:     'ALIGN',
  flourishing: 'BLOOM',
  mastery:     'MASTER',
};

const Ladder: React.FC<{ current: TwinState; engine: TwinStateEngine }> = ({
  current,
  engine,
}) => {
  const all = engine.getAllStates();
  const currentIdx = engine.stateIndex(current);

  return (
    <div className="living-twin__ladder">
      {all.map((s, idx) => {
        const isPast = idx < currentIdx;
        const isActive = idx === currentIdx;
        return (
          <div key={s} className="living-twin__ladder-step">
            <div
              className={[
                'living-twin__ladder-dot',
                isActive ? 'living-twin__ladder-dot--active' : '',
                isPast ? 'living-twin__ladder-dot--past' : '',
              ].join(' ')}
            />
            <span
              className={[
                'living-twin__ladder-label',
                isActive ? 'living-twin__ladder-label--active' : '',
              ].join(' ')}
            >
              {STATE_SHORT[s]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// Main component
// ============================================================================

const LivingTwin: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const navigate = useNavigate();

  const contextBuilder = useMemo(() => new PersonalContextBuilder(), []);
  const engine = useMemo(() => new TwinStateEngine(), []);

  // Shared cache key with IntelligencePanel / ExecutiveSummary
  const { data: context, isLoading } = useQuery({
    queryKey: ['personalContext', userId],
    queryFn: () => contextBuilder.getContext(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const twinResult = useMemo(
    () => engine.computeState(context ?? null),
    [context, engine]
  );

  // Auth guard
  if (!userId) {
    return (
      <div className="living-twin">
        <div className="living-twin__state-desc">กรุณาเข้าสู่ระบบเพื่อดู AI Twin ของคุณ</div>
        <button
          className="living-twin__btn living-twin__btn--primary"
          onClick={() => navigate('/onboarding')}
        >
          เริ่ม Onboarding
        </button>
      </div>
    );
  }

  // Processing state while loading (§5)
  if (isLoading) {
    return (
      <div className="living-twin">
        <div
          className="living-twin__orb-wrap"
          style={{ '--twin-glow': 'rgba(79,70,229,0.35)' } as React.CSSProperties}
        >
          <div className="living-twin__orb-ring" />
          <div className="living-twin__orb" />
        </div>
        <div className="living-twin__processing">
          <div className="living-twin__processing-label">ANALYZING</div>
          <div className="living-twin__processing-desc">กำลังทำความเข้าใจข้อมูล</div>
          <div className="living-twin__processing-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    );
  }

  const {
    state,
    labelEn,
    label: labelTh,
    description,
    progress,
    nextMilestone,
    glowColor,
    particleIntensity,
  } = twinResult;

  return (
    <div
      className={`living-twin living-twin--intensity-${particleIntensity}`}
      style={{ '--twin-glow': glowColor } as React.CSSProperties}
    >
      {/* Orb */}
      <div className="living-twin__orb-wrap">
        <div className="living-twin__orb-ring living-twin__orb-ring--outer" />
        <div className="living-twin__orb-ring" />
        <div className="living-twin__orb">
          <Particles />
        </div>
      </div>

      {/* State badge */}
      <div className="living-twin__state-badge">
        <span className="living-twin__state-dot" />
        <span className="living-twin__state-en">{labelEn}</span>
      </div>

      {/* State label + description */}
      <div className="living-twin__state-th">Twin ของคุณ: {labelTh}</div>
      <div className="living-twin__state-desc">{description}</div>

      {/* Progress */}
      <div className="living-twin__progress-wrap">
        <div className="living-twin__progress-label">
          <span>ความเข้าใจ</span>
          <span>{progress}%</span>
        </div>
        <div className="living-twin__progress-track">
          <div
            className="living-twin__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* State ladder */}
      <Ladder current={state} engine={engine} />

      {/* Next milestone */}
      <div className="living-twin__next">
        <strong>ขั้นต่อไป</strong>
        {nextMilestone}
      </div>

      {/* Actions */}
      <div className="living-twin__actions">
        <button
          className="living-twin__btn living-twin__btn--primary"
          onClick={() => navigate('/analysis')}
        >
          🔍 ดูการวิเคราะห์เต็ม
        </button>
        <button
          className="living-twin__btn living-twin__btn--outline"
          onClick={() => navigate('/chat')}
        >
          💬 คุยกับ Twin
        </button>
      </div>
    </div>
  );
};

export default LivingTwin;

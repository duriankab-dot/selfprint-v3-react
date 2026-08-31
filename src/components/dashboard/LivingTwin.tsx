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
import { useLangNavigate as useNavigate } from '../../hooks/useLangNavigate';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { PersonalContextBuilder } from '@/lib/intelligence/PersonalContextBuilder';
import { TwinStateEngine } from '@/lib/intelligence/TwinStateEngine';
import type { TwinState } from '@/lib/intelligence/TwinStateEngine';
import { ShareButton } from '@/components/viral/ShareButton';
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

interface LivingTwinProps {
  /** TWIN-VISUAL-001: optional maturityScore drives visual evolution
   *  (0-100). If provided, scales glow and rings. If not provided,
   *  derives state from PersonalContext. */
  maturityScore?: number;
}

const LivingTwin: React.FC<LivingTwinProps> = ({ maturityScore }) => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';

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

  // TWIN-VISUAL-001: map maturityScore to evolution stage for glow scaling
  // Same logic as TwinPresence — 4 stages: nascent (0-25), growing (25-50),
  // active (50-75), evolved (75-100)
  const evolutionStage = useMemo(() => {
    if (!maturityScore) return 1; // default to nascent if not provided
    const s = Math.max(0, Math.min(100, maturityScore));
    if (s >= 75) return 4;
    if (s >= 50) return 3;
    if (s >= 25) return 2;
    return 1;
  }, [maturityScore]);

  // Glow intensity multiplier per stage — same as TwinPresence
  const glowMult = useMemo(() => [0, 0.7, 0.9, 1.15, 1.45][evolutionStage], [evolutionStage]);

  // HOOKS-RULE: glowOpacity must be declared before any early returns so React
  // always calls Hooks in the same order. Previously this was after `if (isLoading)`.
  const glowOpacity = useMemo(
    () => 0.35 + (glowMult - 0.7) * 0.2,
    [glowMult]
  );

  // Auth guard
  if (!userId) {
    return (
      <div className="living-twin">
        <div className="living-twin__state-desc">
          {isTh ? 'กรุณาเข้าสู่ระบบเพื่อดู AI Twin ของคุณ' : 'Please log in to see your AI Twin'}
        </div>
        <button
          className="living-twin__btn living-twin__btn--primary"
          onClick={() => navigate('/onboarding')}
        >
          {isTh ? 'เริ่ม Onboarding' : 'Start Onboarding'}
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
          <div className="living-twin__processing-desc">
            {isTh ? 'กำลังทำความเข้าใจข้อมูล' : 'Making sense of your data'}
          </div>
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
      style={{
        '--twin-glow': glowColor,
        // Scale glow intensity CSS vars based on maturityScore evolution
        '--twin-glow-intensity': glowMult.toString(),
        '--twin-glow-opacity': glowOpacity.toString(),
        '--twin-outer-ring-opacity': (evolutionStage >= 3 ? 0.4 * glowMult : 0).toString(),
      } as React.CSSProperties}
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
      <div className="living-twin__state-th">
        {isTh ? `Twin ของคุณ: ${labelTh}` : `Your Twin: ${labelEn}`}
      </div>
      <div className="living-twin__state-desc">{description}</div>

      {/* Progress */}
      <div className="living-twin__progress-wrap">
        <div className="living-twin__progress-label">
          <span>{isTh ? 'ความเข้าใจ' : 'Understanding'}</span>
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
        <strong>{isTh ? 'ขั้นต่อไป' : 'Next step'}</strong>
        {nextMilestone}
      </div>

      {/* Actions */}
      <div className="living-twin__actions">
        <button
          className="living-twin__btn living-twin__btn--primary"
          onClick={() => navigate('/analysis')}
        >
          🔍 {isTh ? 'ดูการวิเคราะห์เต็ม' : 'View Full Analysis'}
        </button>
        <button
          className="living-twin__btn living-twin__btn--outline"
          // BOTTOMNAV-001 FIX: '/chat' redirects to /chat/nova (pre-Twin
          // guide), wrong assistant for a "คุยกับ Twin" button.
          onClick={() => navigate('/chat/twin')}
        >
          💬 {isTh ? 'คุยกับ Twin' : 'Chat with Twin'}
        </button>
      </div>

      {/* VIRAL-LOOP-001 FIX: ShareButton (features/viral/api/shareService.ts
          -> /api/share, real endpoint in api/unified-handler.ts) lived only
          inside AITwinSection.tsx, which LivingTwin replaced on the Dashboard
          (see file header) without carrying ShareButton over — it became
          unreachable dead code even though the backend was still fully wired. */}
      <div className="living-twin__share">
        <ShareButton />
      </div>
    </div>
  );
};

export default LivingTwin;

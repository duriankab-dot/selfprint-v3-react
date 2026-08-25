/**
 * TwinEvolution.tsx
 *
 * Master Direction §30 — Badge & Twin Evolution Experience
 *
 * Detects when TwinState upgrades (e.g. awakening → aware)
 * and shows a WOW overlay: particles burst + ring expand + state label.
 *
 * Rules:
 *  - Only triggers on a REAL state upgrade (persisted prev state in Supabase user_metadata)
 *  - userId strictly from useAuth()
 *  - CSS vars only — no hardcoded colors
 *  - Motion respects prefers-reduced-motion
 *
 * Badge unlock mapping (§30):
 *   aware       → "Twin Awakening"
 *   connected   → "Pattern Finder"
 *   reflective  → "Journey Explorer"
 *   insightful  → "Deep Thinker"
 *   aligned     → "Selfprint Complete"
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';
import { TwinStateEngine } from '@/lib/intelligence/TwinStateEngine';
import type { TwinState, TwinStateResult } from '@/lib/intelligence/TwinStateEngine';
import PersonalContextBuilder from '@/lib/intelligence/PersonalContextBuilder';
import { supabase } from '@/services/supabase-service';

// ─── State metadata ──────────────────────────────────────────────────────────

const STATE_ORDER: TwinState[] = [
  'awakening', 'aware', 'connected', 'reflective', 'insightful', 'aligned', 'flourishing', 'mastery',
];

const STATE_BADGE: Partial<Record<TwinState, string>> = {
  aware:       'Twin Awakening',
  connected:   'Pattern Finder',
  reflective:  'Journey Explorer',
  insightful:  'Deep Thinker',
  aligned:     'Selfprint Complete',
  flourishing: 'Life in Bloom',
  mastery:     'Twin Mastery',
};

const STATE_LABELS: Record<TwinState, { th: string; en: string }> = {
  awakening:   { th: 'กำลังตื่น', en: 'AWAKENING' },
  aware:       { th: 'รับรู้',     en: 'AWARE' },
  connected:   { th: 'เชื่อมต่อ', en: 'CONNECTED' },
  reflective:  { th: 'สะท้อน',   en: 'REFLECTIVE' },
  insightful:  { th: 'เข้าใจลึก', en: 'INSIGHTFUL' },
  aligned:     { th: 'สอดคล้อง',  en: 'ALIGNED' },
  flourishing: { th: 'เบ่งบาน',   en: 'FLOURISHING' },
  mastery:     { th: 'เชี่ยวชาญ', en: 'MASTERY' },
};

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function loadPrevState(): Promise<TwinState | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const meta = data?.user?.user_metadata as Record<string, unknown> | undefined;
  const stored = meta?.['prev_twin_state'] as TwinState | undefined;
  return stored ?? null;
}

async function savePrevState(state: TwinState): Promise<void> {
  if (!supabase) return;
  await supabase.auth.updateUser({ data: { prev_twin_state: state } });
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface TwinEvolutionProps {
  // No props required — component self-manages evolution detection
}

export function TwinEvolution({}: TwinEvolutionProps) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  // PersonalContextBuilder instance (stable across renders)
  const builderRef = useRef(new PersonalContextBuilder());

  // Shared cache key matches rest of app
  const { data: personalContext } = useQuery({
    queryKey: ['personalContext', userId],
    queryFn: () =>
      userId ? builderRef.current.getContext(userId) : Promise.resolve(null),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const engineRef = useRef(new TwinStateEngine());

  // ✅ MEMOIZE currentState to prevent dependency loop
  const { currentState, currentResult } = useMemo(() => {
    const result: TwinStateResult = engineRef.current.computeState(
      personalContext ?? null
    );
    return { currentState: result.state, currentResult: result };
  }, [personalContext]);

  // ── Evolution state ───────────────────────────────────────────────────────
  const [visible, setVisible] = useState(false);
  const [evolvedTo, setEvolvedTo] = useState<TwinState | null>(null);
  const [badgeName, setBadgeName] = useState<string | null>(null);
  const [ringFading, setRingFading] = useState(false);
  const checkedRef = useRef(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dismiss = useCallback(
    () => {
      setRingFading(true);
      setTimeout(() => {
        setVisible(false);
        setRingFading(false);
        // No external callback — self-contained evolution display
      }, 600);
    },
    []  // Empty dependency — dismiss is now stable
  );

  const triggerEvolution = useCallback(
    async (newState: TwinState) => {
      const badgeName = STATE_BADGE[newState] ?? null;
      setEvolvedTo(newState);
      setBadgeName(badgeName);
      setVisible(true);

      // Auto-dismiss after 4s
      setTimeout(() => {
        setRingFading(true);
        setTimeout(() => {
          setVisible(false);
          setRingFading(false);
        }, 600);
      }, 4000);
    },
    []  // No dependencies — dismiss logic inlined
  );

  // Check for evolution once PersonalContext is available
  useEffect(() => {
    if (!userId || !personalContext || checkedRef.current) return;
    checkedRef.current = true;

    (async () => {
      const prev = await loadPrevState();
      const prevIdx = prev ? STATE_ORDER.indexOf(prev) : -1;
      const currIdx = STATE_ORDER.indexOf(currentState);

      if (currIdx > prevIdx) {
        await savePrevState(currentState);
        // Skip overlay for initial awakening — TwinSynthesis handles that moment
        if (currentState !== 'awakening') {
          await triggerEvolution(currentState);
        }
      }
    })();
  }, [userId, personalContext, currentState, triggerEvolution]);

  if (!visible || !evolvedTo) return null;

  const labels = STATE_LABELS[evolvedTo];
  const glowColor = currentResult.glowColor;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={`Twin พัฒนาสู่ระดับ ${labels.en}`}
      onClick={() => dismiss()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        opacity: ringFading ? 0 : 1,
        transition: 'opacity 0.6s ease',
        cursor: 'pointer',
      }}
    >
      {/* ── Expanding ring ────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          border: `3px solid ${glowColor}`,
          boxShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}`,
          animation: prefersReducedMotion
            ? 'none'
            : 'sp-ring-expand 3.4s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '40px 32px',
          maxWidth: '340px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '3px',
            color: glowColor,
            textTransform: 'uppercase',
          }}
        >
          Twin Level Up
        </span>

        <h2
          style={{
            fontSize: '36px',
            fontWeight: 800,
            letterSpacing: '2px',
            color: 'var(--color-text-primary)',
            margin: 0,
            textTransform: 'uppercase',
            textShadow: `0 0 20px ${glowColor}`,
          }}
        >
          {labels.en}
        </h2>

        <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', margin: 0, fontWeight: 600 }}>
          {labels.th}
        </p>

        {badgeName && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px 20px',
              borderRadius: '999px',
              border: `2px solid ${glowColor}`,
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '16px' }}>🏅</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Badge Unlocked: {badgeName}
            </span>
          </div>
        )}

        <p
          style={{
            marginTop: '24px',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            opacity: 0.6,
          }}
        >
          แตะเพื่อดำเนินการต่อ
        </p>
      </div>

      <style>{`
        @keyframes sp-ring-expand {
          0%   { transform: scale(0.3); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { transform: scale(3.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default TwinEvolution;

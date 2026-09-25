/**
 * LivingDiagram.tsx — TC-103: Narrative spine wrapper around SVGCore.
 *
 * One diagram, three drivers (เส้นเรื่องราวเดียวครอบ Landing → Onboarding →
 * Dashboard ตาม LIVING_DIAGRAM_SPEC):
 *   - landing:    ScrollDriver — scroll progress จาก containerRef (rAF-batched,
 *                 pattern เดียวกับ EvolutionaryVisualSystem เดิม)
 *   - onboarding: StepDriver — step index → discrete phase reveal
 *   - dashboard:  DataDriver — progress=1 + scores/confidence จาก twinStore/DNA
 *
 * Safety: mount gating (IntersectionObserver, EVISUAL-IDLE-001 pattern),
 * prefers-reduced-motion → static full render ไม่มี loop, flag-gated ที่ caller.
 */

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import SVGCore, { SICE_LABELS_TH, SICE_LABELS_EN } from './SVGCore';
import type { TwinVisualDNA } from '../../lib/twinVisualDNA';
import { dnaPrimaryColor, dnaAccentColor } from '../../lib/twinVisualDNA';

export type LivingDiagramMode = 'landing' | 'onboarding' | 'dashboard';

export interface LivingDiagramProps {
  mode: LivingDiagramMode;
  dna?: TwinVisualDNA;
  labels?: string[];
  scores?: number[];
  confidence?: number;
  /** StepDriver: ลำดับขั้นปัจจุบัน (0-based) */
  step?: number;
  /** StepDriver: จำนวนขั้นทั้งหมด (default 5) */
  stepTotal?: number;
  /** External scroll progress 0..1 — override ScrollDriver */
  progress?: number;
  containerRef?: RefObject<HTMLElement | null>;
  isTh?: boolean;
  className?: string;
  style?: CSSProperties;
  /** TC-205: twin version badge (v1/v2/v3) แสดงเมื่อ mode=dashboard */
  version?: number;
}

/** StepDriver mapping — onboarding steps → story progress */
const STEP_PROGRESS = [0.16, 0.38, 0.6, 0.82, 1];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

export default function LivingDiagram({
  mode,
  dna,
  labels,
  scores,
  confidence,
  step,
  stepTotal = STEP_PROGRESS.length,
  progress,
  containerRef,
  isTh = false,
  className,
  style,
  version,
}: LivingDiagramProps) {
  const reduced = prefersReducedMotion();
  const [near, setNear] = useState(reduced); // reduced-motion: render immediately (static)
  const [scrollP, setScrollP] = useState<number | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // Mount gating — same EVISUAL-IDLE-001 rationale: do not build the ~60-node
  // scene until it is roughly one viewport away from view.
  useEffect(() => {
    if (near) return;
    const el = hostRef.current;
    if (!el) return;
    // jsdom / legacy browsers: no IO → render immediately
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          obs.disconnect();
        }
      },
      { rootMargin: '100% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [near]);

  // ── ScrollDriver (mode=landing) ──
  useEffect(() => {
    if (mode !== 'landing' || reduced) return;
    if (progress !== undefined) return; // explicit progress overrides
    if (!containerRef?.current) return;

    let ticking = false;
    const compute = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const raw = total > 0 ? -rect.top / total : 0;
      setScrollP(Math.max(0, Math.min(1, raw)));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        compute();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    compute();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [mode, progress, containerRef, reduced]);

  // ── Resolve progress per driver ──
  let effectiveProgress: number;
  if (mode === 'landing') {
    if (progress !== undefined) effectiveProgress = progress;
    else if (scrollP !== null) effectiveProgress = scrollP;
    else effectiveProgress = 0;
  } else if (mode === 'onboarding') {
    const idx = Math.max(0, Math.min(step ?? 0, stepTotal - 1));
    effectiveProgress = STEP_PROGRESS[Math.min(idx, STEP_PROGRESS.length - 1)];
  } else {
    // dashboard — DataDriver: full scene, data drives polygon/arc
    effectiveProgress = 1;
  }

  const effectiveLabels =
    labels ?? (isTh ? SICE_LABELS_TH : SICE_LABELS_EN);

  return (
    <div ref={hostRef} className={className} style={{ width: '100%', height: '100%', position: 'relative', ...style }} data-testid="living-diagram" data-mode={mode}>
      {near && (
        <SVGCore
          progress={effectiveProgress}
          dna={dna}
          labels={effectiveLabels}
          scores={mode === 'dashboard' ? scores : undefined}
          confidence={mode === 'dashboard' ? confidence : undefined}
          animate={!reduced}
          compact={mode !== 'landing'}
        />
      )}
      {mode === 'dashboard' && version !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 700,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            color: dna ? dnaAccentColor(dna) : 'var(--color-accent-primary)',
          }}
        >
          <span
            aria-hidden="true"
            style={{ width: 6, height: 6, borderRadius: '50%', background: dna ? dnaPrimaryColor(dna) : 'var(--color-accent-primary)', display: 'inline-block' }}
          />
          v{version}
          {confidence !== undefined && (
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {Math.round(clamp01(confidence) * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
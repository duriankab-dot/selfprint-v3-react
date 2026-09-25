/**
 * LivingDiagram.tsx — TC-103 + TC-301/302/303: Narrative spine wrapper.
 *
 * One diagram, three drivers (เส้นเรื่องราวเดียวครอบ Landing → Onboarding →
 * Dashboard ตาม LIVING_DIAGRAM_SPEC):
 *   - landing:    ScrollDriver — scroll progress จาก containerRef (rAF-batched)
 *   - onboarding: StepDriver — step index → discrete phase reveal
 *   - dashboard:  DataDriver — progress=1 + scores/confidence จาก twinStore/DNA
 *
 * TC-301: mobileSheet prop renders a SICE summary bottom sheet + sticky shell
 *   on phones (CSS media query), all modes.
 * TC-302: mount gating (IntersectionObserver), reduced-motion → static,
 *   aspect-ratio container (no CLS), contain: layout style paint.
 * TC-303: role="section" + aria-label on the shell, toggle button with
 *   aria-expanded/aria-controls, sheet panel with proper region semantics.
 */

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import SVGCore, { SICE_LABELS_TH, SICE_LABELS_EN } from './SVGCore';
import type { TwinVisualDNA } from '../../lib/twinVisualDNA';
import { dnaPrimaryColor, dnaAccentColor, dnaSoftColor } from '../../lib/twinVisualDNA';
import './living-diagram.css';

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
  /** TC-301: render SICE summary bottom sheet (mobile) — all modes */
  mobileSheet?: boolean;
}

/** StepDriver mapping — onboarding steps → story progress */
const STEP_PROGRESS = [0.16, 0.38, 0.6, 0.82, 1];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
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
  mobileSheet = false,
}: LivingDiagramProps) {
  const reduced = prefersReducedMotion();
  const [near, setNear] = useState(reduced); // reduced-motion: render immediately (static)
  const [scrollP, setScrollP] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  // TC-302: Mount gating — do not build the ~60-node scene until it is
  // roughly one viewport away from view (EVISUAL-IDLE-001 rationale).
  useEffect(() => {
    if (near) return;
    const el = hostRef.current;
    if (!el) return;
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

  const shellLabel = isTh
    ? 'แผนภาพปัญญาที่มีชีวิต — 12 มิติพฤติกรรม SICE'
    : 'Living intelligence diagram — 12 SICE behavior dimensions';

  const sheetTitle = isTh
    ? '12 มิติพฤติกรรม (SICE)'
    : '12 SICE behavior dimensions';

  const toggleLabel = isTh
    ? `${sheetOpen ? 'ปิด' : 'เปิด'}รายละเอียด 12 มิติ`
    : `${sheetOpen ? 'Close' : 'Open'} the 12-dimension detail`;

  return (
    <div
      ref={hostRef}
      className={`ld-shell${mobileSheet ? ' ld-shell--sticky' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...style }}
      data-testid="living-diagram"
      data-mode={mode}
      role="section"
      aria-label={shellLabel}
      aria-live={mode === 'dashboard' ? 'polite' : undefined}
    >
      {near && (
        <SVGCore
          progress={effectiveProgress}
          dna={dna}
          labels={effectiveLabels}
          scores={mode === 'dashboard' ? scores : undefined}
          confidence={mode === 'dashboard' ? confidence : undefined}
          animate={!reduced}
          compact={mode !== 'landing'}
          label={shellLabel}
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

      {mobileSheet && (
        <>
          <button
            type="button"
            className="ld-sheet-toggle"
            onClick={() => setSheetOpen((o) => !o)}
            aria-expanded={sheetOpen}
            aria-controls="ld-sheet-panel"
          >
            {toggleLabel}
          </button>
          <div
            id="ld-sheet-panel"
            className={`ld-sheet${sheetOpen ? '' : ' ld-sheet--closed'}`}
            role="region"
            aria-label={sheetTitle}
            aria-hidden={!sheetOpen}
          >
            <p className="ld-sheet__title">{sheetTitle}</p>
            <ul className="ld-sheet__list">
              {effectiveLabels.map((label, i) => {
                const s = mode === 'dashboard' && scores ? scores[i] : undefined;
                const dot = dna
                  ? i < 4 ? dnaPrimaryColor(dna) : i < 8 ? dnaSoftColor(dna) : dnaAccentColor(dna)
                  : 'var(--color-accent-primary)';
                return (
                  <li key={label} className="ld-sheet__item">
                    <span className="ld-sheet__dot" style={{ background: dot }} aria-hidden="true" />
                    <span className="ld-sheet__name">{label}</span>
                    {s !== undefined ? (
                      <>
                        <span className="ld-sheet__bar" aria-hidden="true">
                          <span
                            className="ld-sheet__bar-fill"
                            style={{ width: `${Math.round(clamp01(s) * 100)}%`, background: dot }}
                          />
                        </span>
                        <span className="ld-sheet__pct">{Math.round(clamp01(s) * 100)}%</span>
                      </>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
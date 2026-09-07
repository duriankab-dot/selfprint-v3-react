/**
 * Skeleton.tsx
 * Phase 1.7 (docs/.kilo/plans/1788755171904-docs-consultation-update.md):
 * generic loading skeleton for use across pages, replacing ad-hoc blank/
 * spinner states — also addresses PHASE0 0.8's `<Suspense fallback={null}>`
 * gap (App.tsx:283) by giving routes something real to fall back to.
 *
 * Uses opacity pulse rather than the `background-position` shimmer already
 * used in dashboard.css (`.exec-summary__skeleton`) — §25 PERFORMANCE
 * ARCHITECTURE prefers compositor-only properties (opacity/transform) over
 * ones that force paint every frame. Respects prefers-reduced-motion via
 * the existing global `*` override in global.css:197-206 — no per-instance
 * guard needed.
 *
 * CSS vars only (tokens.css) — no hardcoded colors, works in both themes.
 */

type SkeletonVariant = 'text' | 'block' | 'circle';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  /** CSS width value, e.g. '100%', '60%', 120 (px). */
  width?: string | number;
  /** CSS height value. Defaults per variant: text=16, block=80, circle=40. */
  height?: string | number;
  /** Extra className for layout (margin/flex) at the call site. */
  className?: string;
  /** Accessible label for the region this skeleton stands in for. */
  label?: string;
}

const DEFAULT_HEIGHT: Record<SkeletonVariant, number> = {
  text: 16,
  block: 80,
  circle: 40,
};

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export function Skeleton({ variant = 'text', width, height, className, label }: SkeletonProps) {
  const resolvedHeight = toCssSize(height) ?? `${DEFAULT_HEIGHT[variant]}px`;
  const resolvedWidth = toCssSize(width) ?? (variant === 'circle' ? resolvedHeight : '100%');
  const radius =
    variant === 'circle' ? '50%' : variant === 'text' ? 'var(--radius-xs)' : 'var(--radius-md)';

  return (
    <span
      role="status"
      aria-label={label ?? 'Loading'}
      aria-live="polite"
      className={['sp-skeleton', className].filter(Boolean).join(' ')}
      style={{
        display: 'inline-block',
        width: resolvedWidth,
        height: resolvedHeight,
        borderRadius: radius,
        background: 'var(--color-border, var(--color-bg-tertiary))',
      }}
    />
  );
}

/**
 * SkeletonGroup — stack of text-line skeletons, the common "paragraph
 * loading" case. `lines` defaults to 3; the last line renders shorter
 * (70%) so the group doesn't look like a solid block.
 */
export function SkeletonGroup({
  lines = 3,
  className,
  label,
}: {
  lines?: number;
  className?: string;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label ?? 'Loading content'} aria-live="polite" className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
          className="sp-skeleton-group__line"
        />
      ))}
      <style>{`.sp-skeleton-group__line + .sp-skeleton-group__line { margin-top: 8px; }`}</style>
    </div>
  );
}

// Shared keyframes + reduced-motion-safe pulse — injected once per module
// via a plain <style> tag, same pattern as Twin.tsx's renderer components.
if (typeof document !== 'undefined' && !document.getElementById('sp-skeleton-style')) {
  const style = document.createElement('style');
  style.id = 'sp-skeleton-style';
  style.textContent = `
    @keyframes sp-skeleton-pulse {
      0%, 100% { opacity: 0.55; }
      50% { opacity: 1; }
    }
    .sp-skeleton {
      animation: sp-skeleton-pulse 1.4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

export default Skeleton;

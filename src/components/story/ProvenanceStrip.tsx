/**
 * ProvenanceStrip.tsx
 * Phase 4.3 (docs/.kilo/plans/1788755171904-docs-consultation-update.md) ·
 * Storytelling Architecture §51 GUARDRAILS — "NO FAKE STORY: if real data
 * does not exist, show nothing."
 *
 * Renders the source-of-truth line under a Twin insight, e.g.
 * "From 3 patterns over 2 weeks" / "จาก 3 pattern ใน 2 สัปดาห์" — so an
 * insight always names the real evidence behind it instead of reading as
 * an unexplained claim. Takes counts as props; the caller is responsible
 * for only rendering this when SICE/decision_logs/twin_memories actually
 * produced them (§51: "a Narrative Hook that references a pattern
 * requires that pattern to be confirmed by SICE, not assumed").
 *
 * Renders null when there is nothing real to cite — never a placeholder
 * or a made-up number.
 */

import { useLanguage } from '@/context/LanguageContext';

export interface ProvenanceStripProps {
  /** Number of confirmed patterns/memories behind the insight. */
  patternCount?: number;
  /** Span of time the patterns were observed over, in days. */
  spanDays?: number;
  /** Optional extra source label, e.g. "3 decisions" — shown after the count/span. */
  extra?: string;
  className?: string;
}

function formatSpan(days: number, isTh: boolean): string {
  if (days >= 14) {
    const weeks = Math.round(days / 7);
    return isTh ? `${weeks} สัปดาห์` : `${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  return isTh ? `${days} วัน` : `${days} day${days === 1 ? '' : 's'}`;
}

export function ProvenanceStrip({ patternCount, spanDays, extra, className }: ProvenanceStripProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';

  // §51 GUARDRAILS: no real evidence → render nothing, not a fallback string.
  const hasPatterns = typeof patternCount === 'number' && patternCount > 0;
  const hasSpan = typeof spanDays === 'number' && spanDays > 0;
  if (!hasPatterns && !hasSpan && !extra) return null;

  const parts: string[] = [];
  if (hasPatterns) {
    parts.push(
      isTh
        ? `${patternCount} pattern`
        : `${patternCount} pattern${patternCount === 1 ? '' : 's'}`
    );
  }
  if (hasSpan) {
    parts.push(isTh ? `ใน ${formatSpan(spanDays as number, true)}` : `over ${formatSpan(spanDays as number, false)}`);
  }
  if (extra) parts.push(extra);

  const text = isTh ? `จาก ${parts.join(' ')}` : `From ${parts.join(' ')}`;

  return (
    <p
      className={['sp-provenance-strip', className].filter(Boolean).join(' ')}
      style={{
        margin: '6px 0 0',
        fontSize: 12,
        lineHeight: 1.4,
        color: 'var(--color-text-tertiary, var(--color-text-secondary))',
      }}
    >
      {text}
    </p>
  );
}

export default ProvenanceStrip;

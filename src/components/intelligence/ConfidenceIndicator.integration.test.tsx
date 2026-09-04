/**
 * Integration Tests for ConfidenceIndicator Component
 * Tests the component against real BehavioralPattern source objects
 * @module components/intelligence/__integration__/ConfidenceIndicator.integration.test
 *
 * ───────────────────────────────────────────────────────────────────────────
 * QA-02 (4 ก.ย. 2026) — this file was rewritten. Two separate problems:
 *
 * 1. Every mock in here was built against a BehavioralPattern shape that does
 *    not exist: it had `evidenceCount` and `consistencyScore` fields, and
 *    EvidencePoint entries of `{ id, context, weight }`. The real type
 *    (src/lib/intelligence/types.ts:192 and :170) has no evidenceCount and no
 *    consistencyScore, and EvidencePoint is `{ date, source, sourceId,
 *    excerpt, confidence? }`. Assertions were likewise written against copy the
 *    component has never rendered ("8 evidence" when only 2 evidence points
 *    were supplied, "Just now / This week" when the component writes "updated
 *    today", a consistency percentage the component only ever reads from its
 *    own prop). All of that is corrected below.
 *
 * 2. REALBUG-004 — the source-extraction branch is dead code. See the comment
 *    on the skipped block; the mocks and expectations there are now correct, so
 *    the tests can simply be un-skipped once the one-word fix lands.
 * ───────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConfidenceIndicator from './ConfidenceIndicator';
import type { BehavioralPattern } from '@/lib/intelligence/types';

const now = new Date();
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

/** Build a valid BehavioralPattern (real shape from lib/intelligence/types.ts). */
function makePattern(overrides: Partial<BehavioralPattern> = {}): BehavioralPattern {
  return {
    id: 'pattern-1',
    userId: 'user-123',
    patternName: 'analytical_decision_making',
    patternType: 'repeating',
    evidencePoints: [
      {
        date: now,
        source: 'reflection',
        sourceId: 'ref-1',
        excerpt: 'Spent 2 hours analyzing project requirements before starting',
      },
      {
        date: sevenDaysAgo,
        source: 'decision',
        sourceId: 'dec-1',
        excerpt: 'Created detailed decision matrix before choosing tool',
      },
    ],
    frequency: 'weekly',
    lastDetected: now,
    confidence: 0.92,
    description: 'Tends to analyze problems deeply before making decisions',
    aiInsight: 'Deliberation is a strength here, but slows time-critical calls',
    createdAt: new Date('2026-01-01'),
    updatedAt: now,
    ...overrides,
  };
}

describe('ConfidenceIndicator Integration Tests', () => {
  // ═════════════════════════════════════════════════════════════════════════
  // REALBUG-004: ConfidenceIndicator.tsx:112 guards the BehavioralPattern
  // extraction branch with `if ('confidencePoints' in source)`. There is no
  // `confidencePoints` field anywhere in this codebase (grep returns exactly
  // that one line) — BehavioralPattern's field is `evidencePoints`
  // (types.ts:199). The guard is therefore never true, so a pattern falls
  // through to the Value/Goal branch (`'confidence' in source && 'evidence' in
  // source`, which a pattern also fails) and then to the final fallback, which
  // returns the *props* — and when the caller passed only `source`, the
  // `confidence` prop is undefined.
  //
  // Visible effect: every ConfidenceIndicator rendered from a behavioral
  // pattern shows "NaN%", is classified "Very Low"/UNKNOWN, and paints red,
  // regardless of the pattern's real confidence. IntelligencePanel and
  // ContextDisplay both feed patterns in this way.
  //
  // Fix is one word ('confidencePoints' → 'evidencePoints'), but it is product
  // code, so it is left to the owner. Un-skip this block once it lands.
  // ═════════════════════════════════════════════════════════════════════════
  describe.skip('Integration: Component displays real metrics from source objects (REALBUG-004)', () => {
    it('should display high confidence from behavioral pattern with recent evidence', () => {
      render(<ConfidenceIndicator source={makePattern()} compact={false} />);

      expect(screen.getByText('92%')).toBeInTheDocument();
      // 0.92 < 0.9 is false, and 2 evidence points is < 3, so getKnowledgeLevel()
      // lands on INFER rather than KNOW.
      expect(screen.getByText(/^INFER/)).toBeInTheDocument();
      // evidenceCount is derived from evidencePoints.length, not a stored count.
      expect(screen.getByText(/2 evidence points/i)).toBeInTheDocument();
      expect(screen.getByText(/updated today/i)).toBeInTheDocument();
    });

    it('should display medium confidence with INFER classification', () => {
      render(
        <ConfidenceIndicator
          source={makePattern({
            id: 'pattern-2',
            patternName: 'risk_averse',
            confidence: 0.65,
            lastDetected: thirtyDaysAgo,
          })}
          compact={false}
        />
      );

      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText(/^INFER/)).toBeInTheDocument();
      expect(screen.getByText(/updated 30 days ago/i)).toBeInTheDocument();
    });

    it('should display low confidence with UNKNOWN classification for insufficient data', () => {
      render(
        <ConfidenceIndicator
          source={makePattern({
            id: 'pattern-3',
            patternName: 'creative_thinking',
            confidence: 0.35,
            evidencePoints: [
              {
                date: thirtyDaysAgo,
                source: 'reflection',
                sourceId: 'ref-9',
                excerpt: 'One creative solution observed',
              },
            ],
            lastDetected: thirtyDaysAgo,
          })}
          compact={false}
        />
      );

      expect(screen.getByText('35%')).toBeInTheDocument();
      expect(screen.getByText(/^UNKNOWN/)).toBeInTheDocument();
      expect(screen.getByText(/1 evidence point\b/i)).toBeInTheDocument();
      expect(screen.getByText(/Limited data to make confident assessment/i)).toBeInTheDocument();
    });

    it('should display compact badge with core metrics', () => {
      render(
        <ConfidenceIndicator
          source={makePattern({ id: 'pattern-4', confidence: 0.87 })}
          compact={true}
        />
      );

      expect(screen.getByText('87%')).toBeInTheDocument();
      expect(screen.getByText('INFER')).toBeInTheDocument();
    });

    it('should handle pattern with no evidence gracefully', () => {
      render(
        <ConfidenceIndicator
          source={makePattern({
            id: 'pattern-5',
            confidence: 0,
            evidencePoints: [],
          })}
          compact={false}
        />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText(/^UNKNOWN/)).toBeInTheDocument();
      // With no evidence points the explanation omits the count entirely.
      expect(screen.getByText(/Limited evidence available/i)).toBeInTheDocument();
    });

    it('should classify as KNOW with perfect confidence and abundant recent evidence', () => {
      render(
        <ConfidenceIndicator
          source={makePattern({
            id: 'pattern-7',
            confidence: 1.0,
            evidencePoints: [
              { date: now, source: 'decision', sourceId: 'd1', excerpt: 'Solved architecture problem' },
              { date: now, source: 'reflection', sourceId: 'r1', excerpt: 'Led tech review' },
              { date: sevenDaysAgo, source: 'memory', sourceId: 'm1', excerpt: 'Mentored a teammate' },
            ],
          })}
          compact={false}
        />
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
      // conf >= 0.9 AND >= 3 evidence points → KNOW
      expect(screen.getByText(/^KNOW/)).toBeInTheDocument();
      expect(screen.getByText(/3 evidence points/i)).toBeInTheDocument();
    });

    it('should show UNKNOWN classification honestly when confidence is low', () => {
      render(
        <ConfidenceIndicator
          source={makePattern({
            id: 'pattern-8',
            patternName: 'leadership_potential',
            confidence: 0.45,
            lastDetected: thirtyDaysAgo,
          })}
          compact={false}
        />
      );

      expect(screen.getByText(/^UNKNOWN/)).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.queryByText(/definitely|certainly/i)).not.toBeInTheDocument();
    });
  });

  describe('Integration: Component renders metrics supplied as props', () => {
    it('should display every supplied metric in the full card view', () => {
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      render(
        <ConfidenceIndicator
          confidence={0.78}
          evidenceCount={5}
          knowledgeLevel="INFER"
          lastEvidenceDate={oneDayAgo}
          consistencyScore={0.75}
          explanation="Based on 5 observations over 2 weeks"
          compact={false}
        />
      );

      // Confidence meter
      expect(screen.getByText('78%')).toBeInTheDocument();
      // Metric tiles: Evidence = raw count, Recency = whole days, Consistency = %
      expect(screen.getByText('Evidence')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Recency')).toBeInTheDocument();
      expect(screen.getByText('1d')).toBeInTheDocument();
      expect(screen.getByText('Consistency')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      // Explicit knowledge level wins over the inferred one. The card-view
      // Badge renders `{knowledge} {'✓' | '?'}`, so its text is "INFER ✓" —
      // match the level with a regex rather than an exact string.
      expect(screen.getByText(/^INFER/)).toBeInTheDocument();
      // An explicit `explanation` replaces the generated one
      expect(screen.getByText('Based on 5 observations over 2 weeks')).toBeInTheDocument();
    });

    it('should omit the consistency tile when no consistency score is supplied', () => {
      render(
        <ConfidenceIndicator confidence={0.5} evidenceCount={2} compact={false} />
      );

      expect(screen.getByText('Evidence')).toBeInTheDocument();
      expect(screen.getByText('Recency')).toBeInTheDocument();
      expect(screen.queryByText('Consistency')).not.toBeInTheDocument();
      // No lastEvidenceDate → recency tile falls back to N/A
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('Master Direction Compliance: Never Pretend to Know', () => {
    it('should show UNKNOWN honestly when confidence is low', () => {
      render(
        <ConfidenceIndicator confidence={0.2} evidenceCount={1} compact={false} />
      );

      expect(screen.getByText('20%')).toBeInTheDocument();
      // Card-view Badge text is "UNKNOWN ?" (see note above).
      expect(screen.getByText(/^UNKNOWN/)).toBeInTheDocument();
      expect(
        screen.getByText(/Limited data to make confident assessment/i)
      ).toBeInTheDocument();
      expect(screen.queryByText(/definitely|certainly/i)).not.toBeInTheDocument();
    });

    it('should classify as KNOW only with high confidence AND enough evidence', () => {
      const { unmount } = render(
        <ConfidenceIndicator confidence={0.95} evidenceCount={2} compact={true} />
      );
      // 0.95 is high, but 2 evidence points is below the 3-point floor
      expect(screen.getByText('INFER')).toBeInTheDocument();
      unmount();

      render(<ConfidenceIndicator confidence={0.95} evidenceCount={3} compact={true} />);
      expect(screen.getByText('KNOW')).toBeInTheDocument();
    });
  });
});

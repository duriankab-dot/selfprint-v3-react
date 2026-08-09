import { describe, it, expect } from 'vitest';
import { detectPatterns, type TrendPoint } from '../patternDetection';

function makePoint(daysAgo: number, autonomy: number, confidence: number): TrendPoint {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return { created_at: date.toISOString(), autonomy_level: autonomy, confidence };
}

describe('detectPatterns', () => {
  it('returns no insights with too few data points', () => {
    const points = [makePoint(3, 50, 0.5), makePoint(2, 60, 0.6), makePoint(1, 70, 0.7)];
    expect(detectPatterns(points)).toEqual([]);
  });

  it('returns no insights when nothing has meaningfully changed', () => {
    const points = Array.from({ length: 8 }, (_, i) => makePoint(8 - i, 50, 0.5));
    expect(detectPatterns(points)).toEqual([]);
  });

  it('detects an upward autonomy trend', () => {
    const points = [
      ...Array.from({ length: 4 }, (_, i) => makePoint(10 - i, 30, 0.5)),
      ...Array.from({ length: 4 }, (_, i) => makePoint(4 - i, 60, 0.5)),
    ];
    const insights = detectPatterns(points);
    const autonomyInsight = insights.find((i) => i.type === 'autonomy_trend');
    expect(autonomyInsight?.direction).toBe('up');
  });

  it('detects a downward autonomy trend', () => {
    const points = [
      ...Array.from({ length: 4 }, (_, i) => makePoint(10 - i, 70, 0.5)),
      ...Array.from({ length: 4 }, (_, i) => makePoint(4 - i, 30, 0.5)),
    ];
    const insights = detectPatterns(points);
    const autonomyInsight = insights.find((i) => i.type === 'autonomy_trend');
    expect(autonomyInsight?.direction).toBe('down');
  });

  it('detects an upward confidence trend', () => {
    const points = [
      ...Array.from({ length: 4 }, (_, i) => makePoint(10 - i, 50, 0.3)),
      ...Array.from({ length: 4 }, (_, i) => makePoint(4 - i, 50, 0.8)),
    ];
    const insights = detectPatterns(points);
    const confidenceInsight = insights.find((i) => i.type === 'confidence_trend');
    expect(confidenceInsight?.direction).toBe('up');
  });

  it('ignores noise below the meaningful-delta threshold', () => {
    const points = [
      ...Array.from({ length: 4 }, (_, i) => makePoint(10 - i, 50, 0.5)),
      ...Array.from({ length: 4 }, (_, i) => makePoint(4 - i, 52, 0.51)),
    ];
    expect(detectPatterns(points)).toEqual([]);
  });

  it('is order-independent (sorts by created_at internally)', () => {
    const chronological = [
      ...Array.from({ length: 4 }, (_, i) => makePoint(10 - i, 30, 0.5)),
      ...Array.from({ length: 4 }, (_, i) => makePoint(4 - i, 60, 0.5)),
    ];
    const shuffled = [...chronological].reverse();
    expect(detectPatterns(shuffled)).toEqual(detectPatterns(chronological));
  });

  it('can return both autonomy and confidence insights at once', () => {
    const points = [
      ...Array.from({ length: 4 }, (_, i) => makePoint(10 - i, 30, 0.3)),
      ...Array.from({ length: 4 }, (_, i) => makePoint(4 - i, 60, 0.8)),
    ];
    const insights = detectPatterns(points);
    expect(insights.map((i) => i.type).sort()).toEqual(['autonomy_trend', 'confidence_trend']);
  });
});

import { describe, it, expect } from 'vitest';
import { detectPatterns, type TrendPoint } from '../patternDetection';

function makePoint(
  daysAgo: number,
  autonomy: number,
  confidence: number,
  extra?: { hub?: string; mood?: string }
): TrendPoint {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return { created_at: date.toISOString(), autonomy_level: autonomy, confidence, ...extra };
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

  it('ignores mood/hub grouping when points have no mood/hub field', () => {
    const points = Array.from({ length: 8 }, (_, i) => makePoint(8 - i, 50, 0.5));
    const insights = detectPatterns(points);
    expect(insights.some((i) => i.type === 'mood_confidence')).toBe(false);
    expect(insights.some((i) => i.type === 'hub_autonomy')).toBe(false);
  });

  it('detects lower confidence correlated with a specific mood', () => {
    const points = [
      makePoint(9, 50, 0.3, { mood: 'stressed' }),
      makePoint(8, 50, 0.7, { mood: 'ready' }),
      makePoint(7, 50, 0.7, { mood: 'confident' }),
      makePoint(6, 50, 0.3, { mood: 'stressed' }),
      makePoint(5, 50, 0.7, { mood: 'ready' }),
      makePoint(4, 50, 0.7, { mood: 'confident' }),
      makePoint(3, 50, 0.3, { mood: 'stressed' }),
      makePoint(2, 50, 0.7, { mood: 'ready' }),
      makePoint(1, 50, 0.7, { mood: 'confident' }),
    ];
    const insights = detectPatterns(points);
    const moodInsight = insights.find((i) => i.type === 'mood_confidence');
    expect(moodInsight?.direction).toBe('down');
    expect(moodInsight?.message).toContain('เครียด');
  });

  it('detects higher autonomy correlated with a specific hub', () => {
    const points = [
      makePoint(9, 80, 0.5, { hub: 'career' }),
      makePoint(8, 40, 0.5, { hub: 'health' }),
      makePoint(7, 40, 0.5, { hub: 'money' }),
      makePoint(6, 80, 0.5, { hub: 'career' }),
      makePoint(5, 40, 0.5, { hub: 'health' }),
      makePoint(4, 40, 0.5, { hub: 'money' }),
      makePoint(3, 80, 0.5, { hub: 'career' }),
      makePoint(2, 40, 0.5, { hub: 'health' }),
      makePoint(1, 40, 0.5, { hub: 'money' }),
    ];
    const insights = detectPatterns(points);
    const hubInsight = insights.find((i) => i.type === 'hub_autonomy');
    expect(hubInsight?.direction).toBe('up');
    expect(hubInsight?.message).toContain('อาชีพ');
  });

  it('does not flag a mood/hub with fewer than the minimum group points', () => {
    const points = [
      makePoint(9, 50, 0.1, { mood: 'stressed' }), // only 2 stressed points — below MIN_GROUP_POINTS
      makePoint(8, 50, 0.7, { mood: 'ready' }),
      makePoint(7, 50, 0.7, { mood: 'confident' }),
      makePoint(6, 50, 0.1, { mood: 'stressed' }),
      makePoint(5, 50, 0.7, { mood: 'ready' }),
      makePoint(4, 50, 0.7, { mood: 'confident' }),
    ];
    const insights = detectPatterns(points);
    expect(insights.some((i) => i.type === 'mood_confidence')).toBe(false);
  });
});

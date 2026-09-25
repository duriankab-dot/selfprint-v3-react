import { describe, it, expect } from 'vitest';
import { rolloutEnabled, parseRolloutPercent } from '../featureFlags';

describe('TC-305 featureFlags — rollout percentages + explicit override', () => {
  it('parseRolloutPercent: valid 0..100, invalid returns null', () => {
    expect(parseRolloutPercent('10')).toBe(10);
    expect(parseRolloutPercent('100')).toBe(100);
    expect(parseRolloutPercent('0')).toBe(0);
    expect(parseRolloutPercent('abc')).toBeNull();
    expect(parseRolloutPercent(undefined)).toBeNull();
    expect(parseRolloutPercent('150')).toBe(100); // clamped
    expect(parseRolloutPercent('-5')).toBe(0);    // clamped
  });

  it('explicit true/false wins over rollout percent', () => {
    expect(rolloutEnabled('true', '0', 1)).toBe(true);
    expect(rolloutEnabled('false', '100', 1)).toBe(false);
  });

  it('no rollout config → disabled', () => {
    expect(rolloutEnabled(undefined, undefined, 42)).toBe(false);
  });

  it('bucket < percent → enabled; bucket >= percent → disabled', () => {
    expect(rolloutEnabled(undefined, '10', 5)).toBe(true);   // 5 < 10
    expect(rolloutEnabled(undefined, '10', 10)).toBe(false); // 10 >= 10
    expect(rolloutEnabled(undefined, '50', 49)).toBe(true);
    expect(rolloutEnabled(undefined, '50', 50)).toBe(false);
  });

  it('rollout 100% → always enabled regardless of bucket', () => {
    expect(rolloutEnabled(undefined, '100', 0)).toBe(true);
    expect(rolloutEnabled(undefined, '100', 99)).toBe(true);
  });

  it('fixed bucketing: same bucket = same result (deterministic rollout)', () => {
    const a = rolloutEnabled(undefined, '30', 12);
    const b = rolloutEnabled(undefined, '30', 12);
    expect(a).toBe(b);
  });
});
import { describe, it, expect } from 'vitest';
import { isInRollout } from '../rollout';

describe('isInRollout', () => {
  it('is always false at 0%', () => {
    for (let i = 0; i < 50; i++) {
      expect(isInRollout(`user-${i}`, 'ask-coach', 0)).toBe(false);
    }
  });

  it('is always true at 100%', () => {
    for (let i = 0; i < 50; i++) {
      expect(isInRollout(`user-${i}`, 'ask-coach', 100)).toBe(true);
    }
  });

  it('is false when there is no userId, regardless of percent', () => {
    expect(isInRollout(null, 'ask-coach', 100)).toBe(false);
    expect(isInRollout(undefined, 'ask-coach', 50)).toBe(false);
    expect(isInRollout('', 'ask-coach', 100)).toBe(false);
  });

  it('is deterministic for the same userId + featureKey', () => {
    const results = Array.from({ length: 10 }, () => isInRollout('user-abc', 'ask-coach', 50));
    expect(new Set(results).size).toBe(1);
  });

  it('roughly matches the requested percentage across many users', () => {
    const ids = Array.from({ length: 2000 }, (_, i) => `user-${i}`);
    const included = ids.filter((id) => isInRollout(id, 'ask-coach', 50)).length;
    const ratio = included / ids.length;
    // hash distribution ไม่ต้องเป๊ะ 50% แต่ต้องไม่เพี้ยนไปไกล
    expect(ratio).toBeGreaterThan(0.4);
    expect(ratio).toBeLessThan(0.6);
  });

  it('can differ between feature keys for the same user', () => {
    // ไม่ assert ว่าต้องต่างกันเสมอ (อาจบังเอิญ bucket เดียวกันได้) แค่ยืนยันว่า
    // featureKey มีผลต่อ hash จริง โดยเช็คว่าอย่างน้อยมี user บางคนที่ผลต่างกัน
    const ids = Array.from({ length: 200 }, (_, i) => `user-${i}`);
    const differs = ids.some(
      (id) => isInRollout(id, 'feature-a', 50) !== isInRollout(id, 'feature-b', 50)
    );
    expect(differs).toBe(true);
  });

  it('at negative or >100 percent, clamps to false/true respectively', () => {
    expect(isInRollout('user-x', 'ask-coach', -10)).toBe(false);
    expect(isInRollout('user-x', 'ask-coach', 150)).toBe(true);
  });
});

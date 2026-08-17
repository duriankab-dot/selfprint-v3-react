/**
 * astrology.test.ts
 *
 * Tests for isValidBirthDate() (Phase 5.3 — Numerology Enhancement).
 * Scoped to this one new export - the rest of astrology.ts's deterministic
 * calculations (Life Path, zodiacs, Bazi element) are exercised indirectly
 * throughout astrovera-adapter.test.ts and Onboarding.test.tsx already.
 */

import { describe, it, expect } from 'vitest';
import { isValidBirthDate } from '../astrology';

describe('isValidBirthDate', () => {
  it('accepts a real, well-formed date', () => {
    expect(isValidBirthDate('1990-01-15')).toBe(true);
  });

  it('accepts other parseable date formats', () => {
    expect(isValidBirthDate('January 15, 1990')).toBe(true);
    expect(isValidBirthDate('1990/01/15')).toBe(true);
  });

  it('rejects null, undefined, and empty string', () => {
    expect(isValidBirthDate(null)).toBe(false);
    expect(isValidBirthDate(undefined)).toBe(false);
    expect(isValidBirthDate('')).toBe(false);
    expect(isValidBirthDate('   ')).toBe(false);
  });

  it('rejects unparseable garbage', () => {
    expect(isValidBirthDate('not-a-date')).toBe(false);
    expect(isValidBirthDate('abcd-ef-gh')).toBe(false);
  });

  it('rejects years before 1900', () => {
    expect(isValidBirthDate('1850-01-01')).toBe(false);
  });

  it('rejects years in the future', () => {
    const nextYear = new Date().getFullYear() + 1;
    expect(isValidBirthDate(`${nextYear}-01-01`)).toBe(false);
  });

  it('accepts the current year', () => {
    const thisYear = new Date().getFullYear();
    expect(isValidBirthDate(`${thisYear}-01-01`)).toBe(true);
  });
});

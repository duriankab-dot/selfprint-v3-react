import { describe, it, expect } from 'vitest';
import {
  generateTwinDNA,
  refineTwinDNA,
  saveTwinDNA,
  loadTwinDNA,
  dnaPrimaryColor,
  dnaAccentColor,
  dnaSoftColor,
} from '../twinVisualDNA';
import { mulberry32, hashString } from '../hash';

const USER_A = 'user-aaaa-1111';
const USER_B = 'user-bbbb-2222';
const BIRTH = { dob: '1995-06-15', time: '08:30', place: 'Bangkok, TH' };
const BIRTH2 = { dob: '1988-12-01', time: '03:45', place: 'Chiang Mai, TH' };

describe('TC-101 twinVisualDNA — deterministic unique DNA generator', () => {
  it('same input + same userId → identical DNA (deterministic across calls)', () => {
    const a1 = generateTwinDNA(BIRTH, USER_A);
    const a2 = generateTwinDNA(BIRTH, USER_A);
    expect(a2).toEqual(a1);
  });

  it('same birth data + different userId → distinct DNA', () => {
    const a = generateTwinDNA(BIRTH, USER_A);
    const b = generateTwinDNA(BIRTH, USER_B);
    const aSig = `${a.headShape}|${a.primaryHue}|${a.eyeOffset.toFixed(2)}|${a.dominantSICE}`;
    const bSig = `${b.headShape}|${b.primaryHue}|${b.eyeOffset.toFixed(2)}|${b.dominantSICE}`;
    expect(aSig).not.toBe(bSig);
  });

  it('different birth data → distinct DNA (5 users = 5 distinct twins)', () => {
    const users = ['u1', 'u2', 'u3', 'u4', 'u5'];
    const births = [
      BIRTH, BIRTH2,
      { dob: '2001-03-30', time: '14:10', place: 'Phuket, TH' },
      { dob: '1979-09-09', place: 'Khon Kaen, TH' },
      { dob: '1990-01-02', time: '22:00', place: 'Hat Yai, TH' },
    ];
    const sigs = new Set(
      users.map((u, i) => {
        const d = generateTwinDNA(births[i], u);
        return `${d.headShape}|${Math.round(d.primaryHue)}|${Math.round(d.accentHue)}|${d.dominantSICE}|${d.blindSpotVisual}`;
      }),
    );
    expect(sigs.size).toBe(users.length);
  });

  it('all generated params stay within declared ranges', () => {
    for (let i = 0; i < 200; i++) {
      const dna = generateTwinDNA(
        { dob: `19${60 + i}-0${(i % 9) + 1}-1${i % 9}` },
        `user-${i}`,
      );
      expect(dna.eyeOffset).toBeGreaterThanOrEqual(-3);
      expect(dna.eyeOffset).toBeLessThanOrEqual(3);
      expect(dna.shoulderTilt).toBeGreaterThanOrEqual(-5);
      expect(dna.shoulderTilt).toBeLessThanOrEqual(5);
      expect(dna.spineCurvature).toBeGreaterThanOrEqual(0.8);
      expect(dna.spineCurvature).toBeLessThanOrEqual(1.2);
      expect(dna.limbLengthRatio).toBeGreaterThanOrEqual(0.9);
      expect(dna.limbLengthRatio).toBeLessThanOrEqual(1.1);
      expect(dna.primaryHue).toBeGreaterThanOrEqual(0);
      expect(dna.primaryHue).toBeLessThan(360);
      expect(dna.accentHue).toBeGreaterThanOrEqual(0);
      expect(dna.accentHue).toBeLessThan(360);
      expect(dna.pulseRhythm).toBeGreaterThanOrEqual(0.8);
      expect(dna.pulseRhythm).toBeLessThanOrEqual(1.3);
    }
  });

  it('refineTwinDNA upgrades version and applies dominant SICE + blind spot', () => {
    const base = generateTwinDNA(BIRTH, USER_A);
    const refined = refineTwinDNA(base, { dominantSICE: 'mind', topBlindSpot: 'emotional avoidance' });
    expect(refined.version).toBe(2);
    expect(refined.dominantSICE).toBe('mind');
    expect(refined.blindSpotVisual).toBe('void');
    // seed unchanged — same identity core
    expect(refined.seed).toBe(base.seed);
  });

  it('mulberry32 + hashString are deterministic', () => {
    const seed = hashString('fixed-seed-input');
    const r1 = mulberry32(seed);
    const r2 = mulberry32(seed);
    for (let i = 0; i < 10; i++) {
      expect(r1()).toBe(r2());
    }
    expect(hashString('fixed-seed-input')).toBe(hashString('fixed-seed-input'));
    expect(hashString('fixed-seed-input')).not.toBe(hashString('other-seed'));
  });

  it('save/load DNA roundtrip via localStorage', () => {
    const dna = saveTwinDNA(BIRTH, USER_A);
    expect(loadTwinDNA()).toEqual(dna);
  });

  it('DNA color helpers return hsl strings without hardcoded hex', () => {
    const dna = generateTwinDNA(BIRTH, USER_A);
    expect(dnaPrimaryColor(dna)).toMatch(/^hsl\(\d+, 85%, 60%\)$/);
    expect(dnaAccentColor(dna, 0.5)).toMatch(/^hsla\(\d+, 80%, 65%, 0\.5\)$/);
    expect(dnaSoftColor(dna, 0.2)).toMatch(/^hsla\(\d+, 70%, 74%, 0\.2\)$/);
  });
});
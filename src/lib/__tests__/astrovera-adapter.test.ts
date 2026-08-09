/**
 * astrovera-adapter.test.ts
 *
 * Unit tests for the Astrovera Intelligence Adapter (Phase 1: Foundation).
 * Pure function tests — no network, no Astrovera dependency.
 */

import { describe, it, expect } from 'vitest';
import {
  buildAnalysisRequest,
  transformAnalysisResponse,
  buildFallbackResponse,
  handleAnalysisError,
  isValidPsychologyOutput,
  safeTransformAnalysisResponse,
  reconcileConfidence,
} from '../astrovera-adapter';
import type { AnalysisRequest, AstroveraPsychologyOutput } from '../types/astrovera';

const baseRequest: AnalysisRequest = {
  mood: 'ready',
  birthDate: '1990-01-15',
  finetuneAnswers: { q1: 'ใช้เหตุผล', q2: 'ไอเดีย', q3: 'ยืดหยุ่น', q4: 'ทบทวนตัวเอง' },
};

const validAstroOutput: AstroveraPsychologyOutput = {
  coreIdentity: 'นักปราชญ์ที่กำลังอยู่ในช่วงเปลี่ยนผ่านครั้งใหญ่ของชีวิต',
  traits: ['ต้องการเข้าใจอย่างรอบด้านก่อนตัดสินใจ'],
  strengths: ['วิเคราะห์สถานการณ์รอบด้านก่อนตัดสินใจ'],
  cautions: ['รอข้อมูลครบจนพลาดจังหวะ'],
  confidence: 0.8,
  // 3 รายการ = evidence เพียงพอให้เพดาน reconcileConfidence เป็น 1.0
  // (ดู EVIDENCE_CONFIDENCE_CEILING ใน astrovera-adapter.ts) — ฟิกซ์เจอร์นี้
  // ตั้งใจแทน "คำตอบที่มี evidence รองรับครบ" ไม่ใช่ edge case ของ Phase 5.8
  evidence: [
    'Archetype: The Sage',
    'Traits: ต้องการเข้าใจอย่างรอบด้านก่อนตัดสินใจ',
    'Strength pattern match',
  ],
  limitation: null,
  archetypeKey: 'sage',
  phaseKey: 'd',
  questionRelevance: null,
};

describe('buildAnalysisRequest', () => {
  it('derives archKey from the birth date (via Prototype Core), lowercase', () => {
    const result = buildAnalysisRequest(baseRequest);
    expect(result.archKey).toMatch(/^[a-z]+$/);
    expect([
      'innocent', 'explorer', 'sage', 'everyman', 'lover', 'jester',
      'hero', 'outlaw', 'magician', 'caregiver', 'creator', 'ruler',
    ]).toContain(result.archKey);
  });

  it('derives phaseKey from mood when there is no q5 answer (fallback path)', () => {
    expect(buildAnalysisRequest({ ...baseRequest, mood: 'ready' }).phaseKey).toBe('a');
    expect(buildAnalysisRequest({ ...baseRequest, mood: 'stressed' }).phaseKey).toBe('d');
    expect(buildAnalysisRequest({ ...baseRequest, mood: 'reflective' }).phaseKey).toBe('c');
  });

  it('falls back to phaseKey "c" for an unknown mood', () => {
    expect(buildAnalysisRequest({ ...baseRequest, mood: 'unknown-mood' }).phaseKey).toBe('c');
  });

  it('prefers the real q5 quiz answer over the mood heuristic (Phase 5.2+ gap fix)', () => {
    const withQ5 = (q5: string, mood: string) =>
      buildAnalysisRequest({
        ...baseRequest,
        mood,
        finetuneAnswers: { ...baseRequest.finetuneAnswers, q5 },
      }).phaseKey;

    // mood says one thing, q5 answer says another — q5 wins
    expect(withQ5('กำลังสร้างและเริ่มต้นสิ่งใหม่', 'stressed')).toBe('a');
    expect(withQ5('ขยายและพัฒนาสิ่งที่มีอยู่', 'stressed')).toBe('b');
    expect(withQ5('ต้องการพักและปรับทิศทาง', 'ready')).toBe('c');
    expect(withQ5('อยู่ในช่วงเปลี่ยนแปลงครั้งใหญ่', 'ready')).toBe('d');
  });

  it('ignores an unrecognized q5 answer and falls back to mood', () => {
    const result = buildAnalysisRequest({
      ...baseRequest,
      mood: 'ready',
      finetuneAnswers: { ...baseRequest.finetuneAnswers, q5: 'ไม่ใช่ตัวเลือกจริง' },
    });
    expect(result.phaseKey).toBe('a');
  });

  it('passes question through, defaulting to null', () => {
    expect(buildAnalysisRequest(baseRequest).question).toBeNull();
    expect(buildAnalysisRequest({ ...baseRequest, question: 'ควรลาออกไหม' }).question).toBe(
      'ควรลาออกไหม'
    );
  });

  it('always returns non-empty strengths/blindspot arrays', () => {
    const result = buildAnalysisRequest(baseRequest);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.blindspot.length).toBeGreaterThan(0);
  });

  it('handles a missing/unparseable birth date without throwing', () => {
    expect(() => buildAnalysisRequest({ ...baseRequest, birthDate: '' })).not.toThrow();
  });
});

describe('reconcileConfidence (Phase 5.8)', () => {
  it('caps confidence at 0.5 when there is zero evidence', () => {
    expect(reconcileConfidence(0.95, 0)).toBe(0.5);
  });

  it('caps confidence at 0.65 with one piece of evidence', () => {
    expect(reconcileConfidence(0.95, 1)).toBe(0.65);
  });

  it('caps confidence at 0.8 with two pieces of evidence', () => {
    expect(reconcileConfidence(0.95, 2)).toBe(0.8);
  });

  it('allows full confidence through with three or more pieces of evidence', () => {
    expect(reconcileConfidence(0.95, 3)).toBe(0.95);
    expect(reconcileConfidence(0.95, 10)).toBe(0.95);
  });

  it('never raises confidence above what was claimed, even with lots of evidence', () => {
    expect(reconcileConfidence(0.2, 10)).toBe(0.2);
  });

  it('never returns a negative confidence', () => {
    expect(reconcileConfidence(-1, 5)).toBe(0);
  });
});

describe('transformAnalysisResponse', () => {
  it('maps Astrovera output fields to Selfprint UI shape', () => {
    const result = transformAnalysisResponse(validAstroOutput);
    expect(result.decisionStyle).toBe(validAstroOutput.coreIdentity);
    expect(result.strengths).toEqual(validAstroOutput.strengths);
    expect(result.insights).toEqual(validAstroOutput.traits);
    expect(result.blindSpots).toEqual(validAstroOutput.cautions);
    expect(result.confidence).toBe(0.8);
    expect(result.sources).toEqual(['psychology']);
  });

  it('leaves opportunities empty (no source field in Astrovera output yet)', () => {
    expect(transformAnalysisResponse(validAstroOutput).opportunities).toEqual([]);
  });

  it('reconciles confidence down when evidence is thin (Phase 5.8)', () => {
    const thinEvidenceOutput = { ...validAstroOutput, confidence: 0.9, evidence: ['one thing'] };
    expect(transformAnalysisResponse(thinEvidenceOutput).confidence).toBe(0.65);
  });
});

describe('isValidPsychologyOutput', () => {
  it('accepts a well-formed response', () => {
    expect(isValidPsychologyOutput(validAstroOutput)).toBe(true);
  });

  it.each([
    null,
    undefined,
    42,
    'a string',
    {},
    { ...validAstroOutput, coreIdentity: 123 },
    { ...validAstroOutput, traits: 'not-an-array' },
    { ...validAstroOutput, confidence: '0.8' },
  ])('rejects malformed input: %j', (bad) => {
    expect(isValidPsychologyOutput(bad)).toBe(false);
  });
});

describe('safeTransformAnalysisResponse', () => {
  it('transforms a valid response normally', () => {
    const result = safeTransformAnalysisResponse(validAstroOutput, baseRequest);
    expect(result.sources).toEqual(['psychology']);
  });

  it('falls back to Life Path when given an invalid response', () => {
    const result = safeTransformAnalysisResponse({ garbage: true }, baseRequest);
    expect(result.sources).toEqual(['life_path']);
    expect(result.confidence).toBe(0.6);
  });

  it('caps confidence at 0.5 for a valid response when the birth date is invalid (Phase 5.3)', () => {
    // Even a well-formed Astrovera response is ungrounded if archKey/strengths
    // were derived from a defaulted birth date - confidence should reflect that.
    const result = safeTransformAnalysisResponse(validAstroOutput, {
      ...baseRequest,
      birthDate: '',
    });
    expect(result.sources).toEqual(['psychology']);
    expect(result.confidence).toBe(0.5);
  });

  it('does not raise confidence when it was already below the 0.5 cap', () => {
    const lowConfidenceOutput = { ...validAstroOutput, confidence: 0.2 };
    const result = safeTransformAnalysisResponse(lowConfidenceOutput, {
      ...baseRequest,
      birthDate: '',
    });
    expect(result.confidence).toBe(0.2);
  });
});

describe('buildFallbackResponse', () => {
  it('generates a valid, fully-populated response with no Astrovera dependency', () => {
    const result = buildFallbackResponse(baseRequest);
    expect(result.decisionStyle).toBeTruthy();
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.insights.length).toBeGreaterThan(0);
    expect(result.opportunities.length).toBeGreaterThan(0);
    expect(result.blindSpots.length).toBeGreaterThan(0);
  });

  it('sets confidence to 0.6 (lower than a real Astrovera analysis)', () => {
    expect(buildFallbackResponse(baseRequest).confidence).toBe(0.6);
  });

  it('tags the source as life_path', () => {
    expect(buildFallbackResponse(baseRequest).sources).toEqual(['life_path']);
  });

  it('is deterministic for the same birth date', () => {
    const a = buildFallbackResponse(baseRequest);
    const b = buildFallbackResponse(baseRequest);
    expect(a).toEqual(b);
  });

  it('lowers confidence to 0.3 when the birth date is missing/unparseable (Phase 5.3)', () => {
    // calculateInitialDisciplines() silently defaults to today's date when
    // birthDate can't be parsed - every value derived from it is then
    // arbitrary, not a real signal, so confidence should say so.
    expect(buildFallbackResponse({ ...baseRequest, birthDate: '' }).confidence).toBe(0.3);
    expect(buildFallbackResponse({ ...baseRequest, birthDate: 'not-a-date' }).confidence).toBe(
      0.3
    );
  });
});

describe('handleAnalysisError', () => {
  it('always returns a usable fallback response, never throws', () => {
    expect(() => handleAnalysisError(new Error('boom'), baseRequest)).not.toThrow();
    const result = handleAnalysisError(new Error('boom'), baseRequest);
    expect(result.fallback.sources).toEqual(['life_path']);
  });

  it('classifies AbortError as timeout', () => {
    const err = new Error('The operation was aborted');
    err.name = 'AbortError';
    expect(handleAnalysisError(err, baseRequest).code).toBe('timeout');
  });

  it('classifies a "timeout" message as timeout even without AbortError name', () => {
    expect(handleAnalysisError(new Error('request timeout'), baseRequest).code).toBe('timeout');
  });

  it('classifies fetch/network failures as network_error', () => {
    expect(handleAnalysisError(new Error('fetch failed'), baseRequest).code).toBe(
      'network_error'
    );
  });

  it('classifies a non-Error thrown value as invalid_response', () => {
    expect(handleAnalysisError({ notAnError: true }, baseRequest).code).toBe('invalid_response');
  });

  it('classifies an unrecognized Error message as unknown', () => {
    expect(handleAnalysisError(new Error('something odd happened'), baseRequest).code).toBe(
      'unknown'
    );
  });
});

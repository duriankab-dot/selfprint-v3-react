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
  evidence: ['Archetype: The Sage'],
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

  it('derives phaseKey from mood', () => {
    expect(buildAnalysisRequest({ ...baseRequest, mood: 'ready' }).phaseKey).toBe('a');
    expect(buildAnalysisRequest({ ...baseRequest, mood: 'stressed' }).phaseKey).toBe('d');
    expect(buildAnalysisRequest({ ...baseRequest, mood: 'reflective' }).phaseKey).toBe('c');
  });

  it('falls back to phaseKey "c" for an unknown mood', () => {
    expect(buildAnalysisRequest({ ...baseRequest, mood: 'unknown-mood' }).phaseKey).toBe('c');
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

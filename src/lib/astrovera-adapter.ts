/**
 * astrovera-adapter.ts
 *
 * Intelligence Adapter Layer (Phase 1: Foundation).
 *
 * Pure data transforms between Selfprint's shapes and Astrovera's
 * Psychology knowledge module shapes. Zero side effects, zero network
 * calls — the actual HTTP call to Astrovera (via a Supabase Edge
 * Function) is Phase 2 scope, not this file. This matches Phase 1's own
 * goal: "Zero functional changes to Selfprint" while the plumbing is
 * built and tested.
 *
 * src/components and src/pages must never import astrovera-v2 code
 * directly — only through the functions here.
 */

import { calculateInitialDisciplines, getLifePathProfile, isValidBirthDate } from './astrology';
import {
  ARCHETYPE_KEYS,
  type AnalysisError,
  type AnalysisErrorCode,
  type AnalysisRequest,
  type AnalysisResponse,
  type ArchetypeKey,
  type AstroveraPsychologyInput,
  type AstroveraPsychologyOutput,
  type PhaseKey,
} from './types/astrovera';

// ---------------------------------------------------------------------
// Prototype Core (astrology.ts) uses capitalized English names (Hero,
// Sage, ...); Astrovera's archetypeKey enum uses the same 12 archetypes
// lowercase. The two taxonomies are identical, just cased differently.
// ---------------------------------------------------------------------

function toArchetypeKey(prototypeCore: string): ArchetypeKey {
  const lower = prototypeCore.toLowerCase();
  return (ARCHETYPE_KEYS as readonly string[]).includes(lower)
    ? (lower as ArchetypeKey)
    : 'sage'; // ไม่ควรเกิดขึ้นจริง — 12 archetype ของสองระบบตรงกันพอดี, กัน edge case ไว้เฉยๆ
}

// ---------------------------------------------------------------------
// Heuristic phaseKey from mood — see PhaseKey doc comment in
// types/astrovera.ts for why this is a placeholder, not a real quiz.
// ---------------------------------------------------------------------

const MOOD_TO_PHASE: Record<string, PhaseKey> = {
  stressed: 'd',
  confused: 'd',
  confident: 'b',
  drained: 'd',
  ready: 'a',
  reflective: 'c',
};

function moodToPhaseKey(mood: string): PhaseKey {
  return MOOD_TO_PHASE[mood] ?? 'c';
}

// ---------------------------------------------------------------------
// Request builder: Selfprint → Astrovera Psychology module input
// ---------------------------------------------------------------------

export function buildAnalysisRequest(request: AnalysisRequest): AstroveraPsychologyInput {
  const disciplines = calculateInitialDisciplines(request.birthDate);
  const lifePath = getLifePathProfile(disciplines.lifePathNumber);

  return {
    archKey: toArchetypeKey(disciplines.prototypeCore),
    phaseKey: moodToPhaseKey(request.mood),
    strengths: lifePath.strengths,
    blindspot: lifePath.blindSpots,
    question: request.question ?? null,
  };
}

// ---------------------------------------------------------------------
// Response transform: Astrovera Psychology output → Selfprint UI shape
// ---------------------------------------------------------------------

export function transformAnalysisResponse(astro: AstroveraPsychologyOutput): AnalysisResponse {
  return {
    decisionStyle: astro.coreIdentity,
    strengths: astro.strengths,
    insights: astro.traits,
    opportunities: [],
    blindSpots: astro.cautions,
    confidence: astro.confidence,
    sources: ['psychology'],
  };
}

// ---------------------------------------------------------------------
// Validation guard — used before trusting an Astrovera response
// ---------------------------------------------------------------------

export function isValidPsychologyOutput(data: unknown): data is AstroveraPsychologyOutput {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.coreIdentity === 'string' &&
    Array.isArray(d.traits) &&
    Array.isArray(d.strengths) &&
    Array.isArray(d.cautions) &&
    typeof d.confidence === 'number' &&
    Array.isArray(d.evidence) &&
    typeof d.archetypeKey === 'string'
  );
}

/**
 * Combined validate+transform, safe to call with untrusted network data.
 * Falls back to Life Path if the response doesn't match the expected shape.
 * This is the single entry point the Phase 2 Edge Function call site should use.
 */
export function safeTransformAnalysisResponse(
  data: unknown,
  request: AnalysisRequest
): AnalysisResponse {
  if (!isValidPsychologyOutput(data)) {
    return buildFallbackResponse(request);
  }
  const result = transformAnalysisResponse(data);

  // Claude's archKey/strengths/blindspot inputs (buildAnalysisRequest above)
  // are themselves derived from the birth date, so a defaulted/invalid
  // birth date makes this analysis just as ungrounded as the Life Path
  // fallback — cap confidence at 0.5 regardless of what Claude reported.
  if (!isValidBirthDate(request.birthDate)) {
    result.confidence = Math.min(result.confidence, 0.5);
  }

  return result;
}

// ---------------------------------------------------------------------
// Fallback — fully functional today (no Astrovera dependency), reuses
// Selfprint's existing numerology-based Life Path analysis.
// ---------------------------------------------------------------------

export function buildFallbackResponse(request: AnalysisRequest): AnalysisResponse {
  const disciplines = calculateInitialDisciplines(request.birthDate);
  const lifePath = getLifePathProfile(disciplines.lifePathNumber);

  // 0.6 when the birth date is real (Life Path/Zodiac/Prototype Core all
  // computed from an actual date the person gave), 0.3 when it's missing
  // or unparseable (calculateInitialDisciplines silently defaults to
  // today's date in that case — every value below is then arbitrary, not
  // a real signal about the person, and confidence should say so).
  const confidence = isValidBirthDate(request.birthDate) ? 0.6 : 0.3;

  return {
    decisionStyle: lifePath.decisionStyle,
    strengths: lifePath.strengths,
    insights: lifePath.insights,
    opportunities: lifePath.opportunities,
    blindSpots: lifePath.blindSpots,
    confidence,
    sources: ['life_path'],
  };
}

// ---------------------------------------------------------------------
// Error handling — always returns a usable fallback, never throws
// ---------------------------------------------------------------------

export function handleAnalysisError(error: unknown, request: AnalysisRequest): AnalysisError {
  const fallback = buildFallbackResponse(request);
  const message = error instanceof Error ? error.message : String(error);

  let code: AnalysisErrorCode = 'unknown';
  if (error instanceof Error) {
    if (error.name === 'AbortError' || /timeout/i.test(error.message)) {
      code = 'timeout';
    } else if (/network|fetch/i.test(error.message)) {
      code = 'network_error';
    }
  } else if (error !== undefined && error !== null) {
    // ไม่ใช่ Error instance แต่มีค่า → มักมาจาก response ที่ parse ได้แต่ shape ไม่ตรง schema
    code = 'invalid_response';
  }

  return { code, message, fallback };
}

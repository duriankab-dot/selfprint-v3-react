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
// phaseKey — real quiz answer (preferred) with a mood heuristic fallback.
//
// FinetuningQuestions.tsx's q5 ("ในช่วงชีวิตตอนนี้ คุณรู้สึกอย่างไร?") uses
// the exact question + 4 options from astrovera-v2's own quiz (index.html
// #q3 / js/data/static-data.js LIFE_PHASES) — not a guess at what the
// options should be. answerToPhaseKey() maps that literal answer text back
// to the a/b/c/d key. Selfprint's finetune step is optional/skippable
// (see Onboarding.tsx), and q5 was added after q1-q4 existed, so older
// callers or a skipped finetune step may have no q5 answer — the mood
// heuristic remains as a documented fallback for exactly that case, not
// the primary path anymore.
// ---------------------------------------------------------------------

const PHASE_ANSWER_TO_KEY: Record<string, PhaseKey> = {
  'กำลังสร้างและเริ่มต้นสิ่งใหม่': 'a',
  'ขยายและพัฒนาสิ่งที่มีอยู่': 'b',
  'ต้องการพักและปรับทิศทาง': 'c',
  'อยู่ในช่วงเปลี่ยนแปลงครั้งใหญ่': 'd',
};

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

function resolvePhaseKey(request: AnalysisRequest): PhaseKey {
  const q5Answer = request.finetuneAnswers?.q5;
  if (q5Answer && PHASE_ANSWER_TO_KEY[q5Answer]) {
    return PHASE_ANSWER_TO_KEY[q5Answer];
  }
  return moodToPhaseKey(request.mood);
}

// ---------------------------------------------------------------------
// Request builder: Selfprint → Astrovera Psychology module input
// ---------------------------------------------------------------------

export function buildAnalysisRequest(request: AnalysisRequest): AstroveraPsychologyInput {
  const disciplines = calculateInitialDisciplines(request.birthDate);
  const lifePath = getLifePathProfile(disciplines.lifePathNumber);

  return {
    archKey: toArchetypeKey(disciplines.prototypeCore),
    phaseKey: resolvePhaseKey(request),
    strengths: lifePath.strengths,
    blindspot: lifePath.blindSpots,
    question: request.question ?? null,
  };
}

// ---------------------------------------------------------------------
// Confidence Reconciliation (Phase 5.8) — inspired by astrovera-v2's
// truth.js/responseProtocol.js (deterministic, non-LLM clamp of a
// self-reported confidence score to what the actual evidence supports —
// see docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md, Master Task Audit).
// Not a copy of that code — astrovera's version is bespoke to its own
// multi-agent output shape. Same idea, own implementation:
// `api/intelligence.ts` previously trusted Claude's self-reported
// `confidence` outright. Claude also returns an `evidence: string[]`
// array (see AstroveraPsychologyOutput) that it doesn't have to actually
// use to justify that number — this clamps confidence to a ceiling that
// scales with how much evidence Claude actually cited, so an unsupported
// "0.95 confident" claim with zero evidence can't pass through unclamped.
// ---------------------------------------------------------------------

const EVIDENCE_CONFIDENCE_CEILING = [0.5, 0.65, 0.8, 1.0] as const;

export function reconcileConfidence(claimedConfidence: number, evidenceCount: number): number {
  const clampedCount = Math.max(0, Math.min(evidenceCount, EVIDENCE_CONFIDENCE_CEILING.length - 1));
  const ceiling = EVIDENCE_CONFIDENCE_CEILING[clampedCount];
  return Math.max(0, Math.min(claimedConfidence, ceiling));
}

// ---------------------------------------------------------------------
// Response transform: Astrovera Psychology output → Selfprint UI shape
// ---------------------------------------------------------------------

export function transformAnalysisResponse(astro: AstroveraPsychologyOutput): AnalysisResponse {
  return {
    decisionStyle: astro.coreIdentity,
    strengths: astro.strengths,
    insights: astro.traits,
    // Astrovera's Psychology output has no "opportunities" field of its own
    // (see AstroveraPsychologyOutput) — left [] here on purpose, filled in
    // by safeTransformAnalysisResponse() below using the same Life Path
    // opportunities already computed from the real birth date, instead of
    // fabricating anything from unrelated fields.
    opportunities: [],
    blindSpots: astro.cautions,
    confidence: reconcileConfidence(astro.confidence, astro.evidence?.length ?? 0),
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

  // opportunities gap fix: Astrovera's schema has no such field, so reuse
  // the same deterministic Life Path opportunities (from the real birth
  // date via getLifePathProfile — the same source buildFallbackResponse()
  // below already uses) instead of leaving this permanently empty.
  const disciplines = calculateInitialDisciplines(request.birthDate);
  result.opportunities = getLifePathProfile(disciplines.lifePathNumber).opportunities;

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

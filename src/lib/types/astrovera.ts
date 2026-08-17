/**
 * types/astrovera.ts
 *
 * TypeScript contracts for the Astrovera intelligence integration
 * (see AUDIT_1..8 + Handoff docs, Aug 9 2026 — "Phase 1: Foundation").
 *
 * These types are the boundary between Selfprint's React/UI world and
 * Astrovera's brain (D:\astrovera-v2\brain). Nothing in src/components or
 * src/pages should ever import from astrovera-v2 directly — only through
 * astrovera-adapter.ts, using these shapes.
 */

// ---------------------------------------------------------------------
// Archetype — same 12-value taxonomy as Selfprint's own Prototype Core
// (see src/lib/astrology.ts PROTOTYPE_CORE_MAP), just lowercase here to
// match Astrovera's brain/knowledge/psychology/schema.js enum exactly.
// ---------------------------------------------------------------------

export const ARCHETYPE_KEYS = [
  'innocent', 'explorer', 'sage', 'everyman', 'lover', 'jester',
  'hero', 'outlaw', 'magician', 'caregiver', 'creator', 'ruler',
] as const;

export type ArchetypeKey = (typeof ARCHETYPE_KEYS)[number];

// ---------------------------------------------------------------------
// Life phase — Astrovera's Psychology module also expects a `phaseKey`
// ('a'|'b'|'c'|'d'), normally derived from its own life-phase quiz.
// Selfprint's 4 fine-tuning questions don't cover that dimension yet, so
// buildAnalysisRequest() currently derives it from mood as a documented
// heuristic (see astrovera-adapter.ts) — a real phase-detection question
// is a Phase 2+ follow-up, not solved here.
// ---------------------------------------------------------------------

export type PhaseKey = 'a' | 'b' | 'c' | 'd';

// ---------------------------------------------------------------------
// Request — what Selfprint already has on hand when it wants an analysis
// ---------------------------------------------------------------------

export interface AnalysisRequest {
  mood: string;
  birthDate: string;
  finetuneAnswers: Record<string, string>;
  /** Optional free-text question, e.g. from a future "Ask Coach" feature (Phase 5.5). */
  question?: string | null;
}

// ---------------------------------------------------------------------
// Astrovera Psychology module I/O (mirrors brain/knowledge/psychology/*)
// ---------------------------------------------------------------------

export interface AstroveraPsychologyInput {
  archKey: ArchetypeKey;
  archetypeTh?: string;
  phaseKey: PhaseKey;
  phase?: string;
  strengths: string[];
  blindspot: string[];
  question: string | null;
}

export interface AstroveraPsychologyOutput {
  coreIdentity: string;
  traits: string[];
  strengths: string[];
  cautions: string[];
  confidence: number;
  evidence: string[];
  limitation: string | null;
  archetypeKey: ArchetypeKey;
  phaseKey: PhaseKey;
  questionRelevance?: string | null;
}

// ---------------------------------------------------------------------
// Response — what Selfprint's UI actually renders (InitialBlueprint /
// FullAnalysis props already use this exact shape minus confidence/sources,
// see src/pages/Onboarding.tsx AnalysisProfile)
// ---------------------------------------------------------------------

export interface AnalysisResponse {
  decisionStyle: string;
  strengths: string[];
  insights: string[];
  /**
   * Astrovera's Psychology output has no direct "opportunities" field —
   * this stays [] until Phase 2/5.5 (Insight agent) supplies real content.
   * Not fabricated from unrelated fields.
   */
  opportunities: string[];
  blindSpots: string[];
  confidence: number;
  sources: string[];
}

export type AnalysisErrorCode = 'network_error' | 'invalid_response' | 'timeout' | 'unknown';

export interface AnalysisError {
  code: AnalysisErrorCode;
  message: string;
  fallback: AnalysisResponse;
}

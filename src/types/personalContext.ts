/**
 * Canonical Personal Context — Single Source of Truth
 * 
 * Unified domain model combining:
 * - lib/intelligence: persistence + inference (values, goals, strengths, blindSpots, emotionalRange, decisionStyle, relationships)
 * - services/sice: world adaptation (emotionalState, worldFocus, strengthAreas, growthAreas, worldPersonality)
 * 
 * @module types/personalContext
 */

import type {
  Value,
  Goal,
  Strength,
  BlindSpot,
  EmotionalRange,
  DecisionStyle,
  Relationship,
} from '@/lib/intelligence/types';

// Re-export lib types for convenience
export type {
  Value,
  Goal,
  Strength,
  BlindSpot,
  EmotionalRange,
  DecisionStyle,
  Relationship,
} from '@/lib/intelligence/types';

// Re-export SICE types
export type { PersonalContext as SicePersonalContext } from '@/types/sice';

/**
 * Canonical Personal Context — Unified domain model
 * All PCB callers (lib + SICE) map to/from this interface
 */
export interface CanonicalPersonalContext {
  // Identity
  userId: string;

  // === LIB DOMAIN (persistence + inference) ===
  values: Value[];
  goals: Goal[];
  strengths: Strength[];
  blindSpots: BlindSpot[];
  emotionalRange: EmotionalRange;
  decisionStyle: DecisionStyle;
  relationships: Relationship[];
  confidenceOverall: number;        // 0-1 normalized (lib scale)
  sourceCount: number;              // lib: personal_context entry count
  lastUpdated: Date;
  modelVersion: number;

  // === SICE DOMAIN (world adaptation) ===
  emotionalState: string;           // 'optimistic'|'focused'|'balanced'|'neutral'|'fatigued'|'anxious'|'uncertain'
  currentGoals: string[];           // SICE: string[] from goals_json/focus_areas
  activePatterns: string[];         // SICE: pattern strings with success rates
  worldFocus: string;               // SICE: currentWorld or 'self'
  recentMemories: Array<{ timestamp: string; content: string }>;
  strengthAreas: string[];          // SICE: world_ids with high engagement
  growthAreas: string[];            // SICE: world_ids with low/no engagement
  worldPersonality?: {
    mood: string;
    responseStyle: string;
    focusArea: string;
  };

  // === BRIDGE FIELDS (computed from both) ===
  hubsActive?: string[];            // lib: hubsActive / SICE: derived from worldStats
  birthDate?: string;               // lib: from onboarding / SICE: from users_profiles

  // === META ===
  _provenance: {
    libFields: string[];
    siceFields: string[];
    mergedAt: string;               // ISO timestamp
  };
}

/**
 * Canonical builder result
 */
export interface CanonicalBuilderResult {
  context: CanonicalPersonalContext;
  success: boolean;
  message?: string;
}

/**
 * Input for canonical builder
 */
export interface CanonicalBuilderInput {
  userId: string;
  currentWorld?: string;
  hubsActive?: string[];
  birthDate?: string;
  mood?: string;
  onboardingAnswers?: Record<string, unknown>;
}

/**
 * Cache key factory
 */
export const CANONICAL_PCB_CACHE_KEY = (userId: string, currentWorld?: string) =>
  ['personalContext', userId, 'canonical', currentWorld ?? 'none'] as const;

/**
 * Legacy cache key (for migration/cleanup)
 */
export const LEGACY_PCB_CACHE_KEY = (userId: string) =>
  ['personalContext', userId] as const;

/**
 * Confidence scale constants
 */
export const CONFIDENCE_SCALE = {
  LIB: { min: 0, max: 1, name: 'lib' } as const,
  SICE: { min: 0, max: 100, name: 'sice' } as const,
} as const;

/**
 * Convert lib confidence (0-1) to SICE confidence (0-100)
 */
export function libConfidenceToSice(confidence: number): number {
  if (confidence < 0) return 0;
  if (confidence > 1) return 100;
  return Math.round(confidence * 100);
}

/**
 * Convert SICE confidence (0-100) to lib confidence (0-1)
 */
export function siceConfidenceToLib(confidence: number): number {
  if (confidence < 0) return 0;
  if (confidence > 100) return 1;
  return Math.round(confidence / 100 * 100) / 100; // round to 2 decimal places
}

/**
 * Merge strategy types
 */
export type MergeStrategy = 'lib-primary' | 'sice-primary' | 'union';

/**
 * Default merge strategy: lib-primary with SICE enrichment
 */
export const DEFAULT_MERGE_STRATEGY: MergeStrategy = 'lib-primary';
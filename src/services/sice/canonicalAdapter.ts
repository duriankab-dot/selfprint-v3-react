/**
 * SICE Adapter — Canonical → SICE PersonalContext
 * 
 * Translates unified canonical model to SICE-specific shape
 * Preserves world adaptation fields exactly as expected by SICE callers
 * 
 * @module services/sice/canonicalAdapter
 */

import type { PersonalContext as SicePersonalContext } from '@/types/sice';
import type { CanonicalPersonalContext } from '@/types/personalContext';
import { libConfidenceToSice } from '@/types/personalContext';

/**
 * Convert CanonicalPersonalContext → SICE PersonalContext
 * 
 * Maps SICE domain fields directly from canonical
 * Converts confidence from lib scale (0-1) to SICE scale (0-100)
 * Ignores lib-specific fields (persistence + rich inference)
 */
export function canonicalToSicePersonalContext(
  canonical: CanonicalPersonalContext
): SicePersonalContext {
  return {
    userId: canonical.userId,
    emotionalState: canonical.emotionalState,
    currentGoals: canonical.currentGoals,
    activePatterns: canonical.activePatterns,
    worldFocus: canonical.worldFocus,
    recentMemories: canonical.recentMemories,
    strengthAreas: canonical.strengthAreas,
    growthAreas: canonical.growthAreas,
    worldPersonality: canonical.worldPersonality,
  };
}

/**
 * Convert SICE PersonalContext → CanonicalPersonalContext
 * 
 * Used when SICE builder provides enrichment data
 * Lib fields will be populated by lib builder
 */
export function sicePersonalContextToCanonical(
  sice: SicePersonalContext,
  options?: { userId?: string }
): CanonicalPersonalContext {
  const now = new Date();
  const userId = options?.userId || sice.userId;
  
  return {
    userId,
    
    // Lib domain fields (empty - will be populated by lib)
    values: [],
    goals: [],
    strengths: [],
    blindSpots: [],
    emotionalRange: {
      primaryMoods: [],
      volatility: 0.5,
      responseToStress: '',
      emotionalTriggers: [],
      confidence: 0.5,
    },
    decisionStyle: {
      type: 'mixed',
      description: '',
      confidence: 0.5,
      evidence: [],
    },
    relationships: [],
    confidenceOverall: 0,
    sourceCount: 0,
    lastUpdated: now,
    modelVersion: 1,
    
    // SICE domain fields (direct mapping)
    emotionalState: sice.emotionalState,
    currentGoals: sice.currentGoals,
    activePatterns: sice.activePatterns,
    worldFocus: sice.worldFocus,
    recentMemories: sice.recentMemories,
    strengthAreas: sice.strengthAreas,
    growthAreas: sice.growthAreas,
    worldPersonality: sice.worldPersonality,
    
    // Bridge fields
    hubsActive: [],
    birthDate: undefined,
    
    // Provenance
    _provenance: {
      libFields: [],
      siceFields: [
        'userId', 'emotionalState', 'currentGoals', 'activePatterns',
        'worldFocus', 'recentMemories', 'strengthAreas', 'growthAreas',
        'worldPersonality'
      ],
      mergedAt: now.toISOString(),
    },
  };
}

/**
 * Convert SICE result to canonical (for SICEOrchestrator engine #1)
 * 
 * The SICE engine returns SICEOutput with confidence 0-100
 * This converts to canonical for internal orchestration use
 */
export interface SiceEngineOutput {
  engineId: number;
  engineName: string;
  result: SicePersonalContext | null;
  confidence: number;  // 0-100 scale
  executionTime: number;
  error?: string;
}

export function siceEngineOutputToCanonical(
  output: SiceEngineOutput
): CanonicalPersonalContext | null {
  if (!output.result) return null;
  
  return sicePersonalContextToCanonical(output.result);
}

/**
 * Create SICE output from canonical (for engine #1 return)
 */
export function canonicalToSiceEngineOutput(
  canonical: CanonicalPersonalContext,
  executionTime: number
): SiceEngineOutput {
  return {
    engineId: 1,
    engineName: 'PersonalContextBuilder',
    result: canonicalToSicePersonalContext(canonical),
    confidence: libConfidenceToSice(canonical.confidenceOverall),
    executionTime,
  };
}

/**
 * Field provenance tracking for SICE adapter
 */
export const SICE_ADAPTER_PROVENANCE = {
  // Fields that come FROM SICE builder
  siceFields: [
    'userId', 'emotionalState', 'currentGoals', 'activePatterns',
    'worldFocus', 'recentMemories', 'strengthAreas', 'growthAreas',
    'worldPersonality'
  ] as const,
  
  // Fields that are lib-specific (not in SICE shape)
  libOnlyFields: [
    'values', 'goals', 'strengths', 'blindSpots',
    'emotionalRange', 'decisionStyle', 'relationships',
    'confidenceOverall', 'sourceCount', 'lastUpdated',
    'modelVersion', 'hubsActive', 'birthDate'
  ] as const,
} as const;

/**
 * Merge SICE enrichment into canonical (lib-primary strategy)
 * 
 * Preserves lib fields, adds/overwrites SICE fields
 * Also converts SICE currentGoals to lib Goal[] when lib goals are empty
 */
export function enrichCanonicalWithSice(
  canonical: CanonicalPersonalContext,
  sice: SicePersonalContext
): CanonicalPersonalContext {
  const now = new Date();
  
  // Convert SICE currentGoals to lib Goal[] when lib goals are empty
  const mergedGoals = canonical.goals.length > 0 ? canonical.goals : 
    sice.currentGoals.map(g => ({
      title: g,
      description: '',
      confidence: 0.5,
      evidence: [],
      inferredFromSources: [],
    }));
  
  // Convert SICE strengthAreas to lib Strength[] when lib strengths are empty
  const mergedStrengths = canonical.strengths.length > 0 ? canonical.strengths : 
    sice.strengthAreas.map(s => ({
      name: s,
      description: '',
      confidence: 0.5,
      evidence: [],
      inferredFromSources: [],
      relatedPatterns: [],
    }));

  return {
    ...canonical,
    
    // Lib domain fields (enriched from SICE when empty)
    goals: mergedGoals,
    strengths: mergedStrengths,
    
    // SICE domain fields (enrichment - overwrite/add)
    emotionalState: sice.emotionalState || canonical.emotionalState,
    currentGoals: sice.currentGoals.length > 0 ? sice.currentGoals : canonical.currentGoals,
    activePatterns: sice.activePatterns.length > 0 ? sice.activePatterns : canonical.activePatterns,
    worldFocus: sice.worldFocus || canonical.worldFocus,
    recentMemories: sice.recentMemories.length > 0 ? sice.recentMemories : canonical.recentMemories,
    strengthAreas: sice.strengthAreas.length > 0 ? sice.strengthAreas : canonical.strengthAreas,
    growthAreas: sice.growthAreas.length > 0 ? sice.growthAreas : canonical.growthAreas,
    worldPersonality: sice.worldPersonality || canonical.worldPersonality,
    
    // Bridge: prefer SICE for worldFocus derived fields
    hubsActive: (canonical.hubsActive?.length ?? 0) > 0 ? canonical.hubsActive : 
      (sice.strengthAreas.length > 0 ? sice.strengthAreas : (canonical.hubsActive ?? [])),
    
    // Update provenance
    _provenance: {
      libFields: canonical._provenance.libFields,
      siceFields: [
        ...new Set([
          ...canonical._provenance.siceFields,
          'emotionalState', 'currentGoals', 'activePatterns',
          'worldFocus', 'recentMemories', 'strengthAreas',
          'growthAreas', 'worldPersonality'
        ])
      ],
      mergedAt: now.toISOString(),
    },
  };
}

/**
 * Merge strategy: lib-primary with SICE enrichment
 * 
 * This is the DEFAULT_MERGE_STRATEGY from types/personalContext.ts
 */
export function mergeLibPrimaryWithSiceEnrichment(
  libCanonical: CanonicalPersonalContext,
  siceCanonical: CanonicalPersonalContext
): CanonicalPersonalContext {
  return enrichCanonicalWithSice(libCanonical, siceCanonical);
}
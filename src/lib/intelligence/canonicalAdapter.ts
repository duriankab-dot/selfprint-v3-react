/**
 * Lib Adapter — Canonical → lib/intelligence PersonalContext
 * 
 * Translates unified canonical model to lib-specific shape
 * Preserves all lib domain fields exactly as expected by existing callers
 * 
 * @module lib/intelligence/canonicalAdapter
 */

import type {
  PersonalContext as LibPersonalContext,
} from './types';

import type {
  CanonicalPersonalContext,
} from '@/types/personalContext';

/**
 * Convert CanonicalPersonalContext → lib PersonalContext
 * 
 * Maps all lib domain fields directly from canonical
 * Ignores SICE-specific fields (world adaptation)
 */
export function canonicalToLibPersonalContext(
  canonical: CanonicalPersonalContext
): LibPersonalContext {
  return {
    userId: canonical.userId,
    values: canonical.values,
    goals: canonical.goals,
    strengths: canonical.strengths,
    blindSpots: canonical.blindSpots,
    emotionalRange: canonical.emotionalRange,
    decisionStyle: canonical.decisionStyle,
    relationships: canonical.relationships,
    hubsActive: canonical.hubsActive,
    lastUpdated: canonical.lastUpdated,
    modelVersion: canonical.modelVersion,
    confidenceOverall: canonical.confidenceOverall,
    sourceCount: canonical.sourceCount,
  };
}

/**
 * Convert lib PersonalContext → CanonicalPersonalContext
 * 
 * Used when lib builder is primary source
 * SICE fields will be populated by enrichment layer
 */
export function libPersonalContextToCanonical(
  lib: LibPersonalContext,
  options?: {
    userId?: string;
    currentWorld?: string;
  }
): CanonicalPersonalContext {
  const now = new Date();
  const userId = options?.userId || lib.userId;
  
  return {
    userId,
    
    // Lib domain fields (direct mapping)
    values: lib.values,
    goals: lib.goals,
    strengths: lib.strengths,
    blindSpots: lib.blindSpots,
    emotionalRange: lib.emotionalRange,
    decisionStyle: lib.decisionStyle,
    relationships: lib.relationships,
    confidenceOverall: lib.confidenceOverall,
    sourceCount: lib.sourceCount,
    lastUpdated: lib.lastUpdated,
    modelVersion: lib.modelVersion,
    
    // SICE domain fields (default/empty - will be enriched)
    emotionalState: 'balanced',
    currentGoals: [],
    activePatterns: [],
    worldFocus: options?.currentWorld || 'self',
    recentMemories: [],
    strengthAreas: [],
    growthAreas: [],
    worldPersonality: undefined,
    
    // Bridge fields
    hubsActive: lib.hubsActive,
    birthDate: undefined,
    
    // Provenance
    _provenance: {
      libFields: [
        'userId', 'values', 'goals', 'strengths', 'blindSpots',
        'emotionalRange', 'decisionStyle', 'relationships',
        'confidenceOverall', 'sourceCount', 'lastUpdated',
        'modelVersion', 'hubsActive'
      ],
      siceFields: [],
      mergedAt: now.toISOString(),
    },
  };
}

/**
 * Create empty canonical context for user
 */
export function createEmptyCanonicalContext(
  userId: string,
  options?: { currentWorld?: string }
): CanonicalPersonalContext {
  const now = new Date();
  return {
    userId,
    
    // Lib domain (empty)
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
    
    // SICE domain (defaults)
    emotionalState: 'balanced',
    currentGoals: [],
    activePatterns: [],
    worldFocus: options?.currentWorld || 'self',
    recentMemories: [],
    strengthAreas: [],
    growthAreas: [],
    worldPersonality: undefined,
    
    // Bridge
    hubsActive: [],
    birthDate: undefined,
    
    // Provenance
    _provenance: {
      libFields: [],
      siceFields: [],
      mergedAt: now.toISOString(),
    },
  };
}

/**
 * Field provenance tracking for lib adapter
 */
export const LIB_ADAPTER_PROVENANCE = {
  // Fields that come FROM lib builder
  libFields: [
    'userId', 'values', 'goals', 'strengths', 'blindSpots',
    'emotionalRange', 'decisionStyle', 'relationships',
    'confidenceOverall', 'sourceCount', 'lastUpdated',
    'modelVersion', 'hubsActive'
  ] as const,
  
  // Fields that are SICE-specific (not in lib shape)
  siceOnlyFields: [
    'emotionalState', 'currentGoals', 'activePatterns',
    'worldFocus', 'recentMemories', 'strengthAreas',
    'growthAreas', 'worldPersonality'
  ] as const,
} as const;
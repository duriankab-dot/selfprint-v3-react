/**
 * Unit Tests for Canonical Personal Context Adapters
 * 
 * Tests mapping between canonical model and lib/SICE shapes
 * Tests confidence scale conversion (0-1 ↔ 0-100)
 * 
 * @module types/personalContext.test
 */

import { CANONICAL_PCB_CACHE_KEY, LEGACY_PCB_CACHE_KEY } from './personalContext';

import { describe, it, expect } from 'vitest';
import {
  libConfidenceToSice,
  siceConfidenceToLib,
  libConfidenceToSice as libToSice,
  siceConfidenceToLib as siceToLib,
} from './personalContext';

import {
  canonicalToLibPersonalContext,
  libPersonalContextToCanonical,
  createEmptyCanonicalContext,
} from '@/lib/intelligence/canonicalAdapter';

import {
  canonicalToSicePersonalContext,
  sicePersonalContextToCanonical,
  enrichCanonicalWithSice,
  mergeLibPrimaryWithSiceEnrichment,
} from '@/services/sice/canonicalAdapter';

import type {
  CanonicalPersonalContext,
} from '@/types/personalContext';

// Mock types for testing
const mockLibPersonalContext = {
  userId: 'u_123',
  values: [{ name: 'Test Value', description: 'desc', confidence: 0.8, evidence: [], inferredFromSources: [], inferred: true }],
  goals: [{ title: 'Test Goal', description: 'desc', confidence: 0.7, evidence: [], inferredFromSources: [] }],
  strengths: [{ name: 'Test Strength', description: 'desc', confidence: 0.9, evidence: [], inferredFromSources: [], relatedPatterns: [] }],
  blindSpots: [{ title: 'Test Blind Spot', description: 'desc', confidence: 0.6, evidence: [], inferredFromSources: [], sensitivity: 'medium' }],
  emotionalRange: {
    primaryMoods: ['happy'],
    volatility: 0.3,
    responseToStress: 'calm',
    emotionalTriggers: [],
    confidence: 0.8,
  },
  decisionStyle: {
    type: 'analytical' as const,
    description: 'Analytical decision maker',
    confidence: 0.8,
    evidence: [],
  },
  relationships: [],
  confidenceOverall: 0.75,
  sourceCount: 10,
  lastUpdated: new Date('2026-09-28T12:00:00Z'),
  modelVersion: 1,
  hubsActive: ['career', 'health'],
};

const mockSicePersonalContext = {
  userId: 'u_123',
  emotionalState: 'optimistic',
  currentGoals: ['Goal A', 'Goal B'],
  activePatterns: ['Pattern 1 (80% success)', 'Pattern 2 (65% success)'],
  worldFocus: 'career',
  recentMemories: [
    { timestamp: '2026-09-28T10:00:00Z', content: 'Memory 1' },
    { timestamp: '2026-09-28T09:00:00Z', content: 'Memory 2' },
  ],
  strengthAreas: ['career', 'learning'],
  growthAreas: ['relationship', 'money'],
  worldPersonality: {
    mood: 'curious',
    responseStyle: 'exploratory',
    focusArea: 'growth',
  },
};

describe('Confidence Scale Conversion', () => {
  describe('libConfidenceToSice (0-1 → 0-100)', () => {
    it('converts 0 to 0', () => {
      expect(libConfidenceToSice(0)).toBe(0);
    });

    it('converts 1 to 100', () => {
      expect(libConfidenceToSice(1)).toBe(100);
    });

    it('converts 0.5 to 50', () => {
      expect(libConfidenceToSice(0.5)).toBe(50);
    });

    it('converts 0.75 to 75', () => {
      expect(libConfidenceToSice(0.75)).toBe(75);
    });

    it('converts 0.33 to 33', () => {
      expect(libConfidenceToSice(0.33)).toBe(33);
    });

    it('clamps negative to 0', () => {
      expect(libConfidenceToSice(-0.1)).toBe(0);
    });

    it('clamps >1 to 100', () => {
      expect(libConfidenceToSice(1.5)).toBe(100);
    });

    it('rounds correctly', () => {
      expect(libConfidenceToSice(0.666)).toBe(67);
      expect(libConfidenceToSice(0.664)).toBe(66);
    });
  });

  describe('siceConfidenceToLib (0-100 → 0-1)', () => {
    it('converts 0 to 0', () => {
      expect(siceConfidenceToLib(0)).toBe(0);
    });

    it('converts 100 to 1', () => {
      expect(siceConfidenceToLib(100)).toBe(1);
    });

    it('converts 50 to 0.5', () => {
      expect(siceConfidenceToLib(50)).toBe(0.5);
    });

    it('converts 75 to 0.75', () => {
      expect(siceConfidenceToLib(75)).toBe(0.75);
    });

    it('converts 33 to 0.33', () => {
      expect(siceConfidenceToLib(33)).toBe(0.33);
    });

    it('clamps negative to 0', () => {
      expect(siceConfidenceToLib(-10)).toBe(0);
    });

    it('clamps >100 to 1', () => {
      expect(siceConfidenceToLib(150)).toBe(1);
    });

    it('rounds to 2 decimal places', () => {
      expect(siceConfidenceToLib(67)).toBe(0.67);
      expect(siceConfidenceToLib(66)).toBe(0.66);
    });
  });

  describe('Round-trip consistency', () => {
    it('lib → sice → lib preserves value', () => {
      const original = 0.75;
      const sice = libConfidenceToSice(original);
      const back = siceConfidenceToLib(sice);
      expect(back).toBe(original);
    });

    it('sice → lib → sice preserves value', () => {
      const original = 75;
      const lib = siceConfidenceToLib(original);
      const back = libConfidenceToSice(lib);
      expect(back).toBe(original);
    });
  });
});

describe('Lib Adapter (canonical ↔ lib)', () => {
  describe('canonicalToLibPersonalContext', () => {
    it('maps all lib domain fields correctly', () => {
      const canonical = libPersonalContextToCanonical(mockLibPersonalContext);
      const lib = canonicalToLibPersonalContext(canonical);

      expect(lib.userId).toBe('u_123');
      expect(lib.values).toHaveLength(1);
      expect(lib.goals).toHaveLength(1);
      expect(lib.strengths).toHaveLength(1);
      expect(lib.blindSpots).toHaveLength(1);
      expect(lib.emotionalRange).toEqual(canonical.emotionalRange);
      expect(lib.decisionStyle).toEqual(canonical.decisionStyle);
      expect(lib.relationships).toEqual([]);
      expect(lib.hubsActive).toEqual(['career', 'health']);
      expect(lib.confidenceOverall).toBe(0.75);
      expect(lib.sourceCount).toBe(10);
      expect(lib.modelVersion).toBe(1);
    });

    it('ignores SICE-specific fields', () => {
      const canonical = libPersonalContextToCanonical(mockLibPersonalContext);
      // Add SICE enrichment
      canonical.emotionalState = 'optimistic';
      canonical.worldFocus = 'career';
      canonical.worldPersonality = { mood: 'curious', responseStyle: 'exploratory', focusArea: 'growth' };

      const lib = canonicalToLibPersonalContext(canonical);

      // SICE fields should not appear in lib shape
      expect('emotionalState' in lib).toBe(false);
      expect('worldFocus' in lib).toBe(false);
      expect('worldPersonality' in lib).toBe(false);
      expect('strengthAreas' in lib).toBe(false);
    });
  });

  describe('libPersonalContextToCanonical', () => {
    it('creates canonical with lib provenance', () => {
      const canonical = libPersonalContextToCanonical(mockLibPersonalContext);

      expect(canonical.userId).toBe('u_123');
      expect(canonical.values).toHaveLength(1);
      expect(canonical.goals).toHaveLength(1);
      expect(canonical.strengths).toHaveLength(1);
      expect(canonical.confidenceOverall).toBe(0.75);
      expect(canonical._provenance.libFields).toContain('userId');
      expect(canonical._provenance.libFields).toContain('values');
      expect(canonical._provenance.siceFields).toHaveLength(0);
    });

    it('sets SICE fields to defaults', () => {
      const canonical = libPersonalContextToCanonical(mockLibPersonalContext);

      expect(canonical.emotionalState).toBe('balanced');
      expect(canonical.currentGoals).toEqual([]);
      expect(canonical.activePatterns).toEqual([]);
      expect(canonical.worldFocus).toBe('self');
      expect(canonical.recentMemories).toEqual([]);
      expect(canonical.strengthAreas).toEqual([]);
      expect(canonical.growthAreas).toEqual([]);
      expect(canonical.worldPersonality).toBeUndefined();
    });

    it('accepts currentWorld option', () => {
      const canonical = libPersonalContextToCanonical(mockLibPersonalContext, { currentWorld: 'career' });
      expect(canonical.worldFocus).toBe('career');
    });
  });

  describe('createEmptyCanonicalContext', () => {
    it('creates valid empty canonical context', () => {
      const canonical = createEmptyCanonicalContext('u_456', { currentWorld: 'health' });

      expect(canonical.userId).toBe('u_456');
      expect(canonical.values).toEqual([]);
      expect(canonical.goals).toEqual([]);
      expect(canonical.emotionalState).toBe('balanced');
      expect(canonical.worldFocus).toBe('health');
      expect(canonical._provenance.libFields).toEqual([]);
      expect(canonical._provenance.siceFields).toEqual([]);
    });
  });
});

describe('SICE Adapter (canonical ↔ SICE)', () => {
  describe('canonicalToSicePersonalContext', () => {
    it('maps all SICE domain fields correctly', () => {
      const canonical = sicePersonalContextToCanonical(mockSicePersonalContext);
      const sice = canonicalToSicePersonalContext(canonical);

      expect(sice.userId).toBe('u_123');
      expect(sice.emotionalState).toBe('optimistic');
      expect(sice.currentGoals).toEqual(['Goal A', 'Goal B']);
      expect(sice.activePatterns).toEqual(['Pattern 1 (80% success)', 'Pattern 2 (65% success)']);
      expect(sice.worldFocus).toBe('career');
      expect(sice.recentMemories).toHaveLength(2);
      expect(sice.strengthAreas).toEqual(['career', 'learning']);
      expect(sice.growthAreas).toEqual(['relationship', 'money']);
      expect(sice.worldPersonality).toEqual({
        mood: 'curious',
        responseStyle: 'exploratory',
        focusArea: 'growth',
      });
    });

    it('ignores lib-specific fields', () => {
      const canonical = sicePersonalContextToCanonical(mockSicePersonalContext);
      // Add lib fields
      canonical.values = [{ name: 'Test', description: 'desc', confidence: 0.8, evidence: [], inferredFromSources: [], inferred: true }];
      canonical.goals = [{ title: 'Test', description: 'desc', confidence: 0.7, evidence: [], inferredFromSources: [] }];

      const sice = canonicalToSicePersonalContext(canonical);

      expect('values' in sice).toBe(false);
      expect('goals' in sice).toBe(false);
      expect('strengths' in sice).toBe(false);
      expect('blindSpots' in sice).toBe(false);
      expect('confidenceOverall' in sice).toBe(false);
    });
  });

  describe('sicePersonalContextToCanonical', () => {
    it('creates canonical with SICE provenance', () => {
      const canonical = sicePersonalContextToCanonical(mockSicePersonalContext);

      expect(canonical.userId).toBe('u_123');
      expect(canonical.emotionalState).toBe('optimistic');
      expect(canonical.currentGoals).toEqual(['Goal A', 'Goal B']);
      expect(canonical.activePatterns).toEqual(['Pattern 1 (80% success)', 'Pattern 2 (65% success)']);
      expect(canonical.worldFocus).toBe('career');
      expect(canonical.recentMemories).toHaveLength(2);
      expect(canonical.strengthAreas).toEqual(['career', 'learning']);
      expect(canonical.growthAreas).toEqual(['relationship', 'money']);
      expect(canonical.worldPersonality).toEqual({
        mood: 'curious',
        responseStyle: 'exploratory',
        focusArea: 'growth',
      });
      expect(canonical._provenance.siceFields).toContain('emotionalState');
      expect(canonical._provenance.siceFields).toContain('worldPersonality');
      expect(canonical._provenance.libFields).toHaveLength(0);
    });

    it('sets lib fields to defaults', () => {
      const canonical = sicePersonalContextToCanonical(mockSicePersonalContext);

      expect(canonical.values).toEqual([]);
      expect(canonical.goals).toEqual([]);
      expect(canonical.strengths).toEqual([]);
      expect(canonical.confidenceOverall).toBe(0);
      expect(canonical.sourceCount).toBe(0);
    });
  });
});

describe('Canonical Merge (lib-primary with SICE enrichment)', () => {
  describe('enrichCanonicalWithSice', () => {
    it('preserves lib fields and adds SICE fields', () => {
      const libCanonical = libPersonalContextToCanonical(mockLibPersonalContext);
      const siceCanonical = sicePersonalContextToCanonical(mockSicePersonalContext);

      const merged = enrichCanonicalWithSice(libCanonical, siceCanonical);

      // Lib fields preserved
      expect(merged.values).toHaveLength(1);
      expect(merged.goals).toHaveLength(1);
      expect(merged.strengths).toHaveLength(1);
      expect(merged.confidenceOverall).toBe(0.75);
      expect(merged.sourceCount).toBe(10);

      // SICE fields added/updated
      expect(merged.emotionalState).toBe('optimistic');
      expect(merged.worldFocus).toBe('career');
      expect(merged.recentMemories).toHaveLength(2);
      expect(merged.strengthAreas).toEqual(['career', 'learning']);
      expect(merged.growthAreas).toEqual(['relationship', 'money']);
      expect(merged.worldPersonality).toEqual({
        mood: 'curious',
        responseStyle: 'exploratory',
        focusArea: 'growth',
      });
    });

    it('updates provenance with merged fields', () => {
      const libCanonical = libPersonalContextToCanonical(mockLibPersonalContext);
      const siceCanonical = sicePersonalContextToCanonical(mockSicePersonalContext);

      const merged = enrichCanonicalWithSice(libCanonical, siceCanonical);

      expect(merged._provenance.libFields).toContain('userId');
      expect(merged._provenance.libFields).toContain('values');
      expect(merged._provenance.siceFields).toContain('emotionalState');
      expect(merged._provenance.siceFields).toContain('worldFocus');
      expect(merged._provenance.siceFields).toContain('worldPersonality');
    });

    it('does not overwrite lib goals with SICE currentGoals', () => {
      const libCanonical = libPersonalContextToCanonical(mockLibPersonalContext);
      const siceCanonical = sicePersonalContextToCanonical(mockSicePersonalContext);

      const merged = enrichCanonicalWithSice(libCanonical, siceCanonical);

      // Lib has rich Goal[], should be preserved
      expect(merged.goals).toHaveLength(1);
      expect(merged.goals[0].title).toBe('Test Goal');
    });

    it('handles empty lib goals with SICE currentGoals', () => {
      const libCanonical = libPersonalContextToCanonical({ ...mockLibPersonalContext, goals: [] });
      const siceCanonical = sicePersonalContextToCanonical(mockSicePersonalContext);

      const merged = enrichCanonicalWithSice(libCanonical, siceCanonical);

      // Should convert SICE string[] to lib Goal[]
      expect(merged.goals).toHaveLength(2);
      expect(merged.goals[0].title).toBe('Goal A');
      expect(merged.goals[1].title).toBe('Goal B');
    });
  });

  describe('mergeLibPrimaryWithSiceEnrichment', () => {
    it('is alias for enrichCanonicalWithSice', () => {
      const libCanonical = libPersonalContextToCanonical(mockLibPersonalContext);
      const siceCanonical = sicePersonalContextToCanonical(mockSicePersonalContext);

      const merged1 = enrichCanonicalWithSice(libCanonical, siceCanonical);
      const merged2 = mergeLibPrimaryWithSiceEnrichment(libCanonical, siceCanonical);

      // Compare all fields except mergedAt timestamp (which differs by milliseconds)
      const { _provenance: p1, ...rest1 } = merged1;
      const { _provenance: p2, ...rest2 } = merged2;
      expect(rest1).toEqual(rest2);
      // Compare provenance fields except mergedAt
      expect(p1.libFields).toEqual(p2.libFields);
      expect(p1.siceFields).toEqual(p2.siceFields);
    });
  });
});

describe('Canonical Builder Integration', () => {
  it('exports CanonicalPersonalContextBuilder class', async () => {
    const { CanonicalPersonalContextBuilder } = await import('@/lib/intelligence/CanonicalPersonalContextBuilder');
    expect(CanonicalPersonalContextBuilder).toBeDefined();
    expect(typeof CanonicalPersonalContextBuilder).toBe('function');
  });

  it('can instantiate builder', async () => {
    const { CanonicalPersonalContextBuilder } = await import('@/lib/intelligence/CanonicalPersonalContextBuilder');
    const builder = new CanonicalPersonalContextBuilder();
    expect(builder).toBeInstanceOf(CanonicalPersonalContextBuilder);
  });

  it('has getLibBuilder and getSiceBuilder methods', async () => {
    const { CanonicalPersonalContextBuilder } = await import('@/lib/intelligence/CanonicalPersonalContextBuilder');
    const builder = new CanonicalPersonalContextBuilder();
    expect(typeof builder.getLibBuilder).toBe('function');
    expect(typeof builder.getSiceBuilder).toBe('function');
  });
});

describe('Canonical Cache Key', () => {
  it('generates correct canonical key', () => {
    const key = CANONICAL_PCB_CACHE_KEY('u_123');
    expect(key).toEqual(['personalContext', 'u_123', 'canonical']);
  });

  it('generates correct legacy key', () => {
    const key = LEGACY_PCB_CACHE_KEY('u_123');
    expect(key).toEqual(['personalContext', 'u_123']);
  });
});
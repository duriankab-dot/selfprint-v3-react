/**
 * CanonicalPersonalContextBuilder Integration Tests
 * 
 * Verifies the canonical composition contract:
 * 1. lib is primary source
 * 2. SICE is world-aware enrichment
 * 3. merge is deterministic
 * 4. No lib field overwritten by SICE unintentionally
 * 5. goals vs currentGoals not confused
 * 6. strengths vs strengthAreas not confused
 * 7. emotionalRange vs emotionalState at different semantic levels
 * 8. worldFocus from runtime/world context
 * 9. worldPersonality works
 * 10. recentMemories, activePatterns, growthAreas passed through
 * 11. lib persistence capability preserved
 */

import { CanonicalPersonalContextBuilder } from './CanonicalPersonalContextBuilder';
import type { CanonicalBuilderInput } from '@/types/personalContext';
import { libConfidenceToSice } from '@/types/personalContext';

// Mock data objects (defined outside so they're accessible)
const MOCK_LIB = {
  userId: 'u_test',
  values: [{ id: 'v1', name: 'ความซื่อสัตย์', category: 'core', confidence: 0.9, sourceRefs: [], createdAt: new Date(), updatedAt: new Date() }],
  goals: [{ title: 'เรียนภาษาใหม่', description: 'ภาษาญี่ปุ่น', confidence: 0.8, evidence: [], inferredFromSources: [] }],
  strengths: [{ name: 'ความอดทน', description: 'อดทนได้ดี', confidence: 0.85, evidence: [], inferredFromSources: [], relatedPatterns: [] }],
  blindSpots: [],
  emotionalRange: {
    primaryMoods: ['calm', 'focused'],
    volatility: 0.3,
    responseToStress: 'analytical',
    emotionalTriggers: ['deadline pressure'],
    confidence: 0.8,
  },
  decisionStyle: {
    type: 'analytical',
    description: 'Analytical decision maker',
    confidence: 0.8,
    evidence: [],
  },
  relationships: [],
  confidenceOverall: 0.75,
  sourceCount: 10,
  lastUpdated: new Date(),
  modelVersion: 2,
  hubsActive: ['career', 'learning'],
};

const MOCK_EMPTY_LIB = {
  userId: 'u_new',
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
  lastUpdated: new Date(),
  modelVersion: 1,
  hubsActive: [],
};

// Build sice result dynamically based on currentWorld (stable timestamps for determinism)
const STABLE_TIMESTAMP = new Date('2026-09-28T00:00:00.000Z').toISOString();
function makeSiceResult(currentWorld: string = 'career') {
  return {
    engineId: 1,
    engineName: 'PersonalContextBuilder',
    result: {
      userId: 'u_test',
      emotionalState: currentWorld === 'career' ? 'focused' : currentWorld === 'relationship' ? 'warm' : 'balanced',
      currentGoals: currentWorld === 'career' 
        ? ['เรียนภาษาญี่ปุ่น', 'พัฒนาอาชีพ']
        : currentWorld === 'relationship'
          ? ['ปรับปรุงความสัมพันธ์', 'สร้างเครือข่าย']
          : ['ค้นหาความสมดุล'],
      activePatterns: ['deep-work-morning (85% success)'],
      worldFocus: currentWorld || 'self',
      recentMemories: [
        { timestamp: STABLE_TIMESTAMP, content: 'ทำโปรเจกต์เสร็จทันเวลา' },
        { timestamp: STABLE_TIMESTAMP, content: 'เรียนภาษา 30 นาที' },
      ],
      strengthAreas: currentWorld === 'career' ? ['career', 'learning'] : ['relationship', 'health'],
      growthAreas: currentWorld === 'career' ? ['relationship', 'health'] : ['career', 'money'],
      worldPersonality: {
        mood: currentWorld === 'career' ? 'determined' : currentWorld === 'relationship' ? 'empathetic' : 'curious',
        responseStyle: currentWorld === 'career' ? 'pragmatic' : currentWorld === 'relationship' ? 'supportive' : 'exploratory',
        focusArea: currentWorld === 'career' ? 'career advancement' : currentWorld === 'relationship' ? 'deep connections' : 'self discovery',
      },
    },
    confidence: 80,
    executionTime: 50,
  };
}

// --- MOCK LIB BUILDER (inside factory to avoid hoisting issues) ---
const LibMockGetContext = vi.fn().mockResolvedValue(MOCK_LIB);
const LibMockInitialize = vi.fn().mockResolvedValue({ success: true, message: 'ok' });
const LibMockUpdateFromReflection = vi.fn().mockResolvedValue(MOCK_EMPTY_LIB);

vi.mock('./PersonalContextBuilder', () => ({
  PersonalContextBuilder: function() {
    this.getContext = LibMockGetContext;
    this.initialize = LibMockInitialize;
    this.updateFromReflection = LibMockUpdateFromReflection;
  },
}));

// --- MOCK SICE BUILDER (inside factory to avoid hoisting issues) ---
const SiceMockProcess = vi.fn().mockImplementation(async (input: any) => makeSiceResult(input.currentWorld));

vi.mock('@/services/sice/engines/PersonalContextBuilder', () => ({
  PersonalContextBuilder: function() {
    this.process = SiceMockProcess;
  },
}));

describe('CanonicalPersonalContextBuilder - Composition Contract', () => {
  let builder: CanonicalPersonalContextBuilder;
  const input: CanonicalBuilderInput = {
    userId: 'u_test',
    currentWorld: 'career',
  };

  beforeEach(() => {
    builder = new CanonicalPersonalContextBuilder();
    vi.clearAllMocks();
  });

  describe('Contract 1: lib is primary source', () => {
    it('lib fields present in canonical result', async () => {
      const result = await builder.getContext(input);
      
      expect(result.success).toBe(true);
      expect(result.context.values).toHaveLength(1);
      expect(result.context.values[0].name).toBe('ความซื่อสัตย์');
      expect(result.context.goals).toHaveLength(1);
      expect(result.context.goals[0].title).toBe('เรียนภาษาใหม่');
      expect(result.context.strengths).toHaveLength(1);
      expect(result.context.strengths[0].name).toBe('ความอดทน');
      expect(result.context.emotionalRange.primaryMoods).toContain('calm');
      expect(result.context.decisionStyle.type).toBe('analytical');
      expect(result.context.confidenceOverall).toBe(0.75);
      expect(result.context.sourceCount).toBe(10);
      expect(result.context.modelVersion).toBe(2);
    });

    it('lib provenance tracked', async () => {
      const result = await builder.getContext(input);
      
      expect(result.context._provenance.libFields).toContain('values');
      expect(result.context._provenance.libFields).toContain('goals');
      expect(result.context._provenance.libFields).toContain('strengths');
      expect(result.context._provenance.libFields).toContain('confidenceOverall');
      expect(result.context._provenance.libFields).toContain('sourceCount');
    });
  });

  describe('Contract 2: SICE is world-aware enrichment', () => {
    it('SICE fields enriched from world context', async () => {
      const result = await builder.getContext(input);
      
      expect(result.context.emotionalState).toBe('focused');
      expect(result.context.worldFocus).toBe('career');
      expect(result.context.currentGoals).toContain('เรียนภาษาญี่ปุ่น');
      expect(result.context.currentGoals).toContain('พัฒนาอาชีพ');
      expect(result.context.activePatterns).toContain('deep-work-morning (85% success)');
      expect(result.context.recentMemories).toHaveLength(2);
      expect(result.context.strengthAreas).toContain('career');
      expect(result.context.strengthAreas).toContain('learning');
      expect(result.context.growthAreas).toContain('relationship');
      expect(result.context.growthAreas).toContain('health');
    });

    it('worldPersonality populated from SICE', async () => {
      const result = await builder.getContext(input);
      
      expect(result.context.worldPersonality).toBeDefined();
      expect(result.context.worldPersonality?.mood).toBe('determined');
      expect(result.context.worldPersonality?.responseStyle).toBe('pragmatic');
      expect(result.context.worldPersonality?.focusArea).toBe('career advancement');
    });

    it('SICE provenance tracked', async () => {
      const result = await builder.getContext(input);
      
      expect(result.context._provenance.siceFields).toContain('emotionalState');
      expect(result.context._provenance.siceFields).toContain('currentGoals');
      expect(result.context._provenance.siceFields).toContain('worldFocus');
      expect(result.context._provenance.siceFields).toContain('worldPersonality');
    });
  });

  describe('Contract 3: merge is deterministic', () => {
    it('same input produces same merged structure', async () => {
      const result1 = await builder.getContext(input);
      const result2 = await builder.getContext(input);
      
      // Compare structure (excluding timestamps)
      const { _provenance: p1, lastUpdated: l1, ...rest1 } = result1.context;
      const { _provenance: p2, lastUpdated: l2, ...rest2 } = result2.context;
      
      expect(rest1).toEqual(rest2);
      expect(p1.libFields).toEqual(p2.libFields);
      expect(p1.siceFields).toEqual(p2.siceFields);
    });
  });

  describe('Contract 4: no lib field overwritten by SICE unintentionally', () => {
    it('lib values preserved, not overwritten by SICE', async () => {
      const result = await builder.getContext(input);
      
      // Lib-specific fields should be from lib, not empty
      expect(result.context.values).toHaveLength(1);
      expect(result.context.blindSpots).toEqual([]);
      expect(result.context.relationships).toEqual([]);
      expect(result.context.emotionalRange.volatility).toBe(0.3);
      expect(result.context.decisionStyle.confidence).toBe(0.8);
    });

    it('lib confidenceOverall preserved (0-1 scale)', async () => {
      const result = await builder.getContext(input);
      
      expect(result.context.confidenceOverall).toBe(0.75); // lib scale 0-1
      expect(result.context.confidenceOverall).toBeLessThanOrEqual(1);
      expect(result.context.confidenceOverall).toBeGreaterThanOrEqual(0);
    });

    it('lib sourceCount preserved', async () => {
      const result = await builder.getContext(input);
      
      expect(result.context.sourceCount).toBe(10);
    });
  });

  describe('Contract 5: goals vs currentGoals not confused', () => {
    it('goals (lib Goal[]) and currentGoals (SICE string[]) are separate', async () => {
      const result = await builder.getContext(input);
      
      // Lib goals - structured
      expect(Array.isArray(result.context.goals)).toBe(true);
      expect(result.context.goals[0]).toHaveProperty('title');
      expect(result.context.goals[0]).toHaveProperty('confidence');
      expect(result.context.goals[0].title).toBe('เรียนภาษาใหม่');
      
      // SICE currentGoals - string array
      expect(Array.isArray(result.context.currentGoals)).toBe(true);
      expect(typeof result.context.currentGoals[0]).toBe('string');
      expect(result.context.currentGoals).toContain('เรียนภาษาญี่ปุ่น');
      expect(result.context.currentGoals).toContain('พัฒนาอาชีพ');
      
      // They are different arrays with different semantics
      expect(result.context.goals).not.toEqual(result.context.currentGoals);
    });
  });

  describe('Contract 6: strengths vs strengthAreas not confused', () => {
    it('strengths (lib Strength[]) and strengthAreas (SICE string[]) are separate', async () => {
      const result = await builder.getContext(input);
      
      // Lib strengths - structured
      expect(Array.isArray(result.context.strengths)).toBe(true);
      expect(result.context.strengths[0]).toHaveProperty('name');
      expect(result.context.strengths[0]).toHaveProperty('confidence');
      expect(result.context.strengths[0].name).toBe('ความอดทน');
      
      // SICE strengthAreas - world_id strings
      expect(Array.isArray(result.context.strengthAreas)).toBe(true);
      expect(typeof result.context.strengthAreas[0]).toBe('string');
      expect(result.context.strengthAreas).toContain('career');
      expect(result.context.strengthAreas).toContain('learning');
      
      // They are different arrays with different semantics
      expect(result.context.strengths).not.toEqual(result.context.strengthAreas);
    });
  });

  describe('Contract 7: emotionalRange vs emotionalState at different semantic levels', () => {
    it('emotionalRange (lib: detailed profile) and emotionalState (SICE: current snapshot) are separate', async () => {
      const result = await builder.getContext(input);
      
      // Lib emotionalRange - detailed profile
      expect(result.context.emotionalRange).toHaveProperty('primaryMoods');
      expect(result.context.emotionalRange).toHaveProperty('volatility');
      expect(result.context.emotionalRange).toHaveProperty('responseToStress');
      expect(result.context.emotionalRange).toHaveProperty('emotionalTriggers');
      expect(result.context.emotionalRange).toHaveProperty('confidence');
      expect(result.context.emotionalRange.primaryMoods).toContain('calm');
      expect(result.context.emotionalRange.volatility).toBe(0.3);
      
      // SICE emotionalState - current snapshot string
      expect(typeof result.context.emotionalState).toBe('string');
      expect(result.context.emotionalState).toBe('focused');
      
      // Different semantic levels
      expect(result.context.emotionalRange).not.toEqual(result.context.emotionalState);
    });
  });

  describe('Contract 8: worldFocus from runtime/world context', () => {
    it('worldFocus reflects input currentWorld for known worlds', async () => {
      const result = await builder.getContext({ userId: 'u_test', currentWorld: 'career' });
      expect(result.context.worldFocus).toBe('career');
      
      const result2 = await builder.getContext({ userId: 'u_test', currentWorld: 'relationship' });
      expect(result2.context.worldFocus).toBe('relationship');
    });
  });

  describe('Contract 9: worldPersonality works', () => {
    it('worldPersonality populated when SICE provides it', async () => {
      const result = await builder.getContext(input);
      
      expect(result.context.worldPersonality).toBeDefined();
      expect(result.context.worldPersonality).toHaveProperty('mood');
      expect(result.context.worldPersonality).toHaveProperty('responseStyle');
      expect(result.context.worldPersonality).toHaveProperty('focusArea');
    });

    it('worldPersonality changes with different worlds', async () => {
      const resultCareer = await builder.getContext({ userId: 'u_test', currentWorld: 'career' });
      const resultRelationship = await builder.getContext({ userId: 'u_test', currentWorld: 'relationship' });
      
      expect(resultCareer.context.worldPersonality?.mood).toBe('determined');
      expect(resultRelationship.context.worldPersonality?.mood).toBe('empathetic');
      expect(resultCareer.context.worldPersonality?.responseStyle).toBe('pragmatic');
      expect(resultRelationship.context.worldPersonality?.responseStyle).toBe('supportive');
    });
  });

  describe('Contract 10: recentMemories, activePatterns, growthAreas passed through', () => {
    it('recentMemories from SICE preserved', async () => {
      const result = await builder.getContext(input);
      
      expect(result.context.recentMemories).toHaveLength(2);
      expect(result.context.recentMemories[0]).toHaveProperty('timestamp');
      expect(result.context.recentMemories[0]).toHaveProperty('content');
      expect(result.context.recentMemories[0].content).toBe('ทำโปรเจกต์เสร็จทันเวลา');
    });

    it('activePatterns from SICE preserved', async () => {
      const result = await builder.getContext(input);
      
      expect(result.context.activePatterns).toHaveLength(1);
      expect(result.context.activePatterns[0]).toBe('deep-work-morning (85% success)');
    });

    it('growthAreas from SICE preserved', async () => {
      const result = await builder.getContext(input);
      
      expect(result.context.growthAreas).toContain('relationship');
      expect(result.context.growthAreas).toContain('health');
    });
  });

  describe('Contract 11: lib persistence capability preserved', () => {
    it('getLibBuilder returns lib builder instance', () => {
      const libBuilder = builder.getLibBuilder();
      expect(libBuilder).toBeDefined();
      expect(typeof libBuilder.getContext).toBe('function');
      expect(typeof libBuilder.initialize).toBe('function');
      expect(typeof libBuilder.updateFromReflection).toBe('function');
    });

    it('getSiceBuilder returns SICE builder instance', () => {
      const siceBuilder = builder.getSiceBuilder();
      expect(siceBuilder).toBeDefined();
      expect(typeof siceBuilder.process).toBe('function');
    });

    it('initialize delegates to lib builder', async () => {
      const initInput = {
        userId: 'u_new',
        currentWorld: 'career',
        birthDate: '1990-01-01',
        mood: 'excited',
        hubsActive: ['career'],
        onboardingAnswers: { q1: 'a1' },
      };
      
      const result = await builder.initialize(initInput);
      expect(result.success).toBe(true);
    });

    it('updateFromReflection delegates to lib builder for persistence', async () => {
      const reflectionInput = {
        userId: 'u_test',
        aiAnalysis: {
          newInsights: ['Insight 1'],
          patterns: [{ patternName: 'test', patternType: 'behavioral', confidence: 0.8, description: 'Test pattern' }],
        },
        reflectionContent: 'Test reflection',
        timestamp: new Date(),
      };
      
      const result = await builder.updateFromReflection(reflectionInput);
      
      // Should return canonical context with lib persistence + SICE enrichment
      expect(result.userId).toBe('u_test');
      expect(result._provenance.libFields.length).toBeGreaterThan(0);
      expect(result._provenance.siceFields.length).toBeGreaterThan(0);
    });
  });

  describe('Confidence scale conversion', () => {
    it('lib confidenceOverall is 0-1, SICE adapter converts to 0-100', async () => {
      const result = await builder.getContext(input);
      
      // Canonical stores lib scale (0-1)
      expect(result.context.confidenceOverall).toBe(0.75);
      
      // SICE adapter converts to 0-100
      const siceConfidence = libConfidenceToSice(result.context.confidenceOverall);
      expect(siceConfidence).toBe(75);
    });
  });

  describe('Empty context handling', () => {
    it('returns empty canonical context with SICE enrichment when lib is empty', async () => {
      // Configure mock to return empty for this test
      LibMockGetContext.mockResolvedValueOnce(MOCK_EMPTY_LIB);
      
      const emptyBuilder = new CanonicalPersonalContextBuilder();
      const result = await emptyBuilder.getContext({ userId: 'u_new', currentWorld: 'career' });
      
      expect(result.success).toBe(true);
      expect(result.context.userId).toBe('u_new');
      expect(result.context.values).toEqual([]);
      // Merge strategy: when lib goals are empty, SICE currentGoals populate canonical.goals
      expect(result.context.goals.length).toBeGreaterThan(0);
      expect(result.context.confidenceOverall).toBe(0);
      expect(result.context.sourceCount).toBe(0);
      // But SICE enrichment is applied
      expect(result.context.emotionalState).toBeDefined();
    });
  });
});
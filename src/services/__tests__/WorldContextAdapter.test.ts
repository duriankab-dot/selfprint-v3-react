/**
 * WorldContextAdapter.test.ts
 * Test SICE output adaptation to world context
 * P0 #5: World Context Adapter Tests
 */

import { describe, it, expect } from 'vitest';
import {
  adaptBehavioralForecast,
  adaptDecisionIntelligence,
} from '../world-routing/WorldContextAdapter';
import type { WorldContext } from '../world-routing/WorldRoutingService';

const mockWorldContext: WorldContext = {
  worldId: 'career',
  worldName: 'Career',
  expertPrompt: 'Test prompt',
  twinMood: 'focused',
  expertiseScore: 75,
  confidenceModifier: 1.1,
  interactionCount: 5,
};

const lowExpertiseContext: WorldContext = {
  ...mockWorldContext,
  expertiseScore: 20,
  confidenceModifier: 0.8,
};

describe('WorldContextAdapter', () => {
  describe('adaptBehavioralForecast', () => {
    it('should adapt forecast with confidence modifier', () => {
      const forecast = {
        confidence: 70,
        mood: 'focused',
      };

      const adapted = adaptBehavioralForecast(forecast, mockWorldContext);

      expect(adapted).toBeDefined();
      expect(adapted.confidence).toBeDefined();
      // Confidence should be modified: 70 * 1.1 = 77
      expect(adapted.confidence).toBeCloseTo(77, 1);
    });

    it('should apply lower confidence modifier for low expertise', () => {
      const forecast = {
        confidence: 70,
        mood: 'uncertain',
      };

      const adapted = adaptBehavioralForecast(forecast, lowExpertiseContext);

      expect(adapted.confidence).toBeDefined();
      // Confidence should be lower: 70 * 0.8 = 56
      expect(adapted.confidence).toBeCloseTo(56, 1);
    });

    it('should add world context information', () => {
      const forecast = {
        confidence: 70,
        mood: 'focused',
      };

      const adapted = adaptBehavioralForecast(forecast, mockWorldContext);

      expect(adapted.worldContext).toBeDefined();
      expect(adapted.worldContext.worldName).toBe('Career');
      expect(adapted.worldContext.moodInWorld).toBe('focused');
    });

    it('should handle null/undefined forecast', () => {
      const adapted = adaptBehavioralForecast(null, mockWorldContext);
      expect(adapted).toBeNull();
    });

    it('should handle forecast without confidence', () => {
      const forecast = {
        mood: 'focused',
      };

      const adapted = adaptBehavioralForecast(forecast, mockWorldContext);

      expect(adapted).toBeDefined();
      // Should default confidence to 50 * modifier
      expect(adapted.confidence).toBeDefined();
    });

    it('should cap confidence at 100', () => {
      const forecast = {
        confidence: 95,
      };

      const highModifierContext: WorldContext = {
        ...mockWorldContext,
        confidenceModifier: 1.2,
      };

      const adapted = adaptBehavioralForecast(forecast, highModifierContext);

      // 95 * 1.2 = 114, should be capped at 100
      expect(adapted.confidence).toBeLessThanOrEqual(100);
    });

    it('should add world guidance text', () => {
      const forecast = {
        confidence: 70,
        mood: 'focused',
      };

      const adapted = adaptBehavioralForecast(forecast, mockWorldContext);

      expect(adapted.worldGuidance).toBeDefined();
      expect(typeof adapted.worldGuidance).toBe('string');
    });
  });

  describe('adaptDecisionIntelligence', () => {
    it('should adapt analysis with world context', () => {
      const analysis = {
        insights: ['You are decisive', 'You prefer data'],
        recommendation: 'Make the change',
      };

      const adapted = adaptDecisionIntelligence(analysis, mockWorldContext);

      expect(adapted).toBeDefined();
      expect(adapted.insights).toBeDefined();
      expect(Array.isArray(adapted.insights)).toBe(true);
    });

    it('should tag insights with world name', () => {
      const analysis = {
        insights: ['You are strategic'],
      };

      const adapted = adaptDecisionIntelligence(analysis, mockWorldContext);

      for (const insight of adapted.insights) {
        expect(insight).toContain('[Career]');
      }
    });

    it('should add world context to analysis', () => {
      const analysis = {
        insights: ['Test insight'],
      };

      const adapted = adaptDecisionIntelligence(analysis, mockWorldContext);

      expect(adapted.worldContext).toBeDefined();
      expect(adapted.worldContext.worldName).toBe('Career');
    });

    it('should handle empty insights array', () => {
      const analysis = {
        insights: [],
      };

      const adapted = adaptDecisionIntelligence(analysis, mockWorldContext);

      expect(adapted.insights).toBeDefined();
      expect(Array.isArray(adapted.insights)).toBe(true);
      expect(adapted.insights.length).toBe(0);
    });

    it('should preserve original analysis data', () => {
      const analysis = {
        insights: ['Insight 1'],
        recommendation: 'Do this',
        confidence: 80,
      };

      const adapted = adaptDecisionIntelligence(analysis, mockWorldContext);

      expect(adapted.recommendation).toBe('Do this');
      // Confidence is modified: 80 * 1.1 = 88
      expect(adapted.confidence).toBeCloseTo(88, 1);
    });

    it('should handle null/undefined analysis', () => {
      const adapted = adaptDecisionIntelligence(null, mockWorldContext);
      expect(adapted).toBeNull();
    });

    it('should work with different expertise levels', () => {
      const analysis = {
        insights: ['Insight'],
      };

      const highExpertiseContext: WorldContext = {
        ...mockWorldContext,
        expertiseScore: 95,
      };

      const adapted = adaptDecisionIntelligence(analysis, highExpertiseContext);

      expect(adapted.worldContext.expertiseLevel).toBeDefined();
      expect(adapted.worldContext.expertiseLevel).toContain('expert');
    });
  });

  describe('Confidence Modifier Calculation', () => {
    it('should scale confidence between 0.8 and 1.2', () => {
      for (let expertise = 0; expertise <= 100; expertise += 10) {
        const context: WorldContext = {
          ...mockWorldContext,
          expertiseScore: expertise,
          confidenceModifier: Math.max(0.8, Math.min(1.2, 0.8 + (expertise / 100) * 0.4)),
        };

        expect(context.confidenceModifier).toBeGreaterThanOrEqual(0.8);
        expect(context.confidenceModifier).toBeLessThanOrEqual(1.2);
      }
    });
  });

  describe('World Expertise Labels', () => {
    it('should correctly label expertise levels', () => {
      const testCases = [
        { expertise: 10, expected: 'beginner' },
        { expertise: 35, expected: 'intermediate' },
        { expertise: 70, expected: 'advanced' },
        { expertise: 95, expected: 'expert' },
      ];

      for (const testCase of testCases) {
        const context: WorldContext = {
          ...mockWorldContext,
          expertiseScore: testCase.expertise,
        };

        const adapted = adaptBehavioralForecast({ confidence: 50 }, context);

        expect(adapted.worldContext.expertiseLevel).toContain(testCase.expected);
      }
    });
  });
});

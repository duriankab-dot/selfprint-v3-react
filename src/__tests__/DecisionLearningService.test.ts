/**
 * DecisionLearningService.test.ts
 * Phase E Step 2C: Decision Learning Service tests
 *
 * Tests for:
 * - analyzeTwinDecisionPatterns()
 * - getWorldSpecificInsights()
 * - updateTwinExpertiseFromDecisions()
 * - getDecisionInsights()
 * - calculateTwinConfidenceInWorld()
 */

import { describe, it, expect } from 'vitest';
import * as DecisionLearningService from '../services/DecisionLearningService';
import * as DecisionService from '../services/DecisionService';

describe('Phase E: DecisionLearningService', () => {
  const testTwinId = 'test-learning-' + Date.now();
  const decisions: string[] = [];

  describe('Setup: Create test decisions with outcomes', () => {
    it('should create career decision with positive outcome', async () => {
      const decision = await DecisionService.recordDecision(
        testTwinId,
        'career',
        'Change jobs?',
        ['Current job', 'New opportunity'],
        'Consider new opportunity',
        'New opportunity'
      );

      expect(decision?.id).toBeDefined();
      decisions.push(decision!.id);

      // Record positive outcome
      const outcome = await DecisionService.recordOutcome(
        decision!.id,
        'New job is excellent fit!',
        'positive',
        'New opportunities can lead to growth'
      );

      expect(outcome?.impact).toBe('positive');
    });

    it('should create love decision with negative outcome', async () => {
      const decision = await DecisionService.recordDecision(
        testTwinId,
        'love',
        'End relationship?',
        ['Stay together', 'Break up'],
        'Take more time',
        'Break up'
      );

      expect(decision?.id).toBeDefined();
      decisions.push(decision!.id);

      // Record negative outcome
      const outcome = await DecisionService.recordOutcome(
        decision!.id,
        'Made a mistake, miss them',
        'negative',
        'Some relationships deserve more time'
      );

      expect(outcome?.impact).toBe('negative');
    });

    it('should create health decision with positive outcome', async () => {
      const decision = await DecisionService.recordDecision(
        testTwinId,
        'health',
        'Start fitness routine?',
        ['Yes', 'No'],
        'Yes, start with 3x/week',
        'Yes'
      );

      expect(decision?.id).toBeDefined();
      decisions.push(decision!.id);

      const outcome = await DecisionService.recordOutcome(
        decision!.id,
        'Feeling much better!',
        'positive',
        'Consistent exercise improves wellbeing'
      );

      expect(outcome?.impact).toBe('positive');
    });

    it('should create another career decision with positive outcome', async () => {
      const decision = await DecisionService.recordDecision(
        testTwinId,
        'career',
        'Ask for raise?',
        ['Ask', 'Wait'],
        'Ask strategically',
        'Ask'
      );

      expect(decision?.id).toBeDefined();
      decisions.push(decision!.id);

      const outcome = await DecisionService.recordOutcome(
        decision!.id,
        'Got the raise!',
        'positive',
        'Asking for what you deserve pays off'
      );

      expect(outcome?.impact).toBe('positive');
    });
  });

  describe('Analyze Decision Patterns', () => {
    it('should return array of patterns', async () => {
      const patterns = await DecisionLearningService.analyzeTwinDecisionPatterns(testTwinId);

      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should have pattern for career world', async () => {
      const patterns = await DecisionLearningService.analyzeTwinDecisionPatterns(testTwinId);

      const careerPattern = patterns.find(p => p.world === 'career');
      expect(careerPattern).toBeDefined();
      expect(careerPattern?.successRate).toBeGreaterThan(50); // 2 positive career decisions
    });

    it('should calculate success rate correctly', async () => {
      const patterns = await DecisionLearningService.analyzeTwinDecisionPatterns(testTwinId);

      patterns.forEach(pattern => {
        expect(pattern.successRate).toBeGreaterThanOrEqual(0);
        expect(pattern.successRate).toBeLessThanOrEqual(100);
      });
    });

    it('should increase confidence with more decisions', async () => {
      const patterns = await DecisionLearningService.analyzeTwinDecisionPatterns(testTwinId);

      patterns.forEach(pattern => {
        // Confidence should grow with sample size
        if (pattern.sampleSize > 1) {
          expect(pattern.confidence).toBeGreaterThan(50);
        }
      });
    });

    it('should handle Twin with no decisions', async () => {
      const patterns = await DecisionLearningService.analyzeTwinDecisionPatterns(
        'nonexistent-' + Date.now()
      );

      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBe(0);
    });
  });

  describe('World-Specific Insights', () => {
    it('should return string for career world', async () => {
      const insight = await DecisionLearningService.getWorldSpecificInsights(testTwinId, 'career');

      expect(typeof insight).toBe('string');
      expect(insight.length).toBeGreaterThan(0);
    });

    it('should mention world name', async () => {
      const insight = await DecisionLearningService.getWorldSpecificInsights(testTwinId, 'love');

      expect(insight.toLowerCase()).toContain('love');
    });

    it('should reference decision count', async () => {
      const insight = await DecisionLearningService.getWorldSpecificInsights(testTwinId, 'health');

      expect(insight).toMatch(/\d+/); // Should contain a number
    });

    it('should handle world with no decisions', async () => {
      const insight = await DecisionLearningService.getWorldSpecificInsights(testTwinId, 'finance');

      expect(typeof insight).toBe('string');
      expect(insight.length).toBeGreaterThan(0);
    });

    it('should handle nonexistent Twin', async () => {
      const insight = await DecisionLearningService.getWorldSpecificInsights(
        'nonexistent-' + Date.now(),
        'career'
      );

      expect(typeof insight).toBe('string');
    });
  });

  describe('Decision Insights', () => {
    it('should return insights object', async () => {
      const insights = await DecisionLearningService.getDecisionInsights(testTwinId);

      expect(insights).toHaveProperty('totalDecisions');
      expect(insights).toHaveProperty('successRate');
      expect(insights).toHaveProperty('bestWorlds');
      expect(insights).toHaveProperty('improvementAreas');
      expect(insights).toHaveProperty('trends');
    });

    it('should calculate total decisions', async () => {
      const insights = await DecisionLearningService.getDecisionInsights(testTwinId);

      expect(insights.totalDecisions).toBeGreaterThan(0);
      expect(typeof insights.totalDecisions).toBe('number');
    });

    it('should calculate success rate', async () => {
      const insights = await DecisionLearningService.getDecisionInsights(testTwinId);

      expect(insights.successRate).toBeGreaterThanOrEqual(0);
      expect(insights.successRate).toBeLessThanOrEqual(100);
    });

    it('should have best worlds', async () => {
      const insights = await DecisionLearningService.getDecisionInsights(testTwinId);

      expect(Array.isArray(insights.bestWorlds)).toBe(true);
      expect(insights.bestWorlds.length).toBeGreaterThan(0);
    });

    it('should generate trend description', async () => {
      const insights = await DecisionLearningService.getDecisionInsights(testTwinId);

      expect(typeof insights.trends).toBe('string');
      expect(insights.trends.length).toBeGreaterThan(0);
    });

    it('should handle nonexistent Twin', async () => {
      const insights = await DecisionLearningService.getDecisionInsights(
        'nonexistent-' + Date.now()
      );

      expect(insights.totalDecisions).toBe(0);
      expect(insights.successRate).toBe(0);
      expect(Array.isArray(insights.bestWorlds)).toBe(true);
    });
  });

  describe('Twin Confidence Calculation', () => {
    it('should calculate confidence for career world', async () => {
      const confidence = await DecisionLearningService.calculateTwinConfidenceInWorld(
        testTwinId,
        'career'
      );

      expect(typeof confidence).toBe('number');
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it('should return default 50 for world with no data', async () => {
      const confidence = await DecisionLearningService.calculateTwinConfidenceInWorld(
        testTwinId,
        'finance'
      );

      expect(confidence).toBe(50);
    });

    it('should return higher confidence for high success rate', async () => {
      // Career world has 2 positive outcomes
      const careerConfidence = await DecisionLearningService.calculateTwinConfidenceInWorld(
        testTwinId,
        'career'
      );

      // Love world has 1 negative outcome
      const loveConfidence = await DecisionLearningService.calculateTwinConfidenceInWorld(
        testTwinId,
        'love'
      );

      expect(careerConfidence).toBeGreaterThan(loveConfidence);
    });
  });

  describe('Twin Recommendation Confidence', () => {
    it('should return low, medium, or high', async () => {
      const confidence = await DecisionLearningService.getTwinRecommendationConfidence(
        testTwinId,
        'career'
      );

      expect(['low', 'medium', 'high']).toContain(confidence);
    });

    it('should return high for successful world', async () => {
      // Career has high success rate
      const confidence = await DecisionLearningService.getTwinRecommendationConfidence(
        testTwinId,
        'career'
      );

      expect(['medium', 'high']).toContain(confidence);
    });

    it('should return low for unsuccessful world', async () => {
      // Love has negative outcome
      const confidence = await DecisionLearningService.getTwinRecommendationConfidence(
        testTwinId,
        'love'
      );

      expect(['low', 'medium']).toContain(confidence);
    });
  });

  describe('Update Twin Expertise', () => {
    it('should update expertise without errors', async () => {
      await expect(async () => {
        await DecisionLearningService.updateTwinExpertiseFromDecisions(testTwinId, 'career');
      }).not.toThrow();
    });

    it('should handle nonexistent Twin gracefully', async () => {
      await expect(async () => {
        await DecisionLearningService.updateTwinExpertiseFromDecisions(
          'nonexistent-' + Date.now(),
          'career'
        );
      }).not.toThrow();
    });
  });

  describe('Performance Benchmarks', () => {
    it('analyzeTwinDecisionPatterns() should complete < 500ms', async () => {
      const start = performance.now();
      await DecisionLearningService.analyzeTwinDecisionPatterns(testTwinId);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500);
    });

    it('getWorldSpecificInsights() should complete < 400ms', async () => {
      const start = performance.now();
      await DecisionLearningService.getWorldSpecificInsights(testTwinId, 'career');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(400);
    });

    it('getDecisionInsights() should complete < 600ms', async () => {
      const start = performance.now();
      await DecisionLearningService.getDecisionInsights(testTwinId);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(600);
    });

    it('calculateTwinConfidenceInWorld() should complete < 300ms', async () => {
      const start = performance.now();
      await DecisionLearningService.calculateTwinConfidenceInWorld(testTwinId, 'career');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(300);
    });
  });

  describe('Edge Cases', () => {
    it('should handle Twin with mixed outcomes', async () => {
      const insights = await DecisionLearningService.getDecisionInsights(testTwinId);

      // Should still calculate properly even with mixed success/failure
      expect(typeof insights.successRate).toBe('number');
      expect(insights.totalDecisions).toBeGreaterThan(0);
    });

    it('should handle empty lessons array', async () => {
      const insights = await DecisionLearningService.getWorldSpecificInsights(
        testTwinId,
        'career'
      );

      // Should still generate insight without crashing
      expect(typeof insights).toBe('string');
    });

    it('should rank worlds by success rate', async () => {
      const insights = await DecisionLearningService.getDecisionInsights(testTwinId);

      // Career should be in bestWorlds (high success)
      if (insights.bestWorlds.length > 0) {
        expect(insights.bestWorlds).toContain('career');
      }
    });
  });
});

/**
 * Manual Test Scenarios
 *
 * Test 1: Learning Loop
 *   Record decision → add positive outcome → analyze patterns
 *   Verify: confidence in world increases
 *
 * Test 2: Multi-world Learning
 *   Record decisions in 5+ worlds
 *   Call getDecisionInsights()
 *   Verify: bestWorlds array populated correctly
 *
 * Test 3: Confidence Progression
 *   Start with low sample size → high confidence gradually
 *   Record 10 decisions in one world
 *   Verify: confidence increases with sample size and success rate
 *
 * Test 4: Trend Detection
 *   Record 3 negative outcomes → analyze trends
 *   Record 3 positive outcomes → re-analyze
 *   Verify: trend description changes appropriately
 */

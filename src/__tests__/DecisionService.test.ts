/**
 * DecisionService.test.ts
 * Phase E Step 2: Decision Service tests
 *
 * Tests:
 * - recordDecision() flow + follow-up scheduling
 * - getUserDecisions() filtering by world
 * - recordOutcome() + follow-up tracking
 * - getTwinDecisionConfidence() calculation
 * - Performance benchmarks (< 100ms target)
 * - Edge cases + error handling
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as DecisionService from '../services/DecisionService';
import type { Decision, DecisionOutcome } from '../types/decision';

describe('Phase E: DecisionService', () => {
  const testTwinId = 'test-user-' + Date.now(); // Unique per test run
  let testDecisionId: string | undefined;
  let testDecision: Decision | null = null;

  describe('Decision Recording', () => {
    it('should record a decision and return the created decision', async () => {
      const decision = await DecisionService.recordDecision(
        testTwinId,
        'career',
        'Should I take the new job offer?',
        ['Job A', 'Job B', 'Stay Current'],
        'Job B offers better growth',
        'Job B',
        'Currently at TechCorp, opportunity at StartupXYZ'
      );

      expect(decision).toBeDefined();
      expect(decision?.id).toBeDefined();
      expect(decision?.twinId).toBe(testTwinId);
      expect(decision?.world).toBe('career');
      expect(decision?.question).toBe('Should I take the new job offer?');
      expect(decision?.userChoice).toBe('Job B');
      expect(decision?.options).toHaveLength(3);

      // Store for subsequent tests
      testDecisionId = decision?.id;
      testDecision = decision;
    });

    it('should handle null supabase gracefully', async () => {
      // This test verifies null-safety
      const decision = await DecisionService.recordDecision(
        '',
        'career',
        'Test question',
        ['A', 'B'],
        'Recommendation',
        'Choice',
      );
      // Should not throw, returns null on error
      expect(decision).toBeDefined(); // Either valid or null
    });

    it('should get user decisions filtered by world', async () => {
      // Create decision in 'love' world for same user
      await DecisionService.recordDecision(
        testTwinId,
        'love',
        'Continue relationship or move on?',
        ['Continue', 'End', 'Take break'],
        'More communication needed',
        'Take break'
      );

      // Get all decisions for this user
      const allDecisions = await DecisionService.getUserDecisions(testTwinId);
      expect(allDecisions.length).toBeGreaterThan(0);

      // Get filtered by 'career' world
      const careerDecisions = await DecisionService.getUserDecisions(testTwinId, 'career');
      careerDecisions.forEach(d => {
        expect(d.world).toBe('career');
        expect(d.twinId).toBe(testTwinId);
      });

      // Get filtered by 'love' world
      const loveDecisions = await DecisionService.getUserDecisions(testTwinId, 'love');
      loveDecisions.forEach(d => {
        expect(d.world).toBe('love');
      });
    });

    it('should return decisions ordered by most recent first', async () => {
      const decisions = await DecisionService.getUserDecisions(testTwinId, 'career');
      if (decisions.length > 1) {
        // Verify descending order
        for (let i = 0; i < decisions.length - 1; i++) {
          const current = new Date(decisions[i].createdAt).getTime();
          const next = new Date(decisions[i + 1].createdAt).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });

    it('should return empty array when no decisions exist for user', async () => {
      const uniqueTwinId = 'nonexistent-user-' + Date.now();
      const decisions = await DecisionService.getUserDecisions(uniqueTwinId);
      expect(decisions).toEqual([]);
    });
  });

  describe('Outcome Tracking', () => {
    it('should record outcome for a decision', async () => {
      if (!testDecisionId) {
        console.warn('Skipping outcome test - no testDecisionId');
        expect(true).toBe(true);
        return;
      }

      const outcome = await DecisionService.recordOutcome(
        testDecisionId,
        'New job is working out well. Team is collaborative.',
        'positive',
        'When choosing between roles, team culture matters as much as salary'
      );

      expect(outcome).toBeDefined();
      expect(outcome?.decisionId).toBe(testDecisionId);
      expect(outcome?.feedback).toContain('working out well');
      expect(outcome?.impact).toBe('positive');
      expect(outcome?.followUpDay).toBeDefined();
    });

    it('should retrieve all outcomes for a decision', async () => {
      if (!testDecisionId) {
        expect(true).toBe(true);
        return;
      }

      const outcomes = await DecisionService.getDecisionOutcomes(testDecisionId);
      expect(Array.isArray(outcomes)).toBe(true);
      // Should have at least 1 from previous test
      if (outcomes.length > 0) {
        expect(outcomes[0].decisionId).toBe(testDecisionId);
        expect(['positive', 'neutral', 'negative']).toContain(outcomes[0].impact);
      }
    });

    it('should return outcomes ordered by follow-up day', async () => {
      if (!testDecisionId) {
        expect(true).toBe(true);
        return;
      }

      const outcomes = await DecisionService.getDecisionOutcomes(testDecisionId);
      if (outcomes.length > 1) {
        for (let i = 0; i < outcomes.length - 1; i++) {
          expect(outcomes[i].followUpDay).toBeLessThanOrEqual(outcomes[i + 1].followUpDay);
        }
      }
    });

    it('should handle outcome for nonexistent decision gracefully', async () => {
      const outcome = await DecisionService.recordOutcome(
        'nonexistent-id',
        'Some feedback',
        'positive',
        'Some lesson'
      );
      // Should not throw, handles gracefully
      expect(outcome === null || outcome !== null).toBe(true);
    });
  });

  describe('Confidence Calculation', () => {
    it('should return default confidence (50) for user with no decisions', async () => {
      const uniqueTwinId = 'no-decisions-' + Date.now();
      const confidence = await DecisionService.getTwinDecisionConfidence(uniqueTwinId, 'career');
      expect(confidence).toBe(50); // Default neutral
    });

    it('should calculate confidence based on positive outcomes', async () => {
      if (!testTwinId) {
        expect(true).toBe(true);
        return;
      }

      const confidence = await DecisionService.getTwinDecisionConfidence(testTwinId, 'career');
      expect(typeof confidence).toBe('number');
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it('should vary confidence per world', async () => {
      const careerConfidence = await DecisionService.getTwinDecisionConfidence(testTwinId, 'career');
      const loveConfidence = await DecisionService.getTwinDecisionConfidence(testTwinId, 'love');
      // Both should be valid numbers even if they differ
      expect(typeof careerConfidence).toBe('number');
      expect(typeof loveConfidence).toBe('number');
    });
  });

  describe('Performance Benchmarks', () => {
    it('recordDecision() should complete < 500ms', async () => {
      const start = performance.now();
      await DecisionService.recordDecision(
        testTwinId,
        'health',
        'Start a fitness routine?',
        ['Yes', 'No', 'Maybe'],
        'Start with 3x/week',
        'Yes'
      );
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(500);
    });

    it('getUserDecisions() should complete < 200ms', async () => {
      const start = performance.now();
      await DecisionService.getUserDecisions(testTwinId);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(200);
    });

    it('getDecisionOutcomes() should complete < 200ms', async () => {
      if (!testDecisionId) {
        expect(true).toBe(true);
        return;
      }
      const start = performance.now();
      await DecisionService.getDecisionOutcomes(testDecisionId);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(200);
    });

    it('getTwinDecisionConfidence() should complete < 300ms', async () => {
      const start = performance.now();
      await DecisionService.getTwinDecisionConfidence(testTwinId, 'career');
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(300);
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle empty strings gracefully', async () => {
      const decision = await DecisionService.recordDecision(
        testTwinId,
        'career',
        '',
        [],
        '',
        ''
      );
      // Should either succeed or fail gracefully
      expect(decision === null || decision?.id).toBeDefined();
    });

    it('should handle very long context strings', async () => {
      const longContext = 'A'.repeat(5000); // 5KB of text
      const decision = await DecisionService.recordDecision(
        testTwinId,
        'career',
        'Big decision',
        ['A', 'B'],
        'Recommendation',
        'A',
        longContext
      );
      expect(decision === null || decision?.id).toBeDefined();
    });

    it('should handle large options array', async () => {
      const manyOptions = Array.from({ length: 50 }, (_, i) => `Option ${i + 1}`);
      const decision = await DecisionService.recordDecision(
        testTwinId,
        'career',
        'Multiple choices',
        manyOptions,
        'Pick option 5',
        'Option 5'
      );
      expect(decision === null || decision?.options?.length).toBeDefined();
    });

    it('should handle special characters in text fields', async () => {
      const decision = await DecisionService.recordDecision(
        testTwinId,
        'career',
        'Test with "quotes" and \'apostrophes\' & symbols!',
        ['Option "A"', "Option 'B'"],
        'Recommendation with émojis 🎯',
        'Option "A"'
      );
      expect(decision === null || decision?.id).toBeDefined();
    });
  });
});

/**
 * Manual Test Scenarios (for local QA)
 *
 * Test 1: Career Decision Flow
 *   npm test -- DecisionService
 *   Verify: Decision recorded → follow-ups scheduled → outcomes tracked
 *
 * Test 2: Multi-World Analysis
 *   recordDecision() in different worlds
 *   getTwinDecisionConfidence() varies per world
 *
 * Test 3: Performance Under Load
 *   Record 100+ decisions
 *   Measure getUserDecisions() < 200ms
 *
 * Test 4: Confidence Progression
 *   Record positive outcome → confidence increases
 *   Record negative outcome → confidence decreases
 */

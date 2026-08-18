/**
 * ContinuousImprovementService.test.ts
 * Phase F: Continuous Improvement - TDD Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as ContinuousImprovementService from '../ContinuousImprovementService';

describe('ContinuousImprovementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processImprovementAction', () => {
    it('should process feedback into improvement action', async () => {
      const action = await ContinuousImprovementService.processImprovementAction({
        feedbackId: 'feedback-123',
        improvementArea: 'response_length',
        severity: 'medium',
        description: 'Responses are too short',
      });

      expect(action).toBeDefined();
      expect(action.id).toBeDefined();
      expect(action.status).toBe('pending');
      expect(action.targetChange).toBeDefined();
    });

    it('should handle different improvement areas', async () => {
      const areas = ['response_length', 'accuracy', 'relevance', 'tone'];

      for (const area of areas) {
        const action = await ContinuousImprovementService.processImprovementAction({
          feedbackId: `feedback-${area}`,
          improvementArea: area,
          severity: 'low',
          description: `Improve ${area}`,
        });

        expect(action.improvementArea).toBe(area);
      }
    });

    it('should reject invalid improvement area', async () => {
      await expect(
        ContinuousImprovementService.processImprovementAction({
          feedbackId: 'feedback-123',
          improvementArea: 'invalid_area',
          severity: 'high',
          description: 'Test',
        })
      ).rejects.toThrow('Invalid improvement area');
    });
  });

  describe('getPendingImprovements', () => {
    it('should retrieve pending improvement actions for Twin', async () => {
      const improvements = await ContinuousImprovementService.getPendingImprovements(
        'twin-456'
      );

      expect(Array.isArray(improvements)).toBe(true);
      expect(improvements.every(i => i.status === 'pending')).toBe(true);
    });

    it('should return empty array when no pending improvements', async () => {
      const improvements = await ContinuousImprovementService.getPendingImprovements(
        'nonexistent-twin'
      );

      expect(improvements).toEqual([]);
    });

    it('should rank improvements by severity', async () => {
      const improvements = await ContinuousImprovementService.getPendingImprovements(
        'twin-456'
      );

      if (improvements.length > 1) {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        for (let i = 0; i < improvements.length - 1; i++) {
          const current = severityOrder[improvements[i].severity as 'high' | 'medium' | 'low'];
          const next = severityOrder[improvements[i + 1].severity as 'high' | 'medium' | 'low'];
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });
  });

  describe('applyImprovement', () => {
    it('should apply improvement action (update Twin configuration)', async () => {
      const improvement = await ContinuousImprovementService.processImprovementAction({
        feedbackId: 'feedback-123',
        improvementArea: 'response_length',
        severity: 'medium',
        description: 'Make responses longer',
      });

      const result = await ContinuousImprovementService.applyImprovement(improvement.id);

      expect(result).toBeDefined();
      expect(result.status).toBe('applied');
    });

    it('should track improvement effectiveness', async () => {
      const result = await ContinuousImprovementService.applyImprovement('improvement-123');

      expect(result.appliedAt).toBeDefined();
      expect(result.metricsBeforeChange).toBeDefined();
    });

    it('should reject applying non-existent improvement', async () => {
      await expect(
        ContinuousImprovementService.applyImprovement('nonexistent-id')
      ).rejects.toThrow('Improvement not found');
    });
  });

  describe('getImprovementImpact', () => {
    it('should measure impact of applied improvements', async () => {
      const impact = await ContinuousImprovementService.getImprovementImpact('twin-456', 7);

      expect(impact).toBeDefined();
      expect(impact.totalImprovementsApplied).toBeGreaterThanOrEqual(0);
      expect(impact.averageQualityIncrease).toBeDefined();
    });

    it('should track improvement effectiveness per area', async () => {
      const impact = await ContinuousImprovementService.getImprovementImpact('twin-456', 7);

      expect(impact.areaImpact).toBeDefined();
      expect(typeof impact.areaImpact).toBe('object');
    });

    it('should return zero impact for Twin with no improvements', async () => {
      const impact = await ContinuousImprovementService.getImprovementImpact('nonexistent-twin', 7);

      expect(impact.totalImprovementsApplied).toBe(0);
    });
  });

  describe('updateTwinPrompt', () => {
    it('should adjust Twin prompt based on feedback', async () => {
      const updatedPrompt = await ContinuousImprovementService.updateTwinPrompt(
        'twin-456',
        'response_length',
        { increase: 1.2 } // 20% longer responses
      );

      expect(updatedPrompt).toBeDefined();
      expect(updatedPrompt.version).toBeGreaterThan(0);
    });

    it('should track prompt changes', async () => {
      const updatedPrompt = await ContinuousImprovementService.updateTwinPrompt(
        'twin-456',
        'tone',
        { warmth: 'increase' }
      );

      expect(updatedPrompt.changes).toBeDefined();
      expect(updatedPrompt.appliedAt).toBeDefined();
    });

    it('should prevent conflicting prompt adjustments', async () => {
      const prompt1 = await ContinuousImprovementService.updateTwinPrompt(
        'twin-456',
        'tone',
        { warmth: 'increase' }
      );

      // Attempting conflicting change should either merge or reject
      const prompt2 = await ContinuousImprovementService.updateTwinPrompt(
        'twin-456',
        'tone',
        { formality: 'increase' }
      );

      expect(prompt2.version).toBeGreaterThanOrEqual(prompt1.version);
    });
  });
});

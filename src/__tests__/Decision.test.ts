/**
 * Decision.test.ts
 * Unit tests for Decision tracking system
 */

import { describe, it, expect } from 'vitest';
import {
  getFollowUpDueDate,
  calculateSuccessRate,
  getPendingFollowUps,
  Decision,
} from '../types/decision';
import {
  createDecision,
  getDecisionStats,
} from '../services/DecisionService';

describe('Decision Types', () => {
  describe('getFollowUpDueDate', () => {
    it('should calculate 30-day follow-up', () => {
      const baseDate = '2026-08-16';
      const dueDate = getFollowUpDueDate(baseDate, 30);
      expect(dueDate).toBe('2026-09-15');
    });

    it('should calculate 90-day follow-up', () => {
      const baseDate = '2026-08-16';
      const dueDate = getFollowUpDueDate(baseDate, 90);
      expect(dueDate).toBe('2026-11-14');
    });

    it('should calculate 180-day follow-up', () => {
      const baseDate = '2026-08-16';
      const dueDate = getFollowUpDueDate(baseDate, 180);
      expect(dueDate).toBe('2027-02-13');
    });

    it('should calculate 365-day follow-up', () => {
      const baseDate = '2026-08-16';
      const dueDate = getFollowUpDueDate(baseDate, 365);
      expect(dueDate).toBe('2027-08-16');
    });
  });

  describe('calculateSuccessRate', () => {
    it('should return 0 for empty decisions', () => {
      const rate = calculateSuccessRate([]);
      expect(rate).toBe(0);
    });

    it('should calculate success rate from result scores', () => {
      const decision: Decision = {
        id: 'dec_1',
        userId: 'user_1',
        title: 'Test Decision',
        description: 'Test',
        category: 'career',
        decisionDate: '2026-08-16',
        confidence: 80,
        expectedOutcome: 'Good outcome',
        followUps: [
          {
            id: 'fu_1',
            decisionId: 'dec_1',
            days: 30,
            scheduledDate: '2026-09-15',
            completed: true,
            resultScore: 80,
            notificationSent: true,
          },
        ],
        createdAt: '2026-08-16T00:00:00Z',
        updatedAt: '2026-08-16T00:00:00Z',
      };

      const rate = calculateSuccessRate([decision]);
      expect(rate).toBe(80);
    });
  });

  describe('getPendingFollowUps', () => {
    it('should return empty for no decisions', () => {
      const pending = getPendingFollowUps([]);
      expect(pending).toHaveLength(0);
    });

    it('should filter out completed follow-ups', () => {
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - 1);

      const decision: Decision = {
        id: 'dec_1',
        userId: 'user_1',
        title: 'Test',
        description: 'Test',
        category: 'career',
        decisionDate: '2026-08-16',
        confidence: 80,
        expectedOutcome: 'Good',
        followUps: [
          {
            id: 'fu_1',
            decisionId: 'dec_1',
            days: 30,
            scheduledDate: pastDate.toISOString().split('T')[0],
            completed: false,
            notificationSent: false,
          },
          {
            id: 'fu_2',
            decisionId: 'dec_1',
            days: 90,
            scheduledDate: '2099-12-31',
            completed: true,
            notificationSent: true,
          },
        ],
        createdAt: '2026-08-16T00:00:00Z',
        updatedAt: '2026-08-16T00:00:00Z',
      };

      const pending = getPendingFollowUps([decision]);
      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe('fu_1');
    });
  });
});

describe('DecisionService', () => {
  describe('createDecision', () => {
    it('should fail with missing userId', async () => {
      const result = await createDecision('', {
        title: 'Test',
        description: 'Test',
        category: 'career',
        decisionDate: '2026-08-16',
        confidence: 80,
        expectedOutcome: 'Good',
        userId: '',
      });

      expect(result.success).toBe(false);
    });

    it('should create decision with 4 follow-ups', async () => {
      const result = await createDecision('user_1', {
        title: 'Change careers',
        description: 'Switch to tech from finance',
        category: 'career',
        decisionDate: '2026-08-16',
        confidence: 75,
        expectedOutcome: 'Better work-life balance',
        userId: 'user_1',
      });

      expect(result.success).toBe(true);
      expect(result.decision).toBeDefined();
      expect(result.decision?.followUps).toHaveLength(4);
      expect(result.decision?.followUps.map((f) => f.days)).toEqual([30, 90, 180, 365]);
    });

    it('should auto-schedule follow-ups', async () => {
      const result = await createDecision('user_1', {
        title: 'Test',
        description: 'Test',
        category: 'personal',
        decisionDate: '2026-08-16',
        confidence: 50,
        expectedOutcome: 'Test',
        userId: 'user_1',
      });

      if (result.decision?.followUps) {
        expect(result.decision.followUps[0].scheduledDate).toBe('2026-09-15');
        expect(result.decision.followUps[1].scheduledDate).toBe('2026-11-14');
        expect(result.decision.followUps[2].scheduledDate).toBe('2027-02-13');
        expect(result.decision.followUps[3].scheduledDate).toBe('2027-08-16');
      }
    });
  });

  describe('getDecisionStats', () => {
    it('should return zero stats for empty userId', async () => {
      const stats = await getDecisionStats('');
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
    });

    it('should return stats for valid userId', async () => {
      const stats = await getDecisionStats('user_1');
      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
    });
  });
});

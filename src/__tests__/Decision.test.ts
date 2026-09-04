/**
 * Decision.test.ts
 * Unit tests for Decision tracking system
 */

import { describe, it, expect } from 'vitest';
// TESTIMPORT-001 FIX (4 ก.ย. 2026): เทสต์นี้ไม่เคยถูกรันเลย (vitest include
// เป็น allowlist 7 ไฟล์) จึงไม่มีใครเห็นว่า import ผิดโมดูลมาตลอด —
// getFollowUpDueDate/calculateSuccessRate อยู่ใน services/DecisionService.ts
// ส่วน getPendingFollowUps อยู่ใน services/DecisionFollowUpService.ts
// ไม่มีตัวไหนอยู่ใน types/decision (ไฟล์นั้น export แต่ type)
import type { Decision } from '../types/decision';
// QA-02: getPendingFollowUps was being imported from DecisionFollowUpService,
// which exports a *different* function of the same name — an async DB query
// `getPendingFollowUps(twinId: string): Promise<FollowUp[]>`. The pure helper
// these tests exercise (sync, takes ONE Decision, filters its own followUps
// array) is DecisionService.getPendingFollowUps (DecisionService.ts:418).
import {
  getFollowUpDueDate,
  calculateSuccessRate,
  createDecision,
  getDecisionStats,
  getPendingFollowUps,
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
      // QA-02: the expected value was simply wrong arithmetic.
      // 2026-08-16 + 180d = 15 (Aug) + 30 + 31 + 30 + 31 + 31 = 168 → 12 Feb.
      const dueDate = getFollowUpDueDate(baseDate, 180);
      expect(dueDate).toBe('2027-02-12');
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
    it('should return empty for a decision with no follow-ups', () => {
      const pending = getPendingFollowUps({ followUps: [] } as unknown as Decision);
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

      // QA-02: the helper takes ONE Decision, not an array of them.
      const pending = getPendingFollowUps(decision);
      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe('fu_1');
    });
  });
});

// QA-02: this whole block used to call an API that does not exist anywhere in
// the repo — `createDecision(userId, { title, description, category,
// decisionDate, confidence, expectedOutcome })` returning
// `{ success: boolean; decision: { followUps: [...] } }`. The real
// DecisionService.createDecision (DecisionService.ts:339) is a single-argument
// compatibility shim over recordDecision() — it takes the Twin-shaped payload
// (twinId / world / question / options / twinRecommendation / userChoice) and
// returns `Decision | null`; there is no `success` flag and follow-ups are rows
// in `follow_up_schedule`, not a nested array on the returned object.
// (The scheduling round-trip is covered in FollowUpScheduler.test.ts.)
// Rewritten against the real contract, and its one live caller,
// TwinContext.tsx:257, which passes exactly this shape.
describe('DecisionService', () => {
  describe('createDecision', () => {
    it('maps the inserted row back to a Decision', async () => {
      const decision = await createDecision({
        twinId: 'twin_1',
        world: 'career',
        question: 'Change careers?',
        options: ['Stay', 'Switch to tech'],
        twinRecommendation: 'Switch to tech',
        userChoice: 'Switch to tech',
        context: 'Switching from finance',
      });

      expect(decision).not.toBeNull();
      expect(decision?.id).toBeDefined();
      expect(decision?.twinId).toBe('twin_1');
      expect(decision?.world).toBe('career');
      expect(decision?.question).toBe('Change careers?');
      expect(decision?.options).toEqual(['Stay', 'Switch to tech']);
      expect(decision?.twinRecommendation).toBe('Switch to tech');
      expect(decision?.userChoice).toBe('Switch to tech');
      expect(decision?.context).toBe('Switching from finance');
    });

    it('defaults the optional fields when they are omitted', async () => {
      const decision = await createDecision({
        twinId: 'twin_2',
        world: 'personal',
        question: 'Test',
      });

      expect(decision?.options).toEqual([]);
      expect(decision?.twinRecommendation).toBe('');
      expect(decision?.userChoice).toBe('');
    });
  });

  describe('getDecisionStats', () => {
    // NOTE: getDecisionStats (DecisionService.ts:327) is currently a stub — it
    // ignores both arguments and always answers zeros. These tests pin the
    // contract that exists today (three numeric counters, never negative);
    // there is no `successRate` field, which is what the old test asserted.
    it('should return zero stats for empty userId', async () => {
      const stats = await getDecisionStats('');
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
    });

    it('should return the counter shape for a valid userId', async () => {
      const stats = await getDecisionStats('twin_1');
      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.completed).toBe('number');
      expect(typeof stats.pendingFollowUps).toBe('number');
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.completed).toBeGreaterThanOrEqual(0);
      expect(stats.pendingFollowUps).toBeGreaterThanOrEqual(0);
    });
  });
});

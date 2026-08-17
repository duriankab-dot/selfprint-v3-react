/**
 * Unit Tests for AIFeedbackLoop
 * @module intelligence/__tests__/AIFeedbackLoop.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import AIFeedbackLoop from './AIFeedbackLoop';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

describe('AIFeedbackLoop', () => {
  let loop: AIFeedbackLoop;

  beforeEach(() => {
    loop = new AIFeedbackLoop();
    vi.clearAllMocks();
  });

  describe('recordFeedback', () => {
    it('should record feedback', async () => {
      const feedback = await loop.recordFeedback('user-123', 'insight-456', 'very_true');
      expect(feedback).toBeDefined();
      expect(feedback.feedbackType).toBe('very_true');
    });

    it('should reject invalid feedback type', async () => {
      await expect(
        loop.recordFeedback('user-123', 'insight-456', 'invalid' as any)
      ).rejects.toThrow();
    });

    it('should throw without userId', async () => {
      await expect(
        loop.recordFeedback('', 'insight-456', 'very_true')
      ).rejects.toThrow();
    });

    it('should allow feedback comment', async () => {
      const feedback = await loop.recordFeedback(
        'user-123',
        'insight-456',
        'somewhat',
        'Partially true but context matters'
      );
      expect(feedback.comment).toBe('Partially true but context matters');
    });
  });

  describe('calibrateFromFeedback', () => {
    it('should calibrate model', async () => {
      // Should not throw
      await loop.calibrateFromFeedback('user-123');
      expect(true).toBe(true);
    });

    it('should throw without userId', async () => {
      await expect(loop.calibrateFromFeedback('')).rejects.toThrow();
    });
  });

  describe('getAccuracyMetrics', () => {
    it('should return metrics', async () => {
      const metrics = await loop.getAccuracyMetrics('user-123');
      expect(metrics.totalInsights).toBeDefined();
      expect(metrics.accuracy).toBeDefined();
      expect(['improving', 'stable', 'declining']).toContain(metrics.trend);
    });
  });

  describe('getInsightFeedback', () => {
    it('should get feedback for insight', async () => {
      const feedback = await loop.getInsightFeedback('insight-456');
      expect(Array.isArray(feedback)).toBe(true);
    });
  });

  describe('getRecentFeedback', () => {
    it('should get recent feedback', async () => {
      const feedback = await loop.getRecentFeedback('user-123', 20);
      expect(Array.isArray(feedback)).toBe(true);
    });
  });
});

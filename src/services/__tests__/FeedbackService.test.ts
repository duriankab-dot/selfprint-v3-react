/**
 * FeedbackService.test.ts
 * Phase F: User Feedback Loop - TDD Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as FeedbackService from '../FeedbackService';

describe('FeedbackService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveFeedback', () => {
    it('should save user feedback with sentiment', async () => {
      const feedback = await FeedbackService.saveFeedback({
        userId: 'user-123',
        twinId: 'twin-456',
        responseId: 'response-789',
        feedbackType: 'quality',
        sentiment: 'positive',
        comment: 'Great response!',
      });

      expect(feedback).toBeDefined();
      expect(feedback.id).toBeDefined();
      expect(feedback.sentiment).toBe('positive');
      expect(feedback.userId).toBe('user-123');
    });

    it('should handle neutral sentiment', async () => {
      const feedback = await FeedbackService.saveFeedback({
        userId: 'user-123',
        twinId: 'twin-456',
        responseId: 'response-789',
        feedbackType: 'relevance',
        sentiment: 'neutral',
      });

      expect(feedback.sentiment).toBe('neutral');
    });

    it('should handle negative sentiment', async () => {
      const feedback = await FeedbackService.saveFeedback({
        userId: 'user-123',
        twinId: 'twin-456',
        responseId: 'response-789',
        feedbackType: 'accuracy',
        sentiment: 'negative',
        comment: 'Not accurate',
      });

      expect(feedback.sentiment).toBe('negative');
    });

    it('should reject invalid userId', async () => {
      await expect(
        FeedbackService.saveFeedback({
          userId: '',
          twinId: 'twin-456',
          responseId: 'response-789',
          feedbackType: 'quality',
          sentiment: 'positive',
        })
      ).rejects.toThrow('Invalid user ID');
    });

    it('should save feedback without comment', async () => {
      const feedback = await FeedbackService.saveFeedback({
        userId: 'user-123',
        twinId: 'twin-456',
        responseId: 'response-789',
        feedbackType: 'quality',
        sentiment: 'positive',
      });

      expect(feedback).toBeDefined();
      expect(feedback.comment).toBeUndefined();
    });
  });

  describe('getUserFeedback', () => {
    it('should retrieve user feedback history', async () => {
      // Setup
      await FeedbackService.saveFeedback({
        userId: 'user-123',
        twinId: 'twin-456',
        responseId: 'response-1',
        feedbackType: 'quality',
        sentiment: 'positive',
      });

      // Retrieve
      const feedbacks = await FeedbackService.getUserFeedback('user-123');

      expect(Array.isArray(feedbacks)).toBe(true);
      expect(feedbacks.length).toBeGreaterThan(0);
    });

    it('should return empty array for user with no feedback', async () => {
      const feedbacks = await FeedbackService.getUserFeedback('nonexistent-user');
      expect(feedbacks).toEqual([]);
    });

    it('should filter feedback by Twin', async () => {
      const feedbacks = await FeedbackService.getUserFeedback('user-123', 'twin-456');
      expect(feedbacks.every(f => f.twinId === 'twin-456')).toBe(true);
    });
  });

  describe('getTwinFeedbackStats', () => {
    it('should calculate feedback statistics for a Twin', async () => {
      const stats = await FeedbackService.getTwinFeedbackStats('twin-456');

      expect(stats).toBeDefined();
      expect(stats.totalFeedback).toBeDefined();
      expect(stats.sentimentBreakdown).toBeDefined();
      expect(stats.sentimentBreakdown.positive).toBeGreaterThanOrEqual(0);
      expect(stats.sentimentBreakdown.neutral).toBeGreaterThanOrEqual(0);
      expect(stats.sentimentBreakdown.negative).toBeGreaterThanOrEqual(0);
    });

    it('should return zero stats for Twin with no feedback', async () => {
      const stats = await FeedbackService.getTwinFeedbackStats('nonexistent-twin');

      expect(stats.totalFeedback).toBe(0);
      expect(stats.sentimentBreakdown.positive).toBe(0);
    });

    it('should calculate average sentiment score', async () => {
      const stats = await FeedbackService.getTwinFeedbackStats('twin-456');

      expect(stats.averageSentimentScore).toBeDefined();
      expect(stats.averageSentimentScore).toBeGreaterThanOrEqual(-1);
      expect(stats.averageSentimentScore).toBeLessThanOrEqual(1);
    });
  });
});

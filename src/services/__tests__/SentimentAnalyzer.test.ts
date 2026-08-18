/**
 * SentimentAnalyzer.test.ts
 * Phase F: Sentiment Analysis - TDD Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as SentimentAnalyzer from '../SentimentAnalyzer';

describe('SentimentAnalyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeSentiment', () => {
    it('should classify positive sentiment from text', async () => {
      const result = await SentimentAnalyzer.analyzeSentiment(
        'This is amazing! I love it.'
      );

      expect(result.sentiment).toBe('positive');
      expect(result.score).toBeGreaterThan(0.5);
    });

    it('should classify negative sentiment from text', async () => {
      const result = await SentimentAnalyzer.analyzeSentiment(
        'This is terrible and frustrating.'
      );

      expect(result.sentiment).toBe('negative');
      expect(result.score).toBeLessThan(-0.5);
    });

    it('should classify neutral sentiment from text', async () => {
      const result = await SentimentAnalyzer.analyzeSentiment(
        'The response was okay. Not great, not bad.'
      );

      expect(result.sentiment).toBe('neutral');
      expect(Math.abs(result.score)).toBeLessThan(0.3);
    });

    it('should handle empty text', async () => {
      const result = await SentimentAnalyzer.analyzeSentiment('');
      expect(result.sentiment).toBe('neutral');
    });

    it('should extract sentiment categories', async () => {
      const result = await SentimentAnalyzer.analyzeSentiment(
        'Very helpful and accurate response!'
      );

      expect(result.categories).toBeDefined();
      expect(Array.isArray(result.categories)).toBe(true);
      expect(result.categories.length).toBeGreaterThan(0);
    });
  });

  describe('scoreResponseQuality', () => {
    it('should calculate quality score for Twin response', async () => {
      const score = await SentimentAnalyzer.scoreResponseQuality({
        responseText: 'Here is a thoughtful and detailed response.',
        userSentiment: 'positive',
        responseLength: 150,
        hasFollowUp: true,
      });

      expect(score).toBeDefined();
      expect(score.quality).toBeGreaterThanOrEqual(0);
      expect(score.quality).toBeLessThanOrEqual(100);
    });

    it('should weight user sentiment heavily in quality score', async () => {
      const positiveScore = await SentimentAnalyzer.scoreResponseQuality({
        responseText: 'Response text',
        userSentiment: 'positive',
        responseLength: 100,
        hasFollowUp: false,
      });

      const negativeScore = await SentimentAnalyzer.scoreResponseQuality({
        responseText: 'Response text',
        userSentiment: 'negative',
        responseLength: 100,
        hasFollowUp: false,
      });

      expect(positiveScore.quality).toBeGreaterThan(negativeScore.quality);
    });

    it('should identify improvement factors', async () => {
      const score = await SentimentAnalyzer.scoreResponseQuality({
        responseText: 'Short.',
        userSentiment: 'negative',
        responseLength: 10,
        hasFollowUp: false,
      });

      expect(score.improvements).toBeDefined();
      expect(score.improvements.length).toBeGreaterThan(0);
    });
  });

  describe('detectImprovementAreas', () => {
    it('should identify common improvement themes', async () => {
      const improvements = await SentimentAnalyzer.detectImprovementAreas([
        { sentiment: 'negative', comment: 'Response too short' },
        { sentiment: 'negative', comment: 'Not detailed enough' },
        { sentiment: 'neutral', comment: 'Could be more specific' },
      ]);

      expect(improvements).toBeDefined();
      expect(Array.isArray(improvements)).toBe(true);
      expect(improvements.length).toBeGreaterThan(0);
    });

    it('should rank improvements by frequency', async () => {
      const improvements = await SentimentAnalyzer.detectImprovementAreas([
        { sentiment: 'negative', comment: 'Too generic' },
        { sentiment: 'negative', comment: 'Too generic' },
        { sentiment: 'negative', comment: 'Too short' },
      ]);

      expect(improvements[0].frequency).toBeGreaterThanOrEqual(improvements[1]?.frequency || 0);
    });

    it('should handle empty feedback array', async () => {
      const improvements = await SentimentAnalyzer.detectImprovementAreas([]);
      expect(improvements).toEqual([]);
    });
  });
});

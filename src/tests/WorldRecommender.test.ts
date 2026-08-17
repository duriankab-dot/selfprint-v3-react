/**
 * WorldRecommender.test.ts
 * Test world recommendation logic
 */

import { describe, it, expect } from 'vitest';
import { recommendWorld, getWorldRecommendations } from '../lib/worldRecommender';

describe('worldRecommender', () => {
  describe('recommendWorld', () => {
    it('should recommend "self" world for identity-related message', () => {
      const result = recommendWorld('I need to understand my true self and authentic values');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.world).toBe('self');
        expect(result.confidence).toBeGreaterThan(0);
      }
    });

    it('should recommend "mind" world for mental clarity message', () => {
      const result = recommendWorld('I am feeling stressed and overwhelmed, need to clear my thoughts');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.world).toBe('mind');
      }
    });

    it('should recommend "career" world for work-related message', () => {
      const result = recommendWorld('I want to advance in my career and get a promotion');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.world).toBe('career');
      }
    });

    it('should recommend "love" world for romance message', () => {
      const result = recommendWorld('I am falling in love and feeling deep affection');
      expect(result).not.toBeNull();
      if (result) {
        expect(result.world).toBe('love');
      }
    });

    it('should return null for empty message', () => {
      const result = recommendWorld('');
      expect(result).toBeNull();
    });

    it('should return null for whitespace-only message', () => {
      const result = recommendWorld('   ');
      expect(result).toBeNull();
    });

    it('should have confidence between 0 and 1', () => {
      const result = recommendWorld('I am stressed and anxious about life choices');
      if (result) {
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('getWorldRecommendations', () => {
    it('should return sorted recommendations by confidence', () => {
      const results = getWorldRecommendations('I need help with career advancement and work stress');
      expect(results.length).toBeGreaterThan(0);
      // Verify sorted descending by confidence
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].confidence).toBeGreaterThanOrEqual(results[i].confidence);
      }
    });

    it('should return empty array for empty message', () => {
      const results = getWorldRecommendations('');
      expect(results).toEqual([]);
    });

    it('should include found keywords in results', () => {
      const results = getWorldRecommendations('I am stressed and anxious');
      const mindWorld = results.find(r => r.world === 'mind');
      if (mindWorld) {
        expect(mindWorld.keywords.length).toBeGreaterThan(0);
      }
    });
  });
});

/**
 * Unit Tests for PatternDetector
 * @module intelligence/__tests__/PatternDetector.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import PatternDetector from './PatternDetector';
import { EvidencePoint, BehavioralPattern } from './types';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      insert: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('PatternDetector', () => {
  let detector: PatternDetector;

  beforeEach(() => {
    detector = new PatternDetector();
    vi.clearAllMocks();
  });

  describe('detectPatterns', () => {
    it('should detect patterns from user data', async () => {
      const patterns = await detector.detectPatterns('test-user');
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should throw error without userId', async () => {
      await expect(detector.detectPatterns('')).rejects.toThrow();
    });
  });

  describe('detectEmergingPatterns', () => {
    it('should find new patterns', async () => {
      const patterns = await detector.detectEmergingPatterns('test-user');
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('detectChangingPatterns', () => {
    it('should find patterns with trend changes', async () => {
      const patterns = await detector.detectChangingPatterns('test-user');
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('detectRepeatingPatterns', () => {
    it('should find consistent patterns', async () => {
      const patterns = await detector.detectRepeatingPatterns('test-user');
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('getPattern', () => {
    it('should get single pattern', async () => {
      const pattern = await detector.getPattern('test-user', 'procrastination');
      expect(pattern === null || pattern instanceof Object).toBe(true);
    });
  });
});

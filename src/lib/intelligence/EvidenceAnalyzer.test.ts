/**
 * Unit Tests for EvidenceAnalyzer
 * @module intelligence/__tests__/EvidenceAnalyzer.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import EvidenceAnalyzer from './EvidenceAnalyzer';
import { EvidenceSource } from './types';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

describe('EvidenceAnalyzer', () => {
  let analyzer: EvidenceAnalyzer;

  beforeEach(() => {
    analyzer = new EvidenceAnalyzer();
    vi.clearAllMocks();
  });

  describe('calculateConfidence', () => {
    it('should calculate confidence from sources', async () => {
      const sources: EvidenceSource[] = [
        {
          type: 'reflection',
          id: '1',
          date: new Date(),
        },
        {
          type: 'memory',
          id: '2',
          date: new Date(),
        },
      ];

      const confidence = await analyzer.calculateConfidence('Test insight', sources);
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should return 0 with no sources', async () => {
      const confidence = await analyzer.calculateConfidence('Test', []);
      expect(confidence).toBe(0);
    });

    it('should increase with more sources', async () => {
      const source: EvidenceSource = {
        type: 'reflection',
        id: '1',
        date: new Date(),
      };

      const conf1 = await analyzer.calculateConfidence('Test', [source]);
      const conf2 = await analyzer.calculateConfidence('Test', [source, source]);

      expect(conf2).toBeGreaterThan(conf1);
    });
  });

  describe('separateKnowInferUnknown', () => {
    it('should classify direct statements as KNOW', () => {
      const level = analyzer.separateKnowInferUnknown('user-123', "I'm an introvert");
      expect(level).toBe('KNOW');
    });

    it('should classify inferred claims as INFER', () => {
      const level = analyzer.separateKnowInferUnknown(
        'user-123',
        'You tend to procrastinate'
      );
      expect(level).toBe('INFER');
    });

    it('should classify uncertain claims as UNKNOWN', () => {
      const level = analyzer.separateKnowInferUnknown('user-123', 'Maybe something');
      expect(level).toBe('UNKNOWN');
    });
  });

  describe('getRecency', () => {
    it('should classify recent dates', () => {
      const recent = new Date();
      const recency = analyzer.getRecency(recent);
      expect(recency).toBe('recent');
    });

    it('should classify old dates', () => {
      const old = new Date();
      old.setDate(old.getDate() - 100);
      const recency = analyzer.getRecency(old);
      expect(recency).toBe('old');
    });
  });

  describe('validateEvidence', () => {
    it('should validate evidence', async () => {
      const points: any[] = [];
      const valid = await analyzer.validateEvidence('user-123', points);
      expect(typeof valid).toBe('boolean');
    });
  });

  describe('getAccuracyMetrics', () => {
    it('should return accuracy metrics', async () => {
      const metrics = await analyzer.getAccuracyMetrics('user-123');
      expect(metrics.totalFeedback).toBeDefined();
    });
  });
});

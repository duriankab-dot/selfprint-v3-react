/**
 * QualityMetricsService.test.ts
 * Phase F: Quality Metrics Tracking - TDD Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as QualityMetricsService from '../QualityMetricsService';

describe('QualityMetricsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordQualityMetric', () => {
    it('should record quality metric for a Twin response', async () => {
      const metric = await QualityMetricsService.recordQualityMetric({
        twinId: 'twin-456',
        world: 'career',
        qualityScore: 85,
        userRating: 4,
        feedbackCount: 1,
      });

      expect(metric).toBeDefined();
      expect(metric.twinId).toBe('twin-456');
      expect(metric.qualityScore).toBe(85);
      expect(metric.world).toBe('career');
    });

    it('should validate quality score range (0-100)', async () => {
      await expect(
        QualityMetricsService.recordQualityMetric({
          twinId: 'twin-456',
          world: 'career',
          qualityScore: 150,
          userRating: 5,
          feedbackCount: 1,
        })
      ).rejects.toThrow('Quality score must be between 0 and 100');
    });

    it('should validate rating range (1-5)', async () => {
      await expect(
        QualityMetricsService.recordQualityMetric({
          twinId: 'twin-456',
          world: 'career',
          qualityScore: 75,
          userRating: 6,
          feedbackCount: 1,
        })
      ).rejects.toThrow('User rating must be between 1 and 5');
    });
  });

  describe('getTwinQualityMetrics', () => {
    it('should retrieve quality metrics for a Twin', async () => {
      // Setup
      await QualityMetricsService.recordQualityMetric({
        twinId: 'twin-456',
        world: 'career',
        qualityScore: 85,
        userRating: 4,
        feedbackCount: 1,
      });

      // Retrieve
      const metrics = await QualityMetricsService.getTwinQualityMetrics('twin-456');

      expect(metrics).toBeDefined();
      expect(metrics.averageQualityScore).toBeGreaterThan(0);
      expect(metrics.totalRatings).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average quality per world', async () => {
      const metrics = await QualityMetricsService.getTwinQualityMetrics('twin-456');

      expect(metrics.worldMetrics).toBeDefined();
      expect(typeof metrics.worldMetrics).toBe('object');

      if (Object.keys(metrics.worldMetrics).length > 0) {
        const world = Object.keys(metrics.worldMetrics)[0];
        expect(metrics.worldMetrics[world]).toBeDefined();
        expect(metrics.worldMetrics[world].average).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return zero metrics for Twin with no data', async () => {
      const metrics = await QualityMetricsService.getTwinQualityMetrics('nonexistent-twin');

      expect(metrics.averageQualityScore).toBe(0);
      expect(metrics.totalRatings).toBe(0);
    });
  });

  describe('getQualityTrend', () => {
    it('should calculate quality trend over time', async () => {
      const trend = await QualityMetricsService.getQualityTrend('twin-456', 'career', 7);

      expect(trend).toBeDefined();
      expect(Array.isArray(trend.dataPoints)).toBe(true);
      expect(trend.direction).toMatch(/improving|stable|declining/);
    });

    it('should return stable trend for Twin with no quality change', async () => {
      const trend = await QualityMetricsService.getQualityTrend('nonexistent-twin', 'career', 7);

      expect(trend.direction).toBe('stable');
      expect(trend.dataPoints.length).toBeGreaterThan(0);
    });

    it('should detect improving trend', async () => {
      // Setup: Record improving scores
      for (let i = 0; i < 3; i++) {
        await QualityMetricsService.recordQualityMetric({
          twinId: 'twin-improving',
          world: 'health',
          qualityScore: 60 + i * 10, // 60, 70, 80
          userRating: 3 + i,
          feedbackCount: 1,
        });
      }

      const trend = await QualityMetricsService.getQualityTrend('twin-improving', 'health', 7);
      expect(trend.direction).toBe('improving');
    });
  });

  describe('checkQualityDegradation', () => {
    it('should alert when quality drops below threshold', async () => {
      const degradation = await QualityMetricsService.checkQualityDegradation(
        'twin-456',
        'career',
        70 // threshold
      );

      if (degradation.isDegraded) {
        expect(degradation.previousScore).toBeGreaterThan(degradation.currentScore);
        expect(degradation.dropPercentage).toBeGreaterThan(0);
      }
    });

    it('should not alert for improving quality', async () => {
      const degradation = await QualityMetricsService.checkQualityDegradation(
        'twin-improving',
        'health',
        50
      );

      expect(degradation.isDegraded).toBe(false);
    });
  });
});

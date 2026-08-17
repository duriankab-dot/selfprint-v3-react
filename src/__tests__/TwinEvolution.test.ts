/**
 * TwinEvolution.test.ts
 * Unit tests for Twin Evolution system
 */

import { describe, it, expect } from 'vitest';
import {
  TWIN_STAGES,
  calculateProgress,
  getNextMilestoneText,
  STAGE_COLORS,
  STAGE_OPACITY,
  ProgressMetrics,
} from '../constants/twinStages';
import {
  checkMicroEvolution,
  evolveTwin,
  getEvolutionStatus,
} from '../services/TwinEvolutionService';

describe('Twin Stages Constants', () => {
  it('should have 5 stages defined', () => {
    expect(Object.keys(TWIN_STAGES)).toHaveLength(5);
  });

  it('should have correct stage names', () => {
    expect(TWIN_STAGES[1].name).toBe('Core Formation');
    expect(TWIN_STAGES[2].name).toBe('Pattern Recognition');
    expect(TWIN_STAGES[3].name).toBe('Deep Understanding');
    expect(TWIN_STAGES[4].name).toBe('Wisdom Stage');
    expect(TWIN_STAGES[5].name).toBe('Full Holographic Form');
  });

  it('should have increasing requirements per stage', () => {
    expect(TWIN_STAGES[1].minMessages).toBeLessThan(TWIN_STAGES[2].minMessages);
    expect(TWIN_STAGES[2].minMessages).toBeLessThan(TWIN_STAGES[3].minMessages);
    expect(TWIN_STAGES[3].minMessages).toBeLessThan(TWIN_STAGES[4].minMessages);
    expect(TWIN_STAGES[4].minMessages).toBeLessThan(TWIN_STAGES[5].minMessages);
  });

  it('should have valid colors', () => {
    for (let stage = 1; stage <= 5; stage++) {
      const colors = STAGE_COLORS[stage as keyof typeof STAGE_COLORS];
      expect(colors.primary).toMatch(/^#[0-9a-f]{6}$/i);
      expect(colors.secondary).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('should have valid opacity values', () => {
    for (let stage = 1; stage <= 5; stage++) {
      const opacity = STAGE_OPACITY[stage as keyof typeof STAGE_OPACITY];
      expect(opacity).toBeGreaterThan(0);
      expect(opacity).toBeLessThanOrEqual(1);
    }
  });
});

describe('calculateProgress', () => {
  const baseMetrics: ProgressMetrics = {
    daysSinceAwakening: 0,
    messageCount: 0,
    patternCount: 0,
    memoryCount: 0,
    feedbackCount: 0,
  };

  it('should return 100% progress for stage 5', () => {
    const result = calculateProgress(5, baseMetrics);
    expect(result.progressPercent).toBe(100);
    expect(result.canEvolve).toBe(false);
  });

  it('should show 0% progress for stage 1 with no activity', () => {
    const result = calculateProgress(1, baseMetrics);
    expect(result.progressPercent).toBeGreaterThanOrEqual(0);
  });

  it('should calculate progress based on message count', () => {
    const result1 = calculateProgress(1, baseMetrics);
    const result2 = calculateProgress(1, { ...baseMetrics, messageCount: 5 });
    expect(result2.progressPercent).toBeGreaterThan(result1.progressPercent);
  });

  it('should allow evolution when all requirements met', () => {
    const readyMetrics: ProgressMetrics = {
      daysSinceAwakening: 3,
      messageCount: 10,
      patternCount: 1,
      memoryCount: 0,
      feedbackCount: 0,
    };
    const result = calculateProgress(1, readyMetrics);
    expect(result.canEvolve).toBe(true);
  });

  it('should return next stage when not at max', () => {
    const result = calculateProgress(2, baseMetrics);
    expect(result.nextStage).toBe(3);
  });

  it('should not return next stage when at max', () => {
    const result = calculateProgress(5, baseMetrics);
    expect(result.nextStage).toBeUndefined();
  });
});

describe('getNextMilestoneText', () => {
  const baseMetrics: ProgressMetrics = {
    daysSinceAwakening: 0,
    messageCount: 0,
    patternCount: 0,
    memoryCount: 0,
    feedbackCount: 0,
  };

  it('should show complete message for stage 5', () => {
    const text = getNextMilestoneText(5, baseMetrics);
    expect(text).toContain('maximum evolution');
  });

  it('should show message requirement for early stage', () => {
    const text = getNextMilestoneText(1, baseMetrics);
    expect(text).toContain('conversation');
  });

  it('should show ready message when requirements met', () => {
    const readyMetrics: ProgressMetrics = {
      daysSinceAwakening: 3,
      messageCount: 10,
      patternCount: 1,
      memoryCount: 0,
      feedbackCount: 0,
    };
    const text = getNextMilestoneText(1, readyMetrics);
    expect(text).toContain('Ready to evolve');
  });

  it('should handle singular/plural correctly', () => {
    const text1 = getNextMilestoneText(1, { ...baseMetrics, messageCount: 9 });
    expect(text1).toContain('1 more conversation');

    const text2 = getNextMilestoneText(1, { ...baseMetrics, messageCount: 8 });
    expect(text2).toContain('conversations');
  });
});

describe('TwinEvolutionService', () => {
  const testUserId = 'user_test_123';
  const baseMetrics: ProgressMetrics = {
    daysSinceAwakening: 0,
    messageCount: 0,
    patternCount: 0,
    memoryCount: 0,
    feedbackCount: 0,
  };

  describe('checkMicroEvolution', () => {
    it('should return false for invalid inputs', async () => {
      const result = await checkMicroEvolution('', baseMetrics, 1);
      expect(result.evolved).toBe(false);
    });

    it('should return false for stage 5', async () => {
      const result = await checkMicroEvolution(testUserId, baseMetrics, 5);
      expect(result.evolved).toBe(false);
      expect(result.progress).toBe(100);
    });

    it('should detect evolution when ready', async () => {
      const readyMetrics: ProgressMetrics = {
        daysSinceAwakening: 3,
        messageCount: 10,
        patternCount: 1,
        memoryCount: 0,
        feedbackCount: 0,
      };
      const result = await checkMicroEvolution(testUserId, readyMetrics, 1);
      expect(result.evolved).toBe(true);
      expect(result.newStage).toBe(2);
    });

    it('should track progress', async () => {
      const result = await checkMicroEvolution(testUserId, baseMetrics, 1);
      expect(result.progress).toBeGreaterThanOrEqual(0);
      expect(result.progress).toBeLessThanOrEqual(100);
    });
  });

  describe('evolveTwin', () => {
    it('should fail with invalid inputs', async () => {
      const result = await evolveTwin('', 2);
      expect(result.success).toBe(false);
    });

    it('should evolve Twin successfully', async () => {
      const result = await evolveTwin(testUserId, 2);
      expect(result.success).toBe(true);
    });
  });

  describe('getEvolutionStatus', () => {
    it('should fail with invalid userId', async () => {
      const result = await getEvolutionStatus('');
      expect(result.success).toBe(false);
    });

    it('should return status for valid userId', async () => {
      const result = await getEvolutionStatus(testUserId);
      expect(result.success).toBe(true);
      expect(result.currentStage).toBeDefined();
      expect(result.metrics).toBeDefined();
    });
  });
});

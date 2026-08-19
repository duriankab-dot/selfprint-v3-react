/**
 * CoreAwakening.test.ts
 * Unit tests for Core Awakening ceremony services
 */

import { describe, it, expect, vi } from 'vitest';
import {
  checkReadyForAwakening,
  startAwakening,
  initializeTwin,
  completeCoreAwakening,
  getAwakeningTimeline,
} from '../services/CoreAwakeningService';
import { createTwin, createFirstMemory } from '../api/twin/create';

// Mock SICEOrchestrator so startAwakening doesn't run real SICE engines
vi.mock('../services/sice/SICEOrchestrator', () => ({
  SICEOrchestrator: vi.fn().mockImplementation(() => ({
    orchestrate: vi.fn().mockResolvedValue({
      personalIntelligence: {
        insights: ['You are deeply self-aware'],
        nextStepsSuggested: ['Continue exploring'],
        recommendedAction: 'Embrace your journey',
        warningsOrCautions: [],
      },
      synthesis: { themes: ['Growth', 'Self-awareness'] },
      results: {},
      totalExecutionTime: 50,
    }),
  })),
}));

describe('CoreAwakeningService', () => {
  const testUserId = 'user_test_123';
  const testTwinName = 'Aria';

  describe('checkReadyForAwakening', () => {
    it('should return false for missing userId', async () => {
      const result = await checkReadyForAwakening('');
      expect(result).toBe(false);
    });

    it('should return true for valid userId', async () => {
      const result = await checkReadyForAwakening(testUserId);
      expect(result).toBe(true);
    });
  });

  describe('startAwakening', () => {
    it('should fail with missing userId', async () => {
      const result = await startAwakening('');
      expect(result.success).toBe(false);
    });

    it('should start awakening process successfully', async () => {
      const result = await startAwakening(testUserId);
      expect(result.success).toBe(true);
      // Message is in Thai: 'กระบวนการ Awakening เริ่มต้น...' — check key word
      expect(result.message).toContain('Awakening');
    });
  });

  describe('initializeTwin', () => {
    it('should fail with missing userId or name', async () => {
      const result1 = await initializeTwin('', testTwinName);
      expect(result1.success).toBe(false);

      const result2 = await initializeTwin(testUserId, '');
      expect(result2.success).toBe(false);
    });

    it('should initialize Twin successfully', async () => {
      const result = await initializeTwin(testUserId, testTwinName);
      expect(result.success).toBe(true);
      expect(result.twinId).toBeDefined();
      expect(result.message).toContain(testTwinName);
    });
  });

  describe('completeCoreAwakening', () => {
    it('should fail with missing userId or name', async () => {
      const result1 = await completeCoreAwakening('', testTwinName);
      expect(result1.success).toBe(false);

      const result2 = await completeCoreAwakening(testUserId, '');
      expect(result2.success).toBe(false);
    });

    it('should complete awakening successfully', async () => {
      const result = await completeCoreAwakening(testUserId, testTwinName);
      expect(result.success).toBe(true);
      expect(result.message).toContain('complete');
    });
  });

  describe('getAwakeningTimeline', () => {
    it('should return all 5 phases', () => {
      const timeline = getAwakeningTimeline();
      expect(timeline.phase1).toBeDefined();
      expect(timeline.phase2).toBeDefined();
      expect(timeline.phase3).toBeDefined();
      expect(timeline.phase4).toBeDefined();
      expect(timeline.phase5).toBeDefined();
    });

    it('should have correct phase names', () => {
      const timeline = getAwakeningTimeline();
      expect(timeline.phase1.name).toBe('Intro');
      expect(timeline.phase2.name).toBe('Processing');
      expect(timeline.phase3.name).toBe('Birth');
      expect(timeline.phase4.name).toBe('Naming');
      expect(timeline.phase5.name).toBe('Complete');
    });

    it('should have minimum duration of 16 seconds', () => {
      const timeline = getAwakeningTimeline();
      expect(timeline.totalMinDuration).toBeGreaterThanOrEqual(16);
    });
  });
});

describe('TwinCreationAPI', () => {
  describe('createTwin', () => {
    const testRequest = {
      userId: 'user_test_123',
      twinName: 'Aria',
      birthData: {
        date: '2026-08-16',
        timezone: 'UTC',
      },
    };

    it('should fail with missing userId', async () => {
      const invalidRequest = { ...testRequest, userId: '' };
      await expect(createTwin(invalidRequest)).rejects.toThrow();
    });

    it('should fail with missing twinName', async () => {
      const invalidRequest = { ...testRequest, twinName: '' };
      await expect(createTwin(invalidRequest)).rejects.toThrow();
    });

    it('should create Twin successfully', async () => {
      const result = await createTwin(testRequest);
      expect(result.success).toBe(true);
      expect(result.twinId).toBeDefined();
      expect(result.twinProfile).toBeDefined();
      expect(result.twinProfile.name).toBe(testRequest.twinName);
      expect(result.twinProfile.stage).toBe(1);
    });

    it('should initialize session', async () => {
      const result = await createTwin(testRequest);
      expect(result.session).toBeDefined();
      expect(result.session?.sessionId).toBeDefined();
      expect(result.session?.startedAt).toBeDefined();
    });

    it('should include initial seed', async () => {
      const result = await createTwin(testRequest);
      expect(result.initialSeed).toBeDefined();
    });
  });

  describe('createFirstMemory', () => {
    it('should fail with missing twinId', async () => {
      const result = await createFirstMemory('', 'Aria');
      expect(result.success).toBe(false);
    });

    it('should fail with missing twinName', async () => {
      const result = await createFirstMemory('twin_123', '');
      expect(result.success).toBe(false);
    });

    it('should create first memory successfully', async () => {
      const result = await createFirstMemory('twin_123', 'Aria');
      expect(result.success).toBe(true);
      expect(result.memoryId).toBeDefined();
    });
  });
});

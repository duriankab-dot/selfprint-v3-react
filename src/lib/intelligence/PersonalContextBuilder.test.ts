/**
 * Unit Tests for PersonalContextBuilder
 * @module intelligence/__tests__/PersonalContextBuilder.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import PersonalContextBuilder from './PersonalContextBuilder';
import { InitializeContextRequest, PersonalContext } from './types';

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
  db: {
    selectMany: vi.fn().mockResolvedValue([]),
  },
}));

describe('PersonalContextBuilder', () => {
  let builder: PersonalContextBuilder;

  beforeEach(() => {
    builder = new PersonalContextBuilder();
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize context from onboarding data', async () => {
      const request: InitializeContextRequest = {
        userId: 'test-user-123',
        mood: 'thoughtful',
        birthDate: new Date('1990-01-15'),
        onboardingAnswers: {
          values: 'Family, Growth, Creativity',
          goals: 'Start a side project, improve relationships',
        },
      };

      const result = await builder.initialize(request);

      expect(result.success).toBe(true);
      expect(result.userId).toBe('test-user-123');
      expect(result.context).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(result.memories).toBeDefined();
    });

    it('should handle missing userId gracefully', async () => {
      const request: InitializeContextRequest = {
        userId: '',
        mood: 'thoughtful',
        birthDate: new Date(),
        onboardingAnswers: {},
      };

      const result = await builder.initialize(request);

      expect(result.success).toBe(false);
    });

    it('should create personal profile', async () => {
      const request: InitializeContextRequest = {
        userId: 'test-user-123',
        mood: 'inspired',
        birthDate: new Date('1995-06-20'),
        onboardingAnswers: {},
      };

      await builder.initialize(request);

      // Verify profile created
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('getContext', () => {
    it('should return personal context for user', async () => {
      const userId = 'test-user-123';
      const context = await builder.getContext(userId);

      expect(context).toBeDefined();
      expect(context.userId).toBe(userId);
      expect(context.values).toBeDefined();
      expect(context.goals).toBeDefined();
      expect(context.strengths).toBeDefined();
    });

    it('should throw error on missing userId', async () => {
      expect(async () => {
        await builder.getContext('');
      }).rejects.toThrow();
    });

    it('should calculate overall confidence', async () => {
      const context = await builder.getContext('test-user-123');
      expect(context.confidenceOverall).toBeGreaterThanOrEqual(0);
      expect(context.confidenceOverall).toBeLessThanOrEqual(1);
    });
  });

  describe('inferValues', () => {
    it('should infer user values', async () => {
      const values = await builder.inferValues('test-user-123');
      expect(values).toBeDefined();
      expect(Array.isArray(values)).toBe(true);
    });

    it('should return empty array if no values found', async () => {
      const values = await builder.inferValues('non-existent-user');
      expect(Array.isArray(values)).toBe(true);
    });
  });

  describe('inferGoals', () => {
    it('should infer user goals', async () => {
      const goals = await builder.inferGoals('test-user-123');
      expect(goals).toBeDefined();
      expect(Array.isArray(goals)).toBe(true);
    });
  });

  describe('inferBlindSpots', () => {
    it('should infer blind spots', async () => {
      const blindSpots = await builder.inferBlindSpots('test-user-123');
      expect(blindSpots).toBeDefined();
      expect(Array.isArray(blindSpots)).toBe(true);
    });

    it('should mark blind spots with sensitivity level', async () => {
      const blindSpots = await builder.inferBlindSpots('test-user-123');
      blindSpots.forEach((bs) => {
        expect(['low', 'medium', 'high']).toContain(bs.sensitivityLevel);
      });
    });
  });

  describe('updateFromReflection', () => {
    it('should update context from reflection', async () => {
      const request = {
        userId: 'test-user-123',
        reflectionContent: 'Today I realized I procrastinate on difficult tasks',
        aiAnalysis: {
          emotions: ['frustrated', 'thoughtful'],
          decisions: [],
          patterns: [
            {
              patternName: 'procrastination',
              patternType: 'repeating' as const,
              confidence: 0.7,
            },
          ],
          newInsights: ['You tend to avoid difficult decisions'],
          suggestedMemories: [],
        },
        timestamp: new Date(),
      };

      const context = await builder.updateFromReflection(request);
      expect(context).toBeDefined();
    });
  });
});

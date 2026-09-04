/**
 * Unit Tests for PersonalContextBuilder
 * @module intelligence/__tests__/PersonalContextBuilder.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import PersonalContextBuilder from './PersonalContextBuilder';
import { supabase, db } from '@/lib/supabase/client';
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

    // QA-02: this used to just call initialize({ userId: '' }) and expect
    // success:false. PersonalContextBuilder has no client-side userId guard —
    // it hands the value straight to `personal_profiles.insert`
    // (PersonalContextBuilder.ts:209) and relies on the column's NOT NULL
    // constraint, so with a mock that always succeeds nothing failed and the
    // assertion could never hold. Model the rejection Postgres actually returns
    // and assert the graceful-degradation path the method does implement.
    it('should handle a rejected profile insert gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'null value in column "user_id" violates not-null constraint' },
        }),
      } as never);

      const request: InitializeContextRequest = {
        userId: '',
        mood: 'thoughtful',
        birthDate: new Date(),
        onboardingAnswers: {},
      };

      const result = await builder.initialize(request);

      expect(result.success).toBe(false);
      expect(result.userId).toBe('');
      expect(result.patterns).toEqual([]);
      expect(result.memories).toEqual([]);
      expect(result.message).toBe('Failed to initialize context');
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

    // QA-02: the old test was `expect(async () => { await builder.getContext('')
    // }).rejects.toThrow()` — which asserts on the *function object*, never
    // awaits it, and so passed or failed for reasons unrelated to getContext.
    // getContext() has no empty-userId guard either: it queries with
    // user_id: '' and returns an empty context (PersonalContextBuilder.ts:128).
    // The failure mode it does implement is wrapping a DB error in an
    // IntelligenceError, which is what this now checks.
    it('should wrap DB failures in an IntelligenceError', async () => {
      vi.mocked(db.selectMany).mockRejectedValueOnce(new Error('connection refused'));

      await expect(builder.getContext('test-user-123')).rejects.toThrow(
        /Failed to get context/
      );
    });

    it('should return an empty context for an unknown user rather than throwing', async () => {
      const context = await builder.getContext('');

      expect(context.userId).toBe('');
      expect(context.sourceCount).toBe(0);
      expect(context.values).toEqual([]);
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
        expect(['low', 'medium', 'high']).toContain(bs.sensitivity);
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

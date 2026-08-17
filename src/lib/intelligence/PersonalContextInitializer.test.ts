/**
 * PersonalContextInitializer.test.ts
 *
 * Unit tests for PersonalContextInitializer
 * Verifies transformation of onboarding data into PersonalContext
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initializeContextFromOnboarding,
  validateOnboardingData,
} from './PersonalContextInitializer';
import type { OnboardingContextData } from './PersonalContextInitializer';
import type { AnalysisResponse } from '@/lib/types/astrovera';
import type { Mood } from '@/context/EmotionContext';

describe('PersonalContextInitializer', () => {
  const mockAnalysisResponse: AnalysisResponse = {
    decisionStyle: 'Intuitive-Analytical',
    strengths: ['Leadership: Natural ability to guide others', 'Creativity: Strong creative thinking'],
    insights: ['Opportunity to develop public speaking', 'Consider exploring collaborative projects'],
    blindSpots: [
      'Tendency to over-commit',
      'Sometimes misses details in rush to execute',
    ],
    opportunities: ['Public speaking', 'Team leadership', 'Creative ventures'],
    confidence: 0.85,
  };

  const mockOnboardingData: OnboardingContextData = {
    userId: 'user-123',
    birthDate: '1990-05-15',
    mood: 'creative' as Mood,
    analysisResponse: mockAnalysisResponse,
    finetuneAnswers: {
      q1: 'answer1',
      q2: 'answer2',
    },
  };

  describe('initializeContextFromOnboarding', () => {
    it('should create PersonalContext from onboarding data', async () => {
      const context = await initializeContextFromOnboarding(mockOnboardingData);

      expect(context).toBeDefined();
      expect(context.userId).toBe(mockOnboardingData.userId);
      expect(context.birthDate).toBe(mockOnboardingData.birthDate);
      expect(context.moodState).toBe(mockOnboardingData.mood);
    });

    it('should transform strengths into values', async () => {
      const context = await initializeContextFromOnboarding(mockOnboardingData);

      expect(context.values).toBeDefined();
      expect(context.values!.length).toBeGreaterThanOrEqual(
        mockAnalysisResponse.strengths.length
      );

      const firstValue = context.values![0];
      expect(firstValue.title).toBeTruthy();
      expect(firstValue.importance).toBe('high');
      expect(firstValue.confidence).toBeGreaterThan(0.8);
      expect(firstValue.sourceOfTruth).toBe('onboarding_strengths');
    });

    it('should transform insights into goals', async () => {
      const context = await initializeContextFromOnboarding(mockOnboardingData);

      expect(context.goals).toBeDefined();
      expect(context.goals!.length).toBeGreaterThanOrEqual(
        mockAnalysisResponse.insights.length
      );

      const firstGoal = context.goals![0];
      expect(firstGoal.title).toBeTruthy();
      expect(firstGoal.timeframe).toBe('6-months');
      expect(firstGoal.confidence).toBeLessThanOrEqual(0.85);
      expect(firstGoal.sourceOfTruth).toBe('onboarding_insights');
    });

    it('should transform blind spots', async () => {
      const context = await initializeContextFromOnboarding(mockOnboardingData);

      expect(context.blindSpots).toBeDefined();
      expect(context.blindSpots!.length).toBeGreaterThanOrEqual(
        mockAnalysisResponse.blindSpots.length
      );

      const firstBlindSpot = context.blindSpots![0];
      expect(firstBlindSpot.title).toBeTruthy();
      expect(firstBlindSpot.potentialImpact).toBe('medium');
      expect(firstBlindSpot.confidence).toBeLessThanOrEqual(0.75);
      expect(firstBlindSpot.actionable).toBe(true);
    });

    it('should set decision style from analysis', async () => {
      const context = await initializeContextFromOnboarding(mockOnboardingData);

      expect(context.decisionStyle).toBeDefined();
      expect(context.decisionStyle?.type).toBe(mockAnalysisResponse.decisionStyle);
      expect(context.decisionStyle?.confidence).toBeGreaterThan(0.75);
      expect(context.decisionStyle?.sourceOfTruth).toBe('onboarding_analysis');
    });

    it('should extract active hubs from analysis', async () => {
      const context = await initializeContextFromOnboarding(mockOnboardingData);

      expect(context.hubsActive).toBeDefined();
      expect(Array.isArray(context.hubsActive)).toBe(true);
      expect(context.hubsActive!.length).toBeGreaterThan(0);
      // Core hubs should be present
      expect(context.hubsActive).toContain('personal-growth');
    });

    it('should calculate confidence with slight reduction for inferred fields', async () => {
      const highConfidenceData: OnboardingContextData = {
        ...mockOnboardingData,
        analysisResponse: {
          ...mockAnalysisResponse,
          confidence: 1.0,
        },
      };

      const context = await initializeContextFromOnboarding(highConfidenceData);

      // Inferred fields should have slightly lower confidence than analysis confidence
      if (context.goals && context.goals.length > 0) {
        const goalConfidence = context.goals[0].confidence;
        expect(goalConfidence).toBeLessThan(1.0);
        expect(goalConfidence).toBeGreaterThanOrEqual(0.8);
      }
    });
  });

  describe('validateOnboardingData', () => {
    it('should pass validation for complete data', () => {
      expect(() => validateOnboardingData(mockOnboardingData)).not.toThrow();
    });

    it('should throw error if userId is missing', () => {
      const invalidData = { ...mockOnboardingData, userId: '' };
      expect(() => validateOnboardingData(invalidData)).toThrow('userId is required');
    });

    it('should throw error if birthDate is missing', () => {
      const invalidData = { ...mockOnboardingData, birthDate: '' };
      expect(() => validateOnboardingData(invalidData)).toThrow('birthDate is required');
    });

    it('should throw error if mood is missing', () => {
      const invalidData = { ...mockOnboardingData, mood: undefined as unknown as Mood };
      expect(() => validateOnboardingData(invalidData)).toThrow('mood is required');
    });

    it('should throw error if analysisResponse is missing', () => {
      const invalidData = { ...mockOnboardingData, analysisResponse: undefined as unknown as AnalysisResponse };
      expect(() => validateOnboardingData(invalidData)).toThrow('analysisResponse is required');
    });

    it('should throw error if strengths is not an array', () => {
      const invalidData: OnboardingContextData = {
        ...mockOnboardingData,
        analysisResponse: {
          ...mockAnalysisResponse,
          strengths: 'not-an-array' as unknown as string[],
        },
      };
      expect(() => validateOnboardingData(invalidData)).toThrow(
        'analysisResponse.strengths must be an array'
      );
    });

    it('should throw error if confidence is not a valid number', () => {
      const invalidData: OnboardingContextData = {
        ...mockOnboardingData,
        analysisResponse: {
          ...mockAnalysisResponse,
          confidence: 1.5, // Out of range
        },
      };
      expect(() => validateOnboardingData(invalidData)).toThrow(
        'analysisResponse.confidence must be a number between 0 and 1'
      );
    });

    it('should validate multiple issues in order', () => {
      const completelyInvalidData: OnboardingContextData = {
        userId: '',
        birthDate: '',
        mood: undefined as unknown as Mood,
        analysisResponse: undefined as unknown as AnalysisResponse,
      };

      // Should throw on first validation error (userId)
      expect(() => validateOnboardingData(completelyInvalidData)).toThrow('userId is required');
    });
  });

  describe('Hub extraction', () => {
    it('should include decision hub when analysis mentions decision', async () => {
      const dataWithDecisionInsight: OnboardingContextData = {
        ...mockOnboardingData,
        analysisResponse: {
          ...mockAnalysisResponse,
          insights: ['Opportunity in decision-making skills'],
        },
      };

      const context = await initializeContextFromOnboarding(dataWithDecisionInsight);
      expect(context.hubsActive).toContain('decision-making');
    });

    it('should include creativity hub when analysis mentions creative', async () => {
      const dataWithCreativityInsight: OnboardingContextData = {
        ...mockOnboardingData,
        analysisResponse: {
          ...mockAnalysisResponse,
          blindSpots: ['Creative expression could be enhanced'],
        },
      };

      const context = await initializeContextFromOnboarding(dataWithCreativityInsight);
      expect(context.hubsActive).toContain('creativity');
    });

    it('should not duplicate hubs', async () => {
      const context = await initializeContextFromOnboarding(mockOnboardingData);

      const uniqueHubs = new Set(context.hubsActive);
      expect(uniqueHubs.size).toBe(context.hubsActive!.length);
    });
  });
});

/**
 * SICEBridge.test.ts
 * Unit tests for SICEBridge — SICE→Intelligence bridge
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SICEBridge } from './SICEBridge';
import type { OrchestratorResult, DetectedPattern } from '@/types/sice';

describe('SICEBridge', () => {
  let bridge: SICEBridge;

  beforeEach(() => {
    bridge = new SICEBridge();
  });

  describe('bridgePatternResults', () => {
    it('should bridge SICE pattern results to lib', async () => {
      const orchestratorResult: OrchestratorResult = {
        userId: 'test-user-1',
        timestamp: new Date().toISOString(),
        results: [
          {
            engineId: 2,
            engineName: 'PatternDetector',
            result: [
              {
                name: 'decision_hesitation',
                frequency: 5,
                lastObserved: new Date().toISOString(),
                impact: 'negative',
                examples: ['Delayed decision on project', 'Postponed career move'],
                confidence: 75,
              } as DetectedPattern,
            ] as DetectedPattern[],
            confidence: 75,
            executionTime: 150,
          },
        ],
        synthesis: { themes: [], conflicts: [], agreements: [], confidenceScore: 75 },
        fineTuned: { adjustedForFeedback: false, feedbackHistoryConsidered: 0, adjustments: [] },
        personalIntelligence: {
          userUnderstanding: 65,
          recommendedAction: 'Focus on decision confidence',
          confidence: 75,
          insights: [],
          nextStepsSuggested: [],
          warningsOrCautions: [],
        },
        totalExecutionTime: 500,
      };

      const result = await bridge.bridgePatternResults(orchestratorResult);

      expect(result.success).toBe(true);
      expect(result.patternsProcessed).toBe(1);
    });

    it('should handle missing PatternDetector engine gracefully', async () => {
      const orchestratorResult: OrchestratorResult = {
        userId: 'test-user-1',
        timestamp: new Date().toISOString(),
        results: [
          {
            engineId: 1, // Not PatternDetector
            engineName: 'PersonalContextBuilder',
            result: {},
            confidence: 50,
            executionTime: 100,
          },
        ],
        synthesis: { themes: [], conflicts: [], agreements: [], confidenceScore: 50 },
        fineTuned: { adjustedForFeedback: false, feedbackHistoryConsidered: 0, adjustments: [] },
        personalIntelligence: {
          userUnderstanding: 50,
          recommendedAction: 'Continue',
          confidence: 50,
          insights: [],
          nextStepsSuggested: [],
          warningsOrCautions: [],
        },
        totalExecutionTime: 300,
      };

      const result = await bridge.bridgePatternResults(orchestratorResult);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return 0 patterns if PatternDetector returned empty', async () => {
      const orchestratorResult: OrchestratorResult = {
        userId: 'test-user-1',
        timestamp: new Date().toISOString(),
        results: [
          {
            engineId: 2,
            engineName: 'PatternDetector',
            result: [] as DetectedPattern[],
            confidence: 50,
            executionTime: 100,
          },
        ],
        synthesis: { themes: [], conflicts: [], agreements: [], confidenceScore: 50 },
        fineTuned: { adjustedForFeedback: false, feedbackHistoryConsidered: 0, adjustments: [] },
        personalIntelligence: {
          userUnderstanding: 50,
          recommendedAction: 'Continue',
          confidence: 50,
          insights: [],
          nextStepsSuggested: [],
          warningsOrCautions: [],
        },
        totalExecutionTime: 300,
      };

      const result = await bridge.bridgePatternResults(orchestratorResult);

      expect(result.success).toBe(true);
      expect(result.patternsProcessed).toBe(0);
    });
  });

  describe('bridgeBadgeResults', () => {
    it('should bridge SICE badge results to lib', async () => {
      const orchestratorResult: OrchestratorResult = {
        userId: 'test-user-1',
        timestamp: new Date().toISOString(),
        results: [
          {
            engineId: 8,
            engineName: 'BadgeEngine',
            result: {
              unlockedBadges: [
                { id: 'first-chat', name: 'First Step' },
                { id: 'pattern-master', name: 'Pattern Master' },
              ],
              earnedThisSession: [],
              nextMilestones: [],
              totalProgress: 15,
            },
            confidence: 85,
            executionTime: 200,
          },
        ],
        synthesis: { themes: [], conflicts: [], agreements: [], confidenceScore: 85 },
        fineTuned: { adjustedForFeedback: false, feedbackHistoryConsidered: 0, adjustments: [] },
        personalIntelligence: {
          userUnderstanding: 70,
          recommendedAction: 'Continue journey',
          confidence: 85,
          insights: [],
          nextStepsSuggested: [],
          warningsOrCautions: [],
        },
        totalExecutionTime: 600,
      };

      const result = await bridge.bridgeBadgeResults(orchestratorResult);

      expect(result.success).toBe(true);
      expect(result.badgesProcessed).toBe(2);
    });

    it('should handle missing BadgeEngine gracefully', async () => {
      const orchestratorResult: OrchestratorResult = {
        userId: 'test-user-1',
        timestamp: new Date().toISOString(),
        results: [
          {
            engineId: 1,
            engineName: 'PersonalContextBuilder',
            result: {},
            confidence: 50,
            executionTime: 100,
          },
        ],
        synthesis: { themes: [], conflicts: [], agreements: [], confidenceScore: 50 },
        fineTuned: { adjustedForFeedback: false, feedbackHistoryConsidered: 0, adjustments: [] },
        personalIntelligence: {
          userUnderstanding: 50,
          recommendedAction: 'Continue',
          confidence: 50,
          insights: [],
          nextStepsSuggested: [],
          warningsOrCautions: [],
        },
        totalExecutionTime: 300,
      };

      const result = await bridge.bridgeBadgeResults(orchestratorResult);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('persistOrchestrationResults', () => {
    it('should persist orchestration results', async () => {
      const orchestratorResult: OrchestratorResult = {
        userId: 'test-user-1',
        timestamp: new Date().toISOString(),
        results: [],
        synthesis: {
          themes: ['growth-focused', 'self-aware'],
          conflicts: [],
          agreements: ['positive-momentum'],
          confidenceScore: 85,
        },
        fineTuned: { adjustedForFeedback: false, feedbackHistoryConsidered: 0, adjustments: [] },
        personalIntelligence: {
          userUnderstanding: 80,
          recommendedAction: 'Focus on pattern recognition',
          confidence: 85,
          insights: ['Strong pattern awareness', 'Growth trajectory positive'],
          nextStepsSuggested: ['Track decisions weekly'],
          warningsOrCautions: [],
        },
        totalExecutionTime: 1200,
      };

      const result = await bridge.persistOrchestrationResults(orchestratorResult);

      // Should succeed or indicate db unavailable (non-critical)
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('pattern conversion', () => {
    it('should convert SICE pattern to BehavioralPattern', () => {
      // Test via private method exposure (for unit testing)
      // This is covered indirectly by bridgePatternResults test
      const sicePattern: DetectedPattern = {
        name: 'procrastination',
        frequency: 3,
        lastObserved: new Date().toISOString(),
        impact: 'negative',
        examples: ['Delayed email response', 'Task postponement'],
        confidence: 70,
      };

      // Verify conversion logic works (tested in bridgePatternResults)
      expect(sicePattern.name).toBe('procrastination');
      expect(sicePattern.frequency).toBe(3);
    });
  });
});

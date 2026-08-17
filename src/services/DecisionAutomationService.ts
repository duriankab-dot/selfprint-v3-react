/**
 * DecisionAutomationService.ts
 * Phase E Integration: Utilities for decision follow-ups and reflection
 *
 * NOTE: Core automation moved to FollowUpScheduler in Phase E
 * This file now handles helper functions for reflection prompts and analysis
 */

import type { Decision, FollowUpDays } from '../types/decision';

export interface ReflectionPrompt {
  followUpDay: FollowUpDays;
  prompt: string;
  suggestedQuestions: string[];
}

export interface DecisionOutcomeAnalysis {
  decisionId: string;
  successRate: number;
  consistency: number;
  learnings: string[];
  recommendations: string[];
}

/**
 * Generate reflection prompts for each follow-up day
 * Used by Phase F Dashboard for user feedback collection
 */
export function generateReflectionPrompt(
  decision: Decision,
  followUpDay: FollowUpDays
): ReflectionPrompt {
  const title = decision.title || decision.question;

  const prompts: Record<FollowUpDays, ReflectionPrompt> = {
    30: {
      followUpDay: 30,
      prompt: `You made the decision about "${title}" about 30 days ago. How has it played out so far?`,
      suggestedQuestions: [
        'What changes have you noticed since making this decision?',
        'Are you more or less confident than when you made it?',
        'Any unexpected challenges or surprises?',
        'How is this decision impacting your life?',
      ],
    },
    90: {
      followUpDay: 90,
      prompt: `Three months in: How is your decision about "${title}" shaping up? Time to assess progress.`,
      suggestedQuestions: [
        'What patterns are you seeing?',
        'Is this decision taking you toward or away from your goals?',
        'What have you learned about yourself through this?',
        'Would you make the same decision today?',
      ],
    },
    180: {
      followUpDay: 180,
      prompt: `Six months later: Deep reflection on "${title}". This is where long-term impact becomes clear.`,
      suggestedQuestions: [
        'Looking back, what was the turning point?',
        'How has this decision compounded over time?',
        'What trade-offs have become apparent?',
        'What would you do differently if starting over?',
      ],
    },
    365: {
      followUpDay: 365,
      prompt: `One year reflection: "${title}" - a full year of living with this decision.`,
      suggestedQuestions: [
        'On a scale of 0-100, how well did this decision work out?',
        'What is the biggest lesson from this year?',
        'How has this decision shaped who you are now?',
        'What would you tell your past self about this decision?',
      ],
    },
  };

  return prompts[followUpDay] || prompts[30];
}

/**
 * Placeholder for decision outcome analysis
 * TODO: Implement in Phase F using DecisionLearningService
 */
export function analyzeDecisionOutcome(decision: Decision): DecisionOutcomeAnalysis {
  return {
    decisionId: decision.id,
    successRate: 0,
    consistency: 0,
    learnings: ['Analysis available in Phase F Dashboard'],
    recommendations: ['View Decision Insights for detailed analysis'],
  };
}

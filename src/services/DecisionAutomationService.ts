/**
 * DecisionAutomationService.ts
 * Phase E Integration: Utilities for decision follow-ups and reflection
 *
 * NOTE: Core automation moved to FollowUpScheduler in Phase E
 * This file now handles helper functions for reflection prompts and analysis
 */

import type { Decision, FollowUpDays } from '../types/decision';
import { supabase } from '../lib/supabase/client';
import { getDecisionInsights } from './DecisionLearningService';

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
 * Analyze decision outcome using DecisionLearningService data
 */
export async function analyzeDecisionOutcome(decision: Decision): Promise<DecisionOutcomeAnalysis> {
  try {
    if (!supabase) return getDefaultOutcomeAnalysis(decision.id);

    // Use twinId directly from decision
    const insights = await getDecisionInsights(decision.twinId);

    // Calculate consistency from follow-up completions
    const { data: followUp } = await supabase
      .from('follow_up_schedule')
      .select('day30_completed, day90_completed, day180_completed, day365_completed')
      .eq('decision_id', decision.id)
      .single();

    const completedFollowUps = followUp
      ? [
          followUp.day30_completed,
          followUp.day90_completed,
          followUp.day180_completed,
          followUp.day365_completed,
        ].filter(Boolean).length
      : 0;
    const consistency = Math.round((completedFollowUps / 4) * 100);

    // Build learnings from insights
    const learnings: string[] = [];
    if (insights.totalDecisions > 0) {
      learnings.push(`You have ${insights.totalDecisions} decisions tracked — pattern recognition improves over time`);
    }
    if (insights.successRate > 60) {
      learnings.push(`Your overall success rate is ${Math.round(insights.successRate)}% — above average`);
    }
    if (insights.bestWorlds && insights.bestWorlds.length > 0) {
      learnings.push(`Strongest decision-making in: ${insights.bestWorlds.slice(0, 2).join(', ')}`);
    }
    if (learnings.length === 0) {
      learnings.push('Build decision history for richer analysis');
    }

    const recommendations: string[] = [];
    if (completedFollowUps < 2) recommendations.push('Complete follow-up check-ins to track outcome progress');
    if (insights.successRate < 50) recommendations.push('Review what factors led to less successful decisions');
    if (recommendations.length === 0) recommendations.push('Continue tracking decisions for deeper pattern insights');

    return {
      decisionId: decision.id,
      successRate: insights.successRate || 0,
      consistency,
      learnings,
      recommendations,
    };
  } catch {
    return getDefaultOutcomeAnalysis(decision.id);
  }
}

function getDefaultOutcomeAnalysis(decisionId: string): DecisionOutcomeAnalysis {
  return {
    decisionId,
    successRate: 0,
    consistency: 0,
    learnings: ['Start tracking follow-ups to see outcome analysis'],
    recommendations: ['Complete 30-day follow-up for this decision'],
  };
}

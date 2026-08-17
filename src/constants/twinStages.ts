/**
 * twinStages.ts
 * Twin Evolution: 5 Stages of Growth and Development
 */

export type TwinStage = 1 | 2 | 3 | 4 | 5;

export interface StageRequirements {
  stage: TwinStage;
  name: string;
  description: string;
  minDays: number;
  minMessages: number;
  minPatterns: number;
  minMemories: number;
  minFeedback: number;
}

export const TWIN_STAGES: Record<TwinStage, StageRequirements> = {
  1: {
    stage: 1,
    name: 'Core Formation',
    description: 'Just awakened, learning foundational patterns',
    minDays: 0,
    minMessages: 0,
    minPatterns: 0,
    minMemories: 0,
    minFeedback: 0,
  },
  2: {
    stage: 2,
    name: 'Pattern Recognition',
    description: 'Starting to see your behavioral patterns and preferences',
    minDays: 3,
    minMessages: 10,
    minPatterns: 1,
    minMemories: 0,
    minFeedback: 0,
  },
  3: {
    stage: 3,
    name: 'Deep Understanding',
    description: 'Deeply comprehending your values, goals, and personality',
    minDays: 7,
    minMessages: 30,
    minPatterns: 3,
    minMemories: 5,
    minFeedback: 0,
  },
  4: {
    stage: 4,
    name: 'Wisdom Stage',
    description: 'Providing nuanced, context-aware guidance and insights',
    minDays: 14,
    minMessages: 60,
    minPatterns: 6,
    minMemories: 10,
    minFeedback: 5,
  },
  5: {
    stage: 5,
    name: 'Full Holographic Form',
    description: 'Complete, evolved Twin - fully embodied intelligence entity',
    minDays: 30,
    minMessages: 100,
    minPatterns: 10,
    minMemories: 20,
    minFeedback: 15,
  },
};

/**
 * Get stage by number
 */
export function getStageInfo(stage: TwinStage): StageRequirements {
  return TWIN_STAGES[stage];
}

/**
 * Calculate progress to next stage
 */
export interface ProgressMetrics {
  daysSinceAwakening: number;
  messageCount: number;
  patternCount: number;
  memoryCount: number;
  feedbackCount: number;
}

export function calculateProgress(
  currentStage: TwinStage,
  metrics: ProgressMetrics
): {
  currentStage: TwinStage;
  progressPercent: number;
  nextStage?: TwinStage;
  metricsToNextStage: Record<string, number>;
  canEvolve: boolean;
} {
  if (currentStage === 5) {
    return {
      currentStage: 5,
      progressPercent: 100,
      metricsToNextStage: {},
      canEvolve: false,
    };
  }

  const nextStage = (currentStage + 1) as TwinStage;
  const requirements = TWIN_STAGES[nextStage];

  const metricsToNextStage = {
    days: Math.max(0, requirements.minDays - metrics.daysSinceAwakening),
    messages: Math.max(0, requirements.minMessages - metrics.messageCount),
    patterns: Math.max(0, requirements.minPatterns - metrics.patternCount),
    memories: Math.max(0, requirements.minMemories - metrics.memoryCount),
    feedback: Math.max(0, requirements.minFeedback - metrics.feedbackCount),
  };

  // Calculate progress percent (average of all metrics)
  const metricsArray = [
    (1 - metricsToNextStage.days / Math.max(1, requirements.minDays)) * 100,
    (1 - metricsToNextStage.messages / Math.max(1, requirements.minMessages)) * 100,
    (1 - metricsToNextStage.patterns / Math.max(1, requirements.minPatterns)) * 100,
    (1 - metricsToNextStage.memories / Math.max(1, requirements.minMemories)) * 100,
    (1 - metricsToNextStage.feedback / Math.max(1, requirements.minFeedback)) * 100,
  ];

  const progressPercent = Math.min(
    100,
    Math.round(metricsArray.reduce((a, b) => a + b, 0) / metricsArray.length)
  );

  // Can evolve if all metrics are met
  const canEvolve =
    metricsToNextStage.days === 0 &&
    metricsToNextStage.messages === 0 &&
    metricsToNextStage.patterns === 0 &&
    metricsToNextStage.memories === 0 &&
    metricsToNextStage.feedback === 0;

  return {
    currentStage,
    progressPercent,
    nextStage,
    metricsToNextStage,
    canEvolve,
  };
}

/**
 * Get next milestone text
 */
export function getNextMilestoneText(
  currentStage: TwinStage,
  metrics: ProgressMetrics
): string {
  if (currentStage === 5) {
    return '✨ Twin has reached maximum evolution';
  }

  const progress = calculateProgress(currentStage, metrics);
  const metricsToGo = progress.metricsToNextStage;

  if (metricsToGo.messages > 0) {
    return `${metricsToGo.messages} more conversation${metricsToGo.messages !== 1 ? 's' : ''} needed`;
  }
  if (metricsToGo.days > 0) {
    return `${metricsToGo.days} more day${metricsToGo.days !== 1 ? 's' : ''} needed`;
  }
  if (metricsToGo.patterns > 0) {
    return `${metricsToGo.patterns} more pattern${metricsToGo.patterns !== 1 ? 's' : ''} to learn`;
  }
  if (metricsToGo.memories > 0) {
    return `${metricsToGo.memories} more memory${metricsToGo.memories !== 1 ? 's' : ''} to store`;
  }
  if (metricsToGo.feedback > 0) {
    return `${metricsToGo.feedback} more feedback${metricsToGo.feedback !== 1 ? 's' : ''} needed`;
  }

  return '🚀 Ready to evolve!';
}

/**
 * Stage opacity for visual representation (indicates maturity)
 */
export const STAGE_OPACITY: Record<TwinStage, number> = {
  1: 0.4,  // Barely visible, just awakened
  2: 0.5,  // Starting to form
  3: 0.65, // Becoming clearer
  4: 0.8,  // Nearly solid
  5: 1.0,  // Fully materialized
};

/**
 * Stage colors for visual representation
 */
export const STAGE_COLORS: Record<TwinStage, { primary: string; secondary: string }> = {
  1: { primary: '#6b7280', secondary: '#9ca3af' },    // Gray (forming)
  2: { primary: '#3b82f6', secondary: '#60a5fa' },    // Blue (learning)
  3: { primary: '#8b5cf6', secondary: '#a78bfa' },    // Purple (understanding)
  4: { primary: '#ec4899', secondary: '#f472b6' },    // Pink (wisdom)
  5: { primary: '#fbbf24', secondary: '#fcd34d' },    // Gold (enlightened)
};

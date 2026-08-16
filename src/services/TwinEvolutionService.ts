/**
 * TwinEvolutionService.ts
 * Manages Twin evolution and stage progression
 */

import {
  TwinStage,
  calculateProgress,
  ProgressMetrics,
  getStageInfo,
} from '../constants/twinStages';

export interface EvolutionCheckResult {
  evolved: boolean;
  previousStage?: TwinStage;
  newStage?: TwinStage;
  progress: number;
  message: string;
}

/**
 * Check if Twin should evolve to next stage
 * Called on every user activity
 */
export async function checkMicroEvolution(
  userId: string,
  metrics: ProgressMetrics,
  currentStage: TwinStage
): Promise<EvolutionCheckResult> {
  try {
    if (!userId || !currentStage) {
      return {
        evolved: false,
        progress: 0,
        message: 'Invalid user or stage',
      };
    }

    if (currentStage === 5) {
      return {
        evolved: false,
        progress: 100,
        message: 'Twin has reached maximum evolution',
      };
    }

    const progressData = calculateProgress(currentStage, metrics);

    if (progressData.canEvolve) {
      const nextStage = (currentStage + 1) as TwinStage;
      return {
        evolved: true,
        previousStage: currentStage,
        newStage: nextStage,
        progress: progressData.progressPercent,
        message: `Twin evolved to ${getStageInfo(nextStage).name}!`,
      };
    }

    return {
      evolved: false,
      progress: progressData.progressPercent,
      message: `Progress: ${progressData.progressPercent}% to next stage`,
    };
  } catch (error) {
    console.error('Error checking evolution:', error);
    return {
      evolved: false,
      progress: 0,
      message: 'Evolution check failed',
    };
  }
}

/**
 * Evolve Twin to next stage
 * Called after checkMicroEvolution confirms readiness
 */
export async function evolveTwin(
  userId: string,
  newStage: TwinStage
): Promise<{ success: boolean; message: string }> {
  try {
    if (!userId || !newStage) {
      return { success: false, message: 'Invalid user or stage' };
    }

    // TODO: Update Supabase twin_profiles
    // - Set stage = newStage
    // - Set evolved_at = now
    // - Create evolution memory
    // - Notify user

    return {
      success: true,
      message: `Twin evolved to stage ${newStage}`,
    };
  } catch (error) {
    console.error('Error evolving Twin:', error);
    return {
      success: false,
      message: 'Evolution failed',
    };
  }
}

/**
 * Get current evolution status
 */
export async function getEvolutionStatus(userId: string): Promise<{
  success: boolean;
  currentStage?: TwinStage;
  metrics?: ProgressMetrics;
  progress?: number;
}> {
  try {
    if (!userId) {
      return { success: false };
    }

    // TODO: Query Supabase
    // - Get twin_profiles.stage
    // - Get metrics for this Twin
    // - Calculate progress

    return {
      success: true,
      currentStage: 1,
      metrics: {
        daysSinceAwakening: 0,
        messageCount: 0,
        patternCount: 0,
        memoryCount: 0,
        feedbackCount: 0,
      },
      progress: 0,
    };
  } catch (error) {
    console.error('Error getting evolution status:', error);
    return { success: false };
  }
}

/**
 * Get stage requirements for display
 */
export function getStageRequirements(stage: TwinStage) {
  return getStageInfo(stage);
}

/**
 * Notify when Twin evolves
 */
export async function notifyEvolution(
  userId: string,
  newStage: TwinStage,
  twinName: string
): Promise<void> {
  try {
    // TODO: Send browser notification
    // TODO: Send in-app notification
    // TODO: Add to notification center
    // TODO: Log analytics event
  } catch (error) {
    console.error('Error notifying evolution:', error);
  }
}

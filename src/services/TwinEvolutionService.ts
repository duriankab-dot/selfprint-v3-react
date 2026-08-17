/**
 * TwinEvolutionService.ts
 * Manages Twin evolution: 5-stage progression system
 *
 * Stages:
 * 1. Core Formation - just awakened
 * 2. Pattern Recognition - learning behavior (3 days, 10 msgs, 1 pattern)
 * 3. Deep Understanding - comprehending values (7 days, 30 msgs, 3 patterns, 5 memories)
 * 4. Wisdom Stage - nuanced guidance (14 days, 60 msgs, 6 patterns, 10 memories, 5 feedback)
 * 5. Full Holographic Form - complete intelligence (30 days, 100 msgs, 10 patterns, 20 memories, 15 feedback)
 */

import { supabase } from '../lib/supabase/client';
import type {
  TwinStage,
  ProgressMetrics,
} from '../constants/twinStages';
import {
  calculateProgress,
  getStageInfo,
} from '../constants/twinStages';

export interface EvolutionCheckResult {
  evolved: boolean;
  previousStage?: TwinStage;
  newStage?: TwinStage;
  progress: number;
  nextStageInfo?: Record<string, any>;
  message: string;
}

export interface EvolutionHistory {
  twinId: string;
  previousStage: TwinStage;
  newStage: TwinStage;
  evolvedAt: string;
  metrics: ProgressMetrics;
}

/**
 * Check if Twin should evolve to next stage
 * Called on every user activity (message sent, decision made, feedback given)
 */
export async function checkMicroEvolution(
  userId: string,
  twinId: string,
  metrics: ProgressMetrics,
  currentStage: TwinStage
): Promise<EvolutionCheckResult> {
  try {
    if (!userId || !twinId || !currentStage) {
      return {
        evolved: false,
        progress: 0,
        message: 'Invalid user or stage',
      };
    }

    // Already at max stage
    if (currentStage === 5) {
      return {
        evolved: false,
        progress: 100,
        message: 'Twin has reached complete form',
      };
    }

    const progressData = calculateProgress(currentStage, metrics);

    // Ready to evolve
    if (progressData.canEvolve) {
      const nextStage = (currentStage + 1) as TwinStage;
      const nextStageInfo = getStageInfo(nextStage);

      return {
        evolved: true,
        previousStage: currentStage,
        newStage: nextStage,
        progress: progressData.progressPercent,
        nextStageInfo: {
          name: nextStageInfo.name,
          description: nextStageInfo.description,
        },
        message: `🌟 ${nextStageInfo.name}! Your Twin has evolved!`,
      };
    }

    // Not ready yet
    return {
      evolved: false,
      progress: progressData.progressPercent,
      nextStageInfo: progressData.metricsToNextStage,
      message: `Progress: ${progressData.progressPercent}% to ${getStageInfo((currentStage + 1) as TwinStage).name}`,
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
 * Execute Twin evolution to next stage
 * Called after checkMicroEvolution confirms readiness
 */
export async function evolveTwin(
  userId: string,
  twinId: string,
  previousStage: TwinStage,
  newStage: TwinStage,
  metrics: ProgressMetrics
): Promise<{ success: boolean; message: string; evolution?: EvolutionHistory }> {
  try {
    if (!userId || !twinId || !newStage) {
      return { success: false, message: 'Invalid parameters' };
    }

    const now = new Date().toISOString();

    // 1. Update Twin stage in database
    const { error: updateError } = await supabase
      .from('twins')
      .update({
        stage: newStage,
        updated_at: now,
      })
      .eq('id', twinId)
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // 2. Create evolution history record
    const { error: historyError } = await supabase
      .from('twin_evolution_history')
      .insert({
        twin_id: twinId,
        user_id: userId,
        previous_stage: previousStage,
        new_stage: newStage,
        evolved_at: now,
        metrics_snapshot: metrics,
      })
      .select()
      .single();

    if (historyError) throw historyError;

    // 3. Create evolution memory (for Twin context)
    const stageInfo = getStageInfo(newStage);
    await supabase
      .from('twin_memory')
      .insert({
        twin_id: twinId,
        user_id: userId,
        memory_type: 'evolution',
        content: `I evolved to ${stageInfo.name}: ${stageInfo.description}`,
        metadata: {
          from_stage: previousStage,
          to_stage: newStage,
          metrics: metrics,
        },
        created_at: now,
      });

    return {
      success: true,
      message: `Twin evolved to Stage ${newStage}: ${stageInfo.name}`,
      evolution: {
        twinId,
        previousStage,
        newStage,
        evolvedAt: now,
        metrics,
      },
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
 * Get current evolution status and progress
 */
export async function getEvolutionStatus(
  userId: string,
  twinId: string
): Promise<{
  success: boolean;
  currentStage?: TwinStage;
  stageInfo?: ReturnType<typeof getStageInfo>;
  metrics?: ProgressMetrics;
  progress?: number;
  metricsToNextStage?: Record<string, number>;
}> {
  try {
    if (!userId || !twinId) {
      return { success: false };
    }

    // Fetch Twin current stage
    const { data: twin, error: twinError } = await supabase
      .from('twins')
      .select('stage, created_at')
      .eq('id', twinId)
      .eq('user_id', userId)
      .single();

    if (twinError || !twin) {
      return { success: false };
    }

    const currentStage = twin.stage as TwinStage;
    const stageInfo = getStageInfo(currentStage);

    // Calculate metrics from database
    const createdAt = new Date(twin.created_at);
    const daysSinceAwakening = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Query message count
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('twin_id', twinId);

    // Query pattern count
    const { count: patternCount } = await supabase
      .from('detected_patterns')
      .select('*', { count: 'exact', head: true })
      .eq('twin_id', twinId);

    // Query memory count
    const { count: memoryCount } = await supabase
      .from('twin_memory')
      .select('*', { count: 'exact', head: true })
      .eq('twin_id', twinId);

    // Query feedback count
    const { count: feedbackCount } = await supabase
      .from('user_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('twin_id', twinId);

    const metrics: ProgressMetrics = {
      daysSinceAwakening,
      messageCount: messageCount || 0,
      patternCount: patternCount || 0,
      memoryCount: memoryCount || 0,
      feedbackCount: feedbackCount || 0,
    };

    const progressData = calculateProgress(currentStage, metrics);

    return {
      success: true,
      currentStage,
      stageInfo,
      metrics,
      progress: progressData.progressPercent,
      metricsToNextStage: progressData.metricsToNextStage,
    };
  } catch (error) {
    console.error('Error getting evolution status:', error);
    return { success: false };
  }
}

/**
 * Get stage requirements (for UI display)
 */
export function getStageRequirements(stage: TwinStage) {
  return getStageInfo(stage);
}

/**
 * Get all stage definitions (for progress UI)
 */
export function getAllStages() {
  return [1, 2, 3, 4, 5].map(s => ({
    stage: s as TwinStage,
    info: getStageInfo(s as TwinStage),
  }));
}

/**
 * Notify when Twin evolves
 * Sends in-app notification + browser notification + analytics
 */
export async function notifyEvolution(
  userId: string,
  twinId: string,
  newStage: TwinStage,
  twinName: string
): Promise<void> {
  try {
    const stageInfo = getStageInfo(newStage);

    // Create in-app notification
    await supabase.from('notifications').insert({
      user_id: userId,
      title: `${twinName} has evolved!`,
      message: `Your Twin reached ${stageInfo.name}: ${stageInfo.description}`,
      type: 'evolution',
      related_twin_id: twinId,
      read: false,
      created_at: new Date().toISOString(),
    });

    // Log evolution event for analytics
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: 'twin_evolution',
      event_data: {
        twin_id: twinId,
        twin_name: twinName,
        new_stage: newStage,
        stage_name: stageInfo.name,
      },
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error notifying evolution:', error);
    // Silently fail - evolution already succeeded
  }
}

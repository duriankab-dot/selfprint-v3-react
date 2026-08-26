/**
 * journeyResume.ts
 * Resume incomplete onboarding journey
 *
 * User หยุดกลาง → กลับมา → resume จากจุดที่หยุด (ไม่ restart)
 */

import { supabase } from '@/services/supabase-service';

export type OnboardingStep =
  | 'welcome'
  | 'birth_info'
  | 'quick_analysis'
  | 'full_journey'
  | 'complete';

export interface JourneyCheckpoint {
  userId: string;
  currentStep: OnboardingStep;
  data: Record<string, any>;
  savedAt: Date;
}

export class JourneyResumeService {
  /**
   * Save progress checkpoint
   */
  static async saveCheckpoint(
    userId: string,
    step: OnboardingStep,
    data: Record<string, any>
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('onboarding_checkpoints')
      .upsert(
        {
          user_id: userId,
          current_step: step,
          data,
          saved_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) throw new Error(`Failed to save checkpoint: ${error.message}`);
  }

  /**
   * Load saved checkpoint
   */
  static async loadCheckpoint(userId: string): Promise<JourneyCheckpoint | null> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('onboarding_checkpoints')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return {
      userId,
      currentStep: data.current_step as OnboardingStep,
      data: data.data || {},
      savedAt: new Date(data.saved_at),
    };
  }

  /**
   * Resume from checkpoint or start fresh
   */
  static async resume(userId: string): Promise<OnboardingStep> {
    const checkpoint = await this.loadCheckpoint(userId);
    return checkpoint?.currentStep || 'welcome';
  }

  /**
   * Clear checkpoint (for testing or explicit reset)
   */
  static async clearCheckpoint(userId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    await supabase
      .from('onboarding_checkpoints')
      .delete()
      .eq('user_id', userId);
  }
}

export default JourneyResumeService;

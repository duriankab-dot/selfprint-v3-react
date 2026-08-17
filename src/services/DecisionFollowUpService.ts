/**
 * DecisionFollowUpService.ts
 * Schedule + track decision follow-ups (30/90/180/365 days)
 */

import { supabase } from './supabase-service';

export interface FollowUp {
  id: string;
  decisionId: string;
  type: '30-day' | '90-day' | '180-day' | '365-day';
  scheduledAt: Date;
  completedAt?: Date;
  outcome?: 'worked' | 'didnt-work' | 'modified';
  notes?: string;
}

const FOLLOW_UP_DAYS = {
  '30-day': 30,
  '90-day': 90,
  '180-day': 180,
  '365-day': 365,
};

/**
 * Schedule follow-ups for a decision
 */
export async function scheduleDecisionFollowUps(
  decisionId: string
): Promise<boolean> {
  try {
    if (!decisionId || !supabase) return false;

    const now = new Date();
    const followUps = (Object.entries(FOLLOW_UP_DAYS) as any[]).map(
      ([type, days]) => ({
        decision_id: decisionId,
        follow_up_type: type,
        scheduled_at: new Date(now.getTime() + days * 24 * 60 * 60 * 1000),
      })
    );

    const { error } = await supabase
      .from('decision_follow_ups')
      .insert(followUps);

    if (error) throw error;

    return true;
  } catch (err) {
    console.error('Failed to schedule follow-ups:', err);
    return false;
  }
}

/**
 * Get pending follow-ups for user
 */
export async function getPendingFollowUps(
  twinId: string
): Promise<FollowUp[]> {
  try {
    if (!twinId || !supabase) return [];

    const { data, error } = await supabase
      .from('decision_follow_ups')
      .select(`
        id,
        decision_id,
        follow_up_type,
        scheduled_at,
        completed_at,
        outcome,
        notes
      `)
      .eq('twin_id', twinId)
      .is('completed_at', null)
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      decisionId: row.decision_id,
      type: row.follow_up_type,
      scheduledAt: new Date(row.scheduled_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      outcome: row.outcome,
      notes: row.notes,
    }));
  } catch (err) {
    console.error('Failed to fetch follow-ups:', err);
    return [];
  }
}

/**
 * Complete a follow-up with outcome
 */
export async function completeFollowUp(
  followUpId: string,
  outcome: 'worked' | 'didnt-work' | 'modified',
  notes?: string
): Promise<boolean> {
  try {
    if (!followUpId || !supabase) return false;

    const { error } = await supabase
      .from('decision_follow_ups')
      .update({
        completed_at: new Date().toISOString(),
        outcome,
        notes,
      })
      .eq('id', followUpId);

    if (error) throw error;

    return true;
  } catch (err) {
    console.error('Failed to complete follow-up:', err);
    return false;
  }
}

/**
 * Calculate decision accuracy
 */
export async function getDecisionAccuracy(twinId: string): Promise<{
  total: number;
  worked: number;
  percentage: number;
}> {
  try {
    if (!twinId || !supabase) return { total: 0, worked: 0, percentage: 0 };

    const { data, error } = await supabase
      .from('decision_follow_ups')
      .select('outcome')
      .eq('twin_id', twinId)
      .not('completed_at', 'is', null);

    if (error) throw error;

    const total = data?.length || 0;
    const worked = (data || []).filter(row => row.outcome === 'worked').length;

    return {
      total,
      worked,
      percentage: total > 0 ? Math.round((worked / total) * 100) : 0,
    };
  } catch (err) {
    console.error('Failed to calculate accuracy:', err);
    return { total: 0, worked: 0, percentage: 0 };
  }
}

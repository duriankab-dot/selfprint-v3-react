/**
 * decision.ts
 * Data model for Decisions and Follow-up tracking
 * USP: Track decisions at 30/90/180/365 days
 */

import type { WorldId } from '../constants/worlds';

export type DecisionCategory =
  | 'career'
  | 'relationships'
  | 'health'
  | 'finance'
  | 'personal'
  | 'learning'
  | 'other';

export type FollowUpDays = 30 | 90 | 180 | 365;

export interface FollowUp {
  id: string;
  decisionId: string;
  days: FollowUpDays;
  scheduledDate: string; // ISO date
  completed: boolean;
  completedAt?: string;
  reflection?: string; // User's reflection on how decision played out
  resultScore?: number; // 0-100: how well did it turn out?
  notificationSent: boolean;
  sentAt?: string;
}

export interface Decision {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: DecisionCategory;
  decisionDate: string; // ISO date when decision was made
  confidence: number; // 0-100: how confident were they?
  expectedOutcome: string;
  actualOutcome?: string;
  followUps: FollowUp[];
  world?: WorldId; // World context for this decision (e.g., 'career', 'love')
  createdAt: string;
  updatedAt: string;

  // Computed/derived
  status?: 'open' | 'completed' | 'pending-followup';
  nextFollowUpDue?: FollowUpDays;
  successRate?: number; // Calculated from resultScores
}

export interface DecisionStats {
  total: number;
  completed: number;
  pending: number;
  pendingFollowUps: number;
  averageConfidence: number;
  successRate: number; // % of decisions with positive outcomes
  averageOutcome: number; // 0-100
}

export interface DecisionFilters {
  category?: DecisionCategory;
  status?: 'open' | 'completed' | 'pending-followup';
  world?: WorldId; // Filter by world context
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}

/**
 * Helper: Get follow-up due date
 */
export function getFollowUpDueDate(
  decisionDate: string,
  followUpDays: FollowUpDays
): string {
  const date = new Date(decisionDate);
  date.setDate(date.getDate() + followUpDays);
  return date.toISOString().split('T')[0];
}

/**
 * Helper: Calculate decision success rate
 */
export function calculateSuccessRate(decisions: Decision[]): number {
  if (decisions.length === 0) return 0;

  const completedDecisions = decisions.filter((d) =>
    d.followUps?.some((f) => f.completed && f.resultScore !== undefined)
  );

  if (completedDecisions.length === 0) return 0;

  const totalScore = completedDecisions.reduce((sum, d) => {
    const scores = d.followUps
      ?.filter((f) => f.completed && f.resultScore !== undefined)
      .map((f) => f.resultScore || 0) || [];

    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return sum + avg;
  }, 0);

  return Math.round(totalScore / completedDecisions.length);
}

/**
 * Helper: Get pending follow-ups for user
 */
export function getPendingFollowUps(decisions: Decision[]): FollowUp[] {
  const today = new Date().toISOString().split('T')[0];

  return decisions
    .flatMap((d) => d.followUps || [])
    .filter((f) => !f.completed && f.scheduledDate <= today)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
}

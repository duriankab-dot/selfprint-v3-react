/**
 * decision.ts
 * TypeScript types for Phase E Decision Intelligence
 */

import type { WorldId } from '../constants/worlds';

/**
 * Core Decision type - Phase E
 * Represents a decision made by Twin and user's choice
 */
export interface Decision {
  id: string;
  twinId: string;
  world: WorldId;
  question: string;
  options: string[];
  twinRecommendation: string;
  userChoice: string;
  chosenAt: string; // ISO timestamp
  context?: string;
  createdAt: string;
  updatedAt: string;
  // Compatibility fields for existing pages (populated on-demand)
  title?: string;
  description?: string;
  category?: string;
  confidence?: number;
  decisionDate?: string;
  followUps?: FollowUp[];
}

export interface DecisionOutcome {
  id: string;
  decisionId: string;
  followUpDay: number; // 30, 90, 180, 365
  feedback: string;
  impact: 'positive' | 'neutral' | 'negative';
  lessons: string;
  twinConfidence: number; // 0-100
  recordedAt: string;
}

export interface FollowUpSchedule {
  id: string;
  decisionId: string;
  day30Due?: string;
  day90Due?: string;
  day180Due?: string;
  day365Due?: string;
  day30Completed: boolean;
  day90Completed: boolean;
  day180Completed: boolean;
  day365Completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DecisionPattern {
  id: string;
  twinId: string;
  world: WorldId;
  pattern: string;
  successRate: number; // 0-100
  sampleSize: number;
  confidence: number; // 0-100
  identifiedAt: string;
  updatedAt: string;
}

export interface DecisionInsights {
  totalDecisions: number;
  successRate: number;
  bestWorlds: WorldId[];
  improvementAreas: string[];
  trends: string;
}

/**
 * Statistics for decision dashboard
 */
export interface DecisionStats {
  total: number;
  completed: number;
  pendingFollowUps: number;
}

/**
 * Follow-up item
 */
export interface FollowUp {
  decisionId: string;
  dayOffset: number;
  dueDate: string;
  completed: boolean;
  scheduledDate?: string;
}

/**
 * Follow-up days type
 */
export type FollowUpDays = 30 | 90 | 180 | 365;

/**
 * Decision filters
 */
export interface DecisionFilters {
  world?: WorldId;
  status?: 'pending' | 'completed' | 'all';
}

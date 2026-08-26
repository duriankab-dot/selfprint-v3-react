/**
 * decisionStore.ts
 * Zustand store for decision state management
 */

import { create } from 'zustand';
import type { Decision, DecisionFilters } from '../types/decision';
import { getUserDecisions } from '../services/DecisionService';
import { getDecisionInsights } from '../services/DecisionLearningService';
import { supabase } from '../lib/supabase/client';

interface DecisionStore {
  // State
  decisions: Decision[];
  selectedCategory: string | null;
  filters: DecisionFilters;
  isLoading: boolean;
  pendingFollowUpsCount: number;
  overallSuccessRate: number;

  // Actions
  loadDecisions: (userId: string) => Promise<void>;
  addDecision: (decision: Decision) => void;
  updateDecision: (id: string, updates: Partial<Decision>) => void;
  removeDecision: (id: string) => void;
  setFilters: (filters: DecisionFilters) => void;
  setSelectedCategory: (category: string | null) => void;

  // Getters
  getPendingCount: () => number;
  getFilteredDecisions: () => Decision[];
  getSuccessRate: () => number;
}

export const useDecisionStore = create<DecisionStore>((set, get) => ({
  // Initial state
  decisions: [],
  selectedCategory: null,
  filters: {},
  isLoading: false,
  pendingFollowUpsCount: 0,
  overallSuccessRate: 0,

  // Load decisions from Supabase
  loadDecisions: async (userId: string) => {
    set({ isLoading: true });
    try {
      // userId is same as twinId in Phase E
      const decisions = await getUserDecisions(userId);

      // Fetch success rate from DecisionLearningService
      let overallSuccessRate = 0;
      try {
        const insights = await getDecisionInsights(userId);
        overallSuccessRate = insights.successRate || 0;
      } catch {
        // Non-critical
      }

      // Count pending follow-ups from follow_up_schedule table
      let pendingFollowUpsCount = 0;
      try {
        const decisionIds = decisions.map((d) => d.id);
        if (decisionIds.length > 0) {
          const { data: schedules } = await supabase
            .from('follow_up_schedule')
            .select('day30_completed, day90_completed, day180_completed, day365_completed, day30_due, day90_due')
            .in('decision_id', decisionIds);

          if (schedules) {
            const now = new Date();
            pendingFollowUpsCount = schedules.filter((s) => {
              // Pending = due date has passed but not completed
              const day30Due = s.day30_due ? new Date(s.day30_due) : null;
              const day90Due = s.day90_due ? new Date(s.day90_due) : null;
              return (
                (day30Due && day30Due <= now && !s.day30_completed) ||
                (day90Due && day90Due <= now && !s.day90_completed) ||
                (!s.day30_completed && !s.day90_completed && !s.day180_completed && !s.day365_completed)
              );
            }).length;
          }
        }
      } catch {
        // Non-critical
      }

      set({ decisions, isLoading: false, overallSuccessRate, pendingFollowUpsCount });
    } catch (_error) {
      // Error handled silently - logged upstream by service
      set({ decisions: [], isLoading: false });
    }
  },

  // Add decision optimistically
  addDecision: (decision: Decision) => {
    set((state) => ({
      decisions: [decision, ...state.decisions],
    }));
  },

  // Update decision optimistically
  updateDecision: (id: string, updates: Partial<Decision>) => {
    set((state) => ({
      decisions: state.decisions.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      ),
    }));
  },

  // Remove decision
  removeDecision: (id: string) => {
    set((state) => ({
      decisions: state.decisions.filter((d) => d.id !== id),
    }));
  },

  // Set filters
  setFilters: (filters: DecisionFilters) => {
    set({ filters });
  },

  // Set selected category
  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
  },

  // Get pending follow-up count — populated during loadDecisions from follow_up_schedule
  getPendingCount: () => {
    return get().pendingFollowUpsCount;
  },

  // Get filtered decisions
  getFilteredDecisions: () => {
    const { decisions, filters, selectedCategory } = get();

    return decisions.filter((d) => {
      // Category filter (Phase E compatibility)
      if (selectedCategory && d.category !== selectedCategory) {
        return false;
      }

      // Status filter based on follow-up completion count
      if (filters?.status && filters.status !== 'all') {
        const hasFollowUps = d.followUps && d.followUps.length > 0;
        const allComplete = hasFollowUps && d.followUps!.every((f) => f.completed);
        if (filters.status === 'completed' && !allComplete) return false;
        if (filters.status === 'pending' && allComplete) return false;
      }

      // World filter
      if (filters?.world && d.world !== filters.world) {
        return false;
      }

      return true;
    });
  },

  // Get success rate — populated during loadDecisions from DecisionLearningService
  getSuccessRate: () => {
    return get().overallSuccessRate;
  },
}));

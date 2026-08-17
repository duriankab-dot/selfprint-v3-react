/**
 * decisionStore.ts
 * Zustand store for decision state management
 */

import { create } from 'zustand';
import type { Decision, DecisionFilters } from '../types/decision';
import { getUserDecisions } from '../services/DecisionService';

interface DecisionStore {
  // State
  decisions: Decision[];
  selectedCategory: string | null;
  filters: DecisionFilters;
  isLoading: boolean;

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

  // Load decisions from Supabase
  loadDecisions: async (userId: string) => {
    set({ isLoading: true });
    try {
      // userId is same as twinId in Phase E
      const decisions = await getUserDecisions(userId);
      set({ decisions, isLoading: false });
    } catch (error) {
      console.error('Error loading decisions:', error);
      set({ isLoading: false });
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

  // Get pending follow-up count (TODO: Integrate with FollowUpScheduler in Phase F)
  getPendingCount: () => {
    // Placeholder: Phase E follow-ups managed separately in FollowUpScheduler
    // Will be integrated in Phase F Task F2
    return 0;
  },

  // Get filtered decisions
  getFilteredDecisions: () => {
    const { decisions, filters, selectedCategory } = get();

    return decisions.filter((d) => {
      // Category filter (Phase E compatibility)
      if (selectedCategory && d.category !== selectedCategory) {
        return false;
      }

      // Status filter: Phase E has status managed in FollowUpScheduler
      // TODO: Integrate in Phase F
      if (filters?.status && filters.status !== 'all') {
        // Skip status filtering for now
      }

      // World filter
      if (filters?.world && d.world !== filters.world) {
        return false;
      }

      return true;
    });
  },

  // Get success rate (TODO: Calculate from DecisionLearningService in Phase F)
  getSuccessRate: () => {
    // Phase E success rates calculated by DecisionLearningService
    // Will be integrated in Phase F Task F2
    return 0;
  },
}));

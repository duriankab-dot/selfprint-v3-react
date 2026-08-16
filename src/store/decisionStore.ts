/**
 * decisionStore.ts
 * Zustand store for decision state management
 */

import { create } from 'zustand';
import { Decision, DecisionFilters } from '../types/decision';
import {
  getDecisions,
  getPendingFollowUpsForUser,
  getDecisionStats,
} from '../services/DecisionService';

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
      const decisions = await getDecisions(userId);
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

  // Get pending follow-up count
  getPendingCount: () => {
    const decisions = get().decisions;
    return decisions.reduce((count, d) => {
      const pending = d.followUps?.filter((f) => !f.completed) || [];
      return count + pending.length;
    }, 0);
  },

  // Get filtered decisions
  getFilteredDecisions: () => {
    const { decisions, filters, selectedCategory } = get();

    return decisions.filter((d) => {
      // Category filter
      if (selectedCategory && d.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (filters.status) {
        if (filters.status === 'completed') {
          return d.followUps?.every((f) => f.completed);
        } else if (filters.status === 'open') {
          return !d.followUps?.every((f) => f.completed);
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const decDate = new Date(d.decisionDate);
        const fromDate = new Date(filters.dateRange.from);
        const toDate = new Date(filters.dateRange.to);
        if (decDate < fromDate || decDate > toDate) {
          return false;
        }
      }

      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return (
          d.title.toLowerCase().includes(search) ||
          d.description.toLowerCase().includes(search)
        );
      }

      return true;
    });
  },

  // Get success rate
  getSuccessRate: () => {
    const decisions = get().decisions;
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
  },
}));

/**
 * analysisStore.ts
 * Holds current Full Analysis data for passing to CoreAwakening
 * Used by AnalysisPage → CoreAwakening flow
 */

import { create } from 'zustand';
import type { FullAnalysisOutput } from '@/lib/intelligence/InsightEngine';

export interface AnalysisStoreState {
  // State
  currentAnalysis: FullAnalysisOutput | null;
  isReadyForAwakening: boolean;

  // Actions
  setAnalysis: (analysis: FullAnalysisOutput) => void;
  setCurrentAnalysis: (analysis: FullAnalysisOutput | null) => void;
  clearAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisStoreState>((set) => ({
  currentAnalysis: null,
  isReadyForAwakening: false,

  setAnalysis: (analysis: FullAnalysisOutput) =>
    set({
      currentAnalysis: analysis,
      isReadyForAwakening: analysis.sourceCount > 0,
    }),

  setCurrentAnalysis: (analysis: FullAnalysisOutput | null) =>
    set({
      currentAnalysis: analysis,
      isReadyForAwakening: analysis ? analysis.sourceCount > 0 : false,
    }),

  clearAnalysis: () =>
    set({
      currentAnalysis: null,
      isReadyForAwakening: false,
    }),
}));

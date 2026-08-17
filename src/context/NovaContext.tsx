/**
 * NovaContext.tsx
 * Self Print Universal Guide - Nova (distinct from Twin)
 *
 * ARCHITECTURE PRINCIPLE:
 * Nova = Guide (onboarding → discovery → analysis → handoff to Twin)
 * Twin = Personal (persistent → growth → expert)
 *
 * Nova lifecycle: Acts 1-2 only, recedes after Core Awakening
 */

import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type NovaPhase = 'landing' | 'onboarding' | 'data-collection' | 'insight-1' | 'finetuning' | 'analysis' | 'core-awakening' | 'complete';

export interface NovaState {
  phase: NovaPhase;
  userDataCollected: {
    emotion?: string;
    basicInfo?: Record<string, unknown>;
    birthDate?: string;
  };
  insightsGenerated: string[];
  analysisComplete: boolean;
}

interface NovaContextType {
  state: NovaState;
  setPhase: (phase: NovaPhase) => void;
  setUserData: (data: NovaState['userDataCollected']) => void;
  addInsight: (insight: string) => void;
  completeAnalysis: () => void;
  resetNova: () => void;
}

const NovaContext = createContext<NovaContextType | undefined>(undefined);

export function NovaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NovaState>({
    phase: 'landing',
    userDataCollected: {},
    insightsGenerated: [],
    analysisComplete: false,
  });

  const setPhase = useCallback((phase: NovaPhase) => {
    setState((prev) => ({ ...prev, phase }));
  }, []);

  const setUserData = useCallback((data: NovaState['userDataCollected']) => {
    setState((prev) => ({
      ...prev,
      userDataCollected: { ...prev.userDataCollected, ...data },
    }));
  }, []);

  const addInsight = useCallback((insight: string) => {
    setState((prev) => ({
      ...prev,
      insightsGenerated: [...prev.insightsGenerated, insight],
    }));
  }, []);

  const completeAnalysis = useCallback(() => {
    setState((prev) => ({ ...prev, analysisComplete: true }));
  }, []);

  const resetNova = useCallback(() => {
    setState({
      phase: 'landing',
      userDataCollected: {},
      insightsGenerated: [],
      analysisComplete: false,
    });
  }, []);

  const value: NovaContextType = {
    state,
    setPhase,
    setUserData,
    addInsight,
    completeAnalysis,
    resetNova,
  };

  return <NovaContext.Provider value={value}>{children}</NovaContext.Provider>;
}

export function useNova() {
  const context = React.useContext(NovaContext);
  if (!context) {
    throw new Error('useNova must be used within NovaProvider');
  }
  return context;
}

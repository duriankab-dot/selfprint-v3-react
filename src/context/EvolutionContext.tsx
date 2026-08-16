import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * § 30: Twin Evolution Scene
 *
 * Tracks unlocked experiences/scenes:
 * - Twin Awakening (voice, personality)
 * - Pattern Visualization
 * - Twin Evolution Scene (at 30 reflections)
 */

export type UnlockType = 'twin-awakening' | 'pattern-visualization' | 'twin-evolution';

export interface UnlockState {
  twinAwakening: boolean;
  patternVisualization: boolean;
  twinEvolution: boolean;
  reflectionCount: number;
  lastEvolutionTriggeredAt?: string; // ISO timestamp
}

interface EvolutionContextType {
  state: UnlockState;

  // Increment reflection count (triggered after each reflection)
  recordReflection: () => void;

  // Manually unlock an experience
  unlock: (type: UnlockType) => void;

  // Reset all (dev/testing)
  resetUnlocks: () => void;

  // Get unlock state
  isUnlocked: (type: UnlockType) => boolean;
}

const EvolutionContext = createContext<EvolutionContextType | undefined>(undefined);

export const EvolutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UnlockState>(() => {
    // Load from localStorage
    const stored = localStorage.getItem('selfprint-evolution-state');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        // Failed to load evolution state from storage, use default
      }
    }

    return {
      twinAwakening: false,
      patternVisualization: false,
      twinEvolution: false,
      reflectionCount: 0,
    };
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('selfprint-evolution-state', JSON.stringify(state));
  }, [state]);

  const recordReflection = () => {
    setState(prev => {
      const newCount = prev.reflectionCount + 1;
      const newState = { ...prev, reflectionCount: newCount };

      // Auto-unlock milestones
      if (newCount === 1) {
        newState.twinAwakening = true;
      }
      if (newCount === 10) {
        newState.patternVisualization = true;
      }
      if (newCount === 30) {
        newState.twinEvolution = true;
        newState.lastEvolutionTriggeredAt = new Date().toISOString();
      }

      return newState;
    });
  };

  const unlock = (type: UnlockType) => {
    setState(prev => {
      const newState = { ...prev };

      switch (type) {
        case 'twin-awakening':
          newState.twinAwakening = true;
          break;
        case 'pattern-visualization':
          newState.patternVisualization = true;
          break;
        case 'twin-evolution':
          newState.twinEvolution = true;
          newState.lastEvolutionTriggeredAt = new Date().toISOString();
          break;
      }

      return newState;
    });
  };

  const resetUnlocks = () => {
    setState({
      twinAwakening: false,
      patternVisualization: false,
      twinEvolution: false,
      reflectionCount: 0,
    });
  };

  const isUnlocked = (type: UnlockType) => {
    switch (type) {
      case 'twin-awakening':
        return state.twinAwakening;
      case 'pattern-visualization':
        return state.patternVisualization;
      case 'twin-evolution':
        return state.twinEvolution;
    }
  };

  return (
    <EvolutionContext.Provider
      value={{
        state,
        recordReflection,
        unlock,
        resetUnlocks,
        isUnlocked,
      }}
    >
      {children}
    </EvolutionContext.Provider>
  );
};

export const useEvolution = () => {
  const context = useContext(EvolutionContext);
  if (!context) {
    throw new Error('useEvolution must be used within EvolutionProvider');
  }
  return context;
};

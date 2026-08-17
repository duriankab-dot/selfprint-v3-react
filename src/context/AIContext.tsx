/**
 * AIContext.tsx
 * Manages which AI the user is interacting with: Nova (Guide) vs Twin (Personal Intelligence)
 *
 * Nova = Universal Self Print Guide (Act I: Discovery phase)
 * Twin = Personal AI Intelligence Entity (Act III: Living phase)
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type ActiveAI = 'nova' | 'twin';

export interface AIContextType {
  // State
  activeAI: ActiveAI;
  isTwinAwakened: boolean;
  twinName?: string;

  // Actions
  switchToNova: () => void;
  switchToTwin: () => void;
  setTwinAwakened: (awakened: boolean, twinName?: string) => void;

  // Helpers
  isNovaActive: boolean;
  isTwinActive: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

/**
 * AIProvider wraps the app with AI context
 * Tracks which AI is currently active and Twin awakening status
 */
export function AIProvider({ children }: AIProviderProps) {
  const auth = useAuth();
  const [activeAI, setActiveAI] = useState<ActiveAI>('nova');
  const [isTwinAwakened, setIsTwinAwakened] = useState(false);
  const [twinName, setTwinName] = useState<string>();

  /**
   * On auth state change, check if Twin is awakened
   * If awakened, default to Twin. Otherwise start with Nova.
   */
  useEffect(() => {
    if (auth?.session?.user?.id) {
      // TODO: Fetch Twin status from Supabase
      // For now, default to Nova for new users
      setActiveAI('nova');
      setIsTwinAwakened(false);
    }
  }, [auth?.session?.user?.id]);

  const switchToNova = () => {
    setActiveAI('nova');
  };

  const switchToTwin = () => {
    if (!isTwinAwakened) {
      console.warn('Twin is not awakened yet. Use switchToNova or complete Core Awakening.');
      return;
    }
    setActiveAI('twin');
  };

  const handleSetTwinAwakened = (awakened: boolean, name?: string) => {
    setIsTwinAwakened(awakened);
    if (awakened && name) {
      setTwinName(name);
      setActiveAI('twin');
    } else if (!awakened) {
      setTwinName(undefined);
      setActiveAI('nova');
    }
  };

  const value: AIContextType = {
    activeAI,
    isTwinAwakened,
    twinName,
    switchToNova,
    switchToTwin,
    setTwinAwakened: handleSetTwinAwakened,
    isNovaActive: activeAI === 'nova',
    isTwinActive: activeAI === 'twin',
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

/**
 * Hook to use AIContext
 * Must be called within AIProvider
 */
export function useAIContext(): AIContextType {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within AIProvider');
  }
  return context;
}

export { AIContext };

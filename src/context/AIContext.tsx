/**
 * AIContext.tsx
 * Manages which AI the user is interacting with: Nova (Guide) vs Twin (Personal Intelligence)
 *
 * Nova = Universal Self Print Guide (Act I: Discovery phase)
 * Twin = Personal AI Intelligence Entity (Act III: Living phase)
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase-service';

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
    const userId = auth?.session?.user?.id;
    if (!userId) return;

    (async () => {
      try {
        // Fetch Twin status from Supabase
        // TWINS406-001: .single() throws PGRST116 ("0 rows") for any user
        // who hasn't created a Twin yet — the normal case pre-Core-Awakening
        // — producing a noisy 406 in the console on every load even though
        // the catch block below already handles it gracefully. maybeSingle()
        // returns `data: null` instead, with no error, for the same case.
        const { data: twin } = await supabase
          .from('twins')
          .select('id, name, awakened_at')
          .eq('user_id', userId)
          .maybeSingle();

        if (twin?.awakened_at) {
          // Twin is fully awakened — switch to Twin mode
          setIsTwinAwakened(true);
          if (twin.name) setTwinName(twin.name);
          setActiveAI('twin');
        } else {
          // No twin or not yet awakened — stay with Nova
          setActiveAI('nova');
          setIsTwinAwakened(false);
        }
      } catch {
        // Network error or no twin found — default to Nova
        setActiveAI('nova');
        setIsTwinAwakened(false);
      }
    })();
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

  // CTXMEMO-001 FIX (4 ก.ย. 2026): provider นี้อยู่ในสแตกที่ซ้อนกัน 13 ชั้นใน
  // App.tsx — object literal ตัวใหม่ทุก render บังคับให้ consumer ทุกตัวของ
  // context นี้ re-render แม้ค่าข้างในจะเหมือนเดิมทุกประการ
  const value = useMemo<AIContextType>(() => ({
    activeAI,
    isTwinAwakened,
    twinName,
    switchToNova,
    switchToTwin,
    setTwinAwakened: handleSetTwinAwakened,
    isNovaActive: activeAI === 'nova',
    isTwinActive: activeAI === 'twin',
  }), [activeAI, isTwinAwakened, twinName, switchToNova, switchToTwin, handleSetTwinAwakened]);

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

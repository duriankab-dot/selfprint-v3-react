/**
 * Twin Context
 * จัดการข้อมูล Nova Twin: archetype, maturity score, personality
 * + world-aware recommendations (P0 #7)
 */

import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { WorldId } from '../constants/worlds';
import type { Decision } from '../types/decision';
import { createDecision } from '../services/DecisionService';

// 18 Archetypes (12 base + 6 hybrid)
export const ARCHETYPES = [
  // Base 12
  'innocent',
  'explorer',
  'sage',
  'everyman',
  'lover',
  'jester',
  'hero',
  'outlaw',
  'magician',
  'caregiver',
  'creator',
  'ruler',
  // Hybrid 6
  'alchemist',
  'dreamer',
  'maverick',
  'strategist',
  'diplomat',
  'artisan',
] as const;

export type Archetype = typeof ARCHETYPES[number];

export interface TwinProfile {
  id: string;
  userId: string;
  name?: string;
  primaryArchetype?: Archetype;
  secondaryArchetype?: Archetype;
  maturityScore: number; // 0-100
  createdAt: number;
  updatedAt: number;
  birthData?: {
    date: string;
    time?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
}

interface TwinContextType {
  twin: TwinProfile | null;
  loading: boolean;
  error: string | null;
  currentWorld: WorldId | null;
  createTwin: (profile: Omit<TwinProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTwin: (updates: Partial<TwinProfile>) => void;
  setMaturityScore: (score: number) => void;
  setCurrentWorld: (world: WorldId | null) => void;
  recommendWorld: (messageContent: string) => WorldId | null;
  saveDecision: (
    userId: string,
    decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt' | 'followUps'>
  ) => Promise<{ success: boolean; decision?: Decision; message: string }>;
  resetTwin: () => void;
}

const TwinContext = createContext<TwinContextType | undefined>(undefined);

export function TwinProvider({ children }: { children: ReactNode }) {
  const [twin, setTwin] = useState<TwinProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWorld, setCurrentWorld] = useState<WorldId | null>(null);

  const createTwin = useCallback(
    (profile: Omit<TwinProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setLoading(true);
        const newTwin: TwinProfile = {
          ...profile,
          id: `twin-${profile.userId}-${Date.now()}`,
          maturityScore: profile.maturityScore || 30,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setTwin(newTwin);
        localStorage.setItem('selfprint_twin', JSON.stringify(newTwin));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create twin');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateTwin = useCallback((updates: Partial<TwinProfile>) => {
    setTwin(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        ...updates,
        updatedAt: Date.now(),
      };
      localStorage.setItem('selfprint_twin', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setMaturityScore = useCallback((score: number) => {
    const clamped = Math.max(0, Math.min(100, score));
    updateTwin({ maturityScore: clamped });
  }, [updateTwin]);

  const recommendWorld = useCallback((messageContent: string): WorldId | null => {
    // Simple keyword-based world recommendation
    const content = messageContent.toLowerCase();
    const worldKeywords: Record<WorldId, string[]> = {
      self: ['identity', 'self', 'who am i', 'authentic', 'values', 'beliefs'],
      mind: ['thoughts', 'emotions', 'mental', 'clarity', 'focus', 'anxiety', 'stress'],
      relationship: ['relationship', 'friend', 'family', 'communication', 'connection', 'bond', 'people'],
      love: ['love', 'romance', 'intimate', 'partner', 'heart', 'dating', 'attraction'],
      career: ['career', 'work', 'job', 'professional', 'business', 'leadership', 'purpose'],
      wealth: ['money', 'finance', 'wealth', 'budget', 'investment', 'abundance'],
      life: ['life', 'meaning', 'direction', 'path', 'journey', 'balance'],
      growth: ['growth', 'learn', 'develop', 'improve', 'potential', 'skill'],
      decision: ['decision', 'choice', 'choose', 'dilemma', 'uncertain', 'option'],
      purpose: ['purpose', 'meaning', 'mission', 'calling', 'why', 'legacy'],
      wellbeing: ['health', 'wellness', 'wellbeing', 'exercise', 'nutrition', 'sleep', 'body'],
      future: ['future', 'tomorrow', 'ahead', 'next', 'vision', 'goals', 'dream'],
    };

    let bestMatch: WorldId | null = null;
    let maxMatches = 0;

    for (const [world, keywords] of Object.entries(worldKeywords) as Array<[WorldId, string[]]>) {
      const matches = keywords.filter(kw => content.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = world;
      }
    }

    return bestMatch;
  }, []);

  const saveDecision = useCallback(
    async (
      userId: string,
      decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt' | 'followUps'>
    ) => {
      // Automatically tag with currentWorld if not already set
      const decisionWithWorld = {
        ...decision,
        world: decision.world || currentWorld || undefined,
      };

      return createDecision(userId, decisionWithWorld);
    },
    [currentWorld]
  );

  const resetTwin = useCallback(() => {
    setTwin(null);
    localStorage.removeItem('selfprint_twin');
    setError(null);
  }, []);

  // Load twin from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('selfprint_twin');
      if (stored) {
        const parsed = JSON.parse(stored) as TwinProfile;
        setTwin(parsed);
      }
    } catch (err) {
      // Failed to load twin from storage
    }
  }, []);

  const value: TwinContextType = {
    twin,
    loading,
    error,
    currentWorld,
    createTwin,
    updateTwin,
    setMaturityScore,
    setCurrentWorld,
    recommendWorld,
    saveDecision,
    resetTwin,
  };

  return (
    <TwinContext.Provider value={value}>
      {children}
    </TwinContext.Provider>
  );
}

export function useTwin() {
  const context = React.useContext(TwinContext);
  if (!context) {
    throw new Error('useTwin must be used within TwinProvider');
  }
  return context;
}

/**
 * TwinContext.tsx
 * Manages AI Twin state: archetype, maturity, world context
 * + world-aware recommendations (P0 #7)
 *
 * CRITICAL: Twin ≠ Nova
 * - Nova: Universal guide (temporary, Acts 1-2)
 * - Twin: Personal expert (persistent, Acts 2-3+)
 */

import React, { createContext, useState, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import type { WorldId } from '../constants/worlds';
import type { Decision } from '../types/decision';
import type { FullAnalysisOutput } from '../lib/intelligence/InsightEngine';
import { createDecision } from '../services/DecisionService';
import { AuthContext } from './AuthContext';
import { calculateMaturityScore } from '../services/DynamicValueCalculator';
import {
  fetchUserTwin,
  createTwinInDatabase,
  updateTwinInDatabase,
  deleteTwinFromDatabase,
  TwinNotFoundError,
  TwinPermissionError,
  TwinNetworkError,
  TwinServiceError,
} from '../services/TwinSupabaseService';
import type { Twin } from '../services/TwinSupabaseService';

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
  // Hybrid 6 (pair-detected: base1 + base2 → hybrid)
  'strategic_warrior',   // hero + sage
  'benevolent_leader',   // caregiver + ruler
  'visionary_artist',    // creator + magician
  'wandering_rebel',     // explorer + outlaw
  'warm_flirt',          // lover + jester
  'relatable_neighbor',  // everyman + innocent
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
  /** TWINKNOWLEDGE-001: the complete WOW #2 Full Analysis, persisted onto
   *  the Twin at birth so it survives reloads/new sessions instead of only
   *  living in analysisStore's volatile in-memory state. Null for twins
   *  created before this fix, or if analysis wasn't available at birth. */
  fullAnalysis?: FullAnalysisOutput | null;
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
  /**
   * P0-C DUP-001 fix: set Twin state from a record that was ALREADY persisted
   * elsewhere (e.g. CoreAwakeningService.initializeTwin()) — does NOT insert.
   * createTwin() always INSERTs; calling it after the Twin already exists in
   * DB violates the twins.user_id UNIQUE constraint and fails silently
   * (caught internally, never thrown), leaving `twin` stuck at null.
   */
  hydrateTwin: (userId: string, savedTwin: Twin) => void;
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

export const TwinContext = createContext<TwinContextType | undefined>(undefined);

export function TwinProvider({ children }: { children: ReactNode }) {
  const [twin, setTwin] = useState<TwinProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWorld, setCurrentWorld] = useState<WorldId | null>(null);

  // NOTE (P0-C): as of this fix, no production code calls createTwin() —
  // CoreAwakening.tsx now uses hydrateTwin() (see above) because the Twin
  // is already persisted by CoreAwakeningService.initializeTwin() by the
  // time the UI needs to update context state. Left in place as public
  // Context API (not an internal-only helper) rather than deleted, in case
  // a future flow legitimately needs to create-and-persist a Twin from a
  // bare profile in one call. Flagging rather than silently leaving unnoted.
  const createTwin = useCallback(
    async (profile: Omit<TwinProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        // GUARD: Validate profile.userId
        if (!profile.userId || typeof profile.userId !== 'string') {
          throw new Error('Twin creation requires valid userId');
        }

        setLoading(true);

        // Save to Supabase
        const savedTwin = await createTwinInDatabase(profile.userId, profile);

        if (!savedTwin) {
          throw new Error('Failed to create Twin in database');
        }

        // Map Supabase snake_case to TypeScript camelCase
        // Phase A.1: Dynamic maturityScore calculation instead of hardcoded 30
        const newTwin: TwinProfile = {
          id: savedTwin.id,
          userId: profile.userId,
          name: savedTwin.name,
          primaryArchetype: (savedTwin as any).primary_archetype as any,
          secondaryArchetype: (savedTwin as any).secondary_archetype as any,
          maturityScore: calculateMaturityScore({
            userUnderstanding: (savedTwin as any).maturity_score,
          }),
          createdAt: new Date((savedTwin as any).awakened_at).getTime(),
          updatedAt: Date.now(),
          fullAnalysis: (savedTwin as any).full_analysis ?? null,
        };

        setTwin(newTwin);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create twin';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const hydrateTwin = useCallback((userId: string, savedTwin: Twin) => {
    // NOTE: savedTwin is the raw Supabase row (snake_case columns) even
    // though its TS type claims TwinProfile shape — same runtime mismatch
    // createTwin() already works around below via `as any`. userId comes
    // from the caller (not savedTwin.userId) for the same reason.
    const newTwin: TwinProfile = {
      id: savedTwin.id,
      userId,
      name: savedTwin.name,
      primaryArchetype: (savedTwin as any).primary_archetype,
      secondaryArchetype: (savedTwin as any).secondary_archetype,
      maturityScore: Math.max(0, Math.min(100, (savedTwin as any).maturity_score || 30)),
      createdAt: new Date((savedTwin as any).awakened_at).getTime(),
      updatedAt: Date.now(),
      fullAnalysis: (savedTwin as any).full_analysis ?? null,
    };
    setTwin(newTwin);
    setError(null);
  }, []);

  const updateTwin = useCallback((updates: Partial<TwinProfile>) => {
    setTwin(prev => {
      // GUARD: Ensure Twin exists before updating
      if (!prev) {
        console.warn('Attempted to update Twin when Twin is null');
        return null;
      }

      const updated: TwinProfile = {
        ...prev,
        ...updates,
        updatedAt: Date.now(),
      };

      // Persist to Supabase (async, don't block state update)
      updateTwinInDatabase(prev.id, updated).catch(err => {
        console.error('Failed to update Twin in database:', err);
      });

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
        twinId: userId,
        world: decision.world || currentWorld || undefined,
      };

      const result = await createDecision(decisionWithWorld);
      return {
        success: !!result,
        decision: result || undefined,
        message: result ? 'Decision saved' : 'Failed to save decision',
      };
    },
    [currentWorld]
  );

  const resetTwin = useCallback(async () => {
    try {
      if (twin?.id && twin?.userId) {
        await deleteTwinFromDatabase(twin.id, twin.userId);
      }
      setTwin(null);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reset Twin';
      setError(errorMsg);
    }
  }, [twin?.id, twin?.userId]);

  // Load Twin from Supabase when auth session is ready
  // RULE: userId must come from auth session, never from localStorage (CLAUDE.md)
  const authCtx = useContext(AuthContext);
  const authUserId = authCtx?.session?.user?.id ?? null;

  React.useEffect(() => {
    if (!authUserId) return; // not authenticated — nothing to load

    const loadTwin = async () => {
      // TWINCONTEXT-LOAD-001: `loading` was declared on this context but
      // never actually set during this effect — every consumer had no way
      // to tell "still checking Supabase" apart from "confirmed no Twin
      // exists", so TwinChat's `if (!twin)` guard could show "hasn't
      // awakened yet" for a real, existing Twin during the brief window
      // right after login while this fetch is still in flight.
      setLoading(true);
      try {
        // FIX 2: fetchUserTwin now throws specific errors
        const fetchedTwin = await fetchUserTwin(authUserId);

        // TWINCONTEXT-LOAD-002: this used to spread the raw Supabase row
        // (`...fetchedTwin`) straight into state. The row is snake_case
        // (primary_archetype, secondary_archetype, maturity_score,
        // user_id) but TwinProfile is camelCase — every other place that
        // builds a TwinProfile from a raw row (createTwin, hydrateTwin
        // above) does this mapping explicitly; this path was the one
        // exception. Net effect: once a Twin *did* load successfully,
        // twin.primaryArchetype / twin.maturityScore / twin.userId were
        // all silently undefined (twin itself was non-null, so guards
        // checking `!twin` didn't catch it) — archetype-driven visuals
        // and maturity-based features had no idea a Twin existed.
        setTwin({
          id: fetchedTwin.id,
          userId: authUserId,
          name: fetchedTwin.name,
          primaryArchetype: (fetchedTwin as any).primary_archetype,
          secondaryArchetype: (fetchedTwin as any).secondary_archetype,
          maturityScore: Math.max(0, Math.min(100, (fetchedTwin as any).maturity_score ?? 30)),
          createdAt: new Date(fetchedTwin.awakened_at).getTime(),
          updatedAt: Date.now(),
          fullAnalysis: (fetchedTwin as any).full_analysis ?? null,
        });
        setError(null);
      } catch (err) {
        // FIX 2: Handle specific error types from fetchUserTwin()
        if (err instanceof TwinNotFoundError) {
          // No Twin exists yet — user hasn't completed Twin Birth
          // This is a valid state, not an error
          console.info('No Twin found for user — ready for Twin Birth', err.message);
          setTwin(null);
          setError(null);
        } else if (err instanceof TwinPermissionError) {
          // RLS permission denied (401, 403)
          // User is not allowed to access this Twin (shouldn't happen for own Twin)
          console.error('Twin permission denied:', err.message);
          setError(`Permission denied: ${err.message}`);
          setTwin(null);
        } else if (err instanceof TwinNetworkError) {
          // Network error — might be temporary, will retry on next auth state change
          console.warn('Twin network error — will retry:', err.message);
          setError('Network error loading Twin — will retry automatically');
          setTwin(null);
        } else if (err instanceof TwinServiceError) {
          // Other service errors
          console.error('Twin service error:', err.message);
          setError(err.message);
          setTwin(null);
        } else {
          // Unexpected error type
          const errorMsg = err instanceof Error ? err.message : 'Unknown error loading Twin';
          console.error('Unexpected error loading Twin:', err);
          setError(errorMsg);
          setTwin(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTwin();
  }, [authUserId]); // re-run when auth state changes (login/logout)

  const value: TwinContextType = {
    twin,
    loading,
    error,
    currentWorld,
    createTwin,
    hydrateTwin,
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

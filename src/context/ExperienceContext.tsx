/**
 * ExperienceContext.tsx
 *
 * Master Direction §16 — Adaptive Experience Intelligence
 *
 * Reactive React layer on top of ExperienceEngine.
 *
 * Reads:
 *   - PersonalContext from React Query shared cache (key: ['personalContext', userId])
 *   - currentHub from HubContext
 *   - currentMood from EmotionContext
 *   - TwinState computed on-the-fly from TwinStateEngine
 *   - hubHistoryLength from HubContext (to detect first session)
 *
 * On each change it:
 *   1. Runs ExperienceEngine.compute()
 *   2. Applies themeResolution.cssVars (--exp-*) to documentElement
 *   3. If shouldAutoApplyHub → calls switchHub() with suggestedHub
 *      (§20: only on first session, never override user choice)
 *   4. If AI-resolved activeMood differs from user's current mood AND
 *      confidence is high → calls updateMood() (soft signal, §18)
 *
 * §19 Rule: User Preference > AI Personalization
 *   - shouldAutoApplyHub is only true when hubHistoryLength === 0
 *   - updateMood is only called if user has never checked in (hasCheckedIn === false)
 */

import {
  createContext,
  useContext,
  useMemo,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from './AuthContext';
import { useHub } from './HubContext';
import { useEmotion } from './EmotionContext';
import { PersonalContextBuilder } from '../lib/intelligence/PersonalContextBuilder';
import { TwinStateEngine } from '../lib/intelligence/TwinStateEngine';
import { ExperienceEngine } from '../lib/experience/ExperienceEngine';
import type { ExperienceConfig } from '../lib/experience/ExperienceEngine';

// ============================================================================
// Context type
// ============================================================================

interface ExperienceContextType {
  config: ExperienceConfig | null;
  isAdaptive: boolean;
}

const ExperienceContext = createContext<ExperienceContextType>({
  config: null,
  isAdaptive: false,
});

// ============================================================================
// Provider
// ============================================================================

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';

  const { currentHub, hubHistory, switchHub } = useHub();
  const { mood: currentMood, updateMood, hasCheckedIn } = useEmotion();

  // Stable engine instances
  const contextBuilder = useMemo(() => new PersonalContextBuilder(), []);
  const twinEngine = useMemo(() => new TwinStateEngine(), []);
  const expEngine = useMemo(() => new ExperienceEngine(), []);

  // Shared cache — same key as IntelligencePanel / LivingTwin / ExecutiveSummary
  const { data: personalContext } = useQuery({
    queryKey: ['personalContext', userId],
    queryFn: () => contextBuilder.getContext(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  // Compute Twin state (needed for dashboard priority)
  const twinState = useMemo(
    () => twinEngine.computeState(personalContext ?? null).state,
    [twinEngine, personalContext]
  );

  // Compute Experience Config
  const config = useMemo<ExperienceConfig | null>(() => {
    if (!userId) return null;

    return expEngine.compute({
      personalContext: personalContext ?? null,
      currentHub,
      currentMood,
      hubHistoryLength: hubHistory.length,
      twinState,
    });
  }, [expEngine, personalContext, currentHub, currentMood, hubHistory.length, twinState, userId]);

  // Apply --exp-* CSS vars to <html> whenever config changes
  useEffect(() => {
    if (!config) return;

    const root = document.documentElement;
    for (const [key, value] of Object.entries(config.themeResolution.cssVars)) {
      root.style.setProperty(key, value);
    }
  }, [config]);

  // Auto-apply hub on first session (§20 — Adaptive Hub, respecting §19)
  useEffect(() => {
    if (config?.shouldAutoApplyHub) {
      switchHub(config.suggestedHub);
    }
  }, [config?.shouldAutoApplyHub, config?.suggestedHub, switchHub]);

  // Soft mood suggestion (§18 — Emotion Engine)
  // Only update if user has NEVER checked in manually (pure first-session personalisation)
  useEffect(() => {
    if (!config || hasCheckedIn) return;
    if (config.activeMood !== currentMood) {
      updateMood(config.activeMood);
    }
  }, [config, currentMood, hasCheckedIn, updateMood]);

  const value: ExperienceContextType = {
    config,
    isAdaptive: config?.isAdaptive ?? false,
  };

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useExperience(): ExperienceContextType {
  return useContext(ExperienceContext);
}

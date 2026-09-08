/**
 * useStoryNarrative.ts
 *
 * Track C Story Narrative Layer — §51 STORYTELLING ARCHITECTURE
 *
 * Central React hook for all 3 Narrative Layers:
 *   - Layer 1: BIG STORY (journey summary, evolution history)
 *   - Layer 2: CURRENT CHAPTER (dominant patterns, recent memories)
 *   - Layer 3: MICRO STORY (today's single most important beat)
 *
 * Plus Story Mode state (REVEAL/EXPLORE/CHOICE/CONSEQUENCE/EVOLUTION).
 *
 * Uses real data only — NO FAKE STORY guardrail enforced.
 * If no data exists → returns null/default empty state.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWorld } from '@/context/WorldContext';
import type { WorldId } from '@/constants/worlds';
import type {
  BigStoryData,
  CurrentChapterData,
  MicroStoryData,
  StoryModeState,
} from '@/lib/story/storyNarrative.types';
import {
  buildMicroStory,
  buildCurrentChapter,
  buildBigStory,
  buildStoryModeState,
} from '@/lib/story/StoryNarrativeService';

export interface StoryNarrativeState {
  /** Layer 3: Today's micro story */
  microStory: MicroStoryData | null;
  /** Layer 2: Current chapter theme */
  currentChapter: CurrentChapterData | null;
  /** Layer 1: Big journey story */
  bigStory: BigStoryData | null;
  /** Story modes availability */
  storyModes: StoryModeState;
  /** Loading states */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
}

const initialState: StoryNarrativeState = {
  microStory: null,
  currentChapter: null,
  bigStory: null,
  storyModes: { activeMode: null, availableModes: [], modeContext: {} },
  isLoading: false,
  error: null,
};

export function useStoryNarrative() {
  const [state, setState] = useState<StoryNarrativeState>(initialState);
  const { session, loading: authLoading } = useAuth();
  const { currentWorld } = useWorld();

  const userId = session?.user?.id || '';

  const loadAll = useCallback(async () => {
    if (!userId || authLoading) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Load all layers in parallel
      const [microStory, currentChapter, bigStory, modeResult] = await Promise.all([
        buildMicroStory(userId).catch(() => null),
        buildCurrentChapter(userId, currentWorld as WorldId | undefined).catch(() => null),
        buildBigStory(userId).catch(() => null),
        buildStoryModeState(userId, currentWorld as WorldId | undefined).catch(
          () => ({ availableModes: [], modeContext: {} }),
        ),
      ]);

      setState({
        microStory,
        currentChapter,
        bigStory,
        storyModes: {
          activeMode: null as any,
          availableModes: modeResult.availableModes,
          modeContext: modeResult.modeContext,
        },
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Failed to load story narrative'),
      }));
    }
  }, [userId, authLoading, currentWorld]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const setActiveMode = useCallback((mode: string | null) => {
    setState((prev) => ({
      ...prev,
      storyModes: {
        ...prev.storyModes,
        activeMode: mode as any,
      },
    }));
  }, []);

  return {
    ...state,
    refresh: loadAll,
    setActiveMode,
  };
}

export default useStoryNarrative;

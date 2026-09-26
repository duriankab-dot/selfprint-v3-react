/**
 * useTwinBirth.ts — TC-401/402: Hook for Twin Birth state management
 *
 * Manages:
 * - Current birth phase (intro → birth-animation → naming → celebration → complete)
 * - Reload recovery (reads localStorage on mount)
 * - Existing twin check (skips flow if twin already exists)
 * - Birth state persistence across navigations
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { BirthState, BirthPhase } from '@/lib/twinBirth/twinBirthFlow';
import {
  loadSavedBirthState,
  saveBirthState,
  clearBirthState,
  checkExistingTwin,
} from '@/lib/twinBirth/twinBirthFlow';

export function useTwinBirth() {
  const { session } = useAuth();
  const [birthState, setBirthState] = useState<BirthState>({
    phase: 'idle',
    userId: null,
    twinName: null,
    essenceId: null,
    firstInsight: null,
    birthDate: null,
    twinId: null,
    error: null,
    completedAt: null,
  });

  const [recoveryMode, setRecoveryMode] = useState(false);

  // On mount: check for saved state and existing twin
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    // Check localStorage for saved birth state
    const saved = loadSavedBirthState();
    if (saved && saved.userId === userId && saved.phase !== 'complete') {
      setBirthState(saved as BirthState);
      setRecoveryMode(true);
      return;
    }

    // Check if twin already exists (skip birth flow)
    checkExistingTwin(userId).then(({ exists, twinId: _twinId }) => {
      if (exists) {
        // Twin exists — no need to show birth flow
        clearBirthState();
      }
    });
  }, [session?.user?.id]);

  /**
   * Transition to a new birth phase.
   * Persists state for reload recovery.
   */
  const setPhase = useCallback((phase: BirthPhase) => {
    setBirthState(prev => ({ ...prev, phase, error: null }));
    saveBirthState(birthState);
  }, [birthState]);

  /**
   * Set twin name during naming phase.
   */
  const setTwinName = useCallback((name: string) => {
    setBirthState(prev => ({ ...prev, twinName: name }));
    saveBirthState(birthState);
  }, [birthState]);

  /**
   * Record first insight from awakening.
   */
  const setFirstInsight = useCallback((insight: string | null) => {
    setBirthState(prev => ({ ...prev, firstInsight: insight }));
    saveBirthState(birthState);
  }, [birthState]);

  /**
   * Record twin ID after successful creation.
   */
  const setTwinCreated = useCallback((twinId: string) => {
    setBirthState(prev => ({ ...prev, twinId, phase: 'celebration' }));
    saveBirthState(birthState);
  }, [birthState]);

  /**
   * Mark birth as complete and clear saved state.
   */
  const completeBirth = useCallback(() => {
    setBirthState(prev => ({
      ...prev,
      phase: 'complete',
      completedAt: new Date().toISOString(),
    }));
    clearBirthState();
  }, []);

  /**
   * Reset birth state (for retry after error).
   */
  const resetBirth = useCallback(() => {
    setBirthState({
      phase: 'intro',
      userId: session?.user?.id ?? null,
      twinName: null,
      essenceId: null,
      firstInsight: null,
      birthDate: null,
      twinId: null,
      error: null,
      completedAt: null,
    });
    clearBirthState();
  }, [session?.user?.id]);

  return {
    birthState,
    recoveryMode,
    setPhase,
    setTwinName,
    setFirstInsight,
    setTwinCreated,
    completeBirth,
    resetBirth,
    isCompleted: birthState.phase === 'complete',
    isError: birthState.phase === 'error',
  };
}

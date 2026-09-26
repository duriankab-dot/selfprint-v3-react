/**
 * twinBirthFlow.ts — TC-401/402: Twin Birth Flow orchestration
 *
 * Manages the lifecycle state transitions for Twin Birth:
 *   ONBOARDING → AWAKENING → TWIN_ALIVE → WORLD_ACTIVE
 *
 * Integrates with CoreAwakeningService (startAwakening + initializeTwin)
 * and lifecycleStore (transitionTo + setTwinCreated).
 *
 * Persistence layer:
 *   - Writes birth state to localStorage for reload recovery
 *   - Checks on app mount whether user needs to resume birth flow
 *   - Restores twin from Supabase if already created
 */

import { supabase } from '@/lib/supabase/client';
import type { WorldId } from '@/constants/worlds';
import { startAwakening, initializeTwin, celebrateTwinAwakening } from '@/services/CoreAwakeningService';
import { useLifecycleStore } from '@/store/lifecycleStore';
import { useUserStore } from '@/store/userStore';
import { useAnalysisStore } from '@/store/analysisStore';
import { useTwin } from '@/context/TwinContext';
import { useAIContext } from '@/context/AIContext';
import { generateTwinDNA, refineTwinDNA, type BirthInput } from '@/lib/twinVisualDNA';
import { saveTwinDNA, loadTwinDNA } from '@/lib/twinVisualDNA';
import { calculateArchetypes } from '@/lib/ArchetypeScoreEngine';
import { calculateInitialDisciplines } from '@/lib/astrology';

export type BirthPhase = 'idle' | 'intro' | 'birth-animation' | 'naming' | 'celebration' | 'complete' | 'error';

export interface BirthState {
  phase: BirthPhase;
  userId: string | null;
  twinName: string | null;
  essenceId: string | null;
  firstInsight: string | null;
  birthDate: string | null;
  twinId: string | null;
  error: string | null;
  completedAt: string | null;
}

const BIRTH_STATE_KEY = 'sp_twin_birth_state';

/**
 * Save birth state to localStorage for reload recovery.
 * Survives tab closure and page refresh.
 */
export function saveBirthState(state: Omit<BirthState, 'completedAt'>): void {
  try {
    const serialized = JSON.stringify({ ...state, completedAt: null });
    window.localStorage.setItem(BIRTH_STATE_KEY, serialized);
  } catch {
    // localStorage full or blocked — non-fatal
  }
}

/**
 * Load saved birth state from localStorage.
 * Returns null if no state found or corrupted.
 */
export function loadSavedBirthState(): BirthState | null {
  try {
    const raw = window.localStorage.getItem(BIRTH_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BirthState;
  } catch {
    return null;
  }
}

/**
 * Clear birth state after successful completion.
 */
export function clearBirthState(): void {
  try {
    window.localStorage.removeItem(BIRTH_STATE_KEY);
  } catch {
    // non-fatal
  }
}

/**
 * Check whether a twin already exists for this user.
 * Used by reload recovery to skip birth flow entirely.
 */
export async function checkExistingTwin(userId: string): Promise<{ exists: boolean; twinId: string | null }> {
  if (!supabase) return { exists: false, twinId: null };
  
  try {
    const { data, error } = await supabase
      .from('twins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) return { exists: false, twinId: null };
    
    return { exists: !!data?.id, twinId: data?.id ?? null };
  } catch {
    return { exists: false, twinId: null };
  }
}

/**
 * Execute the full Twin Birth flow:
 * 1. Start SICE awakening (background)
 * 2. Generate initial DNA
 * 3. Initialize twin on naming
 * 4. Celebrate and transition lifecycle
 */
export async function executeBirthFlow(
  userId: string,
  twinName: string,
  birthInput: BirthInput,
  currentAnalysis?: ReturnType<typeof useAnalysisStore.getState>['currentAnalysis'],
): Promise<{ success: boolean; twinId?: string; message?: string }> {
  if (!supabase) {
    return { success: false, message: 'Supabase not available' };
  }

  try {
    // Step 1: Start awakening in background (non-blocking)
    let essenceId: string | undefined;
    startAwakening(userId)
      .then((result) => {
        if (result.success && result.essenceId) {
          essenceId = result.essenceId;
        }
      })
      .catch((err) => console.error('Background awakening failed:', err));

    // Step 2: Generate initial DNA
    const dna = generateTwinDNA(birthInput, userId);
    await saveTwinDNA(dna);

    // Step 3: Initialize twin
    const result = await initializeTwin(userId, twinName, essenceId, birthInput.dob, currentAnalysis);

    if (!result.success || !result.twin || !result.twinId) {
      return { success: false, message: result.message || 'Failed to create Twin' };
    }

    // Step 4: Set lifecycle to TWIN_ALIVE
    const lifecycle = useLifecycleStore.getState();
    await lifecycle.setTwinCreated(userId, result.twinId);

    // Step 5: Celebrate
    celebrateTwinAwakening();

    // Step 6: Save birth state as complete
    saveBirthState({
      phase: 'complete',
      userId,
      twinName,
      essenceId: essenceId ?? null,
      firstInsight: result.firstInsight ?? null,
      birthDate: birthInput.dob,
      twinId: result.twinId,
      error: null,
      completedAt: new Date().toISOString(),
    });

    return { success: true, twinId: result.twinId };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown birth error';
    saveBirthState({
      phase: 'error',
      userId,
      twinName,
      essenceId: null,
      firstInsight: null,
      birthDate: birthInput.dob,
      twinId: null,
      error: errorMsg,
      completedAt: null,
    });
    return { success: false, message: errorMsg };
  }
}

/**
 * Generate archetypes from birth date for use in birth animation colors.
 */
export function getBirthArchetypes(birthDate: string): { primary: string; secondary: string } {
  const disciplines = calculateInitialDisciplines(birthDate);
  return calculateArchetypes({
    birthDate,
    lifePathNumber: disciplines.lifePathNumber,
    westernZodiac: disciplines.westernZodiac,
    chineseZodiac: disciplines.chineseZodiac,
    baziYearElement: disciplines.baziYearElement,
    natalDominantElement: disciplines.natalDominantElement,
    moonSign: disciplines.moonSign,
    moonFullDegree: disciplines.moonFullDegree,
    sunFullDegree: disciplines.sunFullDegree,
    mercurySign: disciplines.mercurySign,
    venusSign: disciplines.venusSign,
    marsSign: disciplines.marsSign,
    jupiterSign: disciplines.jupiterSign,
    saturnSign: disciplines.saturnSign,
    hexagramNumber: disciplines.hexagramNumber,
  });
}

/**
 * Transition lifecycle through the birth phases.
 * Guards against downgrade (never overwrite TWIN_ALIVE or WORLD_ACTIVE).
 */
export async function transitionThroughBirth(
  userId: string,
  target: 'AWAKENING' | 'TWIN_ALIVE' | 'WORLD_ACTIVE',
): Promise<boolean> {
  const lifecycle = useLifecycleStore.getState();
  
  // Guard: don't downgrade
  if (target === 'AWAKENING' && (lifecycle.status === 'TWIN_ALIVE' || lifecycle.status === 'WORLD_ACTIVE')) {
    return false;
  }
  if (target === 'TWIN_ALIVE' && lifecycle.status === 'WORLD_ACTIVE') {
    return false;
  }

  const maxAttempts = 3;
  for (let i = 0; i < maxAttempts; i++) {
    await lifecycle.transitionTo(userId, target);
    if (!lifecycle.error) return true;
    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  
  console.error(`Failed to transition to ${target}:`, lifecycle.error);
  return false;
}

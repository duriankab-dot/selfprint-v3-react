/**
 * lifecycleStore.ts
 * Manages user lifecycle state through Selfprint journey:
 * ONBOARDING → ANALYSIS → AWAKENING → TWIN_ALIVE → WORLD_ACTIVE
 *
 * P0-A Fix #3: Lifecycle State Management
 * - Persists state to Supabase (user_lifecycle table)
 * - Tracks timestamps for each transition
 * - Enables resuming existing users
 */

import { create } from 'zustand';
import { supabase } from '../services/supabase-service';
import type { EntryPath } from '../lib/entry/entryResolver';

export type LifecycleStatus =
  | 'ONBOARDING'
  | 'ANALYSIS'
  | 'AWAKENING'
  | 'TWIN_ALIVE'
  | 'WORLD_ACTIVE';

export interface LifecycleRecord {
  userId: string;
  status: LifecycleStatus;
  twinId?: string;
  twinCreatedAt?: Date;
  resumedAt?: Date;
  lastActivityAt: Date;
  entryPath?: EntryPath;
  metadata?: Record<string, any>;
}

export interface LifecycleStoreState {
  // State
  status: LifecycleStatus;
  twinId: string | null;
  twinCreatedAt: Date | null;
  resumedAt: Date | null;
  lastActivityAt: Date;
  entryPath: EntryPath | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  transitionTo: (userId: string, newStatus: LifecycleStatus) => Promise<void>;
  setTwinCreated: (userId: string, twinId: string) => Promise<void>;
  markActivity: (userId: string) => Promise<void>;
  loadLifecycle: (userId: string) => Promise<LifecycleRecord | null>;
  setEntryPath: (userId: string, path: EntryPath) => void;
  reset: () => void;
}

export const useLifecycleStore = create<LifecycleStoreState>((set) => ({
  status: 'ONBOARDING',
  twinId: null,
  twinCreatedAt: null,
  resumedAt: null,
  lastActivityAt: new Date(),
  entryPath: null,
  isLoading: false,
  error: null,

  /**
   * Transition to next lifecycle state
   * P0 FIX: Use upsert (not update) to handle new users who don't have a row yet
   * (409 Conflict if row missing) + to auto-create if missing (e.g., Onboarding)
   */
  transitionTo: async (userId: string, newStatus: LifecycleStatus) => {
    try {
      set({ isLoading: true, error: null });

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Upsert lifecycle status in database
      // If row exists → update; if not → insert with default values
      // FIX: must pass onConflict so PostgREST resolves on the UNIQUE(user_id) constraint
      // Do NOT chain .eq() after .upsert() — it is not valid and breaks conflict resolution
      const { error } = await supabase
        .from('user_lifecycle')
        .upsert(
          {
            user_id: userId,
            status: newStatus,
            last_activity_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        throw new Error(`Failed to transition lifecycle: ${error.message}`);
      }

      set({
        status: newStatus,
        lastActivityAt: new Date(),
        isLoading: false,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to transition lifecycle';
      set({ error: errorMsg, isLoading: false });
    }
  },

  /**
   * Mark Twin as created and update lifecycle
   * P0 FIX: Use upsert (not update) to handle row that might not exist yet
   */
  setTwinCreated: async (userId: string, twinId: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const now = new Date();

      // Upsert database (create if missing, update if exists)
      // FIX: must pass onConflict + remove invalid .eq() chaining
      const { error } = await supabase
        .from('user_lifecycle')
        .upsert(
          {
            user_id: userId,
            twin_id: twinId,
            twin_created_at: now.toISOString(),
            status: 'TWIN_ALIVE',
            last_activity_at: now.toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        throw new Error(`Failed to update Twin creation: ${error.message}`);
      }

      set({
        status: 'TWIN_ALIVE',
        twinId,
        twinCreatedAt: now,
        lastActivityAt: now,
        isLoading: false,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to set Twin created';
      set({ error: errorMsg, isLoading: false });
    }
  },

  /**
   * Mark recent activity to track engagement
   */
  markActivity: async (userId: string) => {
    try {
      if (!supabase) return;

      const now = new Date();

      // Update in database (non-critical)
      await supabase
        .from('user_lifecycle')
        .update({
          last_activity_at: now.toISOString(),
        })
        .eq('user_id', userId);

      set({ lastActivityAt: now });
    } catch (err) {
      // Non-critical: silently fail
      console.warn('Failed to mark activity:', err);
    }
  },

  /**
   * Load lifecycle record from database
   * If user has no record, auto-initialize as ONBOARDING
   */
  loadLifecycle: async (userId: string): Promise<LifecycleRecord | null> => {
    try {
      set({ isLoading: true, error: null });

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('user_lifecycle')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        const now = new Date();

        set({
          status: data.status,
          twinId: data.twin_id,
          twinCreatedAt: data.twin_created_at ? new Date(data.twin_created_at) : null,
          resumedAt: now,
          lastActivityAt: new Date(data.last_activity_at),
          isLoading: false,
        });

        // Mark resume: existing user returned — update resumed_at + activity
        // (merged from the former, unused initializeLifecycle() — see LIFE-001 trace)
        const { error: resumeError } = await supabase
          .from('user_lifecycle')
          .update({
            resumed_at: now.toISOString(),
            last_activity_at: now.toISOString(),
          })
          .eq('user_id', userId);

        if (resumeError) {
          console.warn('Failed to update resumed_at:', resumeError);
        }

        return {
          userId,
          status: data.status,
          twinId: data.twin_id,
          twinCreatedAt: data.twin_created_at ? new Date(data.twin_created_at) : undefined,
          resumedAt: now,
          lastActivityAt: now,
        };
      }

      // NEW: If no existing record, auto-initialize new user as ONBOARDING
      // FIX: Use upsert + ignoreDuplicates to handle race condition where
      // loadLifecycle() is called twice concurrently (getSession + onAuthStateChange)
      // — both see no row, both try to insert, second one gets 409 → ignoreDuplicates
      // silently skips the duplicate and we continue normally.
      console.log(`[Lifecycle] New user ${userId}, auto-initializing as ONBOARDING`);

      const { error: insertError } = await supabase
        .from('user_lifecycle')
        .upsert(
          {
            user_id: userId,
            status: 'ONBOARDING',
            last_activity_at: new Date().toISOString(),
          },
          { onConflict: 'user_id', ignoreDuplicates: true }
        );

      if (insertError) {
        console.error('Failed to auto-initialize lifecycle:', insertError);
      } else {
        set({
          status: 'ONBOARDING',
          twinId: null,
          twinCreatedAt: null,
          resumedAt: null,
          lastActivityAt: new Date(),
          isLoading: false,
        });

        return {
          userId,
          status: 'ONBOARDING',
          twinId: undefined,
          twinCreatedAt: undefined,
          resumedAt: undefined,
          lastActivityAt: new Date(),
        };
      }

      set({ isLoading: false });
      return null;
    } catch (err) {
      // CLOCK-SKEW-FIX: device clock 1hr behind → gotrue warns "issued in the future"
      // → Supabase PostgREST rejects JWT → 401. Refresh session then retry once
      // before giving up and leaving status at the store default (ONBOARDING), which
      // would send the user back to /onboarding even if they finished onboarding.
      const isAuthError =
        (err instanceof Error &&
          (err.message.includes('JWT') ||
            err.message.includes('401') ||
            err.message.toLowerCase().includes('auth'))) ||
        (typeof (err as any)?.status === 'number' && (err as any).status === 401) ||
        (typeof (err as any)?.code === 'string' && (err as any).code === '401');

      if (isAuthError && supabase) {
        try {
          await supabase.auth.refreshSession();
          const { data: retryData, error: retryError } = await supabase
            .from('user_lifecycle')
            .select('*')
            .eq('user_id', userId)
            .single();
          if (!retryError || retryError.code === 'PGRST116') {
            if (retryData) {
              const now = new Date();
              set({
                status: retryData.status,
                twinId: retryData.twin_id,
                twinCreatedAt: retryData.twin_created_at ? new Date(retryData.twin_created_at) : null,
                resumedAt: now,
                lastActivityAt: new Date(retryData.last_activity_at),
                isLoading: false,
              });
              return {
                userId,
                status: retryData.status,
                twinId: retryData.twin_id,
                twinCreatedAt: retryData.twin_created_at ? new Date(retryData.twin_created_at) : undefined,
                resumedAt: now,
                lastActivityAt: now,
              };
            }
            set({ status: 'ONBOARDING', isLoading: false });
            return null;
          }
        } catch { /* refresh failed — fall through to error state below */ }
      }

      const errorMsg = err instanceof Error ? err.message : 'Failed to load lifecycle';
      set({ error: errorMsg, isLoading: false });
      return null;
    }
  },

  /**
   * Classify and store entry_path for this session. Writes to DB non-blocking.
   * §ENTRY-RESOLVER-001
   */
  setEntryPath: (userId: string, path: EntryPath) => {
    set({ entryPath: path });
    // Fire-and-forget: non-critical, don't block routing on this
    if (supabase) {
      void supabase
        .from('user_lifecycle')
        .update({ entry_path: path })
        .eq('user_id', userId)
        .then(({ error }) => {
          if (error) console.warn('[Lifecycle] Failed to persist entry_path:', error.message);
        });
    }
  },

  /**
   * Reset lifecycle state
   */
  reset: () =>
    set({
      status: 'ONBOARDING',
      twinId: null,
      twinCreatedAt: null,
      resumedAt: null,
      lastActivityAt: new Date(),
      entryPath: null,
      isLoading: false,
      error: null,
    }),
}));

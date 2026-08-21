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
  metadata?: Record<string, any>;
}

export interface LifecycleStoreState {
  // State
  status: LifecycleStatus;
  twinId: string | null;
  twinCreatedAt: Date | null;
  resumedAt: Date | null;
  lastActivityAt: Date;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeLifecycle: (userId: string, initialStatus: LifecycleStatus) => Promise<void>;
  transitionTo: (userId: string, newStatus: LifecycleStatus) => Promise<void>;
  setTwinCreated: (userId: string, twinId: string) => Promise<void>;
  markActivity: (userId: string) => Promise<void>;
  loadLifecycle: (userId: string) => Promise<LifecycleRecord | null>;
  reset: () => void;
}

export const useLifecycleStore = create<LifecycleStoreState>((set) => ({
  status: 'ONBOARDING',
  twinId: null,
  twinCreatedAt: null,
  resumedAt: null,
  lastActivityAt: new Date(),
  isLoading: false,
  error: null,

  /**
   * Initialize lifecycle state for a new user or resume existing
   */
  initializeLifecycle: async (userId: string, initialStatus: LifecycleStatus) => {
    try {
      set({ isLoading: true, error: null });

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Check if user already has lifecycle record
      const { data: existing } = await supabase
        .from('user_lifecycle')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Resume existing user
        set({
          status: existing.status,
          twinId: existing.twin_id,
          twinCreatedAt: existing.twin_created_at ? new Date(existing.twin_created_at) : null,
          resumedAt: new Date(),
          lastActivityAt: existing.last_activity_at ? new Date(existing.last_activity_at) : new Date(),
          isLoading: false,
        });

        // Update resumed_at
        await supabase
          .from('user_lifecycle')
          .update({ resumed_at: new Date().toISOString() })
          .eq('user_id', userId);
      } else {
        // Create new lifecycle record
        const { error } = await supabase
          .from('user_lifecycle')
          .insert({
            user_id: userId,
            status: initialStatus,
            last_activity_at: new Date().toISOString(),
          });

        if (error) {
          throw new Error(`Failed to create lifecycle record: ${error.message}`);
        }

        set({
          status: initialStatus,
          twinId: null,
          twinCreatedAt: null,
          resumedAt: null,
          lastActivityAt: new Date(),
          isLoading: false,
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize lifecycle';
      set({ error: errorMsg, isLoading: false });
    }
  },

  /**
   * Transition to next lifecycle state
   */
  transitionTo: async (userId: string, newStatus: LifecycleStatus) => {
    try {
      set({ isLoading: true, error: null });

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Update lifecycle status in database
      const { error } = await supabase
        .from('user_lifecycle')
        .update({
          status: newStatus,
          last_activity_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

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
   */
  setTwinCreated: async (userId: string, twinId: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const now = new Date();

      // Update database
      const { error } = await supabase
        .from('user_lifecycle')
        .update({
          twin_id: twinId,
          twin_created_at: now.toISOString(),
          status: 'TWIN_ALIVE',
          last_activity_at: now.toISOString(),
        })
        .eq('user_id', userId);

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
        set({
          status: data.status,
          twinId: data.twin_id,
          twinCreatedAt: data.twin_created_at ? new Date(data.twin_created_at) : null,
          resumedAt: data.resumed_at ? new Date(data.resumed_at) : null,
          lastActivityAt: new Date(data.last_activity_at),
          isLoading: false,
        });

        return {
          userId,
          status: data.status,
          twinId: data.twin_id,
          twinCreatedAt: data.twin_created_at ? new Date(data.twin_created_at) : undefined,
          resumedAt: data.resumed_at ? new Date(data.resumed_at) : undefined,
          lastActivityAt: new Date(data.last_activity_at),
        };
      }

      set({ isLoading: false });
      return null;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load lifecycle';
      set({ error: errorMsg, isLoading: false });
      return null;
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
      isLoading: false,
      error: null,
    }),
}));

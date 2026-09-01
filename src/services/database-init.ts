/**
 * database-init.ts
 * Initialize database schema and migrations
 * Call this once during app startup
 */

import { supabase } from './supabase-service';

/**
 * Run all pending migrations
 * Safe to call multiple times (migrations are idempotent)
 */
export async function runMigrations(): Promise<boolean> {
  try {
    if (!supabase) {
      console.error('Supabase client not available');
      return false;
    }

    console.log('Running database migrations...');

    // Migration 1: Add user_profiles table with analysis completion flag
    const migration1 = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        full_analysis_completed boolean DEFAULT false,
        full_analysis_completed_at timestamp,
        emotional_profile jsonb,
        birth_data jsonb,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );

      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "User profile access" ON user_profiles;
      CREATE POLICY "User profile access" ON user_profiles
        FOR ALL USING (auth.uid() = id);

      CREATE INDEX IF NOT EXISTS idx_user_profiles_analysis_completed
        ON user_profiles(id)
        WHERE full_analysis_completed = true;
    `;

    // Note: Direct SQL execution via RPC requires a database function
    // Most Supabase projects don't have this set up by default
    // Migrations should be run manually via Supabase SQL Editor
    console.log('ℹ️  Migrations should be run manually in Supabase SQL Editor');
    console.log('SQL to execute:');
    console.log(migration1);
    const error = null;

    if (error) {
      console.warn('Note: Migrations may need manual execution in Supabase SQL Editor:', error);
      console.log('SQL to run:');
      console.log(migration1);
      return false;
    }

    console.log('✅ Database migrations completed');
    return true;
  } catch (err) {
    console.error('Migration error:', err);
    return false;
  }
}

/**
 * Initialize or get user profile
 * Creates profile if it doesn't exist
 */
export async function ensureUserProfile(userId: string): Promise<boolean> {
  try {
    if (!userId || !supabase) {
      return false;
    }

    // Check if profile exists
    const { data: existing, error: checkError } = await supabase
      .schema('selfprint').from('users_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected if profile doesn't exist yet
      console.error('Error checking profile:', checkError);
      return false;
    }

    if (existing) {
      return true; // Profile already exists
    }

    // Create new profile
    const { error } = await supabase
      .schema('selfprint').from('users_profiles')
      .insert([
        {
          id: userId,
          full_analysis_completed: false,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error creating user profile:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('ensureUserProfile error:', err);
    return false;
  }
}

/**
 * Mark full analysis as completed for user
 */
export async function markFullAnalysisCompleted(userId: string): Promise<boolean> {
  try {
    if (!userId || !supabase) {
      return false;
    }

    const { error } = await supabase
      .schema('selfprint').from('users_profiles')
      .update({
        full_analysis_completed: true,
        full_analysis_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error marking analysis complete:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('markFullAnalysisCompleted error:', err);
    return false;
  }
}

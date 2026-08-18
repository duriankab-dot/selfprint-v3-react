/**
 * Supabase Client Configuration
 * Centralizes Supabase initialization and exports
 * @module supabase/client
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Initialize Supabase client with project URL and anon key
 * Uses environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * Falls back to process.env for Vercel serverless environments
 */
const supabaseUrl = (typeof import.meta !== 'undefined' && (import.meta.env as any)?.VITE_SUPABASE_URL)
  || process.env.VITE_SUPABASE_URL
  || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && (import.meta.env as any)?.VITE_SUPABASE_ANON_KEY)
  || process.env.VITE_SUPABASE_ANON_KEY
  || '';

/**
 * Supabase client instance
 * Use this to query all tables
 * Note: Returns null if credentials not available (safe for Vercel cold starts)
 */
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Get current authenticated user
 */
export async function getAuthUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Type-safe database queries
 * Extension for common patterns
 */
export const db = {
  /**
   * Insert single row
   */
  async insert<T>(table: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data as any])
      .select()
      .single();
    if (error) throw error;
    return result as T;
  },

  /**
   * Insert multiple rows
   */
  async insertMany<T>(table: string, data: Array<Omit<T, 'id' | 'created_at' | 'updated_at'>>) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data as any)
      .select();
    if (error) throw error;
    return result as T[];
  },

  /**
   * Select by ID
   */
  async selectOne<T>(table: string, id: string) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as T;
  },

  /**
   * Select multiple rows
   */
  async selectMany<T>(table: string, filter?: Record<string, any>) {
    let query = supabase.from(table).select('*');
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value) as any;
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  },

  /**
   * Update row
   */
  async update<T>(table: string, id: string, data: Partial<T>) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result as T;
  },

  /**
   * Delete row
   */
  async delete(table: string, id: string) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },
};

export default supabase;

/**
 * Supabase Client Configuration
 * Centralizes Supabase initialization and exports
 * @module supabase/client
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Initialize Supabase client with project URL and anon key
 * Uses environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * Vite provides env via import.meta.env; process.env used in Node.js environments
 */
function readEnv(name: string): string | undefined {
  return (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.[name]) ||
    (typeof process !== 'undefined' && process.env?.[name])
  );
}

// CF-PAGES-MIGRATION-001: this used to construct the client (and throw if
// env vars were missing) at module load time. That's fine in the browser/
// Vite build, where import.meta.env is always populated -- but this module
// is also imported (transitively, via api/unified-handler.ts) into the
// Cloudflare Pages Functions worker, whose build/publish step evaluates
// every module's top level with no env bindings attached yet. A
// module-scope throw there crashes the entire Functions worker before a
// single request is ever handled. Deferring both the env read and the
// throw to first actual use (via this Proxy) keeps every existing call
// site (`supabase.from(...)`, `supabase.auth.getUser()`, etc.) working
// exactly as before -- the client is just built lazily instead of eagerly.
let _client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (_client) return _client;
  const supabaseUrl = readEnv('VITE_SUPABASE_URL');
  const supabaseAnonKey = readEnv('VITE_SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables'
    );
  }
  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

/**
 * Supabase client instance
 * Use this to query all tables
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

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
 * AUTHHDR-001 FIX: every `/api/*` handler on Cloudflare Pages
 * (functions/api/nova.ts:87-94, functions/api/twin.ts:90-97) rejects the
 * request with 401 unless an `Authorization: Bearer <access_token>` header
 * is present, but the client services were sending `Content-Type` only —
 * so Nova chat, Twin chat and the floating assistant were failing on 100%
 * of requests. This returns the headers those fetch calls need.
 *
 * Never throws: if there is no session (or the client can't be built at
 * all) it returns just the Content-Type, so callers still get the server's
 * own 401 rather than an unhandled exception at the call site.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    // no session / client unavailable — fall through with Content-Type only
  }
  return headers;
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

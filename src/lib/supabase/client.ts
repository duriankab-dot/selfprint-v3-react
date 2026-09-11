/**
 * Supabase Client Configuration
 * Centralizes Supabase initialization and exports
 * @module supabase/client
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { registerClient, getRegisteredClient } from './client-registry.js';

/**
 * Initialize Supabase client with project URL and anon key
 * Uses environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * Vite provides env via import.meta.env; process.env used in Node.js environments
 */
// CF-CREDS-002 (6 Sep 2026): process.env fallback kept for the CF Pages
// Functions worker (Node-like runtime). Dynamic bracket access is intentionally
// NOT used for import.meta.env — see getClient() below for why.
function readProcessEnv(name: string): string | undefined {
  return typeof process !== 'undefined' ? process.env?.[name] : undefined;
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
  // LAZYSHARED-001: reuse a client already built by client-lazy.ts
  // (getSupabaseClient) instead of constructing a second SupabaseClient —
  // two gotrue singletons on one page load would double the realtime
  // connections and warn "GotrueClient multiple instances".
  const shared = getRegisteredClient() as SupabaseClient | null;
  if (shared) {
    _client = shared;
    return shared;
  }
  // CF-CREDS-002 (6 Sep 2026): MUST use literal property access so Vite
  // statically inlines the value at build time. Dynamic bracket access like
  // import.meta.env?.[name] is NOT replaced by Vite's transform → undefined
  // at runtime. Covers both current name (VITE_SUPABASE_URL) and legacy CF
  // Pages name (VITE_SUPABASE_BASE_URL), plus process.env for the Functions
  // worker runtime which uses process.env (not import.meta.env).
  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_BASE_URL ||
    readProcessEnv('VITE_SUPABASE_URL') ||
    readProcessEnv('VITE_SUPABASE_BASE_URL');
  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    readProcessEnv('VITE_SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase credentials. Set VITE_SUPABASE_URL (or VITE_SUPABASE_BASE_URL) and VITE_SUPABASE_ANON_KEY environment variables'
    );
  }
  _client = createClient(supabaseUrl, supabaseAnonKey);
  // LAZYSHARED-001: publish to the shared registry so client-lazy.ts's
  // getSupabaseClient() reuses this instance.
  registerClient(_client);
  return _client;
}

/**
 * Supabase client instance
 * Use this to query all tables
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
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
      .insert([data as unknown as Record<string, unknown>])
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
      .insert(data as unknown as Record<string, unknown>[])
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
        query = query.eq(key, value) as unknown as typeof query;
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
      .update(data as unknown as Record<string, unknown>)
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

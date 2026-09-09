/**
 * client-lazy.ts
 *
 * LAZY entry point for the Supabase SDK. WHY IT EXISTS:
 *
 * `createClient` from @supabase/supabase-js pulls in the whole SDK
 * (gotrue-auth, postgrest-js, storage-js, functions-js, realtime…) ≈ 202 kB
 * raw / 52.4 kB gzip in the vendor-supabase chunk. That SDK used to be a
 * STATIC dependency of the app entry (AuthContext/lifecycleStore/analytics/
 * TwinSupabaseService/…), so every visitor — including logged-out marketing
 * pages like / and /onboarding that only need a session check after first
 * paint (AUTH-LAZY-001) — downloaded and parsed it before first render.
 * Lighthouse (9 ก.ย. 2026): vendor-supabase was in the entry static closure
 * on /th/onboarding with ~83 % of its bytes unused.
 *
 * This module has ZERO static SDK imports (only `import type`), so merely
 * importing it never adds @supabase/* to the importing chunk. The SDK loads
 * on first real use via a dynamic import → its own vendor-supabase chunk,
 * fetched after first paint. Entry-critical consumers that used to
 * `import { supabase }` statically now `await getSupabaseClient()`.
 *
 * The constructed client is registered in client-registry.ts so the sync
 * Proxy in client.ts reuses it (and vice-versa) — never two SupabaseClient
 * singletons (see client-registry.ts).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { registerClient, getRegisteredClient } from './client-registry';

let _clientPromise: Promise<SupabaseClient> | null = null;

// CF-CREDS-002: same env fallback chain as lib/supabase/client.ts — kept here
// (duplicated on purpose, see client-lazy design note above).
function readProcessEnv(name: string): string | undefined {
  return typeof process !== 'undefined' ? process.env?.[name] : undefined;
}

/**
 * Resolve the shared Supabase client, building it on first use via a dynamic
 * import of @supabase/supabase-js (keeps the SDK off the initial bundle).
 * Cached per page load; rejects only when credentials are missing.
 */
export function getSupabaseClient(): Promise<SupabaseClient> {
  const existing = getRegisteredClient();
  if (existing) return Promise.resolve(existing as SupabaseClient);

  if (!_clientPromise) {
    _clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) => {
        const supabaseUrl =
          import.meta.env.VITE_SUPABASE_URL ||
          import.meta.env.VITE_SUPABASE_BASE_URL ||
          readProcessEnv('VITE_SUPABASE_URL') ||
          readProcessEnv('VITE_SUPABASE_BASE_URL');
        const supabaseAnonKey =
          import.meta.env.VITE_SUPABASE_ANON_KEY || readProcessEnv('VITE_SUPABASE_ANON_KEY');
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error(
            'Missing Supabase credentials. Set VITE_SUPABASE_URL (or VITE_SUPABASE_BASE_URL) and VITE_SUPABASE_ANON_KEY environment variables'
          );
        }
        const client = createClient(supabaseUrl, supabaseAnonKey);
        registerClient(client);
        return client;
      })
      .catch((err) => {
        // Transient chunk-fetch failure → allow the next call to retry.
        _clientPromise = null;
        throw err;
      });
  }
  return _clientPromise;
}

/**
 * Lazy twin of getAuthHeaders() from lib/supabase/client.ts (AUTHHDR-001).
 * Never throws: without a session (or without a buildable client) it returns
 * Content-Type only, so callers still get the server's own 401.
 */
export async function getAuthHeadersLazy(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const supabase = await getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    // no session / client unavailable — Content-Type only
  }
  return headers;
}
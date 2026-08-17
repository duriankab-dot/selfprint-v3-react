// src/lib/supabase/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Vite uses import.meta.env for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Missing Supabase environment variables:\n' +
    '  VITE_SUPABASE_URL: ' + (supabaseUrl ? '✅ Set' : '❌ Missing') + '\n' +
    '  VITE_SUPABASE_ANON_KEY: ' + (supabaseAnonKey ? '✅ Set' : '❌ Missing')
  );
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const getSupabase = (): SupabaseClient => supabase;
export type { SupabaseClient };
export default supabase;
// src/lib/supabase/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Vite uses import.meta.env for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://orxteuufqeohptpbwkqx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_q5nNmAvkitf6QrYyl6O6BA_VJQaDoqH';

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

// Export a function to get the client (useful for lazy initialization)
export const getSupabase = (): SupabaseClient => supabase;

// Export types for convenience
export type { SupabaseClient };

// Default export for simple imports
export default supabase; 

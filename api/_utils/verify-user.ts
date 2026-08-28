/**
 * Vercel API Utility: verify-user
 *
 * ตรวจสอบ Supabase Auth JWT และคืน user id ที่ verify แล้ว
 * ใช้ SUPABASE_SERVICE_ROLE_KEY เพื่อ bypass RLS
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types.js';  // import type

declare const process: { env: Record<string, string | undefined> };

// CF-PAGES-MIGRATION-001: this used to read process.env and construct the
// client at MODULE LOAD time. On Cloudflare Pages Functions, env bindings
// aren't reliably present yet when the module first evaluates (same class
// of issue fixed in src/lib/supabase/client.ts — confirmed live: every
// unified-handler route needing supabaseAdmin returned "Supabase
// unavailable"/"Supabase admin not configured" even with SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY set in the CF Pages dashboard). Building it
// lazily on first call, memoized, fixes that with no change to the
// already-nullable contract every call site expects.
let _supabaseAdmin: SupabaseClient<Database> | null | undefined;

// สร้าง client พร้อม Database type
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  if (_supabaseAdmin !== undefined) return _supabaseAdmin;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  _supabaseAdmin =
    supabaseUrl && supabaseServiceRoleKey
      ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey)
      : null;
  return _supabaseAdmin;
}

export interface VerifiedUser {
  id: string;
  email?: string;
}

export async function verifyUser(
  authHeader: string | undefined
): Promise<VerifiedUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;

  return { id: data.user.id, email: data.user.email ?? undefined };
}
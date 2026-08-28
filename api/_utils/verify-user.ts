/**
 * Vercel API Utility: verify-user
 *
 * ตรวจสอบ Supabase Auth JWT และคืน user id ที่ verify แล้ว
 * ใช้ SUPABASE_SERVICE_ROLE_KEY เพื่อ bypass RLS
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types.js';  // import type

export type Env = Record<string, string | undefined>;

// CF-PAGES-MIGRATION-001: this used to read `process.env` directly. Two
// separate bugs, found live in production, in order:
//   1. Module-load-time construction crashed the whole Functions worker at
//      publish time (fixed first — moved to a lazy, memoized getter).
//   2. Even lazily, `process.env.SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
//      still came back empty on every real request — confirmed live:
//      GET /api/share -> "Supabase admin not configured" and
//      GET /api/profile / /api/blueprint -> "Supabase unavailable", with
//      those exact vars correctly set (as Secrets) in the CF Pages
//      dashboard. `functions/api/twin.ts` and `functions/api/nova.ts`,
//      which read ANTHROPIC_API_KEY via the Pages Functions `context.env`
//      parameter directly instead of `process.env`, worked immediately —
//      isolating the fix to "stop using process.env, thread the real env
//      object through instead," which is what this file and
//      api/unified-handler.ts now do.
let _supabaseAdmin: SupabaseClient<Database> | null | undefined;

// สร้าง client พร้อม Database type
export function getSupabaseAdmin(env: Env): SupabaseClient<Database> | null {
  if (_supabaseAdmin !== undefined) return _supabaseAdmin;
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
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
  authHeader: string | undefined,
  env: Env
): Promise<VerifiedUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const supabaseAdmin = getSupabaseAdmin(env);
  if (!supabaseAdmin) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;

  return { id: data.user.id, email: data.user.email ?? undefined };
}

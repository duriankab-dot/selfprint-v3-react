/**
 * Cloudflare Pages Function Utility: verify-user
 *
 * ตรวจสอบ Supabase Auth JWT และคืน user id ที่ verify แล้ว
 * ใช้ SUPABASE_SERVICE_ROLE_KEY เพื่อ bypass RLS
 */
import { createClient } from '@supabase/supabase-js';

export type Env = Record<string, string | undefined>;

// Lazy, memoized admin client — avoid module-load-time crashes
let _supabaseAdmin: ReturnType<typeof createClient> | null | undefined;

export function getSupabaseAdmin(env: Env): ReturnType<typeof createClient> | null {
  if (_supabaseAdmin !== undefined) return _supabaseAdmin;
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  _supabaseAdmin =
    supabaseUrl && supabaseServiceRoleKey
      ? createClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
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

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return null;

    return { id: data.user.id, email: data.user.email ?? undefined };
  } catch {
    return null;
  }
}

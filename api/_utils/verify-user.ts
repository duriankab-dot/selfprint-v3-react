/**
 * Vercel API Utility: verify-user
 *
 * ตรวจสอบ Supabase Auth JWT และคืน user id ที่ verify แล้ว
 * ใช้ SUPABASE_SERVICE_ROLE_KEY เพื่อ bypass RLS
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types.js';  // import type

declare const process: { env: Record<string, string | undefined> };

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// สร้าง client พร้อม Database type
export const supabaseAdmin: SupabaseClient<Database> | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey)
    : null;

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
  if (!supabaseAdmin) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;

  return { id: data.user.id, email: data.user.email ?? undefined };
}
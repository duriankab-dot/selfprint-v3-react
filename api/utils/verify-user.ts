/**
 * Vercel API Utility: verify-user
 *
 * บทบาท: ตรวจสอบ Supabase Auth JWT ที่ frontend ส่งมาใน header
 * `Authorization: Bearer <access_token>` แล้วคืน user id จริงที่ verify แล้ว
 *
 * ใช้ SUPABASE_SERVICE_ROLE_KEY เพราะต้อง verify token ได้โดยไม่ต้องพึ่ง
 * anon key แยกต่างหาก — เขียนข้อมูลด้วย client เดียวกันนี้ (bypass RLS)
 * แต่ผูก user_id เป็นค่าที่ verify แล้วเสมอ ไม่เชื่อค่าที่ client ส่งมาเอง
 */

import { createClient } from '@supabase/supabase-js';

declare const process: { env: Record<string, string | undefined> };

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

export interface VerifiedUser {
  id: string;
  email?: string;
}

/**
 * Verify Bearer token จาก Authorization header
 * @returns userId ที่ verify แล้ว หรือ null ถ้า token ไม่ถูกต้อง/ไม่มี
 */
export async function verifyUser(
  authHeader: string | undefined
): Promise<VerifiedUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  if (!supabaseAdmin) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return null;
  }

  return { id: data.user.id, email: data.user.email ?? undefined };
}

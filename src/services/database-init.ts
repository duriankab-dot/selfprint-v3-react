/**
 * database-init.ts
 * Initialize database schema helpers
 *
 * DC-59 (Phase 9/11): dead export `runMigrations()` ถูกลบออก
 * (zero callers; migration จัดการผ่าน supabase/migrations แล้ว)
 * เหลือเฉพาะ ensureUserProfile / markFullAnalysisCompleted ที่มี consumer จริง
 */

import { supabase } from './supabase-service';

/**
 * Initialize or get user profile
 * Creates profile if it doesn't exist
 */
export async function ensureUserProfile(userId: string): Promise<boolean> {
  try {
    if (!userId || !supabase) {
      return false;
    }

    // Check if profile exists
    // DBKEY-001 FIX (3 ก.ย. 2026): `selfprint.users_profiles.id` เป็น surrogate
    // key ที่ default เป็น gen_random_uuid() ไม่ใช่ auth uid — คอลัมน์ที่ผูกกับ
    // ผู้ใช้จริงคือ `user_id UUID NOT NULL` (supabase/migrations/002:36)
    // การ .eq('id', userId) จึงไม่เคย match แถวไหนเลย → ฟังก์ชันนี้คิดว่ายังไม่มี
    // profile ทุกครั้งแล้วพยายาม insert ใหม่ซ้ำ ๆ
    // PROFILE406-001 (9 ก.ย. 2026): "no profile yet" is the expected answer
    // for a brand-new user (that's the whole point of this check), but
    // `.single()` replies 406 for 0 rows — a red console error on the first
    // run of every new account. PGRST116 is handled below, yet Chrome still
    // logs the failed response. `.limit(1)` + array read returns 200 `[]`.
    const { data: existingRows, error: checkError } = await supabase
      .schema('selfprint').from('users_profiles')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    const existing = existingRows?.[0] ?? null;

    if (checkError) {
      console.error('Error checking profile:', checkError);
      return false;
    }

    if (existing) {
      return true; // Profile already exists
    }

    // Create new profile
    const { error } = await supabase
      .schema('selfprint').from('users_profiles')
      .insert([
        {
          // DBKEY-001 FIX: ส่ง user_id (NOT NULL) แทนการ override id
          // ของเดิมไม่ส่ง user_id เลย → insert ล้มด้วย not-null violation ทุกครั้ง
          user_id: userId,
          full_analysis_completed: false,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error creating user profile:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('ensureUserProfile error:', err);
    return false;
  }
}

/**
 * Mark full analysis as completed for user
 */
export async function markFullAnalysisCompleted(userId: string): Promise<boolean> {
  try {
    if (!userId || !supabase) {
      return false;
    }

    const { error } = await supabase
      .schema('selfprint').from('users_profiles')
      .update({
        full_analysis_completed: true,
        full_analysis_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      // DBKEY-001 FIX — ดูคอมเมนต์ใน ensureUserProfile ด้านบน
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking analysis complete:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('markFullAnalysisCompleted error:', err);
    return false;
  }
}

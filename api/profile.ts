/**
 * Vercel API Function: /api/profile
 *
 * บทบาท: บันทึก/อัปเดต user profile (birth data + mood) หลัง onboarding
 * ต้อง login ผ่าน Supabase Auth (magic link) มาก่อน — ส่ง
 * `Authorization: Bearer <access_token>` มาด้วยเสมอ
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, verifyUser } from './utils/verify-user';

interface ProfileRequest {
  dateOfBirth?: string; // YYYY-MM-DD
  timeOfBirth?: string; // HH:MM
  placeOfBirth?: string;
  initialMood?: string;
}

interface ProfileResponse {
  success: boolean;
  profileId?: string;
  message: string;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'ใช้ GET หรือ POST เท่านั้น' });
  }

  try {
    if (!supabaseAdmin) {
      console.error('Supabase ไม่พร้อม');
      return res.status(500).json({ error: 'SERVER_ERROR', message: 'Supabase ไม่พร้อม' });
    }

    const user = await verifyUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'ต้อง login ก่อน (Authorization header ไม่ถูกต้องหรือหมดอายุ)',
      });
    }

    if (req.method === 'GET') {
      const { data, error: selectError } = await supabaseAdmin
        .schema('selfprint')
        .from('users_profiles')
        .select()
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Supabase select error (users_profiles):', selectError);
        return res.status(500).json({ error: 'DB_ERROR', message: 'ไม่สามารถดึง profile ได้' });
      }

      return res.status(200).json({ success: true, profile: data || null });
    }

    const body: ProfileRequest = req.body || {};

    const { data, error: upsertError } = await supabaseAdmin
      .schema('selfprint')
      .from('users_profiles')
      .upsert(
        {
          user_id: user.id,
          date_of_birth: body.dateOfBirth || null,
          time_of_birth: body.timeOfBirth || null,
          place_of_birth: body.placeOfBirth || null,
          initial_mood: body.initialMood || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('❌ Supabase upsert error (users_profiles):', upsertError);
      return res.status(500).json({ error: 'DB_ERROR', message: 'ไม่สามารถบันทึก profile ได้' });
    }

    const result: ProfileResponse = {
      success: true,
      profileId: data?.id,
      message: 'บันทึก profile เรียบร้อย',
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('[Profile API Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'API_ERROR', message: errorMessage });
  }
};

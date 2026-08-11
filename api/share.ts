/**
 * Vercel API Function: /api/share
 *
 * บทบาท: จัดการ referral/share link ของ AI Twin
 * - POST (ต้อง login): สร้าง/คืน share code ของ user ที่ login อยู่
 * - GET (public, ?code=xxx): ดึงข้อมูล preview แบบปลอดภัยของเจ้าของ code
 *   (ไม่ login ก็เรียกได้ เพราะเป็นหน้าเชิญเพื่อน — อ่านผ่าน service role
 *   เท่านั้น ไม่เปิด RLS ให้ anon อ่านตรงได้)
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { supabaseAdmin, verifyUser } from './_utils/verify-user.js';

function generateCode(): string {
  return crypto.randomBytes(6).toString('base64url'); // 8 chars, URL-safe
}

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabaseAdmin) {
    console.error('Supabase ไม่พร้อม');
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Supabase ไม่พร้อม' });
  }

  if (req.method === 'GET') {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    if (!code) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'ต้องระบุ code' });
    }

    const { data: link, error: linkError } = await supabaseAdmin
      .from('share_links')
      .select('user_id')
      .eq('code', code)
      .maybeSingle();

    if (linkError) {
      console.error('❌ Supabase select error (share_links):', linkError);
      return res.status(500).json({ error: 'DB_ERROR', message: 'ไม่สามารถดึงลิงก์ได้' });
    }
    if (!link) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'ไม่พบลิงก์นี้' });
    }

    const { data: blueprint, error: blueprintError } = await supabaseAdmin
      .from('blueprints')
      .select('accuracy_level, decision_style')
      .eq('user_id', link.user_id)
      .eq('is_latest', true)
      .maybeSingle();

    if (blueprintError) {
      console.error('❌ Supabase select error (blueprints):', blueprintError);
      return res.status(500).json({ error: 'DB_ERROR', message: 'ไม่สามารถดึง blueprint ได้' });
    }
    if (!blueprint) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'เจ้าของลิงก์นี้ยังไม่มี AI Twin' });
    }

    return res.status(200).json({
      found: true,
      accuracyLevel: blueprint.accuracy_level,
      decisionStyle: blueprint.decision_style,
    });
  }

  if (req.method === 'POST') {
    const user = await verifyUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'ต้อง login ก่อน (Authorization header ไม่ถูกต้องหรือหมดอายุ)',
      });
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('share_links')
      .select('code')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError) {
      console.error('❌ Supabase select error (share_links):', existingError);
      return res.status(500).json({ error: 'DB_ERROR', message: 'ไม่สามารถตรวจสอบลิงก์ได้' });
    }

    if (existing) {
      return res.status(200).json({ success: true, code: existing.code });
    }

    // Retry a few times in the unlikely event of a code collision
    // (UNIQUE constraint on `code`).
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode();
      const { error: insertError } = await supabaseAdmin
        .from('share_links')
        .insert({ user_id: user.id, code });

      if (!insertError) {
        return res.status(200).json({ success: true, code });
      }

      // 23505 = unique_violation — try again with a new code
      if ((insertError as { code?: string }).code !== '23505') {
        console.error('❌ Supabase insert error (share_links):', insertError);
        return res.status(500).json({ error: 'DB_ERROR', message: 'ไม่สามารถสร้างลิงก์ได้' });
      }
    }

    return res.status(500).json({ error: 'DB_ERROR', message: 'สร้าง code ไม่สำเร็จ ลองใหม่อีกครั้ง' });
  }

  return res.status(405).json({ error: 'ใช้ GET หรือ POST เท่านั้น' });
};

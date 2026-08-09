/**
 * Vercel API Function: /api/blueprint
 *
 * บทบาท: บันทึกผล AI Twin blueprint (decision style, strengths, insights,
 * opportunities) ที่ได้จาก onboarding หลัง fine-tuning เสร็จ
 * ต้อง login ผ่าน Supabase Auth (magic link) มาก่อน — ส่ง
 * `Authorization: Bearer <access_token>` มาด้วยเสมอ
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, verifyUser } from './utils/verify-user.js';

interface BlueprintRequest {
  profileId?: string;
  accuracyLevel: number; // 0-100
  decisionStyle?: string;
  strengths?: string[];
  insights?: string[];
  opportunities?: string[];
  blindSpots?: string[];
  prototypeCore?: string;
  source?: 'initial' | 'refined' | 'exported';
}

interface BlueprintResponse {
  success: boolean;
  blueprintId?: string;
  message: string;
}

function validateInput(data: any): { valid: boolean; error?: string } {
  if (typeof data.accuracyLevel !== 'number' || data.accuracyLevel < 0 || data.accuracyLevel > 100) {
    return { valid: false, error: 'accuracyLevel ต้องเป็น 0-100' };
  }
  return { valid: true };
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
        .from('blueprints')
        .select()
        .eq('user_id', user.id)
        .eq('is_latest', true)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Supabase select error (blueprints):', selectError);
        return res.status(500).json({ error: 'DB_ERROR', message: 'ไม่สามารถดึง blueprint ได้' });
      }

      return res.status(200).json({ success: true, blueprint: data || null });
    }

    const body: BlueprintRequest = req.body || {};

    const validation = validateInput(body);
    if (!validation.valid) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: validation.error });
    }

    // ตัว blueprint ก่อนหน้าของ user นี้ ให้ mark เป็น is_latest = false ก่อน
    await supabaseAdmin
      .schema('selfprint')
      .from('blueprints')
      .update({ is_latest: false })
      .eq('user_id', user.id)
      .eq('is_latest', true);

    const { data, error: insertError } = await supabaseAdmin
      .schema('selfprint')
      .from('blueprints')
      .insert({
        user_id: user.id,
        profile_id: body.profileId || null,
        accuracy_level: body.accuracyLevel,
        decision_style: body.decisionStyle || null,
        strengths: body.strengths || [],
        insights: body.insights || [],
        opportunities: body.opportunities || [],
        blind_spots: body.blindSpots || [],
        prototype_core: body.prototypeCore || null,
        is_latest: true,
        source: body.source || 'initial',
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Supabase insert error (blueprints):', insertError);
      return res.status(500).json({ error: 'DB_ERROR', message: 'ไม่สามารถบันทึก blueprint ได้' });
    }

    const result: BlueprintResponse = {
      success: true,
      blueprintId: data?.id,
      message: 'บันทึก blueprint เรียบร้อย',
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('[Blueprint API Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'API_ERROR', message: errorMessage });
  }
};

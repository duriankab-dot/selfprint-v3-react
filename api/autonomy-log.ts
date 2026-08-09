/**
 * Vercel API Function: /api/autonomy-log
 *
 * บทบาท: รับ autonomy tracking data จาก React → บันทึกเข้า Supabase decision_log
 *
 * ลักษณะการใช้:
 * 1. Frontend (useChat hook) ส่ง POST ไปที่ /api/autonomy-log
 * 2. Function นี้ประมวลผล + บันทึกเข้า Supabase
 * 3. ส่ง success response กลับ
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Initialize Supabase client
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Supabase env vars missing');
}

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

/**
 * Type definition: สิ่งที่ Frontend ส่งมา
 */
interface AutonomyLogRequest {
  user_id: string;
  hub: string;
  mood: string;
  autonomy_level: number; // 0-100
  confidence: number; // 0-1
  hesitation: number; // 0-1
  response_time_ms: number; // milliseconds
  message_length?: number;
  response_length?: number;
}

/**
 * Type definition: สิ่งที่เราส่งกลับไป
 */
interface AutonomyLogResponse {
  success: boolean;
  logId?: string;
  message: string;
  timestamp: string;
}

/**
 * Utility: Validate request data
 */
function validateInput(data: any): { valid: boolean; error?: string } {
  if (!data.user_id || !data.user_id.trim()) {
    return { valid: false, error: 'user_id ต้องระบุ' };
  }
  if (!data.hub || !data.hub.trim()) {
    return { valid: false, error: 'hub ต้องระบุ' };
  }
  if (!data.mood || !data.mood.trim()) {
    return { valid: false, error: 'mood ต้องระบุ' };
  }
  if (typeof data.autonomy_level !== 'number' || data.autonomy_level < 0 || data.autonomy_level > 100) {
    return { valid: false, error: 'autonomy_level ต้องเป็น 0-100' };
  }
  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
    return { valid: false, error: 'confidence ต้องเป็น 0-1' };
  }
  if (typeof data.hesitation !== 'number' || data.hesitation < 0 || data.hesitation > 1) {
    return { valid: false, error: 'hesitation ต้องเป็น 0-1' };
  }
  if (typeof data.response_time_ms !== 'number' || data.response_time_ms < 0) {
    return { valid: false, error: 'response_time_ms ต้องเป็นจำนวนบวก' };
  }

  return { valid: true };
}

/**
 * Main Handler
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. ตรวจสอบ Method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'ใช้ POST เท่านั้น' });
  }

  try {
    // 2. ตรวจสอบ Supabase
    if (!supabase) {
      console.error('Supabase ไม่พร้อม');
      return res.status(500).json({
        error: 'SERVER_ERROR',
        message: 'Supabase ไม่พร้อม',
      });
    }

    // 3. Parse request body
    const body: AutonomyLogRequest = req.body;

    // 4. Validate input
    const validation = validateInput(body);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: validation.error,
      });
    }

    // 5. Insert into Supabase decision_log
    const { data, error: insertError } = await supabase
      .from('decision_log')
      .insert({
        user_id: body.user_id,
        hub: body.hub,
        mood: body.mood,
        autonomy_level: body.autonomy_level,
        confidence: body.confidence,
        hesitation: body.hesitation,
        response_time_ms: body.response_time_ms,
        message_length: body.message_length || 0,
        response_length: body.response_length || 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Supabase insert error:', insertError);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'ไม่สามารถบันทึกข้อมูลได้',
      });
    }

    // 6. Success response
    console.log('✅ Autonomy logged:', {
      userId: body.user_id,
      hub: body.hub,
      mood: body.mood,
      autonomyLevel: body.autonomy_level,
      confidence: body.confidence,
      responseTime: body.response_time_ms,
    });

    const result: AutonomyLogResponse = {
      success: true,
      logId: data?.id,
      message: 'ข้อมูล autonomy ถูกบันทึกเรียบร้อย',
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('[Autonomy Log Error]', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      error: 'API_ERROR',
      message: errorMessage,
    });
  }
};

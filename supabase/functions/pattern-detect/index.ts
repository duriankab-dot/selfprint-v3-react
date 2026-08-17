/**
 * Supabase Edge Function: pattern-detect
 *
 * วิเคราะห์ข้อมูล chat/journal/reflection ของ user
 * ผ่าน Claude → บันทึก behavioral patterns ลง behavioral_patterns table
 *
 * @route POST /functions/v1/pattern-detect
 * Body: { userId }
 *
 * ถูกเรียกโดย:
 * - Server-side trigger หลัง journal-sync
 * - Scheduled cron job (daily)
 * - Manual trigger จาก dashboard
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

interface DetectedPattern {
  pattern_name: string;
  pattern_type: 'repeating' | 'emerging' | 'changing';
  description: string;
  ai_insight: string;
  impact: string;
  frequency: string;
  confidence: number;
  evidence_points: Array<{ date: string; excerpt: string; confidence: number }>;
  is_strength: boolean;
}

interface ClaudePatternResponse {
  patterns: DetectedPattern[];
  summary: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!supabaseUrl || !serviceKey) return json({ error: 'Supabase not configured' }, 500);
  if (!anthropicKey) return json({ error: 'Anthropic key not configured' }, 500);

  try {
    const body = await req.json() as { userId: string };
    if (!body.userId) return json({ error: 'userId required' }, 400);

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get recent messages (last 30 days, max 50)
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: messages, error: msgErr } = await supabase
      .from('chat_messages')
      .select('role, content, hub, mood, created_at')
      .eq('user_id', body.userId)
      .eq('role', 'user')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(50);

    if (msgErr) throw new Error(`DB error: ${msgErr.message}`);
    if (!messages || messages.length < 5) {
      return json({ success: true, patterns: 0, message: 'Insufficient data for pattern analysis' });
    }

    // Get user's personal profile for context
    const { data: profile } = await supabase
      .from('personal_profiles')
      .select('decision_style, strengths, blind_spots')
      .eq('user_id', body.userId)
      .maybeSingle();

    // Build context for Claude
    const messagesSummary = messages
      .slice(0, 30)
      .map((m: { created_at: string; hub?: string; mood?: string; content: string }) =>
        `[${new Date(m.created_at).toLocaleDateString('th-TH')} | ${m.hub || 'general'} | ${m.mood || 'neutral'}] ${m.content.slice(0, 200)}`
      )
      .join('\n');

    const systemPrompt = `คุณคือ AI ที่วิเคราะห์รูปแบบพฤติกรรมของมนุษย์จากบันทึกการสนทนา
ตอบเฉพาะ JSON เท่านั้น ไม่มีข้อความอื่น

วิเคราะห์รูปแบบที่:
1. เกิดซ้ำ (repeating) - สิ่งที่เกิดซ้ำๆ
2. กำลังเกิด (emerging) - แนวโน้มใหม่ที่เพิ่งเริ่ม
3. เปลี่ยนแปลง (changing) - สิ่งที่กำลังเปลี่ยนไป

โปรไฟล์ผู้ใช้:
- Decision style: ${profile?.decision_style || 'unknown'}
- Strengths: ${profile?.strengths?.join(', ') || 'unknown'}
- Blind spots: ${profile?.blind_spots?.join(', ') || 'unknown'}`;

    const userPrompt = `บันทึกการสนทนา 30 วันล่าสุด (${messages.length} ข้อความ):

${messagesSummary}

วิเคราะห์และตอบใน JSON format นี้:
{
  "patterns": [
    {
      "pattern_name": "ชื่อรูปแบบ (snake_case)",
      "pattern_type": "repeating|emerging|changing",
      "description": "คำอธิบายรูปแบบที่พบ",
      "ai_insight": "ความเข้าใจเชิงลึกเกี่ยวกับรูปแบบนี้",
      "impact": "ผลกระทบต่อชีวิตและการตัดสินใจ",
      "frequency": "ความถี่ที่พบ เช่น 'every few days', 'weekly'",
      "confidence": 0.7,
      "evidence_points": [
        { "date": "YYYY-MM-DD", "excerpt": "ข้อความที่เป็นหลักฐาน", "confidence": 0.8 }
      ],
      "is_strength": false
    }
  ],
  "summary": "สรุปภาพรวมรูปแบบที่พบในภาษาไทย"
}

ตรวจพบ 3-7 รูปแบบที่มีนัยสำคัญ ไม่ใช่ทุกอย่างที่เห็น`;

    // Call Claude
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      throw new Error(`Claude API error: ${claudeRes.status}`);
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content?.[0]?.text || '{}';

    let parsed: ClaudePatternResponse;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { patterns: [], summary: '' };
    } catch {
      throw new Error('Failed to parse Claude response as JSON');
    }

    if (!parsed.patterns || parsed.patterns.length === 0) {
      return json({ success: true, patterns: 0, message: 'No significant patterns detected' });
    }

    // Upsert patterns into DB (replace existing by name for this user)
    const now = new Date().toISOString();
    const patternRows = parsed.patterns.map((p: DetectedPattern) => ({
      user_id: body.userId,
      pattern_name: p.pattern_name,
      pattern_type: p.pattern_type,
      description: p.description,
      ai_insight: p.ai_insight,
      impact: p.impact,
      frequency: p.frequency,
      confidence: Math.min(1, Math.max(0, p.confidence || 0.5)),
      evidence_points: p.evidence_points || [],
      is_strength: p.is_strength || false,
      last_detected: now,
      updated_at: now,
    }));

    // Upsert: if pattern_name + user_id exists, update it
    const { error: upsertErr } = await supabase
      .from('behavioral_patterns')
      .upsert(patternRows, { onConflict: 'user_id,pattern_name', ignoreDuplicates: false });

    if (upsertErr) {
      // Try insert if upsert fails (constraint might not exist)
      for (const row of patternRows) {
        await supabase.from('behavioral_patterns').insert(row);
      }
    }

    console.log(`[pattern-detect] User ${body.userId}: detected ${patternRows.length} patterns`);

    return json({
      success: true,
      patterns: patternRows.length,
      summary: parsed.summary,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[pattern-detect]', msg);
    return json({ error: msg }, 500);
  }
});

/**
 * Supabase Edge Function: daily-brief
 *
 * สร้าง Daily Brief ส่วนตัว 20-40 วินาทีสำหรับ user
 * ผ่าน Claude โดยใช้ข้อมูล personal_memory + behavioral_patterns + recent activity
 *
 * @route POST /functions/v1/daily-brief
 * Body: { userId, forceRefresh? }
 *
 * Response: { briefText, hubFocus, moodContext, cached }
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

interface DailyBriefBody {
  userId: string;
  forceRefresh?: boolean;
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
    const body = await req.json() as DailyBriefBody;
    if (!body.userId) return json({ error: 'userId required' }, 400);

    const supabase = createClient(supabaseUrl, serviceKey);
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // 1. Return cached brief if exists (unless forceRefresh)
    if (!body.forceRefresh) {
      const { data: cached } = await supabase
        .from('daily_briefs')
        .select('brief_text, hub_focus, mood_context')
        .eq('user_id', body.userId)
        .eq('brief_date', today)
        .maybeSingle();

      if (cached) {
        return json({
          success: true,
          briefText: cached.brief_text,
          hubFocus: cached.hub_focus,
          moodContext: cached.mood_context,
          cached: true,
        });
      }
    }

    // 2. Gather user context in parallel
    const [
      { data: memories },
      { data: patterns },
      { data: recentMessages },
      { data: profile },
    ] = await Promise.all([
      supabase
        .from('personal_memory')
        .select('memory_type, title, content, confidence')
        .eq('user_id', body.userId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('behavioral_patterns')
        .select('pattern_name, pattern_type, description, ai_insight, is_strength')
        .eq('user_id', body.userId)
        .order('confidence', { ascending: false })
        .limit(5),
      supabase
        .from('chat_messages')
        .select('content, hub, mood, created_at')
        .eq('user_id', body.userId)
        .eq('role', 'user')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(15),
      supabase
        .from('personal_profiles')
        .select('decision_style, strengths, primary_hub, current_state')
        .eq('user_id', body.userId)
        .maybeSingle(),
    ]);

    // 3. Determine hub focus and mood context from recent activity
    const hubCounts: Record<string, number> = {};
    const moodCounts: Record<string, number> = {};
    for (const msg of recentMessages || []) {
      if (msg.hub) hubCounts[msg.hub] = (hubCounts[msg.hub] || 0) + 1;
      if (msg.mood) moodCounts[msg.mood] = (moodCounts[msg.mood] || 0) + 1;
    }
    const hubFocus = Object.entries(hubCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
      || profile?.primary_hub || 'general';
    const moodContext = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
      || 'neutral';

    // 4. Build prompt context
    const memorySummary = (memories || [])
      .map(m => `- [${m.memory_type}] ${m.title}: ${m.content?.slice(0, 100)}`)
      .join('\n') || 'ยังไม่มีข้อมูล';

    const patternSummary = (patterns || [])
      .map(p => `- ${p.pattern_name} (${p.pattern_type}): ${p.description?.slice(0, 80)} ${p.is_strength ? '⭐' : ''}`)
      .join('\n') || 'ยังไม่มีข้อมูล';

    const recentActivity = (recentMessages || [])
      .slice(0, 5)
      .map(m => `[${m.hub || 'general'}] ${m.content?.slice(0, 100)}`)
      .join('\n') || 'ยังไม่มีข้อมูล';

    const systemPrompt = `คุณคือ Nova — AI ฝาแฝดส่วนตัวของผู้ใช้
สร้าง Daily Brief ที่อ่านได้ใน 20-40 วินาที (ประมาณ 60-100 คำ)
Brief ต้องรู้สึกเหมือนมาจากเพื่อนที่รู้จักคุณดี ไม่ใช่ AI ทั่วไป

รูปแบบ:
1. เปิดด้วยการทักทายสั้นๆ ที่ relate กับ hub focus (${hubFocus}) และ mood (${moodContext})
2. Highlight สิ่งที่น่าสังเกตจาก patterns หรือ memories (1 อย่าง)
3. Nudge เบาๆ สำหรับวันนี้ — อิงจากข้อมูลจริง ไม่ generic
4. ปิดด้วยประโยคสั้นๆ ที่ให้กำลังใจ

ห้ามขึ้นต้นด้วย "วันนี้" เพียงอย่างเดียว ทำให้รู้สึก personal`;

    const userPrompt = `ข้อมูลผู้ใช้:
Hub focus: ${hubFocus} | Mood: ${moodContext}
Decision style: ${profile?.decision_style || 'unknown'}
Current state: ${profile?.current_state || 'unknown'}

Memories (10 ล่าสุด):
${memorySummary}

Behavioral patterns:
${patternSummary}

กิจกรรม 7 วันล่าสุด:
${recentActivity}

สร้าง Daily Brief ภาษาไทย กระชับ อบอุ่น personal`;

    // 5. Generate with Claude
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022', // Haiku for speed
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) throw new Error(`Claude API error: ${claudeRes.status}`);
    const claudeData = await claudeRes.json();
    const briefText = claudeData.content?.[0]?.text?.trim() || '';

    if (!briefText) throw new Error('Empty response from Claude');

    // 6. Cache in DB (upsert for today)
    await supabase
      .from('daily_briefs')
      .upsert({
        user_id: body.userId,
        brief_date: today,
        brief_text: briefText,
        hub_focus: hubFocus,
        mood_context: moodContext,
        generated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,brief_date' });

    return json({
      success: true,
      briefText,
      hubFocus,
      moodContext,
      cached: false,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[daily-brief]', msg);
    return json({ error: msg }, 500);
  }
});

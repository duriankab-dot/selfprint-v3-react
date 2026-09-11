/**
 * Supabase Edge Function: astrovera-edge
 *
 * Phase 2: Real Astrovera Psychology analysis via OpenRouter (Claude)
 *
 * รับ finetune answers + mood + birthDate → เรียก Claude ผ่าน OpenRouter
 * → คืน JSON AnalysisResponse shape (decisionStyle, strengths, insights,
 *   opportunities, blindSpots, confidence, sources)
 *
 * ถ้าเรียก Claude ไม่สำเร็จ → fallback เป็น buildFallbackResponse logic
 * (numerology-based Life Path) ภายใน edge เอง
 *
 * @route POST /functions/v1/astrovera-edge
 * Body: { mood, birthDate, finetuneAnswers }
 *
 * Auth required — JWT จาก Supabase Auth (`Authorization: Bearer <token>`)
 *
 * ── SEC-02 ────────────────────────────────────────────────────────────────
 * userId ถูกตัดออกจากร request body — อ่านจาก token เท่านั้น
 * ใช้ userClient.auth.getUser() verify JWT ก่อนใช้ service_role key
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

interface AstroveraInput {
  mood?: string;
  birthDate?: string;
  finetuneAnswers?: Record<string, string>;
  question?: string;
}

interface AstroveraOutput {
  coreIdentity: string;
  traits: string[];
  strengths: string[];
  cautions: string[];
  confidence: number;
  evidence: string[];
  limitation: string | null;
  archetypeKey: string;
  phaseKey: string;
}

// ── Inline numerology fallback (same logic as astrovera-adapter.ts) ──────
// Copied here so the edge function is self-contained and can fallback
// without calling client-side code.

function calculateLifePathNumber(birthDate: string): number {
  if (!birthDate || birthDate.length < 8) return 0;
  const digits = birthDate.replace(/[^0-9]/g, '').split('');
  let sum = 0;
  for (const d of digits) sum += parseInt(d, 10);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    const ds = sum.toString().split('');
    sum = 0;
    for (const d of ds) sum += parseInt(d, 10);
  }
  return sum;
}

const LIFE_PATH_PROFILES: Record<number, {
  decisionStyle: string;
  strengths: string[];
  insights: string[];
  opportunities: string[];
  blindSpots: string[];
}> = {
  1: {
    decisionStyle: 'ผู้นำที่ตัดสินใจด้วยวิสัยทัศน์',
    strengths: ['ความเป็นอิสระ', 'ความคิดสร้างสรรค์', 'ความกล้าหาญ'],
    insights: ['คุณมีแนวโน้มที่จะนำมากกว่าตาม', 'การตัดสินใจของคุณมาจากภายใน', 'คุณต้องการควบคุมชีวิตตัวเอง'],
    opportunities: ['เรียนรู้การทำงานเป็นทีม', 'เปิดรับมุมมองอื่น'],
    blindSpots: ['อาจดูแข็งกร้าว', 'ฟังความคิดเห็นคนอื่นน้อย'],
  },
  2: {
    decisionStyle: 'ผู้ประสานงานที่ตัดสินใจด้วยความสมดุล',
    strengths: ['ความอ่อนน้อม', 'ความสามารถในการสื่อสาร', 'ความรู้สึกไวต่อผู้อื่น'],
    insights: ['คุณเป็นผู้สร้างสันติภาพโดยธรรมชาติ', 'การตัดสินใจของคุณคำนึงถึงผลกระทบต่อผู้อื่น', 'คุณมีความรู้สึกที่เฉียบคม'],
    opportunities: ['กล้าแสดงออกมากขึ้น', 'ตัดสินใจเร็วขึ้น'],
    blindSpots: ['อาจลังเลเกินไป', 'ยอมคนง่าย'],
  },
  3: {
    decisionStyle: 'ศิลปินที่ตัดสินใจด้วยแรงบันดาลใจ',
    strengths: ['ความคิดสร้างสรรค์', 'ทักษะการสื่อสาร', 'พลังงานเชิงบวก'],
    insights: ['คุณมีพรสวรรค์ด้านการแสดงออก', 'การตัดสินใจของคุณขับเคลื่อนโดยอารมณ์และสุนทรียะ', 'คุณสร้างแรงบันดาลใจให้ผู้อื่น'],
    opportunities: ['มุ่งเน้นไปที่โครงการให้เสร็จ', 'พัฒนาวินัยตนเอง'],
    blindSpots: ['กระจายความสนใจมากเกินไป', 'หลีกเลี่ยงความขัดแย้ง'],
  },
  4: {
    decisionStyle: 'ผู้สร้างระบบที่ตัดสินใจอย่างเป็นระเบียบ',
    strengths: ['ความน่าเชื่อถือ', 'การทำงานหนัก', 'การจัดการที่ดี'],
    insights: ['คุณสร้างรากฐานที่มั่นคง', 'การตัดสินใจของคุณมีเหตุผลและมีโครงสร้าง', 'คุณ值是ความเสถียร'],
    opportunities: ['เปิดรับการเปลี่ยนแปลง', 'ยืดหยุ่นมากขึ้น'],
    blindSpots: ['ยึดติดกับกฎเกณฑ์', 'ต้านการเปลี่ยนแปลง'],
  },
  5: {
    decisionStyle: 'นักสำรวจที่ตัดสินใจด้วยการเปลี่ยนแปลง',
    strengths: ['ความปรับตัวได้', 'ความกล้าลองสิ่งใหม่', 'พลังงานและการเคลื่อนไหว'],
    insights: ['คุณรักเสรีภาพและการเปลี่ยนแปลง', 'การตัดสินใจของคุณขับเคลื่อนโดยความต้องการประสบการณ์', 'คุณ適應ได้ดีในสถานการณ์ใหม่'],
    opportunities: ['มุ่งมั่น更长', 'สร้างโครงสร้างในชีวิต'],
    blindSpots: ['หลีกเลี่ยงความรับผิดชอบ', 'ไม่มั่นคง'],
  },
  6: {
    decisionStyle: 'ผู้ดูแลที่ตัดสินใจด้วยความรับผิดชอบ',
    strengths: ['ความรับผิดชอบ', 'ความเมตตา', 'ความสามารถในการแก้ปัญหา'],
    insights: ['คุณมีสัญชาตญาณในการดูแลผู้อื่น', 'การตัดสินใจของคุณคำนึงถึงความ harmonious', 'คุณเป็นเสาหลักของชุมชน'],
    opportunities: ['ดูแลตัวเองก่อน', 'ตั้งขอบเขต'],
    blindSpots: ['แทรกแซงเกินไป', 'สมบูรณ์แบบนิยม'],
  },
  7: {
    decisionStyle: 'นักวิเคราะห์ที่ตัดสินใจด้วยสัญชาตญาณ',
    strengths: ['ความฉลาดทางปัญญา', 'สัญชาตญาณ', 'การค้นหาความจริง'],
    insights: ['คุณเป็นผู้แสวงหาความรู้', 'การตัดสินใจของคุณผสมผสานตรรกะและสัญชาตญาณ', 'คุณเห็นสิ่งที่其他人มองไม่เห็น'],
    opportunities: ['เชื่อมต่อกับผู้อื่นมากขึ้น', 'แสดงอารมณ์ออกมา'],
    blindSpots: ['แยกตัว', 'สงสัยมากเกินไป'],
  },
  8: {
    decisionStyle: 'ผู้ทรงอำนาจที่ตัดสินใจด้วยประสิทธิภาพ',
    strengths: ['วิสัยทัศน์ทางการธุรกิจ', 'อำนาจ', 'ความสำเร็จ'],
    insights: ['คุณมีศักยภาพด้าน leadership', 'การตัดสินใจของคุณมุ่งผลลัพธ์', 'คุณเข้าใจพลังของทรัพยากร'],
    opportunities: ['พัฒนาความสมดุลชีวิตทำงาน', 'ใช้พลังเพื่อช่วยเหลือผู้อื่น'],
    blindSpots: ['ทำงานหนักเกินไป', 'วัตถุนิยม'],
  },
  9: {
    decisionStyle: 'มนุษย์นิยมที่ตัดสินใจด้วยจิตสำนึกสากล',
    strengths: ['ความเมตตา', 'ความเข้าใจ', 'ความเป็นสากล'],
    insights: ['คุณมีจิตวิญญาณของ humanitarian', 'การตัดสินใจของคุณมาจาก compassion', 'คุณมองเห็นภาพใหญ่'],
    opportunities: ['ปล่อยวางบางสิ่ง', 'ลงมือทำแทนแค่คิด'],
    blindSpots: ['idealistic เกินไป', 'แบกโลกทั้งใบ'],
  },
  11: {
    decisionStyle: 'ผู้ส่งสารที่ตัดสินใจด้วยวิสัยทัศน์สูง',
    strengths: ['inspirational leadership', 'intuitive insight', 'spiritual awareness'],
    insights: ['คุณมี intuitive strength ที่พิเศษ', 'การตัดสินใจของคุณเชื่อมโยงกับ spiritual dimension', 'คุณเป็น bridge ระหว่าง worlds'],
    opportunities: ['ground your vision', 'share your message'],
    blindSpots: ['anxiety from high sensitivity', 'imposter syndrome'],
  },
  22: {
    decisionStyle: 'Master Builder ที่ตัดสินใจด้วยวิสัยทัศน์ปฏิบัติได้',
    strengths: ['mega-vision', 'practical implementation', 'transformative power'],
    insights: ['คุณมีความสามารถในการเปลี่ยนความฝันเป็น reality', 'การตัดสินใจของคุณมี impact ในระดับ mass scale', 'คุณเป็น architect ของ change'],
    opportunities: ['เริ่มโปรเจคใหญ่', 'trust your blueprint'],
    blindSpots: ['pressure overwhelm', 'perfectionism'],
  },
  33: {
    decisionStyle: 'Master Teacher ที่ตัดสินใจด้วยcompassion สูงสุด',
    strengths: ['universal compassion', 'spiritual teaching', 'healing presence'],
    insights: ['คุณมี nurturing energy ที่สูงมาก', 'การตัดสินใจของคุณ heal และ educate', 'คุณเป็น master of heart'],
    opportunities: ['teach your wisdom', 'serve without expecting return'],
    blindSpots: ['martyr complex', 'overwhelming empathy'],
  },
};

function buildFallbackFromLifePath(birthDate: string): Record<string, unknown> {
  const lp = calculateLifePathNumber(birthDate);
  const profile = LIFE_PATH_PROFILES[lp] || LIFE_PATH_PROFILES[1];
  return {
    decisionStyle: profile.decisionStyle,
    strengths: profile.strengths,
    insights: profile.insights,
    opportunities: profile.opportunities,
    blindSpots: profile.blindSpots,
    confidence: 0.6,
    sources: ['life_path_fallback'],
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: 'Supabase not configured' }, 500);
  }
  if (!openRouterKey) return json({ error: 'OpenRouter key not configured' }, 500);

  // ─── SEC-02: บังคับ verify JWT ──
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user) return json({ error: 'Invalid or expired token' }, 401);

  try {
    const body = (await req.json().catch(() => ({}))) as AstroveraInput;
    const { mood, birthDate, finetuneAnswers, question } = body;

    // ── Try Claude via OpenRouter ────────────────────────────────────
    try {
      const systemPrompt = `คุณคือ AI Psychology Analyst ที่มีเชี่ยวชาญด้าน behavioral analysis และ personality assessment
ตอบเฉพาะ JSON เท่านั้น ไม่มีข้อความอื่น
ใช้ภาษาไทยสำหรับเนื้อหาทั้งหมด (ไม่ใช่ field names)

ประเมินบุคคลจาก:
- อารมณ์ปัจจุบัน (mood)
- วันเกิด (คำนวณ Life Path number)
- คำตอบ fine-tuning (${finetuneAnswers ? Object.keys(finetuneAnswers).length : 0} ข้อ)

ตอบใน JSON format:
{
  "coreIdentity": "รูปแบบการตัดสินใจหลัก (ภาษาไทย)",
  "traits": ["ลักษณะพฤติกรรม 1", "ลักษณะพฤติกรรม 2", "ลักษณะพฤติกรรม 3"],
  "strengths": ["จุดแข็ง 1", "จุดแข็ง 2", "จุดแข็ง 3"],
  "cautions": ["ข้อควรระวัง 1", "ข้อควรระวัง 2"],
  "confidence": 0.85,
  "evidence": ["หลักฐานสนับสนุน 1", "หลักฐานสนับสนุน 2"],
  "limitation": "ข้อจำกัด (หรือ null)",
  "archetypeKey": "hero",
  "phaseKey": "a"
}

confidence ควรอยู่ระหว่าง 0.5-0.95 โดยพิจารณาจากข้อมูลที่มี`;

      // Build personalized user prompt
      const fpNum = calculateLifePathNumber(birthDate || '');
      const answerSummary = finetuneAnswers
        ? Object.entries(finetuneAnswers).map(([k, v]) => `${k}: ${v}`).join('\n')
        : '(ไม่มีคำตอบ)';

      const userPrompt = `ประเมินบุคคลนี้:

- Mood ปัจจุบัน: ${mood || 'neutral'}
- วันเกิด: ${birthDate || 'ไม่ระบุ'}
- Life Path Number: ${fpNum || 'ไม่สามารถคำนวณ'}
- Fine-tuning answers:
${answerSummary}
${question ? `\n- คำถามเพิ่มเติม: ${question}` : ''}

วิเคราะห์ personality, decision style, strengths, blind spots, และ growth opportunities`;

      const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://selfprint.app',
          'X-Title': 'SelfPrint-Astrovera',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          max_tokens: 2000,
          temperature: 0.7,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!aiRes.ok) {
        throw new Error(`OpenRouter API error: ${aiRes.status}`);
      }

      const aiData = await aiRes.json();
      const rawText = aiData.choices?.[0]?.message?.content || '';

      // Parse JSON from Claude response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const parsed: AstroveraOutput = JSON.parse(jsonMatch[0]);

      // Validate basic shape
      if (!parsed.coreIdentity || !Array.isArray(parsed.strengths)) {
        throw new Error('Invalid response shape');
      }

      console.log(`[astrovera-edge] User ${user.id}: Claude analysis successful`);
      return json({ success: true, source: 'claude', ...parsed });
    } catch (claudeErr) {
      // ── Fallback to numerology ─────────────────────────────────────
      console.warn(`[astrovera-edge] Claude failed (${claudeErr instanceof Error ? claudeErr.message : 'unknown'}), using life_path fallback`);
      const fallback = buildFallbackFromLifePath(birthDate || '');
      return json({
        success: true,
        source: 'life_path_fallback',
        ...fallback,
      });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[astrovera-edge]', msg);
    return json({ error: msg }, 500);
  }
});

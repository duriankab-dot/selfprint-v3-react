/**
 * Vercel API Function: /api/coach
 *
 * Phase 5.5: Decision Support ("Ask Coach") — backend only, not yet wired
 * to any UI (see docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md, 5.5).
 *
 * บทบาท: รับคำถามเชิงการตัดสินใจจาก user ที่ login แล้ว → รวมบริบทที่มีจริง
 * (Life Path profile จากวันเกิด + pattern insight จาก decision_log ของคนนั้น
 * ถ้ามีข้อมูลพอ) → เรียก Claude ครั้งเดียว (ไม่ใช่ 5 agent วิ่งขนานแบบ
 * astrovera-v2's orchestrator — ดูเหตุผลใน HANDOFF: agent พวกนั้นเป็นแค่
 * prompt wrapper บางๆ ไม่มี logic พิเศษที่ต้องแยก call) → ตอบกลับเป็นข้อความ
 *
 * ต้อง login จริง (Authorization: Bearer <token>) เพราะต้องใช้ user.id ที่
 * verify แล้วไปอ่าน decision_log ของคนนั้นเอง — ไม่รับ userId จาก client
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin, verifyUser } from './utils/verify-user';
import { safetyCheck, SAFETY_SYSTEM_DIRECTIVE } from './utils/safety';
import { buildSystemPrompt, type Mood } from './utils/prompt-builder';
import { calculateInitialDisciplines, getLifePathProfile } from '../src/lib/astrology';
import { detectPatterns, type TrendPoint } from '../src/lib/patternDetection';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MOODS = ['stressed', 'confused', 'confident', 'drained', 'ready', 'reflective'];

interface CoachRequestBody {
  birthDate: string;
  mood: string;
  question: string;
}

interface CoachResponse {
  answer: string;
  contextUsed: {
    decisionStyle: string;
    patternsFound: number;
  };
  timestamp: string;
}

// เก็บ IP → count เหมือน api/nova.ts (ไม่มี util กลางให้ใช้ร่วมกัน แต่ละ
// endpoint มี rate limiter ของตัวเองอยู่แล้วในโค้ดเบสนี้)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  limit.count++;
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  return limit.count <= maxRequests;
}

function validateBody(body: Partial<CoachRequestBody>): { valid: boolean; error?: string } {
  if (!body.birthDate || typeof body.birthDate !== 'string') {
    return { valid: false, error: 'birthDate จำเป็นต้องมี' };
  }
  if (!body.mood || !MOODS.includes(body.mood)) {
    return { valid: false, error: `mood "${body.mood}" ไม่ถูกต้อง` };
  }
  if (!body.question || typeof body.question !== 'string' || !body.question.trim()) {
    return { valid: false, error: 'question จำเป็นต้องมี' };
  }
  return { valid: true };
}

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'ใช้ POST เท่านั้น' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'RATE_LIMIT',
      message: 'ใช้บริการเยอะเกินไป ลองใหม่ในอีก 1 นาที',
      retryAfter: 60,
    });
  }

  if (!supabaseAdmin) {
    console.error('[Coach] Supabase ไม่พร้อม');
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Supabase ไม่พร้อม' });
  }

  const user = await verifyUser(req.headers.authorization);
  if (!user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'ต้อง login ก่อน (Authorization header ไม่ถูกต้องหรือหมดอายุ)',
    });
  }

  const body: Partial<CoachRequestBody> = req.body || {};
  const validation = validateBody(body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const safety = safetyCheck(body.question);
  if (!safety.safe) {
    console.log(`[Coach] Safety redirect: category=${safety.category}`);
    const result: CoachResponse = {
      answer: safety.redirectMessage || '',
      contextUsed: { decisionStyle: '', patternsFound: 0 },
      timestamp: new Date().toISOString(),
    };
    return res.status(200).json(result);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[Coach] ANTHROPIC_API_KEY หาย');
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'ตั้งค่า API ไม่ถูกต้อง' });
  }

  try {
    // บริบทที่ 1: Life Path profile จากวันเกิด (deterministic, ของจริงเสมอ)
    const disciplines = calculateInitialDisciplines(body.birthDate);
    const lifePath = getLifePathProfile(disciplines.lifePathNumber);

    // บริบทที่ 2: pattern insight จาก decision_log ของ user คนนี้ (ถ้ามีข้อมูลพอ
    // — detectPatterns() เองมี MIN_DATA_POINTS threshold กันไม่ให้ fabricate
    // "pattern" จาก user ใหม่ที่ยังไม่มีประวัติ) รวม hub/mood ด้วยเพื่อให้
    // detectPatterns() ทำ mood/hub correlation ได้ ไม่ใช่แค่ trend ตามเวลา
    const { data: logRows } = await supabaseAdmin
      .from('decision_log')
      .select('created_at, autonomy_level, confidence, hub, mood')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(200);

    const patterns = detectPatterns((logRows || []) as TrendPoint[]);

    const contextBlock = [
      `รูปแบบการตัดสินใจพื้นฐาน (จาก Life Path Number): ${lifePath.decisionStyle}`,
      `จุดแข็ง: ${lifePath.strengths.join(', ')}`,
      `จุดที่ควรระวัง: ${lifePath.blindSpots.join(', ')}`,
      patterns.length > 0
        ? `รูปแบบที่สังเกตได้จากประวัติการใช้งานจริง: ${patterns.map((p) => p.message).join(' / ')}`
        : 'ยังไม่มีรูปแบบจากประวัติการใช้งานที่ชัดเจนพอ (ข้อมูลยังน้อยเกินไป)',
    ].join('\n');

    const systemPrompt =
      buildSystemPrompt('decision', body.mood as Mood, 50, undefined) +
      `\n\nบริบทของคนที่กำลังคุยด้วย:\n${contextBlock}\n\nใช้บริบทนี้ประกอบคำตอบเท่าที่เกี่ยวข้องจริง ห้ามอ้างข้อมูลที่ไม่มีอยู่ในบริบทนี้` +
      SAFETY_SYSTEM_DIRECTIVE;

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL_ID || 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: body.question! }],
    });

    const answer = response.content[0].type === 'text' ? response.content[0].text : '';

    const result: CoachResponse = {
      answer,
      contextUsed: { decisionStyle: lifePath.decisionStyle, patternsFound: patterns.length },
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('[Coach API Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
      return res.status(401).json({ error: 'AUTH_FAILED', message: 'Claude API Key ไม่ถูกต้อง' });
    }
    if (errorMessage.includes('429')) {
      return res.status(429).json({
        error: 'RATE_LIMIT',
        message: 'Claude API เกินขีด ลองใหม่ในไม่ช้า',
        retryAfter: 60,
      });
    }
    return res.status(500).json({ error: 'API_ERROR', message: errorMessage });
  }
};

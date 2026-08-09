/**
 * Vercel API Function: /api/intelligence
 *
 * Phase 5.2: Psychology Integration.
 *
 * บทบาท: รับข้อมูล onboarding (mood, birthDate, finetuneAnswers) → เรียก
 * Astrovera Psychology knowledge module (vendored ที่
 * src/lib/astrovera-brain/psychology, ดู docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md)
 * ผ่าน Claude → ส่ง AnalysisResponse กลับในรูปแบบเดียวกับที่ Onboarding.tsx
 * ใช้อยู่แล้ว (decisionStyle, strengths, insights, opportunities, blindSpots)
 *
 * ไม่มี ASTROVERA_API_KEY แยก — ใช้ ANTHROPIC_API_KEY เดียวกับ /api/nova
 * เพราะ Astrovera knowledge module เรียก Claude ตรงๆ เหมือนกัน (ดูการตัดสินใจ
 * ใน docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md ข้อ 2)
 *
 * ล้มเหลวยังไงก็ตาม (ไม่มี key, network error, Claude ตอบ JSON ผิด schema)
 * → fallback ไปที่ safeTransformAnalysisResponse()/buildFallbackResponse()
 * เสมอ (Life Path numerology) ไม่เคยส่ง 500 เปล่าๆ กลับไปให้ frontend
 *
 * ยังไม่ได้เชื่อมกับ Onboarding.tsx — endpoint นี้ยืนอิสระ ทดสอบผ่านแล้วค่อยเชื่อม
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import {
  buildAnalysisRequest,
  safeTransformAnalysisResponse,
  buildFallbackResponse,
} from '../src/lib/astrovera-adapter';
import type { AnalysisRequest, AnalysisResponse } from '../src/lib/types/astrovera';
import { buildPrompt, validate } from '../src/lib/astrovera-brain/psychology/index.js';
import { safetyCheck, SAFETY_SYSTEM_DIRECTIVE } from './utils/safety';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MOODS = ['stressed', 'confused', 'confident', 'drained', 'ready', 'reflective'];

interface IntelligenceRequestBody {
  mood: string;
  birthDate: string;
  finetuneAnswers?: Record<string, string>;
  question?: string;
}

function validateBody(body: Partial<IntelligenceRequestBody>): { valid: boolean; error?: string } {
  if (!body.mood || !MOODS.includes(body.mood)) {
    return { valid: false, error: `mood "${body.mood}" ไม่ถูกต้อง` };
  }
  if (!body.birthDate || typeof body.birthDate !== 'string') {
    return { valid: false, error: 'birthDate จำเป็นต้องมี' };
  }
  return { valid: true };
}

/** ดึง JSON block แรกจากคำตอบของ Claude (เผื่อมีข้อความอื่นแทรกมาด้วย) */
function extractJson(raw: string): unknown {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'ใช้ POST เท่านั้น' });
  }

  const body: Partial<IntelligenceRequestBody> = req.body || {};
  const validation = validateBody(body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const analysisRequest: AnalysisRequest = {
    mood: body.mood!,
    birthDate: body.birthDate!,
    finetuneAnswers: body.finetuneAnswers || {},
    question: body.question ?? null,
  };

  // Safety check — เช็คช่อง question (free text ช่องเดียวใน request นี้)
  // finetuneAnswers เป็นคำตอบจากตัวเลือกที่กำหนดไว้แล้ว ไม่ใช่ free text
  // AnalysisResponse ไม่มีช่องสำหรับข้อความสนทนา (เป็น structured blueprint
  // ไม่ใช่ chat reply) ดังนั้นแค่กันไม่ให้ question ที่ไม่ปลอดภัยถูกส่งเข้า
  // Claude เลย แล้วตอบด้วย fallback ตามปกติ — ไม่ต่างจากกรณีไม่มี API key
  const safety = safetyCheck(analysisRequest.question);
  if (!safety.safe) {
    console.log(`[Intelligence] Safety block: category=${safety.category} — skipping Claude call`);
    const fallback: AnalysisResponse = buildFallbackResponse(analysisRequest);
    return res.status(200).json(fallback);
  }

  // ไม่มี API key → fallback ทันที ไม่ต้องพยายามเรียก Claude
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[Intelligence] ANTHROPIC_API_KEY หาย — ใช้ fallback');
    const fallback: AnalysisResponse = buildFallbackResponse(analysisRequest);
    return res.status(200).json(fallback);
  }

  try {
    const psychologyInput = buildAnalysisRequest(analysisRequest);
    const prompt = buildPrompt({ exampleCount: 1 }) + SAFETY_SYSTEM_DIRECTIVE;

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL_ID || 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: prompt,
      messages: [{ role: 'user', content: JSON.stringify(psychologyInput) }],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = extractJson(rawText);

    // log เต็มรูปแบบ (errors ต่างๆ) เผื่อ debug — ไม่ block การ fallback
    const schemaCheck = validate(parsed);
    if (!schemaCheck.ok) {
      console.warn('[Intelligence] Claude response ไม่ตรง schema:', schemaCheck.errors);
    }

    const result = safeTransformAnalysisResponse(parsed, analysisRequest);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Intelligence API Error]', error);
    const fallback: AnalysisResponse = buildFallbackResponse(analysisRequest);
    return res.status(200).json(fallback);
  }
};

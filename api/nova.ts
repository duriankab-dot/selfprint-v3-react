/**
 * Vercel API Function: /api/nova
 *
 * บทบาท: รับคำถามจาก React → เรียก Claude API → ส่งคำตอบกลับ
 *
 * ลักษณะการใช้:
 * 1. Frontend (React) ส่ง POST ไปที่ /api/nova
 * 2. Function นี้ประมวลผล + เรียก Claude
 * 3. ส่งคำตอบกลับไปที่ Frontend
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import {
  buildSystemPrompt,
  type Hub,
  type Mood,
} from './utils/prompt-builder';

// ตั้งค่า Claude API Client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Type definition: สิ่งที่ Frontend ส่งมา
 */
interface NovaRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  hub: Hub;
  mood: Mood;
  autonomy: number; // 0-100
  userProfile?: {
    name?: string;
    scienceScore?: number;
  };
}

/**
 * Type definition: สิ่งที่เราส่งกลับไป
 */
interface NovaResponse {
  content: string;
  conversationId: string;
  tokensUsed: number;
  timestamp: string;
}

/**
 * Rate Limiter — ป้องกันใครใช้เกินไป
 *
 * เก็บว่า IP ไหนเรียก /api/nova กี่ครั้ง
 * ถ้าเกินขีด (เช่น 100 ครั้ง/นาที) → ปฏิเสธ
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    // ยังไม่มีหรือหมดเวลา → ให้ใหม่
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + 60000, // 1 นาที
    });
    return true;
  }

  limit.count++;
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

  if (limit.count > maxRequests) {
    return false; // เกินขีด
  }

  return true;
}

/**
 * Utility: เช็ค Hub และ Mood ว่าถูกต้องไหม
 */
function validateInput(hub: any, mood: any): { valid: boolean; error?: string } {
  const validHubs = [
    'identity',
    'decision',
    'relationship',
    'career',
    'health',
    'money',
    'ai-twin',
    'learning',
    'creativity',
    'spirituality',
    'impact',
    'activities',
  ];
  const validMoods = ['stressed', 'confused', 'confident', 'drained', 'ready', 'reflective'];

  if (!validHubs.includes(hub)) {
    return { valid: false, error: `Hub "${hub}" ไม่ถูกต้อง` };
  }
  if (!validMoods.includes(mood)) {
    return { valid: false, error: `Mood "${mood}" ไม่ถูกต้อง` };
  }

  return { valid: true };
}

/**
 * Main Handler: รับ request และส่ง response
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

  // 2. ตรวจสอบ Rate Limit
  const clientIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'RATE_LIMIT',
      message: 'ใช้บริการเยอะเกินไป ลองใหม่ในอีก 1 นาที',
      retryAfter: 60,
    });
  }

  try {
    // 3. ตรวจสอบ API Key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY หาย');
      return res.status(500).json({ error: 'ตั้งค่า API ไม่ถูกต้อง' });
    }

    // 4. Parse request body
    const body: NovaRequest = req.body;

    if (!body.hub || !body.mood || !body.messages) {
      return res.status(400).json({
        error: 'ข้อมูลไม่ครบ',
        required: ['hub', 'mood', 'messages'],
      });
    }

    // 5. Validate hub and mood
    const validation = validateInput(body.hub, body.mood);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // 6. สร้าง System Prompt
    const systemPrompt = buildSystemPrompt(
      body.hub as Hub,
      body.mood as Mood,
      body.autonomy || 50,
      body.userProfile?.name
    );

    // 7. เรียก Claude API
    console.log(`[Nova] Hub: ${body.hub}, Mood: ${body.mood}, Messages: ${body.messages.length}`);

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL_ID || 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: body.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // 8. ดึงคำตอบ
    const novaResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    // 9. ส่ง Response
    const result: NovaResponse = {
      content: novaResponse,
      conversationId: `conv-${Date.now()}`,
      tokensUsed: response.usage.output_tokens + response.usage.input_tokens,
      timestamp: new Date().toISOString(),
    };

    // เพิ่ม CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');

    return res.status(200).json(result);
  } catch (error) {
    console.error('[Nova API Error]', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // ตรวจเช็ค error type
    if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
      return res.status(401).json({
        error: 'AUTH_FAILED',
        message: 'Claude API Key ไม่ถูกต้อง',
      });
    }

    if (errorMessage.includes('429')) {
      return res.status(429).json({
        error: 'RATE_LIMIT',
        message: 'Claude API เกินขีด ลองใหม่ในไม่ช่วง',
        retryAfter: 60,
      });
    }

    return res.status(500).json({
      error: 'API_ERROR',
      message: errorMessage,
    });
  }
};

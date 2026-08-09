/**
 * intelligence.test.ts
 *
 * Tests for /api/intelligence (Phase 5.2). Mocks the Anthropic SDK — no
 * real network call, no API cost. Verifies the plumbing (request
 * building → Claude call → parse → validate → transform/fallback),
 * not Claude's actual output quality (that needs a real deployed test).
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const createMock = vi.fn();

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: createMock };
    },
  };
});

function makeReqRes(body: unknown, method = 'POST') {
  const req = { method, body } as VercelRequest;
  const res: Partial<VercelResponse> & { _status?: number; _json?: unknown } = {
    setHeader: vi.fn(),
    status(code: number) {
      this._status = code;
      return this as VercelResponse;
    },
    json(payload: unknown) {
      this._json = payload;
      return this as VercelResponse;
    },
    end() {
      return this as VercelResponse;
    },
  };
  return { req, res: res as VercelResponse & { _status?: number; _json?: unknown } };
}

const validBody = {
  mood: 'ready',
  birthDate: '1990-01-15',
  finetuneAnswers: { q1: 'ใช้เหตุผล' },
};

describe('POST /api/intelligence', () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    createMock.mockReset();
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  afterAll(() => {
    process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it('rejects non-POST methods', async () => {
    const handler = (await import('../intelligence')).default;
    const { req, res } = makeReqRes(undefined, 'GET');
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it('rejects an invalid mood', async () => {
    const handler = (await import('../intelligence')).default;
    const { req, res } = makeReqRes({ ...validBody, mood: 'not-a-mood' });
    await handler(req, res);
    expect(res._status).toBe(400);
  });

  it('rejects a missing birthDate', async () => {
    const handler = (await import('../intelligence')).default;
    const { req, res } = makeReqRes({ mood: 'ready' });
    await handler(req, res);
    expect(res._status).toBe(400);
  });

  it('falls back to Life Path when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const handler = (await import('../intelligence')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);
    expect(res._status).toBe(200);
    expect((res._json as { sources: string[] }).sources).toEqual(['life_path']);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('transforms a valid Claude/Psychology response', async () => {
    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            coreIdentity: 'นักปราชญ์ที่กำลังอยู่ในช่วงเปลี่ยนผ่าน',
            traits: ['ต้องการเข้าใจอย่างรอบด้าน'],
            strengths: ['วิเคราะห์รอบด้าน'],
            cautions: ['รอข้อมูลนานเกินไป'],
            confidence: 0.8,
            evidence: ['Archetype: Sage'],
            limitation: null,
            archetypeKey: 'sage',
            phaseKey: 'd',
          }),
        },
      ],
    });

    const handler = (await import('../intelligence')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);

    expect(res._status).toBe(200);
    const json = res._json as { sources: string[]; decisionStyle: string; confidence: number };
    expect(json.sources).toEqual(['psychology']);
    expect(json.decisionStyle).toBe('นักปราชญ์ที่กำลังอยู่ในช่วงเปลี่ยนผ่าน');
    expect(json.confidence).toBe(0.8);
  });

  it('falls back to Life Path when Claude returns malformed JSON', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'ขอโทษค่ะ ตอบไม่ได้ตอนนี้' }],
    });

    const handler = (await import('../intelligence')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);

    expect(res._status).toBe(200);
    expect((res._json as { sources: string[] }).sources).toEqual(['life_path']);
  });

  it('falls back to Life Path when the Anthropic call throws', async () => {
    createMock.mockRejectedValueOnce(new Error('network error'));

    const handler = (await import('../intelligence')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);

    expect(res._status).toBe(200);
    expect((res._json as { sources: string[] }).sources).toEqual(['life_path']);
  });

  it('handles CORS preflight', async () => {
    const handler = (await import('../intelligence')).default;
    const { req, res } = makeReqRes(undefined, 'OPTIONS');
    await handler(req, res);
    expect(res._status).toBe(200);
  });

  it('blocks an unsafe question and never calls Claude (5.3.5 Safety Layer)', async () => {
    const handler = (await import('../intelligence')).default;
    const { req, res } = makeReqRes({ ...validBody, question: 'ตอนนี้ไม่อยากมีชีวิตอยู่แล้ว' });
    await handler(req, res);

    expect(res._status).toBe(200);
    expect((res._json as { sources: string[] }).sources).toEqual(['life_path']);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('allows a normal question through to Claude', async () => {
    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            coreIdentity: 'นักปราชญ์ที่กำลังอยู่ในช่วงเปลี่ยนผ่าน',
            traits: ['ต้องการเข้าใจอย่างรอบด้าน'],
            strengths: ['วิเคราะห์รอบด้าน'],
            cautions: ['รอข้อมูลนานเกินไป'],
            confidence: 0.8,
            evidence: ['Archetype: Sage'],
            limitation: null,
            archetypeKey: 'sage',
            phaseKey: 'd',
          }),
        },
      ],
    });

    const handler = (await import('../intelligence')).default;
    const { req, res } = makeReqRes({ ...validBody, question: 'ควรวางแผนการเงินยังไงดี' });
    await handler(req, res);

    expect(res._status).toBe(200);
    expect((res._json as { sources: string[] }).sources).toEqual(['psychology']);
    expect(createMock).toHaveBeenCalled();
  });
});

/**
 * coach.test.ts
 *
 * Tests for /api/coach (Phase 5.5). Mocks the Anthropic SDK and the
 * verify-user/Supabase admin module — no real network, no real auth.
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const createMock = vi.fn();
const verifyUserMock = vi.fn();
const limitMock = vi.fn();

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: createMock };
    },
  };
});

vi.mock('../utils/verify-user', () => {
  return {
    verifyUser: (...args: unknown[]) => verifyUserMock(...args),
    supabaseAdmin: {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: (...args: unknown[]) => limitMock(...args),
            }),
          }),
        }),
      }),
    },
  };
});

function makeReqRes(body: unknown, method = 'POST', authorization = 'Bearer valid-token') {
  const req = {
    method,
    body,
    headers: { authorization },
    socket: { remoteAddress: '127.0.0.1' },
  } as unknown as VercelRequest;
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
  birthDate: '1990-01-15',
  mood: 'ready',
  question: 'ควรเปลี่ยนงานตอนนี้ไหม',
};

describe('POST /api/coach', () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    createMock.mockReset();
    verifyUserMock.mockReset();
    limitMock.mockReset();
    limitMock.mockResolvedValue({ data: [] });
    verifyUserMock.mockResolvedValue({ id: 'user-123', email: 'a@b.com' });
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  afterAll(() => {
    process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it('rejects non-POST methods', async () => {
    const handler = (await import('../coach')).default;
    const { req, res } = makeReqRes(undefined, 'GET');
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it('handles CORS preflight', async () => {
    const handler = (await import('../coach')).default;
    const { req, res } = makeReqRes(undefined, 'OPTIONS');
    await handler(req, res);
    expect(res._status).toBe(200);
  });

  it('rejects when not authenticated', async () => {
    verifyUserMock.mockResolvedValueOnce(null);
    const handler = (await import('../coach')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('rejects a missing birthDate', async () => {
    const handler = (await import('../coach')).default;
    const { req, res } = makeReqRes({ ...validBody, birthDate: undefined });
    await handler(req, res);
    expect(res._status).toBe(400);
  });

  it('rejects an invalid mood', async () => {
    const handler = (await import('../coach')).default;
    const { req, res } = makeReqRes({ ...validBody, mood: 'not-a-mood' });
    await handler(req, res);
    expect(res._status).toBe(400);
  });

  it('rejects a missing question', async () => {
    const handler = (await import('../coach')).default;
    const { req, res } = makeReqRes({ ...validBody, question: '' });
    await handler(req, res);
    expect(res._status).toBe(400);
  });

  it('blocks an unsafe question and never calls Claude', async () => {
    const handler = (await import('../coach')).default;
    const { req, res } = makeReqRes({ ...validBody, question: 'ไม่อยากมีชีวิตอยู่แล้ว' });
    await handler(req, res);

    expect(res._status).toBe(200);
    expect((res._json as { answer: string }).answer).toContain('1323');
    expect(createMock).not.toHaveBeenCalled();
  });

  it('answers a normal question, including pattern context when available', async () => {
    limitMock.mockResolvedValueOnce({
      data: Array.from({ length: 8 }, (_, i) => ({
        created_at: new Date(Date.now() - (8 - i) * 86400000).toISOString(),
        autonomy_level: i < 4 ? 30 : 60,
        confidence: 0.5,
      })),
    });
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'คำแนะนำจาก Nova...' }],
    });

    const handler = (await import('../coach')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);

    expect(res._status).toBe(200);
    const json = res._json as { answer: string; contextUsed: { patternsFound: number } };
    expect(json.answer).toBe('คำแนะนำจาก Nova...');
    expect(json.contextUsed.patternsFound).toBeGreaterThan(0);
    expect(createMock).toHaveBeenCalled();
  });

  it('answers normally with zero patterns when there is no history yet', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'คำแนะนำจาก Nova...' }],
    });

    const handler = (await import('../coach')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);

    expect(res._status).toBe(200);
    const json = res._json as { contextUsed: { patternsFound: number } };
    expect(json.contextUsed.patternsFound).toBe(0);
  });

  it('returns 500 when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const handler = (await import('../coach')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);
    expect(res._status).toBe(500);
  });

  it('returns 500 when the Anthropic call throws', async () => {
    createMock.mockRejectedValueOnce(new Error('network error'));
    const handler = (await import('../coach')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);
    expect(res._status).toBe(500);
  });
});

/**
 * autonomy-log.test.ts
 *
 * Tests for /api/autonomy-log (hardened 2026-08-09 — was previously
 * unauthenticated and trusted a client-supplied user_id, a real
 * vulnerability since no caller wired it in until now).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const verifyUserMock = vi.fn();
const insertMock = vi.fn();
const singleMock = vi.fn();

vi.mock('../utils/verify-user', () => {
  return {
    verifyUser: (...args: unknown[]) => verifyUserMock(...args),
    supabaseAdmin: {
      from: () => ({
        insert: (...args: unknown[]) => {
          insertMock(...args);
          return { select: () => ({ single: singleMock }) };
        },
      }),
    },
  };
});

function makeReqRes(body: unknown, method = 'POST', authorization = 'Bearer valid-token') {
  const req = { method, body, headers: { authorization } } as unknown as VercelRequest;
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
  hub: 'decision',
  mood: 'ready',
  autonomy_level: 60,
  confidence: 0.6,
  hesitation: 0.5,
  response_time_ms: 1200,
  message_length: 20,
  response_length: 80,
};

describe('POST /api/autonomy-log', () => {
  beforeEach(() => {
    verifyUserMock.mockReset();
    insertMock.mockReset();
    singleMock.mockReset();
    verifyUserMock.mockResolvedValue({ id: 'user-123', email: 'a@b.com' });
    singleMock.mockResolvedValue({ data: { id: 'log-1' }, error: null });
  });

  it('rejects non-POST methods', async () => {
    const handler = (await import('../autonomy-log.js')).default;
    const { req, res } = makeReqRes(undefined, 'GET');
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it('handles CORS preflight', async () => {
    const handler = (await import('../autonomy-log.js')).default;
    const { req, res } = makeReqRes(undefined, 'OPTIONS');
    await handler(req, res);
    expect(res._status).toBe(200);
  });

  it('rejects when not authenticated', async () => {
    verifyUserMock.mockResolvedValueOnce(null);
    const handler = (await import('../autonomy-log.js')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);
    expect(res._status).toBe(401);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('rejects a missing hub', async () => {
    const handler = (await import('../autonomy-log.js')).default;
    const { req, res } = makeReqRes({ ...validBody, hub: '' });
    await handler(req, res);
    expect(res._status).toBe(400);
  });

  it('rejects an out-of-range autonomy_level', async () => {
    const handler = (await import('../autonomy-log.js')).default;
    const { req, res } = makeReqRes({ ...validBody, autonomy_level: 150 });
    await handler(req, res);
    expect(res._status).toBe(400);
  });

  it('ignores any client-supplied user_id and uses the verified JWT user instead', async () => {
    const handler = (await import('../autonomy-log.js')).default;
    const { req, res } = makeReqRes({ ...validBody, user_id: 'someone-elses-id' });
    await handler(req, res);

    expect(res._status).toBe(200);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-123' })
    );
  });

  it('inserts successfully and returns the log id', async () => {
    const handler = (await import('../autonomy-log.js')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);

    expect(res._status).toBe(200);
    expect((res._json as { success: boolean; logId?: string }).success).toBe(true);
    expect((res._json as { logId?: string }).logId).toBe('log-1');
  });

  it('returns 500 when the insert errors', async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: { message: 'db down' } });
    const handler = (await import('../autonomy-log.js')).default;
    const { req, res } = makeReqRes(validBody);
    await handler(req, res);
    expect(res._status).toBe(500);
  });
});

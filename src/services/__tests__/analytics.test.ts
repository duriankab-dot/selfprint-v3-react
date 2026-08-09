import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock('../supabase-service', () => ({
  supabase: { from: (...args: unknown[]) => fromMock(...args) },
}));

import { logEvent } from '../analytics';

describe('logEvent', () => {
  beforeEach(() => {
    insertMock.mockReset();
    fromMock.mockClear();
  });

  it('does nothing when there is no userId', async () => {
    const result = await logEvent(null, 'hub_transition', { from: 'identity', to: 'career' });
    expect(result).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('does nothing when userId is an empty string', async () => {
    const result = await logEvent('', 'mood_change', {});
    expect(result).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('inserts an event row when userId is present', async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    const result = await logEvent('user-1', 'hub_transition', { from: 'identity', to: 'career' });

    expect(result).toBe(true);
    expect(fromMock).toHaveBeenCalledWith('analytics_events');
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'user-1',
      event_type: 'hub_transition',
      event_data: { from: 'identity', to: 'career' },
    });
  });

  it('returns false and does not throw when the insert errors', async () => {
    insertMock.mockResolvedValueOnce({ error: { message: 'boom' } });
    const result = await logEvent('user-1', 'feedback', { type: 'helpful' });
    expect(result).toBe(false);
  });

  it('returns false and does not throw when insert rejects', async () => {
    insertMock.mockRejectedValueOnce(new Error('network down'));
    const result = await logEvent('user-1', 'archetype_accuracy', { accuracy: 85 });
    expect(result).toBe(false);
  });

  it('defaults event_data to an empty object', async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await logEvent('user-1', 'mood_change');
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ event_data: {} })
    );
  });
});

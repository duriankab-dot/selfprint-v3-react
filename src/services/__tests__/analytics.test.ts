import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertMock = vi.fn();
const orderMock = vi.fn();
const eqMock = vi.fn(() => ({ order: orderMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ insert: insertMock, select: selectMock }));

vi.mock('../supabase-service', () => ({
  supabase: { from: (...args: unknown[]) => fromMock(...args) },
}));

import { logEvent, getAnalyticsSummary } from '../analytics';

describe('logEvent', () => {
  beforeEach(() => {
    insertMock.mockReset();
    orderMock.mockReset();
    eqMock.mockClear();
    selectMock.mockClear();
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

describe('getAnalyticsSummary', () => {
  beforeEach(() => {
    insertMock.mockReset();
    orderMock.mockReset();
    eqMock.mockClear();
    selectMock.mockClear();
    fromMock.mockClear();
  });

  it('returns null when there is no userId', async () => {
    const result = await getAnalyticsSummary(null);
    expect(result).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('returns an empty summary when there are no events yet', async () => {
    orderMock.mockResolvedValueOnce({ data: [], error: null });
    const result = await getAnalyticsSummary('user-1');
    expect(result).toEqual({
      totalEvents: 0,
      hubVisitCounts: {},
      topHub: null,
      moodChangeCount: 0,
      feedback: { helpful: 0, unhelpful: 0 },
      latestArchetypeAccuracy: null,
    });
  });

  it('returns null when the query errors', async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    const result = await getAnalyticsSummary('user-1');
    expect(result).toBeNull();
  });

  it('aggregates hub visits, mood changes, feedback, and the latest archetype accuracy', async () => {
    orderMock.mockResolvedValueOnce({
      data: [
        { event_type: 'hub_transition', event_data: { from: 'identity', to: 'career' }, created_at: '2026-08-01' },
        { event_type: 'hub_transition', event_data: { from: 'career', to: 'career' }, created_at: '2026-08-02' },
        { event_type: 'hub_transition', event_data: { from: 'career', to: 'money' }, created_at: '2026-08-03' },
        { event_type: 'mood_change', event_data: { from: 'ready', to: 'stressed' }, created_at: '2026-08-01' },
        { event_type: 'mood_change', event_data: { from: 'stressed', to: 'reflective' }, created_at: '2026-08-02' },
        { event_type: 'feedback', event_data: { type: 'helpful' }, created_at: '2026-08-01' },
        { event_type: 'feedback', event_data: { type: 'helpful' }, created_at: '2026-08-02' },
        { event_type: 'feedback', event_data: { type: 'unhelpful' }, created_at: '2026-08-03' },
        { event_type: 'archetype_accuracy', event_data: { accuracyLevel: 60 }, created_at: '2026-08-01' },
        { event_type: 'archetype_accuracy', event_data: { accuracyLevel: 85 }, created_at: '2026-08-02' },
      ],
      error: null,
    });

    const result = await getAnalyticsSummary('user-1');

    expect(result).toEqual({
      totalEvents: 10,
      hubVisitCounts: { career: 2, money: 1 },
      topHub: 'career',
      moodChangeCount: 2,
      feedback: { helpful: 2, unhelpful: 1 },
      latestArchetypeAccuracy: 85,
    });
  });

  it('does not throw when the query rejects', async () => {
    orderMock.mockRejectedValueOnce(new Error('network down'));
    const result = await getAnalyticsSummary('user-1');
    expect(result).toBeNull();
  });
});

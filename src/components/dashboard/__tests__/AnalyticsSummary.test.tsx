import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const useAuthMock = vi.fn();
const getAnalyticsSummaryMock = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('@/services/analytics', () => ({
  getAnalyticsSummary: (...args: unknown[]) => getAnalyticsSummaryMock(...args),
}));

import AnalyticsSummary from '../AnalyticsSummary';

const SESSION = { access_token: 'tok', user: { id: 'user-1' } };

describe('AnalyticsSummary', () => {
  beforeEach(() => {
    getAnalyticsSummaryMock.mockReset();
  });

  it('renders nothing when there is no session', () => {
    useAuthMock.mockReturnValue({ session: null });
    const { container } = render(<AnalyticsSummary />);
    expect(container.firstChild).toBeNull();
    expect(getAnalyticsSummaryMock).not.toHaveBeenCalled();
  });

  it('renders nothing when there are zero events', async () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    getAnalyticsSummaryMock.mockResolvedValueOnce({
      totalEvents: 0,
      hubVisitCounts: {},
      topHub: null,
      moodChangeCount: 0,
      feedback: { helpful: 0, unhelpful: 0 },
      latestArchetypeAccuracy: null,
    });

    const { container } = render(<AnalyticsSummary />);
    await waitFor(() => expect(getAnalyticsSummaryMock).toHaveBeenCalledWith('user-1'));
    expect(container.firstChild).toBeNull();
  });

  it('renders the summary cards when there is data', async () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    getAnalyticsSummaryMock.mockResolvedValueOnce({
      totalEvents: 10,
      hubVisitCounts: { career: 3, money: 1 },
      topHub: 'career',
      moodChangeCount: 4,
      feedback: { helpful: 3, unhelpful: 1 },
      latestArchetypeAccuracy: 85,
    });

    render(<AnalyticsSummary />);

    await waitFor(() => {
      expect(screen.getByText(/อาชีพ/)).toBeInTheDocument();
    });
    expect(screen.getByText('4')).toBeInTheDocument(); // mood changes
    expect(screen.getByText('75%')).toBeInTheDocument(); // 3/4 helpful
    expect(screen.getByText('85%')).toBeInTheDocument(); // latest accuracy
  });

  it('omits the feedback card when there is no feedback yet', async () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    getAnalyticsSummaryMock.mockResolvedValueOnce({
      totalEvents: 2,
      hubVisitCounts: { identity: 2 },
      topHub: 'identity',
      moodChangeCount: 0,
      feedback: { helpful: 0, unhelpful: 0 },
      latestArchetypeAccuracy: null,
    });

    render(<AnalyticsSummary />);

    await waitFor(() => {
      expect(screen.getByText(/ตัวตน/)).toBeInTheDocument();
    });
    expect(screen.queryByText('คำตอบที่เป็นประโยชน์')).not.toBeInTheDocument();
  });
});

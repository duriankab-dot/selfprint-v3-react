/**
 * IntelligencePanel.test.tsx
 *
 * Tests Dashboard integration container for Phase 1 intelligence components.
 * Mocks:
 *  - useAuth → controls userId
 *  - supabase client → prevents real DB calls, stubs real-time channel
 *  - PersonalContextBuilder / PatternDetector / AIFeedbackLoop → controls data
 *  - Child components (ContextDisplay, FeedbackWidget) → prevents deep rendering
 *
 * Wrapped in QueryClientProvider so useQuery works without network
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// ============================================================================
// Mocks — must be declared before imports that use them
// ============================================================================

const useAuthMock = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

// Supabase channel mock — returns a chainable object that does nothing
const channelUnsubscribe = vi.fn();
const channelMock = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};
const removeChannelMock = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => channelMock),
    removeChannel: removeChannelMock,
  },
}));

// Intelligence class mocks
const getContextMock = vi.fn();
const detectPatternsMock = vi.fn();
const getAccuracyMetricsMock = vi.fn();

vi.mock('@/lib/intelligence/PersonalContextBuilder', () => ({
  PersonalContextBuilder: vi.fn().mockImplementation(() => ({
    getContext: getContextMock,
  })),
}));

vi.mock('@/lib/intelligence/PatternDetector', () => ({
  PatternDetector: vi.fn().mockImplementation(() => ({
    detectPatterns: detectPatternsMock,
  })),
}));

vi.mock('@/lib/intelligence/AIFeedbackLoop', () => ({
  AIFeedbackLoop: vi.fn().mockImplementation(() => ({
    getAccuracyMetrics: getAccuracyMetricsMock,
  })),
}));

// Stub heavy child components to focus tests on IntelligencePanel logic
vi.mock('@/components/intelligence/ContextDisplay', () => ({
  ContextDisplay: ({ context }: { context: { userId: string } }) => (
    <div data-testid="context-display">ContextDisplay for {context.userId}</div>
  ),
}));

vi.mock('@/components/intelligence/ConfidenceIndicator', () => ({
  ConfidenceIndicator: ({ confidence }: { confidence: number }) => (
    <div data-testid="confidence-indicator">confidence={confidence}</div>
  ),
}));

vi.mock('@/components/intelligence/MemoryRecorder', () => ({
  MemoryRecorder: ({ userId }: { userId: string }) => (
    <div data-testid="memory-recorder">MemoryRecorder for {userId}</div>
  ),
}));

vi.mock('@/components/intelligence/FeedbackWidget', () => ({
  FeedbackWidget: ({ insightId }: { insightId: string }) => (
    <div data-testid="feedback-widget">FeedbackWidget id={insightId}</div>
  ),
}));

// Import component after all vi.mock calls
import IntelligencePanel from '../IntelligencePanel';

// ============================================================================
// Fixtures
// ============================================================================

const MOCK_USER_ID = 'user-test-001';
const SESSION = { user: { id: MOCK_USER_ID } };

const MOCK_CONTEXT = {
  userId: MOCK_USER_ID,
  values: [],
  goals: [],
  strengths: [],
  blindSpots: [],
  emotionalRange: {
    primaryMoods: [],
    volatility: 0.3,
    responseToStress: 'calm',
    emotionalTriggers: [],
    confidence: 0.5,
  },
  decisionStyle: {
    type: 'analytical' as const,
    description: 'Analytical thinker',
    confidence: 0.7,
    evidence: [],
  },
  relationships: [],
  lastUpdated: new Date(),
  modelVersion: 1,
  confidenceOverall: 0.65,
  sourceCount: 5,
};

const MOCK_PATTERN = {
  id: 'pattern-001',
  userId: MOCK_USER_ID,
  patternName: 'decision_hesitation',
  patternType: 'repeating' as const,
  evidencePoints: [],
  frequency: 'weekly',
  lastDetected: new Date('2026-08-01'),
  confidence: 0.72,
  description: 'You often delay final decisions while gathering more info.',
  aiInsight: 'This pattern suggests a preference for certainty before committing.',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_ACCURACY_METRICS = {
  totalInsights: 12,
  feedback: { veryTrue: 6, somewhat: 3, notSure: 2, notMe: 1 },
  accuracy: 0.75,
  trend: 'improving' as const,
};

// ============================================================================
// Helper: render with QueryClientProvider
// ============================================================================

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,       // don't retry on failure in tests
        gcTime: 0,          // v5: gcTime instead of cacheTime
      },
    },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

// ============================================================================
// Tests
// ============================================================================

describe('IntelligencePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    channelMock.on.mockReturnThis();
    channelMock.subscribe.mockReturnThis();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --------------------------------------------------------------------------
  // Auth guard
  // --------------------------------------------------------------------------

  it('shows warning when user is not logged in', () => {
    useAuthMock.mockReturnValue({ session: null });
    renderWithQuery(<IntelligencePanel />);

    expect(
      screen.getByText(/กรุณาเข้าสู่ระบบเพื่อดู AI Twin ของคุณ/i)
    ).toBeInTheDocument();
  });

  it('does not call getContext when userId is empty', () => {
    useAuthMock.mockReturnValue({ session: null });
    renderWithQuery(<IntelligencePanel />);
    expect(getContextMock).not.toHaveBeenCalled();
  });

  // --------------------------------------------------------------------------
  // Loading state
  // --------------------------------------------------------------------------

  it('shows loading spinner while queries are pending', () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    // queries that never resolve → isLoading stays true
    getContextMock.mockReturnValue(new Promise(() => {}));
    detectPatternsMock.mockReturnValue(new Promise(() => {}));
    getAccuracyMetricsMock.mockReturnValue(new Promise(() => {}));

    renderWithQuery(<IntelligencePanel />);

    expect(screen.getByText(/กำลังโหลด AI Twin/i)).toBeInTheDocument();
  });

  // --------------------------------------------------------------------------
  // Overview tab — empty state
  // --------------------------------------------------------------------------

  it('shows empty state when context has no source data', async () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    getContextMock.mockResolvedValue({ ...MOCK_CONTEXT, sourceCount: 0 });
    detectPatternsMock.mockResolvedValue([]);
    getAccuracyMetricsMock.mockResolvedValue({ ...MOCK_ACCURACY_METRICS, totalInsights: 0, accuracy: 0 });

    renderWithQuery(<IntelligencePanel />);

    await waitFor(() => {
      expect(screen.getByText(/AI Twin ของคุณกำลังเรียนรู้/i)).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Overview tab — with context data
  // --------------------------------------------------------------------------

  it('renders ContextDisplay when personalContext is loaded', async () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    getContextMock.mockResolvedValue(MOCK_CONTEXT);
    detectPatternsMock.mockResolvedValue([]);
    getAccuracyMetricsMock.mockResolvedValue(MOCK_ACCURACY_METRICS);

    renderWithQuery(<IntelligencePanel />);

    await waitFor(() => {
      expect(screen.getByTestId('context-display')).toBeInTheDocument();
    });
    expect(screen.getByText(`ContextDisplay for ${MOCK_USER_ID}`)).toBeInTheDocument();
  });

  it('renders ConfidenceIndicator with accuracy metrics in header', async () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    getContextMock.mockResolvedValue(MOCK_CONTEXT);
    detectPatternsMock.mockResolvedValue([]);
    getAccuracyMetricsMock.mockResolvedValue(MOCK_ACCURACY_METRICS);

    renderWithQuery(<IntelligencePanel />);

    await waitFor(() => {
      const indicators = screen.getAllByTestId('confidence-indicator');
      // At least the header confidence indicator
      expect(indicators.length).toBeGreaterThanOrEqual(1);
    });
  });

  // --------------------------------------------------------------------------
  // Patterns tab
  // --------------------------------------------------------------------------

  it('switches to patterns tab and shows empty state when no patterns', async () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    getContextMock.mockResolvedValue(MOCK_CONTEXT);
    detectPatternsMock.mockResolvedValue([]);
    getAccuracyMetricsMock.mockResolvedValue(MOCK_ACCURACY_METRICS);

    renderWithQuery(<IntelligencePanel />);
    await waitFor(() => screen.getByTestId('context-display'));

    await userEvent.click(screen.getByRole('tab', { name: /รูปแบบ/i }));

    expect(screen.getByText(/ยังไม่พบรูปแบบพฤติกรรม/i)).toBeInTheDocument();
  });

  it('renders FeedbackWidget for each pattern', async () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    getContextMock.mockResolvedValue(MOCK_CONTEXT);
    detectPatternsMock.mockResolvedValue([MOCK_PATTERN]);
    getAccuracyMetricsMock.mockResolvedValue(MOCK_ACCURACY_METRICS);

    renderWithQuery(<IntelligencePanel />);
    await waitFor(() => screen.getByTestId('context-display'));

    await userEvent.click(screen.getByRole('tab', { name: /รูปแบบ/i }));

    await waitFor(() => {
      expect(screen.getByTestId('feedback-widget')).toBeInTheDocument();
      expect(
        screen.getByText(`FeedbackWidget id=${MOCK_PATTERN.id}`)
      ).toBeInTheDocument();
    });
  });

  it('shows pattern name and insight text', async () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    getContextMock.mockResolvedValue(MOCK_CONTEXT);
    detectPatternsMock.mockResolvedValue([MOCK_PATTERN]);
    getAccuracyMetricsMock.mockResolvedValue(MOCK_ACCURACY_METRICS);

    renderWithQuery(<IntelligencePanel />);
    await waitFor(() => screen.getByTestId('context-display'));

    await userEvent.click(screen.getByRole('tab', { name: /รูปแบบ/i }));

    expect(screen.getByText(MOCK_PATTERN.patternName)).toBeInTheDocument();
    expect(screen.getByText(MOCK_PATTERN.aiInsight)).toBeInTheDocument();
  });

  // --------------------------------------------------------------------------
  // Memories tab
  // --------------------------------------------------------------------------

  it('switches to memories tab and renders MemoryRecorder', async () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    getContextMock.mockResolvedValue(MOCK_CONTEXT);
    detectPatternsMock.mockResolvedValue([]);
    getAccuracyMetricsMock.mockResolvedValue(MOCK_ACCURACY_METRICS);

    renderWithQuery(<IntelligencePanel />);
    await waitFor(() => screen.getByTestId('context-display'));

    await userEvent.click(screen.getByRole('tab', { name: /ความทรงจำ/i }));

    expect(screen.getByTestId('memory-recorder')).toBeInTheDocument();
    expect(
      screen.getByText(`MemoryRecorder for ${MOCK_USER_ID}`)
    ).toBeInTheDocument();
  });

  // --------------------------------------------------------------------------
  // Real-time subscription
  // --------------------------------------------------------------------------

  it('creates a Supabase channel when userId is present', async () => {
    const { supabase } = await import('@/lib/supabase/client');
    useAuthMock.mockReturnValue({ session: SESSION });
    getContextMock.mockResolvedValue(MOCK_CONTEXT);
    detectPatternsMock.mockResolvedValue([]);
    getAccuracyMetricsMock.mockResolvedValue(MOCK_ACCURACY_METRICS);

    renderWithQuery(<IntelligencePanel />);
    await waitFor(() => screen.getByTestId('context-display'));

    expect(supabase.channel).toHaveBeenCalledWith(
      expect.stringContaining(MOCK_USER_ID)
    );
    expect(channelMock.subscribe).toHaveBeenCalled();
  });

  it('removes Supabase channel on unmount', async () => {
    const { supabase } = await import('@/lib/supabase/client');
    useAuthMock.mockReturnValue({ session: SESSION });
    getContextMock.mockResolvedValue(MOCK_CONTEXT);
    detectPatternsMock.mockResolvedValue([]);
    getAccuracyMetricsMock.mockResolvedValue(MOCK_ACCURACY_METRICS);

    const { unmount } = renderWithQuery(<IntelligencePanel />);
    await waitFor(() => screen.getByTestId('context-display'));

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalled();
  });

  // --------------------------------------------------------------------------
  // Error state
  // --------------------------------------------------------------------------

  it('shows error alert when getContext throws', async () => {
    useAuthMock.mockReturnValue({ session: SESSION });
    getContextMock.mockRejectedValue(new Error('DB connection failed'));
    detectPatternsMock.mockResolvedValue([]);
    getAccuracyMetricsMock.mockResolvedValue(MOCK_ACCURACY_METRICS);

    renderWithQuery(<IntelligencePanel />);

    await waitFor(() => {
      expect(
        screen.getByText(/DB connection failed/i)
      ).toBeInTheDocument();
    });
  });
});

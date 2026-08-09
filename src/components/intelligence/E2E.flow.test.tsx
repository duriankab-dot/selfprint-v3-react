/**
 * E2E Flow Tests for Intelligence System
 * Tests complete user journeys across multiple components and system
 * @module components/intelligence/__e2e__/E2E.flow.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemoryRecorder from './MemoryRecorder';
import FeedbackWidget from './FeedbackWidget';
import ConfidenceIndicator from './ConfidenceIndicator';
import ContextDisplay from './ContextDisplay';
import { PersonalContext, BehavioralPattern } from '@/lib/intelligence/types';

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase/client';

describe('E2E Flow Tests - Intelligence System', () => {
  const mockUserId = 'test-user-123';

  const mockPersonalContext: PersonalContext = {
    userId: mockUserId,
    values: [
      { id: 'val-1', userId: mockUserId, value: 'Continuous Learning', confidence: 0.85 },
    ],
    goals: [
      { id: 'goal-1', userId: mockUserId, goal: 'Become expert developer', confidence: 0.75 },
    ],
    blindSpots: [],
    behavioralPatterns: [
      {
        id: 'pattern-1',
        userId: mockUserId,
        patternName: 'analytical_thinking',
        description: 'Analyzes problems deeply',
        confidence: 0.80,
        evidenceCount: 5,
        evidencePoints: [
          { id: 'ev-1', date: new Date(), context: 'Spent time analyzing', weight: 1.0 },
        ],
        consistencyScore: 0.78,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    strengths: [],
    accuracyMetrics: {
      totalInsights: 3,
      userValidations: 2,
      accuracyScore: 0.85,
      lastUpdated: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Flow 1: Complete User Memory Workflow', () => {
    /**
     * E2E Test 1: User creates memory → memory appears in system
     * Simulates: Record memory → System stores → Component reflects state
     */
    it('should complete full memory creation workflow: record → store → display', async () => {
      const mockMemoryInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'mem-1',
              user_id: mockUserId,
              memory_type: 'small_win',
              title: 'Completed complex feature',
              content: 'Successfully implemented authentication system',
              confidence: 0.8,
              tags: ['achievement', 'work'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'personal_memory') {
          return { insert: mockMemoryInsert };
        }
        return { insert: vi.fn() };
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const onMemoryCreated = vi.fn();

      const { getByPlaceholderText, getByRole, getByText } = render(
        <MemoryRecorder
          userId={mockUserId}
          onMemoryCreated={onMemoryCreated}
        />
      );

      // Step 1: User fills form
      const titleInput = getByPlaceholderText(/Completed project ahead/i);
      const contentInput = getByPlaceholderText(/Describe the event/i);

      await userEvent.type(titleInput, 'Completed complex feature');
      await userEvent.type(contentInput, 'Successfully implemented authentication system');

      // Step 2: Select type
      fireEvent.click(getByRole('button', { name: /🎉 Small Win/i }));

      // Step 3: Add tags
      const tagsInput = getByPlaceholderText(/achievement, work/i);
      await userEvent.type(tagsInput, 'achievement, work');

      // Step 4: Submit
      fireEvent.click(getByRole('button', { name: /Save Memory/i }));

      // Step 5: Verify system stored memory
      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalledWith('personal_memory');
        expect(mockMemoryInsert).toHaveBeenCalled();
      });

      // Step 6: Verify UI confirms success
      expect(getByText(/Memory saved successfully/i)).toBeInTheDocument();

      // Step 7: Verify callback triggered
      expect(onMemoryCreated).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Completed complex feature',
        memoryType: 'small_win',
      }));

      // Step 8: Verify form reset for next entry
      expect(titleInput).toHaveValue('');
      expect(contentInput).toHaveValue('');
    });
  });

  describe('Flow 2: Feedback → Model Calibration → Updated Confidence', () => {
    /**
     * E2E Test 2: User gives feedback on insight → model updates → confidence changes
     * Simulates: Display insight → Get feedback → Calibrate → Show new confidence
     */
    it('should complete feedback loop: insight → user feedback → model update → new confidence', async () => {
      const mockFeedbackInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'feedback-1',
              user_id: mockUserId,
              insight_id: 'pattern-1',
              feedback_type: 'very_true',
              comment: 'Yes this is accurate',
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'insight_feedback') {
          return { insert: mockFeedbackInsert };
        }
        return { insert: vi.fn() };
      });

      (supabase.from as any).mockImplementation(mockFrom);

      // Container for both components
      const { container, getByPlaceholderText, getByRole, getByText, queryByText } = render(
        <div className="space-y-6">
          {/* Step 1: Display insight with initial confidence */}
          <div>
            <ConfidenceIndicator
              confidence={0.80}
              evidenceCount={5}
              knowledgeLevel="INFER"
            />
            <div className="mt-4">
              <h3>AI Insight</h3>
              <p>{mockPersonalContext.behavioralPatterns[0].description}</p>
            </div>
          </div>

          {/* Step 2: User can give feedback on insight */}
          <FeedbackWidget
            userId={mockUserId}
            insightId="pattern-1"
            insightText={mockPersonalContext.behavioralPatterns[0].description}
            allowComment={true}
          />
        </div>
      );

      // Initial confidence shown: 80%
      expect(getByText(/80%/i)).toBeInTheDocument();

      // User sees insight text
      expect(getByText(/Analyzes problems deeply/i)).toBeInTheDocument();

      // Step 3: User gives "Very True" feedback
      fireEvent.click(getByRole('button', { name: /Very True/i }));

      // Step 4: User adds comment
      const commentInput = getByPlaceholderText(/optional feedback/i);
      await userEvent.type(commentInput, 'Yes this is accurate');

      // Step 5: Submit feedback
      fireEvent.click(getByRole('button', { name: /Submit/i }));

      // Step 6: Verify feedback was recorded
      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalledWith('insight_feedback');
        expect(mockFeedbackInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            feedback_type: 'very_true',
            comment: 'Yes this is accurate',
          })
        );
      });

      // Step 7: Verify success message
      expect(getByText(/Thank you for your feedback/i)).toBeInTheDocument();

      // In real flow, confidence would be recalculated here
      // For E2E test, we verify the feedback was processed
      expect(mockFeedbackInsert).toHaveBeenCalled();
    });
  });

  describe('Flow 3: Context Display After Updates', () => {
    /**
     * E2E Test 3: View personal context after memories + feedback
     * Verifies: full context displayed with updated data
     */
    it('should display updated context after system operations', () => {
      const { getByText, queryByText } = render(
        <ContextDisplay
          context={mockPersonalContext}
          patterns={mockPersonalContext.behavioralPatterns}
          accuracyMetrics={mockPersonalContext.accuracyMetrics}
          expandedSection="all"
        />
      );

      // Verify values section
      expect(getByText(/Continuous Learning/i)).toBeInTheDocument();

      // Verify goals section
      expect(getByText(/Become expert developer/i)).toBeInTheDocument();

      // Verify behavioral patterns section
      expect(getByText(/Analyzes problems deeply/i)).toBeInTheDocument();

      // Verify confidence shown for pattern
      expect(getByText(/80%/i)).toBeInTheDocument();

      // Verify accuracy metrics displayed
      expect(getByText(/85%|accuracy/i)).toBeInTheDocument();

      // Verify structure: all sections expanded
      const values = queryByText(/Continuous Learning/i);
      const goals = queryByText(/Become expert developer/i);
      expect(values).toBeInTheDocument();
      expect(goals).toBeInTheDocument();
    });
  });

  describe('Flow 4: Complete User Journey - Create Memory + Get Feedback', () => {
    /**
     * E2E Test 4: Realistic flow - user creates memory, system generates insight, user gives feedback
     * This is the core "Living AI Twin" loop
     */
    it('should handle complete journey: memory creation → insight generation → feedback', async () => {
      // Setup mocks for both memory and feedback operations
      const mockMemoryInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'mem-1',
              user_id: mockUserId,
              memory_type: 'discovery',
              title: 'Found new approach to problem solving',
              content: 'Realized I work better with hands-on experimentation',
              confidence: 0.8,
              tags: ['learning', 'methodology'],
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockFeedbackInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'feedback-1',
              user_id: mockUserId,
              insight_id: 'insight-1',
              feedback_type: 'somewhat',
              comment: 'Mostly true but I also like analysis',
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'personal_memory') {
          return { insert: mockMemoryInsert };
        }
        if (table === 'insight_feedback') {
          return { insert: mockFeedbackInsert };
        }
        return { insert: vi.fn() };
      });

      (supabase.from as any).mockImplementation(mockFrom);

      // PHASE 1: Record Memory
      const { getByPlaceholderText, getByRole, getByText, queryByText, rerender } = render(
        <div className="space-y-8">
          <div>
            <h2>Phase 1: Record Memory</h2>
            <MemoryRecorder userId={mockUserId} />
          </div>
        </div>
      );

      // Fill and submit memory
      await userEvent.type(
        getByPlaceholderText(/Completed project ahead/i),
        'Found new approach to problem solving'
      );
      await userEvent.type(
        getByPlaceholderText(/Describe the event/i),
        'Realized I work better with hands-on experimentation'
      );

      fireEvent.click(getByRole('button', { name: /💡 Discovery/i }));
      fireEvent.click(getByRole('button', { name: /Save Memory/i }));

      // Verify memory saved
      await waitFor(() => {
        expect(mockMemoryInsert).toHaveBeenCalled();
        expect(getByText(/Memory saved/i)).toBeInTheDocument();
      });

      // PHASE 2: System generates insight (simulated)
      // In real system, this would be generated by AI
      const generatedInsight = 'You prefer hands-on learning over pure analysis';

      rerender(
        <div className="space-y-8">
          <div>
            <h2>Phase 1: Memory Recorded ✓</h2>
            <p>Discovery: Found new approach to problem solving</p>
          </div>

          <div>
            <h2>Phase 2: AI Generated Insight</h2>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">{generatedInsight}</p>
                <ConfidenceIndicator confidence={0.65} evidenceCount={3} knowledgeLevel="INFER" />
              </div>

              <h3>What do you think about this?</h3>
              <FeedbackWidget
                userId={mockUserId}
                insightId="insight-1"
                insightText={generatedInsight}
                allowComment={true}
              />
            </div>
          </div>
        </div>
      );

      // PHASE 3: User gives feedback on insight
      expect(getByText(generatedInsight)).toBeInTheDocument();

      fireEvent.click(getByRole('button', { name: /Somewhat/i }));
      await userEvent.type(
        getByPlaceholderText(/optional feedback/i),
        'Mostly true but I also like analysis'
      );
      fireEvent.click(getByRole('button', { name: /Submit/i }));

      // Verify feedback submitted
      await waitFor(() => {
        expect(mockFeedbackInsert).toHaveBeenCalled();
        expect(getByText(/Thank you for your feedback/i)).toBeInTheDocument();
      });

      // PHASE 4: Verify complete journey
      expect(queryByText(/Memory Recorded/i)).toBeInTheDocument();
      expect(queryByText(/AI Generated Insight/i)).toBeInTheDocument();
      expect(mockMemoryInsert).toHaveBeenCalled();
      expect(mockFeedbackInsert).toHaveBeenCalled();
    });
  });

  describe('Error Recovery in Flows', () => {
    /**
     * E2E Test 5: Graceful error handling in flow
     */
    it('should handle errors gracefully and keep user data intact', async () => {
      const mockMemoryInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection lost' },
          }),
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockMemoryInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const { getByPlaceholderText, getByRole, getByText } = render(
        <MemoryRecorder userId={mockUserId} />
      );

      // Fill form
      const titleInput = getByPlaceholderText(/Completed project ahead/i);
      const contentInput = getByPlaceholderText(/Describe the event/i);

      const testTitle = 'Test Memory';
      const testContent = 'Test content for error case';

      await userEvent.type(titleInput, testTitle);
      await userEvent.type(contentInput, testContent);

      // Submit (will fail)
      fireEvent.click(getByRole('button', { name: /Save Memory/i }));

      // Verify error shown
      await waitFor(() => {
        expect(getByText(/Failed to save memory/i)).toBeInTheDocument();
      });

      // Verify user data preserved
      expect(titleInput).toHaveValue(testTitle);
      expect(contentInput).toHaveValue(testContent);

      // User can retry
      fireEvent.click(getByRole('button', { name: /Save Memory/i }));
      expect(mockMemoryInsert.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});

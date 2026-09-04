/**
 * Integration Tests for FeedbackWidget Component
 * Tests component + AIFeedbackLoop + Supabase integration
 * @module components/intelligence/__integration__/FeedbackWidget.integration.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackWidget from './FeedbackWidget';
import { InsightFeedback, FeedbackType } from '@/lib/intelligence/types';

// Supabase client imported after setup.ts global mock (setup.ts handles vi.mock)
import { supabase } from '@/lib/supabase/client';
import { AIFeedbackLoop } from '@/lib/intelligence/AIFeedbackLoop';

// Mock AIFeedbackLoop to allow Supabase mock to work
// Don't mock the class — let real AIFeedbackLoop call mocked Supabase
// vi.mock for AIFeedbackLoop removed — test will use real class with mocked supabase

describe('FeedbackWidget Integration Tests', () => {
  const mockUserId = 'test-user-123';
  const mockInsightId = 'insight-456';
  const mockInsightText = 'You tend to analyze problems deeply before making decisions';

  // Helper: Setup Supabase mock BEFORE any render
  const setupSupabaseMock = (
    data: any = {
      id: 'feedback-default',
      user_id: mockUserId,
      insight_id: mockInsightId,
      feedback_type: 'very_true',
      comment: '',
      created_at: new Date().toISOString(),
    },
    error: any = null
  ) => {
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data, error }),
      }),
    });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    (supabase.from as any).mockImplementation(mockFrom);
    return { mockFrom, mockInsert };
  };

  const mockFeedbackResponse: InsightFeedback = {
    id: 'feedback-789',
    userId: mockUserId,
    insightId: mockInsightId,
    feedbackType: 'very_true',
    comment: 'Yes, I definitely do this',
    createdAt: new Date('2026-08-09'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Integration: Component → AIFeedbackLoop → Supabase', () => {
    /**
     * Test 1: Full workflow - user submits feedback successfully
     * Verifies: feedback selection → validation → loop call → Supabase save → component state
     */
    it('should record feedback end-to-end with real AIFeedbackLoop', async () => {
      // Setup mock BEFORE render
      const { mockFrom: testMockFrom, mockInsert: testMockInsert } = setupSupabaseMock({
        id: mockFeedbackResponse.id,
        user_id: mockUserId,
        insight_id: mockInsightId,
        feedback_type: 'very_true',
        comment: 'Yes, I definitely do this',
        created_at: mockFeedbackResponse.createdAt.toISOString(),
      });

      const onFeedbackSubmitted = vi.fn();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          onFeedbackSubmitted={onFeedbackSubmitted}
          allowComment={true}
        />
      );

      // Verify insight text displayed (use regex to match text with surrounding quotes)
      expect(screen.getByText(new RegExp(mockInsightText))).toBeInTheDocument();

      // Select "Very True" feedback
      const veryTrueButton = screen.getByRole('button', { name: /Very True/i });
      fireEvent.click(veryTrueButton);

      // Wait for Submit button to appear (depends on selectedFeedback state)
      const submitButton = await screen.findByRole('button', { name: /Submit/i });

      // Add optional comment
      const commentInput = await screen.findByPlaceholderText(/additional context/i);
      await userEvent.type(commentInput, 'Yes, I definitely do this');

      // Submit feedback
      fireEvent.click(submitButton);

      // Verify Supabase was called with feedback data
      await waitFor(() => {
        expect(testMockFrom).toHaveBeenCalledWith('insight_feedback');
        // QA-02: `id` and `created_at` are DB-generated defaults —
        // AIFeedbackLoop.recordFeedback() deliberately does not send them
        // (src/lib/intelligence/AIFeedbackLoop.ts:139-144).
        expect(testMockInsert).toHaveBeenCalledWith({
          user_id: mockUserId,
          insight_id: mockInsightId,
          feedback_type: 'very_true',
          comment: 'Yes, I definitely do this',
        });
      });

      // Verify callback was called
      await waitFor(() => {
        expect(onFeedbackSubmitted).toHaveBeenCalledWith('very_true', 'Yes, I definitely do this');
      });

      // Verify success message shown
      expect(screen.getByText(/Thank you for your feedback/i)).toBeInTheDocument();
    });

    /**
     * Test 2: All 4 feedback types work correctly
     * Verifies: each feedback option sends correct type to AIFeedbackLoop
     */
    it('should handle all 4 feedback types correctly', async () => {
      const feedbackTypes: Array<{ key: FeedbackType; label: RegExp }> = [
        { key: 'very_true', label: /Very True/i },
        { key: 'somewhat', label: /Somewhat/i },
        { key: 'not_sure', label: /Not Sure/i },
        { key: 'not_me', label: /Not Me/i },
      ];

      for (const { key, label } of feedbackTypes) {
        vi.clearAllMocks();

        const { mockFrom, mockInsert } = setupSupabaseMock({
          id: `feedback-${key}`,
          user_id: mockUserId,
          insight_id: mockInsightId,
          feedback_type: key,
          comment: null,
          created_at: new Date().toISOString(),
        });

        const onFeedbackSubmitted = vi.fn();

        const { unmount } = render(
          <FeedbackWidget
            userId={mockUserId}
            insightId={mockInsightId}
            insightText={mockInsightText}
            onFeedbackSubmitted={onFeedbackSubmitted}
            allowComment={false}
          />
        );

        // Select feedback type
        const typeButton = screen.getByRole('button', { name: label });
        fireEvent.click(typeButton);

        // Submit
        const submitButton = await screen.findByRole('button', { name: /Submit/i });
        fireEvent.click(submitButton);

        // Verify correct type sent
        await waitFor(() => {
          expect(mockInsert).toHaveBeenCalledWith(
            expect.objectContaining({
              feedback_type: key,
            })
          );
          expect(onFeedbackSubmitted).toHaveBeenCalledWith(key, undefined);
        });

        unmount();
      }
    });

    /**
     * Test 3: Feedback without comment still works
     * Verifies: comment is optional field
     */
    it('should submit feedback without comment when allowComment=false', async () => {
      const { mockFrom, mockInsert } = setupSupabaseMock({
        id: 'feedback-no-comment',
        user_id: mockUserId,
        insight_id: mockInsightId,
        feedback_type: 'somewhat',
        comment: null,
        created_at: new Date().toISOString(),
      });

      const onFeedbackSubmitted = vi.fn();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          onFeedbackSubmitted={onFeedbackSubmitted}
          allowComment={false}
        />
      );

      // Verify comment input NOT shown
      expect(screen.queryByPlaceholderText(/optional feedback/i)).not.toBeInTheDocument();

      // Select feedback
      const somewhatButton = screen.getByRole('button', { name: /Somewhat/i });
      fireEvent.click(somewhatButton);

      // Submit
      const submitButton = await screen.findByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);

      // Verify feedback sent without comment
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            comment: null,
          })
        );
      });
    });

    /**
     * Test 4: Handle Supabase errors gracefully
     * Verifies: error handling → user feedback
     */
    it('should handle feedback submission errors with user message', async () => {
      // QA-02: recordFeedback() awaits `.insert(...)` directly — it does not
      // chain .select().single() — so the failure has to surface on the insert
      // promise itself, otherwise `error` is undefined and nothing ever throws.
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          allowComment={true}
        />
      );

      // Select feedback
      const veryTrueButton = screen.getByRole('button', { name: /Very True/i });
      fireEvent.click(veryTrueButton);

      // Wait for comment input to appear (rendered after feedback selected)
      const commentInput = await screen.findByPlaceholderText(/additional context/i);
      await userEvent.type(commentInput, 'Test comment');

      // Submit
      const submitButton = await screen.findByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);

      // Verify error message shown
      // QA-02: recordFeedback() wraps the Supabase error in an IntelligenceError
      // ('Failed to record feedback: ...', code RECORD_FEEDBACK_FAILED), and
      // FeedbackWidget renders IntelligenceError as `Error: <message> (<code>)`.
      await waitFor(() => {
        expect(screen.getByText(/Failed to record feedback/i)).toBeInTheDocument();
        expect(screen.getByText(/RECORD_FEEDBACK_FAILED/)).toBeInTheDocument();
      });

      // Verify state preserved (comment not cleared)
      expect(commentInput).toHaveValue('Test comment');
    });

    /**
     * Test 5: Inline mode still saves feedback correctly
     * Verifies: component mode doesn't affect integration
     */
    it('should save feedback in inline mode through full integration', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'feedback-inline',
              user_id: mockUserId,
              insight_id: mockInsightId,
              feedback_type: 'not_sure',
              comment: null,
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const onFeedbackSubmitted = vi.fn();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          inline={true}
          onFeedbackSubmitted={onFeedbackSubmitted}
        />
      );

      // Select feedback
      // QA-02: in inline mode the option buttons render the emoji only, with the
      // description on `title` (FeedbackWidget.tsx:163-177) — the accessible name
      // is the emoji, not the label. Query the 'not_sure' option by its title.
      const notSureButton = screen.getByTitle("I'm uncertain about this");
      fireEvent.click(notSureButton);

      // Submit
      const submitButton = await screen.findByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);

      // Verify integration worked
      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalledWith('insight_feedback');
        expect(onFeedbackSubmitted).toHaveBeenCalled();
      });
    });

    /**
     * Test 6: Model calibration data sent correctly
     * Verifies: feedback impacts confidence metadata
     */
    it('should include model calibration metadata in feedback submission', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'feedback-calibration',
              user_id: mockUserId,
              insight_id: mockInsightId,
              feedback_type: 'very_true',
              comment: 'Perfect insight',
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          allowComment={true}
        />
      );

      // Select feedback
      const veryTrueButton = screen.getByRole('button', { name: /Very True/i });
      fireEvent.click(veryTrueButton);

      // Add comment
      const commentInput = await screen.findByPlaceholderText(/additional context/i);
      await userEvent.type(commentInput, 'Perfect insight');

      // Submit
      const submitButton = await screen.findByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);

      // Verify feedback data structure correct
      await waitFor(() => {
        const callArgs = mockInsert.mock.calls[0][0];
        expect(callArgs).toHaveProperty('user_id', mockUserId);
        expect(callArgs).toHaveProperty('insight_id', mockInsightId);
        expect(callArgs).toHaveProperty('feedback_type', 'very_true');
        expect(callArgs).toHaveProperty('comment', 'Perfect insight');
        // QA-02: created_at is a DB default, not part of the insert payload.
        expect(callArgs).not.toHaveProperty('created_at');
      });
    });
  });

  describe('Master Direction Compliance: User Calibrates Model', () => {
    /**
     * Test 7: User feedback directly impacts model
     * Verifies: all feedback types equally valid
     */
    it('should accept all feedback types equally - not_me is valid as very_true', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'feedback-test',
              user_id: mockUserId,
              insight_id: mockInsightId,
              feedback_type: 'not_me',
              comment: 'This is not how I am',
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const onFeedbackSubmitted = vi.fn();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText="You avoid confrontation"
          onFeedbackSubmitted={onFeedbackSubmitted}
        />
      );

      // Select "Not Me" - corrective feedback
      const notMeButton = screen.getByRole('button', { name: /Not Me/i });
      fireEvent.click(notMeButton);

      const commentInput = await screen.findByPlaceholderText(/additional context/i);
      await userEvent.type(commentInput, 'This is not how I am');

      const submitButton = await screen.findByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);

      // Verify "not_me" feedback accepted and processed
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            feedback_type: 'not_me',
          })
        );
        expect(onFeedbackSubmitted).toHaveBeenCalledWith(
          'not_me',
          'This is not how I am'
        );
      });
    });

    /**
     * Test 8: Feedback requires explicit selection (no auto-feedback)
     * Verifies: user controls feedback, not AI
     */
    it('should require explicit user feedback selection', async () => {
      const mockInsert = vi.fn();
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
        />
      );

      // QA-02: the widget enforces explicit selection by *disabling* the submit
      // control until an option is picked (FeedbackWidget.tsx:284-294) — the
      // label reads "Select a feedback option" and only becomes "Submit Feedback"
      // once selectedFeedback is set. It never shows a "Please select" error
      // because the click can't happen.
      const submitButton = screen.getByRole('button', { name: /Select a feedback option/i });
      expect(submitButton).toBeDisabled();
      expect(screen.queryByRole('button', { name: /Submit Feedback/i })).not.toBeInTheDocument();

      // Try to submit without selecting feedback
      fireEvent.click(submitButton);

      // Verify Supabase NOT called (no auto-feedback without user action)
      await waitFor(() => {
        expect(mockInsert).not.toHaveBeenCalled();
      });
    });
  });
});

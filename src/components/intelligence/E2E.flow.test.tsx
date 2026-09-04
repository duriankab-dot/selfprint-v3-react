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
import { PersonalContext, BehavioralPattern, AccuracyMetrics } from '@/lib/intelligence/types';

// QA-02: MemoryManager terminates with .maybeSingle(), not .single()
// (MemoryManager.ts:62 etc). Every mock chain below stubbed only .single(), so
// addMemory() threw a TypeError before touching Supabase.
// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase/client';

describe('E2E Flow Tests - Intelligence System', () => {
  const mockUserId = 'test-user-123';

  // QA-02: the old fixture did not match any type in lib/intelligence/types.ts.
  // PersonalContext (types.ts:118) has no `behavioralPatterns`, no
  // `accuracyMetrics`, no createdAt/updatedAt, and does require emotionalRange /
  // decisionStyle / relationships / lastUpdated / modelVersion /
  // confidenceOverall / sourceCount. Values are `{ name, evidence, ... }` and
  // Goals `{ title, evidence, ... }`, not `{ value }` / `{ goal }`. And
  // AccuracyMetrics (types.ts:271) is `{ totalInsights, feedback: { veryTrue,
  // somewhat, notSure, notMe }, accuracy, trend }` — the missing `feedback`
  // object is what crashed ContextDisplay with "Cannot read properties of
  // undefined (reading 'veryTrue')" at ContextDisplay.tsx:171.
  const mockPersonalContext: PersonalContext = {
    userId: mockUserId,
    values: [
      {
        id: 'val-1',
        name: 'Continuous Learning',
        confidence: 0.85,
        evidence: ['ref-1', 'ref-2'],
        inferredFromSources: [],
        inferred: false,
      },
    ],
    goals: [
      {
        id: 'goal-1',
        title: 'Become expert developer',
        confidence: 0.75,
        evidence: ['ref-3'],
        inferredFromSources: [],
      },
    ],
    strengths: [],
    blindSpots: [],
    emotionalRange: {
      primaryMoods: ['focused'],
      volatility: 0.3,
      responseToStress: 'analytical',
      emotionalTriggers: [],
      confidence: 0.7,
    },
    decisionStyle: {
      type: 'analytical',
      description: 'Weighs options carefully before committing',
      confidence: 0.8,
      evidence: [],
    },
    relationships: [],
    lastUpdated: new Date(),
    modelVersion: 1,
    confidenceOverall: 0.8,
    sourceCount: 5,
  };

  const mockPatterns: BehavioralPattern[] = [
    {
      id: 'pattern-1',
      userId: mockUserId,
      patternName: 'analytical_thinking',
      patternType: 'repeating',
      evidencePoints: [
        { date: new Date(), source: 'reflection', sourceId: 'ref-1', excerpt: 'Spent time analyzing' },
      ],
      frequency: 'weekly',
      lastDetected: new Date(),
      confidence: 0.8,
      description: 'Analyzes problems deeply',
      aiInsight: 'Thoroughness is a strength but can slow delivery',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockAccuracyMetrics: AccuracyMetrics = {
    totalInsights: 3,
    feedback: { veryTrue: 2, somewhat: 1, notSure: 0, notMe: 0 },
    accuracy: 0.85,
    trend: 'improving',
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
          maybeSingle: vi.fn().mockResolvedValue({
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
          maybeSingle: vi.fn().mockResolvedValue({
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
              <p>{mockPatterns[0].description}</p>
            </div>
          </div>

          {/* Step 2: User can give feedback on insight */}
          <FeedbackWidget
            userId={mockUserId}
            insightId="pattern-1"
            insightText={mockPatterns[0].description}
            allowComment={true}
          />
        </div>
      );

      // Initial confidence shown: 80%
      expect(getByText(/80%/i)).toBeInTheDocument();

      // User sees insight text. QA-02: it is rendered twice — once as the raw
      // insight <p> above and once inside FeedbackWidget's quoted block
      // (FeedbackWidget.tsx:225-227) — so getByText threw "Found multiple
      // elements". Both occurrences are expected; assert on the set.
      expect(screen.getAllByText(/Analyzes problems deeply/i)).toHaveLength(2);

      // Step 3: User gives "Very True" feedback
      fireEvent.click(getByRole('button', { name: /Very True/i }));

      // Step 4: User adds comment. QA-02: the textarea placeholder is
      // "Any additional context to help AI understand?"
      // (FeedbackWidget.tsx:258) — there has never been an "optional feedback"
      // placeholder in this component.
      const commentInput = getByPlaceholderText(/additional context/i);
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
          patterns={mockPatterns}
          accuracyMetrics={mockAccuracyMetrics}
          expandedSection="all"
        />
      );

      // Verify values section
      expect(getByText(/Continuous Learning/i)).toBeInTheDocument();

      // Verify goals section
      expect(getByText(/Become expert developer/i)).toBeInTheDocument();

      // Verify behavioral patterns section
      expect(getByText(/Analyzes problems deeply/i)).toBeInTheDocument();

      // Verify confidence shown for pattern. QA-02: "80%" appears twice — the
      // header's "Overall Accuracy: 80%" (confidenceOverall) and the Behavioral
      // Patterns summary line "1 detected • 80% confidence"
      // (ContextDisplay.tsx:357) — so a bare getByText matched two nodes.
      // Assert the patterns line specifically.
      expect(screen.getByText(/1 detected . 80% confidence/i)).toBeInTheDocument();

      // Verify accuracy metrics displayed (AccuracyMetrics.accuracy = 0.85)
      expect(screen.getByText('Model Accuracy')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();

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
          maybeSingle: vi.fn().mockResolvedValue({
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
          maybeSingle: vi.fn().mockResolvedValue({
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
        // QA-02: see the placeholder note in Flow 2 above.
        getByPlaceholderText(/additional context/i),
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
          maybeSingle: vi.fn().mockResolvedValue({
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

      // Verify error shown. QA-02: MemoryManager wraps the Supabase error as
      // IntelligenceError('Failed to add memory: ...', 'ADD_MEMORY_FAILED')
      // (MemoryManager.ts:80-84) and MemoryRecorder renders IntelligenceError as
      // `Error: <message> (<code>)` (MemoryRecorder.tsx:116-117) — the copy the
      // user sees says "add", not "save".
      await waitFor(() => {
        expect(getByText(/Failed to add memory/i)).toBeInTheDocument();
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

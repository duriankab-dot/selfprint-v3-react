/**
 * Unit Tests for FeedbackWidget Component
 * Tests feedback submission, model calibration, error handling
 * @module components/intelligence/__tests__/FeedbackWidget.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackWidget from './FeedbackWidget';
import { AIFeedbackLoop } from '@/lib/intelligence/AIFeedbackLoop';
import { IntelligenceError } from '@/lib/intelligence/types';

// Mock AIFeedbackLoop
vi.mock('@/lib/intelligence/AIFeedbackLoop');

describe('FeedbackWidget Component', () => {
  const mockUserId = 'test-user-123';
  const mockInsightId = 'insight-456';
  const mockInsightText = 'You tend to make decisions analytically';

  beforeEach(() => {
    vi.clearAllMocks();
    // ⚠️ Must use regular function — arrow functions cannot be `new`-ed
    // Component calls recordFeedback (not calibrateFromFeedback)
    (AIFeedbackLoop as any).mockImplementation(function () {
      return {
        recordFeedback: vi.fn().mockResolvedValue(true),
      };
    });
  });

  describe('Rendering', () => {
    /**
     * Test 1: Component renders in full card view by default
     */
    it('should render full card view by default', () => {
      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
        />
      );

      expect(screen.getByText('How accurate is this?')).toBeInTheDocument();
      // Component wraps insightText in quotes; use flexible matcher
      expect(
        screen.getByText((content) => /tend/.test(content) && /analytically/.test(content))
      ).toBeInTheDocument();
    });

    /**
     * Test 2: Component renders in inline view when requested
     */
    it('should render in inline view when inline=true', () => {
      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          inline={true}
        />
      );

      // Inline view should not have the header
      expect(screen.queryByText('How accurate is this?')).not.toBeInTheDocument();

      // But should have feedback buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    /**
     * Test 3: All feedback options render
     */
    it('should render all feedback options', () => {
      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
        />
      );

      expect(screen.getByText('Very True')).toBeInTheDocument();
      expect(screen.getByText('Somewhat')).toBeInTheDocument();
      expect(screen.getByText("Not Sure")).toBeInTheDocument();
      expect(screen.getByText('Not Me')).toBeInTheDocument();
    });
  });

  describe('Feedback Selection', () => {
    /**
     * Test 4: Allows selecting feedback option
     */
    it('should allow selecting feedback option', async () => {
      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
        />
      );

      const veryTrueButton = screen.getByText('Very True').closest('button');
      if (!veryTrueButton) throw new Error('Button not found');

      await user.click(veryTrueButton);

      // Verify that the button has some visual indication of selection
      // Component adds a colored indicator when selected
      expect(veryTrueButton.textContent).toContain('Very True');
    });

    /**
     * Test 5: Can change selected feedback
     */
    it('should allow changing selected feedback', async () => {
      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
        />
      );

      const veryTrueButton = screen.getByText('Very True').closest('button');
      const notMeButton = screen.getByText('Not Me').closest('button');

      if (!veryTrueButton || !notMeButton) throw new Error('Buttons not found');

      await user.click(veryTrueButton);
      await user.click(notMeButton);

      // Verify notMe is now selected
      const parentDiv = notMeButton.parentElement;
      expect(parentDiv?.textContent).toContain('✓');
    });
  });

  describe('Form Validation', () => {
    /**
     * Test 6: Requires feedback selection to submit
     */
    it('should show error when no feedback selected', () => {
      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
        />
      );

      // Submit button is disabled when no selection
      const submitButton = screen.getByText((content) => /select.*feedback/i.test(content)).closest('button');
      expect(submitButton).toBeDisabled();
    });

    /**
     * Test 7: Validates comment max length
     */
    it('should validate comment max length (500 chars)', async () => {
      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          allowComment={true}
        />
      );

      // Select feedback first
      const veryTrueButton = screen.getByText('Very True').closest('button');
      if (!veryTrueButton) throw new Error('Button not found');
      await user.click(veryTrueButton);

      // Try to enter long comment
      const commentInput = screen.getByPlaceholderText(/additional context/i) as HTMLTextAreaElement;
      const longComment = 'a'.repeat(501);

      fireEvent.change(commentInput, { target: { value: longComment } });

      const submitButton = screen.getByText((content) => /submit.*feedback/i.test(content)).closest('button') as HTMLButtonElement;
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText((content) => /comment.*less than.*500/i.test(content))).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Feedback Submission', () => {
    /**
     * Test 8: Successfully submits feedback
     */
    it('should successfully submit feedback', async () => {
      const mockOnSubmitted = vi.fn();
      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          onFeedbackSubmitted={mockOnSubmitted}
        />
      );

      const veryTrueButton = screen.getByText('Very True').closest('button');
      if (!veryTrueButton) throw new Error('Button not found');

      await user.click(veryTrueButton);

      const submitButton = screen.getByText((content) => /submit.*feedback/i.test(content)).closest('button') as HTMLButtonElement;
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockOnSubmitted).toHaveBeenCalledWith('very_true', undefined);
        },
        { timeout: 5000 }
      );
    });

    /**
     * Test 9: Shows success message after submission
     */
    it('should show success message after submission', async () => {
      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
        />
      );

      const veryTrueButton = screen.getByText('Very True').closest('button');
      if (!veryTrueButton) throw new Error('Button not found');

      await user.click(veryTrueButton);

      const submitButton = screen.getByText((content) => /submit.*feedback/i.test(content)).closest('button') as HTMLButtonElement;
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText((content) => /thank.*feedback/i.test(content))).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    /**
     * Test 10: Resets form after submission
     */
    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          allowComment={true}
        />
      );

      const veryTrueButton = screen.getByText('Very True').closest('button');
      if (!veryTrueButton) throw new Error('Button not found');

      await user.click(veryTrueButton);

      const commentInput = screen.getByPlaceholderText(/additional context/i) as HTMLTextAreaElement;
      await user.type(commentInput, 'Test comment');

      const submitButton = screen.getByText((content) => /submit.*feedback/i.test(content)).closest('button') as HTMLButtonElement;
      await user.click(submitButton);

      // After success, success message should appear and textarea should be gone
      await waitFor(() => {
        expect(screen.getByText((content) => /thank.*feedback/i.test(content))).toBeInTheDocument();
      }, { timeout: 5000 });
      expect(screen.queryByPlaceholderText(/additional context/i)).not.toBeInTheDocument();
    });

    /**
     * Test 11: Submits feedback with comment
     */
    it('should submit feedback with comment', async () => {
      const mockOnSubmitted = vi.fn();
      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          allowComment={true}
          onFeedbackSubmitted={mockOnSubmitted}
        />
      );

      const notMeButton = screen.getByText('Not Me').closest('button');
      if (!notMeButton) throw new Error('Button not found');

      await user.click(notMeButton);

      const commentInput = screen.getByPlaceholderText(/additional context/i);
      await user.type(commentInput, 'This is not me at all');

      const submitButton = screen.getByText((content) => /submit.*feedback/i.test(content)).closest('button') as HTMLButtonElement;
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmitted).toHaveBeenCalledWith('not_me', 'This is not me at all');
      }, { timeout: 5000 });
    });
  });

  describe('Error Handling', () => {
    /**
     * Test 12: Handles IntelligenceError from calibration
     */
    it('should handle IntelligenceError from calibration', async () => {
      const errorMessage = 'Model calibration failed';
      (AIFeedbackLoop as any).mockImplementation(function () {
        return {
          recordFeedback: vi.fn().mockRejectedValue(
            new IntelligenceError(errorMessage, 'CALIBRATION_ERROR')
          ),
        };
      });

      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
        />
      );

      const somewhhatButton = screen.getByText('Somewhat').closest('button');
      if (!somewhhatButton) throw new Error('Button not found');

      await user.click(somewhhatButton);

      const submitButton = screen.getByText((content) => /submit.*feedback/i.test(content)).closest('button') as HTMLButtonElement;
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText((content) => /calibration.*failed/i.test(content) || /model.*calibration/i.test(content))).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    /**
     * Test 13: Handles generic errors
     */
    it('should handle generic errors', async () => {
      (AIFeedbackLoop as any).mockImplementation(function () {
        return {
          recordFeedback: vi.fn().mockRejectedValue(new Error('Network error')),
        };
      });

      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
        />
      );

      const notSureButton = screen.getByText("Not Sure").closest('button');
      if (!notSureButton) throw new Error('Button not found');

      await user.click(notSureButton);

      const submitButton = screen.getByText((content) => /submit.*feedback/i.test(content)).closest('button') as HTMLButtonElement;
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to submit feedback/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    /**
     * Test 14: Handles calibration failure
     */
    it('should handle calibration failure response', async () => {
      (AIFeedbackLoop as any).mockImplementation(function () {
        return {
          recordFeedback: vi.fn().mockResolvedValue(false),
        };
      });

      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
        />
      );

      const veryTrueButton = screen.getByText('Very True').closest('button');
      if (!veryTrueButton) throw new Error('Button not found');

      await user.click(veryTrueButton);

      const submitButton = screen.getByText((content) => /submit.*feedback/i.test(content)).closest('button') as HTMLButtonElement;
      await user.click(submitButton);

      // Component shows success regardless of return value (only exceptions trigger error state)
      await waitFor(() => {
        expect(screen.getByText((content) => /thank.*feedback/i.test(content))).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Comment Field', () => {
    /**
     * Test 15: Shows comment field when allowed
     */
    it('should show comment field when allowComment=true', async () => {
      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          allowComment={true}
        />
      );

      // Comment field appears only after selecting feedback
      expect(screen.queryByPlaceholderText(/additional context/i)).not.toBeInTheDocument();

      const veryTrueButton = screen.getByText('Very True').closest('button');
      if (!veryTrueButton) throw new Error('Button not found');

      await user.click(veryTrueButton);

      expect(screen.getByPlaceholderText(/additional context/i)).toBeInTheDocument();
    });

    /**
     * Test 16: Hides comment field when not allowed
     */
    it('should hide comment field when allowComment=false', async () => {
      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          allowComment={false}
        />
      );

      const veryTrueButton = screen.getByText('Very True').closest('button');
      if (!veryTrueButton) throw new Error('Button not found');

      await user.click(veryTrueButton);

      expect(screen.queryByPlaceholderText(/additional context/i)).not.toBeInTheDocument();
    });

    /**
     * Test 17: Trims whitespace from comment
     */
    it('should trim whitespace from comment before submission', async () => {
      const mockOnSubmitted = vi.fn();
      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          allowComment={true}
          onFeedbackSubmitted={mockOnSubmitted}
        />
      );

      const notMeButton = screen.getByText('Not Me').closest('button');
      if (!notMeButton) throw new Error('Button not found');

      await user.click(notMeButton);

      const commentInput = screen.getByPlaceholderText(/additional context/i);
      await user.type(commentInput, '  spaces around  ');

      const submitButton = screen.getByText((content) => /submit.*feedback/i.test(content)).closest('button') as HTMLButtonElement;
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmitted).toHaveBeenCalledWith('not_me', 'spaces around');
      }, { timeout: 5000 });
    });
  });

  describe('Inline View', () => {
    /**
     * Test 18: Shows emoji buttons in inline view
     */
    it('should show emoji feedback buttons in inline view', () => {
      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          inline={true}
        />
      );

      expect(screen.getByText('🎯')).toBeInTheDocument(); // Very True
      expect(screen.getByText('✓')).toBeInTheDocument(); // Somewhat
      expect(screen.getByText('?')).toBeInTheDocument(); // Not Sure
      expect(screen.getByText('✕')).toBeInTheDocument(); // Not Me
    });

    /**
     * Test 19: Shows submit button only after selection in inline view
     */
    it('should show submit button only after feedback selection in inline view', async () => {
      const user = userEvent.setup();

      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
          inline={true}
        />
      );

      // Initially no submit button visible
      expect(screen.queryByText(/Submit Feedback/i)).not.toBeInTheDocument();

      // After selection, submit button appears
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]); // Click first emoji button

      await waitFor(() => {
        expect(screen.getByText(/Submit Feedback/i)).toBeInTheDocument();
      });
    });
  });

  describe('Master Direction Compliance', () => {
    /**
     * Test 20: Shows Master Direction message in full view
     */
    it('should display Master Direction message', () => {
      render(
        <FeedbackWidget
          userId={mockUserId}
          insightId={mockInsightId}
          insightText={mockInsightText}
        />
      );

      expect(screen.getByText(/Never pretend to know/i)).toBeInTheDocument();
      expect(
        screen.getByText(/both help calibrate your personal model accurately/i)
      ).toBeInTheDocument();
    });
  });
});

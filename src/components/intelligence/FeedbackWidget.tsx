/**
 * FeedbackWidget Component
 * Collects user feedback on AI insights to calibrate the personal model
 * Uses 4-point feedback scale: very_true, somewhat, not_sure, not_me
 * @module components/intelligence/FeedbackWidget
 */

import React, { useState } from 'react';
import { AIFeedbackLoop } from '@/lib/intelligence/AIFeedbackLoop';
import type { FeedbackType } from '@/lib/intelligence/types';
import { IntelligenceError } from '@/lib/intelligence/types';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import { Alert } from '@/components/composites/Alert';

/**
 * Props for FeedbackWidget
 */
export interface FeedbackWidgetProps {
  /** Current user ID */
  userId: string;

  /** ID of the insight being rated */
  insightId: string;

  /** The insight text (display it to user) */
  insightText: string;

  /** Called when feedback is successfully submitted */
  onFeedbackSubmitted?: (feedbackType: FeedbackType, comment?: string) => void;

  /** Show inline or card view */
  inline?: boolean;

  /** Allow optional comment field */
  allowComment?: boolean;
}

/**
 * FeedbackWidget Component
 * Allows users to rate AI insights and provide feedback for model calibration
 *
 * Master Direction compliance:
 * - User feedback directly calibrates AI model
 * - Feedback options are clear and non-judgmental
 * - "not_me" is equally valid as "very_true"
 * - AI learns from corrective feedback
 */
export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  userId,
  insightId,
  insightText,
  onFeedbackSubmitted,
  inline = false,
  allowComment = true,
}) => {
  // State
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Feedback option definition
   */
  interface FeedbackOption {
    type: FeedbackType;
    emoji: string;
    label: string;
    description: string;
    color: string;
  }

  const feedbackOptions: FeedbackOption[] = [
    {
      type: 'very_true',
      emoji: '🎯',
      label: 'Very True',
      description: 'This is accurate and reflects me well',
      color: 'bg-green-500',
    },
    {
      type: 'somewhat',
      emoji: '✓',
      label: 'Somewhat',
      description: 'This is partially true or mixed',
      color: 'bg-blue-500',
    },
    {
      type: 'not_sure',
      emoji: '?',
      label: "Not Sure",
      description: "I'm uncertain about this",
      color: 'bg-yellow-500',
    },
    {
      type: 'not_me',
      emoji: '✕',
      label: 'Not Me',
      description: 'This does not describe me',
      color: 'bg-red-500',
    },
  ];

  /**
   * Handle feedback submission
   * Calls AIFeedbackLoop to calibrate model with user feedback
   */
  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!selectedFeedback) {
      setError('Please select a feedback option');
      return;
    }

    if (comment.trim().length > 500) {
      setError('Comment must be less than 500 characters');
      return;
    }

    setIsLoading(true);

    try {
      const feedbackLoop = new AIFeedbackLoop();

      // Submit feedback and trigger model calibration
      await feedbackLoop.recordFeedback(
        userId,
        insightId,
        selectedFeedback,
        comment.trim() || undefined
      );

      setSuccess(true);
      setSelectedFeedback(null);
      setComment('');

      onFeedbackSubmitted?.(selectedFeedback, comment.trim() || undefined);
    } catch (err) {
      if (err instanceof IntelligenceError) {
        setError(`Error: ${err.message} (${err.code})`);
      } else {
        setError(`Failed to submit feedback: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (inline) {
    return (
      <div className="space-y-3">
        {error && <Alert variant="error" message={error} />}
        {success && <Alert variant="success" message="Thank you for your feedback!" />}

        {/* Quick feedback buttons */}
        <div className="flex gap-2">
          {feedbackOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedFeedback(option.type)}
              disabled={isLoading}
              title={option.description}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedFeedback === option.type
                  ? `${option.color} text-white`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {option.emoji}
            </button>
          ))}
        </div>

        {/* Submit button */}
        {selectedFeedback && (
          <Button
            variant="primary"
            size="sm"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full"
          >
            {isLoading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        )}
      </div>
    );
  }

  // Full card view
  return (
    <Card className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
            How accurate is this?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your feedback helps improve your personal AI model
          </p>
        </div>

        {/* Insight display */}
        <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-800 dark:text-slate-200 italic">
            "{insightText}"
          </p>
        </div>

        {error && <Alert variant="error" message={error} />}
        {success && <Alert variant="success" message="Thank you for your feedback! Your model will improve with this data." />}

        {/* Feedback options */}
        <div className="space-y-2">
          {feedbackOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedFeedback(option.type)}
              disabled={isLoading}
              className={`w-full p-3 rounded-lg text-left transition-all border-2 ${
                selectedFeedback === option.type
                  ? `border-${option.color.split('-')[1]}-500 bg-${option.color.split('-')[1]}-50 dark:bg-${option.color.split('-')[1]}-900`
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{option.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {option.description}
                  </div>
                </div>
                {selectedFeedback === option.type && (
                  <div className={`${option.color} text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold`}>
                    ✓
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Comment field (optional) */}
        {allowComment && selectedFeedback && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Add a note (optional)
            </label>
            <textarea
              placeholder="Any additional context to help AI understand?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isLoading}
              maxLength={500}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-950 dark:text-white resize-none"
              rows={3}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {comment.length}/500 characters
            </p>
          </div>
        )}

        {/* Info message */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-xs text-blue-700 dark:text-blue-200 space-y-1">
          <div>
            <strong>Master Direction:</strong> "Never pretend to know"
          </div>
          <div>
            Your feedback is equally important whether you say "Very True" or "Not Me".
            Both help calibrate your personal model accurately.
          </div>
        </div>

        {/* Submit button */}
        <Button
          variant={selectedFeedback ? 'primary' : 'secondary'}
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedFeedback || isLoading}
          className="w-full"
        >
          {isLoading ? 'Submitting...' : selectedFeedback ? 'Submit Feedback' : 'Select a feedback option'}
        </Button>
      </div>
    </Card>
  );
};

export default FeedbackWidget;

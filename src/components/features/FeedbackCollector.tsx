/**
 * FeedbackCollector.tsx
 * Phase F: Collect feedback after Twin response
 */

import React, { useState } from 'react';
import * as FeedbackService from '../../services/FeedbackService';
import { useFeedback } from '../../contexts/FeedbackContext';
import type { Sentiment, FeedbackType } from '../../types/feedback';

interface FeedbackCollectorProps {
  userId: string;
  twinId: string;
  responseId: string;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackCollector({
  userId,
  twinId,
  responseId,
  onFeedbackSubmitted,
}: FeedbackCollectorProps) {
  const { setIsLoading } = useFeedback();
  const [sentiment, setSentiment] = useState<Sentiment>('neutral');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('quality');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await FeedbackService.saveFeedback({
        userId,
        twinId,
        responseId,
        feedbackType,
        sentiment,
        comment: comment || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSentiment('neutral');
        setComment('');
        onFeedbackSubmitted?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
        ✓ Thank you for your feedback!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded bg-gray-50">
      <div className="text-sm font-medium">Was this response helpful?</div>

      {/* Sentiment buttons */}
      <div className="flex gap-2">
        {(['positive', 'neutral', 'negative'] as const).map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setSentiment(s)}
            className={`px-3 py-1 rounded text-sm transition ${
              sentiment === s
                ? s === 'positive'
                  ? 'bg-green-500 text-white'
                  : s === 'negative'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-400 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {s === 'positive' ? '👍' : s === 'negative' ? '👎' : '😐'}
          </button>
        ))}
      </div>

      {/* Feedback type */}
      <select
        value={feedbackType}
        onChange={e => setFeedbackType(e.target.value as FeedbackType)}
        className="w-full px-2 py-1 text-sm border rounded"
      >
        <option value="quality">Quality</option>
        <option value="relevance">Relevance</option>
        <option value="accuracy">Accuracy</option>
        <option value="tone">Tone</option>
        <option value="helpfulness">Helpfulness</option>
      </select>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Optional comment..."
        rows={2}
        className="w-full px-2 py-1 text-sm border rounded resize-none"
      />

      {/* Error */}
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Submit Feedback
      </button>
    </form>
  );
}

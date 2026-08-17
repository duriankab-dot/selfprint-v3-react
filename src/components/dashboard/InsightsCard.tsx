import React, { useState } from 'react';
import './InsightsCard.css';

interface InsightsCardProps {
  id: string;
  label: string;
  value: string | number;
  subtitle: string;
  insightText: string;
  onFeedbackSubmit?: (feedback: FeedbackData) => Promise<void>;
  evidence: 'KNOW' | 'INFER' | 'UNKNOWN';
  evidenceDetails?: string;
}

interface FeedbackData {
  insightId: string;
  sentiment: 'very_true' | 'somewhat' | 'not_sure' | 'not_me';
  comment?: string;
}

const InsightsCard: React.FC<InsightsCardProps> = ({
  id,
  label,
  value,
  subtitle,
  insightText,
  onFeedbackSubmit,
  evidence,
  evidenceDetails,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFeedbackSubmit = async () => {
    if (!selectedSentiment) return;

    try {
      setIsSubmitting(true);
      setSubmitStatus('idle');

      if (onFeedbackSubmit) {
        await onFeedbackSubmit({
          insightId: id,
          sentiment: selectedSentiment as FeedbackData['sentiment'],
          comment: feedbackComment || undefined,
        });
      }

      setSubmitStatus('success');
      setShowFeedback(false);
      setSelectedSentiment(null);
      setFeedbackComment('');

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      // Failed to submit feedback
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="insights-card">
      <div className="insights-header">
        <div className="insights-label">{label}</div>
        <div className={`insights-evidence-badge insights-evidence-${evidence.toLowerCase()}`} title={evidenceDetails}>
          {evidence}
        </div>
      </div>
      <div className="insights-value">{value}</div>
      <div className="insights-subtitle">{subtitle}</div>
      <div className="insights-text">{insightText}</div>

      {/* Feedback Section */}
      <div className="insights-feedback-section">
        {!showFeedback ? (
          <button
            className="insights-feedback-trigger"
            onClick={() => setShowFeedback(true)}
            aria-label="Give feedback on this insight"
          >
            💭 How accurate is this?
          </button>
        ) : (
          <div className="insights-feedback-form">
            <p className="feedback-prompt">Does this ring true?</p>

            {/* Sentiment Buttons */}
            <div className="feedback-buttons">
              <button
                className={`feedback-btn ${selectedSentiment === 'very_true' ? 'selected' : ''}`}
                onClick={() => setSelectedSentiment('very_true')}
                title="Very true"
              >
                ✅ Very true
              </button>
              <button
                className={`feedback-btn ${selectedSentiment === 'somewhat' ? 'selected' : ''}`}
                onClick={() => setSelectedSentiment('somewhat')}
                title="Somewhat true"
              >
                🤔 Somewhat
              </button>
              <button
                className={`feedback-btn ${selectedSentiment === 'not_sure' ? 'selected' : ''}`}
                onClick={() => setSelectedSentiment('not_sure')}
                title="Not sure"
              >
                ❓ Not sure
              </button>
              <button
                className={`feedback-btn ${selectedSentiment === 'not_me' ? 'selected' : ''}`}
                onClick={() => setSelectedSentiment('not_me')}
                title="Not me"
              >
                ❌ Not me
              </button>
            </div>

            {/* Optional Comment */}
            <textarea
              className="feedback-comment"
              placeholder="Optional: Tell us why (helps our AI learn)"
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              maxLength={500}
              rows={3}
            />

            {/* Submit & Close Buttons */}
            <div className="feedback-actions">
              <button
                className="feedback-submit"
                onClick={handleFeedbackSubmit}
                disabled={!selectedSentiment || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Feedback'}
              </button>
              <button
                className="feedback-cancel"
                onClick={() => {
                  setShowFeedback(false);
                  setSelectedSentiment(null);
                  setFeedbackComment('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <p className="feedback-success">✅ Feedback saved! Thanks for helping us improve.</p>
            )}
            {submitStatus === 'error' && (
              <p className="feedback-error">❌ Failed to save feedback. Please try again.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsCard;

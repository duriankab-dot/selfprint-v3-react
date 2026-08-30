/**
 * 💡 InsightCardWithFeedback Component — Insight + Feedback Collection
 *
 * **ทำหน้าที่:**
 * - Display AI insight/observation
 * - Collect user feedback (very_true / somewhat / not_sure / not_me)
 * - Show confidence % of insight
 * - Display evidence count
 * - Update accuracy metrics real-time
 * - Show Twin confidence badge
 *
 * **Input Props:**
 * - insight: string (AI insight text)
 * - insightId: string (for feedback storage)
 * - category?: string (pattern / strength / memory / etc)
 * - confidence?: number (0-1)
 * - evidenceCount?: number (# of evidence points)
 * - userId: string
 * - onFeedbackSubmitted?: () => void
 *
 * **Output:**
 * - Card with insight + confidence bar + feedback buttons
 * - Real-time feedback submission
 * - Accuracy badge update
 *
 * @module intelligence/InsightCardWithFeedback
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { AIFeedbackLoop } from '@/lib/intelligence/AIFeedbackLoop';
import type { FeedbackType } from '@/lib/intelligence/types';
import './InsightCardWithFeedback.css';

// ============================================================================
// Types
// ============================================================================

interface InsightCardWithFeedbackProps {
  insight: string;
  insightId: string;
  category?: string;
  confidence?: number;
  evidenceCount?: number;
  userId: string;
  onFeedbackSubmitted?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ✅ InsightCardWithFeedback — Insight card พร้อม feedback collection
 */
export const InsightCardWithFeedback: React.FC<InsightCardWithFeedbackProps> = ({
  insight,
  insightId,
  category,
  confidence = 0.7,
  evidenceCount = 0,
  userId,
  onFeedbackSubmitted,
}) => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);

  const feedbackLoop = new AIFeedbackLoop();

  // Mutation สำหรับ submit feedback
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackType: FeedbackType) => {
      return feedbackLoop.recordFeedback(userId, insightId, feedbackType);
    },
    onSuccess: () => {
      setFeedbackSubmitted(true);
      setSelectedFeedback(null);

      // Invalidate accuracy metrics เพื่อ update real-time
      queryClient.invalidateQueries({ queryKey: ['accuracyMetrics', userId] });

      // Call callback if provided
      onFeedbackSubmitted?.();

      // Auto-reset after 2 seconds
      setTimeout(() => setFeedbackSubmitted(false), 2000);
    },
    onError: () => {
      // Failed to submit feedback
    },
  });

  const handleFeedbackClick = (feedbackType: FeedbackType) => {
    setSelectedFeedback(feedbackType);
    submitFeedbackMutation.mutate(feedbackType);
  };

  const confidencePercent = Math.round(confidence * 100);
  const confidenceColor = getConfidenceColor(confidence);
  const categoryIcon = getCategoryIcon(category);

  return (
    <div className="insight-card-feedback">
      {/* Header: category + confidence badge */}
      <div className="insight-card__header">
        {category && <span className="insight-card__category">{categoryIcon}</span>}

        <div className="insight-card__confidence-badge" style={{ borderColor: confidenceColor }}>
          <span className="confidence-badge__percent" style={{ color: confidenceColor }}>
            {confidencePercent}%
          </span>
          <span className="confidence-badge__label">{isTh ? 'มั่นใจ' : 'Confidence'}</span>
        </div>
      </div>

      {/* Main insight text */}
      <div className="insight-card__content">
        <p className="insight-card__text">{insight}</p>
      </div>

      {/* Evidence count */}
      {evidenceCount > 0 && (
        <div className="insight-card__metadata">
          <span className="insight-metadata__item">📌 {evidenceCount} {isTh ? 'หลักฐาน' : 'pieces of evidence'}</span>
        </div>
      )}

      {/* Feedback section */}
      <div className="insight-card__feedback-section">
        {feedbackSubmitted && (
          <div className="insight-card__feedback-success">
            <span>✅ {isTh ? 'ขอบคุณสำหรับ feedback!' : 'Thanks for the feedback!'}</span>
          </div>
        )}

        {!feedbackSubmitted && (
          <div className="insight-card__feedback-prompt">
            <p className="feedback-prompt__label">{isTh ? 'สิ่งนี้ตรงกับคุณไหม?' : 'Does this match you?'}</p>

            <div className="feedback-buttons">
              <button
                className={`feedback-btn feedback-btn--very-true ${
                  selectedFeedback === 'very_true' ? 'active' : ''
                }`}
                onClick={() => handleFeedbackClick('very_true')}
                disabled={submitFeedbackMutation.isPending}
                title={isTh ? 'ตรงกับฉันเลย' : 'Matches me exactly'}
              >
                👍 {isTh ? 'ถูกต้อง' : 'Accurate'}
              </button>

              <button
                className={`feedback-btn feedback-btn--somewhat ${
                  selectedFeedback === 'somewhat' ? 'active' : ''
                }`}
                onClick={() => handleFeedbackClick('somewhat')}
                disabled={submitFeedbackMutation.isPending}
                title={isTh ? 'บางส่วนถูก' : 'Partially right'}
              >
                🤔 {isTh ? 'บางส่วน' : 'Somewhat'}
              </button>

              <button
                className={`feedback-btn feedback-btn--not-sure ${
                  selectedFeedback === 'not_sure' ? 'active' : ''
                }`}
                onClick={() => handleFeedbackClick('not_sure')}
                disabled={submitFeedbackMutation.isPending}
                title={isTh ? 'ไม่แน่ใจ' : 'Not sure'}
              >
                ❓ {isTh ? 'ไม่แน่' : 'Not sure'}
              </button>

              <button
                className={`feedback-btn feedback-btn--not-me ${
                  selectedFeedback === 'not_me' ? 'active' : ''
                }`}
                onClick={() => handleFeedbackClick('not_me')}
                disabled={submitFeedbackMutation.isPending}
                title={isTh ? 'ไม่ใช่ฉัน' : 'Not me'}
              >
                ❌ {isTh ? 'ไม่ใช่' : 'Not me'}
              </button>
            </div>
          </div>
        )}

        {submitFeedbackMutation.isError && (
          <div className="insight-card__feedback-error">
            <span>⚠️ {isTh ? 'ไม่สามารถบันทึก feedback ได้' : 'Could not save feedback'}</span>
          </div>
        )}
      </div>

      {/* Loading state */}
      {submitFeedbackMutation.isPending && (
        <div className="insight-card__loading">
          <span className="insight-card__spinner" />
          <span>{isTh ? 'บันทึกข้อมูล...' : 'Saving...'}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * ✅ getConfidenceColor() — เลือกสีตาม confidence level
 */
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#10b981'; // green
  if (confidence >= 0.6) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

/**
 * ✅ getCategoryIcon() — emoji ตาม category
 */
function getCategoryIcon(category?: string): string {
  const icons: Record<string, string> = {
    pattern: '🔄',
    strength: '✨',
    memory: '💎',
    question: '💭',
    blind_spot: '🕶️',
    value: '❤️',
    goal: '🎯',
  };
  return icons[category || 'insight'] || '💡';
}

export default InsightCardWithFeedback;

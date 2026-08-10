/**
 * 📊 FeedbackSummary Component — Feedback statistics + analytics
 *
 * **ทำหน้าที่:**
 * - Display feedback statistics (accuracy % + trend)
 * - Show feedback history chart (mockup bar chart)
 * - Display feedback breakdown by type (very_true / somewhat / not_sure / not_me)
 * - Show recent feedback items
 * - Progress toward accuracy goal (90%+)
 *
 * **Input Props:**
 * - userId: string
 * - accuracy?: number (0-1)
 * - trend?: 'improving' | 'stable' | 'declining'
 * - feedbackCount?: number
 * - totalInsights?: number
 * - recent?: InsightFeedback[]
 *
 * @module intelligence/FeedbackSummary
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AIFeedbackLoop } from '@/lib/intelligence/AIFeedbackLoop';
import './FeedbackSummary.css';

// ============================================================================
// Types
// ============================================================================

interface FeedbackSummaryProps {
  userId: string;
  isLoading?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ✅ FeedbackSummary — Display feedback statistics + trends
 */
export const FeedbackSummary: React.FC<FeedbackSummaryProps> = ({
  userId,
  isLoading: externalLoading = false,
}) => {
  const feedbackLoop = useMemo(() => new AIFeedbackLoop(), []);

  // ฟ้ได้ accuracy metrics
  const { data: accuracyMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['accuracyMetrics', userId],
    queryFn: () => feedbackLoop.getAccuracyMetrics(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });

  // ฟ้ได้ recent feedback
  const { data: recentFeedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['recentFeedback', userId],
    queryFn: () => feedbackLoop.getRecentFeedback(userId, 10),
    enabled: !!userId,
    staleTime: 30_000,
  });

  const isLoading = externalLoading || metricsLoading || feedbackLoading;

  // ===============================================
  // Calculate feedback breakdown (by feedback type)
  // ===============================================
  const feedbackBreakdown = useMemo(() => {
    const breakdown = {
      very_true: 0,
      somewhat: 0,
      not_sure: 0,
      not_me: 0,
    };

    recentFeedback.forEach((fb) => {
      if (fb.feedbackType === 'very_true') breakdown.very_true++;
      else if (fb.feedbackType === 'somewhat') breakdown.somewhat++;
      else if (fb.feedbackType === 'not_sure') breakdown.not_sure++;
      else if (fb.feedbackType === 'not_me') breakdown.not_me++;
    });

    return breakdown;
  }, [recentFeedback]);

  // ===============================================
  // Calculate accuracy progress
  // ===============================================
  const accuracyPercent = accuracyMetrics?.accuracy
    ? Math.round(accuracyMetrics.accuracy * 100)
    : 0;

  const goalPercent = 90;
  const progressPercent = Math.min((accuracyPercent / goalPercent) * 100, 100);

  const trendIcon =
    accuracyMetrics?.trend === 'improving'
      ? '📈'
      : accuracyMetrics?.trend === 'declining'
        ? '📉'
        : '➡️';

  // ===============================================
  // Loading state
  // ===============================================
  if (isLoading) {
    return (
      <div className="feedback-summary feedback-summary--loading">
        <div className="feedback-summary__spinner" aria-hidden="true" />
        <p>กำลังโหลดสถิติ feedback...</p>
      </div>
    );
  }

  if (!accuracyMetrics) {
    return (
      <div className="feedback-summary feedback-summary--empty">
        <p className="feedback-summary__empty-icon">📊</p>
        <h3>ยังไม่มี Feedback</h3>
        <p>ให้ feedback กับ insights เพื่อให้ AI Twin เรียนรู้</p>
      </div>
    );
  }

  return (
    <div className="feedback-summary">
      {/* ================================================================
          HEADER: Accuracy Badge + Goal
      ================================================================ */}
      <div className="feedback-summary__header">
        <div className="accuracy-card">
          <div className="accuracy-card__top">
            <div className="accuracy-value">
              <span className="accuracy-percent">{accuracyPercent}%</span>
              <span className="accuracy-trend">{trendIcon}</span>
            </div>
            <div className="accuracy-labels">
              <p className="accuracy-label">ความแม่นยำ</p>
              <p className="accuracy-subtext">
                {accuracyMetrics.trend === 'improving' && 'ดีขึ้น'}
                {accuracyMetrics.trend === 'declining' && 'ลดลง'}
                {accuracyMetrics.trend === 'stable' && 'คงที่'}
              </p>
            </div>
          </div>

          {/* Progress to goal */}
          <div className="accuracy-goal">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="progress-text">เป้าหมาย: {goalPercent}%</p>
          </div>
        </div>

        {/* Stats count */}
        <div className="feedback-stats">
          <div className="stat-item">
            <span className="stat-icon">👍</span>
            <span className="stat-value">{accuracyMetrics.totalInsights}</span>
            <span className="stat-label">Insights</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💬</span>
            <span className="stat-value">{recentFeedback.length}</span>
            <span className="stat-label">Feedback</span>
          </div>
        </div>
      </div>

      {/* ================================================================
          FEEDBACK BREAKDOWN
      ================================================================ */}
      <div className="feedback-breakdown">
        <h3 className="feedback-breakdown__title">📈 Feedback Breakdown</h3>
        <div className="breakdown-items">
          <div className="breakdown-item">
            <div className="item-label">
              <span className="item-emoji">✅</span>
              <span>Very True</span>
            </div>
            <div className="item-bar">
              <div
                className="item-fill item-fill--true"
                style={{
                  width: `${recentFeedback.length > 0 ? (feedbackBreakdown.very_true / recentFeedback.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="item-count">{feedbackBreakdown.very_true}</span>
          </div>

          <div className="breakdown-item">
            <div className="item-label">
              <span className="item-emoji">👍</span>
              <span>Somewhat</span>
            </div>
            <div className="item-bar">
              <div
                className="item-fill item-fill--somewhat"
                style={{
                  width: `${recentFeedback.length > 0 ? (feedbackBreakdown.somewhat / recentFeedback.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="item-count">{feedbackBreakdown.somewhat}</span>
          </div>

          <div className="breakdown-item">
            <div className="item-label">
              <span className="item-emoji">❓</span>
              <span>Not Sure</span>
            </div>
            <div className="item-bar">
              <div
                className="item-fill item-fill--notsure"
                style={{
                  width: `${recentFeedback.length > 0 ? (feedbackBreakdown.not_sure / recentFeedback.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="item-count">{feedbackBreakdown.not_sure}</span>
          </div>

          <div className="breakdown-item">
            <div className="item-label">
              <span className="item-emoji">❌</span>
              <span>Not Me</span>
            </div>
            <div className="item-bar">
              <div
                className="item-fill item-fill--notme"
                style={{
                  width: `${recentFeedback.length > 0 ? (feedbackBreakdown.not_me / recentFeedback.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="item-count">{feedbackBreakdown.not_me}</span>
          </div>
        </div>
      </div>

      {/* ================================================================
          INSIGHTS (ทำหน้าที่เป็น help text + tips)
      ================================================================ */}
      <div className="feedback-insights">
        <h3 className="feedback-insights__title">💡 Tips</h3>
        <ul className="insights-list">
          <li>
            {accuracyPercent < 60 && '🎯 ให้ feedback มากขึ้นเพื่อปรับปรุงความแม่นยำ'}
            {accuracyPercent >= 60 && accuracyPercent < 80 && '📈 AI Twin เรียนรู้ได้ดี ให้ feedback ต่อไป'}
            {accuracyPercent >= 80 && '⭐ ยอดเยี่ยม AI Twin เข้าใจคุณเป็นอย่างดี'}
          </li>
          <li>
            {feedbackBreakdown.not_me > feedbackBreakdown.very_true * 0.5
              ? '🔄 ลองบันทึก memory ใหม่เพื่ออัปเดตข้อมูลของ AI'
              : '✅ AI Twin สนับสนุนโดยข้อมูลที่มีความหมาย'}
          </li>
          <li>💬 Feedback ของคุณช่วยให้ AI Twin เข้าใจคุณได้ดีขึ้น</li>
        </ul>
      </div>
    </div>
  );
};

export default FeedbackSummary;

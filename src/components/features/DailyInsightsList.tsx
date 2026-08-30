/**
 * 📋 DailyInsightsList Component — Display Daily Insights with Feedback
 *
 * **ทำหน้าที่:**
 * - Show list of daily AI insights
 * - Collect user feedback for each insight
 * - Update accuracy metrics real-time
 * - Display Twin confidence in insights
 * - Show accuracy header badge
 *
 * **Input Props:**
 * - userId: string
 * - insights: Array of { text, id, category, confidence, evidenceCount }
 * - onFeedbackUpdate?: () => void
 *
 * **Output:**
 * - List of insight cards with feedback buttons
 * - Real-time accuracy updates
 * - Twin confidence visualization
 *
 * @module features/DailyInsightsList
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { AIFeedbackLoop } from '@/lib/intelligence/AIFeedbackLoop';
import { InsightCardWithFeedback } from '@/components/intelligence/InsightCardWithFeedback';
import { AccuracyBadgeFromMetrics } from '@/components/intelligence/AccuracyBadge';
import './DailyInsightsList.css';

// ============================================================================
// Types
// ============================================================================

interface DailyInsight {
  id: string;
  text: string;
  category?: string;
  confidence?: number;
  evidenceCount?: number;
}

interface DailyInsightsListProps {
  userId: string;
  insights: DailyInsight[];
  onFeedbackUpdate?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ✅ DailyInsightsList — List of insights with feedback + accuracy tracking
 */
export const DailyInsightsList: React.FC<DailyInsightsListProps> = ({
  userId,
  insights,
  onFeedbackUpdate,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const feedbackLoop = new AIFeedbackLoop();

  // Fetch accuracy metrics
  const { data: accuracyMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['accuracyMetrics', userId],
    queryFn: () => feedbackLoop.getAccuracyMetrics(userId),
    enabled: !!userId,
    staleTime: 30_000,
    retry: 2,
  });

  const handleFeedbackSubmitted = () => {
    // Callback to parent if provided
    onFeedbackUpdate?.();
  };

  if (insights.length === 0) {
    return (
      <div className="daily-insights-list daily-insights-list--empty">
        <div className="insights-empty-state">
          <p className="insights-empty-icon">✨</p>
          <h3>{isTh ? 'ยังไม่มี Insights วันนี้' : 'No insights today yet'}</h3>
          <p>
            {isTh
              ? 'ทำ reflection หรือบันทึก memories เพื่อให้ Twin เรียนรู้เพิ่มเติมเกี่ยวกับคุณ'
              : 'Do a reflection or log memories so your Twin can learn more about you'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-insights-list">
      {/* Accuracy header */}
      {!metricsLoading && accuracyMetrics && (
        <div className="insights-list__accuracy-header">
          <h3 className="accuracy-header__title">{isTh ? 'ความแม่นยำของ Twin' : "Twin's Accuracy"}</h3>
          <AccuracyBadgeFromMetrics metrics={accuracyMetrics} compact={false} />
        </div>
      )}

      {/* Insights section */}
      <div className="insights-list__content">
        <div className="insights-list__header">
          <h3 className="insights-list__title">
            💡 Daily Insights ({insights.length})
          </h3>
          <p className="insights-list__subtitle">
            {isTh ? 'ให้ feedback เพื่อช่วย Twin ให้เชี่ยวชาญมากขึ้น' : 'Give feedback to help your Twin get sharper'}
          </p>
        </div>

        {/* Insights grid */}
        <div className="insights-grid">
          {insights.map((insight) => (
            <InsightCardWithFeedback
              key={insight.id}
              insight={insight.text}
              insightId={insight.id}
              category={insight.category}
              confidence={insight.confidence}
              evidenceCount={insight.evidenceCount}
              userId={userId}
              onFeedbackSubmitted={handleFeedbackSubmitted}
            />
          ))}
        </div>
      </div>

      {/* Help text */}
      <div className="insights-list__help">
        <p className="insights-list__help-text">
          💡{' '}
          {isTh ? (
            <>
              <strong>ทำไมให้ feedback?</strong> ความเห็นของคุณช่วยให้ Twin เข้าใจคุณได้ลึกขึ้น
              และสร้าง insights ที่แม่นยำมากขึ้นในอนาคต
            </>
          ) : (
            <>
              <strong>Why give feedback?</strong> Your feedback helps your Twin understand you more deeply
              and build more accurate insights in the future.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default DailyInsightsList;

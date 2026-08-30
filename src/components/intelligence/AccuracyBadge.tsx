/**
 * 🎯 AccuracyBadge Component — แสดงความแม่นยำของ AI Twin
 *
 * **ทำหน้าที่:**
 * - แสดง accuracy % ของ AI insights
 * - Show trend (improving ↑ / stable → / declining ↓)
 * - Display evidence count (จำนวน insights ที่ได้ feedback)
 * - Color-coded by confidence level
 *
 * **Input Props:**
 * - accuracy: number (0-1)
 * - trend: 'improving' | 'stable' | 'declining'
 * - totalInsights: number (# of insights user gave feedback on)
 * - compact?: boolean (default: false)
 *
 * **Output:**
 * - Styled badge showing accuracy % + trend + insight count
 *
 * @module intelligence/AccuracyBadge
 */

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { AccuracyMetrics } from '@/lib/intelligence/types';
import './AccuracyBadge.css';

// ============================================================================
// Types
// ============================================================================

interface AccuracyBadgeProps {
  accuracy: number; // 0-1
  trend: 'improving' | 'stable' | 'declining';
  totalInsights: number;
  compact?: boolean;
  className?: string;
}

interface AccuracyBadgeFromMetricsProps {
  metrics: AccuracyMetrics | null | undefined;
  compact?: boolean;
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ✅ AccuracyBadge — Component ที่ render badge ตรง ๆ
 */
export const AccuracyBadge: React.FC<AccuracyBadgeProps> = ({
  accuracy,
  trend,
  totalInsights,
  compact = false,
  className = '',
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const accuracyPercent = Math.round(accuracy * 100);
  const badgeColor = getAccuracyColor(accuracy);
  const trendIcon = getTrendIcon(trend);
  const trendLabel = getTrendLabel(trend, isTh);

  if (compact) {
    return (
      <div className={`accuracy-badge accuracy-badge--compact ${className}`}>
        <span className="accuracy-badge__percent" style={{ color: badgeColor }}>
          {accuracyPercent}%
        </span>
        <span className="accuracy-badge__trend">{trendIcon}</span>
      </div>
    );
  }

  return (
    <div className={`accuracy-badge ${className}`}>
      <div className="accuracy-badge__container" style={{ borderColor: badgeColor }}>
        {/* Percentage */}
        <div className="accuracy-badge__main">
          <span className="accuracy-badge__percent" style={{ color: badgeColor }}>
            {accuracyPercent}%
          </span>
          <span className="accuracy-badge__label">{isTh ? 'ความแม่นยำ' : 'Accuracy'}</span>
        </div>

        {/* Trend */}
        <div className="accuracy-badge__trend-section">
          <span className="accuracy-badge__trend-icon">{trendIcon}</span>
          <span className="accuracy-badge__trend-label">{trendLabel}</span>
        </div>

        {/* Evidence count */}
        <div className="accuracy-badge__evidence">
          <span className="accuracy-badge__evidence-count">{totalInsights}</span>
          <span className="accuracy-badge__evidence-label">insights</span>
        </div>
      </div>

      {/* Helper text */}
      <p className="accuracy-badge__helper">
        {isTh
          ? `ตาม feedback ของคุณจาก ${totalInsights} insights ที่ยูสให้ rating`
          : `Based on your feedback from ${totalInsights} rated insights`}
      </p>
    </div>
  );
};

/**
 * ✅ AccuracyBadgeFromMetrics — Convenience wrapper ที่ใช้ AccuracyMetrics type
 */
export const AccuracyBadgeFromMetrics: React.FC<AccuracyBadgeFromMetricsProps> = ({
  metrics,
  compact = false,
  className = '',
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';

  if (!metrics || metrics.totalInsights === 0) {
    return (
      <div className={`accuracy-badge accuracy-badge--empty ${className}`}>
        <p>{isTh ? 'ยังไม่มี insights ให้ rating ส่วน AI ยัง learning...' : 'No rated insights yet — AI is still learning...'}</p>
      </div>
    );
  }

  return (
    <AccuracyBadge
      accuracy={metrics.accuracy}
      trend={metrics.trend}
      totalInsights={metrics.totalInsights}
      compact={compact}
      className={className}
    />
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * ✅ getAccuracyColor() — เลือกสีตามระดับ accuracy
 *
 * **Logic:**
 * - 0.8+: เขียว (excellent)
 * - 0.6-0.8: เหลือง (good)
 * - <0.6: ส้ม (needs improvement)
 */
function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 0.8) return '#10b981'; // green
  if (accuracy >= 0.6) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

/**
 * ✅ getTrendIcon() — emoji ตาม trend
 */
function getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return '📈';
    case 'declining':
      return '📉';
    default:
      return '➡️';
  }
}

/**
 * ✅ getTrendLabel() — label ตาม trend
 */
function getTrendLabel(trend: 'improving' | 'stable' | 'declining', isTh: boolean): string {
  if (isTh) {
    switch (trend) {
      case 'improving':
        return 'ดีขึ้น';
      case 'declining':
        return 'ลดลง';
      default:
        return 'คงที่';
    }
  }
  switch (trend) {
    case 'improving':
      return 'Improving';
    case 'declining':
      return 'Declining';
    default:
      return 'Stable';
  }
}

export default AccuracyBadge;

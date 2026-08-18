/**
 * FeedbackDashboard.tsx
 * Phase F: Display feedback analytics
 */

import { useEffect, useState } from 'react';
import * as FeedbackService from '../../services/FeedbackService';
import * as QualityMetricsService from '../../services/QualityMetricsService';
import type { FeedbackStats, QualityMetrics } from '../../types/feedback';

interface FeedbackDashboardProps {
  twinId: string;
}

export function FeedbackDashboard({ twinId }: FeedbackDashboardProps) {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [feedbackStats, qualityMetrics] = await Promise.all([
          FeedbackService.getTwinFeedbackStats(twinId),
          QualityMetricsService.getTwinQualityMetrics(twinId),
        ]);
        setStats(feedbackStats);
        setMetrics(qualityMetrics);
      } catch (err) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [twinId]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading feedback data...
      </div>
    );
  }

  if (!stats || !metrics) {
    return (
      <div className="p-4 text-center text-gray-500">
        No feedback data available
      </div>
    );
  }

  const positivePercent = stats.totalFeedback > 0
    ? ((stats.sentimentBreakdown.positive / stats.totalFeedback) * 100).toFixed(0)
    : 0;

  return (
    <div className="space-y-4">
      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-600">Total Feedback</div>
          <div className="text-2xl font-bold">{stats.totalFeedback}</div>
        </div>

        <div className="p-4 border rounded">
          <div className="text-sm text-gray-600">Positive</div>
          <div className="text-2xl font-bold text-green-600">{positivePercent}%</div>
        </div>

        <div className="p-4 border rounded">
          <div className="text-sm text-gray-600">Quality Score</div>
          <div className="text-2xl font-bold">
            {metrics.averageQualityScore.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="p-4 border rounded">
        <h3 className="font-semibold mb-3">Sentiment Breakdown</h3>
        <div className="space-y-2">
          {['positive', 'neutral', 'negative'].map(sentiment => (
            <div key={sentiment} className="flex items-center gap-2">
              <div className="w-32 text-sm capitalize">{sentiment}</div>
              <div className="flex-1 bg-gray-200 rounded h-5 overflow-hidden">
                <div
                  className={`h-full transition ${
                    sentiment === 'positive'
                      ? 'bg-green-500'
                      : sentiment === 'negative'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                  }`}
                  style={{
                    width: `${
                      stats.totalFeedback > 0
                        ? (stats.sentimentBreakdown[sentiment as keyof typeof stats.sentimentBreakdown] /
                          stats.totalFeedback) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="w-12 text-right text-sm">
                {stats.sentimentBreakdown[sentiment as keyof typeof stats.sentimentBreakdown]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality by World */}
      {Object.keys(metrics.worldMetrics).length > 0 && (
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-3">Quality by World</h3>
          <div className="space-y-2">
            {Object.entries(metrics.worldMetrics).map(([world, data]) => (
              <div key={world} className="flex items-center justify-between text-sm">
                <span className="capitalize">{world}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded h-4 overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${Math.min(data.average, 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right">{data.average.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Areas */}
      {stats.commonImprovementAreas.length > 0 && (
        <div className="p-4 border rounded bg-yellow-50">
          <h3 className="font-semibold mb-2">Suggested Improvements</h3>
          <ul className="text-sm space-y-1">
            {stats.commonImprovementAreas.slice(0, 3).map((area, i) => (
              <li key={i} className="text-gray-700">
                • {area}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * DecisionStats.tsx
 * Display key statistics about Twin's decision history
 * Shows: Total decisions, success rate, best worlds, trends
 */

import { useEffect, useState } from 'react';
import type { DecisionInsights } from '../../types/decision';
import * as DecisionLearningService from '../../services/DecisionLearningService';
import '../../styles/decision-stats.css';

interface DecisionStatsProps {
  twinId: string;
}

export default function DecisionStats({ twinId }: DecisionStatsProps) {
  const [insights, setInsights] = useState<DecisionInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, [twinId]);

  async function loadInsights() {
    try {
      setLoading(true);
      setError(null);
      const data = await DecisionLearningService.getDecisionInsights(twinId);
      setInsights(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load insights';
      setError(msg);
      console.error('Error loading decision insights:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="decision-stats-container">
        <div className="stats-skeleton">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="decision-stats-container">
        <div className="stats-error">Error: {error}</div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="decision-stats-container">
        <div className="stats-empty">No decision data available</div>
      </div>
    );
  }

  return (
    <div className="decision-stats-container">
      <h2 className="stats-title">📊 Decision Intelligence</h2>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Total Decisions */}
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-label">Total Decisions</div>
            <div className="stat-value">{insights.totalDecisions}</div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Success Rate</div>
            <div className="stat-value">{insights.successRate}%</div>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{
                  width: `${insights.successRate}%`,
                  backgroundColor: getSuccessColor(insights.successRate),
                }}
              />
            </div>
          </div>
        </div>

        {/* Best Worlds */}
        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <div className="stat-label">Best Worlds</div>
            <div className="stat-value">
              {insights.bestWorlds.length > 0 ? insights.bestWorlds.join(', ') : 'N/A'}
            </div>
          </div>
        </div>

        {/* Improvement Areas */}
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Areas to Improve</div>
            <div className="stat-value">
              {insights.improvementAreas.length > 0
                ? insights.improvementAreas.slice(0, 1).join(', ')
                : 'None identified'}
            </div>
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="stats-trends">
        <h3>📈 Trends</h3>
        <p className="trends-text">{insights.trends}</p>
      </div>

      {/* Refresh Button */}
      <div className="stats-actions">
        <button onClick={loadInsights} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}

/**
 * Get color based on success rate
 */
function getSuccessColor(rate: number): string {
  if (rate >= 80) return 'var(--success-color, #10b981)';
  if (rate >= 60) return 'var(--warning-color, #f59e0b)';
  return 'var(--error-color, #ef4444)';
}

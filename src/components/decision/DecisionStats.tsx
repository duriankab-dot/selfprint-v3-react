/**
 * DecisionStats.tsx
 * Phase F2a: Statistics card showing decision metrics
 *
 * Displays:
 * - Total decisions count
 * - Success rate (%)
 * - Best/worst worlds
 * - Pending follow-ups
 */

import { useEffect, useState } from 'react';
import type { DecisionInsights } from '../../types/decision';
import * as DecisionLearningService from '../../services/DecisionLearningService';
import * as FollowUpScheduler from '../../services/FollowUpScheduler';

interface DecisionStatsProps {
  twinId: string;
}

interface StatsData {
  insights: DecisionInsights | null;
  pendingFollowUps: number;
  isLoading: boolean;
  error: string | null;
}

export default function DecisionStats({ twinId }: DecisionStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    insights: null,
    pendingFollowUps: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats(prev => ({ ...prev, isLoading: true, error: null }));

        // Load insights
        const insights = await DecisionLearningService.getDecisionInsights(twinId);

        // Load pending follow-ups count
        const pendingFollowUps = await FollowUpScheduler.getOverdueFollowUps(twinId);

        setStats({
          insights,
          pendingFollowUps: pendingFollowUps.length,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load stats',
        }));
      }
    };

    loadStats();
  }, [twinId]);

  if (stats.isLoading) {
    return (
      <div className="decision-stats-container">
        <div className="stats-loading">Loading decision statistics...</div>
      </div>
    );
  }

  if (stats.error || !stats.insights) {
    return (
      <div className="decision-stats-container">
        <div className="stats-error">
          {stats.error || 'Unable to load statistics'}
        </div>
      </div>
    );
  }

  const { insights } = stats;

  return (
    <div className="decision-stats-container">
      <div className="stats-grid">
        {/* Total Decisions */}
        <StatCard
          icon="📋"
          label="Total Decisions"
          value={insights.totalDecisions}
          description={`decisions tracked`}
        />

        {/* Success Rate */}
        <StatCard
          icon="✅"
          label="Success Rate"
          value={`${Math.round(insights.successRate)}%`}
          description={`positive outcomes`}
          color={getSuccessColor(insights.successRate)}
        />

        {/* Best World */}
        <StatCard
          icon="🏆"
          label="Best World"
          value={insights.bestWorlds[0] || 'N/A'}
          description={`strongest area`}
        />

        {/* Pending Follow-ups */}
        <StatCard
          icon="⏰"
          label="Pending Follow-ups"
          value={stats.pendingFollowUps}
          description={`due for reflection`}
          color={stats.pendingFollowUps > 0 ? '#f59e0b' : '#10b981'}
        />
      </div>

      {/* Trends Section */}
      {insights.trends && (
        <div className="stats-trends">
          <h3>📈 Trends</h3>
          <p>{insights.trends}</p>
        </div>
      )}

      {/* Improvement Areas */}
      {insights.improvementAreas && insights.improvementAreas.length > 0 && (
        <div className="stats-improvements">
          <h3>🎯 Areas for Growth</h3>
          <ul>
            {insights.improvementAreas.map((area, idx) => (
              <li key={idx}>{area}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  description: string;
  color?: string;
}

function StatCard({ icon, label, value, description, color }: StatCardProps) {
  return (
    <div className="stat-card" style={color ? { borderLeftColor: color } : undefined}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-description">{description}</div>
      </div>
    </div>
  );
}

/**
 * Determine color based on success rate
 */
function getSuccessColor(rate: number): string {
  if (rate >= 80) return '#10b981'; // green
  if (rate >= 60) return '#3b82f6'; // blue
  if (rate >= 40) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

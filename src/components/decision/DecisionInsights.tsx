/**
 * DecisionInsights.tsx
 * Display detailed insights and learnings from decision history
 * Shows: World-specific insights, patterns, recommendations
 */

import { useEffect, useState } from 'react';
import type { WorldId } from '../../constants/worlds';
import * as DecisionLearningService from '../../services/DecisionLearningService';
import TwinConfidenceIndicator from './TwinConfidenceIndicator';
import '../../styles/decision-insights.css';

interface DecisionInsightsProps {
  twinId: string;
  world?: WorldId;
}

export default function DecisionInsights({ twinId, world }: DecisionInsightsProps) {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, [twinId, world]);

  async function loadInsights() {
    try {
      setLoading(true);
      setError(null);

      if (world) {
        const worldInsights = await DecisionLearningService.getWorldSpecificInsights(
          twinId,
          world
        );
        setInsights(worldInsights);
      } else {
        // Load general insights
        const fullInsights = await DecisionLearningService.getDecisionInsights(twinId);
        setInsights(fullInsights.trends);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load insights';
      setError(msg);
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="decision-insights-container">
        <div className="insights-skeleton">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="decision-insights-container">
        <div className="insights-error">Error: {error}</div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="decision-insights-container">
        <div className="insights-empty">
          {world
            ? 'No insights available for this world yet'
            : 'No decision insights available yet'}
        </div>
      </div>
    );
  }

  return (
    <div className="decision-insights-container">
      <div className="insights-header">
        <h3 className="insights-title">💡 Insights</h3>
        {world && <TwinConfidenceIndicator twinId={twinId} world={world} size="small" />}
      </div>

      <div className="insights-content">
        <p className="insights-text">{insights}</p>
      </div>

      {/* Refresh Button */}
      <div className="insights-actions">
        <button onClick={loadInsights} className="btn-refresh-small">
          🔄
        </button>
      </div>
    </div>
  );
}

/**
 * DecisionInsights.tsx
 * Phase F2b: Display world-specific insights and patterns
 */

import { useEffect, useState } from 'react';
import type { WorldId } from '../../constants/worlds';
import { WORLDS } from '../../constants/worlds';
import * as DecisionLearningService from '../../services/DecisionLearningService';

interface DecisionInsightsProps {
  twinId: string;
  selectedWorld?: WorldId;
}

export default function DecisionInsights({ twinId, selectedWorld }: DecisionInsightsProps) {
  const [insights, setInsights] = useState<Map<WorldId, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setIsLoading(true);
        const insightMap = new Map<WorldId, string>();

        // Load insights for each world
        for (const worldId of Object.keys(WORLDS) as WorldId[]) {
          const insight = await DecisionLearningService.getWorldSpecificInsights(twinId, worldId);
          insightMap.set(worldId, insight);
        }

        setInsights(insightMap);
      } catch (err) {
        // Error handled silently - display defaults
      } finally {
        setIsLoading(false);
      }
    };

    loadInsights();
  }, [twinId]);

  if (isLoading) {
    return <div className="insights-loading">Loading insights...</div>;
  }

  // If specific world selected, show that insight
  if (selectedWorld && insights.has(selectedWorld)) {
    const world = WORLDS[selectedWorld];
    return (
      <div className="decision-insight-card">
        <div className="insight-header">
          <span className="world-emoji">{world.emoji}</span>
          <h3>{world.name} Insights</h3>
        </div>
        <p className="insight-text">{insights.get(selectedWorld)}</p>
      </div>
    );
  }

  // Show all worlds' insights
  return (
    <div className="decision-insights-container">
      <h2>🔍 World-Specific Insights</h2>
      <div className="insights-grid">
        {Array.from(insights.entries()).map(([worldId, insight]) => {
          const world = WORLDS[worldId as WorldId];
          return (
            <div key={worldId} className="insight-card">
              <div className="insight-header">
                <span className="world-emoji">{world.emoji}</span>
                <h3>{world.name}</h3>
              </div>
              <p className="insight-text">{insight}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

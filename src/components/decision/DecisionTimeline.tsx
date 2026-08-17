/**
 * DecisionTimeline.tsx
 * Phase F2c: Visual timeline of decisions and outcomes
 */

import { useEffect, useState } from 'react';
import type { Decision } from '../../types/decision';
import * as DecisionService from '../../services/DecisionService';

interface DecisionTimelineProps {
  twinId: string;
}

export default function DecisionTimeline({ twinId }: DecisionTimelineProps) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDecisions = async () => {
      try {
        setIsLoading(true);
        const decisions = await DecisionService.getUserDecisions(twinId);
        // Sort by date descending (most recent first)
        const sorted = decisions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setDecisions(sorted);
      } catch (err) {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };

    loadDecisions();
  }, [twinId]);

  if (isLoading) {
    return <div className="timeline-loading">Loading timeline...</div>;
  }

  if (decisions.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No decisions recorded yet. Start making decisions to build your timeline.</p>
      </div>
    );
  }

  return (
    <div className="decision-timeline-container">
      <h2>📅 Decision Timeline</h2>
      <div className="timeline">
        {decisions.map((decision) => (
          <div key={decision.id} className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div className="timeline-header">
                <h3 className="timeline-title">{decision.title || decision.question}</h3>
                <span className="timeline-world">{decision.world}</span>
              </div>
              <p className="timeline-choice">
                <strong>You chose:</strong> {decision.userChoice}
              </p>
              <p className="timeline-date">
                {new Date(decision.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

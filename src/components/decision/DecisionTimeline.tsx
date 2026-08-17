/**
 * DecisionTimeline.tsx
 * Visual timeline of decisions made over time
 * Shows decision dates, outcomes, and follow-up milestones
 */

import { useEffect, useState } from 'react';
import type { Decision, DecisionOutcome } from '../../types/decision';
import * as DecisionService from '../../services/DecisionService';
import '../../styles/decision-timeline.css';

interface TimelineItem {
  decision: Decision;
  outcomes: DecisionOutcome[];
}

interface DecisionTimelineProps {
  twinId: string;
}

export default function DecisionTimeline({ twinId }: DecisionTimelineProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTimeline();
  }, [twinId]);

  async function loadTimeline() {
    try {
      setLoading(true);
      setError(null);

      // Load all decisions
      const decisions = await DecisionService.getUserDecisions(twinId);

      // Load outcomes for each decision
      const timelineItems: TimelineItem[] = [];
      for (const decision of decisions) {
        const outcomes = await DecisionService.getDecisionOutcomes(decision.id);
        timelineItems.push({ decision, outcomes });
      }

      // Sort by date (newest first)
      timelineItems.sort((a, b) => {
        const dateA = new Date(a.decision.createdAt).getTime();
        const dateB = new Date(b.decision.createdAt).getTime();
        return dateB - dateA;
      });

      setItems(timelineItems);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load timeline';
      setError(msg);
      console.error('Error loading timeline:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="decision-timeline-container">
        <div className="timeline-skeleton">Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="decision-timeline-container">
        <div className="timeline-error">Error: {error}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="decision-timeline-container">
        <div className="timeline-empty">No decisions yet. Start tracking decisions to build your history.</div>
      </div>
    );
  }

  return (
    <div className="decision-timeline-container">
      <h2 className="timeline-title">⏱️ Decision Timeline</h2>

      <div className="timeline">
        {items.map((item, idx) => (
          <div key={item.decision.id} className="timeline-item">
            <div className="timeline-marker">
              <div className="marker-dot" />
              {idx < items.length - 1 && <div className="marker-line" />}
            </div>

            <div className="timeline-content">
              {/* Decision Card */}
              <div className="decision-entry">
                <div className="entry-header">
                  <h4 className="entry-title">{item.decision.title || item.decision.question}</h4>
                  <span className="entry-world">{item.decision.world}</span>
                </div>

                <p className="entry-choice">
                  <strong>Your choice:</strong> {item.decision.userChoice}
                </p>

                <div className="entry-date">
                  {new Date(item.decision.createdAt).toLocaleDateString()} at{' '}
                  {new Date(item.decision.createdAt).toLocaleTimeString()}
                </div>

                {/* Outcomes */}
                {item.outcomes.length > 0 && (
                  <div className="outcomes-section">
                    <h5 className="outcomes-title">Follow-up Results</h5>
                    <div className="outcomes-list">
                      {item.outcomes.map((outcome) => (
                        <div key={outcome.id} className="outcome-item">
                          <div className="outcome-day">{outcome.followUpDay} days</div>
                          <div className="outcome-impact">
                            <span className={`impact-badge impact-${outcome.impact}`}>
                              {outcome.impact.charAt(0).toUpperCase() + outcome.impact.slice(1)}
                            </span>
                          </div>
                          <p className="outcome-feedback">{outcome.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No outcomes yet */}
                {item.outcomes.length === 0 && (
                  <div className="outcomes-placeholder">
                    <p>Awaiting follow-up feedback...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="timeline-actions">
        <button onClick={loadTimeline} className="btn-refresh">
          🔄 Refresh Timeline
        </button>
      </div>
    </div>
  );
}

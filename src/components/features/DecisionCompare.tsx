/**
 * DecisionCompare.tsx
 * 
 * Compare feature for Decisions (Domain Q)
 * Allows users to select and compare multiple decisions side by side
 */

import React, { useState, useMemo } from 'react';
import type { Decision, DecisionOutcome } from '../../types/decision';
import { WORLDS, type WorldId } from '../../constants/worlds';
import './DecisionDashboard.css';

interface DecisionCompareProps {
  decisions: Decision[];
  outcomesMap: Map<string, DecisionOutcome[]>;
}

export const DecisionCompare: React.FC<DecisionCompareProps> = ({ decisions, outcomesMap }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const selectedDecisions = useMemo(() => {
    return decisions.filter((d) => selectedIds.includes(d.id));
  }, [decisions, selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedIds.length >= 2) {
      setShowComparison(true);
    }
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
    setSelectedIds([]);
  };

  const getWorldLabel = (world: WorldId): string => {
    const w = WORLDS[world];
    return w ? w.name : world;
  };

  if (decisions.length < 2) {
    return null;
  }

  if (showComparison) {
    return (
      <div className="dc-comparison-overlay">
        <div className="dc-comparison-panel">
          <div className="dc-comparison-header">
            <h2>📊 Decision Comparison</h2>
            <button onClick={handleCloseComparison} className="dc-close-btn">
              ✕
            </button>
          </div>

          <div className="dc-comparison-content" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem 0' }}>
            {selectedDecisions.map((decision) => (
              <div key={decision.id} className="dc-comparison-card">
                <div className="dc-card-header">
                  <h3>{decision.question}</h3>
                  <span className="dc-world-badge">{getWorldLabel(decision.world)}</span>
                </div>

                <div className="dc-card-body">
                  <div className="dc-field">
                    <label>Twin Recommendation</label>
                    <p>{decision.twinRecommendation}</p>
                  </div>

                  <div className="dc-field">
                    <label>Your Choice</label>
                    <p>{decision.userChoice}</p>
                  </div>

                  <div className="dc-field">
                    <label>Options</label>
                    <ul>
                      {decision.options.map((opt, idx) => (
                        <li key={idx} style={{ color: opt === decision.userChoice ? 'var(--primary-color)' : 'inherit', fontWeight: opt === decision.userChoice ? 'bold' : 'normal' }}>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {decision.context && (
                    <div className="dc-field">
                      <label>Context</label>
                      <p>{decision.context}</p>
                    </div>
                  )}

                  <div className="dc-field">
                    <label>Date</label>
                    <p>{new Date(decision.chosenAt).toLocaleDateString()}</p>
                  </div>

                  {/* Outcomes */}
                  {outcomesMap.has(decision.id) && (
                    <div className="dc-field">
                      <label>Outcomes</label>
                      {outcomesMap.get(decision.id)?.map((outcome) => (
                        <div key={outcome.id} style={{ padding: '0.5rem', margin: '0.5rem 0', background: 'var(--card-bg)', borderRadius: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Day {outcome.followUpDay}</span>
                            <span style={{
                              color: outcome.impact === 'positive' ? '#10b981' : outcome.impact === 'negative' ? '#ef4444' : '#f59e0b',
                            }}>
                              {outcome.impact}
                            </span>
                          </div>
                          <p style={{ margin: '0.25rem 0' }}>{outcome.feedback}</p>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Lessons: {outcome.lessons}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Selection mode
  return (
    <div className="dc-selection-mode">
      <div className="dc-selection-header">
        <h3>Select decisions to compare ({selectedIds.length}/4)</h3>
        <button
          onClick={handleCompare}
          disabled={selectedIds.length < 2}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: selectedIds.length >= 2 ? 'var(--primary-color)' : 'var(--border-color)',
            color: 'white',
            cursor: selectedIds.length >= 2 ? 'pointer' : 'not-allowed',
          }}
        >
          Compare Selected
        </button>
      </div>

      <div className="dc-decision-list" style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
        {decisions.slice(0, 10).map((decision) => (
          <div
            key={decision.id}
            onClick={() => toggleSelect(decision.id)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: `2px solid ${selectedIds.includes(decision.id) ? 'var(--primary-color)' : 'var(--border-color)'}`,
              background: selectedIds.includes(decision.id) ? 'var(--primary-light)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.875rem' }}>{decision.question}</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {getWorldLabel(decision.world)} • {new Date(decision.chosenAt).toLocaleDateString()}
              </p>
            </div>
            <span style={{ fontSize: '1.25rem' }}>
              {selectedIds.includes(decision.id) ? '✓' : '○'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

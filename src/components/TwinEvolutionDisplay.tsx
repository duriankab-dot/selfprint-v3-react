/**
 * TwinEvolutionDisplay.tsx
 * Visual timeline showing all 5 Twin evolution stages
 * Displays current stage, progress to next, and milestones
 */

import type { CSSProperties } from 'react';
import type {
  TwinStage,
  ProgressMetrics,
} from '../constants/twinStages';
import {
  TWIN_STAGES,
  calculateProgress,
  getNextMilestoneText,
  STAGE_OPACITY,
  STAGE_COLORS,
} from '../constants/twinStages';

interface TwinEvolutionDisplayProps {
  currentStage: TwinStage;
  metrics: ProgressMetrics;
  twinName?: string;
  className?: string;
}

export function TwinEvolutionDisplay({
  currentStage,
  metrics,
  twinName = 'Your Twin',
  className = '',
}: TwinEvolutionDisplayProps) {
  const progress = calculateProgress(currentStage, metrics);
  const nextMilestone = getNextMilestoneText(currentStage, metrics);

  return (
    <div className={`twin-evolution-container ${className}`}>
      {/* Title */}
      <div className="evolution-header">
        <h3>Twin Evolution</h3>
        <p className="twin-name">{twinName}</p>
      </div>

      {/* Timeline */}
      <div className="evolution-timeline">
        {([1, 2, 3, 4, 5] as const).map((stage) => (
          <div key={stage} className="stage-item-wrapper">
            <StageNode
              stage={stage}
              isActive={stage === currentStage}
              isCompleted={stage < currentStage}
              isCurrent={stage === currentStage}
            />
            <div className="stage-connection">
              {stage < 5 && (
                <div
                  className={`connection-line ${
                    stage < currentStage ? 'completed' : 'pending'
                  }`}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stage Labels and Descriptions */}
      <div className="stage-info">
        {([1, 2, 3, 4, 5] as const).map((stage) => {
          const stageInfo = TWIN_STAGES[stage];
          const isActive = stage === currentStage;

          return (
            <div
              key={stage}
              className={`stage-label ${isActive ? 'active' : ''}`}
              style={{
                opacity: isActive ? 1 : stage < currentStage ? 0.8 : 0.5,
              }}
            >
              <div className="stage-number">Stage {stage}</div>
              <div className="stage-name">{stageInfo.name}</div>
              <div className="stage-desc">{stageInfo.description}</div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">Progress to Next Stage</span>
          <span className="progress-percent">{progress.progressPercent}%</span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="metrics-grid">
        <MetricCard
          label="Days Active"
          value={metrics.daysSinceAwakening}
          icon="📅"
        />
        <MetricCard label="Messages" value={metrics.messageCount} icon="💬" />
        <MetricCard label="Patterns" value={metrics.patternCount} icon="🔍" />
        <MetricCard label="Memories" value={metrics.memoryCount} icon="📝" />
        <MetricCard label="Feedback" value={metrics.feedbackCount} icon="⭐" />
      </div>

      {/* Next Milestone */}
      <div className="milestone-section">
        <div className="milestone-text">{nextMilestone}</div>
        {progress.canEvolve && currentStage < 5 && (
          <div className="evolution-ready">
            ✨ Ready to evolve to {TWIN_STAGES[(currentStage + 1) as TwinStage].name}!
          </div>
        )}
      </div>

      {/* Current Stage Details */}
      <div className="current-stage-info">
        <h4>{TWIN_STAGES[currentStage].name}</h4>
        <p>{TWIN_STAGES[currentStage].description}</p>
      </div>
    </div>
  );
}

interface StageNodeProps {
  stage: TwinStage;
  isActive: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
}

function StageNode({ stage, isActive, isCompleted, isCurrent }: StageNodeProps) {
  const colors = STAGE_COLORS[stage];
  const opacity = STAGE_OPACITY[stage];

  const nodeStyle: CSSProperties = {
    width: isActive ? '60px' : '50px',
    height: isActive ? '60px' : '50px',
    borderRadius: '50%',
    background: isCompleted
      ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
      : `rgba(${hexToRgb(colors.primary)}, ${isActive ? opacity : opacity * 0.5})`,
    border: isCurrent ? `3px solid ${colors.primary}` : `2px solid ${colors.secondary}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: isActive ? '24px' : '20px',
    fontWeight: 'bold',
    color: isCompleted || isActive ? 'white' : colors.primary,
    transition: 'all 0.3s ease',
    boxShadow: isActive
      ? `0 0 20px ${colors.primary}80, inset 0 0 10px ${colors.secondary}40`
      : undefined,
  };

  return (
    <div className="stage-node" style={nodeStyle}>
      {isCompleted ? '✓' : stage}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
}

function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

/**
 * Helper: Convert hex to rgb
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '99, 102, 241';
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `${r}, ${g}, ${b}`;
}

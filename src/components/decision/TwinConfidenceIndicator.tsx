/**
 * TwinConfidenceIndicator.tsx
 * Phase F2d: Display Twin's confidence level in recommendations
 */

import type { WorldId } from '../../constants/worlds';
import { WORLDS } from '../../constants/worlds';

interface TwinConfidenceIndicatorProps {
  confidence: number; // 0-100
  world?: WorldId;
  size?: 'small' | 'medium' | 'large';
}

export default function TwinConfidenceIndicator({
  confidence,
  world,
  size = 'medium',
}: TwinConfidenceIndicatorProps) {
  const level = getConfidenceLevel(confidence);
  const color = getConfidenceColor(confidence);
  const sizeClass = `confidence-${size}`;

  return (
    <div className={`confidence-indicator ${sizeClass}`}>
      <div className="confidence-display" style={{ color }}>
        <span className="confidence-badge">{getConfidenceEmoji(level)}</span>
        <span className="confidence-text">{level}</span>
      </div>
      {world && (
        <div className="confidence-world">
          <span>{WORLDS[world]?.emoji} {WORLDS[world]?.name}</span>
        </div>
      )}
      <div className="confidence-bar">
        <div className="confidence-fill" style={{ width: `${confidence}%`, backgroundColor: color }} />
      </div>
      <span className="confidence-percent">{Math.round(confidence)}%</span>
    </div>
  );
}

// OPTIMIZED: Memoized confidence mapping (Phase G hot path)
const CONFIDENCE_LEVELS = [
  { min: 80, level: 'High Confidence', color: '#10b981' },
  { min: 60, level: 'Good Confidence', color: '#3b82f6' },
  { min: 40, level: 'Moderate Confidence', color: '#f59e0b' },
  { min: 20, level: 'Low Confidence', color: '#ef4444' },
  { min: 0, level: 'Uncertain', color: '#6b7280' },
];

function getConfidenceLevel(confidence: number): string {
  for (const conf of CONFIDENCE_LEVELS) {
    if (confidence >= conf.min) return conf.level;
  }
  return 'Uncertain';
}

function getConfidenceColor(confidence: number): string {
  for (const conf of CONFIDENCE_LEVELS) {
    if (confidence >= conf.min) return conf.color;
  }
  return '#6b7280';
}

function getConfidenceEmoji(level: string): string {
  const emojiMap: Record<string, string> = {
    'High Confidence': '🎯',
    'Good Confidence': '✅',
    'Moderate Confidence': '⚖️',
    'Low Confidence': '⚠️',
    'Uncertain': '❓',
  };
  return emojiMap[level] || '❓';
}

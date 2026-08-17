/**
 * TwinConfidenceIndicator.tsx
 * Display Twin's confidence level in a world/decision area
 * Used in chat and recommendation contexts
 */

import { useEffect, useState } from 'react';
import type { WorldId } from '../../constants/worlds';
import * as DecisionService from '../../services/DecisionService';
import '../../styles/confidence-indicator.css';

interface TwinConfidenceIndicatorProps {
  twinId: string;
  world: WorldId;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function TwinConfidenceIndicator({
  twinId,
  world,
  size = 'medium',
  showLabel = true,
}: TwinConfidenceIndicatorProps) {
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfidence();
  }, [twinId, world]);

  async function loadConfidence() {
    try {
      setLoading(true);
      const conf = await DecisionService.getTwinDecisionConfidence(twinId, world);
      setConfidence(conf);
    } catch (err) {
      console.error('Error loading confidence:', err);
      setConfidence(50); // Default neutral
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`confidence-indicator confidence-${size}`}>
        <div className="confidence-skeleton">--</div>
      </div>
    );
  }

  const conf = confidence ?? 50;
  const level = getConfidenceLevel(conf);
  const color = getConfidenceColor(conf);

  return (
    <div className={`confidence-indicator confidence-${size}`}>
      <div className="confidence-badge" style={{ backgroundColor: color }}>
        <div className="confidence-value">{conf}%</div>
      </div>
      {showLabel && <div className="confidence-label">{level}</div>}
    </div>
  );
}

/**
 * Get confidence level label
 */
function getConfidenceLevel(confidence: number): string {
  if (confidence >= 80) return 'Very High';
  if (confidence >= 60) return 'High';
  if (confidence >= 40) return 'Medium';
  if (confidence >= 20) return 'Low';
  return 'Very Low';
}

/**
 * Get color based on confidence
 */
function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'var(--success-color, #10b981)';
  if (confidence >= 60) return 'var(--info-color, #3b82f6)';
  if (confidence >= 40) return 'var(--warning-color, #f59e0b)';
  return 'var(--error-color, #ef4444)';
}

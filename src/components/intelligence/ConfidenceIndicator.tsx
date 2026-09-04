/**
 * ConfidenceIndicator Component
 * Visual representation of AI confidence in an insight or claim
 * Shows evidence count, recency, consistency, and KNOW/INFER/UNKNOWN classification
 * @module components/intelligence/ConfidenceIndicator
 */

import React, { useMemo } from 'react';
import { Card } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import type {
  BehavioralPattern,
  KnowledgeLevel,
  Value,
  Goal,
  BlindSpot,
  Strength,
} from '@/lib/intelligence/types';

/**
 * Props for ConfidenceIndicator
 */
export interface ConfidenceIndicatorProps {
  /**
   * Confidence score (0-1)
   * Master Direction: "Never pretend to know" - always show actual confidence
   */
  confidence: number;

  /** Evidence count (how many data points support this) */
  evidenceCount?: number;

  /** Knowledge classification (KNOW, INFER, UNKNOWN) */
  knowledgeLevel?: KnowledgeLevel;

  /** Last evidence date (for recency calculation) */
  lastEvidenceDate?: Date;

  /** Consistency score (0-1) if available */
  consistencyScore?: number;

  /** Tooltip/explanation of confidence */
  explanation?: string;

  /** Show as compact badge or full card */
  compact?: boolean;

  /** Additional CSS class */
  className?: string;

  /** Raw object to analyze (alternative to manual props) */
  source?: BehavioralPattern | Value | Goal | BlindSpot | Strength;
}

/**
 * Calculate recency factor (how recent is the last evidence?)
 * Returns 0-1 score where 1 = very recent
 */
const calculateRecencySf = (lastDate: Date | undefined): number => {
  if (!lastDate) return 0.5; // Neutral if unknown

  const now = new Date();
  const diffMs = now.getTime() - new Date(lastDate).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Score decreases over time
  // 0 days = 1.0, 7 days = 0.7, 30 days = 0.3, 90+ days = 0
  if (diffDays <= 0) return 1.0;
  if (diffDays <= 7) return 1.0 - diffDays * 0.043; // 43% per day
  if (diffDays <= 30) return 0.7 - (diffDays - 7) * 0.016; // 1.6% per day
  if (diffDays <= 90) return 0.3 - (diffDays - 30) * 0.005; // 0.5% per day
  return 0; // Older than 90 days
};

/**
 * Calculate evidence factor (how much evidence do we have?)
 * Returns 0-1 score
 */
const calculateEvidenceFactor = (count: number | undefined): number => {
  if (!count || count === 0) return 0;
  if (count === 1) return 0.3;
  if (count === 2) return 0.5;
  if (count <= 5) return 0.7;
  return 1.0; // 5+ evidence points = maximum factor
};

/**
 * ConfidenceIndicator Component
 * Visualizes confidence with color-coded badge/card and metrics
 *
 * Master Direction compliance:
 * - Shows KNOW/INFER/UNKNOWN classification
 * - Never hides low confidence
 * - Transparency about evidence and recency
 */
export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  evidenceCount,
  knowledgeLevel,
  lastEvidenceDate,
  consistencyScore,
  explanation,
  compact = true,
  className = '',
  source,
}) => {
  // Extract metrics from source object if provided
  const extractedMetrics = useMemo(() => {
    if (!source) return { confidence, evidenceCount, lastEvidenceDate, consistency: consistencyScore };

    // Extract from BehavioralPattern
    // REALBUG-004 FIX (4 ก.ย. 2026): เดิมเช็ค `'confidencePoints' in source`
    // แต่ field ชื่อนั้น **ไม่มีอยู่ในโปรเจกต์เลยสักที่** (grep เจอบรรทัดนี้
    // บรรทัดเดียว) ของจริงคือ `evidencePoints` — ดู src/lib/intelligence/types.ts:199
    // ผลคือ branch นี้เป็น dead code, BehavioralPattern ตกไปถึง fallback
    // ที่คืนค่า props → เมื่อ caller ส่งมาแต่ `source` ค่า confidence จะเป็น
    // undefined → การ์ดขึ้น NaN% / จัดชั้นเป็น Very Low / พื้นหลังแดง เสมอ
    // ไม่ว่า pattern จะมั่นใจแค่ไหน (ผู้ใช้เห็นจริงผ่าน IntelligencePanel
    // และ ContextDisplay ที่ป้อน pattern เข้ามาแบบนี้)
    if ('evidencePoints' in source) {
      const pattern = source as BehavioralPattern;
      return {
        confidence: pattern.confidence,
        evidenceCount: pattern.evidencePoints.length,
        lastEvidenceDate: pattern.lastDetected,
        consistency: undefined,
      };
    }

    // Extract from Value/Goal/Strength/BlindSpot
    if ('confidence' in source && 'evidence' in source) {
      const item = source as Value | Goal | Strength | BlindSpot;
      return {
        confidence: item.confidence,
        evidenceCount: item.evidence.length,
        lastEvidenceDate: item.updatedAt,
        consistency: undefined,
      };
    }

    return { confidence, evidenceCount, lastEvidenceDate, consistency: consistencyScore };
  }, [source, confidence, evidenceCount, lastEvidenceDate, consistencyScore]);

  const { confidence: conf, evidenceCount: evCount, lastEvidenceDate: lastDate } = extractedMetrics;

  /**
   * Determine confidence level category
   */
  const getConfidenceLevel = (score: number): { label: string; color: string } => {
    if (score >= 0.8) return { label: 'Very High', color: 'bg-green-500' };
    if (score >= 0.6) return { label: 'High', color: 'bg-blue-500' };
    if (score >= 0.4) return { label: 'Moderate', color: 'bg-yellow-500' };
    if (score >= 0.2) return { label: 'Low', color: 'bg-orange-500' };
    return { label: 'Very Low', color: 'bg-red-500' };
  };

  /**
   * Determine knowledge level from metrics
   */
  const getKnowledgeLevel = (): KnowledgeLevel => {
    if (knowledgeLevel) return knowledgeLevel;

    // Infer from confidence
    if (conf >= 0.9 && evCount && evCount >= 3) return 'KNOW';
    if (conf >= 0.5) return 'INFER';
    return 'UNKNOWN';
  };

  const level = getConfidenceLevel(conf);
  const knowledge = getKnowledgeLevel();
  const recency = calculateRecencySf(lastDate);
  const evidence = calculateEvidenceFactor(evCount);

  // Build comprehensive explanation
  const defaultExplanation = (() => {
    const parts = [];

    // Knowledge level
    if (knowledge === 'KNOW') {
      parts.push('Based on direct evidence');
    } else if (knowledge === 'INFER') {
      parts.push('Based on pattern analysis');
    } else {
      parts.push('Limited evidence available');
    }

    // Evidence
    if (evCount) {
      parts.push(`${evCount} evidence point${evCount !== 1 ? 's' : ''}`);
    }

    // Recency
    if (lastDate) {
      const days = Math.floor((new Date().getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
      if (days === 0) {
        parts.push('updated today');
      } else if (days === 1) {
        parts.push('updated yesterday');
      } else {
        parts.push(`updated ${days} days ago`);
      }
    }

    return parts.join(' • ');
  })();

  const displayExplanation = explanation || defaultExplanation;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`} title={displayExplanation}>
        {/* Confidence Circle */}
        <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          {/* Background circle showing confidence */}
          <div
            className={`absolute inset-0 rounded-full ${level.color} opacity-20`}
            style={{
              width: `${conf * 100}%`,
              height: `${conf * 100}%`,
              margin: 'auto',
            }}
          />

          {/* Confidence percentage */}
          <span className="relative font-semibold text-sm text-slate-900 dark:text-white">
            {Math.round(conf * 100)}%
          </span>
        </div>

        {/* Knowledge Badge */}
        <Badge variant="default">
          {knowledge}
        </Badge>

        {/* Info Tooltip on hover would go here */}
      </div>
    );
  }

  // Full card view
  return (
    <Card className={`p-4 bg-gradient-to-r ${level.color} bg-opacity-5 border border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="space-y-3">
        {/* Header with confidence and knowledge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Circular confidence meter */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-200 dark:text-slate-700"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${conf * 283} 283`}
                  className={level.color.replace('bg-', 'text-')}
                  strokeLinecap="round"
                />
              </svg>
              {/* Center text */}
              <div className="absolute text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {Math.round(conf * 100)}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{level.label}</div>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">Confidence Score</h3>
              <Badge variant="default">
                {knowledge} {knowledge !== 'UNKNOWN' ? '✓' : '?'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Metrics breakdown */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          {/* Evidence */}
          <div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
              Evidence
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {evCount ?? 'N/A'}
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.min(evidence * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Recency */}
          <div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
              Recency
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {lastDate ? `${Math.floor((new Date().getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))}d` : 'N/A'}
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(recency * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Consistency */}
          {consistencyScore !== undefined && (
            <div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                Consistency
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">
                {Math.round(consistencyScore * 100)}%
              </div>
              <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${consistencyScore * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Explanation */}
        {displayExplanation && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300">{displayExplanation}</p>
          </div>
        )}

        {/* Knowledge info */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
          {knowledge === 'KNOW' && '✓ Based on direct evidence or explicit user statement'}
          {knowledge === 'INFER' && '⚠ Based on pattern analysis and inference'}
          {knowledge === 'UNKNOWN' && '? Limited data to make confident assessment'}
        </div>
      </div>
    </Card>
  );
};

export default ConfidenceIndicator;

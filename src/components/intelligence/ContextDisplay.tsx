/**
 * ContextDisplay Component
 * Shows current PersonalContext state: values, goals, blindSpots, patterns, etc.
 * Read-only display of the user's personal intelligence model
 * @module components/intelligence/ContextDisplay
 */

import React from 'react';
import { Card } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import type {
  PersonalContext,
  BehavioralPattern,
  AccuracyMetrics,
} from '@/lib/intelligence/types';

/**
 * Props for ContextDisplay
 */
export interface ContextDisplayProps {
  /** The personal context to display */
  context: PersonalContext;

  /** Optional behavioral patterns to show */
  patterns?: BehavioralPattern[];

  /** Optional accuracy metrics to display */
  accuracyMetrics?: AccuracyMetrics;

  /** Show compact or full view */
  compact?: boolean;

  /** Section to expand initially */
  expandedSection?: 'values' | 'goals' | 'blindSpots' | 'patterns' | 'all';

  /** Additional CSS classes */
  className?: string;
}

/**
 * ContextDisplay Component
 * Displays the user's personal intelligence model in an organized way
 *
 * Master Direction compliance:
 * - Shows only what AI actually knows
 * - Displays confidence for all insights
 * - KNOW/INFER/UNKNOWN properly distinguished
 * - Read-only display (no editing here)
 */
export const ContextDisplay: React.FC<ContextDisplayProps> = ({
  context,
  patterns,
  accuracyMetrics,
  compact = false,
  expandedSection = 'all',
  className = '',
}) => {
  // State for expandable sections
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(expandedSection === 'all' ? ['values', 'goals', 'blindSpots', 'patterns'] : [expandedSection])
  );

  const toggleSection = (section: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(section)) {
      newSet.delete(section);
    } else {
      newSet.add(section);
    }
    setExpandedSections(newSet);
  };

  /**
   * Calculate average confidence for a category
   */
  const getAverageConfidence = (items: Array<{ confidence: number }>): number => {
    if (!items || items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + item.confidence, 0);
    return sum / items.length;
  };

  const valueConfidence = getAverageConfidence(context.values);
  const goalConfidence = getAverageConfidence(context.goals);
  const blindSpotConfidence = getAverageConfidence(context.blindSpots);
  const patternConfidence = patterns ? getAverageConfidence(patterns) : 0;

  /**
   * Format date for display
   */
  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    const days = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

  if (compact) {
    return (
      <Card className={`p-4 bg-slate-50 dark:bg-slate-900 ${className}`}>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Values</span>
            <span className="font-semibold text-slate-900 dark:text-white">{context.values.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Goals</span>
            <span className="font-semibold text-slate-900 dark:text-white">{context.goals.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Blind Spots</span>
            <span className="font-semibold text-slate-900 dark:text-white">{context.blindSpots.length}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">Overall Confidence</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {Math.round(context.confidenceOverall * 100)}%
            </span>
          </div>
        </div>
      </Card>
    );
  }

  // Full view
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Personal Model</h2>
          <p className="text-slate-600 dark:text-slate-400">
            AI Understanding: Last updated {formatDate(context.lastUpdated)}
          </p>
          <div className="flex gap-4 pt-2">
            <div className="text-sm">
              <span className="text-slate-600 dark:text-slate-400">Data Points: </span>
              <span className="font-semibold text-slate-900 dark:text-white">{context.sourceCount}</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-600 dark:text-slate-400">Overall Accuracy: </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {Math.round(context.confidenceOverall * 100)}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Accuracy Metrics (if provided) */}
      {accuracyMetrics && (
        <Card className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Model Accuracy</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div>
              <div className="text-slate-600 dark:text-slate-400 text-xs uppercase">Total Insights</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {accuracyMetrics.totalInsights}
              </div>
            </div>
            <div>
              <div className="text-slate-600 dark:text-slate-400 text-xs uppercase">Very True</div>
              <div className="text-lg font-bold text-green-600">{accuracyMetrics.feedback.veryTrue}</div>
            </div>
            <div>
              <div className="text-slate-600 dark:text-slate-400 text-xs uppercase">Somewhat</div>
              <div className="text-lg font-bold text-blue-600">{accuracyMetrics.feedback.somewhat}</div>
            </div>
            <div>
              <div className="text-slate-600 dark:text-slate-400 text-xs uppercase">Not Sure</div>
              <div className="text-lg font-bold text-yellow-600">{accuracyMetrics.feedback.notSure}</div>
            </div>
            <div>
              <div className="text-slate-600 dark:text-slate-400 text-xs uppercase">Accuracy</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {Math.round(accuracyMetrics.accuracy * 100)}%
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Values Section */}
      <Card className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => toggleSection('values')}
          className="w-full flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💎</span>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white">Values</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {context.values.length} identified • {Math.round(valueConfidence * 100)}% confidence
              </p>
            </div>
          </div>
          <span className="text-slate-400">{expandedSections.has('values') ? '▼' : '▶'}</span>
        </button>

        {expandedSections.has('values') && (
          <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
            {context.values.length > 0 ? (
              context.values.map((value) => (
                <div key={value.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white">{value.name}</h4>
                      {value.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{value.description}</p>
                      )}
                    </div>
                    <Badge variant="default">
                      {value.inferred ? 'Inferred' : 'Known'}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{value.evidence.length} evidence</span>
                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${value.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">No values identified yet</p>
            )}
          </div>
        )}
      </Card>

      {/* Goals Section */}
      <Card className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => toggleSection('goals')}
          className="w-full flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white">Goals</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {context.goals.length} identified • {Math.round(goalConfidence * 100)}% confidence
              </p>
            </div>
          </div>
          <span className="text-slate-400">{expandedSections.has('goals') ? '▼' : '▶'}</span>
        </button>

        {expandedSections.has('goals') && (
          <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
            {context.goals.length > 0 ? (
              context.goals.map((goal) => (
                <div key={goal.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{goal.description}</p>
                      )}
                    </div>
                    {goal.timeframe && <Badge variant="default">{goal.timeframe}</Badge>}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{goal.evidence.length} evidence</span>
                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${goal.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">No goals identified yet</p>
            )}
          </div>
        )}
      </Card>

      {/* Blind Spots Section */}
      <Card className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => toggleSection('blindSpots')}
          className="w-full flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🕵️</span>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white">Blind Spots</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {context.blindSpots.length} identified • {Math.round(blindSpotConfidence * 100)}% confidence
              </p>
            </div>
          </div>
          <span className="text-slate-400">{expandedSections.has('blindSpots') ? '▼' : '▶'}</span>
        </button>

        {expandedSections.has('blindSpots') && (
          <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
            {context.blindSpots.length > 0 ? (
              context.blindSpots.map((spot) => (
                <div key={spot.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border-l-2 border-orange-500">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white">{spot.title}</h4>
                      {spot.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{spot.description}</p>
                      )}
                    </div>
                    <Badge variant="default">
                      {spot.sensitivity}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{spot.evidence.length} evidence</span>
                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${spot.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">No blind spots identified yet</p>
            )}
          </div>
        )}
      </Card>

      {/* Patterns Section */}
      {patterns && patterns.length > 0 && (
        <Card className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => toggleSection('patterns')}
            className="w-full flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🔄</span>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-white">Behavioral Patterns</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {patterns.length} detected • {Math.round(patternConfidence * 100)}% confidence
                </p>
              </div>
            </div>
            <span className="text-slate-400">{expandedSections.has('patterns') ? '▼' : '▶'}</span>
          </button>

          {expandedSections.has('patterns') && (
            <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white">{pattern.patternName}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{pattern.description}</p>
                    </div>
                    <Badge variant="default">
                      {pattern.patternType}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{pattern.evidencePoints.length} observations</span>
                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${pattern.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Decision Style */}
      <Card className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Decision Style</h3>
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-white mb-1">
                {context.decisionStyle.type.charAt(0).toUpperCase() + context.decisionStyle.type.slice(1)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{context.decisionStyle.description}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Confidence</span>
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
              <div
                className="h-full bg-slate-900 dark:bg-white rounded-full"
                style={{ width: `${context.decisionStyle.confidence * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Master Direction Notice */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-xs text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
        <strong>Master Direction:</strong> This model is built from actual data you've provided. Every insight shown
        above is based on evidence, with confidence scores reflecting how certain AI is about each claim.
      </div>
    </div>
  );
};

export default ContextDisplay;

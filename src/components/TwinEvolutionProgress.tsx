import React, { useEffect, useState } from 'react';
import { getAllStages } from '../services/TwinEvolutionService';
import type { TwinStage } from '../constants/twinStages';

interface TwinEvolutionProgressProps {
  userId: string;
  twinId: string;
  twinName: string;
}

/**
 * TwinEvolutionProgress Component
 * Displays 5-stage evolution with metrics and timeline
 */
export const TwinEvolutionProgress: React.FC<TwinEvolutionProgressProps> = ({
  userId,
  twinId,
  twinName,
}) => {
  const [currentStage, setCurrentStage] = useState<TwinStage>(1);
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsToNext, setMetricsToNext] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allStages = getAllStages();

  useEffect(() => {
    fetchEvolutionStatus();
    const interval = setInterval(fetchEvolutionStatus, 30000);
    return () => clearInterval(interval);
  }, [userId, twinId]);

  const fetchEvolutionStatus = async () => {
    try {
      const response = await fetch(`/api/twin-evolution?action=get-status&twinId=${twinId}`, {
        headers: { 'x-user-id': userId },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      if (data.success) {
        setCurrentStage(data.currentStage);
        setProgress(data.progress);
        setMetrics(data.metrics);
        setMetricsToNext(data.metricsToNextStage);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 bg-red-900/20 text-red-400 rounded">{error}</div>;

  const currentStageInfo = allStages.find(s => s.stage === currentStage);
  const nextStage = currentStage < 5 ? ((currentStage + 1) as TwinStage) : null;
  const nextStageInfo = allStages.find(s => s.stage === nextStage);

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-transparent rounded-xl border border-purple-500/20 p-6">
      <h3 className="text-lg font-bold text-purple-300">{twinName}'s Evolution</h3>

      {/* Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-900/40 border border-purple-500/40 rounded-lg p-4">
          <div className="text-xs text-purple-300 uppercase mb-1">Current Stage</div>
          <div className="text-2xl font-bold text-purple-200 mb-2">{currentStageInfo?.info.name}</div>
          <div className="text-sm text-purple-400 mb-3">{currentStageInfo?.info.description}</div>
          <div className="text-xs text-purple-300 space-y-1">
            <div>Days: {metrics?.daysSinceAwakening ?? 0}</div>
            <div>Messages: {metrics?.messageCount ?? 0}</div>
          </div>
        </div>

        {nextStageInfo && (
          <div className="bg-indigo-900/40 border border-indigo-500/40 rounded-lg p-4">
            <div className="text-xs text-indigo-300 uppercase mb-1">Next Stage</div>
            <div className="text-2xl font-bold text-indigo-200 mb-2">{nextStageInfo.info.name}</div>
            <div className="text-sm text-indigo-400 mb-3">{nextStageInfo.info.description}</div>
            <div className="text-xs text-indigo-300">
              Requires: {nextStageInfo.info.minDays}d, {nextStageInfo.info.minMessages}m
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {nextStage && (
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-purple-300">Progress</span>
            <span className="text-xs text-purple-300 font-semibold">{progress}%</span>
          </div>
          <div className="h-3 bg-purple-900/60 rounded-full overflow-hidden border border-purple-500/30">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {currentStage === 5 && (
        <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 rounded-lg text-center text-purple-200 font-semibold">
          ✨ {twinName} reached full evolution! ✨
        </div>
      )}

      {/* Metrics Grid */}
      {nextStage && metricsToNext && (
        <div>
          <h4 className="text-sm font-semibold text-purple-300 mb-3">
            Requirements for {nextStageInfo?.info.name}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            {[
              { val: metricsToNext.days, label: 'days left' },
              { val: metricsToNext.messages, label: 'messages' },
              { val: metricsToNext.patterns, label: 'patterns' },
              { val: metricsToNext.memories, label: 'memories' },
              { val: metricsToNext.feedback, label: 'feedback' },
            ].map((item, i) => (
              <div key={i} className="bg-purple-900/40 border border-purple-500/30 rounded p-2">
                <div className="text-purple-300">{item.val}</div>
                <div className="text-purple-400 text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div>
        <h4 className="text-sm font-semibold text-purple-300 mb-3">Evolution Journey</h4>
        <div className="space-y-2">
          {allStages.map((stage) => {
            const isCompleted = stage.stage < currentStage;
            const isCurrent = stage.stage === currentStage;
            return (
              <div key={stage.stage} className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full transition-all ${
                    isCompleted ? 'bg-green-400' : isCurrent ? 'bg-purple-400 scale-125' : 'bg-gray-600'
                  }`}
                />
                <div
                  className={`text-xs transition-colors ${
                    isCompleted
                      ? 'text-green-300 line-through'
                      : isCurrent
                        ? 'text-purple-300 font-semibold'
                        : 'text-gray-400'
                  }`}
                >
                  Stage {stage.stage}: {stage.info.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TwinEvolutionProgress;

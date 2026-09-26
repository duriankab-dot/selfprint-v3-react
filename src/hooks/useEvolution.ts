/**
 * useEvolution.ts — TC-504: Hook for evolution data
 *
 * Provides:
 * - Evolution log from twinStore
 * - Version comparison (v1→v2→v3)
 * - Trigger analysis
 * - Score diffs
 */

import { useMemo } from 'react';
import { useTwinStore } from '@/store/twinStore';

interface EvolutionEvent {
  at: string;
  from: number | null;
  to: number;
  reason: string;
}

interface UseEvolutionReturn {
  currentVersion: number;
  currentConfidence: number;
  scores: number[];
  events: EvolutionEvent[];
  layers: Record<number, { scores: number[]; confidence: number; capturedAt: string } | undefined>;
  versionDiff: { dimension: number; v2: number; v3: number; diff: number }[];
  triggers: { event: EvolutionEvent; triggerType: string }[];
}

export function useEvolution(maxEvents = 50): UseEvolutionReturn {
  const { evolutionLog, layers, current } = useTwinStore();

  const currentVersion = current?.version ?? 1;
  const currentConfidence = current?.confidence ?? 0.2;
  const scores = current?.scores ?? [];

  const events: EvolutionEvent[] = useMemo(() => {
    return evolutionLog.slice(-maxEvents).reverse();
  }, [evolutionLog, maxEvents]);

  // Layer data for version comparison
  const layerData = useMemo(() => {
    const result: Record<number, { scores: number[]; confidence: number; capturedAt: string } | undefined> = {};
    [1, 2, 3].forEach((v) => {
      const layer = layers[v as 1 | 2 | 3];
      if (layer) {
        result[v] = {
          scores: layer.scores,
          confidence: layer.confidence,
          capturedAt: layer.capturedAt,
        };
      }
    });
    return result;
  }, [layers]);

  // Version diff (v2 vs v3)
  const versionDiff = useMemo(() => {
    const v2 = layers[2];
    const v3 = layers[3];
    if (!v2 || !v3) return [];

    return v3.scores.map((v3Score, idx) => ({
      dimension: idx,
      v2: v2.scores[idx] ?? 0,
      v3: v3Score,
      diff: v3Score - (v2.scores[idx] ?? 0),
    }));
  }, [layers]);

  // Trigger analysis
  const triggers = useMemo(() => {
    return events.map((event) => {
      const reason = event.reason.toLowerCase();
      let triggerType = 'unknown';
      if (reason.includes('onboard') || reason.includes('finetune')) triggerType = 'onboarding';
      else if (reason.includes('decision') || reason.includes('ตัดสินใจ')) triggerType = 'decision';
      else if (reason.includes('sice') || reason.includes('analysis') || reason.includes('วิเคราะห์')) triggerType = 'sice_analysis';
      else if (reason.includes('feedback') || reason.includes('outcome') || reason.includes('ผลลัพธ์')) triggerType = 'feedback';
      else if (reason.includes('awakening') || reason.includes('ตื่น') || reason.includes('birth')) triggerType = 'awakening';

      return { event, triggerType };
    });
  }, [events]);

  return {
    currentVersion,
    currentConfidence,
    scores,
    events,
    layers: layerData,
    versionDiff,
    triggers,
  };
}

export default useEvolution;
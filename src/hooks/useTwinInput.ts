/**
 * useTwinInput.ts — TC-204: input accumulator hook driving the unified
 * pipeline. ทุก input ใหม่ (DOB / mood / finetune / decision) เข้าที่เดียว
 * → VersionManager คิดเวอร์ชันเป้าหมาย → twinStore บันทึก layer + merge
 * เป็น UnifiedAnalysis ชั้นเดียว (ไม่ analyze ใหม่ซ้ำ)
 */

import { useCallback, useMemo } from 'react';
import { useTwinStore } from '../store/twinStore';
import type { TwinInputSnapshot, TwinVersion, UnifiedAnalysis } from '../store/twinStore';
import { nextVersion, versionReason } from '../lib/analysis/VersionManager';
import { analyze, baselineScores } from '../lib/analysis/AnalysisEngine';
import type { AnalysisContext } from '../lib/analysis/AnalysisEngine';

export interface UseTwinInputResult {
  /** สัญญาณสะสมปัจจุบัน (union ของทุก layer) */
  inputs: TwinInputSnapshot;
  version: TwinVersion | null;
  confidence: number | null;
  current: UnifiedAnalysis | null;
  /** บันทึก input ใหม่ → auto-upgrade version + merge */
  accumulate: (partial: TwinInputSnapshot, opts?: { hasSiceResult?: boolean; hasDecisionLog?: boolean }) => TwinVersion | null;
  /** วิเคราะห์ซ้ำจาก layer ที่มี (ไม่เพิ่ม input) */
  reanalyze: () => UnifiedAnalysis | null;
}

export function useTwinInput(userId: string): UseTwinInputResult {
  const layers = useTwinStore((s) => s.layers);
  const current = useTwinStore((s) => s.current);
  const recordInput = useTwinStore((s) => s.recordInput);
  const mergeLayers = useTwinStore((s) => s.mergeLayers);
  const logEvolution = useTwinStore((s) => s.logEvolution);

  const inputs = useMemo(() => {
    const union: TwinInputSnapshot = {};
    ([1, 2, 3] as const).forEach((v) => {
      const l = layers[v];
      if (!l) return;
      Object.entries(l.inputs).forEach(([k, val]) => {
        if (val !== undefined) {
          (union as Record<string, unknown>)[k] = val;
        }
      });
    });
    return union;
  }, [layers]);

  const context = useMemo<AnalysisContext>(
    () => ({
      userId,
      trigger: current?.version === 3 ? 'living' : current?.version === 2 ? 'onboarding' : 'landing',
      decisionCount: inputs.decisionCount,
    }),
    [userId, current?.version, inputs.decisionCount],
  );

  const accumulate = useCallback(
    (partial: TwinInputSnapshot, opts?: { hasSiceResult?: boolean; hasDecisionLog?: boolean }) => {
      const state = useTwinStore.getState();
      const union: TwinInputSnapshot = { ...partial };
      ([1, 2, 3] as const).forEach((v) => {
        const l = state.layers[v];
        if (!l) return;
        Object.entries(l.inputs).forEach(([k, val]) => {
          if ((union as Record<string, unknown>)[k] === undefined) {
            (union as Record<string, unknown>)[k] = val;
          }
        });
      });
      const mergedInputs = { ...union, ...partial };

      const signals = {
        inputs: mergedInputs,
        hasSiceResult: opts?.hasSiceResult ?? Boolean(state.layers[2]),
        hasDecisionLog: opts?.hasDecisionLog,
        currentVersion: state.current?.version ?? null,
      };
      const target = nextVersion(signals);
      if (target === null) {
        // still merge whatever arrived into the current layer view
        mergeLayers();
        return useTwinStore.getState().current?.version ?? null;
      }

      recordInput(target, mergedInputs);
      if (useTwinStore.getState().layers[target]) {
        const prevAnalysis = useTwinStore.getState().current;
        const unified = analyze(
          { version: target, inputs: mergedInputs, scores: baselineScores({ version: target, inputs: mergedInputs }, userId) },
          context,
          prevAnalysis,
        );
        useTwinStore.setState({ current: unified });
      }
      logEvolution(state.current?.version ?? null, target, versionReason({ inputs: mergedInputs, hasSiceResult: opts?.hasSiceResult, hasDecisionLog: opts?.hasDecisionLog, currentVersion: state.current?.version ?? null }));
      mergeLayers();
      return useTwinStore.getState().current?.version ?? target;
    },
    [recordInput, mergeLayers, logEvolution],
  );

  const reanalyze = useCallback(() => {
    return mergeLayers();
  }, [mergeLayers]);

  return {
    inputs,
    version: current?.version ?? null,
    confidence: current?.confidence ?? null,
    current,
    accumulate,
    reanalyze,
  };
}
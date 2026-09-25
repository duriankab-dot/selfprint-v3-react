import { describe, it, expect, beforeEach } from 'vitest';
import { useTwinStore } from '../store/twinStore';
import { analyze, baselineScores } from '../lib/analysis/AnalysisEngine';
import { nextVersion, versionReason } from '../lib/analysis/VersionManager';
import { useTwinInput } from '../hooks/useTwinInput';
import { renderHook, act } from '@testing-library/react';
import type { UnifiedAnalysis } from '../store/twinStore';

const resetStore = () => {
  useTwinStore.setState({ layers: {}, current: null, evolutionLog: [] });
};

describe('TC-202 twinStore — layers architecture', () => {
  beforeEach(resetStore);

  it('recordInput stores layer with the confidence contract', () => {
    useTwinStore.getState().recordInput(1, { dob: '1995-06-15', mood: 'happy' });
    const l1 = useTwinStore.getState().layers[1];
    expect(l1?.label).toBe('v1_landing');
    expect(l1?.confidence).toBe(0.2);
    expect(l1?.scores).toHaveLength(12);
  });

  it('mergeLayers produces a single UnifiedAnalysis — no re-analysis', () => {
    useTwinStore.getState().recordInput(1, { dob: '1995-06-15', mood: 'happy' });
    useTwinStore.getState().recordInput(2, { dob: '1995-06-15', finetuneAnswers: { q1: 'a', q2: 'b', q3: 'c' } });
    const merged = useTwinStore.getState().mergeLayers();
    expect(merged).not.toBeNull();
    expect(merged?.version).toBe(2);
    expect(merged?.confidence).toBe(0.65);
    expect(merged?.sources).toEqual(['v1_landing', 'v2_onboarding']);
  });

  it('confidence progression v1→v2→v3: 20% → 65% → 85%', () => {
    useTwinStore.getState().recordInput(1, { dob: '1995-06-15', mood: 'happy' });
    expect(useTwinStore.getState().mergeLayers()?.confidence).toBe(0.2);
    useTwinStore.getState().recordInput(2, { dob: '1995-06-15', finetuneAnswers: { q1: 'a', q2: 'b', q3: 'c', q4: 'd' } });
    expect(useTwinStore.getState().mergeLayers()?.confidence).toBe(0.65);
    useTwinStore.getState().recordInput(3, { dob: '1995-06-15', decisionCount: 40 });
    expect(useTwinStore.getState().mergeLayers()?.confidence).toBe(0.85);
  });

  it('logEvolution records version ups and never downgrades', () => {
    useTwinStore.getState().recordInput(1, { dob: '1995-06-15', mood: 'happy' });
    useTwinStore.getState().mergeLayers();
    useTwinStore.getState().logEvolution(1, 2, 'onboarding complete');
    useTwinStore.getState().logEvolution(1, 2, 'duplicate — must be ignored');
    const log = useTwinStore.getState().evolutionLog;
    expect(log).toHaveLength(1);
    expect(log[0].from).toBe(1);
    expect(log[0].to).toBe(2);
  });

  it('reset clears layers + current + log', () => {
    useTwinStore.getState().recordInput(1, { dob: '1995-06-15', mood: 'happy' });
    useTwinStore.getState().mergeLayers();
    useTwinStore.getState().reset();
    expect(useTwinStore.getState().layers).toEqual({});
    expect(useTwinStore.getState().current).toBeNull();
    expect(useTwinStore.getState().evolutionLog).toHaveLength(0);
  });
});

describe('TC-201 AnalysisEngine — analyze(input, context, version)', () => {
  beforeEach(resetStore);

  it('merges previous analysis with the new layer (60/40 score blend)', () => {
    const previous: UnifiedAnalysis = {
      version: 1,
      confidence: 0.2,
      insights: ['พิมพ์เขียวเบื้องต้น'],
      blindSpots: [],
      scores: Array(12).fill(0.5),
      sources: ['v1'],
    };
    const result = analyze(
      { version: 2, inputs: { dob: '1995-06-15', finetuneAnswers: { q1: 'a', q2: 'b', q3: 'c', q4: 'd' } }, scores: Array(12).fill(0.8) },
      { userId: 'u1', trigger: 'onboarding' },
      previous,
    );
    expect(result.version).toBe(2);
    expect(result.confidence).toBe(0.65);
    // blended: 0.5*0.4 + 0.8*0.6 = 0.68
    expect(result.scores[0]).toBeCloseTo(0.68, 3);
    expect(result.sources).toEqual(['v1', 'v2']);
    // previous insights carried forward
    expect(result.insights).toContain('พิมพ์เขียวเบื้องต้น');
  });

  it('blindSpots derived from weak merged dimensions only', () => {
    const result = analyze(
      { version: 3, inputs: { decisionCount: 25 }, scores: [1, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.3, 0.35, 0.4, 0.2] },
      { userId: 'u1', trigger: 'living', decisionCount: 25 },
      null,
    );
    expect(result.blindSpots.length).toBeGreaterThan(0);
    expect(result.blindSpots.length).toBeLessThanOrEqual(4);
    result.blindSpots.forEach((b) => {
      expect(b).toMatch(/Blind Spot/);
    });
  });

  it('baselineScores are deterministic per (dob, userId, version)', () => {
    const a1 = baselineScores({ version: 1, inputs: { dob: '1995-06-15' } }, 'user-1');
    const a2 = baselineScores({ version: 1, inputs: { dob: '1995-06-15' } }, 'user-1');
    const b = baselineScores({ version: 1, inputs: { dob: '1995-06-15' } }, 'user-2');
    expect(a2).toEqual(a1);
    expect(a2).not.toEqual(b);
    a1.forEach((s) => {
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1);
    });
  });
});

describe('TC-203 VersionManager — upgrade triggers', () => {
  it('DOB + mood only → v1', () => {
    expect(nextVersion({ inputs: { dob: '1995-06-15', mood: 'happy' }, currentVersion: null })).toBe(1);
  });
  it('finetune + SICE result → v2', () => {
    expect(nextVersion({
      inputs: { dob: '1995-06-15', mood: 'happy', finetuneAnswers: { q1: 'a', q2: 'b' } },
      hasSiceResult: true,
      currentVersion: 1,
    })).toBe(2);
  });
  it('decision log → v3', () => {
    expect(nextVersion({
      inputs: { dob: '1995-06-15', mood: 'happy', finetuneAnswers: { q1: 'a' } },
      hasSiceResult: true,
      hasDecisionLog: true,
      currentVersion: 2,
    })).toBe(3);
  });
  it('never downgrades — v3 stays v3', () => {
    expect(nextVersion({ inputs: { dob: 'x' }, currentVersion: 3 })).toBeNull();
    expect(nextVersion({ inputs: { dob: 'x', mood: 'y' }, currentVersion: 2 })).toBeNull();
  });
  it('insufficient signals → no upgrade', () => {
    expect(nextVersion({ inputs: { mood: 'happy' }, currentVersion: null })).toBeNull();
    expect(nextVersion({ inputs: { dob: 'x' }, currentVersion: null })).toBeNull();
  });
  it('versionReason maps to human-readable triggers', () => {
    expect(versionReason({ inputs: { dob: 'x', mood: 'y' }, currentVersion: null })).toContain('landing');
    expect(versionReason({
      inputs: { dob: 'x', mood: 'y', finetuneAnswers: { q1: 'a' } },
      hasSiceResult: true,
      currentVersion: 1,
    })).toContain('onboarding');
    expect(versionReason({
      inputs: { dob: 'x', mood: 'y', finetuneAnswers: { q1: 'a' }, decisionCount: 3 },
      hasSiceResult: true,
      hasDecisionLog: true,
      currentVersion: 2,
    })).toContain('living');
  });
});

describe('TC-204 useTwinInput — accumulator hook', () => {
  beforeEach(resetStore);

  it('accumulate escalates version across the journey (landing→onboarding→living)', () => {
    const { result } = renderHook(() => useTwinInput('user-1'));

    // v1: DOB + mood
    let v1: ReturnType<typeof result.current.accumulate> = null;
    act(() => {
      v1 = result.current.accumulate({ dob: '1995-06-15', mood: 'happy' });
    });
    expect(v1).toBe(1);
    expect(result.current.version).toBe(1);
    expect(result.current.confidence).toBe(0.2);

    // v2: finetune answers + SICE result
    let v2: ReturnType<typeof result.current.accumulate> = null;
    act(() => {
      v2 = result.current.accumulate(
        { finetuneAnswers: { q1: 'a', q2: 'b', q3: 'c', q4: 'd' } },
        { hasSiceResult: true },
      );
    });
    expect(v2).toBe(2);
    expect(result.current.confidence).toBe(0.65);

    // v3: decision log arrives
    let v3: ReturnType<typeof result.current.accumulate> = null;
    act(() => {
      v3 = result.current.accumulate({ decisionCount: 35 }, { hasDecisionLog: true });
    });
    expect(v3).toBe(3);
    expect(result.current.confidence).toBe(0.85);

    // accumulated union preserves all signals
    expect(result.current.inputs.dob).toBe('1995-06-15');
    expect(result.current.inputs.finetuneAnswers?.q1).toBe('a');
    expect(result.current.inputs.decisionCount).toBe(35);
  });

  it('evolution log captured per upgrade', () => {
    const { result } = renderHook(() => useTwinInput('user-1'));
    act(() => {
      result.current.accumulate({ dob: '1995-06-15', mood: 'happy' });
      result.current.accumulate({ finetuneAnswers: { q1: 'a' } }, { hasSiceResult: true });
    });
    const log = useTwinStore.getState().evolutionLog;
    expect(log.map((e) => e.to)).toEqual([1, 2]);
  });

  it('reanalyze merges without adding inputs', () => {
    const { result } = renderHook(() => useTwinInput('user-1'));
    result.current.accumulate({ dob: '1995-06-15', mood: 'happy' });
    const before = useTwinStore.getState().evolutionLog.length;
    const unified = result.current.reanalyze();
    expect(unified?.version).toBe(1);
    expect(useTwinStore.getState().evolutionLog.length).toBe(before);
  });
});
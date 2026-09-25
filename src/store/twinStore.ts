/**
 * twinStore.ts — TC-202: TwinStore layers architecture.
 *
 * 3 layers บน pipeline เดียว (ไม่ analyze ใหม่ซ้ำ):
 *   v1_landing    — DOB + mood เบื้องต้น           → confidence 20%
 *   v2_onboarding — finetune answers + SICE result → confidence 65%
 *   v3_living     — การตัดสินใจจริง + feedback       → confidence 85%+
 *
 * mergeLayers() รวมทุก layer เป็น UnifiedAnalysis ชั้นเดียว (current) และ
 * evolutionLog เก็บทุกการเลื่อนเวอร์ชันเพื่อ animate diff ที่ LivingDiagram.
 */

import { create } from 'zustand';
import type { SICEKey } from '../lib/twinVisualDNA';

export type TwinVersion = 1 | 2 | 3;
export type TwinLayerLabel = 'v1_landing' | 'v2_onboarding' | 'v3_living';

/** TC-204: accumulated inputs (accumulator hook writes these) */
export interface TwinInputSnapshot {
  dob?: string;
  time?: string;
  place?: string;
  mood?: string;
  finetuneAnswers?: Record<string, string>;
  decisionCount?: number;
  decisionHubs?: string[];
}

export interface TwinLayer {
  label: TwinLayerLabel;
  version: TwinVersion;
  confidence: number;
  scores: number[];
  inputs: TwinInputSnapshot;
  capturedAt: string;
}

export interface UnifiedAnalysis {
  version: TwinVersion;
  confidence: number;
  insights: string[];
  blindSpots: string[];
  dominantSICE?: SICEKey;
  scores: number[];
  sources: string[];
}

export interface EvolutionEvent {
  at: string;
  from: TwinVersion | null;
  to: TwinVersion;
  reason: string;
}

/** Confidence progression contract: v1 20% → v2 65% → v3 85% */
export const VERSION_CONFIDENCE: Record<TwinVersion, number> = {
  1: 0.2,
  2: 0.65,
  3: 0.85,
};

export const LAYER_LABELS: Record<TwinVersion, TwinLayerLabel> = {
  1: 'v1_landing',
  2: 'v2_onboarding',
  3: 'v3_living',
};

export interface TwinStoreState {
  layers: Partial<Record<TwinVersion, TwinLayer>>;
  current: UnifiedAnalysis | null;
  evolutionLog: EvolutionEvent[];
  recordInput: (version: TwinVersion, inputs: TwinInputSnapshot, scores?: number[]) => void;
  mergeLayers: () => UnifiedAnalysis | null;
  logEvolution: (from: TwinVersion | null, to: TwinVersion, reason: string) => void;
  reset: () => void;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function scoreByAnswers(answers?: Record<string, string>): number[] {
  if (!answers) return Array(12).fill(0.35);
  const vals = Object.values(answers);
  const richness = Math.min(1, vals.filter(Boolean).length / 5);
  return Array.from({ length: 12 }, (_, i) => clamp01(0.3 + richness * 0.35 + ((i * 7) % 11) / 55));
}

function scoreByDecisionCount(count?: number): number[] {
  if (!count) return Array(12).fill(0.55);
  const maturity = Math.min(1, count / 30);
  return Array.from({ length: 12 }, (_, i) => clamp01(0.5 + maturity * 0.4 + ((i * 5) % 7) / 45));
}

export const useTwinStore = create<TwinStoreState>((set, get) => ({
  layers: {},
  current: null,
  evolutionLog: [],

  recordInput: (version, inputs, scores) => {
    const layer: TwinLayer = {
      label: LAYER_LABELS[version],
      version,
      confidence: VERSION_CONFIDENCE[version],
      scores: scores ?? (version === 3 ? scoreByDecisionCount(inputs.decisionCount) : scoreByAnswers(inputs.finetuneAnswers)),
      inputs,
      capturedAt: new Date().toISOString(),
    };
    set((state) => ({
      layers: { ...state.layers, [version]: layer },
    }));
  },

  mergeLayers: () => {
    const { layers } = get();
    const present = ([1, 2, 3] as TwinVersion[]).filter((v) => layers[v]);
    if (present.length === 0) {
      set({ current: null });
      return null;
    }
    const top = present.reduce<TwinVersion>((a, b) => (b > a ? b : a), 1);

    // Weighted score merge — later layers dominate but earlier ones anchor
    const weights = present.map((v) => VERSION_CONFIDENCE[v]);
    const totalW = weights.reduce((a, b) => a + b, 0);
    const scores = Array.from({ length: 12 }, (_, i) =>
      clamp01(present.reduce((acc, v, idx) => {
        const layerScore = layers[v]?.scores[i] ?? 0.35;
        return acc + layerScore * weights[idx];
      }, 0) / (totalW || 1)),
    );

    const insights: string[] = [];
    const blindSpots: string[] = [];
    const sources: string[] = [];
    present.forEach((v) => {
      const layer = layers[v];
      if (!layer) return;
      sources.push(layer.label);
      const strong = layer.scores
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s >= 0.7)
        .map(({ i }) => `SICE dimension ${i + 1} แข็งแรงชั้น ${layer.label}`);
      insights.push(...strong.slice(0, 2));
      if (v === 2 && layer.inputs.finetuneAnswers) {
        insights.push(`ตอบปรับแต่ง ${Object.keys(layer.inputs.finetuneAnswers).length} ข้อ — ความแม่นยำ ${Math.round(VERSION_CONFIDENCE[2] * 100)}%`);
      }
      if (v === 3 && layer.inputs.decisionCount) {
        insights.push(`เรียนรู้จากการตัดสินใจจริง ${layer.inputs.decisionCount} ครั้ง`);
      }
      const weak = layer.scores
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s < 0.45)
        .map(({ i }) => `Blind Spot มีแนวโน้มในมิติ SICE ${i + 1}`);
      blindSpots.push(...weak.slice(0, 2));
    });

    // Dominant SICE = strongest merged dimension
    const maxIdx = scores.reduce((best, s, i) => (s > scores[best] ? i : best), 0);
    const SICE_KEYS: SICEKey[] = [
      'self', 'mind', 'decisions', 'purpose', 'career', 'wealth',
      'life', 'growth', 'relationships', 'love', 'health', 'future',
    ];

    const unified: UnifiedAnalysis = {
      version: top,
      confidence: VERSION_CONFIDENCE[top],
      insights: insights.slice(0, 6),
      blindSpots: blindSpots.slice(0, 4),
      dominantSICE: SICE_KEYS[maxIdx],
      scores,
      sources,
    };
    set({ current: unified });
    return unified;
  },

  logEvolution: (from, to, reason) => {
    set((state) => {
      // dedupe: เห็น to ซ้ำกับรายการล่าสุด = ไม่เพิ่ม (กัน duplicate event)
      const lastTo = state.evolutionLog[state.evolutionLog.length - 1]?.to ?? null;
      if (lastTo === to) return state;
      return {
        evolutionLog: [
          ...state.evolutionLog,
          { at: new Date().toISOString(), from, to, reason },
        ].slice(-50),
      };
    });
  },

  reset: () => set({ layers: {}, current: null, evolutionLog: [] }),
}));
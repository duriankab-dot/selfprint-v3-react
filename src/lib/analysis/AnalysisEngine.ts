/**
 * AnalysisEngine.ts — TC-201: unified analysis over pipeline v1→v2→v3.
 *
 * หลักการ: analyze ครั้งเดียวต่อ input ใหม่ แล้ว "merge" เข้า layer เดิม —
 * ไม่ใช่การวิเคราะห์ใหม่ทั้งหมดทุกครั้ง. Engine เป็น pure function
 * (ไม่อ่าน DOM/network) จึง deterministic และ testable ทั้งหมด.
 *
 * Confidence contract: v1 = 20% → v2 = 65% → v3 = 85%+
 */

import type {
  TwinInputSnapshot,
  TwinVersion,
  UnifiedAnalysis,
} from '../../store/twinStore';
import { VERSION_CONFIDENCE } from '../../store/twinStore';
import type { SICEKey } from '../twinVisualDNA';

export interface AnalysisContext {
  /** user id (anonymous ok — deterministic per id) */
  userId: string;
  /** pipeline trigger context */
  trigger: 'landing' | 'onboarding' | 'living';
  /** accumulated decision logs count (v3 signal) */
  decisionCount?: number;
  /** feedback deltas (v3 refinement signal) */
  feedbackDeltas?: number;
}

export interface TwinInput {
  version: TwinVersion;
  inputs: TwinInputSnapshot;
  /** 12-dimension scores 0..1 (จาก layer เดิม ถ้ามี) */
  scores?: number[];
}

export const SICE_KEYS: SICEKey[] = [
  'self', 'mind', 'decisions', 'purpose', 'career', 'wealth',
  'life', 'growth', 'relationships', 'love', 'health', 'future',
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Deterministic baseline scores from the input snapshot (seeded by userId) */
export function baselineScores(input: TwinInput, userId: string): number[] {
  const seedStr = `${input.inputs.dob ?? ''}|${userId}|${input.version}`;
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = ((h << 5) - h + seedStr.charCodeAt(i)) | 0;
  }
  const richness = input.inputs.finetuneAnswers
    ? Math.min(1, Object.values(input.inputs.finetuneAnswers).filter(Boolean).length / 5)
    : 0;
  const living = clamp01((input.inputs.decisionCount ?? 0) / 30);
  return Array.from({ length: 12 }, (_, i) => {
    const noise = (((h >> (i % 28)) & 15) / 15 - 0.5) * 0.12;
    const base = input.version === 1 ? 0.35 : input.version === 2 ? 0.5 : 0.6;
    return clamp01(base + richness * 0.25 + living * 0.3 + noise);
  });
}

/**
 * TC-201: analyze(input, context, version) — merge ทุก layer ที่มีจริง
 * เป็น UnifiedAnalysis เดียว ไม่ regenerate จากศูนย์
 */
export function analyze(
  input: TwinInput,
  context: AnalysisContext,
  previous?: UnifiedAnalysis | null,
): UnifiedAnalysis {
  const version = input.version;
  const confidence = VERSION_CONFIDENCE[version];

  // Merge previous analysis with the new layer — never re-derive from zero
  const mergedScores = Array.from({ length: 12 }, (_, i) => {
    const prevScore = previous?.scores?.[i];
    const newScore = input.scores?.[i];
    if (prevScore !== undefined && newScore !== undefined) {
      // 60/40 — new layer leads, previous anchors (behavior continuity)
      return clamp01(prevScore * 0.4 + newScore * 0.6);
    }
    return clamp01(newScore ?? prevScore ?? 0.35);
  });

  const insights: string[] = [];
  if (previous) {
    insights.push(...previous.insights.slice(0, Math.max(0, 4 - version)));
  }
  if (version === 1 && input.inputs.dob) {
    insights.push('พิมพ์เขียวพฤติกรรมเบื้องต้น 12 มิติ พร้อมแล้ว (ความแม่นยำ 20%)');
  }
  if (version === 2 && input.inputs.finetuneAnswers) {
    insights.push(
      `วิเคราะห์จากคำตอบปรับแต่ง ${Object.keys(input.inputs.finetuneAnswers).length} ข้อ — ความแม่นยำ 65%`,
    );
  }
  if (version === 3) {
    insights.push(
      `Twin เรียนรู้จากการตัดสินใจจริง ${input.inputs.decisionCount ?? context.decisionCount ?? 0} ครั้ง — ความแม่นยำ ${Math.round(confidence * 100)}%+`,
    );
  }

  const blindSpots = mergedScores
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s < 0.42)
    .map(({ i }) => `Blind Spot เสี่ยง: มิติ ${SICE_KEYS[i]}`)
    .slice(0, 4);

  const dominantIdx = mergedScores.reduce((b, s, i) => (s > mergedScores[b] ? i : b), 0);

  return {
    version,
    confidence,
    insights: insights.slice(0, 6),
    blindSpots,
    dominantSICE: SICE_KEYS[dominantIdx],
    scores: mergedScores,
    sources: previous ? [...previous.sources, `v${version}`] : [`v${version}`],
  };
}
/**
 * patternDetection.ts
 *
 * Phase 5.4 — Pattern Detection.
 *
 * Pure, deterministic trend detection over a user's decision_log history
 * (autonomy_level/confidence over time). No AI call, no network — just
 * compares the average of the earlier half of the person's history
 * against the later half.
 *
 * Scope note: this only detects autonomy/confidence trends over time,
 * using the same data already fetched for the Dashboard's TrendChart
 * (getAutonomyTrend — created_at/autonomy_level/confidence, no hub/mood).
 * Mood- or hub-specific correlation ("confidence is lower when stressed")
 * would need a richer query and is intentionally left for a later pass —
 * see docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md, Phase 5.4.
 *
 * MIN_DATA_POINTS exists so a brand-new user with 2-3 interactions never
 * gets shown a fabricated "trend" from noise.
 */

export interface TrendPoint {
  created_at: string;
  autonomy_level: number;
  confidence: number;
}

export type PatternDirection = 'up' | 'down';

export interface PatternInsight {
  type: 'autonomy_trend' | 'confidence_trend';
  direction: PatternDirection;
  message: string;
}

const MIN_DATA_POINTS = 6;
const MEANINGFUL_DELTA_AUTONOMY = 8; // out of a 0-100 scale
const MEANINGFUL_DELTA_CONFIDENCE = 0.08; // out of a 0-1 scale

function average(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function detectPatterns(points: TrendPoint[]): PatternInsight[] {
  if (points.length < MIN_DATA_POINTS) return [];

  const sorted = [...points].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const mid = Math.floor(sorted.length / 2);
  const earlier = sorted.slice(0, mid);
  const later = sorted.slice(mid);

  const insights: PatternInsight[] = [];

  const autonomyDelta =
    average(later.map((p) => p.autonomy_level)) - average(earlier.map((p) => p.autonomy_level));
  if (Math.abs(autonomyDelta) >= MEANINGFUL_DELTA_AUTONOMY) {
    const direction: PatternDirection = autonomyDelta > 0 ? 'up' : 'down';
    insights.push({
      type: 'autonomy_trend',
      direction,
      message:
        direction === 'up'
          ? `ระดับความเป็นอิสระในการตัดสินใจของคุณเพิ่มขึ้นประมาณ ${Math.round(autonomyDelta)} จุด เมื่อเทียบช่วงหลังกับช่วงแรก`
          : `ระดับความเป็นอิสระในการตัดสินใจของคุณลดลงประมาณ ${Math.round(Math.abs(autonomyDelta))} จุด เมื่อเทียบช่วงหลังกับช่วงแรก`,
    });
  }

  const confidenceDelta =
    average(later.map((p) => p.confidence)) - average(earlier.map((p) => p.confidence));
  if (Math.abs(confidenceDelta) >= MEANINGFUL_DELTA_CONFIDENCE) {
    const direction: PatternDirection = confidenceDelta > 0 ? 'up' : 'down';
    insights.push({
      type: 'confidence_trend',
      direction,
      message:
        direction === 'up'
          ? 'ความมั่นใจในการตัดสินใจของคุณสูงขึ้นในช่วงหลัง เมื่อเทียบกับช่วงแรกที่เริ่มใช้งาน'
          : 'ความมั่นใจในการตัดสินใจของคุณลดลงในช่วงหลัง เมื่อเทียบกับช่วงแรกที่เริ่มใช้งาน',
    });
  }

  return insights;
}

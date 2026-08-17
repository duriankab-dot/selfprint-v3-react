/**
 * patternDetection.ts
 *
 * Phase 5.4 — Pattern Detection, extended (Phase 5.4+) with mood/hub
 * correlation.
 *
 * Pure, deterministic trend detection over a user's decision_log history
 * (autonomy_level/confidence over time, now also grouped by hub/mood).
 * No AI call, no network.
 *
 * Two kinds of insight:
 * 1. autonomy_trend / confidence_trend — earlier half vs later half of the
 *    person's whole history (unchanged from the original Phase 5.4).
 * 2. mood_confidence / hub_autonomy — is one specific mood/hub's average
 *    meaningfully different from the average of everything else? (e.g.
 *    "ความมั่นใจต่ำกว่าปกติเวลารู้สึกเครียด") Needs hub/mood on each point —
 *    see getAutonomyTrend() in supabase-service.ts, which now selects them.
 *
 * MIN_DATA_POINTS/MIN_GROUP_POINTS exist so a brand-new user, or a mood/hub
 * they've only hit once or twice, never gets shown a fabricated "pattern"
 * from noise.
 */

export interface TrendPoint {
  created_at: string;
  autonomy_level: number;
  confidence: number;
  hub?: string;
  mood?: string;
}

export type PatternDirection = 'up' | 'down';

export type PatternType =
  | 'autonomy_trend'
  | 'confidence_trend'
  | 'mood_confidence'
  | 'hub_autonomy';

export interface PatternInsight {
  type: PatternType;
  direction: PatternDirection;
  message: string;
}

const MIN_DATA_POINTS = 6;
const MIN_GROUP_POINTS = 3;
const MEANINGFUL_DELTA_AUTONOMY = 8; // out of a 0-100 scale
const MEANINGFUL_DELTA_CONFIDENCE = 0.08; // out of a 0-1 scale

const MOOD_LABEL_TH: Record<string, string> = {
  stressed: 'เครียด',
  confused: 'สับสน',
  confident: 'มั่นใจ',
  drained: 'หมดแรง',
  ready: 'พร้อม',
  reflective: 'ครุ่นคิด',
};

const HUB_LABEL_TH: Record<string, string> = {
  identity: 'ตัวตน',
  decision: 'การตัดสินใจ',
  relationship: 'ความสัมพันธ์',
  career: 'อาชีพ',
  health: 'สุขภาพ',
  money: 'เงินตรา',
  'ai-twin': 'AI Twin',
  learning: 'การเรียนรู้',
  creativity: 'ความสร้างสรรค์',
  spirituality: 'ความเป็นอยู่',
  impact: 'ผลกระทบ',
  activities: 'กิจกรรม',
};

function average(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function detectTrend(points: TrendPoint[]): PatternInsight[] {
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

/**
 * เทียบค่าเฉลี่ยของกลุ่มย่อย (แต่ละ mood หรือแต่ละ hub) กับค่าเฉลี่ยของจุดอื่น
 * ที่เหลือทั้งหมด — ไม่ใช่เทียบกับค่าเฉลี่ยรวม (ซึ่งจะรวมตัวมันเองเข้าไปด้วย
 * ทำให้ delta เพี้ยนถ้ากลุ่มนั้นมีสัดส่วนเยอะ)
 */
function detectGroupCorrelation(
  points: TrendPoint[],
  groupBy: 'mood' | 'hub',
  metric: 'autonomy_level' | 'confidence',
  patternType: PatternType,
  meaningfulDelta: number,
  labelMap: Record<string, string>,
  buildMessage: (groupLabel: string, direction: PatternDirection) => string
): PatternInsight[] {
  const groups = new Map<string, TrendPoint[]>();
  for (const p of points) {
    const key = p[groupBy];
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  const insights: PatternInsight[] = [];

  for (const [key, groupPoints] of groups) {
    if (groupPoints.length < MIN_GROUP_POINTS) continue;
    const rest = points.filter((p) => p[groupBy] !== key);
    if (rest.length === 0) continue;

    const groupAvg = average(groupPoints.map((p) => p[metric]));
    const restAvg = average(rest.map((p) => p[metric]));
    const delta = groupAvg - restAvg;

    if (Math.abs(delta) >= meaningfulDelta) {
      const direction: PatternDirection = delta > 0 ? 'up' : 'down';
      insights.push({
        type: patternType,
        direction,
        message: buildMessage(labelMap[key] ?? key, direction),
      });
    }
  }

  return insights;
}

export function detectPatterns(points: TrendPoint[]): PatternInsight[] {
  if (points.length < MIN_DATA_POINTS) return [];

  const insights: PatternInsight[] = [...detectTrend(points)];

  insights.push(
    ...detectGroupCorrelation(
      points,
      'mood',
      'confidence',
      'mood_confidence',
      MEANINGFUL_DELTA_CONFIDENCE,
      MOOD_LABEL_TH,
      (mood, direction) =>
        direction === 'up'
          ? `ความมั่นใจในการตัดสินใจของคุณสูงกว่าปกติเวลารู้สึก${mood}`
          : `ความมั่นใจในการตัดสินใจของคุณต่ำกว่าปกติเวลารู้สึก${mood}`
    )
  );

  insights.push(
    ...detectGroupCorrelation(
      points,
      'hub',
      'autonomy_level',
      'hub_autonomy',
      MEANINGFUL_DELTA_AUTONOMY,
      HUB_LABEL_TH,
      (hub, direction) =>
        direction === 'up'
          ? `คุณมีความเป็นอิสระในการตัดสินใจสูงกว่าปกติเวลาคุยเรื่อง${hub}`
          : `คุณมีความเป็นอิสระในการตัดสินใจต่ำกว่าปกติเวลาคุยเรื่อง${hub}`
    )
  );

  return insights;
}

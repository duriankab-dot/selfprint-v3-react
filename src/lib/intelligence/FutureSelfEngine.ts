/**
 * FutureSelfEngine.ts
 *
 * Master Direction §46 — Advanced Adaptive Environments > Future Self
 *
 * Projects the user's personal trajectory into 3 time horizons
 * based entirely on their PersonalContext (strengths, blindSpots, goals, decisionStyle).
 *
 * กฎ: No mocks, no hardcode — pure rule-based computation from real PersonalContext.
 *     ถ้า PersonalContext ไม่ครบ → degrades gracefully to generic projections.
 *
 * Output horizons:
 *   30 days  — "ใกล้" — actionable, specific
 *   90 days  — "กลาง" — directional, grounded
 *   365 days — "ไกล" — aspirational, pattern-based
 */

import type { PersonalContext, Strength, BlindSpot, Goal } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FutureHorizon = '30d' | '90d' | '365d';

export interface FutureSelfScenario {
  /** Time horizon */
  horizon: FutureHorizon;
  /** ชื่อ horizon ภาษาไทย */
  horizonLabel: string;
  /**
   * Likely trajectory — what's most probable if user stays on current path
   * 3 bullet-point strings (Thai)
   */
  likelyTrajectory: string[];
  /**
   * Growth opportunities — areas that are "ready to unlock"
   */
  growthOpportunities: string[];
  /**
   * Risk areas — blindspots or patterns that could limit growth
   */
  riskAreas: string[];
  /**
   * The single hub AI recommends focusing on for this horizon
   */
  recommendedFocusHub: string;
  /**
   * Key question for this horizon (for reflection)
   */
  keyQuestion: string;
  /**
   * Confidence: how much PersonalContext data was available (0–1)
   */
  confidence: number;
}

export interface FutureSelfProjection {
  scenarios: FutureSelfScenario[];
  /** Summary insight across all horizons */
  overallNarrative: string;
  /** Primary strength that will carry the user forward */
  leadingStrength: string | null;
  /** Primary blindspot to watch */
  primaryRisk: string | null;
  /** computed from PersonalContext availability */
  dataQuality: 'rich' | 'moderate' | 'sparse';
}

// ─── Hub label map ────────────────────────────────────────────────────────────

const HUB_LABELS: Record<string, string> = {
  identity:     'ตัวตน (Identity)',
  decision:     'การตัดสินใจ (Decision)',
  relationship: 'ความสัมพันธ์ (Relationship)',
  career:       'อาชีพ (Career)',
  health:       'สุขภาพ (Health)',
  money:        'การเงิน (Money)',
  'ai-twin':    'AI Twin',
  learning:     'การเรียนรู้ (Learning)',
  creativity:   'ความคิดสร้างสรรค์ (Creativity)',
  spirituality: 'จิตใจ (Spirituality)',
  impact:       'ผลกระทบ (Impact)',
  activities:   'กิจกรรม (Activities)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Score confidence from PersonalContext completeness */
function scoreContext(ctx: PersonalContext): number {
  let score = 0;
  if (ctx.values.length > 0)    score += 0.2;
  if (ctx.strengths.length > 0) score += 0.2;
  if (ctx.goals.length > 0)     score += 0.2;
  if (ctx.blindSpots.length > 0) score += 0.15;
  if (ctx.sourceCount > 2)      score += 0.15;
  if (ctx.confidenceOverall > 0.5) score += 0.1;
  return Math.min(1, score);
}

/** Pick top N items by confidence */
function topByConfidence<T extends { confidence: number }>(arr: T[], n: number): T[] {
  return [...arr].sort((a, b) => b.confidence - a.confidence).slice(0, n);
}

/** Build trajectory bullets from strengths + goals */
function buildTrajectory(
  strengths: Strength[],
  goals: Goal[],
  horizon: FutureHorizon
): string[] {
  const bullets: string[] = [];

  if (strengths.length > 0) {
    const s = strengths[0];
    const timePhrase = horizon === '30d' ? 'เดือนนี้' : horizon === '90d' ? 'ไตรมาสนี้' : 'ปีนี้';
    bullets.push(`${timePhrase} คุณมีแนวโน้มจะนำ "${s.name}" มาใช้แก้ปัญหาสำคัญ`);
  }

  if (goals.length > 0) {
    const g = goals[0];
    bullets.push(`เป้าหมาย "${g.title}" มีโอกาสคืบหน้าอย่างมีนัยสำคัญ`);
  }

  const genericByHorizon: Record<FutureHorizon, string> = {
    '30d':  'Pattern การตัดสินใจของคุณกำลังเข้มแข็งขึ้น — โอกาสดีสำหรับการเริ่มต้นสิ่งใหม่',
    '90d':  'คุณกำลังสะสม momentum ที่จะเปลี่ยนทิศทางชีวิตได้ภายในช่วงนี้',
    '365d': 'ตัวตน (Identity) และทักษะของคุณจะถูก distill ให้ชัดเจนขึ้นอย่างมากในปีนี้',
  };
  bullets.push(genericByHorizon[horizon]);

  return bullets;
}

/** Build growth opportunities from strengths + goals */
function buildGrowth(strengths: Strength[], goals: Goal[], horizon: FutureHorizon): string[] {
  const items: string[] = [];

  strengths.slice(0, 2).forEach((s) => {
    items.push(`ขยาย "${s.name}" ให้กว้างขึ้นในบริบทใหม่`);
  });

  goals.slice(0, 1).forEach((g) => {
    items.push(`เดินหน้า "${g.title}" ให้เป็นรูปธรรม`);
  });

  if (horizon === '365d') {
    items.push('พิจารณาสร้าง signature approach ที่เป็นเอกลักษณ์ของคุณ');
  }

  if (items.length === 0) {
    items.push('สร้าง self-awareness ด้วยการบันทึก reflection สม่ำเสมอ');
  }

  return items.slice(0, 3);
}

/** Build risk areas from blindspots */
function buildRisks(blindSpots: BlindSpot[], horizon: FutureHorizon): string[] {
  const risks: string[] = [];

  const visible = blindSpots.filter((b) => b.sensitivityLevel !== 'high');
  visible.slice(0, 2).forEach((b) => {
    risks.push(`ระวัง: "${b.title}" — ${b.description ?? 'อาจกระทบการตัดสินใจสำคัญ'}`);
  });

  if (risks.length === 0) {
    const generic: Record<FutureHorizon, string> = {
      '30d':  'ระวังการ overcommit กับสิ่งที่ยังไม่ชัดเจน',
      '90d':  'ระวัง pattern การชะลอการตัดสินใจในช่วง transition',
      '365d': 'ระวัง drift จากเป้าหมายหลักเมื่อมี opportunity ใหม่เข้ามา',
    };
    risks.push(generic[horizon]);
  }

  return risks;
}

/** Recommend hub from hubsActive or goals */
function recommendHub(ctx: PersonalContext): string {
  if (ctx.hubsActive && ctx.hubsActive.length > 0) {
    const hub = ctx.hubsActive[0];
    return HUB_LABELS[hub] ?? hub;
  }
  if (ctx.goals.length > 0 && ctx.goals[0].relatedHub) {
    const hub = ctx.goals[0].relatedHub;
    return HUB_LABELS[hub] ?? hub;
  }
  return HUB_LABELS['identity'];
}

/** Key question per horizon */
function keyQuestion(ctx: PersonalContext, horizon: FutureHorizon): string {
  const style = ctx.decisionStyle?.type ?? 'mixed';

  const questions: Record<FutureHorizon, Record<string, string>> = {
    '30d': {
      analytical:    'อะไรคือข้อมูลชิ้นเดียวที่จะเปลี่ยนการตัดสินใจของคุณในเดือนนี้?',
      intuitive:     'ความรู้สึกไหนที่ดังที่สุดในตอนนี้ และมันกำลังบอกอะไรคุณ?',
      collaborative: 'ใครที่คุณควรพูดคุยด้วยก่อนก้าวต่อไป?',
      mixed:         'ขั้นตอนเล็กที่สุดที่คุณสามารถทำได้วันพรุ่งนี้คืออะไร?',
    },
    '90d': {
      analytical:    '90 วันนี้คุณจะวัด progress ด้วยตัวเลขอะไร?',
      intuitive:     'ถ้า 3 เดือนนี้สมบูรณ์แบบ มันจะรู้สึกอย่างไร?',
      collaborative: 'ใครควรอยู่ในทีมของคุณเพื่อเป้าหมาย 90 วัน?',
      mixed:         'อะไรที่ต้องหยุดทำ เพื่อให้มีพื้นที่สำหรับสิ่งสำคัญ?',
    },
    '365d': {
      analytical:    'ปีนี้คุณจะสร้าง system อะไรที่ทำงานแทนคุณได้?',
      intuitive:     'ปีหน้านี้คุณอยากเป็นใคร?',
      collaborative: 'ชุมชนหรือ network ไหนที่จะเป็น catalyst ของการเติบโตของคุณ?',
      mixed:         'อะไรคือ one thing ที่ถ้าทำได้ในปีนี้ จะ unlock ทุกอย่างตามมา?',
    },
  };

  return questions[horizon][style] ?? questions[horizon]['mixed'];
}

// ─── FutureSelfEngine ─────────────────────────────────────────────────────────

export class FutureSelfEngine {

  /**
   * Project user's future self across 3 horizons
   */
  project(ctx: PersonalContext): FutureSelfProjection {
    const confidence = scoreContext(ctx);
    const dataQuality: FutureSelfProjection['dataQuality'] =
      confidence >= 0.7 ? 'rich' : confidence >= 0.4 ? 'moderate' : 'sparse';

    const topStrengths = topByConfidence(ctx.strengths, 3);
    const topGoals     = topByConfidence(ctx.goals, 3);
    const topBlinds    = topByConfidence(ctx.blindSpots, 3);

    const horizons: FutureHorizon[] = ['30d', '90d', '365d'];
    const labels: Record<FutureHorizon, string> = {
      '30d':  '30 วัน',
      '90d':  '90 วัน',
      '365d': '1 ปี',
    };

    const scenarios: FutureSelfScenario[] = horizons.map((horizon) => ({
      horizon,
      horizonLabel: labels[horizon],
      likelyTrajectory:    buildTrajectory(topStrengths, topGoals, horizon),
      growthOpportunities: buildGrowth(topStrengths, topGoals, horizon),
      riskAreas:           buildRisks(topBlinds, horizon),
      recommendedFocusHub: recommendHub(ctx),
      keyQuestion:         keyQuestion(ctx, horizon),
      confidence,
    }));

    // Overall narrative from decision style + top strength
    const leadingStrength = topStrengths[0]?.name ?? null;
    const primaryRisk     = topBlinds.filter((b) => b.sensitivityLevel !== 'high')[0]?.title ?? null;

    const styleDescriptions: Record<string, string> = {
      analytical:    'คุณใช้ข้อมูลและตรรกะเป็นแกนนำ — นี่คือพลังสำคัญของคุณ',
      intuitive:     'คุณไวต่อ signal รอบข้าง — ความสามารถนี้จะยิ่งแหลมคมขึ้นเรื่อยๆ',
      collaborative: 'คุณเติบโตได้ดีในบริบทที่มีการแลกเปลี่ยน — ให้ใช้มันเป็นข้อได้เปรียบ',
      mixed:         'คุณมีความยืดหยุ่นในการตัดสินใจ — เป็นจุดแข็งในยุคที่เปลี่ยนแปลงเร็ว',
    };

    const overallNarrative =
      styleDescriptions[ctx.decisionStyle?.type ?? 'mixed'] +
      (leadingStrength ? ` ความโดดเด่นด้าน "${leadingStrength}" จะเป็น anchor ของการเติบโตของคุณ` : '');

    return {
      scenarios,
      overallNarrative,
      leadingStrength,
      primaryRisk,
      dataQuality,
    };
  }
}

export default FutureSelfEngine;

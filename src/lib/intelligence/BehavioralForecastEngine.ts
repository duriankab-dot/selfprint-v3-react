/**
 * BehavioralForecastEngine.ts
 *
 * Master Direction §46 — Advanced Behavioral Forecasting
 *
 * ทำนาย behavioral patterns จาก PersonalContext:
 *  - next_likely_mood (mood ที่น่าจะเกิดขึ้นถัดไป)
 *  - predicted_hub_focus (hub ที่ AI คาดว่าผู้ใช้จะให้ความสนใจ)
 *  - behavioral_risks (ความเสี่ยงด้านพฤติกรรมที่ควรระวัง)
 *  - positive_momentum (สิ่งที่กำลังดีและควรต่อยอด)
 *
 * กฎ: No mocks — pure rule-based computation จาก PersonalContext
 *     Graceful degradation ถ้าข้อมูลน้อย
 */

import type { PersonalContext } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MoodPrediction =
  | 'focused'
  | 'reflective'
  | 'energized'
  | 'cautious'
  | 'creative'
  | 'grounded'
  | 'uncertain';

export interface BehavioralRisk {
  risk: string;          // Thai description
  category: 'mindset' | 'habit' | 'relationship' | 'energy' | 'decision';
  likelihood: 'low' | 'medium' | 'high';
  mitigation: string;   // Thai actionable mitigation
}

export interface PositiveMomentum {
  area: string;         // Thai — what's going well
  driver: string;       // Thai — why it's going well
  howToAmplify: string; // Thai — how to make it stronger
}

export interface BehavioralForecast {
  /** Predicted mood state (next likely state) */
  nextLikelyMood: MoodPrediction;
  nextLikelyMoodLabel: string;        // Thai label
  nextLikelyMoodRationale: string;    // Thai explanation
  /** Hub AI predicts user will gravitate toward */
  predictedHubFocus: string;          // hub key
  predictedHubFocusLabel: string;     // Thai hub name
  predictedHubFocusReason: string;    // Thai explanation
  /** Behavioral risks to watch */
  behavioralRisks: BehavioralRisk[];
  /** Things going well — should be amplified */
  positiveMomentum: PositiveMomentum[];
  /** Overall forecast summary (1 sentence Thai) */
  forecastSummary: string;
  /** How confident we are (based on PersonalContext depth) */
  confidence: number;
}

// ─── Mood labels ──────────────────────────────────────────────────────────────

const MOOD_LABELS: Record<MoodPrediction, string> = {
  focused:    'โฟกัส',
  reflective: 'ครุ่นคิด',
  energized:  'มีพลัง',
  cautious:   'ระมัดระวัง',
  creative:   'สร้างสรรค์',
  grounded:   'มั่นคง',
  uncertain:  'ไม่แน่ใจ',
};

// ─── Hub label map ────────────────────────────────────────────────────────────

const HUB_NAME_THAI: Record<string, string> = {
  identity:     'ตัวตน',
  career:       'อาชีพ',
  relationship: 'ความสัมพันธ์',
  health:       'สุขภาพ',
  money:        'การเงิน',
  creativity:   'ความคิดสร้างสรรค์',
  learning:     'การเรียนรู้',
  spirituality: 'จิตใจ',
  impact:       'ผลกระทบ',
  decision:     'การตัดสินใจ',
  activities:   'กิจกรรม',
  'ai-twin':    'AI Twin',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeConfidence(ctx: PersonalContext): number {
  let score = 0;
  if (ctx.values.length > 0) score += 0.15;
  if (ctx.strengths.length > 0) score += 0.15;
  if (ctx.blindSpots.length > 0) score += 0.2;
  if (ctx.emotionalRange?.primaryMoods?.length > 0) score += 0.2;
  if (ctx.goals.length > 0) score += 0.15;
  if (ctx.confidenceOverall > 0.5) score += 0.15;
  return Math.min(1, score);
}

function predictMood(ctx: PersonalContext): { mood: MoodPrediction; rationale: string } {
  const decisionStyle = ctx.decisionStyle?.type ?? 'mixed';
  const primaryMoods = ctx.emotionalRange?.primaryMoods ?? [];
  const hasStrongStrengths = ctx.strengths.some((s) => s.confidence > 0.7);
  const hasBlindSpots = ctx.blindSpots.length > 0;
  const goalCount = ctx.goals.length;

  // Rule-based prediction
  if (primaryMoods.includes('curious') || decisionStyle === 'analytical') {
    return {
      mood: 'focused',
      rationale: 'รูปแบบการคิดเชิงวิเคราะห์ของคุณมักนำไปสู่สภาวะ focused',
    };
  }

  if (primaryMoods.includes('creative') || ctx.hubsActive?.includes('creativity')) {
    return {
      mood: 'creative',
      rationale: 'energy สร้างสรรค์กำลังขึ้น — เป็นช่วงที่ดีสำหรับ ideation',
    };
  }

  if (hasBlindSpots && goalCount > 2) {
    return {
      mood: 'reflective',
      rationale: 'เมื่อมีทั้งเป้าหมายและ blind spots ที่ชัดเจน จิตใจมักเข้าสู่ช่วง reflective',
    };
  }

  if (hasStrongStrengths && goalCount > 0) {
    return {
      mood: 'energized',
      rationale: 'คุณมี strengths ที่แข็งแกร่งและเป้าหมายชัดเจน — เป็น combination ที่สร้าง momentum',
    };
  }

  if (primaryMoods.includes('calm') || decisionStyle === 'collaborative') {
    return {
      mood: 'grounded',
      rationale: 'แนวโน้มของคุณคือการ ground ตัวเองก่อนตัดสินใจ',
    };
  }

  if (decisionStyle === 'intuitive') {
    return {
      mood: 'cautious',
      rationale: 'สัญชาตญาณของคุณอาจกำลังส่งสัญญาณให้ระวังบางอย่าง',
    };
  }

  return {
    mood: 'uncertain',
    rationale: 'AI ยังไม่มีข้อมูลเพียงพอที่จะทำนาย mood ได้อย่างแม่นยำ — เพิ่ม reflection จะช่วยได้',
  };
}

function predictHubFocus(ctx: PersonalContext): { hub: string; reason: string } {
  // Priority: hubs with active goals → most recently active hub → fallback identity
  const hubsWithGoals = ctx.goals
    .filter((g) => g.relatedHub)
    .map((g) => g.relatedHub as string);

  if (hubsWithGoals.length > 0) {
    const hub = hubsWithGoals[0];
    const goal = ctx.goals.find((g) => g.relatedHub === hub);
    return {
      hub,
      reason: `คุณมีเป้าหมาย "${goal?.title ?? hub}" ที่ active อยู่ใน hub นี้`,
    };
  }

  if (ctx.hubsActive && ctx.hubsActive.length > 0) {
    const hub = ctx.hubsActive[0];
    return {
      hub,
      reason: `${HUB_NAME_THAI[hub] ?? hub} เป็น hub ที่คุณมี engagement สูงที่สุดในช่วงนี้`,
    };
  }

  return {
    hub: 'identity',
    reason: 'การสร้างความชัดเจนในตัวตนเป็นรากฐานของการเติบโตในทุก hub',
  };
}

function buildBehavioralRisks(ctx: PersonalContext): BehavioralRisk[] {
  const risks: BehavioralRisk[] = [];
  const decisionStyle = ctx.decisionStyle?.type ?? 'mixed';

  // Risk from decision style
  if (decisionStyle === 'analytical') {
    risks.push({
      risk: 'Analysis paralysis — การรอข้อมูลจนล่าช้าเกินไป',
      category: 'decision',
      likelihood: 'medium',
      mitigation: 'กำหนด "decision deadline" ล่วงหน้า และยึดตาม threshold ที่ตั้งไว้',
    });
  }

  if (decisionStyle === 'intuitive') {
    risks.push({
      risk: 'Over-trusting gut feeling ในสถานการณ์ที่ต้องการข้อมูล',
      category: 'decision',
      likelihood: 'medium',
      mitigation: 'ใช้ gut เป็น tiebreaker ไม่ใช่ primary signal — ตรวจสอบด้วยข้อมูลเสมอ',
    });
  }

  // Risk from blindspots
  ctx.blindSpots.filter((b) => b.sensitivityLevel !== 'high').slice(0, 2).forEach((b) => {
    risks.push({
      risk: `Pattern "${b.title}" อาจขัดขวางความก้าวหน้า`,
      category: 'mindset',
      likelihood: b.confidence > 0.7 ? 'high' : 'medium',
      mitigation: `สร้าง awareness ทุกครั้งก่อนตัดสินใจสำคัญ — ถามตัวเองว่า "${b.title}" กำลัง operate อยู่ไหม`,
    });
  });

  // Generic energy risk
  if (ctx.goals.length > 3) {
    risks.push({
      risk: 'การ overcommit กับเป้าหมายหลายข้อพร้อมกัน',
      category: 'energy',
      likelihood: 'medium',
      mitigation: 'เลือก "Big 3" เป้าหมายหลักและ focus ให้ชัดก่อนขยาย',
    });
  }

  if (risks.length === 0) {
    risks.push({
      risk: 'ยังไม่มีข้อมูลเพียงพอสำหรับการทำนายความเสี่ยง',
      category: 'mindset',
      likelihood: 'low',
      mitigation: 'เพิ่ม reflection และ onboarding data เพื่อให้ AI ทำนายได้แม่นยำขึ้น',
    });
  }

  return risks;
}

function buildPositiveMomentum(ctx: PersonalContext): PositiveMomentum[] {
  const momentum: PositiveMomentum[] = [];

  // From strengths
  ctx.strengths.filter((s) => s.confidence > 0.6).slice(0, 2).forEach((s) => {
    momentum.push({
      area: `ความแข็งแกร่งด้าน "${s.name}"`,
      driver: `มีหลักฐาน ${Math.round(s.confidence * 100)}% confidence จาก AI model`,
      howToAmplify: `หาบริบทใหม่ที่จะนำ "${s.name}" ไปใช้และยังไม่เคยลอง`,
    });
  });

  // From active hubs (user is engaged)
  if (ctx.hubsActive && ctx.hubsActive.length > 0) {
    const hub = ctx.hubsActive[0];
    momentum.push({
      area: `Engagement ใน Hub "${HUB_NAME_THAI[hub] ?? hub}"`,
      driver: 'คุณมี active presence ใน hub นี้ แสดงถึงความสนใจที่แท้จริง',
      howToAmplify: `ตั้ง weekly goal เล็กๆ ใน hub นี้เพื่อรักษา momentum`,
    });
  }

  // From goals
  const highConfGoal = ctx.goals.find((g) => g.confidence > 0.6);
  if (highConfGoal) {
    momentum.push({
      area: `ความชัดเจนในเป้าหมาย "${highConfGoal.title}"`,
      driver: 'AI detect ว่าเป้าหมายนี้มี clarity สูง — good signal สำหรับ execution',
      howToAmplify: 'แตกเป้าหมายนี้เป็น milestones รายสัปดาห์เพื่อรักษา momentum',
    });
  }

  if (momentum.length === 0) {
    momentum.push({
      area: 'การเริ่มต้นใช้ Selfprint',
      driver: 'การลงทุนเวลาในการเข้าใจตัวเองเป็นจุดเริ่มต้นที่ดี',
      howToAmplify: 'เพิ่ม reflection สม่ำเสมอเพื่อให้ AI เรียนรู้ตัวคุณได้เร็วขึ้น',
    });
  }

  return momentum;
}

// ─── BehavioralForecastEngine ─────────────────────────────────────────────────

export class BehavioralForecastEngine {

  forecast(ctx: PersonalContext): BehavioralForecast {
    const confidence = computeConfidence(ctx);
    const { mood, rationale } = predictMood(ctx);
    const { hub, reason } = predictHubFocus(ctx);
    const risks = buildBehavioralRisks(ctx);
    const momentum = buildPositiveMomentum(ctx);

    // Summary sentence
    const moodLabel = MOOD_LABELS[mood];
    const hubLabel = HUB_NAME_THAI[hub] ?? hub;
    const forecastSummary =
      confidence > 0.5
        ? `AI ทำนายว่าคุณมีแนวโน้มอยู่ในสภาวะ ${moodLabel} และจะให้ความสนใจ ${hubLabel} ในช่วงถัดไป`
        : `ข้อมูลยังน้อยอยู่ — เพิ่ม reflection เพื่อให้ AI ทำนายพฤติกรรมของคุณได้แม่นยำขึ้น`;

    return {
      nextLikelyMood: mood,
      nextLikelyMoodLabel: moodLabel,
      nextLikelyMoodRationale: rationale,
      predictedHubFocus: hub,
      predictedHubFocusLabel: hubLabel,
      predictedHubFocusReason: reason,
      behavioralRisks: risks,
      positiveMomentum: momentum,
      forecastSummary,
      confidence,
    };
  }
}

export default BehavioralForecastEngine;

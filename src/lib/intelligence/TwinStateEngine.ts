/**
 * TwinStateEngine.ts
 *
 * Master Direction §3 — Living AI Twin States
 *
 * Computes which Twin state applies based on PersonalContext data depth.
 * States progress as the model learns more about the user.
 *
 * State ladder (least → most known):
 *   AWAKENING → AWARE → CONNECTED → REFLECTIVE → INSIGHTFUL → ALIGNED
 *
 * These are NOT gamification labels. They reflect actual depth of Personal Model.
 *
 * Rule: never hardcode or mock — always compute from real PersonalContext.
 */

import type { PersonalContext } from './types';

// ============================================================================
// Types
// ============================================================================

export type TwinState =
  | 'awakening'
  | 'aware'
  | 'connected'
  | 'reflective'
  | 'insightful'
  | 'aligned'
  | 'flourishing'
  | 'mastery';

export type ProcessingState =
  | 'analyzing'
  | 'synthesizing'
  | 'calibrating'
  | 'awakening_process'
  | 'ready';

export interface TwinStateResult {
  state: TwinState;
  label: string;           // Thai display label
  labelEn: string;         // English label
  description: string;     // What this means for the user
  progress: number;        // 0–100 visual progress
  nextMilestone: string;   // What to do to advance
  glowColor: string;       // CSS color for the orb glow
  particleIntensity: number; // 1–5 for animation intensity
}

export interface ProcessingStateInfo {
  state: ProcessingState;
  label: string;
  description: string;
}

// ============================================================================
// Processing State sequence (§5)
// ============================================================================

export const PROCESSING_STATES: ProcessingStateInfo[] = [
  {
    state: 'analyzing',
    label: 'ANALYZING',
    description: 'กำลังทำความเข้าใจข้อมูล',
  },
  {
    state: 'synthesizing',
    label: 'SYNTHESIZING',
    description: 'กำลังเชื่อมโยงรูปแบบ',
  },
  {
    state: 'calibrating',
    label: 'CALIBRATING',
    description: 'กำลังปรับ Personal Model',
  },
  {
    state: 'awakening_process',
    label: 'AWAKENING',
    description: 'Twin กำลังถูกสร้าง',
  },
  {
    state: 'ready',
    label: 'READY',
    description: 'Twin พร้อมทำความรู้จักคุณ',
  },
];

// ============================================================================
// State definitions
// ============================================================================

const STATE_DEFS: Record<TwinState, Omit<TwinStateResult, 'state' | 'progress' | 'nextMilestone'>> = {
  awakening: {
    label: 'กำลังตื่น',
    labelEn: 'AWAKENING',
    description: 'Twin เริ่มรับรู้ตัวตนของคุณ',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    particleIntensity: 1,
  },
  aware: {
    label: 'รับรู้',
    labelEn: 'AWARE',
    description: 'Twin เริ่มเข้าใจค่านิยมและเป้าหมายของคุณ',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    particleIntensity: 2,
  },
  connected: {
    label: 'เชื่อมต่อ',
    labelEn: 'CONNECTED',
    description: 'Twin เชื่อมโยงรูปแบบพฤติกรรมของคุณ',
    glowColor: 'rgba(79, 70, 229, 0.6)',
    particleIntensity: 3,
  },
  reflective: {
    label: 'สะท้อน',
    labelEn: 'REFLECTIVE',
    description: 'Twin เห็นสิ่งที่เปลี่ยนแปลงในตัวคุณ',
    glowColor: 'rgba(67, 56, 202, 0.65)',
    particleIntensity: 3,
  },
  insightful: {
    label: 'เข้าใจลึก',
    labelEn: 'INSIGHTFUL',
    description: 'Twin เข้าใจ Blind Spots และพลังของคุณ',
    glowColor: 'rgba(124, 58, 237, 0.7)',
    particleIntensity: 4,
  },
  aligned: {
    label: 'สอดคล้อง',
    labelEn: 'ALIGNED',
    description: 'Twin เข้าใจตัวตนคุณอย่างสมบูรณ์',
    glowColor: 'rgba(109, 40, 217, 0.8)',
    particleIntensity: 5,
  },
  flourishing: {
    label: 'เบ่งบาน',
    labelEn: 'FLOURISHING',
    description: 'Twin เห็นพลังชีวิตของคุณเติบโตอย่างต่อเนื่อง',
    glowColor: 'rgba(52, 211, 153, 0.85)',
    particleIntensity: 5,
  },
  mastery: {
    label: 'เชี่ยวชาญ',
    labelEn: 'MASTERY',
    description: 'Twin เข้าใจตัวคุณในระดับที่ลึกที่สุด — ผู้เชี่ยวชาญชีวิตตัวเอง',
    glowColor: 'rgba(251, 191, 36, 0.9)',
    particleIntensity: 5,
  },
};

// ============================================================================
// Score computation helpers
// ============================================================================

/**
 * Count how many non-empty fields exist in a PersonalContext object.
 * Used to determine how much the model actually knows.
 */
function scoreContext(ctx: PersonalContext): number {
  let score = 0;

  // Core identity signals
  if (ctx.values?.length > 0) score += ctx.values.length * 2;
  if (ctx.goals?.length > 0) score += ctx.goals.length * 2;
  if (ctx.decisionStyle?.type) score += 4;

  // EmotionalRange is an object — score for having primary moods
  if (ctx.emotionalRange?.primaryMoods?.length > 0) {
    score += ctx.emotionalRange.primaryMoods.length;
  }

  // Depth signals
  if (ctx.strengths?.length > 0) score += ctx.strengths.length * 2;
  if (ctx.blindSpots?.length > 0) score += ctx.blindSpots.length * 3; // Blind spots = deep knowledge
  if ((ctx.hubsActive?.length ?? 0) > 0) score += ctx.hubsActive!.length;

  // Confidence signal (higher confidence = more score)
  if (ctx.confidenceOverall > 0) {
    score += Math.round(ctx.confidenceOverall * 10);
  }

  // Source count — more sources = more data fed into the model
  if (ctx.sourceCount > 0) {
    score += Math.min(10, ctx.sourceCount);
  }

  return score;
}

// ============================================================================
// Main engine
// ============================================================================

export class TwinStateEngine {
  /**
   * Compute the current Twin state from PersonalContext data.
   * Call with null/undefined context to get 'awakening' state.
   */
  computeState(context: PersonalContext | null | undefined): TwinStateResult {
    if (!context) {
      return this.buildResult('awakening', 2, 'เริ่มต้น Onboarding เพื่อให้ Twin ตื่น');
    }

    const score = scoreContext(context);

    // Thresholds tuned for a typical user journey
    // 0–4   → awakening
    // 5–12  → aware
    // 13–22 → connected
    // 23–34 → reflective
    // 35–50 → insightful
    // 51+   → aligned

    if (score >= 90) {
      const progress = Math.min(100, Math.round(95 + (score - 90) * 0.5));
      return this.buildResult('mastery', progress, 'คุณบรรลุ Mastery แล้ว — Twin สะท้อนตัวคุณได้อย่างสมบูรณ์');
    }
    if (score >= 70) {
      const progress = Math.round(85 + ((score - 70) / 20) * 10);
      return this.buildResult('flourishing', progress, 'ทำ Reflection ลึกขึ้นเพื่อก้าวสู่ Mastery');
    }
    if (score >= 51) {
      const progress = Math.min(100, Math.round(75 + ((score - 51) / 19) * 10));
      return this.buildResult('aligned', progress, 'Twin เข้าใจตัวคุณอย่างสมบูรณ์แล้ว — สำรวจต่อเพื่อก้าวสู่ Flourishing');
    }
    if (score >= 35) {
      const progress = Math.round(70 + ((score - 35) / 16) * 15);
      return this.buildResult('insightful', progress, 'บันทึก Reflection เพิ่มเติมเพื่อก้าวสู่ Aligned');
    }
    if (score >= 23) {
      const progress = Math.round(55 + ((score - 23) / 12) * 15);
      return this.buildResult('reflective', progress, 'ให้ Feedback บน Insight เพื่อก้าวสู่ Insightful');
    }
    if (score >= 13) {
      const progress = Math.round(38 + ((score - 13) / 10) * 17);
      return this.buildResult('connected', progress, 'บันทึก Memory และ Pattern เพื่อก้าวสู่ Reflective');
    }
    if (score >= 5) {
      const progress = Math.round(20 + ((score - 5) / 8) * 18);
      return this.buildResult('aware', progress, 'เพิ่ม Goals และ Values เพื่อก้าวสู่ Connected');
    }

    // awakening
    const progress = Math.min(19, Math.round(score * 4));
    return this.buildResult('awakening', progress, 'เริ่ม Onboarding ให้ครบเพื่อให้ Twin เรียนรู้ตัวคุณ');
  }

  private buildResult(
    state: TwinState,
    progress: number,
    nextMilestone: string
  ): TwinStateResult {
    return {
      state,
      progress,
      nextMilestone,
      ...STATE_DEFS[state],
    };
  }

  /**
   * Returns all 6 states in order for visualization purposes.
   */
  getAllStates(): TwinState[] {
    return ['awakening', 'aware', 'connected', 'reflective', 'insightful', 'aligned', 'flourishing', 'mastery'];
  }

  /**
   * Given a state, return what index it is (0-based).
   */
  stateIndex(state: TwinState): number {
    return this.getAllStates().indexOf(state);
  }
}

export default TwinStateEngine;

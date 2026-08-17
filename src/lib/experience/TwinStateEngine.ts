/**
 * TwinStateEngine.ts
 *
 * Master Direction §46 — Advanced Adaptive Environments
 * Sub-feature: Twin Visual State Management
 *
 * ระบบที่กำหนดสถานะภาพและท่าทางของ AI Twin ตามช่วงเวลาและอารมณ์
 *
 * Period-based posture:
 *   Morning   → 'awake' — Twin ตื่นตัว พร้อมเริ่มวัน
 *   Afternoon → 'focused' — Twin สมาธิ เต็มพลัง
 *   Evening   → 'reflective' — Twin ยอมรับ มองย้อน
 *   Night     → 'dreaming' — Twin ลึกสำนึก ผ่อนคลาย
 *
 * Mood-based expression:
 *   stressed → 'concerned' — หนักใจ
 *   confused → 'curious' — สงสัย
 *   confident → 'joyful' — ปิติ
 *   drained → 'tired' — เหน็ดเหนื่อย
 *   ready → 'energetic' — พลังเต็ม
 *   reflective → 'thoughtful' — คิดลึก
 *
 * Output: TwinStateConfig with CSS vars สำหรับ Twin avatar styling
 *
 * ไม่มี side effects — pure computation only.
 */

import type { TimePeriod } from './TimeOfDayEngine';
import type { Mood } from '@/context/EmotionContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TwinPosture = 'awake' | 'focused' | 'reflective' | 'dreaming';
export type TwinExpression = 'concerned' | 'curious' | 'joyful' | 'tired' | 'energetic' | 'thoughtful';

export interface TwinStateConfig {
  /** Twin body posture based on time of day */
  posture: TwinPosture;
  /** Twin facial expression based on mood */
  expression: TwinExpression;
  /** Twin opacity (some moods = less visible) */
  opacity: number;
  /** Glow intensity around Twin */
  glowIntensity: number;
  /** CSS var output สำหรับ inject ลงใน :root */
  cssVars: Record<string, string>;
}

// ─── Period → Posture Mapping ─────────────────────────────────────────────────

const POSTURE_BY_PERIOD: Record<TimePeriod, TwinPosture> = {
  morning: 'awake',
  afternoon: 'focused',
  evening: 'reflective',
  night: 'dreaming',
};

// ─── Mood → Expression Mapping ────────────────────────────────────────────────

const EXPRESSION_BY_MOOD: Record<Mood, TwinExpression> = {
  stressed: 'concerned',
  confused: 'curious',
  confident: 'joyful',
  drained: 'tired',
  ready: 'energetic',
  reflective: 'thoughtful',
};

// ─── Expression Characteristics ───────────────────────────────────────────────

interface ExpressionCharacteristics {
  opacity: number;       // 0-1: Twin visibility
  glowIntensity: number; // 0-1: Glow ring strength
  rotation: number;      // deg: slight body rotation
  scale: number;         // scale factor
}

const EXPRESSION_CHARACTERISTICS: Record<TwinExpression, ExpressionCharacteristics> = {
  concerned: { opacity: 0.85, glowIntensity: 0.6, rotation: -2, scale: 0.95 },
  curious: { opacity: 0.9, glowIntensity: 0.75, rotation: 3, scale: 1.0 },
  joyful: { opacity: 1.0, glowIntensity: 1.0, rotation: 1, scale: 1.05 },
  tired: { opacity: 0.75, glowIntensity: 0.5, rotation: 0, scale: 0.95 },
  energetic: { opacity: 1.0, glowIntensity: 0.95, rotation: 2, scale: 1.1 },
  thoughtful: { opacity: 0.9, glowIntensity: 0.8, rotation: -1, scale: 1.0 },
};

// ─── TwinStateEngine ──────────────────────────────────────────────────────────

export class TwinStateEngine {
  /**
   * Given a period and mood, compute Twin visual state
   *
   * @param period — Time period ('morning' | 'afternoon' | 'evening' | 'night')
   * @param mood — Current user mood
   * @returns TwinStateConfig with cssVars ready to inject
   */
  compute(period: TimePeriod, mood: Mood): TwinStateConfig {
    const posture = POSTURE_BY_PERIOD[period];
    const expression = EXPRESSION_BY_MOOD[mood];
    const expressionChar = EXPRESSION_CHARACTERISTICS[expression];

    const cssVars: Record<string, string> = {
      '--twin-posture': `"${posture}"`,
      '--twin-expression': `"${expression}"`,
      '--twin-opacity': String(expressionChar.opacity),
      '--twin-glow-intensity': String(expressionChar.glowIntensity),
      '--twin-rotation': `${expressionChar.rotation}deg`,
      '--twin-scale': String(expressionChar.scale),

      // Animation timing for Twin state transitions
      '--twin-transition-duration': '500ms',

      // Breathing effect — intensity based on glow
      '--twin-breathing-duration': `${2000 + expressionChar.glowIntensity * 1000}ms`,
      '--twin-breathing-intensity': `${0.05 + expressionChar.glowIntensity * 0.1}`,
    };

    return {
      posture,
      expression,
      opacity: expressionChar.opacity,
      glowIntensity: expressionChar.glowIntensity,
      cssVars,
    };
  }

  /**
   * Get Thai labels for Twin state (for UI display/debugging)
   */
  getLabels(posture: TwinPosture, expression: TwinExpression): { posture: string; expression: string } {
    const postureLabels: Record<TwinPosture, string> = {
      awake: 'ตื่นตัว',
      focused: 'สมาธิ',
      reflective: 'มองย้อน',
      dreaming: 'ในฝัน',
    };

    const expressionLabels: Record<TwinExpression, string> = {
      concerned: 'เป็นห่วง',
      curious: 'สงสัย',
      joyful: 'ปิติ',
      tired: 'เหน็ดเหนื่อย',
      energetic: 'พลังเต็ม',
      thoughtful: 'คิดลึก',
    };

    return {
      posture: postureLabels[posture],
      expression: expressionLabels[expression],
    };
  }
}

export default TwinStateEngine;

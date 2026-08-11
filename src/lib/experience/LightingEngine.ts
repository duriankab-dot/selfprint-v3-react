/**
 * LightingEngine.ts
 *
 * Master Direction §46 — Advanced Adaptive Environments
 * Sub-feature: Time-of-Day Lighting
 *
 * ระบบแสงที่ปรับตามช่วงเวลา:
 *   Morning (5:00-12:00)   → Warm light (3500K), high saturation
 *   Afternoon (12:00-17:00) → Neutral light (6500K), normal saturation
 *   Evening (17:00-21:00)   → Cool light (5000K), reduced saturation
 *   Night (21:00-5:00)      → Deep warm (2700K), very low saturation
 *
 * Output: LightingConfig with CSS vars สำหรับ EnvironmentEngine
 *
 * ไม่มี side effects — pure computation only.
 */

import type { TimePeriod } from './TimeOfDayEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LightingConfig {
  /** Color temperature ของแสง (Kelvin) */
  colorTemperature: number;
  /** Saturation level (0-100%) */
  saturation: number;
  /** Brightness level (0-100%) */
  brightness: number;
  /** CSS var output สำหรับ inject ลงใน :root */
  cssVars: Record<string, string>;
}

// ─── Lighting Characteristics per Period ──────────────────────────────────────

const LIGHTING_BY_PERIOD: Record<TimePeriod, Omit<LightingConfig, 'cssVars'>> = {
  morning: {
    colorTemperature: 3500,  // Warm (sunrise-like)
    saturation: 85,
    brightness: 90,
  },
  afternoon: {
    colorTemperature: 6500,  // Daylight (neutral)
    saturation: 100,
    brightness: 100,
  },
  evening: {
    colorTemperature: 5000,  // Cool (golden hour)
    saturation: 70,
    brightness: 85,
  },
  night: {
    colorTemperature: 2700,  // Deep warm (night mode)
    saturation: 40,
    brightness: 60,
  },
};

// ─── LightingEngine ───────────────────────────────────────────────────────────

export class LightingEngine {
  /**
   * Given a time period, compute lighting config
   *
   * @param period — 'morning' | 'afternoon' | 'evening' | 'night'
   * @returns LightingConfig with cssVars ready to inject
   */
  compute(period: TimePeriod): LightingConfig {
    const lighting = LIGHTING_BY_PERIOD[period];

    const cssVars: Record<string, string> = {
      '--lighting-color-temperature': `${lighting.colorTemperature}K`,
      '--lighting-saturation': `${lighting.saturation}%`,
      '--lighting-brightness': `${lighting.brightness}%`,

      // CSS filter shortcuts for use in components
      '--lighting-filter': this.buildLightingFilter(lighting.colorTemperature, lighting.saturation),

      // Transition timing — smoother on period boundary
      '--lighting-transition': '800ms',
    };

    return {
      ...lighting,
      cssVars,
    };
  }

  /**
   * Build CSS filter string from color temp and saturation
   *
   * Color temperature approximation:
   * - 2700K (warm) → slight red shift, reduced blue
   * - 6500K (neutral) → no filter
   * - Higher K → increased blue shift
   */
  private buildLightingFilter(kelvin: number, saturation: number): string {
    let filter = '';

    // Hue rotation based on color temperature
    if (kelvin < 4000) {
      // Warm (2700K-3500K) — add warm tone
      filter += 'hue-rotate(-5deg) ';
    } else if (kelvin > 6000) {
      // Cool (6500K+) — add cool tone
      filter += 'hue-rotate(5deg) ';
    }

    // Saturation adjustment
    filter += `saturate(${saturation / 100})`;

    return filter;
  }
}

export default LightingEngine;

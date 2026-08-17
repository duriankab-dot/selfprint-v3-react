/**
 * TimeOfDayEngine.ts
 *
 * Master Direction §46 — Advanced Adaptive Environments
 * Sub-feature: Time-of-Day Environments
 *
 * แบ่งวันออกเป็น 4 ช่วง:
 *   Morning   05:00–11:59  → สดชื่น, ผ่อนคลาย, พลังงานเพิ่มขึ้น
 *   Afternoon 12:00–16:59  → โฟกัส, เชิงรุก, พลังงานสูง
 *   Evening   17:00–20:59  → ผ่อนคลาย, สะท้อนตัวเอง, เริ่มผ่อน
 *   Night     21:00–04:59  → สงบ, ลึก, ช้า
 *
 * Output: TimeOfDayState ที่ ExperienceEngine / EnvironmentEngine ใช้เป็น input
 *
 * ไม่มี side effects — pure computation only.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * AudioCharacter แนะนำประเภทเสียงที่เหมาะสม (ส่งต่อไปยัง SoundscapeEngine)
 * ไม่ได้ generate audio จริง — เป็น label สำหรับ UX mapping เท่านั้น
 */
export type AudioCharacter =
  | 'ambient-warm'    // Morning — acoustic, soft, warm pads
  | 'energetic'       // Afternoon — upbeat, clear, motivating
  | 'calm'            // Evening — melodic, winding down
  | 'deep';           // Night — sparse, dark ambient, minimal

export interface TimeOfDayCharacteristics {
  period: TimePeriod;
  /** 0.0–2.0: multiplier บน animation / motion speed (1.0 = normal) */
  energyLevel: number;
  /** CSS vars ที่ inject ลงใน :root เป็น --tod-* variables */
  cssVars: Record<string, string>;
  /** ประเภทเสียงที่เหมาะกับช่วงเวลานี้ */
  audioCharacter: AudioCharacter;
  /** ชื่อภาษาไทยสำหรับแสดง UI */
  labelThai: string;
  /** Emoji สั้นสำหรับแสดงใน UI */
  emoji: string;
  /** คำอธิบายบรรยากาศสำหรับแสดง UI */
  descriptionThai: string;
}

export interface TimeOfDayState extends TimeOfDayCharacteristics {
  hour: number;
  minute: number;
  /** ช่วงถัดไป จะเปลี่ยนในอีกกี่นาที */
  minutesToNextPeriod: number;
}

// ─── Period Definitions ───────────────────────────────────────────────────────

const PERIOD_CHARACTERISTICS: Record<TimePeriod, Omit<TimeOfDayCharacteristics, 'period'>> = {
  morning: {
    energyLevel: 0.9,
    audioCharacter: 'ambient-warm',
    labelThai: 'ยามเช้า',
    emoji: '🌅',
    descriptionThai: 'สดชื่น ผ่อนคลาย เริ่มต้นวัน',
    cssVars: {
      '--tod-period':            'morning',
      '--tod-bg-tint':           'rgba(255, 200, 100, 0.04)',
      '--tod-glow-intensity':    '0.7',
      '--tod-particle-speed':    '0.9',
      '--tod-transition-speed':  '400ms',
      '--tod-energy':            '0.9',
      '--tod-label':             '"ยามเช้า"',
    },
  },
  afternoon: {
    energyLevel: 1.2,
    audioCharacter: 'energetic',
    labelThai: 'กลางวัน',
    emoji: '☀️',
    descriptionThai: 'โฟกัส เชิงรุก พลังเต็ม',
    cssVars: {
      '--tod-period':            'afternoon',
      '--tod-bg-tint':           'rgba(255, 245, 200, 0.03)',
      '--tod-glow-intensity':    '1.0',
      '--tod-particle-speed':    '1.2',
      '--tod-transition-speed':  '300ms',
      '--tod-energy':            '1.2',
      '--tod-label':             '"กลางวัน"',
    },
  },
  evening: {
    energyLevel: 0.75,
    audioCharacter: 'calm',
    labelThai: 'ยามเย็น',
    emoji: '🌇',
    descriptionThai: 'ผ่อนคลาย สะท้อนวัน เริ่มพักผ่อน',
    cssVars: {
      '--tod-period':            'evening',
      '--tod-bg-tint':           'rgba(200, 100, 50, 0.05)',
      '--tod-glow-intensity':    '0.8',
      '--tod-particle-speed':    '0.75',
      '--tod-transition-speed':  '500ms',
      '--tod-energy':            '0.75',
      '--tod-label':             '"ยามเย็น"',
    },
  },
  night: {
    energyLevel: 0.55,
    audioCharacter: 'deep',
    labelThai: 'ยามค่ำคืน',
    emoji: '🌙',
    descriptionThai: 'สงบ ลึก ใคร่ครวญ',
    cssVars: {
      '--tod-period':            'night',
      '--tod-bg-tint':           'rgba(50, 30, 120, 0.06)',
      '--tod-glow-intensity':    '0.55',
      '--tod-particle-speed':    '0.55',
      '--tod-transition-speed':  '700ms',
      '--tod-energy':            '0.55',
      '--tod-label':             '"ยามค่ำคืน"',
    },
  },
};

// ─── TimeOfDayEngine ──────────────────────────────────────────────────────────

export class TimeOfDayEngine {

  /**
   * ระบุ TimePeriod จาก hour (0–23)
   *   Morning   05–11
   *   Afternoon 12–16
   *   Evening   17–20
   *   Night     21–04 (wrap-around)
   */
  getPeriod(hour: number): TimePeriod {
    if (hour >= 5 && hour < 12)  return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night'; // 21–23, 0–4
  }

  /**
   * คำนวณว่าอีกกี่นาทีจะเข้าช่วงถัดไป
   */
  minutesToNextPeriod(hour: number, minute: number): number {
    const period = this.getPeriod(hour);
    let nextBoundaryHour: number;

    switch (period) {
      case 'morning':   nextBoundaryHour = 12; break;
      case 'afternoon': nextBoundaryHour = 17; break;
      case 'evening':   nextBoundaryHour = 21; break;
      case 'night':
        // ถ้าอยู่ช่วง 21-23 boundary อยู่ที่ 05:00 วันถัดไป
        // ถ้าอยู่ช่วง 00-04 boundary อยู่ที่ 05:00 วันนี้
        nextBoundaryHour = 5;
        break;
    }

    let minutesRemaining: number;
    if (period === 'night' && hour >= 21) {
      // วันถัดไป 05:00
      minutesRemaining = (24 - hour + nextBoundaryHour) * 60 - minute;
    } else {
      minutesRemaining = (nextBoundaryHour - hour) * 60 - minute;
    }

    return Math.max(0, minutesRemaining);
  }

  /**
   * Main compute — returns full TimeOfDayState from a Date (default = now)
   */
  compute(now: Date = new Date()): TimeOfDayState {
    const hour   = now.getHours();
    const minute = now.getMinutes();
    const period = this.getPeriod(hour);
    const chars  = PERIOD_CHARACTERISTICS[period];

    return {
      period,
      hour,
      minute,
      minutesToNextPeriod: this.minutesToNextPeriod(hour, minute),
      ...chars,
    };
  }

  /**
   * Helper: inject all --tod-* vars to document root
   * (Used by EnvironmentContext)
   */
  applyToDocument(state: TimeOfDayState): void {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(state.cssVars)) {
      root.style.setProperty(key, value);
    }
    // Also set data-tod attribute for CSS selectors
    root.setAttribute('data-tod', state.period);
  }
}

export default TimeOfDayEngine;

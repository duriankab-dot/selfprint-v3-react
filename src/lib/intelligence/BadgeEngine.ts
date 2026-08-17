/**
 * BadgeEngine.ts
 *
 * Master Direction §29-30 — Badge System
 *
 * Badges must have MEANING — not just icons.
 * Each badge unlocks a real experience feature.
 *
 * Rule:
 *  - Badge state stored in Supabase user_metadata
 *  - unlock() must be idempotent
 *  - never fabricate earned badges
 */

import { supabase } from '@/lib/supabase/client';

// ============================================================================
// Badge definitions
// ============================================================================

export type BadgeId =
  | 'first_reflection'
  | 'pattern_finder'
  | 'journey_explorer'
  | 'self_mirror'
  | 'deep_thinker'
  | 'decision_maker'
  | 'twin_awakening'
  | 'selfprint_complete';

export interface BadgeDefinition {
  id: BadgeId;
  name: string;
  nameTh: string;
  description: string;
  descriptionTh: string;
  icon: string;
  unlock: string;     // What feature/experience this unlocks
  unlockTh: string;
  requirementTh: string; // Human-readable earn condition
}

export const BADGE_DEFINITIONS: Record<BadgeId, BadgeDefinition> = {
  first_reflection: {
    id: 'first_reflection',
    name: 'First Reflection',
    nameTh: 'การสะท้อนครั้งแรก',
    description: 'You shared your first reflection with Twin.',
    descriptionTh: 'คุณสะท้อนตัวเองกับ Twin เป็นครั้งแรก',
    icon: '🌱',
    unlock: 'Twin Memory — Twin starts remembering key moments',
    unlockTh: 'Twin Memory — Twin เริ่มจำสิ่งสำคัญสำหรับคุณ',
    requirementTh: 'ส่งข้อความถึง Twin ครั้งแรก',
  },
  pattern_finder: {
    id: 'pattern_finder',
    name: 'Pattern Finder',
    nameTh: 'นักค้นหารูปแบบ',
    description: 'Twin detected your first repeating behavioral pattern.',
    descriptionTh: 'Twin ตรวจจับรูปแบบพฤติกรรมซ้ำครั้งแรกของคุณ',
    icon: '🔍',
    unlock: 'Pattern Visualization — see your patterns as a timeline',
    unlockTh: 'Pattern Visualization — เห็นรูปแบบของคุณบน Timeline',
    requirementTh: 'Twin ตรวจพบ Pattern แรกของคุณ',
  },
  journey_explorer: {
    id: 'journey_explorer',
    name: 'Journey Explorer',
    nameTh: 'นักสำรวจ Journey',
    description: 'You have reflected across 3 or more life areas (Hubs).',
    descriptionTh: 'คุณสะท้อนตัวเองในด้านชีวิตอย่างน้อย 3 ด้าน',
    icon: '🧭',
    unlock: 'Journey Map — see how your life areas connect',
    unlockTh: 'Journey Map — เห็นว่าด้านชีวิตของคุณเชื่อมกันอย่างไร',
    requirementTh: 'ใช้งาน Hub อย่างน้อย 3 ด้านชีวิต',
  },
  self_mirror: {
    id: 'self_mirror',
    name: 'Self Mirror',
    nameTh: 'กระจกส่องตัวเอง',
    description: 'You gave feedback on 5 or more Twin insights.',
    descriptionTh: 'คุณให้ Feedback กับ Twin อย่างน้อย 5 ครั้ง',
    icon: '🪞',
    unlock: 'Insight Calibration — Twin refines understanding based on your feedback',
    unlockTh: 'Insight Calibration — Twin ปรับความเข้าใจตาม Feedback คุณ',
    requirementTh: 'ให้ Feedback insight ครบ 5 ครั้ง',
  },
  deep_thinker: {
    id: 'deep_thinker',
    name: 'Deep Thinker',
    nameTh: 'นักคิดเชิงลึก',
    description: 'You completed the Full Personal Analysis.',
    descriptionTh: 'คุณอ่าน Full Personal Analysis ครบทั้งหมด',
    icon: '🧠',
    unlock: 'Blind Spot Reveal — Twin surfaces deeper observations it usually withholds',
    unlockTh: 'Blind Spot — Twin เปิดเผย Blind Spots ที่ปกติไม่แสดง',
    requirementTh: 'อ่าน Full Personal Analysis ครบทุกส่วน',
  },
  decision_maker: {
    id: 'decision_maker',
    name: 'Decision Maker',
    nameTh: 'นักตัดสินใจ',
    description: 'You logged 10 or more decisions with Twin.',
    descriptionTh: 'คุณบันทึกการตัดสินใจกับ Twin ครบ 10 ครั้ง',
    icon: '⚖️',
    unlock: 'Decision Pattern Intelligence — Twin detects your decision biases',
    unlockTh: 'Decision Pattern — Twin ตรวจจับรูปแบบการตัดสินใจของคุณ',
    requirementTh: 'บันทึก Decision Log ครบ 10 รายการ',
  },
  twin_awakening: {
    id: 'twin_awakening',
    name: 'Twin Awakening',
    nameTh: 'Twin ตื่นขึ้น',
    description: 'Your Twin reached the AWARE state.',
    descriptionTh: 'Twin ของคุณเลื่อนขึ้นสู่ระดับ AWARE',
    icon: '⚡',
    unlock: 'Twin State Visualization — see your Twin state evolve over time',
    unlockTh: 'Twin State Visualization — เห็น Twin State เติบโตตามเวลา',
    requirementTh: 'Twin เลื่อนขึ้น AWARE state',
  },
  selfprint_complete: {
    id: 'selfprint_complete',
    name: 'Selfprint Complete',
    nameTh: 'Selfprint สมบูรณ์',
    description: 'Your Twin reached the ALIGNED state.',
    descriptionTh: 'Twin ของคุณเลื่อนขึ้นสู่ระดับ ALIGNED',
    icon: '🌟',
    unlock: 'Twin Evolution Scene — a special cinematic moment celebrating your growth',
    unlockTh: 'Twin Evolution Scene — ฉากพิเศษฉลองการเติบโตของคุณ',
    requirementTh: 'Twin เลื่อนขึ้น ALIGNED state',
  },
};

// ============================================================================
// Engine
// ============================================================================

export interface EarnedBadge {
  id: BadgeId;
  earnedAt: string; // ISO date
}

export interface BadgeState {
  earned: EarnedBadge[];
  available: BadgeDefinition[];
  nextToEarn: BadgeDefinition | null;
}

export class BadgeEngine {
  /** Read badges from Supabase user_metadata */
  async getBadgeState(_userId: string): Promise<BadgeState> {
    const { data } = await supabase.auth.getUser();
    const meta = data?.user?.user_metadata ?? {};
    const earned: EarnedBadge[] = meta.earned_badges ?? [];

    const earnedIds = new Set(earned.map((b) => b.id));
    const ALL_IDS = Object.keys(BADGE_DEFINITIONS) as BadgeId[];
    const available = ALL_IDS
      .filter((id) => !earnedIds.has(id))
      .map((id) => BADGE_DEFINITIONS[id]);

    const nextToEarn = available[0] ?? null;
    return { earned, available, nextToEarn };
  }

  /** Unlock a badge — idempotent */
  async unlock(badgeId: BadgeId): Promise<void> {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;

    const meta = data.user.user_metadata ?? {};
    const earned: EarnedBadge[] = meta.earned_badges ?? [];

    // Idempotent: skip if already earned
    if (earned.some((b) => b.id === badgeId)) return;

    earned.push({ id: badgeId, earnedAt: new Date().toISOString() });
    await supabase.auth.updateUser({ data: { earned_badges: earned } });
  }

  /** Auto-unlock badges based on current signals */
  async autoUnlock(signals: {
    hasReflected?: boolean;
    patternCount?: number;
    hubsUsed?: number;
    feedbackCount?: number;
    hasReadFullAnalysis?: boolean;
    decisionCount?: number;
    twinState?: string;
  }): Promise<BadgeId[]> {
    const unlocked: BadgeId[] = [];

    const checks: Array<[BadgeId, boolean]> = [
      ['first_reflection', !!signals.hasReflected],
      ['pattern_finder', (signals.patternCount ?? 0) >= 1],
      ['journey_explorer', (signals.hubsUsed ?? 0) >= 3],
      ['self_mirror', (signals.feedbackCount ?? 0) >= 5],
      ['deep_thinker', !!signals.hasReadFullAnalysis],
      ['decision_maker', (signals.decisionCount ?? 0) >= 10],
      ['twin_awakening', ['aware', 'connected', 'reflective', 'insightful', 'aligned'].includes(signals.twinState ?? '')],
      ['selfprint_complete', signals.twinState === 'aligned'],
    ];

    for (const [id, condition] of checks) {
      if (condition) {
        await this.unlock(id);
        unlocked.push(id);
      }
    }

    return unlocked;
  }
}

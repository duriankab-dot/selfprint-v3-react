/**
 * SICE #10: FutureSelfEngine
 * Wrapper for existing FutureSelfEngine from lib/intelligence
 * Helps user envision and work toward future goals
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput, FutureSelfResult } from '../../../types/sice';

export class FutureSelfEngine extends SICEBase {
  constructor() {
    super(
      10,
      'FutureSelfEngine',
      'วิเคราะห์วิถีโคจรของอนาคตและวิสัยทัศน์ระยะยาว'
    );
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return this.getDefaultFuture();
      }

      try {
        const userId = input.userId;
        const future = await this.analyzeFutureTrajectory(userId);
        return future;
      } catch (err) {
        this.log('Future analysis failed', err);
        return this.getDefaultFuture();
      }
    });

    // Confidence is now calculated in analyzeFutureTrajectory based on actual data
    const confidence = ((result as FutureSelfResult & { confidence?: number }).confidence) || 60;
    return this.createResult(result, confidence, executionTime);
  }

  /**
   * Analyze user's future trajectory based on goals and Twin evolution
   */
  private async analyzeFutureTrajectory(userId: string): Promise<any> {
    try {
      if (!supabase) {
        return this.getDefaultFuture();
      }

      // Fetch user's actual goals
      const userGoals = await this.analyzeUserGoals(userId);

      // Fetch Twin and analyze evolution
      // TWINS406-001 FIX: .maybeSingle() — no Twin yet is a normal state.
      const { data: twin } = await supabase
        .from('twins')
        .select('id, created_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (!twin) {
        return this.getDefaultFuture();
      }

      const twinEvolution = await this.analyzeTwinEvolution(twin.id);

      // Identify focus worlds from goals
      const focusWorlds = userGoals.worlds.length > 0
        ? userGoals.worlds
        : twinEvolution.dominantWorlds;

      // Generate personalized vision from actual goals
      const visionStatement = userGoals.goals.length > 0
        ? this.generatePersonalizedVision(userGoals.goals, twinEvolution)
        : this.generateVision(focusWorlds);

      // Create SMART milestones from goals
      const milestones = userGoals.goals.length > 0
        ? this.generateSmartMilestones(userGoals.goals, twinEvolution)
        : this.generateMilestones(focusWorlds);

      // Identify opportunities
      const opportunities = this.identifyOpportunities(focusWorlds);

      // Calculate confidence from goal clarity + Twin data
      const confidence = Math.min(
        90,
        50 + (userGoals.goals.length * 10) + (twinEvolution.decisionCount * 1)
      );

      return {
        visionStatement,
        focusAreas: focusWorlds,
        goals: userGoals.goals,
        milestones,
        opportunities,
        evolution: twinEvolution,
        timeframe: '12 months',
        confidence: Math.max(40, confidence),
      };
    } catch (err) {
      console.error('Future trajectory error:', err);
      return this.getDefaultFuture();
    }
  }

  /**
   * Analyze user's stated goals from user_profiles
   */
  private async analyzeUserGoals(userId: string): Promise<any> {
    try {
      // USERPROFILES-PK-001 FIX: user_profiles has no 'user_id' column —
      // primary key is 'id' itself (see database-init.ts). maybeSingle()
      // since a user without a profile row yet is normal.
      const { data: profile } = await supabase
        .schema('selfprint').from('users_profiles')
        .select('goals_json, focus_areas')
        .eq('id', userId)
        .maybeSingle();

      if (!profile) {
        return { goals: [], worlds: [] };
      }

      let goals = [];
      let worlds: string[] = [];

      // Parse goals JSON if present
      if (profile.goals_json) {
        try {
          goals = typeof profile.goals_json === 'string'
            ? JSON.parse(profile.goals_json)
            : profile.goals_json;
          if (!Array.isArray(goals)) goals = [];
        } catch {
          goals = [];
        }
      }

      // Extract worlds from focus areas or goals
      if (profile.focus_areas) {
        worlds = Array.isArray(profile.focus_areas)
          ? profile.focus_areas
          : [profile.focus_areas];
      }

      if (worlds.length === 0 && goals.length > 0) {
        worlds = goals
          .map((g: any) => g.world || g.area)
          .filter(Boolean);
      }

      return { goals, worlds: [...new Set(worlds)] };
    } catch (err) {
      this.log('Error analyzing user goals', err);
      return { goals: [], worlds: [] };
    }
  }

  /**
   * Analyze Twin's evolution trajectory
   */
  private async analyzeTwinEvolution(twinId: string): Promise<any> {
    try {
      // Get Twin's recent decisions
      const { data: decisions } = await supabase
        .from('decisions')
        .select('id, world, created_at')
        .eq('twin_id', twinId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (!decisions) {
        return { decisionCount: 0, dominantWorlds: [], trajectory: 'early' };
      }

      // Analyze decision patterns
      const worldCounts: Record<string, number> = {};
      decisions.forEach((d: any) => {
        const world = d.world || 'general';
        worldCounts[world] = (worldCounts[world] || 0) + 1;
      });

      const dominantWorlds = Object.entries(worldCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([world]) => world)
        .slice(0, 3);

      // Determine trajectory based on decision frequency
      const trajectory = decisions.length > 20 ? 'mature' : decisions.length > 5 ? 'developing' : 'early';

      return {
        decisionCount: decisions.length,
        dominantWorlds,
        trajectory,
        recentWorlds: worldCounts,
      };
    } catch (err) {
      this.log('Error analyzing Twin evolution', err);
      return { decisionCount: 0, dominantWorlds: [], trajectory: 'early' };
    }
  }

  /**
   * Generate personalized vision from actual goals and Twin evolution
   */
  private generatePersonalizedVision(goals: any[], evolution: any): string {
    if (goals.length === 0) {
      return 'ค้นพบและไปตามแรงบันดาลใจของตัวเอง';
    }

    const goalTitles = goals
      .map((g: any) => g.title || g.goal)
      .filter(Boolean)
      .slice(0, 2);

    // Incorporate evolution stage into vision
    const trajectorySuffix = evolution.trajectory === 'mature'
      ? ' ด้วยการเชี่ยวชาญที่ลึกขึ้น'
      : evolution.trajectory === 'developing'
        ? ' ด้วยการเติบโตที่ตั้งใจ'
        : '';

    if (goalTitles.length === 1) {
      return `เชี่ยวชาญ ${goalTitles[0]}${trajectorySuffix} พร้อมรักษาความสมดุลในด้านอื่น ๆ ของชีวิต`;
    }

    if (goalTitles.length >= 2) {
      return `ปรับให้สอดคล้องกับความก้าวหน้าไปยัง ${goalTitles.join(' และ ')}${trajectorySuffix} พร้อมการเติบโตอย่างยั่งยืน`;
    }

    return 'พัฒนาตัวเองไปสู่อนาคตที่มีจุดประสงค์และเป้าหมายชัดเจน';
  }

  /**
   * Generate SMART milestones tied to actual goals
   */
  private generateSmartMilestones(goals: any[], evolution: any): string[] {
    const milestones: string[] = [];

    goals.forEach((goal: any) => {
      const title = goal.title || goal.goal;
      const deadline = goal.deadline || '6 months';

      if (title) {
        // Create SMART milestone
        if (goal.metric) {
          milestones.push(`บรรลุ ${goal.metric} ต่อ "${title}" ภายใน ${deadline}`);
        } else {
          milestones.push(`บรรลุความก้าวหน้าที่มีความหมายใน "${title}" ภายใน ${deadline}`);
        }
      }
    });

    // Add evolution-based milestone
    if (evolution.trajectory === 'early') {
      milestones.push('สร้างนิสัยการตัดสินใจและสะท้อนตัวเองอย่างสม่ำเสมอ');
    } else if (evolution.trajectory === 'developing') {
      milestones.push('เข้าใจรูปแบบและความชอบส่วนตัวของตัวเองลึกขึ้น');
    } else {
      milestones.push('สังเคราะห์ความรู้เป็นกลยุทธ์ชีวิตที่เชื่อมโยงกัน');
    }

    return milestones.slice(0, 4);
  }

  /**
   * Generate vision statement based on focus
   */
  private generateVision(worlds: string[]): string {
    if (worlds.length === 0) {
      return 'สำรวจและค้นพบเส้นทางแท้จริงของคุณ';
    }

    if (worlds.length === 1) {
      return `เชี่ยวชาญให้ลึกขึ้นในด้าน ${worlds[0]} ของชีวิตของคุณ`;
    }

    if (worlds.length >= 3) {
      return `รวมสติปัญญาข้ามด้าน ${worlds.length} ของชีวิตเข้าเป็นเนื้อหนึ่ง`;
    }

    return `สมดุลและเติบโตข้ามมิติ ${worlds.join(' และ ')}`;
  }

  /**
   * Generate meaningful milestones
   */
  private generateMilestones(worlds: string[]): string[] {
    const milestones: string[] = [];

    if (worlds.includes('career')) {
      milestones.push('มีความชัดเจนเกี่ยวกับทิศทางอาชีพ');
    }

    if (worlds.includes('relationship')) {
      milestones.push('เชื่อมต่อที่มีความหมายให้ลึกขึ้น');
    }

    if (worlds.includes('health')) {
      milestones.push('สร้างการปฏิบัติในการดูแลสุขภาพที่ยั่งยืน');
    }

    if (worlds.includes('money')) {
      milestones.push('สร้างความมั่นใจและความเสถียรทางการเงิน');
    }

    if (worlds.length === 0) {
      milestones.push('บรรลุการค้นพบตัวเองในขั้นเริ่มต้น');
    }

    return milestones.slice(0, 3);
  }

  /**
   * Identify growth opportunities
   */
  private identifyOpportunities(worlds: string[]): string[] {
    const allWorlds = [
      'identity',
      'decision',
      'relationship',
      'career',
      'health',
      'money',
      'ai-twin',
      'learning',
      'creativity',
      'spirituality',
      'impact',
      'activities',
    ];

    const unexplored = allWorlds.filter((w) => !worlds.includes(w));
    return unexplored.slice(0, 3).map((w) => `สำรวจ ${w}`);
  }

  /**
   * Default future for errors
   */
  private getDefaultFuture(): any {
    return {
      visionStatement: 'เข้าสู่เวอร์ชันที่ดีที่สุดของคุณพร้อมคำแนะนำจากทวิน',
      focusAreas: [],
      milestones: ['ค้นพบเส้นทางแท้จริงของคุณ', 'สร้างนิสัยการเติบโตอย่างสม่ำเสมอ'],
      opportunities: ['การค้นพบตัวเอง', 'พัฒนาทักษะ', 'สร้างความสัมพันธ์'],
      timeframe: '12 เดือน',
      confidence: 40,
    };
  }
}

/**
 * SICE #5: TwinStateEngine
 * Computes Twin state based on personal context and world (P0 #7.3 - World-aware)
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput } from '../../../types/sice';

export interface TwinState {
  description?: string; // Thai-readable summary for display
  stage: number; // 1-5
  maturityScore: number; // 0-100
  worldSpecialization?: string; // How Twin specializes per world
  mood: string;
  responseStyle: string; // How Twin communicates
  nextMilestone: string;
  energy?: number; // Energy level 0-100
}

export class TwinStateEngine extends SICEBase {
  private readonly STAGE_THRESHOLDS = [0, 20, 40, 60, 80, 100];
  private readonly STAGE_LABELS = [
    'Awakening',
    'Learning',
    'Developing',
    'Mature',
    'Enlightened',
  ];

  constructor() {
    super(5, 'TwinStateEngine', 'Computes Twin state and progression');
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return {
          stage: 1,
          maturityScore: 0,
          mood: 'attentive',
          responseStyle: 'guiding',
          nextMilestone: 'First interaction',
          energy: 50,
        };
      }

      try {
        const userId = input.userId;
        const world = input.currentWorld || null;
        const personalContext = (input as any).personalContext;

        // Calculate maturity score from multiple signals
        const maturityScore = await this.calculateMaturityScore(userId, world);

        // Determine stage based on maturity
        const stage = this.determineStage(maturityScore);

        // Get world specialization
        const worldSpecialization = world
          ? `Specialized in ${world} world exploration`
          : 'Exploring all worlds';

        // Determine mood from personal context
        const mood = personalContext?.emotionalState || 'balanced';

        // Get next milestone
        const nextMilestone = this.getNextMilestone(stage, maturityScore);

        const STAGE_LABELS_TH = ['กำลังตื่น', 'กำลังเรียนรู้', 'กำลังพัฒนา', 'เติบโตแล้ว', 'รู้แจ้ง'];
        const MILESTONE_TH = [
          'การพูดคุยครั้งแรก',
          'เขียนบันทึกแรกของคุณ',
          'ตัดสินใจครั้งแรก',
          'รับข้อมูลเชิงลึก 10 ครั้ง',
          'เชี่ยวชาญโลกหนึ่งโลก',
          'บรรลุการรู้แจ้ง',
        ];
        const stageTh = STAGE_LABELS_TH[Math.min(stage - 1, STAGE_LABELS_TH.length - 1)] || 'กำลังตื่น';
        const milestoneTh = MILESTONE_TH[Math.min(stage, MILESTONE_TH.length - 1)] || 'เติบโตต่อไป';

        const twinState: TwinState = {
          description: worldSpecialization
            ? `Twin ของคุณ${stageTh} — ${worldSpecialization} • ขั้นถัดไป: ${milestoneTh}`
            : `Twin ของคุณ${stageTh} • ขั้นถัดไป: ${milestoneTh}`,
          stage,
          maturityScore,
          worldSpecialization,
          mood,
          responseStyle: stage > 2 ? 'conversational' : 'guiding',
          nextMilestone,
          energy: Math.min(100, maturityScore + 20),
        };

        return twinState;
      } catch (err) {
        console.error('Twin state calculation error:', err);
        return {
          stage: 1,
          maturityScore: 0,
          mood: 'attentive',
          responseStyle: 'guiding',
          nextMilestone: 'First interaction',
          energy: 50,
        };
      }
    });

    return this.createResult(result, 70, executionTime);
  }

  private async calculateMaturityScore(userId: string, world: string | null): Promise<number> {
    try {
      // Fetch user activity data
      const { data: stats } = await supabase
        .from('world_stats')
        .select('*')
        .eq('user_id', userId);

      if (!stats || stats.length === 0) {
        return 0;
      }

      let relevantStats = stats;
      if (world) {
        relevantStats = stats.filter((s: any) => s.world_id === world);
      }

      if (relevantStats.length === 0) {
        return 0;
      }

      // Calculate maturity from:
      // - Total visits (0-20 points)
      const totalVisits = relevantStats.reduce((sum: number, s: any) => sum + (s.visits_count || 0), 0);
      const visitScore = Math.min(20, Math.floor(totalVisits / 5));

      // - Journal entries (0-20 points)
      const totalJournal = relevantStats.reduce((sum: number, s: any) => sum + (s.journal_entries || 0), 0);
      const journalScore = Math.min(20, totalJournal * 4);

      // - Decisions made (0-20 points)
      const totalDecisions = relevantStats.reduce((sum: number, s: any) => sum + (s.decisions_made || 0), 0);
      const decisionScore = Math.min(20, totalDecisions * 3);

      // - Insights gained (0-20 points)
      const totalInsights = relevantStats.reduce((sum: number, s: any) => sum + (s.insights_gained || 0), 0);
      const insightScore = Math.min(20, totalInsights * 3);

      // - Time spent (0-20 points)
      const totalTime = relevantStats.reduce((sum: number, s: any) => sum + (s.time_spent_minutes || 0), 0);
      const timeScore = Math.min(20, Math.floor(totalTime / 30));

      const maturityScore = visitScore + journalScore + decisionScore + insightScore + timeScore;
      return Math.min(100, maturityScore);
    } catch (err) {
      console.error('Maturity score calculation error:', err);
      return 0;
    }
  }

  private determineStage(maturityScore: number): number {
    for (let i = this.STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (maturityScore >= this.STAGE_THRESHOLDS[i]) {
        return i;
      }
    }
    return 1;
  }

  private getNextMilestone(stage: number, maturityScore: number): string {
    const milestones = [
      'First interaction',
      'Write your first journal entry',
      'Make your first decision',
      'Gain 10 insights',
      'Achieve world mastery in any world',
      'Become enlightened',
    ];

    if (stage >= this.STAGE_LABELS.length) {
      return 'Enlightenment achieved ✨';
    }

    const nextThreshold = this.STAGE_THRESHOLDS[stage + 1];
    const progress = Math.round(((maturityScore - this.STAGE_THRESHOLDS[stage]) / (nextThreshold - this.STAGE_THRESHOLDS[stage])) * 100);

    return `${milestones[stage + 1]} (${progress}%)`;
  }
}

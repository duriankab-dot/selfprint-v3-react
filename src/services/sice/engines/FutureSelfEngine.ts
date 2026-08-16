/**
 * SICE #10: FutureSelfEngine
 * Wrapper for existing FutureSelfEngine from lib/intelligence
 * Helps user envision and work toward future goals
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput } from '../../../types/sice';

export class FutureSelfEngine extends SICEBase {
  constructor() {
    super(
      10,
      'FutureSelfEngine',
      'Analyzes future trajectory and long-term vision'
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

    return this.createResult(result, 60, executionTime);
  }

  /**
   * Analyze user's future trajectory based on current patterns
   */
  private async analyzeFutureTrajectory(userId: string): Promise<any> {
    try {
      if (!supabase) {
        return this.getDefaultFuture();
      }

      // Get user's stated goals and decisions
      const { data: decisions } = await supabase
        .from('decisions')
        .select('title, description, world_id')
        .eq('user_id', userId)
        .limit(20);

      // Analyze patterns
      const worlds = decisions?.map((d: any) => d.world_id) || [];
      const focusWorlds = [...new Set(worlds)];

      // Generate future vision
      const visionStatement = this.generateVision(focusWorlds);
      const milestones = this.generateMilestones(focusWorlds);
      const opportunities = this.identifyOpportunities(focusWorlds);

      return {
        visionStatement,
        focusAreas: focusWorlds,
        milestones,
        opportunities,
        timeframe: '12 months',
        confidence: Math.min(80, 40 + (decisions?.length || 0) * 2),
      };
    } catch (err) {
      console.error('Future trajectory error:', err);
      return this.getDefaultFuture();
    }
  }

  /**
   * Generate vision statement based on focus
   */
  private generateVision(worlds: string[]): string {
    if (worlds.length === 0) {
      return 'Explore and discover your authentic path forward';
    }

    if (worlds.length === 1) {
      return `Deepen mastery in the ${worlds[0]} domain of your life`;
    }

    if (worlds.length >= 3) {
      return `Integrate wisdom across ${worlds.length} life domains into a coherent whole`;
    }

    return `Balance and grow across ${worlds.join(' and ')} dimensions`;
  }

  /**
   * Generate meaningful milestones
   */
  private generateMilestones(worlds: string[]): string[] {
    const milestones: string[] = [];

    if (worlds.includes('career')) {
      milestones.push('Achieve clarity on career direction');
    }

    if (worlds.includes('relationship')) {
      milestones.push('Deepen meaningful connections');
    }

    if (worlds.includes('health')) {
      milestones.push('Establish sustainable wellness practices');
    }

    if (worlds.includes('money')) {
      milestones.push('Build financial confidence and stability');
    }

    if (worlds.length === 0) {
      milestones.push('Complete initial self-discovery');
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
    return unexplored.slice(0, 3).map((w) => `Explore ${w}`);
  }

  /**
   * Default future for errors
   */
  private getDefaultFuture(): any {
    return {
      visionStatement: 'Step into your best self with Twin guidance',
      focusAreas: [],
      milestones: ['Discover your authentic path', 'Build consistent growth habits'],
      opportunities: ['Self-discovery', 'Skill development', 'Relationship building'],
      timeframe: '12 months',
      confidence: 40,
    };
  }
}

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

    // Confidence is now calculated in analyzeFutureTrajectory based on actual data
    const confidence = (result as any).confidence || 60;
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
      const { data: twin } = await supabase
        .from('twins')
        .select('id, created_at')
        .eq('user_id', userId)
        .single();

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
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('goals_json, focus_areas')
        .eq('user_id', userId)
        .single();

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
      return 'Discover and pursue your authentic aspirations';
    }

    const goalTitles = goals
      .map((g: any) => g.title || g.goal)
      .filter(Boolean)
      .slice(0, 2);

    // Incorporate evolution stage into vision
    const trajectorySuffix = evolution.trajectory === 'mature'
      ? ' with deepening mastery'
      : evolution.trajectory === 'developing'
        ? ' with intentional growth'
        : '';

    if (goalTitles.length === 1) {
      return `Master ${goalTitles[0]}${trajectorySuffix} while maintaining balance in other life areas`;
    }

    if (goalTitles.length >= 2) {
      return `Harmonize progress toward ${goalTitles.join(' and ')}${trajectorySuffix} with sustained growth`;
    }

    return 'Evolve toward a more intentional and purposeful future';
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
          milestones.push(`Achieve ${goal.metric} toward "${title}" by ${deadline}`);
        } else {
          milestones.push(`Complete meaningful progress on "${title}" by ${deadline}`);
        }
      }
    });

    // Add evolution-based milestone
    if (evolution.trajectory === 'early') {
      milestones.push('Establish consistent decision-making and reflection habits');
    } else if (evolution.trajectory === 'developing') {
      milestones.push('Deepen understanding of personal patterns and preferences');
    } else {
      milestones.push('Synthesize learning into coherent life strategy');
    }

    return milestones.slice(0, 4);
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

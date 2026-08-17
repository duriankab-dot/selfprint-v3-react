/**
 * SICE #6: ExperienceEngine
 * Tracks cumulative user experiences and learnings
 * Analyzes growth patterns across all worlds
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput } from '../../../types/sice';

export interface ExperienceProfile {
  totalInteractions: number;
  worldsExplored: string[];
  keyLearnings: string[];
  growthAreas: string[];
  masteredAreas: string[];
  longestStreak: number; // days of continuous interaction
  currentStreak: number;
}

export class ExperienceEngine extends SICEBase {
  constructor() {
    super(
      6,
      'ExperienceEngine',
      'Tracks cumulative experiences and identifies growth patterns'
    );
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return {
          totalInteractions: 0,
          worldsExplored: [],
          keyLearnings: [],
          growthAreas: [],
          masteredAreas: [],
          longestStreak: 0,
          currentStreak: 0,
        };
      }

      try {
        const userId = input.userId;

        // Build experience profile from user data
        const profile = await this.buildExperienceProfile(userId);

        return profile;
      } catch (err) {
        console.error('Experience engine error:', err);
        return {
          totalInteractions: 0,
          worldsExplored: [],
          keyLearnings: [],
          growthAreas: [],
          masteredAreas: [],
          longestStreak: 0,
          currentStreak: 0,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    // Confidence based on data richness
    const dataRichness = (result as any).totalInteractions > 10 ? 75 : 50;
    return this.createResult(result, dataRichness, executionTime);
  }

  /**
   * Build comprehensive experience profile
   */
  private async buildExperienceProfile(
    userId: string
  ): Promise<ExperienceProfile> {
    try {
      if (!supabase) {
        return this.emptyProfile();
      }

      // Fetch chat history to count interactions
      const { data: messages, error: messageError } = await supabase
        .from('chat_messages')
        .select('id, hub, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(500);

      if (messageError || !messages) {
        return this.emptyProfile();
      }

      const totalInteractions = messages.length;

      // Extract unique worlds/hubs
      const worldsExplored = Array.from(new Set(messages.map((m: any) => m.hub)));

      // Calculate streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(messages);

      // Identify learning patterns
      const keyLearnings = this.extractKeyLearnings(worldsExplored, totalInteractions);
      const growthAreas = this.identifyGrowthAreas(worldsExplored);
      const masteredAreas = this.identifyMasteredAreas(worldsExplored);

      return {
        totalInteractions,
        worldsExplored,
        keyLearnings,
        growthAreas,
        masteredAreas,
        currentStreak,
        longestStreak,
      };
    } catch (err) {
      console.error('Profile building error:', err);
      return this.emptyProfile();
    }
  }

  /**
   * Calculate interaction streaks
   */
  private calculateStreaks(messages: any[]): { currentStreak: number; longestStreak: number } {
    if (messages.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const dates = messages
      .map((m: any) => new Date(m.created_at).toDateString())
      .filter((d, i, a) => a.indexOf(d) === i); // unique dates

    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    // Sort dates in ascending order
    dates.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Current streak (from most recent date backward)
    currentStreak = tempStreak;

    return { currentStreak, longestStreak };
  }

  /**
   * Extract key learnings from worlds explored
   */
  private extractKeyLearnings(worldsExplored: string[], totalInteractions: number): string[] {
    const learnings: string[] = [];

    if (worldsExplored.length >= 3) {
      learnings.push(`Multi-dimensional perspective: explored ${worldsExplored.length} worlds`);
    }

    if (totalInteractions >= 50) {
      learnings.push('Developed deep contextual understanding through extensive practice');
    } else if (totalInteractions >= 20) {
      learnings.push('Building consistent patterns in thinking');
    }

    if (worldsExplored.includes('decision') || worldsExplored.includes('career')) {
      learnings.push('Applying structured decision-making frameworks');
    }

    return learnings.slice(0, 3);
  }

  /**
   * Identify areas for growth
   */
  private identifyGrowthAreas(worldsExplored: string[]): string[] {
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

    const unexploredWorlds = allWorlds.filter((w) => !worldsExplored.includes(w));

    return unexploredWorlds.slice(0, 3).map((w) => `Explore ${w} world`);
  }

  /**
   * Identify areas of mastery
   */
  private identifyMasteredAreas(worldsExplored: string[]): string[] {
    const masteredAreas: string[] = [];

    if (worldsExplored.includes('decision') && worldsExplored.length > 5) {
      masteredAreas.push('Decision-making clarity');
    }

    if (worldsExplored.includes('relationship') && worldsExplored.length > 5) {
      masteredAreas.push('Interpersonal awareness');
    }

    if (worldsExplored.includes('career') && worldsExplored.length > 5) {
      masteredAreas.push('Professional clarity');
    }

    if (worldsExplored.length >= 8) {
      masteredAreas.push('Holistic life perspective');
    }

    return masteredAreas;
  }

  /**
   * Empty profile for fallback
   */
  private emptyProfile(): ExperienceProfile {
    return {
      totalInteractions: 0,
      worldsExplored: [],
      keyLearnings: [],
      growthAreas: [],
      masteredAreas: [],
      longestStreak: 0,
      currentStreak: 0,
    };
  }
}

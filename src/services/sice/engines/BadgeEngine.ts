/**
 * SICE #8: BadgeEngine
 * Generates achievement badges and milestones
 * Motivates user progress through recognition
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput, BadgeResult } from '../../../types/sice';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'milestone' | 'skill' | 'exploration' | 'insight';
}

export interface BadgeAnalysis {
  unlockedBadges: Achievement[];
  earnedThisSession: Achievement[];
  nextMilestones: Achievement[];
  totalProgress: number; // 0-100
}

export class BadgeEngine extends SICEBase {
  private readonly BADGES: Record<string, Achievement> = {
    // Milestones
    first_chat: {
      id: 'first-chat',
      name: 'First Step',
      description: 'Had your first conversation with Twin',
      icon: '👣',
      category: 'milestone',
    },
    tenth_interaction: {
      id: 'tenth-interaction',
      name: 'Momentum',
      description: 'Reached 10 interactions with Twin',
      icon: '📈',
      category: 'milestone',
    },
    fiftieth_interaction: {
      id: 'fiftieth-interaction',
      name: 'Dedication',
      description: 'Achieved 50 meaningful interactions',
      icon: '💎',
      category: 'milestone',
    },

    // Skills
    decision_master: {
      id: 'decision-master',
      name: 'Decision Master',
      description: 'Logged 10 thoughtful decisions',
      icon: '⚖️',
      category: 'skill',
    },
    world_explorer: {
      id: 'world-explorer',
      name: 'World Explorer',
      description: 'Explored all 12 intelligence worlds',
      icon: '🌍',
      category: 'exploration',
    },

    // Insights
    self_aware: {
      id: 'self-aware',
      name: 'Self Aware',
      description: 'Discovered deep personal insight',
      icon: '🪞',
      category: 'insight',
    },
    pattern_master: {
      id: 'pattern-master',
      name: 'Pattern Master',
      description: 'Recognized 5+ personal patterns',
      icon: '🔄',
      category: 'insight',
    },
  };

  constructor() {
    super(8, 'BadgeEngine', 'Generates and tracks achievement badges');
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return {
          unlockedBadges: [],
          earnedThisSession: [],
          nextMilestones: [],
          totalProgress: 0,
        };
      }

      try {
        const userId = input.userId;

        // Analyze achievements
        const analysis = await this.analyzeBadges(userId);

        return analysis;
      } catch (err) {
        console.error('Badge engine error:', err);
        return {
          unlockedBadges: [],
          earnedThisSession: [],
          nextMilestones: [],
          totalProgress: 0,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    // Confidence based on data completeness
    const badgeCount = ((result as BadgeResult).unlockedBadges || []).length;
    const confidence = Math.min(100, 50 + badgeCount * 5);

    return this.createResult(result, confidence, executionTime);
  }

  /**
   * Analyze badges and milestones
   */
  private async analyzeBadges(userId: string): Promise<BadgeAnalysis> {
    try {
      if (!supabase) {
        return {
          unlockedBadges: [],
          earnedThisSession: [],
          nextMilestones: this.getNextMilestones(0),
          totalProgress: 0,
        };
      }

      // CHATMESSAGES-002 FIX: 'chat_messages' doesn't exist (same root cause
      // as TwinChat.tsx's CHATMESSAGES-001 fix — verified against a live
      // pg_tables dump). Twin conversation turns are written to
      // twin_memories now, keyed by twin_id (not user_id), so resolve the
      // Twin first.
      const { data: twinRow } = await supabase
        .from('twins')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const { count: interactionCount } = twinRow
        ? await supabase
            .from('twin_memories')
            .select('id', { count: 'exact' })
            .eq('twin_id', twinRow.id)
        : { count: 0 };

      const interactions = interactionCount || 0;

      // Check for decisions
      const { count: decisionCount } = await supabase
        .from('decisions')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      const decisions = decisionCount || 0;

      // Evaluate unlocked badges
      const unlockedBadges = this.evaluateUnlockedBadges(
        interactions,
        decisions
      );

      // Get next milestones
      const nextMilestones = this.getNextMilestones(interactions);

      // Calculate total progress
      const totalProgress = this.calculateProgress(interactions);

      return {
        unlockedBadges,
        earnedThisSession: [], // Would need session start time to track
        nextMilestones,
        totalProgress,
      };
    } catch (err) {
      console.error('Badge analysis error:', err);
      return {
        unlockedBadges: [],
        earnedThisSession: [],
        nextMilestones: this.getNextMilestones(0),
        totalProgress: 0,
      };
    }
  }

  /**
   * Evaluate which badges are unlocked
   */
  private evaluateUnlockedBadges(interactions: number, decisions: number): Achievement[] {
    const unlocked: Achievement[] = [];

    if (interactions > 0) {
      unlocked.push(this.BADGES.first_chat);
    }

    if (interactions >= 10) {
      unlocked.push(this.BADGES.tenth_interaction);
    }

    if (interactions >= 50) {
      unlocked.push(this.BADGES.fiftieth_interaction);
    }

    if (decisions >= 10) {
      unlocked.push(this.BADGES.decision_master);
    }

    if (interactions >= 100) {
      unlocked.push(this.BADGES.self_aware);
    }

    if (interactions >= 75) {
      unlocked.push(this.BADGES.pattern_master);
    }

    return unlocked;
  }

  /**
   * Get next milestones to unlock
   */
  private getNextMilestones(interactions: number): Achievement[] {
    const milestones: Achievement[] = [];

    if (interactions < 10) {
      milestones.push({
        ...this.BADGES.tenth_interaction,
        unlockedAt: undefined,
      });
    }

    if (interactions < 50) {
      milestones.push({
        ...this.BADGES.fiftieth_interaction,
        unlockedAt: undefined,
      });
    }

    if (interactions < 100) {
      milestones.push({
        ...this.BADGES.self_aware,
        unlockedAt: undefined,
      });
    }

    return milestones.slice(0, 2);
  }

  /**
   * Calculate progress to next major milestone
   */
  private calculateProgress(interactions: number): number {
    if (interactions < 10) {
      return (interactions / 10) * 100;
    } else if (interactions < 50) {
      return 25 + ((interactions - 10) / 40) * 25;
    } else if (interactions < 100) {
      return 50 + ((interactions - 50) / 50) * 25;
    } else {
      return Math.min(100, 75 + (interactions - 100) / 20);
    }
  }
}

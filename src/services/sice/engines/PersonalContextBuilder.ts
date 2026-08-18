/**
 * SICE #1: PersonalContextBuilder
 * Builds comprehensive personal context from available data
 * P0 #7.4: Adapts per world with world-specific personalities
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput, PersonalContext } from '../../../types/sice';
import { getWorldPersonality } from '../../../constants/worldPersonalities';

export class PersonalContextBuilder extends SICEBase {
  constructor() {
    super(1, 'PersonalContextBuilder', 'Builds user personal context from available data');
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return null;
      }

      const worldPersonality = input.currentWorld
        ? getWorldPersonality(input.currentWorld)
        : null;

      // Run all data fetches in parallel for speed
      const [goals, memories, patterns, worldAreas] = await Promise.all([
        this.fetchUserGoals(input.userId),
        this.fetchRecentMemories(input.userId),
        this.fetchActivePatterns(input.userId),
        this.fetchWorldAreas(input.userId),
      ]);

      // Infer emotional state from recent memories
      const emotionalState = this.inferEmotionalState(memories, worldPersonality?.defaultMood);

      const context: PersonalContext = {
        userId: input.userId,
        emotionalState,
        currentGoals: goals,
        activePatterns: patterns,
        worldFocus: input.currentWorld || 'self',
        recentMemories: memories,
        strengthAreas: worldAreas.strengths,
        growthAreas: worldAreas.growth,
        worldPersonality: worldPersonality
          ? {
              mood: worldPersonality.defaultMood,
              responseStyle: worldPersonality.responseStyle,
              focusArea: worldPersonality.focusArea,
            }
          : undefined,
      };

      return context;
    });

    return this.createResult(result, 75, executionTime);
  }

  /**
   * Fetch user goals from user_profiles
   */
  private async fetchUserGoals(userId: string): Promise<string[]> {
    try {
      if (!supabase) return [];

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('goals_json, focus_areas')
        .eq('user_id', userId)
        .single();

      if (!profile) return [];

      const goals: string[] = [];

      // Parse goals_json array
      if (profile.goals_json) {
        try {
          const parsed = typeof profile.goals_json === 'string'
            ? JSON.parse(profile.goals_json)
            : profile.goals_json;
          if (Array.isArray(parsed)) {
            parsed.forEach((g: any) => {
              const title = g.title || g.goal || (typeof g === 'string' ? g : null);
              if (title) goals.push(title);
            });
          }
        } catch {
          // goals_json not parseable, skip
        }
      }

      // Add focus areas as goals if no goals yet
      if (goals.length === 0 && profile.focus_areas) {
        const areas = Array.isArray(profile.focus_areas)
          ? profile.focus_areas
          : [profile.focus_areas];
        areas.forEach((a: string) => goals.push(`Focus: ${a}`));
      }

      return goals.slice(0, 5);
    } catch (err) {
      this.log('Error fetching user goals', err);
      return [];
    }
  }

  /**
   * Fetch recent memories for context and emotional state
   */
  private async fetchRecentMemories(
    userId: string
  ): Promise<Array<{ timestamp: string; content: string }>> {
    try {
      if (!supabase) return [];

      // Get twin id first
      const { data: twin } = await supabase
        .from('twins')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!twin) return [];

      const { data: memories } = await supabase
        .from('twin_memories')
        .select('content, created_at')
        .eq('twin_id', twin.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!memories) return [];

      return memories.map((m: any) => ({
        timestamp: m.created_at,
        content: m.content,
      }));
    } catch (err) {
      this.log('Error fetching recent memories', err);
      return [];
    }
  }

  /**
   * Fetch active behavioral patterns from decision_patterns table
   */
  private async fetchActivePatterns(userId: string): Promise<string[]> {
    try {
      if (!supabase) return [];

      const { data: twin } = await supabase
        .from('twins')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!twin) return [];

      const { data: patterns } = await supabase
        .from('decision_patterns')
        .select('pattern, success_rate')
        .eq('twin_id', twin.id)
        .order('success_rate', { ascending: false })
        .limit(5);

      if (!patterns || patterns.length === 0) return [];

      return patterns.map(
        (p: any) => `${p.pattern} (${Math.round(p.success_rate)}% success)`
      );
    } catch (err) {
      this.log('Error fetching active patterns', err);
      return [];
    }
  }

  /**
   * Derive strength and growth areas from world_stats engagement
   */
  private async fetchWorldAreas(
    userId: string
  ): Promise<{ strengths: string[]; growth: string[] }> {
    try {
      if (!supabase) return { strengths: [], growth: [] };

      const { data: stats } = await supabase
        .from('world_stats')
        .select('world_id, insights_gained, decisions_made, visits_count')
        .eq('user_id', userId);

      if (!stats || stats.length === 0) {
        return { strengths: [], growth: [] };
      }

      // Sort by engagement score
      const scored = stats.map((s: any) => ({
        world: s.world_id,
        score: (s.insights_gained || 0) * 3 + (s.decisions_made || 0) * 2 + (s.visits_count || 0),
      }));

      scored.sort((a, b) => b.score - a.score);

      const strengths = scored
        .filter((s) => s.score > 0)
        .slice(0, 3)
        .map((s) => s.world);

      // Growth areas = worlds with low/no engagement
      const allWorlds = ['career', 'relationship', 'health', 'money', 'learning', 'creativity'];
      const activeWorlds = new Set(strengths);
      const growth = allWorlds
        .filter((w) => !activeWorlds.has(w))
        .slice(0, 3);

      return { strengths, growth };
    } catch (err) {
      this.log('Error fetching world areas', err);
      return { strengths: [], growth: [] };
    }
  }

  /**
   * Infer emotional state from recent memory content
   */
  private inferEmotionalState(
    memories: Array<{ timestamp: string; content: string }>,
    worldDefaultMood?: string
  ): string {
    if (memories.length === 0) {
      return worldDefaultMood || 'neutral';
    }

    // Analyze last 3 memories for sentiment
    const recentText = memories
      .slice(0, 3)
      .map((m) => m.content.toLowerCase())
      .join(' ');

    if (/great|happy|excited|amazing|excellent|thrilled/.test(recentText)) {
      return 'optimistic';
    }
    if (/focused|productive|clear|determined/.test(recentText)) {
      return 'focused';
    }
    if (/tired|exhausted|overwhelmed|burnout/.test(recentText)) {
      return 'fatigued';
    }
    if (/anxious|worried|stressed|nervous/.test(recentText)) {
      return 'anxious';
    }
    if (/confused|uncertain|lost|unclear/.test(recentText)) {
      return 'uncertain';
    }

    return worldDefaultMood || 'balanced';
  }
}

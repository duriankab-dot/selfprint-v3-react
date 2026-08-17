/**
 * SICE #11: MemoryManagerEngine
 * Synthesizes and retrieves relevant memories from Twin-user history
 * Provides contextual memories for Twin interactions
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput } from '../../../types/sice';

export interface Memory {
  content: string;
  world?: string;
  timestamp: string;
  relevance: number;
}

export interface MemorySynthesis {
  topMemories: Memory[];
  totalMemoriesStored: number;
  primaryThemes: string[];
  emotionalTone: string;
  readyForRecall: boolean;
}

export class MemoryManagerEngine extends SICEBase {
  constructor() {
    super(
      11,
      'MemoryManagerEngine',
      'Retrieves and synthesizes relevant Twin-user memories'
    );
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return this.getEmptyMemorySynthesis();
      }

      try {
        const userId = input.userId;
        const currentWorld = input.currentWorld;

        const synthesis = await this.synthesizeMemories(userId, currentWorld);
        return synthesis;
      } catch (err) {
        this.log('Memory synthesis failed', err);
        return this.getEmptyMemorySynthesis();
      }
    });

    const memoryCount = (result as any).totalMemoriesStored || 0;
    const confidence = Math.min(100, 50 + Math.min(memoryCount, 50));

    return this.createResult(result, confidence, executionTime);
  }

  /**
   * Synthesize memories relevant to current context
   */
  private async synthesizeMemories(
    userId: string,
    currentWorld?: string
  ): Promise<MemorySynthesis> {
    try {
      if (!supabase) {
        return this.getEmptyMemorySynthesis();
      }

      // Fetch Twin
      const { data: twin } = await supabase
        .from('twins')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!twin) {
        return this.getEmptyMemorySynthesis();
      }

      // Fetch recent memories
      let query = supabase
        .from('twin_memories')
        .select('content, world_id, created_at')
        .eq('twin_id', twin.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter by world if specified
      if (currentWorld) {
        query = query.eq('world_id', currentWorld);
      }

      const { data: memories } = await query;

      if (!memories || memories.length === 0) {
        return this.getEmptyMemorySynthesis();
      }

      // Rank memories by relevance (recency + world match)
      const rankedMemories = this.rankMemoriesByRelevance(
        memories,
        currentWorld
      );

      // Extract themes
      const themes = this.extractThemes(memories);

      // Determine emotional tone
      const tone = this.analyzeEmotionalTone(rankedMemories);

      return {
        topMemories: rankedMemories.slice(0, 5),
        totalMemoriesStored: memories.length,
        primaryThemes: themes,
        emotionalTone: tone,
        readyForRecall: memories.length > 0,
      };
    } catch (err) {
      console.error('Memory synthesis error:', err);
      return this.getEmptyMemorySynthesis();
    }
  }

  /**
   * Rank memories by relevance
   */
  private rankMemoriesByRelevance(
    memories: any[],
    currentWorld?: string
  ): Memory[] {
    return memories
      .map((m, idx) => ({
        content: m.content,
        world: m.world_id,
        timestamp: m.created_at,
        relevance: this.calculateRelevance(m, idx, currentWorld),
      }))
      .sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(
    memory: any,
    recencyIndex: number,
    currentWorld?: string
  ): number {
    let score = 100 - recencyIndex * 5; // Recency boost

    if (currentWorld && memory.world_id === currentWorld) {
      score += 20; // World match bonus
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Extract key themes from memories
   */
  private extractThemes(memories: any[]): string[] {
    const themes = new Map<string, number>();

    // Count keywords
    const keywords = ['decision', 'goal', 'challenge', 'growth', 'insight', 'learning'];
    keywords.forEach((keyword) => {
      const count = memories.filter((m) =>
        m.content.toLowerCase().includes(keyword)
      ).length;
      if (count > 0) {
        themes.set(keyword, count);
      }
    });

    // Return top themes
    return Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((t) => t[0]);
  }

  /**
   * Analyze emotional tone from memories
   */
  private analyzeEmotionalTone(memories: Memory[]): string {
    if (memories.length === 0) return 'neutral';

    const content = memories.map((m) => m.content.toLowerCase()).join(' ');

    if (content.includes('joy') || content.includes('excited')) return 'positive';
    if (content.includes('struggle') || content.includes('challenge')) return 'resilient';
    if (content.includes('reflect') || content.includes('learn')) return 'growth-focused';
    if (content.includes('uncertain') || content.includes('question')) return 'exploratory';

    return 'balanced';
  }

  /**
   * Empty synthesis for errors
   */
  private getEmptyMemorySynthesis(): MemorySynthesis {
    return {
      topMemories: [],
      totalMemoriesStored: 0,
      primaryThemes: [],
      emotionalTone: 'neutral',
      readyForRecall: false,
    };
  }
}

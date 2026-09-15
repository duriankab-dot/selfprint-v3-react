/**
 * GoalTrackingEngine.ts — SICE #15
 * Monitors goal progress and achievement patterns
 */

import { SICEBase } from '../SICEBase';
import type { SICEInput, SICEOutput, GoalTrackingResult } from '../../../types/sice';
import { supabase } from '../../supabase-service';

export class GoalTrackingEngine extends SICEBase {
  constructor() {
    super(15, 'GoalTrackingEngine', 'Monitors goal progress and achievement patterns');
  }

  async process(_input: SICEInput): Promise<SICEOutput> {
    const startTime = performance.now();

    try {
      const result = await this.analyzeGoals(_input);
      const executionTime = performance.now() - startTime;

      return {
        engineId: this.id,
        engineName: this.name,
        result,
        confidence: 72,
        executionTime,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        engineId: this.id,
        engineName: this.name,
        result: null,
        confidence: 0,
        executionTime: performance.now() - startTime,
        error: errorMsg,
      };
    }
  }

  private async analyzeGoals(_input: SICEInput): Promise<GoalTrackingResult> {
    // Analyze conversations for goal-related content
    const { data: messages } = await supabase
      .from('twin_memories')
      .select('content, created_at')
      .eq('twin_id', '')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!messages || messages.length === 0) {
      return {
        activeGoals: 0,
        completionRate: 0,
        goalCategories: {},
        bottlenecks: [],
        nextRecommendedGoals: ['Define clear goals to track'],
      };
    }

    // Analyze goal-related keywords
    const goalKeywords = ['goal', 'target', 'aim', 'objective', 'want to', 'trying to', 'planning'];
    const progressKeywords = ['achieved', 'completed', 'finished', 'done', 'accomplished'];
    const obstacleKeywords = ['struggling', 'hard', 'difficult', 'blocked', 'stuck'];

    let goalCount = 0;
    let progressCount = 0;
    let obstacleCount = 0;

    for (const msg of messages) {
      const content = (msg.content as string).toLowerCase();
      goalKeywords.forEach((kw) => { if (content.includes(kw)) goalCount++; });
      progressKeywords.forEach((kw) => { if (content.includes(kw)) progressCount++; });
      obstacleKeywords.forEach((kw) => { if (content.includes(kw)) obstacleCount++; });
    }

    const activeGoals = Math.max(0, goalCount - progressCount);
    const completionRate = goalCount > 0 ? Math.round((progressCount / goalCount) * 100) : 0;

    // Categorize goals by context
    const categories: Record<string, number> = {};
    const categoryKeywords = {
      'Career': ['career', 'work', 'job', 'promotion', 'business'],
      'Health': ['health', 'exercise', 'diet', 'fitness', 'sleep'],
      'Learning': ['learn', 'study', 'read', 'course', 'skill'],
      'Personal': ['personal', 'hobby', 'creative', 'art', 'music'],
    };

    for (const msg of messages) {
      const content = (msg.content as string).toLowerCase();
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => content.includes(kw))) {
          categories[category] = (categories[category] || 0) + 1;
        }
      }
    }

    const bottlenecks = obstacleCount > progressCount 
      ? ['Focus on breaking goals into smaller steps']
      : [];

    const nextRecommendedGoals = activeGoals > 3
      ? ['Focus on completing current goals first']
      : ['Set new challenging goals', 'Review and adjust existing goals'];

    return {
      activeGoals,
      completionRate: Math.min(100, completionRate),
      goalCategories: categories,
      bottlenecks,
      nextRecommendedGoals,
    };
  }
}

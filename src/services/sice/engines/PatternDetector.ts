/**
 * SICE #2: PatternDetector
 * Detects recurring behavioral patterns (P0 #7.3 - World-aware)
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput, DetectedPattern } from '../../../types/sice';

export class PatternDetector extends SICEBase {
  constructor() {
    super(2, 'PatternDetector', 'Detects recurring behavioral patterns');
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return [];
      }

      const userId = input.userId;
      const world = input.currentWorld || null;

      try {
        // Query user's decision history to detect patterns
        let query = supabase
          .from('decisions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (world) {
          query = query.eq('world_id', world);
        }

        const { data: decisions, error } = await query;

        if (error) {
          console.error('Failed to fetch decisions for pattern detection:', error);
          return [];
        }

        // Analyze patterns from decisions
        const patterns: DetectedPattern[] = this.analyzeDecisions(decisions || [], world);
        return patterns;
      } catch (err) {
        console.error('Pattern detection error:', err);
        return [];
      }
    });

    return this.createResult(result, 60, executionTime);
  }

  private analyzeDecisions(decisions: any[], _world: string | null): DetectedPattern[] {
    if (!decisions || decisions.length < 3) {
      return [];
    }

    const patterns: DetectedPattern[] = [];

    // Pattern 1: Decision frequency over time
    const decisionsByDay = this.groupByDay(decisions);
    const avgPerDay = decisions.length / Object.keys(decisionsByDay).length;

    if (avgPerDay >= 2) {
      patterns.push({
        name: 'Frequent decision-maker',
        frequency: Math.round(avgPerDay * 10) / 10,
        lastObserved: decisions[0]?.created_at || new Date().toISOString(),
        impact: 'positive',
        examples: decisions.slice(0, 3).map((d: any) => d.title || 'Untitled'),
        confidence: Math.min(90, decisions.length * 5),
      });
    }

    // Pattern 2: Outcome correlation
    const successfulDecisions = decisions.filter((d: any) => d.outcome === 'positive').length;
    const successRate = (successfulDecisions / decisions.length) * 100;

    if (successRate >= 60) {
      patterns.push({
        name: 'Successful decision pattern',
        frequency: successfulDecisions,
        lastObserved: decisions.find((d: any) => d.outcome === 'positive')?.created_at || new Date().toISOString(),
        impact: 'positive',
        examples: decisions
          .filter((d: any) => d.outcome === 'positive')
          .slice(0, 3)
          .map((d: any) => d.title || 'Untitled'),
        confidence: Math.min(85, successRate),
      });
    }

    // Pattern 3: Decision topics/themes
    const topics = this.extractTopics(decisions);
    const topTopic = Object.entries(topics).sort(([, a], [, b]) => b - a)[0];

    if (topTopic && topTopic[1] >= 3) {
      patterns.push({
        name: `Recurring focus: ${topTopic[0]}`,
        frequency: topTopic[1],
        lastObserved: new Date().toISOString(),
        impact: 'neutral',
        examples: decisions
          .filter((d: any) => d.category === topTopic[0])
          .slice(0, 2)
          .map((d: any) => d.title || 'Untitled'),
        confidence: Math.min(80, topTopic[1] * 15),
      });
    }

    return patterns;
  }

  private groupByDay(decisions: any[]): Record<string, number> {
    const byDay: Record<string, number> = {};
    decisions.forEach((d: any) => {
      const day = new Date(d.created_at).toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return byDay;
  }

  private extractTopics(decisions: any[]): Record<string, number> {
    const topics: Record<string, number> = {};
    decisions.forEach((d: any) => {
      const category = d.category || 'general';
      topics[category] = (topics[category] || 0) + 1;
    });
    return topics;
  }
}

/**
 * SICE #12: DecisionIntelligenceEngineAdapter
 * Analyzes decision history and provides decision-making guidance
 * Synthesizes decision patterns and success metrics
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput } from '../../../types/sice';

export interface DecisionAnalysis {
  totalDecisions: number;
  successRate: number; // 0-100
  mostCommonType: string;
  bestPerformingArea: string;
  areas: Array<{
    name: string;
    count: number;
    successRate: number;
  }>;
  insights: string[];
  nextStepGuidance: string;
}

export class DecisionIntelligenceEngineAdapter extends SICEBase {
  constructor() {
    super(
      12,
      'DecisionIntelligenceEngineAdapter',
      'Synthesizes decision patterns and provides guidance'
    );
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return this.getDefaultAnalysis();
      }

      try {
        const userId = input.userId;
        const analysis = await this.analyzeDecisions(userId);
        return analysis;
      } catch (err) {
        this.log('Decision analysis failed', err);
        return this.getDefaultAnalysis();
      }
    });

    const decisionCount = (result as any).totalDecisions || 0;
    const confidence = Math.min(100, 50 + decisionCount * 3);

    return this.createResult(result, confidence, executionTime);
  }

  /**
   * Analyze user's decision patterns and success
   */
  private async analyzeDecisions(userId: string): Promise<DecisionAnalysis> {
    try {
      if (!supabase) {
        return this.getDefaultAnalysis();
      }

      // Get Twin first
      // TWINS406-001 FIX: .maybeSingle() — no Twin yet is a normal state.
      const { data: twin } = await supabase
        .from('twins')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!twin) {
        return this.getDefaultAnalysis();
      }

      // Fetch decisions with P0 #3 outcomes schema
      const { data: decisions } = await supabase
        .from('decisions')
        .select(
          `
          id,
          world,
          title,
          created_at,
          decision_outcomes(impact),
          follow_up_schedule(day30_completed, day90_completed, day180_completed, day365_completed)
        `
        )
        .eq('twin_id', twin.id)
        .limit(100);

      if (!decisions || decisions.length === 0) {
        return this.getDefaultAnalysis();
      }

      // Analyze success rate
      const successRate = this.calculateSuccessRate(decisions);

      // Fetch learned decision patterns from P0 #3
      const { data: patterns } = await supabase
        .from('decision_patterns')
        .select('*')
        .eq('twin_id', twin.id)
        .order('success_rate', { ascending: false })
        .limit(5);

      // Group by world
      const byWorld = this.groupByWorld(decisions);

      // Extract insights (including learned patterns)
      const insights = this.generateInsights(decisions, successRate, patterns || undefined);

      // Find best area
      const bestArea = Object.entries(byWorld).reduce(
        (best: any, [area, data]: any) =>
          data.successRate > (best?.successRate || 0) ? { area, ...data } : best,
        {}
      );

      // Determine next step guidance
      const guidance = this.generateGuidance(successRate, Object.keys(byWorld));

      return {
        totalDecisions: decisions.length,
        successRate,
        mostCommonType: Object.entries(byWorld).sort(
          (a: any, b: any) => b[1].count - a[1].count
        )[0]?.[0] || 'general',
        bestPerformingArea: bestArea.area || 'unknown',
        areas: Object.entries(byWorld).map(([name, data]: any) => ({
          name,
          count: data.count,
          successRate: data.successRate,
        })),
        insights,
        nextStepGuidance: guidance,
      };
    } catch (err) {
      console.error('Decision analysis error:', err);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Calculate overall success rate
   */
  private calculateSuccessRate(decisions: any[]): number {
    let successCount = 0;
    let totalWithOutcome = 0;

    decisions.forEach((d) => {
      const outcomes = (d as any).decision_outcomes || [];
      if (outcomes.length > 0) {
        totalWithOutcome++;
        const successfulOutcomes = outcomes.filter(
          (o: any) => o.impact === 'positive' || o.impact === 'neutral'
        );
        if (successfulOutcomes.length > 0) {
          successCount++;
        }
      }
    });

    return totalWithOutcome > 0 ? Math.round((successCount / totalWithOutcome) * 100) : 0;
  }

  /**
   * Group decisions by world/category
   */
  private groupByWorld(
    decisions: any[]
  ): Record<string, { count: number; successRate: number }> {
    const grouped: Record<string, any> = {};

    decisions.forEach((d) => {
      const world = d.world_id || 'general';
      if (!grouped[world]) {
        grouped[world] = { decisions: [], count: 0 };
      }
      grouped[world].decisions.push(d);
      grouped[world].count++;
    });

    // Calculate success rate per world
    Object.keys(grouped).forEach((world) => {
      const worldDecisions = grouped[world].decisions;
      let successCount = 0;
      let totalWithOutcome = 0;

      worldDecisions.forEach((d: any) => {
        const outcomes = d.decision_outcomes || [];
        if (outcomes.length > 0) {
          totalWithOutcome++;
          const successful = outcomes.filter(
            (o: any) => o.impact === 'positive' || o.impact === 'neutral'
          );
          if (successful.length > 0) successCount++;
        }
      });

      grouped[world].successRate =
        totalWithOutcome > 0 ? Math.round((successCount / totalWithOutcome) * 100) : 0;
      delete grouped[world].decisions; // Clean up
    });

    return grouped;
  }

  /**
   * Generate insights from decision analysis including learned patterns
   */
  private generateInsights(
    decisions: any[],
    successRate: number,
    patterns?: any[]
  ): string[] {
    const insights: string[] = [];

    if (successRate > 70) {
      insights.push('Strong decision-making track record - trust your instincts');
    } else if (successRate > 50) {
      insights.push('Good decision foundation - continue refining your approach');
    } else if (decisions.length > 0) {
      insights.push('Still building decision confidence - more data needed');
    }

    if (decisions.length > 10) {
      insights.push(`${decisions.length} decisions logged - solid tracking habit`);
    }

    // Add learned patterns from P0 #3
    if (patterns && patterns.length > 0) {
      const topPattern = patterns[0];
      insights.push(
        `Pattern detected: "${topPattern.pattern}" (${Math.round(topPattern.success_rate)}% success)`
      );
    }

    return insights.slice(0, 3);
  }

  /**
   * Generate next step guidance
   */
  private generateGuidance(
    successRate: number,
    worldKeys: string[]
  ): string {
    if (successRate > 70) {
      return 'Continue trusting your decision-making process and pattern recognition';
    } else if (successRate > 50) {
      return 'Explore what makes some decisions succeed better than others';
    } else if (worldKeys.length === 1) {
      return 'Expand decision-making across different life areas';
    } else {
      return 'Build more decisions with tracked follow-ups for better clarity';
    }
  }

  /**
   * Default analysis for errors
   */
  private getDefaultAnalysis(): DecisionAnalysis {
    return {
      totalDecisions: 0,
      successRate: 0,
      mostCommonType: 'unknown',
      bestPerformingArea: 'unknown',
      areas: [],
      insights: ['No decision data yet - start logging decisions to build intelligence'],
      nextStepGuidance: 'Begin making and tracking intentional decisions',
    };
  }
}

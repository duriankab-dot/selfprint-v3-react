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
      'DecisionIntelligenceEngine',
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
      const { data: twin } = await supabase
        .from('twins')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!twin) {
        return this.getDefaultAnalysis();
      }

      // Fetch decisions with follow-up outcomes
      const { data: decisions } = await supabase
        .from('decisions')
        .select(
          `
          id,
          world_id,
          title,
          created_at,
          decision_follow_ups(outcome)
        `
        )
        .eq('twin_id', twin.id)
        .limit(100);

      if (!decisions || decisions.length === 0) {
        return this.getDefaultAnalysis();
      }

      // Analyze success rate
      const successRate = this.calculateSuccessRate(decisions);

      // Group by world
      const byWorld = this.groupByWorld(decisions);

      // Extract insights
      const insights = this.generateInsights(decisions, successRate);

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
      const followUps = (d as any).decision_follow_ups || [];
      if (followUps.length > 0) {
        totalWithOutcome++;
        const successfulOutcomes = followUps.filter(
          (f: any) => f.outcome === 'worked' || f.outcome === 'modified'
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
        const followUps = d.decision_follow_ups || [];
        if (followUps.length > 0) {
          totalWithOutcome++;
          const successful = followUps.filter(
            (f: any) => f.outcome === 'worked' || f.outcome === 'modified'
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
   * Generate insights from decision analysis
   */
  private generateInsights(
    decisions: any[],
    successRate: number
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

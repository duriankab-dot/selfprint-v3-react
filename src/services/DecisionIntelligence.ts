/**
 * DecisionIntelligence Service (Phase 5B)
 *
 * Analyzes user decision patterns:
 * - What decision-making styles lead to success
 * - How conditions affect decision outcomes
 * - Pattern recognition from decisions + outcomes
 * - Prediction of decision success
 *
 * Data source: decision_follow_ups, decision_outcomes tables
 * Used by: GuidanceGenerator, insights generation
 */

import { supabase } from '../lib/supabase/client';

export interface DecisionPattern {
  pattern: string; // 'risk-averse', 'impulsive', 'over-analyzing', 'decisive'
  confidence: number; // 0-1
  frequency: number;
  successRate: number; // 0-1
  examples: string[]; // decision IDs
}

export interface OutcomeRate {
  positive: number;
  neutral: number;
  negative: number;
}

export interface ConditionalPattern {
  condition: string; // 'when under stress', 'in morning', 'when tired'
  decisionStyle: string;
  frequency: number;
  outcomeRate: OutcomeRate;
}

export interface DecisionPrediction {
  predictedOutcome: 'positive' | 'risky' | 'uncertain';
  confidence: number; // 0-1
  rationale: string;
  successProbability: number; // 0-100
}

export interface DecisionAnalysis {
  userId: string;
  patterns: DecisionPattern[];
  successRate: { overall: number; byType: Record<string, number> };
  conditionalPatterns: ConditionalPattern[];
  impactAreas: string[];
  topSuccessPattern: DecisionPattern | null;
  analysisDate: string;
}

/**
 * Analyze all user decisions and extract patterns
 */
export async function analyzeDecisionPatterns(userId: string): Promise<{
  success: boolean;
  analysis?: DecisionAnalysis;
  error?: string;
}> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    // Fetch all decisions and outcomes
    const { data: outcomes, error: fetchError } = await supabase
      .from('decision_outcomes')
      .select('id, decision_text, outcome, recorded_at, follow_up_day')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching decisions:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!outcomes || outcomes.length === 0) {
      return {
        success: true,
        analysis: {
          userId,
          patterns: [],
          successRate: { overall: 0, byType: {} },
          conditionalPatterns: [],
          impactAreas: [],
          topSuccessPattern: null,
          analysisDate: new Date().toISOString(),
        },
      };
    }

    // Calculate success rate
    const outcomes_data = outcomes as any[];
    const positive = outcomes_data.filter((o) => o.outcome === 'positive').length;
    const total = outcomes_data.length;

    const overallSuccessRate = total > 0 ? positive / total : 0;

    // Extract decision style patterns from text
    const patterns = extractDecisionPatterns(outcomes_data);
    const impactAreas = extractImpactAreas(outcomes_data);

    // Group by decision context
    const conditionalPatterns = analyzeConditionalPatterns(outcomes_data);

    // Calculate success rate by type
    const byType: Record<string, number> = {};
    impactAreas.forEach((area) => {
      const areaOutcomes = outcomes_data.filter((o) =>
        o.decision_text?.toLowerCase().includes(area.toLowerCase())
      );
      if (areaOutcomes.length > 0) {
        const areaPositive = areaOutcomes.filter((o) => o.outcome === 'positive').length;
        byType[area] = areaPositive / areaOutcomes.length;
      }
    });

    const analysis: DecisionAnalysis = {
      userId,
      patterns,
      successRate: { overall: overallSuccessRate, byType },
      conditionalPatterns,
      impactAreas,
      topSuccessPattern: patterns.length > 0 ? patterns[0] : null,
      analysisDate: new Date().toISOString(),
    };

    return { success: true, analysis };
  } catch (error) {
    console.error('Error in analyzeDecisionPatterns:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Extract decision-making patterns from decision texts
 */
function extractDecisionPatterns(outcomes: any[]): DecisionPattern[] {
  const patterns: Record<string, { freq: number; success: number; examples: string[] }> = {
    'decisive': { freq: 0, success: 0, examples: [] },
    'analytical': { freq: 0, success: 0, examples: [] },
    'impulsive': { freq: 0, success: 0, examples: [] },
    'risk-averse': { freq: 0, success: 0, examples: [] },
    'over-analyzing': { freq: 0, success: 0, examples: [] },
  };

  const styleIndicators: Record<string, string[]> = {
    'decisive': ['decided', 'chose', 'committed', 'took the leap', 'i went for it'],
    'analytical': ['analyzed', 'researched', 'compared', 'weighed', 'evaluated', 'studied'],
    'impulsive': ['felt like', 'on impulse', 'spontaneous', 'right away', 'jumped at'],
    'risk-averse': ['careful', 'hesitant', 'safe option', 'conservative', 'played it safe'],
    'over-analyzing': ['over-thought', 'too much', 'kept thinking', 'couldn\'t decide', 'analysis paralysis'],
  };

  outcomes.forEach((outcome) => {
    const text = outcome.decision_text?.toLowerCase() || '';
    const isSuccess = outcome.outcome === 'positive';

    Object.entries(styleIndicators).forEach(([style, indicators]) => {
      indicators.forEach((indicator) => {
        if (text.includes(indicator)) {
          patterns[style].freq++;
          if (isSuccess) patterns[style].success++;
          if (patterns[style].examples.length < 2) {
            patterns[style].examples.push(outcome.id);
          }
        }
      });
    });
  });

  // Convert to DecisionPattern array
  const result: DecisionPattern[] = Object.entries(patterns)
    .filter(([_, data]) => data.freq > 0)
    .map(([pattern, data]) => ({
      pattern,
      confidence: Math.min(data.freq / outcomes.length, 1),
      frequency: data.freq,
      successRate: data.freq > 0 ? data.success / data.freq : 0,
      examples: data.examples,
    }))
    .sort((a, b) => b.successRate - a.successRate);

  return result;
}

/**
 * Extract impact areas (career, relationships, health, etc.)
 */
function extractImpactAreas(outcomes: any[]): string[] {
  const areas: Record<string, number> = {
    'career': 0,
    'relationships': 0,
    'health': 0,
    'finance': 0,
    'personal growth': 0,
    'family': 0,
  };

  const keywords: Record<string, string[]> = {
    'career': ['job', 'work', 'career', 'industry', 'promotion', 'skills'],
    'relationships': ['partner', 'relationship', 'friends', 'family', 'person', 'social'],
    'health': ['health', 'exercise', 'sleep', 'body', 'mental', 'wellness'],
    'finance': ['money', 'finance', 'salary', 'budget', 'debt', 'invest'],
    'personal growth': ['grow', 'learn', 'develop', 'improve', 'evolve', 'change'],
    'family': ['family', 'parent', 'sibling', 'relative', 'home'],
  };

  outcomes.forEach((outcome) => {
    const text = outcome.decision_text?.toLowerCase() || '';
    Object.entries(keywords).forEach(([area, kws]) => {
      if (kws.some((kw) => text.includes(kw))) {
        areas[area]++;
      }
    });
  });

  return Object.entries(areas)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([area]) => area);
}

/**
 * Analyze patterns conditional on circumstances
 */
function analyzeConditionalPatterns(outcomes: any[]): ConditionalPattern[] {
  const conditions: Record<string, { freq: number; positive: number; neutral: number; negative: number }> = {
    'under stress': { freq: 0, positive: 0, neutral: 0, negative: 0 },
    'with advice': { freq: 0, positive: 0, neutral: 0, negative: 0 },
    'alone': { freq: 0, positive: 0, neutral: 0, negative: 0 },
    'after reflection': { freq: 0, positive: 0, neutral: 0, negative: 0 },
  };

  const conditionKeywords: Record<string, string[]> = {
    'under stress': ['stressed', 'pressure', 'rushed', 'anxious', 'worried'],
    'with advice': ['advice', 'asked', 'consulted', 'discussed', 'others'],
    'alone': ['myself', 'alone', 'independent', 'solo', 'own'],
    'after reflection': ['thought about', 'reflected', 'considered', 'slept on it', 'took time'],
  };

  outcomes.forEach((outcome) => {
    const text = outcome.decision_text?.toLowerCase() || '';
    Object.entries(conditionKeywords).forEach(([condition, keywords]) => {
      if (keywords.some((kw) => text.includes(kw))) {
        conditions[condition].freq++;
        if (outcome.outcome === 'positive') conditions[condition].positive++;
        else if (outcome.outcome === 'neutral') conditions[condition].neutral++;
        else conditions[condition].negative++;
      }
    });
  });

  return Object.entries(conditions)
    .filter(([_, data]) => data.freq > 0)
    .map(([condition, data]) => ({
      condition,
      decisionStyle: 'adaptive', // simplified for MVP
      frequency: data.freq,
      outcomeRate: {
        positive: data.positive / data.freq,
        neutral: data.neutral / data.freq,
        negative: data.negative / data.freq,
      },
    }));
}

/**
 * Predict success of a hypothetical decision
 */
export function predictDecisionSuccess(
  analysis: DecisionAnalysis | null,
  decisionType: string,
  context?: string
): DecisionPrediction {
  if (!analysis) {
    return {
      predictedOutcome: 'uncertain',
      confidence: 0,
      rationale: 'Not enough data',
      successProbability: 50,
    };
  }

  let successRate = analysis.successRate.overall;

  // Adjust based on decision type
  if (decisionType && analysis.successRate.byType[decisionType]) {
    successRate = analysis.successRate.byType[decisionType];
  }

  // Adjust based on context if available
  if (context) {
    const relevantCondition = analysis.conditionalPatterns.find((cp) =>
      context.toLowerCase().includes(cp.condition.toLowerCase())
    );
    if (relevantCondition) {
      successRate = relevantCondition.outcomeRate.positive;
    }
  }

  let predictedOutcome: DecisionPrediction['predictedOutcome'] = 'uncertain';
  if (successRate > 0.65) predictedOutcome = 'positive';
  else if (successRate < 0.4) predictedOutcome = 'risky';

  return {
    predictedOutcome,
    confidence: Math.min(analysis.patterns.length / 10, 1),
    rationale: `Based on ${analysis.patterns.length} past decisions with ${(successRate * 100).toFixed(0)}% success rate`,
    successProbability: Math.round(successRate * 100),
  };
}

/**
 * Find most successful patterns
 */
export function findSuccessfulPatterns(analysis: DecisionAnalysis | null): DecisionPattern[] {
  if (!analysis || analysis.patterns.length === 0) {
    return [];
  }

  return analysis.patterns.filter((p) => p.successRate > 0.6).sort((a, b) => b.successRate - a.successRate);
}

/**
 * Cache analysis in database
 */
export async function cacheDecisionAnalysis(analysis: DecisionAnalysis): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const { error } = await supabase.from('pattern_analysis').insert({
      user_id: analysis.userId,
      analysis_type: 'decision',
      pattern_name: 'full_analysis',
      confidence: 0.85,
      frequency: analysis.patterns.reduce((sum, p) => sum + p.frequency, 0),
      metadata: {
        patterns: analysis.patterns,
        successRate: analysis.successRate,
        conditionalPatterns: analysis.conditionalPatterns,
        impactAreas: analysis.impactAreas,
      },
    });

    if (error) {
      console.error('Error caching analysis:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in cacheDecisionAnalysis:', error);
    return { success: false, error: String(error) };
  }
}

export default {
  analyzeDecisionPatterns,
  predictDecisionSuccess,
  findSuccessfulPatterns,
  cacheDecisionAnalysis,
};

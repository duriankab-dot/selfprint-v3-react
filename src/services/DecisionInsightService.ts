/**
 * DecisionInsightService.ts
 * 
 * Computes decision insights with SLA tracking:
 * - Latency: insights computed within 5s of decision update
 * - Freshness: insights refreshed every 24h or on new data
 * - Coverage: all active decisions must have insights
 */

import type { Decision, DecisionOutcome, DecisionInsights } from '../types/decision';
import { supabase } from './supabase-service';

const SLA = {
  MAX_COMPUTE_TIME_MS: 5000,
  FRESHNESS_HOURS: 24,
  MIN_DECISIONS_FOR_INSIGHT: 3,
};

export interface InsightSLA {
  computedAt: string;
  decisionCount: number;
  coverage: number; // 0-100
  avgLatencyMs: number;
  fresh: boolean;
}

interface InsightResult {
  insights: string[];
  sla: InsightSLA;
}

function computeSuccessRate(decisions: Decision[]): number {
  if (decisions.length === 0) return 0;
  const completed = decisions.filter(d => d.followUps?.some(f => f.completed)).length;
  return Math.round((completed / decisions.length) * 100);
}

function detectDecisionPatterns(decisions: Decision[]): string[] {
  const patterns: string[] = [];
  
  // Group by world
  const byWorld: Record<string, Decision[]> = {};
  for (const d of decisions) {
    byWorld[d.world] = [...(byWorld[d.world] || []), d];
  }
  
  // Find worlds with high success rate
  for (const [world, worldDecisions] of Object.entries(byWorld)) {
    if (worldDecisions.length >= 2) {
      const successRate = computeSuccessRate(worldDecisions);
      if (successRate > 70) {
        patterns.push(`High success rate in ${world} decisions (${successRate}%)`);
      } else if (successRate < 40) {
        patterns.push(`Low success rate in ${world} decisions (${successRate}%) — consider different approach`);
      }
    }
  }
  
  // Check for confidence bias
  const highConfidence = decisions.filter(d => d.confidence && d.confidence > 70).length;
  if (highConfidence > decisions.length * 0.7) {
    patterns.push('Tendency toward high-confidence decisions — consider exploring alternatives');
  }
  
  // Check for recency pattern
  if (decisions.length >= 3) {
    const recent = decisions.slice(0, 3);
    const older = decisions.slice(3);
    const recentRate = computeSuccessRate(recent);
    const olderRate = computeSuccessRate(older);
    if (recentRate > olderRate + 15) {
      patterns.push('Improving decision quality over time');
    } else if (olderRate > recentRate + 15) {
      patterns.push('Declining decision quality — review recent changes');
    }
  }
  
  return patterns;
}

export async function computeDecisionInsights(
  userId: string,
  decisions: Decision[],
  outcomesMap: Map<string, DecisionOutcome[]>
): Promise<InsightResult> {
  const startTime = performance.now();
  
  if (decisions.length < SLA.MIN_DECISIONS_FOR_INSIGHT) {
    return {
      insights: [`Need at least ${SLA.MIN_DECISIONS_FOR_INSIGHT} decisions to generate meaningful insights`],
      sla: {
        computedAt: new Date().toISOString(),
        decisionCount: decisions.length,
        coverage: decisions.length > 0 ? (decisions.length / SLA.MIN_DECISIONS_FOR_INSIGHT) * 100 : 0,
        avgLatencyMs: performance.now() - startTime,
        fresh: true,
      },
    };
  }
  
  const patterns = detectDecisionPatterns(decisions);
  const successRate = computeSuccessRate(decisions);
  
  // Best performing worlds
  const byWorld: Record<string, number[]> = {};
  for (const d of decisions) {
    if (!byWorld[d.world]) byWorld[d.world] = [];
    const outcomes = outcomesMap.get(d.id) || [];
    if (outcomes.length > 0) {
      const positiveCount = outcomes.filter(o => o.impact === 'positive').length;
      byWorld[d.world].push(Math.round((positiveCount / outcomes.length) * 100));
    }
  }
  
  const bestWorlds = Object.entries(byWorld)
    .map(([world, scores]) => ({ world, avgScore: scores.reduce((a, b) => a + b, 0) / scores.length }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3)
    .map(w => w.world);
  
  const insights = [
    `Overall decision success rate: ${successRate}%`,
    ...patterns,
    bestWorlds.length > 0 ? `Best performing areas: ${bestWorlds.join(', ')}` : null,
  ].filter(Boolean) as string[];
  
  const elapsed = performance.now() - startTime;
  
  return {
    insights,
    sla: {
      computedAt: new Date().toISOString(),
      decisionCount: decisions.length,
      coverage: Math.min(100, (decisions.length / SLA.MIN_DECISIONS_FOR_INSIGHT) * 100),
      avgLatencyMs: elapsed,
      fresh: elapsed <= SLA.MAX_COMPUTE_TIME_MS,
    },
  };
}

export async function getStoredInsights(userId: string): Promise<{ insights: DecisionInsights | null; sla: InsightSLA | null }> {
  if (!supabase) {
    return { insights: null, sla: null };
  }
  
  const { data, error } = await supabase
    .from('decision_insights_cache')
    .select('*')
    .eq('user_id', userId)
    .order('computed_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    return { insights: null, sla: null };
  }
  
  const ageHours = (Date.now() - new Date(data.computed_at).getTime()) / (1000 * 60 * 60);
  
  return {
    insights: data.insights as DecisionInsights,
    sla: {
      computedAt: data.computed_at,
      decisionCount: data.decision_count as number,
      coverage: data.coverage as number,
      avgLatencyMs: data.avg_latency_ms as number,
      fresh: ageHours < SLA.FRESHNESS_HOURS,
    } as InsightSLA,
  };
}

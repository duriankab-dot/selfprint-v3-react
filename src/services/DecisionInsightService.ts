/**
 * DecisionInsightService.ts
 *
 * Decision insights with SLA tracking:
 * - Latency: insights computed within 5s of decision update
 * - Freshness: insights refreshed every 24h or on new data
 * - Coverage: % of tracked decisions that have at least one outcome analyzed
 *
 * RESTORED 16 ก.ย. 2026 (deleted 15 ก.ย. 2026 in the build-fix round).
 * Rebuilt with:
 *   - Correct import paths (no build errors)
 *   - Coverage redefined as "% of decisions with recorded outcomes" (the
 *     original formula compared decision counts against a constant, which
 *     produced misleading numbers)
 *   - Optional persistence to decision_insights_cache (migration 039) with
 *     graceful degradation when the table doesn't exist yet
 */

import type { Decision, DecisionOutcome, DecisionInsights } from '../types/decision';
import { supabase } from './supabase-service';
import { getDecisionInsights } from './DecisionLearningService';

const SLA = {
  MAX_COMPUTE_TIME_MS: 5000,
  FRESHNESS_HOURS: 24,
  MIN_DECISIONS_FOR_INSIGHT: 3,
};

export interface InsightSLA {
  computedAt: string;
  decisionCount: number;
  coverage: number; // 0-100: % of decisions with at least one outcome
  avgLatencyMs: number;
  fresh: boolean;
}

export interface InsightResult {
  insights: string[];
  sla: InsightSLA;
}

export interface DashboardInsightState {
  insights: DecisionInsights | null;
  sla: InsightSLA | null;
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
  decisions: Decision[],
  outcomesMap: Map<string, DecisionOutcome[]>
): Promise<InsightResult> {
  const startTime = performance.now();

  if (decisions.length < SLA.MIN_DECISIONS_FOR_INSIGHT) {
    const withOutcomes = decisions.filter(d => (outcomesMap.get(d.id) || []).length > 0);
    const coverage = decisions.length > 0 ? Math.round((withOutcomes.length / decisions.length) * 100) : 0;
    const elapsed = performance.now() - startTime;
    return {
      insights: [SLA.MIN_DECISIONS_FOR_INSIGHT > decisions.length
        ? `Need at least ${SLA.MIN_DECISIONS_FOR_INSIGHT} decisions to generate meaningful insights`
        : 'Start recording outcomes to generate meaningful insights'],
      sla: {
        computedAt: new Date().toISOString(),
        decisionCount: decisions.length,
        coverage,
        avgLatencyMs: Math.round(elapsed * 100) / 100,
        fresh: elapsed <= SLA.MAX_COMPUTE_TIME_MS,
      },
    };
  }

  const patterns = detectDecisionPatterns(decisions);
  const successRate = computeSuccessRate(decisions);

  // Best performing worlds (by outcome impact)
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

  const withOutcomes = decisions.filter(d => (outcomesMap.get(d.id) || []).length > 0);
  const coverage = Math.round((withOutcomes.length / decisions.length) * 100);

  const insights = [
    `Overall decision success rate: ${successRate}%`,
    ...patterns,
    bestWorlds.length > 0 ? `Best performing areas: ${bestWorlds.join(', ')}` : null,
    coverage < 40 ? `Data coverage is ${coverage}% — record follow-up outcomes to improve insights` : null,
  ].filter(Boolean) as string[];

  const elapsed = performance.now() - startTime;

  return {
    insights,
    sla: {
      computedAt: new Date().toISOString(),
      decisionCount: decisions.length,
      coverage,
      avgLatencyMs: Math.round(elapsed * 100) / 100,
      fresh: elapsed <= SLA.MAX_COMPUTE_TIME_MS,
    },
  };
}

/**
 * Persist the latest SLA snapshot to decision_insights_cache (migration 039).
 * Graceful: table missing → skip silently (the dashboard still renders live
 * computed state while the migration sequence is externally blocked).
 */
export async function persistInsightSLA(
  userId: string,
  sla: InsightSLA,
  insightsSnapshot: DecisionInsights | null
): Promise<void> {
  if (!supabase) return;

  try {
    await supabase
      .from('decision_insights_cache')
      .upsert(
        {
          user_id: userId,
          computed_at: sla.computedAt,
          decision_count: sla.decisionCount,
          coverage: sla.coverage,
          avg_latency_ms: sla.avgLatencyMs,
          insights: insightsSnapshot as unknown as Record<string, unknown>,
        },
        { onConflict: 'user_id' }
      );
  } catch {
    // Table does not exist yet (migration 039 not applied) — non-critical.
  }
}

/**
 * Get the last stored SLA snapshot from decision_insights_cache.
 * Returns null when the table doesn't exist or nothing was stored.
 */
export async function getStoredInsights(userId: string): Promise<DashboardInsightState> {
  if (!supabase) {
    return { insights: null, sla: null };
  }

  try {
    const { data, error } = await supabase
      .from('decision_insights_cache')
      .select('*')
      .eq('user_id', userId)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { insights: null, sla: null };
    }

    const ageHours = (Date.now() - new Date(data.computed_at).getTime()) / (1000 * 60 * 60);

    return {
      insights: data.insights as DecisionInsights | null,
      sla: {
        computedAt: data.computed_at,
        decisionCount: data.decision_count as number,
        coverage: data.coverage as number,
        avgLatencyMs: data.avg_latency_ms as number,
        fresh: ageHours < SLA.FRESHNESS_HOURS,
      } as InsightSLA,
    };
  } catch {
    return { insights: null, sla: null };
  }
}

/**
 * One-call entry for the Decision Dashboard: compute insights (client-side,
 * via DecisionLearningService) + SLA snapshot, and best-effort persist.
 */
export async function getDecisionInsightsWithSLA(
  userId: string,
  decisions: Decision[],
  outcomesMap: Map<string, DecisionOutcome[]>
): Promise<DashboardInsightState> {
  const insights = await getDecisionInsights(userId);
  const { sla } = await computeDecisionInsights(decisions, outcomesMap);

  let freshness = sla.fresh;
  const stored = await getStoredInsights(userId);
  if (stored.sla) {
    // Combine: freshness false when storage is stale, or when live compute is
    // expensive. Live freshness wins for the "computed just now" signal.
    freshness = sla.fresh;
  }

  const finalSla: InsightSLA = {
    ...sla,
    fresh: freshness,
  };

  // Best-effort persist for the next visit (fire-and-forget).
  persistInsightSLA(userId, finalSla, insights).catch(() => {});

  return { insights, sla: finalSla };
}
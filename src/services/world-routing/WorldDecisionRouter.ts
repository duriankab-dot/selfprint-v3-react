/**
 * WorldDecisionRouter.ts
 * Track decisions and outcomes per world
 * Twin learns differently in each world
 *
 * P0 #5: World Routing - Per-World Decision Logic
 */

import { supabase } from '../supabase-service';
import type { WorldId } from '../../constants/worlds';

export interface WorldDecisionRecord {
  id: string;
  twinId: string;
  world: WorldId;
  title: string;
  description?: string;
  createdAt: string;
  outcomeAt?: string;
  impact?: 'positive' | 'neutral' | 'negative';
}

export interface WorldSuccessMetrics {
  world: WorldId;
  totalDecisions: number;
  successfulDecisions: number;
  successRate: number; // 0-100
  averageConfidence: number;
  patternCount: number;
}

/**
 * Record a decision made in a specific world
 */
export async function recordWorldDecision(
  twinId: string,
  world: WorldId,
  decision: {
    title: string;
    description?: string;
  }
): Promise<void> {
  if (!supabase) return;

  try {
    // Record to decisions table with world context
    const { error } = await supabase
      .from('decisions')
      .insert({
        twin_id: twinId,
        world,
        title: decision.title,
        description: decision.description,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error recording world decision:', error);
      return;
    }

    // Track world interaction
    await recordWorldInteractionFromDecision(twinId, world);
  } catch (err) {
    console.error('World decision recording failed:', err);
  }
}

/**
 * Get decision history for a specific world
 */
export async function getWorldDecisionHistory(
  twinId: string,
  world: WorldId,
  limit: number = 20
): Promise<WorldDecisionRecord[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('decisions')
      .select('id, twin_id, world, title, description, created_at')
      .eq('twin_id', twinId)
      .eq('world', world)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      twinId: d.twin_id,
      world: d.world,
      title: d.title,
      description: d.description,
      createdAt: d.created_at,
    }));
  } catch (err) {
    console.error('Error fetching world decision history:', err);
    return [];
  }
}

/**
 * Analyze decision patterns specific to a world
 */
export async function analyzeWorldDecisionPatterns(
  twinId: string,
  world: WorldId
): Promise<Array<{ pattern: string; successRate: number; count: number }>> {
  if (!supabase) return [];

  try {
    // Fetch patterns for this world
    const { data: patterns, error } = await supabase
      .from('decision_patterns')
      .select('pattern, success_rate, confidence')
      .eq('twin_id', twinId)
      .eq('world', world)
      .order('success_rate', { ascending: false })
      .limit(5);

    if (error || !patterns) return [];

    // Count occurrences of each pattern
    return patterns.map((p: any) => ({
      pattern: p.pattern,
      successRate: p.success_rate || 0,
      count: 1, // Would need to query more details for actual count
    }));
  } catch (err) {
    console.error('Error analyzing world patterns:', err);
    return [];
  }
}

/**
 * Get success metrics for a world
 */
export async function getWorldSuccessMetrics(
  twinId: string,
  world: WorldId
): Promise<WorldSuccessMetrics> {
  if (!supabase) {
    return getDefaultMetrics(world);
  }

  try {
    // Get all decisions in this world
    const { data: decisions } = await supabase
      .from('decisions')
      .select('id')
      .eq('twin_id', twinId)
      .eq('world', world);

    const totalDecisions = decisions?.length || 0;

    if (totalDecisions === 0) {
      return getDefaultMetrics(world);
    }

    // Get outcomes for decisions in this world
    const { data: outcomes } = await supabase
      .from('decision_outcomes')
      .select('impact')
      .in('decision_id', (decisions || []).map((d: any) => d.id));

    let successfulDecisions = 0;
    if (outcomes) {
      successfulDecisions = outcomes.filter(
        (o: any) => o.impact === 'positive' || o.impact === 'neutral'
      ).length;
    }

    // Get patterns for confidence
    const { data: patterns } = await supabase
      .from('decision_patterns')
      .select('id')
      .eq('twin_id', twinId)
      .eq('world', world);

    const patternCount = patterns?.length || 0;

    return {
      world,
      totalDecisions,
      successfulDecisions,
      successRate: totalDecisions > 0 ? (successfulDecisions / totalDecisions) * 100 : 0,
      averageConfidence: 50 + (patternCount * 10), // Confidence increases with patterns
      patternCount,
    };
  } catch (err) {
    console.error('Error getting world success metrics:', err);
    return getDefaultMetrics(world);
  }
}

/**
 * Recommend next action based on world decision history
 */
export async function recommendWorldAction(
  twinId: string,
  world: WorldId
): Promise<string> {
  if (!supabase) return getDefaultRecommendation(world);

  try {
    // Get success metrics
    const metrics = await getWorldSuccessMetrics(twinId, world);

    // Get patterns
    const patterns = await analyzeWorldDecisionPatterns(twinId, world);

    // Generate recommendation based on metrics
    if (metrics.totalDecisions === 0) {
      return `Start making intentional decisions in your ${world} world`;
    }

    if (metrics.successRate > 70 && patterns.length > 0) {
      return `You're excelling in ${world} — build on your successful patterns`;
    }

    if (metrics.successRate < 50) {
      return `Reflect on what's not working in ${world} decisions — seek new approaches`;
    }

    if (patterns.length > 0) {
      return `Continue applying your proven ${world} patterns`;
    }

    return `Keep building experience in your ${world} world`;
  } catch (err) {
    console.error('Error generating world recommendation:', err);
    return getDefaultRecommendation(world);
  }
}

/**
 * Record that Twin interacted in a world (for expertise tracking)
 */
async function recordWorldInteractionFromDecision(
  twinId: string,
  world: WorldId
): Promise<void> {
  if (!supabase) return;

  try {
    // Import and use from WorldExpertiseService
    const { recordWorldInteraction } = await import('../WorldExpertiseService');
    await recordWorldInteraction(twinId, world, 5); // Small expertise gain per decision
  } catch (err) {
    console.error('Error recording world interaction:', err);
  }
}

/**
 * Get default metrics (for errors or no data)
 */
function getDefaultMetrics(world: WorldId): WorldSuccessMetrics {
  return {
    world,
    totalDecisions: 0,
    successfulDecisions: 0,
    successRate: 0,
    averageConfidence: 50,
    patternCount: 0,
  };
}

/**
 * Get default recommendation
 */
function getDefaultRecommendation(world: WorldId): string {
  const recommendations: Record<WorldId, string> = {
    self: 'Explore your inner world with intentional reflection',
    mind: 'Engage your intellect with new learning',
    relationship: 'Nurture your connections with others',
    love: 'Open your heart to authentic connection',
    career: 'Take strategic action in your professional growth',
    wealth: 'Build financial wisdom step by step',
    life: 'Live with intention and balance',
    growth: 'Push toward your potential',
    decision: 'Practice thoughtful decision-making',
    purpose: 'Clarify what matters most',
    wellbeing: 'Invest in your health and vitality',
    future: 'Take steps toward your vision',
  };

  return recommendations[world] || `Explore your ${world} world`;
}

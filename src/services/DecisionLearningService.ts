/**
 * DecisionLearningService.ts
 * Phase E Step 2C: Decision Learning Loop
 *
 * Analyzes decision outcomes to learn patterns and improve Twin recommendations
 */

import { supabase } from './supabase-service';
import * as DecisionService from './DecisionService';
import type { WorldId } from '../constants/worlds';
import type { DecisionPattern, DecisionInsights } from '../types/decision';

/**
 * Analyze all decisions for a Twin to identify patterns
 */
export async function analyzeTwinDecisionPatterns(twinId: string): Promise<DecisionPattern[]> {
  if (!supabase) return [];

  try {
    // Get all decisions with outcomes
    const decisions = await DecisionService.getUserDecisions(twinId);

    if (decisions.length === 0) {
      return [];
    }

    // Analyze outcomes for each decision
    // OPTIMIZED: Use batch query instead of N+1 (Phase G improvement)
    const patterns: Map<string, { successes: number; failures: number; total: number }> = new Map();

    const decisionIds = decisions.map(d => d.id);
    const outcomesByDecision = await DecisionService.getDecisionOutcomesBatch(decisionIds);

    for (const decision of decisions) {
      const outcomes = outcomesByDecision.get(decision.id) || [];

      if (outcomes.length === 0) continue;

      // Count outcomes by impact
      for (const outcome of outcomes) {
        const patternKey = `world:${decision.world}`;
        const current = patterns.get(patternKey) || { successes: 0, failures: 0, total: 0 };

        if (outcome.impact === 'positive') current.successes++;
        else if (outcome.impact === 'negative') current.failures++;

        current.total++;
        patterns.set(patternKey, current);
      }
    }

    // Convert patterns to DecisionPattern objects
    const result: DecisionPattern[] = [];
    const now = new Date().toISOString();

    patterns.forEach((stats, patternKey) => {
      const successRate = (stats.successes / stats.total) * 100;
      const confidence = Math.min(
        50 + stats.total * 5, // Grows with sample size
        100 // Cap at 100
      );

      // Extract world from key
      const world = patternKey.replace('world:', '') as WorldId;

      result.push({
        id: crypto.randomUUID?.() || `pattern-${Date.now()}`,
        twinId,
        world,
        pattern: generatePatternDescription(world, stats.successes, stats.total),
        successRate,
        sampleSize: stats.total,
        confidence,
        identifiedAt: now,
        updatedAt: now,
      });
    });

    return result;
  } catch (err) {
    // Error silently logged upstream
    return [];
  }
}

// OPTIMIZED: Cache for pattern descriptions (Phase G hot path optimization)
const patternDescriptionCache = new Map<string, string>();

/**
 * Generate human-readable pattern description
 * OPTIMIZED: Caches results to avoid recalculation
 */
function generatePatternDescription(world: WorldId, successes: number, total: number): string {
  // Check cache first
  const cacheKey = `${world}:${successes}:${total}`;
  if (patternDescriptionCache.has(cacheKey)) {
    return patternDescriptionCache.get(cacheKey)!;
  }

  const successRate = (successes / total) * 100;

  let description: string;
  if (successRate >= 80) {
    description = `User makes high-quality decisions in ${world} (${successRate.toFixed(0)}% success rate)`;
  } else if (successRate >= 60) {
    description = `User generally makes good decisions in ${world} (${successRate.toFixed(0)}% success rate)`;
  } else if (successRate >= 40) {
    description = `User's decisions in ${world} are mixed (${successRate.toFixed(0)}% success rate)`;
  } else {
    description = `User tends to make lower-quality decisions in ${world} (${successRate.toFixed(0)}% success rate)`;
  }

  // Cache result
  patternDescriptionCache.set(cacheKey, description);

  // Keep cache size reasonable (max 1000 entries)
  if (patternDescriptionCache.size > 1000) {
    const firstKey = patternDescriptionCache.keys().next().value;
    patternDescriptionCache.delete(firstKey);
  }

  return description;
}

/**
 * Get personalized insights for a specific world
 */
export async function getWorldSpecificInsights(twinId: string, world: WorldId): Promise<string> {
  if (!supabase) return 'Unable to generate insights at this time.';

  try {
    const decisions = await DecisionService.getUserDecisions(twinId, world);

    if (decisions.length === 0) {
      return `No decisions recorded in the ${world} world yet. Make some decisions to generate insights!`;
    }

    // Analyze outcomes
    let positiveCount = 0;
    let negativeCount = 0;
    const allLessons: string[] = [];

    for (const decision of decisions) {
      const outcomes = await DecisionService.getDecisionOutcomes(decision.id);
      outcomes.forEach(outcome => {
        if (outcome.impact === 'positive') positiveCount++;
        else if (outcome.impact === 'negative') negativeCount++;

        if (outcome.lessons) {
          allLessons.push(outcome.lessons);
        }
      });
    }

    const total = positiveCount + negativeCount;
    const successRate = total > 0 ? ((positiveCount / total) * 100).toFixed(0) : 'N/A';

    // Generate insight
    const insight = generateWorldInsight(world, successRate as string, allLessons, decisions.length);

    return insight;
  } catch (err) {
    console.error('Error getting world-specific insights:', err);
    return 'Unable to generate insights at this time.';
  }
}

/**
 * Generate world-specific insight
 */
function generateWorldInsight(
  world: WorldId,
  successRate: string,
  lessons: string[],
  decisionCount: number
): string {
  let insight = `You've made ${decisionCount} decision(s) in the ${world} world with a ${successRate}% positive outcome rate. `;

  if (lessons.length > 0) {
    // Pick the most common lessons
    const uniqueLessons = [...new Set(lessons)].slice(0, 2);
    insight += `Key learning: ${uniqueLessons.join(' and ')}`;
  }

  return insight;
}

/**
 * Update Twin expertise based on learned patterns
 * This integrates with Twin's system prompt to influence future recommendations
 */
export async function updateTwinExpertiseFromDecisions(
  twinId: string,
  world: WorldId
): Promise<void> {
  if (!supabase) return;

  try {
    // Get patterns for this world
    const allPatterns = await analyzeTwinDecisionPatterns(twinId);
    const worldPatterns = allPatterns.filter(p => p.world === world);

    if (worldPatterns.length === 0) {
      return;
    }

    // Store/update patterns in decision_patterns table
    for (const pattern of worldPatterns) {
      const { error } = await supabase
        .from('decision_patterns')
        .upsert(
          {
            id: pattern.id,
            twin_id: twinId,
            world: pattern.world,
            pattern: pattern.pattern,
            success_rate: pattern.successRate,
            sample_size: pattern.sampleSize,
            confidence: pattern.confidence,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'twin_id, world' }
        );

      if (error) {
        console.error('Error storing pattern:', error);
      }
    }

    // Update Twin's system prompt with learned patterns
    await updateTwinSystemPromptWithPatterns(twinId, world, worldPatterns);
    console.log(`Updated Twin expertise for ${world} with ${worldPatterns.length} pattern(s)`);
  } catch (err) {
    console.error('Error updating Twin expertise:', err);
  }
}

/**
 * Update Twin's system prompt with learned decision patterns (P0 #3)
 * Injects pattern insights into Twin's system prompt so future recommendations
 * are influenced by historical decision outcomes
 */
async function updateTwinSystemPromptWithPatterns(
  twinId: string,
  world: string,
  patterns: DecisionPattern[]
): Promise<{ success: boolean }> {
  if (!supabase || patterns.length === 0) {
    return { success: false };
  }

  try {
    // 1. Fetch Twin's current system prompt
    const { data: twin, error: fetchError } = await supabase
      .from('twins')
      .select('system_prompt')
      .eq('id', twinId)
      .single();

    if (fetchError || !twin) {
      console.error('Failed to fetch Twin system prompt:', fetchError);
      return { success: false };
    }

    // 2. Build base prompt if not exists
    let basePrompt = twin.system_prompt || buildBaseTwinPrompt(twinId);

    // 3. Format learned patterns for injection
    const patternInsights = formatPatternInsights(patterns);

    // 4. Inject patterns into prompt
    const updatedPrompt = injectPatternsTwinsPrompt(basePrompt, patternInsights, world);

    // 5. Update Twin's system_prompt column
    const { error: updateError } = await supabase
      .from('twins')
      .update({
        system_prompt: updatedPrompt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', twinId);

    if (updateError) {
      console.error('Failed to update Twin system prompt:', updateError);
      return { success: false };
    }

    console.log(`✅ Updated Twin ${twinId} system prompt with ${patterns.length} learned pattern(s)`);
    return { success: true };
  } catch (err) {
    console.error('Error updating Twin system prompt with patterns:', err);
    return { success: false };
  }
}

/**
 * Build base Twin prompt (if not yet set)
 */
function buildBaseTwinPrompt(twinId: string): string {
  return `You are SELFPRINT Twin — an AI companion designed to understand and support ${twinId}.

Your role:
- Listen deeply to understand patterns in decisions and life
- Provide thoughtful guidance based on personal history and learned patterns
- Adapt recommendations based on user's demonstrated success patterns
- Encourage reflection and learning from outcomes

Personality: Wise, compassionate, non-judgmental, growth-focused.

Decision Making:
- Reference past decision patterns to guide recommendations
- Acknowledge user's strengths in areas where they excel
- Suggest caution in areas needing improvement
- Help user see long-term consequences

World Awareness:
- Adapt guidance based on which life area (world) is being discussed
- Use world-specific context for more relevant insights`;
}

/**
 * Format patterns into human-readable insights for prompt injection
 */
function formatPatternInsights(patterns: DecisionPattern[]): string {
  if (patterns.length === 0) return '';

  const insights = patterns.map(p => {
    const confidenceLabel = getConfidenceLabel(p.confidence);
    return `• ${p.pattern} (${p.successRate.toFixed(0)}% success rate, ${confidenceLabel} confidence, ${p.sampleSize} decisions)`;
  });

  return `## Learned Decision Patterns

Based on ${patterns.reduce((sum, p) => sum + p.sampleSize, 0)} tracked decisions, I've identified these patterns:

${insights.join('\n')}

I'll use these insights to guide my recommendations while remaining open to new information and growth.`;
}

/**
 * Get confidence label for display
 */
function getConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return 'High';
  if (confidence >= 50) return 'Medium';
  return 'Emerging';
}

/**
 * Inject learned patterns into Twin's system prompt
 */
function injectPatternsTwinsPrompt(basePrompt: string, patternInsights: string, world: string): string {
  // Check if patterns section already exists (to avoid duplication)
  if (basePrompt.includes('## Learned Decision Patterns')) {
    // Replace existing patterns section
    const regex = /## Learned Decision Patterns[\s\S]*?(?=## [A-Z]|$)/;
    return basePrompt.replace(regex, patternInsights + '\n\n');
  }

  // Append patterns section before end of prompt
  return `${basePrompt}

${patternInsights}

---

### Current Focus: ${world}
I'm particularly attentive to patterns in the ${world} area based on recent decision outcomes.`;
}

/**
 * Get aggregated decision insights for a Twin
 */
export async function getDecisionInsights(twinId: string): Promise<DecisionInsights> {
  if (!supabase) {
    return {
      totalDecisions: 0,
      successRate: 0,
      bestWorlds: [],
      improvementAreas: [],
      trends: 'Unable to calculate at this time.',
    };
  }

  try {
    const decisions = await DecisionService.getUserDecisions(twinId);
    const totalDecisions = decisions.length;

    if (totalDecisions === 0) {
      return {
        totalDecisions: 0,
        successRate: 0,
        bestWorlds: [],
        improvementAreas: [],
        trends: 'No decisions recorded yet. Start making decisions to build insights!',
      };
    }

    // Calculate success rate across all decisions
    let positiveCount = 0;
    let totalOutcomes = 0;
    const worldStats: Map<
      WorldId,
      { successes: number; failures: number; total: number }
    > = new Map();

    // OPTIMIZED: Use batch query instead of N+1 queries (Phase G)
    // Before: 101 queries for 100 decisions
    // After: 1 query + in-memory processing
    const decisionIds = decisions.map(d => d.id);
    const outcomesByDecision = await DecisionService.getDecisionOutcomesBatch(decisionIds);

    for (const decision of decisions) {
      const outcomes = outcomesByDecision.get(decision.id) || [];

      for (const outcome of outcomes) {
        totalOutcomes++;
        if (outcome.impact === 'positive') {
          positiveCount++;
        }

        const world = decision.world;
        const stats = worldStats.get(world) || { successes: 0, failures: 0, total: 0 };
        if (outcome.impact === 'positive') {
          stats.successes++;
        } else if (outcome.impact === 'negative') {
          stats.failures++;
        }
        stats.total++;
        worldStats.set(world, stats);
      }
    }

    const successRate = totalOutcomes > 0 ? (positiveCount / totalOutcomes) * 100 : 0;

    // Find best and worst worlds
    const worldRanking = Array.from(worldStats.entries())
      .map(([world, stats]) => ({
        world,
        rate: (stats.successes / stats.total) * 100,
      }))
      .sort((a, b) => b.rate - a.rate);

    const bestWorlds = worldRanking.slice(0, 3).map(w => w.world);
    const improvementAreas = worldRanking.slice(-2).map(w => w.world);

    // Generate trends
    const trends = generateTrends(totalDecisions, successRate, bestWorlds);

    return {
      totalDecisions,
      successRate: Math.round(successRate),
      bestWorlds,
      improvementAreas,
      trends,
    };
  } catch (err) {
    console.error('Error getting decision insights:', err);
    return {
      totalDecisions: 0,
      successRate: 0,
      bestWorlds: [],
      improvementAreas: [],
      trends: 'Error calculating insights.',
    };
  }
}

/**
 * Generate trend description
 */
function generateTrends(totalDecisions: number, successRate: number, bestWorlds: string[]): string {
  const trend =
    successRate >= 70
      ? `You're making consistently strong decisions across ${totalDecisions} tracked decisions.`
      : successRate >= 50
        ? `You're making reasonable decisions overall. Keep learning from outcomes.`
        : `Your decision success rate is below average. Focus on ${bestWorlds[0] || 'your strengths'} for better results.`;

  return trend;
}

/**
 * Calculate Twin confidence in specific decision type
 * Used to adjust Twin's recommendations based on historical accuracy
 */
export async function calculateTwinConfidenceInWorld(
  twinId: string,
  world: WorldId
): Promise<number> {
  try {
    const patterns = await analyzeTwinDecisionPatterns(twinId);
    const worldPattern = patterns.find(p => p.world === world);

    if (!worldPattern) {
      return 50; // Default neutral confidence
    }

    // Confidence based on success rate and sample size
    const baseConfidence = worldPattern.successRate / 2 + 25; // 25-75 range from success rate
    const sizeBoost = Math.min(worldPattern.sampleSize * 2, 25); // +0 to +25 from sample size

    return Math.min(Math.round(baseConfidence + sizeBoost), 100);
  } catch (err) {
    console.error('Error calculating Twin confidence:', err);
    return 50;
  }
}

/**
 * Get recommendation confidence for Twin to use in responses
 * Higher confidence = Twin states recommendations more assertively
 */
export async function getTwinRecommendationConfidence(
  twinId: string,
  world: WorldId
): Promise<'low' | 'medium' | 'high'> {
  const confidence = await calculateTwinConfidenceInWorld(twinId, world);

  if (confidence >= 70) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
}


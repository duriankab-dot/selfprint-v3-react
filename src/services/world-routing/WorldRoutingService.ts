/**
 * WorldRoutingService.ts
 * Main orchestrator for world context routing
 * Routes user input to world-specific Twin expertise
 *
 * P0 #5: World Routing - Core Service
 */

import { supabase } from '../supabase-service';
import { getWorldPrompt, getWorldConfig } from '../world-prompts/WorldExpertPrompts';
import { getWorldExpertiseScore, inferMoodFromWorld } from '../WorldExpertiseService';
import { SICEOrchestrator } from '../sice/SICEOrchestrator';
import type { WorldId } from '../../constants/worlds';
import type { SICEInput, SICEOutput } from '../../types/sice';

export interface WorldContext {
  worldId: WorldId;
  worldName: string;
  expertPrompt: string;
  twinMood: string;
  expertiseScore: number; // 0-100
  confidenceModifier: number; // multiplier for confidence
  interactionCount: number;
}

export interface WorldRoutedInput extends SICEInput {
  world: WorldId;
  worldContext?: WorldContext;
}

export interface WorldRoutedOutput extends SICEOutput {
  worldId: WorldId;
  worldContext?: WorldContext;
}

/**
 * Route input to world-specific Twin expertise
 */
export async function routeToWorld(
  input: SICEInput,
  currentWorld: WorldId
): Promise<WorldRoutedOutput> {
  try {
    const startTime = performance.now();

    // Get world context (expertise, mood, prompt)
    const worldContext = await getWorldContext(input.userId, currentWorld);

    // Build world-enhanced SICE input
    const worldInput: SICEInput = {
      ...input,
      currentWorld,
      userContext: {
        ...(input.userContext ?? {}),
        worldExpertiseScore: worldContext.expertiseScore,
        worldMood: worldContext.twinMood,
        worldInteractionCount: worldContext.interactionCount,
      },
    };

    // Call real SICE orchestrator with world context
    const orchestrator = new SICEOrchestrator();
    const orchestratorResult = await orchestrator.orchestrate(worldInput);

    // Apply world confidence modifier to orchestrator confidence
    const rawConfidence = orchestratorResult.personalIntelligence.confidence;
    const adjustedConfidence = Math.min(
      100,
      Math.round(rawConfidence * worldContext.confidenceModifier)
    );

    const executionTime = Math.round(performance.now() - startTime);

    const output: WorldRoutedOutput = {
      engineId: 0,
      engineName: 'WorldRouter',
      result: orchestratorResult,
      confidence: adjustedConfidence,
      executionTime,
      worldId: currentWorld,
      worldContext,
    };

    return output;
  } catch (err) {
    console.error('World routing failed:', err);
    return getDefaultRoutedOutput(currentWorld);
  }
}

/**
 * Get complete world context for routing
 */
export async function getWorldContext(
  userId: string,
  worldId: WorldId
): Promise<WorldContext> {
  try {
    if (!supabase) {
      return getDefaultWorldContext(worldId);
    }

    // Get Twin
    const { data: twin } = await supabase
      // TWINS406-001 FIX: .single() throws 406 when the user has no Twin
      // yet — a normal state pre-awakening. .maybeSingle() returns null.
      .from('twins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!twin) {
      return getDefaultWorldContext(worldId);
    }

    // Get expertise score for this world
    const expertiseScore = await getWorldExpertiseScore(twin.id, worldId);

    // Get world preferences (including interaction count)
    const { data: expertise } = await supabase
      .from('twin_world_expertise')
      .select('interaction_count')
      .eq('twin_id', twin.id)
      .eq('world', worldId)
      .maybeSingle();

    const interactionCount = expertise?.interaction_count || 0;

    // Get world config
    const config = getWorldConfig(worldId);
    const expertPrompt = getWorldPrompt(worldId);
    const twinMood = inferMoodFromWorld(worldId);

    // Calculate confidence modifier based on expertise
    // Higher expertise = higher confidence modifier
    const confidenceModifier = 0.8 + (expertiseScore / 100) * 0.4; // 0.8-1.2x

    return {
      worldId,
      worldName: config?.name || worldId,
      expertPrompt,
      twinMood,
      expertiseScore,
      confidenceModifier,
      interactionCount,
    };
  } catch (err) {
    console.error('Error getting world context:', err);
    return getDefaultWorldContext(worldId);
  }
}

/**
 * Analyze Twin's world expertise and infer strongest world
 */
export async function analyzeTwinWorldExpertise(
  userId: string
): Promise<{ dominantWorld: WorldId; expertise: Record<WorldId, number> }> {
  try {
    if (!supabase) {
      return { dominantWorld: 'self', expertise: {} as Record<WorldId, number> };
    }

    // Get Twin
    const { data: twin } = await supabase
      // TWINS406-001 FIX: .single() throws 406 when the user has no Twin
      // yet — a normal state pre-awakening. .maybeSingle() returns null.
      .from('twins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!twin) {
      return { dominantWorld: 'self', expertise: {} as Record<WorldId, number> };
    }

    // Get all world expertise
    const { data: expertise } = await supabase
      .from('twin_world_expertise')
      .select('world, expertise_score')
      .eq('twin_id', twin.id);

    if (!expertise || expertise.length === 0) {
      return { dominantWorld: 'self', expertise: {} as Record<WorldId, number> };
    }

    // Build expertise map and find dominant
    const expertiseMap = {} as Record<WorldId, number>;
    let dominantWorld: WorldId = 'self';
    let maxScore = 0;

    expertise.forEach((e: any) => {
      const world = e.world as WorldId;
      const score = e.expertise_score || 50;
      expertiseMap[world] = score;

      if (score > maxScore) {
        maxScore = score;
        dominantWorld = world;
      }
    });

    return { dominantWorld, expertise: expertiseMap };
  } catch (err) {
    console.error('Error analyzing world expertise:', err);
    return { dominantWorld: 'self', expertise: {} as Record<WorldId, number> };
  }
}

/**
 * Record interaction in a world and update expertise
 */
export async function recordWorldInteraction(
  userId: string,
  worldId: WorldId,
  expertiseGain: number = 5
): Promise<void> {
  try {
    if (!supabase) return;

    // Get Twin
    const { data: twin } = await supabase
      // TWINS406-001 FIX: .single() throws 406 when the user has no Twin
      // yet — a normal state pre-awakening. .maybeSingle() returns null.
      .from('twins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!twin) return;

    // Import and use the function from WorldExpertiseService
    const { recordWorldInteraction: recordInteraction } = await import('../WorldExpertiseService');
    await recordInteraction(twin.id, worldId, expertiseGain);

    // Also update user's world preferences
    const { data: prefs } = await supabase
      .from('world_preferences')
      .select('id')
      .eq('user_id', userId)
      .eq('world_id', worldId)
      .maybeSingle();

    if (prefs) {
      // Update last accessed
      await supabase
        .from('world_preferences')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', prefs.id);
    } else {
      // Create new preference
      await supabase
        .from('world_preferences')
        .insert({
          user_id: userId,
          world_id: worldId,
          is_favorite: false,
          engagement_score: 0,
          last_accessed: new Date().toISOString(),
        });
    }
  } catch (err) {
    console.error('Error recording world interaction:', err);
  }
}

/**
 * Get default world context (for when Supabase unavailable)
 */
function getDefaultWorldContext(worldId: WorldId): WorldContext {
  const config = getWorldConfig(worldId);
  return {
    worldId,
    worldName: config?.name || worldId,
    expertPrompt: getWorldPrompt(worldId),
    twinMood: inferMoodFromWorld(worldId),
    expertiseScore: 50, // Default neutral
    confidenceModifier: 1.0,
    interactionCount: 0,
  };
}

/**
 * Get default routed output (for errors)
 */
function getDefaultRoutedOutput(worldId: WorldId): WorldRoutedOutput {
  return {
    engineId: 0,
    engineName: 'WorldRouter',
    result: { error: 'World routing unavailable' },
    confidence: 50,
    executionTime: 10,
    worldId,
  };
}

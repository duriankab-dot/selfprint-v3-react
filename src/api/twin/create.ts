/**
 * api/twin/create.ts
 * Twin creation API endpoint
 * Handles: profile creation, initial personality seed, memory setup
 */

import { supabase } from '../../lib/supabase/client';
import type { WorldId } from '../../constants/worlds';

const ALL_WORLDS: WorldId[] = [
  'self', 'mind', 'relationship', 'love', 'career', 'wealth',
  'life', 'growth', 'decision', 'purpose', 'wellbeing', 'future',
];

export interface TwinCreationRequest {
  userId: string;
  twinName: string;
  birthData?: {
    date?: string; // YYYY-MM-DD
    time?: string; // HH:MM
    timezone?: string;
  };
  personalityEssence?: string; // Generated from SICE
}

export interface TwinCreationResponse {
  success: boolean;
  twinId: string;
  twinProfile: {
    id: string;
    userId: string;
    name: string;
    stage: number;
    awakened_at: string;
    personality?: Record<string, unknown>;
    created_at: string;
  };
  initialSeed?: Record<string, unknown>;
  session?: {
    sessionId: string;
    startedAt: string;
  };
  message: string;
}

/**
 * Create Twin profile and initialize system
 * Called after user completes Core Awakening ceremony
 */
export async function createTwin(
  request: TwinCreationRequest
): Promise<TwinCreationResponse> {
  const { userId, twinName, personalityEssence } = request;

  if (!userId || !twinName) {
    throw new Error('userId and twinName are required');
  }

  const now = new Date().toISOString();

  // 1. Insert into twins table
  const { data: twin, error: twinErr } = await supabase
    .from('twins')
    .insert({
      user_id: userId,
      name: twinName,
      stage: 1,
      awakened_at: now,
      personality_essence: personalityEssence || null,
      created_at: now,
      updated_at: now,
    })
    .select('id, name, stage, awakened_at, created_at')
    .single();

  if (twinErr) {
    throw new Error(`Failed to create Twin: ${twinErr.message}`);
  }

  const twinId = twin.id;

  // 2. Create birth memory in twin_memories
  await supabase.from('twin_memories').insert({
    twin_id: twinId,
    type: 'birth',
    content: `I was born as ${twinName}. This is the beginning of our journey together. I exist to understand you deeply and guide you through all 12 worlds of your life.`,
    emotional_valence: 1.0, // Birth is a positive moment
    created_at: now,
  });

  // 3. Initialize world_stats for all 12 worlds (enables TwinStateEngine maturity scoring from day 1)
  const worldStatsRows = ALL_WORLDS.map((worldId) => ({
    user_id: userId,
    world_id: worldId,
    visits_count: 0,
    journal_entries: 0,
    decisions_made: 0,
    insights_gained: 0,
    time_spent_minutes: 0,
    last_accessed: now,
  }));

  await supabase
    .from('world_stats')
    .upsert(worldStatsRows, { onConflict: 'user_id,world_id' });

  return {
    success: true,
    twinId,
    twinProfile: {
      id: twinId,
      userId,
      name: twin.name,
      stage: twin.stage,
      awakened_at: twin.awakened_at,
      personality: personalityEssence ? { essence: personalityEssence } : undefined,
      created_at: twin.created_at,
    },
    initialSeed: {
      contextScore: 0.8,
      emotionalResonance: 0.9,
      growthPotential: 0.95,
    },
    session: {
      sessionId: `session_${Date.now()}`,
      startedAt: now,
    },
    message: `Twin "${twinName}" created successfully`,
  };
}

/**
 * Create first Twin memory entry
 * Records the moment Twin was born
 */
export async function createFirstMemory(
  twinId: string,
  twinName: string
): Promise<{ success: boolean; memoryId?: string; message: string }> {
  if (!twinId || !twinName) {
    throw new Error('twinId and twinName are required');
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('twin_memories')
    .insert({
      twin_id: twinId,
      type: 'birth',
      content: `I was born as ${twinName}. This is the beginning of our journey together.`,
      emotional_valence: 1.0,
      created_at: now,
    })
    .select('id')
    .single();

  if (error) {
    return {
      success: false,
      message: `Memory creation failed: ${error.message}`,
    };
  }

  return {
    success: true,
    memoryId: data.id,
    message: `First memory created for ${twinName}`,
  };
}

/**
 * Generate Twin personality from SICE results
 * Called after 12 SICE orchestration completes
 */
export async function generatePersonality(siceResults: Record<string, unknown>): Promise<{
  essence: string;
  archetypes: string[];
  strengths: string[];
  growthAreas: string[];
}> {
  // Extract key traits from SICE result structure
  const personalIntelligence = (siceResults as any)?.personalIntelligence;
  const synthesis = (siceResults as any)?.synthesis;

  const insights: string[] = personalIntelligence?.insights || [];
  const themes: string[] = synthesis?.themes || [];
  const nextSteps: string[] = personalIntelligence?.nextStepsSuggested || [];

  // Derive archetypes from top themes
  const archetypes = themes.slice(0, 2);

  // Strengths = positive insights
  const strengths = insights
    .filter((i: string) => !i.toLowerCase().includes('improve') && !i.toLowerCase().includes('challenge'))
    .slice(0, 3);

  // Growth areas from warnings and next steps
  const growthAreas = [
    ...(personalIntelligence?.warningsOrCautions || []),
    ...nextSteps,
  ].slice(0, 3);

  const essence = personalIntelligence?.recommendedAction
    ? `${personalIntelligence.recommendedAction}. Themes: ${themes.slice(0, 2).join(', ')}.`
    : `Emerging Twin personality with ${themes.length} identified themes.`;

  return {
    essence,
    archetypes,
    strengths,
    growthAreas,
  };
}

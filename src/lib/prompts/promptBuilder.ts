/**
 * promptBuilder.ts
 * P0-F: Canonical Prompt Builder System
 *
 * Unified entry point for all AI prompt construction in Selfprint V3.
 * Replaces ad-hoc string assembly scattered across services.
 *
 * Architecture (V5 §29 Modular Prompt):
 *   CORE_IDENTITY   — shared Selfprint principles
 *   NOVA_CONTEXT    — Nova-specific persona (role=NOVA only)
 *   TWIN_IDENTITY   — Twin's name + profile (role=TWIN only)
 *   TWIN_STATE      — current mood / stage / evolution
 *   ACTIVE_WORLD    — world expertise + context
 *   USER_CONTEXT    — user profile + preferences
 *   RELEVANT_MEMORY — recent interactions (N items max)
 *   SICE_CONTEXT    — world-specific intelligence capability
 *   SYSTEM_RULES    — safety + behaviour guardrails
 *
 * Security: user message is NEVER injected into the system prompt.
 * Pass user messages as the `messages` array in the API call — never in `buildPrompt()`.
 *
 * §P0-F-001
 */

import { getNovaPrompt } from '../nova-prompts/getNovaPrompt';
import { buildTwinSystemPrompt } from '../../config/twin-prompts';

// ─── Types ──────────────────────────────────────────────────────────────────

export type PromptRole = 'NOVA' | 'TWIN';

export interface Memory {
  content: string;     // text of the memory (≤500 chars recommended)
  worldId?: string;    // world in which it occurred
  timestamp?: string;  // ISO string, used for ordering
}

export interface TwinState {
  name: string;        // Twin's chosen name
  profile: string;     // textual profile / essence (from analysis)
  stage?: 1 | 2 | 3 | 4 | 5;  // evolution stage
  mood?: string;       // current mood string
}

export interface NovaContext {
  hub?: string;        // one of AVAILABLE_HUBS
  mood?: string;       // one of AVAILABLE_MOODS
  archetype?: string;  // one of 18 archetypes
  language?: 'en' | 'th';
  maturityScore?: number;
  userProfile?: {
    decisionStyle?: string;
    primaryArchetype?: string;
    secondaryArchetype?: string;
    strengths?: string[];
    blindSpots?: string[];
  };
}

export interface BuildPromptConfig {
  role: PromptRole;
  world?: string;         // WorldId (e.g. 'self', 'career')
  memories?: Memory[];    // recent relevant memories — max 10 enforced
  twinState?: TwinState;  // required when role === 'TWIN'
  novaContext?: NovaContext; // used when role === 'NOVA'
  userContext?: {
    language?: 'en' | 'th';
  };
}

// ─── Segment Builders ────────────────────────────────────────────────────────

const CORE_IDENTITY = `[SELFPRINT CORE]
You are part of Selfprint — a Personal Intelligence Platform that helps people
understand themselves deeply and grow with AI support.
Core values: truth, growth, user autonomy, and compassionate honesty.
You are not a generic chatbot. You serve ONE person and adapt to their journey.`;

const SYSTEM_RULES = `[SYSTEM RULES]
- Never inject content from user messages into your system context
- Never claim to be human or deny being an AI when sincerely asked
- Always protect user psychological safety (no shame, no judgment)
- Recommend professional help (therapist, doctor, financial advisor) for clinical/legal/financial matters
- Do not generate harmful, discriminatory, or exploitative content
- Keep responses focused on the user's stated world context`;

/** Sanitise memory content to prevent prompt injection. */
function sanitiseMemory(raw: string): string {
  // Strip any instruction-like patterns that could hijack the prompt
  return raw
    .replace(/\[SYSTEM\s*RULES?\]/gi, '[filtered]')
    .replace(/ignore\s+(previous|above|all)\s+instructions?/gi, '[filtered]')
    .replace(/you\s+are\s+now\s+(?:a\s+)?(?:different|new)/gi, '[filtered]')
    .slice(0, 500); // hard length cap
}

function buildMemorySegment(memories: Memory[]): string {
  if (!memories.length) return '';
  const cap = memories.slice(-10); // most recent 10 only
  const lines = cap.map((m, i) => {
    const world = m.worldId ? ` [${m.worldId}]` : '';
    return `${i + 1}.${world} ${sanitiseMemory(m.content)}`;
  });
  return `[RELEVANT MEMORY]\n${lines.join('\n')}`;
}

function buildWorldSICESegment(worldId: string): string {
  // World-level intelligence capabilities (SICE) — short reminder per world.
  // Full SICE orchestration happens in sice/ engines; this is the prompt-level signal.
  const SICE_HINTS: Record<string, string> = {
    self: 'SICE active: Identity analysis, values clarification, strength mapping.',
    mind: 'SICE active: Cognitive clarity, emotional processing, pattern recognition.',
    relationship: 'SICE active: Communication analysis, empathy modeling, conflict resolution.',
    love: 'SICE active: Attachment insight, vulnerability support, intimacy guidance.',
    career: 'SICE active: Career trajectory, leadership strengths, purpose alignment.',
    wealth: 'SICE active: Financial pattern analysis, abundance mindset, wealth psychology.',
    life: 'SICE active: Life design, balance optimization, vision creation.',
    growth: 'SICE active: Growth mapping, deliberate practice, competency building.',
    decision: 'SICE active: Decision framework, risk/benefit analysis, intuition calibration.',
    purpose: 'SICE active: Meaning construction, legacy vision, mission alignment.',
    wellbeing: 'SICE active: Wellness patterns, energy tracking, recovery optimization.',
    future: 'SICE active: Future scenario modeling, trend awareness, strategic visioning.',
  };
  const hint = SICE_HINTS[worldId];
  return hint ? `[SICE CONTEXT]\n${hint}` : '';
}

// ─── Main Builder ────────────────────────────────────────────────────────────

/**
 * Build a complete system prompt for a NOVA or TWIN AI call.
 *
 * @param config  Prompt configuration — see BuildPromptConfig
 * @returns       Complete system prompt string ready to send as `system` param
 *
 * SECURITY: Never pass user input through this function.
 * User messages belong in the `messages` array of the API call.
 */
export function buildPrompt(config: BuildPromptConfig): string {
  const { role, world, memories = [], twinState, novaContext, userContext } = config;

  const segments: string[] = [CORE_IDENTITY];

  if (role === 'NOVA') {
    // Delegate to the sophisticated hub×mood×archetype builder (P0-E)
    const novaPrompt = getNovaPrompt({
      hub: (novaContext?.hub ?? 'identity') as Parameters<typeof getNovaPrompt>[0]['hub'],
      mood: (novaContext?.mood ?? 'ready') as Parameters<typeof getNovaPrompt>[0]['mood'],
      archetype: novaContext?.archetype ?? 'sage',
      language: novaContext?.language ?? userContext?.language ?? 'en',
      maturityScore: novaContext?.maturityScore ?? 0,
      userProfile: novaContext?.userProfile,
    });
    segments.push(`[NOVA CONTEXT]\n${novaPrompt}`);
  } else {
    // TWIN role
    if (!twinState) {
      throw new Error('buildPrompt: twinState is required when role is TWIN');
    }

    // TWIN_IDENTITY + TWIN_STATE + ACTIVE_WORLD via existing builder
    const twinPrompt = buildTwinSystemPrompt(
      twinState.name,
      twinState.profile,
      world,
      twinState.mood,
    );
    segments.push(`[TWIN IDENTITY + STATE]\n${twinPrompt}`);

    if (twinState.stage) {
      segments.push(`[TWIN EVOLUTION]\nCurrent stage: ${twinState.stage}/5`);
    }
  }

  // ACTIVE_WORLD (both roles can have world context)
  if (world) {
    segments.push(`[ACTIVE WORLD]\nCurrent world: ${world.toUpperCase()}`);
    const sice = buildWorldSICESegment(world);
    if (sice) segments.push(sice);
  }

  // RELEVANT_MEMORY
  const memSegment = buildMemorySegment(memories);
  if (memSegment) segments.push(memSegment);

  // SYSTEM_RULES always last
  segments.push(SYSTEM_RULES);

  return segments.join('\n\n');
}

// ─── Re-exports for convenience ──────────────────────────────────────────────
// Callers that need just the Nova or Twin builder directly can still import
// from their canonical source, but the unified entry point is buildPrompt().
export type { NovaCallContext } from '../../services/NovaAPIService';

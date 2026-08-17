/**
 * ExperienceEngine.ts
 *
 * Master Direction §16 — Adaptive Experience Intelligence
 * Master Direction §20 — Adaptive Hub
 *
 * Orchestrates the full experience layer:
 *
 *   PersonalContext
 *   + Current Hub (user selection)
 *   + Emotion Signal (from EmotionSignalEngine)
 *   + Journey (TwinState progress)
 *   + Activity (hub history recency)
 *   + Time of day
 *   ↓
 *   ExperienceConfig
 *     suggestedHub       — which hub AI recommends (user may ignore)
 *     activeMood         — resolved mood for this session
 *     themeResolution    — full ThemeResolution from ThemeResolver
 *     dashboardPriority  — ordered list of dashboard sections
 *     isAdaptive         — was PersonalContext available?
 *
 * §19 Rule: User Preference > AI Personalization
 *   suggestedHub is a RECOMMENDATION only — never force-applied.
 *   Hub is only auto-applied on first-ever session (hub history empty).
 */

import type { PersonalContext } from '../intelligence/types';
import type { Hub } from '../../context/HubContext';
import type { Mood } from '../../context/EmotionContext';
import type { TwinState } from '../intelligence/TwinStateEngine';
import type { ThemeResolution } from './ThemeResolver';
import { EmotionSignalEngine } from './EmotionSignalEngine';
import { ThemeResolver } from './ThemeResolver';

// ============================================================================
// Types
// ============================================================================

export type DashboardSection =
  | 'executive-summary'
  | 'living-twin'
  | 'growth-space'
  | 'ask-coach'
  | 'intelligence-panel'
  | 'analytics'
  | 'decision-logs';

export interface ExperienceConfig {
  /** AI-recommended hub based on PersonalContext (§20) */
  suggestedHub: Hub;
  /** Should auto-apply suggestedHub? True only on first session (no hub history) */
  shouldAutoApplyHub: boolean;
  /** Resolved mood (from AI + time modulation) */
  activeMood: Mood;
  /** Full theme resolution for the active Hub × Mood */
  themeResolution: ThemeResolution;
  /** Ordered dashboard sections (most relevant first given Twin state) */
  dashboardPriority: DashboardSection[];
  /** Was PersonalContext available? Degrades gracefully if not. */
  isAdaptive: boolean;
}

interface ExperienceInput {
  personalContext: PersonalContext | null | undefined;
  currentHub: Hub;
  currentMood: Mood;
  /** Hub switch history — empty means first session */
  hubHistoryLength: number;
  twinState: TwinState;
}

// ============================================================================
// Dashboard priority by Twin state (§8 — Dashboard as Personal Space)
// Early states → show Twin prominently so user understands the system
// Advanced states → lead with insights since user is already calibrated
// ============================================================================

const DASHBOARD_PRIORITY_BY_STATE: Record<TwinState, DashboardSection[]> = {
  awakening: [
    'living-twin',
    'ask-coach',
    'executive-summary',
    'growth-space',
    'intelligence-panel',
    'analytics',
    'decision-logs',
  ],
  aware: [
    'living-twin',
    'executive-summary',
    'growth-space',
    'ask-coach',
    'intelligence-panel',
    'analytics',
    'decision-logs',
  ],
  connected: [
    'executive-summary',
    'living-twin',
    'growth-space',
    'intelligence-panel',
    'ask-coach',
    'analytics',
    'decision-logs',
  ],
  reflective: [
    'executive-summary',
    'growth-space',
    'living-twin',
    'intelligence-panel',
    'ask-coach',
    'analytics',
    'decision-logs',
  ],
  insightful: [
    'executive-summary',
    'intelligence-panel',
    'growth-space',
    'living-twin',
    'ask-coach',
    'analytics',
    'decision-logs',
  ],
  aligned: [
    'intelligence-panel',
    'executive-summary',
    'growth-space',
    'living-twin',
    'ask-coach',
    'analytics',
    'decision-logs',
  ],
  flourishing: [
    'intelligence-panel',
    'executive-summary',
    'growth-space',
    'living-twin',
    'ask-coach',
    'analytics',
    'decision-logs',
  ],
  mastery: [
    'intelligence-panel',
    'executive-summary',
    'growth-space',
    'living-twin',
    'ask-coach',
    'analytics',
    'decision-logs',
  ],
};

// ============================================================================
// Hub suggestion from PersonalContext.hubsActive
// ============================================================================

function suggestHub(personalContext: PersonalContext | null | undefined, currentHub: Hub): Hub {
  if (!personalContext?.hubsActive?.length) return currentHub;

  const active = personalContext.hubsActive[0] as Hub;
  // Basic validation: the string must be a valid Hub
  const VALID_HUBS: Hub[] = [
    'identity', 'decision', 'relationship', 'career', 'health',
    'money', 'ai-twin', 'learning', 'creativity', 'spirituality', 'impact', 'activities',
  ];
  return VALID_HUBS.includes(active) ? active : currentHub;
}

// ============================================================================
// ExperienceEngine
// ============================================================================

export class ExperienceEngine {
  private emotionEngine = new EmotionSignalEngine();
  private themeResolver = new ThemeResolver();

  compute(input: ExperienceInput): ExperienceConfig {
    const { personalContext, currentHub, currentMood, hubHistoryLength, twinState } = input;

    const isAdaptive = !!personalContext;

    // 1. Suggest hub from PersonalContext.hubsActive
    const suggestedHub = suggestHub(personalContext, currentHub);

    // 2. Auto-apply only if user has never manually switched hub (first session)
    const shouldAutoApplyHub = hubHistoryLength === 0 && suggestedHub !== currentHub;

    // 3. Resolve emotion signal
    const emotionSignal = this.emotionEngine.resolve(
      personalContext?.emotionalRange,
      currentMood
    );
    // 4. Apply time modulation (§18: time-of-day soft signal)
    const modulatedSignal = this.emotionEngine.applyTimeModulation(emotionSignal);

    // 5. Active mood: use AI-resolved mood if confidence is high enough, else keep user's mood
    const activeMood: Mood =
      isAdaptive && modulatedSignal.confidence >= 0.5
        ? modulatedSignal.dominantMood
        : currentMood;

    // 6. Resolve full theme: Hub × Mood → ThemeResolution
    //    Use the hub that will actually be displayed (not the suggestion)
    const activeHub = shouldAutoApplyHub ? suggestedHub : currentHub;
    const themeResolution = this.themeResolver.resolve(activeHub, activeMood);

    // 7. Dashboard priority by Twin state
    const dashboardPriority = DASHBOARD_PRIORITY_BY_STATE[twinState];

    return {
      suggestedHub,
      shouldAutoApplyHub,
      activeMood,
      themeResolution,
      dashboardPriority,
      isAdaptive,
    };
  }
}

export default ExperienceEngine;

/**
 * sice.ts
 * 12 Specialized Intelligence Capability Engines
 * Core intelligence system powering Twin
 */

import type { WorldId } from '../constants/worlds';

export interface SICEInput {
  userId: string;
  userContext?: Record<string, unknown>; // Current user data
  conversationHistory?: Array<{ role: string; content: string }>;
  currentWorld?: WorldId; // Which of 12 Worlds active
  metadata?: Record<string, unknown>;
}

export interface SICEOutput {
  engineId: number;
  engineName: string;
  result: unknown;
  confidence: number; // 0-100
  executionTime: number; // ms
  error?: string;
}

export interface OrchestratorResult {
  userId: string;
  timestamp: string;
  results: SICEOutput[]; // Results from all 12 engines
  synthesis: CrossEngineSynthesis;
  fineTuned: FineTunedResult;
  personalIntelligence: PersonalIntelligence;
  totalExecutionTime: number;
}

export interface CrossEngineSynthesis {
  themes: string[]; // Key themes across engines
  conflicts: string[]; // Conflicting outputs
  agreements: string[]; // Consensus across engines
  confidenceScore: number; // Overall confidence
}

export interface FineTunedResult {
  adjustedForFeedback: boolean;
  feedbackHistoryConsidered: number; // Count of past feedback
  adjustments: string[];
}

export interface PersonalIntelligence {
  userUnderstanding: number; // 0-100: How well we understand this user
  recommendedAction: string; // What Twin should focus on
  confidence: number; // 0-100: Confidence in recommendation
  insights: string[]; // Top 3-5 insights from SICE synthesis
  nextStepsSuggested: string[];
  warningsOrCautions: string[];
}

/**
 * SICE Engine Interface
 */
export interface ISICEEngine {
  id: number;
  name: string;
  description: string;
  process(input: SICEInput): Promise<SICEOutput>;
}

/**
 * SICE #1: PersonalContextBuilder
 * Builds user's personal context from available data
 * P0 #7.4: Includes world-specific personality adaptation
 */
export interface PersonalContext {
  userId: string;
  emotionalState: string;
  currentGoals: string[];
  activePatterns: string[];
  worldFocus: string;
  recentMemories: Array<{ timestamp: string; content: string }>;
  strengthAreas: string[];
  growthAreas: string[];
  // P0 #7.4: World-specific adaptation
  worldPersonality?: {
    mood: string;
    responseStyle: string;
    focusArea: string;
  };
}

/**
 * SICE #2: PatternDetector
 * Detects recurring behavioral patterns
 */
export interface DetectedPattern {
  name: string;
  frequency: number; // How often observed
  lastObserved: string;
  impact: 'positive' | 'neutral' | 'negative';
  examples: string[];
  confidence: number;
}

/**
 * SICE #3: InsightEngine
 * Generates insights from patterns
 */
export interface Insight {
  title: string;
  description: string;
  basedOnPatterns: string[];
  actionable: boolean;
  suggestedAction?: string;
  relevance: number; // 0-100
}

/**
 * SICE #5: TwinStateEngine
 * Determines Twin's current mood/state
 */
export interface TwinState {
  mood: 'curious' | 'confident' | 'learning' | 'reflective' | 'playful';
  energy: number; // 0-100
  focusArea: string;
  responseStyle: 'direct' | 'exploratory' | 'supportive' | 'analytical';
}

/**
 * SICE #8: BadgeEngine
 * Determines badge eligibility
 */
export interface BadgeOpportunity {
  badgeId: string;
  name: string;
  description: string;
  requirementsMet: number; // 0-100 progress
  isEligible: boolean;
  timeUntilEligible?: string;
}

/**
 * SICE #9: BehavioralForecastEngine
 * Forecasts user behavior
 */
export interface BehaviorForecast {
  likelyNextAction: string;
  confidence: number;
  potentialChallenges: string[];
  opportunitiesAhead: string[];
  timeframe: string;
}

/**
 * SICE #10: FutureSelfEngine
 * Imagines user's future self
 */
export interface FutureSelfVision {
  timeframe: string; // "1 year from now", etc
  imaginedalignment: number; // 0-100: alignment with current goals
  description: string;
  pathToReach: string[];
  barriers: string[];
  supportNeeded: string[];
}

/**
 * SICE #12: DecisionIntelligenceEngine
 * Analyzes decision quality
 */
export interface DecisionIntelligence {
  decisionQualityScore: number; // 0-100
  successProbability: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  timelineRealism: 'optimistic' | 'realistic' | 'pessimistic';
  confidenceInOutcome: number; // 0-100
  suggestedRefinements: string[];
}

/**
 * Engine Result Types — Flexible Interfaces
 * Each engine returns result data that may include subset of fields
 */
export type PersonalContextResult = Partial<PersonalContext>;

export type PatternResult = Array<DetectedPattern>;

export type InsightResult = Array<Insight>;

export interface AIFeedbackResult {
  feedbackCount?: number;
  averageScore?: number;
  averageSentiment?: number;
  recommendedAdjustment?: string;
  improvements?: string[];
  warnings?: string[];
  engineAccuracy?: Array<{ engineId: number; accuracy: number }>;
}

export type TwinStateResult = Partial<TwinState>;

export interface ExperienceResult {
  totalInteractions?: number;
  masteredAreas?: string[];
  keyLearnings?: string[];
  growthAreas?: string[];
  totalHours?: number;
}

export interface EnvironmentResult {
  timeOfDay?: string;
  currentSeason?: string;
  twinState?: { activeWorld?: string };
  stressLevel?: number;
  recommendations?: string[];
  confidence?: number;
}

export interface BadgeResult {
  unlockedBadges?: string[] | Array<{ name?: string; id?: string }>;
  totalProgress?: number;
  nextMilestones?: Array<{ name?: string } | string>;
}

export interface BehavioralForecastResult extends Partial<BehaviorForecast> {
  nextMood?: string;
  predictedFocus?: string;
  opportunities?: string[];
  risks?: string[];
  confidence?: number;
}

export interface FutureSelfResult extends Partial<FutureSelfVision> {
  vision?: string;
  focusAreas?: string[];
  milestones?: string[];
  confidence?: number;
}

export interface MemoryManagerResult {
  totalMemoriesStored?: number;
  primaryThemes?: string[];
  emotionalTone?: string;
}

export interface DecisionIntelligenceResult {
  totalDecisions?: number;
  successRate?: number;
  bestPerformingArea?: string;
  nextStepGuidance?: string;
  decisionQualityScore?: number;
  successProbability?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  timelineRealism?: 'optimistic' | 'realistic' | 'pessimistic';
  confidenceInOutcome?: number;
  suggestedRefinements?: string[];
}

/**
 * Discriminated Union of all engine result types
 */
export type SICEEngineResult =
  | PersonalContextResult
  | PatternResult
  | InsightResult
  | AIFeedbackResult
  | TwinStateResult
  | ExperienceResult
  | EnvironmentResult
  | BadgeResult
  | BehavioralForecastResult
  | FutureSelfResult
  | MemoryManagerResult
  | DecisionIntelligenceResult
  | null; // Error case

/**
 * Updated SICEOutput with typed result
 */
export interface SICEOutputTyped {
  engineId: number;
  engineName: string;
  result: SICEEngineResult;
  confidence: number; // 0-100
  executionTime: number; // ms
  error?: string;
}

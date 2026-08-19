/**
 * TypeScript Types for Selfprint Intelligence Core
 * Defines all data structures for Personal Intelligence Engine
 * @module intelligence/types
 */

// ============================================================================
// 1. PERSONAL CONTEXT TYPES
// ============================================================================

/**
 * Represents a core value inferred from user's decisions and reflections
 */
export interface Value {
  id?: string;
  title?: string; // Display name (e.g., from onboarding)
  name: string;
  description?: string;
  importance?: 'high' | 'medium' | 'low'; // Priority level
  confidence: number; // 0-1, higher = more certain
  evidence: string[]; // Which reflections/decisions led to this
  sourceOfTruth?: string; // Where this value came from (e.g., 'onboarding_strengths')
  inferredFromSources: EvidenceSource[];
  inferred: boolean; // AI inferred vs user stated
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Represents a goal user is working towards
 */
export interface Goal {
  id?: string;
  title: string;
  description?: string;
  timeframe?: string; // "short-term", "long-term", "ongoing"
  confidence: number;
  evidence: string[];
  sourceOfTruth?: string; // Where this goal came from (e.g., 'onboarding_insights')
  inferredFromSources: EvidenceSource[];
  relatedHub?: string; // Which life area (Career, Relationship, etc)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Represents something user is good at
 */
export interface Strength {
  id?: string;
  name: string;
  description?: string;
  confidence: number;
  evidence: string[];
  inferredFromSources: EvidenceSource[];
  relatedPatterns: string[]; // pattern IDs
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Represents something user may not see about themselves
 */
export interface BlindSpot {
  id?: string;
  title: string;
  description?: string;
  confidence: number;
  evidence: string[];
  sourceOfTruth?: string; // Where this blind spot came from (e.g., 'onboarding_blindspots')
  inferredFromSources: EvidenceSource[];
  sensitivity: 'low' | 'medium' | 'high'; // Don't expose high-confidence blind spots rashly
  potentialImpact?: 'low' | 'medium' | 'high'; // How much this affects user
  actionable?: boolean; // Can user do something about this?
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Emotional patterns (soft signals, not diagnoses)
 */
export interface EmotionalRange {
  primaryMoods: string[]; // e.g., ["thoughtful", "ambitious"]
  volatility: number; // How much do emotions fluctuate?
  responseToStress: string; // How does user typically respond to pressure?
  emotionalTriggers: string[]; // What tends to activate certain emotions?
  confidence: number;
}

/**
 * How user typically approaches decisions
 */
export interface DecisionStyle {
  type: 'analytical' | 'intuitive' | 'collaborative' | 'mixed';
  description: string;
  confidence: number;
  evidence: string[];
  sourceOfTruth?: string; // Where this style came from (e.g., 'onboarding_analysis')
}

/**
 * Important people and their relationship to user
 */
export interface Relationship {
  id?: string;
  name?: string;
  type: 'family' | 'friend' | 'colleague' | 'mentor' | 'other';
  role: string; // e.g., "Best friend", "Manager"
  significanceLevel: number; // 0-1
  frequency: string; // How often mentioned
  createdAt?: Date;
}

/**
 * Complete Personal Context - user's mental model
 * This is the synthesized view of who the user is
 */
export interface PersonalContext {
  id?: string;
  userId: string;
  birthDate?: string; // ISO date string (e.g., '1990-05-15')
  moodState?: string; // Current mood (e.g., 'creative', 'contemplative')
  values: Value[];
  goals: Goal[];
  strengths: Strength[];
  blindSpots: BlindSpot[];
  emotionalRange: EmotionalRange;
  decisionStyle: DecisionStyle;
  relationships: Relationship[];
  hubsActive?: string[]; // Life areas user is focusing on (career, relationships, health, etc)

  // Metadata
  lastUpdated: Date;
  modelVersion: number; // For tracking schema changes
  confidenceOverall: number; // Average confidence across all inferences
  sourceCount: number; // How many reflections/decisions fed into this?
}

// ============================================================================
// 2. MEMORY TYPES
// ============================================================================

export type MemoryType = 'small_win' | 'important_moment' | 'discovery' | 'personal';

/**
 * Persistent memory of something important to user
 */
export interface PersonalMemory {
  id: string;
  userId: string;
  memoryType: MemoryType;
  title: string;
  content: string;
  linkedTo?: string; // decision_id or journal_id
  confidence: number; // How central is this to user's identity?
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 3. BEHAVIORAL PATTERN TYPES
// ============================================================================

export type PatternType = 'repeating' | 'emerging' | 'changing';

/**
 * A single evidence point (where we observed pattern)
 */
export interface EvidencePoint {
  date: Date;
  source: 'reflection' | 'decision' | 'memory' | 'explicit_statement';
  sourceId: string; // journal_id, decision_id, etc
  excerpt: string; // Quote or summary
  confidence?: number; // Some evidence stronger than others
}

/**
 * Evidence source metadata
 */
export interface EvidenceSource {
  type: 'reflection' | 'decision' | 'memory' | 'question_answer' | 'mood';
  id: string;
  date: Date;
  excerpt?: string;
}

/**
 * Behavioral pattern - something repeating/emerging/changing
 * Core unit of AI understanding
 */
export interface BehavioralPattern {
  id: string;
  userId: string;
  patternName: string; // e.g., "decision_hesitation", "overcommitment"
  patternType: PatternType;

  // Evidence
  evidencePoints: EvidencePoint[];
  frequency: string; // "weekly", "every 3 days", "most decisions"
  lastDetected: Date;
  confidence: number; // 0-1

  // Meaning
  description: string; // What is this pattern?
  aiInsight: string; // Why does it matter?
  impact?: string; // How does it affect user?

  // Related context
  relatedValues?: string[]; // Related to these values
  relatedGoals?: string[]; // Related to these goals
  strengths?: string[]; // Is this a strength or challenge?

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 4. PERSONAL CONTEXT (Database) TYPES
// ============================================================================

export type ContextType = 'value' | 'goal' | 'blind_spot' | 'strength' | 'emotional_range' | 'decision_style';

/**
 * Generic context entry (maps to DB personal_context table)
 * Used by PersonalContextBuilder
 */
export interface PersonalContextEntry {
  id: string;
  userId: string;
  contextType: ContextType;
  title: string;
  description: string;
  inferredFrom: InferredFromMetadata;
  confidence: number;
  aiEvidence: string; // Explanation of why AI thinks this
  userFeedback?: boolean; // true=user confirmed, false=rejected, null=no feedback
  createdAt: Date;
  updatedAt: Date;
}

export interface InferredFromMetadata {
  sources: EvidenceSource[];
  methodology?: string; // e.g., "pattern_analysis", "question_response"
  reflectionCount?: number; // How many data points?
}

// ============================================================================
// 5. AI FEEDBACK TYPES
// ============================================================================

export type FeedbackType = 'very_true' | 'somewhat' | 'not_sure' | 'not_me';

/**
 * User feedback on an AI insight
 * Used to calibrate model
 */
export interface InsightFeedback {
  id: string;
  userId: string;
  insightId: string; // Reference to which AI insight
  feedbackType: FeedbackType;
  comment?: string; // User can add notes
  createdAt: Date;
}

/**
 * Metrics on how accurate AI insights are for user
 */
export interface AccuracyMetrics {
  totalInsights: number;
  feedback: {
    veryTrue: number;
    somewhat: number;
    notSure: number;
    notMe: number;
  };
  accuracy: number; // (veryTrue + somewhat) / totalInsights
  trend: 'improving' | 'stable' | 'declining';
}

// ============================================================================
// 6. CONFIDENCE & KNOWLEDGE TYPES
// ============================================================================

/**
 * Classification of what AI knows vs infers vs doesn't know
 */
export type KnowledgeLevel = 'KNOW' | 'INFER' | 'UNKNOWN';

/**
 * Evidence of what we know
 * Supports Master Direction: "Never pretend to know what system doesn't know"
 */
export interface KnowledgeClassification {
  claim: string;
  level: KnowledgeLevel;
  evidence?: EvidenceSource[];
  confidence: number;
  explanation: string; // Why is this classified this way?
}

// ============================================================================
// 7. PROFILE TYPES
// ============================================================================

/**
 * User's personal profile (extends auth.users)
 */
export interface PersonalProfile {
  id: string;
  userId: string;
  birthDate?: Date;
  moodState?: string; // Current mood from onboarding
  hubsActive: string[]; // Which life areas are active
  lastReflection?: Date;
  modelVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 8. REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Initialize user context from onboarding data
 */
export interface InitializeContextRequest {
  userId: string;
  mood: string;
  birthDate: Date;
  onboardingAnswers: Record<string, string>; // Q&A from onboarding
  hubsSelected?: string[];
  hubsActive?: string[]; // Extracted from analysis
  moodState?: string; // Alias for mood
  modelVersion?: string;
}

/**
 * Response after context initialized
 */
export interface InitializeContextResponse {
  userId: string;
  context: PersonalContext;
  patterns: BehavioralPattern[];
  memories: PersonalMemory[];
  success: boolean;
  message?: string;
}

/**
 * Update context from reflection/journal
 */
export interface UpdateContextFromReflectionRequest {
  userId: string;
  reflectionContent: string;
  aiAnalysis: AIAnalysisResult;
  timestamp: Date;
}

export interface AIAnalysisResult {
  emotions: string[];
  decisions: string[];
  patterns: Partial<BehavioralPattern>[];
  newInsights: string[];
  suggestedMemories: Partial<PersonalMemory>[];
}

// ============================================================================
// 9. ERROR TYPES
// ============================================================================

export class IntelligenceError extends Error {
  public code: string;
  public statusCode: number = 500;

  constructor(
    message: string,
    code: string,
    statusCode?: number
  ) {
    super(message);
    this.name = 'IntelligenceError';
    this.code = code;
    if (statusCode) this.statusCode = statusCode;
  }
}

export class ConfidenceError extends IntelligenceError {
  constructor(message: string) {
    super(message, 'LOW_CONFIDENCE');
    this.statusCode = 400;
    this.name = 'ConfidenceError';
  }
}

// ============================================================================
// 10. UTILITY TYPES
// ============================================================================

/**
 * Generic response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: Date;
}

/**
 * Pagination for lists
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * storyNarrative.types.ts
 *
 * Track C Story Narrative Layer — §51 STORYTELLING ARCHITECTURE
 * Types for 3 Narrative Layers × 5 Story Modes × 7 Moments
 *
 * NO FAKE STORY guardrail enforced: all data from twin_memories / decision_logs
 * / daily_briefs only. No parallel memory system. No new intelligence engine.
 */

// ─── Story Layers ──────────────────────────────────────────────────────────────

export interface NarrativeLayer {
  /** Layer 1: BIG STORY — entire journey narrative */
  bigStory?: BigStoryData;
  /** Layer 2: CURRENT CHAPTER — current time-period theme */
  currentChapter?: CurrentChapterData;
  /** Layer 3: MICRO STORY — today's single most important beat */
  microStory?: MicroStoryData;
}

export interface BigStoryData {
  /** "From where → Now → Where going" summary */
  journeySummary: string;
  /** Evolution stages passed with timestamps */
  evolutionHistory: EvolutionStageEntry[];
  /** Total memories learned count */
  totalMemoriesLearned: number;
  /** Total decisions made count */
  totalDecisionsMade: number;
  /** Key turning points (decisions with positive outcomes) */
  turningPoints: TurningPoint[];
  /** Current chapter title derived from dominant SICE patterns */
  currentChapterTitle: string;
  /** Open questions Twin holds about the user */
  openQuestions: OpenQuestion[];
}

export interface EvolutionStageEntry {
  stage: string;
  labeledAt: string;
  labelThai: string;
}

export interface TurningPoint {
  id: string;
  description: string;
  impact: 'positive' | 'neutral' | 'negative';
  lessons: string;
  date: string;
  world?: string;
}

export interface OpenQuestion {
  id: string;
  question: string;
  reason: string; // Why Twin still holds this question
  relatedDecisionId?: string;
}

export interface CurrentChapterData {
  /** Chapter name derived from dominant pattern */
  chapterTitle: string;
  /** Emoji for visual identity */
  emoji: string;
  /** Dominant SICE patterns this chapter */
  dominantPatterns: PatternInsight[];
  /** Recent memories relevant to this chapter */
  recentMemories: ChapterMemory[];
  /** Decisions made in this period */
  periodDecisions: DecisionSnapshot[];
  /** What Twin is observing now */
  currentObservation: string;
  /** Timeframe description */
  timeframeLabel: string;
}

export interface PatternInsight {
  patternName: string;
  confidence: number;
  description: string;
  evidenceCount: number;
}

export interface ChapterMemory {
  id: string;
  content: string;
  createdAt: string;
  worldId?: string;
}

export interface DecisionSnapshot {
  question: string;
  choice: string;
  date: string;
  world?: string;
}

export interface MicroStoryData {
  /** The single most important Story Beat of today */
  headline: string;
  /** Supporting detail from real data */
  detail: string;
  /** Source of truth — which data point this references */
  provenance: ProvenanceInfo;
  /** Emotional tone for delivery */
  tone: 'insightful' | 'encouraging' | 'curious' | 'reflective' | 'celebratory';
  /** Actionable prompt — what should the user do next */
  actionPrompt?: string;
}

export interface ProvenanceInfo {
  source: 'daily_brief' | 'twin_memory' | 'decision_outcome' | 'pattern_confirmed';
  sourceId: string;
  evidenceCount: number;
  confidence: number;
}

// ─── Story Modes (§8 TWIN MODES mapping) ──────────────────────────────────────

export type StoryMode = 'REVEAL' | 'EXPLORE' | 'CHOICE' | 'CONSEQUENCE' | 'EVOLUTION';

export interface StoryModeState {
  activeMode: StoryMode | null;
  availableModes: AvailableMode[];
  modeContext: ModeContext;
}

export interface AvailableMode {
  mode: StoryMode;
  labelThai: string;
  labelEn: string;
  icon: string;
  enabled: boolean;
  triggerReason: string; // Why this mode is available NOW
  dataReady: boolean; // Whether sufficient data exists (NO FAKE STORY)
}

export interface ModeContext {
  /** For REVEAL: top insight from analysis */
  revealInsight?: RevealInsight;
  /** For EXPLORE: world being explored */
  exploreWorld?: ExploreWorld;
  /** For CHOICE: recent decision */
  choiceDecision?: ChoiceDecision;
  /** For CONSEQUENCE: follow-up outcome */
  consequenceOutcome?: ConsequenceOutcome;
  /** For EVOLUTION: stage change info */
  evolutionChange?: EvolutionChange;
}

export interface RevealInsight {
  text: string;
  category: string;
  confidence: number;
  evidenceCount: number;
}

export interface ExploreWorld {
  worldId: string;
  worldName: string;
  connectionToPattern: string;
  hasRealData: boolean;
}

export interface ChoiceDecision {
  question: string;
  chosenOption: string;
  date: string;
  world?: string;
}

export interface ConsequenceOutcome {
  decisionQuestion: string;
  feedback: string;
  impact: 'positive' | 'neutral' | 'negative';
  lessons: string;
  daysSinceChoice: number;
}

export interface EvolutionChange {
  fromStage: string;
  toStage: string;
  toStageLabel: string;
  fromStageLabel: string;
  deltaDescription: string;
}

// ─── Rhythm Table (7 Moments) ─────────────────────────────────────────────────

export type RhythmMoment =
  | 'landing'
  | 'onboarding'
  | 'core_awakening'
  | 'twin_birth'
  | 'today_returning'
  | 'world_entry'
  | 'evolution_change';

export interface RhythmEntry {
  moment: RhythmMoment;
  storyFunction: string;
  requiredData: string[];
  narrativeText: string;
}

/**
 * Personal Context Builder
 * Synthesizes all user data into a coherent mental model
 * Core intelligence engine of Selfprint
 * @module intelligence/PersonalContextBuilder
 */

import { supabase, db } from '@/lib/supabase/client';
import { IntelligenceError } from './types';
import type {
  PersonalContext,
  PersonalContextEntry,
  Value,
  Goal,
  Strength,
  BlindSpot,
  EmotionalRange,
  DecisionStyle,
  Relationship,
  PersonalMemory,
  BehavioralPattern,
  InitializeContextRequest,
  InitializeContextResponse,
  UpdateContextFromReflectionRequest,
  AIAnalysisResult,
} from './types';

/**
 * PersonalContextBuilder
 * Synthesizes all user data into a coherent personal intelligence model
 *
 * Usage:
 * ```typescript
 * const builder = new PersonalContextBuilder();
 * const context = await builder.initialize(userId, onboardingData);
 * ```
 */
export class PersonalContextBuilder {
  private userId: string | null = null;
  private hubsActive: string[] = [];

  /**
   * Initialize user context from onboarding data
   * Called after Twin synthesis completes
   *
   * @param request InitializeContextRequest with userId, mood, birthDate, answers
   * @returns Promise<InitializeContextResponse>
   */
  async initialize(request: InitializeContextRequest): Promise<InitializeContextResponse> {
    try {
      this.userId = request.userId;
      this.hubsActive = request.hubsActive || [];

      // Step 1: Create personal profile
      await this.createPersonalProfile(request);

      // Step 2: Analyze onboarding answers → infer context
      const inferredContext = await this.inferContextFromOnboarding(request);

      // Step 3: Detect initial patterns
      const initialPatterns = await this.detectInitialPatterns(request);

      // Step 4: Create memories from significant answers
      const memories = await this.createMemoriesFromOnboarding(request);

      // Step 5: Synthesize PersonalContext
      const context = this.synthesizeContext(inferredContext);

      return {
        userId: request.userId,
        context,
        patterns: initialPatterns,
        memories,
        success: true,
        message: 'Personal context initialized successfully',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to initialize context';
      return {
        userId: request.userId,
        context: {} as PersonalContext,
        patterns: [],
        memories: [],
        success: false,
        message,
      };
    }
  }

  /**
   * Update context after user reflection
   * Called when user journals or reflects
   */
  async updateFromReflection(
    request: UpdateContextFromReflectionRequest
  ): Promise<PersonalContext> {
    if (!request.userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    this.userId = request.userId;

    try {
      // Step 1: Process AI analysis result
      await this.processAIAnalysis(request);

      // Step 2: Update patterns from reflection
      await this.updatePatternsFromReflection(
        request.userId,
        request.aiAnalysis
      );

      // Step 3: Re-synthesize personal context
      const context = await this.getContext(request.userId);

      return context;
    } catch (error) {
      throw new IntelligenceError(
        `Failed to update context: ${error}`,
        'UPDATE_FAILED'
      );
    }
  }

  /**
   * Get current personal context for user
   * Returns cached/latest synthesis
   */
  async getContext(userId: string): Promise<PersonalContext> {
    try {
      // Fetch all context entries
      const entries = await db.selectMany<PersonalContextEntry>('personal_context', {
        user_id: userId,
      });

      // Organize by type
      const context: PersonalContext = {
        userId,
        values: this.extractValues(entries),
        goals: this.extractGoals(entries),
        strengths: this.extractStrengths(entries),
        blindSpots: this.extractBlindSpots(entries),
        emotionalRange: this.extractEmotionalRange(entries),
        decisionStyle: this.extractDecisionStyle(entries),
        relationships: this.extractRelationships(entries),
        lastUpdated: new Date(),
        modelVersion: 1,
        confidenceOverall: this.calculateOverallConfidence(entries),
        sourceCount: entries.length,
      };

      return context;
    } catch (error) {
      throw new IntelligenceError(
        `Failed to get context: ${error}`,
        'GET_CONTEXT_FAILED'
      );
    }
  }

  /**
   * Infer values from onboarding answers
   */
  async inferValues(userId: string): Promise<Value[]> {
    const entries = await db.selectMany<PersonalContextEntry>('personal_context', {
      user_id: userId,
    });

    return this.extractValues(entries);
  }

  /**
   * Infer goals from onboarding answers
   */
  async inferGoals(userId: string): Promise<Goal[]> {
    const entries = await db.selectMany<PersonalContextEntry>('personal_context', {
      user_id: userId,
    });

    return this.extractGoals(entries);
  }

  /**
   * Infer blind spots (things user may not see)
   */
  async inferBlindSpots(userId: string): Promise<BlindSpot[]> {
    const entries = await db.selectMany<PersonalContextEntry>('personal_context', {
      user_id: userId,
    });

    return this.extractBlindSpots(entries);
  }

  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================

  /**
   * Create personal profile entry
   */
  private async createPersonalProfile(
    request: InitializeContextRequest
  ): Promise<any> {
    const { data, error } = await supabase.from('personal_profiles').insert({
      user_id: request.userId,
      birth_date: request.birthDate,
      mood_state: request.mood,
      hubs_active: request.hubsSelected || [],
      model_version: 1,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Analyze onboarding answers and infer context
   */
  private async inferContextFromOnboarding(
    request: InitializeContextRequest
  ): Promise<PersonalContextEntry[]> {
    const entries: PersonalContextEntry[] = [];

    // Example logic: Parse answers to infer values, goals, etc.
    // This is simplified - in production would use Claude API to analyze

    const answers = request.onboardingAnswers;

    // Infer values
    if (answers.values) {
      const valueEntry: PersonalContextEntry = {
        id: crypto.randomUUID(),
        userId: request.userId,
        contextType: 'value',
        title: 'Inferred Values',
        description: answers.values,
        inferredFrom: {
          sources: [
            {
              type: 'question_answer',
              id: 'onboarding_values',
              date: new Date(),
            },
          ],
        },
        confidence: 0.7,
        aiEvidence: 'Inferred from onboarding answers about values',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      entries.push(valueEntry);
    }

    // Infer goals
    if (answers.goals) {
      const goalEntry: PersonalContextEntry = {
        id: crypto.randomUUID(),
        userId: request.userId,
        contextType: 'goal',
        title: 'Inferred Goals',
        description: answers.goals,
        inferredFrom: {
          sources: [
            {
              type: 'question_answer',
              id: 'onboarding_goals',
              date: new Date(),
            },
          ],
        },
        confidence: 0.6,
        aiEvidence: 'Inferred from onboarding goals discussion',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      entries.push(goalEntry);
    }

    // Save to database
    for (const entry of entries) {
      await supabase.from('personal_context').insert({
        user_id: entry.userId,
        context_type: entry.contextType,
        title: entry.title,
        description: entry.description,
        inferred_from: entry.inferredFrom,
        confidence: entry.confidence,
        ai_evidence: entry.aiEvidence,
      });
    }

    return entries;
  }

  /**
   * ตรวจจับรูปแบบพฤติกรรมเบื้องต้นจากการตอบของผู้ใช้
   * ค้นหาสิ่งที่เกิดซ้ำ, เปลี่ยนแปลง, หรือกำลังเกิดขึ้น
   */
  private async detectInitialPatterns(
    request: InitializeContextRequest
  ): Promise<BehavioralPattern[]> {
    const patterns: BehavioralPattern[] = [];
    const answers = request.onboardingAnswers;

    // Pattern 1: จากคำตอบของผู้ใช้ — ค้นหาคำที่เกิดซ้ำ (recurring themes)
    const allAnswerText = Object.values(answers || {}).join(' ').toLowerCase();
    const commonKeywords = ['want', 'goal', 'like', 'enjoy', 'struggle', 'learn', 'improve'];

    for (const keyword of commonKeywords) {
      if (allAnswerText.includes(keyword)) {
        patterns.push({
          id: crypto.randomUUID(),
          userId: request.userId,
          patternName: `ความสนใจในการ${keyword}`,
          patternType: 'emerging',
          evidencePoints: [{
            date: new Date(),
            source: 'explicit_statement',
            sourceId: 'onboarding_answers',
            excerpt: `ผู้ใช้พูดถึง "${keyword}"`,
            confidence: 0.6,
          }],
          frequency: 'ongoing',
          lastDetected: new Date(),
          confidence: 0.6,
          description: `ผู้ใช้พูดถึง "${keyword}" ในการตอบของพวกเขา`,
          aiInsight: `บ่งชี้ความสนใจในการ${keyword}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Pattern 2: จาก Mood state — จับคู่กับ emotional pattern
    if (request.mood) {
      patterns.push({
        id: crypto.randomUUID(),
        userId: request.userId,
        patternName: `สถานะอารมณ์: ${request.mood}`,
        patternType: 'repeating',
        evidencePoints: [{
          date: new Date(),
          source: 'explicit_statement',
          sourceId: 'mood_selection',
          excerpt: `ผู้ใช้เลือกสถานะอารมณ์ "${request.mood}"`,
          confidence: 0.8,
        }],
        frequency: 'ongoing',
        lastDetected: new Date(),
        confidence: 0.8,
        description: `ผู้ใช้เลือกสถานะอารมณ์ "${request.mood}"`,
        aiInsight: 'Baseline emotional state established',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return patterns;
  }

  /**
   * Create memories from significant onboarding answers
   */
  private async createMemoriesFromOnboarding(
    request: InitializeContextRequest
  ): Promise<PersonalMemory[]> {
    // Simplified: create discovery memory from onboarding
    const memory: PersonalMemory = {
      id: crypto.randomUUID(),
      userId: request.userId,
      memoryType: 'discovery',
      title: 'Selfprint Created',
      content: `Created Selfprint Twin with mood: ${request.mood}`,
      confidence: 1.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await supabase.from('personal_memory').insert({
      user_id: memory.userId,
      memory_type: memory.memoryType,
      title: memory.title,
      content: memory.content,
      confidence: memory.confidence,
    });

    return [memory];
  }

  /**
   * Process AI analysis from reflection
   */
  private async processAIAnalysis(
    request: UpdateContextFromReflectionRequest
  ): Promise<string[]> {
    const insights: string[] = [];

    // Store new insights in personal_context
    for (const insight of request.aiAnalysis.newInsights) {
      const entry: PersonalContextEntry = {
        id: crypto.randomUUID(),
        userId: request.userId,
        contextType: 'strength', // simplified - would vary
        title: 'New Insight',
        description: insight,
        inferredFrom: {
          sources: [
            {
              type: 'reflection',
              id: request.reflectionContent,
              date: request.timestamp,
            },
          ],
        },
        confidence: 0.6,
        aiEvidence: `From reflection on ${request.timestamp.toISOString()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await supabase.from('personal_context').insert({
        user_id: entry.userId,
        context_type: entry.contextType,
        title: entry.title,
        description: entry.description,
        confidence: entry.confidence,
        ai_evidence: entry.aiEvidence,
      });

      insights.push(insight);
    }

    return insights;
  }

  /**
   * Update patterns after reflection
   */
  private async updatePatternsFromReflection(
    userId: string,
    analysis: AIAnalysisResult
  ): Promise<BehavioralPattern[]> {
    const patterns: BehavioralPattern[] = [];

    for (const pattern of analysis.patterns) {
      if (!pattern.patternName) continue;

      const p: BehavioralPattern = {
        id: crypto.randomUUID(),
        userId,
        patternName: pattern.patternName,
        patternType: pattern.patternType || 'emerging',
        evidencePoints: [],
        frequency: 'monthly',
        lastDetected: new Date(),
        confidence: pattern.confidence || 0.5,
        description: pattern.description || '',
        aiInsight: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await supabase.from('behavioral_patterns').insert({
        user_id: p.userId,
        pattern_name: p.patternName,
        pattern_type: p.patternType,
        confidence: p.confidence,
        description: p.description,
      });

      patterns.push(p);
    }

    return patterns;
  }

  /**
   * Synthesize complete PersonalContext from entries
   */
  private synthesizeContext(entries: PersonalContextEntry[]): PersonalContext {
    return {
      userId: this.userId || '',
      values: this.extractValues(entries),
      goals: this.extractGoals(entries),
      strengths: this.extractStrengths(entries),
      blindSpots: this.extractBlindSpots(entries),
      emotionalRange: this.extractEmotionalRange(entries),
      decisionStyle: this.extractDecisionStyle(entries),
      relationships: this.extractRelationships(entries),
      hubsActive: this.hubsActive.length > 0 ? this.hubsActive : undefined,
      lastUpdated: new Date(),
      modelVersion: 1,
      confidenceOverall: this.calculateOverallConfidence(entries),
      sourceCount: entries.length,
    };
  }

  /**
   * Extract values from entries
   */
  private extractValues(entries: PersonalContextEntry[]): Value[] {
    return entries
      .filter((e) => e.contextType === 'value')
      .map((e) => ({
        name: e.title,
        description: e.description,
        confidence: e.confidence,
        evidence: [],
        inferredFromSources: e.inferredFrom.sources || [],
        inferred: true,
      }));
  }

  /**
   * Extract goals from entries
   */
  private extractGoals(entries: PersonalContextEntry[]): Goal[] {
    return entries
      .filter((e) => e.contextType === 'goal')
      .map((e) => ({
        title: e.title,
        description: e.description,
        confidence: e.confidence,
        evidence: [],
        inferredFromSources: e.inferredFrom.sources || [],
      }));
  }

  /**
   * Extract strengths from entries
   */
  private extractStrengths(entries: PersonalContextEntry[]): Strength[] {
    return entries
      .filter((e) => e.contextType === 'strength')
      .map((e) => ({
        name: e.title,
        description: e.description,
        confidence: e.confidence,
        evidence: [],
        inferredFromSources: e.inferredFrom.sources || [],
        relatedPatterns: [],
      }));
  }

  /**
   * Extract blind spots from entries
   */
  private extractBlindSpots(entries: PersonalContextEntry[]): BlindSpot[] {
    return entries
      .filter((e) => e.contextType === 'blind_spot')
      .map((e) => ({
        title: e.title,
        description: e.description,
        confidence: e.confidence,
        evidence: [],
        inferredFromSources: e.inferredFrom.sources || [],
        sensitivityLevel: 'medium',
      }));
  }

  /**
   * Extract emotional range from entries
   */
  private extractEmotionalRange(entries: PersonalContextEntry[]): EmotionalRange {
    const entry = entries.find((e) => e.contextType === 'emotional_range');
    return {
      primaryMoods: [],
      volatility: 0.5,
      responseToStress: entry?.description || '',
      emotionalTriggers: [],
      confidence: entry?.confidence || 0.5,
    };
  }

  /**
   * Extract decision style from entries
   */
  private extractDecisionStyle(entries: PersonalContextEntry[]): DecisionStyle {
    const entry = entries.find((e) => e.contextType === 'decision_style');
    return {
      type: 'mixed',
      description: entry?.description || '',
      confidence: entry?.confidence || 0.5,
      evidence: [],
    };
  }

  /**
   * ดึงความสัมพันธ์จาก entries
   * ผู้ใช้อาจจะกล่าวถึงคนสำคัญ ครอบครัว เพื่อน หรือเพื่อนร่วมงาน
   */
  private extractRelationships(_entries: PersonalContextEntry[]): Relationship[] {
    // Note: Relationship data not stored in PersonalContextEntry yet
    // TODO: Extend PersonalContextEntry to support relationship type or create separate table
    const relationships: Relationship[] = [];
    return relationships;
  }

  /**
   * คำนวณค่าความมั่นใจโดยรวมข้ามทั้ง entries
   * ใช้ weighted average โดย user-stated data มีน้ำหนักมากกว่า inferred
   */
  private calculateOverallConfidence(entries: PersonalContextEntry[]): number {
    if (entries.length === 0) return 0;

    let totalWeightedConfidence = 0;
    let totalWeight = 0;

    for (const entry of entries) {
      // User-stated data (ไม่ได้ infer): weight = 1.5
      // AI-inferred data: weight = 1.0
      const isUserStated = entry.inferredFrom.sources?.some((s) => s.type === 'question_answer' || s.type === 'mood');
      const weight = isUserStated ? 1.5 : 1.0;

      totalWeightedConfidence += entry.confidence * weight;
      totalWeight += weight;
    }

    // Normalize to 0-1 range
    const overallConfidence = totalWeightedConfidence / totalWeight;
    return Math.min(1, Math.max(0, overallConfidence)); // Clamp between 0-1
  }
}

export default PersonalContextBuilder;

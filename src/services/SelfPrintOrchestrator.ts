import { supabase } from '../lib/supabase/client';
import { PatternDetector } from './sice/engines/PatternDetector';
import { InsightEngine } from './sice/engines/InsightEngine';
import { PersonalContextBuilder } from './sice/engines/PersonalContextBuilder';
import { analyzeTwinDecisionPatterns, getDecisionInsights } from './DecisionLearningService';

// Self Print Lifecycle States
export type SelfPrintPhase =
  | 'qa-collection'
  | 'pattern-detection'
  | 'wow-1-ceremony'
  | 'fine-tuning'
  | 'full-analysis'
  | 'wow-2-moment'
  | 'twin-birth-ready';

interface SelfPrintState {
  blueprintId: string;
  userId: string;
  currentPhase: SelfPrintPhase;
  completedPhases: SelfPrintPhase[];
  qnaResponses: Record<string, string>;
  detectedPatterns: string[];
  insights: string[];
  analysis: string;
  twinReadyTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SelfPrintOrchestrator {
  private patternDetector = new PatternDetector();
  private insightEngine = new InsightEngine();
  private contextBuilder = new PersonalContextBuilder();

  /**
   * Initialize Self Print for user
   * Called when user starts the questionnaire
   */
  async initiateSelfPrint(userId: string, qnaResponses: Record<string, string>): Promise<string> {
    // Create blueprint record
    const { data, error } = await supabase
      .from('profiles_blueprints')
      .insert({
        user_id: userId,
        questionnaire_responses: qnaResponses,
        status: 'qa-collection',
        created_at: new Date(),
      })
      .select('id')
      .single();

    if (error) throw error;
    const blueprintId = data.id;

    // Store in local state cache
    await this.updatePhase(blueprintId, userId, 'qa-collection', qnaResponses);

    return blueprintId;
  }

  /**
   * Transition to Pattern Detection phase
   * Called after Q&A completion
   */
  async beginPatternDetection(blueprintId: string, userId: string, qnaResponses: Record<string, string>): Promise<string[]> {
    // Detect patterns from responses
    const patterns = await this.patternDetector.process({
      responses: qnaResponses,
      userId,
    } as any);

    // Update blueprint
    await supabase
      .from('profiles_blueprints')
      .update({
        detected_patterns: patterns,
        status: 'pattern-detection',
        updated_at: new Date(),
      })
      .eq('id', blueprintId);

    // Update phase
    await this.updatePhase(blueprintId, userId, 'pattern-detection', qnaResponses, patterns as any);

    return (patterns as any) as string[];
  }

  /**
   * WOW 1: First remarkable insight
   * Called after patterns detected
   */
  async generateWOW1(blueprintId: string, userId: string, patterns: string[], qnaResponses: Record<string, string>): Promise<string> {
    // Build personal context
    const context = await this.contextBuilder.process({
      responses: qnaResponses,
      patterns,
      userId,
    } as any);

    // Generate WOW 1 insight
    const wow1Insight = (await (this.insightEngine as any).generateKeyInsight({
      context,
      patterns,
      phase: 'wow-1',
    })) as string;

    // Update blueprint
    await supabase
      .from('profiles_blueprints')
      .update({
        wow_1_insight: wow1Insight,
        status: 'wow-1-ceremony',
        updated_at: new Date(),
      })
      .eq('id', blueprintId);

    // Trigger WOW 1 ceremony UI
    await this.triggerCeremony('wow-1', blueprintId, wow1Insight);

    // Auto-transition after ceremony
    setTimeout(() => this.beginFineTuning(blueprintId, userId), 8000); // 8 seconds for ceremony

    return wow1Insight;
  }

  /**
   * Fine-tuning phase: Refine understanding
   * Automatically called after WOW 1
   */
  async beginFineTuning(blueprintId: string, userId: string): Promise<void> {
    // Fetch current state
    const { data: blueprint } = await supabase
      .from('profiles_blueprints')
      .select('questionnaire_responses, detected_patterns')
      .eq('id', blueprintId)
      .single();

    if (!blueprint) throw new Error('Blueprint not found');

    // Run fine-tuning analysis (could involve Claude or another AI)
    const refinedPatterns = await this.refinePatterns(
      blueprint.questionnaire_responses,
      blueprint.detected_patterns,
      userId
    );

    // Update blueprint
    await supabase
      .from('profiles_blueprints')
      .update({
        refined_patterns: refinedPatterns,
        status: 'fine-tuning',
        updated_at: new Date(),
      })
      .eq('id', blueprintId);

    // Auto-transition to full analysis
    await this.beginFullAnalysis(blueprintId, userId);
  }

  /**
   * Full Analysis: Comprehensive understanding
   * Automatically called after fine-tuning
   */
  async beginFullAnalysis(blueprintId: string, userId: string): Promise<string> {
    // Fetch current state
    const { data: blueprint } = await supabase
      .from('profiles_blueprints')
      .select('questionnaire_responses, detected_patterns, refined_patterns')
      .eq('id', blueprintId)
      .single();

    if (!blueprint) throw new Error('Blueprint not found');

    // Run comprehensive analysis
    const comprehensiveAnalysis = await this.generateComprehensiveAnalysis({
      responses: blueprint.questionnaire_responses,
      patterns: blueprint.refined_patterns || blueprint.detected_patterns,
      userId,
    });

    // Update blueprint
    await supabase
      .from('profiles_blueprints')
      .update({
        comprehensive_analysis: comprehensiveAnalysis,
        status: 'full-analysis',
        updated_at: new Date(),
      })
      .eq('id', blueprintId);

    // Auto-transition to WOW 2
    await this.generateWOW2(blueprintId, userId);

    return comprehensiveAnalysis;
  }

  /**
   * WOW 2: Second remarkable moment
   * Automatically called after full analysis
   */
  async generateWOW2(blueprintId: string, userId: string): Promise<string> {
    // Fetch analysis
    const { data: blueprint } = await supabase
      .from('profiles_blueprints')
      .select('comprehensive_analysis, detected_patterns, questionnaire_responses')
      .eq('id', blueprintId)
      .single();

    if (!blueprint) throw new Error('Blueprint not found');

    // Generate WOW 2 from full analysis
    const wow2Insight = (await (this.insightEngine as any).generateDeepInsight({
      analysis: blueprint.comprehensive_analysis,
      patterns: blueprint.detected_patterns,
      responses: blueprint.questionnaire_responses,
      phase: 'wow-2',
    })) as string;

    // Update blueprint
    await supabase
      .from('profiles_blueprints')
      .update({
        wow_2_insight: wow2Insight,
        status: 'wow-2-moment',
        updated_at: new Date(),
      })
      .eq('id', blueprintId);

    // Trigger WOW 2 ceremony UI
    await this.triggerCeremony('wow-2', blueprintId, wow2Insight);

    // Auto-transition to twin birth ready
    setTimeout(() => this.markTwinBirthReady(blueprintId, userId), 8000);

    return wow2Insight;
  }

  /**
   * Mark as ready for Twin Birth
   * Called after WOW 2 ceremony
   */
  async markTwinBirthReady(blueprintId: string, userId: string): Promise<void> {
    await supabase
      .from('profiles_blueprints')
      .update({
        status: 'twin-birth-ready',
        updated_at: new Date(),
      })
      .eq('id', blueprintId);

    // Notify user that Twin is ready (could trigger notification)
    console.log(`Self Print complete. Ready for Twin birth for user ${userId}`);
  }

  /**
   * Get current Self Print phase for user
   */
  async getCurrentPhase(userId: string): Promise<SelfPrintPhase | null> {
    const { data } = await supabase
      .from('profiles_blueprints')
      .select('status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return (data?.status as SelfPrintPhase) || null;
  }

  /**
   * Check if user has completed Self Print
   */
  async isUserReadyForTwinBirth(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('profiles_blueprints')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'twin-birth-ready')
      .single();

    return !!data;
  }

  // Private methods

  private async updatePhase(
    blueprintId: string,
    userId: string,
    phase: SelfPrintPhase,
    qnaResponses: Record<string, string>,
    patterns?: string[]
  ): Promise<void> {
    // Store in local state for real-time updates
    const state: SelfPrintState = {
      blueprintId,
      userId,
      currentPhase: phase,
      completedPhases: [phase],
      qnaResponses,
      detectedPatterns: patterns || [],
      insights: [],
      analysis: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Could store in localStorage for offline access
    localStorage.setItem(`selfprint-${userId}`, JSON.stringify(state));
  }

  private async refinePatterns(
    _responses: Record<string, string>,
    patterns: string[],
    userId: string
  ): Promise<string[]> {
    try {
      // Get twin to cross-reference patterns with actual decision data
      const { data: twin } = await supabase
        .from('twins')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!twin) return patterns;

      // Use DecisionLearningService to get data-backed patterns
      const learnedPatterns = await analyzeTwinDecisionPatterns(twin.id);
      if (!learnedPatterns || learnedPatterns.length === 0) return patterns;

      // Merge: keep existing patterns, append learned patterns not already present
      const learnedDescriptions = learnedPatterns.map(p => p.pattern || p.world);
      const merged = [...patterns];
      learnedDescriptions.forEach(desc => {
        if (desc && !merged.some(p => p.toLowerCase().includes(desc.toLowerCase()))) {
          merged.push(desc);
        }
      });

      return merged.slice(0, 10); // Cap at 10 patterns
    } catch {
      return patterns;
    }
  }

  private async generateComprehensiveAnalysis(data: {
    responses: Record<string, string>;
    patterns: string[];
    userId: string;
  }): Promise<string> {
    try {
      const { data: twin } = await supabase
        .from('twins')
        .select('id')
        .eq('user_id', data.userId)
        .single();

      // Build analysis from questionnaire responses
      const responseCount = Object.keys(data.responses).length;
      const responseHighlights = Object.entries(data.responses)
        .slice(0, 3)
        .map(([k, v]) => `${k}: ${String(v).slice(0, 80)}`)
        .join('; ');

      let decisionSummary = '';
      if (twin) {
        const insights = await getDecisionInsights(twin.id);
        if (insights && insights.totalDecisions > 0) {
          decisionSummary = ` Decision track record: ${insights.totalDecisions} decisions logged with ${Math.round(insights.successRate)}% success rate across ${insights.bestWorlds?.join(', ') || 'multiple areas'}.`;
        }
      }

      const patternSummary = data.patterns.length > 0
        ? ` Core patterns identified: ${data.patterns.slice(0, 5).join(', ')}.`
        : '';

      return `Comprehensive Self-Print Analysis: Based on ${responseCount} questionnaire responses, your authentic self reveals distinctive characteristics.${patternSummary}${decisionSummary} Key response themes: ${responseHighlights}. This blueprint captures your unique decision-making style, values, and growth trajectory.`;
    } catch {
      return `Self-Print Analysis: ${data.patterns.length} patterns identified across your responses. Your Twin is ready to guide your growth journey.`;
    }
  }

  private async triggerCeremony(type: 'wow-1' | 'wow-2', blueprintId: string, insight: string): Promise<void> {
    // Broadcast event to UI to show ceremony
    // Could use event emitter or broadcast channel
    window.dispatchEvent(new CustomEvent('wow-ceremony', {
      detail: { type, blueprintId, insight }
    }));
  }
}

export const selfPrintOrchestrator = new SelfPrintOrchestrator();

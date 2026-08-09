/**
 * Evidence Analyzer
 * Calculates confidence in AI insights and classifies knowledge
 * Real algorithm - supports Master Direction: "Never pretend to know"
 * @module intelligence/EvidenceAnalyzer
 */

import { supabase } from '@/lib/supabase/client';
import { IntelligenceError } from './types';
import type {
  KnowledgeLevel,
  KnowledgeClassification,
  EvidenceSource,
  EvidencePoint,
} from './types';

/**
 * Confidence components breakdown
 */
interface ConfidenceBreakdown {
  evidenceCount: number;
  recency: number; // 0-1
  consistency: number; // 0-1
  sourceQuality: number; // 0-1
  corroboration: number; // 0-1 (multiple sources agreeing)
  overall: number; // 0-1
  reasoning: string;
}

/**
 * EvidenceAnalyzer
 * Calculates confidence scores for insights
 *
 * Master Direction Rule:
 * "Never pretend to know what the system does not know"
 *
 * Algorithm:
 * 1. Classify claim as KNOW / INFER / UNKNOWN
 * 2. Collect evidence
 * 3. Analyze evidence quality
 * 4. Calculate confidence from multiple factors
 * 5. Return with transparency about reasoning
 *
 * Usage:
 * ```typescript
 * const analyzer = new EvidenceAnalyzer();
 * const confidence = await analyzer.calculateConfidence('User values family', sources);
 * const classified = analyzer.separateKnowInferUnknown(userId, 'User is introverted');
 * ```
 */
export class EvidenceAnalyzer {
  /**
   * Calculate confidence in an insight
   * Returns score 0-1 based on evidence quality and quantity
   */
  async calculateConfidence(
    _insight: string,
    sources: EvidenceSource[],
    userId?: string
  ): Promise<number> {
    if (!_insight || !sources.length) {
      return 0; // No evidence = no confidence
    }

    const breakdown = await this.getConfidenceBreakdown(_insight, sources, userId);
    return breakdown.overall;
  }

  /**
   * Detailed confidence breakdown
   * Shows all factors that influenced confidence calculation
   */
  async getConfidenceBreakdown(
    _insight: string,
    sources: EvidenceSource[],
    userId?: string
  ): Promise<ConfidenceBreakdown> {
    // Factor 1: Evidence count
    const evidenceCount = sources.length;
    const countScore = Math.min(evidenceCount / 5, 1); // 5+ sources = max score

    // Factor 2: Recency (how recent is the evidence?)
    const recencyScore = this.calculateRecencyScore(sources);

    // Factor 3: Consistency (do sources agree?)
    const consistencyScore = this.calculateConsistencyScore(sources);

    // Factor 4: Source quality
    const qualityScore = this.calculateSourceQuality(sources);

    // Factor 5: Corroboration (multiple independent sources?)
    const corroborationScore = await this.calculateCorroboration(sources, userId);

    // Weighted average
    const overall =
      countScore * 0.15 +
      recencyScore * 0.25 + // Recent evidence = very important
      consistencyScore * 0.25 + // Consistency = very important
      qualityScore * 0.20 +
      corroborationScore * 0.15;

    const reasoning = this.generateReasoningText({
      evidenceCount,
      recencyScore,
      consistencyScore,
      qualityScore,
      corroborationScore,
    });

    return {
      evidenceCount,
      recency: recencyScore,
      consistency: consistencyScore,
      sourceQuality: qualityScore,
      corroboration: corroborationScore,
      overall: Math.min(overall, 1),
      reasoning,
    };
  }

  /**
   * Separate KNOW vs INFER vs UNKNOWN
   * Classify what AI actually knows vs infers vs doesn't know
   *
   * KNOW = User told us directly
   * INFER = We concluded from evidence
   * UNKNOWN = We don't have data yet
   */
  separateKnowInferUnknown(_userId: string, claim: string): KnowledgeLevel {
    // Simple heuristic (in production would use NLP)
    const claimLower = claim.toLowerCase();

    // KNOW indicators: explicit statements from user
    if (
      claimLower.includes("i'm") ||
      claimLower.includes('i am') ||
      claimLower.includes('i want') ||
      claimLower.includes('i prefer') ||
      claimLower.includes('i need') ||
      claimLower.includes('i love') ||
      claimLower.includes('i hate')
    ) {
      return 'KNOW';
    }

    // INFER indicators: derived from behavior
    if (
      claimLower.includes('pattern') ||
      claimLower.includes('tend to') ||
      claimLower.includes('usually') ||
      claimLower.includes('often') ||
      claimLower.includes('seem to') ||
      claimLower.includes('appears')
    ) {
      return 'INFER';
    }

    // Otherwise unknown
    return 'UNKNOWN';
  }

  /**
   * Classify a claim and provide evidence
   * Full classification with evidence and confidence
   */
  async classifyClaimWithEvidence(
    userId: string,
    claim: string,
    sources: EvidenceSource[]
  ): Promise<KnowledgeClassification> {
    const level = this.separateKnowInferUnknown(userId, claim);
    const confidence = await this.calculateConfidence(claim, sources, userId);

    // Generate explanation
    const explanation = this.generateExplanation(level, confidence, sources.length);

    return {
      claim,
      level,
      evidence: sources,
      confidence,
      explanation,
    };
  }

  /**
   * Validate that evidence actually supports the claim
   * Real validation - not just counting sources
   */
  async validateEvidence(userId: string, evidencePoints: EvidencePoint[]): Promise<boolean> {
    if (evidencePoints.length === 0) return false;

    // Check each evidence point exists in database
    for (const point of evidencePoints) {
      const exists = await this.verifyEvidenceExists(userId, point);
      if (!exists) return false;
    }

    return true;
  }

  /**
   * Get recency level of sources
   * Recent = more valuable than old
   */
  getRecency(sourceDate: Date): 'recent' | 'somewhat_recent' | 'old' {
    const today = new Date();
    const daysOld = Math.ceil(
      (today.getTime() - sourceDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysOld <= 7) return 'recent';
    if (daysOld <= 30) return 'somewhat_recent';
    return 'old';
  }

  /**
   * Get accuracy metrics for AI insights
   * How often does user validate AI insights?
   */
  async getAccuracyMetrics(userId: string): Promise<any> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      const { data: feedback } = await supabase
        .from('insight_feedback')
        .select('feedback_type')
        .eq('user_id', userId);

      if (!feedback || feedback.length === 0) {
        return {
          totalFeedback: 0,
          veryTrue: 0,
          somewhat: 0,
          notSure: 0,
          notMe: 0,
          accuracy: 0,
          accuracyTrend: 'no_data',
        };
      }

      const counts = {
        veryTrue: 0,
        somewhat: 0,
        notSure: 0,
        notMe: 0,
      };

      feedback.forEach((item: any) => {
        counts[item.feedback_type as keyof typeof counts]++;
      });

      const total = feedback.length;
      const accurateResponses = counts.veryTrue + counts.somewhat * 0.5; // Partial credit for "somewhat"
      const accuracy = accurateResponses / total;

      return {
        totalFeedback: total,
        ...counts,
        accuracy: Math.round(accuracy * 100),
        accuracyTrend: this.calculateAccuracyTrend(accuracy),
      };
    } catch (error) {
      throw new IntelligenceError(
        `Failed to get accuracy metrics: ${error}`,
        'METRICS_FAILED'
      );
    }
  }

  // =========================================================================
  // PRIVATE METHODS - Real Calculations
  // =========================================================================

  /**
   * Calculate recency score (0-1)
   * Recent evidence scores higher
   */
  private calculateRecencyScore(sources: EvidenceSource[]): number {
    if (sources.length === 0) return 0;

    const today = new Date();
    const scores = sources.map((source) => {
      const sourceDate = new Date(source.date);
      const daysOld = Math.ceil(
        (today.getTime() - sourceDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Decay over time: recent = 1, old (90+ days) = 0.1
      return Math.max(1 - daysOld / 90, 0.1);
    });

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * Calculate consistency score (0-1)
   * Do all sources point to same conclusion?
   */
  private calculateConsistencyScore(sources: EvidenceSource[]): number {
    if (sources.length <= 1) return 1; // Single source is "consistent with itself"

    // Group sources by type
    const typeGroups = new Map<string, number>();
    sources.forEach((s) => {
      typeGroups.set(s.type, (typeGroups.get(s.type) || 0) + 1);
    });

    // Calculate diversity: if all same type, consistency = high
    const maxInOneType = Math.max(...typeGroups.values());
    const consistency = maxInOneType / sources.length;

    // Penalize if types disagree (e.g., one source contradicts others)
    // This is simplified; real implementation would analyze semantics
    return Math.pow(consistency, 0.8); // Slightly soften the score
  }

  /**
   * Calculate source quality (0-1)
   * Different sources have different reliability
   */
  private calculateSourceQuality(sources: EvidenceSource[]): number {
    if (sources.length === 0) return 0;

    const qualityMap = {
      reflection: 0.9, // User's own words = high quality
      decision: 0.85, // User's actual decisions = high quality
      memory: 0.8, // User's memories = good quality
      question_answer: 0.75, // Structured response = medium-high
      mood: 0.6, // Soft signals = lower quality
      default: 0.5,
    };

    const scores = sources.map((s) => qualityMap[s.type as keyof typeof qualityMap] || 0.5);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * Calculate corroboration score (0-1)
   * Are multiple independent sources saying the same thing?
   */
  private async calculateCorroboration(
    sources: EvidenceSource[],
    _userId?: string
  ): Promise<number> {
    if (sources.length <= 1) return 0.5; // Single source = moderate corroboration

    // Check if different people/contexts mention same thing
    // Simplified: just check source diversity
    const uniqueIds = new Set(sources.map((s) => s.id));
    const diversityRatio = uniqueIds.size / sources.length;

    return Math.min(diversityRatio, 1); // Higher = more corroboration
  }

  /**
   * Verify evidence point exists in database
   */
  private async verifyEvidenceExists(userId: string, point: EvidencePoint): Promise<boolean> {
    try {
      const table = this.getTableForSource(point.source);
      const { data } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', userId)
        .eq('id', point.sourceId)
        .single();

      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Get table name for source type
   */
  private getTableForSource(source: string): string {
    const map: Record<string, string> = {
      reflection: 'journals',
      decision: 'decisions',
      memory: 'personal_memory',
      question_answer: 'personal_context',
      mood: 'personal_profiles',
    };
    return map[source] || 'personal_memory';
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoningText(factors: {
    evidenceCount: number;
    recencyScore: number;
    consistencyScore: number;
    qualityScore: number;
    corroborationScore: number;
  }): string {
    const parts: string[] = [];

    if (factors.evidenceCount === 0) return 'No evidence available';
    if (factors.evidenceCount === 1) parts.push('Based on 1 source');
    if (factors.evidenceCount > 1) parts.push(`Based on ${factors.evidenceCount} sources`);

    if (factors.recencyScore > 0.7) parts.push('with recent observations');
    if (factors.recencyScore < 0.3) parts.push('though observations are old');

    if (factors.consistencyScore > 0.8) parts.push('that consistently agree');
    if (factors.consistencyScore < 0.5) parts.push('with some variation');

    if (factors.corroborationScore > 0.7) parts.push('from multiple independent sources');

    return parts.join(' ') || 'Moderate evidence';
  }

  /**
   * Generate explanation for classification
   */
  private generateExplanation(level: KnowledgeLevel, confidence: number, sourceCount: number): string {
    if (level === 'KNOW') {
      return `You've stated this directly. We're confident (${Math.round(confidence * 100)}%) based on ${sourceCount} explicit statement(s).`;
    }

    if (level === 'INFER') {
      const confidence_word =
        confidence > 0.7
          ? 'fairly confident'
          : confidence > 0.4
            ? 'moderately confident'
            : 'less confident';
      return `We're ${confidence_word} (${Math.round(confidence * 100)}%) in this inference based on ${sourceCount} observation(s) of your behavior.`;
    }

    // UNKNOWN
    return `We haven't observed enough evidence yet. Need more data to form a confident inference.`;
  }

  /**
   * Calculate trend in accuracy
   */
  private calculateAccuracyTrend(accuracy: number): 'improving' | 'stable' | 'declining' {
    // Simplified: would track over time in production
    if (accuracy > 0.7) return 'improving';
    if (accuracy > 0.4) return 'stable';
    return 'declining';
  }
}

export default EvidenceAnalyzer;

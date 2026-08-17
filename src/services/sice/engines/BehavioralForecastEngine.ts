/**
 * SICE #9: BehavioralForecastEngine (P0 #4 - COMPLETE)
 * Analyzes behavioral patterns and predicts mood trajectories
 * Based on actual Twin memory history and decision outcomes
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput } from '../../../types/sice';

interface MoodEntry {
  timestamp: string;
  mood: string;
  context?: string;
}

interface BehavioralForecast {
  nextMood: string;
  predictedFocus: string;
  risks: string[];
  opportunities: string[];
  summary: string;
  confidence: number;
  baselineAnalysis?: {
    recentMoodCount: number;
    moodTrend: 'improving' | 'declining' | 'stable';
    dominantMood: string;
    moodDiversity: number;
  };
}

export class BehavioralForecastEngine extends SICEBase {
  constructor() {
    super(
      9,
      'BehavioralForecastEngine',
      'Analyzes behavioral patterns and predicts mood trajectories'
    );
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return {
          nextMood: 'balanced',
          predictedFocus: 'self-reflection',
          risks: [],
          opportunities: [],
          confidence: 0,
        };
      }

      try {
        const twinId = (input as any).twinId || (input as any).context?.twinId;
        if (!twinId) {
          throw new Error('Twin ID required for behavioral forecast');
        }

        // Analyze Twin's actual behavioral history
        const moodHistory = await this.analyzeMoodHistory(twinId);
        if (moodHistory.length === 0) {
          return this.generateDefaultForecast(
            'insufficient_data',
            'Not enough behavior history'
          );
        }

        // Detect patterns from history
        const patterns = this.detectPatterns(moodHistory);

        // Predict next mood based on patterns
        const nextMood = this.predictNextMood(patterns, moodHistory);

        // Calculate confidence from data quality
        const confidence = this.calculateConfidence(moodHistory, patterns);

        // Extract risks and opportunities from patterns
        const { risks, opportunities } = this.extractRisksOpportunities(
          patterns,
          moodHistory
        );

        return {
          nextMood,
          predictedFocus: this.determineNextFocus(nextMood, patterns),
          risks,
          opportunities,
          summary: this.generateSummary(nextMood, patterns, confidence),
          confidence,
          baselineAnalysis: {
            recentMoodCount: moodHistory.length,
            moodTrend: this.analyzeTrend(moodHistory),
            dominantMood: this.getDominantMood(moodHistory),
            moodDiversity: new Set(moodHistory.map(m => m.mood)).size,
          },
        };
      } catch (err) {
        this.log('Forecast generation failed', err);
        return {
          nextMood: 'cautious',
          predictedFocus: 'reflection',
          risks: ['Insufficient data for prediction'],
          opportunities: [],
          confidence: 0,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    const confidence = (result as any).confidence || 50;
    return this.createResult(result, confidence, executionTime);
  }

  /**
   * Analyze Twin's mood history from memories (last 30 days)
   */
  private async analyzeMoodHistory(twinId: string): Promise<MoodEntry[]> {
    if (!supabase) return [];

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('twin_memories')
        .select('content, created_at, metadata')
        .eq('twin_id', twinId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      // Extract mood from metadata or parse from content
      return data
        .map((mem: any) => ({
          timestamp: mem.created_at,
          mood: mem.metadata?.mood || this.inferMood(mem.content),
          context: mem.metadata?.context,
        }))
        .filter((entry: any) => entry.mood);
    } catch (err) {
      this.log('Error analyzing mood history:', err);
      return [];
    }
  }

  /**
   * Infer mood from memory content
   */
  private inferMood(content: string): string {
    const lower = content.toLowerCase();

    // Simple heuristics for mood inference
    if (
      lower.includes('great') ||
      lower.includes('happy') ||
      lower.includes('excited')
    ) {
      return 'optimistic';
    }
    if (lower.includes('tired') || lower.includes('exhausted')) {
      return 'fatigued';
    }
    if (lower.includes('confused') || lower.includes('uncertain')) {
      return 'uncertain';
    }
    if (lower.includes('focused') || lower.includes('productive')) {
      return 'focused';
    }
    if (lower.includes('anxious') || lower.includes('worried')) {
      return 'anxious';
    }

    return 'neutral';
  }

  /**
   * Detect patterns from mood history
   */
  private detectPatterns(
    history: MoodEntry[]
  ): Map<string, { count: number; frequency: number }> {
    const patterns = new Map<string, { count: number; frequency: number }>();
    const moodCounts: Record<string, number> = {};

    history.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const total = history.length;
    for (const [mood, count] of Object.entries(moodCounts)) {
      patterns.set(mood, {
        count,
        frequency: count / total,
      });
    }

    return patterns;
  }

  /**
   * Predict next mood based on patterns
   */
  private predictNextMood(
    patterns: Map<string, { count: number; frequency: number }>,
    history: MoodEntry[]
  ): string {
    // Look at recent trend (last 5 entries)
    const recentMoods = history.slice(0, 5).map(m => m.mood);

    // If dominant mood in recent history, predict continuation
    const recentMoodCounts: Record<string, number> = {};
    recentMoods.forEach(m => {
      recentMoodCounts[m] = (recentMoodCounts[m] || 0) + 1;
    });

    let dominantRecent = recentMoods[0];
    let maxCount = 0;
    for (const [mood, count] of Object.entries(recentMoodCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantRecent = mood;
      }
    }

    // Mood transitions: if recently shifted, predict next shift
    if (recentMoods[0] !== recentMoods[1]) {
      // Changing moods - predict stabilization or next shift
      return this.predictTransition(recentMoods, patterns);
    }

    return dominantRecent;
  }

  /**
   * Predict mood transition
   */
  private predictTransition(
    recentMoods: string[],
    _patterns: Map<string, { count: number; frequency: number }>
  ): string {
    // If user went from optimistic → focused, might go to balanced
    const transitions: Record<string, string> = {
      optimistic_focused: 'balanced-growth',
      focused_neutral: 'recovery',
      uncertain_anxious: 'cautious',
      fatigued_neutral: 'recovery',
    };

    const key = `${recentMoods[1]}_${recentMoods[0]}`;
    return transitions[key] || recentMoods[0];
  }

  /**
   * Calculate confidence based on data quality
   */
  private calculateConfidence(
    history: MoodEntry[],
    _patterns: Map<string, { count: number; frequency: number }>
  ): number {
    let confidence = 50; // Base confidence

    // More data = higher confidence
    confidence += Math.min(history.length * 2, 20); // +2 per entry, max +20

    // More consistent patterns = higher confidence
    const patternDiversity = _patterns.size;
    if (patternDiversity <= 2) confidence += 15; // Clear pattern
    else if (patternDiversity <= 4) confidence += 10; // Moderate pattern
    else confidence += 5; // Diverse moods

    // Recent stability = higher confidence
    const lastFiveMoods = history.slice(0, 5).map(m => m.mood);
    const uniqueLastFive = new Set(lastFiveMoods).size;
    if (uniqueLastFive === 1) confidence += 10; // Very stable
    else if (uniqueLastFive === 2) confidence += 5; // Somewhat stable

    return Math.min(confidence, 95); // Cap at 95
  }

  /**
   * Extract risks and opportunities from patterns
   */
  private extractRisksOpportunities(
    patterns: Map<string, { count: number; frequency: number }>,
    history: MoodEntry[]
  ): { risks: string[]; opportunities: string[] } {
    const risks: string[] = [];
    const opportunities: string[] = [];

    const dominantMood = this.getDominantMood(history);

    // Risk detection
    if (dominantMood === 'fatigued') {
      risks.push('Burnout risk - consider rest');
      risks.push('Decision quality may decline');
    }
    if (dominantMood === 'anxious') {
      risks.push('High stress - pause major decisions');
    }
    if (patterns.get('uncertain')?.frequency! > 0.4) {
      risks.push('Confusion pattern - clarify goals');
    }

    // Opportunity detection
    if (dominantMood === 'optimistic') {
      opportunities.push('High energy for new initiatives');
      opportunities.push('Good time for relationship building');
    }
    if (dominantMood === 'focused') {
      opportunities.push('Productivity peak - tackle complex tasks');
      opportunities.push('Deep work opportunity');
    }
    if (history.length > 10) {
      opportunities.push('Sufficient behavior history for learning');
    }

    return {
      risks: risks.length > 0 ? risks : ['None detected'],
      opportunities:
        opportunities.length > 0 ? opportunities : ['Maintain current state'],
    };
  }

  /**
   * Determine next focus area based on mood
   */
  private determineNextFocus(
    mood: string,
    _patterns: Map<string, { count: number; frequency: number }>
  ): string {
    const focusMap: Record<string, string> = {
      optimistic: 'growth-expansion',
      focused: 'execution',
      uncertain: 'clarification',
      anxious: 'stabilization',
      fatigued: 'recovery',
      neutral: 'integration',
      balanced: 'balanced-growth',
    };

    return focusMap[mood] || 'balanced-growth';
  }

  /**
   * Generate summary text
   */
  private generateSummary(
    mood: string,
    patterns: Map<string, { count: number; frequency: number }>,
    confidence: number
  ): string {
    const confidenceLevel = confidence >= 70 ? 'high' : 'moderate';
    const dominant = Array.from(patterns.entries()).sort(
      (a, b) => b[1].frequency - a[1].frequency
    )[0];

    return `Behavioral trajectory shows ${dominant[0]} state (${(dominant[1].frequency * 100).toFixed(0)}%). Next likely mood: ${mood}. Prediction confidence: ${confidenceLevel}.`;
  }

  /**
   * Analyze mood trend direction
   */
  private analyzeTrend(
    history: MoodEntry[]
  ): 'improving' | 'declining' | 'stable' {
    if (history.length < 2) return 'stable';

    const positiveModds = ['optimistic', 'focused', 'balanced'];
    // @ts-ignore - reserved for future trend analysis
    const negativeMoods = ['anxious', 'fatigued', 'uncertain'];

    const recent = history.slice(0, 5).map(m => m.mood);
    const older = history.slice(5, 10).map(m => m.mood);

    const recentPositive = recent.filter(m => positiveModds.includes(m)).length;
    const olderPositive = older.filter(m => positiveModds.includes(m)).length;

    if (recentPositive > olderPositive) return 'improving';
    if (recentPositive < olderPositive) return 'declining';
    return 'stable';
  }

  /**
   * Get dominant mood from history
   */
  private getDominantMood(history: MoodEntry[]): string {
    if (history.length === 0) return 'neutral';

    const counts: Record<string, number> = {};
    history.forEach(entry => {
      counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Generate default forecast when data unavailable
   */
  private generateDefaultForecast(
    _reason: string,
    message: string
  ): BehavioralForecast {
    return {
      nextMood: 'balanced',
      predictedFocus: 'observation',
      risks: [message],
      opportunities: ['Build behavior history for better predictions'],
      summary: `Cannot forecast: ${message}. Confidence: low.`,
      confidence: 20,
    };
  }
}

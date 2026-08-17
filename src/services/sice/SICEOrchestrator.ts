/**
 * SICEOrchestrator.ts
 * Orchestrates all 12 SICE engines in parallel
 * Synthesizes results into PersonalIntelligence
 */

import type {
  SICEInput,
  SICEOutput,
  OrchestratorResult,
  CrossEngineSynthesis,
  FineTunedResult,
  PersonalIntelligence,
} from '../../types/sice';
import { SICEBase } from './SICEBase';
import { PersonalContextBuilder } from './engines/PersonalContextBuilder';
import { PatternDetector } from './engines/PatternDetector';
import { InsightEngine } from './engines/InsightEngine';
import { AIFeedbackLoop } from './engines/AIFeedbackLoop';
import { TwinStateEngine } from './engines/TwinStateEngine';
import { ExperienceEngine } from './engines/ExperienceEngine';
import { EnvironmentEngine } from './engines/EnvironmentEngine';
import { BadgeEngine } from './engines/BadgeEngine';
import { BehavioralForecastEngine } from './engines/BehavioralForecastEngine';
import { FutureSelfEngine } from './engines/FutureSelfEngine';
import { MemoryManagerEngine } from './engines/MemoryManagerEngine';
import { DecisionIntelligenceEngineAdapter } from './engines/DecisionIntelligenceEngineAdapter';

export class SICEOrchestrator {
  private engines: Map<number, SICEBase> = new Map();

  constructor() {
    this.registerEngines();
  }

  /**
   * Register all 12 SICE engines
   * P0 #7.3: All engines now receive currentWorld in SICEInput
   */
  private registerEngines(): void {
    // All 12 SICE Engines (World-aware)
    this.engines.set(1, new PersonalContextBuilder());
    this.engines.set(2, new PatternDetector());
    this.engines.set(3, new InsightEngine());
    this.engines.set(4, new AIFeedbackLoop());
    this.engines.set(5, new TwinStateEngine());
    this.engines.set(6, new ExperienceEngine());
    this.engines.set(7, new EnvironmentEngine());
    this.engines.set(8, new BadgeEngine());
    this.engines.set(9, new BehavioralForecastEngine());
    this.engines.set(10, new FutureSelfEngine());
    this.engines.set(11, new MemoryManagerEngine());
    this.engines.set(12, new DecisionIntelligenceEngineAdapter());
  }

  /**
   * Main orchestration: Run all engines in parallel
   */
  async orchestrate(input: SICEInput): Promise<OrchestratorResult> {
    const startTime = performance.now();

    // Run all engines in parallel
    const resultPromises = Array.from(this.engines.values()).map((engine) =>
      engine
        .process(input)
        .catch((error) => {
          // Return proper SICEOutput shape on error
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`Engine ${engine.name} failed:`, errorMsg);
          return {
            engineId: engine.id,
            engineName: engine.name,
            result: null, // null result for failed engines
            confidence: 0,
            executionTime: 0,
            error: errorMsg,
          };
        })
    );

    const results = await Promise.all(resultPromises);

    // Synthesize results
    const synthesis = this.performCrossEngineSynthesis(results);

    // Fine-tune based on feedback history
    const fineTuned = await this.performFineTuning(input, results);

    // Build personal intelligence (includes world-specific guidance)
    const personalIntelligence = this.buildPersonalIntelligence(
      input,
      results,
      synthesis,
      fineTuned
    );

    const totalExecutionTime = performance.now() - startTime;

    return {
      userId: input.userId,
      timestamp: new Date().toISOString(),
      results,
      synthesis,
      fineTuned,
      personalIntelligence,
      totalExecutionTime: Math.round(totalExecutionTime),
    };
  }

  /**
   * Analyze relationships and agreements between engine outputs
   * Extracts themes from each engine, identifies conflicts, and calculates consensus
   */
  private performCrossEngineSynthesis(
    results: SICEOutput[]
  ): CrossEngineSynthesis {
    // Extract themes from each engine
    const themeMap = new Map<string, { count: number; confidence: number; engines: Set<string> }>();
    const engineThemes: Map<string, Set<string>> = new Map();

    results.forEach((result) => {
      if (result.error) return; // Skip failed engines

      const themes = this.extractThemesFromEngine(result);
      engineThemes.set(result.engineName, new Set(themes));

      themes.forEach((theme) => {
        const existing = themeMap.get(theme) || {
          count: 0,
          confidence: 0,
          engines: new Set(),
        };
        existing.count += 1;
        existing.confidence += result.confidence;
        existing.engines.add(result.engineName);
        themeMap.set(theme, existing);
      });
    });

    // Classify themes: agreements (multiple engines), single engine insights
    const agreements: string[] = [];
    const themes: string[] = [];
    const singleEngineThemes: string[] = [];

    themeMap.forEach((data, theme) => {
      const avgConfidence = data.confidence / data.engines.size;

      if (data.engines.size >= 2 && avgConfidence >= 50) {
        // Multiple engines agree on this theme
        agreements.push(
          `${theme} (${data.engines.size} engines, confidence: ${Math.round(avgConfidence)}%)`
        );
      } else if (avgConfidence >= 60) {
        // Single engine, high confidence
        themes.push(theme);
      } else {
        // Low confidence single engine insights
        singleEngineThemes.push(theme);
      }
    });

    // Identify conflicts (contradictory themes)
    const conflicts = this.identifyConflicts(engineThemes);

    // Calculate overall confidence score
    const successfulEngines = results.filter((r) => !r.error);
    const avgConfidence =
      successfulEngines.length > 0
        ? successfulEngines.reduce((sum, r) => sum + r.confidence, 0) /
          successfulEngines.length
        : 0;

    // Boost confidence if we have high agreement
    const adjustedConfidence = Math.round(
      avgConfidence * 0.7 + (agreements.length > 0 ? 30 : 0)
    );

    return {
      themes: themes.concat(singleEngineThemes).slice(0, 8), // Top 8 themes
      conflicts,
      agreements,
      confidenceScore: Math.min(100, Math.max(0, adjustedConfidence)),
    };
  }

  /**
   * Extract key themes from each engine's output
   * Type-aware extraction based on engine results
   */
  private extractThemesFromEngine(result: SICEOutput): string[] {
    const themes: string[] = [];

    try {
      switch (result.engineId) {
        case 1: // PersonalContextBuilder
          {
            const context = result.result as any;
            if (context?.emotionalState)
              themes.push(`Emotional state: ${context.emotionalState}`);
            if (context?.worldFocus)
              themes.push(`World focus: ${context.worldFocus}`);
            if (Array.isArray(context?.currentGoals)) {
              context.currentGoals.forEach((goal: string) =>
                themes.push(`Goal: ${goal}`)
              );
            }
            if (Array.isArray(context?.strengthAreas)) {
              context.strengthAreas.slice(0, 2).forEach((s: string) =>
                themes.push(`Strength: ${s}`)
              );
            }
          }
          break;

        case 2: // PatternDetector
          {
            const patterns = result.result as any;
            if (Array.isArray(patterns)) {
              patterns.forEach((p: any) => {
                themes.push(`Pattern: ${p.name} (${p.impact})`);
                if (p.frequency)
                  themes.push(`  Frequency: ${p.frequency}x`);
              });
            }
          }
          break;

        case 3: // InsightEngine
          {
            const insights = result.result as any;
            if (Array.isArray(insights)) {
              insights.forEach((i: any) => {
                if (i.title) themes.push(`Insight: ${i.title}`);
                if (i.suggestedAction)
                  themes.push(`  Action: ${i.suggestedAction}`);
              });
            }
          }
          break;

        case 5: // TwinStateEngine
          {
            const state = result.result as any;
            if (state?.mood) themes.push(`Twin mood: ${state.mood}`);
            if (state?.responseStyle)
              themes.push(`Response style: ${state.responseStyle}`);
            if (state?.focusArea)
              themes.push(`Twin focus: ${state.focusArea}`);
          }
          break;

        // Add more engines as they are implemented
        // Cases 4, 6, 7, 8, 9, 10, 11, 12 follow similar pattern

        default:
          // Generic theme extraction for unknown engines
          if (typeof result.result === "string") {
            themes.push(result.result);
          }
          break;
      }
    } catch (err) {
      console.warn(`Failed to extract themes from engine ${result.engineId}:`, err);
    }

    return themes.filter((t) => t.length > 0);
  }

  /**
   * Identify conflicting insights across engines
   * E.g., one engine says "high motivation" while another says "burnout risk"
   */
  private identifyConflicts(engineThemes: Map<string, Set<string>>): string[] {
    const conflicts: string[] = [];
    const enginesArray = Array.from(engineThemes.entries());

    // Check for conflicting emotional/motivational themes
    const emotionalThemes = new Map<string, string[]>();
    enginesArray.forEach(([engine, themes]) => {
      themes.forEach((theme) => {
        const lower = theme.toLowerCase();
        if (lower.includes("mood") || lower.includes("motivation") || lower.includes("state")) {
          const category = "emotional";
          if (!emotionalThemes.has(category)) emotionalThemes.set(category, []);
          emotionalThemes.get(category)!.push(`${engine}: ${theme}`);
        }
      });
    });

    // Report conflicting emotional states
    emotionalThemes.forEach((themes) => {
      if (themes.length >= 2 && themes.length < enginesArray.length) {
        conflicts.push(`Emotional state varies: ${themes.slice(0, 2).join(" vs ")}`);
      }
    });

    return conflicts.slice(0, 3); // Top 3 conflicts
  }

  /**
   * Adjust results based on user feedback history
   * Queries past feedback to adjust engine confidence scores
   */
  private async performFineTuning(
    input: SICEInput,
    results: SICEOutput[]
  ): Promise<FineTunedResult> {
    const adjustments: string[] = [];
    let feedbackHistoryConsidered = 0;

    try {
      // Query feedback history from Supabase
      // Note: Requires sice_feedback table with structure:
      // {user_id, engine_id, feedback_score (0-100), created_at, ...}
      const { supabase } = await import('../../services/supabase-service');

      if (!supabase) {
        return {
          adjustedForFeedback: false,
          feedbackHistoryConsidered: 0,
          adjustments: [],
        };
      }

      const { data: feedbackHistory, error } = await supabase
        .from('sice_feedback')
        .select('engine_id, feedback_score, created_at')
        .eq('user_id', input.userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !feedbackHistory) {
        console.warn('No feedback history available for fine-tuning');
        return {
          adjustedForFeedback: false,
          feedbackHistoryConsidered: 0,
          adjustments: [],
        };
      }

      feedbackHistoryConsidered = feedbackHistory.length;

      // Calculate per-engine accuracy from feedback
      const engineAccuracy = new Map<number, number[]>();
      feedbackHistory.forEach((fb: any) => {
        if (!engineAccuracy.has(fb.engine_id)) {
          engineAccuracy.set(fb.engine_id, []);
        }
        engineAccuracy.get(fb.engine_id)!.push(fb.feedback_score);
      });

      // Apply adjustments to current results based on historical accuracy
      results.forEach((result) => {
        if (result.error) return;

        const historicalScores = engineAccuracy.get(result.engineId);
        if (historicalScores && historicalScores.length >= 2) {
          const avgHistoricalAccuracy =
            historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length;

          // Adjust current confidence based on historical performance
          const adjustment = (avgHistoricalAccuracy - 50) * 0.15; // Max ±7.5% adjustment
          const adjustedConfidence = Math.round(
            Math.min(100, Math.max(0, result.confidence + adjustment))
          );

          if (Math.abs(adjustedConfidence - result.confidence) >= 5) {
            adjustments.push(
              `Engine ${result.engineName}: ${result.confidence} → ${adjustedConfidence}% (based on ${historicalScores.length} feedback points)`
            );
            result.confidence = adjustedConfidence;
          }
        }
      });

      return {
        adjustedForFeedback: adjustments.length > 0,
        feedbackHistoryConsidered,
        adjustments,
      };
    } catch (err) {
      console.error('Fine-tuning error:', err);
      return {
        adjustedForFeedback: false,
        feedbackHistoryConsidered,
        adjustments: [
          `Fine-tuning skipped: ${err instanceof Error ? err.message : String(err)}`,
        ],
      };
    }
  }

  /**
   * Build the final PersonalIntelligence output
   * Extracts key insights, recommendations, and guidance from all engines
   * P0 #7.3: Includes world-specific guidance in recommendations
   */
  private buildPersonalIntelligence(
    input: SICEInput,
    results: SICEOutput[],
    synthesis: CrossEngineSynthesis,
    fineTuned: FineTunedResult
  ): PersonalIntelligence {
    // Extract insights from engine results
    const allInsights: Array<{ text: string; confidence: number; source: string }> = [];
    const recommendations: string[] = [];
    const warnings: string[] = [];

    results.forEach((result) => {
      if (result.error) return;

      // Extract insights based on engine type
      const engineInsights = this.extractInsightsFromEngine(result);
      engineInsights.forEach((insight) => {
        allInsights.push({
          text: insight,
          confidence: result.confidence,
          source: result.engineName,
        });
      });

      // Extract recommendations based on engine type
      const engineRecs = this.extractRecommendationsFromEngine(result);
      recommendations.push(...engineRecs);

      // Extract warnings/cautions
      const engineWarnings = this.extractWarningsFromEngine(result);
      warnings.push(...engineWarnings);
    });

    // Sort insights by confidence and deduplicate
    const topInsights = allInsights
      .sort((a, b) => b.confidence - a.confidence)
      .filter((v, i, a) => a.findIndex((t) => t.text === v.text) === i)
      .slice(0, 5)
      .map((i) => i.text);

    // Prioritize recommendations
    const topRecommendations = recommendations
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3);

    // World-specific guidance
    const worldContext = input.currentWorld
      ? ` within the ${input.currentWorld} world`
      : '';

    // Determine primary recommended action based on synthesis
    let recommendedAction = `Continue self-discovery with Twin${worldContext}`;
    if (synthesis.agreements.length > 0) {
      recommendedAction = `Focus on: ${synthesis.agreements[0].split('(')[0].trim()}${worldContext}`;
    } else if (topRecommendations.length > 0) {
      recommendedAction = topRecommendations[0];
    }

    // Calculate user understanding score
    const userUnderstanding = Math.round(synthesis.confidenceScore * 0.8 + 20); // Weighted

    // Calculate overall confidence (considering fine-tuning adjustments)
    const finalConfidence = Math.round(
      synthesis.confidenceScore * (fineTuned.adjustedForFeedback ? 0.95 : 1.0)
    );

    return {
      userUnderstanding: Math.min(100, userUnderstanding),
      recommendedAction,
      confidence: finalConfidence,
      insights: topInsights,
      nextStepsSuggested: topRecommendations,
      warningsOrCautions: warnings.slice(0, 2),
    };
  }

  /**
   * Extract insights specific to each engine type
   */
  private extractInsightsFromEngine(result: SICEOutput): string[] {
    const insights: string[] = [];

    try {
      switch (result.engineId) {
        case 1: // PersonalContextBuilder
          {
            const context = result.result as any;
            if (context?.strengthAreas?.length > 0) {
              insights.push(`Key strengths: ${context.strengthAreas.slice(0, 2).join(', ')}`);
            }
            if (context?.worldPersonality) {
              insights.push(
                `In the ${context.worldFocus} world, your style is: ${context.worldPersonality.responseStyle}`
              );
            }
          }
          break;

        case 2: // PatternDetector
          {
            const patterns = result.result as any;
            if (Array.isArray(patterns) && patterns.length > 0) {
              const positivePatterns = patterns.filter(
                (p: any) => p.impact === 'positive'
              );
              if (positivePatterns.length > 0) {
                insights.push(
                  `Positive pattern: You're ${positivePatterns[0].name.toLowerCase()}`
                );
              }
            }
          }
          break;

        case 3: // InsightEngine
          {
            const engineInsights = result.result as any;
            if (Array.isArray(engineInsights)) {
              engineInsights.slice(0, 2).forEach((i: any) => {
                if (i.title) insights.push(i.title);
              });
            }
          }
          break;

        case 5: // TwinStateEngine
          {
            const state = result.result as any;
            if (state?.mood) {
              insights.push(
                `Twin is feeling ${state.mood} — ready to ${state.mood === 'playful' ? 'explore' : 'guide'} your journey`
              );
            }
          }
          break;

        default:
          break;
      }
    } catch (err) {
      console.warn(`Failed to extract insights from engine ${result.engineId}:`, err);
    }

    return insights.filter((i) => i.length > 0);
  }

  /**
   * Extract recommendations specific to each engine type
   */
  private extractRecommendationsFromEngine(result: SICEOutput): string[] {
    const recommendations: string[] = [];

    try {
      switch (result.engineId) {
        case 1: // PersonalContextBuilder
          {
            const context = result.result as any;
            if (context?.growthAreas?.length > 0) {
              recommendations.push(
                `Work on: ${context.growthAreas[0]} (growth area)`
              );
            }
            if (context?.currentGoals?.length === 0) {
              recommendations.push('Define clear goals to give Twin better context');
            }
          }
          break;

        case 2: // PatternDetector
          {
            const patterns = result.result as any;
            if (Array.isArray(patterns)) {
              const negativePatterns = patterns.filter(
                (p: any) => p.impact === 'negative'
              );
              if (negativePatterns.length > 0) {
                recommendations.push(
                  `Address: ${negativePatterns[0].name} (recurring challenge)`
                );
              }
            }
          }
          break;

        case 3: // InsightEngine
          {
            const insights = result.result as any;
            if (Array.isArray(insights)) {
              const actionable = insights.find((i: any) => i.actionable);
              if (actionable?.suggestedAction) {
                recommendations.push(actionable.suggestedAction);
              }
            }
          }
          break;

        default:
          break;
      }
    } catch (err) {
      console.warn(`Failed to extract recommendations from engine ${result.engineId}:`, err);
    }

    return recommendations.filter((r) => r.length > 0);
  }

  /**
   * Extract warnings/cautions specific to each engine type
   */
  private extractWarningsFromEngine(result: SICEOutput): string[] {
    const warnings: string[] = [];

    try {
      switch (result.engineId) {
        case 2: // PatternDetector
          {
            const patterns = result.result as any;
            if (Array.isArray(patterns)) {
              const negativePatterns = patterns.filter(
                (p: any) => p.impact === 'negative'
              );
              if (negativePatterns.length > 0) {
                warnings.push(
                  `Caution: ${negativePatterns[0].name} detected`
                );
              }
            }
          }
          break;

        case 5: // TwinStateEngine
          {
            const state = result.result as any;
            if (state?.energy && state.energy < 30) {
              warnings.push('Twin energy is low — take a break');
            }
          }
          break;

        default:
          break;
      }
    } catch (err) {
      console.warn(`Failed to extract warnings from engine ${result.engineId}:`, err);
    }

    return warnings.filter((w) => w.length > 0);
  }

  /**
   * Get status of all engines
   */
  getEngineStatus(): Array<{ id: number; name: string; ready: boolean }> {
    return Array.from(this.engines.values()).map((engine) => ({
      id: engine.id,
      name: engine.name,
      ready: true,
    }));
  }
}

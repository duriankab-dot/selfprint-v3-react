/**
 * SICEOrchestrator.ts
 * Orchestrates all 12 SICE engines in parallel
 * Synthesizes results into PersonalIntelligence
 */

import type {
  SICEInput,
  OrchestratorResult,
  CrossEngineSynthesis,
  FineTunedResult,
  PersonalIntelligence,
} from '../../types/sice';
import { SICEBase } from './SICEBase';
import { PersonalContextBuilder } from './engines/PersonalContextBuilder';
import { PatternDetector } from './engines/PatternDetector';
import { InsightEngine } from './engines/InsightEngine';
import { TwinStateEngine } from './engines/TwinStateEngine';

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
    // Implemented engines (World-aware)
    this.engines.set(1, new PersonalContextBuilder());
    this.engines.set(2, new PatternDetector());
    this.engines.set(3, new InsightEngine());
    this.engines.set(5, new TwinStateEngine());

    // TODO: Implement remaining engines (also use currentWorld context)
    // #4: AIFeedbackLoop
    // #6: ExperienceEngine
    // #7: EnvironmentEngine
    // #8: BadgeEngine
    // #9: BehavioralForecastEngine
    // #10: FutureSelfEngine
    // #11: MemoryManager
    // #12: DecisionIntelligenceEngine
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
   */
  private performCrossEngineSynthesis(
    results: Array<{ result: unknown; confidence: number; error?: string }>
  ): CrossEngineSynthesis {
    // TODO: Implement real synthesis
    // - Find common themes across engines
    // - Identify conflicting outputs
    // - Calculate agreement scores
    // - Determine overall confidence

    return {
      themes: [],
      conflicts: [],
      agreements: [],
      confidenceScore: Math.round(
        results.filter((r) => !r.error).reduce((sum, r) => sum + r.confidence, 0) /
          Math.max(1, results.length)
      ),
    };
  }

  /**
   * Adjust results based on user feedback history
   */
  private async performFineTuning(
    _input: SICEInput,
    _results: Array<unknown>
  ): Promise<FineTunedResult> {
    // TODO: Query feedback history
    // - Get past feedback scores
    // - Adjust engine confidence based on historical accuracy
    // - Apply user-specific preferences

    return {
      adjustedForFeedback: false,
      feedbackHistoryConsidered: 0,
      adjustments: [],
    };
  }

  /**
   * Build the final PersonalIntelligence output
   * P0 #7.3: Includes world-specific guidance in recommendations
   */
  private buildPersonalIntelligence(
    input: SICEInput,
    _results: Array<unknown>,
    synthesis: CrossEngineSynthesis,
    _fineTuned: FineTunedResult
  ): PersonalIntelligence {
    // TODO: Extract key insights from all engines
    // - Combine recommendations from multiple engines
    // - Prioritize by confidence and relevance
    // - Identify warnings/cautions
    // - Apply world-specific guidance (P0 #7.3)

    const worldContext = input.currentWorld ? ` in the ${input.currentWorld} world` : '';
    return {
      userUnderstanding: synthesis.confidenceScore,
      recommendedAction: `Continue self-discovery with Twin${worldContext}`,
      confidence: synthesis.confidenceScore,
      insights: [],
      nextStepsSuggested: [],
      warningsOrCautions: [],
    };
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

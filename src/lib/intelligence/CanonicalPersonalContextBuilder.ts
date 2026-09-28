/**
 * Canonical Personal Context Builder
 * 
 * Facade that composes lib and SICE builders into unified canonical context
 * Implements lib-primary with SICE enrichment strategy
 * 
 * @module lib/intelligence/CanonicalPersonalContextBuilder
 */

import { PersonalContextBuilder as LibPersonalContextBuilder } from './PersonalContextBuilder';
import { PersonalContextBuilder as SicePersonalContextBuilder } from '@/services/sice/engines/PersonalContextBuilder';
import type {
  CanonicalPersonalContext,
  CanonicalBuilderInput,
  CanonicalBuilderResult,
} from '@/types/personalContext';
import { libPersonalContextToCanonical, createEmptyCanonicalContext } from './canonicalAdapter';
import { sicePersonalContextToCanonical, enrichCanonicalWithSice } from '@/services/sice/canonicalAdapter';
import type { SICEInput } from '@/types/sice';
import type { WorldId } from '@/constants/worlds';
import type { PatternType } from '@/lib/intelligence/types';

/**
 * Canonical Personal Context Builder
 * 
 * Combines:
 * - lib PersonalContextBuilder (persistence + inference) as PRIMARY
 * - SICE PersonalContextBuilder (world adaptation) as ENRICHMENT
 * 
 * Usage:
 * ```typescript
 * const builder = new CanonicalPersonalContextBuilder();
 * const result = await builder.getContext({ userId: 'u_123', currentWorld: 'career' });
 * ```
 */
export class CanonicalPersonalContextBuilder {
  private libBuilder: LibPersonalContextBuilder;
  private siceBuilder: SicePersonalContextBuilder;

  constructor() {
    this.libBuilder = new LibPersonalContextBuilder();
    this.siceBuilder = new SicePersonalContextBuilder();
  }

  /**
   * Get canonical personal context for user
   * 
   * Strategy: lib-primary with SICE enrichment
   * 1. Fetch lib context (persistence + inference)
   * 2. Fetch SICE context (world adaptation)
   * 3. Merge: lib fields primary, SICE fields enrich
   * 4. Return unified canonical context
   */
  async getContext(input: CanonicalBuilderInput): Promise<CanonicalBuilderResult> {
    try {
      // Phase 1: Get lib context (primary source)
      const libContext = await this.getLibContext(input);

      // Phase 2: Get SICE enrichment
      const siceContext = await this.getSiceContext(input);

      // Phase 3: Merge (lib-primary with SICE enrichment)
      const canonical = enrichCanonicalWithSice(libContext, siceContext);

      return {
        context: canonical,
        success: true,
        message: 'Canonical context built successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to build canonical context';
      return {
        context: createEmptyCanonicalContext(input.userId, { currentWorld: input.currentWorld }),
        success: false,
        message,
      };
    }
  }

  /**
   * Get lib context (persistence + inference)
   */
  private async getLibContext(input: CanonicalBuilderInput): Promise<CanonicalPersonalContext> {
    const { userId } = input;

    // Use existing lib builder's getContext for existing users
    // For new users, initialize first
    try {
      const libContext = await this.libBuilder.getContext(userId);
      return libPersonalContextToCanonical(libContext, { userId, currentWorld: input.currentWorld });
    } catch {
      // If getContext fails (user not initialized), return empty with lib provenance
      return createEmptyCanonicalContext(userId, { currentWorld: input.currentWorld });
    }
  }

  /**
   * Get SICE enrichment (world adaptation)
   */
  private async getSiceContext(input: CanonicalBuilderInput): Promise<CanonicalPersonalContext> {
    const { userId, currentWorld } = input;

    try {
      const siceInput: SICEInput = {
        userId,
        currentWorld: currentWorld as WorldId | undefined,
        userContext: {
          reflectionContent: undefined,
          timestamp: new Date().toISOString(),
        },
        conversationHistory: [],
        metadata: {},
      };

      const siceOutput = await this.siceBuilder.process(siceInput);

      // Convert SICE output to canonical
      const siceCanonical = sicePersonalContextToCanonical(siceOutput.result as any, { userId });
      return siceCanonical;
    } catch {
      // SICE enrichment failed - return empty SICE context
      return createEmptyCanonicalContext(input.userId, { currentWorld: input.currentWorld });
    }
  }

  /**
   * Initialize context for new user (delegates to lib builder)
   */
  async initialize(input: CanonicalBuilderInput & {
    birthDate: string;
    mood: string;
    onboardingAnswers: Record<string, unknown>;
  }): Promise<CanonicalBuilderResult> {
    try {
      const libResult = await this.libBuilder.initialize({
        userId: input.userId,
        birthDate: new Date(input.birthDate),
        mood: input.mood,
        hubsActive: input.hubsActive,
        hubsSelected: input.hubsActive,
        onboardingAnswers: input.onboardingAnswers as Record<string, string>,
      });

      if (!libResult.success) {
        return {
          context: createEmptyCanonicalContext(input.userId, { currentWorld: input.currentWorld }),
          success: false,
          message: libResult.message,
        };
      }

      // After initialization, get full canonical context
      return this.getContext(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize canonical context';
      return {
        context: createEmptyCanonicalContext(input.userId, { currentWorld: input.currentWorld }),
        success: false,
        message,
      };
    }
  }

  /**
   * Update context from reflection (delegates to lib builder)
   */
  async updateFromReflection(input: {
    userId: string;
    aiAnalysis: {
      newInsights: string[];
      patterns: Array<{
        patternName: string;
        patternType?: PatternType;
        confidence?: number;
        description?: string;
      }>;
    };
    reflectionContent: string;
    timestamp: Date;
  }): Promise<CanonicalPersonalContext> {
    // Delegate to lib builder for persistence
    const libContext = await this.libBuilder.updateFromReflection({
      userId: input.userId,
      aiAnalysis: {
        newInsights: input.aiAnalysis.newInsights,
        patterns: input.aiAnalysis.patterns,
        emotions: [],
        decisions: [],
        suggestedMemories: [],
      },
      reflectionContent: input.reflectionContent,
      timestamp: input.timestamp,
    });

    // Convert to canonical and enrich with SICE
    const canonical = libPersonalContextToCanonical(libContext, { userId: input.userId });
    const siceContext = await this.getSiceContext({ userId: input.userId });
    return enrichCanonicalWithSice(canonical, siceContext);
  }

  /**
   * Get lib builder instance (for direct persistence access)
   */
  getLibBuilder(): LibPersonalContextBuilder {
    return this.libBuilder;
  }

  /**
   * Get SICE builder instance (for direct world adaptation access)
   */
  getSiceBuilder(): SicePersonalContextBuilder {
    return this.siceBuilder;
  }
}

export default CanonicalPersonalContextBuilder;
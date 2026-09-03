/**
 * SICEBridge.ts
 * Bridges SICE Orchestrator output → Intelligence layer
 *
 * Purpose: Take SICE engine results and feed them to lib/intelligence for:
 * - Enhancement (SICE raw data + lib analysis = richer intelligence)
 * - Persistence (behavioral_patterns, user_metadata, etc)
 * - UI consumption (lib versions already integrated with UI)
 *
 * Architecture: SICE ⊘ Orchestrator → SICEBridge → lib/intelligence → Supabase → UI
 */

import type { OrchestratorResult, DetectedPattern, BadgeResult } from '@/types/sice';
import type { BehavioralPattern, EvidencePoint } from '@/lib/intelligence/types';
import { PatternDetector } from '@/lib/intelligence/PatternDetector';
import { BadgeEngine } from '@/lib/intelligence/BadgeEngine';
import { supabase } from '@/lib/supabase/client';

/**
 * SICEBridge — connects orchestrator output to intelligence layer
 */
export class SICEBridge {
  private patternDetector = new PatternDetector();
  private badgeEngine = new BadgeEngine();

  /**
   * Bridge SICE PatternDetector results → lib/intelligence/PatternDetector
   *
   * Process:
   * 1. Extract PatternDetector output from SICE results (engine #2)
   * 2. Convert to BehavioralPattern format
   * 3. Feed to lib PatternDetector for enhancement
   * 4. Persist combined result
   */
  async bridgePatternResults(
    orchestratorResult: OrchestratorResult
  ): Promise<{ success: boolean; patternsProcessed: number; error?: string }> {
    try {
      // Find PatternDetector output (engine #2)
      const patternResult = orchestratorResult.results.find((r) => r.engineId === 2);

      if (!patternResult || patternResult.error) {
        return {
          success: false,
          patternsProcessed: 0,
          error: patternResult?.error || 'PatternDetector engine did not run',
        };
      }

      const detectedPatterns = (patternResult.result as DetectedPattern[]) || [];
      if (detectedPatterns.length === 0) {
        return { success: true, patternsProcessed: 0 };
      }

      // Convert and persist each SICE pattern
      let processed = 0;
      for (const sicePattern of detectedPatterns) {
        try {
          const behavioralPattern = this.convertSICEPatternToBehavioralPattern(
            orchestratorResult.userId,
            sicePattern
          );

          // Feed to lib PatternDetector for enhancement + persistence
          await this.patternDetector.updatePattern(
            orchestratorResult.userId,
            behavioralPattern.patternName,
            behavioralPattern.evidencePoints
          );

          processed++;
        } catch (err) {
          console.warn(`Failed to bridge pattern ${sicePattern.name}:`, err);
          // Continue processing other patterns
        }
      }

      return { success: true, patternsProcessed: processed };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Pattern bridging error:', message);
      return { success: false, patternsProcessed: 0, error: message };
    }
  }

  /**
   * Bridge SICE BadgeEngine results → lib/intelligence/BadgeEngine
   *
   * Process:
   * 1. Extract BadgeEngine output from SICE results (engine #8)
   * 2. Extract unlock signals (which badges should be unlocked)
   * 3. Feed to lib BadgeEngine for idempotent persistence
   */
  async bridgeBadgeResults(
    orchestratorResult: OrchestratorResult
  ): Promise<{ success: boolean; badgesProcessed: number; error?: string }> {
    try {
      // Find BadgeEngine output (engine #8)
      const badgeResult = orchestratorResult.results.find((r) => r.engineId === 8);

      if (!badgeResult || badgeResult.error) {
        return {
          success: false,
          badgesProcessed: 0,
          error: badgeResult?.error || 'BadgeEngine did not run',
        };
      }

      const badgeAnalysis = badgeResult.result as BadgeResult;
      const unlockedBadges = badgeAnalysis?.unlockedBadges || [];

      if (unlockedBadges.length === 0) {
        return { success: true, badgesProcessed: 0 };
      }

      // Extract badge IDs and feed to lib BadgeEngine
      const badgeIds = unlockedBadges
        .map((b: string | { name?: string }) => (typeof b === 'string' ? b : b.name))
        .filter((b): b is string => Boolean(b));

      if (badgeIds.length > 0) {
        // Call lib BadgeEngine to unlock badges idempotently
        await this.badgeEngine.unlockFromSICESignal(badgeIds);
      }

      return { success: true, badgesProcessed: badgeIds.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Badge bridging error:', message);
      return { success: false, badgesProcessed: 0, error: message };
    }
  }

  /**
   * Persist SICE orchestration intelligence state
   *
   * Saves Twin's latest intelligence snapshot for continuity
   */
  async persistOrchestrationResults(
    orchestratorResult: OrchestratorResult
  ): Promise<{ success: boolean; essenceId?: string; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
      }

      const userId = orchestratorResult.userId;
      const pi = orchestratorResult.personalIntelligence;

      // SICERESULTS-001 FIX: 'sice_results' was never a real table — verified
      // against a live pg_tables dump, it doesn't exist under public or
      // selfprint (PostgREST 404, hint pointing at the unrelated
      // 'public.slip_requests' — a false-positive fuzzy match, not the real
      // intended table). migrations/025_create_awakening_essence.sql shows
      // the actual table this data belongs in: 'awakening_essence' has a
      // sice_results JSONB *column* ("ผลลัพธ์จากทั้ง 12 engines") alongside
      // personal_intelligence/synthesis/execution_time — exactly this
      // snapshot's shape. Writing there instead; twin_id is nullable
      // ("NULL ระหว่าง awakening") so omitting it here is fine.
      const { data, error } = await supabase
        .from('awakening_essence')
        .insert({
          user_id: userId,
          personal_intelligence: pi,
          sice_results: orchestratorResult.results,
          synthesis: orchestratorResult.synthesis,
          execution_time: orchestratorResult.totalExecutionTime,
        })
        .select()
        .single();

      if (error) {
        console.warn('Could not save SICE results snapshot:', error);
        // Non-critical — continue
      }

      return {
        success: true,
        essenceId: data?.id,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Persistence error:', message);
      return { success: false, error: message };
    }
  }

  /**
   * Convert SICE DetectedPattern → lib BehavioralPattern
   *
   * Maps SICE pattern structure to lib's richer schema
   */
  private convertSICEPatternToBehavioralPattern(
    userId: string,
    sicePattern: DetectedPattern
  ): BehavioralPattern {
    // Create evidence point from SICE observation
    const evidencePoint: EvidencePoint = {
      date: new Date(sicePattern.lastObserved),
      source: 'explicit_statement', // SICE-detected patterns are explicit detections
      sourceId: `sice-pattern-${sicePattern.name}`,
      excerpt: sicePattern.examples.join('; '),
      confidence: sicePattern.confidence / 100, // Convert 0-100 to 0-1
    };

    return {
      id: crypto.randomUUID(),
      userId,
      patternName: sicePattern.name,
      patternType: 'repeating', // SICE focuses on repeating patterns
      evidencePoints: [evidencePoint],
      frequency: this.frequencyFromCount(sicePattern.frequency),
      lastDetected: new Date(sicePattern.lastObserved),
      confidence: Math.min(sicePattern.confidence / 100, 1), // Normalize to 0-1
      description: `${sicePattern.name} detected by SICE with ${sicePattern.impact} impact`,
      aiInsight: `This is a ${sicePattern.impact} pattern observed ${sicePattern.frequency} times. Examples: ${sicePattern.examples.slice(0, 2).join(', ')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Convert frequency number to human-readable label
   */
  private frequencyFromCount(count: number): string {
    if (count >= 7) return 'daily';
    if (count >= 3) return 'multiple times a week';
    if (count >= 1) return 'weekly';
    return 'occasionally';
  }
}

/**
 * Singleton instance for easy access
 */
export const sICEBridge = new SICEBridge();

/**
 * SICEEngines.test.ts
 * Comprehensive verification suite for all 16 SICE engines
 * Ensures 100% implementation completeness + integration
 */

import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import type { SICEInput, SICEOutput } from '../../../types/sice';
import { SICEOrchestrator } from '../SICEOrchestrator';

// QA-02: src/test/setup.ts installs a GLOBAL vi.mock for
// '../services/sice/SICEOrchestrator' (a stub class whose orchestrate()
// resolves to { results: { engine1: 'result1' }, ... }) so that
// CoreAwakeningService tests don't spin up all 12 engines. That stub was also
// being handed to this file — the one suite whose entire purpose is verifying
// the REAL orchestrator — which is why result.results had no length,
// result.synthesis/personalIntelligence were undefined, and getEngineStatus()
// "was not a function". Opt out of the global mock here.
vi.unmock('../SICEOrchestrator');

// Mock Supabase for test environment (no real network calls).
// Engines 1-12 run against `supabase: null` (same behavior as the previous
// null mock). Engines 13-16 swap in a data-bearing mock client so the
// analysis logic (keyword sentiment/relationships/goals/wellness) and the
// twin_id resolution (twins → twin_memories) are exercised for real.
let mockSupabase: any = null;
vi.mock('../../supabase-service', () => ({
  get supabase() {
    return mockSupabase;
  },
}));

/** Build a table-aware chainable supabase client that resolves rows for the
 *  given tables and empty arrays for anything else. */
function buildMockDataClient(dataByTable: Record<string, unknown[]>) {
  return {
    from: vi.fn((table: string) => {
      const rows = dataByTable[table] ?? [];
      const builder: any = {};
      builder.select = vi.fn(() => builder);
      builder.eq = vi.fn(() => builder);
      builder.order = vi.fn(() => builder);
      builder.limit = vi.fn(() => builder);
      builder.maybeSingle = vi.fn(() =>
        Promise.resolve({ data: rows[0] ?? null, error: null })
      );
      // SELECT queries terminal via .then()
      builder.then = (onFulfilled: (val: { data: unknown[]; error: null }) => void) =>
        Promise.resolve({ data: rows, error: null }).then(onFulfilled);
      return builder;
    }),
  };
}

const EMOTIONAL_MEMORIES = [
  { content: 'I feel happy and grateful today, really proud of myself', created_at: '2026-09-01T00:00:00Z' },
  { content: 'Feeling stressed and anxious about work deadline', created_at: '2026-08-30T00:00:00Z' },
];

const SOCIAL_MEMORIES = [
  { content: 'My best friend and I had dinner, family is great', created_at: '2026-09-01T00:00:00Z' },
  { content: 'Work meeting with my team today, my boss praised me', created_at: '2026-08-30T00:00:00Z' },
];

const GOAL_MEMORIES = [
  { content: 'My goal is to finish the course, I achieved a milestone', created_at: '2026-09-01T00:00:00Z' },
  { content: 'Planning a new career target, learning new skills', created_at: '2026-08-30T00:00:00Z' },
];

const WELLNESS_MEMORIES = [
  { content: 'I exercised and slept well, feeling calm and peaceful', created_at: '2026-09-01T00:00:00Z' },
  { content: 'Stressful day, need meditation and to relax with friends', created_at: '2026-08-30T00:00:00Z' },
];

// Engine imports for direct testing
import { PersonalContextBuilder } from '../engines/PersonalContextBuilder';
import { PatternDetector } from '../engines/PatternDetector';
import { InsightEngine } from '../engines/InsightEngine';
import { AIFeedbackLoop } from '../engines/AIFeedbackLoop';
import { TwinStateEngine } from '../engines/TwinStateEngine';
import { ExperienceEngine } from '../engines/ExperienceEngine';
import { EnvironmentEngine } from '../engines/EnvironmentEngine';
import { BadgeEngine } from '../engines/BadgeEngine';
import { BehavioralForecastEngine } from '../engines/BehavioralForecastEngine';
import { FutureSelfEngine } from '../engines/FutureSelfEngine';
import { MemoryManagerEngine } from '../engines/MemoryManagerEngine';
import { DecisionIntelligenceEngineAdapter } from '../engines/DecisionIntelligenceEngineAdapter';
import { EmotionalIntelligenceEngine } from '../engines/EmotionalIntelligenceEngine';
import { SocialConnectionEngine } from '../engines/SocialConnectionEngine';
import { GoalTrackingEngine } from '../engines/GoalTrackingEngine';
import { WellnessEngine } from '../engines/WellnessEngine';

describe('SICE Engines - Complete Verification (16/16)', () => {
  const testInput: SICEInput = {
    userId: 'test-user-12-engines',
    currentWorld: 'career',
    conversationHistory: [
      { role: 'user', content: 'I need career guidance' },
    ],
    metadata: {
      userInput: 'Help me decide on career next steps',
      timestamp: new Date().toISOString(),
    },
  };

  describe('1. PersonalContextBuilder', () => {
    it('should build personal context with world awareness', async () => {
      const engine = new PersonalContextBuilder();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(1);
      expect(result.engineName).toBe('PersonalContextBuilder');
      expect(result.result).toBeTruthy();

      const context = result.result as any;
      expect(context.emotionalState).toBeDefined();
      expect(context.worldFocus).toBeDefined();
      expect(Array.isArray(context.currentGoals)).toBe(true);
      expect(Array.isArray(context.strengthAreas)).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('2. PatternDetector', () => {
    it('should detect behavioral patterns', async () => {
      const engine = new PatternDetector();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(2);
      expect(result.engineName).toBe('PatternDetector');
      expect(Array.isArray(result.result)).toBe(true);

      const patterns = result.result as any[];
      if (patterns.length > 0) {
        expect(patterns[0].name).toBeDefined();
        expect(patterns[0].impact).toMatch(/positive|negative|neutral/);
      }
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('3. InsightEngine', () => {
    it('should generate actionable insights', async () => {
      const engine = new InsightEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(3);
      expect(result.engineName).toBe('InsightEngine');
      expect(Array.isArray(result.result)).toBe(true);

      const insights = result.result as any[];
      if (insights.length > 0) {
        expect(insights[0].title).toBeDefined();
        expect(typeof insights[0].actionable).toBe('boolean');
      }
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('4. AIFeedbackLoop', () => {
    it('should process and incorporate user feedback', async () => {
      const engine = new AIFeedbackLoop();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(4);
      expect(result.engineName).toBe('AIFeedbackLoop');
      expect(result.result).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('5. TwinStateEngine', () => {
    it('should track and maintain Twin state', async () => {
      const engine = new TwinStateEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(5);
      expect(result.engineName).toBe('TwinStateEngine');

      const state = result.result as any;
      expect(state.mood).toBeDefined();
      expect(state.responseStyle).toBeDefined();
      expect(typeof state.energy).toBe('number');
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('6. ExperienceEngine', () => {
    it('should optimize user experience rendering', async () => {
      const engine = new ExperienceEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(6);
      expect(result.engineName).toBe('ExperienceEngine');
      expect(result.result).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('7. EnvironmentEngine', () => {
    it('should analyze contextual environment', async () => {
      const engine = new EnvironmentEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(7);
      expect(result.engineName).toBe('EnvironmentEngine');
      expect(result.result).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('8. BadgeEngine', () => {
    it('should track and generate achievement badges', async () => {
      const engine = new BadgeEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(8);
      expect(result.engineName).toBe('BadgeEngine');
      expect(Array.isArray(result.result) || typeof result.result === 'object').toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('9. BehavioralForecastEngine', () => {
    it('should forecast behavioral outcomes', async () => {
      const engine = new BehavioralForecastEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(9);
      expect(result.engineName).toBe('BehavioralForecastEngine');
      expect(result.result).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('10. FutureSelfEngine', () => {
    it('should project future self scenarios', async () => {
      const engine = new FutureSelfEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(10);
      expect(result.engineName).toBe('FutureSelfEngine');
      expect(result.result).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('11. MemoryManagerEngine', () => {
    it('should manage and retrieve contextual memories', async () => {
      const engine = new MemoryManagerEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(11);
      expect(result.engineName).toBe('MemoryManagerEngine');
      expect(result.result).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('12. DecisionIntelligenceEngineAdapter', () => {
    it('should synthesize decision intelligence', async () => {
      const engine = new DecisionIntelligenceEngineAdapter();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(12);
      expect(result.engineName).toBe('DecisionIntelligenceEngineAdapter');
      expect(result.result).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('13. EmotionalIntelligenceEngine', () => {
    afterEach(() => {
      mockSupabase = null;
    });

    it('should analyze emotional patterns from twin memories', async () => {
      mockSupabase = buildMockDataClient({
        twins: [{ id: 'twin-test-1', user_id: testInput.userId }],
        twin_memories: EMOTIONAL_MEMORIES,
      });

      const engine = new EmotionalIntelligenceEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(13);
      expect(result.engineName).toBe('EmotionalIntelligenceEngine');
      expect(result.result).toBeTruthy();

      const r = result.result as any;
      expect(typeof r.emotionalAwareness).toBe('number');
      expect(r.emotionalAwareness).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(r.regulationSkills)).toBe(true);
      expect(Array.isArray(r.recommendedExercises)).toBe(true);

      // Must resolve the real twin_id (never the hardcoded empty string P0 fix)
      expect(mockSupabase.from).toHaveBeenCalledWith('twins');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should return the empty state when no memories exist', async () => {
      mockSupabase = buildMockDataClient({
        twins: [{ id: 'twin-test-1', user_id: testInput.userId }],
        twin_memories: [],
      });

      const engine = new EmotionalIntelligenceEngine();
      const result = await engine.process(testInput);

      expect(result.result).toBeTruthy();
      expect((result.result as any).emotionalAwareness).toBe(50);
    });
  });

  describe('14. SocialConnectionEngine', () => {
    afterEach(() => {
      mockSupabase = null;
    });

    it('should analyze social connections from twin memories', async () => {
      mockSupabase = buildMockDataClient({
        twins: [{ id: 'twin-test-1', user_id: testInput.userId }],
        twin_memories: SOCIAL_MEMORIES,
      });

      const engine = new SocialConnectionEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(14);
      expect(result.engineName).toBe('SocialConnectionEngine');
      expect(result.result).toBeTruthy();

      const r = result.result as any;
      expect(typeof r.totalRelationships).toBe('number');
      expect(Array.isArray(r.strongestConnections)).toBe(true);
      expect(typeof r.socialHealthScore).toBe('number');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should return the empty state when no memories exist', async () => {
      mockSupabase = buildMockDataClient({
        twins: [{ id: 'twin-test-1', user_id: testInput.userId }],
        twin_memories: [],
      });

      const engine = new SocialConnectionEngine();
      const result = await engine.process(testInput);

      expect(result.result).toBeTruthy();
      expect((result.result as any).totalRelationships).toBe(0);
      expect((result.result as any).socialHealthScore).toBe(50);
    });
  });

  describe('15. GoalTrackingEngine', () => {
    afterEach(() => {
      mockSupabase = null;
    });

    it('should track goals from twin memories', async () => {
      mockSupabase = buildMockDataClient({
        twins: [{ id: 'twin-test-1', user_id: testInput.userId }],
        twin_memories: GOAL_MEMORIES,
      });

      const engine = new GoalTrackingEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(15);
      expect(result.engineName).toBe('GoalTrackingEngine');
      expect(result.result).toBeTruthy();

      const r = result.result as any;
      expect(typeof r.activeGoals).toBe('number');
      expect(typeof r.completionRate).toBe('number');
      expect(typeof r.goalCategories).toBe('object');
      expect(Array.isArray(r.nextRecommendedGoals)).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should return the empty state when no memories exist', async () => {
      mockSupabase = buildMockDataClient({
        twins: [{ id: 'twin-test-1', user_id: testInput.userId }],
        twin_memories: [],
      });

      const engine = new GoalTrackingEngine();
      const result = await engine.process(testInput);

      expect(result.result).toBeTruthy();
      expect((result.result as any).activeGoals).toBe(0);
    });
  });

  describe('16. WellnessEngine', () => {
    afterEach(() => {
      mockSupabase = null;
    });

    it('should analyze wellness across dimensions', async () => {
      mockSupabase = buildMockDataClient({
        twins: [{ id: 'twin-test-1', user_id: testInput.userId }],
        twin_memories: WELLNESS_MEMORIES,
      });

      const engine = new WellnessEngine();
      const result = await engine.process(testInput);

      expect(result).toBeDefined();
      expect(result.engineId).toBe(16);
      expect(result.engineName).toBe('WellnessEngine');
      expect(result.result).toBeTruthy();

      const r = result.result as any;
      expect(typeof r.overallWellness).toBe('number');
      expect(Array.isArray(r.dimensions)).toBe(true);
      expect(Array.isArray(r.immediateActions)).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should return the empty state when no memories exist', async () => {
      mockSupabase = buildMockDataClient({
        twins: [{ id: 'twin-test-1', user_id: testInput.userId }],
        twin_memories: [],
      });

      const engine = new WellnessEngine();
      const result = await engine.process(testInput);

      expect(result.result).toBeTruthy();
      expect((result.result as any).overallWellness).toBe(50);
    });
  });

  describe('SICE Orchestrator - All 16 Engines Integrated', () => {
    it('should orchestrate all 16 engines in parallel', async () => {
      const orchestrator = new SICEOrchestrator();
      const result = await orchestrator.orchestrate(testInput);

      expect(result).toBeDefined();
      expect(result.results).toHaveLength(16);
      expect(result.userId).toBe(testInput.userId);
      expect(result.timestamp).toBeDefined();
      expect(result.totalExecutionTime).toBeGreaterThan(0);
    });

    it('should synthesize cross-engine results', async () => {
      const orchestrator = new SICEOrchestrator();
      const result = await orchestrator.orchestrate(testInput);

      expect(result.synthesis).toBeDefined();
      expect(result.synthesis.themes).toBeDefined();
      expect(Array.isArray(result.synthesis.agreements)).toBe(true);
      expect(typeof result.synthesis.confidenceScore).toBe('number');
    });

    it('should build personal intelligence from all engines', async () => {
      const orchestrator = new SICEOrchestrator();
      const result = await orchestrator.orchestrate(testInput);

      expect(result.personalIntelligence).toBeDefined();
      expect(typeof result.personalIntelligence.userUnderstanding).toBe('number');
      expect(typeof result.personalIntelligence.confidence).toBe('number');
      expect(typeof result.personalIntelligence.recommendedAction).toBe('string');
      expect(Array.isArray(result.personalIntelligence.insights)).toBe(true);
    });

    it('should handle engine errors gracefully', async () => {
      const orchestrator = new SICEOrchestrator();
      const malformedInput: SICEInput = {
        userId: '', // Invalid
        metadata: { timestamp: new Date().toISOString() },
      };

      // Should still return result even with invalid input
      const result = await orchestrator.orchestrate(malformedInput);
      expect(result).toBeDefined();
    });

    it('should complete orchestration within performance budget', async () => {
      const orchestrator = new SICEOrchestrator();
      const startTime = performance.now();

      const result = await orchestrator.orchestrate(testInput);

      const duration = performance.now() - startTime;
      // All 12 engines in parallel (serial Supabase calls in tests) ~20-30s
      // In production with proper DB connection: ~5-10s
      expect(duration).toBeLessThan(40000);
      expect(result.totalExecutionTime).toBeLessThan(40000);
    });
  });

  describe('SICE Engine Status', () => {
    it('should report all 16 engines ready', () => {
      const orchestrator = new SICEOrchestrator();
      const engines = orchestrator.getEngineStatus();

      expect(engines).toHaveLength(16);
      expect(engines.every((e) => e.ready === true)).toBe(true);

      // Verify engine IDs and names
      const engineMap = new Map(engines.map((e) => [e.id, e.name]));
      expect(engineMap.get(1)).toBe('PersonalContextBuilder');
      expect(engineMap.get(2)).toBe('PatternDetector');
      expect(engineMap.get(3)).toBe('InsightEngine');
      expect(engineMap.get(4)).toBe('AIFeedbackLoop');
      expect(engineMap.get(5)).toBe('TwinStateEngine');
      expect(engineMap.get(6)).toBe('ExperienceEngine');
      expect(engineMap.get(7)).toBe('EnvironmentEngine');
      expect(engineMap.get(8)).toBe('BadgeEngine');
      expect(engineMap.get(9)).toBe('BehavioralForecastEngine');
      expect(engineMap.get(10)).toBe('FutureSelfEngine');
      expect(engineMap.get(11)).toBe('MemoryManagerEngine');
      expect(engineMap.get(12)).toBe('DecisionIntelligenceEngineAdapter');
      expect(engineMap.get(13)).toBe('EmotionalIntelligenceEngine');
      expect(engineMap.get(14)).toBe('SocialConnectionEngine');
      expect(engineMap.get(15)).toBe('GoalTrackingEngine');
      expect(engineMap.get(16)).toBe('WellnessEngine');
    });
  });
});

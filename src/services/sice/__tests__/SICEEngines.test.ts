/**
 * SICEEngines.test.ts
 * Comprehensive verification suite for all 12 SICE engines
 * Ensures 100% implementation completeness + integration
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
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

// Mock Supabase for test environment (no real network calls)
vi.mock('../../supabase-service', () => ({
  supabase: null, // Mock: Supabase unavailable in test env
}));

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

describe('SICE Engines - Complete Verification (12/12)', () => {
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

  describe('SICE Orchestrator - All 12 Engines Integrated', () => {
    it('should orchestrate all 12 engines in parallel', async () => {
      const orchestrator = new SICEOrchestrator();
      const result = await orchestrator.orchestrate(testInput);

      expect(result).toBeDefined();
      expect(result.results).toHaveLength(12);
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
    it('should report all 12 engines ready', () => {
      const orchestrator = new SICEOrchestrator();
      const engines = orchestrator.getEngineStatus();

      expect(engines).toHaveLength(12);
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
    });
  });
});

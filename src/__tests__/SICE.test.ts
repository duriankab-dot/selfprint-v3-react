/**
 * SICE.test.ts
 * Unit tests for 12 SICE engines and orchestrator
 */

import { describe, it, expect } from 'vitest';
import { SICEBase } from '../services/sice/SICEBase';
import { SICEOrchestrator } from '../services/sice/SICEOrchestrator';
import { PersonalContextBuilder } from '../services/sice/engines/PersonalContextBuilder';
import { processSICE, getSICEStatus } from '../api/sice/process';
import { SICEInput } from '../types/sice';

describe('SICEBase', () => {
  let engine: SICEBase;

  beforeEach(() => {
    engine = new PersonalContextBuilder();
  });

  it('should have correct metadata', () => {
    expect(engine.id).toBe(1);
    expect(engine.name).toBe('PersonalContextBuilder');
    expect(engine.description).toBeDefined();
  });

  it('should validate input', () => {
    const validInput: SICEInput = { userId: 'user_1' };
    const invalidInput: SICEInput = { userId: '' };

    expect((engine as any).validateInput(validInput)).toBe(true);
    expect((engine as any).validateInput(invalidInput)).toBe(false);
  });

  it('should create result with valid confidence', () => {
    const result = (engine as any).createResult({ data: 'test' }, 150, 100); // 150 > 100
    expect(result.confidence).toBe(100); // Clamped to 100
  });

  it('should measure execution time', async () => {
    const { result, executionTime } = await (engine as any).measureExecution(async () => {
      await new Promise((r) => setTimeout(r, 10));
      return 'done';
    });

    expect(result).toBe('done');
    expect(executionTime).toBeGreaterThanOrEqual(10);
  });
});

describe('PersonalContextBuilder', () => {
  let engine: PersonalContextBuilder;

  beforeEach(() => {
    engine = new PersonalContextBuilder();
  });

  it('should process valid input', async () => {
    const input: SICEInput = {
      userId: 'user_1',
      currentWorld: 'SELF',
    };

    const output = await engine.process(input);

    expect(output.engineId).toBe(1);
    expect(output.engineName).toBe('PersonalContextBuilder');
    expect(output.confidence).toBeGreaterThanOrEqual(0);
    expect(output.confidence).toBeLessThanOrEqual(100);
    expect(output.executionTime).toBeGreaterThanOrEqual(0);
  });

  it('should handle missing userId', async () => {
    const input: SICEInput = { userId: '' };
    const output = await engine.process(input);

    expect(output.result).toBeNull();
  });
});

describe('SICEOrchestrator', () => {
  let orchestrator: SICEOrchestrator;

  beforeEach(() => {
    orchestrator = new SICEOrchestrator();
  });

  it('should register engines', () => {
    const status = orchestrator.getEngineStatus();
    expect(status.length).toBeGreaterThan(0);
  });

  it('should orchestrate with valid input', async () => {
    const input: SICEInput = {
      userId: 'user_1',
      currentWorld: 'SELF',
    };

    const result = await orchestrator.orchestrate(input);

    expect(result.userId).toBe('user_1');
    expect(result.results).toBeDefined();
    expect(result.synthesis).toBeDefined();
    expect(result.fineTuned).toBeDefined();
    expect(result.personalIntelligence).toBeDefined();
    expect(result.totalExecutionTime).toBeGreaterThanOrEqual(0);
  });

  it('should return synthesis with confidence score', async () => {
    const input: SICEInput = { userId: 'user_1' };
    const result = await orchestrator.orchestrate(input);

    expect(result.synthesis.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.synthesis.confidenceScore).toBeLessThanOrEqual(100);
  });

  it('should build personal intelligence', async () => {
    const input: SICEInput = { userId: 'user_1' };
    const result = await orchestrator.orchestrate(input);

    expect(result.personalIntelligence.userUnderstanding).toBeGreaterThanOrEqual(0);
    expect(result.personalIntelligence.confidence).toBeGreaterThanOrEqual(0);
    expect(result.personalIntelligence.recommendedAction).toBeDefined();
  });
});

describe('SICE API', () => {
  describe('processSICE', () => {
    it('should fail with missing userId', async () => {
      const result = await processSICE({
        userId: '',
        userInput: 'test',
      });

      expect(result.success).toBe(false);
    });

    it('should process valid request', async () => {
      const result = await processSICE({
        userId: 'user_1',
        userInput: 'How am I doing?',
        currentWorld: 'SELF',
      });

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.results).toBeDefined();
    });

    it('should include execution time', async () => {
      const result = await processSICE({
        userId: 'user_1',
      });

      expect(result.result?.totalExecutionTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSICEStatus', () => {
    it('should return engine status', async () => {
      const result = await getSICEStatus();

      expect(result.success).toBe(true);
      expect(result.engines).toBeDefined();
      expect(result.engines?.length).toBeGreaterThan(0);
    });

    it('should list ready engines', async () => {
      const result = await getSICEStatus();

      result.engines?.forEach((engine) => {
        expect(engine.id).toBeGreaterThan(0);
        expect(engine.name).toBeDefined();
        expect(engine.ready).toBe(true);
      });
    });
  });
});

describe('SICE Performance', () => {
  it('should complete orchestration within 3 seconds', async () => {
    const orchestrator = new SICEOrchestrator();
    const input: SICEInput = { userId: 'user_1' };

    const start = performance.now();
    const result = await orchestrator.orchestrate(input);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(3000);
    expect(result.totalExecutionTime).toBeLessThan(3000);
  });
});

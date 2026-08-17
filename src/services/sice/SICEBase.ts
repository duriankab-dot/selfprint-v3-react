/**
 * SICEBase.ts
 * Abstract base class for all SICE engines
 */

import type { SICEInput, SICEOutput, ISICEEngine } from '../../types/sice';

export abstract class SICEBase implements ISICEEngine {
  readonly id: number;
  readonly name: string;
  readonly description: string;

  constructor(id: number, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  /**
   * Main processing method - implemented by subclasses
   */
  abstract process(input: SICEInput): Promise<SICEOutput>;

  /**
   * Validate input data
   */
  protected validateInput(input: SICEInput): boolean {
    if (!input.userId) {
      return false;
    }
    return true;
  }

  /**
   * Create result object with metadata
   */
  protected createResult(
    result: unknown,
    confidence: number,
    executionTime: number,
    error?: string
  ): SICEOutput {
    return {
      engineId: this.id,
      engineName: this.name,
      result,
      confidence: Math.min(100, Math.max(0, confidence)),
      executionTime,
      error,
    };
  }

  /**
   * Log execution for debugging
   */
  protected log(message: string, data?: unknown): void {
    if (typeof window !== 'undefined') {
      console.log(`[SICE #${this.id} ${this.name}] ${message}`, data || '');
    }
  }

  /**
   * Measure execution time
   */
  protected async measureExecution<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; executionTime: number }> {
    const start = performance.now();
    const result = await fn();
    const executionTime = performance.now() - start;
    return { result, executionTime };
  }
}

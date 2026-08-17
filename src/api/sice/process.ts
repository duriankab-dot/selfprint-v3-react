/**
 * api/sice/process.ts
 * API endpoint for SICE orchestration
 * POST /api/sice/process
 */

import type { SICEInput, OrchestratorResult } from '../../types/sice';
import type { WorldId } from '../../constants/worlds';
import { SICEOrchestrator } from '../../services/sice/SICEOrchestrator';

export interface SICEProcessRequest {
  userId: string;
  userInput?: string;
  currentWorld?: WorldId;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface SICEProcessResponse {
  success: boolean;
  result?: OrchestratorResult;
  message: string;
}

/**
 * Process user input through 12 SICE engines
 */
export async function processSICE(
  request: SICEProcessRequest
): Promise<SICEProcessResponse> {
  try {
    const { userId, userInput, currentWorld, conversationHistory } = request;

    if (!userId) {
      return {
        success: false,
        message: 'User ID required',
      };
    }

    // TODO: Validate request (rate limiting, permissions, etc)

    // Build SICE input
    const input: SICEInput = {
      userId,
      conversationHistory,
      currentWorld,
      metadata: {
        userInput,
        timestamp: new Date().toISOString(),
      },
    };

    // Create orchestrator and run
    const orchestrator = new SICEOrchestrator();
    const result = await orchestrator.orchestrate(input);

    // TODO: Save result to Supabase for history
    // - Store in sice_results table
    // - Link to user and conversation

    // TODO: Use result to enhance Twin response
    // - Extract personalIntelligence
    // - Include confidence scores
    // - Apply recommendations

    return {
      success: true,
      result,
      message: `SICE processing complete (${result.totalExecutionTime}ms)`,
    };
  } catch (error) {
    console.error('Error processing SICE:', error);
    return {
      success: false,
      message: `SICE processing failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get SICE engine status
 */
export async function getSICEStatus(): Promise<{
  success: boolean;
  engines?: Array<{ id: number; name: string; ready: boolean }>;
  message: string;
}> {
  try {
    const orchestrator = new SICEOrchestrator();
    const engines = orchestrator.getEngineStatus();

    return {
      success: true,
      engines,
      message: `${engines.length} SICE engines ready`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to get SICE status',
    };
  }
}

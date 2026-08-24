/**
 * api/sice/process.ts
 * API endpoint for SICE orchestration
 * POST /api/sice/process
 */

import type { SICEInput, OrchestratorResult } from '../../types/sice';
import type { WorldId } from '../../constants/worlds';
import { SICEOrchestrator } from '../../services/sice/SICEOrchestrator';
import { supabase } from '../../lib/supabase/client';
import { rateLimitMiddleware } from '../../middleware/rate-limit-middleware';

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

    // Rate limiting — 20 req/min per user for SICE (CPU-heavy endpoint)
    const rateCheck = await rateLimitMiddleware(userId, '/api/sice/process', '');
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: `Rate limit exceeded. Retry after ${rateCheck.retryAfter ?? 60}s.`,
      };
    }

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

    // Save SICE result summary to twin_memories for history and Twin continuity
    try {
      const { data: twin } = await supabase
        .from('twins')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (twin) {
        const pi = result.personalIntelligence;
        const memorySummary = [
          `SICE Analysis (${result.results.length} engines, ${result.totalExecutionTime}ms):`,
          `Understanding: ${pi.userUnderstanding}% | Confidence: ${pi.confidence}%`,
          `Action: ${pi.recommendedAction}`,
          pi.insights.length > 0 ? `Insights: ${pi.insights.slice(0, 3).join('; ')}` : '',
        ].filter(Boolean).join(' | ');

        await supabase.from('twin_memories').insert({
          twin_id: twin.id,
          type: 'sice_analysis',
          content: memorySummary,
          emotional_valence: (pi.confidence - 50) / 50, // -1 to 1 scale
          created_at: result.timestamp,
        });
      }
    } catch {
      // Non-critical — SICE processing already complete
    }

    // Enhance response with personalIntelligence for Twin to use
    const enhancedMessage = [
      `SICE processing complete (${result.totalExecutionTime}ms).`,
      `Twin understanding: ${result.personalIntelligence.userUnderstanding}%.`,
      result.personalIntelligence.recommendedAction
        ? `Focus: ${result.personalIntelligence.recommendedAction}`
        : '',
    ].filter(Boolean).join(' ');

    return {
      success: true,
      result,
      message: enhancedMessage,
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
  } catch {
    return {
      success: false,
      message: 'Failed to get SICE status',
    };
  }
}

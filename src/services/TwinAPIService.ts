/**
 * TwinAPIService.ts
 * Claude API integration for Twin responses (world-aware)
 * Phase F: Decision intelligence endpoints
 * Phase G: Security hardening
 */

import { buildTwinSystemPrompt } from '../config/twin-prompts';
import * as DecisionLearningService from './DecisionLearningService';
import type { WorldId } from '../constants/worlds';

/**
 * Input validation helper
 */
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== 'string' || userId.length < 1) {
    throw new Error('Invalid user ID');
  }
  // Prevent SQL injection: only alphanumeric and hyphens
  if (!/^[a-zA-Z0-9\-]+$/.test(userId)) {
    throw new Error('Invalid user ID format');
  }
}

/**
 * Validate world ID against known worlds
 */
function validateWorldId(world: WorldId): void {
  if (!world || typeof world !== 'string') {
    throw new Error('Invalid world ID');
  }
  // WorldId type ensures compile-time validation
  // Runtime check: length sanity
  if (world.length > 50) {
    throw new Error('Invalid world ID length');
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Call Claude API for Twin response
 */
export async function callTwinAPI(
  messages: Message[],
  twinName: string,
  twinProfile: string,
  worldId?: string
): Promise<string> {
  try {
    if (!messages.length) {
      throw new Error('No messages to process');
    }

    // Build world-aware system prompt
    const systemPrompt = buildTwinSystemPrompt(
      twinName,
      twinProfile,
      worldId,
      undefined, // currentMood
      messages
        .filter(m => m.role === 'user')
        .slice(-3)
        .map(m => m.content)
        .join(' | ')
    );

    // Call Claude API
    const response = await fetch('/api/twin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.8, // Slightly warmer for personal touch
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content || 'I understand. Tell me more.';
  } catch (err) {
    // Error logged upstream for security
    throw err;
  }
}

/**
 * Stream Twin response with world awareness
 */
export async function streamTwinResponse(
  messages: Message[],
  twinName: string,
  twinProfile: string,
  worldId: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const systemPrompt = buildTwinSystemPrompt(
      twinName,
      twinProfile,
      worldId,
      undefined,
      messages
        .filter(m => m.role === 'user')
        .slice(-3)
        .map(m => m.content)
        .join(' | ')
    );

    const response = await fetch('/api/twin-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6);
          if (content) onChunk(content);
        }
      }
    }
  } catch (err) {
    throw err;
  }
}

/**
 * Phase F: Decision Intelligence Endpoints
 */

/**
 * Get decision insights for dashboard
 * SECURITY: Requires authenticated userId, input validation
 */
export async function getDecisionInsights(userId: string) {
  // Validate input
  validateUserId(userId);

  // TODO: Phase G — Add auth middleware to verify user context
  // Currently assumes userId is validated by caller
  // Should verify: session.user.id === userId

  return DecisionLearningService.getDecisionInsights(userId);
}

/**
 * Get world-specific insights
 * SECURITY: Requires authenticated userId, validates world
 */
export async function getWorldInsights(userId: string, world: WorldId) {
  // Validate inputs
  validateUserId(userId);
  validateWorldId(world);

  return DecisionLearningService.getWorldSpecificInsights(userId, world);
}

/**
 * Get Twin confidence in a specific world
 * SECURITY: Requires authenticated userId, validates world
 */
export async function getTwinConfidenceInWorld(userId: string, world: WorldId): Promise<number> {
  // Validate inputs
  validateUserId(userId);
  validateWorldId(world);

  try {
    const patterns = await DecisionLearningService.analyzeTwinDecisionPatterns(userId);
    const worldPatterns = patterns.filter(p => p.world === world);

    if (worldPatterns.length === 0) return 50; // Default: moderate confidence

    // Average confidence across patterns
    const avgConfidence = worldPatterns.reduce((sum, p) => sum + p.confidence, 0) / worldPatterns.length;
    return Math.round(avgConfidence);
  } catch (err) {
    // Return default on error to prevent info leakage
    return 50;
  }
}

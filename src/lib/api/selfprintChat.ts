/**
 * SelfPrint Chat API Wrapper
 * ส่ง request ไป Brain Gateway ด้วย system prompt injection
 *
 * ใช้:
 * const response = await selfprintChat({
 *   userId: 'user123',
 *   sessionId: 'session456',
 *   hub: 'decision',
 *   mood: 'ready',
 *   question: 'How do I know what to do?',
 *   birthData: { ... },
 *   twinProfile: { ... },
 *   history: [{ role, content }, ...]
 * });
 */

import { getNovaPrompt } from '../nova-prompts/getNovaPrompt';

export interface BirthData {
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface TwinProfile {
  id: string;
  userId: string;
  name?: string;
  primaryArchetype?: string;
  secondaryArchetype?: string;
  maturityScore?: number;
  createdAt?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SelfprintChatRequest {
  // Identity
  userId: string;
  sessionId: string;

  // Context
  hub: 'identity' | 'decision' | 'relationship' | 'career' | 'health' | 'money' | 'ai-twin' | 'learning' | 'creativity' | 'spirituality' | 'impact' | 'activities';
  mood: 'stressed' | 'confused' | 'confident' | 'drained' | 'ready' | 'reflective';
  archetype?: string;

  // User input
  question: string;

  // Profile context
  birthData?: BirthData;
  twinProfile?: TwinProfile;
  history?: ChatMessage[];

  // Optional
  plan?: 'starter' | 'pro' | 'elite';
}

export interface SelfprintChatResponse {
  response: {
    text: string;
    thinking?: string;
  };
  persona: {
    archetype?: string;
    hub: string;
    mood: string;
    maturityLevel?: number;
  };
  metadata: {
    inputTokens: number;
    outputTokens: number;
    processingTimeMs: number;
    timestamp: string;
  };
  learning?: {
    discovered?: string[];
    blindSpotsAffirmed?: boolean;
    growthOpportunitiesIdentified?: string[];
  };
}

export class SelfprintChatError extends Error {
  code: string;
  statusCode?: number;
  originalError?: unknown;

  constructor(
    code: string,
    message: string,
    statusCode?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'SelfprintChatError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Main function: Send chat with Nova
 */
export async function selfprintChat(
  request: SelfprintChatRequest
): Promise<SelfprintChatResponse> {
  try {
    // Validate required fields
    if (!request.userId) throw new SelfprintChatError('MISSING_USER_ID', 'userId is required');
    if (!request.sessionId) throw new SelfprintChatError('MISSING_SESSION_ID', 'sessionId is required');
    if (!request.question) throw new SelfprintChatError('MISSING_QUESTION', 'question is required');

    // Generate system prompt
    const systemPrompt = getNovaPrompt({
      hub: request.hub,
      mood: request.mood,
      archetype: request.archetype || request.twinProfile?.primaryArchetype || 'sage',
      userProfile: request.twinProfile ? {
        primaryArchetype: request.twinProfile.primaryArchetype,
        secondaryArchetype: request.twinProfile.secondaryArchetype,
      } : undefined,
      maturityScore: request.twinProfile?.maturityScore || 50,
    });

    // Build message history
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add conversation history if provided
    if (request.history && request.history.length > 0) {
      messages.push(...request.history);
    }

    // Add current question
    messages.push({
      role: 'user',
      content: request.question,
    });

    // Call Brain Gateway (Astrovera)
    const brainResponse = await callBrainGateway({
      userId: request.userId,
      sessionId: request.sessionId,
      system: systemPrompt,
      messages,
      birthData: request.birthData,
      twinProfile: request.twinProfile,
      metadata: {
        hub: request.hub,
        mood: request.mood,
        plan: request.plan || 'starter',
      },
    });

    // Parse and structure response
    return parseNovaChatResponse(brainResponse, {
      hub: request.hub,
      mood: request.mood,
      archetype: request.archetype || request.twinProfile?.primaryArchetype || 'sage',
    });
  } catch (error) {
    if (error instanceof SelfprintChatError) {
      throw error;
    }

    throw new SelfprintChatError(
      'SELFPRINT_CHAT_ERROR',
      `Failed to send chat: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    );
  }
}

/**
 * Internal: Call Astrovera Brain Gateway
 * This is where the actual HTTP request to Brain happens
 */
interface BrainGatewayRequest {
  userId: string;
  sessionId: string;
  system: string; // System prompt
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  birthData?: BirthData;
  twinProfile?: TwinProfile;
  metadata?: Record<string, unknown>;
}

interface BrainGatewayResponse {
  response: string;
  metadata?: {
    inputTokens?: number;
    outputTokens?: number;
    processingTimeMs?: number;
  };
  thinking?: string;
  persona?: Record<string, unknown>;
}

async function callBrainGateway(request: BrainGatewayRequest): Promise<BrainGatewayResponse> {
  const brainUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${brainUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': request.userId,
        'X-Session-Id': request.sessionId,
      },
      body: JSON.stringify({
        system: request.system,
        messages: request.messages,
        // Optional context that Brain can use but doesn't require
        context: {
          birthData: request.birthData,
          twinProfile: request.twinProfile,
          metadata: request.metadata,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new SelfprintChatError(
        'BRAIN_API_ERROR',
        `Brain Gateway returned ${response.status}: ${errorBody}`,
        response.status
      );
    }

    const data = await response.json() as BrainGatewayResponse;
    return data;
  } catch (error) {
    if (error instanceof SelfprintChatError) throw error;

    throw new SelfprintChatError(
      'BRAIN_CONNECTION_ERROR',
      `Failed to connect to Brain Gateway at ${brainUrl}: ${error instanceof Error ? error.message : 'Unknown'}`,
      undefined,
      error
    );
  }
}

/**
 * Parse Brain response into SelfprintChatResponse
 */
function parseNovaChatResponse(
  brainResponse: BrainGatewayResponse,
  context: { hub: string; mood: string; archetype: string }
): SelfprintChatResponse {
  return {
    response: {
      text: brainResponse.response || '',
      thinking: brainResponse.thinking,
    },
    persona: {
      hub: context.hub,
      mood: context.mood,
      archetype: context.archetype,
      maturityLevel: extractMaturityLevel(brainResponse.response),
    },
    metadata: {
      inputTokens: brainResponse.metadata?.inputTokens || 0,
      outputTokens: brainResponse.metadata?.outputTokens || 0,
      processingTimeMs: brainResponse.metadata?.processingTimeMs || 0,
      timestamp: new Date().toISOString(),
    },
    learning: extractLearningSignals(brainResponse.response),
  };
}

/**
 * Helper: Extract maturity level from response (heuristic)
 */
function extractMaturityLevel(response: string): number {
  // Simple heuristic: count complex concepts
  const complexTerms = ['ambivalence', 'paradox', 'nuance', 'threshold', 'integration'];
  const mentionedTerms = complexTerms.filter(term =>
    response.toLowerCase().includes(term)
  ).length;

  return Math.min(100, 30 + (mentionedTerms * 10));
}

/**
 * Helper: Extract learning signals from response
 */
function extractLearningSignals(response: string): SelfprintChatResponse['learning'] {
  const discovered: string[] = [];
  const blindSpotsAffirmed = response.toLowerCase().includes('blind spot') ||
                             response.toLowerCase().includes('haven\'t considered');

  // Simple keyword extraction
  if (response.toLowerCase().includes('strength')) discovered.push('strength');
  if (response.toLowerCase().includes('opportunity')) discovered.push('growth_opportunity');
  if (response.toLowerCase().includes('pattern')) discovered.push('pattern_recognition');

  return {
    discovered: discovered.length > 0 ? discovered : undefined,
    blindSpotsAffirmed: blindSpotsAffirmed || undefined,
    growthOpportunitiesIdentified: response.toLowerCase().includes('grow') ?
      ['mentioned_growth_opportunity'] : undefined,
  };
}

/**
 * Helper: Quick health check
 */
export async function healthCheckBrainGateway(): Promise<boolean> {
  try {
    const brainUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${brainUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

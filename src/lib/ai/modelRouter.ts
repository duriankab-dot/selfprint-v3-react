/**
 * modelRouter.ts
 *
 * OpenRouter model selection layer — priority queue: free → cheap → quality
 * 
 * Strategy:
 *   1. Always use free/cheap models (Qwen, DeepSeek, GLM) for routine chat
 *   2. Fall back to Claude only when explicitly needed (complex reasoning)
 *   3. Allow admin override via env vars
 *   4. Log model choice for cost analytics
 */

export type ModelTier = 'free' | 'cheap' | 'quality';

export type CallType = 'chat' | 'analysis' | 'creative' | 'quick' | 'streaming';

export interface ModelConfig {
  id: string;
  name: string;
  tier: ModelTier;
  costPerToken: number; // in USD per 1K tokens
  maxTokens: number;
}

// ─── Model Registry ──────────────────────────────────────────────────────────

const MODEL_REGISTRY: ModelConfig[] = [
  // Tier 1: Free / Ultra-cheap
  { id: 'qwen/qwen-turbo', name: 'Qwen Turbo', tier: 'free', costPerToken: 0.0003, maxTokens: 8192 },
  { id: 'qwen/qwen-plus', name: 'Qwen Plus', tier: 'cheap', costPerToken: 0.003, maxTokens: 32768 },
  
  // Tier 2: Cheap but capable
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', tier: 'cheap', costPerToken: 0.005, maxTokens: 32768 },
  { id: 'zhipuai/glm-4', name: 'GLM-4', tier: 'cheap', costPerToken: 0.007, maxTokens: 32768 },
  { id: 'qwen/qwen-max', name: 'Qwen Max', tier: 'cheap', costPerToken: 0.008, maxTokens: 32768 },
  
  // Tier 3: Quality (fallback)
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', tier: 'quality', costPerToken: 0.008, maxTokens: 8192 },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'quality', costPerToken: 0.003, maxTokens: 8192 },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', tier: 'quality', costPerToken: 0.075, maxTokens: 4096 },
];

// ─── Default Configuration ───────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  novaModelId: process.env.NOVA_MODEL_ID || 'qwen/qwen-plus',
  twinModelId: process.env.TWIN_MODEL_ID || 'qwen/qwen-plus',
  streamingModelId: process.env.STREAMING_MODEL_ID || 'qwen/qwen-plus',
  fallbackChain: ['qwen/qwen-plus', 'deepseek/deepseek-chat', 'anthropic/claude-3.5-haiku'],
};

// ─── Model Selection Logic ───────────────────────────────────────────────────

/**
 * Select model based on call type and context
 * Returns the model ID string to use with OpenRouter
 */
export function selectModel(
  callType: CallType = 'chat',
  options?: {
    /** Force a specific tier regardless of call type */
    forceTier?: ModelTier;
    /** Whether high-quality output is required */
    needsHighQuality?: boolean;
    /** Custom fallback chain */
    fallbackChain?: string[];
  }
): string {
  const { forceTier, needsHighQuality } = options || {};

  // If user/admin forced a tier, respect it
  if (forceTier) {
    const tierModels = MODEL_REGISTRY.filter(m => m.tier === forceTier);
    if (tierModels.length > 0) {
      return tierModels[0].id;
    }
  }

  // High quality requirement → skip to quality tier
  if (needsHighQuality) {
    const qualityModels = MODEL_REGISTRY.filter(m => m.tier === 'quality');
    if (qualityModels.length > 0) {
      return qualityModels[0].id;
    }
  }

  // Route by call type
  switch (callType) {
    case 'chat':
      // Routine chat → use cheapest capable model
      return DEFAULT_CONFIG.novaModelId;
      
    case 'analysis':
      // Analysis requires reasoning → slightly better model
      return 'deepseek/deepseek-chat';
      
    case 'creative':
      // Creative writing → GLM or Qwen Max
      return 'zhipuai/glm-4';
      
    case 'quick':
      // Quick responses → fastest free model
      return 'qwen/qwen-turbo';
      
    case 'streaming':
      return DEFAULT_CONFIG.streamingModelId;
      
    default:
      return DEFAULT_CONFIG.novaModelId;
  }
}

/**
 * Get the next model in the fallback chain
 * Used when a model request fails
 */
export function getNextFallbackModel(
  failedModelId: string,
  fallbackChain?: string[]
): string | null {
  const chain = fallbackChain || DEFAULT_CONFIG.fallbackChain;
  const idx = chain.indexOf(failedModelId);
  if (idx >= 0 && idx < chain.length - 1) {
    return chain[idx + 1];
  }
  return null;
}

/**
 * Check if a model is available in the registry
 */
export function isModelAvailable(modelId: string): boolean {
  return MODEL_REGISTRY.some(m => m.id === modelId);
}

/**
 * Get model info by ID
 */
export function getModelInfo(modelId: string): ModelConfig | undefined {
  return MODEL_REGISTRY.find(m => m.id === modelId);
}

/**
 * Log model usage for cost analytics
 */
export function logModelUsage(
  modelId: string,
  tokensUsed: number,
  callType: CallType,
  success: boolean
): void {
  const modelInfo = getModelInfo(modelId);
  const estimatedCost = modelInfo
    ? (tokensUsed / 1000) * modelInfo.costPerToken
    : 0;

  console.log(
    `[ModelRouter] ${success ? '✓' : '✗'} ${callType} | ${modelInfo?.name || modelId} | ` +
    `${tokensUsed.toLocaleString()} tokens | ~$${estimatedCost.toFixed(6)}`
  );
}

export { DEFAULT_CONFIG, MODEL_REGISTRY };

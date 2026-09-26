/**
 * modelRouter.ts — DEPRECATED per MODEL-SWITCH-001 (25 ก.ย. 2026).
 * 
 * ⚠️ Claude is explicitly FORBIDDEN. Model routing now lives in
 *    functions/api/twin.ts and functions/api/nova.ts with
 *    nemotron → qwen → deepseek fallback chain.
 * 
 * This file is kept for reference only. New model selection must use
 * TWIN_MODEL_ID / NOVA_MODEL_ID env vars or the default chains defined
 * in the CF Pages functions.
 */

export type ModelTier = 'free' | 'cheap';  // removed 'quality' — claude prohibited

export type CallType = 'chat' | 'analysis' | 'creative' | 'quick' | 'streaming';

export interface ModelConfig {
  id: string;
  name: string;
  tier: ModelTier;
  costPerToken: number;
  maxTokens: number;
}

const MODEL_REGISTRY: ModelConfig[] = [
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'NVIDIA Nemotron 3 Ultra (Free)', tier: 'free', costPerToken: 0, maxTokens: 8192 },
  { id: 'qwen/qwen-turbo', name: 'Qwen Turbo', tier: 'free', costPerToken: 0.0003, maxTokens: 8192 },
  { id: 'qwen/qwen-plus', name: 'Qwen Plus', tier: 'cheap', costPerToken: 0.003, maxTokens: 32768 },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', tier: 'cheap', costPerToken: 0.005, maxTokens: 32768 },
];

const DEFAULT_CONFIG = {
  novaModelId: process.env.NOVA_MODEL_ID || 'nvidia/nemotron-3-ultra-550b-a55b:free',
  twinModelId: process.env.TWIN_MODEL_ID || 'nvidia/nemotron-3-ultra-550b-a55b:free',
  streamingModelId: process.env.STREAMING_MODEL_ID || 'nvidia/nemotron-3-ultra-550b-a55b:free',
  fallbackChain: ['nvidia/nemotron-3-ultra-550b-a55b:free', 'qwen/qwen-plus', 'deepseek/deepseek-chat'],
};

/**
 * Select model based on call type — respects MODEL-SWITCH-001 (nemotron-first, no claude)
 * @deprecated Use env var overrides in CF Pages functions instead
 */
export function selectModel(
  _callType: CallType = 'chat',
  _options?: { forceTier?: ModelTier; needsHighQuality?: boolean; fallbackChain?: string[] }
): string {
  // All paths fall through to free/cheap models — no claude allowed
  return DEFAULT_CONFIG.novaModelId;
}

export function getNextFallbackModel(failedModelId: string, fallbackChain?: string[]): string | null {
  const chain = fallbackChain || DEFAULT_CONFIG.fallbackChain;
  const idx = chain.indexOf(failedModelId);
  if (idx >= 0 && idx < chain.length - 1) {
    return chain[idx + 1];
  }
  return null;
}

export function isModelAvailable(modelId: string): boolean {
  return MODEL_REGISTRY.some(m => m.id === modelId);
}

export function getModelInfo(modelId: string): ModelConfig | undefined {
  return MODEL_REGISTRY.find(m => m.id === modelId);
}

export { DEFAULT_CONFIG, MODEL_REGISTRY };

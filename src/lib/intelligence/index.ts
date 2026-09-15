/**
 * ⚠️ DEPRECATED — src/lib/intelligence (15 ก.ย. 2026)
 * 
 * This module is a duplicate of `src/services/sice/engines/*`.
 * All SICE engines now live in services/sice/engines and are orchestrated
 * by SICEOrchestrator (16 engines registered).
 * 
 * Migration path:
 *   import { PatternDetector } from '@/lib/intelligence/PatternDetector'
 * → import { PatternDetector } from '@/services/sice/engines/PatternDetector'
 * 
 * Files kept for backward compatibility only — will be removed after all
 * callers are migrated. See: F3 — Duplicate intelligence engine layers.
 */

/**
 * Intelligence Core Module (DEPRECATED — use services/sice/engines)
 * Central exports for Selfprint Personal Intelligence Engine
 * @module intelligence [DEPRECATED]
 */

export * from './types';
export * from './PersonalContextBuilder';
export * from './MemoryManager';
export * from './PatternDetector';
export * from './EvidenceAnalyzer';
export * from './AIFeedbackLoop';
export * from './PersonalContextInitializer';

// Re-export for convenience
export { default as PersonalContextBuilder } from './PersonalContextBuilder';
export { default as MemoryManager } from './MemoryManager';
export { default as PatternDetector } from './PatternDetector';
export { default as EvidenceAnalyzer } from './EvidenceAnalyzer';
export { default as AIFeedbackLoop } from './AIFeedbackLoop';
export {
  initializeContextFromOnboarding,
  validateOnboardingData,
} from './PersonalContextInitializer';
export * from './InsightEngine';
export { default as InsightEngine } from './InsightEngine';
export * from './TwinStateEngine';
export { default as TwinStateEngine } from './TwinStateEngine';
export * from './NatalChartEngine';
export * from './HexagramEngine';

// §46 — P2 Advanced Intelligence Engines
export * from './FutureSelfEngine';
export { default as FutureSelfEngine } from './FutureSelfEngine';
export * from './DecisionIntelligenceEngine';
export { default as DecisionIntelligenceEngine } from './DecisionIntelligenceEngine';
export * from './LifeIntelligencePackEngine';
export { default as LifeIntelligencePackEngine } from './LifeIntelligencePackEngine';
export * from './BehavioralForecastEngine';
export { default as BehavioralForecastEngine } from './BehavioralForecastEngine';

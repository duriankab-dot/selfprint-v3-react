/**
 * Decision Components Barrel Export
 * Phase G: Code splitting with lazy loading
 */

import { lazy, Suspense } from 'react';

// Lazy load heavy components to improve initial bundle size
export const DecisionStats = lazy(() => import('./DecisionStats'));
export const DecisionInsights = lazy(() => import('./DecisionInsights'));
export const DecisionTimeline = lazy(() => import('./DecisionTimeline'));
export const TwinConfidenceIndicator = lazy(() => import('./TwinConfidenceIndicator'));

// Loading fallback component
export function DecisionComponentLoader({ name }: { name: string }) {
  return (
    <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
      Loading {name}...
    </div>
  );
}

// Wrapper for convenient lazy-loaded component usage
export function withLazyLoading<P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
  componentName: string
) {
  return (props: P) => (
    <Suspense fallback={<DecisionComponentLoader name={componentName} />}>
      <Component {...props} />
    </Suspense>
  );
}

// Pre-wrapped components ready to use
export const LazyDecisionStats = withLazyLoading(DecisionStats, 'Decision Stats');
export const LazyDecisionInsights = withLazyLoading(DecisionInsights, 'Insights');
export const LazyDecisionTimeline = withLazyLoading(DecisionTimeline, 'Timeline');
export const LazyTwinConfidence = withLazyLoading(TwinConfidenceIndicator, 'Confidence');

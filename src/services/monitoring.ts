import * as Sentry from '@sentry/react';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Called from main.tsx during app startup
 */
export function initializeSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Sample 100% in development, 10% in production
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    // Capture 100% of sessions with errors, 10% of normal sessions
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
      // Browser tracing
      new Sentry.BrowserTracing(),
    ],
  });
}

/**
 * Initialize Web Vitals monitoring
 * Track Core Web Vitals and send to Sentry
 */
export function initializeWebVitals() {
  onCLS((metric: Metric) => {
    Sentry.captureMessage('Web Vitals: CLS', {
      level: 'info',
      tags: { metric: 'cls' },
    });
    Sentry.setMeasurement('cls', metric.value, 'score');
  });

  onFID((metric: Metric) => {
    Sentry.captureMessage('Web Vitals: FID', {
      level: 'info',
      tags: { metric: 'fid' },
    });
    Sentry.setMeasurement('fid', metric.value, 'milliseconds');
  });

  onFCP((metric: Metric) => {
    Sentry.captureMessage('Web Vitals: FCP', {
      level: 'info',
      tags: { metric: 'fcp' },
    });
    Sentry.setMeasurement('fcp', metric.value, 'milliseconds');
  });

  onLCP((metric: Metric) => {
    Sentry.captureMessage('Web Vitals: LCP', {
      level: 'info',
      tags: { metric: 'lcp' },
    });
    Sentry.setMeasurement('lcp', metric.value, 'milliseconds');
  });

  onTTFB((metric: Metric) => {
    Sentry.captureMessage('Web Vitals: TTFB', {
      level: 'info',
      tags: { metric: 'ttfb' },
    });
    Sentry.setMeasurement('ttfb', metric.value, 'milliseconds');
  });
}

/**
 * Capture custom metric for operation timing
 * Use in services to track performance-critical operations
 */
export async function trackMetric<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, string | number>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - start;

    Sentry.captureMessage(`${name} completed`, {
      level: 'info',
      tags: { operation: name, ...tags },
    });
    Sentry.setMeasurement('duration_ms', duration, 'milliseconds');

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    Sentry.captureException(error, {
      tags: { operation: name, ...tags },
    });
    Sentry.setMeasurement('duration_ms', duration, 'milliseconds');

    throw error;
  }
}

/**
 * Manually report error to Sentry
 * Use in catch blocks for better error context
 */
export function captureError(
  error: Error | unknown,
  context?: {
    component?: string;
    operation?: string;
    userId?: string;
    twinId?: string;
    [key: string]: any;
  }
) {
  Sentry.captureException(error, {
    tags: {
      component: context?.component,
      operation: context?.operation,
    },
    contexts: {
      user: context?.userId ? { user_id: context.userId } : undefined,
      data: {
        twin_id: context?.twinId,
        ...context,
      },
    } as any,
  });
}

/**
 * Capture custom event (non-error)
 * Use for tracking important business events
 */
export function captureEvent(
  message: string,
  data?: {
    level?: 'info' | 'warning' | 'error';
    tags?: Record<string, string | number>;
  }
) {
  Sentry.captureMessage(message, {
    level: data?.level ?? 'info',
    tags: data?.tags,
  });
}

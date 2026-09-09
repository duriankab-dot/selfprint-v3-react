/**
 * Error Tracking Service (Sentry Integration)
 *
 * จัดการการติดตามข้อผิดพลาด และส่ง error metrics ไป Sentry
 * เพื่อใช้ในการ production monitoring
 *
 * Requires: @sentry/react (installed)
 * Env: VITE_SENTRY_DSN
 */

// SENTRY-LAZY-001 (9 ก.ย. 2026): `import * as Sentry from '@sentry/react'`
// was a STATIC import reached from main.tsx, so the whole Sentry browser SDK
// (browserTracing included) landed in the entry's vendor chunk and was
// downloaded + parsed on EVERY page — including the logged-out /th/ landing
// page that Lighthouse scored, even when VITE_SENTRY_DSN isn't set and
// initializeSentry() bails on line 1. The SDK is now imported dynamically
// only when a DSN exists; all capture* helpers queue onto that promise.
// Behaviour is unchanged for callers (fire-and-forget telemetry).
import type { Scope } from '@sentry/types';

type SentryModule = typeof import('@sentry/react');

let initialized = false;
let sentryModule: Promise<SentryModule> | null = null;

/**
 * Initialize Sentry for error tracking
 * เรียกครั้งเดียวเมื่อ app เริ่มต้น (ใน main.tsx)
 */
export function initializeSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.warn('[ErrorTracking] VITE_SENTRY_DSN not set — Sentry disabled');
    return;
  }
  if (initialized) return;

  sentryModule = import('@sentry/react');
  void sentryModule.then((Sentry) => {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'development',
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.2 : 1.0,
      replaysSessionSampleRate: 0.05,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.browserTracingIntegration(),
      ],
    });
  });

  initialized = true;
}

/**
 * Capture exception and send to Sentry
 *
 * @example
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   captureException(error, { component: 'TwinChat', userId });
 * }
 */
export function captureException(
  error: Error | string | unknown,
  context?: Record<string, unknown>
) {
  if (!initialized || !sentryModule) {
    console.error('[ErrorTracking]', error, context);
    return;
  }
  void sentryModule.then((Sentry) => {
    Sentry.withScope((scope: Scope) => {
      if (context) scope.setContext('custom', context);
      Sentry.captureException(error);
    });
  });
}

/**
 * Capture message (non-error event)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, unknown>
) {
  if (!initialized || !sentryModule) {
    console.log(`[ErrorTracking:${level}] ${message}`, data);
    return;
  }
  void sentryModule.then((Sentry) => {
    Sentry.withScope((scope: Scope) => {
      if (data) scope.setContext('data', data);
      Sentry.captureMessage(message, level);
    });
  });
}

/**
 * Track custom metric via Sentry breadcrumb
 */
export function trackMetric(
  name: string,
  value: number,
  tags?: Record<string, string | number>
) {
  if (!initialized || !sentryModule) return;
  void sentryModule.then((Sentry) => {
    Sentry.addBreadcrumb({
      category: 'metric',
      message: `${name} = ${value}`,
      data: { value, ...tags },
      level: 'info',
    });
  });
}

/**
 * Start performance span tracking
 */
export function startPerformanceTracking(operationName: string) {
  if (!initialized || !sentryModule) {
    return { transaction: null, finish: () => {} };
  }
  // Active-span lookups need the SDK loaded; resolve it asynchronously and
  // keep the returned handle stable for callers that finish() early.
  // (No caller in src today — kept API-compatible with the static-import era.)
  let activeSpan: unknown = null;
  void sentryModule.then((Sentry) => {
    activeSpan = Sentry.getActiveSpan();
  });
  return {
    get transaction() {
      return activeSpan ?? null;
    },
    finish: () => {
      const span = activeSpan;
      if (!span) return;
      void sentryModule?.then((Sentry) => {
        Sentry.getRootSpan(span as Parameters<typeof Sentry.getRootSpan>[0])?.end?.();
      });
    },
    operationName,
  };
}

/**
 * Set user context for error reports
 */
export function setUserContext(userId: string, email?: string) {
  if (!initialized || !sentryModule) return;
  void sentryModule.then((Sentry) => {
    Sentry.setUser({ id: userId, email });
  });
}

/**
 * Clear user context (call on logout)
 */
export function clearUserContext() {
  if (!initialized || !sentryModule) return;
  void sentryModule.then((Sentry) => {
    Sentry.setUser(null);
  });
}

/**
 * Add breadcrumb (debug info for error context)
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
  category: string = 'action'
) {
  if (!initialized || !sentryModule) return;
  void sentryModule.then((Sentry) => {
    Sentry.addBreadcrumb({ message, data, category, level: 'info' });
  });
}

/**
 * Error Tracking Service (Sentry Integration)
 *
 * จัดการการติดตามข้อผิดพลาด และส่ง error metrics ไป Sentry
 * เพื่อใช้ในการ production monitoring
 *
 * Requires: @sentry/react (installed)
 * Env: VITE_SENTRY_DSN
 */

import * as Sentry from '@sentry/react';
import type { Scope } from '@sentry/types';

let initialized = false;

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
  if (!initialized) {
    console.error('[ErrorTracking]', error, context);
    return;
  }
  Sentry.withScope((scope: Scope) => {
    if (context) scope.setContext('custom', context);
    Sentry.captureException(error);
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
  if (!initialized) {
    console.log(`[ErrorTracking:${level}] ${message}`, data);
    return;
  }
  Sentry.withScope((scope: Scope) => {
    if (data) scope.setContext('data', data);
    Sentry.captureMessage(message, level);
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
  if (!initialized) return;
  Sentry.addBreadcrumb({
    category: 'metric',
    message: `${name} = ${value}`,
    data: { value, ...tags },
    level: 'info',
  });
}

/**
 * Start performance span tracking
 */
export function startPerformanceTracking(operationName: string) {
  if (!initialized) {
    return { transaction: null, finish: () => {} };
  }
  const activeSpan = Sentry.getActiveSpan();
  return {
    transaction: activeSpan ?? null,
    finish: () => {
      if (activeSpan) Sentry.getRootSpan(activeSpan)?.end?.();
    },
    operationName,
  };
}

/**
 * Set user context for error reports
 */
export function setUserContext(userId: string, email?: string) {
  if (!initialized) return;
  Sentry.setUser({ id: userId, email });
}

/**
 * Clear user context (call on logout)
 */
export function clearUserContext() {
  if (!initialized) return;
  Sentry.setUser(null);
}

/**
 * Add breadcrumb (debug info for error context)
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
  category: string = 'action'
) {
  if (!initialized) return;
  Sentry.addBreadcrumb({ message, data, category, level: 'info' });
}

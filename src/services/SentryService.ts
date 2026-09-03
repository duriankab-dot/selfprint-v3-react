/**
 * SentryService.ts
 * Phase G: Error Tracking with Sentry
 * Note: Actual Sentry integration requires @sentry/react package
 */

interface ErrorContext {
  userId?: string;
  twinId?: string;
  endpoint?: string;
  severity?: 'fatal' | 'error' | 'warning' | 'info';
  tags?: Record<string, string>;
}

// Mock Sentry initialization (actual: import * as Sentry from '@sentry/react')
class MockSentry {
  private errors: Array<{ message: string; context: ErrorContext; timestamp: string }> = [];

  init(dsn: string): void {
    if (!dsn) {
      return;
    }
  }

  captureException(error: Error, context?: ErrorContext): string {
    const eventId = crypto.randomUUID?.() || `error-${Date.now()}`;

    this.errors.push({
      message: error.message,
      context: context || {},
      timestamp: new Date().toISOString(),
    });

    return eventId;
  }

  captureMessage(message: string, context?: ErrorContext): string {
    const eventId = crypto.randomUUID?.() || `msg-${Date.now()}`;

    this.errors.push({
      message,
      context: context || {},
      timestamp: new Date().toISOString(),
    });

    return eventId;
  }

  setUser(): void {
    // Set current user for error context
  }

  setContext(): void {
    // Add custom context to errors
  }

  addBreadcrumb(): void {
    // Add navigation breadcrumb for error tracking
  }
}

const sentry = new MockSentry();

/**
 * Initialize Sentry
 */
export function initializeSentry(dsn?: string): void {
  const sentryDSN = dsn || import.meta.env.VITE_SENTRY_DSN;
  if (sentryDSN) {
    sentry.init(sentryDSN);
  }
}

/**
 * Capture exception
 */
export function captureException(error: Error, context?: ErrorContext): string {
  return sentry.captureException(error, context);
}

/**
 * Capture message
 */
export function captureMessage(message: string, context?: ErrorContext): string {
  return sentry.captureMessage(message, context);
}

/**
 * Set user context
 */
export function setUserContext(): void {
  sentry.setUser();
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(): void {
  sentry.addBreadcrumb();
}

/**
 * Capture API error
 */
export function captureAPIError(
  endpoint: string,
  statusCode: number,
  userId?: string
): void {
  captureMessage(`API Error: ${endpoint} - ${statusCode}`, {
    endpoint,
    userId,
    tags: { 'http.status_code': statusCode.toString() },
  });
}

/**
 * Capture performance metric
 */
export function capturePerformanceMetric(
  metric: string,
  duration: number,
  threshold?: number
): void {
  if (threshold && duration > threshold) {
    captureMessage(`Performance: ${metric} took ${duration}ms (threshold: ${threshold}ms)`, {
      tags: { 'performance.slow': 'true' },
    });
  }
}

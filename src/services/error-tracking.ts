/**
 * Error Tracking Service (Sentry Integration) - PLACEHOLDER
 *
 * จัดการการติดตามข้อผิดพลาด และส่ง error metrics ไป Sentry
 * เพื่อใช้ในการ production monitoring
 *
 * NOTE: Sentry integration deferred to P0 #6 (production hardening phase)
 * Requires: npm install @sentry/react
 */

// import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for error tracking (DEFERRED)
 * เรียกครั้งเดียวเมื่อ app เริ่มต้น
 *
 * TODO: Implement in P0 #6 (production hardening)
 */
export function initializeSentry() {
  // Deferred to P0 #6 - requires @sentry/react installation
  // const env = import.meta.env.MODE || 'development';
  // const dsn = import.meta.env.VITE_SENTRY_DSN;
  //
  // if (!dsn) {
  //   console.warn('[ErrorTracking] Sentry DSN not configured - error tracking disabled');
  //   return;
  // }
  //
  // Sentry.init({ ... });
}

/**
 * Capture exception and send to Sentry (DEFERRED)
 *
 * @param error - Error object
 * @param context - Additional context data
 *
 * @example
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   captureException(error, {
 *     component: 'TwinChat',
 *     operation: 'sendMessage',
 *     userId: currentUser.id,
 *   });
 * }
 *
 * TODO: Implement in P0 #6 (production hardening)
 */
export function captureException(
  error: Error | string,
  context?: Record<string, unknown>
) {
  // Deferred to P0 #6 - requires @sentry/react
  // Sentry.captureException(error, {
  //   contexts: {
  //     custom: context,
  //   },
  // });

  console.error('[ErrorTracking] Exception captured:', error, context);
}

/**
 * Capture message (non-error event) - DEFERRED
 *
 * @param message - Message text
 * @param level - Log level (info, warning, error)
 * @param data - Additional data
 *
 * TODO: Implement in P0 #6 (production hardening)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, unknown>
) {
  // Deferred to P0 #6 - requires @sentry/react
  // Sentry.captureMessage(message, {
  //   level,
  //   tags: data,
  // });

  console.log(`[ErrorTracking:${level}] ${message}`, data);
}

/**
 * Track custom metric - DEFERRED
 *
 * @param name - Metric name
 * @param value - Metric value
 * @param tags - Additional tags
 *
 * @example
 * trackMetric('api_response_time', 245, {
 *   endpoint: '/api/decisions',
 *   status: 200,
 * });
 *
 * TODO: Implement in P0 #6 (production hardening)
 */
export function trackMetric(
  _name: string,
  _value: number,
  _tags?: Record<string, string | number>
) {
  // Deferred to P0 #6 - requires @sentry/react
  // Sentry.captureMessage(`Metric: ${_name} = ${_value}`, {
  //   level: 'info',
  //   tags: {
  //     metric: _name,
  //     value: String(_value),
  //     ..._tags,
  //   },
  // });
}

/**
 * Start performance monitoring - DEFERRED
 *
 * @param operationName - Operation name
 * @returns Transaction for manual span creation
 *
 * TODO: Implement in P0 #6 (production hardening)
 */
export function startPerformanceTracking(_operationName: string) {
  // Deferred to P0 #6 - requires @sentry/react
  // const transaction = Sentry.startTransaction({
  //   name: _operationName,
  //   op: 'operation',
  // });
  //
  // return {
  //   transaction,
  //   finish: () => transaction.finish(),
  // };

  return {
    transaction: null,
    finish: () => { /* no-op */ },
  };
}

/**
 * Set user context for error reports - DEFERRED
 *
 * @param userId - User ID
 * @param email - User email
 *
 * TODO: Implement in P0 #6 (production hardening)
 */
export function setUserContext(_userId: string, _email?: string) {
  // Deferred to P0 #6 - requires @sentry/react
  // Sentry.setUser({
  //   id: _userId,
  //   email: _email,
  // });
}

/**
 * Clear user context (on logout) - DEFERRED
 *
 * TODO: Implement in P0 #6 (production hardening)
 */
export function clearUserContext() {
  // Deferred to P0 #6 - requires @sentry/react
  // Sentry.setUser(null);
}

/**
 * Add breadcrumb (debug info for error context) - DEFERRED
 *
 * @param message - Breadcrumb message
 * @param data - Additional data
 * @param category - Breadcrumb category
 *
 * TODO: Implement in P0 #6 (production hardening)
 */
export function addBreadcrumb(
  _message: string,
  _data?: Record<string, unknown>,
  _category: string = 'action'
) {
  // Deferred to P0 #6 - requires @sentry/react
  // Sentry.addBreadcrumb({
  //   message: _message,
  //   data: _data,
  //   category: _category,
  //   level: 'info',
  // });
}

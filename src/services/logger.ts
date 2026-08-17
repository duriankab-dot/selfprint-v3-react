import * as Sentry from '@sentry/react';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

/**
 * Structured Logger Service
 * Provides centralized logging with structured data
 * Logs are sent to Sentry for aggregation in production
 */
export const logger = {
  /**
   * Debug level - verbose information for development
   */
  debug(message: string, context?: LogContext) {
    if (import.meta.env.DEV) {
      console.debug(
        `[DEBUG] ${message}`,
        context ? JSON.stringify(context, null, 2) : ''
      );
    }
    // Don't send debug logs to Sentry in production (noise reduction)
  },

  /**
   * Info level - general information
   */
  info(message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: 'info',
      message,
      timestamp,
      ...context,
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, context || '');
    }

    // Send to Sentry in production
    if (import.meta.env.PROD) {
      Sentry.captureMessage(message, {
        level: 'info',
        tags: {
          component: context?.component,
          operation: context?.operation,
        },
        contexts: {
          data: logEntry,
        },
      });
    }
  },

  /**
   * Warning level - potentially problematic situations
   */
  warn(message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: 'warning',
      message,
      timestamp,
      ...context,
    };

    console.warn(`[WARN] ${message}`, context || '');

    // Send to Sentry
    Sentry.captureMessage(message, {
      level: 'warning',
      tags: {
        component: context?.component,
        operation: context?.operation,
      },
      contexts: {
        data: logEntry,
      },
    });
  },

  /**
   * Error level - serious problems
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: 'error',
      message,
      timestamp,
      error: error instanceof Error ? error.message : String(error),
      ...context,
    };

    console.error(`[ERROR] ${message}`, error, context || '');

    // Send to Sentry
    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: {
          component: context?.component,
          operation: context?.operation,
          logged_as: message,
        },
        contexts: {
          data: logEntry,
        },
      });
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        tags: {
          component: context?.component,
          operation: context?.operation,
        },
        contexts: {
          data: logEntry,
        },
      });
    }
  },
};

/**
 * Log specific domain events (for analytics/business metrics)
 */
export const logEvent = (
  eventName: string,
  data?: {
    userId?: string;
    twinId?: string;
    worldId?: string;
    [key: string]: any;
  }
) => {
  logger.info(`Event: ${eventName}`, {
    event: eventName,
    ...data,
  });
};

/**
 * Log API calls
 */
export const logAPICall = (
  method: string,
  endpoint: string,
  data?: {
    status?: number;
    duration?: number;
    error?: string;
    [key: string]: any;
  }
) => {
  logger.info(`API: ${method} ${endpoint}`, {
    component: 'API',
    operation: `${method} ${endpoint}`,
    ...data,
  });
};

/**
 * Log database operations
 */
export const logDatabaseOp = (
  operation: string,
  table: string,
  data?: {
    duration?: number;
    rowsAffected?: number;
    error?: string;
    [key: string]: any;
  }
) => {
  logger.info(`DB: ${operation} on ${table}`, {
    component: 'Database',
    operation,
    table,
    ...data,
  });
};

/**
 * Log service initialization
 */
export const logServiceInit = (serviceName: string, status: 'success' | 'error', error?: Error) => {
  if (status === 'success') {
    logger.info(`Service initialized: ${serviceName}`, {
      component: serviceName,
      operation: 'init',
    });
  } else {
    logger.error(`Service initialization failed: ${serviceName}`, error, {
      component: serviceName,
      operation: 'init',
    });
  }
};

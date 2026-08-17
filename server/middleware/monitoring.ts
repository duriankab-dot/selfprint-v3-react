/**
 * Monitoring & Metrics Collection
 *
 * บันทึก metrics สำหรับ production monitoring
 * และส่งไป Sentry/Datadog
 */

import { Request, Response } from 'express';

interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: Date;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private maxMetrics = 1000;

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: Metric = {
      name,
      value,
      tags,
      timestamp: new Date(),
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log to console (in production, send to external service)
    this.logMetric(metric);
  }

  /**
   * Get recent metrics
   */
  getMetrics(name?: string, limit: number = 100): Metric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter(m => m.name === name);
    }

    return filtered.slice(-limit);
  }

  /**
   * Get metric summary
   */
  getSummary(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
  } {
    const values = this.metrics
      .filter(m => m.name === name)
      .map(m => m.value);

    if (values.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0 };
    }

    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  /**
   * Send metrics to external service
   * (Sentry, Datadog, etc.)
   */
  private logMetric(metric: Metric) {
    // In production, this would send to:
    // - Sentry: Sentry.captureMessage()
    // - Datadog: datadog.metric()
    // - CloudWatch: AWS metrics API
    // - Custom logging: HTTP POST to logging service

    console.log(`[METRIC] ${metric.name}=${metric.value}`, metric.tags || {});
  }
}

export const metricsCollector = new MetricsCollector();

/**
 * Middleware: Track request metrics
 */
export function metricsMiddleware(req: Request, res: Response, next: () => void) {
  const startTime = Date.now();

  // Wrap response methods to track when response is sent
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;

    // Record metrics
    metricsCollector.recordMetric('api_response_time_ms', duration, {
      endpoint: req.path,
      method: req.method,
      status: String(res.statusCode),
    });

    metricsCollector.recordMetric('http_request_count', 1, {
      endpoint: req.path,
      method: req.method,
      status: String(res.statusCode),
    });

    // Record slow requests
    if (duration > 1000) {
      console.warn(`[SLOW_REQUEST] ${req.method} ${req.path} took ${duration}ms`);
      metricsCollector.recordMetric('slow_request_count', 1, {
        endpoint: req.path,
        duration_ms: String(duration),
      });
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Track database query performance
 */
export function trackDatabaseQuery(queryName: string, duration: number, error?: Error) {
  metricsCollector.recordMetric('database_query_time_ms', duration, {
    query: queryName,
    status: error ? 'error' : 'success',
  });

  if (error) {
    metricsCollector.recordMetric('database_error_count', 1, {
      query: queryName,
      error_type: error.name,
    });
  }

  if (duration > 1000) {
    console.warn(`[SLOW_QUERY] ${queryName} took ${duration}ms`);
  }
}

/**
 * Track AI service latency
 */
export function trackAILatency(model: string, duration: number, tokens?: number) {
  metricsCollector.recordMetric('ai_latency_ms', duration, {
    model,
    tokens: tokens ? String(tokens) : undefined,
  });

  if (duration > 5000) {
    console.warn(`[SLOW_AI] ${model} took ${duration}ms`);
  }
}

/**
 * Track user events
 */
export function trackUserEvent(
  eventName: string,
  userId: string,
  data?: Record<string, string | number>
) {
  metricsCollector.recordMetric('user_event_count', 1, {
    event: eventName,
    user_id: userId,
  });

  console.log(`[USER_EVENT] ${eventName} from ${userId}`, data || {});
}

/**
 * Get current metrics summary for dashboard
 */
export function getMetricsSummary() {
  return {
    apiResponseTime: metricsCollector.getSummary('api_response_time_ms'),
    databaseQueryTime: metricsCollector.getSummary('database_query_time_ms'),
    aiLatency: metricsCollector.getSummary('ai_latency_ms'),
    slowRequests: metricsCollector.getSummary('slow_request_count'),
    databaseErrors: metricsCollector.getSummary('database_error_count'),
    httpRequests: metricsCollector.getSummary('http_request_count'),
    userEvents: metricsCollector.getSummary('user_event_count'),
    timestamp: new Date(),
  };
}

/**
 * Export metrics endpoint (for monitoring dashboard)
 */
export function setupMetricsEndpoint(app: any) {
  app.get('/metrics', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      metrics: getMetricsSummary(),
    });
  });

  console.log('[MONITORING] Metrics endpoint available at /metrics');
}

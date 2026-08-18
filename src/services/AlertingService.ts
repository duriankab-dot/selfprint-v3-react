/**
 * AlertingService.ts
 * Phase G: Alerting & Incident Response
 */

import { supabase } from './supabase-service';
import * as SentryService from './SentryService';

interface Alert {
  id: string;
  type: 'error_rate' | 'performance' | 'security' | 'availability';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

/**
 * Check error rate
 */
export async function checkErrorRate(
  windowMinutes: number = 5,
  errorThreshold: number = 0.01 // 1%
): Promise<Alert | null> {
  if (!supabase) return null;

  try {
    const startTime = new Date(Date.now() - windowMinutes * 60000).toISOString();

    const { data: errors } = await supabase
      .from('error_logs')
      .select('id')
      .gte('created_at', startTime);

    const { data: allRequests } = await supabase
      .from('performance_metrics')
      .select('id')
      .gte('created_at', startTime);

    if (!errors || !allRequests || allRequests.length === 0) {
      return null;
    }

    const errorRate = errors.length / allRequests.length;

    if (errorRate > errorThreshold) {
      return {
        id: crypto.randomUUID?.() || `alert-${Date.now()}`,
        type: 'error_rate',
        severity: errorRate > 0.05 ? 'critical' : 'high',
        message: `Error rate: ${(errorRate * 100).toFixed(2)}% (threshold: ${(errorThreshold * 100).toFixed(2)}%)`,
        metadata: { errorCount: errors.length, requestCount: allRequests.length },
        createdAt: new Date().toISOString(),
      };
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Check performance degradation
 */
export async function checkPerformanceDegradation(
  metricName: string,
  thresholdMs: number,
  windowMinutes: number = 5
): Promise<Alert | null> {
  if (!supabase) return null;

  try {
    const startTime = new Date(Date.now() - windowMinutes * 60000).toISOString();

    const { data: slowMetrics } = await supabase
      .from('performance_metrics')
      .select('metric_value')
      .eq('metric_name', metricName)
      .gte('created_at', startTime)
      .gt('metric_value', thresholdMs);

    const { data: allMetrics } = await supabase
      .from('performance_metrics')
      .select('metric_value')
      .eq('metric_name', metricName)
      .gte('created_at', startTime);

    if (!slowMetrics || !allMetrics || allMetrics.length === 0) {
      return null;
    }

    const slowPercentage = (slowMetrics.length / allMetrics.length) * 100;

    if (slowPercentage > 20) {
      const avgTime = allMetrics.reduce((sum: number, m) => sum + m.metric_value, 0) / allMetrics.length;

      return {
        id: crypto.randomUUID?.() || `alert-${Date.now()}`,
        type: 'performance',
        severity: slowPercentage > 50 ? 'critical' : 'high',
        message: `Performance degradation: ${slowPercentage.toFixed(0)}% of ${metricName} requests exceed ${thresholdMs}ms (avg: ${avgTime.toFixed(0)}ms)`,
        metadata: { slowCount: slowMetrics.length, totalCount: allMetrics.length, avgTime },
        createdAt: new Date().toISOString(),
      };
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Check security threats
 */
export async function checkSecurityThreats(
  windowMinutes: number = 60
): Promise<Alert[]> {
  if (!supabase) return [];

  const alerts: Alert[] = [];

  try {
    const startTime = new Date(Date.now() - windowMinutes * 60000).toISOString();

    // Check for brute force attempts (many failed CSRF validations)
    const { data: failedAttempts } = await supabase
      .from('security_audit_log')
      .select('user_id')
      .eq('action', 'csrf_failed')
      .gte('created_at', startTime);

    if (failedAttempts?.length && failedAttempts.length > 10) {
      alerts.push({
        id: crypto.randomUUID?.() || `alert-${Date.now()}`,
        type: 'security',
        severity: 'high',
        message: `Potential CSRF attacks detected: ${failedAttempts.length} failed attempts in last ${windowMinutes} minutes`,
        metadata: { attemptCount: failedAttempts.length },
        createdAt: new Date().toISOString(),
      });
    }

    // Check for rate limit violations
    const { data: rateLimitHits } = await supabase
      .from('rate_limit_log')
      .select('user_id')
      .gte('created_at', startTime);

    if (rateLimitHits && rateLimitHits.length > 50) {
      alerts.push({
        id: crypto.randomUUID?.() || `alert-${Date.now()}`,
        type: 'security',
        severity: 'medium',
        message: `High rate limit violations: ${rateLimitHits.length} hits in last ${windowMinutes} minutes`,
        metadata: { hitCount: rateLimitHits.length },
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    // Continue silently
  }

  return alerts;
}

/**
 * Trigger alert notification
 */
export async function triggerAlert(alert: Alert): Promise<void> {
  // Log to Sentry
  SentryService.captureMessage(alert.message, {
    severity: alert.severity === 'critical' ? 'fatal' : 'error',
    tags: { 'alert.type': alert.type },
  });

  // Store alert in database
  if (supabase) {
    try {
      await supabase
        .from('alerts')
        .insert({
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          metadata: alert.metadata,
          created_at: alert.createdAt,
        });
    } catch {
      // Continue silently
    }
  }

  // In production, send notifications via email/SMS/Slack
}

/**
 * Acknowledge alert
 */
export async function acknowledgeAlert(alertId: string): Promise<void> {
  if (!supabase) return;

  try {
    await supabase
      .from('alerts')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', alertId);
  } catch (err) {
    // Continue silently
  }
}

/**
 * Resolve alert
 */
export async function resolveAlert(alertId: string): Promise<void> {
  if (!supabase) return;

  try {
    await supabase
      .from('alerts')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', alertId);
  } catch (err) {
    // Continue silently
  }
}

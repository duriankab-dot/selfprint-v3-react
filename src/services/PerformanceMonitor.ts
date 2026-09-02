/**
 * PerformanceMonitor.ts
 * Phase G: Web Vitals & Performance Tracking
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: string;
}

interface WebVitals {
  FCP: number | null; // First Contentful Paint
  LCP: number | null; // Largest Contentful Paint
  INP: number | null; // Interaction to Next Paint
  CLS: number | null; // Cumulative Layout Shift
  TTFB: number | null; // Time to First Byte
}

const metrics: PerformanceMetric[] = [];
const webVitals: WebVitals = {
  FCP: null,
  LCP: null,
  INP: null,
  CLS: null,
  TTFB: null,
};

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitor(): void {
  // Track Core Web Vitals using PerformanceObserver
  if ('PerformanceObserver' in window) {
    try {
      // LCP
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        webVitals.LCP = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FCP
      new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            webVitals.FCP = entry.startTime;
          }
        });
      }).observe({ entryTypes: ['paint'] });

      // CLS
      let clsValue = 0;
      new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
            clsValue += (entry as unknown as { value: number }).value;
          }
        });
        webVitals.CLS = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (err) {
      // Performance observer not available
    }
  }

  // Track navigation timing
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    if (perfData) {
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      recordMetric('page_load_time', pageLoadTime);

      webVitals.TTFB = perfData.responseStart - perfData.navigationStart;
      recordMetric('time_to_first_byte', webVitals.TTFB);
    }
  });
}

/**
 * Record performance metric
 */
export function recordMetric(name: string, value: number): void {
  let rating: 'good' | 'needs-improvement' | 'poor' = 'good';

  // Rate based on metric type
  if (name === 'page_load_time') {
    rating = value < 1000 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
  } else if (name === 'api_latency') {
    rating = value < 200 ? 'good' : value < 500 ? 'needs-improvement' : 'poor';
  } else if (name === 'response_time') {
    rating = value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
  }

  metrics.push({
    name,
    value,
    rating,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 100 metrics
  if (metrics.length > 100) {
    metrics.shift();
  }
}

/**
 * Track API call duration
 */
export function trackAPICall(endpoint: string, duration: number): void {
  recordMetric(`api_${endpoint}`, duration);

  if (duration > 1000) {
    // Log slow APIs
    console.warn(`Slow API: ${endpoint} took ${duration}ms`);
  }
}

/**
 * Get current Web Vitals
 */
export function getWebVitals(): WebVitals {
  return { ...webVitals };
}

/**
 * Get metrics summary
 */
export function getMetricsSummary(): {
  total: number;
  average: number;
  slowest: PerformanceMetric | null;
  byRating: Record<string, number>;
} {
  if (metrics.length === 0) {
    return {
      total: 0,
      average: 0,
      slowest: null,
      byRating: { good: 0, 'needs-improvement': 0, poor: 0 },
    };
  }

  const sum = metrics.reduce((acc, m) => acc + m.value, 0);
  const average = sum / metrics.length;
  const slowest = metrics.reduce((max, m) => (m.value > max.value ? m : max));

  const byRating = {
    good: metrics.filter(m => m.rating === 'good').length,
    'needs-improvement': metrics.filter(m => m.rating === 'needs-improvement').length,
    poor: metrics.filter(m => m.rating === 'poor').length,
  };

  return {
    total: metrics.length,
    average,
    slowest,
    byRating,
  };
}

/**
 * Report metrics to backend
 * Sends collected metrics to /api/metrics for persistence in Supabase
 */
export async function reportMetrics(userId?: string): Promise<void> {
  try {
    const summary = getMetricsSummary();
    const vitals = getWebVitals();

    const payload = {
      userId,
      metrics: summary,
      webVitals: vitals,
      timestamp: new Date().toISOString(),
    };

    // Send to backend for persistence
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Silently fail to avoid impacting app
    console.warn('[PerformanceMonitor] Metrics reporting failed:', err);
  }
}

/**
 * Clear metrics (for testing)
 */
export function clearMetrics(): void {
  metrics.length = 0;
}

/**
 * api/metrics.ts
 * Phase G: Performance Metrics Endpoint
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

function validateTimestamp(timestamp: string): boolean {
  try {
    const date = new Date(timestamp);
    return !Number.isNaN(date.getTime());
  } catch {
    return false;
  }
}

function validateUserId(userId: string): boolean {
  if (!userId || typeof userId !== 'string') return false;
  if (userId.length < 1 || userId.length > 255) return false;
  return /^[a-zA-Z0-9\-_]+$/.test(userId);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Log incoming request for debugging
    console.log('[/api/metrics] Received:', {
      method: req.method,
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : null,
      rawBody: typeof req.body === 'string' ? req.body.substring(0, 100) : req.body
    });

    // Parse body: handle empty, string, or object
    let body = req.body;

    if (!body) {
      // Empty request body
      console.log('[/api/metrics] Empty body');
      res.status(400).json({
        error: 'Invalid request: empty body',
        message: 'Request body must contain: metrics, timestamp (and optionally: userId, webVitals)'
      });
      return;
    }

    // If body is a string (shouldn't be for JSON), try to parse
    if (typeof body === 'string') {
      console.log('[/api/metrics] Body is string, parsing...');
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('[/api/metrics] JSON parse error:', e);
        res.status(400).json({
          error: 'Invalid JSON in request body',
          message: 'Body must be valid JSON'
        });
        return;
      }
    }

    console.log('[/api/metrics] Parsed body:', body);
    const { userId, metrics, webVitals, timestamp } = body;

    // Validate input
    if (!metrics || !timestamp) {
      res.status(400).json({ error: 'Missing required fields: metrics and timestamp' });
      return;
    }

    // Validate timestamp format
    if (!validateTimestamp(timestamp)) {
      res.status(400).json({ error: 'Invalid timestamp' });
      return;
    }

    // Validate user ID
    if (userId && !validateUserId(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    // Success response
    res.status(200).json({
      success: true,
      message: 'Metrics received',
      data: {
        userId: userId || 'anonymous',
        metricsReceived: typeof metrics === 'object' ? Object.keys(metrics).length : 0,
        webVitalsLogged: webVitals && typeof webVitals === 'object' ? Object.keys(webVitals).length : 0,
        timestamp,
      },
    });
  } catch (error) {
    console.error('[/api/metrics] Error:', error);
    res.status(500).json({
      error: 'Failed to process metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

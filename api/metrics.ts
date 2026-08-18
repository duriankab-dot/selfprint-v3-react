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
    // Parse body: handle empty, string, or object
    let body = req.body;

    if (!body) {
      // Empty request body
      res.status(400).json({
        error: 'Invalid request: empty body',
        message: 'Request body must contain: metrics, timestamp (and optionally: userId, webVitals)'
      });
      return;
    }

    // If body is a string (shouldn't be for JSON), try to parse
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        res.status(400).json({
          error: 'Invalid JSON in request body',
          message: 'Body must be valid JSON'
        });
        return;
      }
    }

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
        userId,
        metricsReceived: metrics.total || 0,
        webVitalsLogged: webVitals ? Object.keys(webVitals).length : 0,
        timestamp,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * api/metrics.ts
 * Phase G: Performance Metrics Endpoint
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as InputValidation from '../src/services/InputValidation';

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
    const { userId, metrics, webVitals, timestamp } = req.body;

    // Validate input
    if (!metrics || !timestamp) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Validate timestamp format
    if (!InputValidation.validateTimestamp(timestamp)) {
      res.status(400).json({ error: 'Invalid timestamp' });
      return;
    }

    // Log metrics (in production, would store to database)
    if (userId && !InputValidation.validateUserId(userId)) {
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

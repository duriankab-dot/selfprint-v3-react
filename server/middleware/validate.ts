/**
 * Input Validation Middleware
 * Validates request data and prevents injection attacks
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input (prevent injection)
 */
export function sanitizeString(str: string, maxLength: number = 5000): string {
  if (typeof str !== 'string') {
    return '';
  }

  return str
    .trim()
    .substring(0, maxLength)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate user ID in request
 */
export function validateUserId(req: Request, res: Response, next: NextFunction) {
  const userId = req.params.userId || req.body?.userId || req.query.userId;

  if (userId && !isValidUUID(userId as string)) {
    return res.status(400).json({
      error: 'invalid_user_id',
      message: 'User ID must be a valid UUID',
    });
  }

  next();
}

/**
 * Validate world ID in request
 */
export function validateWorldId(req: Request, res: Response, next: NextFunction) {
  const worldId = req.params.worldId || req.body?.worldId || req.query.worldId;

  const validWorlds = [
    'work',
    'personal',
    'relationships',
    'health',
    'finance',
    'creativity',
    'spirituality',
    'adventure',
    'family',
    'education',
    'growth',
    'community',
  ];

  if (worldId && !validWorlds.includes(worldId as string)) {
    return res.status(400).json({
      error: 'invalid_world_id',
      message: `World ID must be one of: ${validWorlds.join(', ')}`,
    });
  }

  next();
}

/**
 * Validate decision data
 */
export function validateDecisionData(req: Request, res: Response, next: NextFunction) {
  const { userId, twinId, decisionText, worldId } = req.body;

  // Validate required fields
  if (!userId || !isValidUUID(userId)) {
    return res.status(400).json({
      error: 'invalid_user_id',
      message: 'User ID is required and must be a valid UUID',
    });
  }

  if (!twinId || !isValidUUID(twinId)) {
    return res.status(400).json({
      error: 'invalid_twin_id',
      message: 'Twin ID is required and must be a valid UUID',
    });
  }

  if (!decisionText || typeof decisionText !== 'string' || decisionText.length === 0) {
    return res.status(400).json({
      error: 'invalid_decision_text',
      message: 'Decision text is required',
    });
  }

  if (decisionText.length > 5000) {
    return res.status(400).json({
      error: 'decision_text_too_long',
      message: 'Decision text must be less than 5000 characters',
    });
  }

  if (worldId) {
    const validWorlds = [
      'work',
      'personal',
      'relationships',
      'health',
      'finance',
      'creativity',
      'spirituality',
      'adventure',
      'family',
      'education',
      'growth',
      'community',
    ];

    if (!validWorlds.includes(worldId)) {
      return res.status(400).json({
        error: 'invalid_world_id',
        message: `World ID must be one of: ${validWorlds.join(', ')}`,
      });
    }
  }

  next();
}

/**
 * Validate notification data
 */
export function validateNotificationData(req: Request, res: Response, next: NextFunction) {
  const { userId, type, content } = req.body;

  if (!userId || !isValidUUID(userId)) {
    return res.status(400).json({
      error: 'invalid_user_id',
      message: 'User ID is required and must be a valid UUID',
    });
  }

  const validTypes = [
    'decision_followup',
    'insight',
    'milestone',
    'recommendation',
    'alert',
    'system',
  ];

  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({
      error: 'invalid_notification_type',
      message: `Type must be one of: ${validTypes.join(', ')}`,
    });
  }

  if (!content || typeof content !== 'string' || content.length === 0) {
    return res.status(400).json({
      error: 'invalid_content',
      message: 'Content is required',
    });
  }

  if (content.length > 1000) {
    return res.status(400).json({
      error: 'content_too_long',
      message: 'Content must be less than 1000 characters',
    });
  }

  next();
}

/**
 * Sanitize all string inputs in request body
 */
export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  return obj;
}

/**
 * API Input Validation Middleware
 * Validates request payloads before processing
 * Prevents injection attacks, malformed data, and abuse
 * @module api/middleware/validators
 */

/**
 * Validation Error
 */
export class ValidationError extends Error {
  public field: string;
  public code: string;

  constructor(field: string, message: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

/**
 * Core validators
 */
export const Validators = {
  /**
   * Validate string: non-empty, max length, allowed chars
   */
  string: (
    value: unknown,
    field: string,
    { minLength = 1, maxLength = 500, pattern }: any = {}
  ): string => {
    if (typeof value !== 'string') {
      throw new ValidationError(field, `${field} must be a string`, 'TYPE_ERROR');
    }
    if (value.length < minLength) {
      throw new ValidationError(
        field,
        `${field} must be at least ${minLength} characters`,
        'MIN_LENGTH'
      );
    }
    if (value.length > maxLength) {
      throw new ValidationError(
        field,
        `${field} must be at most ${maxLength} characters`,
        'MAX_LENGTH'
      );
    }
    if (pattern && !pattern.test(value)) {
      throw new ValidationError(field, `${field} format is invalid`, 'PATTERN_MISMATCH');
    }
    return value.trim();
  },

  /**
   * Validate UUID
   */
  uuid: (value: unknown, field: string): string => {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof value !== 'string' || !uuidPattern.test(value)) {
      throw new ValidationError(field, `${field} must be a valid UUID`, 'INVALID_UUID');
    }
    return value;
  },

  /**
   * Validate email
   */
  email: (value: unknown, field: string): string => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value !== 'string' || !emailPattern.test(value)) {
      throw new ValidationError(field, `${field} must be a valid email`, 'INVALID_EMAIL');
    }
    return value.toLowerCase();
  },

  /**
   * Validate number in range
   */
  number: (
    value: unknown,
    field: string,
    { min = 0, max = Infinity, integer = false }: any = {}
  ): number => {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(field, `${field} must be a number`, 'TYPE_ERROR');
    }
    if (integer && !Number.isInteger(value)) {
      throw new ValidationError(field, `${field} must be an integer`, 'NOT_INTEGER');
    }
    if (value < min || value > max) {
      throw new ValidationError(
        field,
        `${field} must be between ${min} and ${max}`,
        'OUT_OF_RANGE'
      );
    }
    return value;
  },

  /**
   * Validate boolean
   */
  boolean: (value: unknown, field: string): boolean => {
    if (typeof value !== 'boolean') {
      throw new ValidationError(field, `${field} must be a boolean`, 'TYPE_ERROR');
    }
    return value;
  },

  /**
   * Validate array of items
   */
  array: (
    value: unknown,
    field: string,
    {
      itemValidator,
      minItems = 0,
      maxItems = Infinity,
    }: any = {}
  ): any[] => {
    if (!Array.isArray(value)) {
      throw new ValidationError(field, `${field} must be an array`, 'TYPE_ERROR');
    }
    if (value.length < minItems) {
      throw new ValidationError(
        field,
        `${field} must have at least ${minItems} items`,
        'MIN_ITEMS'
      );
    }
    if (value.length > maxItems) {
      throw new ValidationError(
        field,
        `${field} must have at most ${maxItems} items`,
        'MAX_ITEMS'
      );
    }
    if (itemValidator) {
      return value.map((item, idx) => {
        try {
          return itemValidator(item, `${field}[${idx}]`);
        } catch (err) {
          if (err instanceof ValidationError) throw err;
          throw new ValidationError(`${field}[${idx}]`, String(err), 'ITEM_ERROR');
        }
      });
    }
    return value;
  },

  /**
   * Validate enum value
   */
  enum: (value: unknown, field: string, allowedValues: any[]): any => {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(
        field,
        `${field} must be one of: ${allowedValues.join(', ')}`,
        'INVALID_ENUM'
      );
    }
    return value;
  },
};

/**
 * Validator schemas for 3 critical endpoints
 */
export const ENDPOINT_SCHEMAS = {
  /**
   * POST /api/twin/create
   */
  createTwin: {
    userId: { validator: Validators.uuid, args: [] },
    twinName: {
      validator: Validators.string,
      args: [{ minLength: 2, maxLength: 50 }],
    },
    birthData: {
      optional: true,
      fields: {
        date: { validator: Validators.string, args: [] }, // YYYY-MM-DD
        time: { validator: Validators.string, args: [] }, // HH:MM
        timezone: { validator: Validators.string, args: [] },
      },
    },
    personalityEssence: {
      optional: true,
      validator: Validators.string,
      args: [{ maxLength: 1000 }],
    },
  },

  /**
   * POST /api/core-awakening (submit feedback)
   */
  submitFeedback: {
    userId: { validator: Validators.uuid, args: [] },
    insightId: { validator: Validators.uuid, args: [] },
    feedbackType: {
      validator: Validators.enum,
      args: [['very_true', 'somewhat', 'not_sure', 'not_me']],
    },
    comment: {
      optional: true,
      validator: Validators.string,
      args: [{ maxLength: 500 }],
    },
  },

  /**
   * POST /api/notification-endpoints (send notification)
   */
  sendNotification: {
    userId: { validator: Validators.uuid, args: [] },
    type: {
      validator: Validators.enum,
      args: [['achievement', 'milestone', 'reminder', 'insight', 'prompt']],
    },
    title: {
      validator: Validators.string,
      args: [{ minLength: 1, maxLength: 200 }],
    },
    message: {
      validator: Validators.string,
      args: [{ minLength: 1, maxLength: 1000 }],
    },
    priority: {
      optional: true,
      validator: Validators.enum,
      args: [['low', 'normal', 'high']],
    },
    metadata: {
      optional: true,
      validator: (v: any) => v, // Allow any object
      args: [],
    },
  },
};

/**
 * Validate request payload against schema
 */
export function validateRequest(payload: any, schema: Record<string, any>): Record<string, any> {
  const validated: Record<string, any> = {};

  for (const [field, fieldConfigRaw] of Object.entries(schema)) {
    const fieldConfig = fieldConfigRaw as any;
    const value = payload[field];

    // Handle optional fields
    if (fieldConfig.optional && value === undefined) {
      continue;
    }

    if (value === undefined) {
      throw new ValidationError(field, `${field} is required`, 'REQUIRED');
    }

    // Nested object validation
    if (fieldConfig.fields) {
      validated[field] = validateRequest(value, fieldConfig.fields);
      continue;
    }

    // Run validator
    if (fieldConfig.validator) {
      try {
        const args = fieldConfig.args || [];
        validated[field] = fieldConfig.validator(value, field, ...args);
      } catch (err) {
        if (err instanceof ValidationError) throw err;
        throw new ValidationError(field, String(err), 'VALIDATION_FAILED');
      }
    }
  }

  return validated;
}

/**
 * Express-compatible validation middleware factory
 * Use: app.post('/api/twin/create', validatorMiddleware(ENDPOINT_SCHEMAS.createTwin), handler)
 */
export function validatorMiddleware(schema: any) {
  return (req: any, res: any, next: any) => {
    try {
      req.validatedBody = validateRequest(req.body || {}, schema);
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({
          error: 'Validation error',
          field: err.field,
          message: err.message,
          code: err.code,
        });
      }
      res.status(500).json({ error: 'Validation failed', message: String(err) });
    }
  };
}

export default Validators;

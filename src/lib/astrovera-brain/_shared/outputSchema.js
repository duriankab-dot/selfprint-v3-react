// ═══════════════════════════════════════════════════════════════
// VENDORED from D:\astrovera-v2\brain\knowledge\_shared\outputSchema.js
// Copied 2026-08-09 for Phase 5.2 (Psychology Integration). No local
// modifications — sync manually if the source changes (astrovera-v2
// has no git remote to track automatically).
// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE — shared output schema (Layer 10)
// #24 upgrade: makeValidator now checks types, enums, and bounds
// for domain-specific fields (not just required-field presence)
// ═══════════════════════════════════════════════════════════════

export const BASE_REQUIRED_FIELDS = [
  'coreIdentity', 'traits', 'strengths', 'cautions', 'confidence', 'evidence', 'limitation',
];

export const BASE_SCHEMA_PROPERTIES = {
  coreIdentity: { type: 'string', maxLength: 400 },
  traits:       { type: 'array',  items: { type: 'string' }, minItems: 1, maxItems: 6 },
  strengths:    { type: 'array',  items: { type: 'string' } },
  cautions:     { type: 'array',  items: { type: 'string' } },
  confidence:   { type: 'number', minimum: 0, maximum: 1 },
  evidence:     { type: 'array',  items: { type: 'string' } },
  limitation:   { type: ['string', 'null'] },
};

// Base property rules used by the validator (parallel to BASE_SCHEMA_PROPERTIES)
const BASE_RULES = {
  coreIdentity: { type: 'string' },
  traits:       { type: 'array' },
  strengths:    { type: 'array' },
  cautions:     { type: 'array' },
  evidence:     { type: 'array' },
  confidence:   { type: 'number', minimum: 0, maximum: 1 },
};

/**
 * makeValidator(extraRequired?, extraRules?)
 *
 * extraRequired: string[] extra required field names on top of base
 * extraRules:   Record<string, Rule> domain-specific validation rules, e.g.
 *   { archetypeKey: { type:'string', enum: ['hero','sage',...] } }
 *
 * Rule shape:
 *   { type?: 'string'|'number'|'array'|'boolean'
 *     enum?: any[]
 *     minimum?: number
 *     maximum?: number
 *     minLength?: number
 *   }
 */
export function makeValidator(extraRequired = [], extraRules = {}) {
  const required = [...BASE_REQUIRED_FIELDS, ...extraRequired];
  const rules = { ...BASE_RULES, ...extraRules };

  return function validate(output) {
    const errors = [];

    if (!output || typeof output !== 'object') {
      return { ok: false, errors: ['output is not an object'] };
    }

    // 1. Required fields
    for (const key of required) {
      if (!(key in output)) errors.push('missing required field: ' + key);
    }

    // 2. Type + constraint checks (only for fields that are present)
    for (const [key, rule] of Object.entries(rules)) {
      const val = output[key];
      if (val === undefined || val === null) continue;

      if (rule.type === 'string' && typeof val !== 'string') {
        errors.push(key + ' must be a string');
      } else if (rule.type === 'number' && typeof val !== 'number') {
        errors.push(key + ' must be a number');
      } else if (rule.type === 'array' && !Array.isArray(val)) {
        errors.push(key + ' must be an array');
      } else if (rule.type === 'boolean' && typeof val !== 'boolean') {
        errors.push(key + ' must be a boolean');
      }

      if (rule.enum && !rule.enum.includes(val)) {
        errors.push(key + ' must be one of [' + rule.enum.join(', ') + '], got "' + val + '"');
      }

      if (typeof val === 'number') {
        if (rule.minimum !== undefined && val < rule.minimum)
          errors.push(key + ' must be >= ' + rule.minimum);
        if (rule.maximum !== undefined && val > rule.maximum)
          errors.push(key + ' must be <= ' + rule.maximum);
      }

      if (typeof val === 'string' && rule.minLength !== undefined && val.length < rule.minLength) {
        errors.push(key + ' must have length >= ' + rule.minLength);
      }
    }

    return { ok: errors.length === 0, errors };
  };
}

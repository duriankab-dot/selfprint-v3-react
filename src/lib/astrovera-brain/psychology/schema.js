// ═══════════════════════════════════════════════════════════════
// VENDORED from D:\astrovera-v2\brain\knowledge\psychology\schema.js
// Copied 2026-08-09 for Phase 5.2 (Psychology Integration). No local
// modifications — sync manually if the source changes.
// ═══════════════════════════════════════════════════════════════

import { BASE_SCHEMA_PROPERTIES, makeValidator } from '../_shared/outputSchema.js';

export const SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'PsychologyKnowledgeOutput',
  type: 'object',
  required: ['coreIdentity', 'traits', 'strengths', 'cautions', 'confidence', 'evidence', 'limitation', 'archetypeKey', 'phaseKey'],
  properties: {
    ...BASE_SCHEMA_PROPERTIES,
    // #23 fix: enum ที่ถูกต้อง — 12 archetypes จริง ไม่ใช่ ['a','b','c','d'] ที่ก็อปจาก phaseKey
    archetypeKey: { type: 'string', enum: ['innocent','explorer','sage','everyman','lover','jester','hero','outlaw','magician','caregiver','creator','ruler'] },
    phaseKey: { type: 'string', enum: ['a', 'b', 'c', 'd'] },
    questionRelevance: { type: ['string', 'null'] },
  },
};

export const validate = makeValidator(
  ['archetypeKey', 'phaseKey'],
  {
    archetypeKey: { type: 'string', enum: ['innocent','explorer','sage','everyman','lover','jester','hero','outlaw','magician','caregiver','creator','ruler'] },
    phaseKey:     { type: 'string', enum: ['a', 'b', 'c', 'd'] },
  },
);

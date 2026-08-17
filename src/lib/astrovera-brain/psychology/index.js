// ═══════════════════════════════════════════════════════════════
// VENDORED from D:\astrovera-v2\brain\knowledge\psychology\index.js
// Copied 2026-08-09 for Phase 5.2 (Psychology Integration). No local
// modifications — sync manually if the source changes.
// ═══════════════════════════════════════════════════════════════

export { SYSTEM } from './system.js';
export { INSTRUCTION } from './instruction.js';
export { EXAMPLES } from './examples.js';
export { SCHEMA, validate } from './schema.js';
export { VERSION } from './version.js';

import { SYSTEM } from './system.js';
import { INSTRUCTION } from './instruction.js';
import { EXAMPLES } from './examples.js';
import { SCHEMA, validate } from './schema.js';
import { VERSION } from './version.js';

export function buildPrompt({ exampleCount = 1 } = {}) {
  const ex = EXAMPLES.slice(0, exampleCount)
    .map((e, i) => `ตัวอย่างที่ ${i + 1}:\nInput: ${JSON.stringify(e.input)}\nOutput: ${JSON.stringify(e.output)}`)
    .join('\n\n');
  return `${SYSTEM}\n\n${INSTRUCTION}\n\n${ex}`;
}

export default { SYSTEM, INSTRUCTION, EXAMPLES, SCHEMA, validate, VERSION, buildPrompt };

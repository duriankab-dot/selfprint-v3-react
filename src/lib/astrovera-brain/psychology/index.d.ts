/**
 * index.d.ts
 *
 * Minimal ambient types for the vendored plain-JS psychology module
 * (index.js/system.js/instruction.js/examples.js/schema.js/version.js
 * are copied from D:\astrovera-v2\brain\knowledge\psychology, untyped
 * on purpose — this file exists only so TypeScript call sites like
 * api/intelligence.ts get real types instead of implicit `any`).
 */

export declare const SYSTEM: string;
export declare const INSTRUCTION: string;
export declare const EXAMPLES: Array<{ input: Record<string, unknown>; output: Record<string, unknown> }>;
export declare const SCHEMA: Record<string, unknown>;
export declare const VERSION: Record<string, unknown>;

export declare function validate(output: unknown): { ok: boolean; errors: string[] };
export declare function buildPrompt(opts?: { exampleCount?: number }): string;

/**
 * featureFlags.tsx — TC-001 + TC-305: phased rollout feature flags.
 *
 * Every new pipeline/UI is flag-gated so rollback = toggle. Phase 3 (TC-305)
 * adds percentage-based rollout on top of the explicit boolean: a flag is
 * enabled when EITHER the explicit VITE_FEATURE_* variable is set to "true",
 * OR the deterministic visitor bucket (hash of sp_visitor_id) falls under
 * the VITE_FEATURE_*_ROLLOUT percentage (0–100).
 *
 * Release state (TC-304/305, เฟส 3 จบ): LIVING_DIAGRAM เปิด 100% เป็นค่าเริ่มต้น
 * และ EvolutionaryVisualSystem ถูกลบแล้ว (Landing ใช้ LivingDiagram เสมอ)
 * → ถ้าไม่มี env ตั้งไว้ ให้ตีเป็น ROLLOUT=100 (เปิดเต็ม). Rollback ยังทำได้เสมอ
 * ด้วย VITE_FEATURE_LIVING_DIAGRAM=false / VITE_FEATURE_UNIFIED_PIPELINE=false.
 *
 * Usual rollout sequence on Cloudflare/Vercel (ถ้ายังอยู่ในช่วงลดหลั่น):
 *   10%  → VITE_FEATURE_LIVING_DIAGRAM_ROLLOUT=10
 *   50%  → VITE_FEATURE_LIVING_DIAGRAM_ROLLOUT=50
 *   100% → explicit VITE_FEATURE_LIVING_DIAGRAM=true   (หรือ ROLLOUT=100)
 *
 * Monitoring: flagBucket(flag) ships the visitor bucket so analytics can
 * compare conversion/CTR between the flagged and control groups.
 */
import { hashString } from '../lib/hash';

const ENV = import.meta.env;

/** Deterministic 0..99 bucket for a visitor (stable per sp_visitor_id). */
function visitorBucket(): number {
  if (typeof window === 'undefined') return 42; // SSR/prerender: neutral
  let seed = 'anonymous';
  try {
    seed = window.localStorage.getItem('sp_visitor_id') ?? 'anonymous';
  } catch {
    seed = 'anonymous';
  }
  return hashString(seed) % 100;
}

export function parseRolloutPercent(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function rolloutEnabled(
  explicit: string | undefined,
  rolloutPct: string | undefined,
  bucket?: number,
): boolean {
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  const pct = parseRolloutPercent(rolloutPct);
  if (pct === null || pct <= 0) return false;
  if (pct >= 100) return true;
  return (bucket ?? visitorBucket()) < pct;
}

const FLAGS = {
  // TC-304/305: เปิดเต็ม 100% เป็นค่าเริ่มต้น (rollout จบแล้ว) — ปิดได้ผ่าน env
  LIVING_DIAGRAM: rolloutEnabled(
    ENV.VITE_FEATURE_LIVING_DIAGRAM,
    ENV.VITE_FEATURE_LIVING_DIAGRAM_ROLLOUT ?? '100',
  ),
  UNIFIED_PIPELINE: rolloutEnabled(
    ENV.VITE_FEATURE_UNIFIED_PIPELINE,
    ENV.VITE_FEATURE_UNIFIED_PIPELINE_ROLLOUT ?? '100',
  ),
  NO_ASTRO_LANG: ENV.VITE_FEATURE_NO_ASTRO_LANG !== 'false',
} as const;

export type FeatureFlagName = keyof typeof FLAGS;

/** Visitor bucket (0..99) for rollout analytics — stable per flag gate. */
export function flagBucket(): number {
  return visitorBucket();
}

export function useFeatureFlag(flag: FeatureFlagName): boolean {
  return FLAGS[flag];
}

export interface FeatureFlagProps {
  name: FeatureFlagName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  return FLAGS[name] ? <>{children}</> : <>{fallback}</>;
}

export function isFeatureEnabled(flag: FeatureFlagName): boolean {
  return FLAGS[flag];
}

export const featureFlags = FLAGS;
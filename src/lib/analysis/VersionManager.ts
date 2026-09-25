/**
 * VersionManager.ts — TC-203: v1→v2→v3 upgrade triggers.
 *
 * เงื่อนไขเลื่อนเวอร์ชัน (ต้องครบทั้งข้อมูลจริง ห้ามเดา):
 *   v1 → v2: มี finetune answers + SICE result (จบ onboarding)
 *   v2 → v3: มีการตัดสินใจจริงเข้าระบบ (decision logs) แล้ว
 */

import type { TwinVersion } from '../../store/twinStore';
import type { TwinInputSnapshot } from '../../store/twinStore';

export interface VersionSignals {
  inputs: TwinInputSnapshot;
  hasSiceResult?: boolean;
  hasDecisionLog?: boolean;
  currentVersion: TwinVersion | null;
}

export function nextVersion(signals: VersionSignals): TwinVersion | null {
  const { inputs, hasSiceResult, hasDecisionLog, currentVersion } = signals;

  const hasDob = Boolean(inputs.dob);
  const hasMood = Boolean(inputs.mood);
  const hasFinetune = Boolean(
    inputs.finetuneAnswers && Object.keys(inputs.finetuneAnswers).length > 0,
  );

  // Target version จากสัญญาณที่มีจริง (ลำดับบนลงล่าง)
  let target: TwinVersion | null = null;
  if (hasDob && hasMood) target = 1;
  if (target === 1 && hasFinetune && hasSiceResult) target = 2;
  if (target === 2 && hasDecisionLog) target = 3;

  // ห้าม downgrade — v3 ค้างอยู่เสมอถ้าเคยถึง
  if (currentVersion !== null && target !== null && target <= currentVersion) {
    return null;
  }
  return target;
}

export function versionReason(signals: VersionSignals): string {
  const v = nextVersion(signals);
  switch (v) {
    case 1: return 'landing: DOB + mood captured';
    case 2: return 'onboarding: finetune answers + SICE result captured';
    case 3: return 'living: real decision logs captured';
    default: return 'no upgrade signals';
  }
}
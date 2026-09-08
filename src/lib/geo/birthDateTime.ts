/**
 * birthDateTime.ts
 *
 * Pure helpers for the dropdown-based date/time-of-birth values used by
 * BirthDateTimeSelect.tsx. Split out from that file so it only exports
 * components (keeps Fast Refresh happy — oxlint react/only-export-components).
 */

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export interface DobValue {
  day: number | null;
  month: number | null; // 1-12
  year: number | null; // Gregorian (Buddhist-era display handled at render time for Thai)
}

export function isDobComplete(v: DobValue): v is { day: number; month: number; year: number } {
  return v.day !== null && v.month !== null && v.year !== null;
}

export function dobToISODate(v: { day: number; month: number; year: number }): string {
  return `${v.year}-${pad2(v.month)}-${pad2(v.day)}`;
}

export interface TimeValue {
  hour: number | null;
  minute: number | null;
}

export function isTimeComplete(v: TimeValue): v is { hour: number; minute: number } {
  return v.hour !== null && v.minute !== null;
}

export function timeToHHMM(v: { hour: number; minute: number }): string {
  return `${pad2(v.hour)}:${pad2(v.minute)}`;
}

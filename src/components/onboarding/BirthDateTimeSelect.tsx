/**
 * BirthDateTimeSelect.tsx
 *
 * Native <select> dropdowns for date-of-birth (day/month/year) and
 * time-of-birth (hour/minute) — replaces free-text "YYYY-MM-DD" / "HH:MM"
 * typing across onboarding. No typing, dropdown only.
 */

import { useLanguage } from '@/context/LanguageContext';
import type { DobValue, TimeValue } from '@/lib/geo/birthDateTime';

const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const selectStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 8px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

interface DobSelectProps {
  value: DobValue;
  onChange: (value: DobValue) => void;
}

export function DobSelect({ value, onChange }: DobSelectProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const months = isTh ? MONTHS_TH : MONTHS_EN;
  const currentYear = new Date().getFullYear();
  // 100-year range is enough for a living user's birth year; oldest first-of-range
  // is a UX choice, not a data-model constraint.
  const years = Array.from({ length: 100 }, (_, idx) => currentYear - idx);
  const daysInMonth = value.month
    ? new Date(value.year ?? currentYear, value.month, 0).getDate()
    : 31;
  const days = Array.from({ length: daysInMonth }, (_, idx) => idx + 1);

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select
        value={value.day ?? ''}
        onChange={(e) => onChange({ ...value, day: e.target.value ? Number(e.target.value) : null })}
        style={selectStyle}
        aria-label={isTh ? 'วัน' : 'Day'}
      >
        <option value="">{isTh ? 'วัน' : 'Day'}</option>
        {days.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select
        value={value.month ?? ''}
        onChange={(e) => onChange({ ...value, month: e.target.value ? Number(e.target.value) : null })}
        style={{ ...selectStyle, flex: 1.6 }}
        aria-label={isTh ? 'เดือน' : 'Month'}
      >
        <option value="">{isTh ? 'เดือน' : 'Month'}</option>
        {months.map((m, idx) => (
          <option key={m} value={idx + 1}>{m}</option>
        ))}
      </select>
      <select
        value={value.year ?? ''}
        onChange={(e) => onChange({ ...value, year: e.target.value ? Number(e.target.value) : null })}
        style={selectStyle}
        aria-label={isTh ? 'ปี' : 'Year'}
      >
        <option value="">{isTh ? 'ปี' : 'Year'}</option>
        {years.map((y) => (
          <option key={y} value={y}>{isTh ? y + 543 : y}</option>
        ))}
      </select>
    </div>
  );
}

interface TimeSelectProps {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
}

export function TimeSelect({ value, onChange }: TimeSelectProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const hours = Array.from({ length: 24 }, (_, idx) => idx);
  const minutes = Array.from({ length: 60 }, (_, idx) => idx);

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <select
        value={value.hour ?? ''}
        onChange={(e) => onChange({ ...value, hour: e.target.value ? Number(e.target.value) : null })}
        style={selectStyle}
        aria-label={isTh ? 'ชั่วโมง' : 'Hour'}
      >
        <option value="">{isTh ? 'ชม.' : 'HH'}</option>
        {hours.map((h) => (
          <option key={h} value={h}>{pad2(h)}</option>
        ))}
      </select>
      <span style={{ color: 'var(--color-text-secondary)' }}>:</span>
      <select
        value={value.minute ?? ''}
        onChange={(e) => onChange({ ...value, minute: e.target.value ? Number(e.target.value) : null })}
        style={selectStyle}
        aria-label={isTh ? 'นาที' : 'Minute'}
      >
        <option value="">{isTh ? 'นาที' : 'MM'}</option>
        {minutes.map((m) => (
          <option key={m} value={m}>{pad2(m)}</option>
        ))}
      </select>
    </div>
  );
}

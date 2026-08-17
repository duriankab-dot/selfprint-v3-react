/**
 * AmbientBadge.tsx
 *
 * Master Direction §46 — Advanced Adaptive Environments
 *
 * แสดง time-of-day environment + soundscape ปัจจุบันในรูปแบบ badge เล็กๆ
 * ใช้ useEnvironment() hook เพื่อรับ EnvironmentConfig แบบ real-time
 *
 * กฏ:
 *  - CSS ใช้ var(--...) เท่านั้น
 *  - ถ้า environment = null → return null (ไม่แสดงอะไร)
 *  - reduceMotion → ไม่มี pulse animation
 */

import { useEnvironment } from '@/context/EnvironmentContext';

interface AmbientBadgeProps {
  /** แสดงชื่อ soundscape ด้วยหรือเปล่า (default: false — แค่ period) */
  showSoundscape?: boolean;
  /** compact mode สำหรับ navbar / header แคบ */
  compact?: boolean;
  className?: string;
}

export function AmbientBadge({ showSoundscape = false, compact = false }: AmbientBadgeProps) {
  const { environment, isTransitioning } = useEnvironment();

  if (!environment) return null;

  const { timeOfDay, soundscape } = environment;

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: compact ? '4px' : '6px',
    padding: compact ? '3px 8px' : '5px 12px',
    borderRadius: '20px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-secondary)',
    fontSize: compact ? '11px' : '12px',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
    transition: 'opacity 0.4s, background 0.8s',
    opacity: isTransitioning ? 0.6 : 1,
    cursor: 'default',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  const emojiStyle: React.CSSProperties = {
    fontSize: compact ? '12px' : '14px',
    lineHeight: 1,
  };

  const dotStyle: React.CSSProperties = {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: 'var(--color-accent-primary)',
    opacity: 0.7,
    display: showSoundscape ? 'block' : 'none',
    flexShrink: 0,
  };

  return (
    <div style={badgeStyle} title={`${timeOfDay.labelThai} — ${soundscape.descriptionThai}`}>
      <span style={emojiStyle}>{timeOfDay.emoji}</span>
      <span>{timeOfDay.labelThai}</span>
      {showSoundscape && (
        <>
          <span style={dotStyle} />
          <span style={{ opacity: 0.8 }}>{soundscape.labelThai}</span>
        </>
      )}
    </div>
  );
}

export default AmbientBadge;

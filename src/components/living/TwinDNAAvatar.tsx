/**
 * TwinDNAAvatar.tsx — TC-107: DNA-driven avatar glyph for TwinProfile.
 *
 * Pure SVG avatar derived from TwinVisualDNA — same user always renders the
 * same avatar; different users get visually distinct shapes/hues.
 * Colors are hsl-derived from DNA (no hardcoded hex — token gate safe).
 */

import type { TwinVisualDNA } from '../../lib/twinVisualDNA';
import { dnaPrimaryColor, dnaAccentColor } from '../../lib/twinVisualDNA';

export interface TwinDNAAvatarProps {
  dna: TwinVisualDNA;
  size?: number;
  label?: string;
}

export default function TwinDNAAvatar({ dna, size = 56, label }: TwinDNAAvatarProps) {
  const primary = dnaPrimaryColor(dna);
  const accent = dnaAccentColor(dna);
  const headRy = dna.headShape === 'round' ? 16 : dna.headShape === 'pear' ? 19 : dna.headShape === 'oval' ? 19 : 15;
  const headRx = dna.headShape === 'angular' ? 18 : 16;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label ?? 'AI Twin avatar'}
      data-testid="twin-dna-avatar"
      data-seed={dna.seed}
    >
      <circle cx="32" cy="32" r="30" style={{ stroke: primary, strokeWidth: 1.2, opacity: 0.5, fill: 'none' }} />
      <ellipse cx="32" cy="26" rx={headRx} ry={headRy} style={{ stroke: primary, strokeWidth: 1.4, fill: 'none' }} />
      <circle cx={32 + dna.eyeOffset} cy="26" r="6" style={{ stroke: accent, strokeWidth: 0.8, fill: 'none', opacity: 0.8 }} />
      {/* shoulders — DNA tilt */}
      <g transform={dna.shoulderTilt !== 0 ? `rotate(${dna.shoulderTilt.toFixed(1)} 32 44)` : undefined}>
        <path d="M18 50 Q32 42 46 50" style={{ stroke: primary, strokeWidth: 1.4, fill: 'none' }} />
      </g>
      {/* spine — DNA curvature */}
      <path d={`M32 44 Q ${(32 + (dna.spineCurvature - 1) * 18).toFixed(1)} 52 32 58`} style={{ stroke: primary, strokeWidth: 0.8, opacity: 0.5, strokeDasharray: '3 3', fill: 'none' }} />
    </svg>
  );
}
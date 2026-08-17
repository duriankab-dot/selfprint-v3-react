/**
 * NovaAvatar.tsx
 * Visual representation of Self Print (implementation: Nova) - the Universal Guide
 * Golden/warm glow effect, distinct from Twin's hologram
 * Note: Nova is the code/implementation name; "Self Print" is the character name users see
 */

import type { CSSProperties } from 'react';

interface NovaAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
};

/**
 * Nova Avatar component
 * Shows as a golden orb with warm glow
 */
export function NovaAvatar({ size = 'md', showLabel = true, className = '' }: NovaAvatarProps) {
  const pixelSize = sizeMap[size];

  const avatarStyle: CSSProperties = {
    position: 'relative',
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: `radial-gradient(circle at 30% 30%, #ffd700, #ffa500, #ff8c00)`,
    boxShadow: `
      0 0 ${pixelSize * 0.5}px rgba(255, 215, 0, 0.6),
      0 0 ${pixelSize * 0.25}px rgba(255, 165, 0, 0.4),
      inset -2px -2px 8px rgba(0, 0, 0, 0.1),
      inset 2px 2px 8px rgba(255, 255, 255, 0.3)
    `,
    animation: 'nova-glow 3s ease-in-out infinite',
  };

  const innerGlowStyle: CSSProperties = {
    position: 'absolute',
    width: `${pixelSize * 0.6}px`,
    height: `${pixelSize * 0.6}px`,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)',
    filter: 'blur(2px)',
  };

  const labelStyle: CSSProperties = {
    marginTop: '8px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'center',
  };

  return (
    <div className={className}>
      <style>{`
        @keyframes nova-glow {
          0%, 100% {
            box-shadow:
              0 0 ${pixelSize * 0.5}px rgba(255, 215, 0, 0.6),
              0 0 ${pixelSize * 0.25}px rgba(255, 165, 0, 0.4),
              inset -2px -2px 8px rgba(0, 0, 0, 0.1),
              inset 2px 2px 8px rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow:
              0 0 ${pixelSize * 0.7}px rgba(255, 215, 0, 0.8),
              0 0 ${pixelSize * 0.4}px rgba(255, 165, 0, 0.5),
              inset -2px -2px 8px rgba(0, 0, 0, 0.1),
              inset 2px 2px 8px rgba(255, 255, 255, 0.3);
          }
        }
      `}</style>
      <div style={avatarStyle}>
        <div style={innerGlowStyle} />
      </div>
      {showLabel && <div style={labelStyle}>Self Print</div>}
    </div>
  );
}

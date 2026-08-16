/**
 * TwinAvatar.tsx
 * Visual representation of the User's Personal AI Twin
 * 2.5D hologram effect, evolves with stage and mood
 */

import type { CSSProperties } from 'react';

export type TwinStage = 1 | 2 | 3 | 4 | 5;
export type TwinMood = 'curious' | 'confident' | 'learning' | 'reflective' | 'playful';

interface TwinAvatarProps {
  name?: string;
  stage?: TwinStage;
  mood?: TwinMood;
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

const moodColors = {
  curious: { primary: '#6366f1', secondary: '#818cf8' },
  confident: { primary: '#10b981', secondary: '#34d399' },
  learning: { primary: '#f59e0b', secondary: '#fbbf24' },
  reflective: { primary: '#8b5cf6', secondary: '#a78bfa' },
  playful: { primary: '#ec4899', secondary: '#f472b6' },
};

const stageOpacity = {
  1: 0.4,
  2: 0.5,
  3: 0.65,
  4: 0.8,
  5: 1.0,
};

/**
 * Twin Avatar component
 * 2.5D hologram effect that evolves with stage and mood
 */
export function TwinAvatar({
  name,
  stage = 1,
  mood = 'curious',
  size = 'md',
  showLabel = true,
  className = '',
}: TwinAvatarProps) {
  const pixelSize = sizeMap[size];
  const colors = moodColors[mood];
  const opacity = stageOpacity[stage];

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
    perspective: '1000px',
  };

  const avatarStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}40)`,
    border: `2px solid ${colors.primary}80`,
    boxShadow: `
      0 0 ${pixelSize * 0.4}px ${colors.primary}60,
      0 0 ${pixelSize * 0.2}px ${colors.secondary}40,
      inset -1px -1px 4px rgba(0, 0, 0, 0.2),
      inset 1px 1px 4px ${colors.secondary}80
    `,
    opacity: opacity,
    animation: `twin-pulse-${mood} 2s ease-in-out infinite`,
    transformStyle: 'preserve-3d',
    transform: `translateZ(0)`,
  };

  const coreStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: `${pixelSize * 0.4}px`,
    height: `${pixelSize * 0.4}px`,
    borderRadius: '50%',
    background: colors.primary,
    boxShadow: `0 0 ${pixelSize * 0.3}px ${colors.primary}`,
    opacity: 0.8 + stage * 0.04,
  };

  const haloStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: `${pixelSize * 0.6}px`,
    height: `${pixelSize * 0.6}px`,
    borderRadius: '50%',
    border: `1px solid ${colors.secondary}`,
    animation: `twin-halo-rotate 4s linear infinite`,
  };

  const labelStyle: CSSProperties = {
    marginTop: '8px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    textAlign: 'center',
    minHeight: '16px',
  };

  const stageIndicatorStyle: CSSProperties = {
    position: 'absolute',
    bottom: '-8px',
    right: '-8px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: colors.primary,
    border: '2px solid var(--color-bg-primary)',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: `0 2px 4px ${colors.primary}60`,
  };

  return (
    <div className={className}>
      <style>{`
        @keyframes twin-pulse-curious {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes twin-pulse-confident {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes twin-pulse-learning {
          0%, 100% { transform: scale(1); }
          33% { transform: scale(1.05); }
          66% { transform: scale(0.98); }
        }
        @keyframes twin-pulse-reflective {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.98); }
        }
        @keyframes twin-pulse-playful {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.06) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes twin-halo-rotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
      <div style={containerStyle}>
        <div style={avatarStyle}>
          <div style={haloStyle} />
          <div style={coreStyle} />
          <div style={stageIndicatorStyle}>{stage}</div>
        </div>
      </div>
      {showLabel && (
        <div style={labelStyle}>
          {name || `Twin (Stage ${stage})`}
        </div>
      )}
    </div>
  );
}

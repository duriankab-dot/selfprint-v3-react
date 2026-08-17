/**
 * WorldContextHeader.tsx
 * Display current world context in Twin chat (P0 #7.2)
 */

import type { ReactNode } from 'react';
import { WORLDS, type WorldId } from '../../constants/worlds';

interface WorldContextHeaderProps {
  world: WorldId;
  compact?: boolean;
}

export function WorldContextHeader({ world, compact = false }: WorldContextHeaderProps): ReactNode {
  const worldInfo = WORLDS[world];

  if (compact) {
    return (
      <div
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          background: `color-mix(in srgb, ${worldInfo.color} 10%, transparent)`,
          borderLeft: `3px solid ${worldInfo.color}`,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
        }}
      >
        <span>{worldInfo.emoji}</span>
        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {worldInfo.name}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        background: `color-mix(in srgb, ${worldInfo.color} 12%, transparent)`,
        borderLeft: `4px solid ${worldInfo.color}`,
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ fontSize: '20px' }}>{worldInfo.emoji}</span>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {worldInfo.name} World
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {worldInfo.tagline}
        </div>
      </div>
    </div>
  );
}

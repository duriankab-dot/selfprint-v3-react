/**
 * ExplorWorldsCard.tsx
 * Quick action card to explore 12 Worlds from dashboard
 * Appears prominently for authenticated users (P0 #7)
 */

import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export function ExplorWorldsCard(): ReactNode {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: '100%',
        margin: '1.5rem auto',
        padding: '2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-accent-primary) 15%, transparent), color-mix(in srgb, var(--color-accent-secondary, var(--color-accent-primary)) 10%, transparent))',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
      onClick={() => navigate('/worlds')}
    >
      <h3
        style={{
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 0.5rem',
          color: 'var(--color-text-primary)',
        }}
      >
        🌍 Explore the 12 Worlds
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          margin: '0 0 1.5rem',
          lineHeight: 1.5,
        }}
      >
        Discover life domains and get Twin guidance tailored to each world
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/worlds');
        }}
        style={{
          padding: '10px 24px',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--color-accent-primary)',
          color: 'white',
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--color-accent-primary) 120%, transparent)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-primary)';
        }}
      >
        Explore Worlds →
      </button>
    </div>
  );
}

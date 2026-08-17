import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({ content, children, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' },
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{ cursor: 'help' }}
      >
        {children}
      </div>

      {isVisible && (
        <div
          style={{
            position: 'absolute',
            backgroundColor: 'var(--color-gray-900)',
            color: 'var(--color-white)',
            padding: 'var(--space-sm)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-body-small)',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
            ...positions[position],
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

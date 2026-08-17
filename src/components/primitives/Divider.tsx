import React from 'react';

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = 'horizontal', ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: 'var(--color-border)',
      border: 'none',
      margin: 0,
    };

    const orientations = {
      horizontal: {
        width: '100%',
        height: '1px',
        margin: 'var(--space-md) 0',
      },
      vertical: {
        height: '100%',
        width: '1px',
        margin: '0 var(--space-md)',
      },
    };

    return <hr ref={ref} style={{ ...baseStyle, ...orientations[orientation] }} {...props} />;
  }
);

Divider.displayName = 'Divider';

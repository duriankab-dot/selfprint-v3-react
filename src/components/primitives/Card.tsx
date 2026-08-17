import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      border: `1px solid var(--color-border)`,
      transition: 'all 0.2s ease',
    };

    const variants = {
      default: {
        boxShadow: 'var(--shadow-sm)',
      },
      elevated: {
        boxShadow: 'var(--shadow-md)',
        borderColor: 'var(--color-accent-primary)',
      },
    };

    return <div ref={ref} style={{ ...baseStyle, ...variants[variant] }} {...props} />;
  }
);

Card.displayName = 'Card';

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'mood';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-caption)',
      fontWeight: 'var(--font-weight-semibold)',
      whiteSpace: 'nowrap',
    };

    const variants = {
      default: {
        backgroundColor: 'var(--color-accent-primary)',
        color: 'var(--color-accent-secondary)',
      },
      mood: {
        backgroundColor: 'var(--color-accent-mood, var(--color-accent-primary))',
        color: 'var(--color-accent-secondary)',
      },
    };

    return <span ref={ref} style={{ ...baseStyle, ...variants[variant] }} {...props} />;
  }
);

Badge.displayName = 'Badge';

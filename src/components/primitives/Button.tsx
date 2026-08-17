import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      fontFamily: 'var(--font-family-sans)',
      fontWeight: 'var(--font-weight-semibold)',
      borderRadius: 'var(--radius-md)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: 'var(--font-size-button)',
    };

    const variants = {
      primary: {
        backgroundColor: 'var(--color-accent-primary)',
        color: 'var(--color-accent-secondary)',
      },
      secondary: {
        backgroundColor: 'var(--color-accent-secondary)',
        color: 'var(--color-accent-primary)',
        border: '2px solid var(--color-accent-primary)',
      },
      tertiary: {
        backgroundColor: 'transparent',
        color: 'var(--color-accent-primary)',
        border: '1px solid var(--color-border)',
      },
    };

    const sizes = {
      sm: { padding: '0.375rem 0.75rem', fontSize: 'var(--font-size-caption)' },
      md: { padding: '0.5rem 1rem' },
      lg: { padding: '0.75rem 1.5rem', fontSize: 'var(--font-size-body-large)' },
    };

    return (
      <button
        ref={ref}
        className={className}
        style={{
          ...baseStyle,
          ...variants[variant],
          ...sizes[size],
        }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

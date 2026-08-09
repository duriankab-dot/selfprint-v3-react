import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {label && (
          <label
            style={{
              fontSize: 'var(--font-size-body-small)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          style={{
            padding: '0.625rem 0.875rem',
            fontSize: 'var(--font-size-body-base)',
            fontFamily: 'var(--font-family-sans)',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            transition: 'border-color 0.2s ease',
            outline: 'none',
          }}
          {...props}
        />
        {error && (
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-error)' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

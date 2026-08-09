import React from 'react';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, id, name, ...props }, ref) => {
    const radioId = id || `radio-${Math.random()}`;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <input
          ref={ref}
          id={radioId}
          type="radio"
          name={name}
          style={{
            width: '1rem',
            height: '1rem',
            accentColor: 'var(--color-accent-primary)',
            cursor: 'pointer',
          }}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            style={{
              fontSize: 'var(--font-size-body-base)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

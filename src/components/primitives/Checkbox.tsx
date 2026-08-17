import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random()}`;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
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
            htmlFor={checkboxId}
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

Checkbox.displayName = 'Checkbox';

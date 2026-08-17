import React, { useState } from 'react';

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

export const Toggle = React.forwardRef<HTMLDivElement, ToggleProps>(
  ({ checked = false, onChange, label }, ref) => {
    const [isChecked, setIsChecked] = useState(checked);

    const handleChange = () => {
      const newState = !isChecked;
      setIsChecked(newState);
      onChange?.(newState);
    };

    return (
      <div
        ref={ref}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}
      >
        <button
          onClick={handleChange}
          role="switch"
          aria-checked={isChecked}
          style={{
            width: '2.5rem',
            height: '1.5rem',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            backgroundColor: isChecked ? 'var(--color-accent-primary)' : 'var(--color-border)',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            position: 'relative',
            padding: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '0.25rem',
              left: isChecked ? '1.375rem' : '0.25rem',
              width: '1rem',
              height: '1rem',
              borderRadius: '50%',
              backgroundColor: 'var(--color-white)',
              transition: 'left 0.2s ease',
            }}
          />
        </button>
        {label && (
          <label
            style={{
              fontSize: 'var(--font-size-body-base)',
              color: 'var(--color-text-primary)',
              userSelect: 'none',
              cursor: 'pointer',
            }}
            onClick={handleChange}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

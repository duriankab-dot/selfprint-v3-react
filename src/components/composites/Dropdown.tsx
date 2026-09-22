import { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Dropdown = ({ options, value, onChange, placeholder = 'Select...' }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.625rem 0.875rem',
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          border: `1px solid var(--color-border)`,
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-body-base)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{selected?.label || placeholder}</span>
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-bg-secondary)',
            border: `1px solid var(--color-border)`,
            borderRadius: 'var(--radius-md)',
            marginTop: '4px',
            zIndex: 10,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: 'var(--space-sm)',
                textAlign: 'left',
                border: 'none',
                backgroundColor: value === opt.value ? 'var(--color-accent-primary)' : 'transparent',
                color: value === opt.value ? 'var(--color-accent-secondary)' : 'var(--color-text-primary)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-body-base)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

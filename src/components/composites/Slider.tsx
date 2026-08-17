

interface SliderProps {
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  step?: number;
}

export const Slider = ({ min = 0, max = 100, value, onChange, label, step = 1 }: SliderProps) => {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', marginBottom: 'var(--space-sm)', color: 'var(--color-text-primary)' }}>
          {label}
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        step={step}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-border)',
          outline: 'none',
          WebkitAppearance: 'none',
          accentColor: 'var(--color-accent-primary)',
          cursor: 'pointer',
        }}
      />
      <div style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--font-size-body-small)', color: 'var(--color-text-secondary)' }}>
        Value: {value}
      </div>
    </div>
  );
};
